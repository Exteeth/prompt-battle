import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getTeacherAnalytics, getLeaderboard } from '../lib/sessionStorage';
import { ShieldCheck, Download, LogOut, Users, BarChart3, Sparkles } from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user || user.role !== 'teacher') {
    navigate('/');
    return null;
  }

  const analytics = getTeacherAnalytics(user.roomCode);
  const leaderboard = getLeaderboard(user.roomCode);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rank,Username,Stages Completed,Total Points\n";

    leaderboard.forEach((row, i) => {
      csvContent += `${i + 1},"${row.username}",${row.stagesCompleted},${row.totalPoints}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Prompt_Battle_Report_${user.roomCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col font-prompt">
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle"
            className="w-9 h-9 rounded-xl border border-amber-200 object-cover"
          />
          <div>
            <span className="font-bold text-sm sm:text-base text-slate-900 block leading-tight">Teacher Admin Dashboard</span>
            <span className="text-xs text-slate-500">ห้องเรียน: <strong className="text-amber-700 font-mono">{user.roomCode}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportCSV}
            className="min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export รายงาน CSV</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Users size={24} />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">จำนวนนักเรียนที่เข้าเล่น</span>
              <strong className="text-2xl font-black text-slate-900 font-mono">{leaderboard.length} คน</strong>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <BarChart3 size={24} />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">ด่านที่มีการทำมากที่สุด</span>
              <strong className="text-2xl font-black text-slate-900 font-mono">Stage {analytics[0]?.stageNumber || '0.1'}</strong>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">คะแนนเฉลี่ยรวมทั้งห้อง</span>
              <strong className="text-2xl font-black text-blue-600 font-mono">
                {analytics.length > 0 
                  ? (analytics.reduce((acc, curr) => acc + parseFloat(curr.avgTotalScore), 0) / analytics.length).toFixed(1) 
                  : '0.0'} / 20
              </strong>
            </div>
          </div>
        </div>

        {/* Analytics per Stage Table */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-amber-600" size={20} />
            <span>คะแนนเฉลี่ยแยกตามเกณฑ์ 4 ด้าน แต่ละด่าน (ภาพรวมชั้นเรียน)</span>
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            {analytics.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                ยังไม่มีข้อมูลการเล่นในห้องเรียนนี้ ให้ส่งรหัสห้อง {user.roomCode} แต่นักเรียนเพื่อเริ่มทดสอบ
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <div className="grid grid-cols-12 min-w-[600px] px-6 py-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <div className="col-span-3">ด่าน</div>
                  <div className="col-span-2 text-center">นักเรียนที่เล่น</div>
                  <div className="col-span-2 text-center">ความชัดเจน</div>
                  <div className="col-span-2 text-center">ความครบถ้วน</div>
                  <div className="col-span-2 text-center">เทคนิค</div>
                  <div className="col-span-1 text-right">เฉลี่ยรวม</div>
                </div>

                {analytics.map((row) => (
                  <div key={row.stageId} className="grid grid-cols-12 min-w-[600px] px-6 py-4 items-center text-xs sm:text-sm hover:bg-slate-50">
                    <div className="col-span-3 font-semibold text-slate-900 font-mono">
                      Stage {row.stageNumber}
                    </div>
                    <div className="col-span-2 text-center text-slate-700 font-mono">{row.studentCount} คน</div>
                    <div className="col-span-2 text-center text-emerald-600 font-bold font-mono">{row.avgClarity}</div>
                    <div className="col-span-2 text-center text-blue-600 font-bold font-mono">{row.avgCompleteness}</div>
                    <div className="col-span-2 text-center text-amber-600 font-bold font-mono">{row.avgTechnique}</div>
                    <div className="col-span-1 text-right font-black text-amber-700 font-mono">{row.avgTotalScore}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Student Ranking Overview */}
        <section className="space-y-4 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            <span>ตารางคะแนนสรุปของนักเรียนในห้อง</span>
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 px-4 sm:px-6 py-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                <div className="col-span-2 text-center">อันดับ</div>
                <div className="col-span-6">ชื่อนักเรียน</div>
                <div className="col-span-2 text-center">ด่านที่เล่นจบ</div>
                <div className="col-span-2 text-right">คะแนนรวม</div>
              </div>

              {leaderboard.map((student, i) => (
                <div key={student.userId} className="grid grid-cols-12 px-4 sm:px-6 py-3.5 items-center text-xs sm:text-sm">
                  <div className="col-span-2 text-center font-bold text-slate-500 font-mono">#{i + 1}</div>
                  <div className="col-span-6 font-semibold text-slate-900">{student.username}</div>
                  <div className="col-span-2 text-center text-slate-600 text-xs font-mono">{student.stagesCompleted} ด่าน</div>
                  <div className="col-span-2 text-right font-bold text-blue-600 font-mono">{student.totalPoints}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
