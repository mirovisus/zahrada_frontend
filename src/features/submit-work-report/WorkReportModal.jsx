import { forwardRef, useEffect, useState } from 'react'
import { CrossButton } from '../../shared/ui/cross-button'
import { Field } from '../../shared/ui/field'
import { Button } from '../../shared/ui/button'
import { Chip } from '../../shared/ui/chip'
import { DemandDetails, demandStatusLabels, demandStatusChipKeys } from '../../entities/demand'

const emptyValues = { description: '' }

function validate(values) {
  const errors = {}
  const description = values.description.trim()

  if (!description) errors.description = 'Popis prací je povinný'
  else if (description.length < 50) errors.description = 'Popis musí obsahovat alespoň 50 znaků'
  else if (description.length > 2000) errors.description = 'Popis nesmí překročit 2000 znaků'

  return errors
}

export const WorkReportModal = forwardRef(function WorkReportModal(
  { job, error = '', onSubmit, serverFieldErrors = {} },
  ref,
) {
  const [values, setValues] = useState(emptyValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues(emptyValues)
    setFieldErrors({})
  }, [job])

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
    const success = await onSubmit?.({ description: values.description.trim(), photoUrls: [] })
    setIsSubmitting(false)

    if (success) setValues(emptyValues)
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close()
    }
  }

  const handleCloseClick = (event) => {
    event.currentTarget.closest('dialog')?.close()
  }

  const canSubmitReport = job?.status === 'SCHVALENA' && !job?.reportSubmitted

  return (
    <dialog className="offer-modal" ref={ref} onClick={handleBackdropClick}>
      <div className="offer-modal__header">
        <div className="offer-modal__spacer" />
        <CrossButton className="offer-modal__close" label="Zavřít" onClick={handleCloseClick} />
      </div>

      {!job && error && <p className="field__error">{error}</p>}

      {job && (
        <div className="offer-modal__layout">
          <div className="offer-modal__aside">
            <DemandDetails demand={job} />
            <p className="card__price">{job.price} Kč</p>
            <div className="card__header">
              <Chip variant="status" status={demandStatusChipKeys[job.status]}>
                {demandStatusLabels[job.status] ?? job.status}
              </Chip>
            </div>
            <p className="offer-modal__text">
              Vytvořeno: {new Date(job.createdAt).toLocaleDateString('cs-CZ')}
            </p>
          </div>

          <div className="offer-modal__content">
            <h3 className="offer-modal__subtitle h3">Report o dokončení prací</h3>

            {canSubmitReport && (
              <form className="offer-modal__form" onSubmit={handleSubmit}>
                <Field
                  id="work-report-description"
                  name="description"
                  label="Popis provedených prací"
                  placeholder="Popište, co bylo v rámci zakázky provedeno..."
                  type="textarea"
                  value={values.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  maxLength={2000}
                  error={fieldErrors.description}
                />
                <p className="offer-modal__text">{values.description.length}/2000 znaků (min. 50)</p>

                {error && <p className="field__error">{error}</p>}

                <Button type="submit" className="offer-modal__submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Odesílání…' : 'Odeslat report'}
                </Button>
              </form>
            )}

            {job.reportSubmitted && (
              <p className="offer-modal__text">Report o dokončení prací byl odeslán.</p>
            )}

            {!job.reportSubmitted && job.status !== 'SCHVALENA' && (
              <p className="offer-modal__text">Report bude možné odeslat po přijetí návrhu.</p>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
})
