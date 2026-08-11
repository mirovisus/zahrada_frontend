import { apiRequest } from './client'

export function getMyProfile() {
  return apiRequest('/api/profile')
}

export function updateOwnerProfile(data) {
  return apiRequest('/api/profile/owner', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function updateWorkerProfile(data) {
  return apiRequest('/api/profile/worker', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteAccount() {
  return apiRequest('/api/profile', {
    method: 'DELETE',
  })
}
