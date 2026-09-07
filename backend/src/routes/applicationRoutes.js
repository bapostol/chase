import { Router } from 'express';
import { applicationController } from '../controllers/applicationController.js';

const router = Router();

router.post('/applications', applicationController.create);
router.get('/applications', applicationController.getAll);

export default router;
