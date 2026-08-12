import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { playPopSound, playMascotBlipSound } from '../lib/soundEffects';
import { Sparkles, ShieldCheck, GraduationCap, KeyRound, UserCheck, Lock, RefreshCw, Zap, ChevronRight, ShieldAlert } from 'lucide-react';

import SpotlightCard from '../components/reactbits/SpotlightCard';
import ShinyText from '../components/reactbits/ShinyText';

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

  // Mascot messages
  const mascotMessages = [
    'สวัสดีครับ! ผม Promptie ครู AI พร้อมพานักเรียนมาสนุกกับการเรียนสั่ง AI แล้วครับ! 🤖✨',
    'รู้ไหม? กรอกรหัสนักเรียนเดิม จะกู้คืนคะแนนและประวัติการเล่นเดิมได้ 100% เลยนะ! 💡',
    'ลุยด่านแข่งขันเพื่อประลองทักษะและเก็บสะสมคะแนน 20 เต็มกันเลย! ⭐️',
    'คลิกตัวผมเพื่อเปลี่ยนเทคนิค Prompt พิเศษได้เรื่อยๆ เลยนะครับ! 🚀',
  ];

  const [mascotIndex, setMascotIndex] = useState(0);

  const triggerNextMascotMessage = () => {
    playMascotBlipSound();
    setMascotIndex((prev) => (prev + 1) % mascotMessages.length);
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
    <div className="min-h-[100dvh] bg-[#F8F7FC] text-[#1A1525] flex flex-col relative overflow-hidden font-prompt">
      {/* Subtle Background Radial Accents (Static CSS - 0% CPU) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C3AED]/[0.05] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00B894]/[0.05] rounded-full blur-3xl pointer-events-none" />

      {/* Glass Header */}
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between w-full z-20 sticky top-0 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
            className="w-9 h-9 object-contain cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-1.5 font-kanit text-[#1A1525]">
              Prompt Battle
              <span className="w-2 h-2 rounded-full bg-[#00B894]" />
            </span>
            <ShinyText
              text="AI PROMPT ENGINEERING WORKSPACE"
              className="text-[10px] text-[#8E85A2] font-mono tracking-wider uppercase font-semibold"
            />
          </div>
        </div>

        <button
          onClick={() => {
            playPopSound();
            setTab(tab === 'student' ? 'teacher' : 'student');
            setError('');
          }}
          className="min-h-[44px] px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-white border border-black/10 hover:border-[#7C3AED]/30 text-[#1A1525] flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95"
        >
          {tab === 'student' ? (
            <>
              <ShieldCheck size={16} className="text-[#7C3AED]" />
              <span>โหมดครูผู้สอน</span>
            </>
          ) : (
            <>
              <GraduationCap size={16} className="text-[#00B894]" />
              <span>โหมดนักเรียน</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col lg:flex-row items-center justify-between gap-8 z-10 font-prompt">
        {/* Left Hero & Mascot */}
        <div className="w-full lg:w-1/2 space-y-5 text-center lg:text-left">
          {/* Mascot Speech Area */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
            <div
              onClick={triggerNextMascotMessage}
              className="relative cursor-pointer shrink-0 group active:scale-95 transition-transform"
              title="แตะเพื่อฟังคำแนะนำ!"
            >
              <img
                src="/assets/mascot.webp"
                alt="Promptie Mascot"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-md relative z-10"
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold shadow-md flex items-center gap-1 whitespace-nowrap z-20 font-mono">
                <RefreshCw size={10} />
                แตะที่ผมสิ!
              </span>
            </div>

            {/* Speech Card */}
            <SpotlightCard className="flex-1 p-4 text-left border border-black/5 bg-white/90 shadow-sm">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#6D28D9]">
                  <span className="w-2 h-2 rounded-full bg-[#00B894]" />
                  <span>PROMPTIE TUTOR</span>
                </div>
                <p className="text-xs sm:text-sm text-[#1A1525] font-bold leading-relaxed">
                  {mascotMessages[mascotIndex]}
                </p>
              </div>
            </SpotlightCard>
          </div>

          {/* Headline */}
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C3AED]/[0.08] border border-[#7C3AED]/[0.15] text-[#6D28D9] text-xs font-bold font-mono">
              <Zap size={13} className="fill-[#7C3AED] text-[#7C3AED]" />
              <span>MINIMALIST & FAST AI WORKSPACE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-kanit text-[#1A1525]">
              ห้องเรียนฝึกทักษะ{' '}
              <br />
              <span className="text-[#7C3AED]">
                Prompt Engineering
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#5C526E] leading-relaxed max-w-md mx-auto lg:mx-0 font-prompt">
              ฝึกเขียนและปรับปรุงคำสั่งกับ AI สไตล์ Chatbot ระบบจดจำประวัติการเล่นและคะแนนเดิมด้วยรหัสนักเรียน
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-2.5 pt-1 text-center font-kanit">
            <div className="p-2.5 bg-white rounded-2xl border border-black/5 text-xs shadow-xs">
              <ShieldCheck size={18} className="mx-auto mb-1 text-[#00B894]" />
              <span className="font-bold block text-[11px]">Anti-Cheat</span>
            </div>
            <div className="p-2.5 bg-white rounded-2xl border border-black/5 text-xs shadow-xs">
              <Sparkles size={18} className="mx-auto mb-1 text-[#7C3AED]" />
              <span className="font-bold block text-[11px]">AI Feedback</span>
            </div>
            <div className="p-2.5 bg-white rounded-2xl border border-black/5 text-xs shadow-xs">
              <UserCheck size={18} className="mx-auto mb-1 text-[#FF6B6B]" />
              <span className="font-bold block text-[11px]">กู้คะแนนเดิม</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="w-full max-w-md lg:w-1/2">
          <SpotlightCard className="p-6 sm:p-7 space-y-5 bg-white border border-black/10 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 pb-3 font-mono text-xs">
              <span className="text-[#8E85A2] font-bold">CLASSROOM AUTH</span>
              <span className="font-bold text-[#7C3AED]">PROMPT BATTLE</span>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/[0.04] border border-black/5 font-kanit">
              <button
                type="button"
                onClick={() => { playPopSound(); setTab('student'); setError(''); }}
                className={`min-h-[44px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'student'
                    ? 'bg-white text-[#6D28D9] shadow-xs font-extrabold'
                    : 'text-[#5C526E]'
                }`}
              >
                <GraduationCap size={16} />
                นักเรียน
              </button>
              <button
                type="button"
                onClick={() => { playPopSound(); setTab('teacher'); setError(''); }}
                className={`min-h-[44px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'teacher'
                    ? 'bg-white text-[#047857] shadow-xs font-extrabold'
                    : 'text-[#5C526E]'
                }`}
              >
                <ShieldCheck size={16} />
                ครูผู้สอน
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-[#B91C1C] rounded-2xl text-xs font-bold flex items-center gap-2 font-prompt">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            {tab === 'student' ? (
              <form onSubmit={handleStudentSubmit} className="space-y-3.5 font-prompt">
                <div>
                  <label className="text-xs font-bold text-[#6D28D9] block mb-1 flex items-center gap-1">
                    <KeyRound size={14} />
                    รหัสห้องเรียน (Class Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="เช่น PROMPT-101"
                    className="glass-input font-mono tracking-wider uppercase min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#6D28D9] block mb-1 flex items-center gap-1">
                    <UserCheck size={14} />
                    รหัสนักเรียน / เลขประจำตัว
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="เช่น 6401 หรือ 12345"
                    className="glass-input font-mono tracking-wider uppercase min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#6D28D9] block mb-1 flex items-center gap-1">
                    <UserCheck size={14} />
                    ชื่อเล่นของคุณ
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น น้องไทเกอร์ ม.2/1"
                    className="glass-input min-h-[48px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-glass-violet w-full min-h-[50px] py-3 text-base flex items-center justify-center gap-2 cursor-pointer font-kanit shadow-sm mt-2 active:scale-98 transition-all"
                >
                  <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสนามฝึก PROMPT'}</span>
                  <ChevronRight size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleTeacherSubmit} className="space-y-3.5 font-prompt">
                <div>
                  <label className="text-xs font-bold text-[#047857] block mb-1 flex items-center gap-1">
                    <KeyRound size={14} />
                    รหัสห้องเรียน (Class Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="เช่น PROMPT-101"
                    className="glass-input font-mono tracking-wider uppercase min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#047857] block mb-1 flex items-center gap-1">
                    <Lock size={14} />
                    รหัส PIN ครู (Default: 1234)
                  </label>
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="ใส่ PIN 4 หลัก"
                    className="glass-input min-h-[48px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-glass-mint w-full min-h-[50px] py-3 text-base flex items-center justify-center gap-2 cursor-pointer font-kanit shadow-sm mt-2 active:scale-98 transition-all"
                >
                  <ShieldCheck size={18} />
                  <span>{isLoading ? 'กำลังยืนยัน PIN...' : 'เข้าสู่ระบบครูผู้สอน'}</span>
                </button>
              </form>
            )}
          </SpotlightCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 text-center text-xs text-[#8E85A2] border-t border-black/5 font-prompt bg-white/50 backdrop-blur-xs">
        Prompt Battle — Educational Minimalist AI Workspace
      </footer>
    </div>
  );
}