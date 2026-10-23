/**
 * agentDeep - En-tête principal & statut
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Settings, WifiOff, Flame } from 'lucide-react';

export const Header: React.FC = () => {
  const { settings, isOnline, setActiveScreen, activeScreen } = useAppStore();

  let examDaysRemaining: number | null = null;
  if (settings?.isExamMode && settings?.examDate) {
    const diff = new Date(settings.examDate).getTime() - new Date().getTime();
    examDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2A2A2A] px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo & Marque */}
        <div 
          onClick={() => setActiveScreen('today')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C4DFF] to-[#00E5FF] p-0.5 shadow-[0_0_15px_rgba(124,77,255,0.4)] group-hover:shadow-[0_0_22px_rgba(0,229,255,0.6)] transition-all">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center overflow-hidden">
              <svg className="w-5 h-5 text-[#00E5FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-4 4 4 4 0 0 0 4 4v1a4 4 0 0 0 4 4 4 4 0 0 0 4-4v-1a4 4 0 0 0 4-4 4 4 0 0 0-4-4V6a4 4 0 0 0-4-4Z" />
                <path d="M12 2v20" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#7C4DFF] bg-clip-text text-transparent">
                agentDeep
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-[#7C4DFF]/20 text-[#00E5FF] border border-[#7C4DFF]/40">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-[#8A8A8A] -mt-0.5 hidden sm:block">
              Ton cerveau externe, sans filtre.
            </p>
          </div>
        </div>

        {/* Badges statut & actions */}
        <div className="flex items-center gap-2">
          {/* Mode Examen Badge */}
          {settings?.isExamMode && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-950/50 border border-[#FF6B35]/60 text-[#FF6B35] text-xs font-bold animate-pulse shadow-[0_0_12px_rgba(255,107,53,0.3)]">
              <Flame className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>EXAMEN J-{examDaysRemaining !== null ? examDaysRemaining : '??'}</span>
            </div>
          )}

          {/* Statut Réseau / Offline */}
          {!isOnline && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hors ligne</span>
            </div>
          )}

          {/* Bouton Réglages */}
          <button
            onClick={() => setActiveScreen('settings')}
            className={`p-2 rounded-xl transition-all border ${
              activeScreen === 'settings'
                ? 'bg-[#7C4DFF]/20 border-[#7C4DFF] text-white shadow-[0_0_15px_rgba(124,77,255,0.3)]'
                : 'bg-[#141414] border-[#2A2A2A] text-[#8A8A8A] hover:text-[#F5F5F5] hover:border-[#7C4DFF]/50'
            }`}
            aria-label="Paramètres"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
