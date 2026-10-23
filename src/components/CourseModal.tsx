/**
 * agentDeep - Modale d'ajout de cours FASEG
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, BookPlus, Sparkles } from 'lucide-react';

export const CourseModal: React.FC = () => {
  const { isCourseModalOpen, setCourseModalOpen, addCourse } = useAppStore();

  const [matiere, setMatiere] = useState('Recherche Opérationnelle');
  const [chapitre, setChapitre] = useState('');
  const [notes, setNotes] = useState('');

  if (!isCourseModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapitre.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newId = `course-${Date.now()}`;

    await addCourse({
      id: newId,
      matiere,
      chapitre: chapitre.trim(),
      niveauMaitrise: 0,
      prochaineRevisionDate: todayStr,
      revisionHistory: [],
      notes: notes.trim() || undefined,
    });

    setChapitre('');
    setNotes('');
  };

  const matieresFaseg = [
    'Recherche Opérationnelle',
    'Comptabilité Générale',
    'Microéconomie',
    'Statistiques',
    'Droit des Affaires',
    'Marketing',
    'Macroéconomie',
    'Finance d\'Entreprise',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-[24px] shadow-2xl p-6 relative">
        <button
          onClick={() => setCourseModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#8A8A8A] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF] flex items-center justify-center text-[#00E5FF]">
            <BookPlus className="w-5 h-5" />
          </div>
          <h2 className="font-heading font-bold text-lg text-white">
            Nouveau Cours / Chapitre
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 uppercase tracking-wider">
              Matière FASEG *
            </label>
            <select
              value={matiere}
              onChange={(e) => setMatiere(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
            >
              {matieresFaseg.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 uppercase tracking-wider">
              Titre du Chapitre ou Concept Clé *
            </label>
            <input
              type="text"
              required
              value={chapitre}
              onChange={(e) => setChapitre(e.target.value)}
              placeholder="Ex: Programmation Linéaire - Dualité & Analyse de sensibilité"
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 uppercase tracking-wider">
              Notes / Objectifs de révision
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Formules clés, questions d'annales ou pièges récurrents..."
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[#00E5FF] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setCourseModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#8A8A8A] hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ajouter au Cerveau</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
