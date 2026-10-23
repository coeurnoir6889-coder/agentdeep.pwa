/**
 * agentDeep - Repositories IndexedDB
 * Opérations CRUD sécurisées et typées
 */

import { db, initializeDatabase } from './database';
import type {
  TaskEntity,
  CourseEntity,
  ScheduleEntity,
  ProjectEntity,
  ChatMessageEntity,
  SettingsEntity,
} from '../types';

/* ============================================================
   TASKS REPOSITORY
============================================================ */
export const tasksRepo = {
  async getAll(): Promise<TaskEntity[]> {
    return await db.tasks.toArray();
  },

  async add(task: Omit<TaskEntity, 'id'>): Promise<number> {
    const id = await db.tasks.add({
      ...task,
      createdAt: task.createdAt || new Date().toISOString(),
    });
    return id as number;
  },

  async update(id: number, changes: Partial<TaskEntity>): Promise<number> {
    return await db.tasks.update(id, changes);
  },

  async delete(id: number): Promise<void> {
    await db.tasks.delete(id);
  },

  async toggleComplete(id: number): Promise<void> {
    const task = await db.tasks.get(id);
    if (!task) return;
    const isNowDone = task.status !== 'DONE';
    await db.tasks.update(id, {
      status: isNowDone ? 'DONE' : 'TODO',
      completedAt: isNowDone ? new Date().toISOString() : undefined,
    });
  },
};

/* ============================================================
   COURSES REPOSITORY
============================================================ */
export const coursesRepo = {
  async getAll(): Promise<CourseEntity[]> {
    return await db.courses.toArray();
  },

  async getById(id: string): Promise<CourseEntity | undefined> {
    return await db.courses.get(id);
  },

  async add(course: CourseEntity): Promise<string> {
    return await db.courses.put(course);
  },

  async update(id: string, changes: Partial<CourseEntity>): Promise<number> {
    return await db.courses.update(id, changes);
  },

  async delete(id: string): Promise<void> {
    await db.courses.delete(id);
  },
};

/* ============================================================
   SCHEDULES REPOSITORY
============================================================ */
export const schedulesRepo = {
  async getAll(): Promise<ScheduleEntity[]> {
    return await db.schedules.toArray();
  },

  async getByDate(date: string): Promise<ScheduleEntity[]> {
    return await db.schedules.where('date').equals(date).toArray();
  },

  async add(schedule: ScheduleEntity): Promise<string> {
    return await db.schedules.put(schedule);
  },

  async delete(id: string): Promise<void> {
    await db.schedules.delete(id);
  },
};

/* ============================================================
   PROJECTS REPOSITORY
============================================================ */
export const projectsRepo = {
  async getAll(): Promise<ProjectEntity[]> {
    return await db.projects.toArray();
  },

  async add(project: ProjectEntity): Promise<string> {
    return await db.projects.put(project);
  },

  async update(id: string, changes: Partial<ProjectEntity>): Promise<number> {
    return await db.projects.update(id, changes);
  },

  async delete(id: string): Promise<void> {
    await db.projects.delete(id);
  },
};

/* ============================================================
   CHAT MESSAGES REPOSITORY
============================================================ */
export const chatRepo = {
  async getAll(): Promise<ChatMessageEntity[]> {
    return await db.chatMessages.orderBy('id').toArray();
  },

  async add(message: Omit<ChatMessageEntity, 'id'>): Promise<number> {
    return (await db.chatMessages.add(message)) as number;
  },

  async clear(): Promise<void> {
    await db.chatMessages.clear();
  },
};

/* ============================================================
   SETTINGS REPOSITORY
============================================================ */
export const settingsRepo = {
  async get(): Promise<SettingsEntity> {
    let settings = await db.settings.get('app');
    if (!settings) {
      await initializeDatabase();
      settings = (await db.settings.get('app'))!;
    }
    return settings;
  },

  async update(changes: Partial<SettingsEntity>): Promise<number> {
    return await db.settings.update('app', changes);
  },
};

/* ============================================================
   DATABASE BACKUP & RESET
============================================================ */
export async function exportDatabaseBackup(): Promise<string> {
  const [tasks, courses, schedules, projects, chatMessages, settings] = await Promise.all([
    db.tasks.toArray(),
    db.courses.toArray(),
    db.schedules.toArray(),
    db.projects.toArray(),
    db.chatMessages.toArray(),
    db.settings.toArray(),
  ]);

  const backupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    courses,
    schedules,
    projects,
    chatMessages,
    settings,
  };

  return JSON.stringify(backupData, null, 2);
}

export async function resetDatabaseToDefault(): Promise<void> {
  await db.transaction('rw', [db.tasks, db.courses, db.schedules, db.projects, db.chatMessages, db.settings, db.examSessions], async () => {
    await db.tasks.clear();
    await db.courses.clear();
    await db.schedules.clear();
    await db.projects.clear();
    await db.chatMessages.clear();
    await db.settings.clear();
    await db.examSessions.clear();
  });
  await initializeDatabase();
}
