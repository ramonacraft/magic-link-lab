import type { FakePr } from '../types/loop'

type Props = {
  pr: FakePr
}

export function GoldenPanel({ pr }: Props) {
  return (
    <section className="panel" aria-labelledby="golden-heading">
      <div className="panel__head">
        <h2 id="golden-heading">Golden</h2>
        <p>
          The plan you would sign. The drafter does not see this on attempt 1.
          Pass bar {pr.passBar}%. Max {pr.maxAttempts} attempts.
        </p>
      </div>
      <table className="golden-table">
        <thead>
          <tr>
            <th>Must include</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          {pr.golden.map((item) => (
            <tr key={item.id}>
              <td>
                <span className="prio">{item.priority}</span> {item.mustInclude}
              </td>
              <td>{item.why}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
