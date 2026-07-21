import React from 'react';
import { X, Sparkles, BookOpen, CheckCircle, Target, UserCheck, Layers, FileText } from 'lucide-react';

export default function PromptCheatSheetModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-prompt">
      <div className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-blue-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                สูตรลับการเขียน Prompt (Prompt Cheat Sheet)
              </h2>
              <p className="text-xs text-slate-500">สรุป 5 องค์ประกอบสำคัญที่ทำให้ AI ตอบได้อย่างแม่นยำ 100%</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Formula Box */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md space-y-1 font-mono">
            <span className="text-[11px] uppercase tracking-wider text-blue-100 font-semibold block">โครงสร้าง Prompt Master Formula:</span>
            <p className="font-bold text-sm sm:text-base text-yellow-300">
              [ROLE] + [CONTEXT] + [TASK] + [CONSTRAINTS] + [FORMAT]
            </p>
          </div>

          {/* 5 Elements Grid */}
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <strong className="text-blue-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <UserCheck size={16} />
                <span>1. ROLE (กำหนดบทบาทให้ AI):</span>
              </strong>
              <p className="text-slate-600">บอกให้ AI รู้ว่าต้องสวมบทบาทเป็นใคร เช่น "คุณคือคุณครูวิทยาศาสตร์ใจดี" หรือ "คุณคือผู้เชี่ยวชาญการตลาด CMO"</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <BookOpen size={16} />
                <span>2. CONTEXT (ใส่บริบทและสภาพแวดล้อม):</span>
              </strong>
              <p className="text-slate-600">อธิบายสถานการณ์ กลุ่มเป้าหมาย หรือเงื่อนไขเบื้องหลัง เช่น "สำหรับเด็กอายุ 10 ขวบ" หรือ "งบประมาณไม่เกิน 2,000 บาท"</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <strong className="text-amber-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <Target size={16} />
                <span>3. TASK (คำสั่งเป้าหมายชัดเจน):</span>
              </strong>
              <p className="text-slate-600">ระบุสิ่งที่ต้องการให้ AI ทำอย่างเจาะจง เช่น "สรุปเนื้อหาบทเรียน", "ร่างบทสคริปต์คลิป 60 วินาที", "เขียนฟังก์ชัน Python"</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <strong className="text-purple-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <Layers size={16} />
                <span>4. CONSTRAINTS (เงื่อนไขบังคับและข้อห้าม):</span>
              </strong>
              <p className="text-slate-600">กำหนดขอบเขต เช่น "ห้ามใช้ศัพท์เทคนิคซับซ้อน", "ขอ 3 ประเด็นหลักเท่านั้น", "แสดงวิธีทำเป็นสเต็ป"</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <strong className="text-rose-700 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <FileText size={16} />
                <span>5. OUTPUT FORMAT (รูปแบบผลลัพธ์):</span>
              </strong>
              <p className="text-slate-600">ระบุรูปแบบที่อยากได้ เช่น "ตอบในรูปแบบตาราง Markdown 3 คอลัมน์" หรือ "รูปแบบ Bullet Points"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
