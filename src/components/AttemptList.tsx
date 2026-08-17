import type { Attempt } from '../types/loop'

type Props = {
  attempts: Attempt[]
}

export function AttemptList({ attempts }: Props) {
  if (attempts.length === 0) return null

  return (
    <section className="panel" aria-labelledby="attempts-heading">
      <div className="panel__head">
        <h2 id="attempts-heading">Attempts</h2>
        <p>Draft, score, critic. Same numbers as the paper walkthrough for the gated article.</p>
      </div>
      <ol className="attempts">
        {attempts.map((attempt) => (
          <li key={attempt.number} className="attempt">
            <header className="attempt__head">
              <h3>Attempt {attempt.number}</h3>
              <strong
                className={
                  attempt.score.percent >= 80
                    ? 'attempt__score is-pass'
                    : 'attempt__score'
                }
              >
                {attempt.score.percent}%
              </strong>
            </header>
            <p className="attempt__points">
              {attempt.score.earned} of {attempt.score.total} weighted points
            </p>
            <ul className="attempt__cases">
              {attempt.cases.map((item) => (
                <li key={item.title}>{item.title}</li>
              ))}
            </ul>
            {attempt.score.misses.length > 0 ? (
              <p className="attempt__miss">
                Next: missing{' '}
                {attempt.score.misses.map((item) => item.mustInclude).join('; ')}
              </p>
            ) : (
              <p className="attempt__miss">Next: nothing missing</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
