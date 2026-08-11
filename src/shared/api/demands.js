import { apiRequest } from './client'

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item))
    } else {
      searchParams.append(key, value)
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

let urgenciesCache = null

export function getUrgencies() {
  if (!urgenciesCache) {
    urgenciesCache = apiRequest('/api/demands/urgencies').catch((err) => {
      urgenciesCache = null
      throw err
    })
  }
  return urgenciesCache
}

export function getCatalog(params = {}) {
  return apiRequest(`/api/demands/catalog${buildQuery(params)}`)
}

export function getMyDemands(params = {}) {
  return apiRequest(`/api/demands${buildQuery(params)}`)
}

export function getDemandsByGarden(gardenId, params = {}) {
  return apiRequest(`/api/gardens/${gardenId}/demands${buildQuery(params)}`)
}

export function getDemand(id) {
  return apiRequest(`/api/demands/${id}`)
}

export function createDemand(gardenId, data) {
  return apiRequest(`/api/gardens/${gardenId}/demands`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateDemand(id, data) {
  return apiRequest(`/api/demands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteDemand(id) {
  return apiRequest(`/api/demands/${id}`, {
    method: 'DELETE',
  })
}

export function payDemand(id) {
  return apiRequest(`/api/demands/${id}/pay`, {
    method: 'POST',
  })
}

export function acceptWork(id, data) {
  return apiRequest(`/api/demands/${id}/accept-work`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
