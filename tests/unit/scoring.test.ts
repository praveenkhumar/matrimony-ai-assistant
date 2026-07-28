import { ProfileScorerService } from '../../src/services/scoring.service';

describe('ProfileScorerService Unit Tests', () => {
  test('should calculate high score for comprehensive profile', () => {
    const mockProfile = {
      age: 29,
      gender: 'Male',
      religion: 'Hindu',
      caste: 'Brahmin',
      motherTongue: 'English',
      education: 'M.Tech Computer Science',
      occupation: 'Senior Software Engineer',
      salary: '25 LPA',
      location: 'Bangalore',
      familyDetails: 'Nuclear family, father retired professor, mother homemaker',
    };

    const mockContent = {
      aboutMe: 'I am a passionate technology leader raised with traditional cultural values and high ambitions. I enjoy playing tennis, reading non-fiction, and spending quality weekends with family.',
      partnerPreference: 'Seeking an educated, respectful, and family-oriented life companion for shared journey and mutual growth.',
    };

    const score = ProfileScorerService.calculateScore(mockProfile, mockContent);

    expect(score.completenessScore).toBeGreaterThanOrEqual(90);
    expect(score.professionalismScore).toBeGreaterThanOrEqual(85);
    expect(score.familyValueScore).toBeGreaterThanOrEqual(80);
    expect(score.overallScore).toBeGreaterThanOrEqual(80);
    expect(Array.isArray(score.suggestions)).toBe(true);
  });
});
