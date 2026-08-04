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
    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-5 sm:p-7 rounded-3xl shadow-2xl flex flex-col justify-between gap-5 relative overflow-hidden font-prompt border-4 border-white/30">
      {/* Background Interactive Starfield Particle Canvas */}
      <canvas
        ref={canvasRef}
        width={700}
        height={240}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0"
      />

      {/* Background Ambient Glowing Halo Orbs */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-400/25 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" />

      {/* Main Content Row: Mascot + Speech + Real-time Student Stats */}
      <div className="flex flex-col sm:flex-row items-center gap-5 z-10 w-full">
        {/* Mascot Promptie Character with Floating XP Pop Gimmick */}
        <div
          onClick={() => handleNextSpeech(true)}
          className="relative cursor-pointer group shrink-0"
          title="แตะที่ Promptie เพื่อฟังคำชมและกำลังใจใหม่!"
        >
          {/* Animated Glowing Ambient Halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-amber-300 blur-xl opacity-60 animate-pulse pointer-events-none" />

          {/* Floating XP Pop Text Gimmick */}
          {popText && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-300 to-amber-400 text-amber-950 font-black text-xs px-3.5 py-1 rounded-2xl shadow-xl animate-slide-up whitespace-nowrap z-30 border-2 border-amber-200">
              {popText}
            </div>
          )}

          <img
            src="/assets/mascot.webp"
            alt="Promptie Mascot"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-110 animate-mascot-pulse"
          />

          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-lg flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border border-amber-300 animate-wiggle">
            <RefreshCw size={11} className="animate-spin text-amber-900" />
            <span>รับกำลังใจ!</span>
          </span>
        </div>

        {/* Speech Bubble & Dynamic Student Progress */}
        <div className="space-y-3 flex-1 w-full min-w-0">
          <div className="p-4 sm:p-4.5 rounded-3xl bg-white text-slate-900 border-3 border-blue-200 shadow-xl relative group">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
              <span className="text-xs font-extrabold text-rose-600 font-kanit flex items-center gap-1.5">
                <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse" />
                <span>คำชม & กำลังใจจากครู AI Promptie ({speechIndex + 1}/{speechList.length}):</span>
              </span>

              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Volume2 size={11} className="text-blue-500 animate-pulse" />
                <span>อัตโนมัติ</span>
              </span>
            </div>

            <p key={fadeKey} className="text-xs sm:text-sm font-bold leading-relaxed break-words animate-fade-in font-prompt text-slate-800">
              {speechList[speechIndex]}
            </p>

            <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-100">
              {speechList.map((_, i) => (
                <span
                  key={i}
                  onClick={() => { setSpeechIndex(i); setFadeKey(k => k + 1); playMascotBlipSound(); }}
                  className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                    i === speechIndex ? 'w-6 bg-rose-500' : 'w-2 bg-slate-200 hover:bg-rose-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Rotating Formula Tip Pill */}
          <div className="bg-white/20 border-2 border-white/30 px-4 py-2 rounded-2xl text-xs font-bold text-white backdrop-blur-md flex items-start sm:items-center gap-3 transition-all shadow-sm">
            <Lightbulb size={17} className="text-amber-300 shrink-0 animate-pulse mt-0.5 sm:mt-0" />
            <span key={fadeKey} className="leading-relaxed break-words text-xs font-prompt animate-fade-in text-cyan-50">
              {cheatTips[tipIndex]}
            </span>
          </div>

          {/* Clean Real-time Student Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-outfit border border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs truncate max-w-[150px] sm:max-w-none font-prompt flex items-center gap-1.5">
                <span>👤</span>
                <span>{username || 'นักเรียน'} {studentId ? `(${studentId})` : ''}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono font-black text-amber-300 text-xs">
              <span className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-xl">
                <Trophy size={14} className="text-amber-300" />
                <span>ผ่านแล้ว {clearedCount}/{totalStages} ด่าน</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button with 3D Toy Button Glow */}
      <button
        onClick={() => { playPopSound(); if (onStartClick) onStartClick(); }}
        className="btn-3d-amber min-h-[48px] px-6 py-3 font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2.5 shrink-0 cursor-pointer w-full z-10 font-kanit tracking-wide border-2 border-amber-200"
      >
        <Play size={20} className="fill-amber-950 text-amber-950" />
        <span>เริ่มทำบทเรียนด่านถัดไป</span>
      </button>
    </div>
  );
}
