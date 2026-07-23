import { useState } from 'react'
import { Divider } from '../../shared/ui/divider'

export function FilterBox({ title, items, selectedValues, onToggle }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`filter-box${expanded ? ' is-expanded' : ''}`}>
      <h3 className="filter-box__title h4">{title}</h3>
      <Divider />

      <ul className="filter-box__list">
        {items.map((item) => (
          <li className="filter-box__item" key={item.value}>
            <label className="filter-box__label">
              <input
                className="filter-box__checkbox"
                type="checkbox"
                checked={selectedValues.includes(item.value)}
                onChange={() => onToggle(item.value)}
              />
              <span className="filter-box__checkmark" />
              <span className="filter-box__text">{item.label}</span>
            </label>
          </li>
        ))}
      </ul>

      {items.length > 5 && (
        <button className="filter-box__toggle" type="button" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? 'Zobrazit méně' : 'Zobrazit více'}
        </button>
      )}
    </div>
  )
}
