import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { saveEvaluation, getUserEvaluation } from '../lib/sessionStorage';
import { playPopSound, playMascotBlipSound } from '../lib/soundEffects';
import { ArrowLeft, Star, Send, CheckCircle2, MessageSquare, Sparkles, BookOpen, Layout, MessageSquareCode, Award, ShieldAlert } from 'lucide-react';

import SpotlightCard from '../components/reactbits/SpotlightCard';
import ShinyText from '../components/reactbits/ShinyText';
import ParticlesBg from '../components/reactbits/ParticlesBg';

const SURVEY_SECTIONS = [
  {
    id: 1,
    title: '1. ด้านเนื้อหาและกิจกรรมการเรียนรู้',
    icon: BookOpen,
    color: '#7C3AED',
    items: [
      { id: '1.1', label: '1.1 ความเหมาะสมของเนื้อหาเกี่ยวกับการเขียนคำสั่งสำหรับปัญญาประดิษฐ์ (Prompt Engineering)' },
      { id: '1.2', label: '1.2 ความหลากหลายและความน่าสนใจของสถานการณ์ (Scenario) หรือภารกิจในเกม' },
      { id: '1.3', label: '1.3 ความเหมาะสมของความยากง่ายในกิจกรรมการเรียนรู้ผ่านเกม' },
    ]
  },
  {
    id: 2,
    title: '2. ด้านการออกแบบและการใช้งานเกม',
    icon: Layout,
    color: '#00B894',
    items: [
      { id: '2.1', label: '2.1 ความสวยงามของกราฟิก การออกแบบ และการใช้สีสันภายในเกม' },
      { id: '2.2', label: '2.2 ความสะดวกและความง่ายในการจัดวางเมนูปุ่มใช้งาน หรือการเปลี่ยนหน้าจอภายในเกม' },
      { id: '2.3', label: '2.3 การดึงดูดความสนใจและความสนุกสนานในการเล่นเกม' },
    ]
  },
  {
    id: 3,
    title: '3. ด้านการประเมินผลและข้อมูลป้อนกลับ (Feedback)',
    icon: MessageSquareCode,
    color: '#0984E3',
    items: [
      { id: '3.1', label: '3.1 ความชัดเจนของเกณฑ์การประเมิน (Rubric) ที่ใช้ในการประเมิน Prompt ของผู้เรียน' },
      { id: '3.2', label: '3.2 ความรวดเร็วและความชัดเจนของข้อมูลป้อนกลับ (Feedback) จากระบบ AI ที่ช่วยให้เข้าใจข้อผิดพลาด' },
      { id: '3.3', label: '3.3 ความเหมาะสมและความยุติธรรมของการให้คะแนนในแต่ละด่าน' },
    ]
  },
  {
    id: 4,
    title: '4. ด้านประโยชน์ที่ได้รับจากการใช้เกม',
    icon: Award,
    color: '#E17055',
    items: [
      { id: '4.1', label: '4.1 ช่วยพัฒนาทักษะการเขียนคำสั่งสำหรับปัญญาประดิษฐ์ (Prompt Engineering Skills) ให้ดีขึ้น' },
      { id: '4.2', label: '4.2 ช่วยให้ผู้เรียนมีความเข้าใจเกี่ยวกับการกำหนดบทบาท บริบท และเงื่อนไขในการสั่งงาน AI มากยิ่งขึ้น' },
      { id: '4.3', label: '4.3 สามารถนำความรู้และทักษะจากการเล่นเกมไปประยุกต์ใช้ในการเรียนและการทำกิจกรรมอื่น ๆ ได้จริง' },
    ]
  }
];

const RATING_LEVELS = [
  { value: 5, label: 'มากที่สุด', emoji: '🤩' },
  { value: 4, label: 'มาก', emoji: '😊' },
  { value: 3, label: 'ปานกลาง', emoji: '😐' },
  { value: 2, label: 'น้อย', emoji: '🙁' },
  { value: 1, label: 'น้อยที่สุด', emoji: '😞' },
];

