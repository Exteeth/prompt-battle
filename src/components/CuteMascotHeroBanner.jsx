import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, RefreshCw, Trophy, Star, Lightbulb, Zap, Award } from 'lucide-react';
import { playPopSound, playMascotBlipSound } from '../lib/soundEffects';

export default function CuteMascotHeroBanner({ 
  username, 
  studentId, 
  clearedCount = 0, 
  totalStages = 5, 
  onStartClick 
}) {
  const speechList = [
    `สวัสดีครับน้อง${username || 'นักเรียน'}! ผมคือครู AI Promptie พร้อมพาลุยเกาะผจญภัยแล้วครับ! 🤖✨`,
    'กดเลือกด่านด้านล่างเพื่อฝึกเขียน Prompt ปูพื้นฐานแน่นเปรียบได้เลยครับ! 💡',
    'ทำตามสูตรลับ 5 องค์ประกอบเพื่อชิงคะแนนเต็ม 20 คะแนนและปลดล็อกเหรียญทอง! 🏆'
  ];

  const cheatTips = [
    '💡 สูตรลับ 1: ระบุบทบาท [ROLE] ให้ชัดเจน เช่น "คุณคือผู้เชี่ยวชาญภาษาไทย"',
    '💡 สูตรลับ 2: ใส่บริบท [CONTEXT] ให้ครบถ้วน เพื่อให้ AI เข้าใจสถานการณ์',
    '💡 สูตรลับ 3: สั่งงาน [TASK] ด้วยคำกริยาที่เจาะจง และระบุรูปแบบ [FORMAT]'
  ];

  const popEffects = [
    '✨ +10 XP Promptie Power!',
    '🎉 PROMPT HERO!',
    '🏆 GOAL 20 PTS!',
    '🌟 GREAT JOB!'
  ];

  const [speechIndex, setSpeechIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [popText, setPopText] = useState(null);
  const canvasRef = useRef(null);

  // Background Drifting Particle Starfield Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.4 + 0.1
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';

      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) p.y = canvas.height;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSpeech();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSpeech = () => {
    playMascotBlipSound();
    setSpeechIndex((prev) => (prev + 1) % speechList.length);
    setTipIndex((prev) => (prev + 1) % cheatTips.length);

    // Floating XP Pop Gimmick Effect
    const randomPop = popEffects[Math.floor(Math.random() * popEffects.length)];
    setPopText(randomPop);
    setTimeout(() => setPopText(null), 1800);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 sm:p-7 rounded-3xl shadow-2xl flex flex-col justify-between gap-5 relative overflow-hidden font-prompt border-2 border-blue-300/40">
      {/* Background Interactive Starfield Particle Canvas */}
      <canvas
        ref={canvasRef}
        width={700}
        height={220}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0"
      />

      {/* Background Subtle Ambient Glowing Halo Orbs */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none z-0" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-400/15 rounded-full blur-2xl pointer-events-none z-0" />

      {/* Main Content Row: Mascot + Speech + Real-time Student Stats */}
      <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full">
        {/* Mascot Promptie Character with Floating XP Pop Gimmick */}
        <div
          onClick={handleNextSpeech}
          className="relative cursor-pointer group shrink-0"
          title="แตะที่ Promptie เพื่อฟังคำแนะนำใหม่!"
        >
          {/* Animated Glowing Ambient Halo */}
          <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-xl animate-pulse pointer-events-none" />

          {/* Floating XP Pop Text Gimmick */}
          {popText && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-xl shadow-lg animate-slide-up whitespace-nowrap z-30">
              {popText}
            </div>
          )}

          <img
            src="/assets/mascot.webp"
            alt="Promptie Mascot"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-110 animate-mascot-pulse"
          />

          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-md flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
            <RefreshCw size={10} className="animate-spin" />
            <span>กดคุยกับผม!</span>
          </span>
        </div>

        {/* Speech Bubble & Dynamic Student Progress */}
        <div className="space-y-3 flex-1 w-full min-w-0">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white text-slate-800 border-2 border-blue-200 shadow-md relative">
            <p className="text-xs sm:text-sm font-bold leading-relaxed break-words">
              {speechList[speechIndex]}
            </p>

            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100">
              {speechList.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === speechIndex ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Rotating Formula Tip Pill (100% Full Text View on Mobile) */}
          <div className="bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-100 backdrop-blur-md flex items-start sm:items-center gap-2.5 transition-all">
            <Lightbulb size={16} className="text-amber-300 shrink-0 animate-pulse mt-0.5 sm:mt-0" />
            <span className="leading-relaxed break-words text-[11px] sm:text-xs">
              {cheatTips[tipIndex]}
            </span>
          </div>

          {/* Clean Real-time Student Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-black/20 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs truncate max-w-[140px] sm:max-w-none">
                👤 {username || 'นักเรียน'} {studentId ? `(${studentId})` : ''}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono font-bold text-amber-300 text-xs">
              <span className="flex items-center gap-1">
                <Trophy size={14} className="text-amber-300" />
                <span>ผ่านแล้ว {clearedCount}/{totalStages} ด่าน</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button with Animated Shimmer Glow */}
      <button
        onClick={() => { playPopSound(); if (onStartClick) onStartClick(); }}
        className="min-h-[48px] px-6 py-3 bg-white hover:bg-slate-100 text-blue-700 font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer w-full hover:scale-[1.02] active:scale-95 animate-shimmer z-10"
      >
        <Play size={18} className="fill-blue-700" />
        <span>เริ่มทำบทเรียนด่านถัดไป</span>
      </button>
    </div>
  );
}
