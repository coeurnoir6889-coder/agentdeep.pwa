/**
 * agentDeep - Matrice Eisenhower 4 Quadrants
 */

import React, { useState } from 'react';
import type { TaskEntity } from '../types';
import { TaskCard } from './TaskCard';
import { Flame, Star, Zap, Archive, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  tasks: TaskEntity[];
}

export const EisenhowerMatrix: React.FC<Props> = ({ tasks }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Filtrage des tâches non complétées par quadrant
  const activeTasks = tasks.filter((t) => t.status !== 'DONE');

  // Quadrant 1 : Urgent & Important
  const q1 = activeTasks.filter((t) => t.priority === 'URGENT');
  // Quadrant 2 : Important seul
  const q2 = activeTasks.filter((t) => t.priority === 'IMPORTANT');
  // Quadrant 3 : Urgent seul ou Normal avec date courte
  const q3 = activeTasks.filter((t) => t.priority === 'NORMAL' && t.dueDate === new Date().toISOString().split('T')[0]);
  // Quadrant 4 : Autres
  const q4 = activeTasks.filter((t) => t.priority === 'NORMAL' && t.dueDate !== new Date().toISOString().split('T')[0]);

  return (
    <div className="card-agent p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
          <h3 className="font-heading font-bold text-base sm:text-lg text-white">
            Matrice Eisenhower
          </h3>
          <span className="text-xs text-[#8A8A8A] px-2 py-0.5 rounded-md bg-[#1C1C1C]">
            {activeTasks.length} en cours
          </span>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-[#8A8A8A] hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>{collapsed ? 'Déplier' : 'Réduire'}</span>
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Quadrant 1 : Urgent & Important */}
          <div className="p-3.5 rounded-[16px] bg-[#0A0A0A] border border-[#FF6B35]/40 hover:border-[#FF6B35] transition-all">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FF6B35]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
                  1. Urgent & Important
                </span>
              </div>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#FF6B35]/20 text-[#FF6B35]">
                {q1.length}
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {q1.length === 0 ? (
                <p className="text-[11px] text-[#8A8A8A] italic py-2">Rien d'urgent. Respire ou anticipe !</p>
              ) : (
                q1.map((t) => <TaskCard key={t.id} task={t} compact />)
              )}
            </div>
          </div>

          {/* Quadrant 2 : Important */}
          <div className="p-3.5 rounded-[16px] bg-[#0A0A0A] border border-[#7C4DFF]/40 hover:border-[#7C4DFF] transition-all">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#7C4DFF]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C4DFF]">
                  2. Important (Planifier)
                </span>
              </div>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#7C4DFF]/20 text-[#7C4DFF]">
                {q2.length}
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {q2.length === 0 ? (
                <p className="text-[11px] text-[#8A8A8A] italic py-2">Aucun chantier stratégique planifié.</p>
              ) : (
                q2.map((t) => <TaskCard key={t.id} task={t} compact />)
              )}
            </div>
          </div>

          {/* Quadrant 3 : Urgent mais délégable / rapide */}
          <div className="p-3.5 rounded-[16px] bg-[#0A0A0A] border border-[#00E5FF]/30 hover:border-[#00E5FF] transition-all">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#00E5FF]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
                  3. Urgent (Expédier vite)
                </span>
              </div>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF]">
                {q3.length}
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {q3.length === 0 ? (
                <p className="text-[11px] text-[#8A8A8A] italic py-2">Aucune tâche ponctuelle immédiate.</p>
              ) : (
                q3.map((t) => <TaskCard key={t.id} task={t} compact />)
              )}
            </div>
          </div>

          {/* Quadrant 4 : Ni l'un ni l'autre */}
          <div className="p-3.5 rounded-[16px] bg-[#0A0A0A] border border-[#2A2A2A] hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-[#8A8A8A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
                  4. Secondaire (Backlog)
                </span>
              </div>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-[#8A8A8A]">
                {q4.length}
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {q4.length === 0 ? (
                <p className="text-[11px] text-[#8A8A8A] italic py-2">Backlog vide.</p>
              ) : (
                q4.map((t) => <TaskCard key={t.id} task={t} compact />)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
