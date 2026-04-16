import { LibraryBig } from 'lucide-react'

export function PageHeading({ title }: { title: string }) {
  return <h1 className="sr-only">{title}</h1>
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

export function FieldBlock({
  label,
  children,
  hint
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-label text-mutedForeground">{label}</span>
      {children}
      {hint ? <p className="text-xs text-mutedForeground">{hint}</p> : null}
    </label>
  )
}

export function BookCover({ title, coverUrl }: { title: string; coverUrl?: string | null }) {
  if (coverUrl) {
    return <img src={coverUrl} alt={title} className="h-24 w-16 rounded-lg border border-border/80 object-cover" />
  }
  return (
    <div className="flex h-24 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-surface text-mutedForeground">
      <LibraryBig className="h-4 w-4" />
    </div>
  )
}
