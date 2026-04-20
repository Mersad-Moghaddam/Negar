import { QueryClient } from '@tanstack/react-query'

import { queryKeys } from './query-keys'

async function invalidateQueries(
  queryClient: QueryClient,
  queryKeysToInvalidate: ReadonlyArray<readonly unknown[]>
) {
  await Promise.all(
    queryKeysToInvalidate.map((queryKey) =>
      queryClient.invalidateQueries({
        queryKey
      })
    )
  )
}

export async function invalidateReadingOverviewQueries(queryClient: QueryClient, bookId?: string) {
  const queryKeysToInvalidate: Array<readonly unknown[]> = [
    queryKeys.books.all,
    queryKeys.dashboard.summary,
    queryKeys.dashboard.analytics,
    queryKeys.dashboard.goals,
    queryKeys.dashboard.sessions,
    queryKeys.dashboard.insights
  ]

  if (bookId) {
    queryKeysToInvalidate.push(queryKeys.books.detail(bookId), queryKeys.dashboard.sessionsByBook(bookId))
  }

  await invalidateQueries(queryClient, queryKeysToInvalidate)
}

export async function invalidateReminderQueries(queryClient: QueryClient) {
  await invalidateQueries(queryClient, [queryKeys.profile.reminder, queryKeys.dashboard.reminder])
}
