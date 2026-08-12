import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { playPopSound, playMascotBlipSound } from '../lib/soundEffects';
import { Sparkles, ShieldCheck, GraduationCap, KeyRound, UserCheck, Lock, RefreshCw, Zap, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';

import SpotlightCard from '../components/reactbits/SpotlightCard';
import SplitText from '../components/reactbits/SplitText';
import BlurText from '../components/reactbits/BlurText';
import ShinyText from '../components/reactbits/ShinyText';
import Magnet from '../components/reactbits/Magnet';
import StarBorder from '../components/reactbits/StarBorder';
import ParticlesBg from '../components/reactbits/ParticlesBg';

export default function Home() {
  const navigate = useNavigate();
  const { loginStudent, loginTeacher } = useAuth();

  const [tab, setTab] = useState('student');
  const [roomCode, setRoomCode] = useState('PROMPT-101');
  const [studentId, setStudentId] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ─── Mascot messages ───
  const mascotMessages = [
    'สวัสดีครับ! ผม Promptie ครู AI พร้อมพานักเรียนมาสนุกกับการเรียนสั่ง AI แล้วครับ! 🤖✨',
    'รู้ไหม? กรอกรหัสนักเรียนเดิม จะกู้คืนคะแนนและประวัติการเล่นเดิมได้ 100% เลยนะ! 💡',
    'ลุยด่านแข่งขันเพื่อประลองทักษะและเก็บสะสมคะแนน 20 เต็มกันเลย! ⭐️',
    'คลิกตัวผมเพื่อเปลี่ยนเทคนิค Prompt พิเศษได้เรื่อยๆ เลยนะครับ! 🚀',
  ];

  const [mascotIndex, setMascotIndex] = useState(0);
  const [isChangingMsg, setIsChangingMsg] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      triggerNextMascotMessage();
    }, 4500);
    return () => clearInterval(timer);
  }, [mascotIndex]);

  const triggerNextMascotMessage = () => {
    playMascotBlipSound();
    setIsChangingMsg(true);
    setTimeout(() => {
      setMascotIndex((prev) => (prev + 1) % mascotMessages.length);
      setIsChangingMsg(false);
    }, 150);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      playPopSound();
      await loginStudent(roomCode, studentId, username);
      navigate('/stages');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      playPopSound();
      loginTeacher(roomCode, pin);
      navigate('/teacher');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F3FA] text-[#1A1525] flex flex-col relative overflow-hidden font-prompt">
      {/* ─── Animated Morphing Orbs ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="orb-violet" style={{ top: '-10%', left: '-5%' }} />
        <div className="orb-mint" style={{ top: '35%', right: '-8%' }} />
        <div className="orb-coral" style={{ bottom: '-10%', left: '25%' }} />
      </div>

      {/* ─── ReactBits Floating Particles ─── */}
      <ParticlesBg color="124, 58, 237" quantity={45} staticity={25} />

      {/* ─── Glass Navigation ─── */}
      <header className="glass-nav h-16 px-4 sm:px-8 flex items-center justify-between w-full z-20 sticky top-0 backdrop-blur-xl border-b border-black/5">
        <div className="flex items-center gap-3">
          <motion.img
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
            className="w-10 h-10 object-contain drop-shadow-md cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-1.5 font-kanit text-[#1A1525]">
              Prompt Battle
              <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
            </span>
            <ShinyText
              text="AI PROMPT ENGINEERING WORKSPACE"
              className="text-[10px] text-[#8E85A2] font-mono tracking-wider uppercase font-semibold"
              speed={4}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            playPopSound();
            setTab(tab === 'student' ? 'teacher' : 'student');
            setError('');
          }}
          className="min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold btn-glass-violet flex items-center gap-2 cursor-pointer shadow-sm border border-[#7C3AED]/20"
        >
          {tab === 'student' ? (
            <>
              <ShieldCheck size={16} className="text-[#7C3AED]" />
              <span>สลับไปโหมดครูผู้สอน</span>
            </>
          ) : (
            <>
              <GraduationCap size={16} className="text-[#00B894]" />
              <span>สลับไปโหมดนักเรียน</span>
            </>
          )}
        </motion.button>
      </header>

      {/* ─── Main Hero ─── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 z-10 font-prompt">
        {/* ─── LEFT: Mascot + Headline ─── */}
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
          {/* Mascot Speech Area */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
            {/* Magnetic ReactBits Mascot */}
            <Magnet magnetStrength={0.25} padding={120}>
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={triggerNextMascotMessage}
                title="กดที่ตัว Promptie เพื่อฟังคำแนะนำใหม่!"
              >
                {/* Glow halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/35 to-[#00B894]/30 rounded-full blur-2xl opacity-75 animate-pulse pointer-events-none" />

                <motion.img
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  src="/assets/mascot.webp"
                  alt="Promptie Mascot"
                  className="w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-xl relative z-10 animate-mascot-pulse"
                />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold shadow-lg flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  <RefreshCw size={10} className="animate-spin" />
                  แตะที่ผมสิ!
                </span>
              </div>
            </Magnet>

            {/* Speech bubble with ReactBits Spotlight */}
            <SpotlightCard
              spotlightColor="rgba(124, 58, 237, 0.15)"
              className="flex-1 p-4 text-left border border-black/5 bg-white/70"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00B894]" />
                  <span className="text-[11px] font-mono font-bold text-[#6D28D9] uppercase tracking-wider">
                    PROMPTIE AI TUTOR
                  </span>
                </div>
                <div className="min-h-[48px] flex items-center">
                  {!isChangingMsg && (
                    <BlurText
                      text={mascotMessages[mascotIndex]}
                      className="text-xs sm:text-sm text-[#1A1525] font-bold leading-relaxed"
                      delay={0.02}
                    />
                  )}
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-1 pt-2 border-t border-black/5">
                  {mascotMessages.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === mascotIndex ? 'w-5 bg-[#7C3AED]' : 'w-1.5 bg-black/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Hero Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/[0.08] border border-[#7C3AED]/[0.15] text-[#6D28D9] text-xs font-bold font-mono">
              <Zap size={13} className="fill-[#7C3AED] text-[#7C3AED]" />
              <ShinyText text="POWERED BY REACTBITS & AI EVALUATOR" speed={3.5} />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] font-kanit text-[#1A1525]">
              ห้องเรียนฝึกทักษะ{' '}
              <br />
              <span className="text-gradient-violet-mint font-black">
                Prompt Engineering
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#5C526E] leading-relaxed max-w-lg mx-auto lg:mx-0 font-prompt">
              ฝึกเขียนและปรับปรุงคำสั่งกับ AI สไตล์ Chatbot ระบบจดจำประวัติการเล่นและคะแนนเดิมด้วยรหัสนักเรียน พร้อมตรวจจับ Anti-Cheat 100%
            </p>
          </div>

          {/* 3 Feature Spotlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <SpotlightCard
              spotlightColor="rgba(0, 184, 148, 0.15)"
              borderColor="rgba(0, 184, 148, 0.25)"
              className="p-3.5 bg-white/60 text-left"
            >
              <div className="flex items-center gap-2 mb-1 text-[#047857]">
                <ShieldCheck size={16} />
                <span className="text-xs font-bold font-kanit">Anti-Cheat 100%</span>
              </div>
              <p className="text-[11px] text-[#5C526E] leading-snug">
                ป้องกัน Injection และพิมพ์มั่วด้วย Heuristics
              </p>
            </SpotlightCard>

            <SpotlightCard
              spotlightColor="rgba(124, 58, 237, 0.15)"
              borderColor="rgba(124, 58, 237, 0.25)"
              className="p-3.5 bg-white/60 text-left"
            >
              <div className="flex items-center gap-2 mb-1 text-[#6D28D9]">
                <Sparkles size={16} />
                <span className="text-xs font-bold font-kanit">AI Feedback ไทย</span>
              </div>
              <p className="text-[11px] text-[#5C526E] leading-snug">
                โค้ชชิ่งแนะนำจุดเด่นและสิ่งที่ต้องเติม
              </p>
            </SpotlightCard>

            <SpotlightCard
              spotlightColor="rgba(255, 107, 107, 0.15)"
              borderColor="rgba(255, 107, 107, 0.25)"
              className="p-3.5 bg-white/60 text-left"
            >
              <div className="flex items-center gap-2 mb-1 text-[#B91C1C]">
                <UserCheck size={16} />
                <span className="text-xs font-bold font-kanit">กู้คืนคะแนนเดิม</span>
              </div>
              <p className="text-[11px] text-[#5C526E] leading-snug">
                ใช้รหัสนักเรียนต่อจากเดิมได้ทันที
              </p>
            </SpotlightCard>
          </div>
        </div>

        {/* ─── RIGHT: Elevated ReactBits Login Form Card ─── */}
        <div className="w-full max-w-md lg:w-1/2">
          <SpotlightCard
            spotlightColor="rgba(124, 58, 237, 0.18)"
            borderColor="rgba(124, 58, 237, 0.3)"
            className="p-6 sm:p-8 space-y-6 bg-white/80 shadow-2xl backdrop-blur-xl border border-white/60"
          >
            {/* Header tag */}
            <div className="flex items-center justify-between border-b border-black/5 pb-3 font-mono text-xs">
              <span className="text-[#8E85A2] font-bold">CLASSROOM AUTHENTICATION</span>
              <ShinyText text="PROMPT BATTLE v1.0" speed={3} className="font-extrabold text-[#7C3AED]" />
            </div>

            {/* Tab switch buttons */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-black/[0.04] border border-black/5 font-kanit relative">
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setTab('student');
                  setError('');
                }}
                className={`min-h-[44px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer z-10 ${
                  tab === 'student'
                    ? 'bg-white text-[#6D28D9] shadow-md font-extrabold'
                    : 'text-[#5C526E] hover:text-[#1A1525]'
                }`}
              >
                <GraduationCap size={18} />
                นักเรียน
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setTab('teacher');
                  setError('');
                }}
                className={`min-h-[44px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer z-10 ${
                  tab === 'teacher'
                    ? 'bg-white text-[#047857] shadow-md font-extrabold'
                    : 'text-[#5C526E] hover:text-[#1A1525]'
                }`}
              >
                <ShieldCheck size={18} />
                ครูผู้สอน
              </button>
            </div>

            {/* Error Banner */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 bg-[#FF6B6B]/10 border border-[#FF6B6B]/25 text-[#B91C1C] rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm font-prompt"
                >
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Student Form */}
            {tab === 'student' ? (
              <form onSubmit={handleStudentSubmit} className="space-y-4 font-prompt">
                <div>
                  <label className="text-xs font-bold text-[#6D28D9] block mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={15} />
                    รหัสห้องเรียน (Class Code)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="เช่น PROMPT-101"
                      className="glass-input font-mono tracking-wider uppercase min-h-[48px] pl-4 pr-10 focus:ring-2 focus:ring-[#7C3AED]/40"
                    />
                    <CheckCircle2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00B894]" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#6D28D9] block mb-1.5 flex items-center gap-1.5">
                    <UserCheck size={15} />
                    รหัสนักเรียน / เลขประจำตัว
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="เช่น 6401 หรือ 12345 (เพื่อกู้คืนคะแนนเดิม)"
                    className="glass-input font-mono tracking-wider uppercase min-h-[48px] focus:ring-2 focus:ring-[#7C3AED]/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#6D28D9] block mb-1.5 flex items-center gap-1.5">
                    <UserCheck size={15} />
                    ชื่อเล่นของคุณ
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น น้องไทเกอร์ ม.2/1"
                    className="glass-input min-h-[48px] focus:ring-2 focus:ring-[#7C3AED]/40"
                  />
                </div>

                <StarBorder
                  as="div"
                  color="#7C3AED"
                  speed="3s"
                  className="w-full mt-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="btn-glass-violet w-full min-h-[54px] py-3.5 text-base flex items-center justify-center gap-2 cursor-pointer font-kanit shadow-lg group"
                  >
                    <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสนามฝึก PROMPT'}</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </StarBorder>
              </form>
            ) : (
              /* Teacher Form */
              <form onSubmit={handleTeacherSubmit} className="space-y-4 font-prompt">
                <div>
                  <label className="text-xs font-bold text-[#047857] block mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={15} />
                    รหัสห้องเรียน (Class Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="เช่น PROMPT-101"
                    className="glass-input font-mono tracking-wider uppercase min-h-[48px] focus:ring-2 focus:ring-[#00B894]/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#047857] block mb-1.5 flex items-center gap-1.5">
                    <Lock size={15} />
                    รหัส PIN ครู (Default: 1234)
                  </label>
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="ใส่ PIN 4 หลัก"
                    className="glass-input min-h-[48px] focus:ring-2 focus:ring-[#00B894]/40"
                  />
                </div>

                <StarBorder
                  as="div"
                  color="#00B894"
                  speed="3s"
                  className="w-full mt-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="btn-glass-mint w-full min-h-[54px] py-3.5 text-base flex items-center justify-center gap-2 cursor-pointer font-kanit shadow-lg group"
                  >
                    <ShieldCheck size={20} />
                    <span>{isLoading ? 'กำลังยืนยัน PIN...' : 'เข้าสู่ระบบครูผู้สอน'}</span>
                  </motion.button>
                </StarBorder>
              </form>
            )}
          </SpotlightCard>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="p-4 text-center text-xs text-[#8E85A2] border-t border-black/5 z-10 font-prompt backdrop-blur-md flex items-center justify-center gap-2">
        <span>Prompt Battle — Educational AI Workspace</span>
        <span>•</span>
        <ShinyText text="ReactBits Enhanced UI" speed={4} className="font-mono text-[#7C3AED] font-bold" />
      </footer>
    </div>
  );
}