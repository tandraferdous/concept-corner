import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Course from '../models/Course';
import Payment from '../models/Payment';
import Enrollment from '../models/Enrollment';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      revenueResult,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('student', 'name email')
        .populate('course', 'title'),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue,
        recentPayments,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const filter: { role?: string } = {};
    if (role) filter.role = String(role);

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-__v').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .populate('enrolledCourses.course', 'title thumbnail');
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.body;
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return next(new AppError('Invalid role', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter: { status?: string } = {};
    if (status) filter.status = String(status);

    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('student', 'name email')
        .populate('course', 'title')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Payment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

export const getRevenueAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const topCourses = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$course', revenue: { $sum: '$amount' }, sales: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      { $project: { revenue: 1, sales: 1, 'course.title': 1, 'course.thumbnail': 1 } },
    ]);

    res.status(200).json({ success: true, data: { monthlyRevenue, topCourses } });
  } catch (err) {
    next(err);
  }
};

export const toggleCoursePublish = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'}`,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};
