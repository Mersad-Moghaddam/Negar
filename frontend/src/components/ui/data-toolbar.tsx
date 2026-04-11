import { ReactNode } from 'react'

import { Card } from './card'

export function DataToolbar({ children }: { children: ReactNode }) {
  return <Card className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">{children}</Card>
}
