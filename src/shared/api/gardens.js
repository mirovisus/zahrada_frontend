import { apiRequest } from './client'

export function getGardens(page = 0, size = 10) {
  return apiRequest(`/api/gardens?page=${page}&size=${size}`)
}
