import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, Trophy, Heart, Volume2, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPopSound, playMascotBlipSound } from '../lib/soundEffects';

import SpotlightCard from './reactbits/SpotlightCard';
import Magnet from './reactbits/Magnet';
import ShinyText from './reactbits/ShinyText';
import StarBorder from './reactbits/StarBorder';
import BlurText from './reactbits/BlurText';

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

  // Auto-rotate every 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSpeech(false);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleNextSpeech = (isManual = true) => {
    if (isManual) playMascotBlipSound();
    setSpeechIndex((prev) => (prev + 1) % speechList.length);
    setTipIndex((prev) => (prev + 1) % cheatTips.length);

    const randomPop = popEffects[Math.floor(Math.random() * popEffects.length)];
    setPopText(randomPop);
    setTimeout(() => setPopText(null), 1800);
  };

  return (
    <SpotlightCard
      spotlightColor="rgba(124, 58, 237, 0.15)"
      borderColor="rgba(124, 58, 237, 0.25)"
      className="p-5 sm:p-7 rounded-3xl flex flex-col justify-between gap-5 relative overflow-hidden font-prompt bg-white/70 shadow-xl"
    >
      {/* Background ambient halos */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#7C3AED]/[0.08] rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#00B894]/[0.06] rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header Scoreboard Bar */}
      <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-black/5 pb-3 z-10">
        <div className="flex items-center gap-2">
          <span className="bg-[#7C3AED]/[0.08] px-3 py-1 rounded-full font-mono text-[#6D28D9]">STUDENT</span>
          <span className="text-[#1A1525] font-bold truncate max-w-[140px] sm:max-w-none">
            {username || 'นักเรียน'} {studentId ? `[ID: ${studentId}]` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#F59E0B]">
          <Trophy size={16} className="animate-bounce" />
          <ShinyText
            text={`CLEARED: ${clearedCount}/${totalStages} STAGES`}
            speed={4}
            className="bg-[#F59E0B]/[0.08] px-3 py-1 rounded-full text-[#92400E] border border-[#F59E0B]/[0.2]"
          />
        </div>
      </div>

      {/* Main Content: Mascot + Speech */}
      <div className="flex flex-col sm:flex-row items-center gap-5 z-10 w-full">
        {/* Mascot with ReactBits Magnet */}
        <Magnet magnetStrength={0.25} padding={120}>
          <div
            onClick={() => handleNextSpeech(true)}
            className="relative cursor-pointer group shrink-0"
            title="แตะที่ Promptie เพื่อฟังคำชมและกำลังใจใหม่!"
          >
            {/* Animated halo */}
            <div className="absolute inset-0 rounded-full bg-[#7C3AED]/[0.15] blur-xl opacity-70 animate-pulse pointer-events-none" />

            {/* Floating pop text */}
            <AnimatePresence>
              {popText && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -40, scale: 1 }}
                  exit={{ opacity: 0, y: -60, scale: 0.8 }}
                  className="absolute left-1/2 -translate-x-1/2 bg-[#FBBF24] text-[#1A1525] font-black text-xs px-3.5 py-1 rounded-full border border-white/40 shadow-xl whitespace-nowrap z-30 font-mono"
                >
                  ⚡ {popText}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.img
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              src="/assets/mascot.webp"
              alt="Promptie Mascot"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl relative z-10 animate-mascot-pulse"
            />

            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#7C3AED] text-white text-[10px] font-black shadow-lg flex items-center gap-1 opacity-95 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-mono">
              <RefreshCw size={10} className="animate-spin" />
              CLICK ME!
            </span>
          </div>
        </Magnet>

        {/* Speech + Tip Area */}
        <div className="space-y-3 flex-1 w-full min-w-0">
          <div className="p-4 rounded-2xl bg-white/70 border border-black/5 relative backdrop-blur-md">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-black/5 font-mono">
              <span className="text-xs font-bold text-[#B91C1C] font-kanit flex items-center gap-1.5">
                <Heart size={14} className="text-[#FF6B6B] fill-[#FF6B6B] animate-pulse" />
                ครู AI Promptie ({speechIndex + 1}/{speechList.length}):
              </span>

              <span className="text-[10px] text-[#6D28D9] font-mono flex items-center gap-1">
                <Volume2 size={11} className="animate-pulse" />
                REACTBITS SPEECH
              </span>
            </div>

            <div className="min-h-[44px] flex items-center">
              <BlurText
                key={speechIndex}
                text={speechList[speechIndex]}
                className="text-xs sm:text-sm font-bold leading-relaxed font-prompt text-[#1A1525]"
                delay={0.015}
              />
            </div>

            {/* Dots navigation */}
            <div className="flex items-center gap-1 mt-3 pt-2 border-t border-black/5">
              {speechList.map((_, i) => (
                <span
                  key={i}
                  onClick={() => { setSpeechIndex(i); playMascotBlipSound(); }}
                  className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                    i === speechIndex ? 'w-6 bg-[#FF6B6B]' : 'w-2 bg-black/10 hover:bg-[#FF6B6B]/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Rotating tip */}
          <div className="bg-[#F59E0B]/[0.08] border border-[#F59E0B]/[0.2] px-4 py-2 rounded-xl text-xs font-bold text-[#92400E] flex items-start sm:items-center gap-3 transition-all backdrop-blur-sm">
            <Lightbulb size={17} className="text-[#F59E0B] shrink-0 animate-pulse mt-0.5 sm:mt-0" />
            <span key={tipIndex} className="leading-relaxed break-words text-xs font-prompt animate-fade-in">
              {cheatTips[tipIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* Start Button with ReactBits StarBorder */}
      <StarBorder color="#00B894" speed="3s" className="w-full">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { playPopSound(); if (onStartClick) onStartClick(); }}
          className="btn-glass-mint min-h-[52px] px-6 py-3 text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer w-full font-kanit tracking-wider uppercase shadow-lg"
        >
          <Play size={20} />
          <span>ลุยบทเรียนถัดไป / START BATTLE</span>
        </motion.button>
      </StarBorder>
    </SpotlightCard>
  );
}