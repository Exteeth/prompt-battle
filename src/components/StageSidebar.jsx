import React from 'react';
import { X, BookOpen, Swords, CheckCircle, ChevronRight, Trophy } from 'lucide-react';
import { STAGES_DATA } from '../data/stagesData';
import { getUserStageAttempts } from '../lib/sessionStorage';

export default function StageSidebar({ currentStageId, onSelectStage, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Collapsible Left Drawer */}
      <aside className="fixed inset-y-0 left-0 z-40 w-80 sm:w-84 bg-slate-900 border-r-2 border-slate-800 flex flex-col shadow-2xl animate-fade-in h-[100dvh] text-white font-prompt">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between font-kanit">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/logo.webp"
              alt="Prompt Battle"
              className="w-8 h-8 object-contain shrink-0 drop-shadow-sm"
            />
            <div>
              <h2 className="text-sm font-black text-white leading-tight">Prompt Battle Arcade</h2>
              <p className="text-[11px] text-cyan-400 font-mono">BATTLES STAGES SELECTOR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <h3 className="text-xs font-black text-yellow-300 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5 font-mono">
              <Swords size={15} className="text-yellow-400" />
              <span>BATTLE STAGES LIST</span>
            </h3>
            <div className="space-y-1.5">
              {STAGES_DATA.filter(s => !s.is_tutorial).map(stage => (
                <StageItem
                  key={stage.id}
                  stage={stage}
                  isActive={stage.id === currentStageId}
                  onSelect={() => {
                    onSelectStage(stage.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer link to Leaderboard */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 font-mono">
          <button
            onClick={() => {
              window.location.href = '/leaderboard';
            }}
            className="btn-arcade-yellow w-full min-h-[44px] py-2.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer uppercase text-black"
          >
            <Trophy size={16} className="text-black" />
            <span>VIEW HIGH SCORES</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function StageItem({ stage, isActive, onSelect }) {
  const attempts = getUserStageAttempts(stage.id);
  const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
  const isCleared = highestScore >= 12;

  return (
    <button
      onClick={onSelect}
      className={`w-full min-h-[44px] text-left p-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer border ${
        isActive
          ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold shadow-md'
          : 'hover:bg-slate-800 text-slate-200 border-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 font-mono ${
          isCleared 
            ? 'bg-green-500 text-black' 
            : isActive 
            ? 'bg-cyan-400 text-black' 
            : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {isCleared ? <CheckCircle size={14} /> : stage.stage_number}
        </div>
        <div className="min-w-0 font-prompt">
          <p className="text-xs font-bold truncate group-hover:text-white">
            {stage.title}
          </p>
          <span className="text-[10px] text-slate-400 block font-mono">
            {stage.difficulty} • {attempts.length}/3 ATTEMPTS
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 font-mono">
        {highestScore > 0 && (
          <span className="text-[11px] font-black text-yellow-300 px-1.5 py-0.5 rounded bg-yellow-950 border border-yellow-400">
            {highestScore}
          </span>
        )}
        <ChevronRight size={14} className="text-slate-500 group-hover:text-slate-200" />
      </div>
    </button>
  );
}
