import { Router } from 'express';
import { applicationController } from '../controllers/applicationController.js';
import { heavyWriteRateLimiter } from '../middleware/rateLimiter.js'; 

const router = Router();

router.post('/applications', heavyWriteRateLimiter, applicationController.create);
router.get('/applications', applicationController.getAll);
router.patch('/applications/:id', heavyWriteRateLimiter, applicationController.update);
router.delete('/applications/:id', heavyWriteRateLimiter, applicationController.delete);

export default router;
