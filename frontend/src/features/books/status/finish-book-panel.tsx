import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/textarea'
import { useI18n } from '../../../shared/i18n/i18n-provider'

type FinishDraft = {
  rating?: number
  reflection: string
  highlight: string
}

export function FinishBookPanel({
  draft,
  numberFormatter,
  isSubmitting,
  onSelectRating,
  onChangeReflection,
  onChangeHighlight,
  onFinishDetailed,
  onFinishQuick
}: {
  draft: FinishDraft
  numberFormatter: Intl.NumberFormat
  isSubmitting: boolean
  onSelectRating: (rating: number) => void
  onChangeReflection: (value: string) => void
  onChangeHighlight: (value: string) => void
  onFinishDetailed: () => void
  onFinishQuick: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">{t('books.finishFlowTitle')}</p>
        <p className="text-xs text-mutedForeground">{t('books.finishFlowDescription')}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-mutedForeground">{t('books.finishRatingLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((rating) => {
            const selected = draft.rating === rating
            return (
              <Button
                key={rating}
                size="sm"
                type="button"
                variant={selected ? 'primary' : 'secondary'}
                className="min-w-10"
                onClick={() => onSelectRating(rating)}
              >
                {numberFormatter.format(rating)}
              </Button>
            )
          })}
        </div>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-mutedForeground">{t('books.finishReflectionLabel')}</span>
        <Textarea
          rows={2}
          maxLength={1000}
          placeholder={t('books.finishReflectionPlaceholder')}
          value={draft.reflection}
          onChange={(event) => onChangeReflection(event.target.value)}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-mutedForeground">{t('books.finishHighlightLabel')}</span>
        <Textarea
          rows={2}
          maxLength={600}
          placeholder={t('books.finishHighlightPlaceholder')}
          value={draft.highlight}
          onChange={(event) => onChangeHighlight(event.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={isSubmitting} onClick={onFinishDetailed}>
          {t('books.finishNowAction')}
        </Button>
        <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onFinishQuick}>
          {t('books.finishQuickAction')}
        </Button>
      </div>
    </div>
  )
}
