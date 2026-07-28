import { prisma } from '../config/database.js';

export class ProfileRepository {
  static async findByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        sessions: {
          include: { answers: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        scores: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  static async upsertProfile(userId: string, data: any) {
    return prisma.profile.upsert({
      where: { userId },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...data,
      },
    });
  }

  static async saveGeneratedProfile(profileId: string, generationResult: {
    headline: string;
    aboutMe: string;
    partnerPreference: string;
    shortBio: string;
    profileSummary: string;
    personalitySummary: string;
    toneVariationsJson?: string;
    voiceScript?: string;
    completionScore?: number;
    overallScore?: number;
  }) {
    return prisma.profile.update({
      where: { id: profileId },
      data: {
        headline: generationResult.headline,
        aboutMe: generationResult.aboutMe,
        partnerPreference: generationResult.partnerPreference,
        shortBio: generationResult.shortBio,
        profileSummary: generationResult.profileSummary,
        personalitySummary: generationResult.personalitySummary,
        toneVariationsJson: generationResult.toneVariationsJson,
        voiceScript: generationResult.voiceScript,
        completionScore: generationResult.completionScore ?? 95,
        overallScore: generationResult.overallScore ?? 90,
      },
    });
  }

  static async saveScores(profileId: string, scores: {
    completenessScore: number;
    readabilityScore: number;
    professionalismScore: number;
    familyValueScore: number;
    overallScore: number;
    suggestionsJson: string;
  }) {
    return prisma.profileScore.create({
      data: {
        profileId,
        ...scores,
      },
    });
  }
}
