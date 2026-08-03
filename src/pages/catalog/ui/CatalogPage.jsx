import { useEffect, useRef, useState } from 'react'
import { FilterBox } from '../../../features/catalog-filters'
import { OfferModal } from '../../../features/create-proposal'
import { DemandCard } from '../../../entities/demand'
import { Chip } from '../../../shared/ui/chip'
import { Pagination } from '../../../shared/ui/pagination'
import { cities } from '../../../shared/api/mock'
import { getCatalog, getDemand } from '../../../shared/api/demands'
import { getServiceTypes } from '../../../shared/api/serviceTypes'
import { createProposal } from '../../../shared/api/proposals'
import { useToast } from '../../../shared/ui/toast'
import { useAuth } from '../../../shared/auth'

const CITY_OPTIONS = cities.map((city) => ({ value: city.name, label: city.name }))

const emptyFilters = { city: [], serviceTypeIds: [] }

function findLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? value
}

export function CatalogPage() {
  const { isAuthenticated, user } = useAuth()
  const toast = useToast()
  const viewerRole = isAuthenticated ? user?.role : 'GUEST'

  const [filters, setFilters] = useState(emptyFilters)
  const [currentPage, setCurrentPage] = useState(1)

  const [serviceTypes, setServiceTypes] = useState([])
  const SERVICE_TYPE_OPTIONS = serviceTypes.map((serviceType) => ({
    value: serviceType.id,
    label: serviceType.name,
  }))

  const [demands, setDemands] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedDemandId, setSelectedDemandId] = useState(null)
  const [demandDetail, setDemandDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const offerModalRef = useRef(null)

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

    setIsLoading(true)
    setError('')

    getCatalog({
      city: filters.city,
      serviceTypeIds: filters.serviceTypeIds,
      page: currentPage - 1,
    })
      .then((page) => {
        if (ignore) return
        setDemands(page.content)
        setTotalPages(page.totalPages)
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Nepodařilo se načíst poptávky')
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [filters, currentPage])

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const current = prev[category]
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      return { ...prev, [category]: next }
    })
    setCurrentPage(1)
  }

  const activeChips = [
    ...filters.city.map((value) => ({ category: 'city', value, label: findLabel(CITY_OPTIONS, value) })),
    ...filters.serviceTypeIds.map((value) => ({
      category: 'serviceTypeIds',
      value,
      label: findLabel(SERVICE_TYPE_OPTIONS, value),
    })),
  ]

  const handleCardClick = (demandId) => {
    setSelectedDemandId(demandId)
    setDemandDetail(null)
    setModalError('')
    setDetailLoading(true)
    offerModalRef.current?.showModal()

    getDemand(demandId)
      .then((data) => setDemandDetail(data))
      .catch((err) => setModalError(err.message || 'Nepodařilo se načíst poptávku'))
      .finally(() => setDetailLoading(false))
  }

  const handleOfferSubmit = (values) => {
    if (!selectedDemandId) return false
    setModalError('')

    return createProposal(selectedDemandId, values)
      .then(() => {
        offerModalRef.current?.close()
        toast.success('Nabídka odeslána')
        return true
      })
      .catch((err) => {
        const message = err.message || 'Nabídku se nepodařilo odeslat'
        setModalError(message)
        toast.error(message)
        return false
      })
  }

  return (
    <div className="split-layout catalog container">
      <aside className="split-layout__sidebar">
        <FilterBox
          title="Město"
          items={CITY_OPTIONS}
          selectedValues={filters.city}
          onToggle={(value) => toggleFilter('city', value)}
        />

        <FilterBox
          title="Typ práce"
          items={SERVICE_TYPE_OPTIONS}
          selectedValues={filters.serviceTypeIds}
          onToggle={(value) => toggleFilter('serviceTypeIds', value)}
        />
      </aside>

      <main className="split-layout__content">
        <div className="demand-list">
          <header className="demand-list__header">
            <h1 className="demand-list__title h2">Seznam poptávek</h1>

            {activeChips.length > 0 && (
              <nav className="demand-list__filters" aria-label="Aktivní filtry">
                {activeChips.map((chip) => (
                  <Chip
                    variant="secondary"
                    key={`${chip.category}:${chip.value}`}
                    onRemove={() => toggleFilter(chip.category, chip.value)}
                    removeLabel="Odebrat filtr"
                  >
                    {chip.label}
                  </Chip>
                ))}
              </nav>
            )}
          </header>

          {isLoading && <p>Načítání…</p>}

          {!isLoading && error && <p className="field__error">{error}</p>}

          {!isLoading && !error && demands.length === 0 && <p>Žádné poptávky nenalezeny</p>}

          {!isLoading && !error && demands.length > 0 && (
            <ul className="demand-list__items">
              {demands.map((demand) => (
                <li className="demand-list__item" key={demand.id}>
                  <DemandCard
                    gardenName={demand.gardenName}
                    descriptionPreview={demand.descriptionPreview}
                    urgencyLabel={demand.urgencyLabel}
                    onClick={() => handleCardClick(demand.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !error && totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </main>

      <OfferModal
        ref={offerModalRef}
        demand={demandDetail}
        viewerRole={viewerRole}
        isLoading={detailLoading}
        error={modalError}
        onSubmit={handleOfferSubmit}
      />
    </div>
  )
}
