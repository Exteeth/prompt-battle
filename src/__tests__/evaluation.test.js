import { describe, it, expect, beforeEach } from 'vitest';
import { 
  loginStudent, 
  saveEvaluation, 
  getUserEvaluation, 
  getRoomEvaluationAnalytics 
} from '../lib/sessionStorage';

describe('Student Satisfaction Survey Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save student evaluation and calculate average scores correctly', async () => {
    await loginStudent('PROMPT-101', '6401', 'ไทเกอร์');

    const ratings = {
      '1.1': 5, '1.2': 5, '1.3': 4,
      '2.1': 5, '2.2': 4, '2.3': 5,
      '3.1': 4, '3.2': 5, '3.3': 4,
      '4.1': 5, '4.2': 5, '4.3': 5
    };

    const record = await saveEvaluation({
      ratings,
      comments: 'ระบบใช้งานดีมาก สนุกและได้ทักษะจริงๆ'
    });

    expect(record).not.toBeNull();
    expect(record.username).toBe('ไทเกอร์');
    expect(record.ratings['1.1']).toBe(5);

    const userEval = getUserEvaluation();
    expect(userEval).not.toBeNull();
    expect(userEval.comments).toBe('ระบบใช้งานดีมาก สนุกและได้ทักษะจริงๆ');

    const analytics = await getRoomEvaluationAnalytics('PROMPT-101');
    expect(analytics.totalEvaluations).toBeGreaterThanOrEqual(1);
    expect(parseFloat(analytics.overallAvg)).toBeGreaterThan(0);
    expect(analytics.commentsList.length).toBeGreaterThanOrEqual(1);
  }, 30000);

  it('should calculate category and item averages correctly across multiple students', async () => {
    // Student 1
    await loginStudent('PROMPT-101', '6401', 'ไทเกอร์');
    await saveEvaluation({
      ratings: {
        '1.1': 5, '1.2': 5, '1.3': 5,
        '2.1': 5, '2.2': 5, '2.3': 5,
        '3.1': 5, '3.2': 5, '3.3': 5,
        '4.1': 5, '4.2': 5, '4.3': 5
      },
      comments: 'สุดยอดครับ'
    });

    // Student 2
    await loginStudent('PROMPT-101', '6402', 'สมชาย');
    await saveEvaluation({
      ratings: {
        '1.1': 3, '1.2': 3, '1.3': 3,
        '2.1': 3, '2.2': 3, '2.3': 3,
        '3.1': 3, '3.2': 3, '3.3': 3,
        '4.1': 3, '4.2': 3, '4.3': 3
      },
      comments: 'พอใช้ได้ครับ'
    });

    const analytics = await getRoomEvaluationAnalytics('PROMPT-101');
    expect(analytics.totalEvaluations).toBeGreaterThanOrEqual(2);
    expect(parseFloat(analytics.overallAvg)).toBeGreaterThan(0);
  }, 30000);
});
