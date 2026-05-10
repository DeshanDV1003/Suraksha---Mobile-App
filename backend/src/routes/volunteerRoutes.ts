import { Router } from 'express';
import { getMyTasks, updateTaskStatus, getVolunteerProfile } from '../controllers/volunteerController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/tasks', authenticateToken, getMyTasks);
router.patch('/tasks/status', authenticateToken, updateTaskStatus);
router.get('/profile', authenticateToken, getVolunteerProfile);

export default router;
