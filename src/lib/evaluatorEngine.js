// 🤖 PROMPT BATTLE EVALUATOR ENGINE
// AI Evaluación Service with Gemini/Groq + Offline Heuristic Fallback

export async function evaluatePrompt({ promptText, stage, previousAttemptsCount = 0 }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GROQ_API_KEY;

  // If API Key is configured, attempt real LLM API evaluation
  if (apiKey) {
    try {
      return await evaluateWithLLM(promptText, stage, apiKey);
    } catch (err) {
      console.warn('LLM API Evaluation failed or quota exceeded, falling back to smart heuristic engine:', err);
    }
  }

  // Smart Heuristic Evaluator Engine (Offline / Demo Fallback)
  return evaluateWithHeuristics(promptText, stage);
}

// ----------------------------------------------------
// 1. SMART HEURISTIC EVALUATOR (Offline/Local Engine)
// ----------------------------------------------------
function evaluateWithHeuristics(promptText, stage) {
  const text = promptText.trim();
  const wordCount = text.split(/\s+/).length;
  const charCount = text.length;

  let clarityScore = 3;
  let completenessScore = 3;
  let techniqueScore = 2;
  let qualityScore = 3;

  let whatWorked = [];
  let whatMissing = [];
  let suggestions = [];

  // Check 1: Length & Detail
  if (charCount > 60) {
    clarityScore += 1;
    whatWorked.push('มีรายละเอียดคำสั่งชัดเจน');
  } else if (charCount < 25) {
    clarityScore -= 1;
    whatMissing.push('คำสั่งยังสั้นเกินไป ควรเพิ่มบริบทและเป้าหมายให้ชัดเจนขึ้น');
  }

  // Check 2: Structural Keywords (Format & Constraints)
  const formatKeywords = ['ตาราง', 'markdown', 'json', 'ข้อ', 'ข้อสั้น', ' bullet', 'รูปแบบ', 'โครงสร้าง'];
  const hasFormat = formatKeywords.some(k => text.toLowerCase().includes(k));
  if (hasFormat) {
    techniqueScore += 1;
    completenessScore += 1;
    whatWorked.push('มีการระบุรูปแบบ Output หรือโครงสร้างคำตอบที่ต้องการ');
  } else {
    whatMissing.push('ยังไม่ได้ระบุรูปแบบผลลัพธ์ที่ชัดเจน เช่น ตาราง ข้อสั้นๆ หรือ Markdown');
    suggestions.push('ลองเพิ่มคำสั่งระบุรูปแบบ เช่น "แสดงผลลัพธ์เป็นตาราง Markdown" หรือ "สรุปเป็น 3 ข้อ"');
  }

  // Check 3: Role & Persona Prompting
  const roleKeywords = ['คุณคือ', 'สวมบทบาท', 'บทบาท', 'หน้าที่', 'ในฐานะ', 'ครู', 'นักเขียน', 'เจ้าหน้าที่'];
  const hasRole = roleKeywords.some(k => text.toLowerCase().includes(k));
  if (hasRole) {
    techniqueScore += 1;
    whatWorked.push('มีการใช้เทคนิค Role Prompting (สวมบทบาท)');
  } else if (stage.problem_statement.includes('บทบาท') || stage.problem_statement.includes('คุณคือ')) {
    whatMissing.push('โจทย์นี้เหมาะกับการกำหนด Role ให้ AI แต่คุณยังไม่ได้ใส่ Role');
    suggestions.push('เริ่มต้น Prompt ด้วยการกำหนดบทบาท เช่น "คุณคือครูสอนวิทยาศาสตร์ที่ใจดี..."');
  }

  // Check 4: Chain of Thought & Step-by-step
  const cotKeywords = ['ทีละขั้นตอน', 'step-by-step', 'แสดงวิธีคิด', 'อธิบายเหตุผล', 'ลำดับขั้นตอน'];
  const hasCot = cotKeywords.some(k => text.toLowerCase().includes(k));
  if (hasCot) {
    techniqueScore += 1;
    whatWorked.push('มีการใช้เทคนิค Chain-of-Thought สั่งให้ AI แสดงวิธีคิดทีละขั้นตอน');
  }

  // Check 5: Few-Shot Examples
  const fewShotKeywords = ['ตัวอย่าง', ' pattern', 'แพทเทิร์น', ' input', ' output'];
  const hasFewShot = fewShotKeywords.some(k => text.toLowerCase().includes(k));
  if (hasFewShot) {
    techniqueScore += 1;
    whatWorked.push('มีการส่งตัวอย่าง (Few-Shot) ให้ AI เรียนรู้แนวทางการตอบ');
  }

  // Check 6: Negative constraints (ห้าม...)
  if (text.includes('ห้าม') || text.includes('ไม่ต้อง') || text.includes('ไม่เอา')) {
    completenessScore += 1;
    whatWorked.push('มีการกำหนดข้อห้าม/ข้อจำกัด (Negative Prompting) เพื่อตัดข้อความส่วนเกิน');
  }

  // Cap scores between 1 and 5
  clarityScore = Math.min(5, Math.max(1, clarityScore));
  completenessScore = Math.min(5, Math.max(1, completenessScore));
  techniqueScore = Math.min(5, Math.max(1, techniqueScore));
  qualityScore = Math.min(5, Math.max(1, Math.round((clarityScore + completenessScore + techniqueScore) / 3)));

  const totalScore = clarityScore + completenessScore + techniqueScore + qualityScore;

  // Generate simulated AI Output based on stage and prompt quality
  const simulatedOutput = generateSimulatedAIOutput(stage, text, totalScore);

  // Construct coaching feedback
  const feedback = {
    what_worked: whatWorked.length > 0 ? whatWorked.join(' • ') : 'เขียน Prompt ภาษาไทยเข้าใจได้ง่าย',
    what_missing: whatMissing.length > 0 ? whatMissing.join(' • ') : 'ยังสามารถระบุข้อจำกัดเพิ่มเติมเพื่อให้ AI ทำงานได้เป๊ะยิ่งขึ้น',
    suggestion: suggestions.length > 0 
      ? suggestions.join(' • ') 
      : (totalScore >= 16 ? 'Prompt ของคุณยอดเยี่ยมมาก! ลองท้าทายด่านถัดไปได้เลย' : 'ลองระบุเงื่อนไขเป็นข้อๆ และระบุรูปแบบผลลัพธ์ที่ต้องการให้ชัดเจนกว่านี้'),
    hint_only: true
  };

  return {
    scores: {
      clarity: clarityScore,
      completeness: completenessScore,
      technique: techniqueScore,
      quality: qualityScore
    },
    totalScore,
    feedback,
    aiOutput: simulatedOutput
  };
}

