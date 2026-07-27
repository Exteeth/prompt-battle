# 🤖 Prompt Battle — เอกสารสรุปสถาปัตยกรรมระบบและ Workflow แบบละเอียด

> **สำหรับใช้เป็นเอกสารอ้างอิงประกอบงานวิจัย หรืองานวิเคราะห์ระบบ**
> เหมาะสำหรับให้ AI หรือผู้พัฒนาทำความเข้าใจโครงสร้างระบบทั้งหมดในเวลาอันรวดเร็ว

---

## 📌 1. ภาพรวมโครงการ (Project Overview)

**Prompt Battle** เป็น **Web-based Educational Game** ที่มีวัตถุประสงค์เพื่อฝึกและพัฒนาทักษะ **Prompt Engineering** ของนักเรียน ผ่านการแก้โจทย์ปัญหาเป็นด่าน ๆ พร้อมรับ **Feedback จาก AI** แบบทันที ระบบใช้แนวคิด **Learning by Doing + Iterative Improvement** โดยมี Mascot ชื่อ **Promptie** เป็นตัวละครนำทางและสร้างบรรยากาศการเรียนรู้แบบ Gamification

### เป้าหมายหลัก

- สอนให้นักเรียน "prompt เก่งขึ้น" ผ่านการลองผิดลองถูก (Iterative Learning)
- Feedback ที่ **สอน** ไม่ใช่ **ตัดสิน** — กระตุ้นการคิดเอง ไม่เฉลยคำตอบสำเร็จรูป
- ให้ข้อมูลแก่ครูผู้สอนเพื่อ **ติดตามและช่วยเหลือ** นักเรียน

---

## 🏗️ 2. Technology Stack

| Layer                     | Technology                                          | หมายเหตุ                                      |
| ------------------------- | --------------------------------------------------- | --------------------------------------------- |
| **Framework**             | React 18 + Vite 6                                   | Single Page Application                       |
| **Routing**               | React Router DOM 7                                  | Client-side routing                           |
| **Styling**               | Tailwind CSS 4                                      | Utility-first CSS                             |
| **Icons**                 | Lucide React                                        | Consistent icon set                           |
| **Animations**            | canvas-confetti, Tailwind animations                | Celebrations & micro-interactions             |
| **3D Elements**           | Three.js (`^0.185.1`)                               | 3D visual effects                             |
| **Database (Primary)**    | **localStorage** (Browser)                          | Offline-first, no backend dependency required |
| **Database (Cloud Sync)** | **Neon Serverless Postgres**                        | Optional cloud sync for shared room data      |
| **Serverless API Proxy**  | **Vercel Serverless Functions** (`api/evaluate.js`) | Proxy to external AI API                      |
| **AI Evaluator**          | **KKU API** (`gen.ai.kku.ac.th`)                    | DeepSeek V4 Flash — 평가 + Prompt 실행        |
| **Fallback Evaluator**    | **Heuristic Engine** (client-side)                  | Regex + keyword rule-based scoring            |
| **Testing**               | Vitest + happy-dom                                  | Unit tests for evaluator + storage            |
| **Deployment**            | Vercel (Free Tier) + Neon (Free Tier)               | SPA + serverless + serverless Postgres        |
| **Language**              | ภาษาไทย (Thai)                                      | UI, feedback, content all Thai                |

### Dependencies (จาก `package.json`)

```json
{
  "@neondatabase/serverless": "^1.1.0", // Neon DB client
  "canvas-confetti": "^1.9.4", // Celebration effects
  "lucide-react": "^0.475.0", // Icons
  "react": "^18.3.1", // UI library
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.1.5", // Routing
  "tailwindcss": "^4.3.3", // CSS framework
  "three": "^0.185.1" // 3D library
}
```

---

## 🧭 3. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER (Client)                        │
│                                                                      │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────────┐ │
│  │   React App   │  │   localStorage │  │   Neon Serverless        │ │
│  │  (Vite SPA)   │◄─┤   (Primary DB) │◄─┤   Postgres (Cloud Sync)  │ │
│  │               │  │                │  │                          │ │
│  │  Pages:       │  │  - sessions    │  │  Tables:                 │ │
│  │  ├─ Home      │  │  - attempts    │  │  ├─ profiles             │ │
│  │  ├─ StageList │  │  - rooms       │  │  └─ attempts             │ │
│  │  ├─ PlayStage │  │                │  │                          │ │
│  │  ├─ Leaderboard│ │  (offline-first)│ │  (optional shared sync)  │ │
│  │  └─ Teacher   │  └────────────────┘  └──────────────────────────┘ │
│  │    Dashboard  │                                                   │
│  └──────┬───────┘                                                   │
│         │ HTTP POST /api/evaluate                                   │
└─────────┼───────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      VERCEL SERVERLESS (Edge)                        │
│                                                                      │
│  ┌──────────────────────┐     ┌──────────────────────────────────┐  │
│  │  api/evaluate.js      │────►│  KKU API (gen.ai.kku.ac.th)      │  │
│  │  (Proxy Function)     │     │  Model: deepseek-v4-flash        │  │
│  │                       │     │  Endpoint: /chat/completions     │  │
│  │  - CORS handling      │     │                                  │  │
│  │  - API Key protection │     │  Does TWO tasks:                 │  │
│  │  - Timeout (25s)      │     │  1. Execute user's prompt        │  │
│  └──────────────────────┘     │  2. Score + feedback (Thai)      │  │
│                                └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔀 4. Complete System Flow (End-to-End Workflow)

### 4.1 Authentication Flow

