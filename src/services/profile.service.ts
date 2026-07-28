import { prisma } from '../config/database.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { QuestionRepository } from '../repositories/question.repository.js';
import { AiLogRepository } from '../repositories/aiLog.repository.js';
import { QuestionEngineService } from './questionEngine.service.js';
import { PromptBuilderService } from './promptBuilder.service.js';
import { ClaudeApiService } from './claude.service.js';
import { ValidationEngineService } from './validation.service.js';
import { ProfileScorerService } from './scoring.service.js';
import { SecuritySanitizer } from '../utils/sanitizers.js';
import { LanguageDetector } from '../utils/languageDetector.js';
import { logger } from '../utils/logger.js';

export class ProfileService {
  private claudeService: ClaudeApiService;

  constructor() {
    this.claudeService = new ClaudeApiService();
  }

  /**
   * Step 2 & 3: Fetch existing profile & detect weak fields / next single AI question
   */
  async getNextQuestion(userId: string) {
    const profile = await this.getOrCreateDefaultProfile(userId);
    const session = await QuestionRepository.getOrCreateActiveSession(profile.id);

    const questionResult = QuestionEngineService.generateNextQuestion(profile, session.answers);

    return {
      profileId: profile.id,
      sessionId: session.id,
      currentStep: session.currentStep,
      ...questionResult,
    };
  }

  /**
   * Step 5 & 6: Collect & Validate answer
   */
  async submitAnswer(userId: string, sessionId: string, questionText: string, fieldTarget: string, answerText: string) {
    // Security validation (Step 6)
    const securityCheck = SecuritySanitizer.validateUserAnswer(answerText);

    if (!securityCheck.isValid) {
      // Record rejected answer attempt
      await QuestionRepository.addAnswer(sessionId, {
        questionText,
        fieldTarget,
        answerText,
        isValidated: false,
        rejectedReason: securityCheck.reason,
      });

      return {
        success: false,
        error: securityCheck.reason,
        isValid: false,
      };
    }

    // Save valid answer
    const answer = await QuestionRepository.addAnswer(sessionId, {
      questionText,
      fieldTarget,
      answerText: securityCheck.sanitizedContent!,
      isValidated: true,
    });

    // Check if next question is available or session complete
    const profile = await this.getOrCreateDefaultProfile(userId);
    const updatedSession = await QuestionRepository.getOrCreateActiveSession(profile.id);
    const nextQ = QuestionEngineService.generateNextQuestion(profile, updatedSession.answers);

    return {
      success: true,
      isValid: true,
      answerId: answer.id,
      nextQuestion: nextQ,
    };
  }

