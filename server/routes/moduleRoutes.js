import express from 'express';
import {
  getCourseModules,
  createModule,
  updateModule,
  deleteModule,
} from '../controllers/moduleController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router({ mergeParams: true });

router.get('/courses/:courseId/modules', getCourseModules);

router.use(protect);
router.use(authorize('teacher', 'admin'));
router.post('/courses/:courseId/modules', createModule);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

export default router;
