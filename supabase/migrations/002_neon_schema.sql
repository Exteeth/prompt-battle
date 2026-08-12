-- ===================================================
-- PROMPT BATTLE — NEON SERVERLESS POSTGRES SCHEMA
-- รันใน Neon Console (SQL Editor) หรือผ่าน API
-- ===================================================

-- 0. ROOMS TABLE (ห้องเรียน)
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    teacher_pin TEXT NOT NULL DEFAULT '1234',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO rooms (code, name, teacher_pin)
VALUES ('PROMPT-101', 'ห้องเรียนวิชา AI & Prompt Engineering (Demo)', '1234')
ON CONFLICT (code) DO NOTHING;

-- 1. PROFILES TABLE (ผู้เรียน/ครู)
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    room_code TEXT NOT NULL,
    username TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (room_code, username)
);

-- 2. ATTEMPTS TABLE (ประวัติการพิมพ์ prompt และคะแนน)
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
);

-- 3. INDEX สำหรับค้นหาตามห้องเรียน (Leaderboard)
CREATE INDEX IF NOT EXISTS idx_attempts_room_code ON attempts (room_code);
CREATE INDEX IF NOT EXISTS idx_attempts_room_created ON attempts (room_code, created_at DESC);

-- 4. INDEX สำหรับค้นหาโปรไฟล์
CREATE INDEX IF NOT EXISTS idx_profiles_room_code ON profiles (room_code);

-- 5. EVALUATIONS TABLE (แบบประเมินความพึงพอใจของนักเรียน)
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    room_code TEXT NOT NULL,
    student_id TEXT NOT NULL DEFAULT '',
    username TEXT NOT NULL,
    ratings JSONB NOT NULL DEFAULT '{}',
    comments TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (room_code, student_id, username)
);

CREATE INDEX IF NOT EXISTS idx_evaluations_room_code ON evaluations (room_code);