```
                    ┌──────────────────┐
                    │  หน้า Home (Login) │
                    │  /                │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
    ┌──────────────────┐          ┌──────────────────┐
    │  Student Login    │          │  Teacher Login    │
    │  - รหัสห้องเรียน    │          │  - รหัสห้องเรียน    │
    │  - รหัสนักเรียน     │          │  - PIN (default:   │
    │  - ชื่อเล่น         │          │    1234)           │
    └────────┬─────────┘          └────────┬─────────┘
             │                              │
             ▼                              ▼
    ┌──────────────────────────────────────────────────┐
    │  loginStudent() / loginTeacher()                  │
    │  ใน src/lib/sessionStorage.js                     │
    │                                                   │
    │  1. Validate room code (เทียบกับ rooms ใน localStorage)│
    │  2. สร้าง session object → save to localStorage      │
    │  3. Sync profile to Neon (if configured)             │
    │  4. Pull attempts from Neon (merge into localStorage)│
    │  5. Return session → setUser() in AuthContext        │
    └───────────────────┬──────────────────────────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────────────┐
    │  AuthContext.Provider ส่ง user object             │
    │  ไปยัง ProtectedRoute ทุกหน้า                     │
    └──────────────────────────────────────────────────┘
```

### 4.2 Student Login Detail

```
User กรอก:
  roomCode = "PROMPT-101"
  studentId = "6401"
  username = "น้องไทเกอร์ ม.2/1"

↓

loginStudent(roomCode, studentId, username):
  1. initDefaultData() → สร้าง default rooms ถ้ายังไม่มี
  2. ตรวจสอบ roomCode ใน localStorage ROOMS_KEY
  3. Validate studentId (ห้ามว่าง) + username (≥2 ตัวอักษร)
  4. สร้าง session:
     {
       userId: "usr_PROMPT-101_6401",
       studentId: "6401",
       username: "น้องไทเกอร์ ม.2/1",
       roomCode: "PROMPT-101",
       roomName: "ห้องเรียนวิชา AI & Prompt Engineering (Demo)",
       role: "student",
       loginAt: "2026-07-27T..."
     }
  5. Save session → localStorage SESSION_KEY
  6. ensureNeonTables() → CREATE TABLE IF NOT EXISTS profiles, attempts
  7. INSERT profile into Neon (ON CONFLICT DO NOTHING)
  8. Fetch ALL attempts for room from Neon → merge into localStorage
  9. Return session → navigate('/stages')
```

### 4.3 Teacher Login Detail

```
User กรอก:
  roomCode = "PROMPT-101"
  pin = "1234"

↓

loginTeacher(roomCode, pin):
  1. ตรวจสอบ roomCode → ต้องพบใน rooms list
  2. ตรวจสอบ pin → ต้องเท่ากับ room.teacher_pin
  3. สร้าง session:
     {
       userId: "teacher_xxxxxxxxx",
       username: "คุณครูผู้สอน",
       role: "teacher",
       roomCode, roomName, loginAt
     }
  4. Save → localStorage
  5. navigate('/teacher')
```

### 4.4 Main Gameplay Loop (Student)

```
┌──────────────────────────────────────────────────────────────────┐
│                   STAGE LIST PAGE (/stages)                       │
│                                                                   │
│  แสดง 3 Tabs:                                                     │
│  ┌─────────┐  ┌──────────────┐  ┌────────────────────┐           │
│  │ Stages   │  │ คลังสูตรลับ    │  │ อันดับ & เหรียญ      │           │
│  │          │  │ 7 ด้าน        │  │ รางวัล              │           │
│  └────┬─────┘  └──────────────┘  └────────────────────┘           │
│       │                                                            │
│       ▼                                                            │
│  แบ่งเป็น 2 ส่วน:                                                  │
│  - เกาะการเรียนรู้ (Tutorial 5 ด่าน): Stage 0.1 — 0.5             │
│  - ด่านแข่งขัน (Main 5 ด่าน): Stage 1 — 5                          │
│                                                                   │
│  แต่ละด่านแสดง: จำนวน attempts, คะแนนสูงสุด, สถานะผ่าน/ไม่ผ่าน      │
│  ผ่าน = คะแนนสูงสุด ≥ 12/20                                       │
└───────────────────┬──────────────────────────────────────────────┘
                    │ ผู้ใช้คลิก Stage → navigate(`/play/${stage.id}`)
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                   PLAY STAGE PAGE (/play/:stageId)                │
│                                                                   │
│  Layout:                                                          │
│  ┌──────────┬─────────────────────────────────────────────┐      │
│  │  Sidebar  │  ChatHeader (Stage info, score, attempts)   │      │
│  │  (Stage   │─────────────────────────────────────────────│      │
│  │  Navigator)│  Problem Statement Accordion                │      │
│  │           │─────────────────────────────────────────────│      │
│  │           │  Chat Messages Area (Scrollable)            │      │
│  │           │  - Previous attempts history                 │      │
│  │           │  - AI responses with FeedbackCard            │      │
│  │           │─────────────────────────────────────────────│      │
│  │           │  ChatInput Bar (fixed bottom)               │      │
│  │           │  - Formula Tag pills [ROLE][CONTEXT]...     │      │
│  │           │  - Starters drawer                          │      │
│  │           │  - Textarea + Send button                    │      │
│  └──────────┴─────────────────────────────────────────────┘      │
│                                                                   │
│  Components:                                                      │
│  - StageSidebar (ซ้าย) — select ด่านอื่น                            │
│  - ChatHeader (บน) — stage title, attempts left, max score        │
│  - ChatMessage — display user prompt + AI response                │
│  - FeedbackCard — คะแนน 4 มิติ + feedback ภาษาไทย                  │
│  - ChatInput — prompt input + formula tags + starters             │
│  - BeforeAfterModal — เปรียบเทียบ Attempt 1 vs ล่าสุด               │
│  - PromptCheatSheetModal — สูตรลับการเขียน Prompt                   │
└───────────────────┬──────────────────────────────────────────────┘
                    │
                    ▼
         User prints prompt → handlePromptSubmit()
```

