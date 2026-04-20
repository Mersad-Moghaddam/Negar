import { ChevronDown, NotebookPen, Quote } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

import { Button } from '../../../components/ui/button'
import { SectionCard } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { SectionHeader } from '../../../components/ui/section-header'
import { Textarea } from '../../../components/ui/textarea'
import { FieldBlock } from '../../../pages/app/shared/page-primitives'
import { useI18n } from '../../../shared/i18n/i18n-provider'
import { BookNote } from '../../../types'

type BookNoteFormValues = {
  note: string
  highlight: string
}

export function BookNotesSection({
  notes,
  notesWithHighlights,
  notesWithoutHighlights,
  noteForm,
  captureHighlight,
  onToggleHighlight,
  onSubmit,
  formatDate,
  numberFormatter
}: {
  notes: BookNote[]
  notesWithHighlights: BookNote[]
  notesWithoutHighlights: BookNote[]
  noteForm: UseFormReturn<BookNoteFormValues>
  captureHighlight: boolean
  onToggleHighlight: () => void
  onSubmit: () => void
  formatDate: (value: string | null) => string
  numberFormatter: Intl.NumberFormat
}) {
  const { t } = useI18n()

  return (
    <SectionCard>
      <SectionHeader
        title={t('books.notesSummaryTitle')}
        description={t('books.notesSummaryDescription')}
        icon={<NotebookPen className="h-4 w-4" />}
      />
      <div className="space-y-2">
        {notes.slice(0, 3).map((note) => (
          <div key={note.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
            <div className="mb-1 flex items-center gap-2 text-xs text-mutedForeground">
              <span className="rounded-full border border-border px-2 py-0.5">
                {note.highlight ? t('books.noteTypeHighlight') : t('books.noteTypeNote')}
              </span>
              <span>{formatDate(note.createdAt)}</span>
            </div>
            <p>{note.note}</p>
            {note.highlight ? <p className="mt-1 text-mutedForeground">“{note.highlight}”</p> : null}
          </div>
        ))}
        {!notes.length ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-mutedForeground">
            <p className="font-medium text-foreground">{t('books.notesEmptyTitle')}</p>
            <p className="mt-1">{t('books.notesEmpty')}</p>
          </div>
        ) : null}
      </div>

      <details className="group rounded-xl border border-border bg-surface p-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium">
          {t('books.manageNotes')}
          <ChevronDown className="h-4 w-4 text-mutedForeground transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 space-y-3">
          <form
            className="space-y-2"
            onSubmit={noteForm.handleSubmit(() => {
              onSubmit()
            })}
          >
            <FieldBlock label={t('books.noteLabel')}>
              <Textarea placeholder={t('books.notePlaceholder')} {...noteForm.register('note')} />
            </FieldBlock>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs font-medium text-mutedForeground hover:text-foreground"
              onClick={onToggleHighlight}
            >
              <Quote className="h-3.5 w-3.5" />
              {captureHighlight ? t('books.removeHighlightField') : t('books.addHighlightField')}
            </button>
            {captureHighlight ? (
              <FieldBlock label={t('books.highlightLabel')}>
                <Input
                  placeholder={t('books.highlightPlaceholder')}
                  {...noteForm.register('highlight')}
                />
              </FieldBlock>
            ) : null}
            <Button type="submit" size="sm" className="w-full sm:w-auto">
              {t('books.saveNote')}
            </Button>
          </form>

          {notes.length ? (
            <div className="space-y-3">
              {notesWithHighlights.length ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-mutedForeground">
                    {t('books.highlightsGroupLabel', {
                      count: numberFormatter.format(notesWithHighlights.length)
                    })}
                  </p>
                  {notesWithHighlights.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-border bg-background p-3 text-sm"
                    >
                      <p>{note.note}</p>
                      <p className="mt-1 text-mutedForeground">“{note.highlight}”</p>
                    </div>
                  ))}
                </div>
              ) : null}
              {notesWithoutHighlights.length ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-mutedForeground">
                    {t('books.notesGroupLabel', {
                      count: numberFormatter.format(notesWithoutHighlights.length)
                    })}
                  </p>
                  {notesWithoutHighlights.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-border bg-background p-3 text-sm"
                    >
                      <p>{note.note}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-mutedForeground">{t('books.notesCaptureHint')}</p>
          )}
        </div>
      </details>
    </SectionCard>
  )
}
