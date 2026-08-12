import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { STAGES_DATA } from '../data/stagesData';
import { getUserStageAttempts, getUserAchievements, getLeaderboard, getUserEvaluation } from '../lib/sessionStorage';
import { playPopSound, playStarTwinkleSound, toggleMute, getMuteState } from '../lib/soundEffects';

import CuteMascotHeroBanner from '../components/CuteMascotHeroBanner';
import PromptCheatSheetModal from '../components/PromptCheatSheetModal';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import TiltedCard from '../components/reactbits/TiltedCard';
import ShinyText from '../components/reactbits/ShinyText';

import { 
  BookOpen, Swords, Trophy, LogOut, CheckCircle, ArrowRight, Star, Sparkles, 
  Volume2, VolumeX, Medal, Layers, UserCheck, Target, FileText, 
  RefreshCw, Zap, Crown, Lock
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
    { id: 'clarity',   icon: Sparkles,   title: '1. ความชัดเจน (Clarity)',          desc: 'กระชับ ไม่กำกวม สื่อความหมายเจาะจง',                               example: 'ใช้คำกริยาชี้เฉพาะ เช่น "สรุปเปรียบเทียบใน 3 ข้อ"' },
    { id: 'role',      icon: UserCheck,  title: '2. การกำหนดบทบาท (Role)',          desc: 'สวมบทบาทให้ AI เพิ่มคลังความรู้',                                example: 'คุณคือคุณครูสอนวิทยาศาสตร์ใจดีสำหรับเด็ก ม.1' },
    { id: 'context',   icon: BookOpen,   title: '3. การให้บริบท (Context)',          desc: 'ใส่สภาพแวดล้อมและข้อมูลพื้นฐาน',                                 example: 'สำหรับผู้เรียนกลุ่มประถม งบประมาณไม่เกิน 2,000 บาท' },
    { id: 'task',      icon: Target,     title: '4. การระบุภารกิจ (Task)',          desc: 'กำหนดเป้าหมายภารกิจชัดเจน',                                      example: 'สร้างตารางวิเคราะห์ SWOT สำหรับธุรกิจกาแฟ' },
    { id: 'constraints',icon: Layers,     title: '5. ข้อจำกัด (Constraints)',        desc: 'กำหนดขอบเขตและข้อห้าม',                                          example: 'ห้ามใช้ศัพท์เทคนิคซับซ้อน ขอเฉพาะ 3 หัวข้อหลัก' },
    { id: 'format',    icon: FileText,   title: '6. รูปแบบผลลัพธ์ (Format)',        desc: 'สั่งโครงสร้างคำตอบที่ต้องการ',                                    example: 'แสดงผลลัพธ์เป็นตาราง Markdown 3 คอลัมน์' },
    { id: 'refinement',icon: RefreshCw,   title: '7. การปรับแก้ (Refinement)',      desc: 'วิเคราะห์ผลและปรับแก้ทำซ้ำ',                                     example: 'นำคำตอบแรกมาสั่งปรับแก้เพิ่มตัวอย่างในรอบถัดไป' }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F8F7FC] text-[#1A1525] flex flex-col font-prompt relative overflow-hidden">
      {/* Glass Navigation */}
      <nav 
        role="navigation"
        aria-label="แถบการนำทางหลัก"
        className="glass-nav h-16 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-black/5"
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-xs cursor-pointer hover:scale-105 transition-transform"
            onClick={() => { playPopSound(); navigate('/stages'); }}
          />
          <div>
            <span className="font-extrabold text-xs sm:text-sm text-[#1A1525] block leading-tight font-kanit flex items-center gap-1.5">
              Prompt Battle
              <span className="w-2 h-2 rounded-full bg-[#00B894]" />
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#8E85A2] font-mono">
              ห้องเรียน: <strong className="text-[#6D28D9] font-mono">{user.roomCode}</strong>
            </span>
          </div>
        </div>

        {/* User level status pill */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-white border border-black/5 text-xs shadow-xs">
          <span className="font-extrabold text-[#1A1525] flex items-center gap-1.5">
            👤 <span>{user.username}</span>
            <span className="text-[10px] bg-[#7C3AED] text-white px-2 py-0.5 rounded-full font-mono font-bold">
              Lvl {clearedCount + 1}
            </span>
          </span>
          <span className="text-black/10">|</span>
          <span className="font-mono font-bold text-[#047857] flex items-center gap-1">
            <Star size={14} className="fill-[#00B894] text-[#00B894]" />
            <span className="font-extrabold">{totalUserStars} PTS</span>
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleSoundToggle}
            aria-label={muted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white border border-black/5 text-[#5C526E] hover:text-[#1A1525] transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
          >
            {muted ? <VolumeX size={17} className="text-[#FF6B6B]" /> : <Volume2 size={17} className="text-[#00B894]" />}
          </button>

          <button
            onClick={() => { playPopSound(); setIsCheatSheetOpen(true); }}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#7C3AED]/[0.08] border border-[#7C3AED]/[0.15] text-[#6D28D9] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <BookOpen size={15} />
            <span className="hidden sm:inline">สูตรลับ Prompt</span>
          </button>

          <button
            onClick={handleLogout}
            aria-label="ออกจากระบบ"
            className="min-h-[44px] min-w-[44px] p-2 text-[#8E85A2] hover:text-[#1A1525] rounded-xl transition-colors flex items-center justify-center cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={17} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 font-prompt relative z-10">
        
        {/* Mascot Hero Banner */}
        <CuteMascotHeroBanner
          username={user.username}
          studentId={user.studentId}
          clearedCount={clearedCount}
          totalStages={mainStages.length}
          onStartClick={() => navigate(`/play/${mainStages[currentLevelIndex].id}`)}
        />

        {/* Tab Controller */}
        <div className="bg-white p-1 rounded-2xl border border-black/5 text-xs font-bold font-prompt shadow-xs overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 min-w-max">
            <button
              onClick={() => { playPopSound(); setActiveTab('stages'); }}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-kanit ${
                activeTab === 'stages'
                  ? 'bg-[#7C3AED]/10 text-[#6D28D9] font-extrabold'
                  : 'text-[#5C526E] hover:text-[#1A1525]'
              }`}
            >
              <Swords size={16} className={activeTab === 'stages' ? 'text-[#7C3AED]' : ''} />
              <span>ด่านแข่งขันเก็บคะแนน</span>
            </button>

            <button
              onClick={() => { playPopSound(); setActiveTab('formula'); }}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-kanit ${
                activeTab === 'formula'
                  ? 'bg-[#00B894]/10 text-[#047857] font-extrabold'
                  : 'text-[#5C526E] hover:text-[#1A1525]'
              }`}
            >
              <Zap size={16} className="text-[#F59E0B]" />
              <span>คลังสูตรลับ 7 ด้าน</span>
            </button>

            <button
              onClick={() => { playPopSound(); setActiveTab('leaderboard'); }}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-kanit ${
                activeTab === 'leaderboard'
                  ? 'bg-[#FF6B6B]/10 text-[#B91C1C] font-extrabold'
                  : 'text-[#5C526E] hover:text-[#1A1525]'
              }`}
            >
              <Trophy size={16} className="text-[#F59E0B]" />
              <span>อันดับ & เหรียญรางวัล</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Stages Grid */}
        {activeTab === 'stages' && (
          <SpotlightCard className="p-4 sm:p-6 space-y-4 bg-white border border-black/5 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/5 pb-3 font-kanit">
              <div className="flex items-center gap-2 text-base sm:text-lg font-extrabold text-[#1A1525]">
                <Swords className="text-[#F59E0B]" size={20} />
                <span>ด่านแข่งขันเก็บคะแนน (Battle Arenas)</span>
              </div>
              <span className="text-xs text-[#8E85A2] font-mono font-bold bg-black/[0.03] px-2.5 py-0.5 rounded-full border border-black/5">
                {mainStages.length} STAGES
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
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
                    onClick={() => { playPopSound(); navigate(`/play/${stage.id}`); }}
                  >
                    <SpotlightCard
                      className={`p-4.5 h-full flex flex-col justify-between space-y-3 border transition-all ${
                        isCleared
                          ? 'bg-[#00B894]/[0.03] border-[#00B894]/20 shadow-xs'
                          : 'bg-white border-black/5 hover:border-black/10'
                      }`}
                    >
                      <div className="space-y-1.5 font-prompt">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-xs font-extrabold text-[#6D28D9] bg-[#7C3AED]/[0.08] px-2.5 py-0.5 rounded-full border border-[#7C3AED]/[0.12]">
                            STAGE {stage.stage_number}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getDiffBadge(stage.difficulty)}`}>
                            {stage.difficulty}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-[#1A1525] line-clamp-1 font-kanit pt-0.5 flex items-center justify-between">
                          <span>{stage.title}</span>
                          {isCleared && <CheckCircle size={15} className="text-[#00B894] shrink-0" />}
                        </h3>
                        <p className="text-xs text-[#5C526E] line-clamp-2 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-black/5 flex items-center justify-between gap-2 font-prompt">
                        <span className="text-xs font-mono text-[#047857] font-extrabold flex items-center gap-1 bg-[#00B894]/[0.08] px-2.5 py-0.5 rounded-xl border border-[#00B894]/[0.12]">
                          <Star size={13} className="fill-[#00B894] text-[#00B894]" />
                          {highestScore}/20 PTS
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playPopSound();
                            navigate(`/play/${stage.id}`);
                          }}
                          className={`${isCleared ? 'btn-glass-mint' : 'btn-glass-violet'} px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer font-kanit shadow-xs active:scale-95`}
                        >
                          <span>{attempts.length > 0 ? 'ลุยอีกครั้ง' : 'เริ่มท้าทาย'}</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </SpotlightCard>
                  </TiltedCard>
                );
              })}
            </div>
          </SpotlightCard>
        )}

        {/* TAB 2: Formula Cards */}
        {activeTab === 'formula' && (
          <SpotlightCard className="p-4 sm:p-6 space-y-4 font-prompt bg-white border border-black/5 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#1A1525] font-kanit">
                <Zap className="text-[#F59E0B]" size={18} />
                <span>คลังสูตรลับ & เกณฑ์ประเมินการเขียน Prompt 7 ด้าน</span>
              </div>
              <span className="text-xs text-[#8E85A2]">แตะการ์ดเพื่อดูตัวอย่าง</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {formulaCards.map((card) => {
                const IconComp = card.icon;
                const isSelected = selectedFormulaCard === card.id;

                return (
                  <div
                    key={card.id}
                    onClick={() => { playPopSound(); setSelectedFormulaCard(isSelected ? null : card.id); }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 bg-white ${
                      isSelected ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-xs' : 'border-black/5 hover:border-black/15'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#7C3AED]/[0.08] text-[#6D28D9] flex items-center justify-center shrink-0">
                        <IconComp size={16} />
                      </div>
                      <h3 className="text-xs font-bold text-[#1A1525] font-kanit">
                        {card.title}
                      </h3>
                    </div>

                    <p className="text-xs text-[#5C526E] leading-relaxed font-prompt">
                      {card.desc}
                    </p>

                    {isSelected && (
                      <div className="pt-2 border-t border-black/5 text-[11px] text-[#6D28D9] bg-[#7C3AED]/[0.04] p-2.5 rounded-xl">
                        <strong className="block text-[#6D28D9] font-bold mb-0.5">ตัวอย่างประโยค:</strong>
                        <span>"{card.example}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SpotlightCard>
        )}

        {/* TAB 3: Leaderboard & Achievements */}
        {activeTab === 'leaderboard' && (
          <div key="tab-leaderboard" className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start font-prompt">
            {/* Leaderboard */}
            <SpotlightCard className="lg:col-span-6 p-4 space-y-3 bg-white border border-black/5 shadow-sm">
              <div className="flex items-center justify-between border-b border-black/5 pb-2.5 font-mono">
                <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#1A1525] font-kanit">
                  <Crown size={17} className="text-[#F59E0B]" />
                  <span>อันดับในห้องเรียน ({user.roomCode})</span>
                </div>

                <button
                  onClick={() => { playPopSound(); navigate('/leaderboard'); }}
                  className="text-xs text-[#6D28D9] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>ดูเต็มหน้า</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="space-y-1.5">
                {roomLeaderboard.length === 0 ? (
                  <p className="text-xs text-[#8E85A2] py-4 text-center">ยังไม่มีข้อมูลอันดับ</p>
                ) : (
                  roomLeaderboard.slice(0, 5).map((student, rankIdx) => {
                    const isMe = student.userId === user.userId;

                    return (
                      <div
                        key={student.userId}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          isMe ? 'border-[#7C3AED]/30 bg-[#7C3AED]/[0.04] font-bold' : 'border-black/5 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="font-mono font-black text-xs">#{rankIdx + 1}</span>
                          <span className="truncate font-bold text-[#1A1525]">
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

            {/* Achievements */}
            <SpotlightCard className="lg:col-span-6 p-4 space-y-3 bg-white border border-black/5 shadow-sm">
              <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#1A1525] font-kanit">
                  <Medal size={17} className="text-[#F59E0B]" />
                  <span>เหรียญรางวัลของคุณ</span>
                </div>
                <span className="text-xs text-[#8E85A2] font-mono font-bold">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length} ปลดล็อก
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    onClick={() => { if (ach.unlocked) playStarTwinkleSound(); else playPopSound(); }}
                    className={`p-2.5 rounded-xl border flex items-start gap-2 cursor-pointer ${
                      ach.unlocked
                        ? 'bg-[#F59E0B]/[0.06] border-[#F59E0B]/20'
                        : 'bg-black/[0.01] border-black/5 opacity-60'
                    }`}
                  >
                    <span className="text-lg shrink-0" aria-hidden="true">
                      {ach.icon}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-xs font-bold text-[#1A1525] flex items-center gap-1 truncate font-kanit">
                        <span>{ach.label}</span>
                        {ach.unlocked && <CheckCircle size={11} className="text-[#00B894] shrink-0" />}
                      </h3>
                      <p className="text-[10px] text-[#5C526E] line-clamp-2 leading-tight">
                        {ach.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </div>
        )}

        {/* Student Satisfaction Survey Banner Card (Bottom of Stages) */}
        <section className="mt-10 pt-8 border-t border-black/10 pb-6">
          <SpotlightCard className="p-6 sm:p-8 bg-gradient-to-r from-white via-white to-[#7C3AED]/[0.06] border border-[#7C3AED]/25 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 font-prompt">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#6D28D9] flex items-center justify-center shrink-0 shadow-sm">
                  <FileText size={28} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-[#1A1525] font-kanit">
                      แบบประเมินความพึงพอใจการใช้งาน Prompt Battle
                    </h3>
                    {Boolean(getUserEvaluation()) && (
                      <span className="px-3 py-0.5 rounded-full bg-[#00B894]/15 text-[#047857] text-xs font-bold font-mono">
                        ประเมินแล้ว ✅
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#5C526E] leading-relaxed">
                    ขอความร่วมมือช่วยทำแบบประเมินความพึงพอใจและให้ข้อเสนอแนะ เพื่อนำไปพัฒนาและปรับปรุงเกมให้ดียิ่งขึ้น
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playPopSound();
                  navigate('/evaluation');
                }}
                className="btn-glass-violet min-h-[50px] px-6 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer font-kanit shadow-md shrink-0 whitespace-nowrap active:scale-98 transition-all"
              >
                <Star size={18} className="fill-current" />
                <span>{Boolean(getUserEvaluation()) ? 'แก้ไข / ดูแบบประเมิน' : 'ทำแบบประเมินความพึงพอใจ'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </SpotlightCard>
        </section>

      </main>

      {/* Prompt Cheat Sheet Modal */}
      <PromptCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
}