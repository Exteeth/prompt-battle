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
  const systemPrompt = `คุณคือ AI Evaluator ผู้เชี่ยวชาญด้าน Prompt Engineering ในเกม Prompt Battle ทุกคำตอบต้องเป็นภาษาไทยเท่านั้น

📋 งานที่ 1 — ตอบตามคำสั่งใน prompt ของนักเรียน:
"""
${promptText}
"""
สวมบทบาทเป็น AI และตอบตามคำสั่งนี้
- ถ้า prompt มีแต่แท็กเปล่า [ROLE] [CONTEXT] [TASK] [CONSTRAINTS] [OUTPUT FORMAT] โดยไม่มีการเติมเนื้อหาจริง → ตอบ: "โปรดระบุรายละเอียดของคำถามหรือภารกิจที่ต้องการ"
- ถ้า prompt สั่งให้ทำอะไร → ทำตามนั้นอย่างเต็มความสามารถ
- ห้ามแต่งเรื่องเอง ห้ามใช้ตัวอย่างสำเร็จรูป

📋 งานที่ 2 — ให้คะแนนจากสิ่งที่นักเรียนเขียนจริงเท่านั้น:
⚠️ สำคัญที่สุด: ให้คะแนนจากเนื้อหาจริงใน prompt ของนักเรียนเท่านั้น ไม่ใช่จากสิ่งที่โจทย์คาดหวัง

─────────────────────────────────────
เกณฑ์การให้คะแนนแบบละเอียด (1-5 คะแนน):

1️⃣ clarity — ความชัดเจนของคำสั่ง
5 = คำสั่งกระชับ สื่อความหมายเจาะจง 100% ไม่ต้องตีความเพิ่ม อ่านครั้งเดียวเข้าใจทันที
4 = คำสั่งชัดเจนดี มีจุดที่ต้องตีความเล็กน้อย 1-2 จุด
3 = พอเข้าใจได้ แต่มีความกำกวมในบางส่วน ต้องเดาเจตนา
2 = คลุมเครือหลายจุด ต้องตีความเองเป็นส่วนใหญ่
1 = ไม่สามารถเข้าใจได้ว่าให้ทำอะไร / มีแต่แท็กเปล่า / ไม่เป็นประโยคสมบูรณ์

2️⃣ completeness — ความครบถ้วนขององค์ประกอบ
5 = ครบทุกองค์ประกอบ: ระบุบทบาท + ให้บริบท + กำหนดภารกิจชัดเจน + ระบุรูปแบบผลลัพธ์ + มีข้อจำกัด
4 = มี 3-4 องค์ประกอบหลัก ขาดบางส่วนเล็กน้อย
3 = มี 2 องค์ประกอบหลัก ขาดไปหลายส่วน
2 = มีเพียง 1 องค์ประกอบ หรือระบุแบบผ่านๆ
1 = ไม่มีองค์ประกอบใดเลย / มีแต่แท็กเปล่า

3️⃣ technique — การใช้เทคนิค Prompt Engineering
5 = ใช้เทคนิคขั้นสูงหลายอย่าง: Role Prompting + Few-Shot + Chain-of-Thought + Output Formatting + Constraints
4 = ใช้ 3-4 เทคนิคอย่างมีประสิทธิภาพ
3 = ใช้ 2 เทคนิค หรือใช้แบบผิวเผิน
2 = ใช้ 1 เทคนิค หรือพูดถึงเทคนิคแต่ไม่ได้ใช้จริง
1 = ไม่มีเทคนิคใดๆ / มีแต่แท็กเปล่า

4️⃣ quality — คุณภาพโดยรวมของผลลัพธ์ที่คาดว่าจะได้
5 = ผลลัพธ์น่าจะมีคุณภาพสูง ตรงประเด็น มีโครงสร้าง ตรวจสอบได้ นำไปใช้จริงได้ทันที
4 = ผลลัพธ์น่าจะดี ตรงประเด็นเป็นส่วนใหญ่ มีโครงสร้าง
3 = ผลลัพธ์น่าจะพอใช้ได้ แต่ต้องปรับแก้ก่อนนำไปใช้
2 = ผลลัพธ์น่าจะมีคุณภาพต่ำ ไม่ตรงประเด็น หรือกว้างเกินไป
1 = ไม่สามารถคาดเดาผลลัพธ์ได้ / มีแต่แท็กเปล่า

─────────────────────────────────────
ตัวอย่างการให้คะแนน:
- Prompt: "[ROLE] คุณคือ... [CONTEXT] บริบทสำหรับ..." → clarity=1, completeness=1, technique=1, quality=1 (แท็กเปล่า)
- Prompt: "ช่วยสรุปโลกร้อน" → clarity=3, completeness=1, technique=1, quality=2 (สั้นเกิน ไม่มีรายละเอียด)
- Prompt: "คุณคือคุณครูวิทยาศาสตร์ ช่วยอธิบายเรื่องโลกร้อนให้เด็ก 10 ขวบฟัง แบบสนุกๆ ไม่เกิน 5 บรรทัด" → clarity=4, completeness=4, technique=3, quality=4 (ดีมาก มี role, context, task, constraints)

─────────────────────────────────────
ตอบเป็น JSON เท่านั้น (ทุกช่องต้องเป็นภาษาไทย):
{
  "scores": {"clarity":1-5,"completeness":1-5,"technique":1-5,"quality":1-5},
  "feedback": {
    "what_worked": "อธิบายสิ่งที่นักเรียนทำได้ดี เป็นภาษาไทย",
    "what_missing": "อธิบายสิ่งที่ยังขาด เป็นภาษาไทย",
    "suggestion": "คำแนะนำสไตล์โค้ชชิ่งที่ช่วยให้นักเรียนพัฒนาขึ้น โดยไม่เฉลยคำตอบที่สมบูรณ์แบบ"
  },
  "aiOutput": "ผลลัพธ์จากงานที่ 1 (ภาษาไทย)"
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
// 2. Heuristic fallback — comprehensive scoring
// ----------------------------------------------------
function evaluateWithHeuristics(promptText, stage) {
  const text = promptText.trim();
  const charCount = text.length;
  const sentences = text.split(/[。.!！?？\n]+/).filter(s => s.trim().length > 0);

  // === 1. CLARITY (1-5) ===
  let clarity = 3;
  if (charCount >= 100 && sentences.length >= 2) clarity = 5;
  else if (charCount >= 60) clarity = 4;
  else if (charCount >= 25) clarity = 3;
  else if (charCount >= 10) clarity = 2;
  else clarity = 1;

  // Check if only empty tags
  const tagOnlyPattern = /^\[(ROLE|CONTEXT|TASK|CONSTRAINTS|OUTPUT\s*FORMAT)\]\s*[:：]?\s*\.{0,3}$/m;
  const lines = text.split('\n').filter(l => l.trim());
  const tagOnlyLines = lines.filter(l => tagOnlyPattern.test(l.trim())).length;
  if (tagOnlyLines >= 3 && tagOnlyLines === lines.length) clarity = 1;

  // === 2. COMPLETENESS (1-5) ===
  let completeness = 1;
  const hasRole = /(คุณคือ|คุณเป็น|สวมบทบาท|ในฐานะ|บทบาท|ทำหน้าที่เป็น)/.test(text);
  const hasContext = /(สำหรับ|นักเรียน|เด็ก|ผู้เรียน|ระดับ|ประถม|มัธยม|มหาวิทยาลัย|งบประมาณ|สภาพแวดล้อม|สถานการณ์|บริบท|กลุ่มเป้าหมาย|วัย|อายุ)/.test(text);
  const hasTask = /(ช่วย|จง|ขอ|สร้าง|เขียน|สรุป|วิเคราะห์|ออกแบบ|แปล|คำนวณ|อธิบาย|บอก|ตอบ|บรรยาย|เปรียบเทียบ|แนะนำ|เสนอ)/.test(text);
  const hasFormat = /(ตาราง|markdown|json|bullet|ข้อ|ข้อสั้น|รูปแบบ|โครงสร้าง|คอลัมน์|list|ย่อหน้า|bullet\s*point)/i.test(text);
  const hasConstraints = /(ห้าม|ไม่ต้อง|ไม่เอา|ไม่เกิน|เท่านั้น|จำกัด|เฉพาะ|เงื่อนไข|ไม่ควร|ต้องไม่|อย่างน้อย|อย่างมาก|ภายใน|ระหว่าง)/.test(text);

  let compoCount = 0;
  if (hasRole) compoCount++;
  if (hasContext) compoCount++;
  if (hasTask) compoCount++;
  if (hasFormat) compoCount++;
  if (hasConstraints) compoCount++;

  if (compoCount >= 5) completeness = 5;
  else if (compoCount >= 3) completeness = 4;
  else if (compoCount >= 2) completeness = 3;
  else if (compoCount >= 1) completeness = 2;
  if (tagOnlyLines >= 3) completeness = 1;

  // === 3. TECHNIQUE (1-5) ===
  let technique = 1;
  let techCount = 0;
  if (hasRole) techCount++; // Role Prompting
  if (/(ทีละขั้นตอน|step.by.step|แสดงวิธีคิด|อธิบายเหตุผล|ลำดับขั้นตอน|คิดก่อน|วิเคราะห์ก่อน)/i.test(text)) techCount++; // Chain-of-Thought
  if (/(ตัวอย่าง|ตัวอย่างเช่น|ยกตัวอย่าง|pattern|แพทเทิร์น|เช่น|ดังนี้|ดังตัวอย่าง)/i.test(text)) techCount++; // Few-Shot
  if (hasFormat) techCount++; // Output Formatting
  if (hasConstraints) techCount++; // Constraints

  if (techCount >= 4) technique = 5;
  else if (techCount >= 3) technique = 4;
  else if (techCount >= 2) technique = 3;
  else if (techCount >= 1) technique = 2;
  if (tagOnlyLines >= 3) technique = 1;

  // === 4. QUALITY (1-5) ===
  let quality = Math.round((clarity + completeness + technique) / 3);
  // Adjust based on content richness
  if (charCount >= 150 && compoCount >= 4) quality = Math.min(5, quality + 1);
  if (charCount < 20 && compoCount <= 1) quality = Math.max(1, quality - 1);
  quality = Math.min(5, Math.max(1, quality));

  const totalScore = clarity + completeness + technique + quality;

  // === Feedback ===
  let whatWorked = [], whatMissing = [], suggestions = [];

  // Clarity feedback
  if (clarity >= 4) whatWorked.push('คำสั่งชัดเจน สื่อความหมายได้ดี');
  else if (clarity <= 2) { whatMissing.push('คำสั่งยังไม่ชัดเจน — ควรเขียนเป็นประโยคที่สมบูรณ์'); suggestions.push('เขียนคำสั่งให้เป็นประโยคที่อ่านแล้วเข้าใจทันที'); }

  // Completeness feedback
  if (!hasRole) { whatMissing.push('ยังไม่ได้กำหนดบทบาทให้ AI'); suggestions.push('ลองเริ่มด้วย "คุณคือ..." หรือ "คุณเป็น..."'); }
  else whatWorked.push('กำหนดบทบาทให้ AI ชัดเจน');
  if (!hasContext) whatMissing.push('ยังไม่ได้ให้บริบท เช่น กลุ่มเป้าหมาย งบประมาณ หรือสถานการณ์');
  if (!hasTask) whatMissing.push('ยังไม่ได้ระบุภารกิจที่ต้องการให้ชัดเจน');
  if (!hasFormat) whatMissing.push('ยังไม่ได้ระบุรูปแบบผลลัพธ์ที่ต้องการ');

  // Technique feedback
  if (hasRole && hasTask && hasFormat) whatWorked.push('ใช้เทคนิค Prompt Engineering หลายอย่าง');
  if (!hasConstraints && charCount > 30) suggestions.push('ลองเพิ่มข้อจำกัด เช่น "ห้ามใช้ศัพท์เทคนิค" "ไม่เกิน 3 ข้อ"');

  // Overall
  if (totalScore >= 16) suggestions.push('Prompt ของคุณยอดเยี่ยมมาก! ลองท้าทายด่านถัดไปได้เลย ✨');
  else if (totalScore >= 12) suggestions.push('ทำได้ดี! ลองเพิ่มรายละเอียดอีกนิดเพื่อคะแนนที่สูงขึ้น');
  else suggestions.push('ลองเริ่มจากง่ายๆ: กำหนดบทบาท → บอกภารกิจ → ระบุรูปแบบคำตอบ');

  return {
    scores: { clarity, completeness, technique, quality },
    totalScore,
    maxScore: 20,
    feedback: {
      what_worked: whatWorked.length > 0 ? whatWorked.join(' • ') : 'เริ่มต้นเขียน Prompt ได้',
      what_missing: whatMissing.length > 0 ? whatMissing.join(' • ') : 'ครอบคลุมองค์ประกอบสำคัญครบถ้วน',
      suggestion: suggestions.length > 0 ? suggestions.join(' • ') : 'ลองเพิ่มข้อจำกัดหรือตัวอย่างเพื่อยกระดับ Prompt'
    },
    aiOutput: ""
  };
}