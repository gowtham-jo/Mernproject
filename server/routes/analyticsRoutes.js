import express from 'express';
import {
  getAdminAnalytics,
  getTeacherAnalytics,
  getStudentAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('admin'), getAdminAnalytics);
router.get('/teacher', authorize('teacher', 'admin'), getTeacherAnalytics);
router.get('/student', authorize('student'), getStudentAnalytics);

export default router;
