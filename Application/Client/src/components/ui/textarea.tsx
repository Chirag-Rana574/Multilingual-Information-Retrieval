import type { TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[var(--accent)] focus:shadow-[var(--ring)]',
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
