import { Router } from 'express';
import { createReport, getMyReports, getAllIncidents } from '../controllers/incidentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, createReport);
router.get('/my', authenticateToken, getMyReports);
router.get('/all', getAllIncidents);

export default router;
