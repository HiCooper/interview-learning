const STORAGE_KEY = 'study-progress-v2'

export interface CardProgress {
  cardId: string
  lastReviewed: string
  timesCorrect: number
  timesWrong: number
  nextReview: string
  interval: number
}

export interface StudyProgress {
  cards: Record<string, CardProgress>
  sessions: { date: string; cardsReviewed: number; duration: number }[]
  streak: number
  lastSessionDate: string
}

export function loadProgress(): StudyProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { cards: {}, sessions: [], streak: 0, lastSessionDate: '' }
}

function saveProgress(p: StudyProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

export function recordReview(cardId: string, correct: boolean): CardProgress {
  const p = loadProgress()
  const existing = p.cards[cardId]
  const now = new Date()

  let interval = existing?.interval || 1
  let timesCorrect = existing?.timesCorrect || 0
  let timesWrong = existing?.timesWrong || 0

  if (correct) {
    timesCorrect++
    interval = Math.min(Math.round(interval * 2.5), 90)
  } else {
    timesWrong++
    interval = 1
  }

  const nextReview = new Date(now)
  nextReview.setDate(nextReview.getDate() + interval)

  const progress: CardProgress = {
    cardId,
    lastReviewed: now.toISOString(),
    timesCorrect,
    timesWrong,
    nextReview: nextReview.toISOString(),
    interval,
  }

  p.cards[cardId] = progress
  saveProgress(p)
  return progress
}

export function recordSession(cardsReviewed: number, duration: number) {
  const p = loadProgress()
  const today = new Date().toISOString().split('T')[0]

  p.sessions.push({ date: today, cardsReviewed, duration })

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (p.lastSessionDate === yesterdayStr || p.lastSessionDate === today) {
    if (p.lastSessionDate !== today) p.streak++
  } else if (p.lastSessionDate !== today) {
    p.streak = 1
  }
  p.lastSessionDate = today

  if (p.sessions.length > 60) p.sessions = p.sessions.slice(-60)
  saveProgress(p)
  return p
}

export function exportData(): string {
  return JSON.stringify(loadProgress(), null, 2)
}

export function importData(json: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(json)
    if (!data.cards || !data.sessions || typeof data.streak !== "number") {
      return { success: false, message: "数据格式不正确，请检查文件内容" }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { success: true, message: "导入成功！刷新页面查看最新数据" }
  } catch {
    return { success: false, message: "JSON 解析失败，请检查文件格式" }
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getDueCards(cardIds: string[]): string[] {
  const p = loadProgress()
  const now = new Date()
  return cardIds.filter(id => {
    const cp = p.cards[id]
    if (!cp) return true
    return new Date(cp.nextReview) <= now
  })
}
