import express from 'express';
import {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults,
  getQuizResultById,
  getTeacherQuizzes,
} from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect);

router.get('/results', getQuizResults);
router.get('/results/:id', getQuizResultById);
router.get('/teacher/all', authorize('teacher', 'admin'), getTeacherQuizzes);

router.get('/:id', getQuizById);
router.post('/:id/submit', authorize('student'), submitQuiz);

router.post('/', authorize('teacher', 'admin'), createQuiz);
router.put('/:id', authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', authorize('teacher', 'admin'), deleteQuiz);

export default router;
