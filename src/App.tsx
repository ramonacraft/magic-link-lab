import { useMemo, useState } from 'react'
import { AttemptList } from './components/AttemptList'
import { HumanBrief } from './components/HumanBrief'
import { GoldenPanel } from './components/GoldenPanel'
import { PrList } from './components/PrList'
import { RunHistory } from './components/RunHistory'
import { VerdictHero } from './components/VerdictHero'
import { fixtures, getFixture } from './data/fixtures'
import { loadHistory, prependRun } from './engine/history'
import { canContinue, loopPhase, runNextAttempt } from './engine/loop'
import type { Attempt, HistoryEntry, LoopRun } from './types/loop'
import './App.css'

function App() {
  const [selectedId, setSelectedId] = useState(fixtures[0]?.id ?? 'gated-article')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())

  const pr = useMemo(() => getFixture(selectedId) ?? fixtures[0], [selectedId])
  const phase = pr ? loopPhase(pr, attempts) : 'idle'
  const finished = phase === 'pass' || phase === 'needs_human'

  const run: LoopRun | null =
    pr && attempts.length > 0
      ? {
          prId: pr.id,
          startedAt: startedAt ?? '',
          verdict: finished ? phase : 'pass',
          attempts,
        }
      : null

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setAttempts([])
    setStartedAt(null)
  }

  const handleReset = () => {
    setAttempts([])
    setStartedAt(null)
  }

  const handleRun = () => {
    if (!pr || !canContinue(pr, attempts)) return
    const nextAttempts = [...attempts, runNextAttempt(pr, attempts)]
    const started = startedAt ?? new Date().toISOString()
    setStartedAt(started)
    setAttempts(nextAttempts)

    const nextPhase = loopPhase(pr, nextAttempts)
    if (nextPhase === 'pass' || nextPhase === 'needs_human') {
      setHistory(
        prependRun(pr, {
          prId: pr.id,
          startedAt: started,
          verdict: nextPhase,
          attempts: nextAttempts,
        }),
      )
    }
  }

  if (!pr) return null

  const buttonLabel =
    phase === 'idle'
      ? 'Run attempt 1'
      : phase === 'in_progress'
        ? `Retry with critic (attempt ${attempts.length + 1})`
        : 'Loop finished'

  return (
    <div className="shell">
      <nav className="shell__nav" aria-label="Magic Link Lab Dashboard">
        <div className="shell__nav-center">
          <p className="shell__logo">
            <span aria-hidden="true">👩‍💻</span>
            <span>Magic Link Lab Dashboard</span>
            <span aria-hidden="true">🔗</span>
          </p>
          <span className="shell__env-chip">Public demo</span>
        </div>
      </nav>

      <div className="shell__content">
        <VerdictHero
          run={run}
          phase={phase}
          prTitle={`PR #${pr.number}`}
          passBar={pr.passBar}
        />

        <div className="shell__board">
          <PrList prs={fixtures} selectedId={pr.id} onSelect={handleSelect} />

          <section className="panel pr-card">
            <div className="panel__head">
              <h2>
                PR #{pr.number} · {pr.platform}
                {pr.teaching ? ' · teaching' : ''}
              </h2>
              <p>{pr.title}</p>
            </div>
            <p className="pr-card__summary">{pr.summary}</p>
            <p className="pr-card__break">What can break at 2am: {pr.whatCanBreak}</p>
            <div className="pr-card__actions">
              <button
                type="button"
                className="run"
                onClick={handleRun}
                disabled={finished}
              >
                {buttonLabel}
              </button>
              {attempts.length > 0 ? (
                <button type="button" className="run run--ghost" onClick={handleReset}>
                  Reset this PR
                </button>
              ) : null}
            </div>
          </section>
        </div>

        <GoldenPanel pr={pr} />
        <AttemptList attempts={attempts} />
        {phase === 'needs_human' ? (
          <HumanBrief misses={attempts[attempts.length - 1]?.score.misses ?? []} />
        ) : null}
        <RunHistory entries={history} />

        <footer className="shell__footer">
          <p>
            Inbox-to-article demo. One click is one attempt. Retry with the critic,
            then pass or escalate.
          </p>
          <p className="shell__footer-credit">
            <span>Ramona Bonitatis</span>
            <a
              href="https://github.com/ramonacraft"
              target="_blank"
              rel="noreferrer"
            >
              github.com/ramonacraft
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
