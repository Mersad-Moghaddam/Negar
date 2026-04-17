import { ReadingSession } from '../../../types'

const DAY_MS = 24 * 60 * 60 * 1000

export type SessionMomentum = 'new' | 'active' | 'steady' | 'cooling' | 'paused'

export type TimelineItem = {
  id: string
  date: string
  duration: number
  pagesRead: number
  progressBefore: number
  progressAfter: number
  progressDelta: number
  daysSincePrevious: number | null
}

export type TimelineSummary = {
  momentum: SessionMomentum
  recentSessions: number
  recentPages: number
  lastReadDaysAgo: number | null
  nextActionKey: 'start' | 'keep' | 'recover' | 'finish'
}

export type BookTimelineModel = {
  items: TimelineItem[]
  summary: TimelineSummary
}

export type TimelineDayGroup = {
  dayKey: string
  totalProgressDelta: number
  sessionCount: number
  items: TimelineItem[]
}

function toDate(value: string) {
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime()) ? parsed : null
}

function toUtcDayKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')
  const day = `${date.getUTCDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toSessionDayKey(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  if (/^\d{4}-\d{2}-\d{2}T00:00:00(?:\.\d+)?Z$/.test(value)) return value.slice(0, 10)
  const parsed = toDate(value)
  return parsed ? toUtcDayKey(parsed) : value.slice(0, 10)
}

function daysBetween(older: Date, newer: Date) {
  return Math.floor((newer.getTime() - older.getTime()) / DAY_MS)
}

export function buildBookTimeline(
  sessions: ReadingSession[],
  currentPage: number,
  totalPages: number,
  now = new Date()
): BookTimelineModel {
  const ordered = [...sessions]
    .map((session) => ({ ...session, parsedDate: toDate(session.date) }))
    .filter(
      (session): session is ReadingSession & { parsedDate: Date } =>
        session.parsedDate !== null && session.parsedDate <= now
    )
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime())

  const maxPage = Math.max(totalPages, 0)
  let runningPage = Math.max(0, Math.min(currentPage, maxPage))

  const items: TimelineItem[] = ordered.map((session, index) => {
    const progressAfter = Math.max(0, Math.min(runningPage, maxPage))
    const progressBefore = Math.max(0, progressAfter - Math.max(session.pagesRead ?? 0, 0))
    const previous = ordered[index + 1]
    const daysSincePrevious = previous ? daysBetween(previous.parsedDate, session.parsedDate) : null

    runningPage = progressBefore

    return {
      id: session.id,
      date: session.date,
      duration: Math.max(session.duration ?? 0, 0),
      pagesRead: Math.max(session.pagesRead ?? 0, 0),
      progressBefore,
      progressAfter,
      progressDelta: Math.max(0, progressAfter - progressBefore),
      daysSincePrevious
    }
  })

  const recentSessions = ordered.filter((session) => daysBetween(session.parsedDate, now) <= 13)
  const recentPages = recentSessions.reduce(
    (sum, session) => sum + Math.max(session.pagesRead ?? 0, 0),
    0
  )
  const lastReadDaysAgo = ordered[0] ? daysBetween(ordered[0].parsedDate, now) : null

  let momentum: SessionMomentum = 'new'
  if (!ordered.length) {
    momentum = 'new'
  } else if ((lastReadDaysAgo ?? 100) >= 10) {
    momentum = 'paused'
  } else if ((lastReadDaysAgo ?? 100) >= 5) {
    momentum = 'cooling'
  } else if (recentSessions.length >= 3) {
    momentum = 'steady'
  } else {
    momentum = 'active'
  }

  let nextActionKey: TimelineSummary['nextActionKey'] = 'keep'
  const remainingPages = Math.max(0, maxPage - Math.max(0, currentPage))
  if (!ordered.length) {
    nextActionKey = 'start'
  } else if (remainingPages > 0 && remainingPages <= Math.max(20, Math.round(maxPage * 0.1))) {
    nextActionKey = 'finish'
  } else if (momentum === 'paused' || momentum === 'cooling') {
    nextActionKey = 'recover'
  }

  return {
    items,
    summary: {
      momentum,
      recentSessions: recentSessions.length,
      recentPages,
      lastReadDaysAgo,
      nextActionKey
    }
  }
}

export function groupTimelineByDay(items: TimelineItem[]): TimelineDayGroup[] {
  const groups = new Map<string, TimelineDayGroup>()

  items.forEach((item) => {
    const dayKey = toSessionDayKey(item.date)
    const existing = groups.get(dayKey)

    if (existing) {
      existing.items.push(item)
      existing.sessionCount += 1
      existing.totalProgressDelta += Math.max(item.progressDelta, 0)
      return
    }

    groups.set(dayKey, {
      dayKey,
      totalProgressDelta: Math.max(item.progressDelta, 0),
      sessionCount: 1,
      items: [item]
    })
  })

  return [...groups.values()].sort((a, b) => b.dayKey.localeCompare(a.dayKey))
}
