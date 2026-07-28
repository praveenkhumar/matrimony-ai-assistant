import express, { Express } from 'express';
import path from 'path';
import { securityMiddlewares } from './middlewares/security.middleware.js';
import { apiRateLimiter, aiGenerationLimiter } from './middlewares/rateLimiter.middleware.js';
import { authenticateJwt } from './middlewares/auth.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { AuthController } from './controllers/auth.controller.js';
import { QuestionController } from './controllers/question.controller.js';
import { GeneratorController } from './controllers/generator.controller.js';
import { ProfileController } from './controllers/profile.controller.js';

export const createApp = (): Express => {
  const app = express();

  // Middleware pipeline
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(securityMiddlewares);
  app.use('/api', apiRateLimiter);

  // Serve Web UI static files
  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath));

  // Authentication Route
  app.post('/api/v1/auth/login', AuthController.login);

  // Profile REST API Endpoints (All JWT Protected)
  app.post('/api/v1/profile/questions', authenticateJwt, QuestionController.getNextQuestion);
  app.post('/api/v1/profile/answer', authenticateJwt, QuestionController.submitAnswer);
  app.post('/api/v1/profile/generate', authenticateJwt, aiGenerationLimiter, GeneratorController.generateProfile);
  app.post('/api/v1/profile/regenerate', authenticateJwt, aiGenerationLimiter, GeneratorController.regenerateProfile);
  app.get('/api/v1/profile', authenticateJwt, ProfileController.getProfile);
  app.put('/api/v1/profile', authenticateJwt, ProfileController.updateProfile);

  // Health check
  app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'UP', service: 'Matrimony AI Assistant', timestamp: new Date() });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
