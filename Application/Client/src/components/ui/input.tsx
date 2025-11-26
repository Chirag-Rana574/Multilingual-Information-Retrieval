import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[var(--accent)] focus:shadow-[var(--ring)]',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'
