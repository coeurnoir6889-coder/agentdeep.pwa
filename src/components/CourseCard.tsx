/**
 * agentDeep - Carte de cours FASEG & Spaced Repetition
 */

import React from 'react';
import type { CourseEntity } from '../types';
import { useAppStore } from '../store/useAppStore';
import { isCourseDue } from '../services/spacedRepetitionService';
import { BookOpen, Calendar, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  course: CourseEntity;
}

export const CourseCard: React.FC<Props> = ({ course }) => {
  const { setSelectedCourseForDetail } = useAppStore();

  const isDue = isCourseDue(course.prochaineRevisionDate);
  const mastery = course.niveauMaitrise;

  // Code couleur de maîtrise
  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 50) return 'from-amber-500 to-[#FF6B35]';
    return 'from-rose-500 to-red-500';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = course.prochaineRevisionDate === todayStr;

  return (
    <div
      onClick={() => setSelectedCourseForDetail(course)}
      className="card-agent p-4 sm:p-5 cursor-pointer relative group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7C4DFF]/15 border border-[#7C4DFF]/40 flex items-center justify-center text-[#7C4DFF]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-white group-hover:text-[#00E5FF] transition-colors line-clamp-1">
                {course.matiere}
              </h3>
              <p className="text-xs text-[#8A8A8A] line-clamp-1">{course.chapitre}</p>
            </div>
          </div>

          {/* Badge statut révision */}
          {isDue ? (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
              <AlertCircle className="w-3 h-3" />
              {isToday ? "Aujourd'hui" : "En retard"}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              À jour
            </span>
          )}
        </div>

        {/* Barre de progression de maîtrise */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#8A8A8A]">Maîtrise</span>
            <span className="font-bold text-white">{mastery}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#1C1C1C] overflow-hidden p-0.5 border border-[#2A2A2A]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getMasteryColor(mastery)} transition-all duration-500`}
              style={{ width: `${Math.max(mastery, 4)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer carte */}
      <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-[#8A8A8A]">
          <Calendar className="w-3.5 h-3.5 text-[#7C4DFF]" />
          <span>Rév : {course.prochaineRevisionDate}</span>
        </span>

        <button className="flex items-center gap-1 text-[#00E5FF] font-medium group-hover:translate-x-1 transition-transform">
          <span>Réviser</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
