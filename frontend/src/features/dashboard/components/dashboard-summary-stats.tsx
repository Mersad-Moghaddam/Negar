import { LucideIcon } from 'lucide-react'

import { Card } from '../../../components/ui/card'
import { cn } from '../../../lib/cn'

type DashboardSummaryStat = {
  key: string
  label: string
  value: string
  icon: LucideIcon
  isPrimary?: boolean
}

function DashboardSummaryStatCard({ label, value, icon: Icon, isPrimary = false }: Omit<DashboardSummaryStat, 'key'>) {
  return (
    <Card
      className={cn(
        'surface-hover p-3.5 sm:p-4',
        isPrimary && 'border-primary/35 bg-primary/[0.05] shadow-[0_0_0_1px_hsl(var(--primary)/0.18)]'
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 space-y-1 text-start">
          <p className="text-[11px] leading-5 text-mutedForeground sm:text-xs">{label}</p>
          <p
            className={cn(
              'truncate text-2xl font-semibold leading-none text-foreground sm:text-[1.75rem]',
              isPrimary && 'text-[1.85rem] sm:text-[2rem]'
            )}
          >
            {value}
          </p>
        </div>
        <span
          className={cn(
            'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-surface text-mutedForeground',
            isPrimary && 'border-primary/25 bg-primary/10 text-primary'
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </Card>
  )
}

export function DashboardSummaryStats({ stats }: { stats: DashboardSummaryStat[] }) {
  return (
    <section className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4" aria-label="Dashboard summary stats">
      {stats.map(({ key, ...stat }) => (
        <DashboardSummaryStatCard key={key} {...stat} />
      ))}
    </section>
  )
}
