import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { playPopSound, playMascotBlipSound } from '../lib/soundEffects';
import { Sparkles, ShieldCheck, ArrowRight, GraduationCap, KeyRound, UserCheck, Lock, BookOpen, Hash, RefreshCw, Zap } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { loginStudent, loginTeacher } = useAuth();

  const [tab, setTab] = useState('student'); // 'student' | 'teacher'
  const [roomCode, setRoomCode] = useState('PROMPT-101');
  const [studentId, setStudentId] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const canvasRef = useRef(null);

  // Floating Background Particles Canvas Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const mascotMessages = [
    'สวัสดีครับ! ผม Promptie ครู AI พร้อมพานักเรียนมาสนุกกับการเรียนสั่ง AI แล้วครับ! 🤖✨',
    'รู้ไหม? กรอกรหัสนักเรียนเดิม จะกู้คืนคะแนนและประวัติการเล่นเดิมได้ 100% เลยนะ! 💡',
    'ลุยด่านแข่งขันเพื่อประลองทักษะและเก็บสะสมคะแนน 20 เต็มกันเลย! ⭐️',
    'คลิกตัวผมเพื่อเปลี่ยนเทคนิค Prompt พิเศษได้เรื่อยๆ เลยนะครับ! 🚀'
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
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden font-prompt">
      {/* Background Interactive Floating Particles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-70" />

      {/* Background Soft Floating Gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl pointer-events-none animate-float" />

      {/* Top Header Navigation */}
      <header className="h-16 border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between max-w-6xl mx-auto w-full z-10 bg-white/90 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
            className="w-10 h-10 object-contain drop-shadow-sm hover:scale-105 transition-transform cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>Prompt Battle</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </span>
            <span className="text-[10px] text-blue-600 font-mono tracking-wider uppercase font-semibold">
              AI Prompt Engineering Platform
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            playPopSound();
            setTab(tab === 'student' ? 'teacher' : 'student');
            setError('');
          }}
          className="min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:scale-105"
        >
          {tab === 'student' ? (
            <>
              <ShieldCheck size={16} className="text-amber-600" />
              <span>โหมดครูผู้สอน</span>
            </>
          ) : (
            <>
              <GraduationCap size={16} className="text-blue-600" />
              <span>โหมดนักเรียน</span>
            </>
          )}
        </button>
      </header>

      {/* Main Hero & Mascot Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 z-10">
        {/* Left Side: Animated Mascot Speech Bubble & Hero Description */}
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
          {/* Interactive Mascot Animated Speech Bubble Container */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
            <div className="relative group cursor-pointer shrink-0" onClick={triggerNextMascotMessage} title="กดที่ตัว Promptie เพื่อฟังคำแนะนำใหม่!">
              {/* Glowing Ambient Halo behind Mascot */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none" />

              <img
                src="/assets/mascot.webp"
                alt="Promptie Mascot"
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-xl animate-mascot-pulse group-hover:scale-110 transition-transform duration-300 relative z-10"
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                <RefreshCw size={10} className="animate-spin" />
                <span>แตะที่ผมสิ!</span>
              </span>
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              <div className="bg-white p-4.5 rounded-3xl border border-blue-200 shadow-md text-left transition-all relative overflow-hidden">
                <p className={`text-xs sm:text-sm text-slate-800 font-bold leading-relaxed transition-opacity duration-200 ${isChangingMsg ? 'opacity-0' : 'opacity-100'}`}>
                  {mascotMessages[mascotIndex]}
                </p>

                {/* Animated Dots indicator */}
                <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-slate-100">
                  {mascotMessages.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === mascotIndex ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <span className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1 hover:scale-105 transition-transform">
                  <BookOpen size={14} className="text-blue-600" />
                  <span>บันทึกคะแนนด้วยรหัสนักเรียน</span>
                </span>
                <span className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1 hover:scale-105 transition-transform">
                  <Sparkles size={14} className="text-amber-600 animate-spin-slow" />
                  <span>AI Feedback ภาษาไทย</span>
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              ห้องเรียนฝึกทักษะ <br />
              <span className="text-blue-600 font-black">
                Prompt Engineering
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
              ฝึกเขียนและปรับปรุงคำสั่งกับ AI สไตล์ Chatbot ระบบจดจำประวัติการเล่นและคะแนนเดิมด้วยรหัสนักเรียน
            </p>
          </div>

          {/* Classroom Photo */}
          <div className="pt-2 hidden sm:block">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg group bg-white">
              <img
                src="/assets/hero.webp"
                alt="AI Classroom Learning"
                className="w-full h-auto object-cover max-h-[220px] group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Entry Form Card */}
        <div className="w-full max-w-md lg:w-1/2">
          <div className="arcade-card p-6 sm:p-8 space-y-6 relative border-4 border-cyan-400">
            {/* Arcade Screen Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-700/80 pb-3 text-xs font-mono font-black text-cyan-400">
              <span>[ INSERT COIN TO PLAY ]</span>
              <span className="text-yellow-300">1 UP</span>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-900 rounded-xl border-2 border-slate-700">
              <button
                type="button"
                onClick={() => { playPopSound(); setTab('student'); setError(''); }}
                className={`min-h-[44px] text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tab === 'student'
                    ? 'btn-arcade-cyan text-black'
                    : 'text-slate-400 hover:text-white font-bold'
                }`}
              >
                <GraduationCap size={18} />
                <span>นักเรียน</span>
              </button>
              <button
                type="button"
                onClick={() => { playPopSound(); setTab('teacher'); setError(''); }}
                className={`min-h-[44px] text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tab === 'teacher'
                    ? 'btn-arcade-yellow text-black font-black'
                    : 'text-slate-400 hover:text-white font-bold'
                }`}
              >
                <ShieldCheck size={18} />
                <span>ครูผู้สอน</span>
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-950 border-2 border-rose-500 text-rose-200 rounded-xl text-xs font-bold text-center animate-fade-in shadow-sm font-mono">
                ⚠️ {error}
              </div>
            )}

            {tab === 'student' ? (
              <form onSubmit={handleStudentSubmit} className="space-y-4 font-prompt">
                <div>
                  <label className="text-xs font-black text-cyan-300 block mb-1.5 flex items-center gap-1.5 font-mono">
                    <KeyRound size={15} className="text-cyan-400" />
                    <span>รหัสห้องเรียน (Class Code)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="เช่น PROMPT-101"
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 text-white rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none transition-all uppercase min-h-[46px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-cyan-300 block mb-1.5 flex items-center gap-1.5 font-mono">
                    <Hash size={15} className="text-cyan-400" />
                    <span>รหัสนักเรียน / เลขประจำตัว</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="เช่น 6401 หรือ 12345 (เพื่อจำคะแนนเดิม)"
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 text-white rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none transition-all uppercase min-h-[46px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-cyan-300 block mb-1.5 flex items-center gap-1.5 font-mono">
                    <UserCheck size={15} className="text-cyan-400" />
                    <span>ชื่อเล่นของคุณ</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น น้องไทเกอร์ ม.2/1"
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all min-h-[46px]"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-arcade-pink w-full min-h-[52px] py-3.5 text-base flex items-center justify-center gap-2 cursor-pointer mt-3 font-kanit uppercase tracking-wider"
                >
                  <span>PRESS START / เข้าสนามฝึก PROMPT</span>
                  <ArrowRight size={20} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleTeacherSubmit} className="space-y-4 font-prompt">
                <div>
                  <label className="text-xs font-black text-yellow-300 block mb-1.5 flex items-center gap-1.5 font-mono">
                    <KeyRound size={15} className="text-yellow-400" />
                    <span>รหัสห้องเรียน (Class Code)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="เช่น PROMPT-101"
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-400 text-white rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none transition-all uppercase min-h-[46px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-yellow-300 block mb-1.5 flex items-center gap-1.5 font-mono">
                    <Lock size={15} className="text-yellow-400" />
                    <span>รหัส PIN ครู (Default: 1234)</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="ใส่ PIN 4 หลัก"
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-400 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all min-h-[46px]"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-arcade-yellow w-full min-h-[52px] py-3.5 text-base flex items-center justify-center gap-2 cursor-pointer mt-3 font-kanit uppercase tracking-wider text-black"
                >
                  <ShieldCheck size={20} />
                  <span>LOGIN TEACHER ADMIN</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white z-10">
        Prompt Battle — Educational AI Workspace
      </footer>
    </div>
  );
}
