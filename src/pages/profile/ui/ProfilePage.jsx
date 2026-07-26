import { useEffect, useRef, useState } from 'react'
import { GardenCard, GardenCardAdd } from '../../../entities/garden'
import { DemandCard, gardenDemandStatuses } from '../../../entities/demand'
import { ProposalsModal } from '../../../features/review-proposals'
import { Field } from '../../../shared/ui/field'
import { Button } from '../../../shared/ui/button'
import { Divider } from '../../../shared/ui/divider'
import { Chip } from '../../../shared/ui/chip'
import { getGardens } from '../../../shared/api/gardens'
import { getMyDemands } from '../../../shared/api/demands'
import { getProposalsByDemand, acceptProposal, rejectProposal } from '../../../shared/api/proposals'
import { updateOwnerProfile, updateWorkerProfile } from '../../../shared/api/profile'
import { normalizeFieldErrors } from '../../../shared/api/client'
import { useAuth } from '../../../shared/auth'

const STATUS_LABELS = gardenDemandStatuses.reduce((labels, filter) => {
  if (filter.value !== 'all') labels[filter.value] = filter.label
  return labels
}, {})

// mapuje DemandStatus na modifikátor chipu definovaný v _chip.scss (chip--nova, chip--schvalena, ...)
const STATUS_CHIP_KEYS = {
  NOVA: 'nova',
  SCHVALENA: 'schvalena',
  CEKA_NA_PLATBU: 'ceka-na-platbu',
  ZAPLACENA: 'zaplaceno',
  PRACE_DOKONCENY: 'dokonceno',
  PRACE_SCHVALENY: 'dokonceno',
  ZRUSENA: 'zruseno',
}

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
    // TODO: backend endpoint chybí - smazání účtu není na API implementováno
    console.log('delete account')
  }

  return (
    <div className="profile-card">
      <div className="profile-card__header">
        <img
          className="profile-card__avatar"
          src={profile.avatarUrl || '/images/profile/profil-man.jpg'}
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
  const [demandsRefreshKey, setDemandsRefreshKey] = useState(0)

  const [gardens, setGardens] = useState([])
  const [gardensLoading, setGardensLoading] = useState(true)
  const [gardensError, setGardensError] = useState('')

  const [demands, setDemands] = useState([])
  const [demandsLoading, setDemandsLoading] = useState(true)
  const [demandsError, setDemandsError] = useState('')

  const [selectedDemand, setSelectedDemand] = useState(null)
  const [proposals, setProposals] = useState([])
  const [proposalsLoading, setProposalsLoading] = useState(false)
  const [proposalsError, setProposalsError] = useState('')
  const proposalsModalRef = useRef(null)

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

  useEffect(() => {
    if (isWorker) return
    let ignore = false

    setDemandsLoading(true)
    setDemandsError('')

    getMyDemands({ status: activeStatus === 'all' ? undefined : activeStatus })
      .then((page) => {
        if (!ignore) setDemands(page.content)
      })
      .catch((error) => {
        if (!ignore) setDemandsError(error.message || 'Nepodařilo se načíst poptávky')
      })
      .finally(() => {
        if (!ignore) setDemandsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [isWorker, activeStatus, demandsRefreshKey])

  const loadProposals = (demandId) => {
    setProposalsLoading(true)
    setProposalsError('')

    getProposalsByDemand(demandId)
      .then((data) => setProposals(data))
      .catch((error) => setProposalsError(error.message || 'Nepodařilo se načíst návrhy'))
      .finally(() => setProposalsLoading(false))
  }

  const openProposalsModal = (demand) => {
    setSelectedDemand(demand)
    setProposals([])
    setProposalsError('')
    proposalsModalRef.current?.showModal()
    loadProposals(demand.id)
  }

  const handleAccept = (proposalId) => {
    if (!selectedDemand) return
    if (!window.confirm('Opravdu chcete přijmout tento návrh? Ostatní návrhy budou zamítnuty.')) return

    setProposalsError('')
    acceptProposal(proposalId)
      .then(() => {
        loadProposals(selectedDemand.id)
        setDemandsRefreshKey((key) => key + 1)
      })
      .catch((error) => setProposalsError(error.message || 'Návrh se nepodařilo přijmout'))
  }

  const handleReject = (proposalId) => {
    if (!selectedDemand) return
    if (!window.confirm('Opravdu chcete zamítnout tento návrh?')) return

    setProposalsError('')
    rejectProposal(proposalId)
      .then(() => {
        loadProposals(selectedDemand.id)
        setDemandsRefreshKey((key) => key + 1)
      })
      .catch((error) => setProposalsError(error.message || 'Návrh se nepodařilo zamítnout'))
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
                      to={`/garden/${garden.id}`}
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

            {!isWorker && (
              <div className="demand-list demand-list--embedded">
                <header className="demand-list__header">
                  <h3 className="demand-list__title h3">Seznam poptávek</h3>

                  <nav className="demand-list__filters" aria-label="Filtr stavu poptávek">
                    {gardenDemandStatuses.map((filter) => (
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

                {demandsLoading && <p>Načítání…</p>}
                {!demandsLoading && demandsError && <p className="field__error">{demandsError}</p>}
                {!demandsLoading && !demandsError && demands.length === 0 && <p>Žádné poptávky nenalezeny</p>}

                {!demandsLoading && !demandsError && demands.length > 0 && (
                  <ul className="demand-list__items">
                    {demands.map((demand) => (
                      <li className="demand-list__item" key={demand.id}>
                        <DemandCard
                          gardenName={demand.gardenName}
                          descriptionPreview={demand.descriptionPreview}
                          desiredDate={demand.desiredDate}
                          status={{ key: STATUS_CHIP_KEYS[demand.status], label: STATUS_LABELS[demand.status] }}
                          onClick={() => openProposalsModal(demand)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      <ProposalsModal
        ref={proposalsModalRef}
        demand={selectedDemand}
        proposals={proposals}
        isLoading={proposalsLoading}
        error={proposalsError}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  )
}
