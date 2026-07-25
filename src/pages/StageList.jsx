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
  MapPin, Play, Volume2, VolumeX, Medal, Layers, UserCheck, Target, FileText, 
  RefreshCw, Zap, Crown, LayoutGrid, Lock
} from 'lucide-react';

export default function StageList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('stages'); // 'stages' | 'formula' | 'leaderboard'
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

  const miniStages = STAGES_DATA.filter(s => s.is_tutorial);
  const mainStages = STAGES_DATA.filter(s => !s.is_tutorial);
  const achievements = getUserAchievements();
  const roomLeaderboard = getLeaderboard(user.roomCode);

  // Calculate student stats
  const clearedCount = miniStages.filter(s => {
    const attempts = getUserStageAttempts(s.id);
    const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
    return highestScore >= 12;
  }).length;

  const currentLevelIndex = Math.min(clearedCount, miniStages.length - 1);
  const totalUserStars = STAGES_DATA.reduce((sum, s) => {
    const attempts = getUserStageAttempts(s.id);
    const maxS = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
    return sum + maxS;
  }, 0);

  // Formula cards with distinct color identities
  const formulaCards = [
    { id: 'clarity',   icon: Sparkles,   color: 'blue',    bgLight: 'bg-blue-50',   bgHover: 'hover:bg-blue-100',   border: 'border-blue-200',   borderSelect: 'border-blue-500', ring: 'ring-blue-200',   iconBg: 'bg-blue-100',   iconText: 'text-blue-700',   title: '1. ความชัดเจน (Clarity)',          desc: 'กระชับ ไม่กำกวม สื่อความหมายเจาะจง',                               example: 'ใช้คำกริยาชี้เฉพาะ เช่น "สรุปเปรียบเทียบใน 3 ข้อ"' },
    { id: 'role',      icon: UserCheck,   color: 'indigo',  bgLight: 'bg-indigo-50', bgHover: 'hover:bg-indigo-100', border: 'border-indigo-200', borderSelect: 'border-indigo-500', ring: 'ring-indigo-200', iconBg: 'bg-indigo-100', iconText: 'text-indigo-700', title: '2. การกำหนดบทบาท (Role)',          desc: 'สวมบทบาทให้ AI เพิ่มคลังความรู้',                                example: 'คุณคือคุณครูสอนวิทยาศาสตร์ใจดีสำหรับเด็ก ม.1' },
    { id: 'context',   icon: BookOpen,    color: 'emerald', bgLight: 'bg-emerald-50',bgHover: 'hover:bg-emerald-100',border: 'border-emerald-200',borderSelect: 'border-emerald-500',ring: 'ring-emerald-200',iconBg: 'bg-emerald-100',iconText: 'text-emerald-700',title: '3. การให้บริบท (Context)',          desc: 'ใส่สภาพแวดล้อมและข้อมูลพื้นฐาน',                                 example: 'สำหรับผู้เรียนกลุ่มประถม งบประมาณไม่เกิน 2,000 บาท' },
    { id: 'task',      icon: Target,      color: 'amber',   bgLight: 'bg-amber-50',  bgHover: 'hover:bg-amber-100',  border: 'border-amber-200',  borderSelect: 'border-amber-500', ring: 'ring-amber-200', iconBg: 'bg-amber-100', iconText: 'text-amber-700', title: '4. การระบุภารกิจ (Task)',          desc: 'กำหนดเป้าหมายภารกิจชัดเจน',                                      example: 'สร้างตารางวิเคราะห์ SWOT สำหรับธุรกิจกาแฟ' },
    { id: 'constraints',icon: Layers,      color: 'purple',  bgLight: 'bg-purple-50',bgHover: 'hover:bg-purple-100',border: 'border-purple-200',borderSelect: 'border-purple-500',ring: 'ring-purple-200',iconBg: 'bg-purple-100',iconText: 'text-purple-700',title: '5. ข้อจำกัด (Constraints)',        desc: 'กำหนดขอบเขตและข้อห้าม',                                          example: 'ห้ามใช้ศัพท์เทคนิคซับซ้อน ขอเฉพาะ 3 หัวข้อหลัก' },
    { id: 'format',    icon: FileText,    color: 'rose',    bgLight: 'bg-rose-50',   bgHover: 'hover:bg-rose-100',   border: 'border-rose-200',   borderSelect: 'border-rose-500',  ring: 'ring-rose-200',  iconBg: 'bg-rose-100',  iconText: 'text-rose-700',  title: '6. รูปแบบผลลัพธ์ (Format)',        desc: 'สั่งโครงสร้างคำตอบที่ต้องการ',                                    example: 'แสดงผลลัพธ์เป็นตาราง Markdown 3 คอลัมน์' },
    { id: 'refinement',icon: RefreshCw,    color: 'sky',     bgLight: 'bg-sky-50',    bgHover: 'hover:bg-sky-100',    border: 'border-sky-200',    borderSelect: 'border-sky-500',   ring: 'ring-sky-200',   iconBg: 'bg-sky-100',   iconText: 'text-sky-700',   title: '7. การปรับแก้ (Refinement)',      desc: 'วิเคราะห์ผลและปรับแก้ทำซ้ำ',                                     example: 'นำคำตอบแรกมาสั่งปรับแก้เพิ่มตัวอย่างในรอบถัดไป' }
  ];

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col font-prompt">
      {/* High-Density Top Navigation Bar */}
      <nav 
        role="navigation"
        aria-label="แถบการนำทางหลัก"
        className="h-16 border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
            className="w-9 h-9 object-contain drop-shadow-sm hover:scale-105 transition-transform cursor-pointer"
            onClick={() => { playPopSound(); navigate('/stages'); }}
          />
          <div>
            <span className="font-extrabold text-sm text-slate-900 block leading-tight">Prompt Battle</span>
            <span className="text-[11px] text-slate-500">ห้องเรียน: <strong className="text-blue-600 font-mono">{user.roomCode}</strong></span>
          </div>
        </div>

        {/* Compact User Level Status Pill */}
        <div className="hidden md:flex items-center gap-4 bg-slate-100/80 px-3.5 py-1.5 rounded-2xl border border-slate-200 text-xs">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
            👤 <span>{user.username}</span>
            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-mono">
              Lvl {clearedCount + 1}
            </span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono font-bold text-amber-600 flex items-center gap-1">
            <Star size={13} className="fill-amber-500 text-amber-500" />
            <span>{totalUserStars} PTS</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSoundToggle}
            aria-label={muted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
            className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
          >
            {muted ? <VolumeX size={17} className="text-rose-600" /> : <Volume2 size={17} className="text-blue-600" />}
          </button>

          <button
            onClick={() => { playPopSound(); setIsCheatSheetOpen(true); }}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen size={15} className="text-blue-600" />
            <span className="hidden sm:inline">สูตรลับ Prompt</span>
          </button>

          <button
            onClick={handleLogout}
            aria-label="ออกจากระบบ"
            className="min-h-[40px] min-w-[40px] p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={17} />
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-5 space-y-4">
        
        {/* Rich Interactive Mascot Hero Banner */}
        <CuteMascotHeroBanner
          username={user.username}
          studentId={user.studentId}
          clearedCount={clearedCount}
          totalStages={miniStages.length}
          onStartClick={() => navigate(`/play/${miniStages[currentLevelIndex].id}`)}
        />

        {/* High-Density Tab Segmented Controller */}
        <div className="flex items-center justify-between bg-slate-200/80 p-1 rounded-2xl border border-slate-300/80 text-xs font-bold">
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <button
              onClick={() => { playPopSound(); setActiveTab('stages'); }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                activeTab === 'stages'
                  ? 'bg-white text-blue-700 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <LayoutGrid size={15} />
              <span>ด่านบทเรียน & แข่งขัน</span>
              {activeTab === 'stages' && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />}
            </button>

            <button
              onClick={() => { playPopSound(); setActiveTab('formula'); }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                activeTab === 'formula'
                  ? 'bg-white text-blue-700 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Zap size={15} className="text-amber-500" />
              <span>คลังสูตรลับ 7 ด้าน</span>
              {activeTab === 'formula' && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-500 rounded-full" />}
            </button>

            <button
              onClick={() => { playPopSound(); setActiveTab('leaderboard'); }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                activeTab === 'leaderboard'
                  ? 'bg-white text-blue-700 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Trophy size={15} className="text-amber-500" />
              <span>อันดับ & เหรียญรางวัล</span>
              {activeTab === 'leaderboard' && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-500 rounded-full" />}
            </button>
          </div>
        </div>

        {/* TAB 1: STAGES MAP & BATTLES (Compact 2-Column Split View) */}
        {activeTab === 'stages' && (
          <div key="tab-stages" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-fade-in">
            
            {/* Left 5 Columns: 3D Tutorial Island Map */}
            <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <MapPin className="text-emerald-600" size={18} />
                  <span>1. เกาะการเรียนรู้ (Tutorial Map)</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">5 บทเรียน</span>
              </div>

              <div className="space-y-2.5">
                {miniStages.map((stage, idx) => {
                  const attempts = getUserStageAttempts(stage.id);
                  const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
                  const isCleared = highestScore >= 12;
                  const isCurrentActiveToken = idx === currentLevelIndex;

                  return (
                    <button
                      key={stage.id}
                      onClick={() => { 
                        if (isCleared) playStarTwinkleSound(); else playPopSound(); 
                        navigate(`/play/${stage.id}`); 
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                        isCleared
                          ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/80'
                          : isCurrentActiveToken
                          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                          isCleared 
                            ? 'bg-emerald-600 text-white' 
                            : isCurrentActiveToken
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-slate-700 text-white'
                        }`}>
                          {isCleared ? <CheckCircle size={18} /> : stage.stage_number}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                            {stage.title}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {attempts.length}/3 attempts • คะแนนสูงสุด: {highestScore}/20
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 font-mono text-xs font-bold text-amber-600">
                        <Star size={13} className="fill-amber-500 text-amber-500" />
                        <span>{highestScore}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 7 Columns: Main Battle Arenas */}
            <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <Swords className="text-amber-600" size={18} />
                  <span>2. ด่านแข่งขันเก็บคะแนน (Battle Arenas)</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">5 ด่านประลอง</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mainStages.map((stage) => {
                  const attempts = getUserStageAttempts(stage.id);
                  const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
                  const isCleared = highestScore >= 12;

                  return (
                    <div 
                      key={stage.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 bg-slate-50/60 hover:bg-white hover:shadow-md ${
                        isCleared ? 'border-emerald-300' : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-mono">
                            Stage {stage.stage_number}
                          </span>
                          <span className="text-[10px] font-bold text-amber-800">
                            {stage.difficulty}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {stage.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-700 font-bold flex items-center gap-1">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          {highestScore}/20
                        </span>

                        <button
                          onClick={() => { playPopSound(); navigate(`/play/${stage.id}`); }}
                          className="min-h-[36px] px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{attempts.length > 0 ? 'ท้าทายอีกครั้ง' : 'เริ่มลุย'}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PROMPT FORMULA CHEAT SHEET (คลังสูตรลับ 7 ด้าน) — color-coded */}
        {activeTab === 'formula' && (
          <div key="tab-formula" className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900">
                <Zap className="text-amber-500 fill-amber-400" size={20} />
                <span>คลังสูตรลับ & เกณฑ์ประเมินการเขียน Prompt 7 ด้าน</span>
              </div>
              <span className="text-xs text-slate-500">แตะการ์ดเพื่อดูตัวอย่างประโยค</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {formulaCards.map((card) => {
                const IconComp = card.icon;
                const isSelected = selectedFormulaCard === card.id;

                return (
                  <div
                    key={card.id}
                    onClick={() => { playPopSound(); setSelectedFormulaCard(isSelected ? null : card.id); }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${card.bgLight} ${
                      isSelected
                        ? `${card.bgLight} ${card.borderSelect} shadow-md ${card.ring} ring-2`
                        : `${card.border} ${card.bgHover} hover:border-${card.color}-300`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${card.iconBg} ${card.iconText} flex items-center justify-center shrink-0`}>
                        <IconComp size={18} />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900">
                        {card.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {card.desc}
                    </p>

                    {isSelected && (
                      <div className={`pt-2 border-t ${card.border} text-[11px] ${card.iconText} ${card.bgLight}/80 p-2.5 rounded-lg`}>
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

        {/* TAB 3: LEADERBOARD & ACHIEVEMENTS */}
        {activeTab === 'leaderboard' && (
          <div key="tab-leaderboard" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-fade-in">
            
            {/* Left 6 Columns: Top Class Leaderboard with podium styling */}
            <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <Crown size={18} className="text-amber-500 fill-amber-400" />
                  <span>อันดับคะแนนในห้องเรียน ({user.roomCode})</span>
                </div>

                <button
                  onClick={() => { playPopSound(); navigate('/leaderboard'); }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>ดูเต็มหน้า</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="space-y-2">
                {roomLeaderboard.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">ยังไม่มีข้อมูลอันดับในห้องเรียนนี้</p>
                ) : (
                  roomLeaderboard.slice(0, 5).map((student, rankIdx) => {
                    const isMe = student.userId === user.userId;
                    // Podium-specific styling for top 3
                    const podiumStyles = [
                      { bg: 'bg-amber-50', border: 'border-amber-400', badge: '🥇', shadow: 'shadow-amber-200/50', text: 'text-amber-950' },
                      { bg: 'bg-slate-100', border: 'border-slate-300', badge: '🥈', shadow: 'shadow-slate-200/50', text: 'text-slate-800' },
                      { bg: 'bg-amber-100/50', border: 'border-amber-700/30', badge: '🥉', shadow: 'shadow-amber-100/50', text: 'text-amber-950' },
                    ];
                    const podium = rankIdx < 3 ? podiumStyles[rankIdx] : null;
                    const baseClasses = podium 
                      ? `${podium.bg} ${podium.border} shadow-sm ${podium.shadow}`
                      : 'bg-slate-50 border-slate-200 text-slate-800';

                    return (
                      <div
                        key={student.userId}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isMe ? 'ring-2 ring-blue-300 font-bold' : ''
                        } ${baseClasses}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm min-w-[24px]">
                            {podium ? podium.badge : `#${rankIdx + 1}`}
                          </span>
                          <span className={`truncate max-w-[140px] font-bold ${podium ? podium.text : 'text-slate-800'}`}>
                            {student.username} {isMe ? '(คุณ)' : ''}
                          </span>
                        </div>

                        <div className="font-mono font-extrabold text-amber-600">
                          {student.totalPoints} <span className="text-[10px] text-slate-400 font-normal">PTS</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right 6 Columns: Achievements Badges with lock states */}
            <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <Medal size={18} className="text-amber-600" />
                  <span>เหรียญรางวัลสะสมของคุณ</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length} ปลดล็อก
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    onClick={() => { if (ach.unlocked) playStarTwinkleSound(); else playPopSound(); }}
                    className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer relative ${
                      ach.unlocked
                        ? 'bg-amber-50/80 border-amber-200 shadow-xs hover:shadow-md'
                        : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-80'
                    }`}
                  >
                    {/* Lock badge overlay for locked achievements */}
                    {!ach.unlocked && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-200/90 flex items-center justify-center">
                        <Lock size={11} className="text-slate-500" />
                      </div>
                    )}

                    <span className={`text-xl shrink-0 p-1.5 rounded-lg border ${
                      ach.unlocked
                        ? 'bg-white border-amber-200'
                        : 'bg-slate-100 border-slate-200'
                    }`} aria-hidden="true">
                      {ach.icon}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1 truncate">
                        <span>{ach.label}</span>
                        {ach.unlocked && <CheckCircle size={11} className="text-emerald-600 shrink-0" />}
                      </h3>
                      <p className="text-[10px] text-slate-600 line-clamp-2 leading-tight">
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