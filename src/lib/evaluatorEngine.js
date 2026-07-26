// 🤖 PROMPT BATTLE EVALUATOR ENGINE
// AI Evaluation Service — KKU IntelSphere API (deepseek-v4-flash) + Offline Heuristic

const KKU_BASE_URL = import.meta.env.VITE_KKU_BASE_URL || 'https://gen.ai.kku.ac.th/api/v1';
const KKU_MODEL = 'deepseek-v4-flash';
const API_TIMEOUT_MS = 15000; // 15s for production KKU API

export async function evaluatePrompt({ promptText, stage, previousAttemptsCount = 0 }) {
  const apiKey = import.meta.env.VITE_KKU_API_KEY;
  console.log('🔑 VITE_KKU_API_KEY present:', !!apiKey);

  if (apiKey) {
    try {
      console.log('🤖 Calling KKU API...');
      const result = await evaluateWithLLM(promptText, stage, apiKey);
      result.source = 'ai';
      console.log('✅ KKU API SUCCESS — totalScore:', result.totalScore, '/ 20');
      return result;
    } catch (err) {
      console.error('❌ KKU API FAILED:', err.message);
    }
  }

  // Fallback: heuristic scoring with NO mockup AI output
  console.log('🧠 Heuristic scoring (no AI)');
  const result = evaluateWithHeuristics(promptText, stage);
  result.source = 'heuristic';
  return result;
}

// ----------------------------------------------------
// Heuristic evaluator (NO mockup — real scoring only)
// ----------------------------------------------------
function evaluateWithHeuristics(promptText, stage) {
  const text = promptText.trim();
  const charCount = text.length;

  let clarityScore = 3, completenessScore = 3, techniqueScore = 2, qualityScore = 3;
  let whatWorked = [], whatMissing = [], suggestions = [];

  if (charCount > 60) { clarityScore += 1; whatWorked.push('มีรายละเอียดคำสั่งชัดเจน'); }
  else if (charCount < 25) { clarityScore -= 1; whatMissing.push('คำสั่งสั้นเกินไป — เพิ่มบริบทและเป้าหมาย'); }

  const formatKw = ['ตาราง', 'markdown', 'json', 'ข้อ', 'รูปแบบ', 'โครงสร้าง', 'คอลัมน์'];
  if (formatKw.some(k => text.toLowerCase().includes(k))) {
    techniqueScore += 1; completenessScore += 1; whatWorked.push('ระบุรูปแบบ Output ชัดเจน');
  } else {
    whatMissing.push('ไม่ได้ระบุรูปแบบผลลัพธ์');
    suggestions.push('ระบุรูปแบบ เช่น "ตอบเป็นตาราง Markdown" หรือ "สรุป 3 ข้อ"');
  }

  const roleKw = ['คุณคือ', 'สวมบทบาท', 'ในฐานะ', 'บทบาท', 'คุณเป็น'];
  if (roleKw.some(k => text.includes(k))) {
    techniqueScore += 1; whatWorked.push('กำหนดบทบาทให้ AI (Role Prompting)');
  } else if (stage.problem_statement.includes('บทบาท') || stage.problem_statement.includes('คุณคือ')) {
    whatMissing.push('ควรกำหนดบทบาทให้ AI');
    suggestions.push('เริ่มด้วย "คุณคือ..." เพื่อกำหนดบทบาท');
  }

  if (['ทีละขั้นตอน', 'step-by-step', 'แสดงวิธีคิด'].some(k => text.toLowerCase().includes(k))) {
    techniqueScore += 1; whatWorked.push('ใช้ Chain-of-Thought');
  }
  if (['ตัวอย่าง', 'pattern', 'แพทเทิร์น'].some(k => text.toLowerCase().includes(k))) {
    techniqueScore += 1; whatWorked.push('ใช้ Few-Shot');
  }
  if (text.includes('ห้าม') || text.includes('ไม่ต้อง') || text.includes('ไม่เกิน') || text.includes('เท่านั้น')) {
    completenessScore += 1; whatWorked.push('กำหนดข้อจำกัด/เงื่อนไข');
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
    aiOutput: null // NO mockup AI output
  };
}

// ----------------------------------------------------
// KKU API Call (15s timeout)
// ----------------------------------------------------
async function evaluateWithLLM(promptText, stage, apiKey) {
  const systemPrompt = `คุณคือ AI Evaluator ในเกม Prompt Battle ของนักเรียน
โจทย์: "${stage.problem_statement}"
เงื่อนไขที่คาดหวัง: ${JSON.stringify(stage.expected_criteria)}

ประเมิน Prompt นี้: "${promptText}"

ตอบ JSON เท่านั้น:
{
  "scores": {"clarity":1-5,"completeness":1-5,"technique":1-5,"quality":1-5},
  "feedback": {"what_worked":"สิ่งที่ทำได้ดี ภาษาไทย","what_missing":"จุดที่ขาด","suggestion":"คำแนะนำสไตล์โค้ช"},
  "aiOutput":"ตัวอย่างผลลัพธ์ที่ AI ควรตอบ"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${KKU_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: KKU_MODEL, messages: [{ role: 'user', content: systemPrompt }] }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API ${response.status}: ${errText.slice(0, 150)}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const json = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(json);
    const s = parsed.scores;

    return {
      scores: { clarity: s.clarity || 3, completeness: s.completeness || 3, technique: s.technique || 3, quality: s.quality || 3 },
      totalScore: (s.clarity || 0) + (s.completeness || 0) + (s.technique || 0) + (s.quality || 0),
      maxScore: 20,
      feedback: parsed.feedback || {},
      aiOutput: parsed.aiOutput || null
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}