import React, { useState, useEffect, useRef } from 'react';
import { Play, RefreshCw, Trophy, Star, Lightbulb, Heart, MessageSquare, Volume2, Sparkles, Award, Flame } from 'lucide-react';
import { playPopSound, playMascotBlipSound } from '../lib/soundEffects';

export default function CuteMascotHeroBanner({ 
  username, 
  studentId, 
  clearedCount = 0, 
  totalStages = 5, 
  onStartClick 
}) {
  // Pure Encouragement, Compliments, and Praise Messages from ครู AI Promptie
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

  // Background Drifting Particle Starfield Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let particles = Array.from({ length: 22 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 1,
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

  // Continuous auto-rotation every 4.5 seconds for continuous cheer & chatter
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

    // Floating Encouragement Pop Effect
    const randomPop = popEffects[Math.floor(Math.random() * popEffects.length)];
    setPopText(randomPop);
    setTimeout(() => setPopText(null), 1800);
  };

  return (
    <div className="arcade-card-pink p-5 sm:p-7 rounded-3xl shadow-2xl flex flex-col justify-between gap-5 relative overflow-hidden font-prompt border-4 border-cyan-400">
      {/* CRT Scanline & Ambient Neon Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none z-0 animate-scanline" />
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" />

      {/* Arcade Header Scoreboard Bar */}
      <div className="flex items-center justify-between text-xs font-mono font-black border-b-2 border-slate-700/80 pb-3.5 z-10">
        <div className="flex items-center gap-2 text-cyan-400">
          <span className="bg-cyan-950 px-2.5 py-1 rounded border border-cyan-400 font-mono">PLAYER 1</span>
          <span className="text-white truncate max-w-[140px] sm:max-w-none">
            {username || 'นักเรียน'} {studentId ? `[ID: ${studentId}]` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 text-yellow-300">
          <Trophy size={16} className="text-yellow-400 animate-bounce" />
          <span className="bg-yellow-950 px-2.5 py-1 rounded border border-yellow-400">
            CLEARED: {clearedCount}/{totalStages} STAGES
          </span>
        </div>
      </div>

      {/* Main Content Row: Mascot + Speech + Real-time Student Stats */}
      <div className="flex flex-col sm:flex-row items-center gap-5 z-10 w-full">
        {/* Mascot Promptie Character with Floating Arcade Pop Gimmick */}
        <div
          onClick={() => handleNextSpeech(true)}
          className="relative cursor-pointer group shrink-0"
          title="แตะที่ Promptie เพื่อฟังคำชมและกำลังใจใหม่!"
        >
          {/* Animated Glowing Ambient Halo */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-xl opacity-80 animate-pulse pointer-events-none" />

          {/* Floating XP Pop Text Gimmick */}
          {popText && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-black text-xs px-3.5 py-1 rounded border-2 border-white shadow-xl animate-slide-up whitespace-nowrap z-30 font-mono">
              ⚡ {popText}
            </div>
          )}

          <img
            src="/assets/mascot.webp"
            alt="Promptie Mascot"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-110 animate-mascot-pulse"
          />

          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded bg-yellow-400 text-black text-[10px] font-black shadow-lg flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border border-white font-mono">
            <RefreshCw size={10} className="animate-spin text-black" />
            <span>8-BIT BOOST!</span>
          </span>
        </div>

        {/* Speech Bubble & Dynamic Student Progress */}
        <div className="space-y-3 flex-1 w-full min-w-0">
          <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-900 text-white border-2 border-cyan-400 shadow-xl relative group">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800 font-mono">
              <span className="text-xs font-black text-pink-400 font-kanit flex items-center gap-1.5">
                <Heart size={14} className="text-pink-500 fill-pink-500 animate-pulse" />
                <span>ครู AI Promptie ({speechIndex + 1}/{speechList.length}):</span>
              </span>

              <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <Volume2 size={11} className="text-cyan-400 animate-pulse" />
                <span>ARCADE VOICE</span>
              </span>
            </div>

            <p key={fadeKey} className="text-xs sm:text-sm font-bold leading-relaxed break-words animate-fade-in font-prompt text-slate-100">
              {speechList[speechIndex]}
            </p>

            <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-800">
              {speechList.map((_, i) => (
                <span
                  key={i}
                  onClick={() => { setSpeechIndex(i); setFadeKey(k => k + 1); playMascotBlipSound(); }}
                  className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                    i === speechIndex ? 'w-6 bg-pink-500' : 'w-2 bg-slate-700 hover:bg-pink-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Rotating Formula Tip Pill */}
          <div className="bg-slate-900/90 border-2 border-yellow-400/70 px-4 py-2 rounded-xl text-xs font-bold text-yellow-300 backdrop-blur-md flex items-start sm:items-center gap-3 transition-all shadow-sm font-mono">
            <Lightbulb size={17} className="text-yellow-300 shrink-0 animate-pulse mt-0.5 sm:mt-0" />
            <span key={fadeKey} className="leading-relaxed break-words text-xs font-prompt animate-fade-in text-yellow-200">
              {cheatTips[tipIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* Start Button with 3D Arcade Button Glow */}
      <button
        onClick={() => { playPopSound(); if (onStartClick) onStartClick(); }}
        className="btn-arcade-yellow min-h-[50px] px-6 py-3 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2.5 shrink-0 cursor-pointer w-full z-10 font-kanit tracking-wider uppercase text-black"
      >
        <Play size={20} className="fill-black text-black" />
        <span>PRESS START / ลุยบทเรียนถัดไป</span>
      </button>
    </div>
  );
}
