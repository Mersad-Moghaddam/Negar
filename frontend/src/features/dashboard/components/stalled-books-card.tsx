import { AlertTriangle } from 'lucide-react'

import { SectionCard } from '../../../components/ui/card'
import { SectionHeader } from '../../../components/ui/section-header'
import { AnalyticsBookFocus } from '../../../types'

export function StalledBooksCard({ items }: { items: AnalyticsBookFocus[] }) {
  return (
    <SectionCard>
      <SectionHeader title="Books at risk" description="Books that may be stagnating." />
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4 text-amber-500" />{item.title}</p>
              <p className="text-xs text-mutedForeground">No activity for {item.lastActivityDays ?? 0} days • {item.remainingPages} pages remaining</p>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-mutedForeground">No stalled books detected.</p>}
    </SectionCard>
  )
}
