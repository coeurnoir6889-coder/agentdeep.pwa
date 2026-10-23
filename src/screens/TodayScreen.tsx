/**
 * agentDeep - Écran Aujourd'hui (Dashboard Plan d'attaque & Eisenhower)
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { EisenhowerMatrix } from '../components/EisenhowerMatrix';
import { TaskCard } from '../components/TaskCard';
import { PWAInstallBanner } from '../components/PWAInstallBanner';
import {
  Plus,
  RefreshCw,
  Sparkles,
  Flame,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';

export const TodayScreen: React.FC = () => {
  const {
    settings,
    tasks,
    courses,
    dailyPlan,
    isGeneratingPlan,
    fetchDailyPlan,
    setTaskModalOpen,
  } = useAppStore();

  const userName = settings?.userName || 'Tokpa';

  // Date du jour formatée en français
  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Tâches du jour : dues aujourd'hui ou sans date ordonnées par priorité
  const priorityWeight = { URGENT: 3, IMPORTANT: 2, NORMAL: 1 };
  const todayTasks = [...tasks]
    .filter((t) => !t.dueDate || t.dueDate <= todayStr)
    .sort((a, b) => {
      // Les non-complétées en premier
      if (a.status === 'DONE' && b.status !== 'DONE') return 1;
      if (a.status !== 'DONE' && b.status === 'DONE') return -1;
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

  const dueCourses = courses.filter((c) => c.prochaineRevisionDate <= todayStr);
  const doneTasksCount = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-2">
      {/* Bannière PWA si installable */}
      <PWAInstallBanner />

      {/* Titre Principal de la journée */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Yo <span className="bg-gradient-to-r from-[#7C4DFF] via-purple-300 to-[#00E5FF] bg-clip-text text-transparent">{userName}</span>. Plan d'attaque du jour.
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1 capitalize">
            {todayFormatted}
          </p>
        </div>

        <button
          onClick={() => setTaskModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] hover:opacity-90 text-white shadow-[0_0_20px_rgba(124,77,255,0.4)] transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle tâche</span>
        </button>
      </div>

      {/* Carte "Plan du jour" générée par agentDeep ENTP */}
      <div className="relative rounded-[22px] bg-gradient-to-br from-[#1C1436] via-[#141414] to-[#0D1E29] border border-[#7C4DFF]/40 p-5 sm:p-6 shadow-[0_0_30px_rgba(124,77,255,0.15)] group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#7C4DFF]/30 border border-[#7C4DFF] flex items-center justify-center text-[#00E5FF]">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
              Radar agentDeep · ENTP
            </span>
          </div>

          <button
            onClick={() => fetchDailyPlan(true)}
            disabled={isGeneratingPlan}
            className="text-xs text-[#8A8A8A] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/70 transition-all border border-white/5"
            title="Recalculer le plan du jour"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPlan ? 'animate-spin text-[#00E5FF]' : ''}`} />
            <span className="hidden sm:inline">Recalculer</span>
          </button>
        </div>

        {isGeneratingPlan ? (
          <div className="py-4 flex items-center gap-3 text-sm text-[#8A8A8A] animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C4DFF] animate-ping" />
            <span>agentDeep analyse tes priorités FASEG et tes tâches en cours...</span>
          </div>
        ) : (
          <p className="text-sm sm:text-base text-white/95 leading-relaxed font-medium">
            {dailyPlan ||
              "Ok, on attaque. Choisis ta tâche la plus urgente, on la plie en 45 minutes et ensuite on enchaîne sur les révisions FASEG. Bon, on arrête de tourner en rond !"}
          </p>
        )}

        {/* Métriques d'amorce */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-4 text-xs text-[#8A8A8A] flex-wrap">
          <span className="flex items-center gap-1 text-[#FF6B35]">
            <Flame className="w-3.5 h-3.5" />
            <strong>{dueCourses.length}</strong> cours à réviser
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <strong>{doneTasksCount}</strong> tâches pliées
          </span>
        </div>
      </div>

      {/* Matrice Eisenhower (4 Quadrants) */}
      <EisenhowerMatrix tasks={tasks} />

      {/* Liste des tâches prioritaires du jour */}
      <div className="card-agent p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-[#7C4DFF]" />
            <h3 className="font-heading font-bold text-base sm:text-lg text-white">
              Toutes les tâches du jour
            </h3>
            <span className="text-xs text-[#8A8A8A] px-2 py-0.5 rounded-md bg-[#1C1C1C]">
              {todayTasks.length}
            </span>
          </div>
        </div>

        {todayTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A8A8A]">
            <p>Aucune tâche planifiée aujourd'hui. Profites-en pour réviser ou avancer sur ton projet !</p>
            <button
              onClick={() => setTaskModalOpen(true)}
              className="mt-3 px-3 py-1.5 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] text-[#00E5FF] hover:border-[#00E5FF] transition-colors"
            >
              + Ajouter une tâche
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
