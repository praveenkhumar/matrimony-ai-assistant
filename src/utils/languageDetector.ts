export type SupportedLanguage = 'English' | 'Tamil' | 'Hindi' | 'Telugu' | 'Malayalam' | 'Kannada';

export class LanguageDetector {
  /**
   * Auto-detect language based on Unicode script ranges or mother tongue field
   */
  static detectLanguage(text: string, motherTongue?: string): SupportedLanguage {
    if (!text && motherTongue) {
      const mtLower = motherTongue.toLowerCase();
      if (mtLower.includes('tamil')) return 'Tamil';
      if (mtLower.includes('hindi')) return 'Hindi';
      if (mtLower.includes('telugu')) return 'Telugu';
      if (mtLower.includes('malayalam')) return 'Malayalam';
      if (mtLower.includes('kannada')) return 'Kannada';
    }

    // Unicode Range Checks
    if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil';
    if (/[\u0900-\u097F]/.test(text)) return 'Hindi';
    if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu';
    if (/[\u0D00-\u0D7F]/.test(text)) return 'Malayalam';
    if (/[\u0C80-\u0CFF]/.test(text)) return 'Kannada';

    return 'English';
  }

  /**
   * Returns localized prompt instruction snippet
   */
  static getLanguageInstruction(lang: SupportedLanguage): string {
    switch (lang) {
      case 'Tamil':
        return 'OUTPUT LANGUAGE REQUIREMENT: Produce the final JSON values in clear, respectful Tamil (தமிழ்) script mixed with familiar cultural terms.';
      case 'Hindi':
        return 'OUTPUT LANGUAGE REQUIREMENT: Produce the final JSON values in polite, warm Hindi (हिंदी) script.';
      case 'Telugu':
        return 'OUTPUT LANGUAGE REQUIREMENT: Produce the final JSON values in formal, friendly Telugu (తెలుగు) script.';
      case 'Malayalam':
        return 'OUTPUT LANGUAGE REQUIREMENT: Produce the final JSON values in authentic Malayalam (മലയാളം) script.';
      case 'Kannada':
        return 'OUTPUT LANGUAGE REQUIREMENT: Produce the final JSON values in gracious Kannada (கன்னட / ಕನ್ನಡ) script.';
      default:
        return 'OUTPUT LANGUAGE REQUIREMENT: Produce the final JSON values in elegant, polished English standard for matrimony profiles.';
    }
  }
}
