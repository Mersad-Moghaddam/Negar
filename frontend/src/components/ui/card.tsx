import { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('surface p-6', className)} {...props} />
}

export function SectionCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Card className={cn('space-y-5 p-5 md:p-6', className)} {...props} />
}

export function SectionHeading({
  title,
  description,
  icon,
  action
}: {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-section-title">
          {icon ? <span className="text-mutedForeground">{icon}</span> : null}
          {title}
        </h2>
        {description ? <p className="text-small text-mutedForeground">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}
