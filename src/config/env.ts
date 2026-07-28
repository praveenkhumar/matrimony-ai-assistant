import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'matrimony_jwt_secret_key_2026',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || 'mock_key',
    model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};
