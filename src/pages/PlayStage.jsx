import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../hooks/useAuth';
import { STAGES_DATA } from '../data/stagesData';
import { evaluatePrompt } from '../lib/evaluatorEngine';
import { saveAttempt, getUserStageAttempts } from '../lib/sessionStorage';
import { playVictoryChime, playPopSound } from '../lib/soundEffects';

import ChatHeader from '../components/chat/ChatHeader';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import StageSidebar from '../components/StageSidebar';
import BeforeAfterModal from '../components/BeforeAfterModal';
import PromptCheatSheetModal from '../components/PromptCheatSheetModal';
import { FileText, ChevronDown, ChevronUp, Cpu, BookOpen } from 'lucide-react';

export default function PlayStage() {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stage, setStage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [showCriteriaAccordion, setShowCriteriaAccordion] = useState(true);

  const chatEndRef = useRef(null);

  // Load stage data & attempts on mount or stageId change
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const currentId = parseInt(stageId, 10) || 6;
    const foundStage = STAGES_DATA.find(s => s.id === currentId) || STAGES_DATA.find(s => !s.is_tutorial) || STAGES_DATA[0];
    setStage(foundStage);

    // Fetch previous user attempts for this stage
    const prevAttempts = getUserStageAttempts(foundStage.id);
    setAttempts(prevAttempts);

    // Build initial chat message stream
    const initialMsgs = [
      {
        id: 'sys_1',
        type: 'ai',
        aiOutput: `สวัสดีครับ! ผม **Promptie** ครู AI ประจำด่าน ยินดีต้อนรับสู่ **Stage ${foundStage.stage_number}: ${foundStage.title}**

โจทย์ของคุณในด่านนี้:
${foundStage.problem_statement}

สิ่งที่ระบบคาดหวังใน Prompt ของคุณ:
${Object.values(foundStage.expected_criteria).map((c, i) => `${i + 1}. ${c}`).join('\n')}

พิมพ์ Prompt คำสั่งของคุณด้านล่าง แล้วส่งให้ผมประเมินได้เลยครับ (คุณมีโควต้า 3 ครั้งต่อด่าน)!`,
        isSystem: true
      }
    ];

    // Append previous user attempts to chat history
    prevAttempts.forEach(att => {
      initialMsgs.push({
        id: 'user_' + att.id,
        type: 'user',
        text: att.promptText
      });
      initialMsgs.push({
        id: 'ai_' + att.id,
        type: 'ai',
        aiOutput: att.aiOutput,
        scores: att.scores,
        totalScore: att.totalScore,
        feedback: att.feedback,
        attemptNumber: att.attemptNumber
      });
    });

    setMessages(initialMsgs);
  }, [stageId, user, navigate]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handlePromptSubmit = async (promptText) => {
    if (!stage || isLoading) return;

    const currentAttemptsCount = attempts.length;
    if (currentAttemptsCount >= 3) {
      alert('คุณใช้โควต้า 3 Attempts สำหรับด่านนี้ครบแล้วครับ! คุณสามารถลองท้าทายด่านอื่นๆ หรือดูพัฒนาการ Before/After ได้เลย');
      return;
    }

    playPopSound();
    setIsLoading(true);

    // Add user message to UI immediately
    const userMsgId = 'usr_' + Date.now();
    setMessages(prev => [...prev, { id: userMsgId, type: 'user', text: promptText }]);

    try {
      // Evaluate prompt using AI Evaluator Engine
      const result = await evaluatePrompt({
        promptText,
        stage,
        previousAttemptsCount: currentAttemptsCount
      });

      // Save attempt to storage
      const savedAttempt = saveAttempt({
        stageId: stage.id,
        stageNumber: stage.stage_number,
        promptText,
        aiOutput: result.aiOutput,
        scores: result.scores,
        feedback: result.feedback,
        totalScore: result.totalScore
      });

      // Update attempts state
      const updatedAttempts = [...attempts, savedAttempt];
      setAttempts(updatedAttempts);

      // Add AI response message to UI with maxScore for display
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_' + savedAttempt.id,
          type: 'ai',
          aiOutput: result.aiOutput,
          scores: result.scores,
          totalScore: result.totalScore,
          maxScore: result.maxScore || 20,
          feedback: result.feedback,
          attemptNumber: savedAttempt.attemptNumber
        }
      ]);

      // Victory chime & Confetti celebration if high score (≥25/35 ~71%)
      if (result.totalScore >= 14) {
        playVictoryChime();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      alert('เกิดข้อผิดพลาดในการประเมินผล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const attemptsLeft = Math.max(0, 3 - (attempts?.length || 0));
  const validScores = (attempts || []).map(a => Number(a.totalScore)).filter(s => !isNaN(s));
  const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;

  if (!stage) return null;

  return (
    <div className="flex h-[100dvh] bg-slate-50 text-slate-900 overflow-hidden relative font-prompt">
      {/* Skip to Main Content Link */}
      <a href="#chat-stream" className="skip-link">
        ข้ามไปที่บริเวณพิมพ์ Prompt (Skip to Chat)
      </a>

      {/* Left Collapsible Drawer Sidebar */}
      <StageSidebar
        currentStageId={stage?.id}
        onSelectStage={(id) => navigate(`/play/${id}`)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Center Main Chat Panel Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <ChatHeader
          stage={stage}
          attemptsLeft={attemptsLeft}
          maxScore={maxScore}
          onToggleSidebar={() => { playPopSound(); setIsSidebarOpen(!isSidebarOpen); }}
          onOpenCompare={() => { playPopSound(); setIsCompareOpen(true); }}
          hasMultipleAttempts={attempts.length >= 2}
        />

        {/* Problem Statement Banner / Accordion with Mascot Mini Widget */}
        <div className="bg-white border-b-2 border-slate-200 px-3 sm:px-6 py-2.5 shrink-0 shadow-xs">
          <div className="max-w-4xl mx-auto font-prompt">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowCriteriaAccordion(!showCriteriaAccordion)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-blue-700 transition-colors min-h-[36px] cursor-pointer"
              >
                <FileText size={16} className="text-blue-600 shrink-0" />
                <span className="truncate">คำอธิบายโจทย์ & เงื่อนไขบังคับ</span>
                {showCriteriaAccordion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* Prompt Cheat Sheet Button */}
              <button
                onClick={() => { playPopSound(); setIsCheatSheetOpen(true); }}
                className="px-3 py-1 rounded-full bg-blue-50 border-2 border-blue-200/80 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 font-prompt shadow-xs"
              >
                <BookOpen size={13} className="text-blue-600" />
                <span>ดูสูตรลับ Prompt</span>
              </button>
            </div>

            {showCriteriaAccordion && (
              <div className="mt-2.5 p-3.5 bg-slate-50/80 rounded-3xl border-2 border-slate-200/80 space-y-2 text-xs text-slate-700 animate-slide-up shadow-xs">
                <p className="font-medium text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {stage.problem_statement}
                </p>

                {stage.constraints && stage.constraints.length > 0 && (
                  <div className="pt-2 border-t-2 border-slate-200/80">
                    <strong className="text-amber-800 block mb-1 font-prompt">เงื่อนไขบังคับ:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      {stage.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages Stream Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isThinking={isLoading}
              />
            ))}

            {/* Enhanced Thinking Indicator with staggered bouncing dots */}
            {isLoading && (
              <div className="py-5 px-3 sm:px-6 bg-slate-100/60 border-y border-slate-200 animate-fade-in">
                <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4 items-center">
                  <div className="relative shrink-0">
                    <img
                      src="/assets/logo.webp"
                      alt="Promptie กำลังคิด"
                      className="w-9 h-9 rounded-full border-2 border-blue-200 object-contain animate-pulse"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-700 font-semibold min-w-0">
                    <Cpu size={16} className="animate-spin text-blue-600 shrink-0" />
                    <span className="truncate">Promptie กำลังประมวลผลคำสั่งของคุณ</span>
                    <span className="flex items-center gap-1 shrink-0 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" style={{ animationDelay: '200ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" style={{ animationDelay: '400ms' }} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Bottom ChatGPT Input Bar with Starters & Hints */}
        <ChatInput
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          attemptsLeft={attemptsLeft}
          stageStarters={stage.starters}
          stageHint={stage.hint}
        />
      </div>

      {/* Before/After Growth Comparison Modal */}
      <BeforeAfterModal
        attempts={attempts}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      {/* Prompt Cheat Sheet Master Formula Modal */}
      <PromptCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
}