### 4.5 Prompt Evaluation Flow (Critical Path)

```
User พิมพ์ Prompt → กด Enter (or click Send)
│
├─ validate: attempts.length < 3 (โควต้า 3 ครั้ง/ด่าน)
│
├─ Add user message to messages[] (แสดงทันที)
│
├─ setIsLoading(true) → แสดง Thinking Indicator
│
└─ evaluatePrompt({ promptText, stage, previousAttemptsCount })
   │  (src/lib/evaluatorEngine.js)
   │
   ├─── TRY: callKKUProxy(promptText, stage)
   │    │
   │    │  fetch('/api/evaluate', {
   │    │    method: 'POST',
   │    │    body: { systemPrompt }   ← FULL system prompt
   │    │  })
   │    │
   │    │  ┌───────────────────────────────────────────────────┐
   │    │  │ systemPrompt (ภาษาไทย, ยาว ~2000+ chars)          │
   │    │  │                                                   │
   │    │  │ งานที่ 1: "ตอบตามคำสั่งใน prompt ของนักเรียน"        │
   │    │  │   - Execute prompt ของนักเรียน → ได้ aiOutput      │
   │    │  │   - ถ้าเป็นแท็กเปล่า → ตอบ "โปรดระบุรายละเอียด..."   │
   │    │  │                                                   │
   │    │  │ งานที่ 2: "ให้คะแนนจากสิ่งที่นักเรียนเขียนจริง"       │
   │    │  │   4 เกณฑ์ (อย่างละ 1-5 คะแนน):                     │
   │    │  │   1. clarity — ความชัดเจน                           │
   │    │  │   2. completeness — ความครบถ้วน                    │
   │    │  │   3. technique — การใช้เทคนิค PE                    │
   │    │  │   4. quality — คุณภาพโดยรวม                        │
   │    │  │                                                   │
   │    │  │ ตอบเป็น JSON:                                     │
   │    │  │ { scores, feedback: { what_worked, what_missing,  │
   │    │  │   suggestion }, aiOutput }                        │
   │    │  │   ทั้งหมดเป็นภาษาไทย                                │
   │    │  └───────────────────────────────────────────────────┘
   │    │
   │    ▼
   │  ┌─────────────────┐
   │  │ /api/evaluate.js │ (Vercel Serverless)
   │  │                 │
   │  │ CORS headers    │
   │  │ → KKU API:      │
   │  │   POST /chat/completions
   │  │   model: deepseek-v4-flash
   │  │   Authorization: Bearer KKU_API_KEY
   │  │   timeout: 25s   │
   │  └────────┬────────┘
   │           │
   │           ▼
   │  ┌─────────────────┐
   │  │ KKU API returns │
   │  │ { choices[0].   │
   │  │   message.content}
   │  └────────┬────────┘
   │           │
   │           ▼  (กลับมาที่ Frontend)
   │  Parse JSON, extract scores + feedback + aiOutput
   │  Return { scores, totalScore (4-20), maxScore: 20, feedback, aiOutput, source: 'ai' }
   │
   ├─── CATCH (if KKU fails / timeout):
   │    ↓
   │    evaluateWithHeuristics(promptText, stage)
   │    (Rule-based fallback ใน client-side)
   │    │
   │    │  วิเคราะห์ prompt ด้วย Regex patterns:
   │    │  - นับจำนวนตัวอักษร, จำนวนประโยค
   │    │  - ตรวจจับแท็กเปล่า [ROLE] [CONTEXT]... (ไม่มีเนื้อหา)
   │    │  - ตรวจจับ: Role, Context, Task, Format, Constraints
   │    │  - ตรวจจับเทคนิค: Chain-of-Thought, Few-Shot
   │    │
   │    │  คำนวณคะแนน clarity(1-5), completeness(1-5),
   │    │  technique(1-5), quality(1-5)
   │    │
   │    │  สร้าง feedback ภาษาไทยแบบ Rule-based
   │    │  - what_worked, what_missing, suggestion
   │    │
   │    │  Return { scores, totalScore, source: 'heuristic' }
   │
   └─ Return result
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Post-Evaluation (in PlayStage.jsx):                            │
│                                                                  │
│  1. saveAttempt() → localStorage + sync to Neon                 │
│     - สร้าง attempt object (id, promptText, aiOutput, scores...) │
│     - Push ลง localStorage ATTEMPTS_KEY                         │
│     - INSERT INTO Neon attempts table                           │
│                                                                  │
│  2. Update attempts[] state                                     │
│                                                                  │
│  3. Add AI response to messages[] (ChatMessage + FeedbackCard)   │
│                                                                  │
│  4. If totalScore ≥ 14 → playVictoryChime() + canvas-confetti   │
│                                                                  │
│  5. setIsLoading(false)                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Scoring System (4 Dimensions × 5 Points = 20 Max)

| เกณฑ์                           | คะแนนเต็ม | คำอธิบาย                                                                 |
| ------------------------------- | --------- | ------------------------------------------------------------------------ |
| **Clarity** (ความชัดเจน)        | 5         | คำสั่งกระชับ ไม่กำกวม สื่อสารเจตนาชัดเจน                                 |
| **Completeness** (ความครบถ้วน)  | 5         | ครอบคลุม Role, Context, Task, Format, Constraints                        |
| **Technique** (การใช้เทคนิค PE) | 5         | Role-playing, Few-shot, Chain-of-Thought, Output Formatting, Constraints |
| **Quality** (คุณภาพผลลัพธ์)     | 5         | ผลลัพธ์ตรงโจทย์ ถูกต้อง นำไปใช้ได้จริง                                   |

**เกณฑ์ผ่าน:** ≥ 12/20 คะแนน

#### Scoring Flow Diagram:

```
Prompt ของนักเรียน
       │
       ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  AI Evaluator (KKU API)  │────►│  4 Scores (1-5 each)    │
