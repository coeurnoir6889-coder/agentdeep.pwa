/**
 * agentDeep - Calendrier Interactif des Révisions & Tâches
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ScheduleType, ScheduleEntity } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Calendar as CalendarIcon,
  BookOpen,
  CheckCircle,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { schedules, courses, addSchedule, deleteSchedule } = useAppStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  // Formulaire nouveau créneau
  const [slotTitle, setSlotTitle] = useState('');
  const [slotTime, setSlotTime] = useState('09:00');
  const [slotType, setSlotType] = useState<ScheduleType>('REVISION');

  // Mois courant
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Calcul des jours du mois
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Décalage pour commencer le lundi (0: Lun, 6: Dim)
  const startOffset = (firstDayIndex + 6) % 7;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotTitle.trim()) return;

    const newSchedule: ScheduleEntity = {
      id: `sched-${Date.now()}`,
      title: slotTitle.trim(),
      date: selectedDate,
      startTime: slotTime,
      type: slotType,
    };

    await addSchedule(newSchedule);
    setSlotTitle('');
    setIsSlotModalOpen(false);
  };

  // Récupération des événements pour la date sélectionnée
  const daySchedules = schedules.filter((s) => s.date === selectedDate);
  const dayDueCourses = courses.filter((c) => c.prochaineRevisionDate === selectedDate);

  const typeBadges: Record<ScheduleType, { label: string; color: string }> = {
    COURS: { label: 'Cours', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    REVISION: { label: 'Révision', color: 'bg-[#7C4DFF]/20 text-[#7C4DFF] border-[#7C4DFF]/30' },
    TACHE: { label: 'Tâche', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    PROJET: { label: 'Projet', color: 'bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30' },
  };

  return (
    <div className="space-y-6">
      {/* En-tête Navigation Mois */}
      <div className="card-agent p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="font-heading font-bold text-base sm:text-lg text-white">
              {monthNames[month]} {year}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-[#8A8A8A] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-[#8A8A8A] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Noms des jours */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#8A8A8A] mb-2">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span>Dim</span>
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {/* Cases vides pour le décalage */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl bg-transparent" />
          ))}

          {/* Jours du mois */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDate === formattedDate;
            const isToday = new Date().toISOString().split('T')[0] === formattedDate;

            // Détection si des cours ou créneaux existent
            const hasSchedules = schedules.some((s) => s.date === formattedDate);
            const hasCoursesDue = courses.some((c) => c.prochaineRevisionDate === formattedDate);

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDate(formattedDate)}
                className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all border ${
                  isSelected
                    ? 'bg-[#7C4DFF] text-white border-[#7C4DFF] shadow-[0_0_12px_rgba(124,77,255,0.4)]'
                    : isToday
                    ? 'bg-[#1C1C1C] text-[#00E5FF] border-[#00E5FF]/40 font-bold'
                    : 'bg-[#0A0A0A] text-[#F5F5F5] border-[#2A2A2A] hover:border-[#7C4DFF]/40'
                }`}
              >
                <span className="text-xs sm:text-sm font-medium">{dayNum}</span>

                {/* Pastilles d'activités */}
                <div className="flex gap-1 mt-0.5">
                  {hasCoursesDue && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                  )}
                  {hasSchedules && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Détail de la journée sélectionnée */}
      <div className="card-agent p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-heading font-bold text-sm sm:text-base text-white">
              Planning du {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h4>
            <p className="text-xs text-[#8A8A8A]">
              {daySchedules.length} créneaux · {dayDueCourses.length} cours à réviser
            </p>
          </div>

          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#7C4DFF]/20 border border-[#7C4DFF] hover:bg-[#7C4DFF] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(124,77,255,0.2)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créneau</span>
          </button>
        </div>

        {/* Cours à réviser aujourd'hui */}
        {dayDueCourses.length > 0 && (
          <div className="mb-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E5FF] block">
              📚 Révisions Spaced Repetition prévues :
            </span>
            {dayDueCourses.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#00E5FF]" />
                  <div>
                    <span className="text-xs font-bold text-white block">{c.matiere}</span>
                    <span className="text-[11px] text-[#8A8A8A]">{c.chapitre}</span>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-medium">
                  {c.niveauMaitrise}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Liste des créneaux horaires */}
        <div className="space-y-2">
          {daySchedules.length === 0 && dayDueCourses.length === 0 ? (
            <p className="text-xs text-[#8A8A8A] italic py-4 text-center">
              Aucun créneau ni révision bloquée pour ce jour. Clique sur "+ Créneau" pour organiser ton temps.
            </p>
          ) : (
            daySchedules.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-between group hover:border-[#7C4DFF]/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-[#8A8A8A] font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#7C4DFF]" />
                    <span>{s.startTime}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">{s.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                        typeBadges[s.type]?.color
                      }`}
                    >
                      {typeBadges[s.type]?.label}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteSchedule(s.id)}
                  className="p-1 rounded-lg text-[#8A8A8A] hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modale d'ajout rapide de créneau */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] rounded-[24px] p-5 relative shadow-2xl">
            <h3 className="font-heading font-bold text-base text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#7C4DFF]" />
              Bloquer un créneau
            </h3>

            <form onSubmit={handleAddSlot} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-1 uppercase tracking-wider">
                  Intitulé *
                </label>
                <input
                  type="text"
                  required
                  value={slotTitle}
                  onChange={(e) => setSlotTitle(e.target.value)}
                  placeholder="Ex: Séance révision Simplexe ou Sprint agentDeep"
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-1 uppercase tracking-wider">
                    Heure début
                  </label>
                  <input
                    type="time"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-1 uppercase tracking-wider">
                    Type
                  </label>
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value as ScheduleType)}
                    className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]"
                  >
                    <option value="REVISION">Révision</option>
                    <option value="COURS">Cours</option>
                    <option value="TACHE">Tâche</option>
                    <option value="PROJET">Projet</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#8A8A8A] hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#7C4DFF] hover:bg-[#6a3add] text-white"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
