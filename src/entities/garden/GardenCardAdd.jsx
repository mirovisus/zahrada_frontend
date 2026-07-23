import { Link } from 'react-router-dom'

export function GardenCardAdd({ to }) {
  return (
    <Link to={to} className="garden-card garden-card--add">
      <div className="garden-card__add-inner">
        <div className="garden-card__spacer" />
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="garden-card__add-text">Vytvořit novou zahradu</p>
      </div>
    </Link>
  )
}
