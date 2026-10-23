/**
 * agentDeep - Store Zustand Global
 * Orchestre l'état réactif avec la synchronisation Dexie
 */

import { create } from 'zustand';
import type {
  TaskEntity,
  CourseEntity,
  ScheduleEntity,
  ProjectEntity,
  ChatMessageEntity,
  SettingsEntity,
  AgentRole,
  VoiceParsedAction,
} from '../types';
import {
  tasksRepo,
  coursesRepo,
  schedulesRepo,
  projectsRepo,
  chatRepo,
  settingsRepo,
} from '../db/repositories';
import { calculateNextRevisionDate } from '../services/spacedRepetitionService';
import { geminiService } from '../services/geminiService';
import { notificationService } from '../services/notificationService';

export type ActiveScreen = 'today' | 'learn' | 'agent' | 'settings';

interface PomodoroState {
  isOpen: boolean;
  taskId?: number;
  taskTitle?: string;
  isRunning: boolean;
  mode: 'WORK' | 'BREAK';
  timeLeft: number; // en secondes
  workDuration: number; // minutes (25 par défaut)
  breakDuration: number; // minutes (5 par défaut)
  cyclesCompleted: number;
}

interface AppStore {
  // Navigation
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;

  // Données
  tasks: TaskEntity[];
  courses: CourseEntity[];
  schedules: ScheduleEntity[];
  projects: ProjectEntity[];
  messages: ChatMessageEntity[];
  settings: SettingsEntity | null;
  dailyPlan: string;
  isGeneratingPlan: boolean;
  isAiThinking: boolean;
  isOnline: boolean;

  // Modales
  pomodoro: PomodoroState;
  isTaskModalOpen: boolean;
  isCourseModalOpen: boolean;
  isVoiceModalOpen: boolean;
  selectedCourseForDetail: CourseEntity | null;

  // Actions d'initialisation et chargement
  initializeApp: () => void;
  refreshData: () => Promise<void>;
  setIsOnline: (online: boolean) => void;

  // Actions Tâches
  addTask: (task: Omit<TaskEntity, 'id'>) => Promise<void>;
  updateTask: (id: number, changes: Partial<TaskEntity>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskComplete: (id: number) => Promise<void>;

  // Actions Cours
  addCourse: (course: CourseEntity) => Promise<void>;
  updateCourse: (id: string, changes: Partial<CourseEntity>) => Promise<void>;
  recordRevision: (id: string, newMastery: number) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  setSelectedCourseForDetail: (course: CourseEntity | null) => void;

  // Actions Schedules
  addSchedule: (schedule: ScheduleEntity) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  // Actions Projets
  addProject: (project: ProjectEntity) => Promise<void>;
  updateProject: (id: string, changes: Partial<ProjectEntity>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Actions Chat
  sendMessage: (content: string, preferredRole?: AgentRole) => Promise<void>;
  clearChat: () => Promise<void>;

  // Actions Réglages
  updateSettings: (changes: Partial<SettingsEntity>) => Promise<void>;
  fetchDailyPlan: (forceRefresh?: boolean) => Promise<void>;

  // Actions Pomodoro
  openPomodoro: (taskId?: number, taskTitle?: string) => void;
  closePomodoro: () => void;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;

  // Actions Modales
  setTaskModalOpen: (open: boolean) => void;
  setCourseModalOpen: (open: boolean) => void;
  setVoiceModalOpen: (open: boolean) => void;
  applyVoiceAction: (action: VoiceParsedAction) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  activeScreen: 'today',
  setActiveScreen: (screen) => set({ activeScreen: screen }),

  tasks: [],
  courses: [],
  schedules: [],
  projects: [],
  messages: [],
  settings: null,
  dailyPlan: '',
  isGeneratingPlan: false,
  isAiThinking: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

  pomodoro: {
    isOpen: false,
    taskId: undefined,
    taskTitle: undefined,
    isRunning: false,
    mode: 'WORK',
    timeLeft: 25 * 60,
    workDuration: 25,
    breakDuration: 5,
    cyclesCompleted: 0,
  },

  isTaskModalOpen: false,
  isCourseModalOpen: false,
  isVoiceModalOpen: false,
  selectedCourseForDetail: null,

  setIsOnline: (online) => set({ isOnline: online }),

  initializeApp: async () => {
    await get().refreshData();
    get().fetchDailyPlan(false);

    // Écouteur réseau
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => get().setIsOnline(true));
      window.addEventListener('offline', () => get().setIsOnline(false));
    }
  },

  refreshData: async () => {
    const [tasks, courses, schedules, projects, messages, settings] = await Promise.all([
      tasksRepo.getAll(),
      coursesRepo.getAll(),
      schedulesRepo.getAll(),
      projectsRepo.getAll(),
      chatRepo.getAll(),
      settingsRepo.get(),
    ]);

    set({ tasks, courses, schedules, projects, messages, settings });
  },

