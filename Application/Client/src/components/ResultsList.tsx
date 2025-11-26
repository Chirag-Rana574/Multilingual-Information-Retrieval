import { useState } from "react"
import type { QueryMatch } from "../types"
import { Badge } from "./ui/badge"

type Props = {
  results: QueryMatch[]
  loading?: boolean
}

export function ResultsList({ results, loading = false }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  if (loading) {
    return (
      <div className="py-12 text-center text-[color:var(--muted)]">
        Fetching results...
      </div>
    )
  }

  if (!results || results.length === 0) {
    return (
      <p className="text-[color:var(--muted)] text-sm">
        Run a query to see results.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--border)]">
      {results.map((item, idx) => {
        const meta = item.metadata || {}
        const itemKey = item.id ?? `idx-${idx}`

        const title =
          typeof meta.title === "string" ? meta.title : `Result ${idx + 1}`

        const isExpanded = expanded.has(itemKey)
        const displayTitle =
          title.length > 120 && !isExpanded ? title.slice(0, 120) + "..." : title
        const scorePct = ((item.score ?? 0) * 100).toFixed(1)

        return (
          <article key={itemKey} className="py-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-lg leading-tight">
                {displayTitle}
              </h3>
              <Badge className="shrink-0 text-xs px-3 py-1 bg-emerald-500 text-white border-emerald-600 shadow-sm">
                Score: {scorePct}
              </Badge>
            </div>

            {title.length > 120 && (
              <button
                type="button"
                onClick={() =>
                  setExpanded((prev) => {
                    const next = new Set(prev)
                    next.has(itemKey) ? next.delete(itemKey) : next.add(itemKey)
                    return next
                  })
                }
                className="mt-2 text-sm font-medium text-[color:var(--text)] underline underline-offset-2"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </article>
        )
      })}
    </div>
  )
}
