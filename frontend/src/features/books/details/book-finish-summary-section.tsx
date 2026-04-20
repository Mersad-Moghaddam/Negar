import { BookCheck } from 'lucide-react'

import { SectionCard } from '../../../components/ui/card'
import { SectionHeader } from '../../../components/ui/section-header'
import { useI18n } from '../../../shared/i18n/i18n-provider'
import { Book } from '../../../types'

import { MiniStat } from './book-detail-primitives'

export function BookFinishSummarySection({
  book,
  loggedPages,
  totalMinutes,
  notesCount,
  formatDate,
  numberFormatter
}: {
  book: Book
  loggedPages: number
  totalMinutes: number
  notesCount: number
  formatDate: (value: string | null) => string
  numberFormatter: Intl.NumberFormat
}) {
  const { t } = useI18n()

  return (
    <SectionCard className="space-y-4">
      <SectionHeader
        title={t('books.finishSummaryTitle')}
        description={t('books.finishSummaryDescription')}
        icon={<BookCheck className="h-4 w-4" />}
      />
      <div className="rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">
        {t('books.finishConfirmation')}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label={t('books.completedOn')} value={formatDate(book.completedAt)} />
        <MiniStat
          label={t('books.recentLoggedPagesLabel')}
          value={numberFormatter.format(loggedPages || book.totalPages)}
        />
        <MiniStat
          label={t('books.recentReadingTimeLabel')}
          value={`${numberFormatter.format(totalMinutes)} ${t('books.minutesLabel')}`}
        />
        <MiniStat
          label={t('books.notesCountLabel')}
          value={numberFormatter.format(notesCount)}
        />
      </div>
      {book.finishRating || book.finishReflection || book.finishHighlight ? (
        <div className="grid gap-3 md:grid-cols-3">
          {book.finishRating ? (
            <MiniStat
              label={t('books.finishRatingSummaryLabel')}
              value={`${numberFormatter.format(book.finishRating)}/5`}
            />
          ) : null}
          {book.finishReflection ? (
            <div className="rounded-xl border border-border bg-surface px-3 py-2 md:col-span-2">
              <p className="text-xs text-mutedForeground">{t('books.finishReflectionLabel')}</p>
              <p className="mt-1 text-sm">{book.finishReflection}</p>
            </div>
          ) : null}
          {book.finishHighlight ? (
            <div className="rounded-xl border border-border bg-surface px-3 py-2 md:col-span-3">
              <p className="text-xs text-mutedForeground">{t('books.finishHighlightLabel')}</p>
              <p className="mt-1 text-sm text-mutedForeground">“{book.finishHighlight}”</p>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-mutedForeground">{t('books.finishSummaryEmptyHint')}</p>
      )}
    </SectionCard>
  )
}
