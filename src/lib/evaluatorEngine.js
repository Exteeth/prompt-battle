// 🤖 PROMPT BATTLE EVALUATOR ENGINE
// AI Evaluación Service with KKU IntelSphere API (OpenAI-compatible) + Offline Heuristic Fallback
//
// 🔗 base_url: VITE_KKU_BASE_URL (default: https://gen.ai.kku.ac.th/api/v1)
// 🔑 api_key: VITE_KKU_API_KEY
// 🤖 model:   deepseek-v4-flash
//
// 📋 เกณฑ์ประเมิน 7 ด้าน (Researcher Rubric Framework):
//    1. clarity     — ความชัดเจน
//    2. role        — การกำหนดบทบาท
//    3. context     — การให้บริบท
//    4. task        — การระบุภารกิจ
//    5. constraints — การกำหนดข้อจำกัด
//    6. format      — การกำหนดรูปแบบ
//    7. refinement  — การปรับแก้และทำซ้ำ

const KKU_BASE_URL = import.meta.env.VITE_KKU_BASE_URL || 'https://gen.ai.kku.ac.th/api/v1';
const KKU_MODEL = 'deepseek-v4-flash';

export async function evaluatePrompt({ promptText, stage, previousAttemptsCount = 0 }) {
  const apiKey = import.meta.env.VITE_KKU_API_KEY;

  // If API Key is configured, attempt real LLM API evaluation via KKU
  if (apiKey) {
    try {
      return await evaluateWithLLM(promptText, stage, apiKey);
    } catch (err) {
      console.warn('KKU API Evaluation failed or quota exceeded, falling back to smart heuristic engine:', err);
    }
  }

  // Smart Heuristic Evaluator Engine (Offline / Demo Fallback)
  return evaluateWithHeuristics(promptText, stage);
}