export default function Evaluation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    const existing = getUserEvaluation();
    if (existing && existing.ratings) {
      setRatings(existing.ratings);
      setComments(existing.comments || '');
      setHasExisting(true);
    }
  }, []);

  const handleRatingSelect = (itemId, value) => {
    playPopSound();
    setRatings(prev => ({
      ...prev,
      [itemId]: value
    }));
    setError('');
  };

  const calculateProgress = () => {
    const totalItems = 12;
    const filledItems = Object.keys(ratings).filter(k => ratings[k] > 0).length;
    return Math.round((filledItems / totalItems) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const totalItems = 12;
    const filledItems = Object.keys(ratings).filter(k => ratings[k] > 0).length;

    if (filledItems < totalItems) {
      setError(`กรุณาตอบแบบประเมินให้ครบถ้วนทุกข้อ (ตอบแล้ว ${filledItems}/${totalItems} ข้อ)`);
      return;
    }

    setIsSubmitting(true);
    try {
      playMascotBlipSound();
      await saveEvaluation({ ratings, comments });
      setIsSubmittedSuccess(true);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกแบบประเมิน: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPct = calculateProgress();

  return (
    <div className="min-h-[100dvh] bg-[#F5F3FA] text-[#1A1525] flex flex-col font-prompt relative overflow-hidden">
      {/* Background Accents */}
      <ParticlesBg color="124, 58, 237" quantity={25} staticity={30} />

      {/* Glass Header */}
      <nav className="h-16 border-b border-black/5 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/stages')}
            className="min-h-[44px] px-3 py-1.5 rounded-2xl bg-white border border-black/10 text-xs font-bold hover:bg-black/5 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>กลับหน้าเลือกด่าน</span>
          </button>
          <div>
            <span className="font-extrabold text-xs sm:text-base text-[#1A1525] block leading-tight font-kanit">แบบประเมินความพึงพอใจ</span>
            <span className="text-[10px] sm:text-xs text-[#8E85A2]">นักเรียน: <strong className="text-[#6D28D9] font-kanit">{user?.username}</strong> ({user?.roomCode})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 text-[#6D28D9] text-xs font-mono font-bold">
            <Sparkles size={14} />
            <span>ตอบแล้ว {progressPct}%</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 relative z-10 font-prompt mb-12">
        {/* Banner Card */}
        <SpotlightCard className="p-6 sm:p-9 bg-white border border-black/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src="/assets/mascot.webp"
              alt="Promptie Mascot"
              className="w-20 h-20 sm:w-28 sm:h-28 object-contain shrink-0 drop-shadow-md"
            />
            <div className="space-y-2.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#7C3AED]/[0.08] text-[#6D28D9] text-xs font-mono font-bold">
                <Star size={14} className="fill-[#7C3AED]" />
                <span>STUDENT SATISFACTION SURVEY</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1A1525] font-kanit tracking-tight leading-snug">
                แบบสอบถามความพึงพอใจของนักเรียนที่มีต่อการใช้เกม Prompt Battle
              </h1>
              <p className="text-xs sm:text-sm text-[#5C526E] leading-relaxed">
                คำชี้แจง: แบบสอบถามนี้จัดทำขึ้นเพื่อศึกษาความพึงพอใจของนักเรียนในการประเมินทักษะการเขียนคำสั่งสำหรับปัญญาประดิษฐ์ (Prompt Engineering Skills) ขอให้นักเรียนประเมินตามความเป็นจริง
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-3 space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold text-[#5C526E]">
              <span>ความคืบหน้าการประเมิน</span>
              <span className="text-[#6D28D9]">{progressPct}% ( ตอบแล้ว {Object.keys(ratings).filter(k => ratings[k] > 0).length} / 12 ข้อ )</span>
            </div>
            <div className="w-full h-3.5 bg-black/5 rounded-full overflow-hidden p-0.5 border border-black/5">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#00B894] rounded-full transition-all duration-300 shadow-xs"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Rating Scale Legend */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3 pt-3 border-t border-black/5">
            {RATING_LEVELS.map(lvl => (
              <div key={lvl.value} className="p-2.5 sm:p-3 bg-black/[0.02] rounded-2xl text-center space-y-1 border border-black/5">
                <span className="text-lg sm:text-xl block">{lvl.emoji}</span>
                <strong className="text-xs sm:text-sm font-mono text-[#1A1525] block font-extrabold">{lvl.value}</strong>
                <span className="text-[10px] sm:text-xs text-[#8E85A2] font-kanit hidden sm:block">{lvl.label}</span>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* Validation Error Badge */}
        {error && (
          <div className="p-4 sm:p-5 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-[#B91C1C] rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 font-prompt shadow-sm my-4">
            <ShieldAlert size={20} className="shrink-0 text-[#FF6B6B]" />
            <span>{error}</span>
          </div>
        )}

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {SURVEY_SECTIONS.map(section => {
            const SectionIcon = section.icon;

            return (
              <SpotlightCard key={section.id} className="p-6 sm:p-8 bg-white border border-black/10 shadow-lg space-y-6">
                <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: section.color }}
                  >
                    <SectionIcon size={22} />
                  </div>
                  <h2 className="font-black text-base sm:text-xl text-[#1A1525] font-kanit">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  {section.items.map(item => {
                    const currentVal = ratings[item.id] || 0;

                    return (
                      <div key={item.id} className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-black/[0.015] border border-black/5 transition-all hover:bg-white shadow-2xs">
                        <p className="text-xs sm:text-sm font-bold text-[#1A1525] leading-relaxed font-prompt">
                          {item.label}
                        </p>

                        <div className="grid grid-cols-5 gap-2 sm:gap-4 pt-1">
                          {RATING_LEVELS.map(lvl => {
                            const isSelected = currentVal === lvl.value;

                            return (
                              <button
                                key={lvl.value}
                                type="button"
                                onClick={() => handleRatingSelect(item.id, lvl.value)}
                                className={`p-2.5 sm:p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer min-h-[64px] sm:min-h-[72px] active:scale-95 ${
                                  isSelected
                                    ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-md scale-[1.03] font-black'
                                    : 'bg-white text-[#5C526E] border-black/10 hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/[0.03]'
                                }`}
                              >
                                <span className="text-base sm:text-xl">{lvl.emoji}</span>
                                <span className="font-mono text-xs sm:text-sm font-extrabold">{lvl.value}</span>
                                <span className={`text-[10px] sm:text-xs font-kanit hidden md:block ${isSelected ? 'text-white' : 'text-[#8E85A2]'}`}>
                                  {lvl.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SpotlightCard>
            );
          })}

          {/* Suggestions Textarea Card */}
          <SpotlightCard className="p-6 sm:p-8 bg-white border border-black/10 shadow-lg space-y-5">
            <div className="flex items-center gap-2.5 border-b border-black/5 pb-4">
              <MessageSquare className="text-[#7C3AED]" size={22} />
              <h2 className="font-black text-base sm:text-xl text-[#1A1525] font-kanit">
                ข้อเสนอแนะเพิ่มเติม (ถ้ามี)
              </h2>
            </div>
            <div>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="พิมพ์ข้อเสนอแนะ ข้อคิดเห็น หรือสิ่งที่อยากให้ปรับปรุงเพิ่มเติมที่นี่..."
                className="w-full p-4.5 rounded-2xl bg-black/[0.02] border border-black/10 focus:border-[#7C3AED] focus:bg-white text-xs sm:text-sm text-[#1A1525] font-prompt resize-none transition-all outline-none leading-relaxed"
              />
            </div>
          </SpotlightCard>

          {/* Submit Button */}
          <div className="pt-4 pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-glass-violet w-full min-h-[58px] py-4 text-base sm:text-xl flex items-center justify-center gap-2.5 cursor-pointer font-kanit shadow-xl active:scale-98 transition-all"
            >
              <Send size={22} />
              <span>{isSubmitting ? 'กำลังส่งแบบประเมิน...' : (hasExisting ? 'อัปเดตแบบประเมินความพึงพอใจ' : 'ส่งแบบประเมินความพึงพอใจ')}</span>
            </button>
          </div>
        </form>
      </main>

      {/* Success Celebration Modal */}
      <AnimatePresence>
        {isSubmittedSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-md w-full p-7 text-center space-y-5 shadow-2xl border border-white/60 font-prompt relative"
            >
              <div className="w-16 h-16 rounded-full bg-[#00B894]/20 border border-[#00B894]/30 text-[#00B894] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-xl text-[#1A1525] font-kanit">
                  ขอบคุณสำหรับแบบประเมินความพึงพอใจ!
                </h3>
                <p className="text-xs sm:text-sm text-[#5C526E] leading-relaxed">
                  ข้อมูลการประเมินของคุณถูกบันทึกและส่งไปยังคุณครูผู้สอนเพื่อนำไปพัฒนาและปรับปรุงเกมให้ดียิ่งขึ้นแล้วครับ ✨
                </p>
              </div>

              <button
                onClick={() => navigate('/stages')}
                className="btn-glass-mint w-full min-h-[48px] py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer font-kanit shadow-sm"
              >
                <span>กลับสู่หน้าเลือกด่าน</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
