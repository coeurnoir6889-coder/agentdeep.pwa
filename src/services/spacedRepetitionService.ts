/**
 * agentDeep - Algorithme Spaced Repetition (J+1, J+3, J+7, J+14, J+30)
 */

import type { CourseEntity } from '../types';

/**
 * Intervalles en jours selon le palier de révision
 */
const INTERVALLES_JOURS = [1, 3, 7, 14, 30, 60];

/**
 * Calcule la prochaine date de révision selon l'historique et la note de maîtrise
 * @param revisionCount Nombre total de révisions effectuées
 * @param masteryScore Niveau de maîtrise actuel (0-100)
 */
export function calculateNextRevisionDate(revisionCount: number, masteryScore: number): string {
  let intervalIndex = Math.min(revisionCount, INTERVALLES_JOURS.length - 1);

  // Si la maîtrise est faible (< 50%), on réinitialise à J+1 pour consolidation immédiate
  if (masteryScore < 50) {
    intervalIndex = 0;
  } else if (masteryScore >= 80 && intervalIndex < INTERVALLES_JOURS.length - 1) {
    // Si excellente maîtrise, on peut sauter un cran
    intervalIndex = Math.min(intervalIndex + 1, INTERVALLES_JOURS.length - 1);
  }

  const daysToAdd = INTERVALLES_JOURS[intervalIndex];
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysToAdd);

  return targetDate.toISOString().split('T')[0];
}

/**
 * Détermine si un cours doit être révisé aujourd'hui ou est en retard
 */
export function isCourseDue(prochaineRevisionDate: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return prochaineRevisionDate <= today;
}

/**
 * Filtre les cours nécessitant une révision prioritaire
 */
export function filterDueCourses(courses: CourseEntity[]): CourseEntity[] {
  return courses
    .filter((c) => isCourseDue(c.prochaineRevisionDate))
    .sort((a, b) => a.niveauMaitrise - b.niveauMaitrise);
}
