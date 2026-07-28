import { prisma } from '../config/database.js';

export class AiLogRepository {
  static async logGeneration(data: {
    profileId: string;
    requestedTone: string;
    language: string;
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    rawPrompt: string;
    aiOutputJson: string;
    status: string;
  }) {
    return prisma.aiGeneration.create({
      data,
    });
  }

  static async logAudit(data: {
    userId?: string;
    action: string;
    inputSanitized: boolean;
    status: string;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
  }) {
    return prisma.aiAuditLog.create({
      data,
    });
  }
}
