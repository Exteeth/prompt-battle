import React from 'react';
import { User, Copy, Check, Cpu } from 'lucide-react';
import FeedbackCard from './FeedbackCard';

export default function ChatMessage({ message, isLatest, isThinking }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.type === 'user') {
    return (
      <div className="py-3 sm:py-4 px-3 sm:px-6 flex justify-end animate-fade-in">
        <div className="flex gap-2.5 sm:gap-3 max-w-[90%] sm:max-w-[75%]">
          <div className="chat-bubble-user-light px-3.5 sm:px-4 py-3 text-xs sm:text-base text-white shadow-md">
            <p className="whitespace-pre-wrap leading-relaxed font-sans">{message.text}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
            <User size={16} />
          </div>
        </div>
      </div>
    );
  }

  // AI Message
  return (
    <div className="py-4 sm:py-5 px-3 sm:px-6 bg-slate-100/60 border-y border-slate-200/80 animate-fade-in">
      <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
        {/* AI Avatar WebP Logo */}
        <img
          src="/assets/logo.webp"
          alt="PromptGPT AI"
          className="w-8 h-8 object-contain shrink-0 drop-shadow-sm"
        />

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono">
              <Cpu size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-700 tracking-wider">
                PromptGPT Evaluator {message.attemptNumber && `(Attempt ${message.attemptNumber})`}
              </span>
            </div>

            {message.aiOutput && (
              <button
                onClick={() => handleCopy(message.aiOutput)}
                className="text-slate-500 hover:text-slate-900 text-xs flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-200 cursor-pointer min-h-[36px]"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span className="hidden sm:inline">{copied ? 'คัดลอกแล้ว' : 'คัดลอกผลลัพธ์'}</span>
              </button>
            )}
          </div>

          {/* AI Output Content */}
          <div className="text-xs sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
            {message.aiOutput}
          </div>

          {/* Inline Feedback Card */}
          {message.scores && message.feedback && (
            <FeedbackCard
              scores={message.scores}
              totalScore={message.totalScore}
              feedback={message.feedback}
              attemptNumber={message.attemptNumber}
            />
          )}
        </div>
      </div>
    </div>
  );
}
