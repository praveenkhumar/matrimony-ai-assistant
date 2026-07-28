import { SecuritySanitizer } from '../utils/sanitizers.js';

export interface OutputValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedOutput?: any;
}

export class ValidationEngineService {
  /**
   * Validates Claude AI output structure and content safety (Step 10)
   */
  static validateAiOutput(rawOutput: string): OutputValidationResult {
    const errors: string[] = [];

    let parsed: any;
    try {
      // Strip potential markdown ```json blocks if present
      let cleanJsonStr = rawOutput.trim();
      if (cleanJsonStr.startsWith('```json')) {
        cleanJsonStr = cleanJsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanJsonStr.startsWith('```')) {
        cleanJsonStr = cleanJsonStr.replace(/^```/, '').replace(/```$/, '').trim();
      }
      parsed = JSON.parse(cleanJsonStr);
    } catch (e: any) {
      return {
        isValid: false,
        errors: [`Invalid JSON output format returned by AI: ${e.message}`],
      };
    }

    // Required fields check
    const requiredKeys = ['headline', 'aboutMe', 'partnerExpectations', 'shortBio', 'profileSummary', 'personalitySummary'];
    for (const key of requiredKeys) {
      if (!parsed[key] || typeof parsed[key] !== 'string') {
        errors.push(`Missing or non-string required key: '${key}'`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // 1. Length & Word Count Validation
    if (parsed.headline.length < 10 || parsed.headline.length > 150) {
      errors.push('Headline length should be between 10 and 150 characters.');
    }

    const aboutMeWords = parsed.aboutMe.trim().split(/\s+/).length;
    if (aboutMeWords < 15 || aboutMeWords > 250) {
      errors.push(`About Me word count (${aboutMeWords}) is out of bounds (15 - 250 words required).`);
    }

    // 2. Duplicate content check across sections
    if (parsed.headline === parsed.shortBio || parsed.aboutMe === parsed.partnerExpectations) {
      errors.push('Duplicate content detected across distinct profile sections.');
    }

    // 3. PII & Contact Information Leakage check
    const fullCombinedText = Object.values(parsed).join(' ');
    const sanitizedText = SecuritySanitizer.stripPII(fullCombinedText);

    if (fullCombinedText !== sanitizedText) {
      errors.push('Potential PII (Phone number or email) detected in generated AI response.');
      // Auto redact
      parsed.headline = SecuritySanitizer.stripPII(parsed.headline);
      parsed.aboutMe = SecuritySanitizer.stripPII(parsed.aboutMe);
      parsed.partnerExpectations = SecuritySanitizer.stripPII(parsed.partnerExpectations);
    }

    // 4. Inappropriate / Offensive word check
    const securityCheck = SecuritySanitizer.validateUserAnswer(fullCombinedText);
    if (!securityCheck.isValid) {
      errors.push(`AI Output failed safety verification: ${securityCheck.reason}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedOutput: parsed,
    };
  }
}
