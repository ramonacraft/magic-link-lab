import type { Attempt, FakePr, LoopPhase, LoopRun } from '../types/loop'
import { draftPlan } from './drafter'
import { scoreDraft } from './scorer'

export function runNextAttempt(pr: FakePr, prior: Attempt[]): Attempt {
  const number = prior.length + 1
  const cases = draftPlan(pr, number)
  return { number, cases, score: scoreDraft(pr, cases) }
}

export function loopPhase(pr: FakePr, attempts: Attempt[]): LoopPhase {
  if (attempts.length === 0) return 'idle'
  const last = attempts[attempts.length - 1]
  if (!last) return 'idle'
  if (last.score.percent >= pr.passBar) return 'pass'
  if (attempts.length >= pr.maxAttempts) return 'needs_human'
  return 'in_progress'
}

export function canContinue(pr: FakePr, attempts: Attempt[]): boolean {
  const phase = loopPhase(pr, attempts)
  return phase === 'idle' || phase === 'in_progress'
}

export function runLoop(pr: FakePr, now = new Date()): LoopRun {
  const attempts: Attempt[] = []

  for (let number = 1; number <= pr.maxAttempts; number += 1) {
    attempts.push(runNextAttempt(pr, attempts))
    if (loopPhase(pr, attempts) === 'pass') {
      return {
        prId: pr.id,
        startedAt: now.toISOString(),
        verdict: 'pass',
        attempts,
      }
    }
  }

  return {
    prId: pr.id,
    startedAt: now.toISOString(),
    verdict: 'needs_human',
    attempts,
  }
}
