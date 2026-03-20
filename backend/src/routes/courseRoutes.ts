import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  getCoursesByInstructor,
  searchCourses,
  getFeaturedCourses,
  getCourseCategories,
} from '../controllers/courseController';
import { protect, restrictTo, optionalAuth } from '../middleware/auth';
import validate from '../middleware/validate';

const router = Router();

router.get('/featured', getFeaturedCourses);
router.get('/categories', getCourseCategories);
router.get('/search', searchCourses);
router.get('/my-courses', protect, getCoursesByInstructor);
router.get('/instructor/:instructorId', getCoursesByInstructor);
router.get('/', optionalAuth, getAllCourses);
router.get('/:slug', optionalAuth, getCourse);

router.post(
  '/',
  protect,
  restrictTo('instructor', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('shortDescription').notEmpty().withMessage('Short description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('level')
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Valid level required'),
  ],
  validate,
  createCourse
);

router.patch(
  '/:id',
  protect,
  restrictTo('instructor', 'admin'),
  updateCourse
);

router.delete(
  '/:id',
  protect,
  restrictTo('instructor', 'admin'),
  deleteCourse
);

router.patch(
  '/:id/publish',
  protect,
  restrictTo('instructor', 'admin'),
  publishCourse
);

export default router;
