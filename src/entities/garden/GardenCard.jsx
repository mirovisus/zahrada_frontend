import { Link } from 'react-router-dom'

export function GardenCard({ mainPhotoUrl, gardenName, street, houseNumber, city, to }) {
  const streetLine = [street, houseNumber].filter(Boolean).join(' ')
  const Tag = to ? Link : 'article'
  const tagProps = to ? { to } : {}

  return (
    <Tag className="garden-card" {...tagProps}>
      <img className="garden-card__image" src={mainPhotoUrl} alt={gardenName} loading="lazy" />
      <div className="garden-card__overlay">
        <h3 className="garden-card__title h4">{gardenName}</h3>
        <div>
          <p className="garden-card__street">{streetLine}</p>
          <p className="garden-card__city">{city}</p>
        </div>
      </div>
    </Tag>
  )
}
