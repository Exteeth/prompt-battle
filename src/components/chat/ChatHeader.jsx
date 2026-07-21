import React from 'react';
import { PanelLeft, Trophy, RotateCcw, ArrowLeft, GitCompare, BookOpen, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatHeader({ 
  stage, 
  attemptsLeft, 
  maxScore, 
  onToggleSidebar, 
  onOpenCompare, 
  hasMultipleAttempts 
}) {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
      {/* Left section: Sidebar toggle & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="min-h-[44px] min-w-[44px] p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer shrink-0"
          title="ซ่อน/แสดง รายการด่านและโจทย์"
        >
          <PanelLeft size={20} />
        </button>

        <button
          onClick={() => navigate('/stages')}
          className="min-h-[44px] px-2.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium shrink-0 cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline font-medium">เลือกด่าน</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block shrink-0" />

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0 font-mono">
            {stage?.stage_number}
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[120px] sm:max-w-[260px] md:max-w-[340px]">
              {stage?.title}
            </h1>
            <p className="text-[10px] text-slate-500 hidden sm:flex items-center gap-1">
              {stage?.is_tutorial ? (
                <>
                  <BookOpen size={11} className="text-emerald-600" />
                  <span>Mini-Tutorial</span>
                </>
              ) : (
                <>
                  <Swords size={11} className="text-amber-600" />
                  <span>Main Battle Stage</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Right section: Badges & Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 font-mono">
        {hasMultipleAttempts && (
          <button
            onClick={onOpenCompare}
            className="min-h-[44px] px-2.5 sm:px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ดูการเติบโตระหว่าง Prompt ครั้งแรก กับ ครั้งล่าสุด"
          >
            <GitCompare size={15} />
            <span className="hidden md:inline font-sans">เปรียบเทียบ Growth</span>
          </button>
        )}

        {/* Highest Score Badge */}
        <div className="px-2.5 sm:px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-1">
          <Trophy size={14} className="text-amber-600" />
          <span><strong className="text-amber-900 font-bold">{maxScore}</strong><span className="hidden sm:inline text-slate-500">/20</span></span>
        </div>

        {/* Attempts Remaining Badge */}
        <div className={`px-2.5 sm:px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1 ${
          attemptsLeft > 0 
            ? 'bg-slate-100 border-slate-200 text-slate-700' 
            : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          <RotateCcw size={14} />
          <span className={attemptsLeft > 0 ? 'text-blue-700' : 'text-rose-700'}>{attemptsLeft}</span>
          <span className="hidden sm:inline text-slate-500">/3</span>
        </div>
      </div>
    </header>
  );
}
