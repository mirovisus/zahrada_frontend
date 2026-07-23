import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { CrossButton } from '../../shared/ui/cross-button'

export const MobileOverlay = forwardRef(function MobileOverlay(props, ref) {
  return (
    <dialog className="mobile-overlay visible-mobile" ref={ref} {...props}>
      <form className="mobile-overlay__close-button-wrapper" method="dialog">
        <CrossButton
          className="mobile-overlay__close-button"
          type="submit"
          label="Zavřít hlavní menu"
        />
      </form>
      <div className="mobile-overlay__body">
        <ul className="mobile-overlay__list">
          <li className="mobile-overlay__item">
            <Link className="mobile-overlay__link" to="/catalog">
              Aktuální nabídky
            </Link>
          </li>
          <li className="mobile-overlay__item">
            <Link className="mobile-overlay__link" to="/#services">
              Služby
            </Link>
          </li>
          <li className="mobile-overlay__item">
            <Link className="mobile-overlay__link" to="/application">
              Aplikace
            </Link>
          </li>
        </ul>
      </div>
    </dialog>
  )
})
