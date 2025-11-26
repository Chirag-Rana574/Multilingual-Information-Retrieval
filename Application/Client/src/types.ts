import type { LucideIcon } from 'lucide-react'

export type QueryMatch = {
  id?: string
  score?: number
  metadata?: {
    title?: string
    snippet?: string
    [key: string]: unknown
  }
}

export type TopResult = {
  language: string
  titleEnglish: string
  titleNative: string
  snippetEnglish: string
  snippetNative: string
}

export type WorkflowStep = {
  title: string
  description: string
  icon: LucideIcon
}
