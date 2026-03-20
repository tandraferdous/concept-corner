import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getAllPayments,
  getRevenueAnalytics,
  toggleCoursePublish,
} from '../controllers/adminController';
import { protect, restrictTo } from '../middleware/auth';
import validate from '../middleware/validate';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard', getDashboardStats);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.patch(
  '/users/:id/role',
  [body('role').isIn(['student', 'instructor', 'admin']).withMessage('Invalid role')],
  validate,
  updateUserRole
);
router.delete('/users/:id', deleteUser);

router.get('/payments', getAllPayments);
router.get('/revenue', getRevenueAnalytics);

router.patch('/courses/:id/publish', toggleCoursePublish);

export default router;
