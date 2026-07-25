import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Sparkles, Wand2, Lightbulb, X, PlusCircle, Trash2 } from 'lucide-react';
import { playPopSound, playWhooshSubmitSound, playMascotBlipSound } from '../../lib/soundEffects';

export default function ChatInput({ onSubmit, isLoading, attemptsLeft, stageStarters, stageHint }) {
  const [prompt, setPrompt] = useState('');
  const [showStarters, setShowStarters] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea smoothly as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const nextHeight = Math.max(48, Math.min(textareaRef.current.scrollHeight, 180));
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading || attemptsLeft <= 0) return;
    playWhooshSubmitSound();
    onSubmit(prompt);
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    // Prevent early submit on Thai IME candidate selection
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const applyStarter = (text) => {
    playMascotBlipSound();
    setPrompt(text);
    setShowStarters(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const insertFormulaTag = (tag) => {
    playPopSound();
    setPrompt((prev) => (prev ? `${prev} ${tag}` : tag));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const clearPrompt = () => {
    playPopSound();
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const formulaTags = [
    { label: '+ [ROLE]', tag: '[ROLE] คุณคือ...' },
    { label: '+ [CONTEXT]', tag: '[CONTEXT] บริบทสำหรับ...' },
    { label: '+ [TASK]', tag: '[TASK] จง...' },
    { label: '+ [CONSTRAINTS]', tag: '[CONSTRAINTS] เงื่อนไข:...' },
    { label: '+ [FORMAT]', tag: '[OUTPUT FORMAT] รูปแบบ...' }
  ];

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 sticky bottom-0 z-10 shadow-lg font-prompt">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick Master Formula Tag Insert Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <PlusCircle size={13} className="text-blue-600" />
            <span>แทรกสูตรลับ:</span>
          </span>
          {formulaTags.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertFormulaTag(item.tag)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 border border-slate-200 hover:border-blue-300 text-[11px] font-semibold transition-all shrink-0 cursor-pointer active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Starter Templates Drawer / Pills */}
        {stageStarters && stageStarters.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => { playPopSound(); setShowStarters(!showStarters); }}
              className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
            >
              <Wand2 size={13} className="text-blue-600" />
              <span>ตัวช่วยคิด Prompt ({stageStarters.length})</span>
            </button>

            {stageHint && (
              <span className="text-[11px] text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1 shrink-0 font-medium">
                <Lightbulb size={12} className="text-amber-600" />
                <span>{stageHint}</span>
              </span>
            )}
          </div>
        )}

        {/* Expandable Starter Options */}
        {showStarters && stageStarters && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-slide-up">
            <span className="text-[11px] font-bold text-slate-600 block">เลือกตัวอย่างโครงสร้างคำสั่งเพื่อเริ่มเขียน:</span>
            <div className="space-y-1.5">
              {stageStarters.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyStarter(starter)}
                  className="w-full text-left text-xs p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-900 font-medium transition-all font-sans cursor-pointer block leading-relaxed"
                >
                  💡 {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end bg-slate-50 rounded-2xl border-2 border-slate-300 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || attemptsLeft <= 0}
              placeholder={
                attemptsLeft <= 0 
                  ? 'คุณใช้โควต้า 3 attempts ของด่านนี้ครบแล้ว' 
                  : 'พิมพ์ Prompt คำสั่งของคุณที่นี่... (กด Enter เพื่อส่ง | Shift+Enter เพื่อขึ้นบรรทัดใหม่)'
              }
              rows={1}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base p-3.5 pr-24 resize-none focus:outline-none max-h-[180px] font-sans leading-relaxed min-h-[48px]"
            />

            {/* Clear Text & Send Action Buttons */}
            <div className="absolute right-2.5 bottom-2 flex items-center gap-1.5">
              {prompt.length > 0 && !isLoading && (
                <button
                  type="button"
                  onClick={clearPrompt}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="ล้างข้อความ"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <button
                type="submit"
                disabled={!prompt.trim() || isLoading || attemptsLeft <= 0}
                className={`min-h-[40px] min-w-[40px] w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  prompt.trim() && !isLoading && attemptsLeft > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 cursor-pointer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="ส่งคำสั่ง Prompt ให้ AI ประเมิน"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <ArrowUp size={20} className="font-bold" />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer help text & character count */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles size={13} className="text-blue-600 shrink-0" />
            <span className="truncate">กด Enter เพื่อส่ง | Shift+Enter เพื่อขึ้นบรรทัดใหม่</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 font-mono">
            <span>{prompt.length} ตัวอักษร</span>
          </div>
        </div>
      </div>
    </div>
  );
}
