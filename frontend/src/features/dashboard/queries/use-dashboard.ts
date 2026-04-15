import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/query/query-keys'
import { createSession, fetchAnalytics, fetchGoals, fetchReminder, fetchSessions, updateGoal } from '../api/dashboard-api'

export function useDashboardAnalytics() {
  return useQuery({ queryKey: queryKeys.dashboard.analytics, queryFn: fetchAnalytics })
}

export function useDashboardReminder() {
  return useQuery({ queryKey: queryKeys.dashboard.reminder, queryFn: fetchReminder })
}

export function useGoalProgress() {
  return useQuery({ queryKey: queryKeys.dashboard.goals, queryFn: fetchGoals })
}

export function useSessions() {
  return useQuery({ queryKey: queryKeys.dashboard.sessions, queryFn: fetchSessions })
}

export function useSaveGoalMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateGoal,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.goals })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.analytics })
    }
  })
}

export function useCreateSessionMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.sessions })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.goals })
      void qc.invalidateQueries({ queryKey: queryKeys.books.all })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.analytics })
    }
  })
}
