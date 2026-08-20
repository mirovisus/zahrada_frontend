import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GardenCard, GardenCardAdd } from '../../../entities/garden'
import { DemandCard, DemandDetails, gardenDemandStatuses, demandStatusLabels, demandStatusChipKeys } from '../../../entities/demand'
import { proposalStatusLabels, proposalStatusChipKeys, proposalStatusFilters } from '../../../entities/proposal'
import { ProposalsModal } from '../../../features/review-proposals'
import { OfferModal } from '../../../features/create-proposal'
import { WorkReportModal } from '../../../features/submit-work-report'
import { Field } from '../../../shared/ui/field'
import { Button } from '../../../shared/ui/button'
import { Divider } from '../../../shared/ui/divider'
import { Chip } from '../../../shared/ui/chip'
import { Pagination } from '../../../shared/ui/pagination'
import { CrossButton } from '../../../shared/ui/cross-button'
import { useToast } from '../../../shared/ui/toast'
import { getGardens } from '../../../shared/api/gardens'
import { getMyDemands, getDemand, acceptWork } from '../../../shared/api/demands'
import {
  getProposalsByDemand,
  getMyProposals,
  acceptProposal,
  rejectProposal,
  requestProposalChanges,
  updateProposal,
} from '../../../shared/api/proposals'
import { deleteAccount, updateOwnerProfile, updateWorkerProfile } from '../../../shared/api/profile'
import { getWorkerJobs, submitWorkReport } from '../../../shared/api/workReports'
import { normalizeFieldErrors } from '../../../shared/api/client'
import { useAuth } from '../../../shared/auth'
import { useConfirm } from '../../../shared/ui/confirm'

