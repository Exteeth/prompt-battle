import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { STAGES_DATA } from '../data/stagesData';
import { getUserStageAttempts, getUserAchievements } from '../lib/sessionStorage';
import { playPopSound, playMascotBlipSound, toggleMute, getMuteState } from '../lib/soundEffects';
import PromptCheatSheetModal from '../components/PromptCheatSheetModal';
import { BookOpen, Swords, Trophy, LogOut, CheckCircle, ArrowRight, Star, User, Sparkles, MapPin, Play, RefreshCw, Volume2, VolumeX, Medal } from 'lucide-react';

export default function StageList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [muted, setMuted] = useState(getMuteState());

  // Animated Mascot Speech Messages in StageList
  const stageMascotMessages = [
    `พร้อมลุยสนามฝึกวิชา Prompt แล้วหรือยังครับ ${user?.username || ''}? 🚀`,
    `ทำตามเส้นทาง Mini-Tutorial 5 ด่านเพื่อสะสมพื้นฐานแน่นเปรี๊ยะ! 💡`,
    `สะสมดาวให้เต็ม 20 คะแนนทุกด่านเพื่อชิงอันดับ 1 ใน Leaderboard! 🏆`,
    `กดปุ่ม 'สูตรลับ Prompt' ด้านบนเพื่อดู 5 องค์ประกอบลัดได้เสมอนะครับ! ⭐️`
  ];

  const [mascotMsgIndex, setMascotMsgIndex] = useState(0);

  const nextMascotMessage = () => {
    playMascotBlipSound();
    setMascotMsgIndex((prev) => (prev + 1) % stageMascotMessages.length);
  };

  const handleSoundToggle = () => {
    const newState = toggleMute();
    setMuted(newState);
    if (!newState) playPopSound();
  };

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    playPopSound();
    logout();
    navigate('/');
  };

  const miniStages = STAGES_DATA.filter(s => s.is_tutorial);
  const mainStages = STAGES_DATA.filter(s => !s.is_tutorial);
  const achievements = getUserAchievements();

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col font-prompt">
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle"
            className="w-10 h-10 object-contain drop-shadow-sm hover:scale-105 transition-transform cursor-pointer"
            onClick={() => { playPopSound(); navigate('/stages'); }}
          />
          <div>
            <span className="font-extrabold text-sm sm:text-base text-slate-900 block leading-tight">Prompt Battle</span>
            <span className="text-xs text-slate-500">ห้องเรียน: <strong className="text-blue-600 font-mono">{user.roomCode}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Mute Toggle Button */}
          <button
            onClick={handleSoundToggle}
            className="min-h-[44px] min-w-[44px] p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
            title={muted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
          >
            {muted ? <VolumeX size={18} className="text-rose-600" /> : <Volume2 size={18} className="text-blue-600" />}
          </button>

          <button
            onClick={() => { playPopSound(); setIsCheatSheetOpen(true); }}
            className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <BookOpen size={16} className="text-blue-600" />
            <span className="hidden sm:inline">สูตรลับ Prompt</span>
          </button>

          <button
            onClick={() => { playPopSound(); navigate('/leaderboard'); }}
            className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Trophy size={16} className="text-amber-600" />
            <span className="hidden sm:inline">ตารางคะแนน</span>
          </button>

          <button
            onClick={handleLogout}
            className="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors flex items-center justify-center cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-10">
        {/* Animated Mascot Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Ambient Lighting background glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 z-10">
            <div 
              className="relative cursor-pointer group shrink-0" 
              onClick={nextMascotMessage} 
              title="แตะที่ตัว Promptie เพื่อฟังคำท้าทายใหม่!"
            >
              <img
                src="/assets/mascot.webp"
                alt="Promptie Mascot"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl animate-mascot-pulse group-hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-md flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <RefreshCw size={10} className="animate-spin" />
                <span>คุยกับผม!</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold backdrop-blur-md">
                <Sparkles size={14} className="text-yellow-300" />
                <span>เส้นทางการเรียนรู้ (Learning Pathway)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                ยินดีต้อนรับ, {user.username}!
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-md leading-relaxed font-medium bg-white/15 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 animate-fade-in">
                {stageMascotMessages[mascotMsgIndex]}
              </p>
            </div>
          </div>

          <button
            onClick={() => { playPopSound(); navigate('/play/1'); }}
            className="min-h-[48px] px-6 py-3.5 bg-white hover:bg-slate-100 text-blue-700 font-extrabold rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer w-full sm:w-auto z-10 hover:scale-105 active:scale-95"
          >
            <Play size={16} className="fill-blue-700" />
            <span>เริ่มบทเรียนถัดไป</span>
          </button>
        </div>

        {/* Section: Achievements & Badges (เหรียญรางวัลสะสม) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
              <Medal className="text-amber-600" size={22} />
              <h2>เหรียญรางวัลสะสมของคุณ (Achievements)</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              ปลดล็อก {achievements.filter(a => a.unlocked).length} / {achievements.length} เหรียญ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  ach.unlocked
                    ? 'bg-amber-50/80 border-amber-200 shadow-xs'
                    : 'bg-slate-100/60 border-slate-200 opacity-50 grayscale'
                }`}
              >
                <span className="text-2xl shrink-0 p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                  {ach.icon}
                </span>
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1 truncate">
                    <span>{ach.label}</span>
                    {ach.unlocked && <CheckCircle size={12} className="text-emerald-600 shrink-0" />}
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                    {ach.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 1: Animated Visual Learning Pathway Map */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
              <MapPin className="text-emerald-600" size={22} />
              <h2>1. เส้นทางฝึกปูพื้นฐาน (Mini-Tutorial Roadmap)</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">5 บทเรียน</span>
          </div>

          {/* Interactive Animated Learning Pathway Map */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden">
            {/* Animated Dashed Connection Path (Desktop) */}
            <div className="hidden sm:block absolute top-1/2 left-12 right-12 h-1 -translate-y-6 z-0 pointer-events-none">
              <svg className="w-full h-full" overflow="visible">
                <line
                  x1="0%"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                  stroke="#cbd5e1"
                  strokeWidth="4"
                  className="animate-path-dash"
                />
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
              {miniStages.map((stage) => {
                const attempts = getUserStageAttempts(stage.id);
                const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
                const isCleared = highestScore >= 12;
                const isNextToPlay = !isCleared && attempts.length === 0;

                return (
                  <div
                    key={stage.id}
                    onClick={() => { playPopSound(); navigate(`/play/${stage.id}`); }}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between items-center text-center space-y-3 cursor-pointer group ${
                      isCleared
                        ? 'bg-emerald-50/90 border-emerald-300 hover:border-emerald-500 shadow-sm'
                        : isNextToPlay
                        ? 'bg-blue-50 border-blue-400 shadow-md animate-ring-pulse'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 shadow-xs'
                    }`}
                  >
                    {/* Animated Level Badge Node */}
                    <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-sm shadow-md transition-transform group-hover:scale-115 group-hover:rotate-6 ${
                      isCleared 
                        ? 'bg-emerald-600 text-white' 
                        : isNextToPlay
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-700 text-white'
                    }`}>
                      {isCleared ? <CheckCircle size={24} /> : stage.stage_number}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 leading-snug">
                        {stage.title}
                      </h3>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {attempts.length}/3 Attempts
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 w-full flex items-center justify-center gap-1 font-mono text-xs text-amber-600 font-bold">
                      <Star size={13} className="fill-amber-500 text-amber-500 group-hover:rotate-12 transition-transform" />
                      <span>{highestScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Animated Main Battle Stages Grid */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
              <Swords className="text-amber-600" size={22} />
              <h2>2. ด่านแข่งขันเก็บคะแนน (Main Battle Stages)</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">5 ด่านประลอง</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mainStages.map((stage) => (
              <StageBattleCard key={stage.id} stage={stage} onPlay={() => { playPopSound(); navigate(`/play/${stage.id}`); }} />
            ))}
          </div>
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

function StageBattleCard({ stage, onPlay }) {
  const attempts = getUserStageAttempts(stage.id);
  const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
  const isCleared = highestScore >= 12;

  return (
    <div className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 bg-white card-vibrant-hover group ${
      isCleared ? 'border-emerald-300 shadow-md' : 'border-slate-200 shadow-sm'
    }`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 font-mono group-hover:scale-105 transition-transform">
            Stage {stage.stage_number}
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
            {stage.difficulty}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
          {stage.title}
        </h3>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {stage.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-500 block font-medium">คะแนนสูงสุด:</span>
          <strong className="text-sm font-black text-amber-600 flex items-center gap-1 font-mono">
            <Star size={14} className="fill-amber-500 text-amber-500 group-hover:rotate-12 transition-transform" />
            {highestScore} / 20
          </strong>
        </div>

        <button
          onClick={onPlay}
          className="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20 group-hover:scale-105"
        >
          <span>{attempts.length > 0 ? 'ทำอีกครั้ง' : 'เริ่มท้าทาย'}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
