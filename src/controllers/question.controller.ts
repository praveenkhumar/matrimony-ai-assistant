import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { ProfileService } from '../services/profile.service.js';

const profileService = new ProfileService();

export class QuestionController {
  /**
   * POST /api/v1/profile/questions
   * Step 2 & 3: Fetch existing profile & detect weak fields / next AI question
   */
  static async getNextQuestion(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || 'demo-user-123';
      const questionData = await profileService.getNextQuestion(userId);

      return res.status(200).json({
        success: true,
        data: questionData,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch next profile question',
      });
    }
  }

  /**
   * POST /api/v1/profile/answer
   * Step 5 & 6: Collect & Validate user answer
   */
  static async submitAnswer(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || 'demo-user-123';
      const { sessionId, questionText, fieldTarget, answerText } = req.body;

      if (!sessionId || !questionText || !fieldTarget || !answerText) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: sessionId, questionText, fieldTarget, answerText',
        });
      }

      const result = await profileService.submitAnswer(
        userId,
        sessionId,
        questionText,
        fieldTarget,
        answerText
      );

      if (!result.isValid) {
        return res.status(422).json({
          success: false,
          error: result.error,
          rejectedReason: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to process answer submission',
      });
    }
  }
}
