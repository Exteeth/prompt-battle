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
  const systemPrompt = `You are an AI evaluator for a Prompt Battle game. You must do 2 tasks:

TASK 1 — Execute the student's prompt EXACTLY as written:
"""
${promptText}
"""
Respond as if you are the AI assistant receiving this prompt.
- If the prompt only contains empty tags like [ROLE] [CONTEXT] without real content, respond: "Please add specific details to your prompt"
- If the prompt gives actual instructions, follow them
- Do NOT make up content. Do NOT use the stage context as the student's prompt.

TASK 2 — Score the prompt based ONLY on what the student actually wrote:
⚠️ CRITICAL: Score what the student ACTUALLY wrote, NOT what the stage expected.
- If the student only pasted empty tags → score LOW (1-2)
- If the student wrote actual instructions → score based on clarity, completeness, technique

Scoring rubric (1-5 each):
- clarity: Is the instruction clear and specific? Empty tags = 1
- completeness: Does it include context, task, and format? Empty tags = 1
- technique: Are techniques like role-play, CoT, few-shot actually used? Empty tags = 1
- quality: Would this prompt produce a good result? Empty tags = 1

Respond with ONLY JSON:
{
  "scores": {"clarity":1-5,"completeness":1-5,"technique":1-5,"quality":1-5},
  "feedback": {"what_worked":"...","what_missing":"...","suggestion":"..."},
  "aiOutput":"Result from Task 1"
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