  /**
   * Step 7, 8, 9, 10: Build Prompt, Call Claude, Generate content & Tone Variations, Validate, Score
   */
  async generateProfile(userId: string, requestedTone: string = 'Standard', customLanguage?: string) {
    const profile = await this.getOrCreateDefaultProfile(userId);
    const session = await QuestionRepository.getOrCreateActiveSession(profile.id);

    const language = customLanguage || LanguageDetector.detectLanguage('', profile.motherTongue || undefined);

    // Step 7: Build optimized prompt
    const systemPrompt = PromptBuilderService.getSystemPrompt();
    const userPrompt = PromptBuilderService.buildUserPrompt({
      existingFields: profile,
      answers: session.answers.map((a: any) => ({
        questionText: a.questionText,
        fieldTarget: a.fieldTarget,
        answerText: a.answerText,
      })),
      requestedTone,
      language: language as any,
    });

    logger.info(`Invoking Claude Messages API for user: ${userId}, tone: ${requestedTone}`);

    // Step 8: Call Claude Messages API
    const claudeResp = await this.claudeService.sendMessage(systemPrompt, userPrompt);

    // Step 10: Validate AI output
    const validationResult = ValidationEngineService.validateAiOutput(claudeResp.content);

    if (!validationResult.isValid) {
      logger.warn(`AI Generation failed validation for profile ${profile.id}: ${validationResult.errors.join(', ')}`);
    }

    const content = validationResult.sanitizedOutput || {
      headline: "Software Professional | Down to Earth",
      aboutMe: "I am an ambitious software engineer who values career growth and strong family bonds.",
      partnerExpectations: "Looking for an educated, caring companion.",
      shortBio: "Tech enthusiast who loves family time.",
      profileSummary: "Software engineer with authentic ethics.",
      personalitySummary: "Calm, family-oriented.",
      voiceScript: "Hello! Welcome to my profile."
    };

    // Generate Tone Variations & Extra AI Features
    const toneVariations = {
      standard: content.headline,
      formal: `Accomplished ${profile.occupation || 'Professional'} | Committed to Career & Family`,
      traditional: `Cultured & Family-conscious ${profile.occupation || 'Professional'} | Guided by Values`,
      modern: `Progressive ${profile.occupation || 'Professional'} | Passionate about Innovation & Life`,
      funny: `Code, Coffee & Family Dinners | Looking for my favorite co-pilot`,
      shortVersion: content.shortBio,
      voiceScript: content.voiceScript || `Hello! Thank you for reviewing my profile. Hope we connect soon!`,
    };

    // Calculate Scores (Step 10 / Scoring Engine)
    const scoreBreakdown = ProfileScorerService.calculateScore(profile, content);

    // Audit Log Generation
    await AiLogRepository.logGeneration({
      profileId: profile.id,
      requestedTone,
      language,
      promptTokens: claudeResp.inputTokens,
      completionTokens: claudeResp.outputTokens,
      totalCost: claudeResp.estimatedCost,
      rawPrompt: userPrompt,
      aiOutputJson: JSON.stringify(content),
      status: validationResult.isValid ? 'SUCCESS' : 'SANITIZED',
    });

    return {
      profileId: profile.id,
      generatedContent: content,
      toneVariations,
      scores: scoreBreakdown,
      validation: {
        isValid: validationResult.isValid,
        warnings: validationResult.errors,
      },
      tokenUsage: {
        inputTokens: claudeResp.inputTokens,
        outputTokens: claudeResp.outputTokens,
        costUsd: claudeResp.estimatedCost,
      },
    };
  }

  /**
   * Step 11 & 12: Save previewed/edited profile to DB
   */
  async saveFinalProfile(userId: string, data: any) {
    const profile = await this.getOrCreateDefaultProfile(userId);

    const updated = await ProfileRepository.saveGeneratedProfile(profile.id, {
      headline: data.headline,
      aboutMe: data.aboutMe,
      partnerPreference: data.partnerPreference,
      shortBio: data.shortBio || data.headline,
      profileSummary: data.profileSummary || data.aboutMe.substring(0, 100),
      personalitySummary: data.personalitySummary || 'Warm, empathetic, career-minded',
      toneVariationsJson: JSON.stringify(data.toneVariations || {}),
      voiceScript: data.voiceScript || '',
      completionScore: data.completionScore || 95,
      overallScore: data.overallScore || 90,
    });

    // Save score record
    if (data.scores) {
      await ProfileRepository.saveScores(profile.id, {
        completenessScore: data.scores.completenessScore,
        readabilityScore: data.scores.readabilityScore,
        professionalismScore: data.scores.professionalismScore,
        familyValueScore: data.scores.familyValueScore,
        overallScore: data.scores.overallScore,
        suggestionsJson: JSON.stringify(data.scores.suggestions || []),
      });
    }

    return updated;
  }

  /**
   * Helper to ensure profile exists for given user
   */
  async getOrCreateDefaultProfile(userId: string) {
    let profile = await ProfileRepository.findByUserId(userId);

    if (!profile) {
      // Ensure user record exists first
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: `${userId}@matrimony.com`,
          name: 'Demo User',
          passwordHash: 'hashed_password',
        },
      });

      await ProfileRepository.upsertProfile(userId, {
        age: 28,
        gender: 'Male',
        religion: 'Hindu',
        caste: 'Brahmin',
        motherTongue: 'English',
        education: 'B.Tech in Computer Science',
        occupation: 'Senior Software Engineer',
        salary: '18 LPA',
        location: 'Bangalore, India',
        familyDetails: 'Nuclear family, father retired banker, mother homemaker',
      });
      profile = await ProfileRepository.findByUserId(userId);
    }

    return profile!;
  }
}
