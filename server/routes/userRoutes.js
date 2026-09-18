import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getTeachersList,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/teachers/all', getTeachersList);

router.use(protect);
router.get('/:id', getUser);

// Admin-only user management
router.use(authorize('admin'));
router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/toggle-status', toggleUserStatus);

export default router;
