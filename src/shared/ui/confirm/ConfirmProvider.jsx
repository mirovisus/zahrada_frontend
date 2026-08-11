import { useCallback, useEffect, useRef, useState } from 'react'
import { ConfirmContext } from './ConfirmContext'
import { Button } from '../button'
import { CrossButton } from '../cross-button'

const DEFAULT_CONFIRM_LABEL = 'Potvrdit'
const DEFAULT_CANCEL_LABEL = 'Zrušit'

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null)
  const dialogRef = useRef(null)
  const resultRef = useRef(false)

  // dialog se otevírá reaktivně na změnu požadavku, aby volající místa (viz useConfirm) mohla
  // zůstat jednořádková - žádný ref na modal, žádný isOpen stav u volajícího
  useEffect(() => {
    if (request) {
      resultRef.current = false
      dialogRef.current?.showModal()
    }
  }, [request])

  // nativní 'close' event pokryje všechny cesty zavření (tlačítka, křížek, klik na backdrop i Esc)
  // jedním místem - podle resultRef.current se pozná, jestli šlo o potvrzení, nebo zrušení
  useEffect(() => {
    const dialogEl = dialogRef.current
    if (!dialogEl) return undefined

    const handleNativeClose = () => {
      setRequest((current) => {
        current?.resolve(resultRef.current)
        return null
      })
    }

    dialogEl.addEventListener('close', handleNativeClose)
    return () => dialogEl.removeEventListener('close', handleNativeClose)
  }, [])

  const confirm = useCallback(
    ({
      title,
      message,
      confirmLabel = DEFAULT_CONFIRM_LABEL,
      cancelLabel = DEFAULT_CANCEL_LABEL,
      variant = 'danger',
    } = {}) =>
      new Promise((resolve) => {
        setRequest({ title, message, confirmLabel, cancelLabel, variant, resolve })
      }),
    [],
  )

  const handleConfirmClick = () => {
    resultRef.current = true
    dialogRef.current?.close()
  }

  const handleCancelClick = () => {
    dialogRef.current?.close()
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close()
    }
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <dialog className="confirm-modal" ref={dialogRef} onClick={handleBackdropClick}>
        {request && (
          <div className="confirm-modal__inner">
            <div className="confirm-modal__header">
              {request.title && <h2 className="confirm-modal__title h3">{request.title}</h2>}
              <CrossButton className="confirm-modal__close" label="Zavřít" onClick={handleCancelClick} />
            </div>

            {request.message && <p className="confirm-modal__message">{request.message}</p>}

            <div className="confirm-modal__actions">
              <Button variant="transparent" type="button" onClick={handleCancelClick}>
                {request.cancelLabel}
              </Button>
              <Button
                variant={request.variant === 'danger' ? 'delete' : undefined}
                type="button"
                onClick={handleConfirmClick}
              >
                {request.confirmLabel}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  )
}
