import { Router } from 'express';
import {
  getMyEnrollments,
  getEnrollment,
  isEnrolled,
  generateCertificate,
} from '../controllers/enrollmentController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getMyEnrollments);
router.get('/:id', protect, getEnrollment);
router.get('/check/:courseId', protect, isEnrolled);
router.post('/:id/certificate', protect, generateCertificate);

export default router;
