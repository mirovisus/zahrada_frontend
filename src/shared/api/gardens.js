import { apiRequest } from './client'

export function getGardens(page = 0, size = 10) {
  return apiRequest(`/api/gardens?page=${page}&size=${size}`)
}

export function getGarden(id) {
  return apiRequest(`/api/gardens/${id}`)
}

export function createGarden(data) {
  return apiRequest('/api/gardens', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateGarden(id, data) {
  return apiRequest(`/api/gardens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteGarden(id) {
  return apiRequest(`/api/gardens/${id}`, {
    method: 'DELETE',
  })
}

export function uploadGardenPhoto(id, file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest(`/api/gardens/${id}/photo`, {
    method: 'POST',
    body: formData,
  })
}

export function deleteGardenPhoto(id) {
  return apiRequest(`/api/gardens/${id}/photo`, {
    method: 'DELETE',
  })
}
