/**
 * agentDeep - Dexie Database & Initial Seed
 * Persistance 100% locale IndexedDB
 */

import Dexie, { type Table } from 'dexie';
import type {
  TaskEntity,
  CourseEntity,
  ScheduleEntity,
  ProjectEntity,
  ChatMessageEntity,
  SettingsEntity,
  ExamSessionEntity,
} from '../types';

export class AgentDeepDatabase extends Dexie {
  tasks!: Table<TaskEntity, number>;
  courses!: Table<CourseEntity, string>;
  schedules!: Table<ScheduleEntity, string>;
  projects!: Table<ProjectEntity, string>;
  chatMessages!: Table<ChatMessageEntity, number>;
  settings!: Table<SettingsEntity, string>;
  examSessions!: Table<ExamSessionEntity, string>;

  constructor() {
    super('AgentDeepDB');

    this.version(1).stores({
      tasks: '++id, priority, status, dueDate, projectTag, createdAt',
      courses: 'id, matiere, prochaineRevisionDate, niveauMaitrise',
      schedules: 'id, date, type, startTime',
      projects: 'id, progression, deadline',
      chatMessages: '++id, role, timestamp, activeRole',
      settings: 'id',
      examSessions: 'id, startDate, endDate',
    });
  }
}

export const db = new AgentDeepDatabase();

/**
 * Initialisation et seed initial si premier lancement
 */
export async function initializeDatabase(): Promise<void> {
  const currentSettings = await db.settings.get('app');
  if (currentSettings) {
    return; // Base déjà initialisée
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 1. Settings initiaux
  await db.settings.put({
    id: 'app',
    geminiApiKey: '',
    isExamMode: false,
    userName: 'Tokpa',
    theme: 'dark',
  });

  // 2. 6 Matières FASEG obligatoires
  const matieresFaseg = [
    { matiere: 'Recherche Opérationnelle', chapitre: 'Programmation Linéaire & Algorithme du Simplexe' },
    { matiere: 'Comptabilité Générale', chapitre: 'Bilan, Compte de Résultat & Écritures d\'Inventaire' },
    { matiere: 'Microéconomie', chapitre: 'Comportement du consommateur & Utilité marginale' },
    { matiere: 'Statistiques', chapitre: 'Lois de probabilité discrètes et continues' },
    { matiere: 'Droit des Affaires', chapitre: 'Contrats commerciaux et statut du commerçant OHADA' },
    { matiere: 'Marketing', chapitre: 'Segmentation, Ciblage, Positionnement (SCP)' },
  ];

  const initialCourses: CourseEntity[] = matieresFaseg.map((item, index) => ({
    id: `course-${index + 1}`,
    matiere: item.matiere,
    chapitre: item.chapitre,
    niveauMaitrise: 0,
    prochaineRevisionDate: todayStr,
    revisionHistory: [],
    notes: 'Priorité révision socratique avec agentDeep.',
  }));

  await db.courses.bulkPut(initialCourses);

  // 3. Projet exemple : agentDeep
  const initialProject: ProjectEntity = {
    id: 'project-agentdeep',
    name: 'agentDeep',
    description: 'Application PWA de productivité personnelle & révisions offline-first.',
    progression: 15,
    deadline: in30Days,
    taskIds: [1, 2],
    businessModel: 'Modèle Freemium avec synchronisation P2P chiffrée optionnelle pour étudiants & freelances en Afrique de l\'Ouest.',
  };

  await db.projects.put(initialProject);

  // 4. Tâches d'amorce dans la matrice Eisenhower
  const initialTasks: TaskEntity[] = [
    {
      title: 'Réviser le simplexe en Recherche Opérationnelle',
      description: 'Refaire les 3 exercices types du TD2 avant le quiz.',
      priority: 'URGENT',
      status: 'TODO',
      dueDate: todayStr,
      projectTag: 'FASEG',
      createdAt: new Date().toISOString(),
    },
    {
      title: 'Finaliser le plan de l\'app agentDeep',
      description: 'Tester la reconnaissance vocale et le fallback offline.',
      priority: 'IMPORTANT',
      status: 'DOING',
      dueDate: todayStr,
      projectTag: 'agentDeep',
      createdAt: new Date().toISOString(),
    },
    {
      title: 'Lire le chapitre OHADA sur les actes de commerce',
      description: 'Synthèse des 10 points clés.',
      priority: 'NORMAL',
      status: 'TODO',
      dueDate: in30Days,
      projectTag: 'FASEG',
      createdAt: new Date().toISOString(),
    },
  ];

  await db.tasks.bulkAdd(initialTasks);

  // 5. Message d'accueil de l'agentDeep
  await db.chatMessages.put({
    role: 'assistant',
    content: "Yo Tokpa ! agentDeep est opérationnel. Je suis ton cerveau externe, prêt à te secouer sur tes cours FASEG, débloquer tes tâches ou challenger tes modèles de business. Qu'est-ce qu'on attaque aujourd'hui ?",
    timestamp: new Date().toISOString(),
    activeRole: 'LIFE_COACH',
    contextUsed: 'Lancement initial agentDeep',
  });
}
