import { ChevronDown } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

import { Button } from '../../../components/ui/button'
import { SectionCard } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { SectionHeader } from '../../../components/ui/section-header'
import { Select } from '../../../components/ui/select'
import { FieldBlock, FieldError, statusOptions } from '../../../pages/app/shared/page-primitives'
import { useI18n } from '../../../shared/i18n/i18n-provider'
import { BookStatus } from '../../../types'
import { EditBookDetailsValues } from '../forms/book-schemas'

export function BookManageSection({
  editForm,
  recentlyClickedStatus,
  isSaving,
  onSubmit,
  onMoveStatus,
  onDelete
}: {
  editForm: UseFormReturn<EditBookDetailsValues>
  recentlyClickedStatus: BookStatus | null
  isSaving: boolean
  onSubmit: () => void
  onMoveStatus: (status: BookStatus) => void
  onDelete: () => void
}) {
  const { t } = useI18n()

  return (
    <SectionCard>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium">
          {t('books.manageBook')}
          <ChevronDown className="h-4 w-4 text-mutedForeground transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-4 space-y-4">
          <div>
            <SectionHeader
              title={t('books.editDetailsTitle')}
              description={t('books.editDetailsDescription')}
            />
            <form
              className="mt-4 grid gap-3 md:grid-cols-2"
              onSubmit={editForm.handleSubmit(() => {
                onSubmit()
              })}
            >
              <div>
                <FieldBlock label={t('library.titlePlaceholder')}>
                  <Input
                    placeholder={t('library.titlePlaceholder')}
                    {...editForm.register('title')}
                  />
                </FieldBlock>
                <FieldError message={editForm.formState.errors.title?.message} />
              </div>
              <div>
                <FieldBlock label={t('library.authorPlaceholder')}>
                  <Input
                    placeholder={t('library.authorPlaceholder')}
                    {...editForm.register('author')}
                  />
                </FieldBlock>
                <FieldError message={editForm.formState.errors.author?.message} />
              </div>
              <div>
                <FieldBlock label={t('library.totalPages')}>
                  <Input
                    type="number"
                    min={1}
                    {...editForm.register('totalPages', { valueAsNumber: true })}
                  />
                </FieldBlock>
                <FieldError message={editForm.formState.errors.totalPages?.message} />
              </div>
              <div>
                <FieldBlock label={t('books.updateProgress')}>
                  <Input
                    type="number"
                    min={0}
                    max={editForm.watch('totalPages')}
                    {...editForm.register('currentPage', { valueAsNumber: true })}
                  />
                </FieldBlock>
                <FieldError message={editForm.formState.errors.currentPage?.message} />
              </div>
              <FieldBlock label={t('library.status')}>
                <Select {...editForm.register('status')}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {t(`status.${status}`)}
                    </option>
                  ))}
                </Select>
              </FieldBlock>
              <div>
                <FieldBlock label={t('library.coverUrlOptional')}>
                  <Input
                    placeholder={t('library.coverUrlOptional')}
                    {...editForm.register('coverUrl')}
                  />
                </FieldBlock>
                <FieldError message={editForm.formState.errors.coverUrl?.message} />
              </div>
              <div>
                <FieldBlock label={t('library.genreOptional')}>
                  <Input
                    placeholder={t('library.genreOptional')}
                    {...editForm.register('genre')}
                  />
                </FieldBlock>
                <FieldError message={editForm.formState.errors.genre?.message} />
              </div>
              <div>
                <FieldBlock label={t('library.isbnOptional')}>
                  <Input placeholder={t('library.isbnOptional')} {...editForm.register('isbn')} />
                </FieldBlock>
                <FieldError message={editForm.formState.errors.isbn?.message} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                  {isSaving ? `${t('common.save')}...` : t('common.save')}
                </Button>
              </div>
            </form>
          </div>

          <div>
            <SectionHeader title={t('books.actions')} description={t('books.actionsDescription')} />
            <div className="mt-4 flex flex-wrap gap-2">
              {statusOptions.map((status) => {
                const isClicked = recentlyClickedStatus === status
                return (
                  <Button
                    key={status}
                    size="sm"
                    variant="secondary"
                    className={`w-full transition-colors duration-200 sm:w-auto ${isClicked ? 'border-primary/30 bg-primary/10' : ''}`}
                    onClick={() => onMoveStatus(status)}
                  >
                    {t('books.moveTo')} {t(`status.${status}`)}
                  </Button>
                )
              })}
            </div>
            <Button className="mt-3 w-full sm:w-auto" variant="destructive" onClick={onDelete}>
              {t('books.delete')}
            </Button>
          </div>
        </div>
      </details>
    </SectionCard>
  )
}
