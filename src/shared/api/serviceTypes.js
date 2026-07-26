import { apiRequest } from './client'

export function getServiceTypes() {
  return apiRequest('/api/service-types')
}
