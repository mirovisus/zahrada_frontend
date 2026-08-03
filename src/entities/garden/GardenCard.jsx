import { Link } from 'react-router-dom'
import { getUploadUrl } from '../../shared/lib/media'

const PLACEHOLDER_IMAGES = ['/images/profile/garden-1.png', '/images/profile/garden-2.png']

export function GardenCard({ id, mainPhotoUrl, gardenName, street, houseNumber, city, to }) {
  const streetLine = [street, houseNumber].filter(Boolean).join(' ')
  const Tag = to ? Link : 'article'
  const tagProps = to ? { to } : {}
  const imageSrc = mainPhotoUrl ? getUploadUrl(mainPhotoUrl) : PLACEHOLDER_IMAGES[(id ?? 0) % 2]

  return (
    <Tag className="garden-card" {...tagProps}>
      <img className="garden-card__image" src={imageSrc} alt={gardenName} loading="lazy" />
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
