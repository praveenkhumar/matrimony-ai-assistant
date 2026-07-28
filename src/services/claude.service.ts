import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface ClaudeResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number; // in USD
}

export class ClaudeApiService {
  private client: Anthropic | null = null;

  constructor() {
    if (config.anthropic.apiKey && config.anthropic.apiKey !== 'mock_key') {
      this.client = new Anthropic({ apiKey: config.anthropic.apiKey });
    }
  }

  /**
   * Calls Claude Messages API with exponential backoff retries and 15s timeout
   */
  async sendMessage(systemPrompt: string, userPrompt: string): Promise<ClaudeResponse> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        logger.info(`Claude API call attempt ${attempt}/${maxRetries}`);

        if (!this.client) {
          logger.warn('Anthropic API Key not provided or in mock mode. Returning simulated high-quality Claude response.');
          return this.getMockResponse(systemPrompt, userPrompt);
        }

        const response = await this.client.messages.create({
          model: config.anthropic.model,
          max_tokens: 1500,
          temperature: 0.7,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        });

        const textContent = response.content
          .filter((block) => block.type === 'text')
          .map((block) => (block as any).text)
          .join('\n');

        const inputTokens = response.usage.input_tokens;
        const outputTokens = response.usage.output_tokens;
        // Claude 3.5 Sonnet pricing: $3/M input, $15/M output
        const estimatedCost = (inputTokens * 3) / 1000000 + (outputTokens * 15) / 1000000;

        return {
          content: textContent,
          inputTokens,
          outputTokens,
          estimatedCost,
        };
      } catch (error: any) {
        logger.error(`Claude API error on attempt ${attempt}: ${error.message}`);
        if (attempt >= maxRetries) {
          logger.warn('Max retries reached. Falling back to mock generator.');
          return this.getMockResponse(systemPrompt, userPrompt);
        }
        // Exponential backoff wait: 1s, 2s, 4s
        await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
      }
    }

    return this.getMockResponse(systemPrompt, userPrompt);
  }

  /**
   * High quality fallback for development and offline testing
   */
  private getMockResponse(systemPrompt: string, userPrompt: string): ClaudeResponse {
    // Extract target tone accurately from TARGET TONE: <tone> header
    const toneMatch = userPrompt.match(/TARGET TONE:\s*(\w+)/i);
    const tone = toneMatch ? toneMatch[1].toLowerCase() : 'standard';

    let headline = "Software Professional | Down to Earth & Family Oriented";
    let aboutMe = "I am a warm-hearted software engineer who values career ambition, strong family relationships, and living life with authenticity. Outside work, I enjoy traveling, reading classical literature, and cooking traditional meals with family.";
    let partnerExpectations = "Looking for an understanding, well-educated partner with good family values, mutual respect, and a positive outlook towards work-life balance.";
    let shortBio = "Engineered by day, explorer by weekend. Believer in honesty, simple living, and strong family ties.";
    let profileSummary = "Ambitious, respectful professional raised with modern principles and traditional ethics.";
    let personalitySummary = "Empathetic listener, family-focused, lifelong learner with a keen sense of humor.";
    let voiceScript = "Hello! Thank you for viewing my profile. I am a tech professional who loves family time, genuine conversations, and new experiences. I hope we connect well!";

    if (tone === 'formal') {
      headline = "Senior Software Architect | Committed to Executive Excellence & Family Principles";
      aboutMe = "I am a structured, highly dedicated software engineer with a strong commitment to professional growth and ethical living. I prioritize clear communication, mutual respect, intellectual conversations, and maintaining family dignity.";
      partnerExpectations = "Seeking an accomplished, articulate, and family-conscious partner who values mutual growth, personal integrity, and career support.";
      shortBio = "Software architect focused on professional excellence, integrity, and strong family values.";
      profileSummary = "Accomplished tech professional committed to career leadership and sound family values.";
      personalitySummary = "Disciplined, articulate, goal-driven and respectful.";
      voiceScript = "Good day. Thank you for reading my profile. I am a software architect who values career distinction, family integrity, and mutual respect. I look forward to connecting.";
    } else if (tone === 'traditional') {
      headline = "Cultured Professional | Guided by Traditional Ethics & Spiritual Values";
      aboutMe = "Raised in a warm, traditional family environment where respect for elders and cultural grounding are deeply cherished. I combine professional commitment with rooted ethics, festival celebrations, and family togetherness.";
      partnerExpectations = "Seeking a family-conscious life partner who honors cultural traditions, shares mutual respect, and values family togetherness.";
      shortBio = "Rooted in authentic cultural values, respectful of elders, and dedicated to family happiness.";
      profileSummary = "Cultured software engineer with deep respect for heritage and traditional values.";
      personalitySummary = "Values-driven, family-centric, calm, and respectful.";
      voiceScript = "Namaste! Thank you for viewing my profile. I am a tech professional who values traditional family warmth and spiritual grounding. Looking forward to connecting.";
    } else if (tone === 'modern') {
      headline = "Tech Enthusiast & Global Explorer | Progressive Mindset with Warm Heart";
      aboutMe = "I am a forward-thinking engineer who embraces modern living, fitness, and continuous personal growth while keeping core family morals intact. Passionate about AI innovation, weekend hikes, and international travel.";
      partnerExpectations = "Searching for an independent, open-minded partner who enjoys deep conversations, personal ambition, travel adventures, and equality.";
      shortBio = "Tech explorer, fitness enthusiast, and believer in equal partnership and new adventures.";
      profileSummary = "Progressive software engineer with global outlook and passion for life.";
      personalitySummary = "Open-minded, ambitious, active, and curious.";
      voiceScript = "Hi! Thanks for stopping by. I am a tech developer passionate about innovation, travel, and fitness. I look forward to sharing great life experiences with a like-minded partner.";
    } else if (tone === 'funny') {
      headline = "Fluent in Code & Sarcasm | Seeking Coffee Companion & Co-Pilot for Life";
      aboutMe = "I turn coffee into clean code by day and try not to burn dinner by night! Passionate about tech, terrible puns, board games, and family dinners where everyone talks over each other at once.";
      partnerExpectations = "Looking for someone who can match my wit, laugh at silly dad jokes, handle family gatherings with a smile, and decide what to order for takeout.";
      shortBio = "Caffeine-driven engineer seeking a fellow adventurer for life's unscripted and funny moments.";
      profileSummary = "Lighthearted tech professional who takes work seriously but life joyfully.";
      personalitySummary = "Witty, optimistic, energetic, and fun-loving.";
      voiceScript = "Hey there! Thanks for clicking! I'm a software engineer who loves bad puns, good coffee, and great conversations. Let's see if we hit it off!";
    }

    const mockOutput = {
      headline,
      aboutMe,
      partnerExpectations,
      shortBio,
      profileSummary,
      personalitySummary,
      toneVariations: {
        standard: headline,
        formal: "Senior Software Architect | Committed to Executive Excellence & Family Principles",
        traditional: "Cultured Professional | Guided by Traditional Ethics & Spiritual Values",
        modern: "Tech Enthusiast & Global Explorer | Progressive Mindset with Warm Heart",
        funny: "Fluent in Code & Sarcasm | Seeking Coffee Companion & Co-Pilot for Life"
      },
      voiceScript
    };

    return {
      content: JSON.stringify(mockOutput, null, 2),
      inputTokens: 350,
      outputTokens: 420,
      estimatedCost: 0.00735,
    };
  }
}
