import { forwardRef, useEffect, useState } from 'react'
import { CrossButton } from '../../../shared/ui/cross-button'
import { Field } from '../../../shared/ui/field'
import { Chip } from '../../../shared/ui/chip'
import { Button } from '../../../shared/ui/button'
import { CalendarIcon, LocationIcon } from '../../../shared/ui/icons'

const emptyOffer = { price: '', description: '' }

function AttachIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const OfferModal = forwardRef(function OfferModal({ demand, onSubmit }, ref) {
  const [offer, setOffer] = useState(emptyOffer)

  useEffect(() => {
    setOffer(emptyOffer)
  }, [demand])

  const handleChange = (event) => {
    const { name, value } = event.target
    setOffer((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit?.(offer)
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close()
    }
  }

  const handleCloseClick = (event) => {
    event.currentTarget.closest('dialog')?.close()
  }

  if (!demand) return <dialog className="offer-modal" ref={ref} />

  return (
    <dialog className="offer-modal" ref={ref} onClick={handleBackdropClick}>
      <div className="offer-modal__header">
        <div className="offer-modal__spacer" />
        <CrossButton className="offer-modal__close" label="Zavřít" onClick={handleCloseClick} />
      </div>

      <div className="offer-modal__layout">
        <div className="offer-modal__aside">
          <h3 className="offer-modal__title h3">{demand.title}</h3>

          <div className="offer-modal__chips">
            {demand.services.map((service) => (
              <Chip variant="secondary" key={service}>
                {service}
              </Chip>
            ))}
          </div>

          <p className="offer-modal__text">{demand.description}</p>

          <div className="offer-modal__meta">
            <span className="offer-modal__meta-item">
              <CalendarIcon />
              Termín: <time dateTime={demand.date}>{new Date(demand.date).toLocaleDateString('cs-CZ')}</time>
            </span>

            <span className="offer-modal__meta-item">
              <LocationIcon />
              Město: {demand.city}
            </span>
          </div>
        </div>

        <div className="offer-modal__content">
          <h3 className="offer-modal__subtitle h3">Vaše nabídka</h3>

          <form className="offer-modal__form" onSubmit={handleSubmit}>
            <div className="offer-modal__field field">
              <label htmlFor="offer-price" className="field__label visually-hidden">
                Cena
              </label>
              <div className="offer-modal__price-wrapper">
                <input
                  className="field__input"
                  id="offer-price"
                  name="price"
                  type="number"
                  min="0"
                  placeholder="Cena"
                  value={offer.price}
                  onChange={handleChange}
                />
                <span className="offer-modal__currency">Kč</span>
              </div>
            </div>

            <Field
              id="offer-description"
              name="description"
              label="Popis"
              placeholder="Popis vaší nabídky..."
              type="textarea"
              value={offer.description}
              onChange={handleChange}
            />

            <Button variant="transparent" type="button" icon={<AttachIcon />} className="offer-modal__attach">
              Přidat soubor
            </Button>

            <Button type="submit" className="offer-modal__submit">
              Poslat
            </Button>
          </form>
        </div>
      </div>
    </dialog>
  )
})