│  or                      │     │  + totalScore (4-20)    │
│  Heuristic Engine         │     │  + Thai Feedback       │
└─────────────────────────┘     └─────────────────────────┘
```

---

## 📄 5. Page-by-Page Architecture

### 5.1 Home (`/`) — `src/pages/Home.jsx`

**หน้าที่:** Login page สำหรับทั้ง Student และ Teacher

**UI Structure:**

```
┌──────────────────────────────────────┐
│  Header (Logo + Mode Toggle)         │
├──────────────┬───────────────────────┤
│  Left Side   │  Right Side (Card)    │
│  - Mascot    │  Tab: Student/Teacher │
│    (Promptie)│                       │
│  - Speech    │  Student Form:        │
│    Bubble    │  - Room Code          │
│  - Taglines  │  - Student ID         │
│  - Hero      │  - Username           │
│    Image     │  - Submit Button      │
│              │                       │
│              │  Teacher Form:        │
│              │  - Room Code          │
│              │  - PIN                │
│              │  - Submit Button      │
├──────────────┴───────────────────────┤
│  Footer                              │
└──────────────────────────────────────┘
```

**Key Features:**

- Floating canvas particles animation (background)
- Mascot cycling messages (เปลี่ยนทุก 4.5 วินาที)
- Tab switcher ระหว่าง Student/Teacher
- Form validation + error handling

### 5.2 Stage List (`/stages`) — `src/pages/StageList.jsx`

**หน้าที่:** เลือกด่าน, ดูสูตรลับ, ดู Leaderboard

**3 Tabs:**

1. **Stages Tab** — แสดงด่านแบบ 2-column:
   - Left: Tutorial Island (5 mini-stages 0.1–0.5)
   - Right: Battle Arenas (5 main stages 1–5)
2. **Formula Tab** — คลังสูตรลับ 7 ด้าน (Clarity, Role, Context, Task, Constraints, Format, Refinement)
3. **Leaderboard Tab** — Top 5 + Achievements badges

**Key Features:**

- MascotHeroBanner (CuteMascotHeroBanner component)
- ด่านที่ผ่านแล้ว → แสดง checkmark + emerald background
- ด่านปัจจุบัน → blue pulse animation
- Achievements ปลดล็อก vs lock (4 เหรียญ)
- Level indicator (Lvl 1–5)

### 5.3 Play Stage (`/play/:stageId`) — `src/pages/PlayStage.jsx`

**หน้าที่:** Gameplay หลัก — อ่านโจทย์ → เขียน Prompt → ส่ง → รับ Feedback

**UI Layout:**

```
┌──────────┬──────────────────────────────────────────┐
│ Sidebar  │ ChatHeader                               │
│ (Stage   │ [PanelLeft] [← เลือกด่าน] | Stage 0.1    │
│  Nav)    │          [Growth Compare] [🏆 15] [🔄 2/3]│
│          ├──────────────────────────────────────────┤
│          │ Problem Accordion (collapsible)           │
│          │ ┌──────────────────────────────────────┐ │
│          │ │ 📋 คำอธิบายโจทย์ & เงื่อนไขบังคับ      │ │
│          │ │ - problem_statement                   │ │
│          │ │ - constraints (list)                  │ │
│          │ │ - expected_criteria (list)            │ │
│          │ └──────────────────────────────────────┘ │
│          ├──────────────────────────────────────────┤
│          │ Chat Messages Area                       │
│          │ ┌──────────────────────────────────────┐ │
│          │ │ 🤖 System: Welcome message            │ │
│          │ │    (Stage info + criteria)            │ │
│          │ ├──────────────────────────────────────┤ │
│          │ │ 👤 User: Prompt text                  │ │
│          │ ├──────────────────────────────────────┤ │
│          │ │ 🤖 AI: aiOutput + FeedbackCard        │ │
│          │ │    - 4 Score bars (color-coded)       │ │
│          │ │    - what_worked (green)              │ │
│          │ │    - what_missing (amber)             │ │
│          │ │    - suggestion (sky)                 │ │
│          │ └──────────────────────────────────────┘ │
│          ├──────────────────────────────────────────┤
│          │ Loading Indicator (3 bouncing dots)      │
│          ├──────────────────────────────────────────┤
│          │ ChatInput (fixed bottom)                 │
│          │ [ROLE] [CONTEXT] [TASK] [CONSTRAINTS]   │
│          │ [FORMAT]                                 │
│          │ 💡 ตัวช่วยคิด Prompt (starters)          │
│          │ ┌──────────────────────────────────┐    │
│          │ │ Textarea ...              [📤]    │    │
│          │ └──────────────────────────────────┘    │
│          │ Enter → send | Shift+Enter → newline    │
│          └──────────────────────────────────────────┘
└──────────┴──────────────────────────────────────────┘
```

**Key Features:**

- Chat-style interface (จำลอง ChatGPT)
- Progress history แสดงใน chat flow
- Quick formula tag insert pills
- Starter templates (ตัวอย่าง Prompt)
- Hint display (เคล็ดลับประจำด่าน)
- Before/After Growth Comparison Modal
- Victory chime + confetti (≥14/20)

### 5.4 Leaderboard (`/leaderboard`) — `src/pages/Leaderboard.jsx`

**หน้าที่:** ตารางคะแนนรวม + เหรียญรางวัล + 3D Podium

**UI Structure:**

```
┌──────────────────────────────────────────────┐
│  Navbar: [← กลับ] Leaderboard ห้อง XXXXX     │
├──────────────────────────────────────────────┤
│  เหรียญรางวัลเกียรติยศของคุณ:               │
│  [🚀 Pioneer] [⚡️ High Scorer] ...          │
├──────────────────────────────────────────────┤
│  3D Podium (Top 3)                           │
│        🥇                                    │
│      /    \                                   │
│    🥈      🥉                                │
├──────────────────────────────────────────────┤
│  🔍 ค้นหานักเรียน...                         │
├──────────────────────────────────────────────┤
│  Table:                                      │
│  # | ชื่อ/รหัส | ด่านที่ผ่าน | คะแนนรวม      │
│  1 | [6401] น้องไทเกอร์ (คุณ) | 3/10 | 45   │
│  2 | ...                                     │
└──────────────────────────────────────────────┘
```

### 5.5 Teacher Dashboard (`/teacher`) — `src/pages/TeacherDashboard.jsx`

**หน้าที่:** Dashboard สำหรับครูผู้สอน ดูภาพรวม + รายคน + Export

**UI Structure:**

```
┌──────────────────────────────────────────────┐
│  Navbar: Teacher Admin | [Export CSV] [Logout]│
├──────────────────────────────────────────────┤
│  Metric Cards (3):                           │
│  👥 จำนวนนักเรียน | 📊 ด่านทำมากสุด | ⭐ ค่าเฉลี่ย│
├──────────────────────────────────────────────┤
│  SECTION 1: ตารางคะแนนนักเรียนแยกรายคน       │
│  (Sortable, expandable — ดูรายด่าน/รายเกณฑ์)  │
│                                               │
│  # | รหัส | ชื่อ | ด่านที่ผ่าน | คะแนน | 🔽   │
│  ──────────────────────────────────────────── │
│  1 | 6401 | น้องไทเกอร์ | 3/10 | 45 | [ดู]   │
│    └─ Expanded:                               │
│       Stage 0.1: 18/20 (C:5 Co:4 T:4 Q:5)   │
│       Stage 0.2: 15/20 (...)                 │
│       Stage 0.3: 12/20 (...)                 │
│       Stage 1: ยังไม่เล่น                     │
│       ...                                     │
├──────────────────────────────────────────────┤
│  SECTION 2: คะแนนเฉลี่ยภาพรวมระดับด่าน        │
│  (Per-stage analytics)                       │
│                                               │
│  Stage | นักเรียน | Clarity | Complete | ... │
│  0.1   | 25 คน   | 3.8     | 3.5      | ... │
│  0.2   | 20 คน   | 3.2     | 3.0      | ... │
└──────────────────────────────────────────────┘
```

**Key Features:**

- Export CSV (รายคน + คะแนนแยกรายด่าน)
- Individual student drill-down (expand → see all 10 stages)
- Per-stage average analytics
- Sorted by total points descending

---

## 🗄️ 6. Data Architecture & Persistence

### 6.1 Dual-Layer Storage Strategy

```
┌─────────────────────────────────────────────┐
│            PRIMARY: localStorage             │
│  (always available, offline-first)           │
│                                              │
│  Keys:                                       │
│  - prompt_battle_session: user session       │
│  - prompt_battle_attempts: all attempts[]    │
│  - prompt_battle_rooms: room definitions[]   │
│                                              │
│  ใช้สำหรับ:                                  │
│  - Auth state (current user)                 │
│  - Game progress (attempts, scores)          │
│  - Leaderboard calculation                   │
│  - Teacher analytics                         │
└──────────────────┬──────────────────────────┘
                   │ (optional, if NEON configured)
                   ▼
