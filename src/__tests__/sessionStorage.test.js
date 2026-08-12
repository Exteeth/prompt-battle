import { describe, it, expect, beforeEach } from 'vitest';
import { 
  loginStudent, 
  loginTeacher, 
  getCurrentUser, 
  logout, 
  saveAttempt, 
  getLeaderboard, 
  getStudentDetailedScores,
  getUserAchievements,
  getAllRooms,
  createRoom,
  deleteRoom
} from '../lib/sessionStorage';

describe('Session Storage & Auth Logic Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should login student with valid room code, student ID, and username', async () => {
    const session = await loginStudent('PROMPT-101', '6401', 'ไทเกอร์');
    expect(session.studentId).toBe('6401');
    expect(session.username).toBe('ไทเกอร์');
    expect(session.roomCode).toBe('PROMPT-101');
    expect(session.userId).toBe('usr_PROMPT-101_6401');
    expect(session.role).toBe('student');

    const currentUser = getCurrentUser();
    expect(currentUser).not.toBeNull();
    expect(currentUser.username).toBe('ไทเกอร์');
  });

  it('should calculate unlocked user achievements correctly', async () => {
    await loginStudent('PROMPT-101', '6401', 'ไทเกอร์');

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

  it('should restore existing attempts when logging in again with same student ID', async () => {
    const studentId = `6401-${Date.now()}`;
    // 1st Login & Save attempt
    await loginStudent('PROMPT-101', studentId, 'ไทเกอร์');
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
    const session2 = await loginStudent('PROMPT-101', studentId, 'ไทเกอร์');
    expect(session2.userId).toBe(`usr_PROMPT-101_${studentId}`);

    const detailed = getStudentDetailedScores('PROMPT-101');
    const myScore = detailed.find(d => d.studentId === studentId);
    expect(myScore).toBeDefined();
    expect(myScore.totalPoints).toBe(16);
  }, 30000);

  it('should throw error for invalid room code', async () => {
    await expect(loginStudent('INVALID-ROOM', '6401', 'ไทเกอร์')).rejects.toThrow();
  });

  it('should throw error for missing student ID', async () => {
    await expect(loginStudent('PROMPT-101', '', 'ไทเกอร์')).rejects.toThrow('กรุณากรอกรหัสนักเรียน/เลขประจำตัว');
  });

  it('should login teacher with correct PIN 1234', async () => {
    const session = await loginTeacher('PROMPT-101', '1234');
    expect(session.role).toBe('teacher');
    expect(session.username).toBe('คุณครูผู้สอน');
  });

  it('should throw error for incorrect teacher PIN', async () => {
    await expect(loginTeacher('PROMPT-101', '9999')).rejects.toThrow('รหัส PIN ของครูไม่ถูกต้อง');
  });

  it('should logout correctly', async () => {
    await loginStudent('PROMPT-101', '6401', 'ไทเกอร์');
    logout();
    expect(getCurrentUser()).toBeNull();
  });

  it('should create new room and allow students/teachers to log in with new room code', async () => {
    const newRoom = await createRoom('PROMPT-102', 'ห้องเรียนวิชา AI ม.2/2', '5678');
    expect(newRoom.code).toBe('PROMPT-102');
    expect(newRoom.name).toBe('ห้องเรียนวิชา AI ม.2/2');

    const rooms = getAllRooms();
    expect(rooms.some(r => r.code === 'PROMPT-102')).toBe(true);

    // Login teacher with new PIN
    const teacherSession = await loginTeacher('PROMPT-102', '5678');
    expect(teacherSession.roomCode).toBe('PROMPT-102');

    // Login student in new room
    const studentSession = await loginStudent('PROMPT-102', '9901', 'สมชาย');
    expect(studentSession.roomCode).toBe('PROMPT-102');
  }, 30000);

  it('should throw error when creating room with duplicate code', async () => {
    await expect(createRoom('PROMPT-101', 'ห้องซ้ำ', '1234')).rejects.toThrow('รหัสห้องเรียน "PROMPT-101" มีอยู่ในระบบแล้ว');
  });

  it('should delete existing room correctly', async () => {
    await createRoom('PROMPT-DEL', 'ห้องสำหรับทดสอบลบ', '1234');
    expect(getAllRooms().some(r => r.code === 'PROMPT-DEL')).toBe(true);

    await deleteRoom('PROMPT-DEL');
    expect(getAllRooms().some(r => r.code === 'PROMPT-DEL')).toBe(false);
  });

  it('should throw error when deleting last remaining room', async () => {
    await expect(deleteRoom('PROMPT-101')).rejects.toThrow('ไม่สามารถลบห้องเรียนสุดท้ายได้');
  });
});