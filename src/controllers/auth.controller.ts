import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email } = req.body;
    const userEmail = email || 'user@matrimony.com';
    const userId = 'user-uuid-' + Math.random().toString(36).substring(2, 9);

    const token = jwt.sign(
      { userId, email: userEmail },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: userId,
        email: userEmail,
      },
    });
  }
}
