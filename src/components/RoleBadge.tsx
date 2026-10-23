/**
 * agentDeep - Badge de rôle discret pour les messages de l'agent
 */

import React from 'react';
import type { AgentRole } from '../types';
import { CheckSquare, BookOpen, Target, Brain, Mic, Briefcase } from 'lucide-react';

interface Props {
  role?: AgentRole;
}

export const RoleBadge: React.FC<Props> = ({ role }) => {
  if (!role) return null;

  const roleConfig: Record<AgentRole, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
    TASK_COACH: {
      label: 'Assistant Tâches',
      icon: <CheckSquare className="w-3 h-3 text-cyan-400" />,
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-300',
      border: 'border-cyan-500/30',
    },
    STUDY_COACH: {
      label: 'Coach Études FASEG',
      icon: <BookOpen className="w-3 h-3 text-amber-400" />,
      bg: 'bg-amber-950/40',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
    },
    PROJECT_COACH: {
      label: 'Coach Projet',
      icon: <Target className="w-3 h-3 text-violet-400" />,
      bg: 'bg-violet-950/40',
      text: 'text-violet-300',
      border: 'border-violet-500/30',
    },
    LIFE_COACH: {
      label: 'Coach Perso',
      icon: <Brain className="w-3 h-3 text-emerald-400" />,
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
    },
    SPEECH_COACH: {
      label: 'Élocution & Pitch',
      icon: <Mic className="w-3 h-3 text-rose-400" />,
      bg: 'bg-rose-950/40',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
    },
    BUSINESS_COACH: {
      label: 'Business Model',
      icon: <Briefcase className="w-3 h-3 text-orange-400" />,
      bg: 'bg-orange-950/40',
      text: 'text-orange-300',
      border: 'border-orange-500/30',
    },
  };

  const current = roleConfig[role];
  if (!current) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${current.bg} ${current.text} ${current.border} transition-all`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};