  addTask: async (task) => {
    await tasksRepo.add(task);
    const tasks = await tasksRepo.getAll();
    set({ tasks, isTaskModalOpen: false });
  },

  updateTask: async (id, changes) => {
    await tasksRepo.update(id, changes);
    const tasks = await tasksRepo.getAll();
    set({ tasks });
  },

  deleteTask: async (id) => {
    await tasksRepo.delete(id);
    const tasks = await tasksRepo.getAll();
    set({ tasks });
  },

  toggleTaskComplete: async (id) => {
    await tasksRepo.toggleComplete(id);
    const tasks = await tasksRepo.getAll();
    set({ tasks });
  },

  addCourse: async (course) => {
    await coursesRepo.add(course);
    const courses = await coursesRepo.getAll();
    set({ courses, isCourseModalOpen: false });
  },

  updateCourse: async (id, changes) => {
    await coursesRepo.update(id, changes);
    const courses = await coursesRepo.getAll();
    set({
      courses,
      selectedCourseForDetail: get().selectedCourseForDetail?.id === id 
        ? { ...get().selectedCourseForDetail!, ...changes } 
        : get().selectedCourseForDetail,
    });
  },

  recordRevision: async (id, newMastery) => {
    const course = await coursesRepo.getById(id);
    if (!course) return;

    const revisionHistory = [...course.revisionHistory, new Date().toISOString()];
    const prochaineRevisionDate = calculateNextRevisionDate(revisionHistory.length, newMastery);

    await coursesRepo.update(id, {
      niveauMaitrise: newMastery,
      revisionHistory,
      prochaineRevisionDate,
    });

    const courses = await coursesRepo.getAll();
    const updated = courses.find((c) => c.id === id) || null;
    set({ courses, selectedCourseForDetail: updated });
  },

  deleteCourse: async (id) => {
    await coursesRepo.delete(id);
    const courses = await coursesRepo.getAll();
    set({ courses, selectedCourseForDetail: null });
  },

  setSelectedCourseForDetail: (course) => set({ selectedCourseForDetail: course }),

  addSchedule: async (schedule) => {
    await schedulesRepo.add(schedule);
    const schedules = await schedulesRepo.getAll();
    set({ schedules });
  },

  deleteSchedule: async (id) => {
    await schedulesRepo.delete(id);
    const schedules = await schedulesRepo.getAll();
    set({ schedules });
  },

  addProject: async (project) => {
    await projectsRepo.add(project);
    const projects = await projectsRepo.getAll();
    set({ projects });
  },

  updateProject: async (id, changes) => {
    await projectsRepo.update(id, changes);
    const projects = await projectsRepo.getAll();
    set({ projects });
  },

  deleteProject: async (id) => {
    await projectsRepo.delete(id);
    const projects = await projectsRepo.getAll();
    set({ projects });
  },

  sendMessage: async (content, preferredRole) => {
    const userMsg: Omit<ChatMessageEntity, 'id'> = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    await chatRepo.add(userMsg);
    let messages = await chatRepo.getAll();
    set({ messages, isAiThinking: true });

    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const dueCourses = state.courses.filter((c) => c.prochaineRevisionDate <= today);
    const pendingTasks = state.tasks.filter((t) => t.status !== 'DONE');

    let examDaysRemaining = 14;
    if (state.settings?.examDate) {
      const diff = new Date(state.settings.examDate).getTime() - new Date().getTime();
      examDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    const contextPayload = {
      userName: state.settings?.userName || 'Tokpa',
      isExamMode: Boolean(state.settings?.isExamMode),
      examDaysRemaining,
      pendingTasksCount: pendingTasks.length,
      dueCoursesCount: dueCourses.length,
      dueCoursesNames: dueCourses.map((c) => c.matiere).slice(0, 3).join(', '),
      activeProjects: state.projects.map((p) => p.name).join(', '),
    };

    const result = await geminiService.sendMessage(content, messages, contextPayload, preferredRole);

    const assistantMsg: Omit<ChatMessageEntity, 'id'> = {
      role: 'assistant',
      content: result.reply,
      timestamp: new Date().toISOString(),
      activeRole: result.activeRole,
    };

    await chatRepo.add(assistantMsg);
    messages = await chatRepo.getAll();
    set({ messages, isAiThinking: false });
  },

  clearChat: async () => {
    await chatRepo.clear();
    set({ messages: [] });
  },

  updateSettings: async (changes) => {
    await settingsRepo.update(changes);
    const settings = await settingsRepo.get();
    set({ settings });
  },

  fetchDailyPlan: async (forceRefresh = false) => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];

