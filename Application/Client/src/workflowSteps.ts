import { CheckCircle2, Cpu, Languages, Search, Sparkles, Workflow } from "lucide-react"
import type { WorkflowStep } from "./types"

export const workflowSteps: WorkflowStep[] = [
  {
    title: "Ready",
    description: "Waiting for your query",
    icon: Workflow,
  },
  {
    title: "Detect language",
    description: "Identifying query language",
    icon: Languages,
  },
  {
    title: "Embed query",
    description: "Building vector representation",
    icon: Cpu,
  },
  {
    title: "Semantic search",
    description: "Retrieving relevant passages",
    icon: Search,
  },
  {
    title: "Rerank",
    description: "Ordering by strongest match",
    icon: Sparkles,
  },
  {
    title: "Preview",
    description: "Top match ready to review",
    icon: CheckCircle2,
  },
]

