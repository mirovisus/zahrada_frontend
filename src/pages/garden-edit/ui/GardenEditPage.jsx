import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GardenForm } from '../../../features/garden-form'
import { DemandModal } from '../../../features/demand-modal'
import { DemandCard, gardenDemandStatuses } from '../../../entities/demand'
import { Chip } from '../../../shared/ui/chip'
import { Button } from '../../../shared/ui/button'
import { useToast } from '../../../shared/ui/toast'
import {
  getGarden,
  updateGarden,
  deleteGarden,
  uploadGardenPhoto,
  deleteGardenPhoto,
} from '../../../shared/api/gardens'
import {
  getDemandsByGarden,
  getDemand,
  createDemand,
  updateDemand,
  deleteDemand,
  getUrgencies,
} from '../../../shared/api/demands'
import { getServiceTypes } from '../../../shared/api/serviceTypes'

export function GardenEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const gardenId = Number(id)

  const [garden, setGarden] = useState(null)
  const [gardenLoading, setGardenLoading] = useState(true)
  const [gardenError, setGardenError] = useState('')

  const [activeStatus, setActiveStatus] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)

  const [demands, setDemands] = useState([])
  const [demandsLoading, setDemandsLoading] = useState(true)
  const [demandsError, setDemandsError] = useState('')

  const [serviceTypes, setServiceTypes] = useState([])
  const [urgencies, setUrgencies] = useState([])

  const [editingDemandId, setEditingDemandId] = useState(null)
  const [editingDemand, setEditingDemand] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  const createModalRef = useRef(null)
  const editModalRef = useRef(null)

  const SERVICE_OPTIONS = serviceTypes.map((serviceType) => ({ value: serviceType.id, label: serviceType.name }))
  const URGENCY_OPTIONS = urgencies.map((urgency) => ({ value: urgency.id, label: urgency.label }))

  useEffect(() => {
    let ignore = false

    setGardenLoading(true)
    setGardenError('')

    getGarden(gardenId)
      .then((data) => {
        if (!ignore) setGarden(data)
      })
      .catch((err) => {
        if (!ignore) setGardenError(err.message || 'Nepodařilo se načíst zahradu')
      })
      .finally(() => {
        if (!ignore) setGardenLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [gardenId])

  useEffect(() => {
    let ignore = false

    getServiceTypes()
      .then((data) => {
        if (!ignore) setServiceTypes(data)
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    getUrgencies()
      .then((data) => {
        if (!ignore) setUrgencies(data)
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    setDemandsLoading(true)
    setDemandsError('')

    const status = activeStatus === 'all' ? undefined : activeStatus

    getDemandsByGarden(gardenId, { status })
      .then((page) => {
        if (ignore) return
        // backend endpoint doesn't filter by status yet, filter client-side as a safety net
        const content = status ? page.content.filter((demand) => demand.status === status) : page.content
        setDemands(content)
      })
      .catch((err) => {
        if (!ignore) setDemandsError(err.message || 'Nepodařilo se načíst poptávky')
      })
      .finally(() => {
        if (!ignore) setDemandsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [gardenId, activeStatus, refreshKey])

  const editModalInitialValues = useMemo(() => {
    if (!editingDemand) return undefined
    return {
      title: editingDemand.title,
      description: editingDemand.description,
      urgency: editingDemand.urgency,
      services: editingDemand.serviceTypeNames
        .map((name) => SERVICE_OPTIONS.find((option) => option.label === name))
        .filter(Boolean),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDemand, serviceTypes])

  const handleGardenSubmit = async (values) => {
    const updated = await updateGarden(gardenId, {
      gardenName: values.gardenName,
      areaSqm: Number(values.areaSqm),
      city: values.city,
      street: values.street,
      houseNumber: values.houseNumber,
      postalCode: values.postalCode,
    })
    setGarden(updated)
  }

  const handleUploadPhoto = (file) =>
    uploadGardenPhoto(gardenId, file).then((updated) => {
      setGarden(updated)
    })

  const handleDeletePhoto = () =>
    deleteGardenPhoto(gardenId).then(() => {
      setGarden((prev) => (prev ? { ...prev, mainPhotoUrl: null } : prev))
    })

  const handleGardenDelete = () => {
    if (!window.confirm('Opravdu chcete smazat tuto zahradu?')) return

    deleteGarden(gardenId)
      .then(() => {
        toast.success('Zahrada smazána')
        navigate('/profile')
      })
      .catch((err) => {
        const message = err.message || 'Nepodařilo se smazat zahradu'
        setGardenError(message)
        toast.error(message)
      })
  }

  const handleCreateDemand = (values) => {
    setModalError('')

    return createDemand(gardenId, {
      title: values.title,
      serviceTypeIds: values.services.map((service) => service.value),
      description: values.description,
      urgency: values.urgency,
    })
      .then(() => {
        createModalRef.current?.close()
        setRefreshKey((key) => key + 1)
        toast.success('Poptávka vytvořena')
        return true
      })
      .catch((err) => {
        const message = err.message || 'Nepodařilo se vytvořit poptávku'
        setModalError(message)
        toast.error(message)
        return false
      })
  }

  const handleEditDemand = (values) => {
    if (!editingDemandId) return false
    setModalError('')

    return updateDemand(editingDemandId, {
      title: values.title,
      serviceTypeIds: values.services.map((service) => service.value),
      description: values.description,
      urgency: values.urgency,
    })
      .then(() => {
        editModalRef.current?.close()
        setRefreshKey((key) => key + 1)
        toast.success('Poptávka uložena')
        return true
      })
      .catch((err) => {
        const message = err.message || 'Nepodařilo se uložit poptávku'
        setModalError(message)
        toast.error(message)
        return false
      })
  }

  const handleDeleteDemand = () => {
    if (!editingDemandId) return
    if (!window.confirm('Opravdu chcete smazat tuto poptávku?')) return

    setModalError('')

    deleteDemand(editingDemandId)
      .then(() => {
        editModalRef.current?.close()
        setRefreshKey((key) => key + 1)
        toast.success('Poptávka smazána')
      })
      .catch((err) => {
        const message = err.message || 'Nepodařilo se smazat poptávku'
        setModalError(message)
        toast.error(message)
      })
  }

  const openEditModal = (demandId) => {
    setEditingDemandId(demandId)
    setEditingDemand(null)
    setModalError('')
    setDetailLoading(true)
    editModalRef.current?.showModal()

    getDemand(demandId)
      .then((data) => setEditingDemand(data))
      .catch((err) => setModalError(err.message || 'Nepodařilo se načíst poptávku'))
      .finally(() => setDetailLoading(false))
  }

  const openCreateModal = () => {
    setModalError('')
    createModalRef.current?.showModal()
  }

  return (
    <>
      <main className="content">
        <section className="section container">
          {gardenLoading && <p>Načítání…</p>}
          {!gardenLoading && gardenError && <p className="field__error">{gardenError}</p>}
          {!gardenLoading && !gardenError && garden && (
            <GardenForm
              mode="edit"
              initialValues={garden}
              onSubmit={handleGardenSubmit}
              onDelete={handleGardenDelete}
              onUploadPhoto={handleUploadPhoto}
              onDeletePhoto={handleDeletePhoto}
            />
          )}
        </section>

        <section className="section container">
          <div className="demand-list">
            <header className="demand-list__header">
              <h2 className="demand-list__title h3">Poptávky</h2>

              <nav className="demand-list__filters">
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
                      urgencyLabel={demand.urgencyLabel}
                      onClick={() => openEditModal(demand.id)}
                    />
                  </li>
                ))}
              </ul>
            )}

            <div className="demand-list__footer">
              <Button variant="green" onClick={openCreateModal}>
                Vytvořit novou poptávku
              </Button>
            </div>
          </div>
        </section>
      </main>

      <DemandModal
        ref={createModalRef}
        mode="create"
        garden={garden}
        serviceOptions={SERVICE_OPTIONS}
        urgencyOptions={URGENCY_OPTIONS}
        error={modalError}
        onSubmit={handleCreateDemand}
      />

      <DemandModal
        ref={editModalRef}
        mode="edit"
        garden={editingDemand?.garden}
        serviceOptions={SERVICE_OPTIONS}
        urgencyOptions={URGENCY_OPTIONS}
        initialValues={editModalInitialValues}
        hasProposals={editingDemand?.hasProposals ?? false}
        isLoading={detailLoading}
        error={modalError}
        onSubmit={handleEditDemand}
        onDelete={handleDeleteDemand}
      />
    </>
  )
}
