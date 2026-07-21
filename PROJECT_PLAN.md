# 🎮 Prompt Battle: เกมฝึกทักษะ Prompt Engineering สำหรับนักเรียน

> เอกสารแผนโครงการฉบับสมบูรณ์ (Consolidated Plan)
> เวอร์ชัน: 1.0 | อัปเดตล่าสุด: [ระบุวันที่ deploy จริง]

---

## 📌 สารบัญ

1. [ภาพรวมโครงการ](#1-ภาพรวมโครงการ)
2. [บริบทและเป้าหมาย](#2-บริบทและเป้าหมาย)
3. [Tech Stack (Free Tier)](#3-tech-stack-free-tier)
4. [โครงสร้างเกม](#4-โครงสร้างเกม)
5. [Learning Loop Design](#5-learning-loop-design)
6. [เกณฑ์การให้คะแนน](#6-เกณฑ์การให้คะแนน)
7. [Database Schema](#7-database-schema)
8. [System Flow](#8-system-flow)
9. [Frontend Structure](#9-frontend-structure)
10. [AI API Strategy & Rate Limiting](#10-ai-api-strategy--rate-limiting)
11. [Teacher Dashboard](#11-teacher-dashboard)
12. [Deployment Plan (Free Tier)](#12-deployment-plan-free-tier)
13. [Roadmap](#13-roadmap)
14. [ข้อจำกัดและความเสี่ยง](#14-ข้อจำกัดและความเสี่ยง)
15. [อ้างอิง](#15-อ้างอิง)

---

## 1. ภาพรวมโครงการ

**ชื่อโครงการ:** Prompt Battle
**ประเภท:** Web-based Educational Game
**วัตถุประสงค์หลัก:** ฝึกและพัฒนาทักษะ Prompt Engineering ของนักเรียน ผ่านการแก้ปัญหาเป็นด่านๆ พร้อมรับ feedback จาก AI แบบทันที

**Tech Stack:** React + Supabase + LLM API (Free Tier)

---

## 2. บริบทและเป้าหมาย

### ปัญหาที่พบ

โรงเรียนอนุญาตให้นักเรียนใช้ AI ได้อย่างเสรี แต่นักเรียนยังเขียน prompt ได้ไม่ดี ส่งผลให้:

- ผลลัพธ์จาก AI ไม่ตรงวัตถุประสงค์
- นักเรียนไม่เข้าใจว่าทำไม AI ตอบไม่ตรงที่ต้องการ
- ขาดทักษะพื้นฐานในการสื่อสารกับ AI อย่างมีประสิทธิภาพ

### เป้าหมายของระบบ

> **"สอนให้นักเรียน prompt เก่งขึ้น" มากกว่า "วัดคะแนนเพียงอย่างเดียว"**

ระบบจึงต้องเน้น:

- Feedback ที่ **สอน** ไม่ใช่แค่ **ตัดสิน**
- โอกาสในการ **ลองผิดลองถูกและปรับปรุง** (Iterative learning)
- ข้อมูลให้ครูใช้ **ติดตามและช่วยเหลือ** นักเรียนที่ยังอ่อน

---

## 3. Tech Stack (Free Tier)

| ส่วนประกอบ                | บริการ                        | หมายเหตุ                                      |
| ------------------------- | ----------------------------- | --------------------------------------------- |
| Frontend Hosting          | Vercel (Free)                 | Bandwidth ~100GB/เดือน                        |
| Database + Auth + Backend | Supabase (Free Plan)          | 500MB storage, auto-pause หลัง 7 วันไม่ใช้งาน |
| Backend Logic             | Supabase Edge Functions       | มี invocation quota ฟรี/เดือน                 |
| AI Evaluator (หลัก)       | Google Gemini API (Free tier) | ผ่าน Google AI Studio                         |
| AI Evaluator (fallback)   | Groq API (Free tier)          | Llama/Mixtral, เร็ว, rate limit ต่อนาที       |

> ⚠️ **สำคัญ:** Free tier ทุกบริการเปลี่ยนแปลงนโยบายได้ ต้องตรวจสอบหน้า pricing ทางการก่อน deploy จริงเสมอ

**อ้างอิง:**

- Vercel. (2024). _Pricing_. https://vercel.com/pricing
- Supabase. (2024). _Pricing_. https://supabase.com/pricing
- Google AI for Developers. (2024). _Gemini API pricing_. https://ai.google.dev/pricing
- Groq. (2024). _GroqCloud_. https://groq.com/

---

## 4. โครงสร้างเกม

### 4.1 Mini-Stage (Tutorial — ไม่ให้คะแนนแข่ง)

ปลดล็อกก่อนเข้าด่านจริง สอนพื้นฐาน:

| Mini-Stage | สอนเรื่อง                                  |
| ---------- | ------------------------------------------ |
| 0.1        | Prompt กำกวม vs ชัดเจน (เทียบ output จริง) |
| 0.2        | การให้ Context/Role แก่ AI                 |
| 0.3        | Few-shot Examples                          |
| 0.4        | การกำหนด Output Format                     |
| 0.5        | Chain-of-Thought / Step-by-step            |

### 4.2 Main Stage (แข่งขันจริง มีคะแนน)

| Stage | ประเภทโจทย์                       | ทักษะที่วัด                        |
| ----- | --------------------------------- | ---------------------------------- |
| 1     | Data extraction                   | ความชัดเจนของคำสั่ง                |
| 2     | Creative writing with constraints | Role/Context prompting             |
| 3     | Code generation                   | Chain-of-thought, format control   |
| 4     | Multi-step reasoning              | Few-shot, structured output        |
| 5     | Ambiguous problem solving         | Clarification, iterative prompting |

---

## 5. Learning Loop Design

### 5.1 Iterative Attempt Flow

Copy

เขียน Prompt ครั้งที่ 1 ↓ AI ประเมิน + feedback เจาะจง ↓ นักเรียนแก้ไข prompt (จำกัด 3 attempts/ด่าน) ↓ คะแนนสุดท้าย = คะแนนสูงสุดที่ทำได้ + bonus ถ้าปรับปรุงเร็ว

### 5.2 หลัก Feedback ที่ "สอน" ไม่ใช่ "เฉลย"

Evaluator ต้องคืนผลแบบนี้ (ห้ามเขียน prompt สมบูรณ์ให้เลย):

```json
{
  "scores": { "clarity": 3, "completeness": 4, "technique": 2, "quality": 3 },
  "feedback": {
    "what_worked": "...",
    "what_missing": "...",
    "suggestion": "แนวทางเทคนิคที่ควรลองใช้ (ไม่ใช่คำตอบสำเร็จ)",
    "hint_only": true
  }
}

Copy

5.3 Before/After Comparison UI
แสดงให้นักเรียนเห็น:

Prompt แรก → Output แรก
      vs
Prompt สุดท้าย → Output สุดท้าย
      → คะแนนที่เพิ่มขึ้น (แสดง growth)

Copy

6. เกณฑ์การให้คะแนน (รวม 20 คะแนน)
เกณฑ์	คะแนน	คำอธิบาย
ความชัดเจนของ Prompt (Clarity)	5	คำสั่งไม่กำกวม สื่อสารเจตนาชัดเจน
ความครบถ้วน (Completeness)	5	ครอบคลุม context, constraints, format
การใช้เทคนิค Prompt (Technique)	5	role-play, few-shot, CoT, delimiters
คุณภาพผลลัพธ์ AI (Output Quality)	5	ผลลัพธ์ตรงโจทย์ ถูกต้อง ใช้งานได้
ควรให้ครูผู้สอน Prompt Engineering มีส่วนร่วมตรวจสอบ rubric ก่อนใช้งานจริง เพื่อความสอดคล้องกับเนื้อหาที่สอนในห้องเรียน

7. Database Schema
sql
-- Profile ผู้ใช้
create table profiles (
  id uuid references auth.users primary key,
  username text unique,
  role text default 'student', -- student / teacher
  faculty text,
  created_at timestamp default now()
);

-- ด่าน/โจทย์
create table stages (
  id serial primary key,
  title text,
  description text,
  difficulty text, -- tutorial / beginner / intermediate / advanced
  problem_statement text,
  expected_criteria jsonb,
  order_index int
);

-- เก็บทุก attempt (ไม่ใช่แค่ครั้งสุดท้าย)
create table attempts (
  id uuid primary key default gen_random_uuid(),
  submission_group_id uuid,
  user_id uuid references profiles(id),
  stage_id int references stages(id),
  attempt_number int,
  prompt_text text,
  ai_output text,
  scores jsonb,
  feedback jsonb,
  total_score numeric,
  created_at timestamp default now()
);

-- Rate limiting ต่อผู้ใช้ต่อวัน
create table rate_limits (
  user_id uuid references profiles(id),
  date date default current_date,
  attempts_count int default 0,
  primary key (user_id, date)
);

-- Leaderboard
create view leaderboard as
select user_id,
       sum(total_score) as total_points
from attempts
group by user_id
order by total_points desc;

-- Analytics สำหรับครู
create view teacher_analytics as
select stage_id,
       avg((scores->>'clarity')::numeric) as avg_clarity,
       avg((scores->>'completeness')::numeric) as avg_completeness,
       avg((scores->>'technique')::numeric) as avg_technique,
       avg((scores->>'quality')::numeric) as avg_quality
from attempts
group by stage_id;

Copy

8. System Flow
[ผู้เล่น Login]
      ↓
[เลือก Stage]
      ↓
[อ่านโจทย์ + เขียน Prompt]
      ↓
[Submit] → เช็ค rate_limits ก่อน
      ↓
[Supabase Edge Function]:
   1. เช็ค quota คงเหลือของผู้ใช้วันนี้
   2. เรียก LLM API (ตัวแรก): รัน prompt ผู้เล่น → ได้ output
   3. เรียก LLM API (ตัวที่สอง): evaluator ให้คะแนน + feedback
      - ถ้า Gemini quota เต็ม → fallback ไปที่ Groq
   4. บันทึกลง attempts table
   5. อัปเดต rate_limits
      ↓
[Frontend] แสดง output + score + feedback + Before/After
      ↓
[Leaderboard] อัปเดต realtime

Copy

9. Frontend Structure
src/
├── components/
│   ├── StageCard.jsx
│   ├── PromptEditor.jsx
│   ├── ScoreBreakdown.jsx
│   ├── FeedbackPanel.jsx
│   ├── BeforeAfterCompare.jsx
│   ├── Leaderboard.jsx
│   └── TutorialViewer.jsx
├── pages/
│   ├── Home.jsx
│   ├── TutorialStages.jsx
│   ├── StageList.jsx
│   ├── PlayStage.jsx
│   ├── Results.jsx
│   ├── Profile.jsx
│   └── TeacherDashboard.jsx
├── lib/
│   ├── supabaseClient.js
│   └── api.js
├── hooks/
│   ├── useAuth.js
│   └── useRateLimit.js
└── App.jsx

Copy

10. AI API Strategy & Rate Limiting
10.1 Multi-Provider Fallback
เรียก Gemini API ก่อน
   ↓ (ถ้า error/quota exceeded)
Fallback → Groq API
   ↓ (ถ้ายัง error)
แสดง error message ให้ผู้เล่นลองใหม่ภายหลัง

Copy

10.2 Rate Limiting ระดับผู้ใช้
จำกัด 10 attempts/วัน/คน (ปรับได้ตามจำนวน quota จริง)
เช็คใน Edge Function ก่อนเรียก AI API ทุกครั้ง
10.3 Caching
Cache ผลลัพธ์ถ้า prompt text เหมือนกันเป๊ะ (ป้องกันเรียก API ซ้ำ ประหยัด quota)
10.4 การจัดตารางเวลาใช้งาน (สำคัญมากสำหรับ Free Tier)
ไม่ควรให้นักเรียนทั้งโรงเรียน (หลายร้อยคน) เข้าใช้พร้อมกันในเวลาเดียว
แนะนำ: แบ่งใช้งานตามคาบเรียน/ห้องเรียน เพื่อไม่ชน rate limit ต่อนาทีของ Free tier
11. Teacher Dashboard
ฟีเจอร์หลัก:

กราฟคะแนนเฉลี่ยแต่ละ criteria ต่อ stage (ดูว่านักเรียนอ่อนด้านไหน)
รายชื่อนักเรียนที่คะแนนไม่ขึ้นหลัง 3 attempts (ต้องการช่วยเหลือเพิ่ม)
ตัวอย่าง prompt คะแนนสูง/ต่ำสุด (ใช้สอนในห้องได้จริง)
Export ข้อมูลเป็น CSV สำหรับรายงาน
12. Deployment Plan (Free Tier)
ขั้นตอน	รายละเอียด
1	สร้าง Supabase Project (Free Plan) → ตั้ง Database Schema
2	Deploy Edge Functions ผ่าน Supabase CLI
3	ขอ API Key จาก Google AI Studio (Gemini) + Groq
4	เก็บ API Keys ใน Supabase Edge Function secrets (ห้ามฝัง client-side)
5	Deploy Frontend ผ่าน Vercel เชื่อมกับ GitHub repo
6	ตั้ง Cron Job (เช่น GitHub Actions ping ทุก 3-4 วัน) ป้องกัน Supabase project pause
7	ทดสอบระบบกับกลุ่มนักเรียนเล็กๆก่อน scale เต็ม
Keep-Alive Mechanism (ป้องกัน Supabase pause):

yaml
# .github/workflows/keep-alive.yml
# ตั้งให้เรียก endpoint เบาๆ ทุก 3-4 วัน เพื่อไม่ให้ project ถูก pause

Copy

13. Roadmap
Phase	รายละเอียด	ระยะเวลา
Phase 1	DB Schema + Auth + Tutorial content	1-2 สัปดาห์
Phase 2	UI หลัก (Stage list, Prompt Editor, Tutorial)	2 สัปดาห์
Phase 3	Edge Function: Evaluator + Fallback + Rate Limit	1-2 สัปดาห์
Phase 4	Scoring UI, Before/After, Leaderboard	1 สัปดาห์
Phase 5	Teacher Dashboard	1 สัปดาห์
Phase 6	Testing กับกลุ่มนักเรียน/ครูจริง + ปรับ rubric	1-2 สัปดาห์
Phase 7	Deploy จริง + Monitor Free tier usage	ต่อเนื่อง
14. ข้อจำกัดและความเสี่ยง
AI API Rate Limit — ใช้พร้อมกันจำนวนมากไม่ได้แบบไม่จำกัด ต้องจัดตารางเวลาใช้งาน
Supabase Free Project Pause — pause อัตโนมัติหลังไม่มีการใช้งาน 7 วัน ต้องมี keep-alive
Database Storage 500MB — ควร archive/ลบ attempts เก่าเป็นระยะถ้าใกล้เต็ม
คุณภาพ AI ประเมิน — โมเดล free tier อาจไม่เท่า flagship model ควร test เทียบผลกับเกณฑ์จริงก่อนใช้งานทั้งโรงเรียน
Prompt Injection จากผู้เล่น — ผู้เล่นอาจพยายามเขียน prompt หลอก evaluator ให้ได้คะแนนเต็ม ต้องออกแบบ system prompt แยกส่วน player input ชัดเจน
Over-reliance บน AI Feedback — ต้องออกแบบ feedback ให้กระตุ้นการคิดเอง ไม่ใช่รอ AI บอกคำตอบสำเร็จรูป
```

15. อ้างอิง
    Vercel. (2024). Pricing. https://vercel.com/pricing
    Netlify. (2024). Pricing. https://www.netlify.com/pricing/
    Supabase. (2024). Pricing. https://supabase.com/pricing
    Google AI for Developers. (2024). Gemini API pricing. https://ai.google.dev/pricing
    Groq. (2024). GroqCloud. https://groq.com/
    OpenAI. (2024). Prompt engineering guide. https://platform.openai.com/docs/guides/prompt-engineering
    Anthropic. (2024). Prompt engineering overview. https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering
    White, J., et al. (2023). A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT. arXiv:2302.11382.
    Black, P., & Wiliam, D. (1998). Assessment and Classroom Learning. Assessment in Education, 5(1), 7-74.
    ⚠️ หมายเหตุสำคัญ: โปรดตรวจสอบลิงก์และนโยบาย pricing ของทุกบริการอีกครั้งก่อน deploy จริง เนื่องจากเงื่อนไข free tier เปลี่ยนแปลงได้บ่อยโดยไม่แจ้งล่วงหน้า

---

ไฟล์นี้พร้อมนำไป save เป็น `PROJECT_PLAN.md` ในโปรเจกต์ครับ ต้องการให้ผมแยกเป็นไฟล์ย่อยเพิ่มเติมไหมครับ เช่น:

- `DATABASE_SCHEMA.sql` (แยก SQL ออกมาเป็นไฟล์รันได้จริง)
- `EVALUATOR_PROMPT.md` (ตัวอย่าง system prompt สำหรับ AI evaluator แบบเต็ม)
- `TEACHER_DASHBOARD_SPEC.md` (รายละเอียด UI/UX dashboard ครู)
