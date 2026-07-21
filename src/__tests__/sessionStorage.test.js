import { describe, it, expect, beforeEach } from 'vitest';
import { 
  loginStudent, 
  loginTeacher, 
  getCurrentUser, 
  logout, 
  saveAttempt, 
  getLeaderboard, 
  getStudentDetailedScores,
  getUserAchievements
} from '../lib/sessionStorage';

describe('Session Storage & Auth Logic Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should login student with valid room code, student ID, and username', () => {
    const session = loginStudent('PROMPT-101', '6401', 'ไทเกอร์');
    expect(session.studentId).toBe('6401');
    expect(session.username).toBe('ไทเกอร์');
    expect(session.roomCode).toBe('PROMPT-101');
    expect(session.userId).toBe('usr_PROMPT-101_6401');
    expect(session.role).toBe('student');

    const currentUser = getCurrentUser();
    expect(currentUser).not.toBeNull();
    expect(currentUser.username).toBe('ไทเกอร์');
  });

  it('should calculate unlocked user achievements correctly', () => {
    loginStudent('PROMPT-101', '6401', 'ไทเกอร์');

    saveAttempt({
      stageId: 1,
      stageNumber: '0.1',
      promptText: 'ทดสอบเขียน Prompt ให้ครบ 5 องค์ประกอบ',
      aiOutput: 'ตอบกลับ AI...',
      scores: { clarity: 5, completeness: 5, technique: 4, quality: 4 },
      feedback: { what_worked: 'เยี่ยมมาก' },
      totalScore: 18
    });

    const achievements = getUserAchievements();
    const pioneerBadge = achievements.find(a => a.id === 'pioneer');
    const highscoreBadge = achievements.find(a => a.id === 'highscore');

    expect(pioneerBadge.unlocked).toBe(true);
    expect(highscoreBadge.unlocked).toBe(true);
  });

  it('should restore existing attempts when logging in again with same student ID', () => {
    // 1st Login & Save attempt
    loginStudent('PROMPT-101', '6401', 'ไทเกอร์');
    saveAttempt({
      stageId: 1,
      stageNumber: '0.1',
      promptText: 'ทดสอบการเขียน Prompt',
      aiOutput: 'ตอบกลับ AI...',
      scores: { clarity: 4, completeness: 4, technique: 4, quality: 4 },
      feedback: { what_worked: 'ดีมาก' },
      totalScore: 16
    });

    // Logout & Login again with same student ID
    logout();
    const session2 = loginStudent('PROMPT-101', '6401', 'ไทเกอร์');
    expect(session2.userId).toBe('usr_PROMPT-101_6401');

    const detailed = getStudentDetailedScores('PROMPT-101');
    expect(detailed.length).toBe(1);
    expect(detailed[0].totalPoints).toBe(16);
  });

  it('should throw error for invalid room code', () => {
    expect(() => loginStudent('INVALID-ROOM', '6401', 'ไทเกอร์')).toThrow();
  });

  it('should throw error for missing student ID', () => {
    expect(() => loginStudent('PROMPT-101', '', 'ไทเกอร์')).toThrow('กรุณากรอกรหัสนักเรียน/เลขประจำตัว');
  });

  it('should login teacher with correct PIN 1234', () => {
    const session = loginTeacher('PROMPT-101', '1234');
    expect(session.role).toBe('teacher');
    expect(session.username).toBe('คุณครูผู้สอน');
  });

  it('should throw error for incorrect teacher PIN', () => {
    expect(() => loginTeacher('PROMPT-101', '9999')).toThrow('รหัส PIN ของครูไม่ถูกต้อง');
  });

  it('should logout correctly', () => {
    loginStudent('PROMPT-101', '6401', 'ไทเกอร์');
    logout();
    expect(getCurrentUser()).toBeNull();
  });
});
