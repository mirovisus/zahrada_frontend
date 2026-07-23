import { useEffect, useRef, useState } from 'react'
import { GardenCard, GardenCardAdd } from '../../../entities/garden'
import { DemandCard, mockProfileDemands, profileDemandStatuses } from '../../../entities/demand'
import { Field } from '../../../shared/ui/field'
import { Button } from '../../../shared/ui/button'
import { Divider } from '../../../shared/ui/divider'
import { Chip } from '../../../shared/ui/chip'
import { getGardens } from '../../../shared/api/gardens'
import { updateOwnerProfile, updateWorkerProfile } from '../../../shared/api/profile'
import { normalizeFieldErrors } from '../../../shared/api/client'
import { useAuth } from '../../../shared/auth'
import { OfferModal } from './OfferModal'

const STATUS_LABELS = profileDemandStatuses.reduce((labels, filter) => {
  if (filter.value !== 'all') labels[filter.value] = filter.label
  return labels
}, {})

const ROLE_LABELS = {
  OWNER: 'Vlastník zahrady',
  WORKER: 'Pracovník',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+420\s?\d{3}\s?\d{3}\s?\d{3}$/

function buildProfileValues(profile) {
  return {
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phoneNumber: profile.phoneNumber || '',
    bio: profile.bio || '',
    newPassword: '',
  }
}

function validateProfile(values) {
  const errors = {}

  if (!values.firstName.trim()) errors.firstName = 'Jméno je povinné'
  if (!values.lastName.trim()) errors.lastName = 'Příjmení je povinné'

  if (!values.email.trim()) errors.email = 'Email je povinný'
  else if (!EMAIL_REGEX.test(values.email)) errors.email = 'Zadejte platný email'

  if (values.phoneNumber.trim() && !PHONE_REGEX.test(values.phoneNumber.trim())) {
    errors.phoneNumber = 'Telefon musí mít formát +420XXXXXXXXX'
  }

  if (values.newPassword && values.newPassword.length < 8) {
    errors.newPassword = 'Heslo musí mít alespoň 8 znaků'
  }

  return errors
}

function ProfileCard({ user, profile, isWorker, onSaved }) {
  const [values, setValues] = useState(() => buildProfileValues(profile))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setSuccessMessage('')
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setServerError('')
    setSuccessMessage('')

    const validationErrors = validateProfile(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      newPassword: values.newPassword,
      avatarUrl: profile.avatarUrl ?? null,
    }
    if (isWorker) payload.bio = values.bio

    setIsSubmitting(true)
    try {
      if (isWorker) await updateWorkerProfile(payload)
      else await updateOwnerProfile(payload)

      await onSaved()
      setValues((prev) => ({ ...prev, newPassword: '' }))
      setSuccessMessage('Profil byl uložen.')
    } catch (error) {
      if (error.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...normalizeFieldErrors(error.fieldErrors) }))
      }
      setServerError(error.message || 'Uložení profilu se nezdařilo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = () => {
    console.log('delete account')
  }

  return (
    <div className="profile-card">
      <div className="profile-card__header">
        <img
          className="profile-card__avatar"
          src="/images/profile/profil-man.jpg"
          alt="person"
          width="72"
          height="72"
          loading="lazy"
        />

        <div className="profile-card__info">
          <p className="profile-card__name h4">{profile.firstName}</p>
          <p className="profile-card__role">{ROLE_LABELS[user.role]}</p>
        </div>
      </div>

      <form className="profile-card__form" onSubmit={handleProfileSubmit}>
        <Field
          className={`profile-card__field profile-card__field--bio${isWorker ? ' is-worker' : ''}`}
          inputClassName="profile-card__bio"
          id="profile-bio"
          name="bio"
          label="O sobě"
          type="textarea"
          placeholder="Napište pár slov o své praxi. Pomůže to zákazníkům vás lépe poznat."
          value={values.bio}
          onChange={handleProfileChange}
        />

        <Field
          className="profile-card__field"
          id="profile-first-name"
          name="firstName"
          label="Jméno"
          placeholder="Jméno"
          type="text"
          value={values.firstName}
          onChange={handleProfileChange}
          error={errors.firstName}
        />

        <Field
          className="profile-card__field"
          id="profile-last-name"
          name="lastName"
          label="Příjmení"
          placeholder="Příjmení"
          type="text"
          value={values.lastName}
          onChange={handleProfileChange}
          error={errors.lastName}
        />

        <Divider />

        <Field
          className="profile-card__field"
          id="profile-email"
          name="email"
          label="E-mail"
          placeholder="Email"
          type="email"
          value={values.email}
          onChange={handleProfileChange}
          error={errors.email}
        />

        <Field
          className="profile-card__field"
          id="profile-phone"
          name="phoneNumber"
          label="Telefonní číslo"
          placeholder="+420XXXXXXXXX"
          type="tel"
          value={values.phoneNumber}
          onChange={handleProfileChange}
          error={errors.phoneNumber}
        />

        <Field
          className="profile-card__field"
          id="profile-password"
          name="newPassword"
          label="Nové heslo"
          placeholder="Nové heslo"
          type="password"
          autoComplete="new-password"
          value={values.newPassword}
          onChange={handleProfileChange}
          error={errors.newPassword}
        />

        {serverError && <p className="field__error">{serverError}</p>}
        {successMessage && <p>{successMessage}</p>}

        <div className="profile-card__actions">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ukládání…' : 'Uložit'}
          </Button>
          <Button variant="delete" type="button" onClick={handleDeleteAccount}>
            Smazat účet
          </Button>
        </div>
      </form>
    </div>
  )
}

