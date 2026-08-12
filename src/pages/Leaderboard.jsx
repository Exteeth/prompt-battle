import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getLeaderboard, getUserAchievements } from '../lib/sessionStorage';
import { playPopSound } from '../lib/soundEffects';
import { Trophy, ArrowLeft, Crown, Medal, Award, User, Sparkles, Search, Share2, Check } from 'lucide-react';

import SpotlightCard from '../components/reactbits/SpotlightCard';
import ShinyText from '../components/reactbits/ShinyText';
import ParticlesBg from '../components/reactbits/ParticlesBg';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const leaderboard = getLeaderboard(user.roomCode);
  const achievements = getUserAchievements();

  const filteredLeaderboard = leaderboard.filter(item =>
    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.studentId && item.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  const handleShare = () => {
    playPopSound();
    const text = `🏆 Prompt Battle Leaderboard ห้อง ${user.roomCode}\nผู้เล่นอันดับ 1: ${top1 ? top1.username : 'ยังไม่มี'} (${top1 ? top1.totalPoints : 0} คะแนน)\nมาร่วมท้าทายกันได้เลย!`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F3FA] text-[#1A1525] flex flex-col font-prompt relative overflow-hidden">
      {/* ReactBits Floating Particles */}
      <ParticlesBg color="245, 158, 11" quantity={30} staticity={30} />

      {/* Glass Navbar */}
      <nav className="h-16 border-b border-black/5 px-3 sm:px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20 shadow-xs">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playPopSound(); navigate('/stages'); }}
          className="min-h-[44px] px-3 py-2 rounded-2xl bg-white/70 hover:bg-white border border-black/5 text-[#5C526E] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>กลับหน้าเลือกด่าน</span>
        </motion.button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Trophy className="text-[#F59E0B]" size={18} />
          <span className="font-bold text-xs sm:text-base font-kanit">
            Leaderboard ห้อง <strong className="font-mono text-[#6D28D9]">{user.roomCode}</strong>
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="min-h-[44px] px-3 py-2 bg-[#7C3AED]/[0.10] hover:bg-[#7C3AED]/[0.18] border border-[#7C3AED]/[0.20] text-[#6D28D9] text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {copiedShare ? <Check size={16} className="text-[#00B894]" /> : <Share2 size={16} />}
          <span className="hidden sm:inline">{copiedShare ? 'คัดลอกแชร์แล้ว' : 'แชร์ตารางคะแนน'}</span>
        </motion.button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F59E0B]/[0.10] border border-[#F59E0B]/[0.20] text-[#92400E] text-xs font-bold shadow-xs">
            <Sparkles size={14} className="text-[#F59E0B]" />
            <ShinyText text="HALL OF FAME & LEADERBOARD" speed={3} className="text-[#92400E] font-bold" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1525] font-kanit">
            ตารางอันดับคะแนนรวม
          </h1>
          <p className="text-xs sm:text-sm text-[#5C526E]">
            คำนวณจากคะแนนสูงสุดในแต่ละด่านที่ผู้เล่นผ่านในห้อง {user.roomCode}
          </p>
        </div>

        {/* User Badges Quick Strip */}
        {user.role === 'student' && achievements.length > 0 && (
          <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.12)" className="p-4 bg-white/70 border border-white/60 shadow-md space-y-2">
            <h3 className="text-xs font-extrabold text-[#1A1525] uppercase font-mono flex items-center gap-1.5">
              <Medal size={16} className="text-[#F59E0B]" />
              <span>เหรียญรางวัลเกียรติยศของคุณ:</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {achievements.map(ach => (
                <span
                  key={ach.id}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold border flex items-center gap-1.5 ${
                    ach.unlocked 
                      ? 'bg-[#F59E0B]/[0.10] border-[#F59E0B]/[0.25] text-[#92400E] shadow-xs' 
                      : 'bg-black/[0.02] border-black/5 text-[#8E85A2] opacity-60'
                  }`}
                  title={ach.desc}
                >
                  <span>{ach.icon}</span>
                  <span>{ach.label}</span>
                </span>
              ))}
            </div>
          </SpotlightCard>
        )}

        {/* Mobile-Friendly 3D Podium Stand for Top 3 Champions */}
        {leaderboard.length > 0 && (
          <div className="flex items-end justify-center gap-2 sm:gap-6 pt-4 pb-2 font-prompt max-w-full overflow-hidden">
            {/* 2nd Place Podium */}
            {top2 ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-200 border-2 sm:border-3 border-slate-400 flex items-center justify-center text-slate-700 font-bold text-xs sm:text-sm shadow-md mb-1.5">
                  <User size={18} className="sm:hidden" />
                  <User size={22} className="hidden sm:block" />
                </div>
                <span className="text-[11px] sm:text-xs font-black text-[#1A1525] truncate max-w-[70px] sm:max-w-[100px]">
                  {top2.username}
                </span>
                <span className="text-[10px] sm:text-xs text-[#047857] font-black font-mono">{top2.totalPoints} pts</span>
                <div className="w-16 sm:w-26 h-20 sm:h-28 bg-gradient-to-t from-slate-300 via-slate-200 to-slate-100 rounded-t-2xl sm:rounded-t-3xl border-2 sm:border-3 border-slate-400 flex flex-col items-center justify-center mt-1.5 shadow-lg">
                  <Medal size={24} className="text-slate-500 sm:hidden" />
                  <Medal size={32} className="text-slate-500 hidden sm:block" />
                  <span className="text-[10px] sm:text-sm font-black text-slate-700 font-mono mt-0.5">#2</span>
                </div>
              </div>
            ) : null}

            {/* 1st Place Champion */}
            {top1 ? (
              <div className="flex flex-col items-center -mt-4">
                <Crown size={22} className="text-[#F59E0B] fill-[#F59E0B] drop-shadow-md mb-0.5 animate-bounce" />
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[#F59E0B]/[0.15] border-3 sm:border-4 border-[#F59E0B] flex items-center justify-center text-[#92400E] font-black text-sm sm:text-base shadow-xl mb-1.5">
                  <User size={24} className="sm:hidden" />
                  <User size={30} className="hidden sm:block" />
                </div>
                <span className="text-xs sm:text-sm font-black text-[#1A1525] truncate max-w-[90px] sm:max-w-[130px] font-kanit">
                  {top1.username}
                </span>
                <span className="text-[11px] sm:text-xs text-[#92400E] font-black font-mono bg-[#F59E0B]/[0.15] px-2 py-0.5 rounded-full border border-[#F59E0B]/[0.3]">{top1.totalPoints} pts</span>
                <div className="w-20 sm:w-30 h-28 sm:h-36 bg-gradient-to-t from-[#F59E0B]/30 via-[#F59E0B]/20 to-[#F59E0B]/10 rounded-t-2xl sm:rounded-t-3xl border-2 sm:border-3 border-[#F59E0B] flex flex-col items-center justify-center mt-1.5 shadow-xl">
                  <Trophy size={28} className="text-[#92400E] fill-[#F59E0B] sm:hidden" />
                  <Trophy size={40} className="text-[#92400E] fill-[#F59E0B] hidden sm:block" />
                  <span className="text-xs sm:text-sm font-black text-[#92400E] font-mono mt-0.5 tracking-wider">#1 CHAMP</span>
                </div>
              </div>
            ) : null}

            {/* 3rd Place Podium */}
            {top3 ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-amber-100 border-2 sm:border-3 border-amber-500 flex items-center justify-center text-amber-900 font-bold text-xs sm:text-sm shadow-md mb-1.5">
                  <User size={18} className="sm:hidden" />
                  <User size={22} className="hidden sm:block" />
                </div>
                <span className="text-[11px] sm:text-xs font-black text-[#1A1525] truncate max-w-[70px] sm:max-w-[100px]">
                  {top3.username}
                </span>
                <span className="text-[10px] sm:text-xs text-[#047857] font-black font-mono">{top3.totalPoints} pts</span>
                <div className="w-16 sm:w-26 h-18 sm:h-24 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-2xl sm:rounded-t-3xl border-2 sm:border-3 border-amber-400 flex flex-col items-center justify-center mt-1.5 shadow-lg">
                  <Award size={24} className="text-amber-700 sm:hidden" />
                  <Award size={32} className="text-amber-700 hidden sm:block" />
                  <span className="text-[10px] sm:text-xs font-black text-amber-900 font-mono mt-0.5">#3</span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Search Student Input */}
        <div className="relative max-w-md mx-auto font-prompt">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E85A2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วยรหัสนักเรียน หรือ ชื่อเล่น..."
            className="glass-input font-bold pl-11 min-h-[48px]"
          />
        </div>

        {/* Leaderboard Card List for Mobile & Table for Desktop */}
        <SpotlightCard spotlightColor="rgba(124, 58, 237, 0.12)" className="bg-white/80 border border-white/60 shadow-xl overflow-hidden font-prompt">
          {filteredLeaderboard.length === 0 ? (
            <div className="p-12 text-center text-[#8E85A2] text-sm font-bold">
              ไม่พบผู้เล่นที่คุณค้นหา
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {/* Header */}
              <div className="grid grid-cols-12 px-4 py-3 bg-black/[0.02] text-xs font-black text-[#6D28D9] uppercase tracking-wider font-mono border-b border-black/5">
                <div className="col-span-2 text-center">อันดับ</div>
                <div className="col-span-6 sm:col-span-5">ชื่อผู้เล่น / รหัส</div>
                <div className="hidden sm:block sm:col-span-3 text-center">ด่านที่ผ่าน</div>
                <div className="col-span-4 sm:col-span-2 text-right">คะแนนรวม</div>
              </div>

              {/* Rows */}
              {filteredLeaderboard.map((item) => {
                const rank = leaderboard.findIndex(l => l.userId === item.userId) + 1;
                const isCurrentUser = item.userId === user.userId;

                return (
                  <div
                    key={item.userId}
                    className={`grid grid-cols-12 px-4 py-3.5 items-center text-xs sm:text-sm transition-all ${
                      isCurrentUser ? 'bg-[#7C3AED]/[0.08] font-extrabold border-l-4 border-[#7C3AED]' : 'hover:bg-white/90'
                    }`}
                  >
                    <div className="col-span-2 text-center font-mono font-black text-[#1A1525]">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </div>

                    <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 truncate">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrentUser ? 'bg-[#7C3AED] text-white' : 'bg-black/5 text-[#5C526E]'
                      }`}>
                        <User size={13} />
                      </div>
                      <div className="truncate min-w-0">
                        <span className="font-bold text-[#1A1525] truncate block font-kanit">
                          {item.username} {isCurrentUser ? '(คุณ)' : ''}
                        </span>
                        {item.studentId && (
                          <span className="text-[10px] text-[#8E85A2] font-mono block">ID: {item.studentId}</span>
                        )}
                      </div>
                    </div>

                    <div className="hidden sm:block sm:col-span-3 text-center text-[#5C526E] text-xs font-mono">
                      {item.stagesCompleted} / 10 ด่าน
                    </div>

                    <div className="col-span-4 sm:col-span-2 text-right font-mono font-black text-[#047857] text-sm sm:text-base">
                      {item.totalPoints} <span className="text-[10px] font-normal text-[#8E85A2]">PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SpotlightCard>
      </main>
    </div>
  );
}
