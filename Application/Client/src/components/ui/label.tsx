import type { LabelHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn('flex items-center gap-2 text-[color:var(--text)] font-semibold', className)}
      {...props}
    />
  )
})

Label.displayName = 'Label'
