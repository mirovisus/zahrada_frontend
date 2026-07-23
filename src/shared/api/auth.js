import { apiRequest } from './client'

export function register(data) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function login(data) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
