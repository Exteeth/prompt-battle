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
    <div className="w-full bg-slate-900/95 backdrop-blur-md border-t-2 border-cyan-400/80 p-3 sm:p-4 sticky bottom-0 z-10 shadow-2xl font-prompt">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick Master Formula Tag Insert Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none font-mono">
          <span className="text-[11px] font-black text-cyan-400 shrink-0 flex items-center gap-1">
            <PlusCircle size={14} className="text-cyan-400 animate-pulse" />
            <span>ACTION KEYS:</span>
          </span>
          {formulaTags.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertFormulaTag(item.tag)}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-cyan-400 text-xs font-black transition-all shrink-0 cursor-pointer active:scale-95 shadow-xs"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Starter Templates Drawer / Pills */}
        {stageStarters && stageStarters.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => { playPopSound(); setShowStarters(!showStarters); }}
              className="px-3.5 py-1.5 rounded bg-yellow-950 border border-yellow-400 text-yellow-300 font-black flex items-center gap-1.5 hover:bg-yellow-900 transition-colors shrink-0 cursor-pointer"
            >
              <Wand2 size={14} className="text-yellow-400 animate-spin-slow" />
              <span>PROMPT HELPER ({stageStarters.length})</span>
            </button>

            {stageHint && (
              <span className="text-[11px] text-yellow-300 bg-yellow-950/80 px-3 py-1 rounded border border-yellow-400 flex items-center gap-1 shrink-0 font-bold">
                <Lightbulb size={13} className="text-yellow-400 animate-pulse" />
                <span>{stageHint}</span>
              </span>
            )}
          </div>
        )}

        {/* Expandable Starter Options */}
        {showStarters && stageStarters && (
          <div className="p-3.5 bg-slate-900 border-2 border-yellow-400 rounded-xl space-y-2 animate-slide-up font-prompt">
            <span className="text-xs font-black text-yellow-300 block font-mono">⚡ CLICK TO INSERT TEMPLATE:</span>
            <div className="space-y-2">
              {stageStarters.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyStarter(starter)}
                  className="w-full text-left text-xs p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white font-bold transition-all cursor-pointer block leading-relaxed"
                >
                  💡 {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative font-prompt">
          <div className="relative flex items-end bg-slate-900 rounded-2xl border-2 border-cyan-400 focus-within:border-pink-500 transition-all shadow-xl">
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
              className="w-full bg-transparent text-white placeholder-slate-500 text-xs sm:text-base p-3.5 sm:p-4 pr-24 resize-none border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 max-h-[180px] font-sans leading-relaxed min-h-[48px]"
              style={{ outline: 'none', boxShadow: 'none' }}
            />

            {/* Clear Text & Send Action Buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              {prompt.length > 0 && !isLoading && (
                <button
                  type="button"
                  onClick={clearPrompt}
                  className="min-h-[40px] min-w-[40px] p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                  title="ล้างข้อความ"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <button
                type="submit"
                disabled={!prompt.trim() || isLoading || attemptsLeft <= 0}
                className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg flex items-center justify-center font-black transition-all ${
                  prompt.trim() && !isLoading && attemptsLeft > 0
                    ? 'btn-arcade-pink text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
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
