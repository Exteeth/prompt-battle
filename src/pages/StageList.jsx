import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { STAGES_DATA } from '../data/stagesData';
import { getUserStageAttempts, getUserAchievements, getLeaderboard } from '../lib/sessionStorage';
import { playPopSound, playStarTwinkleSound, toggleMute, getMuteState } from '../lib/soundEffects';

import CuteMascotHeroBanner from '../components/CuteMascotHeroBanner';
import PromptCheatSheetModal from '../components/PromptCheatSheetModal';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import TiltedCard from '../components/reactbits/TiltedCard';
import ShinyText from '../components/reactbits/ShinyText';
import ParticlesBg from '../components/reactbits/ParticlesBg';

import { 
  BookOpen, Swords, Trophy, LogOut, CheckCircle, ArrowRight, Star, Sparkles, 
  Volume2, VolumeX, Medal, Layers, UserCheck, Target, FileText, 
  RefreshCw, Zap, Crown, LayoutGrid, Lock, ChevronRight
} from 'lucide-react';

export default function StageList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('stages');
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [muted, setMuted] = useState(getMuteState());
  const [selectedFormulaCard, setSelectedFormulaCard] = useState(null);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    playPopSound();
    logout();
    navigate('/');
  };

  const handleSoundToggle = () => {
    const newState = toggleMute();
    setMuted(newState);
    if (!newState) playPopSound();
  };

  const mainStages = STAGES_DATA.filter(s => !s.is_tutorial);
  const achievements = getUserAchievements();
  const roomLeaderboard = getLeaderboard(user.roomCode);

  const clearedCount = mainStages.filter(s => {
    const attempts = getUserStageAttempts(s.id);
    const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
    return highestScore >= 12;
  }).length;

  const currentLevelIndex = Math.min(clearedCount, mainStages.length - 1);
  const totalUserStars = STAGES_DATA.reduce((sum, s) => {
    const attempts = getUserStageAttempts(s.id);
    const maxS = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
    return sum + maxS;
  }, 0);

  const formulaCards = [
    { id: 'clarity',   icon: Sparkles,   color: 'violet', bgLight: 'bg-[#7C3AED]/[0.04]', border: 'border-[#7C3AED]/[0.10]', borderSelect: 'border-[#7C3AED]/[0.30]', iconBg: 'bg-[#7C3AED]/[0.10]', iconText: 'text-[#6D28D9]', title: '1. ความชัดเจน (Clarity)',          desc: 'กระชับ ไม่กำกวม สื่อความหมายเจาะจง',                               example: 'ใช้คำกริยาชี้เฉพาะ เช่น "สรุปเปรียบเทียบใน 3 ข้อ"' },
    { id: 'role',      icon: UserCheck,   color: 'violet', bgLight: 'bg-[#7C3AED]/[0.04]', border: 'border-[#7C3AED]/[0.10]', borderSelect: 'border-[#7C3AED]/[0.30]', iconBg: 'bg-[#7C3AED]/[0.10]', iconText: 'text-[#6D28D9]', title: '2. การกำหนดบทบาท (Role)',          desc: 'สวมบทบาทให้ AI เพิ่มคลังความรู้',                                example: 'คุณคือคุณครูสอนวิทยาศาสตร์ใจดีสำหรับเด็ก ม.1' },
    { id: 'context',   icon: BookOpen,    color: 'mint',   bgLight: 'bg-[#00B894]/[0.04]', border: 'border-[#00B894]/[0.10]', borderSelect: 'border-[#00B894]/[0.30]', iconBg: 'bg-[#00B894]/[0.10]', iconText: 'text-[#047857]', title: '3. การให้บริบท (Context)',          desc: 'ใส่สภาพแวดล้อมและข้อมูลพื้นฐาน',                                 example: 'สำหรับผู้เรียนกลุ่มประถม งบประมาณไม่เกิน 2,000 บาท' },
    { id: 'task',      icon: Target,      color: 'coral',  bgLight: 'bg-[#FF6B6B]/[0.04]', border: 'border-[#FF6B6B]/[0.10]', borderSelect: 'border-[#FF6B6B]/[0.30]', iconBg: 'bg-[#FF6B6B]/[0.10]', iconText: 'text-[#B91C1C]', title: '4. การระบุภารกิจ (Task)',          desc: 'กำหนดเป้าหมายภารกิจชัดเจน',                                      example: 'สร้างตารางวิเคราะห์ SWOT สำหรับธุรกิจกาแฟ' },
    { id: 'constraints',icon: Layers,      color: 'violet', bgLight: 'bg-[#7C3AED]/[0.04]', border: 'border-[#7C3AED]/[0.10]', borderSelect: 'border-[#7C3AED]/[0.30]', iconBg: 'bg-[#7C3AED]/[0.10]', iconText: 'text-[#6D28D9]', title: '5. ข้อจำกัด (Constraints)',        desc: 'กำหนดขอบเขตและข้อห้าม',                                          example: 'ห้ามใช้ศัพท์เทคนิคซับซ้อน ขอเฉพาะ 3 หัวข้อหลัก' },
    { id: 'format',    icon: FileText,    color: 'mint',   bgLight: 'bg-[#00B894]/[0.04]', border: 'border-[#00B894]/[0.10]', borderSelect: 'border-[#00B894]/[0.30]', iconBg: 'bg-[#00B894]/[0.10]', iconText: 'text-[#047857]', title: '6. รูปแบบผลลัพธ์ (Format)',        desc: 'สั่งโครงสร้างคำตอบที่ต้องการ',                                    example: 'แสดงผลลัพธ์เป็นตาราง Markdown 3 คอลัมน์' },
    { id: 'refinement',icon: RefreshCw,    color: 'coral',  bgLight: 'bg-[#FF6B6B]/[0.04]', border: 'border-[#FF6B6B]/[0.10]', borderSelect: 'border-[#FF6B6B]/[0.30]', iconBg: 'bg-[#FF6B6B]/[0.10]', iconText: 'text-[#B91C1C]', title: '7. การปรับแก้ (Refinement)',      desc: 'วิเคราะห์ผลและปรับแก้ทำซ้ำ',                                     example: 'นำคำตอบแรกมาสั่งปรับแก้เพิ่มตัวอย่างในรอบถัดไป' }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F5F3FA] text-[#1A1525] flex flex-col font-prompt relative overflow-hidden">
      {/* ─── Animated Morphing Gradient Orbs ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="orb-violet" style={{ top: '-5%', right: '-5%' }} />
        <div className="orb-mint" style={{ top: '50%', left: '-8%' }} />
        <div className="orb-coral" style={{ bottom: '-5%', right: '20%' }} />
      </div>

      {/* ─── ReactBits Floating Particles ─── */}
      <ParticlesBg color="124, 58, 237" quantity={35} staticity={30} />

      {/* ─── Glass Navigation ─── */}
      <nav 
        role="navigation"
        aria-label="แถบการนำทางหลัก"
        className="glass-nav h-16 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl border-b border-black/5"
      >
        <div className="flex items-center gap-2.5">
          <motion.img
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-md cursor-pointer"
            onClick={() => { playPopSound(); navigate('/stages'); }}
          />
          <div>
            <span className="font-extrabold text-xs sm:text-sm text-[#1A1525] block leading-tight font-kanit flex items-center gap-1.5">
              Prompt Battle
              <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#8E85A2] font-mono">
              ห้องเรียน: <strong className="text-[#6D28D9] font-mono">{user.roomCode}</strong>
            </span>
          </div>
        </div>

        {/* User level status pill */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-white/70 border border-black/5 text-xs backdrop-blur-md shadow-sm">
          <span className="font-extrabold text-[#1A1525] flex items-center gap-1.5">
            👤 <span>{user.username}</span>
            <span className="text-[10px] bg-[#7C3AED] text-white px-2 py-0.5 rounded-full font-mono font-bold">
              Lvl {clearedCount + 1}
            </span>
          </span>
          <span className="text-black/10">|</span>
          <span className="font-mono font-bold text-[#047857] flex items-center gap-1">
            <Star size={14} className="fill-[#00B894] text-[#00B894]" />
            <ShinyText text={`${totalUserStars} PTS`} speed={3} className="text-[#047857] font-extrabold" />
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSoundToggle}
            aria-label={muted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/60 hover:bg-white/90 border border-black/5 text-[#5C526E] hover:text-[#1A1525] transition-all flex items-center justify-center cursor-pointer shadow-sm"
          >
            {muted ? <VolumeX size={17} className="text-[#FF6B6B]" /> : <Volume2 size={17} className="text-[#00B894]" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playPopSound(); setIsCheatSheetOpen(true); }}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#7C3AED]/[0.10] hover:bg-[#7C3AED]/[0.18] border border-[#7C3AED]/[0.20] text-[#6D28D9] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <BookOpen size={15} />
            <span className="hidden sm:inline">สูตรลับ Prompt</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            aria-label="ออกจากระบบ"
            className="min-h-[44px] min-w-[44px] p-2 text-[#8E85A2] hover:text-[#1A1525] hover:bg-white/60 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={17} />
          </motion.button>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 font-prompt relative z-10">
        
        {/* Mascot Hero Banner with ReactBits */}
        <CuteMascotHeroBanner
          username={user.username}
          studentId={user.studentId}
          clearedCount={clearedCount}
          totalStages={mainStages.length}
          onStartClick={() => navigate(`/play/${mainStages[currentLevelIndex].id}`)}
        />

        {/* Tab Segmented Controller */}
        <div className="bg-white/50 p-1.5 rounded-2xl border border-black/5 text-xs font-bold font-prompt backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-1.5 w-full min-w-max">
            <button
              onClick={() => { playPopSound(); setActiveTab('stages'); }}
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap font-kanit ${
                activeTab === 'stages'
                  ? 'bg-white text-[#6D28D9] shadow-md font-extrabold border border-black/5'
                  : 'text-[#5C526E] hover:text-[#1A1525] hover:bg-white/40'
              }`}
            >
              <Swords size={16} className={activeTab === 'stages' ? 'text-[#7C3AED]' : ''} />
              <span>ด่านแข่งขันเก็บคะแนน</span>
            </button>

            <button
              onClick={() => { playPopSound(); setActiveTab('formula'); }}
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap font-kanit ${
                activeTab === 'formula'
                  ? 'bg-white text-[#047857] shadow-md font-extrabold border border-black/5'
                  : 'text-[#5C526E] hover:text-[#1A1525] hover:bg-white/40'
              }`}
            >
              <Zap size={16} className="text-[#F59E0B]" />
              <span>คลังสูตรลับ 7 ด้าน</span>
            </button>

            <button
              onClick={() => { playPopSound(); setActiveTab('leaderboard'); }}
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap font-kanit ${
                activeTab === 'leaderboard'
                  ? 'bg-white text-[#B91C1C] shadow-md font-extrabold border border-black/5'
                  : 'text-[#5C526E] hover:text-[#1A1525] hover:bg-white/40'
              }`}
            >
              <Trophy size={16} className="text-[#F59E0B]" />
              <span>อันดับ & เหรียญรางวัล</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Stages Grid with ReactBits TiltedCard & SpotlightCard */}
        {activeTab === 'stages' && (
          <SpotlightCard
            spotlightColor="rgba(124, 58, 237, 0.12)"
            className="p-5 sm:p-6 space-y-5 bg-white/70 border border-white/60 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-3 font-kanit">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-extrabold text-[#1A1525]">
                <Swords className="text-[#F59E0B]" size={22} />
                <span>ด่านแข่งขันเก็บคะแนน (Battle Arenas)</span>
              </div>
              <span className="text-xs text-[#8E85A2] font-mono bg-black/[0.03] px-3 py-1 rounded-full border border-black/5 font-bold">
                {mainStages.length} STAGES AVAILABLE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {mainStages.map((stage) => {
                const attempts = getUserStageAttempts(stage.id);
                const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
                const isCleared = highestScore >= 12;

                const getDiffBadge = (diff) => {
                  if (diff.includes('ท้าทาย') || diff.includes('ยาก')) {
                    return 'bg-[#FF6B6B]/[0.10] text-[#B91C1C] border-[#FF6B6B]/[0.20]';
                  }
                  if (diff.includes('ปานกลาง')) {
                    return 'bg-[#F59E0B]/[0.10] text-[#92400E] border-[#F59E0B]/[0.20]';
                  }
                  return 'bg-[#00B894]/[0.10] text-[#047857] border-[#00B894]/[0.20]';
                };

                return (
                  <TiltedCard
                    key={stage.id}
                    maxTilt={8}
                    scale={1.02}
                    onClick={() => { playPopSound(); navigate(`/play/${stage.id}`); }}
                  >
                    <SpotlightCard
                      spotlightColor={isCleared ? 'rgba(0, 184, 148, 0.15)' : 'rgba(124, 58, 237, 0.15)'}
                      borderColor={isCleared ? 'rgba(0, 184, 148, 0.25)' : 'rgba(124, 58, 237, 0.25)'}
                      className={`p-5 h-full flex flex-col justify-between space-y-3.5 border transition-all ${
                        isCleared
                          ? 'bg-white/80 border-[#00B894]/20 shadow-md'
                          : 'bg-white/60 border-black/5 hover:bg-white/80'
                      }`}
                    >
                      <div className="space-y-2 font-prompt">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-xs font-extrabold text-[#6D28D9] bg-[#7C3AED]/[0.08] px-2.5 py-0.5 rounded-full border border-[#7C3AED]/[0.15]">
                            STAGE {stage.stage_number}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getDiffBadge(stage.difficulty)}`}>
                            {stage.difficulty}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-[#1A1525] line-clamp-1 font-kanit pt-1 flex items-center justify-between">
                          <span>{stage.title}</span>
                          {isCleared && <CheckCircle size={16} className="text-[#00B894] shrink-0" />}
                        </h3>
                        <p className="text-xs text-[#5C526E] line-clamp-2 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-2 font-prompt">
                        <span className="text-xs font-mono text-[#047857] font-extrabold flex items-center gap-1 bg-[#00B894]/[0.08] px-2.5 py-1 rounded-xl border border-[#00B894]/[0.15]">
                          <Star size={14} className="fill-[#00B894] text-[#00B894]" />
                          {highestScore}/20 PTS
                        </span>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            playPopSound();
                            navigate(`/play/${stage.id}`);
                          }}
                          className={`${isCleared ? 'btn-glass-mint' : 'btn-glass-violet'} px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer font-kanit shadow-sm`}
                        >
                          <span>{attempts.length > 0 ? 'ลุยอีกครั้ง' : 'เริ่มท้าทาย'}</span>
                          <ArrowRight size={14} />
                        </motion.button>
                      </div>
                    </SpotlightCard>
                  </TiltedCard>
                );
              })}
            </div>
          </SpotlightCard>
        )}

        {/* TAB 2: Formula Cheat Sheet */}
        {activeTab === 'formula' && (
          <SpotlightCard
            spotlightColor="rgba(245, 158, 11, 0.12)"
            className="p-5 sm:p-6 space-y-4 font-prompt bg-white/70 border border-white/60 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#1A1525] font-kanit">
                <Zap className="text-[#F59E0B]" size={20} />
                <span>คลังสูตรลับ & เกณฑ์ประเมินการเขียน Prompt 7 ด้าน</span>
              </div>
              <span className="text-xs text-[#8E85A2]">แตะการ์ดเพื่อดูตัวอย่างประโยค</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {formulaCards.map((card) => {
                const IconComp = card.icon;
                const isSelected = selectedFormulaCard === card.id;

                return (
                  <SpotlightCard
                    key={card.id}
                    onClick={() => { playPopSound(); setSelectedFormulaCard(isSelected ? null : card.id); }}
                    spotlightColor="rgba(124, 58, 237, 0.12)"
                    borderColor={isSelected ? 'rgba(124, 58, 237, 0.4)' : 'rgba(0, 0, 0, 0.08)'}
                    className={`p-4 transition-all cursor-pointer space-y-2 bg-white/80 ${
                      isSelected ? 'ring-2 ring-[#7C3AED]/30 shadow-md' : 'hover:bg-white/90'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${card.iconBg} ${card.iconText} flex items-center justify-center shrink-0`}>
                        <IconComp size={18} />
                      </div>
                      <h3 className="text-xs font-bold text-[#1A1525] font-kanit">
                        {card.title}
                      </h3>
                    </div>

                    <p className="text-xs text-[#5C526E] leading-relaxed font-prompt">
                      {card.desc}
                    </p>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`pt-2 border-t border-black/5 text-[11px] ${card.iconText} bg-black/[0.02] p-2.5 rounded-xl`}
                        >
                          <strong className={`block ${card.iconText} font-bold mb-0.5`}>ตัวอย่างประโยค:</strong>
                          <span>"{card.example}"</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </SpotlightCard>
                );
              })}
            </div>
          </SpotlightCard>
        )}

        {/* TAB 3: Leaderboard & Achievements */}
        {activeTab === 'leaderboard' && (
          <div key="tab-leaderboard" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start font-prompt">
            
            {/* Left: Leaderboard */}
            <SpotlightCard
              spotlightColor="rgba(245, 158, 11, 0.12)"
              className="lg:col-span-6 p-4 sm:p-5 space-y-4 bg-white/70 border border-white/60 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-black/5 pb-3 font-mono">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#1A1525] font-kanit">
                  <Crown size={18} className="text-[#F59E0B]" />
                  <span>อันดับคะแนนในห้องเรียน ({user.roomCode})</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playPopSound(); navigate('/leaderboard'); }}
                  className="text-xs text-[#6D28D9] hover:text-[#5B21B6] font-bold flex items-center gap-1 cursor-pointer font-prompt"
                >
                  <span>ดูเต็มหน้า</span>
                  <ArrowRight size={13} />
                </motion.button>
              </div>

              <div className="space-y-2">
                {roomLeaderboard.length === 0 ? (
                  <p className="text-xs text-[#8E85A2] py-4 text-center">ยังไม่มีข้อมูลอันดับในห้องเรียนนี้</p>
                ) : (
                  roomLeaderboard.slice(0, 5).map((student, rankIdx) => {
                    const isMe = student.userId === user.userId;
                    const podiumStyles = [
                      { bg: 'bg-[#F59E0B]/[0.08]', border: 'border-[#F59E0B]/[0.25]', badge: '🥇', text: 'text-[#1A1525]' },
                      { bg: 'bg-white/80', border: 'border-black/5', badge: '🥈', text: 'text-[#1A1525]' },
                      { bg: 'bg-[#FF6B6B]/[0.06]', border: 'border-[#FF6B6B]/[0.15]', badge: '🥉', text: 'text-[#1A1525]' },
                    ];
                    const podium = rankIdx < 3 ? podiumStyles[rankIdx] : null;

                    return (
                      <div
                        key={student.userId}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                          isMe ? 'ring-2 ring-[#7C3AED]/30 font-bold bg-white' : ''
                        } ${podium ? `${podium.bg} ${podium.border} shadow-sm` : 'bg-white/50 border-black/5'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm min-w-[24px]">
                            {podium ? podium.badge : `#${rankIdx + 1}`}
                          </span>
                          <span className={`truncate max-w-[140px] font-bold ${podium ? podium.text : 'text-[#1A1525]'}`}>
                            {student.username} {isMe ? '(คุณ)' : ''}
                          </span>
                        </div>

                        <div className="font-mono font-extrabold text-[#047857]">
                          {student.totalPoints} <span className="text-[10px] text-[#8E85A2] font-normal">PTS</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SpotlightCard>

            {/* Right: Achievements */}
            <SpotlightCard
              spotlightColor="rgba(0, 184, 148, 0.12)"
              className="lg:col-span-6 p-4 sm:p-5 space-y-4 bg-white/70 border border-white/60 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#1A1525] font-kanit">
                  <Medal size={18} className="text-[#F59E0B]" />
                  <span>เหรียญรางวัลสะสมของคุณ</span>
                </div>
                <span className="text-xs text-[#8E85A2] font-mono font-bold">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length} ปลดล็อก
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {achievements.map((ach) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={ach.id}
                    onClick={() => { if (ach.unlocked) playStarTwinkleSound(); else playPopSound(); }}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 cursor-pointer relative ${
                      ach.unlocked
                        ? 'bg-white/90 border-[#F59E0B]/30 shadow-md hover:border-[#F59E0B]/50'
                        : 'bg-white/30 border-black/5 opacity-60 hover:opacity-80'
                    }`}
                  >
                    {!ach.unlocked && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/[0.05] flex items-center justify-center">
                        <Lock size={11} className="text-[#8E85A2]" />
                      </div>
                    )}

                    <span className={`text-xl shrink-0 p-1.5 rounded-xl border ${
                      ach.unlocked
                        ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20'
                        : 'bg-white/40 border-black/5'
                    }`} aria-hidden="true">
                      {ach.icon}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-xs font-bold text-[#1A1525] flex items-center gap-1 truncate font-kanit">
                        <span>{ach.label}</span>
                        {ach.unlocked && <CheckCircle size={11} className="text-[#00B894] shrink-0" />}
                      </h3>
                      <p className="text-[10px] text-[#5C526E] line-clamp-2 leading-tight font-prompt">
                        {ach.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SpotlightCard>

          </div>
        )}

      </main>

      {/* Prompt Cheat Sheet Modal */}
      <PromptCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
}