import { SupportedLanguage, LanguageDetector } from '../utils/languageDetector.js';

export interface PromptPayload {
  existingFields: Record<string, any>;
  answers: Array<{ questionText: string; fieldTarget: string; answerText: string }>;
  requestedTone?: string;
  language?: SupportedLanguage;
}

export class PromptBuilderService {
  private static PROMPT_VERSION = "2.4.0-matrimony-enterprise";

  /**
   * System Prompt defining Claude's Persona as an Expert Senior Matrimonial Counselor & AI Copywriter
   */
  static getSystemPrompt(): string {
    return `You are an elite Senior Staff Matrimonial Profile Copywriter and Relationship Expert specializing in South Asian and global matrimonial platforms (e.g., Bharat Matrimony).
Your task is to craft attractive, genuine, highly respectful, and persuasive matrimonial profiles for prospective brides and grooms.

SYSTEM RULES & GUIDELINES:
1. BUSINESS GOAL: Maximize profile interest and match response rates by expressing warmth, authenticity, career clarity, and strong family values.
2. FORMATTING: You must output ONLY a valid JSON object matching the requested schema. No markdown wrapping outside the JSON, no explanations.
3. SAFETY & PII: Strictly remove any phone numbers, email addresses, social media links, handles, or inappropriate content if present in inputs.
4. HALLUCINATIONS: Do not invent false jobs, degrees, salaries, or background facts that were not provided.
5. RESPECT: Avoid offensive language, stereotypes, or derogatory phrases. Ensure the profile sounds warm, dignified, and approachable.`;
  }

  /**
   * Builds developer prompt with few-shot examples, tone controls, language requirements, and strict JSON output schema
   */
  static buildUserPrompt(payload: PromptPayload): string {
    const lang = payload.language || LanguageDetector.detectLanguage('', payload.existingFields.motherTongue);
    const langInstruction = LanguageDetector.getLanguageInstruction(lang);
    const tone = payload.requestedTone || "Standard";

    const formattedExisting = Object.entries(payload.existingFields)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `  - ${k}: ${v}`)
      .join('\n');

    const formattedAnswers = payload.answers.length > 0
      ? payload.answers.map((a) => `  - [${a.fieldTarget}] Q: "${a.questionText}" -> A: "${a.answerText}"`).join('\n')
      : '  - None provided yet';

    return `PROMPT VERSION: ${this.PROMPT_VERSION}
TARGET TONE: ${tone}
TARGET LANGUAGE: ${lang}

${langInstruction}

EXISTING PROFILE FIELDS:
${formattedExisting || '  - Basic info only'}

USER DETAILED ANSWERS (ADDITIONAL CONTEXT):
${formattedAnswers}

FEW-SHOT EXAMPLES FOR QUALITY CALIBRATION:

[EXAMPLE 1 - Male Engineer, Traditional & Warm]
Input: Age: 28, Religion: Hindu, Caste: Brahmin, Occupation: Senior Software Engineer (18 LPA), Hobbies: Classical Flute, Trekking, Family: Joint family with strong traditions.
Output JSON:
{
  "headline": "Software Engineer & Flutist | Traditional Values & Global Outlook",
  "aboutMe": "I am a warm, values-driven software engineer who believes in balancing professional dedication with deep family ties. Raised in a traditional household, I cherish music, nature walks, and meaningful conversations.",
  "partnerExpectations": "Seeking a well-educated, respectful partner who appreciates traditional family warmth and shared growth.",
  "shortBio": "Engineered by profession, musician by heart. Believer in simple living and high thinking.",
  "profileSummary": "Senior Software Engineer raised with authentic cultural ethics and modern career ambitions.",
  "personalitySummary": "Calm, family-focused, lifelong learner with passion for classical arts.",
  "voiceScript": "Hello! Welcome to my profile. I am a software engineer passionate about music, tech, and family life."
}

[EXAMPLE 2 - Female Doctor, Modern & Accomplished]
Input: Age: 27, Religion: Muslim, Education: MBBS, MD, Location: Mumbai, Hobbies: Reading, Travel.
Output JSON:
{
  "headline": "Medical Resident (MD) | Compassionate, Well-Traveled & Ambitious",
  "aboutMe": "I am a dedicated medical professional committed to serving patients while enjoying life's simple pleasures. I value honesty, intellectual curiosity, and family togetherness.",
  "partnerExpectations": "Looking for an educated, caring companion who shares mutual respect, career encouragement, and a love for travel.",
  "shortBio": "Doctor passionate about healing, literature, and weekend road trips.",
  "profileSummary": "MD Physician with a balanced perspective on faith, modern independence, and family obligations.",
  "personalitySummary": "Empathetic, clear-minded, optimistic and enthusiastic about new experiences.",
  "voiceScript": "Hi there! I am a physician based in Mumbai. I look forward to connecting with a partner who values mutual support and genuine happiness."
}

YOUR TASK:
Using the profile fields and detailed user answers provided above, generate the complete matrimonial content object strictly adhering to the JSON schema below.

REQUIRED JSON OUTPUT FORMAT:
{
  "headline": "A captivating, professional 8-12 word headline",
  "aboutMe": "Comprehensive, warm 60-100 word section describing personality, work, and lifestyle",
  "partnerExpectations": "Clear, positive 40-70 word section on desired partner qualities",
  "shortBio": "Punchy 15-25 word summary for mobile cards",
  "profileSummary": "Concise 20-30 word professional overview",
  "personalitySummary": "4-6 key personality traits summarized in a sentence",
  "voiceScript": "A friendly 25-40 word transcript suitable for a profile voice audio bio"
}`;
  }
}
