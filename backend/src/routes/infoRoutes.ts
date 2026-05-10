import { Router } from 'express';
import { getAlerts, getCamps, getResources } from '../controllers/infoController';

const router = Router();

router.get('/alerts', getAlerts);
router.get('/camps', getCamps);
router.get('/resources', getResources);

export default router;
