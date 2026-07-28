import { prisma } from '../config/database.js';

export class QuestionRepository {
  static async getOrCreateActiveSession(profileId: string) {
    let session = await prisma.questionSession.findFirst({
      where: { profileId, status: 'ACTIVE' },
      include: { answers: true },
    });

    if (!session) {
      session = await prisma.questionSession.create({
        data: {
          profileId,
          status: 'ACTIVE',
          currentStep: 1,
        },
        include: { answers: true },
      });
    }

    return session;
  }

  static async addAnswer(sessionId: string, data: {
    questionText: string;
    fieldTarget: string;
    answerText: string;
    isValidated: boolean;
    rejectedReason?: string;
  }) {
    const answer = await prisma.questionAnswer.create({
      data: {
        sessionId,
        ...data,
      },
    });

    await prisma.questionSession.update({
      where: { id: sessionId },
      data: {
        currentStep: { increment: 1 },
      },
    });

    return answer;
  }

  static async completeSession(sessionId: string) {
    return prisma.questionSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    });
  }
}
