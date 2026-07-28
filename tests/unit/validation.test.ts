import { SecuritySanitizer } from '../../src/utils/sanitizers';
import { ValidationEngineService } from '../../src/services/validation.service';

describe('SecuritySanitizer Unit Tests', () => {
  test('should accept valid clean answers', () => {
    const result = SecuritySanitizer.validateUserAnswer('I love hiking, classical music, and cooking for family.');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedContent).toBeDefined();
  });

  test('should reject phone numbers', () => {
    const result = SecuritySanitizer.validateUserAnswer('Call me at 9876543210 for details');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Phone numbers');
  });

  test('should reject email addresses', () => {
    const result = SecuritySanitizer.validateUserAnswer('Contact via john.doe@gmail.com');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Email addresses');
  });

  test('should reject HTML & script tags', () => {
    const result = SecuritySanitizer.validateUserAnswer('<script>alert("hack")</script>');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('HTML tags');
  });

  test('should reject SQL injection keywords', () => {
    const result = SecuritySanitizer.validateUserAnswer("SELECT * FROM users WHERE '1'='1'");
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('SQL statements');
  });

  test('should reject profanity', () => {
    const result = SecuritySanitizer.validateUserAnswer('You bastard');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Inappropriate language');
  });
});

describe('ValidationEngineService Unit Tests', () => {
  test('should parse and validate structured AI output', () => {
    const mockJson = JSON.stringify({
      headline: 'Software Engineer | Passionate Traveler',
      aboutMe: 'I am an ambitious software engineer who loves family values, traveling, reading books, and experiencing new cultures with genuine warmth.',
      partnerExpectations: 'Looking for a caring, educated partner with good family values and positive mindset.',
      shortBio: 'Tech engineer who loves nature and good food.',
      profileSummary: 'Experienced software developer with strong cultural roots.',
      personalitySummary: 'Calm, family-oriented, curious.',
      voiceScript: 'Hi, welcome to my profile! Hope we connect well.'
    });

    const result = ValidationEngineService.validateAiOutput(mockJson);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedOutput.headline).toBe('Software Engineer | Passionate Traveler');
  });
});
