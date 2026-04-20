import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Progress, StatusBadge } from '../../components/UI'
import { Button } from '../../components/ui/button'
import { Card, SectionCard } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { PageHeader } from '../../components/ui/page-header'
import { HubMeta, MiniStat } from '../../features/books/details/book-detail-primitives'
import { BookFinishSummarySection } from '../../features/books/details/book-finish-summary-section'
import { BookManageSection } from '../../features/books/details/book-manage-section'
import { BookNotesSection } from '../../features/books/details/book-notes-section'
import { BookTimelineSection } from '../../features/books/details/book-timeline-section'
import {
  editBookDetailsSchema,
  EditBookDetailsValues,
  progressSchema,
  ProgressValues
} from '../../features/books/forms/book-schemas'
import {
  useBookNotesQuery,
  useBookQuery,
  useCreateBookNoteMutation,
  useDeleteBookMutation,
  useUpdateBookMutation,
  useUpdateBookProgressMutation,
  useUpdateBookStatusMutation
} from '../../features/books/queries/use-books'
import { buildBookTimeline, groupTimelineByDay } from '../../features/books/timeline/book-timeline'
import { useBookSessions } from '../../features/dashboard/queries/use-dashboard'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { useToast } from '../../shared/toast/toast-provider'
import { BookStatus } from '../../types'

import { BookCover } from './shared/page-primitives'

const TIMELINE_VISIBLE_STEP = 7
const TIMELINE_DEFAULT_EXPANDED_DAYS = 3

type BookNoteFormValues = {
  note: string
  highlight: string
}

