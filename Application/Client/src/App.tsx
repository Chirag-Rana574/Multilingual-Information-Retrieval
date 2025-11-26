import type { FormEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "./components/ui/button"
import { WorkflowPanel } from "./components/WorkflowPanel"
import { QueryForm } from "./components/QueryForm"
import { ResultsList } from "./components/ResultsList"
import { TopResultCard } from "./components/TopResultCard"
import { workflowSteps } from "./workflowSteps"
import type { QueryMatch, TopResult } from "./types"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787"

export default function App() {
  const [query, setQuery] = useState("")
  const [language, setLanguage] = useState("auto")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<QueryMatch[]>([])
  const [topResult, setTopResult] = useState<TopResult | null>(null)
  const [workflowStep, setWorkflowStep] = useState(0)
  const workflowTimer = useRef<number | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("indicbot-theme")
    return stored === "dark" ? "dark" : "light"
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("indicbot-theme", theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"))

  const clearWorkflowTimer = () => {
    if (workflowTimer.current) {
      window.clearInterval(workflowTimer.current)
      workflowTimer.current = null
    }
  }

  const startWorkflowAnimation = () => {
    clearWorkflowTimer()
    setWorkflowStep(1)

    let next = 2
    workflowTimer.current = window.setInterval(() => {
      setWorkflowStep((prev) => {
        if (prev >= 4) return prev
        const step = next
        next = Math.min(4, next + 1)
        return step
      })
    }, 800)
  }

  const finishWorkflowAnimation = (finalStep: number) => {
    clearWorkflowTimer()
    setWorkflowStep(finalStep)
  }

  useEffect(
    () => () => {
      clearWorkflowTimer()
    },
    []
  )

  const detectLanguage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return "auto"
    const scripts: Array<[RegExp, string]> = [
      [/[\u0900-\u097F]/, "hi"],
      [/[\u0980-\u09FF]/, "bn"],
      [/[\u0B80-\u0BFF]/, "ta"],
      [/[\u0C00-\u0C7F]/, "te"],
      [/[\u0A80-\u0AFF]/, "mr"],
    ]
    for (const [regex, lang] of scripts) {
      if (regex.test(trimmed)) return lang
    }
    return "en"
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      setError("Add a query first.")
      return
    }
    setLoading(true)
    setError(null)
    setResults([])
    setTopResult(null)
    startWorkflowAnimation()

    try {
      const detectedLang = detectLanguage(trimmed)
      setLanguage(detectedLang)

      const response = await fetch(`${API_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, language: detectedLang, topK: 3 }),
      })

      if (!response.ok) throw new Error(await response.text())

      const data = await response.json()
      setResults(Array.isArray(data?.matches) ? data.matches : [])
      setTopResult(
        data?.topResult && typeof data.topResult === "object"
          ? data.topResult
          : null
      )
      finishWorkflowAnimation(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed")
      finishWorkflowAnimation(0)
    } finally {
      setLoading(false)
      clearWorkflowTimer()
    }
  }

  return (
    <div className=" h-screen overflow-hidden text-[color:var(--text)] transition-colors">

      {/* Navbar */}
      <header className="inset-x-0 top-0 h-14 px-6 md:pl-72 flex items-center justify-between border-b border-[var(--border)] bg-[color:var(--panel)]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-[var(--border)] bg-[color:var(--card)] shadow-sm flex items-center justify-center font-bold">
            iB
          </div>
          <div>
            <p className="text-sm font-semibold">indicBot</p>
            <p className="text-xs text-[color:var(--muted)]">Legal Semantic Search</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-[color:var(--muted)]">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex w-full h-full">

      <WorkflowPanel steps={workflowSteps} currentStep={workflowStep} running={loading} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6  ml-4">
        <div className="w-full max-w-none space-y-6 rounded-3xl border border-[var(--border)] bg-[color:var(--card)] dark:bg-[color:var(--panel)] backdrop-blur-lg shadow-[var(--shadow)] p-6 md:p-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">
              indicBot Legal Semantic Search
            </h1>
          </div>

          <QueryForm
            query={query}
            language={language}
            loading={loading}
            error={error}
            onQueryChange={(v) => {
              setQuery(v)
              setLanguage(detectLanguage(v))
            }}
            onSubmit={handleSubmit}
          />

          {/* Results */}
          <div>
            <ResultsList results={results} loading={loading} />
          </div>

          {/* Top Result */}
          {topResult && (
            <div className="pt-2">
              <TopResultCard topResult={topResult} />
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  )
}
