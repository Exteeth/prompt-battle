import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getTeacherAnalytics, getStudentDetailedScores } from '../lib/sessionStorage';
import { STAGES_DATA } from '../data/stagesData';
import { Download, LogOut, Users, BarChart3, Sparkles, ChevronDown, ChevronUp, User, Award } from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  if (!user || user.role !== 'teacher') {
    navigate('/');
    return null;
  }

  const analytics = getTeacherAnalytics(user.roomCode);
  const studentDetailed = getStudentDetailedScores(user.roomCode);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rank,Student ID,Username,Stages Completed,Total Points,Stage Scores\n";

    studentDetailed.forEach((student, i) => {
      const stageScoreSummary = STAGES_DATA.map(s => {
        const scoreObj = student.stages[s.id];
        return `Stage ${s.stage_number}: ${scoreObj ? scoreObj.totalScore : 0}`;
      }).join(" | ");

      csvContent += `${i + 1},"${student.studentId || ''}","${student.username}",${student.stagesCompleted},${student.totalPoints},"${stageScoreSummary}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Prompt_Battle_Individual_Report_${user.roomCode}.csv`);
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
            className="w-9 h-9 object-contain"
          />
          <div>
            <span className="font-extrabold text-sm sm:text-base text-slate-900 block leading-tight">Teacher Admin Dashboard</span>
            <span className="text-xs text-slate-500">ห้องเรียน: <strong className="text-amber-700 font-mono">{user.roomCode}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportCSV}
            className="min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export รายงาน CSV รายคน</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors flex items-center justify-center cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 font-bold">
              <Users size={24} />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">จำนวนนักเรียนที่เข้าเล่น</span>
              <strong className="text-2xl font-black text-slate-900 font-mono">{studentDetailed.length} คน</strong>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 font-bold">
              <BarChart3 size={24} />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">ด่านที่มีการทำมากที่สุด</span>
              <strong className="text-2xl font-black text-slate-900 font-mono">Stage {analytics[0]?.stageNumber || '0.1'}</strong>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
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

        {/* Individual Student Scores Section (คะแนนเด็กแยกรายคน) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="text-blue-600" size={22} />
              <span>ตารางคะแนนนักเรียนแยกรายคน (Individual Student Scores)</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">รวม {studentDetailed.length} คน</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
            {studentDetailed.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                ยังไม่มีข้อมูลนักเรียนในห้องนี้ ให้ส่งรหัสห้อง <strong>{user.roomCode}</strong> แต่นักเรียนเพื่อเริ่มส่งงาน
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-12 px-4 sm:px-6 py-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <div className="col-span-1 text-center">อันดับ</div>
                  <div className="col-span-2">รหัสนักเรียน</div>
                  <div className="col-span-3">ชื่อนักเรียน</div>
                  <div className="col-span-2 text-center">ด่านที่ผ่าน</div>
                  <div className="col-span-2 text-right">คะแนนรวม</div>
                  <div className="col-span-2 text-center">รายละเอียด</div>
                </div>

                {studentDetailed.map((student, i) => {
                  const isExpanded = expandedStudentId === student.userId;

                  return (
                    <div key={student.userId} className="transition-all">
                      <div className="grid grid-cols-12 px-4 sm:px-6 py-4 items-center text-xs sm:text-sm hover:bg-slate-50/80">
                        <div className="col-span-1 text-center font-bold text-slate-500 font-mono">#{i + 1}</div>
                        
                        <div className="col-span-2 font-mono font-bold text-blue-700 truncate">
                          {student.studentId || '-'}
                        </div>

                        <div className="col-span-3 flex items-center gap-2 truncate">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            <User size={13} />
                          </div>
                          <span className="font-extrabold text-slate-900 truncate">{student.username}</span>
                        </div>

                        <div className="col-span-2 text-center text-slate-600 text-xs font-mono font-medium">
                          {student.stagesCompleted} / 10 ด่าน
                        </div>

                        <div className="col-span-2 text-right font-black text-amber-600 text-sm sm:text-base font-mono">
                          {student.totalPoints} pts
                        </div>

                        <div className="col-span-2 text-center">
                          <button
                            onClick={() => setExpandedStudentId(isExpanded ? null : student.userId)}
                            className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'ซ่อน' : 'ดูรายด่าน'}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Stage Breakdown for Student */}
                      {isExpanded && (
                        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-4 animate-slide-up">
                          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <Award size={16} className="text-blue-600" />
                            <span>คะแนนแยกรายด่านของ {student.username} (รหัส {student.studentId || '-'})</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {STAGES_DATA.map(st => {
                              const scoreObj = student.stages[st.id];

                              return (
                                <div
                                  key={st.id}
                                  className={`p-3 rounded-2xl border text-xs space-y-2 ${
                                    scoreObj
                                      ? 'bg-white border-blue-200 shadow-xs'
                                      : 'bg-slate-100 border-slate-200 opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-mono">
                                    <span className="font-bold text-slate-700">Stage {st.stage_number}</span>
                                    <span className={`font-black ${scoreObj ? 'text-amber-600' : 'text-slate-400'}`}>
                                      {scoreObj ? `${scoreObj.totalScore}/20` : 'ยังไม่เล่น'}
                                    </span>
                                  </div>

                                  {scoreObj && (
                                    <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                                      <div className="flex justify-between">
                                        <span>ความชัดเจน:</span>
                                        <strong className="text-blue-600">{scoreObj.scores.clarity}/5</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>ความครบถ้วน:</span>
                                        <strong className="text-blue-600">{scoreObj.scores.completeness}/5</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>เทคนิค:</span>
                                        <strong className="text-blue-600">{scoreObj.scores.technique}/5</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>คุณภาพ:</span>
                                        <strong className="text-blue-600">{scoreObj.scores.quality}/5</strong>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Analytics per Stage Table (ภาพรวมระดับด่าน) */}
        <section className="space-y-4 pt-4">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-amber-600" size={22} />
            <span>คะแนนเฉลี่ยภาพรวมระดับด่าน (Stage Overview)</span>
          </h2>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
            {analytics.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                ยังไม่มีข้อมูลการเล่นในห้องเรียนนี้
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
      </main>
    </div>
  );
}
