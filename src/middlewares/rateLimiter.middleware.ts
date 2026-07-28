import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Rate limit exceeded (1000 req/min limit).',
  },
});

export const aiGenerationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 AI profile generation calls per minute per user/IP
  message: {
    success: false,
    error: 'AI Generation rate limit reached. Please wait a minute before requesting another profile generation.',
  },
});
