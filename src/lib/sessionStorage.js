import { sql as neonSql, isNeonConfigured } from './neonClient';

const SESSION_KEY = 'prompt_battle_session';
const ATTEMPTS_KEY = 'prompt_battle_attempts';
const ROOMS_KEY = 'prompt_battle_rooms';
const EVALUATIONS_KEY = 'prompt_battle_evaluations';

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

export function getAllRooms() {
  initDefaultData();
  return JSON.parse(localStorage.getItem(ROOMS_KEY) || '[]');
}

export async function createRoom(code, name, teacherPin = '1234') {
  initDefaultData();
  if (!code || code.trim().length === 0) {
    throw new Error('กรุณากรอกรหัสห้องเรียน');
  }
  if (!name || name.trim().length === 0) {
    throw new Error('กรุณากรอกชื่อห้องเรียน');
  }
  if (!teacherPin || teacherPin.trim().length < 4) {
    throw new Error('กรุณากำหนดรหัส PIN ของครูอย่างน้อย 4 หลัก');
  }

  const cleanCode = code.trim().toUpperCase();
  const rooms = getAllRooms();

  if (rooms.some(r => r.code.toUpperCase() === cleanCode)) {
    throw new Error(`รหัสห้องเรียน "${cleanCode}" มีอยู่ในระบบแล้ว`);
  }

  const newRoom = {
    code: cleanCode,
    name: name.trim(),
    teacher_pin: teacherPin.trim()
  };

  rooms.push(newRoom);
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));

  // 🔥 Sync room to Neon backend
  if (isNeonConfigured && neonSql) {
    await ensureNeonTables();
    try {
      await neonSql`
        INSERT INTO rooms (code, name, teacher_pin)
        VALUES (${cleanCode}, ${name.trim()}, ${teacherPin.trim()})
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, teacher_pin = EXCLUDED.teacher_pin
      `;
      console.log(`📤 Synced room ${cleanCode} to Neon DB`);
    } catch (err) {
      console.warn('⚠️ Neon room creation sync:', err.message);
    }
  }

  return newRoom;
}

export async function deleteRoom(code) {
  initDefaultData();
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('กรุณาระบุรหัสห้องเรียนที่จะลบ');
  }

  const rooms = getAllRooms();
  const existingIndex = rooms.findIndex(r => r.code.toUpperCase() === cleanCode);

  if (existingIndex === -1) {
    throw new Error(`ไม่พบรหัสห้องเรียน "${cleanCode}" ในระบบ`);
  }

  if (rooms.length <= 1) {
    throw new Error('ไม่สามารถลบห้องเรียนสุดท้ายได้ ต้องมีอย่างน้อย 1 ห้องเรียนในระบบ');
  }

  const roomToDelete = rooms[existingIndex];
  rooms.splice(existingIndex, 1);
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));

  // Clear attempts in localStorage for this room
  const allAttempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  const filteredAttempts = allAttempts.filter(a => (a.roomCode || '').toUpperCase() !== cleanCode);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(filteredAttempts));

  // 🔥 Delete room, profiles, and attempts from Neon DB
  if (isNeonConfigured && neonSql) {
    await ensureNeonTables();
    try {
      await neonSql`DELETE FROM attempts WHERE room_code = ${cleanCode}`;
      await neonSql`DELETE FROM profiles WHERE room_code = ${cleanCode}`;
      await neonSql`DELETE FROM rooms WHERE code = ${cleanCode}`;
      console.log(`🗑️ Deleted room ${cleanCode} from Neon DB`);
    } catch (err) {
      console.warn('⚠️ Neon room deletion error:', err.message);
    }
  }

  return roomToDelete;
}

