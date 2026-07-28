import { createApp } from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`=======================================================`);
  logger.info(`🚀 Matrimony AI Profile Assistant Server is Running!`);
  logger.info(`👉 Local Server URL : http://localhost:${config.port}`);
  logger.info(`👉 Web Assistant UI : http://localhost:${config.port}`);
  logger.info(`👉 Environment Mode : ${config.nodeEnv}`);
  logger.info(`=======================================================`);
});

// Graceful Shutdown Handling
const shutdown = () => {
  logger.info('Shutting down HTTP server gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
