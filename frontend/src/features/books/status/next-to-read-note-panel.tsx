import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/textarea'
import { useI18n } from '../../../shared/i18n/i18n-provider'

export function NextToReadNotePanel({
  value,
  onChange,
  onSave,
  onClear
}: {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  onClear: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
      <label className="block space-y-1">
        <span className="text-xs text-mutedForeground">{t('books.whyNextLabel')}</span>
        <Textarea
          rows={2}
          maxLength={240}
          placeholder={t('books.whyNextPlaceholder')}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onSave}>
          {t('common.save')}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClear}>
          {t('common.clear')}
        </Button>
      </div>
    </div>
  )
}