┌─────────────────────────────────────────────┐
│          SECONDARY: Neon Postgres             │
│  (cloud sync, shared data)                   │
│                                              │
│  Tables:                                     │
│  - profiles: room_code, username, role       │
│  - attempts: room_code, username, stage_id,  │
│    attempt_number, prompt_text, ai_output,   │
│    scores (JSONB), feedback (JSONB),         │
│    total_score                               │
│                                              │
│  ใช้สำหรับ:                                  │
│  - Cross-device profile sync                 │
│  - Shared room attempt backup                │
│  - Cross-session attempt merge               │
└─────────────────────────────────────────────┘
```

### 6.2 Data Flow on Login:

```
1. loginStudent() / loginTeacher()
   → Save session to localStorage

2. If Neon configured:
   → ensureNeonTables() (CREATE TABLE IF NOT EXISTS)
   → INSERT profile (ON CONFLICT DO NOTHING)
   → fetchRoomAttemptsFromNeon(roomCode)
   → Merge Neon attempts into localStorage
     (deduplicate by attempt.id)
```

### 6.3 Data Flow on Attempt Save:

```
1. saveAttempt(stageId, promptText, ...)
   → Create attempt object with unique ID
   → Push to localStorage ATTEMPTS_KEY
   → If Neon configured:
     → INSERT INTO attempts (...)
     → RETURNING id
