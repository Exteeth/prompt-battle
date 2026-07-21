import React, { useState, useEffect } from 'react';
import { playMascotBlipSound } from '../lib/soundEffects';
import { Sparkles, RefreshCw, Crown, Lightbulb, Zap } from 'lucide-react';

export default function MascotWidget({ 
  state = 'welcome', // 'welcome' | 'victory' | 'thinking' | 'coaching'
  customMessage = null,
  size = 'md', // 'sm' | 'md' | 'lg'
  onMascotClick = null
}) {
  const defaultMessages = {
    welcome: [
      'สวัสดีครับ! ผม Promptie ครู AI พร้อมพานักเรียนลุยด่านแล้วครับ! 🤖✨',
      'ทำตามเส้นทางเกาะการเรียนรู้ ปูพื้นฐานแน่นเปรียบ! 💡',
      'สะสมดาวให้เต็ม 20 คะแนนเพื่อชิงแชมเปียนชั้นเรียน! 🏆'
    ],
    victory: [
      'สุดยอดมากๆ เลยครับ! คุณทำคะแนนได้ยอดเยี่ยมมาก 🥳🎉',
      'สกิลการเขียน Prompt ของคุณพัฒนาขึ้นอย่างเห็นได้ชัด! 🌟',
      'พร้อมลุยด่านถัดไปเพื่อพิชิตคะแนนเต็มหรือยังครับ? 🚀'
    ],
    thinking: [
      'กำลังวิเคราะห์โครงสร้าง Prompt คำสั่งของคุณอยู่นะครับ... 🤖💭',
      'ตรวจสอบเกณฑ์ความชัดเจน ความครบถ้วน และเทคนิค... ⚡️'
    ],
    coaching: [
      'อย่าพึ่งท้อนะครับ! ลองปรับเพิ่มบริบท [CONTEXT] หรือข้อบังคับดูครับ 💪',
      'กดปุ่ม "ดูสูตรลับ Prompt" เพื่อทบทวน 5 องค์ประกอบลัดได้เลย! 💡'
    ]
  };

  const currentList = defaultMessages[state] || defaultMessages.welcome;
  const [msgIndex, setMsgIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (state === 'welcome') {
      const timer = setInterval(() => {
        handleNextMessage();
      }, 4500);
      return () => clearInterval(timer);
    }
  }, [state, msgIndex]);

  const handleNextMessage = () => {
    playMascotBlipSound();
    setIsChanging(true);
    setTimeout(() => {
      setMsgIndex((prev) => (prev + 1) % currentList.length);
      setIsChanging(false);
    }, 200);
    if (onMascotClick) onMascotClick();
  };

  const activeMessage = customMessage || currentList[msgIndex];

  // Size configurations
  const imageSizes = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36'
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 font-prompt">
      {/* Mascot Avatar with Interactive Expression */}
      <div 
        className="relative cursor-pointer group shrink-0" 
        onClick={handleNextMessage}
        title="แตะที่ Promptie เพื่อฟังคำแนะนำใหม่!"
      >
        {/* Animated Glowing Ambient Aura Halo */}
        <div className={`absolute inset-0 rounded-full blur-2xl opacity-50 pointer-events-none ${
          state === 'victory'
            ? 'bg-amber-400 animate-pulse'
            : state === 'thinking'
            ? 'bg-indigo-500 animate-spin-slow'
            : state === 'coaching'
            ? 'bg-rose-400 animate-pulse'
            : 'bg-blue-400 animate-pulse'
        }`} />

        {/* Crown Badge on Victory */}
        {state === 'victory' && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 animate-float">
            <Crown size={26} className="text-amber-500 fill-amber-400 drop-shadow-md" />
          </div>
        )}

        <img
          src="/assets/mascot.webp"
          alt="Promptie Mascot"
          className={`${imageSizes[size]} object-contain drop-shadow-xl relative z-10 transition-transform duration-300 group-hover:scale-110 ${
            state === 'thinking' ? 'animate-spin-slow' : 'animate-mascot-pulse'
          }`}
        />

        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-md flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
          <RefreshCw size={10} className="animate-spin" />
          <span>คุยกับผม!</span>
        </span>
      </div>

      {/* Dynamic Speech Bubble */}
      <div className="flex-1 min-w-0">
        <div className={`p-4 rounded-3xl border shadow-md relative transition-all duration-200 ${
          state === 'victory'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : state === 'coaching'
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : 'bg-white border-blue-200 text-slate-800'
        }`}>
          <p className={`text-xs sm:text-sm font-bold leading-relaxed transition-opacity duration-200 ${isChanging ? 'opacity-0' : 'opacity-100'}`}>
            {activeMessage}
          </p>

          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100/80">
            {currentList.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === msgIndex ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
