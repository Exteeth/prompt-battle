import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { STAGES_DATA } from '../data/stagesData';
import { getUserStageAttempts, getUserAchievements } from '../lib/sessionStorage';
import { playPopSound, toggleMute, getMuteState } from '../lib/soundEffects';
import CuteMascotHeroBanner from '../components/CuteMascotHeroBanner';
import PromptCheatSheetModal from '../components/PromptCheatSheetModal';
import { BookOpen, Swords, Trophy, LogOut, CheckCircle, ArrowRight, Star, Sparkles, MapPin, Play, Volume2, VolumeX, Medal, Lock, X } from 'lucide-react';

export default function StageList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [muted, setMuted] = useState(getMuteState());

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

  // Find index of student's current active level node and cleared count
  const clearedCount = miniStages.filter(s => {
    const attempts = getUserStageAttempts(s.id);
    const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
    return highestScore >= 12;
  }).length;

  const currentLevelIndex = Math.min(clearedCount, miniStages.length - 1);

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col font-prompt">
      {/* Navbar */}
      <nav 
        role="navigation"
        aria-label="แถบการนำทางหลัก"
        className="h-16 border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
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
            aria-label={muted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
            className="min-h-[44px] min-w-[44px] p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
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
            aria-label="ออกจากระบบ"
            className="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors flex items-center justify-center cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-10">
        {/* Cute Mascot Hero Banner for Kids with Real-time Student Stats */}
        <CuteMascotHeroBanner
          username={user.username}
          studentId={user.studentId}
          clearedCount={clearedCount}
          totalStages={miniStages.length}
          onStartClick={() => navigate(`/play/${miniStages[currentLevelIndex].id}`)}
        />

        {/* Section: Achievements & Badges Strip */}
        <section className="space-y-4" aria-label="เหรียญรางวัลสะสม">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
              <Medal className="text-amber-600" size={22} aria-hidden="true" />
              <h2>เหรียญรางวัลสะสมของคุณ</h2>
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
                <span className="text-2xl shrink-0 p-2 bg-white rounded-xl shadow-xs border border-slate-200" aria-hidden="true">
                  {ach.icon}
                </span>
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1 truncate">
                    <span>{ach.label}</span>
                    {ach.unlocked && <CheckCircle size={12} className="text-emerald-600 shrink-0" aria-hidden="true" />}
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                    {ach.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 1: Clean 3D RPG Pedestal Box Map */}
        <section className="space-y-6" aria-label="แผนที่ผจญภัย 3D RPG World Map">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
              <MapPin className="text-emerald-600" size={22} aria-hidden="true" />
              <h2>1. แผนที่ผจญภัยเกาะการเรียนรู้</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">5 บทเรียน</span>
          </div>

          {/* 3D RPG Pedestal Box Map Container */}
          <div className="bg-gradient-to-b from-blue-50/80 via-emerald-50/40 to-slate-100 p-6 sm:p-10 rounded-3xl border-2 border-slate-300 shadow-xl relative overflow-hidden space-y-8">
            {/* Ambient Floating Clouds */}
            <div className="absolute top-4 left-10 text-slate-300/60 text-4xl pointer-events-none animate-float" aria-hidden="true">☁️</div>
            <div className="absolute top-12 right-20 text-slate-300/50 text-5xl pointer-events-none animate-float" style={{ animationDelay: '2.5s' }} aria-hidden="true">☁️</div>

            {/* Desktop Animated Energy Path Line */}
            <div className="hidden sm:block absolute top-1/2 left-14 right-14 h-1 -translate-y-6 z-0 pointer-events-none">
              <svg className="w-full h-full" overflow="visible">
                <line
                  x1="0%"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                  stroke="#2563eb"
                  strokeWidth="4"
                  className="animate-path-dash"
                />
              </svg>
            </div>

            {/* 3D Elevated Pedestal Box Nodes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative z-10">
              {miniStages.map((stage, idx) => {
                const attempts = getUserStageAttempts(stage.id);
                const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.totalScore)) : 0;
                const isCleared = highestScore >= 12;
                const isCurrentActiveToken = idx === currentLevelIndex;

                return (
                  <button
                    key={stage.id}
                    onClick={() => { playPopSound(); navigate(`/play/${stage.id}`); }}
                    aria-label={`ด่าน 3D ${stage.stage_number}: ${stage.title}`}
                    className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col justify-between items-center text-center space-y-3 cursor-pointer group pedestal-3d ${
                      isCleared
                        ? 'bg-emerald-50/95 border-emerald-400 pedestal-3d-cleared'
                        : isCurrentActiveToken
                        ? 'bg-blue-50/95 border-blue-500 pedestal-3d-active animate-ring-pulse'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {/* Mascot Player Token on Current Active Level */}
                    {isCurrentActiveToken && (
                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 animate-float pointer-events-none">
                        <div className="relative flex flex-col items-center">
                          <img
                            src="/assets/mascot.webp"
                            alt="ตำแหน่งปัจจุบัน"
                            className="w-12 h-12 object-contain drop-shadow-xl"
                          />
                          <span className="px-2 py-0.5 bg-amber-400 text-amber-950 text-[9px] font-black rounded-full shadow-md whitespace-nowrap -mt-1">
                            ตำแหน่งคุณ!
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 3D Elevated Pedestal Badge Node */}
                    <div className={`w-[56px] h-[56px] rounded-2xl flex items-center justify-center font-black text-base shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6 ${
                      isCleared 
                        ? 'bg-emerald-600 text-white' 
                        : isCurrentActiveToken
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-700 text-white'
                    }`}>
                      {isCleared ? <CheckCircle size={26} aria-hidden="true" /> : stage.stage_number}
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
                      <Star size={13} className="fill-amber-500 text-amber-500 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                      <span>{highestScore}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Main Battle Arena Stages Grid */}
        <section className="space-y-6 pt-2" aria-label="ด่านแข่งขันเก็บคะแนน">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
              <Swords className="text-amber-600" size={22} aria-hidden="true" />
              <h2>2. ด่านแข่งขันเก็บคะแนน</h2>
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
            <Star size={14} className="fill-amber-500 text-amber-500 group-hover:rotate-12 transition-transform" aria-hidden="true" />
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