const STATUS_LABELS = demandStatusLabels
const STATUS_CHIP_KEYS = demandStatusChipKeys

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
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [values, setValues] = useState(() => buildProfileValues(profile))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
      toast.success('Uloženo')
    } catch (error) {
      if (error.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...normalizeFieldErrors(error.fieldErrors) }))
      }
      const message = error.message || 'Uložení profilu se nezdařilo'
      setServerError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    const ok = await confirm({
      title: 'Smazat účet',
      message: 'Opravdu chcete smazat svůj účet? Tato akce je nevratná a všechna vaše data budou odstraněna.',
      confirmLabel: 'Smazat účet',
      variant: 'danger',
    })
    if (!ok) return

    setIsDeleting(true)
    deleteAccount()
      .then(() => {
        toast.success('Účet byl smazán')
        logout()
        navigate('/')
      })
      .catch((error) => {
        toast.error(error.message || 'Smazání účtu se nezdařilo')
      })
      .finally(() => setIsDeleting(false))
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
          {isWorker && (
            <p className="profile-card__rating">
              {profile.averageRating != null ? `★ ${profile.averageRating.toFixed(1)}` : 'Zatím bez hodnocení'}
            </p>
          )}
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
          <Button variant="delete" type="button" onClick={handleDeleteAccount} disabled={isDeleting}>
            {isDeleting ? 'Mazání…' : 'Smazat účet'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Detail poptávky, na kterou zahradník podal nabídku, + jeho vlastní nabídka (bez formuláře odezvy)
const MyProposalDetailModal = forwardRef(function MyProposalDetailModal(
  { demand, proposal, isLoading = false, error = '', onEdit },
  ref,
) {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close()
    }
  }

  const handleCloseClick = (event) => {
    event.currentTarget.closest('dialog')?.close()
  }

  return (
    <dialog className="offer-modal" ref={ref} onClick={handleBackdropClick}>
      <div className="offer-modal__header">
        <div className="offer-modal__spacer" />
        <CrossButton className="offer-modal__close" label="Zavřít" onClick={handleCloseClick} />
      </div>

      {isLoading && <p>Načítání…</p>}
      {!isLoading && error && <p className="field__error">{error}</p>}

      {!isLoading && !error && demand && proposal && (
        <div className="offer-modal__layout">
          <div className="offer-modal__aside">
            <DemandDetails demand={demand} />
          </div>

          <div className="offer-modal__content">
            <h3 className="offer-modal__subtitle h3">Moje nabídka</h3>

            <div className="card__header">
              <Chip variant="status" status={proposalStatusChipKeys[proposal.status]}>
                {proposalStatusLabels[proposal.status] ?? proposal.status}
              </Chip>
            </div>

            <p className="card__price">{proposal.price} Kč</p>

            {proposal.description && <p className="offer-modal__text">{proposal.description}</p>}

            {proposal.status === 'UPRAVY_POZADOVANY' && proposal.comments?.length > 0 && (
              <>
                <h4 className="offer-modal__subtitle h4">Komentáře vlastníka</h4>
                {[...proposal.comments].reverse().map((comment, index) => (
                  <p className="offer-modal__text" key={index}>
                    {comment.text}{' '}
                    <small>({new Date(comment.createdAt).toLocaleDateString('cs-CZ')})</small>
                  </p>
                ))}
              </>
            )}

            {proposal.status === 'UPRAVY_POZADOVANY' && (
              <Button type="button" onClick={() => onEdit?.(proposal)}>
                Upravit návrh
              </Button>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
})

export function ProfilePage() {
  const { user, profile, profileLoading, refreshProfile } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()
  const isWorker = user?.role === 'WORKER'

  const [activeStatus, setActiveStatus] = useState('all')
  const [demandsRefreshKey, setDemandsRefreshKey] = useState(0)

  const [gardens, setGardens] = useState([])
  const [gardensLoading, setGardensLoading] = useState(true)
  const [gardensError, setGardensError] = useState('')

  const [demands, setDemands] = useState([])
  const [demandsLoading, setDemandsLoading] = useState(true)
  const [demandsLoadedOnce, setDemandsLoadedOnce] = useState(false)
  const [demandsError, setDemandsError] = useState('')

  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState('')

  const [selectedJob, setSelectedJob] = useState(null)
  const [reportError, setReportError] = useState('')
  const [reportFieldErrors, setReportFieldErrors] = useState({})
  const workReportModalRef = useRef(null)

  const [myProposalsPage, setMyProposalsPage] = useState(1)
  const [myProposalStatus, setMyProposalStatus] = useState('all')
  const [myProposals, setMyProposals] = useState([])
  const [myProposalsTotalPages, setMyProposalsTotalPages] = useState(0)
  const [myProposalsLoading, setMyProposalsLoading] = useState(true)
  const [myProposalsLoadedOnce, setMyProposalsLoadedOnce] = useState(false)
  const [myProposalsError, setMyProposalsError] = useState('')

  const [selectedProposal, setSelectedProposal] = useState(null)
  const [selectedProposalDemand, setSelectedProposalDemand] = useState(null)
  const [proposalDetailLoading, setProposalDetailLoading] = useState(false)
  const [proposalDetailError, setProposalDetailError] = useState('')
  const myProposalModalRef = useRef(null)

  const [editingProposal, setEditingProposal] = useState(null)
  const [editModalError, setEditModalError] = useState('')
  const [editServerFieldErrors, setEditServerFieldErrors] = useState({})
  const editProposalModalRef = useRef(null)

  const editInitialValues = useMemo(
    () =>
      editingProposal
        ? { price: String(editingProposal.price ?? ''), description: editingProposal.description ?? '' }
        : { price: '', description: '' },
    [editingProposal],
  )

  const [selectedDemand, setSelectedDemand] = useState(null)
  const [proposals, setProposals] = useState([])
  const [proposalsLoading, setProposalsLoading] = useState(false)
  const [proposalsError, setProposalsError] = useState('')
  const [acceptWorkError, setAcceptWorkError] = useState('')
  const [acceptWorkFieldErrors, setAcceptWorkFieldErrors] = useState({})
  const proposalsModalRef = useRef(null)

  useEffect(() => {
    if (isWorker) return undefined
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
  }, [isWorker])

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
        if (!ignore) {
          setDemandsLoading(false)
          setDemandsLoadedOnce(true)
        }
      })

    return () => {
      ignore = true
    }
  }, [isWorker, activeStatus, demandsRefreshKey])

  const demandsShowContent = demandsLoadedOnce || !demandsLoading
  const demandsRefreshing = demandsLoading && demandsLoadedOnce

  useEffect(() => {
    if (!isWorker) return undefined
    let ignore = false

    setMyProposalsLoading(true)
    setMyProposalsError('')

    const status = myProposalStatus === 'all' ? undefined : myProposalStatus

    getMyProposals({ page: myProposalsPage - 1, size: 9, status })
      .then((page) => {
        if (ignore) return
        // backend endpoint /api/proposals/my nemá parametr status, filtrujeme na klientu jako pojistku
        const content = status ? page.content.filter((proposal) => proposal.status === status) : page.content
        setMyProposals(content)
        setMyProposalsTotalPages(page.totalPages)
      })
      .catch((error) => {
        if (!ignore) setMyProposalsError(error.message || 'Nepodařilo se načíst nabídky')
      })
      .finally(() => {
        if (!ignore) {
          setMyProposalsLoading(false)
          setMyProposalsLoadedOnce(true)
        }
      })

    return () => {
      ignore = true
    }
  }, [isWorker, myProposalsPage, myProposalStatus])

  const myProposalsShowContent = myProposalsLoadedOnce || !myProposalsLoading
  const myProposalsRefreshing = myProposalsLoading && myProposalsLoadedOnce

  useEffect(() => {
    if (!isWorker) return undefined
    let ignore = false

    setJobsLoading(true)
    setJobsError('')

    getWorkerJobs()
      .then((data) => {
        if (!ignore) setJobs(data)
      })
      .catch((error) => {
        if (!ignore) setJobsError(error.message || 'Nepodařilo se načíst zakázky')
      })
      .finally(() => {
        if (!ignore) setJobsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [isWorker])

  const openJobModal = (job) => {
    setSelectedJob(job)
    setReportError('')
    setReportFieldErrors({})
    workReportModalRef.current?.showModal()
  }

  const handleSubmitReport = (values) => {
    if (!selectedJob) return Promise.resolve(false)
    setReportError('')
    setReportFieldErrors({})

    return submitWorkReport(selectedJob.demandId, values)
      .then(() => {
        workReportModalRef.current?.close()
        toast.success('Report byl odeslán')
        setJobs((prev) =>
          prev.map((job) =>
            job.demandId === selectedJob.demandId
              ? { ...job, status: 'PRACE_DOKONCENY', reportSubmitted: true }
              : job,
          ),
        )
        return true
      })
      .catch((error) => {
        if (error.fieldErrors) setReportFieldErrors(normalizeFieldErrors(error.fieldErrors))
        const message = error.message || 'Report se nepodařilo odeslat'
        setReportError(message)
        toast.error(message)
        return false
      })
  }

  const handleMyProposalStatusChange = (value) => {
    setMyProposalStatus(value)
    setMyProposalsPage(1)
  }

  const openMyProposalModal = (proposal) => {
    setSelectedProposal(proposal)
    setSelectedProposalDemand(null)
    setProposalDetailError('')
    setProposalDetailLoading(true)
    myProposalModalRef.current?.showModal()

    getDemand(proposal.demandId)
      .then((data) => setSelectedProposalDemand(data))
      .catch((error) => setProposalDetailError(error.message || 'Nepodařilo se načíst poptávku'))
      .finally(() => setProposalDetailLoading(false))
  }

  const openEditProposal = (proposal) => {
    myProposalModalRef.current?.close()
    setEditingProposal(proposal)
    setEditModalError('')
    setEditServerFieldErrors({})
    editProposalModalRef.current?.showModal()
  }

  const handleProposalEditSubmit = (values) => {
    if (!editingProposal) return false
    setEditModalError('')
    setEditServerFieldErrors({})

    return updateProposal(editingProposal.id, values)
      .then((updated) => {
        editProposalModalRef.current?.close()
        toast.success('Návrh byl upraven')
        setMyProposals((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        if (selectedProposal?.id === updated.id) setSelectedProposal(updated)
        return true
      })
      .catch((error) => {
        if (error.fieldErrors) setEditServerFieldErrors(normalizeFieldErrors(error.fieldErrors))
        const message = error.message || 'Návrh se nepodařilo upravit'
        setEditModalError(message)
        toast.error(message)
        return false
      })
  }

  const loadProposals = (demandId) => {
    setProposalsLoading(true)
    setProposalsError('')

    getProposalsByDemand(demandId)
      .then((data) => setProposals(data))
      .catch((error) => setProposalsError(error.message || 'Nepodařilo se načíst návrhy'))
      .finally(() => setProposalsLoading(false))
  }

  const loadDemandDetail = (demandId) => {
    getDemand(demandId)
      .then((data) => setSelectedDemand((prev) => (prev ? { ...prev, ...data } : data)))
      .catch(() => {})
  }

  const openProposalsModal = (demand) => {
    setSelectedDemand(demand)
    setProposals([])
    setProposalsError('')
    setAcceptWorkError('')
    setAcceptWorkFieldErrors({})
    proposalsModalRef.current?.showModal()
    loadProposals(demand.id)
    loadDemandDetail(demand.id)
  }

  const handleAccept = async (proposalId) => {
    if (!selectedDemand) return
    const ok = await confirm({
      title: 'Přijmout návrh',
      message: 'Opravdu chcete přijmout tento návrh? Ostatní návrhy budou zamítnuty.',
      confirmLabel: 'Přijmout',
      variant: 'default',
    })
    if (!ok) return

    setProposalsError('')
    acceptProposal(proposalId)
      .then(() => {
        loadProposals(selectedDemand.id)
        setDemandsRefreshKey((key) => key + 1)
        toast.success('Nabídka přijata')
      })
      .catch((error) => {
        const message = error.message || 'Návrh se nepodařilo přijmout'
        setProposalsError(message)
        toast.error(message)
      })
  }

  const handleReject = async (proposalId) => {
    if (!selectedDemand) return
    const ok = await confirm({
      title: 'Zamítnout návrh',
      message: 'Opravdu chcete zamítnout tento návrh?',
      confirmLabel: 'Zamítnout',
      variant: 'danger',
    })
    if (!ok) return

    setProposalsError('')
    rejectProposal(proposalId)
      .then(() => {
        loadProposals(selectedDemand.id)
        setDemandsRefreshKey((key) => key + 1)
        toast.success('Nabídka zamítnuta')
      })
      .catch((error) => {
        const message = error.message || 'Návrh se nepodařilo zamítnout'
        setProposalsError(message)
        toast.error(message)
      })
  }

  const handleRequestChanges = (proposalId, comment) => {
    if (!selectedDemand) return Promise.reject(new Error('Poptávka nenalezena'))

    return requestProposalChanges(proposalId, { comment })
      .then(() => {
        loadProposals(selectedDemand.id)
        toast.success('Žádost o úpravy byla odeslána')
      })
      .catch((error) => {
        toast.error(error.message || 'Žádost o úpravy se nepodařila')
        throw error
      })
  }

  const handleAcceptWork = (values) => {
    if (!selectedDemand) return Promise.resolve(false)
    setAcceptWorkError('')
    setAcceptWorkFieldErrors({})

    return acceptWork(selectedDemand.id, values)
      .then((updated) => {
        setSelectedDemand((prev) => (prev ? { ...prev, ...updated } : updated))
        setDemandsRefreshKey((key) => key + 1)
        toast.success('Práce byla přijata a ohodnocena')
        return true
      })
      .catch((error) => {
        if (error.fieldErrors) setAcceptWorkFieldErrors(normalizeFieldErrors(error.fieldErrors))
        const message = error.message || 'Práci se nepodařilo přijmout'
        setAcceptWorkError(message)
        toast.error(message)
        return false
      })
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

          {!isWorker && (
            <section className="gardens">
              <h2 className="gardens__title h3">Moje zahrady:</h2>

              {gardensLoading && <p>Načítání zahrad…</p>}
              {gardensError && <p className="field__error">{gardensError}</p>}

              {!gardensLoading && !gardensError && (
                <ul className="gardens__list grid grid--3">
                  {gardens.map((garden) => (
                    <li className="gardens__item" key={garden.id}>
                      <GardenCard
                        id={garden.id}
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

                <div className="demand-list__body">
                  <div className={`demand-list__content${demandsRefreshing ? ' demand-list__content--loading' : ''}`}>
                    {!demandsShowContent && <p>Načítání…</p>}
                    {demandsShowContent && demandsError && <p className="field__error">{demandsError}</p>}
                    {demandsShowContent && !demandsError && demands.length === 0 && <p>Žádné poptávky nenalezeny</p>}

                    {demandsShowContent && !demandsError && demands.length > 0 && (
                      <ul className="demand-list__items">
                        {demands.map((demand) => (
                          <li className="demand-list__item" key={demand.id}>
                            <DemandCard
                              gardenName={demand.gardenName}
                              descriptionPreview={demand.descriptionPreview}
                              urgencyLabel={demand.urgencyLabel}
                              status={{ key: STATUS_CHIP_KEYS[demand.status], label: STATUS_LABELS[demand.status] }}
                              onClick={() => openProposalsModal(demand)}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {demandsRefreshing && <span className="demand-list__spinner" aria-hidden="true" />}
                </div>
              </div>
            </section>
          )}

          {isWorker && (
            <div className="demand-list">
              <header className="demand-list__header">
                <h2 className="demand-list__title h3">Moje zakázky</h2>
              </header>

              {jobsLoading && <p>Načítání…</p>}
              {!jobsLoading && jobsError && <p className="field__error">{jobsError}</p>}
              {!jobsLoading && !jobsError && jobs.length === 0 && <p>Zatím nemáte žádné aktivní zakázky</p>}

              {!jobsLoading && !jobsError && jobs.length > 0 && (
                <ul className="demand-list__items">
                  {jobs.map((job) => (
                    <li className="demand-list__item" key={job.demandId}>
                      <DemandCard
                        title={job.title}
                        price={job.price}
                        city={[job.garden?.gardenName, job.garden?.city].filter(Boolean).join(', ')}
                        urgencyLabel={new Date(job.createdAt).toLocaleDateString('cs-CZ')}
                        status={{ key: STATUS_CHIP_KEYS[job.status], label: STATUS_LABELS[job.status] }}
                        onClick={() => openJobModal(job)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {isWorker && (
            <div className="demand-list">
              <header className="demand-list__header">
                <h2 className="demand-list__title h3">Moje nabídky</h2>

                <nav className="demand-list__filters" aria-label="Filtr stavu nabídek">
                  {proposalStatusFilters.map((filter) => (
                    <Chip
                      key={filter.value}
                      as="button"
                      variant={myProposalStatus === filter.value ? 'active' : undefined}
                      aria-pressed={myProposalStatus === filter.value}
                      onClick={() => handleMyProposalStatusChange(filter.value)}
                    >
                      {filter.label}
                    </Chip>
                  ))}
                </nav>
              </header>

              <div className="demand-list__body">
                <div className={`demand-list__content${myProposalsRefreshing ? ' demand-list__content--loading' : ''}`}>
                  {!myProposalsShowContent && <p>Načítání…</p>}
                  {myProposalsShowContent && myProposalsError && <p className="field__error">{myProposalsError}</p>}
                  {myProposalsShowContent && !myProposalsError && myProposals.length === 0 && (
                    <p>{myProposalStatus === 'all' ? 'Zatím jste nepodali žádnou nabídku' : 'Žádné nabídky nenalezeny'}</p>
                  )}

                  {myProposalsShowContent && !myProposalsError && myProposals.length > 0 && (
                    <ul className="demand-list__items">
                      {myProposals.map((proposal) => (
                        <li className="demand-list__item" key={proposal.id}>
                          {/* proposal nemá vlastní kartu - vlastnosti se mapují na existující demand-card sloty (cena -> title, datum -> urgencyLabel) */}
                          <DemandCard
                            title={`${proposal.price} Kč`}
                            descriptionPreview={proposal.description}
                            urgencyLabel={new Date(proposal.createdAt).toLocaleDateString('cs-CZ')}
                            status={{
                              key: proposalStatusChipKeys[proposal.status],
                              label: proposalStatusLabels[proposal.status] ?? proposal.status,
                            }}
                            onClick={() => openMyProposalModal(proposal)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {myProposalsRefreshing && <span className="demand-list__spinner" aria-hidden="true" />}
              </div>

              {myProposalsShowContent && !myProposalsError && myProposalsTotalPages > 1 && (
                <Pagination
                  className="demand-list__footer"
                  currentPage={myProposalsPage}
                  totalPages={myProposalsTotalPages}
                  onPageChange={setMyProposalsPage}
                />
              )}
            </div>
          )}
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
        onRequestChanges={handleRequestChanges}
        onAcceptWork={handleAcceptWork}
        acceptWorkError={acceptWorkError}
        acceptWorkFieldErrors={acceptWorkFieldErrors}
      />

      <MyProposalDetailModal
        ref={myProposalModalRef}
        demand={selectedProposalDemand}
        proposal={selectedProposal}
        isLoading={proposalDetailLoading}
        error={proposalDetailError}
        onEdit={openEditProposal}
      />

      <OfferModal
        ref={editProposalModalRef}
        demand={selectedProposalDemand}
        viewerRole="WORKER"
        error={editModalError}
        onSubmit={handleProposalEditSubmit}
        initialValues={editInitialValues}
        serverFieldErrors={editServerFieldErrors}
        title="Upravit návrh"
        submitLabel="Uložit"
      />

      <WorkReportModal
        ref={workReportModalRef}
        job={selectedJob}
        error={reportError}
        serverFieldErrors={reportFieldErrors}
        onSubmit={handleSubmitReport}
      />
    </>
  )
}
