import { rateLimit } from 'express-rate-limit';

// 1. Wide Gate: Protects general operations from network spam
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute monitoring window
  limit: 100, // Permit a maximum of 100 requests per window
  standardHeaders: 'draft-7', // Return standard rate-limiting headers in response
  legacyHeaders: false, // Turn off old X-RateLimit headers
  message: {
    error: 'Too many requests. Please try again after 15 minutes.'
  }
});

// 2. Strict Gate: Protects heavy file-system writes, DB transactions, and GPU loops
export const heavyWriteRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute monitoring window
  limit: 10, // Permit a maximum of 10 structural updates per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many mutation requests. Please wait a moment before trying again.'
  }
});
