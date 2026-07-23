import { Link } from 'react-router-dom'
import { Button } from '../../../shared/ui/button'
import { ArrowIcon } from '../../../shared/ui/icons'

function DownloadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 7L17 17M17 17V7M17 17H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MainPage() {
  return (
    <main className="content">
      <section className="section container" id="hero">
        <div className="section__body">
          <div className="hero hero__main">
            <div className="hero__content">
              <h1 className="hero__title">Vytvořte&nbsp;si zahradu podle&nbsp;svých&nbsp;vizí</h1>
              <div className="hero__description">
                <p>
                  Zadejte informace o&nbsp;své&nbsp;zahradě a&nbsp;připojte své&nbsp;nápady.{' '}
                  <span className="break">Naši&nbsp;odborníci se&nbsp;postarají o&nbsp;zbytek.</span>
                </p>
              </div>
              <Button as={Link} to="/application" icon={<DownloadIcon />} className="hero__button">
                <span className="button__text">Stáhnout aplikaci</span>
              </Button>
            </div>
            <div className="hero__media">
              <img
                className="hero__media-image"
                src="/images/image-bg.png"
                alt="Zahrada s domem"
                width="591"
                height="780"
                loading="lazy"
              />

              <div className="hero__card card card-hero">
                <div className="hero__card-content">
                  <img
                    className="card__image"
                    src="/images/image-hero-card.png"
                    alt=""
                    width="204"
                    height="228"
                    loading="lazy"
                  />
                  <h4 className="card__title">Sledujte proměny</h4>
                </div>

                <div className="card__description">
                  <p>Uložte&nbsp;si fotografie před&nbsp;a&nbsp;po&nbsp;úpravách a&nbsp;objevte, jak&nbsp;se&nbsp;mění.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--banner">
        <div className="container">
          <div className="section__body section__banner about-us">
            <h2 className="section__title">O&nbsp;nás</h2>
            <blockquote className="section__description">
              <p>
                “Jsme profesionální zahradnická&nbsp;firma{' '}
                <span className="text-muted">s&nbsp;vášní pro&nbsp;vytváření krásných&nbsp;a&nbsp;funkčních&nbsp;zahrad.</span>{' '}
                Nabízíme širokou&nbsp;škálu služeb{' '}
                <span className="text-muted">od&nbsp;návrhu až&nbsp;po&nbsp;údržbu.</span> Vaše&nbsp;zahrada bude
                místem&nbsp;radosti.”
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="section container" id="services">
        <header className="section__header">
          <h2 className="section__title">Naše&nbsp;služby v&nbsp;oblasti zahradnických&nbsp;prací</h2>
        </header>
        <div className="section__body">
          <div className="services">
            <ul className="services__list grid grid--4">
              <li className="services__item">
                <article className="service-card service-card--icon">
                  <div className="service-card__body">
                    <p className="number">[01]</p>
                    <img
                      className="service-card__icon"
                      src="/images/services/1.svg"
                      alt=""
                      width="60"
                      height="60"
                      loading="lazy"
                    />
                    <div className="service-card__text">
                      <h4 className="service-card__title">Realizace&nbsp;zahrad</h4>
                      <div className="service-card__description">
                        <p>Návrh, výsadba a&nbsp;tvorba&nbsp;zahrad.</p>
                      </div>
                    </div>
                  </div>
                </article>
              </li>

              <li className="services__item">
                <article className="service-card service-card--image">
                  <div className="service-card__bg">
                    <img
                      className="service-card__bg-img"
                      src="/images/services/2.jpg"
                      alt="Zahradník stříhá keř velkými nůžkami"
                      loading="lazy"
                    />
                  </div>
                  <div className="service-card__body">
                    <p className="number">[02]</p>
                    <div className="service-card__text">
                      <h4 className="service-card__title">Údržba&nbsp;trávníku</h4>
                      <div className="service-card__description">
                        <p>Sekání, hnojení, vertikutace, zavlažení.</p>
                      </div>
                    </div>
                  </div>
                </article>
              </li>

              <li className="services__item">
                <article className="service-card service-card--icon">
                  <div className="service-card__body">
                    <p className="number">[03]</p>
                    <img
                      className="service-card__icon"
                      src="/images/services/3.svg"
                      alt=""
                      width="60"
                      height="60"
                      loading="lazy"
                    />
                    <div className="service-card__text">
                      <h4 className="service-card__title">Péče o&nbsp;stromy a&nbsp;keře</h4>
                      <div className="service-card__description">
                        <p>Prořez, tvarování, odstraňování&nbsp;pařezů.</p>
                      </div>
                    </div>
                  </div>
                </article>
              </li>

              <li className="services__item">
                <article className="service-card service-card--icon">
                  <div className="service-card__body">
                    <p className="number">[04]</p>
                    <img
                      className="service-card__icon"
                      src="/images/services/4.svg"
                      alt=""
                      width="60"
                      height="60"
                      loading="lazy"
                    />
                    <div className="service-card__text">
                      <h4 className="service-card__title">Zahradní&nbsp;architektura</h4>
                      <div className="service-card__description">
                        <p>Chodníky, terasy, pergoly, altány.</p>
                      </div>
                    </div>
                  </div>
                </article>
              </li>

              <li className="services__item">
                <article className="service-card service-card--image">
                  <div className="service-card__bg">
                    <img
                      className="service-card__bg-img"
                      src="/images/services/5.jpg"
                      alt="Automatický zavlažovací systém kropí pole"
                      loading="lazy"
                    />
                  </div>
                  <div className="service-card__body">
                    <p className="number">[05]</p>
                    <div className="service-card__text">
                      <h4 className="service-card__title">Závlahové&nbsp;systémy</h4>
                      <div className="service-card__description">
                        <p>Návrh a&nbsp;instalace&nbsp;zavlažování.</p>
                      </div>
                    </div>
                  </div>
                </article>
              </li>

              <li className="services__item">
                <article className="service-card service-card--image">
                  <div className="service-card__bg">
                    <img
                      className="service-card__bg-img"
                      src="/images/services/6.jpg"
                      alt="Detail rukou držících hlínu s malou zelenou sazenicí"
                      loading="lazy"
                    />
                  </div>
                  <div className="service-card__body">
                    <p className="number">[06]</p>
                    <div className="service-card__text">
                      <h4 className="service-card__title">Péče&nbsp;o&nbsp;záhony</h4>
                      <div className="service-card__description">
                        <p>Pletí, mulčování, hnojení, výsadba.</p>
                      </div>
                    </div>
                  </div>
                </article>
              </li>

              <li className="services__item">
                <article className="service-card service-card--accent service-card--icon">
                  <div className="service-card__body">
                    <div className="service-card__header">
                      <p className="number">[07]</p>
                      <a className="service-card__link" href="/">
                        <span className="service-card__link-icon-wrapper">
                          <ArrowIcon />
                        </span>
                      </a>
                    </div>

                    <img
                      className="service-card__icon"
                      src="/images/services/7.svg"
                      alt=""
                      width="60"
                      height="60"
                      loading="lazy"
                    />
                    <div className="service-card__text">
                      <h4 className="service-card__title">Další&nbsp;služby na&nbsp;přání</h4>
                      <div className="service-card__description">
                        <p>Kontaktujte&nbsp;nás pro&nbsp;řešení na&nbsp;míru!</p>
                      </div>
                    </div>
                  </div>
                </article>
              </li>

              <li className="services__item">
                <article className="service-card service-card--icon">
                  <div className="service-card__body">
                    <p className="number">[08]</p>
                    <img
                      className="service-card__icon"
                      src="/images/services/8.svg"
                      alt=""
                      width="60"
                      height="60"
                      loading="lazy"
                    />
                    <div className="service-card__text">
                      <h4 className="service-card__title">Sezónní&nbsp;údržba</h4>
                      <div className="service-card__description">
                        <p>Jarní/podzimní&nbsp;úklid, zazimování.</p>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