// ----------------------------------------------------
// 1. SMART HEURISTIC EVALUATOR (Offline/Local Engine)
//    ประเมิน 7 ด้าน ด้านละ 1-5 คะแนน รวม 35 คะแนน
// ----------------------------------------------------
function evaluateWithHeuristics(promptText, stage) {
  const text = promptText.trim();
  const charCount = text.length;

  // Initialize all 7 criteria at 3 (baseline)
  let clarity = 3;
  let role = 3;
  let context = 3;
  let task = 3;
  let constraints = 3;
  let format = 3;
  let refinement = 3;

  let whatWorked = [];
  let whatMissing = [];
  let suggestions = [];

  // --- 1. CLARITY (ความชัดเจน) ---
  if (charCount > 80) {
    clarity += 1;
    whatWorked.push('คำสั่งมีความชัดเจน กระชับ สื่อความหมายเจาะจง');
  } else if (charCount < 25) {
    clarity -= 1;
    whatMissing.push('คำสั่งยังสั้นเกินไป ควรสื่อความหมายให้เจาะจงและไม่กำกวม');
  }

  // --- 2. ROLE (การกำหนดบทบาท) ---
  const roleKeywords = ['คุณคือ', 'สวมบทบาท', 'ในฐานะ', 'บทบาท', 'ทำหน้าที่เป็น', 'คุณเป็น'];
  if (roleKeywords.some(k => text.includes(k))) {
    role += 2;
    whatWorked.push('มีการกำหนดบทบาทให้ AI ชัดเจน');
  } else if (stage.problem_statement.includes('บทบาท') || stage.problem_statement.includes('คุณคือ')) {
    role -= 1;
    whatMissing.push('โจทย์นี้ต้องการกำหนดบทบาท แต่คุณยังไม่ได้ใส่ Role');
    suggestions.push('เริ่ม Prompt ด้วย "คุณคือ..." เพื่อกำหนดบทบาทให้ AI');
  }

  // --- 3. CONTEXT (การให้บริบท) ---
  const contextKeywords = ['สำหรับ', 'นักเรียน', 'เด็ก', 'ผู้เรียน', 'ระดับ', 'ประถม', 'มัธยม', 'มหาวิทยาลัย', 'งบประมาณ', 'สภาพแวดล้อม', 'สถานการณ์', 'บริบท'];
  if (contextKeywords.some(k => text.includes(k))) {
    context += 1;
    whatWorked.push('มีการให้บริบท สภาพแวดล้อม หรือข้อมูลพื้นฐาน');
  } else {
    whatMissing.push('ยังไม่ได้ให้บริบทหรือข้อมูลแวดล้อมที่จำเป็น');
    suggestions.push('เพิ่มบริบท เช่น "สำหรับเด็กประถม" หรือ "งบประมาณไม่เกิน..."');
  }

  // --- 4. TASK (การระบุภารกิจ) ---
  const taskKeywords = ['ช่วย', 'จง', 'ขอ', 'สร้าง', 'เขียน', 'สรุป', 'วิเคราะห์', 'ออกแบบ', 'แปล', 'คำนวณ', 'อธิบาย', 'บอก'];
  if (taskKeywords.some(k => text.includes(k))) {
    task += 1;
  }
  if (charCount > 40) {
    task += 1;
    whatWorked.push('ระบุภารกิจหรือเป้าหมายชัดเจน');
  } else {
    whatMissing.push('ควรระบุภารกิจที่ต้องการให้ AI ทำอย่างเฉพาะเจาะจง');
  }

  // --- 5. CONSTRAINTS (การกำหนดข้อจำกัด) ---
  const constraintKeywords = ['ห้าม', 'ไม่ต้อง', 'ไม่เอา', 'ไม่เกิน', 'เท่านั้น', 'จำกัด', 'เฉพาะ', 'เงื่อนไข'];
  if (constraintKeywords.some(k => text.includes(k))) {
    constraints += 2;
    whatWorked.push('มีการกำหนดข้อจำกัด ข้อห้าม หรือขอบเขต');
  } else {
    whatMissing.push('ยังไม่ได้กำหนดข้อจำกัดหรือข้อห้าม');
    suggestions.push('เพิ่มข้อจำกัด เช่น "ห้ามใช้ศัพท์เทคนิค" "ไม่เกิน 3 ข้อ"');
  }

  // --- 6. FORMAT (การกำหนดรูปแบบผลลัพธ์) ---
  const formatKeywords = ['ตาราง', 'markdown', 'json', 'bullet', 'ข้อ', 'รูปแบบ', 'โครงสร้าง', 'คอลัมน์', 'list'];
  if (formatKeywords.some(k => text.toLowerCase().includes(k))) {
    format += 2;
    whatWorked.push('มีการกำหนดรูปแบบผลลัพธ์ที่ต้องการ');
  } else {
    whatMissing.push('ยังไม่ได้ระบุรูปแบบผลลัพธ์ เช่น ตาราง หรือ Bullet Points');
    suggestions.push('ระบุรูปแบบคำตอบ เช่น "ตอบเป็นตาราง Markdown" หรือ "สรุป 3 ข้อ"');
  }

  // --- 7. REFINEMENT (การปรับแก้และทำซ้ำ) ---
  // Heuristic: if prompt mentions iteration, multiple versions, or improvement
  const refinementKeywords = ['ปรับ', 'แก้', 'ทำซ้ำ', 'ลองใหม่', 'พัฒนา', 'improve', 'refine', 'ตัวอย่าง', 'few-shot', 'step-by-step', 'ทีละขั้นตอน'];
  if (refinementKeywords.some(k => text.toLowerCase().includes(k))) {
    refinement += 1;
  }
  if (charCount > 120) {
    refinement += 1;
    whatWorked.push('Prompt มีรายละเอียดเพียงพอสำหรับการปรับปรุงต่อยอด');
  } else {
    whatMissing.push('Prompt ยังสั้น อาจต้องปรับแก้และทำซ้ำเพื่อผลลัพธ์ที่ดีขึ้น');
    suggestions.push('ลองใช้เทคนิค Few-Shot หรือ Step-by-Step เพื่อปรับปรุง');
  }

  // Cap all scores between 1 and 5
  clarity = Math.min(5, Math.max(1, clarity));
  role = Math.min(5, Math.max(1, role));
  context = Math.min(5, Math.max(1, context));
  task = Math.min(5, Math.max(1, task));
  constraints = Math.min(5, Math.max(1, constraints));
  format = Math.min(5, Math.max(1, format));
  refinement = Math.min(5, Math.max(1, refinement));

  const totalScore = clarity + role + context + task + constraints + format + refinement;

  // Generate simulated AI Output based on stage and prompt quality
  const simulatedOutput = generateSimulatedAIOutput(stage, text, totalScore, 35);

  // Construct coaching feedback
  const feedback = {
    what_worked: whatWorked.length > 0 ? whatWorked.join(' • ') : 'เขียน Prompt ภาษาไทยเข้าใจได้ง่าย',
    what_missing: whatMissing.length > 0 ? whatMissing.join(' • ') : 'ยังสามารถระบุข้อจำกัดเพิ่มเติมเพื่อให้ AI ทำงานได้เป๊ะยิ่งขึ้น',
    suggestion: suggestions.length > 0
      ? suggestions.join(' • ')
      : (totalScore >= 28 ? 'Prompt ของคุณยอดเยี่ยมมาก! ลองท้าทายด่านถัดไปได้เลย' : 'ลองระบุเงื่อนไขเป็นข้อๆ และระบุรูปแบบผลลัพธ์ที่ต้องการให้ชัดเจนกว่านี้'),
    hint_only: true
  };

  return {
    scores: { clarity, role, context, task, constraints, format, refinement },
    totalScore,
    maxScore: 35,
    feedback,
    aiOutput: simulatedOutput
  };
}

