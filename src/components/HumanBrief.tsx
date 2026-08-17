import { briefsForMisses } from '../engine/brief'
import type { GoldenItem } from '../types/loop'

type Props = {
  misses: GoldenItem[]
}

export function HumanBrief({ misses }: Props) {
  const items = briefsForMisses(misses)
  if (items.length === 0) return null

  return (
    <section className="panel human-brief" aria-labelledby="brief-heading">
      <div className="panel__head">
        <h2 id="brief-heading">Human brief</h2>
        <p>
          Hypothetical starting points for the reviewer. Not a live debugger.
          Confirm before you patch.
        </p>
      </div>
      <p className="human-brief__label">Needs a person</p>
      <ul className="human-brief__list">
        {items.map((item) => (
          <li key={item.id} className="human-brief__item">
            <p className="human-brief__miss">
              <span className="prio">{item.priority}</span>
              {item.mustInclude}
            </p>
            <p>
              <strong>Theory.</strong> {item.brief?.theory}
            </p>
            <p>
              <strong>Confirm fast.</strong> {item.brief?.confirm}
            </p>
            <p className="human-brief__fix">
              <strong>Fix path.</strong> {item.brief?.fixPath}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
