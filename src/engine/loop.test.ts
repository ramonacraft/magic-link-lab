import { describe, expect, it } from 'vitest'
import { getFixture } from '../data/fixtures'
import { briefsForMisses } from './brief'
import { canContinue, loopPhase, runLoop, runNextAttempt } from './loop'
import { scoreDraft, scorePercent } from './scorer'

function requireFixture(id: string) {
  const pr = getFixture(id)
  if (!pr) throw new Error(`Missing fixture ${id}`)
  return pr
}

describe('scorePercent', () => {
  it('rounds weighted coverage', () => {
    expect(scorePercent(4, 8)).toBe(50)
    expect(scorePercent(8, 8)).toBe(100)
  })
})

describe('runLoop', () => {
  it('gated article: 50% then 100% Pass, pending and dead-link missed first', () => {
    const pr = requireFixture('gated-article')
    const run = runLoop(pr)

    expect(run.verdict).toBe('pass')
    expect(run.attempts).toHaveLength(2)
    expect(run.attempts[0]?.score.percent).toBe(50)
    expect(run.attempts[1]?.score.percent).toBe(100)
    expect(run.attempts[0]?.score.misses.map((item) => item.id)).toEqual([
      'pending',
      'dead-link',
    ])
    expect(run.attempts[1]?.score.misses).toEqual([])
  })

  it('iOS deeplink: still under the bar after 3 attempts, Needs human', () => {
    const pr = requireFixture('ios-deeplink')
    const run = runLoop(pr)

    expect(run.verdict).toBe('needs_human')
    expect(run.attempts).toHaveLength(3)
    expect(run.attempts.every((attempt) => attempt.score.percent < pr.passBar)).toBe(
      true,
    )
    expect(run.attempts[2]?.score.misses.map((item) => item.id)).toEqual([
      'opens-app',
      'return-article',
    ])
    expect(briefsForMisses(run.attempts[2]?.score.misses ?? [])).toHaveLength(2)
  })

  it('Android: Pass on attempt 1', () => {
    const pr = requireFixture('android-link')
    const run = runLoop(pr)

    expect(run.verdict).toBe('pass')
    expect(run.attempts).toHaveLength(1)
    expect(run.attempts[0]?.score.percent).toBeGreaterThanOrEqual(pr.passBar)
  })

  it('private window: retry then Pass', () => {
    const pr = requireFixture('private-window')
    const run = runLoop(pr)

    expect(run.verdict).toBe('pass')
    expect(run.attempts).toHaveLength(2)
    expect(run.attempts[0]?.score.percent).toBeLessThan(pr.passBar)
    expect(run.attempts[1]?.score.percent).toBeGreaterThanOrEqual(pr.passBar)
  })

  it('comment embed: retry then Pass, misses shared session first', () => {
    const pr = requireFixture('comment-embed')
    const run = runLoop(pr)

    expect(run.verdict).toBe('pass')
    expect(run.attempts).toHaveLength(2)
    expect(run.attempts[0]?.score.percent).toBeLessThan(pr.passBar)
    expect(run.attempts[1]?.score.percent).toBeGreaterThanOrEqual(pr.passBar)
    expect(run.attempts[0]?.score.misses.map((item) => item.id)).toEqual([
      'no-double-prompt',
      'session-agrees',
    ])
  })
})

describe('runNextAttempt', () => {
  it('gated article: one click is attempt 1, second click is the retry', () => {
    const pr = requireFixture('gated-article')
    const first = runNextAttempt(pr, [])
    expect(first.score.percent).toBe(50)
    expect(loopPhase(pr, [first])).toBe('in_progress')
    expect(canContinue(pr, [first])).toBe(true)

    const second = runNextAttempt(pr, [first])
    expect(second.score.percent).toBe(100)
    expect(loopPhase(pr, [first, second])).toBe('pass')
    expect(canContinue(pr, [first, second])).toBe(false)
  })
})

describe('scoreDraft', () => {
  it('treats uncovered golden ids as misses', () => {
    const pr = requireFixture('gated-article')
    const score = scoreDraft(pr, [
      { title: 'Good click opens the article', covers: ['return-article'] },
    ])

    expect(score.hits).toHaveLength(1)
    expect(score.misses.length).toBe(pr.golden.length - 1)
  })
})
