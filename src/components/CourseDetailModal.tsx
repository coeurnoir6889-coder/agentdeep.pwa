/**
 * agentDeep - Panneau de détail cours & Répétition Espacée
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  BookOpen,
  Calendar,
  CheckCircle,
  MessageSquare,
  History,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CourseDetailModal: React.FC = () => {
  const {
    selectedCourseForDetail,
    setSelectedCourseForDetail,
    recordRevision,
    deleteCourse,
    setActiveScreen,
    sendMessage,
  } = useAppStore();

  const course = selectedCourseForDetail;
  const [sliderMastery, setSliderMastery] = useState(course?.niveauMaitrise || 0);

  // Sync state if course changes
  React.useEffect(() => {
    if (course) {
      setSliderMastery(course.niveauMaitrise);
    }
  }, [course]);

  if (!course) return null;

  const handleMarkLearned = async () => {
    const finalScore = Math.max(sliderMastery, 75);
    await recordRevision(course.id, finalScore);
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#00E5FF', '#7C4DFF', '#34D399'],
      });
    } catch {
      // Fallback
    }
  };

  const handleAskAgent = async () => {
    const matiere = course.matiere;
    const chapitre = course.chapitre;
    setSelectedCourseForDetail(null);
    setActiveScreen('agent');

    const prompt = `Fais-moi réviser le cours de ${matiere} (chapitre : "${chapitre}"). Pose-moi une question concrète et directe par questionnement socratique pour tester si je maîtrise le sujet ou si je me raconte des histoires !`;
    await sendMessage(prompt, 'STUDY_COACH');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#141414] border border-[#2A2A2A] rounded-[24px] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={() => setSelectedCourseForDetail(null)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#8A8A8A] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C4DFF] to-[#00E5FF] p-0.5">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center text-[#00E5FF]">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C4DFF]">
              {course.matiere}
            </span>
            <h2 className="font-heading font-bold text-lg text-white">
              {course.chapitre}
            </h2>
          </div>
        </div>

        {course.notes && (
          <div className="p-3.5 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] text-xs text-[#8A8A8A] mb-5 leading-relaxed">
            <span className="font-semibold text-white block mb-1">Notes de cours :</span>
            {course.notes}
          </div>
        )}

        {/* Slider Niveau de Maîtrise */}
        <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider">
              Niveau de Maîtrise Actuel
            </span>
            <span className="text-base font-bold text-[#00E5FF] font-heading">
              {sliderMastery}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={sliderMastery}
            onChange={(e) => setSliderMastery(parseInt(e.target.value, 10))}
            className="w-full accent-[#7C4DFF] cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-[#8A8A8A] mt-1">
            <span>0% Débutant</span>
            <span>50% En cours</span>
            <span>100% Maîtrisé</span>
          </div>
        </div>

        {/* Boutons d'action Spaced Repetition */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={handleMarkLearned}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Valider la révision (Algorithme J+1 / J+3 / J+7)</span>
          </button>

          <button
            onClick={handleAskAgent}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#7C4DFF]/20 border border-[#7C4DFF] hover:bg-[#7C4DFF]/30 text-white shadow-[0_0_15px_rgba(124,77,255,0.2)] transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-[#00E5FF]" />
            <span>Discuter avec agentDeep sur ce cours</span>
          </button>
        </div>

        {/* Prochaine révision & Historique */}
        <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] mb-4">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-[#8A8A8A] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
              Prochaine révision programmée :
            </span>
            <span className="font-bold text-white bg-[#1C1C1C] px-2.5 py-1 rounded-lg border border-[#2A2A2A]">
              {course.prochaineRevisionDate}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-xs font-semibold text-[#8A8A8A] flex items-center gap-1.5 mb-2">
              <History className="w-3.5 h-3.5 text-[#7C4DFF]" />
              Historique des révisions ({course.revisionHistory.length}) :
            </span>

            {course.revisionHistory.length === 0 ? (
              <p className="text-[11px] text-[#8A8A8A] italic">Aucune révision enregistrée pour l'instant.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                {course.revisionHistory.map((revDate, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#1C1C1C] border border-[#2A2A2A] text-[#F5F5F5]"
                  >
                    {new Date(revDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bouton de suppression discret */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => deleteCourse(course.id)}
            className="text-xs text-[#8A8A8A] hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer ce cours</span>
          </button>
        </div>
      </div>
    </div>
  );
};
