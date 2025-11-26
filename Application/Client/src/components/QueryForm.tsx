import type { FormEvent } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"

type Props = {
  query: string
  language: string
  loading: boolean
  error: string | null
  onQueryChange: (value: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export function QueryForm({
  query,
  language,
  loading,
  error,
  onQueryChange,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
      
      {/* Search bar */}
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" size={18} />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Ask about a case, law, or legal issue..."
            className="pl-10 h-12 text-base"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 px-6 flex items-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Search
        </Button>
      </div>

      {/* Language detection */}
      {query && (
        <Badge variant="outline" className="w-fit text-xs py-1 bg-white/60 dark:bg-white/5">
          Detected language: {language}
        </Badge>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}
