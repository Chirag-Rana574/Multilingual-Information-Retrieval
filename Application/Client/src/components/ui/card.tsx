import type { HTMLAttributes, JSX } from 'react'
import { cn } from '../../lib/utils'

type CardProps<T extends keyof JSX.IntrinsicElements = 'div'> = {
  as?: T
} & JSX.IntrinsicElements[T] &
  HTMLAttributes<HTMLElement>

export function Card<T extends keyof JSX.IntrinsicElements = 'div'>({
  as,
  className,
  ...props
}: CardProps<T>) {
  const Component: any = as ?? 'div'
  return (
    <Component
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[color:var(--panel)] shadow-[var(--shadow)] p-5 backdrop-blur-md',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 mb-2', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-[color:var(--text)]', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-[color:var(--muted)]', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-4', className)} {...props} />
}
