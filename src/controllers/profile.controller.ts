import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { ProfileService } from '../services/profile.service.js';

const profileService = new ProfileService();

export class ProfileController {
  /**
   * GET /api/v1/profile
   * Fetch current profile and saved preview state
   */
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || 'demo-user-123';
      const profile = await profileService.getOrCreateDefaultProfile(userId);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch user profile',
      });
    }
  }

  /**
   * PUT /api/v1/profile
   * Step 11 & 12: Accept, Edit & Save profile to database
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || 'demo-user-123';
      const updateData = req.body;

      if (!updateData.headline || !updateData.aboutMe || !updateData.partnerPreference) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing: headline, aboutMe, partnerPreference',
        });
      }

      const updated = await profileService.saveFinalProfile(userId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Profile successfully updated and saved to database.',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update profile',
      });
    }
  }
}
