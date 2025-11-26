import { useState } from "react"
import type { TopResult } from "../types"
import { Card, CardContent } from "./ui/card"

type Props = {
  topResult: TopResult | null
}

export function TopResultCard({ topResult }: Props) {
  if (!topResult) return null

  const [expanded, setExpanded] = useState(false)
  const truncate = (value: string) => {
    if (!value) return ""
    if (expanded) return value
    return value.length > 120 ? value.slice(0, 120) + "..." : value
  }

  const showTranslated =
    topResult.language && topResult.language !== "en"

  const showToggle =
    (topResult.titleEnglish?.length ?? 0) > 120 ||
    (showTranslated && (topResult.titleNative?.length ?? 0) > 120)

  return (
    <Card className="p-6 backdrop-blur-sm border-[var(--border)] bg-[color:var(--panel)]">
      <CardContent className="p-0">
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_rgba(47,103,255,0.12)] dark:shadow-[0_0_0_4px_rgba(124,209,255,0.18)]" />
          <span className="text-xs px-3 py-1 rounded-full border border-[var(--border)] bg-white/60 dark:bg-white/5">
            {showTranslated ? `Bilingual - ${topResult.language}` : "English"}
          </span>
        </div>

        <div
          className={`grid gap-6 ${
            showTranslated ? "md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          
            
            <h3 className="font-semibold text-lg leading-tight">
              {truncate(topResult.titleEnglish)}
            </h3>
          

          {showTranslated && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-[color:var(--muted)]">
                Translation ({topResult.language})
              </p>
              <h3 className="font-semibold text-lg leading-tight">
                {truncate(topResult.titleNative)}
              </h3>
            </div>
          )}
        </div>

        {showToggle && (
          <button
            type="button"
            className="mt-4 text-sm font-medium text-[color:var(--text)] underline underline-offset-2"
            onClick={() => setExpanded((p) => !p)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </CardContent>
    </Card>
  )
}

