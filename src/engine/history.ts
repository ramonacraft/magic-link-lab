import type { FakePr, HistoryEntry, LoopRun } from '../types/loop'

export const HISTORY_KEY = 'magic-link-lab-history'

export function toHistoryEntry(pr: FakePr, run: LoopRun): HistoryEntry {
  const last = run.attempts[run.attempts.length - 1]
  return {
    id: `${run.prId}-${run.startedAt}`,
    prId: pr.id,
    prTitle: `PR #${pr.number} ${pr.title}`,
    verdict: run.verdict,
    lastPercent: last?.score.percent ?? 0,
    attemptCount: run.attempts.length,
    finishedAt: run.startedAt,
  }
}

export function loadHistory(): HistoryEntry[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 20)))
}

export function prependRun(pr: FakePr, run: LoopRun): HistoryEntry[] {
  const next = [toHistoryEntry(pr, run), ...loadHistory()].slice(0, 20)
  saveHistory(next)
  return next
}
