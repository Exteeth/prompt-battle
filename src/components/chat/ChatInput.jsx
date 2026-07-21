import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Sparkles } from 'lucide-react';

export default function ChatInput({ onSubmit, isLoading, attemptsLeft }) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || attemptsLeft <= 0) return;
    onSubmit(prompt);
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 sticky bottom-0 z-10 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end bg-slate-50 rounded-2xl border border-slate-300 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-600 transition-all shadow-sm">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || attemptsLeft <= 0}
              placeholder={
                attemptsLeft <= 0 
                  ? 'คุณใช้โควต้า 3 attempts ของด่านนี้ครบแล้ว' 
                  : 'พิมพ์ Prompt คำสั่งของคุณที่นี่... (กด Enter เพื่อส่ง)'
              }
              rows={1}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base p-3.5 pr-14 resize-none focus:outline-none max-h-[160px] font-sans leading-relaxed min-h-[44px]"
            />

            {/* Send Button */}
            <div className="absolute right-2.5 bottom-2.5">
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading || attemptsLeft <= 0}
                className={`min-h-[44px] min-w-[44px] w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  prompt.trim() && !isLoading && attemptsLeft > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 cursor-pointer'
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
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles size={13} className="text-blue-600 shrink-0" />
            <span className="truncate">ออกแบบคำสั่งโดยระบุบริบท และรูปแบบผลลัพธ์ที่ต้องการให้ชัดเจน</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 font-mono">
            <span>{prompt.length} ตัวอักษร</span>
          </div>
        </div>
      </div>
    </div>
  );
}
