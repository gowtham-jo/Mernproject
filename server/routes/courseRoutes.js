import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  getMyTeacherCourses,
} from '../controllers/courseController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Public routes (with optional auth to enrich enrollment data)
router.get('/', getCourses);
router.get('/teacher/my-courses', protect, authorize('teacher', 'admin'), getMyTeacherCourses);
router.get('/:id', optionalAuth, getCourseById);

// Protected routes (Teacher and Admin)
router.use(protect);
router.use(authorize('teacher', 'admin'));
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.put('/:id/status', toggleCourseStatus);

export default router;
