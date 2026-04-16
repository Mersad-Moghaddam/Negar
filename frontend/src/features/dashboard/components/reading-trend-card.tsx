import { SectionCard } from '../../../components/ui/card'
import { SectionHeader } from '../../../components/ui/section-header'
import { AnalyticsComparison } from '../../../types'

function DeltaRow({ label, item }: { label: string; item: { current: number; prev: number; change: number; direction: string; percent: number } }) {
  const tone = item.direction === 'up' ? 'text-emerald-500' : item.direction === 'down' ? 'text-amber-500' : 'text-mutedForeground'
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs text-mutedForeground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{item.current}</p>
      <p className={`text-xs ${tone}`}>{item.change >= 0 ? '+' : ''}{item.change} ({item.percent}%) vs previous</p>
    </div>
  )
}

export function ReadingTrendCard({ title, comparison }: { title: string; comparison: AnalyticsComparison }) {
  return (
    <SectionCard>
      <SectionHeader title={title} description="Compare reading output with the prior period." />
      <div className="grid gap-2 sm:grid-cols-3">
        <DeltaRow label="Sessions" item={comparison.sessions} />
        <DeltaRow label="Pages" item={comparison.pages} />
        <DeltaRow label="Minutes" item={comparison.minutes} />
      </div>
    </SectionCard>
  )
}