```

### 6.4 Data Query in localStorage:

```
getLeaderboard(roomCode)
  → Read all attempts from localStorage
  → Filter by roomCode
  → Group by userId → sum max scores per stage
  → Sort by totalPoints desc
  → Return leaderboard[]

getTeacherAnalytics(roomCode)
  → Filter attempts by roomCode
  → Group by stageId
  → Calculate avg clarity, completeness, technique, quality
  → Return stage-level statistics

getUserAchievements()
  → Check user's attempts against achievement criteria
  → 4 achievements: Pioneer, High Scorer, Master, Champion
```

---

## 🧩 7. Component Tree & Data Flow

```
App.jsx
├─ AuthProvider (Context: user, loading, login/logout)
│  └─ BrowserRouter
│     ├─ Route "/" → Home.jsx
│     │   ├─ useAuth().loginStudent()  ──► sessionStorage.loginStudent()
│     │   └─ useAuth().loginTeacher()  ──► sessionStorage.loginTeacher()
│     │
│     ├─ ProtectedRoute → Route "/stages" → StageList.jsx
│     │   ├─ CuteMascotHeroBanner
│     │   ├─ Tab: Stages
│     │   │   ├─ getUserStageAttempts() → localStorage
│     │   │   ├─ getLeaderboard() → localStorage
│     │   │   └─ STAGES_DATA → stagesData.js
│     │   ├─ Tab: Formula (7 formula cards)
│     │   ├─ Tab: Leaderboard
│     │   │   ├─ getLeaderboard()
│     │   │   └─ getUserAchievements()
│     │   └─ PromptCheatSheetModal
│     │
│     ├─ ProtectedRoute → Route "/play/:stageId" → PlayStage.jsx
│     │   ├─ StageSidebar
│     │   ├─ ChatHeader
│     │   ├─ ChatMessage
│     │   │   └─ FeedbackCard
│     │   ├─ ChatInput
│     │   │   ├─ Formula tag pills [ROLE][CONTEXT]...
│     │   │   └─ Starter templates
│     │   ├─ BeforeAfterModal
│     │   ├─ PromptCheatSheetModal
│     │   └─ evaluatePrompt() ──► evaluatorEngine.js
│     │       └─ fetch('/api/evaluate') ──► api/evaluate.js ──► KKU API
│     │
│     ├─ ProtectedRoute → Route "/leaderboard" → Leaderboard.jsx
│     │   ├─ getLeaderboard()
│     │   └─ getUserAchievements()
│     │
│     └─ ProtectedRoute → Route "/teacher" → TeacherDashboard.jsx
│         ├─ getTeacherAnalytics()
│         └─ getStudentDetailedScores()
```

---

## 📦 8. Key Libraries & Modules Detail

### 8.1 `src/lib/evaluatorEngine.js` — AI Evaluation Engine

**Exports:**

- `evaluatePrompt({ promptText, stage, previousAttemptsCount })` → `{ scores, totalScore, feedback, aiOutput, source }`

**Flow:**

1. Try `callKKUProxy()` — ส่ง system prompt ภาษาไทยไป KKU API via Vercel proxy
2. On failure → `evaluateWithHeuristics()` — Rule-based regex analysis

**System Prompt Strategy:**

- งานที่ 1: Execute student's prompt → generate output
- งานที่ 2: Score with detailed rubric (1-5 per dimension) → Thai feedback
- ตัวอย่าง scoring rubric ใน system prompt (ตัวอย่างจริง: แท็กเปล่า = 1, "ช่วยสรุปโลกร้อน" = 2-3, prompt ดีพร้อม role/context/task/constraints = 4-5)

### 8.2 `src/lib/sessionStorage.js` — Data Persistence Module

**Exports:**

- `loginStudent(roomCode, studentId, username)` → session
- `loginTeacher(roomCode, pin)` → session
- `getCurrentUser()` → session | null
- `logout()` → void
- `saveAttempt({...})` → attempt object
- `getUserStageAttempts(stageId)` → attempts[]
- `getAllUserAttempts()` → attempts[]
- `getLeaderboard(roomCode)` → leaderboard[]
- `getUserAchievements()` → achievements[]
- `getTeacherAnalytics(roomCode)` → analytics[]
- `getStudentDetailedScores(roomCode)` → students[]

### 8.3 `src/lib/neonClient.js` — Neon Database Client

**Exports:**

- `sql` — Neon SQL tagged template (or null if not configured)
- `isNeonConfigured` — boolean

**Configuration:** Requires `VITE_NEON_DATABASE_URL` environment variable

### 8.4 `api/evaluate.js` — Vercel Serverless Proxy

**Route:** `POST /api/evaluate`
**Environment Variables:**

- `VITE_KKU_BASE_URL` — KKU API base (default: `https://gen.ai.kku.ac.th/api/v1`)
- `VITE_KKU_API_KEY` — KKU API authentication key

**Flow:**

1. Receive `{ systemPrompt }` from frontend
2. Forward to KKU API `/chat/completions` with model `deepseek-v4-flash`
3. Return `{ content: "..." }` to frontend
4. CORS enabled (allow all origins)

### 8.5 `src/data/stagesData.js` — Stage Content Database

**Exports:** `STAGES_DATA` — Array of 10 stage objects

**Structure of each stage:**

```javascript
{
  id: number,              // 1–10
  stage_number: string,    // "0.1" – "5"
  is_tutorial: boolean,    // true/false
  title: string,           // Thai title
  difficulty: string,      // "ง่ายมาก" – "ท้าทายระดับบอส"
  description: string,     // Short description
  problem_statement: string,// Detailed problem
  expected_criteria: {     // 4 criteria expectations
    clarity: string,
    completeness: string,
    technique: string,
    quality: string
  },
  constraints: string[],   // Required conditions
  starters: string[],      // Example prompts
  hint: string             // Tip for this stage
}
```

