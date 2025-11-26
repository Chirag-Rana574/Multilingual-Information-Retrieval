import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null
  return (
    <div className="sheet-root">
      <div className="sheet-overlay" onClick={() => onOpenChange(false)} />
      <div className={cn('sheet-content')}>{children}</div>
    </div>
  )
}
