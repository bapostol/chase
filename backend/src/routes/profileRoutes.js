import { Router } from 'express';
import { profileController } from '../controllers/profileController.js';

const router = Router();

router.get('/profile', profileController.get);
router.put('/profile', profileController.update);

export default router;
