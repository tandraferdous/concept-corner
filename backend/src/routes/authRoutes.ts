import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
  updateMe,
  changePassword,
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import validate from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', protect, logout);

router.get(
  '/verify-email/:token',
  [param('token').notEmpty().withMessage('Token is required')],
  validate,
  verifyEmail
);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  validate,
  forgotPassword
);

router.post(
  '/reset-password/:token',
  [
    param('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,
  resetPassword
);

router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  refreshToken
);

router.get('/me', protect, getMe);

router.patch(
  '/me',
  protect,
  [body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')],
  validate,
  updateMe
);

router.patch(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  validate,
  changePassword
);

export default router;
