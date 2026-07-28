import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddlewares = [
  helmet({
    contentSecurityPolicy: false, // disabled for local preview UI demo
  }),
  cors({
    origin: '*', // restrict in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
];
