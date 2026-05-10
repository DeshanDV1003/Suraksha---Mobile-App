import { Router } from 'express';
import { register, login, getProfile, updatePushToken } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.patch('/push-token', authenticateToken, updatePushToken);

export default router;
