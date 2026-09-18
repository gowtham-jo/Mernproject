import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('teacher', 'admin'), createAnnouncement);
router.delete('/:id', authorize('teacher', 'admin'), deleteAnnouncement);

export default router;
