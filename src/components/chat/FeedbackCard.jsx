import React from 'react';
import { Award, CheckCircle2, AlertCircle, Lightbulb, Star, ShieldCheck } from 'lucide-react';

export default function FeedbackCard({
  scores = {},
  criteria_feedback = {},
  totalScore = 0,
  maxScore = 20,
  feedback = {},
  attemptNumber = 1
}) {
  const scorePercent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  const clarityScore = scores.clarity ?? 0;
  const roleScore = scores.role ?? scores.technique ?? 0;
  const constraintsScore = scores.constraints ?? scores.completeness ?? 0;
  const outputScore = scores.output_format ?? scores.quality ?? 0;

  // Extract per-criterion feedback with safe fallbacks
  const clarityFb = criteria_feedback?.clarity || (clarityScore >= 4 ? 'คำสั่งชัดเจน ตรงเป้าหมาย 100%' : 'คำสั่งยังไม่ชัดเจน หรือกว้างเกินไป ควรระบุวัตถุประสงค์งานให้เจาะจง');
  const roleFb = criteria_feedback?.role || (roleScore >= 4 ? 'กำหนดบทบาทได้สอดคล้องเหมาะสม' : 'ยังไม่ได้กำหนดบทบาทให้ AI ควรสวมบทบาทด้วย "คุณคือ..." หรือ "ในฐานะ..."');
  const constraintsFb = criteria_feedback?.constraints || (constraintsScore >= 4 ? 'ระบุบริบทและเงื่อนไขประจำด่านครบถ้วน' : 'ยังขาดเงื่อนไขสำคัญตามที่โจทย์กำหนด');
  const outputFb = criteria_feedback?.output_format || (outputScore >= 4 ? 'กำหนดรูปแบบโครงสร้างผลลัพธ์ชัดเจน' : 'ยังไม่ได้ระบุรูปแบบผลลัพธ์ (เช่น สรุปเป็น Bullet points หรือ ตาราง)');

  const getRatingStars = (pct) => {
    let count = 1;
    if (pct >= 90) count = 5;      // ≥18/20
    else if (pct >= 75) count = 4; // ≥15/20
    else if (pct >= 60) count = 3; // ≥12/20
    else if (pct >= 40) count = 2; // ≥8/20

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < count ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-slate-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-3 p-4 sm:p-5 bg-white rounded-3xl border-2 border-slate-200/90 shadow-md space-y-4 animate-slide-up font-prompt">
      {/* Header: Score Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 border-2 border-blue-200/80 flex items-center justify-center text-blue-600 font-bold shrink-0 shadow-xs">
            <Award size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-kanit">ผลการประเมิน (Attempt {attemptNumber})</h3>
              {getRatingStars(scorePercent)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-prompt">ประเมินเจาะจง 4 มิติ รวมเต็ม {maxScore} คะแนน</p>
          </div>
        </div>

        {/* Total Score Badge */}
        <div className="flex items-baseline gap-1 self-start sm:self-auto bg-slate-50 px-3.5 py-1.5 rounded-2xl border-2 border-slate-200/80 font-mono shadow-xs hover:scale-105 transition-transform">
          <span className="text-xl sm:text-2xl font-black text-blue-600">{totalScore}</span>
          <span className="text-xs text-slate-500 font-medium">/ {maxScore}</span>
        </div>
      </div>

      {/* 4 Detailed Criteria Progress Cards with Direct Reason & Missing Point */}
      <div className="space-y-3 font-prompt">
        <CriterionCard
          number="1"
          label="ความชัดเจนของคำสั่ง (Clarity)"
          score={clarityScore}
          max={5}
          feedback={clarityFb}
        />
        <CriterionCard
          number="2"
          label="การกำหนดบทบาท (Role Assignment)"
          score={roleScore}
          max={5}
          feedback={roleFb}
        />
        <CriterionCard
          number="3"
          label="บริบทและเงื่อนไข (Context & Constraints)"
          score={constraintsScore}
          max={5}
          feedback={constraintsFb}
        />
        <CriterionCard
          number="4"
          label="รูปแบบผลลัพธ์ (Output Specification)"
          score={outputScore}
          max={5}
          feedback={outputFb}
        />
      </div>

      {/* Coaching Suggestion Box */}
      {feedback.suggestion && (
        <div className="pt-2 border-t-2 border-slate-100 font-prompt">
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-sky-950 bg-sky-50/90 p-3 rounded-2xl border-2 border-sky-200/80 animate-slide-up shadow-xs">
            <Lightbulb size={17} className="text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sky-800 font-kanit">คำแนะนำจากโค้ช AI (เพื่อพัฒนาในครั้งต่อไป):</strong>
              <p className="mt-0.5 text-sky-900 leading-relaxed font-prompt">{feedback.suggestion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CriterionCard({ number, label, score, max = 5, feedback }) {
  const percentage = max > 0 ? (score / max) * 100 : 0;
  const isPerfect = score === max;
  const isGood = score >= 3;

  // Dynamic colors based on score
  const barColor = isPerfect
    ? 'bg-emerald-500'
    : isGood
    ? 'bg-amber-500'
    : 'bg-rose-500';

  const scoreTextColor = isPerfect
    ? 'text-emerald-700'
    : isGood
    ? 'text-amber-700'
    : 'text-rose-700';

  const boxBg = isPerfect
    ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
    : isGood
    ? 'bg-amber-50/70 border-amber-200/80 text-amber-950'
    : 'bg-rose-50/70 border-rose-200/80 text-rose-950';

  return (
    <div className="bg-slate-50/90 p-3 sm:p-3.5 rounded-2xl border-2 border-slate-200/80 transition-all hover:border-slate-300 shadow-xs">
      {/* Top row: Label and Score */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 font-mono">
            {number}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 font-kanit truncate">
            {label}
          </span>
        </div>
        <span className={`text-xs sm:text-sm font-black font-mono shrink-0 ${scoreTextColor}`}>
          {score} / {max}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Inline Specific Feedback Badge explaining what was missing or done well */}
      {feedback && (
        <div className={`flex items-start gap-1.5 p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs leading-relaxed font-prompt ${boxBg}`}>
          {isPerfect ? (
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : isGood ? (
            <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{feedback}</span>
        </div>
      )}
    </div>
  );
}