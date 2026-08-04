import React from 'react';
import { X, TrendingUp, Sparkles, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

export default function BeforeAfterModal({ attempts, isOpen, onClose }) {
  if (!isOpen || !attempts || attempts.length < 2) return null;

  const firstAttempt = attempts[0];
  const lastAttempt = attempts[attempts.length - 1];
  const scoreGrowth = (lastAttempt.totalScore - firstAttempt.totalScore).toFixed(1);
  const isPositiveGrowth = parseFloat(scoreGrowth) >= 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="growth-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-prompt"
    >
      <div className="arcade-card border-4 border-cyan-400 bg-slate-900 text-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-800 flex items-center justify-between bg-slate-950 font-kanit">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold shadow-md">
              <TrendingUp size={22} aria-hidden="true" />
            </div>
            <div>
              <h2 id="growth-modal-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                GROWTH COMPARISON (วิเคราะห์พัฒนาการ)
              </h2>
              <p className="text-xs text-cyan-400 font-mono">ATTEMPT #1 VS ATTEMPT #{lastAttempt.attemptNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่างวิเคราะห์พัฒนาการ"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Growth Banner with animated badge */}
        <div className="bg-slate-950 p-4 flex items-center justify-between px-6 border-b-2 border-slate-800 font-prompt">
          <div className="flex items-center gap-2.5">
            <Sparkles size={20} aria-hidden="true" className="text-yellow-300 animate-spin-slow" />
            <span className="text-xs sm:text-sm font-black font-kanit text-white">SKILL GROWTH RATE:</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs sm:text-sm text-slate-300 font-bold">{firstAttempt.totalScore} PTS</span>
            <ArrowRight size={16} className="text-cyan-400" />
            <span className="text-xs sm:text-sm text-yellow-300 font-black">{lastAttempt.totalScore} PTS</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-black ml-2 ${
              isPositiveGrowth ? 'bg-green-500 text-black' : 'bg-rose-500 text-white'
            }`}>
              {isPositiveGrowth ? `+${scoreGrowth}%` : `${scoreGrowth}%`}
            </span>
          </div>
        </div>

        {/* Comparison Side-by-Side Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 font-prompt">
          {/* First Attempt */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                ATTEMPT #1
              </span>
              <span className="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">
                PTS: {firstAttempt.totalScore} / 20
              </span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1 font-mono">PROMPT #1:</label>
              <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono whitespace-pre-wrap">
                {firstAttempt.promptText}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1 font-mono">AI OUTPUT #1:</label>
              <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {firstAttempt.aiOutput}
              </p>
            </div>
          </div>

          {/* Final Attempt */}
          <div className="bg-cyan-950/40 p-4 rounded-xl border-2 border-cyan-400 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-400/60 font-mono">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                <span>ATTEMPT #{lastAttempt.attemptNumber}</span>
                <span className="text-[10px] bg-cyan-400 text-black px-1.5 py-[1px] rounded font-black">BEST</span>
              </span>
              <span className="text-xs font-bold text-yellow-300 bg-slate-900 border border-yellow-400 px-2 py-0.5 rounded">
                PTS: {lastAttempt.totalScore} / 20
              </span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-cyan-300 block mb-1 font-mono">LATEST PROMPT:</label>
              <p className="text-xs text-white bg-slate-900 p-3 rounded-lg border border-cyan-400/60 font-mono whitespace-pre-wrap">
                {lastAttempt.promptText}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-cyan-300 block mb-1 font-mono">LATEST AI OUTPUT:</label>
              <p className="text-xs text-white bg-slate-900 p-3 rounded-lg border border-cyan-400/60 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {lastAttempt.aiOutput}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}