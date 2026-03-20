import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { protect } from '../middleware/auth';
import validate from '../middleware/validate';

const router = Router();

router.get('/', protect, getCart);

router.post(
  '/add',
  protect,
  [body('courseId').notEmpty().withMessage('Course ID is required')],
  validate,
  addToCart
);

router.delete('/clear', protect, clearCart);
router.delete('/:courseId', protect, removeFromCart);

export default router;
