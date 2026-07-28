export interface ProfileScoreBreakdown {
  completenessScore: number;
  readabilityScore: number;
  professionalismScore: number;
  familyValueScore: number;
  overallScore: number;
  suggestions: string[];
}

export class ProfileScorerService {
  /**
   * Calculates comprehensive multi-metric Matrimony Profile Scores
   */
  static calculateScore(profile: Record<string, any>, generatedContent?: any): ProfileScoreBreakdown {
    const suggestions: string[] = [];

    // 1. Profile Completeness Score (0 - 100)
    let completeness = 0;
    const coreFields = [
      'age', 'gender', 'religion', 'caste', 'motherTongue', 
      'education', 'occupation', 'salary', 'location', 'familyDetails'
    ];
    let filledCore = 0;
    for (const f of coreFields) {
      if (profile[f] && String(profile[f]).trim().length > 0) filledCore++;
    }
    completeness += Math.round((filledCore / coreFields.length) * 60);

    const aboutText = generatedContent?.aboutMe || profile.aboutMe || '';
    const partnerText = generatedContent?.partnerPreference || profile.partnerPreference || '';

    if (aboutText.length > 50) completeness += 20;
    else suggestions.push('Add a detailed "About Me" section (60+ words) to boost completeness score.');

    if (partnerText.length > 30) completeness += 20;
    else suggestions.push('Specify partner preferences clearly to improve profile completeness.');

    // 2. Readability Score (Adapted Flesch Reading Ease for Matrimony)
    let readability = 85; // baseline clear text
    if (aboutText.length > 0) {
      const sentences = aboutText.split(/[.!?]+/).filter(Boolean).length || 1;
      const words = aboutText.split(/\s+/).filter(Boolean).length || 1;
      const avgSentenceLength = words / sentences;

      if (avgSentenceLength > 22) {
        readability -= 15;
        suggestions.push('Shorten long sentences in your About Me description for better readability.');
      } else if (avgSentenceLength >= 10 && avgSentenceLength <= 18) {
        readability += 10;
      }
    }
    readability = Math.min(100, Math.max(40, readability));

    // 3. Professionalism Score
    let professionalism = 70;
    if (profile.education) professionalism += 10;
    if (profile.occupation) professionalism += 10;
    if (profile.salary) professionalism += 10;
    if (/\b(engineer|doctor|manager|lead|architect|consultant|officer|analyst|founder|executive|ca|advocate)\b/i.test(profile.occupation || '')) {
      professionalism += 5;
    }
    professionalism = Math.min(100, professionalism);

    // 4. Family Value Score
    let familyValue = 65;
    const combined = `${profile.familyDetails || ''} ${aboutText} ${partnerText}`.toLowerCase();
    if (/\b(family|parents|tradition|respect|joint|nuclear|values|blessings|culture)\b/.test(combined)) {
      familyValue += 25;
    } else {
      suggestions.push('Mention your family background or shared family values to attract family-oriented matches.');
    }
    familyValue = Math.min(100, familyValue);

    // 5. Overall Weighted Index Score
    const overallScore = Math.round(
      completeness * 0.35 +
      readability * 0.20 +
      professionalism * 0.25 +
      familyValue * 0.20
    );

    if (suggestions.length === 0) {
      suggestions.push('Your profile looks outstanding! Ready to attract quality matches.');
    }

    return {
      completenessScore: completeness,
      readabilityScore: readability,
      professionalismScore: professionalism,
      familyValueScore: familyValue,
      overallScore,
      suggestions,
    };
  }
}
