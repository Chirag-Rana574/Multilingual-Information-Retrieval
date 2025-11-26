import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  size?: 'md' | 'icon'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition active:translate-y-px'
    const variantStyles =
      variant === 'primary'
        ? 'border-[var(--border)] bg-[var(--accent)] text-[color:var(--accent-contrast)] shadow-md'
        : 'border-[var(--border)] bg-transparent text-[color:var(--text)]'
    const sizeStyles = size === 'icon' ? 'h-10 w-10 p-0' : 'px-4 py-2'

    return (
      <button
        ref={ref}
        className={cn(base, variantStyles, sizeStyles, className)}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