**Stage Progression:**
| ID | Stage # | Type | Topic |
|----|---------|------|-------|
| 1 | 0.1 | Tutorial | การกำหนดบทบาท (Role) และเป้าหมาย (Task) |
| 2 | 0.2 | Tutorial | การเพิ่มบริบท (Context) และข้อจำกัด |
| 3 | 0.3 | Tutorial | การกำหนดรูปแบบผลลัพธ์ (Output Format) |
| 4 | 0.4 | Tutorial | เทคนิค Few-Shot Prompting |
| 5 | 0.5 | Tutorial | เทคนิค Chain of Thought |
| 6 | 1 | Battle | สกัดข้อมูลสำคัญจากบทความยาว |
| 7 | 2 | Battle | เขียนบทสคริปต์วิดีโอสั้น TikTok/Reels |
| 8 | 3 | Battle | สวมบทบาท Tutor ติวเตอร์สอนภาษาอังกฤษ |
| 9 | 4 | Battle | ออกแบบโค้ดดิ้ง Python & ลอจิกโปรแกรม |
| 10 | 5 | Battle | ศึกบอสใหญ่ - วางแผนกลยุทธ์การตลาดธุรกิจ |

### 8.6 `src/lib/soundEffects.js` — Audio Feedback

Provides sound effect functions: `playPopSound()`, `playVictoryChime()`, `playStarTwinkleSound()`, `playMascotBlipSound()`, `playWhooshSubmitSound()`, `toggleMute()`, `getMuteState()`.

---

## 🎮 9. Gamification Elements

| Element                 | Implementation                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| **Mascot (Promptie)**   | Animated mascot with cycling speech bubbles, clickable for new messages                            |
| **Stars/Points**        | Each stage yields 0–20 points (max per stage), accumulated across stages                           |
| **Levels**              | Level = clearedCount + 1 (based on tutorial stages passed ≥12)                                     |
| **Achievements**        | 4 badges: Prompt Pioneer, High Scorer (≥16/20), Master Prompter (≥5 stages), Hall of Famer (Top 3) |
| **Confetti**            | Triggered when score ≥14/20                                                                        |
| **Victory Chime**       | Plays on high scores                                                                               |
| **Before/After Growth** | Side-by-side comparison of first vs last attempt                                                   |
| **Progress Bars**       | Color-coded criteria bars (green/amber/red) in FeedbackCard                                        |
| **Podium**              | 3D-style podium for Top 3 on Leaderboard page                                                      |
| **Sound Effects**       | Click, submit, celebration, mascot blip sounds (toggleable mute)                                   |

---

## 🚀 10. Deployment Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  GitHub Repo     │────►│  Vercel (Free)    │────►│  Neon (Free)      │
│  (source code)   │     │                   │     │  Serverless PG    │
│                  │     │  Hosts:           │     │                   │
│                  │     │  - Static SPA     │     │  - profiles table │
│                  │     │  - /api/evaluate  │     │  - attempts table │
│                  │     │    (serverless)   │     │                   │
│                  │     │                   │     │                   │
│                  │     │  Config:          │     │  Connection:      │
│                  │     │  vercel.json      │     │  VITE_NEON_       │
│                  │     │  - SPA rewrites   │     │  DATABASE_URL     │
│                  │     │  - /api proxy     │     │                   │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                  │
                                  │ (Proxy)
                                  ▼
                         ┌──────────────────┐
                         │  KKU AI API       │
                         │  gen.ai.kku.ac.th │
                         │  deepseek-v4-flash│
                         └──────────────────┘
