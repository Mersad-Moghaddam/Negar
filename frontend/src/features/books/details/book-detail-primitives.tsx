export function HubMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <p className="text-xs text-mutedForeground">{label}</p>
      <p className="truncate text-sm" title={value}>
        {value}
      </p>
    </div>
  )
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <p className="text-xs text-mutedForeground">{label}</p>
      <p className="text-base font-medium">{value}</p>
    </div>
  )
}
