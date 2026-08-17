import type { FakePr } from '../types/loop'

type Props = {
  prs: FakePr[]
  selectedId: string
  onSelect: (id: string) => void
}

export function PrList({ prs, selectedId, onSelect }: Props) {
  return (
    <aside className="panel pr-list" aria-label="Fake pull requests">
      <div className="panel__head">
        <h2>Fake PRs</h2>
        <p>Five sample changes. The teaching PR mixes web and mobile in one plan.</p>
      </div>
      <ul>
        {prs.map((pr) => {
          const selected = pr.id === selectedId
          return (
            <li key={pr.id}>
              <button
                type="button"
                className={selected ? 'pr-list__item is-selected' : 'pr-list__item'}
                onClick={() => onSelect(pr.id)}
                aria-current={selected ? 'true' : undefined}
              >
                <span className="pr-list__meta">
                  PR #{pr.number} · {pr.platform}
                  {pr.teaching ? ' · teaching' : ''}
                </span>
                <span className="pr-list__title">{pr.title}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
