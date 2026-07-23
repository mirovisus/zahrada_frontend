import { useState } from 'react'
import { FilterBox } from '../../../features/catalog-filters'
import { DemandCard, mockCatalogDemands } from '../../../entities/demand'
import { Chip } from '../../../shared/ui/chip'
import { Pagination } from '../../../shared/ui/pagination'
import { cities, workTypes } from '../../../shared/api/mock'

const CITY_OPTIONS = cities.map((city) => ({ value: city.slug, label: city.name }))

const WORK_TYPE_OPTIONS = workTypes.map((workType) => ({ value: workType.slug, label: workType.name }))

const emptyFilters = { city: [], workType: [] }

function findLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? value
}

export function CatalogPage() {
  const [filters, setFilters] = useState(emptyFilters)
  const [currentPage, setCurrentPage] = useState(1)

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const current = prev[category]
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      return { ...prev, [category]: next }
    })
  }

  const activeChips = [
    ...filters.city.map((value) => ({ category: 'city', value, label: findLabel(CITY_OPTIONS, value) })),
    ...filters.workType.map((value) => ({
      category: 'workType',
      value,
      label: findLabel(WORK_TYPE_OPTIONS, value),
    })),
  ]

  const filteredDemands = mockCatalogDemands.filter((demand) => {
    const cityMatches = filters.city.length === 0 || filters.city.includes(demand.citySlug)
    const workTypeMatches =
      filters.workType.length === 0 || demand.workTypeSlugs.some((slug) => filters.workType.includes(slug))
    return cityMatches && workTypeMatches
  })

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
          items={WORK_TYPE_OPTIONS}
          selectedValues={filters.workType}
          onToggle={(value) => toggleFilter('workType', value)}
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

          <ul className="demand-list__items">
            {filteredDemands.map((demand) => (
              <li className="demand-list__item" key={demand.id}>
                <DemandCard
                  title={demand.title}
                  services={demand.services}
                  preview={demand.preview}
                  city={demand.city}
                  date={demand.date}
                />
              </li>
            ))}
          </ul>

          <Pagination currentPage={currentPage} totalPages={3} onPageChange={setCurrentPage} />
        </div>
      </main>
    </div>
  )
}
