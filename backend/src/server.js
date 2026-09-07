import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeChaseSystem } from './database/init.js';
import profileRoutes from './routes/profileRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import { globalRateLimiter } from './middleware/rateLimiter.js'; 

// Load environmental configuration variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.CHASE_API_KEY;

if (!API_KEY) {    
  console.error("Critical configuration error: CHASE_API_KEY is not defined in the environment.");
  process.exit(1);
}

// Enable cross-origin resource sharing for the frontend
app.use(cors());

// Parse incoming raw JSON request payloads into req.body objects
app.use(express.json());

// Security Middleware: Validates the request token header
const authenticateApiKey = (req, res, next) => {
  const userKey = req.headers['x-api-key'];
  if (!userKey || userKey !== API_KEY) {
    console.error('Unauthorized: Invalid or missing API key.');
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  next();
};

app.use('/api', authenticateApiKey);
app.use('/api', globalRateLimiter); 

// Version 1 health verification endpoint <- placed here just for fun
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'online', 
    agent: 'CHASE', 
    engine: 'Express on Node.js' 
  });
});

// Proper routes, with controllers behind
app.use('/api/v1', profileRoutes);
app.use('/api/v1', applicationRoutes);

async function startServer() {
  try {
    // Run the folder creations and apply any pending SQL migrations
    await initializeChaseSystem();

    app.listen(PORT, () => {
      console.log(`CHASE core API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Critical server boot failure:", error);
    process.exit(1);
  }
}

startServer();
