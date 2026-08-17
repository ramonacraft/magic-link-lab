import type { DraftCase, FakePr } from '../types/loop'

export function draftPlan(pr: FakePr, attempt: number): DraftCase[] {
  const script = pr.scripts[attempt - 1]
  if (!script) return pr.scripts[pr.scripts.length - 1]?.cases ?? []
  return script.cases
}
