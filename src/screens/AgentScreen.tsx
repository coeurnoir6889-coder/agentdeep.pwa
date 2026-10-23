/**
 * agentDeep - Écran Agent Chat ENTP aux 6 Rôles
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ChatBubble } from '../components/ChatBubble';
import {
  Send,
  Sparkles,
  RotateCcw,
  Briefcase,
  Flame,
  Mic,
  Bot,
} from 'lucide-react';
import type { AgentRole } from '../types';

export const AgentScreen: React.FC = () => {
  const {
    messages,
    sendMessage,
    clearChat,
    isAiThinking,
    settings,
    updateSettings,
    setVoiceModalOpen,
    projects,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<AgentRole | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isAiThinking) return;

    const messageText = input.trim();
    setInput('');
    await sendMessage(messageText, selectedRole);
    setSelectedRole(undefined); // Reset après envoi
  };

  // Raccourci Mode Business
  const handleTriggerBusinessMode = () => {
    const mainProject = projects[0]?.name || 'agentDeep';
    setSelectedRole('BUSINESS_COACH');
    setInput(
      `Propose-moi 3 modèles économiques viables et réalistes pour mon projet "${mainProject}", avec un pricing testable en 30 jours et une estimation du potentiel marché (Afrique de l'Ouest / global).`
    );
  };

  // Suggestions rapides pour l'utilisateur
  const quickPrompts = [
    { label: '⚡ Pourquoi je fuis mes tâches ?', prompt: "Tu fuis la tâche la plus importante, pourquoi ? Secoue-moi et aide-moi à découper ce qui me bloque.", role: 'TASK_COACH' as AgentRole },
    { label: '📚 Réviser Simplexe (RO)', prompt: "Fais-moi réviser la Recherche Opérationnelle par questionnement socratique. Pose-moi une première question piège !", role: 'STUDY_COACH' as AgentRole },
    { label: '💼 Monétiser mon app', prompt: "Challenge le business model de mon projet agentDeep. Qui paierait pour ça et combien ?", role: 'BUSINESS_COACH' as AgentRole },
    { label: '🎤 Booster mon élocution', prompt: "Aide-moi à structurer une présentation orale de 3 minutes percutante pour une soutenance.", role: 'SPEECH_COACH' as AgentRole },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-135px)] max-w-4xl mx-auto px-4">
      {/* Barre d'outils supérieure du Chat */}
      <div className="py-2.5 px-3 rounded-2xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-between gap-2 shrink-0 mb-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7C4DFF] to-[#00E5FF] p-0.5">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[6px] flex items-center justify-center text-[#00E5FF]">
              <Bot className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="font-heading font-bold text-xs text-white block">
              agentDeep
            </span>
            <span className="text-[10px] text-[#8A8A8A] block -mt-0.5">
              ENTP · 6 rôles actifs
            </span>
          </div>
        </div>

        {/* Boutons d'actions rapides */}
        <div className="flex items-center gap-1.5">
          {/* Raccourci Mode Business */}
          <button
            onClick={handleTriggerBusinessMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-950/40 border border-[#FF6B35]/40 text-[#FF6B35] hover:bg-[#FF6B35]/20 text-xs font-semibold transition-all"
            title="Brainstormer un modèle économique"
          >
            <Briefcase className="w-3 h-3" />
            <span className="hidden sm:inline">Mode Business</span>
          </button>

          {/* Toggle Mode Examen */}
          <button
            onClick={() => updateSettings({ isExamMode: !settings?.isExamMode })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
              settings?.isExamMode
                ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-[0_0_12px_rgba(255,107,53,0.5)]'
                : 'bg-[#1C1C1C] border-[#2A2A2A] text-[#8A8A8A] hover:text-white'
            }`}
            title="Activer/Désactiver le Mode Examen"
          >
            <Flame className="w-3 h-3" />
            <span className="hidden sm:inline">Examen</span>
          </button>

          {/* Nouvelle conversation */}
          <button
            onClick={clearChat}
            className="p-1.5 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] text-[#8A8A8A] hover:text-white hover:bg-white/10 transition-colors"
            title="Nouvelle conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zone des messages défilante */}
      <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-1">
        {messages.map((msg, index) => (
          <ChatBubble key={msg.id || index} message={msg} />
        ))}

        {/* Indicateur de réflexion */}
        {isAiThinking && (
          <div className="flex items-center gap-3 my-3">
            <div className="w-8 h-8 rounded-xl bg-[#7C4DFF]/20 border border-[#7C4DFF] flex items-center justify-center text-[#00E5FF] animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#141414] border border-[#2A2A2A] text-xs text-[#8A8A8A] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-spin" />
              <span>agentDeep réfléchit...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Raccourcis de requêtes socratiques */}
      {messages.length <= 3 && (
        <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedRole(qp.role);
                setInput(qp.prompt);
              }}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-[#141414] border border-[#2A2A2A] hover:border-[#7C4DFF] text-[#8A8A8A] hover:text-white transition-all shadow-sm"
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Zone de saisie inférieure */}
      <form
        onSubmit={handleSend}
        className="mt-2 mb-2 p-1.5 rounded-[22px] bg-[#141414] border border-[#2A2A2A] focus-within:border-[#7C4DFF] shadow-2xl flex items-center gap-2 shrink-0 transition-colors"
      >
        <button
          type="button"
          onClick={() => setVoiceModalOpen(true)}
          className="p-2.5 rounded-xl text-[#8A8A8A] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
          title="Dictée vocale"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Parle à agentDeep sans filtre..."
          className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder-[#8A8A8A] focus:outline-none"
        />

        <button
          type="submit"
          disabled={!input.trim() || isAiThinking}
          className="p-2.5 rounded-xl bg-[#7C4DFF] hover:bg-[#683bdf] disabled:opacity-30 text-white shadow-[0_0_12px_rgba(124,77,255,0.4)] transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
