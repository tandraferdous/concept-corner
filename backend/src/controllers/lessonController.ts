import { Request, Response, NextFunction } from 'express';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

export const getLessons = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return next(new AppError('Course not found', 404));

    let lessons = await Lesson.find({ course: req.params.courseId }).sort({ order: 1 });

    if (!req.user) {
      lessons = lessons.filter((l) => l.isPreview);
    } else if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: req.params.courseId,
      });
      if (!enrollment) {
        lessons = lessons.filter((l) => l.isPreview);
      }
    }

    res.status(200).json({ success: true, data: lessons });
  } catch (err) {
    next(err);
  }
};

export const getLesson = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title instructor');
    if (!lesson) return next(new AppError('Lesson not found', 404));

    if (!lesson.isPreview && req.user?.role === 'student') {
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: lesson.course,
      });
      if (!enrollment) {
        return next(new AppError('Not enrolled in this course', 403));
      }
    }

    res.status(200).json({ success: true, data: lesson });
  } catch (err) {
    next(err);
  }
};

export const createLesson = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return next(new AppError('Course not found', 404));

    if (
      String(course.instructor) !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized', 403));
    }

    const lastLesson = await Lesson.findOne({ course: req.params.courseId })
      .sort({ order: -1 })
      .select('order');
    const order = lastLesson ? lastLesson.order + 1 : 0;

    const lesson = await Lesson.create({
      ...req.body,
      course: req.params.courseId,
      order,
    });

    await Course.findByIdAndUpdate(req.params.courseId, {
      $inc: { totalLessons: 1, duration: lesson.duration ?? 0 },
    });

    res.status(201).json({ success: true, data: lesson });
  } catch (err) {
    next(err);
  }
};

export const updateLesson = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) return next(new AppError('Lesson not found', 404));

    const course = await Course.findById(lesson.course);
    if (
      course &&
      String(course.instructor) !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized', 403));
    }

    const oldDuration = lesson.duration ?? 0;
    const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (req.body.duration !== undefined && course) {
      const diff = (req.body.duration as number) - oldDuration;
      await Course.findByIdAndUpdate(lesson.course, { $inc: { duration: diff } });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteLesson = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return next(new AppError('Lesson not found', 404));

    const course = await Course.findById(lesson.course);
    if (
      course &&
      String(course.instructor) !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized', 403));
    }

    await lesson.deleteOne();

    if (course) {
      await Course.findByIdAndUpdate(lesson.course, {
        $inc: { totalLessons: -1, duration: -(lesson.duration ?? 0) },
      });
    }

    res.status(200).json({ success: true, message: 'Lesson deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const reorderLessons = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessons } = req.body as { lessons: { id: string; order: number }[] };
    const course = await Course.findById(req.params.courseId);
    if (!course) return next(new AppError('Course not found', 404));

    if (
      String(course.instructor) !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      return next(new AppError('Not authorized', 403));
    }

    await Promise.all(
      lessons.map(({ id, order }) => Lesson.findByIdAndUpdate(id, { order }))
    );

    res.status(200).json({ success: true, message: 'Lessons reordered successfully' });
  } catch (err) {
    next(err);
  }
};

export const markLessonComplete = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return next(new AppError('Lesson not found', 404));

    const enrollment = await Enrollment.findOne({
      student: req.user!.id,
      course: lesson.course,
    });

    if (!enrollment) {
      return next(new AppError('Not enrolled in this course', 403));
    }

    const alreadyCompleted = enrollment.progress.some(
      (p) => String(p.lesson) === lessonId
    );

    if (!alreadyCompleted) {
      enrollment.progress.push({ lesson: lesson._id as typeof lesson._id, completedAt: new Date() });
      enrollment.completedLessons += 1;

      const course = await Course.findById(lesson.course).select('totalLessons');
      if (course && enrollment.completedLessons >= course.totalLessons) {
        enrollment.isCompleted = true;
        enrollment.completedAt = new Date();
      }

      await enrollment.save();
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};
