import validator from 'validator';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  sanitizedContent?: string;
}

// Common offensive/profane keywords list for matrimony safety
const PROFANITY_LIST = [
  'abuse', 'bastard', 'bitch', 'blood', 'cheat', 'damn', 'fake', 'fraud', 'hate',
  'idiot', 'kill', 'loser', 'scam', 'scammer', 'sexy', 'slut', 'stupid', 'whore',
  'chutiya', 'harami', 'kutta', 'kamina', 'saala', 'gandu'
];

export class SecuritySanitizer {
  /**
   * Validates user answer for profile data collection (Step 6)
   */
  static validateUserAnswer(input: string): ValidationResult {
    if (!input || input.trim().length === 0) {
      return { isValid: false, reason: 'Answer cannot be empty.' };
    }

    const trimmed = input.trim();

    // 1. HTML & Script Injection check
    if (/<[^>]*>/g.test(trimmed) || /javascript:/i.test(trimmed)) {
      return { isValid: false, reason: 'HTML tags or JavaScript instructions are not allowed.' };
    }

    // 2. SQL Injection Patterns
    const sqlRegex = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|UNION|EXEC)\b)|('--')|(\/\*)/i;
    if (sqlRegex.test(trimmed)) {
      return { isValid: false, reason: 'SQL statements or dangerous characters are prohibited.' };
    }

    // 3. Phone Number Detection (Indian & International format)
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}|\b\d{10}\b|\b\d{5}[-.\s]?\d{5}\b/;
    if (phoneRegex.test(trimmed)) {
      return { isValid: false, reason: 'Phone numbers or contact digits are not allowed in answers.' };
    }

    // 4. Email Address Detection
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailRegex.test(trimmed)) {
      return { isValid: false, reason: 'Email addresses are not allowed for privacy and safety reasons.' };
    }

    // 5. Social Media Links & Handles
    const socialRegex = /(instagram\.com|facebook\.com|linkedin\.com|twitter\.com|t\.me|wa\.me|snapchat|@[\w_]+)/i;
    if (socialRegex.test(trimmed)) {
      return { isValid: false, reason: 'Social media links or handles are strictly forbidden.' };
    }

    // 6. Profanity & Offensive Language Check
    const lower = trimmed.toLowerCase();
    for (const word of PROFANITY_LIST) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
      if (wordRegex.test(lower)) {
        return { isValid: false, reason: `Inappropriate language detected ("${word}"). Please keep responses respectful.` };
      }
    }

    // 7. Spam / Repeated characters (e.g., "aaaaaaaaaa" or "hhhhhh")
    if (/(.)\1{6,}/.test(trimmed)) {
      return { isValid: false, reason: 'Spam or repetitive characters detected.' };
    }

    // Sanitize string (strip HTML entities)
    const sanitized = validator.escape(trimmed);

    return {
      isValid: true,
      sanitizedContent: trimmed, // keep raw safe text for prompt building
    };
  }

  /**
   * Strips potential PII (Phone numbers, emails, addresses) from text before sending to AI or rendering
   */
  static stripPII(text: string): string {
    return text
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]')
      .replace(/(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}|\b\d{10}\b/g, '[PHONE REDACTED]')
      .replace(/(instagram\.com|facebook\.com|linkedin\.com|t\.me\/[\w_]+)/gi, '[LINK REDACTED]');
  }
}
