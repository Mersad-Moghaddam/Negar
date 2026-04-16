import { SectionCard } from '../../../components/ui/card'
import { SectionHeader } from '../../../components/ui/section-header'
import { AnalyticsBookFocus } from '../../../types'

export function NearFinishCard({ items }: { items: AnalyticsBookFocus[] }) {
  return (
    <SectionCard>
      <SectionHeader title="Books close to completion" description="Best opportunities for quick wins." />
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-surface p-3">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-mutedForeground">{item.progressPercent}% complete • {item.remainingPages} pages left</p>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-mutedForeground">No active books near completion yet.</p>}
    </SectionCard>
  )
}
