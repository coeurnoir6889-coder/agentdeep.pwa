/**
 * agentDeep - Écran Cours & Cerveau (Vue Liste / Calendrier & Spaced Repetition)
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CourseCard } from '../components/CourseCard';
import { CalendarView } from '../components/CalendarView';
import {
  BookOpen,
  Calendar,
  List,
  Plus,
  BarChart3,
  TrendingUp,
  Brain,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export const LearnScreen: React.FC = () => {
  const { courses, setCourseModalOpen } = useAppStore();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showChart, setShowChart] = useState(false);

  // Calcul du taux moyen de maîtrise
  const avgMastery = courses.length
    ? Math.round(courses.reduce((acc, c) => acc + c.niveauMaitrise, 0) / courses.length)
    : 0;

  // Données pour le graphique Recharts
  const chartData = courses.map((c) => ({
    name: c.matiere.split(' ')[0], // Nom raccourci pour l'axe
    fullMatiere: c.matiere,
    maitrise: c.niveauMaitrise,
  }));

  const getBarColor = (val: number) => {
    if (val >= 80) return '#10B981';
    if (val >= 50) return '#FF6B35';
    return '#7C4DFF';
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-2">
      {/* En-tête de section */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Cours & Cerveau
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#7C4DFF]/20 text-[#00E5FF] font-bold border border-[#7C4DFF]/40">
              FASEG
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1">
            Répétition espacée (J+1, J+3, J+7, J+14) et suivi de maîtrise.
          </p>
        </div>

        <button
          onClick={() => setCourseModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] hover:opacity-90 text-white shadow-[0_0_20px_rgba(124,77,255,0.4)] transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Cours</span>
        </button>
      </div>

      {/* Barre de contrôle : Toggle Liste / Calendrier & Graphique */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex rounded-xl bg-[#141414] border border-[#2A2A2A] p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-[#7C4DFF] text-white shadow-[0_0_12px_rgba(124,77,255,0.4)]'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Liste des cours</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'calendar'
                ? 'bg-[#7C4DFF] text-white shadow-[0_0_12px_rgba(124,77,255,0.4)]'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendrier</span>
          </button>
        </div>

        {viewMode === 'list' && (
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] border border-[#2A2A2A] text-xs font-medium text-[#8A8A8A] hover:text-white hover:border-[#00E5FF] transition-all"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>{showChart ? 'Masquer stats' : 'Voir progression'}</span>
          </button>
        )}
      </div>

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Carte statistique globale */}
          <div className="rounded-[20px] bg-[#141414] border border-[#2A2A2A] p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C4DFF]/20 border border-[#7C4DFF]/40 flex items-center justify-center text-[#7C4DFF]">
                <Brain className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <div>
                <span className="text-xs text-[#8A8A8A] block">Niveau de maîtrise global</span>
                <span className="font-heading font-extrabold text-xl text-white">
                  {avgMastery}% de rétention
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{courses.length} matières FASEG</span>
            </div>
          </div>

          {/* Graphique de progression Recharts */}
          {showChart && (
            <div className="card-agent p-5 animate-fade-in">
              <h3 className="font-heading font-bold text-sm text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#7C4DFF]" />
                Niveau par matière (%)
              </h3>
              <div className="w-full h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#8A8A8A"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#8A8A8A"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#1C1C1C] border border-[#2A2A2A] p-2.5 rounded-xl shadow-xl text-xs">
                              <p className="font-bold text-white mb-1">{data.fullMatiere}</p>
                              <p className="text-[#00E5FF]">Maîtrise : {data.maitrise}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="maitrise" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.maitrise)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Grille des cartes de cours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Vue Calendrier */}
      {viewMode === 'calendar' && <CalendarView />}
    </div>
  );
};
