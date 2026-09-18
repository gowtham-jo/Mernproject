import express from 'express';
import {
  enrollInCourse,
  getMyCourses,
  getCourseProgress,
  toggleLessonComplete,
  updateLastAccessed,
  getAllEnrollments,
  getTeacherStudents,
} from '../controllers/enrollmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect);

// Student actions
router.post('/courses/:courseId/enroll', authorize('student'), enrollInCourse);
router.get('/enrollments/my-courses', authorize('student'), getMyCourses);
router.get('/progress/course/:courseId', getCourseProgress);
router.post('/progress/toggle-lesson', authorize('student'), toggleLessonComplete);
router.post('/progress/last-accessed', authorize('student'), updateLastAccessed);

// Teacher actions
router.get('/enrollments/teacher/students', authorize('teacher', 'admin'), getTeacherStudents);

// Admin actions
router.get('/enrollments', authorize('admin'), getAllEnrollments);

export default router;
