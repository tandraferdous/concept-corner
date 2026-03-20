import { Router } from 'express';
import { body } from 'express-validator';
import {
  createPayment,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  webhookHandler,
} from '../controllers/paymentController';
import { protect } from '../middleware/auth';
import { paymentLimiter } from '../middleware/rateLimiter';
import validate from '../middleware/validate';

const router = Router();

router.post('/webhook', webhookHandler);

router.post(
  '/create',
  protect,
  paymentLimiter,
  [body('courseId').notEmpty().withMessage('Course ID is required')],
  validate,
  createPayment
);

router.post(
  '/verify',
  protect,
  [
    body('paymentId').notEmpty().withMessage('Payment ID is required'),
    body('bkashPaymentID').notEmpty().withMessage('bKash payment ID is required'),
  ],
  validate,
  verifyPayment
);

router.get('/history', protect, getPaymentHistory);
router.get('/:id', protect, getPaymentDetails);

export default router;
