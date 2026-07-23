import { useMemo, useRef, useState } from 'react'
import { GardenForm } from '../../../features/garden-form'
import { DemandModal } from '../../../features/demand-modal'
import { DemandCard, mockGardenDemands, gardenDemandStatuses } from '../../../entities/demand'
import { mockGardens } from '../../../entities/garden'
import { Chip } from '../../../shared/ui/chip'
import { Button } from '../../../shared/ui/button'
import { services } from '../../../shared/api/mock'

const garden = mockGardens[0]

const GARDEN = {
  gardenName: garden.name,
  city: garden.city,
  street: garden.street,
  photoUrl: garden.image,
}

const GARDEN_CARD = {
  mainPhotoUrl: garden.image,
  gardenName: garden.name,
  street: garden.street,
  city: garden.city,
}

const SERVICE_OPTIONS = services.map((service) => ({ value: service.slug, label: service.name }))

export function GardenEditPage() {
  const [activeStatus, setActiveStatus] = useState('all')
  const [editingDemand, setEditingDemand] = useState(null)
  const createModalRef = useRef(null)
  const editModalRef = useRef(null)

  const filteredDemands =
    activeStatus === 'all'
      ? mockGardenDemands
      : mockGardenDemands.filter((demand) => demand.status === activeStatus)

  const editModalInitialValues = useMemo(() => {
    if (!editingDemand) return undefined
    return {
      title: editingDemand.title,
      description: editingDemand.preview,
      dueDate: editingDemand.dueDate,
      services: editingDemand.services.map((label) => ({ value: label, label })),
    }
  }, [editingDemand])

  const handleGardenSubmit = (values) => {
    console.log(values)
  }

  const handleGardenDelete = () => {
    console.log('delete garden')
  }

  const handleCreateDemand = (values) => {
    console.log(values)
    createModalRef.current?.close()
  }

  const handleEditDemand = (values) => {
    console.log(values)
    editModalRef.current?.close()
  }

  const handleDeleteDemand = () => {
    console.log('delete demand', editingDemand?.id)
    editModalRef.current?.close()
  }

  const openEditModal = (demand) => {
    setEditingDemand(demand)
    editModalRef.current?.showModal()
  }

  return (
    <>
      <main className="content">
        <section className="section container">
          <GardenForm
            mode="edit"
            initialValues={GARDEN}
            onSubmit={handleGardenSubmit}
            onDelete={handleGardenDelete}
          />
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

            <ul className="demand-list__items">
              {filteredDemands.map((demand) => (
                <li className="demand-list__item" key={demand.id}>
                  <DemandCard
                    title={demand.title}
                    services={demand.services}
                    preview={demand.preview}
                    dueDate={demand.dueDate}
                    onClick={() => openEditModal(demand)}
                  />
                </li>
              ))}
            </ul>

            <div className="demand-list__footer">
              <Button variant="green" onClick={() => createModalRef.current?.showModal()}>
                Vytvořit novou poptávku
              </Button>
            </div>
          </div>
        </section>
      </main>

      <DemandModal
        ref={createModalRef}
        mode="create"
        garden={GARDEN_CARD}
        serviceOptions={SERVICE_OPTIONS}
        onSubmit={handleCreateDemand}
      />

      <DemandModal
        ref={editModalRef}
        mode="edit"
        garden={GARDEN_CARD}
        serviceOptions={SERVICE_OPTIONS}
        initialValues={editModalInitialValues}
        onSubmit={handleEditDemand}
        onDelete={handleDeleteDemand}
      />
    </>
  )
}
