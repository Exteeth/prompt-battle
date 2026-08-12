import React, { useState, useEffect, useRef } from 'react';
import { Play, RefreshCw, Trophy, Star, Lightbulb, Heart, Volume2 } from 'lucide-react';
import { playPopSound, playMascotBlipSound } from '../lib/soundEffects';

export default function CuteMascotHeroBanner({ 
  username, 
  studentId, 
  clearedCount = 0, 
  totalStages = 5, 
  onStartClick 
}) {
  const speechList = [
    `สวัสดีครับน้อง${username || 'นักเรียน'}! ครู AI Promptie เชื่อมั่นในตัวน้องเสมอ ยินดีต้อนรับเข้าสู่เกาะผจญภัยนะครับ! 🤖✨`,
    `สุดยอดไปเลย! ความพยายามฝึกฝนของน้อง${username || 'นักเรียน'} จะทำให้น้องกลายเป็น Master ที่เก่งที่สุดแน่นอนครับ! 🚀🔥`,
    `เก่งมากๆ เลยครับ! ทุกบทเรียนที่น้องลงมือทำ คือก้าวสำคัญที่ทำให้น้องฉลาดและพัฒนาขึ้นทุกวันครับ! 🌈✨`,
    `ครู Promptie ภูมิใจในตัวน้องมากเลยครับ! ลุยด่านถัดไปชิงคะแนนเต็ม 20 คะแนนกันเลยนะ! 🏆🎉`,
    `ไม่มีอะไรที่ยากเกินความสามารถของน้องแน่นอน! ลุยเลยครับ ครูคอยเชียร์และเป็นกำลังใจให้อยู่นะ! 💪🤖`,
    `น้องเป็นนักเรียนที่ตั้งใจเรียนรู้มากเลยครับ! ความคิดสร้างสรรค์ของน้องสุดยอดและโดดเด่นที่สุด! 🎨⭐`,
    `อย่ากลัวที่จะลองผิดลองถูกนะครับ! ทุกครั้งที่ฝึกเขียนคำสั่ง น้องกำลังเก่งขึ้นอีกขั้นแล้ว! 🌱✨`,
    `พร้อมแล้วรึยังครับ? พลังความคิดและการสั่งการ AI ของน้อง${username || 'นักเรียน'} สุดยอดเกินใครแล้ว! ⚡️`,
    `คนเก่งของครู! สะสมดาวให้ครบทุกด่านแล้วนำเหรียญรางวัลเกียรติยศกลับบ้านกันนะครับ! 🎖️🥇`,
    `สู้ๆ นะครับน้อง${username || 'นักเรียน'}! ครู AI Promptie จะอยู่เคียงข้างคอยส่งพลังใจให้น้องเสมอเลย! ❤️🤖`
  ];

  const cheatTips = [
    '💡 สูตรลับ 1 (Role & Context): ระบุบทบาท [ROLE] และใส่บริบท [CONTEXT] ให้ครบถ้วน',
    '💡 สูตรลับ 2 (Task & Constraints): สั่งภารกิจ [TASK] ให้ชัดเจน พร้อมกำหนดข้อจำกัด [CONSTRAINTS]',
    '💡 สูตรลับ 3 (Format & Clarity): กำหนดรูปแบบ [FORMAT] สื่อความกระชับ [CLARITY] ไม่กำกวม',
    '💡 สูตรลับ 4 (Refinement & Iteration): วิเคราะห์ผลลัพธ์และสั่งปรับแก้ [REFINEMENT] ทำซ้ำต่อเนื่อง',
    '💡 เทคนิคพิเศษ (Few-Shot): ยกตัวอย่างคำตอบที่ต้องการให้ AI ดู 1-2 ตัวอย่างก่อนเสมอ',
    '💡 เทคนิคพิเศษ (Step-by-Step): สั่งให้ AI "คิดทีละขั้นตอน" ช่วยลดข้อผิดพลาดได้มหาศาล',
    '💡 เทคนิคพิเศษ (Tone Control): กำหนดน้ำเสียง เช่น "เป็นกันเอง สุภาพ เหมาะสำหรับเด็กประถม"'
  ];

  const popEffects = [
    '❤️ PROMPTIE LOVE!',
    '🎉 YOU CAN DO IT!',
    '🏆 GOAL 20 PTS!',
    '🌟 YOU ARE AMAZING!',
    '🔥 KEEP IT UP!',
    '🤖 SUPER STUDENT!'
  ];

  const [speechIndex, setSpeechIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [popText, setPopText] = useState(null);
  const [fadeKey, setFadeKey] = useState(0);
  const canvasRef = useRef(null);

  // Background subtle particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 15 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      alpha: Math.random() * 0.4 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();
      }
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Auto-rotate every 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSpeech(false);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleNextSpeech = (isManual = true) => {
    if (isManual) playMascotBlipSound();
    setSpeechIndex((prev) => (prev + 1) % speechList.length);
    setTipIndex((prev) => (prev + 1) % cheatTips.length);
    setFadeKey((prev) => prev + 1);

    const randomPop = popEffects[Math.floor(Math.random() * popEffects.length)];
    setPopText(randomPop);
    setTimeout(() => setPopText(null), 1800);
  };

  return (
    <div className="glass-panel-elevated p-5 sm:p-7 rounded-3xl flex flex-col justify-between gap-5 relative overflow-hidden font-prompt">
      {/* Background particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 rounded-3xl" style={{ width: '100%', height: '100%' }} />

      {/* Subtle inner glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#7C3AED]/[0.08] rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#00B894]/[0.06] rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header Scoreboard Bar */}
      <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-black/5 pb-3 z-10">
        <div className="flex items-center gap-2">
          <span className="bg-black/[0.03] px-3 py-1 rounded-full font-mono text-[#6D28D9]">STUDENT</span>
          <span className="text-[#1A1525] font-bold truncate max-w-[140px] sm:max-w-none">
            {username || 'นักเรียน'} {studentId ? `[ID: ${studentId}]` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#F59E0B]">
          <Trophy size={16} className="animate-bounce" />
          <span className="bg-[#F59E0B]/[0.08] px-3 py-1 rounded-full text-[#92400E] border border-[#F59E0B]/[0.15]">
            CLEARED: {clearedCount}/{totalStages} STAGES
          </span>
        </div>
      </div>

      {/* Main Content: Mascot + Speech + Stats */}
      <div className="flex flex-col sm:flex-row items-center gap-5 z-10 w-full">
        {/* Mascot */}
        <div
          onClick={() => handleNextSpeech(true)}
          className="relative cursor-pointer group shrink-0"
          title="แตะที่ Promptie เพื่อฟังคำชมและกำลังใจใหม่!"
        >
          {/* Animated halo */}
          <div className="absolute inset-0 rounded-full bg-[#7C3AED]/[0.12] blur-xl opacity-70 animate-pulse pointer-events-none" />

          {/* Floating pop effect */}
          {popText && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#FBBF24] text-[#1A1525] font-black text-xs px-3.5 py-1 rounded-full border border-white/30 shadow-xl animate-slide-up whitespace-nowrap z-30 font-mono">
              ⚡ {popText}
            </div>
          )}

          <img
            src="/assets/mascot.webp"
            alt="Promptie Mascot"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl relative z-10 transition-transform duration-300 group-hover:scale-110 animate-mascot-pulse"
          />

          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#7C3AED] text-white text-[10px] font-black shadow-lg flex items-center gap-1 opacity-95 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-mono">
            <RefreshCw size={10} className="animate-spin" />
            CLICK ME!
          </span>
        </div>

        {/* Speech + Tip area */}
        <div className="space-y-3 flex-1 w-full min-w-0">
          {/* Speech bubble glass card */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-black/[0.02] border border-black/5 relative backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-black/5 font-mono">
              <span className="text-xs font-bold text-[#B91C1C] font-kanit flex items-center gap-1.5">
                <Heart size={14} className="text-[#FF6B6B] fill-[#FF6B6B] animate-pulse" />
                ครู AI Promptie ({speechIndex + 1}/{speechList.length}):
              </span>

              <span className="text-[10px] text-[#6D28D9] font-mono flex items-center gap-1">
                <Volume2 size={11} className="animate-pulse" />
                MASCOT VOICE
              </span>
            </div>

            <p key={fadeKey} className="text-xs sm:text-sm font-bold leading-relaxed break-words animate-fade-in font-prompt text-[#1A1525]">
              {speechList[speechIndex]}
            </p>

            {/* Dots navigation */}
            <div className="flex items-center gap-1 mt-3 pt-2 border-t border-black/5">
              {speechList.map((_, i) => (
                <span
                  key={i}
                  onClick={() => { setSpeechIndex(i); setFadeKey(k => k + 1); playMascotBlipSound(); }}
                  className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                    i === speechIndex ? 'w-6 bg-[#FF6B6B]' : 'w-2 bg-black/8 hover:bg-[#FF6B6B]/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Rotating formula tip */}
          <div className="bg-[#F59E0B]/[0.08] border border-[#F59E0B]/[0.15] px-4 py-2 rounded-xl text-xs font-bold text-[#92400E] flex items-start sm:items-center gap-3 transition-all backdrop-blur-sm">
            <Lightbulb size={17} className="text-[#F59E0B] shrink-0 animate-pulse mt-0.5 sm:mt-0" />
            <span key={fadeKey} className="leading-relaxed break-words text-xs font-prompt animate-fade-in">
              {cheatTips[tipIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={() => { playPopSound(); if (onStartClick) onStartClick(); }}
        className="btn-glass-mint min-h-[50px] px-6 py-3 rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2.5 shrink-0 cursor-pointer w-full z-10 font-kanit tracking-wider uppercase"
      >
        <Play size={20} />
        <span>ลุยบทเรียนถัดไป / START BATTLE</span>
      </button>
    </div>
  );
}