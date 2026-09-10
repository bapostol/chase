import { Router } from 'express';
import { skillController } from '../controllers/skillController.js';
import { heavyWriteRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Middleware: Validates that the requested filename parameters conform strictly to a slug format
const validateFileSlug = (req, res, next) => {
  const { file_name } = req.params;
  
  // Enforces strictly lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9-]+$/;
  
  if (!slugRegex.test(file_name)) {
    return res.status(400).json({ 
      error: 'Invalid path convention. File names must be lowercase alphanumeric slugs (e.g., senior-dev-v1).' 
    });
  }
  
  next();
};

// Route structures use standard clean parameters, protected by the structural middleware guard pass
router.get('/skills/inventory', skillController.listAll);
router.get('/skill/:skill_name/:file_name', validateFileSlug, skillController.get);
router.post('/skill/:skill_name/:file_name', heavyWriteRateLimiter, validateFileSlug, skillController.upsert);

export default router;
