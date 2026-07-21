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
      <aside className="fixed inset-y-0 left-0 z-40 w-80 sm:w-84 bg-white border-r border-slate-200 flex flex-col shadow-2xl animate-fade-in h-[100dvh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/logo.webp"
              alt="Prompt Battle"
              className="w-8 h-8 object-contain shrink-0 drop-shadow-sm"
            />
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Prompt Battle</h2>
              <p className="text-[11px] text-slate-500">เลือกด่าน & ดูคำแนะนำโจทย์</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Section 1: Mini Tutorials */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5 font-mono">
              <BookOpen size={14} className="text-emerald-600" />
              <span>Mini-Tutorials (ฝึกพื้นฐาน)</span>
            </h3>
            <div className="space-y-1">
              {STAGES_DATA.filter(s => s.is_tutorial).map(stage => (
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

          {/* Section 2: Main Battle Stages */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5 font-mono">
              <Swords size={14} className="text-amber-600" />
              <span>Main Battle Stages (แข่งขัน)</span>
            </h3>
            <div className="space-y-1">
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
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              window.location.href = '/leaderboard';
            }}
            className="w-full min-h-[44px] py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Trophy size={16} className="text-amber-600" />
            <span>ดูตารางคะแนน (Leaderboard)</span>
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
      className={`w-full min-h-[44px] text-left p-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
        isActive
          ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-xs'
          : 'hover:bg-slate-100 text-slate-700 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 font-mono ${
          isCleared 
            ? 'bg-emerald-600 text-white' 
            : isActive 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {isCleared ? <CheckCircle size={14} /> : stage.stage_number}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate group-hover:text-slate-900">
            {stage.title}
          </p>
          <span className="text-[10px] text-slate-500 block">
            {stage.difficulty} • {attempts.length}/3 Attempts
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 font-mono">
        {highestScore > 0 && (
          <span className="text-[11px] font-bold text-amber-700 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
            {highestScore}
          </span>
        )}
        <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
      </div>
    </button>
  );
}
