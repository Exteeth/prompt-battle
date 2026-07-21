import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ShieldCheck, ArrowRight, GraduationCap, KeyRound, UserCheck, Lock, BookOpen, Layers } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { loginStudent, loginTeacher } = useAuth();

  const [tab, setTab] = useState('student'); // 'student' | 'teacher'
  const [roomCode, setRoomCode] = useState('PROMPT-101');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      loginStudent(roomCode, username);
      navigate('/stages');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      loginTeacher(roomCode, pin);
      navigate('/teacher');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden font-prompt">
      {/* Background Soft Gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="h-16 border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between max-w-6xl mx-auto w-full z-10 bg-white/90 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.webp"
            alt="Prompt Battle Logo"
            className="w-10 h-10 object-contain drop-shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>Prompt Battle</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="text-[10px] text-blue-600 font-mono tracking-wider uppercase font-semibold">
              AI Prompt Engineering Platform
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setTab(tab === 'student' ? 'teacher' : 'student');
            setError('');
          }}
          className="min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
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
        {/* Left Side: Mascot Speech Bubble & Hero Description */}
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
          {/* Mascot Speech Bubble Container */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
            <img
              src="/assets/mascot.webp"
              alt="Promptie Mascot"
              className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300 shrink-0"
            />

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-3xl border border-blue-200 shadow-md text-left">
                <p className="text-xs sm:text-sm text-slate-800 font-bold leading-relaxed">
                  สวัสดีครับ! ผม <span className="text-blue-600 font-extrabold">Promptie</span> ครู AI ที่จะพานักเรียนมาสนุกกับการฝึกสั่ง AI อย่างมีประสิทธิภาพครับ!
                </p>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <span className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1">
                  <BookOpen size={14} className="text-blue-600" />
                  <span>เรียนง่าย ได้ผลจริง</span>
                </span>
                <span className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-600" />
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
              ฝึกเขียนและปรับปรุงคำสั่งกับ AI สไตล์ Chatbot รับคะแนนประเมิน 4 ด้านและคำแนะนำรายบุคคลเพื่อเพิ่มพูนความรู้
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
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setTab('student'); setError(''); }}
                className={`min-h-[44px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tab === 'student'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap size={16} />
                <span>นักเรียน</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab('teacher'); setError(''); }}
                className={`min-h-[44px] text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tab === 'teacher'
                    ? 'bg-amber-500 text-white font-bold shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck size={16} />
                <span>ครูผู้สอน</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold text-center animate-fade-in">
                {error}
              </div>
            )}

            {tab === 'student' ? (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={14} className="text-blue-600" />
                    <span>รหัสห้องเรียน (Class Code)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="เช่น PROMPT-101"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 rounded-2xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none transition-all uppercase min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-blue-600" />
                    <span>ชื่อเล่นของคุณ</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น น้องไทเกอร์ ม.2/1"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[52px] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-base transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>เข้าสู่สนามฝึก Prompt Battle</span>
                  <ArrowRight size={20} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={14} className="text-amber-600" />
                    <span>รหัสห้องเรียน (Class Code)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="เช่น PROMPT-101"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-600 focus:bg-white text-slate-900 rounded-2xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none transition-all uppercase min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Lock size={14} className="text-amber-600" />
                    <span>รหัส PIN ครู (Default: 1234)</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="ใส่ PIN 4 หลัก"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-600 focus:bg-white text-slate-900 rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[52px] py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl text-base transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <ShieldCheck size={20} />
                  <span>เข้าสู่ระบบ Teacher Admin</span>
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
