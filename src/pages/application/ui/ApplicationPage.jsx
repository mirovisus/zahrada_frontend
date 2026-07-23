import { Button } from '../../../shared/ui/button'

export function ApplicationPage() {
  return (
    <main className="content">
      <section className="section container">
        <header className="section__header">
          <h2 className="section__title">Hlavní&nbsp;funkce aplikace:</h2>
        </header>
        <div className="section__body">
          <div className="features">
            <ul className="features__list grid grid--4">
              <li className="features__item">
                <article className="feature-card feature-card--first">
                  <div className="feature-card__body">
                    <img
                      className="feature-card__image"
                      src="/images/features/features_1.jpg"
                      alt=""
                      width="554"
                      height="582"
                      loading="lazy"
                    />
                    <div className="feature-card__scroll" />
                  </div>
                  <h3 className="feature-card__title">Sledujte proměny</h3>
                  <div className="feature-card__description">
                    <p>
                      Ukládejte fotografie před a&nbsp;po&nbsp;úpravách a&nbsp;objevujte, jak&nbsp;se&nbsp;vaše&nbsp;zahrada
                      mění a&nbsp;vyvíjí.
                    </p>
                  </div>
                </article>
              </li>
              <li className="features__item">
                <article className="feature-card">
                  <h3 className="feature-card__title">Vše na&nbsp;jednom&nbsp;místě</h3>
                  <div className="feature-card__description">
                    <p>
                      Spravujte a&nbsp;sledujte každý&nbsp;projekt přímo z&nbsp;vašeho mobilního&nbsp;zařízení.
                    </p>
                  </div>
                </article>
              </li>
              <li className="features__item">
                <article className="feature-card">
                  <h3 className="feature-card__title">Reporty</h3>
                  <div className="feature-card__description">
                    <p>
                      Získejte snadný&nbsp;přístup k&nbsp;reportům přidaným k&nbsp;vašim&nbsp;zahradám.
                    </p>
                  </div>
                </article>
              </li>
              <li className="features__item">
                <article className="feature-card">
                  <h3 className="feature-card__title">Hodnocení</h3>
                  <div className="feature-card__description">
                    <p>
                      Po&nbsp;dokončení každé&nbsp;práce můžete ohodnotit pracovníky.
                    </p>
                  </div>
                </article>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section container" id="application">
        <div className="section__body">
          <div className="app app__main">
            <div className="app__content">
              <h2 className="app__title">Stáhněte&nbsp;si aplikaci</h2>
              <div className="app__description">
                <p>
                  Získejte plný&nbsp;přehled o&nbsp;vašich&nbsp;projektech, sledujte pokrok a&nbsp;spravujte vše
                  snadno a&nbsp;rychle přímo z&nbsp;vašeho&nbsp;mobilu. Ať&nbsp;už&nbsp;jde o&nbsp;plánování, údržbu
                  nebo&nbsp;hodnocení&nbsp;služeb, aplikace vám usnadní&nbsp;život a&nbsp;ušetří&nbsp;čas.
                  Stáhněte&nbsp;si&nbsp;ji ještě&nbsp;dnes a&nbsp;začněte s&nbsp;profesionální&nbsp;péčí o&nbsp;vaši&nbsp;zahradu!
                </p>
              </div>
              <div className="app__buttons">
                <Button href="#" className="app__button">
                  Google&nbsp;Play
                </Button>
                <Button href="#" className="app__button">
                  App&nbsp;Store
                </Button>
              </div>
            </div>
            <div className="app__media">
              <img
                className="app__media-image"
                src="/images/aplikace.png"
                alt="Foto aplikace"
                width="557"
                height="666"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
