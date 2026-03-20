import { Request, Response, NextFunction } from 'express';
import Course, { ICourse } from '../models/Course';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';
import { generateSlug } from '../utils/helpers';

interface CourseQuery {
  isPublished?: boolean;
  category?: string;
  level?: string;
  instructor?: string;
  $text?: { $search: string };
  isFeatured?: boolean;
}

export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, level, page = 1, limit = 12 } = req.query;
    const filter: CourseQuery = { isPublished: true };

    if (category) filter.category = String(category);
    if (level) filter.level = String(level) as ICourse['level'];

    const skip = (Number(page) - 1) * Number(limit);

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name avatar')
        .select('-description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Course.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).populate(
      'instructor',
      'name avatar bio'
    );

    if (!course) return next(new AppError('Course not found', 404));

    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slug = generateSlug(req.body.title);

    const existing = await Course.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const course = await Course.create({
      ...req.body,
      slug: finalSlug,
      instructor: req.user!.id,
    });

    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));

    if (
      String(course.instructor) !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized to update this course', 403));
    }

    if (req.body.title) {
      req.body.slug = generateSlug(req.body.title);
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));

    if (
      String(course.instructor) !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized to delete this course', 403));
    }

    await course.deleteOne();
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const publishCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));

    if (
      String(course.instructor) !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized', 403));
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

export const getCoursesByInstructor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const instructorId = req.params.instructorId ?? req.user!.id;
    const courses = await Course.find({ instructor: instructorId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

export const searchCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    if (!q) {
      return next(new AppError('Search query is required', 400));
    }

    const skip = (Number(page) - 1) * Number(limit);
    const filter: CourseQuery = {
      isPublished: true,
      $text: { $search: String(q) },
    };

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name avatar')
        .select('-description')
        .skip(skip)
        .limit(Number(limit)),
      Course.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getFeaturedCourses = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await Course.find({ isPublished: true, isFeatured: true })
      .populate('instructor', 'name avatar')
      .select('-description')
      .limit(8);

    res.status(200).json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

export const getCourseCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Course.distinct('category', { isPublished: true });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};
