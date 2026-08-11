import { useEffect, useState } from 'react'
import { Field } from '../../shared/ui/field'
import { Button } from '../../shared/ui/button'
import { RatingStars } from './RatingStars'

const emptyValues = { rating: 0, comment: '' }

function validate(values) {
  const errors = {}

  if (!values.rating) errors.rating = 'Hodnocení je povinné'

  const comment = values.comment.trim()
  if (comment && (comment.length < 4 || comment.length > 1000)) {
    errors.comment = 'Komentář musí mít 4 až 1000 znaků'
  }

  return errors
}

export function AcceptWorkForm({ onSubmit, onCancel, error = '', serverFieldErrors = {} }) {
  const [values, setValues] = useState(emptyValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // externí (serverové) chyby polí sloučíme do stejného stavu jako klientskou validaci,
  // aby je změna pole níže standardně smazala při další úpravě
  useEffect(() => {
    if (Object.keys(serverFieldErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...serverFieldErrors }))
    }
  }, [serverFieldErrors])

  const handleRatingChange = (rating) => {
    setValues((prev) => ({ ...prev, rating }))
    setFieldErrors((prev) => ({ ...prev, rating: undefined }))
  }

  const handleCommentChange = (event) => {
    setValues((prev) => ({ ...prev, comment: event.target.value }))
    setFieldErrors((prev) => ({ ...prev, comment: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validate(values)
    setFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    const success = await onSubmit?.({ rating: values.rating, comment: values.comment.trim() || undefined })
    setIsSubmitting(false)

    if (success) setValues(emptyValues)
  }

  return (
    <form className="offer-modal__form" onSubmit={handleSubmit}>
      <RatingStars value={values.rating} onChange={handleRatingChange} error={fieldErrors.rating} />

      <Field
        id="accept-work-comment"
        name="comment"
        label="Komentář"
        placeholder="Komentář k práci (nepovinné)..."
        type="textarea"
        value={values.comment}
        onChange={handleCommentChange}
        disabled={isSubmitting}
        error={fieldErrors.comment}
      />

      {error && <p className="field__error">{error}</p>}

      <div className="card__actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Odesílání…' : 'Přijmout práci'}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Zrušit
        </Button>
      </div>
    </form>
  )
}
