import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getTeacherAnalytics, getStudentDetailedScores } from '../lib/sessionStorage';
import { STAGES_DATA } from '../data/stagesData';
import { Download, LogOut, Users, BarChart3, Sparkles, ChevronDown, ChevronUp, User, Award, CheckCircle, ShieldCheck } from 'lucide-react';

import SpotlightCard from '../components/reactbits/SpotlightCard';
import ShinyText from '../components/reactbits/ShinyText';
import ParticlesBg from '../components/reactbits/ParticlesBg';

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
    <div className="min-h-[100dvh] bg-[#F5F3FA] text-[#1A1525] flex flex-col font-prompt relative overflow-hidden">
      {/* Particles */}
      <ParticlesBg color="0, 184, 148" quantity={30} staticity={30} />

      {/* Glass Header */}
      <nav className="h-16 border-b border-black/5 px-3 sm:px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20 shadow-xs">
        <div className="flex items-center gap-2.5">
          <motion.img
            whileHover={{ scale: 1.08 }}
            src="/assets/logo.webp"
            alt="Prompt Battle"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
          />
          <div>
            <span className="font-extrabold text-xs sm:text-base text-[#1A1525] block leading-tight font-kanit">Teacher Admin Dashboard</span>
            <span className="text-[10px] sm:text-xs text-[#8E85A2]">ห้องเรียน: <strong className="text-[#047857] font-mono">{user.roomCode}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExportCSV}
            className="btn-glass-mint min-h-[44px] px-3 sm:px-4 py-2 font-black text-xs flex items-center gap-1.5 cursor-pointer font-kanit shadow-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export รายงาน CSV</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="min-h-[44px] min-w-[44px] p-2 text-[#8E85A2] hover:text-[#1A1525] hover:bg-white/60 rounded-2xl transition-colors flex items-center justify-center cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 relative z-10 font-prompt">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <SpotlightCard spotlightColor="rgba(124, 58, 237, 0.12)" className="p-4 sm:p-5 bg-white/70 border border-white/60 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/[0.10] border border-[#7C3AED]/[0.20] flex items-center justify-center text-[#6D28D9] shrink-0 font-bold shadow-xs">
              <Users size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#5C526E] block">จำนวนนักเรียนที่เข้าเล่น</span>
              <strong className="text-xl sm:text-2xl font-black text-[#1A1525] font-mono">{studentDetailed.length} คน</strong>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.12)" className="p-4 sm:p-5 bg-white/70 border border-white/60 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/[0.10] border border-[#F59E0B]/[0.20] flex items-center justify-center text-[#92400E] shrink-0 font-bold shadow-xs">
              <BarChart3 size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#5C526E] block">ด่านที่มีการทำมากที่สุด</span>
              <strong className="text-xl sm:text-2xl font-black text-[#1A1525] font-mono">Stage {analytics[0]?.stageNumber || '0.1'}</strong>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(0, 184, 148, 0.12)" className="p-4 sm:p-5 bg-white/70 border border-white/60 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00B894]/[0.10] border border-[#00B894]/[0.20] flex items-center justify-center text-[#047857] shrink-0 font-bold shadow-xs">
              <Sparkles size={24} className="text-[#00B894] animate-spin-slow" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#5C526E] block">คะแนนเฉลี่ยรวมทั้งห้อง</span>
              <strong className="text-xl sm:text-2xl font-black text-[#047857] font-mono">
                {analytics.length > 0 
                  ? (analytics.reduce((acc, curr) => acc + parseFloat(curr.avgTotalScore), 0) / analytics.length).toFixed(1) 
                  : '0.0'} / 20
              </strong>
            </div>
          </SpotlightCard>
        </div>

        {/* Individual Student Scores Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-[#1A1525] flex items-center gap-2 font-kanit">
              <ShieldCheck className="text-[#00B894]" size={22} />
              <span>ตารางคะแนนนักเรียนแยกรายคน (Individual Student Scores)</span>
            </h2>
            <span className="text-xs text-[#8E85A2] font-mono font-bold">รวม {studentDetailed.length} คน</span>
          </div>

          <SpotlightCard spotlightColor="rgba(0, 184, 148, 0.12)" className="bg-white/80 border border-white/60 shadow-xl overflow-hidden font-prompt">
            {studentDetailed.length === 0 ? (
              <div className="p-12 text-center text-[#8E85A2] text-sm">
                ยังไม่มีข้อมูลนักเรียนในห้องนี้ ให้ส่งรหัสห้อง <strong className="text-[#6D28D9] font-mono">{user.roomCode}</strong> ให้นักเรียนเพื่อเริ่มส่งงาน
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {/* Header */}
                <div className="grid grid-cols-12 px-4 py-3 bg-black/[0.02] text-xs font-black text-[#047857] uppercase tracking-wider font-mono border-b border-black/5">
                  <div className="col-span-2 sm:col-span-1 text-center">อันดับ</div>
                  <div className="col-span-5 sm:col-span-5">นักเรียน</div>
                  <div className="hidden sm:block sm:col-span-2 text-center">ด่านที่ผ่าน</div>
                  <div className="col-span-3 sm:col-span-2 text-right">คะแนนรวม</div>
                  <div className="col-span-2 sm:col-span-2 text-center">รายละเอียด</div>
                </div>

                {/* Rows */}
                {studentDetailed.map((student, i) => {
                  const isExpanded = expandedStudentId === student.userId;

                  return (
                    <div key={student.userId} className="transition-all">
                      <div className="grid grid-cols-12 px-4 py-3.5 items-center text-xs sm:text-sm hover:bg-white/90">
                        <div className="col-span-2 sm:col-span-1 text-center font-bold text-[#8E85A2] font-mono">#{i + 1}</div>

                        <div className="col-span-5 sm:col-span-5 flex items-center gap-2.5 truncate">
                          <div className="w-7 h-7 rounded-full bg-[#00B894] text-white font-bold flex items-center justify-center text-xs shrink-0">
                            <User size={13} />
                          </div>
                          <div className="truncate min-w-0">
                            <span className="font-bold text-[#1A1525] truncate block font-kanit">{student.username}</span>
                            {student.studentId && (
                              <span className="text-[10px] text-[#8E85A2] font-mono block">ID: {student.studentId}</span>
                            )}
                          </div>
                        </div>

                        <div className="hidden sm:block sm:col-span-2 text-center text-[#5C526E] text-xs font-mono">
                          {student.stagesCompleted} / 10 ด่าน
                        </div>

                        <div className="col-span-3 sm:col-span-2 text-right font-mono font-black text-[#047857] text-sm sm:text-base">
                          {student.totalPoints} <span className="text-[10px] text-[#8E85A2] font-normal">pts</span>
                        </div>

                        <div className="col-span-2 sm:col-span-2 text-center">
                          <button
                            onClick={() => setExpandedStudentId(isExpanded ? null : student.userId)}
                            className="px-2.5 py-1 rounded-xl bg-[#00B894]/[0.10] border border-[#00B894]/[0.20] text-[#047857] hover:bg-[#00B894]/[0.18] text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span className="hidden sm:inline">{isExpanded ? 'ซ่อน' : 'ดูรายด่าน'}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Stage Breakdown */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 sm:p-5 bg-black/[0.02] border-t border-black/5 space-y-3"
                          >
                            <h4 className="text-xs font-extrabold text-[#1A1525] uppercase tracking-wider font-mono flex items-center gap-1.5">
                              <Award size={16} className="text-[#7C3AED]" />
                              <span>คะแนนแยกรายด่านของ {student.username} (ID: {student.studentId || '-'})</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                              {STAGES_DATA.map(st => {
                                const scoreObj = student.stages[st.id];
                                const isPassed = scoreObj && scoreObj.totalScore >= 12;

                                return (
                                  <div
                                    key={st.id}
                                    className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                                      isPassed
                                        ? 'bg-white border-[#00B894]/30 shadow-xs'
                                        : 'bg-white/50 border-black/5 opacity-70'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between font-mono">
                                      <span className="text-[11px] font-bold text-[#6D28D9]">STAGE {st.stage_number}</span>
                                      {isPassed && <CheckCircle size={14} className="text-[#00B894]" />}
                                    </div>
                                    <h5 className="font-bold text-[#1A1525] line-clamp-1 font-kanit text-[11px]">{st.title}</h5>
                                    <div className="font-mono font-extrabold text-[#047857]">
                                      {scoreObj ? `${scoreObj.totalScore}/20 PTS` : 'ยังไม่ได้เล่น'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </SpotlightCard>
        </section>
      </main>
    </div>
  );
}
