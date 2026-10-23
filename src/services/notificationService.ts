/**
 * agentDeep - Web Notifications API & Service Worker
 */

export class NotificationService {
  private hasPermission = false;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const result = await Notification.requestPermission();
      this.hasPermission = result === 'granted';
      return this.hasPermission;
    } catch {
      return false;
    }
  }

  public async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported()) return;

    if (!this.hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      ...options,
    };

    // Utilise le Service Worker si disponible, sinon Notification classique
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  /**
   * Alerte de fin de session Pomodoro
   */
  public notifyPomodoroFinished(type: 'WORK' | 'BREAK'): void {
    const title = type === 'WORK' 
      ? '🔥 Session terminée !' 
      : '⚡ Pause terminée !';
    const body = type === 'WORK'
      ? 'Prends 5 minutes pour souffler. agentDeep veille au grain.'
      : 'Allez, on se remet au travail. Concentre-toi sur la tâche en cours.';

    this.sendNotification(title, { body });
  }

  /**
   * Alerte Mode Examen
   */
  public notifyExamReminder(daysRemaining: number, topCourse: string): void {
    this.sendNotification(`🚨 MODE EXAMEN — J-${daysRemaining}`, {
      body: `Pas le temps de flâner ! Priorité révision : ${topCourse}. Bloque 45 min maintenant.`,
    });
  }
}

export const notificationService = new NotificationService();
