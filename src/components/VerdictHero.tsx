import type { LoopPhase, LoopRun } from '../types/loop'

type Props = {
  run: LoopRun | null
  phase: LoopPhase
  prTitle: string
  passBar: number
}

function barTone(percent: number, passBar: number): string {
  if (percent >= passBar) return 'hi-teal'
  if (percent >= 50) return 'hi-amber'
  return 'hi-rose'
}

export function VerdictHero({ run, phase, prTitle, passBar }: Props) {
  const last = run?.attempts[run.attempts.length - 1]
  const headline =
    phase === 'idle'
      ? 'Ready to run'
      : phase === 'in_progress'
        ? `${last?.score.percent ?? 0}%`
        : phase === 'pass'
          ? 'Pass'
          : 'Needs human'
  const emoji =
    phase === 'idle' ? '🔗' : phase === 'in_progress' ? '📝' : phase === 'pass' ? '🚀' : '🚧'
  const support =
    phase === 'idle'
      ? 'One click is one attempt. Run attempt 1, read the critic, then retry.'
      : phase === 'in_progress'
        ? `Under the ${passBar}% bar. Click Retry with critic for attempt ${(run?.attempts.length ?? 0) + 1}.`
        : phase === 'pass'
          ? 'Over the bar. Pending and dead-link are the screenshot for this lab.'
          : 'Three tries, still under the bar. Stop guessing and hand it to a person.'

  return (
    <header className="gate-pulse" data-verdict={phase} aria-live="polite">
      <div>
        <p className="gate-pulse__label">Loop status</p>
        <p className="gate-pulse__emoji" aria-hidden="true">
          {emoji}
        </p>
        <h1 className="gate-pulse__headline">{headline}</h1>
        <p className="gate-pulse__env">{prTitle}</p>
      </div>

      <div>
        <p className="gate-pulse__support">{support}</p>
        {run ? (
          <div className="gate-pulse__rows" aria-label="Attempt scores">
            {run.attempts.map((attempt) => (
              <div key={attempt.number}>
                <div className="gate-pulse__row-label">
                  <span>Attempt {attempt.number}</span>
                  <span>
                    {attempt.score.percent}% · {attempt.score.earned}/
                    {attempt.score.total} points
                  </span>
                </div>
                <div className="gate-pulse__bar" aria-hidden="true">
                  <span
                    className={`gate-pulse__bar-fill gate-pulse__bar-fill--${barTone(attempt.score.percent, passBar)}`}
                    style={{ width: `${attempt.score.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gate-pulse__rows" aria-hidden="true">
            <div>
              <div className="gate-pulse__row-label">
                <span>Pass bar</span>
                <span>{passBar}%</span>
              </div>
              <div className="gate-pulse__bar">
                <span
                  className="gate-pulse__bar-fill gate-pulse__bar-fill--hi-slate"
                  style={{ width: `${passBar}%` }}
                />
              </div>
            </div>
          </div>
        )}
        <div className="gate-pulse__chips">
          <span className={`status-chip status-chip--${phase}`}>
            {phase === 'idle'
              ? 'No run yet'
              : phase === 'in_progress'
                ? 'Retry available'
                : phase === 'pass'
                  ? 'Pass'
                  : 'Needs human'}
          </span>
          {last ? (
            <span className="status-chip">
              {run?.attempts.length} attempt{run?.attempts.length === 1 ? '' : 's'} ·{' '}
              {last.score.percent}%
            </span>
          ) : (
            <span className="status-chip">Max 3 attempts</span>
          )}
        </div>
      </div>
    </header>
  )
}
