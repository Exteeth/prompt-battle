import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getLeaderboard } from '../lib/sessionStorage';
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

  const filteredLeaderboard = leaderboard.filter(item =>
    item.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  const handleShare = () => {
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
          onClick={() => navigate('/stages')}
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

        {/* 3D Podium Stand for Top 3 Champions */}
        {leaderboard.length > 0 && (
          <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4 pb-2">
            {/* 2nd Place Podium */}
            {top2 ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center text-slate-700 font-bold text-sm shadow-md mb-2">
                  <User size={20} />
                </div>
                <span className="text-xs font-bold text-slate-900 truncate max-w-[90px]">{top2.username}</span>
                <span className="text-[11px] text-amber-600 font-black font-mono">{top2.totalPoints} pts</span>
                <div className="w-20 sm:w-24 h-24 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl border-2 border-slate-300 flex flex-col items-center justify-center mt-2 shadow-md">
                  <Medal size={28} className="text-slate-500" />
                  <span className="text-xs font-black text-slate-600 font-mono mt-1">#2</span>
                </div>
              </div>
            ) : null}

            {/* 1st Place Podium */}
            {top1 ? (
              <div className="flex flex-col items-center -mt-6">
                <Crown size={24} className="text-amber-500 fill-amber-500 drop-shadow-md mb-1" />
                <div className="w-16 h-16 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-amber-800 font-bold text-base shadow-lg mb-2">
                  <User size={26} />
                </div>
                <span className="text-sm font-black text-slate-900 truncate max-w-[110px]">{top1.username}</span>
                <span className="text-xs text-amber-600 font-black font-mono">{top1.totalPoints} pts</span>
                <div className="w-24 sm:w-28 h-32 bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50 rounded-t-2xl border-2 border-amber-300 flex flex-col items-center justify-center mt-2 shadow-lg">
                  <Trophy size={36} className="text-amber-600" />
                  <span className="text-sm font-black text-amber-800 font-mono mt-1">#1 CHAMPION</span>
                </div>
              </div>
            ) : null}

            {/* 3rd Place Podium */}
            {top3 ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-600 flex items-center justify-center text-amber-800 font-bold text-sm shadow-md mb-2">
                  <User size={20} />
                </div>
                <span className="text-xs font-bold text-slate-900 truncate max-w-[90px]">{top3.username}</span>
                <span className="text-[11px] text-amber-600 font-black font-mono">{top3.totalPoints} pts</span>
                <div className="w-20 sm:w-24 h-20 bg-gradient-to-t from-amber-100 to-amber-50 rounded-t-2xl border-2 border-amber-300 flex flex-col items-center justify-center mt-2 shadow-md">
                  <Award size={28} className="text-amber-700" />
                  <span className="text-xs font-black text-amber-800 font-mono mt-1">#3</span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Search Student Input */}
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อผู้เล่นในห้อง..."
            className="w-full bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none transition-all shadow-xs"
          />
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
          {filteredLeaderboard.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              ไม่พบผู้เล่นที่คุณค้นหา
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 px-4 sm:px-6 py-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                <div className="col-span-2 text-center">อันดับ</div>
                <div className="col-span-5">ชื่อผู้เล่น</div>
                <div className="col-span-3 text-center">ด่านที่ผ่าน</div>
                <div className="col-span-2 text-right">คะแนนรวม</div>
              </div>

              {filteredLeaderboard.map((item, index) => {
                const rank = leaderboard.findIndex(l => l.userId === item.userId) + 1;
                const isCurrentUser = item.userId === user.userId;
                const avatarBg = isCurrentUser ? 'bg-blue-600' : 'bg-slate-200';
                const avatarText = isCurrentUser ? 'text-white' : 'text-slate-800';

                return (
                  <div
                    key={item.userId}
                    className={`grid grid-cols-12 px-4 sm:px-6 py-3.5 items-center text-xs sm:text-sm transition-all ${
                      isCurrentUser ? 'bg-blue-50 border-y border-blue-200 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="col-span-2 flex justify-center font-bold font-mono">
                      #{rank}
                    </div>

                    <div className="col-span-5 flex items-center gap-2.5 truncate">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarBg} ${avatarText}`}>
                        <User size={13} />
                      </div>
                      <span className={`truncate ${isCurrentUser ? 'text-blue-700 font-bold' : 'text-slate-900'}`}>
                        {item.username} {isCurrentUser && '(คุณ)'}
                      </span>
                    </div>

                    <div className="col-span-3 text-center text-slate-600 text-xs font-mono font-medium">
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