export function BookDetails({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const toast = useToast()
  const nav = useNavigate()
  const query = useBookQuery(id)
  const updateBook = useUpdateBookMutation()
  const updateStatus = useUpdateBookStatusMutation()
  const updateProgress = useUpdateBookProgressMutation()
  const deleteBook = useDeleteBookMutation()
  const notesQuery = useBookNotesQuery(id)
  const sessionsQuery = useBookSessions(id)
  const addNote = useCreateBookNoteMutation(id)

  const progressForm = useForm<ProgressValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: { currentPage: 0 }
  })
  const editForm = useForm<EditBookDetailsValues>({
    resolver: zodResolver(editBookDetailsSchema),
    defaultValues: {
      title: '',
      author: '',
      totalPages: 1,
      currentPage: 0,
      status: 'inLibrary',
      coverUrl: '',
      genre: '',
      isbn: ''
    }
  })
  const noteForm = useForm<BookNoteFormValues>({
    defaultValues: { note: '', highlight: '' }
  })
  const [captureHighlight, setCaptureHighlight] = useState(false)
  const [recentlyClickedStatus, setRecentlyClickedStatus] = useState<BookStatus | null>(null)
  const [visibleTimelineDays, setVisibleTimelineDays] = useState(TIMELINE_VISIBLE_STEP)
  const [expandedTimelineDays, setExpandedTimelineDays] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!query.data) return

    editForm.reset({
      title: query.data.title,
      author: query.data.author,
      totalPages: query.data.totalPages,
      currentPage: query.data.currentPage ?? 0,
      status: query.data.status,
      coverUrl: query.data.coverUrl ?? '',
      genre: query.data.genre ?? '',
      isbn: query.data.isbn ?? ''
    })
    progressForm.reset({ currentPage: query.data.currentPage ?? 0 })
  }, [editForm, progressForm, query.data])

  const book = query.data
  const sessionsForBook = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data])
  const timeline = useMemo(
    () => buildBookTimeline(sessionsForBook, book?.currentPage ?? 0, book?.totalPages ?? 0),
    [book?.currentPage, book?.totalPages, sessionsForBook]
  )
  const timelineDayGroups = useMemo(() => groupTimelineByDay(timeline.items), [timeline.items])
  const timelineDayGroupKey = useMemo(
    () => timelineDayGroups.map((group) => group.dayKey).join('|'),
    [timelineDayGroups]
  )
  const defaultExpandedTimelineDays = useMemo(
    () => timelineDayGroups.slice(0, TIMELINE_DEFAULT_EXPANDED_DAYS).map((group) => group.dayKey),
    [timelineDayGroups]
  )
  const defaultExpandedTimelineDayKey = useMemo(
    () => defaultExpandedTimelineDays.join('|'),
    [defaultExpandedTimelineDays]
  )
  const notes = notesQuery.data ?? []
  const notesWithHighlights = notes.filter((note) => Boolean(note.highlight?.trim()))
  const notesWithoutHighlights = notes.filter((note) => !note.highlight?.trim())
  const loggedPages = sessionsForBook.reduce((sum, session) => sum + session.pagesRead, 0)
  const totalMinutes = sessionsForBook.reduce((sum, session) => sum + session.duration, 0)

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US'),
    [locale]
  )
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
    [locale]
  )
  const calendarDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      }),
    [locale]
  )
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }),
    [locale]
  )

  useEffect(() => {
    setVisibleTimelineDays((current) =>
      current === TIMELINE_VISIBLE_STEP ? current : TIMELINE_VISIBLE_STEP
    )
    setExpandedTimelineDays((current) => {
      const currentKey = [...current].join('|')
      if (currentKey === defaultExpandedTimelineDayKey) return current
      return new Set(defaultExpandedTimelineDays)
    })
  }, [defaultExpandedTimelineDayKey, defaultExpandedTimelineDays, timelineDayGroupKey])

  const formatDate = (value: string | null) => {
    if (!value) return '—'
    return dateFormatter.format(new Date(value))
  }

  const formatCalendarDate = (value: string | null) => {
    if (!value) return '—'
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return calendarDateFormatter.format(new Date(`${value}T00:00:00Z`))
    }
    if (/T00:00:00(?:\\.\\d+)?Z$/.test(value)) {
      return calendarDateFormatter.format(new Date(value))
    }
    return dateFormatter.format(new Date(value))
  }

  const formatTimelineDayLabel = (dayKey: string) => {
    const now = new Date()
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const dayDate = new Date(`${dayKey}T00:00:00Z`)
    const daysAgo = Math.floor((todayUtc.getTime() - dayDate.getTime()) / (24 * 60 * 60 * 1000))

    if (daysAgo === 0) return t('books.timelineDayToday')
    if (daysAgo === 1) return t('books.timelineDayYesterday')
    return formatCalendarDate(dayKey)
  }

  const formatSessionTime = (value: string) => {
    if (!value.includes('T')) return null
    const parsed = new Date(value)
    if (!Number.isFinite(parsed.getTime())) return null
    const utcTime =
      `${parsed.getUTCHours()}`.padStart(2, '0') +
      ':' +
      `${parsed.getUTCMinutes()}`.padStart(2, '0')
    if (utcTime === '00:00') return null
    return timeFormatter.format(parsed)
  }

  const visibleTimelineGroups = useMemo(
    () => timelineDayGroups.slice(0, Math.min(visibleTimelineDays, timelineDayGroups.length)),
    [timelineDayGroups, visibleTimelineDays]
  )
  const hasOlderTimeline = visibleTimelineDays < timelineDayGroups.length

  const handleToggleTimelineDay = (dayKey: string) => {
    setExpandedTimelineDays((current) => {
      const next = new Set(current)
      if (next.has(dayKey)) {
        next.delete(dayKey)
      } else {
        next.add(dayKey)
      }
      return next
    })
  }

  const handleMoveStatus = async (status: BookStatus) => {
    if (!book) return

    setRecentlyClickedStatus(status)
    window.setTimeout(() => {
      setRecentlyClickedStatus((current) => (current === status ? null : current))
    }, 500)

    await updateStatus.mutateAsync({ id: book.id, status })
  }

  const handleSaveNote = async () => {
    const values = noteForm.getValues()
    const note = values.note.trim()
    const highlight = values.highlight.trim()
    if (!note) return

    await addNote.mutateAsync({ note, highlight: highlight || undefined })
    noteForm.reset()
    setCaptureHighlight(false)
  }

  const handleSaveBook = async () => {
    if (!book) return

    try {
      const values = editForm.getValues()
      const initialCurrentPage = book.currentPage ?? 0

      await updateBook.mutateAsync({
        id: book.id,
        payload: {
          title: values.title,
          author: values.author,
          totalPages: values.totalPages,
          status: values.status,
          coverUrl: values.coverUrl || undefined,
          genre: values.genre || undefined,
          isbn: values.isbn || undefined
        }
      })

      if (values.currentPage !== initialCurrentPage) {
        await updateProgress.mutateAsync({
          id: book.id,
          currentPage: values.currentPage
        })

        const statusAfterProgress: BookStatus =
          values.currentPage === values.totalPages ? 'finished' : 'currentlyReading'
        if (values.status !== statusAfterProgress) {
          await updateStatus.mutateAsync({ id: book.id, status: values.status })
        }
      }

      toast.success(t('books.bookUpdated'))
    } catch {
      toast.error(t('books.updateError'))
    }
  }

  const handleDeleteBook = async () => {
    if (!book) return
    await deleteBook.mutateAsync(book.id)
    nav('/library')
  }

  if (!book) return <Card className="p-6">{t('common.loading')}</Card>

  const timelineMomentumLabel = t(`books.timelineMomentum.${timeline.summary.momentum}`)
  const timelineLastReadLabel =
    timeline.summary.lastReadDaysAgo === null
      ? t('books.timelineNever')
      : timeline.summary.lastReadDaysAgo === 0
        ? t('books.timelineToday')
        : t('books.timelineDaysAgo', {
            count: numberFormatter.format(timeline.summary.lastReadDaysAgo)
          })
  const timelineRecentPagesLabel = `${numberFormatter.format(timeline.summary.recentPages)} ${t('books.pagesLabel')}`
  const timelineNextActionLabel = t(`books.timelineNextAction.${timeline.summary.nextActionKey}`)
  const isSavingBook = updateBook.isPending || updateProgress.isPending || updateStatus.isPending

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title={book.title}
        description={book.author}
        action={<StatusBadge status={book.status} />}
        eyebrow={t('books.readingHub')}
      />

      <SectionCard className="space-y-5 overflow-hidden">
        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <BookCover title={book.title} coverUrl={book.coverUrl} />
          <div className="min-w-0 space-y-3">
            <div>
              <p className="text-sm text-mutedForeground">{t('books.readingProgress')}</p>
              <p className="text-2xl font-semibold">
                {numberFormatter.format(Math.round(book.progressPercentage))}%
              </p>
            </div>
            <Progress value={book.progressPercentage} />
            <p className="text-sm text-mutedForeground">
              {numberFormatter.format(book.currentPage ?? 0)} /{' '}
              {numberFormatter.format(book.totalPages)} {t('books.pagesLabel')}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HubMeta label={t('books.genreLabel')} value={book.genre || t('library.genreFallback')} />
          <HubMeta label={t('books.isbnLabel')} value={book.isbn || '—'} />
          <HubMeta label={t('books.lastUpdated')} value={formatDate(book.updatedAt)} />
          <HubMeta
            label={t('books.completedOn')}
            value={book.completedAt ? formatDate(book.completedAt) : t('books.notFinished')}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat
              label={t('books.remainingPagesLabel')}
              value={numberFormatter.format(book.remainingPages)}
            />
            <MiniStat
              label={t('books.recentSessionsCountLabel')}
              value={numberFormatter.format(sessionsForBook.length)}
            />
            <MiniStat
              label={t('books.notesCountLabel')}
              value={numberFormatter.format(notes.length)}
            />
          </div>

          {book.status === 'currentlyReading' ? (
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={progressForm.handleSubmit(async (values) =>
                updateProgress.mutateAsync({ id: book.id, currentPage: values.currentPage })
              )}
            >
              <Input
                className="sm:min-w-[180px] sm:flex-1"
                type="number"
                min={0}
                max={book.totalPages}
                {...progressForm.register('currentPage', { valueAsNumber: true })}
              />
              <Button type="submit" className="w-full sm:w-auto">
                {t('books.updateProgress')}
              </Button>
            </form>
          ) : (
            <Button className="w-full sm:w-auto" onClick={() => void handleMoveStatus('currentlyReading')}>
              {t('books.startReading')}
            </Button>
          )}
        </div>
      </SectionCard>

      <BookTimelineSection
        momentumLabel={timelineMomentumLabel}
        lastReadLabel={timelineLastReadLabel}
        recentPagesLabel={timelineRecentPagesLabel}
        nextActionLabel={timelineNextActionLabel}
        visibleGroups={visibleTimelineGroups}
        expandedDays={expandedTimelineDays}
        formatTimelineDayLabel={formatTimelineDayLabel}
        formatCalendarDate={formatCalendarDate}
        formatSessionTime={formatSessionTime}
        numberFormatter={numberFormatter}
        hasOlderTimeline={hasOlderTimeline}
        onToggleDay={handleToggleTimelineDay}
        onLoadOlder={() =>
          setVisibleTimelineDays((current) =>
            Math.min(current + TIMELINE_VISIBLE_STEP, timelineDayGroups.length)
          )
        }
      />

      <BookNotesSection
        notes={notes}
        notesWithHighlights={notesWithHighlights}
        notesWithoutHighlights={notesWithoutHighlights}
        noteForm={noteForm}
        captureHighlight={captureHighlight}
        onToggleHighlight={() => {
          setCaptureHighlight((value) => !value)
          if (captureHighlight) noteForm.setValue('highlight', '')
        }}
        onSubmit={() => {
          void handleSaveNote()
        }}
        formatDate={formatDate}
        numberFormatter={numberFormatter}
      />

      {book.status === 'finished' ? (
        <BookFinishSummarySection
          book={book}
          loggedPages={loggedPages}
          totalMinutes={totalMinutes}
          notesCount={notes.length}
          formatDate={formatDate}
          numberFormatter={numberFormatter}
        />
      ) : null}

      <BookManageSection
        editForm={editForm}
        recentlyClickedStatus={recentlyClickedStatus}
        isSaving={isSavingBook}
        onSubmit={() => {
          void handleSaveBook()
        }}
        onMoveStatus={(status) => {
          void handleMoveStatus(status)
        }}
        onDelete={() => {
          void handleDeleteBook()
        }}
      />
    </div>
  )
}
