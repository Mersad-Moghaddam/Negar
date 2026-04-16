import { Flame, Timer } from 'lucide-react'

import { SectionCard } from '../../../components/ui/card'
import { SectionHeader } from '../../../components/ui/section-header'

export function StreakCard({ current, longest, bestWeekday }: { current: number; longest: number; bestWeekday?: string }) {
  return (
    <SectionCard>
      <SectionHeader title="Consistency" description="Your streak and reading rhythm." />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-mutedForeground">Current streak</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold"><Flame className="h-4 w-4 text-amber-500" />{current} days</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-mutedForeground">Longest streak</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold"><Timer className="h-4 w-4" />{longest} days</p>
        </div>
      </div>
      {bestWeekday ? <p className="text-xs text-mutedForeground">Best weekday: {bestWeekday}</p> : null}
    </SectionCard>
  )
}
