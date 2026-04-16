import { BookOpenCheck, CalendarClock, Clock3, Route } from 'lucide-react'

import { Card } from '../../../components/ui/card'
import { ReadingIntelligence } from '../../../types'

type Props = {
  intelligence: ReadingIntelligence
  formatNumber: (value: number) => string
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BookOpenCheck }) {
  return (
    <Card className="surface-hover p-4">
      <div className="flex items-center justify-between text-mutedForeground">
        <p className="text-xs">{label}</p>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  )
}

export function DashboardMetricGrid({ intelligence, formatNumber }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Total sessions" value={formatNumber(intelligence.totalReadingSessions)} icon={BookOpenCheck} />
      <Metric label="Avg pages/session" value={formatNumber(Math.round(intelligence.averagePagesPerSession))} icon={Route} />
      <Metric label="Weekly minutes" value={formatNumber(intelligence.weeklyReadingMinutes)} icon={Clock3} />
      <Metric label="Sessions this month" value={formatNumber(intelligence.sessionsThisMonth)} icon={CalendarClock} />
    </div>
  )
}
