/**
 * agentDeep - Modale d'ajout de tâche
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { TaskPriority } from '../types';
import { X, Plus, Calendar, Tag } from 'lucide-react';

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, setTaskModalOpen, addTask, projects } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('IMPORTANT');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectTag, setProjectTag] = useState('agentDeep');

  if (!isTaskModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: 'TODO',
      dueDate,
      projectTag: projectTag.trim() || undefined,
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-[24px] shadow-2xl p-6 relative">
        <button
          onClick={() => setTaskModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#8A8A8A] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#7C4DFF]/20 border border-[#7C4DFF] flex items-center justify-center text-[#7C4DFF]">
            <Plus className="w-5 h-5" />
          </div>
          <h2 className="font-heading font-bold text-lg text-white">
            Nouvelle Tâche
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 uppercase tracking-wider">
              Titre de l'action *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réviser le tableau du simplexe en RO..."
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 uppercase tracking-wider">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails, liens ou critères de complétion..."
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[#00E5FF] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 uppercase tracking-wider">
              Priorité (Matrice Eisenhower)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['URGENT', 'IMPORTANT', 'NORMAL'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                const colors = {
                  URGENT: isSelected ? 'bg-[#FF6B35] text-white border-[#FF6B35]' : 'bg-[#1C1C1C] text-[#FF6B35] border-[#FF6B35]/30',
                  IMPORTANT: isSelected ? 'bg-[#7C4DFF] text-white border-[#7C4DFF]' : 'bg-[#1C1C1C] text-[#7C4DFF] border-[#7C4DFF]/30',
                  NORMAL: isSelected ? 'bg-slate-700 text-white border-slate-600' : 'bg-[#1C1C1C] text-[#8A8A8A] border-[#2A2A2A]',
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${colors[p]}`}
                  >
                    {p === 'URGENT' ? '🔥 Urgent' : p === 'IMPORTANT' ? '⭐ Important' : 'Normal'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#00E5FF]" /> Échéance
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#7C4DFF]" /> Projet / Tag
              </label>
              <input
                type="text"
                value={projectTag}
                onChange={(e) => setProjectTag(e.target.value)}
                list="project-suggestions"
                placeholder="Ex: FASEG, agentDeep..."
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]"
              />
              <datalist id="project-suggestions">
                <option value="FASEG" />
                {projects.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setTaskModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#8A8A8A] hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7C4DFF] hover:bg-[#683bdf] text-white shadow-[0_0_15px_rgba(124,77,255,0.4)] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Créer la tâche</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
