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

  const mainStages = STAGES_DATA.filter(s => !s.is_tutorial);
  const achievements = getUserAchievements();
  const roomLeaderboard = getLeaderboard(user.roomCode);

  // Calculate student stats based on battle stages
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
    <div className="min-h-[100dvh] bg-[#0b0f19] text-white flex flex-col font-prompt">
      {/* High-Density Top Navigation Bar */}
      <nav 
        role="navigation"
        aria-label="แถบการนำทางหลัก"
        className="h-16 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-md z-30 shadow-lg"
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm hover:scale-105 transition-transform cursor-pointer"
            onClick={() => { playPopSound(); navigate('/stages'); }}
          />
          <div>
            <span className="font-black text-xs sm:text-sm text-white block leading-tight font-kanit">Prompt Battle</span>
            <span className="text-[10px] sm:text-[11px] text-cyan-400 font-mono">CLASS: <strong className="text-yellow-300 font-mono">{user.roomCode}</strong></span>
          </div>
        </div>

        {/* Compact User Level Status Pill */}
        <div className="hidden md:flex items-center gap-4 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="font-black text-white flex items-center gap-1.5">
            👤 <span>{user.username}</span>
            <span className="text-[10px] bg-cyan-400 text-black font-black px-2 py-0.5 rounded font-mono">
              LVL 0{clearedCount + 1}
            </span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="font-mono font-black text-yellow-300 flex items-center gap-1">
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
            <span>{totalUserStars} PTS</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleSoundToggle}
            aria-label={muted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
          >
            {muted ? <VolumeX size={17} className="text-rose-400" /> : <Volume2 size={17} className="text-cyan-400" />}
          </button>

          <button
            onClick={() => { playPopSound(); setIsCheatSheetOpen(true); }}
            className="btn-arcade-cyan min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer font-mono"
          >
            <BookOpen size={15} className="text-black" />
            <span className="hidden sm:inline">FORMULA CHEAT SHEET</span>
          </button>

          <button
            onClick={handleLogout}
            aria-label="ออกจากระบบ"
            className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={17} />
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-4 font-prompt">
        
        {/* Rich Interactive Mascot Hero Banner */}
        <CuteMascotHeroBanner
          username={user.username}
          studentId={user.studentId}
          clearedCount={clearedCount}
          totalStages={mainStages.length}
          onStartClick={() => navigate(`/play/${mainStages[currentLevelIndex].id}`)}
        />

        {/* High-Density Tab Segmented Controller */}
        <div className="bg-slate-900 p-1.5 rounded-xl border-2 border-slate-800 text-xs font-black overflow-x-auto scrollbar-none font-mono">
          <div className="flex items-center gap-1.5 w-full min-w-max">
            <button
              onClick={() => { playPopSound(); setActiveTab('stages'); }}
              className={`flex-1 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase ${
                activeTab === 'stages'
                  ? 'btn-arcade-cyan text-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutGrid size={15} />
              <span>BATTLES MAP</span>
            </button>

            <button
              onClick={() => { playPopSound(); setActiveTab('formula'); }}
              className={`flex-1 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase ${
                activeTab === 'formula'
                  ? 'btn-arcade-yellow text-black font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap size={15} className="text-yellow-400" />
              <span>7 PROMPT FORMULAS</span>
            </button>

            <button
              onClick={() => { playPopSound(); setActiveTab('leaderboard'); }}
              className={`flex-1 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase ${
                activeTab === 'leaderboard'
                  ? 'btn-arcade-pink text-white font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trophy size={15} className="text-yellow-300" />
              <span>HIGH SCORES & BADGES</span>
            </button>
          </div>
        </div>

        {/* TAB 1: BATTLES (Full Width Mobile-First Responsive Grid) */}
        {activeTab === 'stages' && (
          <div key="tab-stages" className="arcade-card p-5 sm:p-6 space-y-5 animate-fade-in border-4 border-cyan-400">
            <div className="flex items-center justify-between border-b-2 border-slate-700/80 pb-3 font-kanit">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-black text-cyan-300">
                <Swords className="text-yellow-400 fill-yellow-400 animate-bounce" size={22} />
                <span>ด่านแข่งขันเก็บคะแนน (Battle Arenas)</span>
              </div>
              <span className="text-xs text-cyan-300 bg-slate-900 px-3 py-1 rounded font-black font-mono border border-cyan-400">{mainStages.length} BATTLES AVAILABLE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {mainStages.map((stage) => {
                const attempts = getUserStageAttempts(stage.id);
                const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
                const isCleared = highestScore >= 12;

                return (
                  <div 
                    key={stage.id}
                    className={`p-4.5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 arcade-card-hover ${
                      isCleared ? 'bg-slate-900 border-green-400 shadow-green-400/20' : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <div className="space-y-2 font-prompt">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-xs font-black text-cyan-300 bg-cyan-950 px-3 py-0.5 rounded border border-cyan-400">
                          STAGE 0{stage.stage_number}
                        </span>
                        <span className="text-xs font-black text-yellow-300 bg-yellow-950 px-2.5 py-0.5 rounded border border-yellow-400">
                          {stage.difficulty}
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-white line-clamp-1 font-kanit">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {stage.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 font-prompt">
                      <span className="text-xs font-mono text-yellow-300 font-black flex items-center gap-1 bg-yellow-950/80 px-2.5 py-1 rounded border border-yellow-400">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        {highestScore}/20 PTS
                      </span>

                      <button
                        onClick={() => { playPopSound(); navigate(`/play/${stage.id}`); }}
                        className={`${isCleared ? 'btn-arcade-green text-black' : 'btn-arcade-pink text-white'} min-h-[44px] px-4 py-2 text-xs flex items-center gap-2 cursor-pointer font-kanit uppercase tracking-wider`}
                      >
                        <span>{attempts.length > 0 ? 'RE-CHALLENGE' : 'START BATTLE'}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PROMPT FORMULA CHEAT SHEET (คลังสูตรลับ 7 ด้าน) — color-coded */}
        {activeTab === 'formula' && (
          <div key="tab-formula" className="arcade-card p-4 sm:p-6 space-y-4 animate-fade-in border-4 border-cyan-400 bg-slate-900 text-white font-prompt">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 font-mono">
              <div className="flex items-center gap-2 text-sm sm:text-base font-black text-yellow-300">
                <Zap className="text-yellow-400 fill-yellow-400" size={20} />
                <span>คลังสูตรลับ & เกณฑ์ประเมินการเขียน Prompt 7 ด้าน</span>
              </div>
              <span className="text-xs text-cyan-400">แตะการ์ดเพื่อดูตัวอย่างประโยค</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {formulaCards.map((card) => {
                const IconComp = card.icon;
                const isSelected = selectedFormulaCard === card.id;

                return (
                  <div
                    key={card.id}
                    onClick={() => { playPopSound(); setSelectedFormulaCard(isSelected ? null : card.id); }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2 bg-slate-950/80 ${
                      isSelected
                        ? `border-cyan-400 shadow-lg shadow-cyan-400/20 ring-2 ring-cyan-400`
                        : `border-slate-800 hover:border-cyan-400`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-400 flex items-center justify-center shrink-0">
                        <IconComp size={18} />
                      </div>
                      <h3 className="text-xs font-black text-white font-kanit">
                        {card.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-prompt">
                      {card.desc}
                    </p>

                    {isSelected && (
                      <div className="pt-2 border-t border-cyan-400/50 text-xs text-cyan-200 bg-slate-900 p-2.5 rounded-lg font-mono">
                        <strong className="block text-yellow-300 font-bold mb-0.5 font-sans">ตัวอย่างประโยค:</strong>
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
          <div key="tab-leaderboard" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-fade-in font-prompt">
            
            {/* Left 6 Columns: Top Class Leaderboard with podium styling */}
            <div className="lg:col-span-6 arcade-card p-4 sm:p-5 border-4 border-cyan-400 bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 font-mono">
                <div className="flex items-center gap-2 text-sm font-black text-yellow-300">
                  <Crown size={18} className="text-yellow-400 fill-yellow-400" />
                  <span>CLASS HIGH SCORES ({user.roomCode})</span>
                </div>

                <button
                  onClick={() => { playPopSound(); navigate('/leaderboard'); }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-black flex items-center gap-1 cursor-pointer"
                >
                  <span>FULL PAGE</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="space-y-2 font-mono">
                {roomLeaderboard.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีข้อมูลอันดับในห้องเรียนนี้</p>
                ) : (
                  roomLeaderboard.slice(0, 5).map((student, rankIdx) => {
                    const isMe = student.userId === user.userId;
                    const podiumStyles = [
                      { bg: 'bg-yellow-950/80', border: 'border-yellow-400', badge: '🥇', text: 'text-yellow-300' },
                      { bg: 'bg-slate-800/80', border: 'border-slate-400', badge: '🥈', text: 'text-slate-200' },
                      { bg: 'bg-amber-950/80', border: 'border-amber-600', badge: '🥉', text: 'text-amber-300' },
                    ];
                    const podium = rankIdx < 3 ? podiumStyles[rankIdx] : null;
                    const baseClasses = podium 
                      ? `${podium.bg} ${podium.border}`
                      : 'bg-slate-950 border-slate-800 text-white';

                    return (
                      <div
                        key={student.userId}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isMe ? 'ring-2 ring-cyan-400 font-black' : ''
                        } ${baseClasses}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm min-w-[24px]">
                            {podium ? podium.badge : `#${rankIdx + 1}`}
                          </span>
                          <span className={`truncate max-w-[140px] font-bold ${podium ? podium.text : 'text-white'}`}>
                            {student.username} {isMe ? '(คุณ)' : ''}
                          </span>
                        </div>

                        <div className="font-mono font-extrabold text-yellow-300">
                          {student.totalPoints} <span className="text-[10px] text-slate-400 font-normal">PTS</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right 6 Columns: Achievements Badges with lock states */}
            <div className="lg:col-span-6 arcade-card p-4 sm:p-5 border-4 border-cyan-400 bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 font-mono">
                <div className="flex items-center gap-2 text-sm font-black text-yellow-300">
                  <Medal size={18} className="text-yellow-400" />
                  <span>BADGES UNLOCKED</span>
                </div>
                <span className="text-xs text-cyan-400 font-mono">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length} UNLOCKED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    onClick={() => { if (ach.unlocked) playStarTwinkleSound(); else playPopSound(); }}
                    className={`p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 cursor-pointer relative ${
                      ach.unlocked
                        ? 'bg-yellow-950/60 border-yellow-400 text-white'
                        : 'bg-slate-950 border-slate-800 opacity-60 hover:opacity-80 text-slate-400'
                    }`}
                  >
                    {!ach.unlocked && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Lock size={11} className="text-slate-400" />
                      </div>
                    )}

                    <span className={`text-xl shrink-0 p-1.5 rounded border ${
                      ach.unlocked
                        ? 'bg-slate-900 border-yellow-400'
                        : 'bg-slate-900 border-slate-800'
                    }`} aria-hidden="true">
                      {ach.icon}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-xs font-bold text-white flex items-center gap-1 truncate font-kanit">
                        <span>{ach.label}</span>
                        {ach.unlocked && <CheckCircle size={11} className="text-green-400 shrink-0" />}
                      </h3>
                      <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight font-prompt">
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