document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentProfile = null;
  let currentSessionId = null;
  let currentFieldTarget = null;
  let currentQuestionText = null;
  let generatedResult = null;
  let activeTone = 'Standard';

  // UI Elements
  const profileFieldsGrid = document.getElementById('profileFieldsGrid');
  const missingSectionsContainer = document.getElementById('missingSectionsContainer');
  const currentQuestionBubble = document.getElementById('currentQuestionBubble');
  const answerInput = document.getElementById('answerInput');
  const sendAnswerBtn = document.getElementById('sendAnswerBtn');
  const validationFeedback = document.getElementById('validationFeedback');
  const triggerGenerateBtn = document.getElementById('triggerGenerateBtn');

  // Preview elements
  const prevHeadline = document.getElementById('prevHeadline');
  const prevAboutMe = document.getElementById('prevAboutMe');
  const prevPartner = document.getElementById('prevPartner');
  const prevShortBio = document.getElementById('prevShortBio');
  const prevPersonality = document.getElementById('prevPersonality');
  const prevVoiceScript = document.getElementById('prevVoiceScript');
  const suggestionsList = document.getElementById('suggestionsList');
  const regenerateBtn = document.getElementById('regenerateBtn');
  const acceptSaveBtn = document.getElementById('acceptSaveBtn');

  // Init
  fetchProfileState();
  fetchNextQuestion();

  // 1. Fetch existing profile fields (Step 2)
  async function fetchProfileState() {
    try {
      const res = await fetch('/api/v1/profile');
      const json = await res.json();
      if (json.success) {
        currentProfile = json.data;
        renderProfileFields(currentProfile);
      }
    } catch (e) {
      console.error('Error fetching profile state:', e);
    }
  }

  function renderProfileFields(p) {
    profileFieldsGrid.innerHTML = `
      <div class="field-chip"><label>Age & Gender</label>${p.age || 28} Yrs, ${p.gender || 'Male'}</div>
      <div class="field-chip"><label>Religion & Caste</label>${p.religion || 'Hindu'}, ${p.caste || 'Brahmin'}</div>
      <div class="field-chip"><label>Mother Tongue</label>${p.motherTongue || 'English'}</div>
      <div class="field-chip"><label>Education</label>${p.education || 'B.Tech CS'}</div>
      <div class="field-chip"><label>Occupation</label>${p.occupation || 'Software Engineer'}</div>
      <div class="field-chip"><label>Location</label>${p.location || 'Bangalore, India'}</div>
    `;
  }

  // 2. Fetch AI Question & Detect Weak Sections (Step 3 & 4)
  async function fetchNextQuestion() {
    try {
      const res = await fetch('/api/v1/profile/questions', { method: 'POST' });
      const json = await res.json();

      if (json.success) {
        const q = json.data;
        currentSessionId = q.sessionId;
        currentFieldTarget = q.fieldTarget;
        currentQuestionText = q.questionText;

        currentQuestionBubble.innerText = q.questionText;

        if (q.isComplete) {
          missingSectionsContainer.innerHTML = `<span class="missing-badge" style="color:#10b981; border-color:#10b981; background:rgba(16,185,129,0.15)">✓ All sections completed! Ready for AI generation.</span>`;
          answerInput.disabled = true;
          sendAnswerBtn.disabled = true;
        } else {
          missingSectionsContainer.innerHTML = `<span class="missing-badge">Missing: ${q.fieldTarget} (${q.remainingCount} remaining)</span>`;
          answerInput.disabled = false;
          sendAnswerBtn.disabled = false;
        }
      }
    } catch (e) {
      console.error('Error fetching question:', e);
    }
  }

  // 3. Submit Answer & Validate Security (Step 5 & 6)
  sendAnswerBtn.addEventListener('click', async () => {
    const text = answerInput.value.trim();
    if (!text) return;

    validationFeedback.innerText = 'Validating answer...';
    validationFeedback.className = 'feedback-msg';

    try {
      const res = await fetch('/api/v1/profile/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          questionText: currentQuestionText,
          fieldTarget: currentFieldTarget,
          answerText: text,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        // Step 6 Security Rejection Feedback
        validationFeedback.innerText = `⛔ Rejected: ${json.error}`;
        validationFeedback.className = 'feedback-msg error';
      } else {
        validationFeedback.innerText = '✓ Answer accepted and saved!';
        validationFeedback.className = 'feedback-msg success';
        answerInput.value = '';
        setTimeout(() => {
          validationFeedback.innerText = '';
          fetchNextQuestion();
        }, 1200);
      }
    } catch (e) {
      console.error('Error submitting answer:', e);
    }
  });

  // 4. Trigger AI Generation (Step 7 - 10)
  triggerGenerateBtn.addEventListener('click', () => runGeneration(activeTone));

  async function runGeneration(tone) {
    triggerGenerateBtn.innerText = '✨ Calling Claude Messages API...';
    triggerGenerateBtn.disabled = true;

    try {
      const res = await fetch('/api/v1/profile/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedTone: tone }),
      });

      const json = await res.json();

      if (json.success) {
        generatedResult = json.data;
        renderGeneratedPreview(generatedResult);
      }
    } catch (e) {
      console.error('Error generating profile:', e);
    } finally {
      triggerGenerateBtn.innerText = '✨ Generate AI Matrimonial Profile (Step 7-10)';
      triggerGenerateBtn.disabled = false;
    }
  }

  function renderGeneratedPreview(data) {
    const content = data.generatedContent;
    const scores = data.scores;

    prevHeadline.value = content.headline || '';
    prevAboutMe.value = content.aboutMe || '';
    prevPartner.value = content.partnerExpectations || '';
    prevShortBio.value = content.shortBio || '';
    prevPersonality.value = content.personalitySummary || '';
    prevVoiceScript.innerText = data.toneVariations?.voiceScript || content.voiceScript || '';

    // Update scores
    document.getElementById('overallScoreVal').innerText = scores.overallScore;
    document.getElementById('compScoreVal').innerText = scores.completenessScore + '%';
    document.getElementById('readScoreVal').innerText = scores.readabilityScore + '%';
    document.getElementById('profScoreVal').innerText = scores.professionalismScore + '%';
    document.getElementById('famScoreVal').innerText = scores.familyValueScore + '%';

    // Render suggestions
    suggestionsList.innerHTML = scores.suggestions.map((s) => `<li>${s}</li>`).join('');
  }

  // 5. Tone variation buttons
  document.querySelectorAll('.tone-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tone-btn').forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
      activeTone = e.target.getAttribute('data-tone');
      runGeneration(activeTone);
    });
  });

  // 6. Regenerate button connected to POST /api/v1/profile/regenerate
  regenerateBtn.addEventListener('click', async () => {
    regenerateBtn.innerText = '🔄 Regenerating...';
    regenerateBtn.disabled = true;

    try {
      const res = await fetch('/api/v1/profile/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone: activeTone }),
      });

      const json = await res.json();

      if (json.success) {
        generatedResult = json.data;
        renderGeneratedPreview(generatedResult);
        regenerateBtn.innerText = '✓ Regenerated!';
        setTimeout(() => {
          regenerateBtn.innerText = '🔄 Regenerate';
        }, 1500);
      } else {
        alert(`Regeneration Error: ${json.error}`);
      }
    } catch (e) {
      console.error('Error regenerating profile:', e);
    } finally {
      regenerateBtn.disabled = false;
    }
  });

  // 7. Accept & Save to DB (Step 11 & 12)
  acceptSaveBtn.addEventListener('click', async () => {
    acceptSaveBtn.innerText = '💾 Saving to Database...';
    acceptSaveBtn.disabled = true;

    try {
      const res = await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: prevHeadline.value,
          aboutMe: prevAboutMe.value,
          partnerPreference: prevPartner.value,
          shortBio: prevShortBio.value,
          personalitySummary: prevPersonality.value,
          voiceScript: prevVoiceScript.innerText,
          scores: generatedResult ? generatedResult.scores : null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert('🎉 Profile successfully saved to database! (Step 12 Completed)');
      }
    } catch (e) {
      console.error('Error saving profile:', e);
    } finally {
      acceptSaveBtn.innerText = '💾 Accept & Save to Database (Step 12)';
      acceptSaveBtn.disabled = false;
    }
  });
});
