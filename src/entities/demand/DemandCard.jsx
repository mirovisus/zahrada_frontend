import { Chip } from '../../shared/ui/chip'
import { ArrowIcon, LocationIcon, CalendarIcon } from '../../shared/ui/icons'

export function DemandCard({ title, services = [], preview, city, date, address, dueDate, status, onClick }) {
  return (
    <article className="demand-card" onClick={onClick}>
      <div className="demand-card__body">
        <div className="demand-card__header">
          {status ? (
            <div className="demand-card__header-left">
              <h3 className="demand-card__title h4">{title}</h3>
              <Chip variant="status" status={status.key}>
                {status.label}
              </Chip>
            </div>
          ) : (
            <h3 className="demand-card__title h4">{title}</h3>
          )}
          <ArrowIcon className="demand-card__icon" />
        </div>

        {services.length > 0 && (
          <div className="demand-card__services">
            {services.map((service) => (
              <Chip variant="secondary" key={service}>
                {service}
              </Chip>
            ))}
          </div>
        )}

        {preview && <p className="demand-card__preview">{preview}</p>}

        {dueDate ? (
          <p className="demand-card__date">
            <span className="demand-card__date-label">Termín:</span>{' '}
            <time dateTime={dueDate}>{new Date(dueDate).toLocaleDateString('cs-CZ')}</time>
          </p>
        ) : (
          <div className="demand-card__meta">
            {address ? (
              <span className="demand-card__meta-item">
                <LocationIcon />
                {address}
              </span>
            ) : (
              <>
                {city && (
                  <span className="demand-card__meta-item">
                    <LocationIcon />
                    {city}
                  </span>
                )}
                {date && (
                  <span className="demand-card__meta-item">
                    <CalendarIcon />
                    <time dateTime={date}>{new Date(date).toLocaleDateString('cs-CZ')}</time>
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
