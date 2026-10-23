/**
 * agentDeep - Timer Pomodoro 25/5 Circulaire
 */

import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Play, Pause, RotateCcw, Flame, Coffee } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const { pomodoro, closePomodoro, startPomodoro, pausePomodoro, resetPomodoro, tickPomodoro } = useAppStore();

  useEffect(() => {
    let interval: any = null;
    if (pomodoro.isOpen && pomodoro.isRunning) {
      interval = setInterval(() => {
        tickPomodoro();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoro.isOpen, pomodoro.isRunning, tickPomodoro]);

  if (!pomodoro.isOpen) return null;

  const minutes = Math.floor(pomodoro.timeLeft / 60);
  const seconds = pomodoro.timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTime = (pomodoro.mode === 'WORK' ? pomodoro.workDuration : pomodoro.breakDuration) * 60;
  const progressPercent = ((totalTime - pomodoro.timeLeft) / totalTime) * 100;
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  const isWork = pomodoro.mode === 'WORK';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] rounded-[28px] shadow-[0_0_50px_rgba(124,77,255,0.25)] p-6 relative flex flex-col items-center">
        {/* Bouton Fermer */}
        <button
          onClick={closePomodoro}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#8A8A8A] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header mode */}
        <div className="flex items-center gap-2 mb-2">
          {isWork ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/50 text-[#FF6B35] text-xs font-bold shadow-[0_0_12px_rgba(255,107,53,0.3)]">
              <Flame className="w-4 h-4 fill-current" />
              <span>SESSION FOCUS (25 MIN)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold">
              <Coffee className="w-4 h-4" />
              <span>PAUSE MÉLANTE (5 MIN)</span>
            </div>
          )}
        </div>

        {pomodoro.taskTitle && (
          <p className="text-xs text-[#8A8A8A] max-w-[240px] text-center truncate mb-4">
            Tâche : <span className="text-white font-medium">{pomodoro.taskTitle}</span>
          </p>
        )}

        {/* Cercle SVG animé */}
        <div className="relative w-48 h-48 flex items-center justify-center my-3">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Cercle arrière plan */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="text-[#1C1C1C]"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Cercle de progression */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className={isWork ? 'text-[#7C4DFF]' : 'text-emerald-500'}
              strokeWidth="10"
              strokeDasharray={440}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          {/* Affichage du temps central */}
          <div className="absolute flex flex-col items-center">
            <span className="font-heading font-extrabold text-4xl text-white tracking-wider">
              {formattedTime}
            </span>
            <span className="text-[10px] text-[#8A8A8A] uppercase tracking-widest mt-1">
              {isWork ? 'Travail profond' : 'Respiration'}
            </span>
          </div>
        </div>

        {/* Compteur de cycles */}
        <p className="text-xs text-[#8A8A8A] mt-2 mb-6">
          Cycles complétés aujourd'hui :{' '}
          <span className="font-bold text-[#00E5FF]">{pomodoro.cyclesCompleted}</span>
        </p>

        {/* Contrôles */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetPomodoro}
            className="p-3 rounded-2xl bg-[#1C1C1C] border border-[#2A2A2A] text-[#8A8A8A] hover:text-white transition-colors"
            title="Réinitialiser le cycle"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={pomodoro.isRunning ? pausePomodoro : startPomodoro}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
              isWork
                ? 'bg-gradient-to-tr from-[#7C4DFF] to-[#00E5FF] shadow-[0_0_25px_rgba(124,77,255,0.5)]'
                : 'bg-emerald-600 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
            }`}
          >
            {pomodoro.isRunning ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
