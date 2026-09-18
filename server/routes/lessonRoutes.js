import express from 'express';
import {
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/lessonController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router({ mergeParams: true });

router.get('/lessons/:id', getLessonById);

router.use(protect);
router.use(authorize('teacher', 'admin'));
router.post('/modules/:moduleId/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

export default router;