// Helper to simulate AI Output for the chat view
function generateSimulatedAIOutput(stage, promptText, totalScore, maxScore) {
  if (stage.stage_number === '0.1') {
    return `### สรุปประโยชน์ของ AI ในการศึกษา (สำหรับนักเรียน ม.ปลาย)

1. **ช่วยสรุปเนื้อหาและอธิบายเรื่องยากให้ง่ายขึ้น:** สามารถย่อยบทเรียนที่ซับซ้อนให้เข้าใจง่ายตามสไตล์การเรียนของแต่ละคน
2. **ช่วยเป็นผู้ช่วยติวส่วนตัวได้ 24 ชั่วโมง:** สามารถถามคำถาม ทบทวนข้อสอบ หรือขอตัวอย่างเพิ่มเติมได้ตลอดเวลา
3. **ช่วยวางแผนการเรียนและจัดการเวลา:** ช่วยจัดตารางอ่านหนังสือและวางแผนเตรียมสอบเข้ามหาวิทยาลัยอย่างมีประสิทธิภาพ`;
  }

  if (stage.stage_number === '0.4' || stage.stage_number === '1') {
    return `| ปี (ค.ศ./พ.ศ.) | บุคคลสำคัญ | เหตุการณ์สำคัญ |
| :--- | :--- | :--- |
| พุทธศตวรรษที่ 18 | สมเด็จพระบรมราชาธิราชที่ 1 (ขุนหลวงพะงั่ว) | ทรงรวบรวมอาณาจักรอยุธยาให้มีความมั่นคง |
| ค.ศ. 1592 | สมเด็จพระนเรศวรมหาราช | ทรงกระทำยุทธหัตถีมีชัยชนะเหนือพระมหาอุปราชา |
| ค.ศ. 1767 | สมเด็จพระเจ้าตากสินมหาราช | กอบกู้เอกราชและสถาปนากรุงธนบุรีหลังเสียกรุงครั้งที่ 2 |`;
  }

  if (stage.stage_number === '2' || stage.stage_number === '7') {
    return `**บทละคร: แสงสุดท้ายกลางห้วงอวกาศ**

*(บรรยากาศในห้องควบคุมสถานีอวกาศที่ไฟกำลังริบหรี่)*

**นักบินอวกาศ:** "AI-99... สัญญาณเตือนปริมาณ **ออกซิเจน** ลดลงเหลือไม่ถึง 5% แล้วใช่ไหม?"

**หุ่นยนต์ AI-99:** *(ส่งเสียงติ๊ดเบาๆ)* "ยืนยันครับกัปตัน แต่ระบบสำรองยังคงทำงานเพื่อส่งพิกัดของเราออกไป ท่ามกลางหมู่ **ดวงดาว** นับล้าน ตราบใดที่สัญญาณยังส่งออกไปได้ โปรดเก็บรักษา **ความหวัง** ไว้ครับ"

**นักบินอวกาศ:** *(ยิ้มเจื่อนๆ มองออกไปนอกช่องหน้าต่าง)* "เธอคิดว่าจะมีใครบางคนในจักรวาลนี้ได้ยินเสียงของเราไหม AI-99?"`;
  }

  if (stage.stage_number === '3' || stage.stage_number === '8') {
    return `### 1. อธิบายลอจิกการทำงาน (Step-by-step)
1. ตรวจสอบว่า \`score\` ไม่อยู่ในช่วง 0 - 100 หรือไม่ (ถ้าน้อยกว่า 0 หรือมากกว่า 100 คืนค่า 'Invalid Score')
2. ตรวจสอบช่วงคะแนนจากมากไปน้อย: >= 80 (A), >= 70 (B), >= 60 (C), >= 50 (D), และ < 50 (F)

### 2. โค้ด JavaScript
\`\`\`javascript
function calculateGrade(score) {
  // Edge cases verification
  if (typeof score !== 'number' || score < 0 || score > 100) {
    return 'Invalid Score';
  }

  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}
\`\`\`

### 3. ตัวอย่าง Test Cases
- \`calculateGrade(85)\` ➡️ Output: \`'A'\`
- \`calculateGrade(45)\` ➡️ Output: \`'F'\`
- \`calculateGrade(-10)\` ➡️ Output: \`'Invalid Score'\``;
  }

  // Default response template
  return `สวัสดีครับ! นี่คือผลลัพธ์จาก AI ประมวลผลตาม Prompt ของคุณ:

> "${promptText.slice(0, 100)}${promptText.length > 100 ? '...' : ''}"

**ผลลัพธ์:**
ระบบได้ทำการประมวลผลคำสั่งตามที่คุณระบุครบถ้วนเรียบร้อยแล้ว โดยดึงประเด็นสำคัญและเรียบเรียงให้อ่านง่าย เหมาะสำหรับการนำไปฝึกฝนและพัฒนาต่อยอดทักษะ Prompt Engineering ต่อไปครับ! ✨`;
}

