/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PomodoroTimer } from './components/PomodoroTimer';
import { TaskModal } from './components/TaskModal';
import { CourseModal } from './components/CourseModal';
import { CourseDetailModal } from './components/CourseDetailModal';
import { VoiceInputModal } from './components/VoiceInputModal';
import { TodayScreen } from './screens/TodayScreen';
import { LearnScreen } from './screens/LearnScreen';
import { AgentScreen } from './screens/AgentScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export default function App() {
  const { activeScreen, initializeApp } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col font-body selection:bg-[#7C4DFF] selection:text-white">
      {/* En-tête global */}
      <Header />

      {/* Contenu principal selon l'écran actif */}
      <main className="flex-1 w-full pt-4">
        {activeScreen === 'today' && <TodayScreen />}
        {activeScreen === 'learn' && <LearnScreen />}
        {activeScreen === 'agent' && <AgentScreen />}
        {activeScreen === 'settings' && <SettingsScreen />}
      </main>

      {/* Navigation inférieure fixe avec FAB vocal */}
      <BottomNav />

      {/* Modales globales */}
      <PomodoroTimer />
      <TaskModal />
      <CourseModal />
      <CourseDetailModal />
      <VoiceInputModal />
    </div>
  );
}