// Helper to simulate AI Output for the chat view
function generateSimulatedAIOutput(stage, promptText, totalScore) {
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
// 2. REAL LLM API EVALUATION (Gemini/Groq Integration)
// ----------------------------------------------------
async function evaluateWithLLM(promptText, stage, apiKey) {
  // System Prompt instructing LLM to act as a strict & encouraging teacher evaluator
  const systemPrompt = `คุณคือ AI Evaluator ประเมินทักษะ Prompt Engineering ของนักเรียนในเกม Prompt Battle
โจทย์คือ: "${stage.problem_statement}"
เงื่อนไขที่คาดหวัง: ${JSON.stringify(stage.expected_criteria)}

จงประเมิน Prompt ของนักเรียน: "${promptText}"

โปรดตอบกลับเป็น JSON แท้ๆ เท่านั้น ในรูปแบบดังนี้:
{
  "scores": {
    "clarity": <1-5>,
    "completeness": <1-5>,
    "technique": <1-5>,
    "quality": <1-5>
  },
  "feedback": {
    "what_worked": "<จุดที่นักเรียนทำได้ดี ภาษาไทย>",
    "what_missing": "<จุดที่ยังขาด ภาษาไทย>",
    "suggestion": "<คำแนะนำสั้นๆ สไตล์โค้ชชิ่ง ไม่เฉลยคำตอบ ภาษาไทย>"
  },
  "aiOutput": "<ผลลัพธ์ตัวอย่างที่ AI ควรตอบกลับจาก prompt นี้>"
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }]
    })
  });

  if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  
  const totalScore = parsed.scores.clarity + parsed.scores.completeness + parsed.scores.technique + parsed.scores.quality;

  return {
    scores: parsed.scores,
    totalScore,
    feedback: parsed.feedback,
    aiOutput: parsed.aiOutput || 'ประมวลผลสำเร็จ'
  };
}
