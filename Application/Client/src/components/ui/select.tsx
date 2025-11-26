import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[var(--accent)] focus:shadow-[var(--ring)]',
        className,
      )}
      {...props}
    />
  )
})

Select.displayName = 'Select'
