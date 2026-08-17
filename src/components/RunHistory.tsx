import type { HistoryEntry } from '../types/loop'

type Props = {
  entries: HistoryEntry[]
}

export function RunHistory({ entries }: Props) {
  return (
    <section className="panel" aria-labelledby="history-heading">
      <div className="panel__head">
        <h2 id="history-heading">Run history</h2>
        <p>Simple memory in this browser. What improved, what still needed a person.</p>
      </div>
      {entries.length === 0 ? (
        <p className="empty">No runs yet. History shows up after the first loop.</p>
      ) : (
        <ul className="history">
          {entries.map((entry) => (
            <li key={entry.id}>
              <span
                className={
                  entry.verdict === 'pass'
                    ? 'status-chip status-chip--pass'
                    : 'status-chip status-chip--needs_human'
                }
              >
                {entry.verdict === 'pass' ? 'Pass' : 'Needs human'}
              </span>
              <span className="history__title">{entry.prTitle}</span>
              <span className="history__meta">
                {entry.attemptCount} attempt{entry.attemptCount === 1 ? '' : 's'} ·{' '}
                {entry.lastPercent}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
