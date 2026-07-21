// 💾 LOCAL & SUPABASE SESSION & DATA STORAGE MANAGEMENT
// Supports offline-first Kahoot-style room codes and instant session storage

const SESSION_KEY = 'prompt_battle_session';
const ATTEMPTS_KEY = 'prompt_battle_attempts';
const ROOMS_KEY = 'prompt_battle_rooms';

// Initialize default room data
export function initDefaultData() {
  const existingRooms = localStorage.getItem(ROOMS_KEY);
  if (!existingRooms) {
    const defaultRooms = [
      { code: 'PROMPT-101', name: 'ห้องเรียนวิชา AI & Prompt Engineering (Demo)', teacher_pin: '1234' }
    ];
    localStorage.setItem(ROOMS_KEY, JSON.stringify(defaultRooms));
  }
}

// ----------------------------------------------------
// 1. AUTH & SESSION MANAGEMENT
// ----------------------------------------------------
export function loginStudent(roomCode, username) {
  initDefaultData();
  const rooms = JSON.parse(localStorage.getItem(ROOMS_KEY) || '[]');
  const room = rooms.find(r => r.code.toUpperCase() === roomCode.trim().toUpperCase());

  if (!room) {
    throw new Error(`ไม่พบรหัสห้องเรียน "${roomCode}" กรุณาตรวจสอบรหัสห้องอีกครั้ง`);
  }

  if (!username || username.trim().length < 2) {
    throw new Error('กรุณากรอกชื่อเล่นอย่างน้อย 2 ตัวอักษร');
  }

  const session = {
    userId: 'usr_' + Math.random().toString(36).substr(2, 9),
    username: username.trim(),
    roomCode: room.code,
    roomName: room.name,
    role: 'student',
    loginAt: new Date().toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function loginTeacher(roomCode, pin) {
  initDefaultData();
  const rooms = JSON.parse(localStorage.getItem(ROOMS_KEY) || '[]');
  const room = rooms.find(r => r.code.toUpperCase() === roomCode.trim().toUpperCase());

  if (!room) {
    throw new Error(`ไม่พบรหัสห้องเรียน "${roomCode}"`);
  }

  if (room.teacher_pin !== pin.trim()) {
    throw new Error('รหัส PIN ของครูไม่ถูกต้อง');
  }

  const session = {
    userId: 'teacher_' + Math.random().toString(36).substr(2, 9),
    username: 'คุณครูผู้สอน',
    roomCode: room.code,
    roomName: room.name,
    role: 'teacher',
    loginAt: new Date().toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getCurrentUser() {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// ----------------------------------------------------
// 2. ATTEMPTS & PROGRESS MANAGEMENT
// ----------------------------------------------------
export function saveAttempt({ stageId, stageNumber, promptText, aiOutput, scores, feedback, totalScore }) {
  const user = getCurrentUser();
  if (!user) return null;

  const allAttempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  
  // Calculate current attempt number for this stage
  const userStageAttempts = allAttempts.filter(a => a.userId === user.userId && a.stageId === stageId);
  const attemptNumber = userStageAttempts.length + 1;

  const newAttempt = {
    id: 'att_' + Math.random().toString(36).substr(2, 9),
    roomCode: user.roomCode,
    userId: user.userId,
    username: user.username,
    stageId,
    stageNumber,
    attemptNumber,
    promptText,
    aiOutput,
    scores,
    feedback,
    totalScore,
    createdAt: new Date().toISOString()
  };

  allAttempts.push(newAttempt);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(allAttempts));
  return newAttempt;
}

export function getUserStageAttempts(stageId) {
  const user = getCurrentUser();
  if (!user) return [];
  const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  return all.filter(a => a.userId === user.userId && a.stageId === stageId);
}

export function getAllUserAttempts() {
  const user = getCurrentUser();
  if (!user) return [];
  const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  return all.filter(a => a.userId === user.userId);
}

// ----------------------------------------------------
// 3. LEADERBOARD & TEACHER ANALYTICS
// ----------------------------------------------------
export function getLeaderboard(roomCode) {
  const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  const roomAttempts = all.filter(a => a.roomCode === roomCode);

  // Group by user
  const userMap = {};
  roomAttempts.forEach(att => {
    if (!userMap[att.userId]) {
      userMap[att.userId] = {
        userId: att.userId,
        username: att.username,
        stages: {},
        totalPoints: 0
      };
    }

    // Keep highest score for each stage
    if (!userMap[att.userId].stages[att.stageId] || att.totalScore > userMap[att.userId].stages[att.stageId]) {
      userMap[att.userId].stages[att.stageId] = att.totalScore;
    }
  });

  // Calculate total points
  const leaderboard = Object.values(userMap).map(u => {
    const stageScores = Object.values(u.stages);
    const totalPoints = stageScores.reduce((sum, score) => sum + score, 0);
    return {
      userId: u.userId,
      username: u.username,
      stagesCompleted: stageScores.length,
      totalPoints
    };
  });

  return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
}

export function getTeacherAnalytics(roomCode) {
  const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  const roomAttempts = all.filter(a => a.roomCode === roomCode);

  const stageMap = {};
  roomAttempts.forEach(att => {
    if (!stageMap[att.stageId]) {
      stageMap[att.stageId] = {
        stageId: att.stageId,
        stageNumber: att.stageNumber,
        count: 0,
        claritySum: 0,
        completenessSum: 0,
        techniqueSum: 0,
        qualitySum: 0,
        totalScoreSum: 0,
        students: new Set()
      };
    }

    const s = stageMap[att.stageId];
    s.count += 1;
    s.claritySum += att.scores.clarity;
    s.completenessSum += att.scores.completeness;
    s.techniqueSum += att.scores.technique;
    s.qualitySum += att.scores.quality;
    s.totalScoreSum += att.totalScore;
    s.students.add(att.userId);
  });

  return Object.values(stageMap).map(s => ({
    stageId: s.stageId,
    stageNumber: s.stageNumber,
    studentCount: s.students.size,
    avgClarity: (s.claritySum / s.count).toFixed(1),
    avgCompleteness: (s.completenessSum / s.count).toFixed(1),
    avgTechnique: (s.techniqueSum / s.count).toFixed(1),
    avgQuality: (s.qualitySum / s.count).toFixed(1),
    avgTotalScore: (s.totalScoreSum / s.count).toFixed(1)
  }));
}
