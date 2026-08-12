import React, { useState } from 'react';
import { Play, RefreshCw, Trophy, Heart, Lightbulb } from 'lucide-react';
import { playPopSound, playMascotBlipSound } from '../lib/soundEffects';

import SpotlightCard from './reactbits/SpotlightCard';

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

  const [speechIndex, setSpeechIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const handleNextSpeech = (isManual = true) => {
    if (isManual) playMascotBlipSound();
    setSpeechIndex((prev) => (prev + 1) % speechList.length);
    setTipIndex((prev) => (prev + 1) % cheatTips.length);
  };

  return (
    <SpotlightCard className="p-4 sm:p-5 rounded-3xl flex flex-col justify-between gap-4 relative font-prompt bg-white border border-black/5 shadow-xs">
      {/* Header Scoreboard Bar */}
      <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-black/5 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="bg-[#7C3AED]/[0.08] px-2.5 py-0.5 rounded-full font-mono text-[#6D28D9]">STUDENT</span>
          <span className="text-[#1A1525] font-bold truncate max-w-[130px] sm:max-w-none">
            {username || 'นักเรียน'} {studentId ? `[ID: ${studentId}]` : ''}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#F59E0B]">
          <Trophy size={14} />
          <span className="bg-[#F59E0B]/[0.08] px-2.5 py-0.5 rounded-full text-[#92400E] border border-[#F59E0B]/[0.15]">
            CLEARED: {clearedCount}/{totalStages} STAGES
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        {/* Mascot */}
        <div
          onClick={() => handleNextSpeech(true)}
          className="relative cursor-pointer shrink-0 group active:scale-95 transition-transform"
          title="แตะที่ Promptie เพื่อฟังคำชม!"
        >
          <img
            src="/assets/mascot.webp"
            alt="Promptie Mascot"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-xs"
          />

          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#7C3AED] text-white text-[9px] font-bold shadow-xs flex items-center gap-1 whitespace-nowrap font-mono">
            <RefreshCw size={9} />
            CLICK ME!
          </span>
        </div>

        {/* Speech Area */}
        <div className="space-y-2 flex-1 w-full min-w-0">
          <div className="p-3 rounded-2xl bg-black/[0.02] border border-black/5 relative">
            <div className="flex items-center justify-between mb-1 pb-1 border-b border-black/5 font-mono">
              <span className="text-[11px] font-bold text-[#B91C1C] font-kanit flex items-center gap-1">
                <Heart size={12} className="text-[#FF6B6B] fill-[#FF6B6B]" />
                ครู AI Promptie ({speechIndex + 1}/{speechList.length}):
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold leading-relaxed text-[#1A1525] font-prompt">
              {speechList[speechIndex]}
            </p>

            {/* Dots */}
            <div className="flex items-center gap-1 mt-2 pt-1 border-t border-black/5">
              {speechList.map((_, i) => (
                <span
                  key={i}
                  onClick={() => { setSpeechIndex(i); playMascotBlipSound(); }}
                  className={`h-1.5 rounded-full cursor-pointer transition-all ${
                    i === speechIndex ? 'w-4 bg-[#FF6B6B]' : 'w-1.5 bg-black/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Full Detailed Tip */}
          <div className="bg-[#F59E0B]/[0.08] border border-[#F59E0B]/[0.15] px-3 py-1.5 rounded-xl text-xs font-bold text-[#92400E] flex items-start sm:items-center gap-2">
            <Lightbulb size={14} className="text-[#F59E0B] shrink-0 mt-0.5 sm:mt-0" />
            <span className="leading-relaxed font-prompt text-xs break-words">
              {cheatTips[tipIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* Sleek Action Button with proper top margin & padding */}
      <div className="flex justify-end w-full pt-3 mt-1 border-t border-black/5">
        <button
          onClick={() => { playPopSound(); if (onStartClick) onStartClick(); }}
          className="btn-glass-mint min-h-[40px] px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer font-kanit active:scale-95 transition-all shadow-xs w-full sm:w-auto"
        >
          <Play size={15} />
          <span>ลุยบทเรียนถัดไป</span>
        </button>
      </div>
    </SpotlightCard>
  );
}