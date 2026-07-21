import React from 'react';
import { Award, CheckCircle2, AlertCircle, Lightbulb, Star } from 'lucide-react';

export default function FeedbackCard({ scores, totalScore, feedback, attemptNumber }) {
  const getRatingStars = (total) => {
    let count = 1;
    if (total >= 18) count = 5;
    else if (total >= 15) count = 4;
    else if (total >= 12) count = 3;
    else if (total >= 8) count = 2;

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
    <div className="mt-3 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-md space-y-4 animate-slide-up">
      {/* Header: Score Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0 shadow-xs">
            <Award size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">ผลการประเมิน (Attempt {attemptNumber})</h3>
              {getRatingStars(totalScore)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">คำนวณจากเกณฑ์ประเมิน 4 ด้าน รวมเต็ม 20 คะแนน</p>
          </div>
        </div>

        {/* Total Score Badge */}
        <div className="flex items-baseline gap-1 self-start sm:self-auto bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 font-mono shadow-xs hover:scale-105 transition-transform">
          <span className="text-xl sm:text-2xl font-black text-blue-600">{totalScore}</span>
          <span className="text-xs text-slate-500 font-medium">/ 20</span>
        </div>
      </div>

      {/* 4 Criteria Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
        <ScoreBar label="ความชัดเจน (Clarity)" score={scores.clarity} max={5} />
        <ScoreBar label="ความครบถ้วน (Completeness)" score={scores.completeness} max={5} />
        <ScoreBar label="เทคนิค Prompt (Technique)" score={scores.technique} max={5} />
        <ScoreBar label="คุณภาพผลลัพธ์ (Quality)" score={scores.quality} max={5} />
      </div>

      {/* Thai Coaching Feedback Sections */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        {feedback.what_worked && (
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200 animate-slide-up">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-emerald-700">สิ่งที่ทำได้ดี:</strong>
              <p className="mt-0.5 text-emerald-900 leading-relaxed">{feedback.what_worked}</p>
            </div>
          </div>
        )}

        {feedback.what_missing && (
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 animate-slide-up">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-amber-800">จุดที่ยังขาด/ควรเพิ่ม:</strong>
              <p className="mt-0.5 text-amber-950 leading-relaxed">{feedback.what_missing}</p>
            </div>
          </div>
        )}

        {feedback.suggestion && (
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-sky-900 bg-sky-50 p-3 rounded-xl border border-sky-200 animate-slide-up">
            <Lightbulb size={16} className="text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-sky-700">คำแนะนำสไตล์โค้ชชิ่ง (เพื่อปรับปรุงครั้งต่อไป):</strong>
              <p className="mt-0.5 text-sky-950 leading-relaxed">{feedback.suggestion}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max }) {
  const percentage = (score / max) * 100;
  
  return (
    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5 font-mono">
        <span>{label}</span>
        <span className="font-bold text-blue-600">{score} / {max}</span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
