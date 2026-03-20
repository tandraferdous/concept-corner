import { Response, NextFunction } from 'express';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

export const getMyEnrollments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollments = await Enrollment.find({ student: req.user!.id })
      .populate('course', 'title thumbnail instructor slug rating')
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: enrollments });
  } catch (err) {
    next(err);
  }
};

export const getEnrollment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course')
      .populate('student', 'name email');

    if (!enrollment) return next(new AppError('Enrollment not found', 404));

    if (
      String(enrollment.student) !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized', 403));
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};

export const isEnrolled = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user!.id,
      course: req.params.courseId,
    }).select('_id isCompleted completedLessons progress');

    res.status(200).json({
      success: true,
      enrolled: !!enrollment,
      data: enrollment ?? null,
    });
  } catch (err) {
    next(err);
  }
};

export const generateCertificate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      student: req.user!.id,
    }).populate('course', 'title');

    if (!enrollment) return next(new AppError('Enrollment not found', 404));

    if (!enrollment.isCompleted) {
      return next(new AppError('Course not yet completed', 400));
    }

    if (enrollment.certificateUrl) {
      res.status(200).json({ success: true, certificateUrl: enrollment.certificateUrl });
      return;
    }

    const course = enrollment.course as unknown as { title: string };
    const certificateUrl = `${process.env.FRONTEND_URL}/certificates/${enrollment._id}`;
    enrollment.certificateUrl = certificateUrl;
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: `Certificate generated for ${course.title}`,
      certificateUrl,
    });
  } catch (err) {
    next(err);
  }
};
