/**
 * agentDeep - Serveur Express & Proxy Gemini API
 * Full-stack Vite + Express pour AI Studio
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialisation client GenAI avec fallback sur clé injectée
function getAiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const AGENT_SYSTEM_PROMPT = `
Tu es agentDeep, un assistant IA personnel à la personnalité ENTP (débateur, énergique, challenger, drôle, provocateur bienveillant).
Tu tutoies TOUJOURS l'utilisateur.
Tu ne fais JAMAIS de listes à puces froides quand tu parles : tu écris comme un humain en chair et en os, en paragraphes vivants et rythmés.
Tu ne moralises jamais. Tu pousses l'utilisateur à agir, sans culpabiliser.

Tes phrases signatures naturelles (à placer spontanément) :
- "Ok, on attaque."
- "Tu fuis la tâche la plus importante, pourquoi ?"
- "J'ai une idée de génie pour ton projet."
- "Bon, on arrête de tourner en rond."

Tu incarnes 6 rôles cumulés de façon fluide sans JAMAIS annoncer "en tant que..." :
1. ASSISTANT TÂCHES : Prioriser, débloquer, découper. Traquer la procrastination sans détour.
2. COACH ÉTUDES FASEG : Recherche Opérationnelle (Simplexe, dualité), Comptabilité Générale, Microéconomie, Statistiques, Droit des Affaires (OHADA), Marketing. Révision par questionnement socratique.
3. GESTIONNAIRE DE PROJETS : Deadlines, plans d'actions en tranches de 1-2h max.
4. COACH DÉVELOPPEMENT PERSONNEL : Challenger les croyances limitantes, auto-sabotage, micro-rituels (5-10 min), bilan hebdomadaire cash et lucide.
5. COACH ÉLOCUTION & PRISE DE PAROLE : Analyser la syntaxe, booster la clarté et l'impact, préparer les pitchs et soutenances orales, articulation, gestion du trac.
6. EXPERT MODÈLES ÉCONOMIQUES : 2-3 modèles viables (freemium, abonnement, marketplace...), potentiel marché local (Bénin, Afrique de l'Ouest, global), coûts cachés, pricing testable en 30 jours, mini business case.

MODE EXAMEN :
Si isExamMode est activé, tu adoptes le ton 'Prof. agentDeep' : plus insistant, directif, tu rappelles le compte à rebours, tu bloques 60% du temps en révision pour les cours < 70%, tout en préservant 1h obligatoire pour les projets actifs pour éviter l'épuisement.
`;

// Helper pour classifier le rôle dominant
function detectRole(text: string, userPrompt: string): string {
  const lower = (userPrompt + ' ' + text).toLowerCase();
  if (lower.includes('business') || lower.includes('modèle') || lower.includes('marché') || lower.includes('monétis') || lower.includes('prix') || lower.includes('pricing') || lower.includes('client')) {
    return 'BUSINESS_COACH';
  }
  if (lower.includes('parole') || lower.includes('pitch') || lower.includes('soutenance') || lower.includes('élocution') || lower.includes('reformul') || lower.includes('articulation')) {
    return 'SPEECH_COACH';
  }
  if (lower.includes('ro') || lower.includes('simplexe') || lower.includes('comptab') || lower.includes('microéco') || lower.includes('faseg') || lower.includes('cours') || lower.includes('révis')) {
    return 'STUDY_COACH';
  }
  if (lower.includes('projet') || lower.includes('deadline') || lower.includes('agentdeep') || lower.includes('avancement')) {
    return 'PROJECT_COACH';
  }
  if (lower.includes('peur') || lower.includes('doute') || lower.includes('temps') || lower.includes('motiv') || lower.includes('fatigue') || lower.includes('bloqu')) {
    return 'LIFE_COACH';
  }
  return 'TASK_COACH';
}

// Endpoint de chat principal
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context, preferredRole } = req.body;
    const clientKey = (req.headers['x-gemini-key'] as string) || req.body.customApiKey;
    const ai = getAiClient(clientKey);

    if (!ai) {
      return res.status(503).json({
        error: 'NO_API_KEY',
        message: 'Clé API Gemini non configurée sur le serveur ou dans Paramètres.',
      });
    }

    const examContext = context?.isExamMode 
      ? `ATTENTION: MODE EXAMEN ACTIF ! J-${context.examDaysRemaining || 14} avant les examens FASEG. Sois directif, insiste sur les révisions tout en gardant 1h pour les projets.` 
      : 'Mode normal.';

    const systemInstruction = `
${AGENT_SYSTEM_PROMPT}

CONTEXTE UTILISATEUR ACTUEL :
- Nom : ${context?.userName || 'Tokpa'}
- ${examContext}
- Tâches en attente : ${context?.pendingTasksCount || 0}
- Cours à réviser aujourd'hui : ${context?.dueCoursesCount || 0} (${context?.dueCoursesNames || 'Aucun'})
- Projets actifs : ${context?.activeProjects || 'agentDeep'}
${preferredRole ? `- Rôle prioritaire demandé : ${preferredRole}` : ''}
`;

    const chatContents: any[] = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        chatContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }
    chatContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.85,
      },
    });

    const reply = response.text || "Ok, on attaque. Qu'est-ce qu'on commence en premier ?";
    const activeRole = preferredRole || detectRole(reply, message);

    return res.json({ reply, activeRole });
  } catch (err: any) {
    console.error('[API Gemini Chat Error]', err);
    return res.status(500).json({ error: err.message || 'Erreur lors de la génération' });
  }
});

// Endpoint plan du jour
app.post('/api/gemini/daily-plan', async (req: Request, res: Response) => {
  try {
    const { context } = req.body;
    const clientKey = (req.headers['x-gemini-key'] as string) || req.body.customApiKey;
    const ai = getAiClient(clientKey);

    if (!ai) {
      return res.status(503).json({ error: 'NO_API_KEY' });
    }

    const prompt = `Génère le plan d'attaque du jour pour ${context?.userName || 'Tokpa'}.
Sois percutant, énergique, ENTP, en 2 ou 3 phrases maximum. Pas de puces, pas de formule creuse.
Contexte : ${context?.isExamMode ? `Examen dans ${context?.examDaysRemaining} jours !` : 'Journée normale.'}
Tâches prioritaires : ${context?.urgentTasks || 'Avancer sur le projet agentDeep'}.
Cours prioritaires : ${context?.dueCourses || 'Recherche Opérationnelle'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: AGENT_SYSTEM_PROMPT,
        temperature: 0.9,
      },
    });

    return res.json({ plan: response.text });
  } catch (err: any) {
    console.error('[Daily Plan Error]', err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint parsing vocal intelligent
app.post('/api/gemini/parse-voice', async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body;
    const clientKey = (req.headers['x-gemini-key'] as string) || req.body.customApiKey;
    const ai = getAiClient(clientKey);

    if (!ai) {
      return res.status(503).json({ error: 'NO_API_KEY' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const prompt = `Analyse cette commande vocale prononcée en français : "${transcript}".
Aujourd'hui nous sommes le ${todayStr}.
Extrais une intention sous forme JSON strict avec cette structure :
{
  "actionType": "CREATE_TASK" ou "CREATE_SCHEDULE" ou "CHAT_QUERY",
  "title": "titre concis de la tâche ou de l'événement",
  "dueDate": "YYYY-MM-DD" (ou null),
  "startTime": "HH:mm" (ou null),
  "priority": "URGENT" ou "IMPORTANT" ou "NORMAL",
  "type": "COURS" ou "TACHE" ou "PROJET" ou "REVISION",
  "query": "si c'est une question pour le chat"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('[Voice Parse Error]', err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint test de connexion
app.post('/api/gemini/test', async (req: Request, res: Response) => {
  try {
    const clientKey = (req.headers['x-gemini-key'] as string) || req.body.customApiKey;
    const ai = getAiClient(clientKey);
    if (!ai) {
      return res.status(400).json({ success: false, message: 'Aucune clé API configurée.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Dis en un mot "Opérationnel".',
    });

    return res.json({ success: true, message: response.text?.trim() || 'Connecté' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Intégration Vite en mode développement ou fichiers statiques en production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[agentDeep] Serveur démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
