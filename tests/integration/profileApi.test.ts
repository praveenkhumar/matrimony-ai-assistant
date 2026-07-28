import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();
jest.setTimeout(15000);

describe('Matrimony Profile REST API Integration Tests', () => {
  let sessionId: string;
  let questionText: string;
  let fieldTarget: string;

  test('GET /health should return 200 UP status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('POST /api/v1/profile/questions should fetch next AI question', async () => {
    const res = await request(app)
      .post('/api/v1/profile/questions')
      .set('Authorization', 'Bearer mock_token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sessionId).toBeDefined();
    expect(res.body.data.questionText).toBeDefined();

    sessionId = res.body.data.sessionId;
    questionText = res.body.data.questionText;
    fieldTarget = res.body.data.fieldTarget;
  });

  test('POST /api/v1/profile/answer should reject PII / phone number', async () => {
    const res = await request(app)
      .post('/api/v1/profile/answer')
      .set('Authorization', 'Bearer mock_token')
      .send({
        sessionId,
        questionText,
        fieldTarget,
        answerText: 'Call me at 9876543210 for details',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Phone numbers');
  });

  test('POST /api/v1/profile/answer should accept valid answer', async () => {
    const res = await request(app)
      .post('/api/v1/profile/answer')
      .set('Authorization', 'Bearer mock_token')
      .send({
        sessionId,
        questionText,
        fieldTarget,
        answerText: 'I love playing badminton and reading classical books on weekends.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/v1/profile/generate should return generated AI profile content and scores', async () => {
    const res = await request(app)
      .post('/api/v1/profile/generate')
      .set('Authorization', 'Bearer mock_token')
      .send({ requestedTone: 'Standard' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.generatedContent.headline).toBeDefined();
    expect(res.body.data.scores.overallScore).toBeGreaterThan(0);
  });

  test('POST /api/v1/profile/regenerate should regenerate profile with specified tone', async () => {
    const res = await request(app)
      .post('/api/v1/profile/regenerate')
      .set('Authorization', 'Bearer mock_token')
      .send({ tone: 'Formal' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.generatedContent.headline).toContain('Senior Software Architect');
  });
});
