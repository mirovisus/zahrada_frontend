import { Chip } from '../../shared/ui/chip'
import { CalendarIcon, LocationIcon } from '../../shared/ui/icons'

export function DemandDetails({ demand }) {
  if (!demand) return null

  return (
    <>
      <h3 className="offer-modal__title h3">{demand.title}</h3>

      {demand.serviceTypeNames?.length > 0 && (
        <div className="offer-modal__chips">
          {demand.serviceTypeNames.map((service) => (
            <Chip variant="secondary" key={service}>
              {service}
            </Chip>
          ))}
        </div>
      )}

      {demand.description && <p className="offer-modal__text">{demand.description}</p>}

      <div className="offer-modal__meta">
        {demand.urgencyLabel && (
          <span className="offer-modal__meta-item">
            <CalendarIcon />
            Naléhavost: {demand.urgencyLabel}
          </span>
        )}

        {demand.garden?.city && (
          <span className="offer-modal__meta-item">
            <LocationIcon />
            Město: {demand.garden.city}
          </span>
        )}
      </div>
    </>
  )
}
