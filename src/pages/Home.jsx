import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { playPopSound, playMascotBlipSound } from '../lib/soundEffects';
import { Sparkles, ShieldCheck, ArrowRight, GraduationCap, KeyRound, UserCheck, Lock, RefreshCw, Zap, ChevronRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { loginStudent, loginTeacher } = useAuth();

  const [tab, setTab] = useState('student');
  const [roomCode, setRoomCode] = useState('PROMPT-101');
  const [studentId, setStudentId] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const particlesCanvasRef = useRef(null);

  // ─── Floating Particle Drift on hidden canvas ───
  useEffect(() => {
    const canvas = particlesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.25 + 0.08,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();
      }
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

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
    }, 200);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      playPopSound();
      await loginStudent(roomCode, studentId, username);
      navigate('/stages');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      playPopSound();
      loginTeacher(roomCode, pin);
      navigate('/teacher');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F3FA] text-[#1A1525] flex flex-col relative overflow-hidden font-prompt">
      {/* ─── Animated Morphing Gradient Orbs ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="orb-violet" style={{ top: '-10%', left: '-5%' }} />
        <div className="orb-mint" style={{ top: '40%', right: '-8%' }} />
        <div className="orb-coral" style={{ bottom: '-10%', left: '30%' }} />
      </div>

      {/* ─── Subtle Particle Canvas ─── */}
      <canvas ref={particlesCanvasRef} className="absolute inset-0 pointer-events-none z-[1] opacity-50" />

      {/* ─── Glass Navigation ─── */}
      <header className="glass-nav h-16 px-4 sm:px-8 flex items-center justify-between w-full z-20">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
            className="w-10 h-10 object-contain drop-shadow-md hover:scale-105 transition-transform cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 font-kanit text-[#1A1525]">
              Prompt Battle
              <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
            </span>
            <span className="text-[10px] text-[#8E85A2] font-mono tracking-wider uppercase font-semibold">
              AI Prompt Engineering Workspace
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            playPopSound();
            setTab(tab === 'student' ? 'teacher' : 'student');
            setError('');
          }}
          className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold btn-glass-violet flex items-center gap-2 cursor-pointer"
        >
          {tab === 'student' ? (
            <>
              <ShieldCheck size={16} />
              <span>โหมดครูผู้สอน</span>
            </>
          ) : (
            <>
              <GraduationCap size={16} />
              <span>โหมดนักเรียน</span>
            </>
          )}
        </button>
      </header>

      {/* ─── Main Hero ─── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 z-10 font-prompt">
        {/* ─── LEFT: Mascot + Headline ─── */}
        <div className="w-full lg:w-1/2 space-y-7 text-center lg:text-left">
          {/* Mascot Speech Bubble area */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
            {/* Mascot */}
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={triggerNextMascotMessage}
              title="กดที่ตัว Promptie เพื่อฟังคำแนะนำใหม่!"
            >
              {/* Glow halo */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/30 to-[#00B894]/25 rounded-full blur-2xl opacity-70 animate-pulse pointer-events-none" />

              <img
                src="/assets/mascot.webp"
                alt="Promptie Mascot"
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300 relative z-10 animate-mascot-pulse"
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold shadow-lg flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                <RefreshCw size={10} className="animate-spin" />
                แตะที่ผมสิ!
              </span>
            </div>

            {/* Speech bubble */}
            <div className="space-y-3 flex-1 min-w-0">
              <div className="glass-panel p-4 text-left relative overflow-hidden">
                <p className={`text-xs sm:text-sm text-[#1A1525] font-bold leading-relaxed transition-opacity duration-200 ${isChangingMsg ? 'opacity-0' : 'opacity-100'}`}>
                  {mascotMessages[mascotIndex]}
                </p>

                {/* Dots indicator */}
                <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-black/5">
                  {mascotMessages.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === mascotIndex ? 'w-5 bg-[#7C3AED]' : 'w-1.5 bg-black/8'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <span className="glass-badge">
                  <UserCheck size={12} />
                  บันทึกคะแนนด้วยรหัสนักเรียน
                </span>
                <span className="glass-badge" style={{ background: 'rgba(0, 184, 148, 0.08)', borderColor: 'rgba(0, 184, 148, 0.12)', color: '#047857' }}>
                  <Sparkles size={12} />
                  AI Feedback ภาษาไทย
                </span>
              </div>
            </div>
          </div>

          {/* Hero headline */}
          <div className="space-y-3">
            <div className="inline-block glass-badge mb-1">
              <Zap size={12} />
              No AI Slop — Built with Craft
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-kanit text-[#1A1525]">
              ห้องเรียนฝึกทักษะ{' '}
              <br />
              <span className="text-gradient-violet-mint font-black">
                Prompt Engineering
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#5C526E] leading-relaxed max-w-lg mx-auto lg:mx-0">
              ฝึกเขียนและปรับปรุงคำสั่งกับ AI สไตล์ Chatbot ระบบจดจำประวัติการเล่นและคะแนนเดิมด้วยรหัสนักเรียน
            </p>
          </div>

          {/* Hero image (desktop only) */}
          <div className="pt-2 hidden sm:block">
            <div className="glass-panel p-1.5 overflow-hidden group">
              <img
                src="/assets/hero.webp"
                alt="AI Classroom Learning"
                className="w-full h-auto object-cover max-h-[220px] rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Entry Form Card ─── */}
        <div className="w-full max-w-md lg:w-1/2">
          <div className="glass-panel-elevated p-6 sm:p-8 space-y-6 relative">
            {/* Form card header */}
            <div className="flex items-center justify-between border-b border-black/5 pb-3 text-xs font-mono font-bold text-[#8E85A2]">
              <span>WELCOME TO CLASSROOM</span>
              <span className="text-gradient-violet-mint font-bold">PROMPT BATTLE</span>
            </div>

            {/* Tab switcher */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white/40 border border-black/5 font-kanit">
              <button
                type="button"
                onClick={() => { playPopSound(); setTab('student'); setError(''); }}
                className={`min-h-[44px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tab === 'student' ? 'glass-tab-active' : 'glass-tab-inactive'
                }`}
              >
                <GraduationCap size={18} />
                นักเรียน
              </button>
              <button
                type="button"
                onClick={() => { playPopSound(); setTab('teacher'); setError(''); }}
                className={`min-h-[44px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tab === 'teacher' ? 'glass-tab-active' : 'glass-tab-inactive'
                }`}
              >
                <ShieldCheck size={18} />
                ครูผู้สอน
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3.5 bg-[#FF6B6B]/8 border border-[#FF6B6B]/20 text-[#B91C1C] rounded-2xl text-xs font-bold text-center animate-fade-in shadow-sm font-prompt">
                ⚠️ {error}
              </div>
            )}

            {/* Student form */}
            {tab === 'student' ? (
              <form onSubmit={handleStudentSubmit} className="space-y-4 font-prompt">
                <div>
                  <label className="text-xs font-bold text-[#6D28D9] block mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={15} />
                    รหัสห้องเรียน (Class Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="เช่น PROMPT-101"
                    className="glass-input font-mono tracking-wider uppercase min-h-[46px]"
                  />
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
                    placeholder="เช่น 6401 หรือ 12345 (เพื่อจำคะแนนเดิม)"
                    className="glass-input font-mono tracking-wider uppercase min-h-[46px]"
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
                    className="glass-input min-h-[46px]"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-glass-violet w-full min-h-[52px] py-3.5 text-base flex items-center justify-center gap-2 cursor-pointer mt-3 font-kanit"
                >
                  <span>เข้าสนามฝึก PROMPT</span>
                  <ChevronRight size={20} />
                </button>
              </form>
            ) : (
              /* Teacher form */
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
                    className="glass-input font-mono tracking-wider uppercase min-h-[46px]"
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
                    className="glass-input min-h-[46px]"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-glass-mint w-full min-h-[52px] py-3.5 text-base flex items-center justify-center gap-2 cursor-pointer mt-3 font-kanit"
                >
                  <ShieldCheck size={20} />
                  <span>เข้าสู่ระบบครูผู้สอน</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="p-4 text-center text-xs text-[#8E85A2] border-t border-black/5 z-10 font-prompt backdrop-blur-sm">
        Prompt Battle — Educational AI Workspace
      </footer>
    </div>
  );
}