export async function syncRoomsFromNeon() {
  if (!isNeonConfigured || !neonSql) return getAllRooms();
  try {
    await ensureNeonTables();
    const rows = await neonSql`SELECT code, name, teacher_pin FROM rooms ORDER BY created_at ASC`;
    if (rows && rows.length > 0) {
      const localRooms = getAllRooms();
      const localMap = new Map(localRooms.map(r => [r.code.toUpperCase(), r]));
      rows.forEach(r => {
        localMap.set(r.code.toUpperCase(), { code: r.code, name: r.name, teacher_pin: r.teacher_pin });
      });
      const merged = Array.from(localMap.values());
      localStorage.setItem(ROOMS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('⚠️ Neon fetch rooms error:', err.message);
  }
  return getAllRooms();
}

// ----------------------------------------------------
// Helper: Ensure Neon tables exist
// ----------------------------------------------------
async function ensureNeonTables() {
  if (!isNeonConfigured || !neonSql) return;
  try {
    await neonSql`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        teacher_pin TEXT NOT NULL DEFAULT '1234',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await neonSql`
      INSERT INTO rooms (code, name, teacher_pin)
      VALUES ('PROMPT-101', 'ห้องเรียนวิชา AI & Prompt Engineering (Demo)', '1234')
      ON CONFLICT (code) DO NOTHING
    `;
    await neonSql`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        room_code TEXT NOT NULL,
        username TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (room_code, username)
      )
    `;
    await neonSql`
      CREATE TABLE IF NOT EXISTS attempts (
        id SERIAL PRIMARY KEY,
        room_code TEXT NOT NULL,
        username TEXT NOT NULL,
        student_id TEXT NOT NULL DEFAULT '',
        stage_id INT NOT NULL,
        stage_number TEXT NOT NULL DEFAULT '',
        attempt_number INT NOT NULL DEFAULT 1,
        prompt_text TEXT NOT NULL,
        ai_output TEXT NOT NULL DEFAULT '',
        scores JSONB NOT NULL DEFAULT '{}',
        feedback JSONB NOT NULL DEFAULT '{}',
        total_score NUMERIC(5, 1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await neonSql`
      CREATE TABLE IF NOT EXISTS evaluations (
        id SERIAL PRIMARY KEY,
        room_code TEXT NOT NULL,
        student_id TEXT NOT NULL DEFAULT '',
        username TEXT NOT NULL,
        ratings JSONB NOT NULL DEFAULT '{}',
        comments TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (room_code, student_id, username)
      )
    `;
    console.log('✅ Neon backend tables ready');
  } catch (err) {
    console.warn('⚠️ Neon table creation:', err.message);
  }
}

// ----------------------------------------------------
// Helper: Fetch ALL attempts for a room from Neon & Sync LocalStorage
// ----------------------------------------------------
export async function syncRoomAttemptsFromNeon(roomCode) {
  if (!isNeonConfigured || !neonSql || !roomCode) return [];
  try {
    await ensureNeonTables();
    const rows = await neonSql`
      SELECT * FROM attempts
      WHERE room_code = ${roomCode}
      ORDER BY created_at DESC
    `;
    const neonAttempts = rows.map(r => ({
      id: 'neon_' + r.id,
      roomCode: r.room_code,
      userId: `usr_${r.room_code}_${r.student_id || r.username}`,
      studentId: r.student_id || '',
      username: r.username,
      stageId: r.stage_id,
      stageNumber: r.stage_number || '',
      attemptNumber: r.attempt_number,
      promptText: r.prompt_text,
      aiOutput: r.ai_output,
      scores: typeof r.scores === 'string' ? JSON.parse(r.scores) : r.scores,
      feedback: typeof r.feedback === 'string' ? JSON.parse(r.feedback) : r.feedback,
      totalScore: parseFloat(r.total_score) || 0,
      createdAt: r.created_at
    }));

    // Overwrite local storage attempts for this room with authoritative Neon records
    const allLocal = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
    const otherRoomsAttempts = allLocal.filter(a => (a.roomCode || '').toUpperCase() !== roomCode.toUpperCase());
    const updatedAll = [...otherRoomsAttempts, ...neonAttempts];
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updatedAll));
    console.log(`📡 Pulled ${neonAttempts.length} attempts from Neon for room ${roomCode} (total: ${updatedAll.length})`);
    return neonAttempts;
  } catch (err) {
    console.warn('⚠️ Neon fetch room attempts:', err.message);
    return [];
  }
}

// ----------------------------------------------------
// 1. AUTH & SESSION MANAGEMENT
// ----------------------------------------------------
export async function loginStudent(roomCode = '', studentId = '', username = '') {
  initDefaultData();
  const safeRoomCode = (roomCode || '').trim().toUpperCase();
  const safeStudentId = (studentId || '').trim().toUpperCase();
  const safeUsername = (username || '').trim();

  const rooms = await syncRoomsFromNeon();
  const room = rooms.find(r => r.code.toUpperCase() === safeRoomCode);

  if (!room) {
    throw new Error(`ไม่พบรหัสห้องเรียน "${safeRoomCode || roomCode}" กรุณาตรวจสอบรหัสห้องอีกครั้ง`);
  }

  if (!safeStudentId) {
    throw new Error('กรุณากรอกรหัสนักเรียน/เลขประจำตัว');
  }

  if (safeUsername.length < 2) {
    throw new Error('กรุณากรอกชื่อเล่นอย่างน้อย 2 ตัวอักษร');
  }

  const userId = `usr_${room.code}_${safeStudentId}`;

  const session = {
    userId,
    studentId: safeStudentId,
    username: safeUsername,
    roomCode: room.code,
    roomName: room.name,
    role: 'student',
    loginAt: new Date().toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  // Ensure Neon tables exist
  await ensureNeonTables();

  // Sync profile to Neon
  if (isNeonConfigured && neonSql) {
    neonSql`
      INSERT INTO profiles (room_code, username, role)
      VALUES (${room.code}, ${safeUsername}, 'student')
      ON CONFLICT (room_code, username) DO NOTHING
    `.catch((err) => console.warn('Neon profile sync:', err.message));
  }

  // 🔥 Fetch ALL attempts for this room from Neon & sync into localStorage
  if (isNeonConfigured && neonSql) {
    try {
      await syncRoomAttemptsFromNeon(room.code);
    } catch (err) {
      console.warn('⚠️ Neon fetch on login:', err.message);
    }
  }

  return session;
}

export async function loginTeacher(roomCode = '', pin = '') {
  initDefaultData();
  const safeRoomCode = (roomCode || '').trim().toUpperCase();
  const safePin = (pin || '').trim();

  const rooms = await syncRoomsFromNeon();
  const room = rooms.find(r => r.code.toUpperCase() === safeRoomCode);

  if (!room) {
    throw new Error(`ไม่พบรหัสห้องเรียน "${safeRoomCode || roomCode}"`);
  }

  if (!safePin || room.teacher_pin !== safePin) {
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
export async function saveAttempt({ stageId, stageNumber, promptText, aiOutput, scores, feedback, totalScore }) {
  const user = getCurrentUser();
  if (!user) return null;

  const allAttempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  
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

  // 🔥 Sync to Neon backend
  if (isNeonConfigured && neonSql) {
    await ensureNeonTables();
    try {
      const result = await neonSql`
        INSERT INTO attempts (room_code, username, student_id, stage_id, stage_number, attempt_number, prompt_text, ai_output, scores, feedback, total_score)
        VALUES (
          ${user.roomCode}, 
          ${user.username},
          ${user.studentId || ''},
          ${stageId}, 
          ${stageNumber || ''},
          ${attemptNumber}, 
          ${promptText}, 
          ${aiOutput}, 
          ${JSON.stringify(scores)}, 
          ${JSON.stringify(feedback)}, 
          ${totalScore}
        )
        RETURNING id
      `;
      console.log(`📤 Saved attempt to Neon (id: ${result[0]?.id})`);
    } catch (err) {
      console.warn('Neon attempt sync:', err.message);
    }
  }

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
// 3. LEADERBOARD & ACHIEVEMENTS
// ----------------------------------------------------
export function getLeaderboard(roomCode) {
  const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  const roomAttempts = all.filter(a => a.roomCode === roomCode);

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

    if (!userMap[att.userId].stages[att.stageId] || att.totalScore > userMap[att.userId].stages[att.stageId]) {
      userMap[att.userId].stages[att.stageId] = att.totalScore;
    }
  });

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
    { id: 'pioneer', title: 'Prompt Pioneer', label: 'นักสั่งรุ่นแรก', desc: 'พิชิตด่าน 0.1 ปูพื้นฐานสำเร็จ', icon: '🚀', unlocked: hasPassedStage1 },
    { id: 'highscore', title: 'High Scorer', label: 'จอมสั่งอัจฉริยะ', desc: 'ทำคะแนนได้ 16/20 คะแนนขึ้นไปในด่านใดด่านหนึ่ง', icon: '⚡️', unlocked: hasHighScore },
    { id: 'master', title: 'Master Prompter', label: 'ปรมาจารย์ Prompt', desc: 'ผ่านด่านการเรียนรู้สะสมครบ 5 ด่านขึ้นไป', icon: '🏆', unlocked: completedStagesCount >= 5 },
    { id: 'champion', title: 'Hall of Famer', label: 'แชมเปียนชั้นเรียน', desc: 'ก้าวขึ้นสู่อันดับ Top 3 ใน Leaderboard ของห้องเรียน', icon: '🥇', unlocked: isTop3 }
  ];
}

export function getTeacherAnalytics(roomCode) {
  const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  const roomAttempts = all.filter(a => a.roomCode === roomCode);

  const stageMap = {};
  roomAttempts.forEach(att => {
    if (!stageMap[att.stageId]) {
      stageMap[att.stageId] = { stageId: att.stageId, stageNumber: att.stageNumber, count: 0, claritySum: 0, completenessSum: 0, techniqueSum: 0, qualitySum: 0, totalScoreSum: 0, students: new Set() };
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
    stageId: s.stageId, stageNumber: s.stageNumber, studentCount: s.students.size,
    avgClarity: (s.claritySum / s.count).toFixed(1), avgCompleteness: (s.completenessSum / s.count).toFixed(1),
    avgTechnique: (s.techniqueSum / s.count).toFixed(1), avgQuality: (s.qualitySum / s.count).toFixed(1),
    avgTotalScore: (s.totalScoreSum / s.count).toFixed(1)
  }));
}

export function getStudentDetailedScores(roomCode) {
  const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  const roomAttempts = all.filter(a => a.roomCode === roomCode);

  const studentMap = {};
  roomAttempts.forEach(att => {
    if (!studentMap[att.userId]) {
      studentMap[att.userId] = { userId: att.userId, studentId: att.studentId || '', username: att.username, stages: {}, attempts: [] };
    }
    const s = studentMap[att.userId];
    s.attempts.push(att);
    if (!s.stages[att.stageId] || att.totalScore > s.stages[att.stageId].totalScore) {
      s.stages[att.stageId] = { totalScore: att.totalScore, scores: att.scores, stageNumber: att.stageNumber };
    }
  });

  return Object.values(studentMap).map(student => {
    const stageValues = Object.values(student.stages);
    const totalPoints = stageValues.reduce((sum, item) => sum + item.totalScore, 0);
    return { userId: student.userId, studentId: student.studentId, username: student.username, stagesCompleted: stageValues.length, totalPoints, stages: student.stages, attempts: student.attempts };
  }).sort((a, b) => b.totalPoints - a.totalPoints);
}

// ----------------------------------------------------
// 5. EVALUATION SURVEY MANAGEMENT
// ----------------------------------------------------
export async function saveEvaluation({ ratings, comments = '' }) {
  const user = getCurrentUser();
  if (!user || user.role !== 'student') return null;

  const allEvals = JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
  const index = allEvals.findIndex(e => e.userId === user.userId);

  const evalRecord = {
    id: 'eval_' + Math.random().toString(36).substr(2, 9),
    roomCode: user.roomCode,
    userId: user.userId,
    studentId: user.studentId || '',
    username: user.username,
    ratings,
    comments: (comments || '').trim(),
    createdAt: new Date().toISOString()
  };

  if (index >= 0) {
    allEvals[index] = evalRecord;
  } else {
    allEvals.push(evalRecord);
  }

  localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(allEvals));

  // Sync to Neon DB
  if (isNeonConfigured && neonSql) {
    await ensureNeonTables();
    try {
      await neonSql`
        INSERT INTO evaluations (room_code, student_id, username, ratings, comments)
        VALUES (${user.roomCode}, ${user.studentId || ''}, ${user.username}, ${JSON.stringify(ratings)}, ${comments.trim()})
        ON CONFLICT (room_code, student_id, username)
        DO UPDATE SET ratings = EXCLUDED.ratings, comments = EXCLUDED.comments, created_at = NOW()
      `;
      console.log(`📤 Synced evaluation to Neon for ${user.username}`);
    } catch (err) {
      console.warn('⚠️ Neon evaluation sync:', err.message);
    }
  }

  return evalRecord;
}

export function getUserEvaluation() {
  const user = getCurrentUser();
  if (!user) return null;
  const allEvals = JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
  return allEvals.find(e => e.userId === user.userId) || null;
}

export async function fetchRoomEvaluationsFromNeon(roomCode) {
  if (!isNeonConfigured || !neonSql) return [];
  try {
    const rows = await neonSql`
      SELECT * FROM evaluations
      WHERE room_code = ${roomCode}
      ORDER BY created_at DESC
    `;
    return rows.map(r => ({
      id: 'neon_eval_' + r.id,
      roomCode: r.room_code,
      userId: `usr_${r.room_code}_${r.student_id || r.username}`,
      studentId: r.student_id || '',
      username: r.username,
      ratings: typeof r.ratings === 'string' ? JSON.parse(r.ratings) : r.ratings,
      comments: r.comments || '',
      createdAt: r.created_at
    }));
  } catch (err) {
    console.warn('⚠️ Neon fetch evaluations error:', err.message);
    return [];
  }
}

export async function getRoomEvaluationAnalytics(roomCode) {
  let evals = [];
  if (isNeonConfigured && neonSql) {
    try {
      const neonEvals = await fetchRoomEvaluationsFromNeon(roomCode);
      if (neonEvals.length > 0) {
        const localEvals = JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
        const localMap = new Map(localEvals.map(e => [e.userId, e]));
        neonEvals.forEach(e => localMap.set(e.userId, e));
        evals = Array.from(localMap.values()).filter(e => e.roomCode === roomCode);
        localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(Array.from(localMap.values())));
      } else {
        const localEvals = JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
        evals = localEvals.filter(e => e.roomCode === roomCode);
      }
    } catch (err) {
      const localEvals = JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
      evals = localEvals.filter(e => e.roomCode === roomCode);
    }
  } else {
    const localEvals = JSON.parse(localStorage.getItem(EVALUATIONS_KEY) || '[]');
    evals = localEvals.filter(e => e.roomCode === roomCode);
  }

  const totalCount = evals.length;
  const items = ['1.1', '1.2', '1.3', '2.1', '2.2', '2.3', '3.1', '3.2', '3.3', '4.1', '4.2', '4.3'];

  if (totalCount === 0) {
    const emptyItemAvg = {};
    items.forEach(k => { emptyItemAvg[k] = '0.00'; });
    return {
      totalEvaluations: 0,
      overallAvg: '0.00',
      categoryAvg: { cat1: '0.00', cat2: '0.00', cat3: '0.00', cat4: '0.00' },
      itemAvg: emptyItemAvg,
      commentsList: []
    };
  }

  const itemSums = {};
  items.forEach(k => { itemSums[k] = 0; });
  let allRatingsSum = 0;

  evals.forEach(ev => {
    if (ev.ratings) {
      items.forEach(k => {
        const val = Number(ev.ratings[k]) || 0;
        itemSums[k] += val;
        allRatingsSum += val;
      });
    }
  });

  const itemAvg = {};
  items.forEach(k => {
    itemAvg[k] = (itemSums[k] / totalCount).toFixed(2);
  });

  const cat1Avg = ((parseFloat(itemAvg['1.1']) + parseFloat(itemAvg['1.2']) + parseFloat(itemAvg['1.3'])) / 3).toFixed(2);
  const cat2Avg = ((parseFloat(itemAvg['2.1']) + parseFloat(itemAvg['2.2']) + parseFloat(itemAvg['2.3'])) / 3).toFixed(2);
  const cat3Avg = ((parseFloat(itemAvg['3.1']) + parseFloat(itemAvg['3.2']) + parseFloat(itemAvg['3.3'])) / 3).toFixed(2);
  const cat4Avg = ((parseFloat(itemAvg['4.1']) + parseFloat(itemAvg['4.2']) + parseFloat(itemAvg['4.3'])) / 3).toFixed(2);

  const overallAvg = (allRatingsSum / (totalCount * 12)).toFixed(2);

  const studentEvaluations = evals.map(ev => {
    const rValues = Object.values(ev.ratings || {}).map(Number);
    const studentAvg = rValues.length > 0 ? (rValues.reduce((a, b) => a + b, 0) / rValues.length).toFixed(2) : '-';
    return {
      username: ev.username,
      studentId: ev.studentId || '',
      ratings: ev.ratings || {},
      comments: (ev.comments || '').trim(),
      studentAvg,
      createdAt: ev.createdAt
    };
  });

  const commentsList = studentEvaluations.filter(ev => ev.comments && ev.comments.length > 0);

  return {
    totalEvaluations: totalCount,
    overallAvg,
    categoryAvg: { cat1: cat1Avg, cat2: cat2Avg, cat3: cat3Avg, cat4: cat4Avg },
    itemAvg,
    studentEvaluations,
    commentsList,
    evaluationsList: evals
  };
}