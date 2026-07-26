// 🤖 PROMPT BATTLE EVALUATOR ENGINE
// KKU IntelSphere API via Vercel Serverless Proxy (/api/evaluate)

const API_TIMEOUT_MS = 20000;

export async function evaluatePrompt({ promptText, stage, previousAttemptsCount = 0 }) {
  console.log('🤖 Evaluator — prompt length:', promptText.length);

  try {
    const result = await callKKUProxy(promptText, stage);
    result.source = 'ai';
    console.log('✅ KKU API SUCCESS — totalScore:', result.totalScore, '/ 20');
    return result;
  } catch (err) {
    console.error('❌ KKU API FAILED:', err.message);
  }

  console.log('🧠 Heuristic scoring (no AI)');
  const result = evaluateWithHeuristics(promptText, stage);
  result.source = 'heuristic';
  return result;
}

// ----------------------------------------------------
// 1. Call Vercel Serverless Proxy (/api/evaluate)
// ----------------------------------------------------
async function callKKUProxy(promptText, stage) {
  // IMPORTANT: AI must actually EXECUTE the student's prompt as aiOutput
  const systemPrompt = `คุณต้องทำงาน 2 อย่างพร้อมกัน:

📋 งานที่ 1 — ตอบตาม prompt ของนักเรียนจริงๆ:
สวมบทบาทเป็น AI ผู้ช่วย แล้ว**ทำตามคำสั่งใน prompt นี้ทันที**: "${promptText}"
- ถ้า prompt สั่งให้ตอบเรื่องอะไร ให้ตอบเรื่องนั้น
- ถ้า prompt มีแต่ tags เปล่าๆ ไม่มีเนื้อหา ให้ตอบว่า "โปรดระบุรายละเอียดของคำถามหรือภารกิจที่ต้องการ"
- ห้ามแต่งเรื่องเอง ห้ามใช้ตัวอย่างสำเร็จรูป

📋 งานที่ 2 — ประเมิน prompt ตามเกณฑ์นี้:
โจทย์เดิม: "${stage.problem_statement}"
เกณฑ์: ${JSON.stringify(stage.expected_criteria)}

ตอบเป็น JSON เท่านั้น:
{
  "scores": {"clarity":1-5,"completeness":1-5,"technique":1-5,"quality":1-5},
  "feedback": {"what_worked":"ภาษาไทย","what_missing":"ภาษาไทย","suggestion":"ภาษาไทย"},
  "aiOutput":"ผลลัพธ์จากงานที่ 1 (ตอบตาม prompt จริง)"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const response = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt }),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Proxy ${response.status}`);
  }

  const data = await response.json();
  const raw = data.content || '';
  const json = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(json);
  const s = parsed.scores;

  return {
    scores: { clarity: s.clarity || 3, completeness: s.completeness || 3, technique: s.technique || 3, quality: s.quality || 3 },
    totalScore: (s.clarity || 0) + (s.completeness || 0) + (s.technique || 0) + (s.quality || 0),
    maxScore: 20,
    feedback: parsed.feedback || {},
    aiOutput: parsed.aiOutput || ""
  };
}

// ----------------------------------------------------
// 2. Heuristic fallback (no mockup)
// ----------------------------------------------------
function evaluateWithHeuristics(promptText, stage) {
  const text = promptText.trim();
  const charCount = text.length;

  let clarityScore = 3, completenessScore = 3, techniqueScore = 2, qualityScore = 3;
  let whatWorked = [], whatMissing = [], suggestions = [];

  if (charCount > 60) { clarityScore += 1; whatWorked.push('มีรายละเอียดคำสั่งชัดเจน'); }
  else if (charCount < 25) { clarityScore -= 1; whatMissing.push('คำสั่งสั้นเกินไป'); }

  const formatKw = ['ตาราง', 'markdown', 'json', 'ข้อ', 'รูปแบบ', 'โครงสร้าง', 'คอลัมน์'];
  if (formatKw.some(k => text.toLowerCase().includes(k))) {
    techniqueScore += 1; completenessScore += 1; whatWorked.push('ระบุรูปแบบ Output');
  } else { whatMissing.push('ไม่ได้ระบุรูปแบบผลลัพธ์'); }

  const roleKw = ['คุณคือ', 'สวมบทบาท', 'ในฐานะ', 'บทบาท', 'คุณเป็น'];
  if (roleKw.some(k => text.includes(k))) {
    techniqueScore += 1; whatWorked.push('กำหนดบทบาทให้ AI');
  } else if (stage.problem_statement.includes('บทบาท') || stage.problem_statement.includes('คุณคือ')) {
    whatMissing.push('ควรกำหนดบทบาทให้ AI');
  }

  if (['ทีละขั้นตอน', 'step-by-step', 'แสดงวิธีคิด'].some(k => text.toLowerCase().includes(k))) {
    techniqueScore += 1; whatWorked.push('ใช้ Chain-of-Thought');
  }
  if (['ตัวอย่าง', 'pattern', 'แพทเทิร์น'].some(k => text.toLowerCase().includes(k))) {
    techniqueScore += 1; whatWorked.push('ใช้ Few-Shot');
  }
  if (text.includes('ห้าม') || text.includes('ไม่ต้อง') || text.includes('ไม่เกิน') || text.includes('เท่านั้น')) {
    completenessScore += 1; whatWorked.push('กำหนดข้อจำกัด');
  }

  clarityScore = Math.min(5, Math.max(1, clarityScore));
  completenessScore = Math.min(5, Math.max(1, completenessScore));
  techniqueScore = Math.min(5, Math.max(1, techniqueScore));
  qualityScore = Math.min(5, Math.max(1, Math.round((clarityScore + completenessScore + techniqueScore) / 3)));
  const totalScore = clarityScore + completenessScore + techniqueScore + qualityScore;

  return {
    scores: { clarity: clarityScore, completeness: completenessScore, technique: techniqueScore, quality: qualityScore },
    totalScore,
    maxScore: 20,
    feedback: {
      what_worked: whatWorked.length > 0 ? whatWorked.join(' • ') : 'Prompt เข้าใจได้',
      what_missing: whatMissing.length > 0 ? whatMissing.join(' • ') : '',
      suggestion: suggestions.length > 0 ? suggestions.join(' • ') : (totalScore >= 16 ? 'ยอดเยี่ยม! ลองด่านต่อไปเลย' : 'ลองเพิ่มรูปแบบ/บทบาท/ข้อจำกัด'),
    },
    aiOutput: ""
  };
}