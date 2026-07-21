-- ===================================================
-- PROMPT BATTLE — SUPABASE DATABASE SCHEMA MIGRATION
-- ===================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROOMS TABLE (ห้องเรียน Kahoot-style)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- เช่น 'PROMPT-101'
  name TEXT NOT NULL,
  teacher_pin TEXT NOT NULL DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default demo room
INSERT INTO rooms (code, name, teacher_pin) 
VALUES ('PROMPT-101', 'ห้องเรียนวิชา AI & Prompt Engineering (Demo)', '1234')
ON CONFLICT (code) DO NOTHING;

-- 2. PROFILES TABLE (ผู้เรียน/ครู)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT REFERENCES rooms(code) ON DELETE CASCADE,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- 'student' | 'teacher'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (room_code, username)
);

-- 3. STAGES TABLE (ด่านโจทย์)
CREATE TABLE IF NOT EXISTS stages (
  id SERIAL PRIMARY KEY,
  stage_number TEXT UNIQUE NOT NULL, -- '0.1', '0.2', ..., '1', '2', ...
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL, -- 'Tutorial' | 'ง่าย' | 'ปานกลาง' | 'ท้าทาย' | 'ยากมาก'
  problem_statement TEXT NOT NULL,
  constraints TEXT[] DEFAULT '{}',
  expected_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_tutorial BOOLEAN DEFAULT FALSE,
  order_index INT NOT NULL
);

-- 4. ATTEMPTS TABLE (ประวัติการพิมพ์ prompt และคะแนน)
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  stage_id INT REFERENCES stages(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  prompt_text TEXT NOT NULL,
  ai_output TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '{"clarity": 0, "completeness": 0, "technique": 0, "quality": 0}'::jsonb,
  feedback JSONB NOT NULL DEFAULT '{"what_worked": "", "what_missing": "", "suggestion": ""}'::jsonb,
  total_score NUMERIC(4, 1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RATE LIMITS TABLE
CREATE TABLE IF NOT EXISTS rate_limits (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  attempts_count INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- 6. LEADERBOARD VIEW
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  a.room_code,
  a.user_id,
  a.username,
  COUNT(DISTINCT a.stage_id) AS stages_completed,
  MAX(a.total_score) AS highest_single_score,
  SUM(best_attempts.max_score) AS total_points
FROM (
  SELECT user_id, stage_id, MAX(total_score) AS max_score
  FROM attempts
  GROUP BY user_id, stage_id
) best_attempts
JOIN attempts a ON a.user_id = best_attempts.user_id AND a.stage_id = best_attempts.stage_id
GROUP BY a.room_code, a.user_id, a.username
ORDER BY total_points DESC;

-- 7. TEACHER ANALYTICS VIEW
CREATE OR REPLACE VIEW teacher_analytics AS
SELECT 
  a.room_code,
  a.stage_id,
  s.stage_number,
  s.title AS stage_title,
  COUNT(DISTINCT a.user_id) AS total_students_attempted,
  ROUND(AVG((a.scores->>'clarity')::numeric), 1) AS avg_clarity,
  ROUND(AVG((a.scores->>'completeness')::numeric), 1) AS avg_completeness,
  ROUND(AVG((a.scores->>'technique')::numeric), 1) AS avg_technique,
  ROUND(AVG((a.scores->>'quality')::numeric), 1) AS avg_quality,
  ROUND(AVG(a.total_score), 1) AS avg_total_score
FROM attempts a
JOIN stages s ON s.id = a.stage_id
GROUP BY a.room_code, a.stage_id, s.stage_number, s.title;
