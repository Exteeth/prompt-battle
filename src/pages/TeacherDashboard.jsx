import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getTeacherAnalytics, getStudentDetailedScores, getAllRooms, createRoom, deleteRoom, getRoomEvaluationAnalytics } from '../lib/sessionStorage';
import { STAGES_DATA } from '../data/stagesData';
import { Download, LogOut, Users, BarChart3, Sparkles, ChevronDown, ChevronUp, User, Award, CheckCircle, ShieldCheck, Plus, X, School, KeyRound, Check, Trash2, Star, MessageSquare, PieChart } from 'lucide-react';

import SpotlightCard from '../components/reactbits/SpotlightCard';
import ShinyText from '../components/reactbits/ShinyText';
import ParticlesBg from '../components/reactbits/ParticlesBg';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout, loginTeacher } = useAuth();
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // Room Management State
  const [roomsList, setRoomsList] = useState(() => getAllRooms());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomCode, setNewRoomCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newTeacherPin, setNewTeacherPin] = useState('1234');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Evaluation Survey State
  const [evalData, setEvalData] = useState({
    totalEvaluations: 0,
    overallAvg: '0.00',
    categoryAvg: { cat1: '0.00', cat2: '0.00', cat3: '0.00', cat4: '0.00' },
    itemAvg: {},
    commentsList: []
  });
  const [showItemDetails, setShowItemDetails] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (user && user.roomCode) {
      getRoomEvaluationAnalytics(user.roomCode).then(data => {
        if (isMounted && data) setEvalData(data);
      });
    }
    return () => { isMounted = false; };
  }, [user?.roomCode]);

  if (!user || user.role !== 'teacher') {
    navigate('/');
    return null;
  }

  const analytics = getTeacherAnalytics(user.roomCode);
  const studentDetailed = getStudentDetailedScores(user.roomCode);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    try {
      const created = await createRoom(newRoomCode, newRoomName, newTeacherPin);
      if (created) {
        setRoomsList(getAllRooms());
        setCreateSuccess(`สร้างห้องเรียน "${created.code}" (${created.name}) สำเร็จแล้ว!`);
        setNewRoomCode('');
        setNewRoomName('');
        setNewTeacherPin('1234');
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setCreateSuccess('');
        }, 1500);
      }
    } catch (err) {
      setCreateError(err.message);
    }
  };

  const handleDeleteRoom = async (roomCode, roomName) => {
    if (roomCode === user.roomCode) {
      alert(`คุณกำลังใช้งานห้องเรียน "${roomCode}" อยู่ กรุณาสลับไปห้องอื่นก่อนทำการลบ`);
      return;
    }
    const confirmed = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบห้องเรียน "${roomCode}" (${roomName})?\n\n⚠️ ประวัติการส่งงานและคะแนนของนักเรียนในห้องนี้ทั้งหมดจะถูกลบออกถาวร`);
    if (!confirmed) return;

    try {
      await deleteRoom(roomCode);
      const updatedRooms = getAllRooms();
      setRoomsList(updatedRooms);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    let csvString = "\uFEFF"; // UTF-8 Byte Order Mark (BOM) for Thai Windows Excel
    csvString += "Rank,Student ID,Username,Stages Completed,Total Points,Stage Scores\n";

    studentDetailed.forEach((student, i) => {
      const stageScoreSummary = STAGES_DATA.map(s => {
        const scoreObj = student.stages[s.id];
        return `Stage ${s.stage_number}: ${scoreObj ? scoreObj.totalScore : 0}`;
      }).join(" | ");

      csvString += `${i + 1},"${student.studentId || ''}","${student.username}",${student.stagesCompleted},${student.totalPoints},"${stageScoreSummary}"\n`;
    });

    // Append Satisfaction Survey Summary to CSV
    csvString += "\n\n=== STUDENT SATISFACTION SURVEY REPORT ===\n";
    csvString += `Total Evaluations Submitted,${evalData.totalEvaluations}\n`;
    csvString += `Overall Average Satisfaction Score (out of 5.00),${evalData.overallAvg}\n`;
    csvString += `Category 1 (Learning Content & Tasks),${evalData.categoryAvg.cat1}\n`;
    csvString += `Category 2 (Game Design & Usability),${evalData.categoryAvg.cat2}\n`;
    csvString += `Category 3 (Evaluation & AI Feedback),${evalData.categoryAvg.cat3}\n`;
    csvString += `Category 4 (Perceived Benefits),${evalData.categoryAvg.cat4}\n\n`;

    csvString += "Student Individual Evaluation List\n";
    csvString += "Student ID,Username,Average Rating (out of 5.00),Comment/Suggestion,Date Submitted\n";
    (evalData.studentEvaluations || evalData.commentsList || []).forEach(c => {
      const commentText = c.comments && c.comments.trim() ? c.comments.replace(/"/g, '""') : '(ไม่ได้ระบุข้อเสนอแนะเพิ่มเติม)';
      csvString += `"${c.studentId || ''}","${c.username}",${c.studentAvg},"${commentText}","${c.createdAt}"\n`;
    });

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Prompt_Battle_Full_Report_${user.roomCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <span className="text-[10px] sm:text-xs text-[#8E85A2]">ห้องเรียนปัจจุบัน: <strong className="text-[#047857] font-mono">{user.roomCode}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setCreateError('');
              setCreateSuccess('');
              setIsCreateModalOpen(true);
            }}
            className="btn-glass-violet min-h-[44px] px-3 sm:px-4 py-2 font-black text-xs flex items-center gap-1.5 cursor-pointer font-kanit shadow-sm"
          >
            <Plus size={16} />
            <span>สร้างห้องเรียนเพิ่ม</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExportCSV}
            className="btn-glass-mint min-h-[44px] px-3 sm:px-4 py-2 font-black text-xs flex items-center gap-1.5 cursor-pointer font-kanit shadow-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
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

        {/* Student Satisfaction Survey Analytics Section */}
        <section className="space-y-6 pt-8 mt-8 border-t border-black/10 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
            <h2 className="text-base sm:text-xl font-black text-[#1A1525] flex items-center gap-2.5 font-kanit">
              <Star className="text-[#7C3AED] fill-[#7C3AED]" size={24} />
              <span>สรุปผลแบบประเมินความพึงพอใจของนักเรียน (Satisfaction Survey)</span>
            </h2>
            <span className="text-xs text-[#8E85A2] font-mono font-bold bg-[#7C3AED]/5 px-3 py-1 rounded-full border border-[#7C3AED]/10 w-fit">
              ตอบแล้ว {evalData.totalEvaluations} คน
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <SpotlightCard spotlightColor="rgba(124, 58, 237, 0.15)" className="p-5 bg-white/90 border border-white/80 shadow-md">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#5C526E] block font-kanit">คะแนนเฉลี่ยรวมภาพรวม</span>
                <div className="flex items-baseline gap-1.5">
                  <strong className="text-3xl font-black text-[#7C3AED] font-mono">{evalData.overallAvg}</strong>
                  <span className="text-xs text-[#8E85A2] font-mono">/ 5.00</span>
                </div>
                <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${(parseFloat(evalData.overallAvg) / 5) * 100}%` }} />
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(0, 184, 148, 0.15)" className="p-5 bg-white/90 border border-white/80 shadow-md">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#5C526E] block font-kanit">1. ด้านเนื้อหา & กิจกรรม</span>
                <div className="flex items-baseline gap-1.5">
                  <strong className="text-2xl font-black text-[#047857] font-mono">{evalData.categoryAvg.cat1}</strong>
                  <span className="text-xs text-[#8E85A2] font-mono">/ 5.00</span>
                </div>
                <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-[#00B894] rounded-full" style={{ width: `${(parseFloat(evalData.categoryAvg.cat1) / 5) * 100}%` }} />
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(9, 132, 227, 0.15)" className="p-5 bg-white/90 border border-white/80 shadow-md">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#5C526E] block font-kanit">2. ด้านการออกแบบ & การใช้งาน</span>
                <div className="flex items-baseline gap-1.5">
                  <strong className="text-2xl font-black text-[#0984E3] font-mono">{evalData.categoryAvg.cat2}</strong>
                  <span className="text-xs text-[#8E85A2] font-mono">/ 5.00</span>
                </div>
                <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-[#0984E3] rounded-full" style={{ width: `${(parseFloat(evalData.categoryAvg.cat2) / 5) * 100}%` }} />
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(225, 112, 85, 0.15)" className="p-5 bg-white/90 border border-white/80 shadow-md">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#5C526E] block font-kanit">3 & 4. ด้าน Feedback & ประโยชน์</span>
                <div className="flex items-baseline gap-1.5">
                  <strong className="text-2xl font-black text-[#E17055] font-mono">{evalData.categoryAvg.cat4}</strong>
                  <span className="text-xs text-[#8E85A2] font-mono">/ 5.00</span>
                </div>
                <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-[#E17055] rounded-full" style={{ width: `${(parseFloat(evalData.categoryAvg.cat4) / 5) * 100}%` }} />
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Detailed Item Breakdown Card */}
          <SpotlightCard spotlightColor="rgba(124, 58, 237, 0.12)" className="bg-white/90 border border-white/80 shadow-lg p-6 space-y-5 my-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 pb-4 gap-3">
              <div className="flex items-center gap-2.5">
                <PieChart size={20} className="text-[#7C3AED]" />
                <h3 className="font-extrabold text-base sm:text-lg text-[#1A1525] font-kanit">
                  คะแนนเฉลี่ยโดยละเอียดจำแนกทั้ง 12 รายการประเมิน
                </h3>
              </div>
              <button
                onClick={() => setShowItemDetails(!showItemDetails)}
                className="px-4 py-2 rounded-xl bg-[#7C3AED]/10 text-[#6D28D9] text-xs font-bold hover:bg-[#7C3AED]/20 transition-all cursor-pointer shadow-2xs w-fit"
              >
                {showItemDetails ? 'ซ่อนรายละเอียด' : 'ดูรายข้อ ทั้งหมด (12 ข้อ)'}
              </button>
            </div>

            {showItemDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[
                  { id: '1.1', label: '1.1 ความเหมาะสมเนื้อหาเขียนสั่ง AI (Prompt Engineering)' },
                  { id: '1.2', label: '1.2 ความหลากหลายน่าสนใจของสถานการณ์/ภารกิจ' },
                  { id: '1.3', label: '1.3 ความเหมาะสมของความยากง่ายในกิจกรรมเรียนรู้' },
                  { id: '2.1', label: '2.1 ความสวยงามกราฟิก การออกแบบ และสีสัน' },
                  { id: '2.2', label: '2.2 ความสะดวกและง่ายในการจัดวางปุ่ม/เปลี่ยนหน้า' },
                  { id: '2.3', label: '2.3 การดึงดูดความสนใจและความสนุกในการเล่น' },
                  { id: '3.1', label: '3.1 ความชัดเจนของเกณฑ์ประเมิน (Rubric)' },
                  { id: '3.2', label: '3.2 ความรวดเร็วและชัดเจนของ AI Feedback' },
                  { id: '3.3', label: '3.3 ความเหมาะสมและความยุติธรรมของการให้คะแนน' },
                  { id: '4.1', label: '4.1 ช่วยพัฒนาทักษะ Prompt Engineering ให้ดีขึ้น' },
                  { id: '4.2', label: '4.2 ช่วยให้เข้าใจการกำหนดบทบาท/บริบท/เงื่อนไข' },
                  { id: '4.3', label: '4.3 สามารถนำความรู้และทักษะไปประยุกต์ใช้ได้จริง' },
                ].map(item => {
                  const score = evalData.itemAvg ? (evalData.itemAvg[item.id] || '0.00') : '0.00';
                  const pct = (parseFloat(score) / 5) * 100;

                  return (
                    <div key={item.id} className="p-3.5 bg-black/[0.015] rounded-2xl border border-black/5 space-y-2 text-xs">
                      <div className="flex justify-between items-start gap-3">
                        <span className="font-bold text-[#1A1525] font-prompt leading-snug">{item.label}</span>
                        <strong className="font-mono font-black text-[#6D28D9] shrink-0 text-sm px-2 py-0.5 rounded-lg bg-[#7C3AED]/10">{score}</strong>
                      </div>
                      <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#00B894] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SpotlightCard>

          {/* All Student Evaluations List */}
          <SpotlightCard spotlightColor="rgba(0, 184, 148, 0.12)" className="bg-white/90 border border-white/80 shadow-lg p-6 space-y-5 my-6 font-prompt">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-2.5">
                <Users size={20} className="text-[#00B894]" />
                <h3 className="font-extrabold text-base sm:text-lg text-[#1A1525] font-kanit">
                  รายชื่อและรายละเอียดผลการประเมินเรียงตามนักเรียนที่ส่ง ({(evalData.studentEvaluations || evalData.commentsList || []).length} คน)
                </h3>
              </div>
              <span className="text-xs text-[#8E85A2] font-mono font-bold">
                ประเมินแล้ว {(evalData.studentEvaluations || evalData.commentsList || []).length}/{analytics.totalStudents} คน
              </span>
            </div>

            {(evalData.studentEvaluations || evalData.commentsList || []).length === 0 ? (
              <div className="p-10 text-center text-[#8E85A2] text-xs sm:text-sm">
                ยังไม่มีนักเรียนส่งแบบประเมินความพึงพอใจในขณะนี้
              </div>
            ) : (
              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-2">
                {(evalData.studentEvaluations || evalData.commentsList || []).map((c, i) => (
                  <div key={i} className="p-4 bg-black/[0.015] rounded-2xl border border-black/5 space-y-2 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#5C526E]">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs text-[#8E85A2]">#{i + 1}</span>
                        <strong className="font-kanit text-[#1A1525] text-sm sm:text-base">{c.username}</strong>
                        {c.studentId && <span className="font-mono text-xs text-[#8E85A2]">ID: {c.studentId}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#047857] font-extrabold bg-[#00B894]/10 border border-[#00B894]/20 px-3 py-0.5 rounded-full">
                          คะแนนเฉลี่ย: {c.studentAvg} / 5.00
                        </span>
                      </div>
                    </div>

                    {/* Student Comment / Suggestion */}
                    <div className="pt-1">
                      {c.comments && c.comments.trim().length > 0 ? (
                        <p className="text-[#1A1525] font-medium leading-relaxed bg-white p-3 rounded-xl border border-black/5 shadow-2xs">
                          💬 "{c.comments}"
                        </p>
                      ) : (
                        <p className="text-[#8E85A2] italic text-xs font-normal bg-black/[0.01] p-2.5 rounded-xl border border-dashed border-black/10">
                          (ไม่ได้ระบุข้อเสนอแนะเพิ่มเติม)
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>
        </section>
      </main>

      {/* Create Room Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/60 space-y-5 font-prompt relative"
            >
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="flex items-center gap-2 text-[#7C3AED]">
                  <School size={22} />
                  <h3 className="font-extrabold text-lg text-[#1A1525] font-kanit">สร้างห้องเรียนใหม่ (Create Room)</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#8E85A2] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {createError && (
                <div className="p-3 bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-[#B91C1C] rounded-2xl text-xs font-bold font-prompt">
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="p-3 bg-[#00B894]/10 border border-[#00B894]/20 text-[#047857] rounded-2xl text-xs font-bold font-prompt flex items-center gap-2">
                  <Check size={16} />
                  <span>{createSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#6D28D9] block mb-1 flex items-center gap-1 font-kanit">
                    <KeyRound size={14} />
                    รหัสห้องเรียน (Class Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomCode}
                    onChange={(e) => setNewRoomCode(e.target.value.toUpperCase())}
                    placeholder="เช่น PROMPT-102 หรือ AI-202"
                    className="glass-input font-mono tracking-wider uppercase min-h-[46px]"
                  />
                  <span className="text-[10px] text-[#8E85A2] block mt-1">ใช้อักษรภาษาอังกฤษและตัวเลข (เช่น PROMPT-102)</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#6D28D9] block mb-1 flex items-center gap-1 font-kanit">
                    <School size={14} />
                    ชื่อห้องเรียน (Classroom Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="เช่น วิชา AI & Prompt Engineering ม.2/2"
                    className="glass-input min-h-[46px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#6D28D9] block mb-1 flex items-center gap-1 font-kanit">
                    <KeyRound size={14} />
                    รหัส PIN ของครู (Teacher PIN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacherPin}
                    onChange={(e) => setNewTeacherPin(e.target.value)}
                    placeholder="เช่น 1234 (อย่างน้อย 4 หลัก)"
                    className="glass-input font-mono min-h-[46px]"
                  />
                  <span className="text-[10px] text-[#8E85A2] block mt-1">ใช้สำหรับเข้าสู่ระบบในฐานะครูผู้สอนประจำห้องนี้</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-black/10 hover:bg-black/5 text-[#5C526E] transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="btn-glass-violet px-5 py-2.5 text-xs font-black flex items-center gap-1.5 cursor-pointer font-kanit shadow-sm"
                  >
                    <Plus size={16} />
                    <span>ยืนยันสร้างห้องเรียน</span>
                  </button>
                </div>
              </form>

              {/* List of Existing Rooms */}
              <div className="pt-3 border-t border-black/5 space-y-2">
                <span className="text-xs font-bold text-[#5C526E] block font-kanit">ห้องเรียนที่มีทั้งหมด ({roomsList.length}):</span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {roomsList.map(r => (
                    <div key={r.code} className="p-2.5 bg-black/[0.03] rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="font-mono text-[#6D28D9] block">{r.code}</strong>
                        <span className="text-[11px] text-[#5C526E]">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {r.code === user.roomCode ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#00B894]/20 text-[#047857] text-[10px] font-bold">ห้องกำลังใช้งาน</span>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await loginTeacher(r.code, r.teacher_pin);
                                window.location.reload();
                              } catch (err) {
                                alert(err.message);
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-white border border-black/10 text-[11px] font-bold text-[#6D28D9] hover:bg-[#6D28D9]/10 cursor-pointer"
                          >
                            สลับไปห้องนี้
                          </button>
                        )}

                        {roomsList.length > 1 && (
                          <button
                            onClick={() => handleDeleteRoom(r.code, r.name)}
                            disabled={r.code === user.roomCode}
                            className={`p-1.5 rounded-xl transition-colors ${
                              r.code === user.roomCode
                                ? 'text-[#8E85A2]/30 cursor-not-allowed'
                                : 'text-[#FF6B6B] hover:bg-[#FF6B6B]/10 cursor-pointer'
                            }`}
                            title={r.code === user.roomCode ? 'ไม่สามารถลบห้องที่กำลังใช้งานอยู่ได้' : 'ลบห้องเรียน'}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
