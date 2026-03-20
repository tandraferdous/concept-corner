import { Router } from 'express';
import { body } from 'express-validator';
import {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  markLessonComplete,
} from '../controllers/lessonController';
import { protect, restrictTo, optionalAuth } from '../middleware/auth';
import validate from '../middleware/validate';

const router = Router({ mergeParams: true });

router.get('/', optionalAuth, getLessons);
router.get('/:id', optionalAuth, getLesson);

router.post(
  '/',
  protect,
  restrictTo('instructor', 'admin'),
  [body('title').trim().notEmpty().withMessage('Lesson title is required')],
  validate,
  createLesson
);

router.patch(
  '/reorder',
  protect,
  restrictTo('instructor', 'admin'),
  [
    body('lessons').isArray().withMessage('Lessons must be an array'),
    body('lessons.*.id').notEmpty().withMessage('Lesson id is required'),
    body('lessons.*.order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  ],
  validate,
  reorderLessons
);

router.patch('/:id', protect, restrictTo('instructor', 'admin'), updateLesson);
router.delete('/:id', protect, restrictTo('instructor', 'admin'), deleteLesson);

router.post('/:lessonId/complete', protect, restrictTo('student'), markLessonComplete);

export default router;
