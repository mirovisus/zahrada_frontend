import { apiRequest } from './client'

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.append(key, value)
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function createProposal(demandId, data) {
  return apiRequest(`/api/demands/${demandId}/proposals`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getProposalsByDemand(demandId) {
  return apiRequest(`/api/demands/${demandId}/proposals`)
}

export function getMyProposals(params = {}) {
  return apiRequest(`/api/proposals/my${buildQuery(params)}`)
}

export function acceptProposal(id) {
  return apiRequest(`/api/proposals/${id}/accept`, {
    method: 'POST',
  })
}

export function rejectProposal(id) {
  return apiRequest(`/api/proposals/${id}/reject`, {
    method: 'POST',
  })
}

export function requestProposalChanges(id, data) {
  return apiRequest(`/api/proposals/${id}/request-changes`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProposal(id, data) {
  return apiRequest(`/api/proposals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
