import api from '../../../api/client'
import { extractData } from '../../../api/http'
import { GoalProgress, ReadingAnalytics, ReadingInsight, ReadingSession, ReminderSettings } from '../../../types'

export async function fetchAnalytics() {
  const response = await api.get<ReadingAnalytics>('/dashboard/analytics')
  return extractData(response)
}

export async function fetchInsights() {
  const response = await api.get<{ items: ReadingInsight[] }>('/dashboard/insights')
  return extractData(response).items
}

export async function fetchReminder() {
  const response = await api.get<ReminderSettings>('/users/reminders')
  return extractData(response)
}

export async function fetchGoals() {
  const response = await api.get<{ items: GoalProgress[] }>('/reading/goals')
  return extractData(response).items
}

export async function updateGoal(payload: { period: 'weekly' | 'monthly'; pages: number; books: number }) {
  await api.put('/reading/goals', payload)
}

export async function fetchSessions() {
  const response = await api.get<{ items: ReadingSession[] }>('/reading/sessions')
  return extractData(response).items
}

export async function createSession(payload: { bookId: string; date: string; duration: number; pages: number }) {
  await api.post('/reading/sessions', payload)
}
