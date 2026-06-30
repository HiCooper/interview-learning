'use client';

const STORAGE_KEY = 'study-progress';

export interface CardProgress {
  cardId: string;
  lastReviewed: string; // ISO date
  timesCorrect: number;
  timesWrong: number;
  nextReview: string; // ISO date
  interval: number; // days until next review
}

export interface StudyProgress {
  cards: Record<string, CardProgress>;
  sessions: { date: string; cardsReviewed: number; duration: number }[];
  streak: number;
  lastSessionDate: string;
}

function loadProgress(): StudyProgress {
  if (typeof window === 'undefined') {
    return { cards: {}, sessions: [], streak: 0, lastSessionDate: '' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { cards: {}, sessions: [], streak: 0, lastSessionDate: '' };
}

function saveProgress(p: StudyProgress) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }
}

export function getCardProgress(cardId: string): CardProgress | null {
  const p = loadProgress();
  return p.cards[cardId] || null;
}

export function recordReview(cardId: string, correct: boolean): CardProgress {
  const p = loadProgress();
  const existing = p.cards[cardId];
  const now = new Date();

  let interval = existing?.interval || 1;
  let timesCorrect = existing?.timesCorrect || 0;
  let timesWrong = existing?.timesWrong || 0;

  if (correct) {
    timesCorrect++;
    interval = Math.min(interval * 2.5, 90); // Spaced repetition: 1→3→7→18→45→90
  } else {
    timesWrong++;
    interval = 1; // Reset to 1 day
  }

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + Math.round(interval));

  const progress: CardProgress = {
    cardId,
    lastReviewed: now.toISOString(),
    timesCorrect,
    timesWrong,
    nextReview: nextReview.toISOString(),
    interval: Math.round(interval),
  };

  p.cards[cardId] = progress;
  saveProgress(p);
  return progress;
}

export function recordSession(cardsReviewed: number, duration: number) {
  const p = loadProgress();
  const today = new Date().toISOString().split('T')[0];

  p.sessions.push({ date: today, cardsReviewed, duration });

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (p.lastSessionDate === yesterdayStr || p.lastSessionDate === today) {
    if (p.lastSessionDate !== today) p.streak++;
  } else if (p.lastSessionDate !== today) {
    p.streak = 1;
  }
  p.lastSessionDate = today;

  // Keep only last 60 sessions
  if (p.sessions.length > 60) p.sessions = p.sessions.slice(-60);

  saveProgress(p);
  return p;
}

export function getDueCards(cardIds: string[]): string[] {
  const p = loadProgress();
  const now = new Date();
  return cardIds.filter(id => {
    const cp = p.cards[id];
    if (!cp) return true; // Never reviewed = due
    return new Date(cp.nextReview) <= now;
  });
}

export function getProgress(): StudyProgress {
  return loadProgress();
}

export function getModuleStats(): Record<string, { total: number; mastered: number }> {
  const p = loadProgress();
  const stats: Record<string, { total: number; mastered: number }> = {};
  
  for (const [id, cp] of Object.entries(p.cards)) {
    // Extract module from card ID (e.g., "concurrency-q1" → module unknown from ID alone)
    // We'll aggregate differently - just count cards with interval >= 7 as "mastered"
    const module = 'unknown'; // Will be enriched by component
    // For now just track global stats
  }
  
  return stats;
}
