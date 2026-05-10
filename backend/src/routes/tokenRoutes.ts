import { Router } from 'express';
import { getMyTokens, getClaims } from '../controllers/tokenController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getMyTokens);
router.get('/claims', authenticateToken, getClaims);

export default router;
