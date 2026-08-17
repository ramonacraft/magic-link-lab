export type Platform = 'Web' | 'iOS' | 'Android' | 'CTV'
export type Priority = 'P0' | 'P1' | 'P2' | 'P3'
export type Verdict = 'pass' | 'needs_human'
export type LoopPhase = 'idle' | 'in_progress' | Verdict

export type HumanBrief = {
  theory: string
  confirm: string
  fixPath: string
}

export type GoldenItem = {
  id: string
  priority: Priority
  mustInclude: string
  why: string
  weight: number
  brief?: HumanBrief
}

export type DraftCase = {
  title: string
  covers: string[]
}

export type AttemptScript = {
  cases: DraftCase[]
}

export type FakePr = {
  id: string
  number: number
  title: string
  platform: Platform
  summary: string
  whatCanBreak: string
  teaching?: boolean
  passBar: number
  maxAttempts: number
  golden: GoldenItem[]
  scripts: AttemptScript[]
}

export type ScoreResult = {
  percent: number
  earned: number
  total: number
  hits: GoldenItem[]
  misses: GoldenItem[]
}

export type Attempt = {
  number: number
  cases: DraftCase[]
  score: ScoreResult
}

export type LoopRun = {
  prId: string
  startedAt: string
  verdict: Verdict
  attempts: Attempt[]
}

export type HistoryEntry = {
  id: string
  prId: string
  prTitle: string
  verdict: Verdict
  lastPercent: number
  attemptCount: number
  finishedAt: string
}
