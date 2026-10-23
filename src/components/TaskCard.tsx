/**
 * agentDeep - Carte de tâche avec Pomodoro et micro-interactions
 */

import React from 'react';
import type { TaskEntity } from '../types';
import { useAppStore } from '../store/useAppStore';
import { Check, Clock, Trash2, Tag, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  task: TaskEntity;
  compact?: boolean;
}

export const TaskCard: React.FC<Props> = ({ task, compact = false }) => {
  const { toggleTaskComplete, deleteTask, openPomodoro } = useAppStore();

  const handleToggle = () => {
    if (task.id) {
      if (task.status !== 'DONE') {
        // Déclenche une pluie de confettis sur validation de tâche
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#7C4DFF', '#00E5FF', '#FF6B35'],
          });
        } catch {
          // Fallback silencieux
        }
      }
      toggleTaskComplete(task.id);
    }
  };

  const isDone = task.status === 'DONE';

  const priorityColors = {
    URGENT: 'text-[#FF6B35] bg-[#FF6B35]/15 border-[#FF6B35]/40',
    IMPORTANT: 'text-[#7C4DFF] bg-[#7C4DFF]/15 border-[#7C4DFF]/40',
    NORMAL: 'text-[#8A8A8A] bg-white/5 border-white/10',
  };

  return (
    <div
      className={`group relative rounded-[16px] bg-[#141414] border transition-all ${
        isDone
          ? 'border-[#2A2A2A] opacity-60'
          : 'border-[#2A2A2A] hover:border-[#7C4DFF]/50 hover:shadow-[0_0_15px_rgba(124,77,255,0.12)]'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-start gap-3">
        {/* Case à cocher custom animée */}
        <button
          onClick={handleToggle}
          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            isDone
              ? 'bg-[#7C4DFF] text-white shadow-[0_0_10px_rgba(124,77,255,0.5)]'
              : 'border-2 border-[#8A8A8A]/40 hover:border-[#00E5FF] text-transparent hover:text-[#00E5FF]/40'
          }`}
          aria-label={isDone ? 'Marquer comme non fait' : 'Marquer comme fait'}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Détails de la tâche */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium tracking-tight break-words ${
                isDone ? 'line-through text-[#8A8A8A]' : 'text-[#F5F5F5]'
              }`}
            >
              {task.title}
            </span>

            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md border ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && !compact && (
            <p className="mt-1 text-xs text-[#8A8A8A] line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Méta-tags */}
          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-[#8A8A8A]">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00E5FF]" />
                <span>{task.dueDate}</span>
              </span>
            )}

            {task.projectTag && (
              <span className="flex items-center gap-1 text-[#7C4DFF]">
                <Tag className="w-3 h-3" />
                <span>{task.projectTag}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {!isDone && (
            <button
              onClick={() => openPomodoro(task.id, task.title)}
              className="p-1.5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-[#00E5FF] hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/40 transition-colors"
              title="Lancer Pomodoro 25 min"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            onClick={() => task.id && deleteTask(task.id)}
            className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-red-400 hover:bg-red-950/30 transition-colors"
            title="Supprimer la tâche"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
