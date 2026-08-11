import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Field } from '../../shared/ui/field'
import { Button } from '../../shared/ui/button'
import { CrossButton } from '../../shared/ui/cross-button'
import { useToast } from '../../shared/ui/toast'
import { useConfirm } from '../../shared/ui/confirm'
import { normalizeFieldErrors } from '../../shared/api/client'
import { getUploadUrl } from '../../shared/lib/media'

const emptyValues = {
  gardenName: '',
  areaSqm: '',
  city: '',
  street: '',
  houseNumber: '',
  postalCode: '',
}

const POSTAL_CODE_REGEX = /^\d{3}\s?\d{2}$/

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTO_SIZE = 5 * 1024 * 1024

function validatePhotoFile(file) {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return 'Podporované formáty jsou JPEG, PNG nebo WebP'
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return 'Fotografie může mít maximálně 5 MB'
  }
  return null
}

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

export function GardenForm({ mode = 'create', initialValues, onSubmit, onDelete, onUploadPhoto, onDeletePhoto }) {
  const isEdit = mode === 'edit'
  const toast = useToast()
  const confirm = useConfirm()
  const [values, setValues] = useState({ ...emptyValues, ...initialValues })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false)

  const savedPhotoUrl = getUploadUrl(initialValues?.mainPhotoUrl)
  const previewSrc = photoPreview || savedPhotoUrl

  // uvolní objectURL náhledu při výběru nového souboru / odchodu ze stránky
  useEffect(() => {
    if (!photoPreview) return undefined
    return () => URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return

    setPhotoError('')

    // klientská předvalidace jen kvůli UX (nehnat zjevně špatný soubor na server) - hlavní validace je serverová
    const validationError = validatePhotoFile(file)
    if (validationError) {
      setPhotoError(validationError)
      return
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleUploadPhoto = async () => {
    if (!photoFile) return

    setPhotoError('')
    setIsUploadingPhoto(true)
    try {
      await onUploadPhoto?.(photoFile)
      setPhotoFile(null)
      setPhotoPreview(null)
      toast.success('Fotografie nahrána')
    } catch (error) {
      const fieldError = error.fieldErrors ? normalizeFieldErrors(error.fieldErrors).file : undefined
      const message = fieldError || error.message || 'Nahrání fotografie se nezdařilo'
      setPhotoError(message)
      toast.error(message)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async () => {
    const ok = await confirm({
      title: 'Smazat fotografii',
      message: 'Opravdu chcete smazat fotografii zahrady?',
      confirmLabel: 'Smazat',
      variant: 'danger',
    })
    if (!ok) return

    setPhotoError('')
    setIsDeletingPhoto(true)
    try {
      await onDeletePhoto?.()
      setPhotoFile(null)
      setPhotoPreview(null)
      toast.success('Fotografie smazána')
    } catch (error) {
      const message = error.message || 'Smazání fotografie se nezdařilo'
      setPhotoError(message)
      toast.error(message)
    } finally {
      setIsDeletingPhoto(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')

    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSubmit?.(values)
      toast.success(isEdit ? 'Zahrada uložena' : 'Zahrada vytvořena')
    } catch (error) {
      if (error.fieldErrors) setErrors((prev) => ({ ...prev, ...normalizeFieldErrors(error.fieldErrors) }))
      const message = error.message || 'Uložení se nezdařilo'
      setServerError(message)
      toast.error(message)
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
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoChange}
                disabled={isUploadingPhoto || isDeletingPhoto}
              />

              <label className="upload-box__label" htmlFor="garden-photo">
                <img
                  id="preview"
                  className="upload-box__preview"
                  src={previewSrc || undefined}
                  alt="Náhled"
                  style={{ opacity: previewSrc ? 1 : 0 }}
                />

                <span className="upload-box__icon-wrapper">
                  <UploadIcon />
                </span>
                <span className="upload-box__text">{isEdit ? 'Změnit fotografii' : 'Přidat fotografii zahrady'}</span>
              </label>

              {isEdit && savedPhotoUrl && (
                <CrossButton
                  className="upload-box__remove"
                  type="button"
                  label="Smazat fotografii"
                  onClick={handleDeletePhoto}
                  disabled={isDeletingPhoto}
                />
              )}
            </div>

            {photoError && <p className="field__error">{photoError}</p>}

            {isEdit && photoFile && (
              <div className="garden-form__photo-actions">
                <Button
                  variant="green"
                  type="button"
                  className="garden-form__upload-photo"
                  onClick={handleUploadPhoto}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? 'Nahrávání…' : 'Nahrát'}
                </Button>
              </div>
            )}

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
