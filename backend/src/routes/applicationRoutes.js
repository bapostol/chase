import { Router } from 'express';
import { applicationController } from '../controllers/applicationController.js';

const router = Router();

router.post('/applications', applicationController.create);
router.get('/applications', applicationController.getAll);
router.patch('/applications/:id', applicationController.update);
router.delete('/applications/:id', applicationController.delete);

export default router;
