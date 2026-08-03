import { forwardRef, useEffect, useState } from 'react'
import { CrossButton } from '../../shared/ui/cross-button'
import { Field } from '../../shared/ui/field'
import { Chip } from '../../shared/ui/chip'
import { Button } from '../../shared/ui/button'
import { GardenCard } from '../../entities/garden'

const emptyValues = {
  title: '',
  description: '',
  urgency: '',
}

function validate(values, selectedServices) {
  const errors = {}

  if (!values.title.trim()) errors.title = 'Název poptávky je povinný'
  if (selectedServices.length === 0) errors.services = 'Vyberte alespoň jeden typ služby'
  if (!values.urgency) errors.urgency = 'Vyberte, kdy potřebujete práci hotovou'

  return errors
}

function NoticeIcon() {
  return (
    <svg
      className="demand-modal__notice-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const DemandModal = forwardRef(function DemandModal(
  {
    mode = 'create',
    garden,
    serviceOptions = [],
    urgencyOptions = [],
    initialValues,
    hasProposals = false,
    isLoading = false,
    error = '',
    onSubmit,
    onDelete,
  },
  ref,
) {
  const isEdit = mode === 'edit'
  const [values, setValues] = useState({ ...emptyValues, ...initialValues })
  const [selectedServices, setSelectedServices] = useState(initialValues?.services ?? [])
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues({ ...emptyValues, ...initialValues })
    setSelectedServices(initialValues?.services ?? [])
    setFieldErrors({})
  }, [initialValues])

  const locked = isEdit && (hasProposals || isLoading)
  const isDisabled = locked || isSubmitting

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleServiceSelect = (event) => {
    const value = event.target.value
    if (!value) return
    const option = serviceOptions.find((item) => String(item.value) === value)
    if (!option) return
    setSelectedServices((prev) => (prev.some((service) => service.value === option.value) ? prev : [...prev, option]))
    setFieldErrors((prev) => ({ ...prev, services: undefined }))
  }

  const handleServiceRemove = (value) => {
    setSelectedServices((prev) => prev.filter((service) => service.value !== value))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validate(values, selectedServices)
    setFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    const success = await onSubmit?.({ ...values, services: selectedServices })
    setIsSubmitting(false)

    if (success && !isEdit) {
      setValues(emptyValues)
      setSelectedServices([])
      setFieldErrors({})
    }
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close()
    }
  }

  return (
    <dialog className="demand-modal" ref={ref} onClick={handleBackdropClick}>
      <div className="demand-modal__inner">
        <div className="demand-modal__header">
          <h2 className="demand-modal__title h2">{isEdit ? 'Upravit poptávku' : 'Nová poptávka'}</h2>
          <form method="dialog">
            <CrossButton className="demand-modal__close" type="submit" label="Zavřít" />
          </form>
        </div>

        <form className="demand-modal__body" onSubmit={handleSubmit}>
          <div className="demand-modal__layout">
            <div className="demand-modal__aside">
              {garden && (
                <GardenCard
                  id={garden.id}
                  mainPhotoUrl={garden.mainPhotoUrl}
                  gardenName={garden.gardenName}
                  street={garden.street}
                  houseNumber={garden.houseNumber}
                  city={garden.city}
                />
              )}

              {isEdit && (
                <>
                  <Button
                    variant="delete"
                    type="button"
                    className="demand-modal__delete"
                    onClick={onDelete}
                    disabled={isDisabled}
                  >
                    Smazat poptávku
                  </Button>

                  {hasProposals && (
                    <div className="demand-modal__notice">
                      <NoticeIcon />
                      <p className="demand-modal__notice-text">
                        Poptávku lze upravit nebo smazat pouze pokud nikdo neposlal svou nabídku.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="demand-modal__content">
              {isEdit && isLoading && <p>Načítání…</p>}

              <Field
                id={`demand-${mode}-title`}
                name="title"
                label="Název poptávky"
                placeholder="Název poptávky"
                type="text"
                value={values.title}
                onChange={handleChange}
                error={fieldErrors.title}
                disabled={isDisabled}
                required
              />

              <Field
                type="select"
                id={`demand-${mode}-services`}
                label="Vyberte typ služby"
                value=""
                onChange={handleServiceSelect}
                error={fieldErrors.services}
                disabled={isDisabled}
              >
                <option value="" disabled>
                  Vyberte typ služby
                </option>
                {serviceOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </Field>

              {selectedServices.length > 0 && (
                <div className="demand-modal__chips">
                  {selectedServices.map((service) => (
                    <Chip
                      variant="secondary"
                      key={service.value}
                      onRemove={() => handleServiceRemove(service.value)}
                      removeLabel="Odebrat službu"
                    >
                      {service.label}
                    </Chip>
                  ))}
                </div>
              )}

              <Field
                id={`demand-${mode}-description`}
                name="description"
                label="Popis"
                placeholder="Popis"
                type="textarea"
                value={values.description}
                onChange={handleChange}
                disabled={isDisabled}
              />

              <Field
                type="select"
                id={`demand-${mode}-urgency`}
                name="urgency"
                label="Kdy potřebujete práci hotovou"
                value={values.urgency}
                onChange={handleChange}
                error={fieldErrors.urgency}
                disabled={isDisabled}
                required
              >
                <option value="" disabled>
                  Kdy potřebujete práci hotovou
                </option>
                {urgencyOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </Field>

              {error && <p className="field__error">{error}</p>}

              <Button variant="green" type="submit" className="demand-modal__submit" disabled={isDisabled}>
                {isEdit ? 'Uložit změny' : 'Poslat'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  )
})
