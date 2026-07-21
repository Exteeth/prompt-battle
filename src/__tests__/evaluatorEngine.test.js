import { describe, it, expect } from 'vitest';
import { evaluatePrompt } from '../lib/evaluatorEngine';
import { STAGES_DATA } from '../data/stagesData';

describe('Evaluator Engine Unit Tests', () => {
  it('should score high for complete prompt matching criteria', async () => {
    const stage = STAGES_DATA[0]; // Stage 0.1
    const promptText = 'คุณคือคุณครูวิทยาศาสตร์ใจดี ช่วยอธิบายเรื่องภาวะโลกร้อนให้เด็กประถมวัย 10 ขวบฟังอย่างเข้าใจง่ายๆ สนุกสนาน';

    const result = await evaluatePrompt({
      promptText,
      stage,
      previousAttemptsCount: 0
    });

    expect(result.totalScore).toBeGreaterThanOrEqual(12);
    expect(result.scores.clarity).toBeGreaterThanOrEqual(3);
    expect(result.feedback.what_worked).toBeDefined();
  });

  it('should penalize very short or incomplete prompt', async () => {
    const stage = STAGES_DATA[0]; // Stage 0.1
    const promptText = 'สรุปโลกร้อนให้หน่อย';

    const result = await evaluatePrompt({
      promptText,
      stage,
      previousAttemptsCount: 0
    });

    expect(result.totalScore).toBeLessThan(14);
    expect(result.feedback.what_missing).toBeDefined();
  });
});
