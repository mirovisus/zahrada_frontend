export function GardenCard({ mainPhotoUrl, gardenName, street, houseNumber, city }) {
  const streetLine = [street, houseNumber].filter(Boolean).join(' ')

  return (
    <article className="garden-card">
      <img className="garden-card__image" src={mainPhotoUrl} alt={gardenName} loading="lazy" />
      <div className="garden-card__overlay">
        <h3 className="garden-card__title h4">{gardenName}</h3>
        <div>
          <p className="garden-card__street">{streetLine}</p>
          <p className="garden-card__city">{city}</p>
        </div>
      </div>
    </article>
  )
}
