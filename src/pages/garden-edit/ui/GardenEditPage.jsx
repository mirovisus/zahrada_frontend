import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GardenForm } from '../../../features/garden-form'
import { DemandModal } from '../../../features/demand-modal'
import { DemandCard, gardenDemandStatuses } from '../../../entities/demand'
import { Chip } from '../../../shared/ui/chip'
import { Button } from '../../../shared/ui/button'
import { getGarden, updateGarden, deleteGarden } from '../../../shared/api/gardens'
import { getMyDemands, getDemand, createDemand, updateDemand, deleteDemand } from '../../../shared/api/demands'
import { getServiceTypes } from '../../../shared/api/serviceTypes'

export function GardenEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
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

  const [editingDemandId, setEditingDemandId] = useState(null)
  const [editingDemand, setEditingDemand] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  const createModalRef = useRef(null)
  const editModalRef = useRef(null)

  const SERVICE_OPTIONS = serviceTypes.map((serviceType) => ({ value: serviceType.id, label: serviceType.name }))

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

    setDemandsLoading(true)
    setDemandsError('')

    getMyDemands({ status: activeStatus === 'all' ? undefined : activeStatus })
      .then((page) => {
        if (!ignore) setDemands(page.content)
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
  }, [activeStatus, refreshKey])

  const editModalInitialValues = useMemo(() => {
    if (!editingDemand) return undefined
    return {
      title: editingDemand.title,
      description: editingDemand.description,
      dueDate: editingDemand.desiredDate,
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

  const handleGardenDelete = () => {
    if (!window.confirm('Opravdu chcete smazat tuto zahradu?')) return

    deleteGarden(gardenId)
      .then(() => navigate('/profile'))
      .catch((err) => setGardenError(err.message || 'Nepodařilo se smazat zahradu'))
  }

  const handleCreateDemand = (values) => {
    setModalError('')

    return createDemand(gardenId, {
      title: values.title,
      serviceTypeIds: values.services.map((service) => service.value),
      description: values.description,
      desiredDate: values.dueDate,
    })
      .then(() => {
        createModalRef.current?.close()
        setRefreshKey((key) => key + 1)
        return true
      })
      .catch((err) => {
        setModalError(err.message || 'Nepodařilo se vytvořit poptávku')
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
      desiredDate: values.dueDate,
    })
      .then(() => {
        editModalRef.current?.close()
        setRefreshKey((key) => key + 1)
        return true
      })
      .catch((err) => {
        setModalError(err.message || 'Nepodařilo se uložit poptávku')
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
      })
      .catch((err) => {
        setModalError(err.message || 'Nepodařilo se smazat poptávku')
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
                      desiredDate={demand.desiredDate}
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
        error={modalError}
        onSubmit={handleCreateDemand}
      />

      <DemandModal
        ref={editModalRef}
        mode="edit"
        garden={editingDemand?.garden}
        serviceOptions={SERVICE_OPTIONS}
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