// ----------------------------------------------------
// 2. KKU IntelSphere API EVALUATION (OpenAI-compatible)
//    AI ประเมิน 7 ด้านตาม Rubric Framework (รวม 35 คะแนน)
// ----------------------------------------------------
async function evaluateWithLLM(promptText, stage, apiKey) {
  const systemPrompt = `คุณคือ AI Evaluator ผู้เชี่ยวชาญด้าน Prompt Engineering ทำหน้าที่ประเมินทักษะการเขียน Prompt ของนักเรียนในเกม Prompt Battle

📋 โจทย์ที่นักเรียนต้องทำ: "${stage.problem_statement}"
📌 เงื่อนไขที่คาดหวัง: ${JSON.stringify(stage.expected_criteria)}

✍️ Prompt ของนักเรียน: "${promptText}"

🧪 จงประเมิน Prompt นี้ตามเกณฑ์ 7 ด้าน (Researcher Rubric Framework) โดยให้คะแนนแต่ละด้าน 1-5 คะแนน:

1. clarity (ความชัดเจน) — ใช้ภาษากระชับ ตรงประเด็น ไม่กำกวม
2. role (การกำหนดบทบาท) — ระบุบทบาทหรือตัวตนให้ AI อย่างเหมาะสม
3. context (การให้บริบท) — ให้ข้อมูลพื้นฐาน สภาพแวดล้อม หรือสถานการณ์แวดล้อม
4. task (การระบุภารกิจ) — กำหนดเป้าหมายให้ AI อย่างเฉพาะเจาะจง
5. constraints (การกำหนดข้อจำกัด) — ระบุขอบเขต ข้อห้าม หรือเงื่อนไข
6. format (การกำหนดรูปแบบ) — ระบุโครงสร้างผลลัพธ์ที่ต้องการ
7. refinement (การปรับแก้และทำซ้ำ) — แสดงแนวโน้มการปรับปรุง ทำซ้ำ หรือใช้เทคนิคขั้นสูง

❗โปรดตอบกลับเป็น JSON แท้ๆ เท่านั้น ในรูปแบบนี้:
{
  "scores": {
    "clarity": <1-5>,
    "role": <1-5>,
    "context": <1-5>,
    "task": <1-5>,
    "constraints": <1-5>,
    "format": <1-5>,
    "refinement": <1-5>
  },
  "feedback": {
    "what_worked": "<สิ่งที่นักเรียนทำได้ดี ภาษาไทย>",
    "what_missing": "<จุดที่ยังขาด ภาษาไทย>",
    "suggestion": "<คำแนะนำสไตล์โค้ชชิ่ง ไม่เฉลยคำตอบ ภาษาไทย>"
  },
  "aiOutput": "<ผลลัพธ์ตัวอย่างที่ AI ควรตอบกลับจาก prompt นี้ ภาษาไทย>"
}

⚠️ ห้ามเฉลย Prompt ที่สมบูรณ์แบบ — ให้คำแนะนำแบบโค้ชชิ่งเท่านั้น`;

  const response = await fetch(`${KKU_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: KKU_MODEL,
      messages: [
        { role: 'user', content: systemPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`KKU API error ${response.status}: ${response.statusText}${errorBody ? ' — ' + errorBody : ''}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  const s = parsed.scores;
  const totalScore = (s.clarity || 0) + (s.role || 0) + (s.context || 0) + (s.task || 0) + (s.constraints || 0) + (s.format || 0) + (s.refinement || 0);

  return {
    scores: {
      clarity: s.clarity || 3,
      role: s.role || 3,
      context: s.context || 3,
      task: s.task || 3,
      constraints: s.constraints || 3,
      format: s.format || 3,
      refinement: s.refinement || 3
    },
    totalScore,
    maxScore: 35,
    feedback: parsed.feedback || {
      what_worked: 'AI ได้ประเมินผลแล้ว',
      what_missing: '',
      suggestion: 'ลองปรับ Prompt ตามคำแนะนำดูนะครับ'
    },
    aiOutput: parsed.aiOutput || 'ประมวลผลสำเร็จ'
  };
}