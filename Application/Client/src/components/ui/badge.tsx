import type { HTMLAttributes } from "react"
import { cn } from "../../lib/utils"

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "solid" | "outline"
}

export function Badge({
  className,
  variant = "solid",
  children,
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full border text-xs font-medium leading-none"
  const styles =
    variant === "outline"
      ? "border-emerald-300 text-emerald-700 bg-emerald-50 px-3 py-1"
      : "border-transparent bg-emerald-500 text-white px-3 py-1"

  return (
    <span className={cn(base, styles, className)} {...props}>
      {children}
    </span>
  )
}
