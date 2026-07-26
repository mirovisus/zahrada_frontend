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

export function getCatalog(params = {}) {
  return apiRequest(`/api/demands/catalog${buildQuery(params)}`)
}

export function getMyDemands(params = {}) {
  return apiRequest(`/api/demands${buildQuery(params)}`)
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
