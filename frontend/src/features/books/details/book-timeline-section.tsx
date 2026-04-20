import { ChevronDown, ChevronRight, Clock3 } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { SectionCard } from '../../../components/ui/card'
import { SectionHeader } from '../../../components/ui/section-header'
import { useI18n } from '../../../shared/i18n/i18n-provider'
import { TimelineDayGroup } from '../timeline/book-timeline'

import { MiniStat } from './book-detail-primitives'

export function BookTimelineSection({
  momentumLabel,
  lastReadLabel,
  recentPagesLabel,
  nextActionLabel,
  visibleGroups,
  expandedDays,
  formatTimelineDayLabel,
  formatCalendarDate,
  formatSessionTime,
  numberFormatter,
  hasOlderTimeline,
  onToggleDay,
  onLoadOlder
}: {
  momentumLabel: string
  lastReadLabel: string
  recentPagesLabel: string
  nextActionLabel: string
  visibleGroups: TimelineDayGroup[]
  expandedDays: Set<string>
  formatTimelineDayLabel: (dayKey: string) => string
  formatCalendarDate: (value: string | null) => string
  formatSessionTime: (value: string) => string | null
  numberFormatter: Intl.NumberFormat
  hasOlderTimeline: boolean
  onToggleDay: (dayKey: string) => void
  onLoadOlder: () => void
}) {
  const { t } = useI18n()

  return (
    <SectionCard>
      <SectionHeader
        title={t('books.timelineTitle')}
        description={t('books.timelineDescription')}
        icon={<Clock3 className="h-4 w-4" />}
      />
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat
            label={t('books.timelineMomentumLabel')}
            value={momentumLabel}
          />
          <MiniStat label={t('books.timelineLastReadLabel')} value={lastReadLabel} />
          <MiniStat label={t('books.timelineRecentPagesLabel')} value={recentPagesLabel} />
        </div>

        <div className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-mutedForeground">
          <span className="font-medium text-foreground">{t('books.timelineNextActionLabel')}:</span>{' '}
          {nextActionLabel}
        </div>

        <div className="space-y-2">
          {visibleGroups.map((group) => {
            const isExpanded = expandedDays.has(group.dayKey)
            return (
              <div key={group.dayKey} className="rounded-xl border border-border bg-surface/80">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                  onClick={() => onToggleDay(group.dayKey)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {formatTimelineDayLabel(group.dayKey)}
                    </p>
                    <p className="mt-0.5 text-xs text-mutedForeground">
                      {t('books.timelineDaySummary', {
                        count: numberFormatter.format(group.sessionCount),
                        pages: numberFormatter.format(group.totalProgressDelta)
                      })}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-mutedForeground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-mutedForeground" />
                  )}
                </button>
                {isExpanded ? (
                  <div className="border-t border-border/80 px-3 py-1.5">
                    {group.items.map((session) => {
                      const sessionTime = formatSessionTime(session.date)

                      return (
                        <div
                          key={session.id}
                          className="flex items-center justify-between gap-3 border-b border-border/70 py-2 text-sm last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="text-xs text-mutedForeground">
                              {sessionTime ?? formatCalendarDate(session.date)}
                            </p>
                            <p className="text-xs text-mutedForeground">
                              {numberFormatter.format(session.progressBefore)} →{' '}
                              {numberFormatter.format(session.progressAfter)}{' '}
                              {t('books.pagesShortLabel')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-foreground">
                              +{numberFormatter.format(session.progressDelta)}{' '}
                              {t('books.pagesShortLabel')}
                            </p>
                            <p className="text-xs text-mutedForeground">
                              {numberFormatter.format(session.duration)} {t('books.minutesLabel')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
          {hasOlderTimeline ? (
            <Button variant="ghost" size="sm" className="w-full" onClick={onLoadOlder}>
              {t('books.timelineLoadOlder')}
            </Button>
          ) : null}
          {!visibleGroups.length ? (
            <p className="text-sm text-mutedForeground">{t('books.sessionsEmpty')}</p>
          ) : null}
        </div>
      </div>
    </SectionCard>
  )
}
