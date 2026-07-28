import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { ProfileService } from '../services/profile.service.js';

const profileService = new ProfileService();

export class GeneratorController {
  /**
   * POST /api/v1/profile/generate
   * Step 7, 8, 9, 10: Generate complete profile using Claude Messages API
   */
  static async generateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || 'demo-user-123';
      const { requestedTone, language } = req.body;

      const result = await profileService.generateProfile(userId, requestedTone || 'Standard', language);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate profile with AI',
      });
    }
  }

  /**
   * POST /api/v1/profile/regenerate
   * Regenerate with specific tone variation (Formal, Traditional, Modern, Funny)
   */
  static async regenerateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || 'demo-user-123';
      const { tone, language } = req.body;

      if (!tone) {
        return res.status(400).json({
          success: false,
          error: 'Tone parameter (Formal, Traditional, Modern, Funny) is required for regeneration.',
        });
      }

      const result = await profileService.generateProfile(userId, tone, language);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to regenerate profile with specified tone',
      });
    }
  }
}