export function ProfilePage() {
  const { user, profile, profileLoading, refreshProfile } = useAuth()
  const isWorker = user?.role === 'WORKER'

  const [activeStatus, setActiveStatus] = useState('all')
  const [selectedDemand, setSelectedDemand] = useState(null)
  const offerModalRef = useRef(null)

  const [gardens, setGardens] = useState([])
  const [gardensLoading, setGardensLoading] = useState(true)
  const [gardensError, setGardensError] = useState('')

  useEffect(() => {
    let ignore = false

    setGardensLoading(true)
    setGardensError('')

    getGardens(0, 12)
      .then((page) => {
        if (!ignore) setGardens(page.content)
      })
      .catch((error) => {
        if (!ignore) setGardensError(error.message || 'Nepodařilo se načíst zahrady')
      })
      .finally(() => {
        if (!ignore) setGardensLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const filteredDemands =
    activeStatus === 'all'
      ? mockProfileDemands
      : mockProfileDemands.filter((demand) => demand.status === activeStatus)

  const openOfferModal = (demand) => {
    setSelectedDemand(demand)
    offerModalRef.current?.showModal()
  }

  const handleOfferSubmit = (offer) => {
    console.log({ demandId: selectedDemand?.id, ...offer })
    offerModalRef.current?.close()
  }

  return (
    <>
      <div className="split-layout container">
        <aside className="split-layout__sidebar">
          {profileLoading && <p>Načítání profilu…</p>}
          {!profileLoading && !profile && <p className="field__error">Nepodařilo se načíst profil.</p>}
          {!profileLoading && profile && (
            <ProfileCard user={user} profile={profile} isWorker={isWorker} onSaved={refreshProfile} />
          )}
        </aside>

        <main className="split-layout__content">
          <section className="info-banner">
            <h1 className="info-banner__title h2">Ahoj, {profile ? profile.firstName : '…'}!</h1>
            <p className="info-banner__text">
              Vše je aktuální, <strong>žádné nové zprávy</strong>
            </p>
          </section>

          <section className="gardens">
            <h2 className="gardens__title h3">Moje zahrady:</h2>

            {gardensLoading && <p>Načítání zahrad…</p>}
            {gardensError && <p className="field__error">{gardensError}</p>}

            {!gardensLoading && !gardensError && (
              <ul className="gardens__list grid grid--3">
                {gardens.map((garden) => (
                  <li className="gardens__item" key={garden.id}>
                    <GardenCard
                      mainPhotoUrl={garden.mainPhotoUrl}
                      gardenName={garden.gardenName}
                      street={garden.street}
                      houseNumber={garden.houseNumber}
                      city={garden.city}
                    />
                  </li>
                ))}

                <li className="gardens__item">
                  <GardenCardAdd to="/garden/new" />
                </li>
              </ul>
            )}

            <div className="demand-list demand-list--embedded">
              <header className="demand-list__header">
                <h3 className="demand-list__title h3">Seznam poptávek</h3>

                <nav className="demand-list__filters" aria-label="Filtr stavu poptávek">
                  {profileDemandStatuses.map((filter) => (
                    <Chip
                      key={filter.value}
                      as="button"
                      variant={activeStatus === filter.value ? 'active' : undefined}
                      aria-pressed={activeStatus === filter.value}
                      onClick={() => setActiveStatus(filter.value)}
                    >
                      {filter.label}
                    </Chip>
                  ))}
                </nav>
              </header>

              <ul className="demand-list__items">
                {filteredDemands.map((demand) => (
                  <li className="demand-list__item" key={demand.id}>
                    <DemandCard
                      title={demand.title}
                      services={demand.services}
                      preview={demand.preview}
                      address={demand.address}
                      status={{ key: demand.status, label: STATUS_LABELS[demand.status] }}
                      onClick={() => openOfferModal(demand)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
      </div>

      <OfferModal ref={offerModalRef} demand={selectedDemand} onSubmit={handleOfferSubmit} />
    </>
  )
}
