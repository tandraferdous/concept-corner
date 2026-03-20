import { Request, Response, NextFunction } from 'express';
import Payment from '../models/Payment';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import User from '../models/User';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';
import * as bkash from '../utils/bkash';
import { generateInvoiceNumber } from '../utils/helpers';
import { sendEnrollmentEmail } from '../utils/email';

export const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      return next(new AppError('Course not found', 404));
    }

    const alreadyEnrolled = await Enrollment.findOne({
      student: req.user!.id,
      course: courseId,
    });
    if (alreadyEnrolled) {
      return next(new AppError('Already enrolled in this course', 409));
    }

    const amount = course.discountedPrice ?? course.price;
    const invoiceNumber = generateInvoiceNumber();

    const payment = await Payment.create({
      student: req.user!.id,
      course: courseId,
      amount,
      currency: 'BDT',
      invoiceNumber,
      status: 'pending',
      paymentType: 'bkash',
    });

    const bkashPayment = await bkash.createPayment(amount, invoiceNumber);

    await Payment.findByIdAndUpdate(payment._id, {
      bkashPaymentID: bkashPayment.paymentID,
    });

    res.status(201).json({
      success: true,
      data: {
        paymentId: payment._id,
        bkashURL: bkashPayment.bkashURL,
        invoiceNumber,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentId, bkashPaymentID } = req.body;

    const payment = await Payment.findOne({
      _id: paymentId,
      student: req.user!.id,
      status: 'pending',
    });

    if (!payment) return next(new AppError('Payment not found', 404));

    const executed = await bkash.verifyPayment(bkashPaymentID);

    if (executed.transactionStatus !== 'Completed') {
      await Payment.findByIdAndUpdate(paymentId, { status: 'failed' });
      return next(new AppError('Payment was not completed', 400));
    }

    await Payment.findByIdAndUpdate(paymentId, {
      status: 'completed',
      bkashTrxID: executed.trxID,
      bkashPayerReference: executed.payerReference,
      bkashPaymentID: executed.paymentID,
    });

    const enrollment = await Enrollment.create({
      student: req.user!.id,
      course: payment.course,
      payment: payment._id,
    });

    await Course.findByIdAndUpdate(payment.course, {
      $inc: { totalEnrollments: 1 },
    });

    await User.findByIdAndUpdate(req.user!.id, {
      $push: {
        enrolledCourses: { course: payment.course, enrolledAt: new Date() },
      },
    });

    const course = await Course.findById(payment.course).select('title');
    const user = await User.findById(req.user!.id).select('name email');

    if (course && user) {
      await sendEnrollmentEmail(user.email, user.name, course.title).catch((emailErr: unknown) => {
        console.error('Failed to send enrollment email:', emailErr);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and enrollment created',
      data: enrollment,
    });
  } catch (err) {
    next(err);
  }
};

export const getPaymentHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payments = await Payment.find({ student: req.user!.id })
      .populate('course', 'title thumbnail')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};

export const getPaymentDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('course', 'title thumbnail price')
      .populate('student', 'name email');

    if (!payment) return next(new AppError('Payment not found', 404));

    if (
      String(payment.student) !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized', 403));
    }

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

export const webhookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentID, status, trxID } = req.body as {
      paymentID: string;
      status: string;
      trxID?: string;
    };

    const payment = await Payment.findOne({ bkashPaymentID: paymentID });
    if (!payment) {
      res.status(200).json({ received: true });
      return;
    }

    if (status === 'Completed' && payment.status === 'pending') {
      payment.status = 'completed';
      if (trxID) payment.bkashTrxID = trxID;
      await payment.save();

      const existingEnrollment = await Enrollment.findOne({
        student: payment.student,
        course: payment.course,
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          student: payment.student,
          course: payment.course,
          payment: payment._id,
        });

        await Course.findByIdAndUpdate(payment.course, {
          $inc: { totalEnrollments: 1 },
        });
      }
    } else if (status === 'Failed' || status === 'Cancelled') {
      payment.status = 'failed';
      await payment.save();
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
};
