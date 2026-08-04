import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getLeaderboard, getUserAchievements } from '../lib/sessionStorage';
import { playPopSound } from '../lib/soundEffects';
import { Trophy, ArrowLeft, Crown, Medal, Award, User, Sparkles, Search, Share2, Check } from 'lucide-react';

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
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col font-prompt">
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20 shadow-xs">
        <button
          onClick={() => { playPopSound(); navigate('/stages'); }}
          className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>กลับหน้าเลือกด่าน</span>
        </button>

        <div className="flex items-center gap-2">
          <Trophy className="text-amber-600" size={18} />
          <span className="font-bold text-xs sm:text-base">Leaderboard ห้อง <strong className="font-mono text-blue-600">{user.roomCode}</strong></span>
        </div>

        <button
          onClick={handleShare}
          className="min-h-[44px] px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {copiedShare ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
          <span className="hidden sm:inline">{copiedShare ? 'คัดลอกข้อความแชร์แล้ว' : 'แชร์ตารางคะแนน'}</span>
        </button>
      </nav>

      {/* Main Table Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
            <Sparkles size={14} className="text-amber-600" />
            <span>Leaderboard Hall of Fame</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            ตารางอันดับคะแนนรวม
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            คำนวณจากคะแนนสูงสุดในแต่ละด่านที่ผู้เล่นผ่านในห้อง {user.roomCode}
          </p>
        </div>

        {/* User Badges Quick Strip */}
        {user.role === 'student' && achievements.length > 0 && (
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase font-mono flex items-center gap-1.5">
              <Medal size={16} className="text-amber-600" />
              <span>เหรียญรางวัลเกียรติยศของคุณ:</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {achievements.map(ach => (
                <span
                  key={ach.id}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold border flex items-center gap-1.5 ${
                    ach.unlocked 
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs' 
                      : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                  }`}
                  title={ach.desc}
                >
                  <span>{ach.icon}</span>
                  <span>{ach.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 3D Podium Stand for Top 3 Champions */}
        {leaderboard.length > 0 && (
          <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4 pb-2 font-prompt">
            {/* 2nd Place Podium */}
            {top2 ? (
              <div className="flex flex-col items-center">
                <div className="w-13 h-13 rounded-full bg-slate-200 border-3 border-slate-400 flex items-center justify-center text-slate-700 font-bold text-sm shadow-md mb-2">
                  <User size={22} />
                </div>
                <span className="text-xs font-black text-slate-900 truncate max-w-[90px]">
                  {top2.studentId ? `[${top2.studentId}] ` : ''}{top2.username}
                </span>
                <span className="text-xs text-amber-600 font-black font-mono">{top2.totalPoints} pts</span>
                <div className="w-22 sm:w-26 h-28 bg-gradient-to-t from-slate-300 via-slate-200 to-slate-100 rounded-t-3xl border-3 border-slate-400 flex flex-col items-center justify-center mt-2 shadow-xl pedestal-3d">
                  <Medal size={32} className="text-slate-500" />
                  <span className="text-sm font-black text-slate-700 font-mono mt-1">#2 SILVER</span>
                </div>
              </div>
            ) : null}

            {/* 1st Place Podium */}
            {top1 ? (
              <div className="flex flex-col items-center -mt-6">
                <Crown size={28} className="text-amber-400 fill-amber-300 drop-shadow-md mb-1 animate-wiggle" />
                <div className="w-18 h-18 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-amber-900 font-black text-base shadow-xl mb-2 animate-ring-pulse">
                  <User size={30} />
                </div>
                <span className="text-sm font-black text-slate-900 truncate max-w-[120px] font-kanit">
                  {top1.studentId ? `[${top1.studentId}] ` : ''}{top1.username}
                </span>
                <span className="text-xs text-amber-600 font-black font-mono bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">{top1.totalPoints} pts</span>
                <div className="w-26 sm:w-30 h-36 bg-gradient-to-t from-amber-300 via-amber-200 to-amber-100 rounded-t-3xl border-3 border-amber-400 flex flex-col items-center justify-center mt-2 shadow-2xl pedestal-3d">
                  <Trophy size={40} className="text-amber-700 fill-amber-500 animate-bounce-gentle" />
                  <span className="text-sm font-black text-amber-950 font-mono mt-1 tracking-wider">#1 CHAMPION</span>
                </div>
              </div>
            ) : null}

            {/* 3rd Place Podium */}
            {top3 ? (
              <div className="flex flex-col items-center">
                <div className="w-13 h-13 rounded-full bg-amber-100 border-3 border-amber-500 flex items-center justify-center text-amber-900 font-bold text-sm shadow-md mb-2">
                  <User size={22} />
                </div>
                <span className="text-xs font-black text-slate-900 truncate max-w-[90px]">
                  {top3.studentId ? `[${top3.studentId}] ` : ''}{top3.username}
                </span>
                <span className="text-xs text-amber-600 font-black font-mono">{top3.totalPoints} pts</span>
                <div className="w-22 sm:w-26 h-24 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-3xl border-3 border-amber-400 flex flex-col items-center justify-center mt-2 shadow-xl pedestal-3d">
                  <Award size={32} className="text-amber-700" />
                  <span className="text-xs font-black text-amber-900 font-mono mt-1">#3 BRONZE</span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Search Student Input */}
        <div className="relative max-w-md mx-auto font-prompt">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วยรหัสนักเรียน หรือ ชื่อเล่น..."
            className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 text-slate-900 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm focus:outline-none transition-all shadow-sm font-bold"
          />
        </div>

        {/* Leaderboard Table */}
        <div className="glass-card-playful border-3 border-blue-200 overflow-hidden shadow-xl font-prompt">
          {filteredLeaderboard.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm font-bold">
              ไม่พบผู้เล่นที่คุณค้นหา
            </div>
          ) : (
            <div className="divide-y-2 divide-slate-100">
              <div className="grid grid-cols-12 px-4 sm:px-6 py-3.5 bg-blue-50/80 text-xs font-black text-blue-800 uppercase tracking-wider font-mono border-b-2 border-blue-100">
                <div className="col-span-2 text-center">อันดับ</div>
                <div className="col-span-5">ชื่อผู้เล่น / รหัส</div>
                <div className="col-span-3 text-center">ด่านที่ผ่าน</div>
                <div className="col-span-2 text-right">คะแนนรวม</div>
              </div>

              {filteredLeaderboard.map((item) => {
                const rank = leaderboard.findIndex(l => l.userId === item.userId) + 1;
                const isCurrentUser = item.userId === user.userId;
                const avatarBg = isCurrentUser ? 'bg-blue-600' : 'bg-slate-200';
                const avatarText = isCurrentUser ? 'text-white' : 'text-slate-800';

                return (
                  <div
                    key={item.userId}
                    className={`grid grid-cols-12 px-4 sm:px-6 py-4 items-center text-xs sm:text-sm transition-all ${
                      isCurrentUser ? 'bg-blue-100/60 border-y-2 border-blue-300 font-extrabold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="col-span-2 flex justify-center font-black font-mono text-slate-800">
                      #{rank}
                    </div>

                    <div className="col-span-5 flex items-center gap-2.5 truncate font-prompt">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${avatarBg} ${avatarText}`}>
                        <User size={15} />
                      </div>
                      <span className={`truncate font-extrabold ${isCurrentUser ? 'text-blue-800' : 'text-slate-900'}`}>
                        {item.studentId && <span className="font-mono text-xs text-blue-600 mr-1.5 font-black">[{item.studentId}]</span>}
                        {item.username} {isCurrentUser && '(คุณ)'}
                      </span>
                    </div>

                    <div className="col-span-3 text-center text-slate-700 text-xs font-mono font-bold">
                      {item.stagesCompleted} / 10 ด่าน
                    </div>

                    <div className="col-span-2 text-right font-black text-amber-600 text-sm sm:text-base font-mono">
                      {item.totalPoints}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
