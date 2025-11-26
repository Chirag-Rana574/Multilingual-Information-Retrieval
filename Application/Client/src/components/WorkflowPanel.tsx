import { Workflow } from 'lucide-react'
import type { WorkflowStep } from '../types'
import { cn } from '../lib/utils'

type Props = {
  steps: WorkflowStep[]
  currentStep: number
  running?: boolean
}

export function WorkflowPanel({
  steps,
  currentStep,
  running = false,
}: Props) {
  return (
    <aside
      className={cn(
        "border-r border-[var(--border)] bg-[color:var(--panel)] text-[color:var(--text)] transition-transform duration-200 backdrop-blur-sm shadow-[var(--shadow)] z-30",
        "w-72 fixed md:static top-16 left-0 h-[calc(100%-4rem)] md:h-auto translate-x-0"
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)] ">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border border-[var(--border)] bg-white/60 dark:bg-white/5">
            <Workflow size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
              Pipeline
            </p>
            <p className="font-semibold">
              Processing steps
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col divide-y divide-[var(--border)]">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const active = idx === currentStep
          const done = idx < currentStep

          return (
            <div
              key={step.title}
              className={cn(
                "text-left px-4 py-4 transition-colors select-none",
                active && "bg-[color:var(--panel-strong)]",
                done && "opacity-70"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center border backdrop-blur-sm transition duration-300",
                    active && running
                      ? "border-[var(--accent)] animate-step-ongoing scale-105"
                      : active
                        ? "border-[var(--accent)]"
                        : done
                          ? "border-emerald-500 text-emerald-600"
                          : "border-[var(--border)]"
                  )}
                >
                  {active && running ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[color:var(--text)] border-t-transparent" />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>

                <div>
                  <p className="font-medium">
                    {step.title}
                  </p>
                  <p className="text-sm text-[color:var(--muted)]">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </nav>

     
    </aside>
  )
}
