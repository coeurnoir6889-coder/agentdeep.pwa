/**
 * agentDeep - Types TypeScript complets
 * @license Apache-2.0
 */

export type TaskPriority = 'URGENT' | 'IMPORTANT' | 'NORMAL';
export type TaskStatus = 'TODO' | 'DOING' | 'DONE';

export interface TaskEntity {
  id?: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string; // YYYY-MM-DD
  projectTag?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CourseEntity {
  id: string;
  matiere: string;
  chapitre: string;
  niveauMaitrise: number; // 0 - 100
  prochaineRevisionDate: string; // YYYY-MM-DD
  revisionHistory: string[]; // ISO date array
  notes?: string;
}

export type ScheduleType = 'COURS' | 'TACHE' | 'PROJET' | 'REVISION';

export interface ScheduleEntity {
  id: string;
  title: string;
  startTime: string; // ISO string ou HH:mm
  endTime?: string;
  date: string; // YYYY-MM-DD
  type: ScheduleType;
  recurring?: boolean;
}

export interface ProjectEntity {
  id: string;
  name: string;
  description?: string;
  progression: number; // 0 - 100
  deadline?: string;
  taskIds: number[];
  businessModel?: string | null;
}

export type AgentRole = 
  | 'TASK_COACH'       // 1. Assistant Tâches
  | 'STUDY_COACH'      // 2. Coach Études FASEG
  | 'PROJECT_COACH'    // 3. Gestionnaire de Projets
  | 'LIFE_COACH'       // 4. Coach Développement Personnel
  | 'SPEECH_COACH'     // 5. Coach Élocution & Prise de parole
  | 'BUSINESS_COACH';  // 6. Expert Modèles Économiques

export interface ChatMessageEntity {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  contextUsed?: string;
  activeRole?: AgentRole;
}

export interface SettingsEntity {
  id: 'app';
  geminiApiKey: string;
  isExamMode: boolean;
  examDate?: string;
  userName: string;
  theme?: string;
  dailyPlanCache?: {
    date: string;
    content: string;
  };
}

export interface ExamSessionEntity {
  id: string;
  startDate: string;
  endDate: string;
  blockedSlots: Array<{
    start: string;
    end: string;
    courseId: string;
  }>;
}

export interface PomodoroSession {
  taskId?: number;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string;
  type: 'WORK' | 'BREAK';
}

export interface VoiceParsedAction {
  actionType: 'CREATE_TASK' | 'CREATE_SCHEDULE' | 'CHAT_QUERY' | 'UNKNOWN';
  title?: string;
  dueDate?: string;
  startTime?: string;
  priority?: TaskPriority;
  type?: ScheduleType;
  query?: string;
}
