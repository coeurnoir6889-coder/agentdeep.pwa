/**
 * agentDeep - Bottom Navigation & FAB Micro
 */

import React from 'react';
import { useAppStore, type ActiveScreen } from '../store/useAppStore';
import { CalendarCheck, GraduationCap, Bot, Mic } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeScreen, setActiveScreen, setVoiceModalOpen } = useAppStore();

  const navItems: Array<{ id: ActiveScreen; label: string; icon: React.ReactNode }> = [
    {
      id: 'today',
      label: "Aujourd'hui",
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: 'learn',
      label: 'Cours',
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      id: 'agent',
      label: 'Agent',
      icon: <Bot className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      {/* FAB Micro central flottant au-dessus */}
      <div className="relative flex justify-center pointer-events-auto">
        <button
          onClick={() => setVoiceModalOpen(true)}
          aria-label="Commande vocale"
          className="absolute -top-6 w-14 h-14 rounded-full bg-gradient-to-tr from-[#7C4DFF] to-[#00E5FF] text-white flex items-center justify-center shadow-[0_0_25px_rgba(124,77,255,0.6)] active:scale-95 transition-transform hover:shadow-[0_0_35px_rgba(0,229,255,0.7)] group border border-white/20"
        >
          <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -inset-1 rounded-full border border-cyan-400/40 animate-ping pointer-events-none opacity-40" />
        </button>
      </div>

      {/* Barre de navigation inférieure */}
      <nav className="pointer-events-auto bg-[#141414]/95 backdrop-blur-lg border-t border-[#2A2A2A] px-6 py-2.5 flex items-center justify-around max-w-lg mx-auto shadow-2xl">
        {navItems.map((item, index) => {
          const isActive = activeScreen === item.id;
          return (
            <React.Fragment key={item.id}>
              {/* Espace central pour le FAB */}
              {index === 2 && <div className="w-12" />}

              <button
                onClick={() => setActiveScreen(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-[#7C4DFF] font-semibold drop-shadow-[0_0_8px_rgba(124,77,255,0.6)]'
                    : 'text-[#8A8A8A] hover:text-[#F5F5F5]'
                }`}
              >
                {item.icon}
                <span className="text-[11px] tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF] shadow-[0_0_8px_#7C4DFF] absolute -bottom-1" />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};
