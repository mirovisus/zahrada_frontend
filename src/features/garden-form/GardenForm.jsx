import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Field } from '../../shared/ui/field'
import { Button } from '../../shared/ui/button'
import { normalizeFieldErrors } from '../../shared/api/client'

const emptyValues = {
  gardenName: '',
  areaSqm: '',
  city: '',
  street: '',
  houseNumber: '',
  postalCode: '',
}

const POSTAL_CODE_REGEX = /^\d{3}\s?\d{2}$/

function validate(values) {
  const errors = {}

  if (!values.gardenName.trim()) errors.gardenName = 'Název zahrady je povinný'

  const area = Number(values.areaSqm)
  if (Number.isNaN(area) || area <= 0) errors.areaSqm = 'Plocha musí být kladné číslo'

  if (!values.city.trim()) errors.city = 'Město je povinné'
  if (!values.street.trim()) errors.street = 'Ulice je povinná'

  if (values.postalCode.trim() && !POSTAL_CODE_REGEX.test(values.postalCode.trim())) {
    errors.postalCode = 'PSČ musí mít formát 5 číslic, volitelně oddělených mezerou'
  }

  return errors
}

function UploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H17C17.93 21 18.395 21 18.7765 20.8978C19.8117 20.6204 20.6204 19.8117 20.8978 18.7765C21 18.395 21 17.93 21 17M19 8V2M16 5H22M10.5 8.5C10.5 9.60457 9.60457 10.5 8.5 10.5C7.39543 10.5 6.5 9.60457 6.5 8.5C6.5 7.39543 7.39543 6.5 8.5 6.5C9.60457 6.5 10.5 7.39543 10.5 8.5ZM14.99 11.9181L6.53115 19.608C6.05536 20.0406 5.81747 20.2568 5.79643 20.4442C5.77819 20.6066 5.84045 20.7676 5.96319 20.8755C6.10478 21 6.42628 21 7.06929 21H16.456C17.8951 21 18.6147 21 19.1799 20.7582C19.8894 20.4547 20.4547 19.8894 20.7582 19.1799C21 18.6147 21 17.8951 21 16.456C21 15.9717 21 15.7296 20.9471 15.5042C20.8805 15.2208 20.753 14.9554 20.5733 14.7264C20.4303 14.5442 20.2412 14.3929 19.8631 14.0905L17.0658 11.8527C16.6874 11.5499 16.4982 11.3985 16.2898 11.3451C16.1061 11.298 15.9129 11.3041 15.7325 11.3627C15.5279 11.4291 15.3486 11.5921 14.99 11.9181Z"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GardenForm({ mode = 'create', initialValues, onSubmit, onDelete }) {
  const isEdit = mode === 'edit'
  const [values, setValues] = useState({ ...emptyValues, ...initialValues })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(initialValues?.mainPhotoUrl || null)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  // TODO: backend endpoint chybí - nahrávání souborů není na API implementováno (Garden.mainPhotoUrl),
  // vybraný soubor se proto jen zobrazí jako náhled a nikam se neodesílá.
  const handlePhotoChange = (event) => {
    const file = event.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')

    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSubmit?.({ ...values, photo: photoFile })
    } catch (error) {
      if (error.fieldErrors) setErrors((prev) => ({ ...prev, ...normalizeFieldErrors(error.fieldErrors) }))
      setServerError(error.message || 'Uložení se nezdařilo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`garden-form${isEdit ? ' garden-form--edit' : ''}`}>
      <div className="garden-form__header">
        <Link to="/profile" className="garden-form__close cross-button">
          <span className="visually-hidden">Zavřít</span>
        </Link>

        <h1 className="garden-form__title h2">{isEdit ? 'Upravit zahradu' : 'Vytvořit novou zahradu'}</h1>
      </div>

      <form className="garden-form__body" onSubmit={handleSubmit}>
        <div className="garden-form__layout">
          <div className="garden-form__aside">
            <div className="upload-box">
              <input
                className="upload-box__input visually-hidden"
                type="file"
                id="garden-photo"
                name="garden_photo"
                accept="image/png, image/jpeg"
                onChange={handlePhotoChange}
              />

              <label className="upload-box__label" htmlFor="garden-photo">
                <img
                  id="preview"
                  className="upload-box__preview"
                  src={photoPreview || '#'}
                  alt="Náhled"
                  style={{ opacity: photoPreview ? 1 : 0 }}
                />

                <span className="upload-box__icon-wrapper">
                  <UploadIcon />
                </span>
                <span className="upload-box__text">{isEdit ? 'Změnit fotografii' : 'Přidat fotografii zahrady'}</span>
              </label>
            </div>

            {isEdit && (
              <Button variant="delete" type="button" className="garden-form__delete" onClick={onDelete}>
                Smazat zahradu
              </Button>
            )}
          </div>

          <div className="garden-form__content">
            <Field
              id="garden-name"
              name="gardenName"
              label="Název zahrady"
              placeholder="Název zahrady"
              type="text"
              value={values.gardenName}
              onChange={handleChange}
              error={errors.gardenName}
              disabled={isSubmitting}
              required
            />

            <Field
              id="garden-area"
              name="areaSqm"
              label="Plocha (m2)"
              placeholder="Plocha (m2)"
              type="number"
              min="0"
              value={values.areaSqm}
              onChange={handleChange}
              error={errors.areaSqm}
              disabled={isSubmitting}
            />

            <Field
              id="garden-city"
              name="city"
              label="Město"
              placeholder="Město"
              type="text"
              value={values.city}
              onChange={handleChange}
              error={errors.city}
              disabled={isSubmitting}
            />

            <div className="garden-form__row">
              <Field
                id="garden-street"
                name="street"
                label="Ulice"
                placeholder="Ulice"
                type="text"
                value={values.street}
                onChange={handleChange}
                error={errors.street}
                disabled={isSubmitting}
              />

              <Field
                id="garden-house"
                name="houseNumber"
                label="Číslo domu"
                placeholder="Číslo domu"
                type="text"
                value={values.houseNumber}
                onChange={handleChange}
                error={errors.houseNumber}
                disabled={isSubmitting}
              />

              <Field
                id="garden-zip"
                name="postalCode"
                label="PSČ"
                placeholder="PSČ"
                type="text"
                value={values.postalCode}
                onChange={handleChange}
                error={errors.postalCode}
                disabled={isSubmitting}
              />
            </div>

            {serverError && <p className="field__error">{serverError}</p>}

            <Button variant="green" type="submit" className="garden-form__submit" disabled={isSubmitting}>
              {isEdit ? 'Uložit změny' : 'Vytvořit'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
