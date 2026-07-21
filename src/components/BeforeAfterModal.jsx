import React from 'react';
import { X, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export default function BeforeAfterModal({ attempts, isOpen, onClose }) {
  if (!isOpen || !attempts || attempts.length < 2) return null;

  const firstAttempt = attempts[0];
  const lastAttempt = attempts[attempts.length - 1];
  const scoreGrowth = (lastAttempt.totalScore - firstAttempt.totalScore).toFixed(1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="growth-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-prompt"
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              <TrendingUp size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="growth-modal-title" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                วิเคราะห์พัฒนาการ (Growth Comparison)
              </h2>
              <p className="text-xs text-slate-500">เปรียบเทียบ Prompt และผลลัพธ์ระหว่าง Attempt ครั้งแรก vs ครั้งล่าสุด</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่างวิเคราะห์พัฒนาการ"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Growth Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sparkles size={18} aria-hidden="true" />
            <span className="text-sm font-semibold">อัตราการเติบโตทางทักษะของคุณ:</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-sm text-blue-100">{firstAttempt.totalScore} คะแนน</span>
            <ArrowRight size={16} aria-hidden="true" />
            <span className="text-lg font-black">{lastAttempt.totalScore} คะแนน</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ml-2 ${
              scoreGrowth >= 0 ? 'bg-white text-blue-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {scoreGrowth >= 0 ? `+${scoreGrowth}` : scoreGrowth} คะแนน
            </span>
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Attempt 1 */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-mono">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Attempt ครั้งแรก (#1)
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                คะแนน: {firstAttempt.totalScore} / 20
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Prompt ที่เขียน:</label>
              <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 font-mono whitespace-pre-wrap shadow-xs">
                {firstAttempt.promptText}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">ผลลัพธ์จาก AI:</label>
              <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap max-h-40 overflow-y-auto shadow-xs">
                {firstAttempt.aiOutput}
              </p>
            </div>
          </div>

          {/* Final Attempt */}
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200 font-mono">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                <span>Attempt ล่าสุด (#{lastAttempt.attemptNumber})</span>
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-black">BEST</span>
              </span>
              <span className="text-xs font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">
                คะแนน: {lastAttempt.totalScore} / 20
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-blue-700 block mb-1">Prompt ปรับปรุงใหม่:</label>
              <p className="text-xs text-slate-900 bg-white p-3 rounded-lg border border-blue-200 font-mono whitespace-pre-wrap shadow-xs">
                {lastAttempt.promptText}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-blue-700 block mb-1">ผลลัพธ์จาก AI ใหม่:</label>
              <p className="text-xs text-slate-900 bg-white p-3 rounded-lg border border-blue-200 whitespace-pre-wrap max-h-40 overflow-y-auto shadow-xs">
                {lastAttempt.aiOutput}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
