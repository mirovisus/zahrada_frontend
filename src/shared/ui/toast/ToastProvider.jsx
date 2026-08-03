import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from './ToastContext'

const TOAST_DURATION = 3000

let nextToastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))

    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (type, message) => {
      const id = nextToastId++
      setToasts((prev) => [...prev, { id, type, message }])
      timers.current.set(
        id,
        setTimeout(() => removeToast(id), TOAST_DURATION),
      )
    },
    [removeToast],
  )

  const value = useMemo(
    () => ({
      success: (message) => showToast('success', message),
      error: (message) => showToast('error', message),
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-list">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
            <p className="toast__message">{toast.message}</p>
            <button
              type="button"
              className="toast__close"
              onClick={() => removeToast(toast.id)}
              aria-label="Zavřít"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
