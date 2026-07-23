import { forwardRef, useEffect, useState } from 'react'
import { CrossButton } from '../../shared/ui/cross-button'
import { Field } from '../../shared/ui/field'
import { Chip } from '../../shared/ui/chip'
import { Button } from '../../shared/ui/button'
import { GardenCard } from '../../entities/garden'

const emptyValues = {
  title: '',
  description: '',
  dueDate: '',
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
  { mode = 'create', garden, serviceOptions = [], initialValues, onSubmit, onDelete },
  ref,
) {
  const isEdit = mode === 'edit'
  const [values, setValues] = useState({ ...emptyValues, ...initialValues })
  const [selectedServices, setSelectedServices] = useState(initialValues?.services ?? [])

  useEffect(() => {
    setValues({ ...emptyValues, ...initialValues })
    setSelectedServices(initialValues?.services ?? [])
  }, [initialValues])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleServiceSelect = (event) => {
    const value = event.target.value
    if (!value) return
    const option = serviceOptions.find((item) => item.value === value)
    setSelectedServices((prev) => (prev.some((service) => service.value === value) ? prev : [...prev, option]))
  }

  const handleServiceRemove = (value) => {
    setSelectedServices((prev) => prev.filter((service) => service.value !== value))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit?.({ ...values, services: selectedServices })
    if (!isEdit) {
      setValues(emptyValues)
      setSelectedServices([])
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
                  mainPhotoUrl={garden.mainPhotoUrl}
                  gardenName={garden.gardenName}
                  street={garden.street}
                  city={garden.city}
                />
              )}

              {isEdit && (
                <>
                  <Button variant="delete" type="button" className="demand-modal__delete" onClick={onDelete}>
                    Smazat poptávku
                  </Button>

                  <div className="demand-modal__notice">
                    <NoticeIcon />
                    <p className="demand-modal__notice-text">
                      Poptávku lze upravit nebo smazat pouze pokud nikdo neposlal svou nabídku.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="demand-modal__content">
              <Field
                id={`demand-${mode}-title`}
                name="title"
                label="Název poptávky"
                placeholder="Název poptávky"
                type="text"
                value={values.title}
                onChange={handleChange}
                required
              />

              <Field
                type="select"
                id={`demand-${mode}-services`}
                label="Vyberte typ služby"
                value=""
                onChange={handleServiceSelect}
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
              />

              <Field
                id={`demand-${mode}-date`}
                name="dueDate"
                label="Datum"
                type="date"
                value={values.dueDate}
                onChange={handleChange}
              />

              <Button variant="green" type="submit" className="demand-modal__submit">
                {isEdit ? 'Uložit změny' : 'Poslat'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  )
})
