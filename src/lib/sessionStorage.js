// 💾 LOCAL & SUPABASE SESSION & DATA STORAGE MANAGEMENT
// Supports offline-first Kahoot-style room codes with Student ID persistent session restoration

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
export function loginStudent(roomCode, studentId, username) {
  initDefaultData();
  const rooms = JSON.parse(localStorage.getItem(ROOMS_KEY) || '[]');
  const room = rooms.find(r => r.code.toUpperCase() === roomCode.trim().toUpperCase());

  if (!room) {
    throw new Error(`ไม่พบรหัสห้องเรียน "${roomCode}" กรุณาตรวจสอบรหัสห้องอีกครั้ง`);
  }

  if (!studentId || studentId.trim().length === 0) {
    throw new Error('กรุณากรอกรหัสนักเรียน/เลขประจำตัว');
  }

  if (!username || username.trim().length < 2) {
    throw new Error('กรุณากรอกชื่อเล่นอย่างน้อย 2 ตัวอักษร');
  }

  const cleanStudentId = studentId.trim().toUpperCase();
  const userId = `usr_${room.code}_${cleanStudentId}`;

  const session = {
    userId,
    studentId: cleanStudentId,
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
    studentId: user.studentId || '',
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
// 3. LEADERBOARD & TEACHER ANALYTICS & ACHIEVEMENTS
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
        studentId: att.studentId || '',
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
      studentId: u.studentId,
      username: u.username,
      stagesCompleted: stageScores.length,
      totalPoints
    };
  });

  return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
}

export function getUserAchievements() {
  const user = getCurrentUser();
  if (!user || user.role !== 'student') return [];

  const userAttempts = getAllUserAttempts();
  const leaderboard = getLeaderboard(user.roomCode);
  const userRankIndex = leaderboard.findIndex(l => l.userId === user.userId);

  const hasPassedStage1 = userAttempts.some(a => a.stageId === 1 && a.totalScore >= 12);
  const hasHighScore = userAttempts.some(a => a.totalScore >= 16);
  const completedStagesCount = new Set(userAttempts.filter(a => a.totalScore >= 12).map(a => a.stageId)).size;
  const isTop3 = userRankIndex >= 0 && userRankIndex < 3;

  return [
    {
      id: 'pioneer',
      title: 'Prompt Pioneer',
      label: 'นักสั่งรุ่นแรก',
      desc: 'พิชิตด่าน 0.1 ปูพื้นฐานสำเร็จ',
      icon: '🚀',
      unlocked: hasPassedStage1
    },
    {
      id: 'highscore',
      title: 'High Scorer',
      label: 'จอมสั่งอัจฉริยะ',
      desc: 'ทำคะแนนได้ 16/20 คะแนนขึ้นไปในด่านใดด่านหนึ่ง',
      icon: '⚡️',
      unlocked: hasHighScore
    },
    {
      id: 'master',
      title: 'Master Prompter',
      label: 'ปรมาจารย์ Prompt',
      desc: 'ผ่านด่านการเรียนรู้สะสมครบ 5 ด่านขึ้นไป',
      icon: '🏆',
      unlocked: completedStagesCount >= 5
    },
    {
      id: 'champion',
      title: 'Hall of Famer',
      label: 'แชมเปียนชั้นเรียน',
      desc: 'ก้าวขึ้นสู่อันดับ Top 3 ใน Leaderboard ของห้องเรียน',
      icon: '🥇',
      unlocked: isTop3
    }
  ];
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

export function getStudentDetailedScores(roomCode) {
  const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  const roomAttempts = all.filter(a => a.roomCode === roomCode);

  const studentMap = {};
  roomAttempts.forEach(att => {
    if (!studentMap[att.userId]) {
      studentMap[att.userId] = {
        userId: att.userId,
        studentId: att.studentId || '',
        username: att.username,
        stages: {},
        attempts: []
      };
    }

    const s = studentMap[att.userId];
    s.attempts.push(att);

    // Keep highest attempt score per stage
    if (!s.stages[att.stageId] || att.totalScore > s.stages[att.stageId].totalScore) {
      s.stages[att.stageId] = {
        totalScore: att.totalScore,
        scores: att.scores,
        stageNumber: att.stageNumber
      };
    }
  });

  return Object.values(studentMap).map(student => {
    const stageValues = Object.values(student.stages);
    const totalPoints = stageValues.reduce((sum, item) => sum + item.totalScore, 0);

    return {
      userId: student.userId,
      studentId: student.studentId,
      username: student.username,
      stagesCompleted: stageValues.length,
      totalPoints,
      stages: student.stages,
      attempts: student.attempts
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);
}
