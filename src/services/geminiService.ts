/**
 * agentDeep - Client Service Gemini & Moteur Offline Intelligent
 * Dialogue avec /api/gemini/* et gère le fallback 100% hors-ligne.
 */

import type { AgentRole, ChatMessageEntity, VoiceParsedAction } from '../types';
import { decryptApiKey } from './cryptoService';
import { settingsRepo } from '../db/repositories';

export interface ChatContextPayload {
  userName: string;
  isExamMode: boolean;
  examDaysRemaining?: number;
  pendingTasksCount: number;
  dueCoursesCount: number;
  dueCoursesNames: string;
  activeProjects: string;
}

export class GeminiService {
  /**
   * Récupère la clé API chiffrée si présente dans les réglages
   */
  private async getStoredKey(): Promise<string> {
    try {
      const settings = await settingsRepo.get();
      if (settings?.geminiApiKey) {
        return await decryptApiKey(settings.geminiApiKey);
      }
    } catch {
      // Ignorer si pas dispo
    }
    return '';
  }

  /**
   * Envoi d'un message à agentDeep (Online API ou Fallback Offline)
   */
  public async sendMessage(
    message: string,
    history: ChatMessageEntity[],
    context: ChatContextPayload,
    preferredRole?: AgentRole
  ): Promise<{ reply: string; activeRole: AgentRole; isOffline: boolean }> {
    const customKey = await this.getStoredKey();

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customKey ? { 'x-gemini-key': customKey } : {}),
        },
        body: JSON.stringify({
          message,
          history,
          context,
          preferredRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          reply: data.reply,
          activeRole: data.activeRole as AgentRole,
          isOffline: false,
        };
      }
    } catch {
      // Échec réseau ou offline : passage en fallback local
    }

    // Moteur de réponse offline intelligent ENTP
    const offlineResult = this.generateOfflineResponse(message, context, preferredRole);
    return {
      reply: offlineResult.reply,
      activeRole: offlineResult.role,
      isOffline: true,
    };
  }

  /**
   * Génère le plan du jour (Online ou Local)
   */
  public async getDailyPlan(context: ChatContextPayload): Promise<string> {
    const customKey = await this.getStoredKey();

    try {
      const res = await fetch('/api/gemini/daily-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customKey ? { 'x-gemini-key': customKey } : {}),
        },
        body: JSON.stringify({ context }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.plan) return data.plan;
      }
    } catch {
      // Fallback offline
    }

    if (context.isExamMode) {
      return `Ok ${context.userName}, on est à J-${context.examDaysRemaining || 14} des partiels. Pas de quartier : on torche les révisions sur ${context.dueCoursesNames || 'la Recherche Opérationnelle'} ce matin, et on se garde 1h cet après-midi pour faire respirer ton projet. Allez, on arrête de tourner en rond.`;
    }

    if (context.pendingTasksCount > 2) {
      return `Yo ${context.userName} ! Tu as ${context.pendingTasksCount} tâches sur le feu et la révision de ${context.dueCoursesNames || 'tes cours'}. Choisis ta priorité numéro une, on la plie en 45 minutes et ensuite on déroule. Ok, on attaque.`;
    }

    return `Yo ${context.userName} ! Tableau propre pour aujourd'hui. On consolide les cours FASEG et on pousse un sprint sur ${context.activeProjects || 'agentDeep'}. Prêt à casser des briques ?`;
  }

  /**
   * Analyse vocale intelligente (Online ou regex offline)
   */
  public async parseVoiceCommand(transcript: string): Promise<VoiceParsedAction> {
    const customKey = await this.getStoredKey();

    try {
      const res = await fetch('/api/gemini/parse-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customKey ? { 'x-gemini-key': customKey } : {}),
        },
        body: JSON.stringify({ transcript }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.actionType) return data;
      }
    } catch {
      // Fallback regex local
    }

    return this.parseVoiceFallback(transcript);
  }

  /**
   * Test de connexion
   */
  public async testConnection(key?: string): Promise<{ success: boolean; message: string }> {
    try {
      const customKey = key || (await this.getStoredKey());
      const res = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customKey ? { 'x-gemini-key': customKey } : {}),
        },
      });

      const data = await res.json();
      return {
        success: data.success ?? false,
        message: data.message || (data.success ? 'Connecté' : 'Échec de connexion'),
      };
    } catch (err: any) {
      return { success: false, message: 'Serveur injoignable ou mode hors-ligne.' };
    }
  }

  /**
   * Moteur de réponse hors-ligne contextualisé
   */
  private generateOfflineResponse(
    message: string,
    context: ChatContextPayload,
    preferredRole?: AgentRole
  ): { reply: string; role: AgentRole } {
    const text = message.toLowerCase();

    // Mode Examen prioritaire
    if (context.isExamMode) {
      return {
        reply: `[Mode Offline] Prof. agentDeep au rapport. On est à J-${context.examDaysRemaining || 14} de tes examens FASEG ! Tu as ${context.dueCoursesCount} cours prioritaires (${context.dueCoursesNames || 'Recherche Opérationnelle, Statistiques'}). On bloque 60% de ton temps dessus, et 1h obligatoire pour ton projet. Ouvre la section Cours et lance un Pomodoro ! Deal ?`,
        role: 'STUDY_COACH',
      };
    }

    if (preferredRole === 'BUSINESS_COACH' || text.includes('business') || text.includes('modèle') || text.includes('monétis') || text.includes('pricing')) {
      return {
        reply: `[Mode Offline] J'ai une idée de génie pour ton projet ! Pour le marché local (Bénin & Afrique de l'Ouest), oublie le 100% abonnement récurrent par carte bancaire. Propose du Freemium avec micro-achats débloquables par Mobile Money (MTN / Moov) ou du B2B ciblé. Quel est le problème douloureux que ton app résout et pour lequel quelqu'un sortirait 2 000 FCFA dès demain ?`,
        role: 'BUSINESS_COACH',
      };
    }

    if (preferredRole === 'SPEECH_COACH' || text.includes('pitch') || text.includes('oral') || text.includes('élocution') || text.includes('parole')) {
      return {
        reply: `[Mode Offline] Pour ta prise de parole, retiens la règle d'or : une accroche qui pique, trois arguments percutants maximum, et une chute mémorable. Ralentis ton débit de 20%, appuie tes consonnes et utilise le silence avant les mots clés. Tu veux qu'on structure ton intro ensemble ?`,
        role: 'SPEECH_COACH',
      };
    }

    if (text.includes('cours') || text.includes('ro') || text.includes('simplexe') || text.includes('comptab') || text.includes('micro') || text.includes('faseg')) {
      return {
        reply: `[Mode Offline] Ok, on attaque la révision FASEG. En Recherche Opérationnelle, rappelle-toi que la base du simplexe consiste à trouver la solution réalisable de base optimale en inspectant les sommets du polyèdre. Tu as actuellement ${context.dueCoursesCount} cours programmés aujourd'hui. Lequel veux-tu tester ?`,
        role: 'STUDY_COACH',
      };
    }

    if (text.includes('fatigue') || text.includes('procrastin') || text.includes('temps') || text.includes('peur') || text.includes('flemme')) {
      return {
        reply: `[Mode Offline] Bon, on arrête de tourner en rond. Tu fuis la tâche la plus importante, pourquoi ? Le manque de motivation, c'est juste un manque de clarté. Découpe ce qui te bloque en une action ridicule de 5 minutes. Fais-la maintenant, et on en reparle.`,
        role: 'LIFE_COACH',
      };
    }

    if (text.includes('projet') || text.includes('deadline')) {
      return {
        reply: `[Mode Offline] Ton projet actif c'est ${context.activeProjects}. La meilleure façon de le sortir, c'est des micro-livrables hebdomadaires. Qu'est-ce qu'on peut finaliser d'ici ce soir pour faire bouger la barre de progression ?`,
        role: 'PROJECT_COACH',
      };
    }

    // Réponse par défaut énergique
    return {
      reply: `[Mode Offline] Je suis actuellement en local, mais mon radar tourne à plein régime. Tu as ${context.pendingTasksCount} tâches en attente et ${context.dueCoursesCount} cours à réviser. Choisis ton premier chantier : les cours, une tâche urgente, ou un sprint sur tes projets ?`,
      role: preferredRole || 'TASK_COACH',
    };
  }

  /**
   * Analyse locale rapide pour commandes vocales
   */
  private parseVoiceFallback(transcript: string): VoiceParsedAction {
    const text = transcript.toLowerCase();
    const today = new Date();
    let dueDate = today.toISOString().split('T')[0];

    if (text.includes('demain')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
    }

    // Détection d'heure (ex: 8h, 14h30)
    const hourMatch = text.match(/(\d{1,2})\s*h\s*(\d{2})?/i);
    let startTime = '09:00';
    if (hourMatch) {
      const h = hourMatch[1].padStart(2, '0');
      const m = hourMatch[2] ? hourMatch[2] : '00';
      startTime = `${h}:${m}`;
    }

    // Priorité
    let priority: 'URGENT' | 'IMPORTANT' | 'NORMAL' = 'NORMAL';
    if (text.includes('urgent') || text.includes('absolument') || text.includes('vite')) {
      priority = 'URGENT';
    } else if (text.includes('important')) {
      priority = 'IMPORTANT';
    }

    // Type
    let type: 'COURS' | 'TACHE' | 'PROJET' | 'REVISION' = 'TACHE';
    if (text.includes('réviser') || text.includes('cours') || text.includes('ro') || text.includes('faseg')) {
      type = 'REVISION';
    } else if (text.includes('projet')) {
      type = 'PROJET';
    }

    if (text.includes('rappelle-moi') || text.includes('planning') || text.includes('calendrier') || text.includes('demain')) {
      return {
        actionType: 'CREATE_SCHEDULE',
        title: transcript.replace(/rappelle-moi de|rappelle moi de/gi, '').trim() || 'Rappel agentDeep',
        dueDate,
        startTime,
        type,
        priority,
      };
    }

    return {
      actionType: 'CREATE_TASK',
      title: transcript.replace(/créer la tâche|ajoute la tâche|nouvelle tâche/gi, '').trim() || transcript,
      dueDate,
      priority,
      type: 'TACHE',
    };
  }
}

export const geminiService = new GeminiService();