```

**Vercel Configuration (`vercel.json`):**

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- All non-API routes → serve `index.html` (SPA client-side routing)
- `/api/*` routes → serverless functions in `api/` directory

---

## 🔒 11. Security Considerations

1. **API Key Protection:** KKU API key stored as environment variable on Vercel server side (`VITE_KKU_API_KEY`), never exposed to client
2. **Serverless Proxy:** Frontend never directly calls KKU API — all requests routed through `/api/evaluate` Vercel function
3. **Teacher PIN:** Simple 4-digit PIN stored in localStorage (not secure for production, intended for classroom use)
4. **No Server-Side Auth:** Entire auth system is localStorage-based (session-based, anonymous)
5. **Prompt Injection Mitigation:** System prompt explicitly separates "player input" from "evaluation instructions" — player prompt is quoted within system prompt as work assignment

---

## 📊 12. Analytics & Reporting

### Teacher Dashboard Analytics:

- **จำนวนนักเรียนที่เข้าเล่น** — distinct student count
- **ด่านที่มีการทำมากที่สุด** — most played stage
- **คะแนนเฉลี่ยรวมทั้งห้อง** — average across all stages
- **คะแนนเฉลี่ยต่อด่าน (Stage Overview)** — 4 criteria averages per stage
- **คะแนนนักเรียนแยกรายคน** — per-student per-stage drill-down

### Export:

- CSV download with: Rank, Student ID, Username, Stages Completed, Total Points, Stage Scores

---

## 📁 13. Complete File Structure

```
prompt-battle/
├── api/
│   └── evaluate.js              # Vercel Serverless Proxy → KKU API
├── public/
│   └── assets/
│       ├── hero.webp            # Hero banner image
│       ├── logo.webp            # App logo
│       ├── mascot.webp          # Promptie mascot image
│       ├── mascot_video_frame.webp
│       ├── rpg_island.webp      # Island background
│       ├── rpg_island_video.webp
│       └── rpg_island_video.webm
├── src/
│   ├── __tests__/
│   │   ├── evaluatorEngine.test.js
│   │   └── sessionStorage.test.js
│   ├── components/
│   │   ├── BeforeAfterModal.jsx      # Growth comparison modal
│   │   ├── CuteMascotHeroBanner.jsx   # Mascot hero banner (StageList)
│   │   ├── MascotWidget.jsx          # Mascot widget (reusable)
│   │   ├── PromptCheatSheetModal.jsx # Prompt formula cheat sheet
│   │   ├── StageSidebar.jsx          # Stage navigation sidebar
│   │   └── chat/
│   │       ├── ChatHeader.jsx        # Top bar in PlayStage
│   │       ├── ChatInput.jsx         # Bottom input bar
│   │       ├── ChatMessage.jsx       # Message bubble (user/AI)
│   │       └── FeedbackCard.jsx      # Score + feedback display
│   ├── data/
│   │   └── stagesData.js            # All 10 stage definitions
│   ├── hooks/
│   │   └── useAuth.jsx              # Auth context provider
│   ├── lib/
│   │   ├── evaluatorEngine.js       # AI + heuristic evaluation
│   │   ├── neonClient.js            # Neon DB client
│   │   ├── sessionStorage.js        # Data persistence (localStorage + Neon sync)
│   │   └── soundEffects.js          # Sound effect utilities
│   ├── pages/
│   │   ├── Home.jsx                 # Login page
│   │   ├── Leaderboard.jsx          # Leaderboard page
│   │   ├── PlayStage.jsx            # Main gameplay page
│   │   ├── StageList.jsx            # Stage selection page
│   │   └── TeacherDashboard.jsx     # Teacher analytics
│   ├── App.jsx                      # Router + Route definitions
│   ├── index.css                    # Global styles (Tailwind)
│   └── main.jsx                     # React entry point
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   # Legacy Supabase migration
│       └── 002_neon_schema.sql      # Neon schema migration
├── .gitignore
├── .env.local                       # Environment variables (local dev)
├── index.html                       # HTML entry
├── package.json                     # Dependencies + scripts
├── PROJECT_PLAN.md                  # Original project plan (Thai)
├── vercel.json                      # Vercel routing config
└── vite.config.js                   # Vite + Tailwind + Vitest config
```

---

## 🔄 14. Complete Data Flow Summary

```
Student opens app
       │
       ▼
┌──────────┐    loginStudent()     ┌──────────────┐    sync    ┌──────────┐
│  Home.jsx │─────────────────────►│ localStorage  │──────────►│  Neon DB  │
│  /        │                      │ (primary DB)  │◄─────────│ (cloud)  │
└──────────┘                      └──────┬───────┘   merge    └──────────┘
       │                                  │
       │ navigate('/stages')              │ getLeaderboard()
       ▼                                  │ getUserAchievements()
┌──────────────┐                          │ getTeacherAnalytics()
│  StageList   │◄─────────────────────────┘
│  /stages     │
└──────┬───────┘
       │ navigate(`/play/${stage.id}`)
       ▼
┌──────────────┐    evaluatePrompt()    ┌──────────────────┐
│  PlayStage   │───────────────────────►│ evaluatorEngine  │
│  /play/:id   │                        │                  │
│              │◄───────────────────────│                  │
│              │  {scores, feedback,    └────────┬─────────┘
│              │   aiOutput}                     │
│              │                                 │ fetch()
│              │    saveAttempt()               ▼
│              │──────────────────►  ┌──────────────────┐
│              │                    │ /api/evaluate     │
│              │                    │ (Vercel Function) │
│              │                    └────────┬─────────┘
│              │                             │
│              │                    ┌────────▼─────────┐
│              │                    │ KKU AI API        │
│              │                    │ deepseek-v4-flash │
│              │                    └──────────────────┘
└──────────────┘
       │
       │ (เล่นครบ 3 attempts หรือกดผ่านด่าน)
       ▼
┌──────────────┐
│  Leaderboard │◄── getLeaderboard()
│  /leaderboard│
└──────────────┘
```

---

## 🧪 15. Testing

Tests in `src/__tests__/`:

- `evaluatorEngine.test.js` — Tests heuristic scoring engine
- `sessionStorage.test.js` — Tests localStorage data persistence

Run with: `npx vitest` (configured in `vite.config.js` with `happy-dom` environment)

---

## 📝 16. Key Architectural Decisions

1. **Offline-First Architecture:** localStorage is the primary database; Neon is optional cloud sync. This means the app works fully even without internet (except AI evaluation).
2. **Serverless AI Proxy:** KKU API key is never exposed to the browser. All AI calls go through Vercel's edge function.
3. **Dual Evaluation Strategy:** AI evaluation (KKU) + heuristic fallback ensures the game never breaks even if the API is down.
4. **Thai-Language-First:** All UI, feedback, scoring rubrics, system prompts are in Thai language.
5. **No Backend Framework:** The entire app is a static SPA + one serverless function. No Express, no Node server needed.
6. **Gamification-First UX:** Mascot, confetti, sounds, 3D podium, achievements — designed to feel like a game, not a quiz.
7. **Room-Based Multiplayer:** Students join via "room code" — enables classroom-based leaderboards and teacher monitoring.

---

> **เอกสารนี้จัดทำขึ้นสำหรับใช้เป็นข้อมูลอ้างอิงประกอบงานวิจัย**  
> **Project:** Prompt Battle — Educational Prompt Engineering Game  
> **Repository:** https://github.com/Exteeth/prompt-battle  
> **Last Updated:** 2026-07-27
