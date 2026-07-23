import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)

      const frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      })

      return () => cancelAnimationFrame(frame)
    }

    window.scrollTo(0, 0)
  }, [pathname, hash, key])

  return null
}
