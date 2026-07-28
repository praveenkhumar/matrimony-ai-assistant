export interface QuestionResponse {
  questionText: string;
  fieldTarget: string;
  isComplete: boolean;
  totalMissingCount: number;
  remainingCount: number;
}

export class QuestionEngineService {
  private static WEAK_FIELD_DEFINITIONS: Record<string, { prompt: string; fallbackQuestion: string }> = {
    "About Me": {
      prompt: "Ask a short friendly question under 15 words about what they enjoy doing in their free time or career.",
      fallbackQuestion: "What is something unique you love doing in your free time or weekends?"
    },
    "Hobbies": {
      prompt: "Ask a short friendly question under 15 words about their top hobbies or creative interests.",
      fallbackQuestion: "What are your top 2 hobbies or pass-times that bring you joy?"
    },
    "Personality": {
      prompt: "Ask a short friendly question under 15 words about how their friends or family describe them.",
      fallbackQuestion: "How would your closest friends describe your personality in three words?"
    },
    "Family Values": {
      prompt: "Ask a short friendly question under 15 words about their family atmosphere and cultural values.",
      fallbackQuestion: "Could you share a little about your family background and core values?"
    },
    "Lifestyle": {
      prompt: "Ask a short friendly question under 15 words about their daily routine, diet, or travel preferences.",
      fallbackQuestion: "How do you like to spend a relaxing weekend or vacation?"
    },
    "Partner Expectations": {
      prompt: "Ask a short friendly question under 15 words about what qualities they admire most in a partner.",
      fallbackQuestion: "What key qualities or values are most important to you in a life partner?"
    }
  };

  /**
   * Detects missing or weak profile sections (Step 3)
   */
  static detectMissingSections(profile: Record<string, any>, existingAnswers: Array<{ fieldTarget: string }>): string[] {
    const answeredFields = new Set(existingAnswers.map((a) => a.fieldTarget));
    const missing: string[] = [];

    for (const field of Object.keys(this.WEAK_FIELD_DEFINITIONS)) {
      if (field === "About Me" && profile.aboutMe && profile.aboutMe.length > 30) continue;
      if (field === "Partner Expectations" && profile.partnerPreference && profile.partnerPreference.length > 20) continue;
      
      if (!answeredFields.has(field)) {
        missing.push(field);
      }
    }

    return missing;
  }

  /**
   * Generates next intelligent follow-up question under 15 words (Step 4)
   */
  static generateNextQuestion(
    profile: Record<string, any>,
    existingAnswers: Array<{ questionText: string; fieldTarget: string; answerText: string }>
  ): QuestionResponse {
    const missingFields = this.detectMissingSections(profile, existingAnswers);

    if (missingFields.length === 0) {
      return {
        questionText: "Thank you! All core profile details have been collected successfully.",
        fieldTarget: "COMPLETED",
        isComplete: true,
        totalMissingCount: 0,
        remainingCount: 0,
      };
    }

    const currentTarget = missingFields[0];
    const def = this.WEAK_FIELD_DEFINITIONS[currentTarget];

    // Ensure strictly under 15 words and friendly tone
    let questionText = def ? def.fallbackQuestion : "Could you tell us more about yourself?";

    // Validate word count under 15 words
    const words = questionText.split(/\s+/);
    if (words.length > 15) {
      questionText = words.slice(0, 14).join(" ") + "?";
    }

    return {
      questionText,
      fieldTarget: currentTarget,
      isComplete: false,
      totalMissingCount: missingFields.length + existingAnswers.length,
      remainingCount: missingFields.length,
    };
  }
}
