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
    <header className="h-16 bg-slate-900 border-b-2 border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-lg font-prompt text-white">
      {/* Left section: Sidebar toggle & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="เปิด/ปิดรายการด่านทั้งหมด"
          className="min-h-[44px] min-w-[44px] p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center cursor-pointer shrink-0"
          title="ซ่อน/แสดง รายการด่านและโจทย์"
        >
          <PanelLeft size={20} aria-hidden="true" />
        </button>

        <button
          onClick={() => navigate('/stages')}
          className="min-h-[44px] px-2.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium shrink-0 cursor-pointer"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span className="hidden sm:inline font-medium">เลือกด่าน</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-800 hidden sm:block shrink-0" />

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 font-black text-xs shrink-0 font-mono">
            {stage?.stage_number}
          </div>
          <div className="min-w-0 font-prompt">
            <h1 className="text-xs sm:text-sm font-black text-white truncate max-w-[120px] sm:max-w-[260px] md:max-w-[340px] font-kanit">
              {stage?.title}
            </h1>
            <p className="text-[10px] text-cyan-400 hidden sm:flex items-center gap-1 font-mono">
              {stage?.is_tutorial ? (
                <>
                  <BookOpen size={11} className="text-emerald-400" aria-hidden="true" />
                  <span>MINI-TUTORIAL</span>
                </>
              ) : (
                <>
                  <Swords size={11} className="text-yellow-400" aria-hidden="true" />
                  <span>MAIN BATTLE STAGE</span>
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
            aria-label="เปรียบเทียบพัฒนาการ Prompt ครั้งแรกกับครั้งล่าสุด"
            className="btn-arcade-cyan min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ดูการเติบโตระหว่าง Prompt ครั้งแรก กับ ครั้งล่าสุด"
          >
            <GitCompare size={15} aria-hidden="true" />
            <span className="hidden md:inline font-mono">GROWTH</span>
          </button>
        )}

        {/* Highest Score Badge */}
        <div className="px-2.5 sm:px-3 py-1.5 bg-yellow-950/80 border border-yellow-400 text-yellow-300 rounded-lg text-xs font-black flex items-center gap-1">
          <Trophy size={14} className="text-yellow-400" aria-hidden="true" />
          <span><strong className="text-yellow-300 font-black">{maxScore}</strong><span className="hidden sm:inline text-slate-400">/20</span></span>
        </div>

        {/* Attempts Remaining Badge */}
        <div className={`px-2.5 sm:px-3 py-1.5 border rounded-lg text-xs font-black flex items-center gap-1 ${
          attemptsLeft > 0 
            ? 'bg-slate-800 border-slate-700 text-slate-200' 
            : 'bg-rose-950 border-rose-500 text-rose-300'
        }`}>
          <RotateCcw size={14} aria-hidden="true" />
          <span className={attemptsLeft > 0 ? 'text-cyan-400' : 'text-rose-400'}>{attemptsLeft}</span>
          <span className="hidden sm:inline text-slate-400">/3</span>
        </div>
      </div>
    </header>
  );
}