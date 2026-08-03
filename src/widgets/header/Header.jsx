import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/ui/button'
import { Logo } from '../../shared/ui/logo'
import { BurgerButton } from '../../shared/ui/burger-button'
import { IconButton } from '../../shared/ui/icon-button'
import { useAuth } from '../../shared/auth'
import { MobileOverlay } from '../mobile-overlay'

function LoginIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 17C6 17.93 6 18.395 6.10222 18.7765C6.37962 19.8117 7.18827 20.6204 8.22354 20.8978C8.60504 21 9.07003 21 10 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H10C9.07003 3 8.60504 3 8.22354 3.10222C7.18827 3.37962 6.37962 4.18827 6.10222 5.22354C6 5.60504 6 6.07003 6 7M12 8L16 12M16 12L12 16M16 12H3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 17L21 12M21 12L16 7M21 12H9M12 17C12 17.93 12 18.395 11.8978 18.7765C11.6204 19.8117 10.8117 20.6204 9.77646 20.8978C9.39496 21 8.92997 21 8 21H7.5C6.10218 21 5.40326 21 4.85195 20.7716C4.11687 20.4672 3.53284 19.8831 3.22836 19.1481C3 18.5967 3 17.8978 3 16.5V7.5C3 6.10217 3 5.40326 3.22836 4.85195C3.53284 4.11687 4.11687 3.53284 4.85195 3.22836C5.40326 3 6.10218 3 7.5 3H8C8.92997 3 9.39496 3 9.77646 3.10222C10.8117 3.37962 11.6204 4.18827 11.8978 5.22354C12 5.60504 12 6.07003 12 7"
        stroke="black"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Header({ layout = 'landing' }) {
  const overlayRef = useRef(null)
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const isAppLayout = layout === 'app'

  const openOverlay = () => overlayRef.current?.showModal()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <header className="header">
        <div className="header__inner container">
          {isAppLayout ? (
            <div className="header__spacer" />
          ) : (
            <>
              <nav className="header__menu hidden-mobile">
                <ul className="header__menu-list">
                  <li className="header__menu-item">
                    <Link className="header__menu-link" to="/catalog">
                      Aktuální nabídky
                    </Link>
                  </li>
                  <li className="header__menu-item">
                    <Link className="header__menu-link" to="/#services">
                      Služby
                    </Link>
                  </li>
                  <li className="header__menu-item">
                    <Link className="header__menu-link" to="/application">
                      Aplikace
                    </Link>
                  </li>
                </ul>
              </nav>

              <BurgerButton
                className="header__burger-menu visible-mobile"
                label="Otevřít hlavní menu"
                onClick={openOverlay}
              />
            </>
          )}

          <Logo className="header__logo" />

          {isAppLayout ? (
            <>
              <div className="header__actions hidden-mobile">
                <ul className="header__menu-list">
                  <li className="header__menu-item">
                    <Button
                      variant="transparent"
                      className="header__button"
                      onClick={handleLogout}
                    >
                      Odhlásit se
                    </Button>
                  </li>
                </ul>
              </div>

              <IconButton
                className="visible-mobile"
                icon={<LogoutIcon />}
                label="Odhlásit se"
                onClick={handleLogout}
              />
            </>
          ) : isAuthenticated ? (
            <>
              <div className="header__actions hidden-mobile">
                <ul className="header__menu-list">
                  <li className="header__menu-item">
                    <Link className="header__menu-link" to="/profile">
                      Můj profil
                    </Link>
                  </li>
                  <li className="header__menu-item">
                    <Button
                      variant="transparent"
                      className="header__button"
                      onClick={handleLogout}
                    >
                      Odhlásit se
                    </Button>
                  </li>
                </ul>
              </div>

              <IconButton
                className="visible-mobile"
                icon={<LogoutIcon />}
                label="Odhlásit se"
                onClick={handleLogout}
              />
            </>
          ) : (
            <>
              <div className="header__actions hidden-mobile">
                <ul className="header__menu-list">
                  <li className="header__menu-item">
                    <Link className="header__menu-link" to="/login">
                      Přihlásit se
                    </Link>
                  </li>
                  <li className="header__menu-item">
                    <Button
                      as={Link}
                      to="/signup"
                      variant="transparent"
                      className="header__button"
                    >
                      Registrovat se
                    </Button>
                  </li>
                </ul>
              </div>

              <IconButton
                as={Link}
                to="/login"
                className="visible-mobile"
                icon={<LoginIcon />}
                label="Přihlásit se"
              />
            </>
          )}
        </div>
      </header>

      {!isAppLayout && <MobileOverlay ref={overlayRef} />}
    </>
  )
}
