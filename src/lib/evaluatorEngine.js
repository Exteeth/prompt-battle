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
  const systemPrompt = `คุณคือ AI Evaluator ในเกม Prompt Battle ของนักเรียน ทุกคำตอบต้องเป็นภาษาไทยเท่านั้น

📋 งานที่ 1 — ตอบตามคำสั่งใน prompt ของนักเรียน:
"""
${promptText}
"""
สวมบทบาทเป็น AI และตอบตามคำสั่งนี้
- ถ้า prompt มีแต่แท็กเปล่า [ROLE] [CONTEXT] โดยไม่มีเนื้อหาจริง → ตอบ: "โปรดระบุรายละเอียดของคำถาม"
- ถ้า prompt สั่งให้ทำอะไร → ทำตามนั้น
- ห้ามแต่งเรื่องเอง ห้ามใช้ตัวอย่างสำเร็จรูป

📋 งานที่ 2 — ให้คะแนนจากสิ่งที่นักเรียนเขียนจริงเท่านั้น:
⚠️ สำคัญ: ให้คะแนนจากเนื้อหาจริงใน prompt เท่านั้น ไม่ใช่จากโจทย์
- ถ้านักเรียนส่งแท็กเปล่า → คะแนนต่ำ (1-2)
- ถ้านักเรียนเขียนคำสั่งจริง → คะแนนตามคุณภาพ

เกณฑ์ให้คะแนน (1-5):
- clarity: คำสั่งชัดเจน? แท็กเปล่า = 1
- completeness: มี context, task, format? แท็กเปล่า = 1
- technique: ใช้ role/CoT/few-shot? แท็กเปล่า = 1
- quality: ผลลัพธ์น่าจะดี? แท็กเปล่า = 1

ตอบเป็น JSON เท่านั้น (ทุกช่องต้องเป็นภาษาไทย):
{
  "scores": {"clarity":1-5,"completeness":1-5,"technique":1-5,"quality":1-5},
  "feedback": {"what_worked":"ภาษาไทย","what_missing":"ภาษาไทย","suggestion":"ภาษาไทย"},
  "aiOutput":"ภาษาไทย — ผลลัพธ์จากงานที่ 1"
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
    scores: { clarity: s.clarity || 1, completeness: s.completeness || 1, technique: s.technique || 1, quality: s.quality || 1 },
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