    if (!forceRefresh && state.settings?.dailyPlanCache?.date === today) {
      set({ dailyPlan: state.settings.dailyPlanCache.content });
      return;
    }

    set({ isGeneratingPlan: true });

    let examDaysRemaining = 14;
    if (state.settings?.examDate) {
      const diff = new Date(state.settings.examDate).getTime() - new Date().getTime();
      examDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    const dueCourses = state.courses.filter((c) => c.prochaineRevisionDate <= today);
    const urgentTasks = state.tasks.filter((t) => t.status !== 'DONE' && t.priority === 'URGENT');

    const contextPayload = {
      userName: state.settings?.userName || 'Tokpa',
      isExamMode: Boolean(state.settings?.isExamMode),
      examDaysRemaining,
      pendingTasksCount: state.tasks.filter((t) => t.status !== 'DONE').length,
      dueCoursesCount: dueCourses.length,
      dueCoursesNames: dueCourses.map((c) => c.matiere).join(', '),
      activeProjects: state.projects.map((p) => p.name).join(', '),
      urgentTasks: urgentTasks.map((t) => t.title).join(', '),
      dueCourses: dueCourses.map((c) => c.matiere).join(', '),
    };

    const plan = await geminiService.getDailyPlan(contextPayload as any);

    await settingsRepo.update({
      dailyPlanCache: { date: today, content: plan },
    });

    set({ dailyPlan: plan, isGeneratingPlan: false });
  },

  // Pomodoro
  openPomodoro: (taskId, taskTitle) => {
    set((s) => ({
      pomodoro: {
        ...s.pomodoro,
        isOpen: true,
        taskId,
        taskTitle,
        mode: 'WORK',
        timeLeft: s.pomodoro.workDuration * 60,
        isRunning: false,
      },
    }));
  },

  closePomodoro: () => {
    set((s) => ({
      pomodoro: {
        ...s.pomodoro,
        isOpen: false,
        isRunning: false,
      },
    }));
  },

  startPomodoro: () => {
    set((s) => ({
      pomodoro: {
        ...s.pomodoro,
        isRunning: true,
      },
    }));
  },

  pausePomodoro: () => {
    set((s) => ({
      pomodoro: {
        ...s.pomodoro,
        isRunning: false,
      },
    }));
  },

  resetPomodoro: () => {
    set((s) => ({
      pomodoro: {
        ...s.pomodoro,
        isRunning: false,
        timeLeft: (s.pomodoro.mode === 'WORK' ? s.pomodoro.workDuration : s.pomodoro.breakDuration) * 60,
      },
    }));
  },

  tickPomodoro: () => {
    const { pomodoro } = get();
    if (!pomodoro.isRunning) return;

    if (pomodoro.timeLeft > 1) {
      set({
        pomodoro: {
          ...pomodoro,
          timeLeft: pomodoro.timeLeft - 1,
        },
      });
    } else {
      // Fin du cycle
      const nextMode = pomodoro.mode === 'WORK' ? 'BREAK' : 'WORK';
      const cyclesCompleted = pomodoro.mode === 'WORK' ? pomodoro.cyclesCompleted + 1 : pomodoro.cyclesCompleted;
      const nextDuration = nextMode === 'WORK' ? pomodoro.workDuration : pomodoro.breakDuration;

      notificationService.notifyPomodoroFinished(pomodoro.mode);

      set({
        pomodoro: {
          ...pomodoro,
          mode: nextMode,
          timeLeft: nextDuration * 60,
          isRunning: false,
          cyclesCompleted,
        },
      });
    }
  },

  // Modales
  setTaskModalOpen: (open) => set({ isTaskModalOpen: open }),
  setCourseModalOpen: (open) => set({ isCourseModalOpen: open }),
  setVoiceModalOpen: (open) => set({ isVoiceModalOpen: open }),

  applyVoiceAction: async (action) => {
    if (action.actionType === 'CREATE_TASK' && action.title) {
      await get().addTask({
        title: action.title,
        priority: action.priority || 'NORMAL',
        status: 'TODO',
        dueDate: action.dueDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });
      get().setActiveScreen('today');
    } else if (action.actionType === 'CREATE_SCHEDULE' && action.title) {
      const scheduleId = `sched-${Date.now()}`;
      await get().addSchedule({
        id: scheduleId,
        title: action.title,
        date: action.dueDate || new Date().toISOString().split('T')[0],
        startTime: action.startTime || '09:00',
        type: action.type || 'TACHE',
      });
      get().setActiveScreen('learn');
    } else if (action.actionType === 'CHAT_QUERY' && action.query) {
      get().setActiveScreen('agent');
      await get().sendMessage(action.query);
    }
  },
}));
