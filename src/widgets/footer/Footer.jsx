import { Link } from 'react-router-dom'
import { Logo } from '../../shared/ui/logo'
import { Field } from '../../shared/ui/field'
import { Button } from '../../shared/ui/button'

function handleSubscribeSubmit(event) {
  event.preventDefault()
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__navigation">
          <Logo className="footer__logo" src="/images/logo-light.svg" />

          <nav className="footer__menu">
            <ul className="footer__menu-list">
              <li className="footer__menu-item">
                <Link className="footer__menu-link" to="/">
                  Aktuální nabídky
                </Link>
              </li>
              <li className="footer__menu-item">
                <Link className="footer__menu-link" to="/#services">
                  Služby
                </Link>
              </li>
              <li className="footer__menu-item">
                <Link className="footer__menu-link" to="/application">
                  Aplikace
                </Link>
              </li>
            </ul>
          </nav>

          <div className="footer__soc1als soc1als">
            <ul className="soc1als__list">
              <li className="soc1als__item">
                <a className="soc1als__link" href="/">
                  <span className="visually-hidden">LinkedIn</span>
                  <svg width="800px" height="800px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" fill="none" width="20" height="20" />
                    <g>
                      <path d="M2.5 18h3V6.9h-3V18zM4 2c-1 0-1.8.8-1.8 1.8S3 5.6 4 5.6s1.8-.8 1.8-1.8S5 2 4 2zm6.6 6.6V6.9h-3V18h3v-5.7c0-3.2 4.1-3.4 4.1 0V18h3v-6.8c0-5.4-5.7-5.2-7.1-2.6z" />
                    </g>
                  </svg>
                </a>
              </li>
              <li className="soc1als__item">
                <a className="soc1als__link" href="/">
                  <span className="visually-hidden">Facebook</span>
                  <svg
                    width="800px"
                    height="800px"
                    viewBox="-5 0 20 20"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                  >
                    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                      <g id="Dribbble-Light-Preview" transform="translate(-385.000000, -7399.000000)" fill="#000000">
                        <g id="icons" transform="translate(56.000000, 160.000000)">
                          <path
                            d="M335.821282,7259 L335.821282,7250 L338.553693,7250 L339,7246 L335.821282,7246 L335.821282,7244.052 C335.821282,7243.022 335.847593,7242 337.286884,7242 L338.744689,7242 L338.744689,7239.14 C338.744689,7239.097 337.492497,7239 336.225687,7239 C333.580004,7239 331.923407,7240.657 331.923407,7243.7 L331.923407,7246 L329,7246 L329,7250 L331.923407,7250 L331.923407,7259 L335.821282,7259 Z"
                            id="facebook-[#176]"
                          />
                        </g>
                      </g>
                    </g>
                  </svg>
                </a>
              </li>
              <li className="soc1als__item">
                <a className="soc1als__link" href="/">
                  <span className="visually-hidden">Instagram</span>
                  <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                      fill="#0F0F0F"
                    />
                    <path
                      d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z"
                      fill="#0F0F0F"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z"
                      fill="#0F0F0F"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__body">
          <div className="footer__contacts">
            <h2 className="footer__contacts-title h4">Kontaktní údaje:</h2>
            <address className="footer__contacts-body">
              <p>
                Email: <a href="mailto:info@zahrada.com">info@zahrada.com</a>
              </p>
              <p>
                Phone: <a href="tel:4405678901">440-567-8901</a>
              </p>
              <p>
                Adresa: Modrý Javor 47/19
                <br />
                190 99 Praha 9, Česká republika
              </p>
            </address>
          </div>

          <form className="footer__subscribe-form subscribe-form" onSubmit={handleSubscribeSubmit}>
            <h2 className="visually-hidden">Subscription</h2>
            <Field
              className="subscribe-form__field"
              id="subscribe-email"
              name="email"
              type="email"
              label="Email"
              placeholder="Email"
              bigHeight
              darkBg
              required
            />
            <Button type="submit" className="subscribe-form__button">
              Sledovat
            </Button>
          </form>
        </div>

        <div className="footer__extra">
          <p className="footer__copyright">
            © <time dateTime="2026">2026</time> Zahrada. All Rights Reserved.
          </p>
          <a className="footer__privacy-policy-link" href="/">
            Obchodní Podmínky
          </a>
        </div>
      </div>
    </footer>
  )
}
