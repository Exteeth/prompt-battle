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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none font-prompt">
          <span className="text-[11px] font-black text-blue-700 shrink-0 flex items-center gap-1">
            <PlusCircle size={14} className="text-blue-600 animate-pulse" />
            <span>แทรกสูตรลับ:</span>
          </span>
          {formulaTags.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertFormulaTag(item.tag)}
              className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border-2 border-blue-200 hover:border-blue-400 text-xs font-black transition-all shrink-0 cursor-pointer active:scale-95 shadow-xs"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Starter Templates Drawer / Pills */}
        {stageStarters && stageStarters.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-prompt">
            <button
              type="button"
              onClick={() => { playPopSound(); setShowStarters(!showStarters); }}
              className="px-3.5 py-1.5 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-950 font-black flex items-center gap-1.5 hover:bg-amber-200 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <Wand2 size={14} className="text-amber-600 animate-spin-slow" />
              <span>ตัวช่วยคิด Prompt ({stageStarters.length})</span>
            </button>

            {stageHint && (
              <span className="text-[11px] text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1 shrink-0 font-bold">
                <Lightbulb size={13} className="text-amber-500 animate-pulse" />
                <span>{stageHint}</span>
              </span>
            )}
          </div>
        )}

        {/* Expandable Starter Options */}
        {showStarters && stageStarters && (
          <div className="p-3.5 bg-amber-50/90 border-2 border-amber-200 rounded-3xl space-y-2 animate-slide-up font-prompt">
            <span className="text-xs font-black text-amber-950 block">แตะเลือกตัวอย่างคำสั่งเพื่อเริ่มเขียน:</span>
            <div className="space-y-2">
              {stageStarters.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyStarter(starter)}
                  className="w-full text-left text-xs p-3 bg-white hover:bg-amber-100/60 border-2 border-amber-200 rounded-2xl text-slate-900 font-bold transition-all cursor-pointer block leading-relaxed shadow-xs"
                >
                  💡 {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative font-prompt">
          <div className="relative flex items-end bg-white rounded-3xl border-3 border-blue-200 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-md">
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
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-base p-3.5 sm:p-4 pr-24 resize-none border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 max-h-[180px] font-sans leading-relaxed min-h-[48px]"
              style={{ outline: 'none', boxShadow: 'none' }}
            />

            {/* Clear Text & Send Action Buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              {prompt.length > 0 && !isLoading && (
                <button
                  type="button"
                  onClick={clearPrompt}
                  className="min-h-[40px] min-w-[40px] p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                  title="ล้างข้อความ"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <button
                type="submit"
                disabled={!prompt.trim() || isLoading || attemptsLeft <= 0}
                className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-2xl flex items-center justify-center font-black transition-all ${
                  prompt.trim() && !isLoading && attemptsLeft > 0
                    ? 'btn-3d-pink text-white cursor-pointer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
                title="ส่งคำสั่ง Prompt ให้ AI ประเมิน"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin text-white" />
                ) : (
                  <ArrowUp size={22} className="font-extrabold stroke-[3]" />
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
