import { apiRequest } from './client'

export function createProposal(demandId, data) {
  return apiRequest(`/api/demands/${demandId}/proposals`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getProposalsByDemand(demandId) {
  return apiRequest(`/api/demands/${demandId}/proposals`)
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
