import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { STAGES_DATA } from '../data/stagesData';
import { getUserStageAttempts, getUserAchievements, getLeaderboard } from '../lib/sessionStorage';
import { playPopSound, playStarTwinkleSound, toggleMute, getMuteState } from '../lib/soundEffects';
import CuteMascotHeroBanner from '../components/CuteMascotHeroBanner';
import PromptCheatSheetModal from '../components/PromptCheatSheetModal';
import { 
  BookOpen, Swords, Trophy, LogOut, CheckCircle, ArrowRight, Star, Sparkles, 
  Volume2, VolumeX, Medal, Layers, UserCheck, Target, FileText, 
  RefreshCw, Zap, Crown, LayoutGrid, Lock
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
    <div className="min-h-[100dvh] bg-[#F5F3FA] text-[#1A1525] flex flex-col font-prompt relative">
      {/* ─── Animated Morphing Gradient Orbs ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="orb-violet" style={{ top: '-5%', right: '-5%' }} />
        <div className="orb-mint" style={{ top: '50%', left: '-8%' }} />
        <div className="orb-coral" style={{ bottom: '-5%', right: '20%' }} />
      </div>

      {/* ─── Glass Navigation ─── */}
      <nav 
        role="navigation"
        aria-label="แถบการนำทางหลัก"
        className="glass-nav h-16 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30"
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-md hover:scale-105 transition-transform cursor-pointer"
            onClick={() => { playPopSound(); navigate('/stages'); }}
          />
          <div>
            <span className="font-extrabold text-xs sm:text-sm text-[#1A1525] block leading-tight font-kanit">Prompt Battle</span>
            <span className="text-[10px] sm:text-[11px] text-[#8E85A2] font-mono">ห้องเรียน: <strong className="text-[#6D28D9] font-mono">{user.roomCode}</strong></span>
          </div>
        </div>

        {/* User level status pill */}
        <div className="hidden md:flex items-center gap-4 px-3.5 py-1.5 rounded-2xl bg-black/[0.02] border border-black/5 text-xs backdrop-blur-sm">
          <span className="font-extrabold text-[#1A1525] flex items-center gap-1.5">
            👤 <span>{user.username}</span>
            <span className="text-[10px] bg-[#7C3AED] text-white px-2 py-0.5 rounded-full font-mono font-bold">
              Lvl {clearedCount + 1}
            </span>
          </span>
          <span className="text-black/10">|</span>
          <span className="font-mono font-bold text-[#047857] flex items-center gap-1">
            <Star size={13} className="fill-[#00B894] text-[#00B894]" />
            <span>{totalUserStars} PTS</span>
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleSoundToggle}
            aria-label={muted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-black/[0.02] hover:bg-black/[0.05] border border-black/5 text-[#5C526E] hover:text-[#1A1525] transition-all flex items-center justify-center cursor-pointer"
          >
            {muted ? <VolumeX size={17} className="text-[#FF6B6B]" /> : <Volume2 size={17} className="text-[#00B894]" />}
          </button>

          <button
            onClick={() => { playPopSound(); setIsCheatSheetOpen(true); }}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#7C3AED]/[0.08] hover:bg-[#7C3AED]/[0.14] border border-[#7C3AED]/[0.15] text-[#6D28D9] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <BookOpen size={15} />
            <span className="hidden sm:inline">สูตรลับ Prompt</span>
          </button>

          <button
            onClick={handleLogout}
            aria-label="ออกจากระบบ"
            className="min-h-[44px] min-w-[44px] p-2 text-[#8E85A2] hover:text-[#1A1525] hover:bg-black/[0.03] rounded-xl transition-colors flex items-center justify-center cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={17} />
          </button>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-4 font-prompt relative z-10">
        
        {/* Mascot Hero Banner */}
        <CuteMascotHeroBanner
          username={user.username}
          studentId={user.studentId}
          clearedCount={clearedCount}
          totalStages={mainStages.length}
          onStartClick={() => navigate(`/play/${mainStages[currentLevelIndex].id}`)}
        />

        {/* Tab Segmented Controller */}
        <div className="bg-black/[0.02] p-1.5 rounded-2xl border border-black/5 text-xs font-bold font-prompt backdrop-blur-sm">
          <div className="flex items-center gap-1 w-full min-w-max">
            <button
              onClick={() => { playPopSound(); setActiveTab('stages'); }}
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'stages'
                  ? 'glass-tab-active font-extrabold'
                  : 'glass-tab-inactive'
              }`}
            >
              <LayoutGrid size={15} />
              <span>ด่านแข่งขันเก็บคะแนน</span>
            </button>

            <button
              onClick={() => { playPopSound(); setActiveTab('formula'); }}
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'formula'
                  ? 'glass-tab-active font-extrabold'
                  : 'glass-tab-inactive'
              }`}
            >
              <Zap size={15} className="text-[#F59E0B]" />
              <span>คลังสูตรลับ 7 ด้าน</span>
            </button>

            <button
              onClick={() => { playPopSound(); setActiveTab('leaderboard'); }}
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'glass-tab-active font-extrabold'
                  : 'glass-tab-inactive'
              }`}
            >
              <Trophy size={15} className="text-[#F59E0B]" />
              <span>อันดับ & เหรียญรางวัล</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Stages Grid */}
        {activeTab === 'stages' && (
          <div key="tab-stages" className="glass-panel p-5 sm:p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-black/5 pb-3 font-kanit">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-extrabold text-[#1A1525]">
                <Swords className="text-[#F59E0B]" size={22} />
                <span>ด่านแข่งขันเก็บคะแนน (Battle Arenas)</span>
              </div>
              <span className="text-xs text-[#8E85A2] font-mono bg-black/[0.03] px-3 py-1 rounded-full border border-black/5 font-bold">{mainStages.length} STAGES</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {mainStages.map((stage) => {
                const attempts = getUserStageAttempts(stage.id);
                const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
                const isCleared = highestScore >= 12;

                return (
                  <div 
                    key={stage.id}
                    className={`p-4.5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                      isCleared 
                        ? 'bg-[#00B894]/[0.04] border-[#00B894]/[0.15] shadow-sm' 
                        : 'bg-white/[0.40] border-black/5 hover:bg-white/[0.60] hover:border-black/10'
                    } hover:-translate-y-1`}
                  >
                    <div className="space-y-2 font-prompt">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-xs font-extrabold text-[#6D28D9] bg-[#7C3AED]/[0.08] px-2.5 py-0.5 rounded-full border border-[#7C3AED]/[0.10]">
                          STAGE {stage.stage_number}
                        </span>
                        <span className="text-xs font-bold text-[#047857] bg-[#00B894]/[0.08] px-2.5 py-0.5 rounded-full border border-[#00B894]/[0.12]">
                          {stage.difficulty}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#1A1525] line-clamp-1 font-kanit">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-[#5C526E] line-clamp-2 leading-relaxed">
                        {stage.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-2 font-prompt">
                      <span className="text-xs font-mono text-[#047857] font-extrabold flex items-center gap-1 bg-[#00B894]/[0.08] px-2.5 py-1 rounded-xl border border-[#00B894]/[0.12]">
                        <Star size={14} className="fill-[#00B894] text-[#00B894]" />
                        {highestScore}/20 PTS
                      </span>

                      <button
                        onClick={() => { playPopSound(); navigate(`/play/${stage.id}`); }}
                        className={`${isCleared ? 'btn-glass-mint' : 'btn-glass-violet'} px-4 py-2 text-xs flex items-center gap-2 cursor-pointer font-kanit`}
                      >
                        <span>{attempts.length > 0 ? 'ลุยอีกครั้ง' : 'เริ่มท้าทาย'}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Formula Cheat Sheet */}
        {activeTab === 'formula' && (
          <div key="tab-formula" className="glass-panel p-4 sm:p-6 space-y-4 animate-fade-in font-prompt">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#1A1525]">
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
                  <div
                    key={card.id}
                    onClick={() => { playPopSound(); setSelectedFormulaCard(isSelected ? null : card.id); }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${card.bgLight} ${
                      isSelected
                        ? `${card.bgLight} ${card.borderSelect} shadow-sm backdrop-blur-sm`
                        : `${card.border} hover:bg-black/[0.01]`
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

                    {isSelected && (
                      <div className={`pt-2 border-t ${card.border} text-[11px] ${card.iconText} ${card.bgLight} p-2.5 rounded-xl`}>
                        <strong className={`block ${card.iconText} font-bold mb-0.5`}>ตัวอย่างประโยค:</strong>
                        <span>"{card.example}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Leaderboard & Achievements */}
        {activeTab === 'leaderboard' && (
          <div key="tab-leaderboard" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-fade-in font-prompt">
            
            {/* Left: Leaderboard */}
            <div className="lg:col-span-6 glass-panel p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-3 font-mono">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#1A1525]">
                  <Crown size={18} className="text-[#F59E0B]" />
                  <span>อันดับคะแนนในห้องเรียน ({user.roomCode})</span>
                </div>

                <button
                  onClick={() => { playPopSound(); navigate('/leaderboard'); }}
                  className="text-xs text-[#6D28D9] hover:text-[#5B21B6] font-bold flex items-center gap-1 cursor-pointer font-prompt"
                >
                  <span>ดูเต็มหน้า</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="space-y-2">
                {roomLeaderboard.length === 0 ? (
                  <p className="text-xs text-[#8E85A2] py-4 text-center">ยังไม่มีข้อมูลอันดับในห้องเรียนนี้</p>
                ) : (
                  roomLeaderboard.slice(0, 5).map((student, rankIdx) => {
                    const isMe = student.userId === user.userId;
                    const podiumStyles = [
                      { bg: 'bg-[#F59E0B]/[0.06]', border: 'border-[#F59E0B]/[0.20]', badge: '🥇', text: 'text-[#1A1525]' },
                      { bg: 'bg-black/[0.02]', border: 'border-black/5', badge: '🥈', text: 'text-[#1A1525]' },
                      { bg: 'bg-[#FF6B6B]/[0.04]', border: 'border-[#FF6B6B]/[0.10]', badge: '🥉', text: 'text-[#1A1525]' },
                    ];
                    const podium = rankIdx < 3 ? podiumStyles[rankIdx] : null;
                    const baseClasses = podium 
                      ? `${podium.bg} ${podium.border} shadow-sm`
                      : 'bg-black/[0.01] border-black/5';

                    return (
                      <div
                        key={student.userId}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                          isMe ? 'ring-1 ring-[#7C3AED]/[0.30] font-bold' : ''
                        } ${baseClasses}`}
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
            </div>

            {/* Right: Achievements */}
            <div className="lg:col-span-6 glass-panel p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#1A1525]">
                  <Medal size={18} className="text-[#F59E0B]" />
                  <span>เหรียญรางวัลสะสมของคุณ</span>
                </div>
                <span className="text-xs text-[#8E85A2] font-mono">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length} ปลดล็อก
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    onClick={() => { if (ach.unlocked) playStarTwinkleSound(); else playPopSound(); }}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 cursor-pointer relative ${
                      ach.unlocked
                        ? 'bg-[#F59E0B]/[0.05] border-[#F59E0B]/[0.15] shadow-sm hover:border-[#F59E0B]/[0.30]'
                        : 'bg-black/[0.01] border-black/5 opacity-60 hover:opacity-80'
                    }`}
                  >
                    {!ach.unlocked && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/[0.03] flex items-center justify-center">
                        <Lock size={11} className="text-[#8E85A2]" />
                      </div>
                    )}

                    <span className={`text-xl shrink-0 p-1.5 rounded-xl border ${
                      ach.unlocked
                        ? 'bg-white/60 border-[#F59E0B]/[0.15]'
                        : 'bg-white/30 border-black/5'
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
                  </div>
                ))}
              </div>
            </div>

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