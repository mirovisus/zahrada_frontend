import { forwardRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CrossButton } from '../../shared/ui/cross-button'
import { Field } from '../../shared/ui/field'
import { Button } from '../../shared/ui/button'
import { DemandDetails } from '../../entities/demand'

const emptyValues = { price: '', description: '' }

function validate(values) {
  const errors = {}
  const price = Number(values.price)

  if (!values.price || Number.isNaN(price) || price <= 0) {
    errors.price = 'Cena musí být kladné číslo'
  }

  return errors
}

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

export const OfferModal = forwardRef(function OfferModal(
  {
    demand,
    viewerRole = 'GUEST',
    isLoading = false,
    error = '',
    onSubmit,
    initialValues = emptyValues,
    serverFieldErrors = {},
    title = 'Vaše nabídka',
    submitLabel = 'Poslat',
  },
  ref,
) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues(initialValues)
    setFieldErrors({})
  }, [demand, initialValues])

  // externí (serverové) chyby polí sloučíme do stejného stavu jako klientskou validaci,
  // aby je handleChange níže standardně smazal při další úpravě pole
  useEffect(() => {
    if (Object.keys(serverFieldErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...serverFieldErrors }))
    }
  }, [serverFieldErrors])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validate(values)
    setFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    const success = await onSubmit?.({ price: Number(values.price), description: values.description })
    setIsSubmitting(false)

    if (success) {
      setValues(emptyValues)
    }
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close()
    }
  }

  const handleCloseClick = (event) => {
    event.currentTarget.closest('dialog')?.close()
  }

  const isDisabled = isLoading || isSubmitting

  return (
    <dialog className="offer-modal" ref={ref} onClick={handleBackdropClick}>
      <div className="offer-modal__header">
        <div className="offer-modal__spacer" />
        <CrossButton className="offer-modal__close" label="Zavřít" onClick={handleCloseClick} />
      </div>

      {isLoading && <p>Načítání…</p>}

      {!isLoading && !demand && error && <p className="field__error">{error}</p>}

      {!isLoading && demand && (
        <div className="offer-modal__layout">
          <div className="offer-modal__aside">
            <DemandDetails demand={demand} />
          </div>

          {viewerRole === 'WORKER' && (
            <div className="offer-modal__content">
              <h3 className="offer-modal__subtitle h3">{title}</h3>

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
                      value={values.price}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                    <span className="offer-modal__currency">Kč</span>
                  </div>
                  {fieldErrors.price && <p className="field__error">{fieldErrors.price}</p>}
                </div>

                <Field
                  id="offer-description"
                  name="description"
                  label="Popis"
                  placeholder="Popis vaší nabídky..."
                  type="textarea"
                  value={values.description}
                  onChange={handleChange}
                  disabled={isDisabled}
                />

                {/* TODO: backend endpoint chybí - nahrávání dokumentů není na API implementováno
                    (CreateProposalRequest.documentUrl), tlačítko je proto jen neaktivní placeholder. */}
                <Button
                  variant="transparent"
                  type="button"
                  icon={<AttachIcon />}
                  className="offer-modal__attach"
                  disabled
                >
                  Přidat soubor
                </Button>

                {error && <p className="field__error">{error}</p>}

                <Button type="submit" className="offer-modal__submit" disabled={isDisabled}>
                  {isSubmitting ? 'Odesílání…' : submitLabel}
                </Button>
              </form>
            </div>
          )}

          {viewerRole === 'GUEST' && (
            <div className="offer-modal__content">
              <h3 className="offer-modal__subtitle h3">Vaše nabídka</h3>
              <p className="offer-modal__text">Pro odeslání nabídky se přihlaste</p>
              <Button as={Link} to="/login" className="offer-modal__submit">
                Přihlásit se
              </Button>
            </div>
          )}
        </div>
      )}
    </dialog>
  )
})
