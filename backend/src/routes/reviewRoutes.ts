import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCourseReviews,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
} from '../controllers/reviewController';
import { protect, restrictTo } from '../middleware/auth';
import validate from '../middleware/validate';

const router = Router({ mergeParams: true });

router.get('/', getCourseReviews);

router.post(
  '/',
  protect,
  restrictTo('student'),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ],
  validate,
  createReview
);

router.patch(
  '/:id',
  protect,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().notEmpty().withMessage('Comment cannot be empty'),
  ],
  validate,
  updateReview
);

router.delete('/:id', protect, deleteReview);

router.patch('/:id/approve', protect, restrictTo('admin'), approveReview);

export default router;
