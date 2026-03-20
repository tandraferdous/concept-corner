import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

export const getCourseReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviews = await Review.find({
      course: req.params.courseId,
      isApproved: true,
    })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user!.id,
      course: courseId,
    });
    if (!enrollment) {
      return next(new AppError('You must be enrolled to review this course', 403));
    }

    const existing = await Review.findOne({
      student: req.user!.id,
      course: courseId,
    });
    if (existing) {
      return next(new AppError('You have already reviewed this course', 409));
    }

    const review = await Review.create({
      student: req.user!.id,
      course: courseId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));

    if (String(review.student) !== req.user!.id) {
      return next(new AppError('Not authorized to update this review', 403));
    }

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;
    review.isApproved = false;
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));

    if (String(review.student) !== req.user!.id && req.user!.role !== 'admin') {
      return next(new AppError('Not authorized to delete this review', 403));
    }

    await review.deleteOne();
    await recalculateCourseRating(String(review.course));

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const approveReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!review) return next(new AppError('Review not found', 404));

    await recalculateCourseRating(String(review.course));

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

const recalculateCourseRating = async (courseId: string): Promise<void> => {
  const stats = await Review.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId), isApproved: true } },
    { $group: { _id: '$course', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const rating = stats.length > 0 ? stats[0].avgRating : 0;
  const totalRatings = stats.length > 0 ? stats[0].count : 0;

  await Course.findByIdAndUpdate(courseId, { rating, totalRatings });
};
