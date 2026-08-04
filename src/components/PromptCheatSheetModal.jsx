import React from 'react';
import { X, Sparkles, BookOpen, Target, UserCheck, Layers, FileText, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function PromptCheatSheetModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheat-sheet-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-prompt"
    >
      <div className="arcade-card border-4 border-cyan-400 bg-slate-900 text-white w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-800 flex items-center justify-between bg-slate-950 font-kanit">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold shadow-md">
              <Sparkles size={22} aria-hidden="true" className="animate-spin-slow text-yellow-300" />
            </div>
            <div>
              <h2 id="cheat-sheet-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                PROMPT CHEAT SHEET (สูตรลับ 7 ด้าน)
              </h2>
              <p className="text-xs text-cyan-400 font-mono">RUBRIC FRAMEWORK & MASTER FORMULA</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่างสูตรลับ Prompt"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Formula Box */}
          <div className="p-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl shadow-xl space-y-2.5 font-mono border-2 border-white/20">
            <span className="text-xs uppercase tracking-wider text-amber-300 font-black flex items-center gap-1.5 font-kanit">
              <Sparkles size={14} />
              <span>โครงสร้าง Prompt Master Formula (5 องค์ประกอบหลัก):</span>
            </span>
            <p className="font-black text-xs sm:text-base text-yellow-300 leading-relaxed bg-black/20 p-3 rounded-2xl border border-white/10">
              [ROLE] + [CONTEXT] + [TASK] + [CONSTRAINTS] + [OUTPUT FORMAT]
            </p>
            <p className="text-xs text-cyan-100 font-prompt border-t border-white/20 pt-2 mt-1">
              ✨ กำกับด้วย <strong>ความชัดเจน (Clarity)</strong> + ปรับพัฒนาด้วย <strong>การทำซ้ำ (Refinement & Iteration)</strong>
            </p>
          </div>

          {/* 7 Rubric Elements Grid */}
          <div className="space-y-3">
            <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-1">
              <strong className="text-blue-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <Sparkles size={16} aria-hidden="true" className="text-blue-600" />
                <span>1. ความชัดเจนของคำสั่ง (Clarity):</span>
              </strong>
              <p className="text-slate-600">ใช้ภาษาที่กระชับ ตรงประเด็น สื่อความหมายได้ชัดเจน ไม่กำกวม หลีกเลี่ยงคำสั่งที่ตีความได้หลายแบบ</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <strong className="text-indigo-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <UserCheck size={16} aria-hidden="true" />
                <span>2. การกำหนดบทบาทให้ AI (Role):</span>
              </strong>
              <p className="text-slate-600">ระบุบทบาทหรือตัวตนของ AI ให้เหมาะสมกับงานที่ต้องการ เช่น "คุณคือคุณครูวิทยาศาสตร์ใจดี" หรือ "คุณคือผู้เชี่ยวชาญการตลาด CMO"</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <BookOpen size={16} aria-hidden="true" />
                <span>3. การให้บริบทและข้อมูลแวดล้อม (Context):</span>
              </strong>
              <p className="text-slate-600">ให้ข้อมูลพื้นฐาน สภาพแวดล้อม หรือสถานการณ์แวดล้อมที่จำเป็นต่อการปฏิบัติงาน เช่น "สำหรับเด็กอายุ 10 ขวบ" หรือ "งบประมาณไม่เกิน 2,000 บาท"</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <strong className="text-amber-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <Target size={16} aria-hidden="true" />
                <span>4. การระบุภารกิจหรือสิ่งที่ต้องการ (Task):</span>
              </strong>
              <p className="text-slate-600">กำหนดเป้าหมายหรือภารกิจเฉพาะเจาะจงให้ AI ดำเนินการ เช่น "สรุปเนื้อหาบทเรียน", "ร่างบทสคริปต์คลิป 60 วินาที", "เขียนฟังก์ชัน Python"</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <strong className="text-purple-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <Layers size={16} aria-hidden="true" />
                <span>5. การกำหนดเงื่อนไขและข้อจำกัด (Constraints):</span>
              </strong>
              <p className="text-slate-600">ระบุขอบเขต ข้อห้าม หรือเงื่อนไขเพิ่มเติมเพื่อกรองผลลัพธ์ที่ไม่ต้องการ เช่น "ห้ามใช้ศัพท์เทคนิคซับซ้อน", "ขอ 3 ประเด็นหลักเท่านั้น"</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <strong className="text-rose-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <FileText size={16} aria-hidden="true" />
                <span>6. การกำหนดรูปแบบผลลัพธ์ (Output Format):</span>
              </strong>
              <p className="text-slate-600">ระบุโครงสร้างการแสดงผลลัพธ์ตามที่ต้องการ เช่น "ตอบในรูปแบบตาราง Markdown 3 คอลัมน์", "รายการ Bullet Points", หรือ "บทความ"</p>
            </div>

            <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200 space-y-1">
              <strong className="text-sky-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <RefreshCw size={16} aria-hidden="true" />
                <span>7. การปรับปรุงและทำซ้ำคำสั่ง (Prompt Refinement & Iteration):</span>
              </strong>
              <p className="text-slate-600">วิเคราะห์ผลลัพธ์ที่ได้จากการตอบสนองของ AI และทำการปรับแก้คำสั่งในรอบถัดไปเพื่อยกระดับคุณภาพของงานให้ดียิ่งขึ้น</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
