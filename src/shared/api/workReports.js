import { apiRequest } from './client'

export function getWorkerJobs() {
  return apiRequest('/api/worker/jobs')
}

export function submitWorkReport(demandId, data) {
  return apiRequest(`/api/demands/${demandId}/work-report`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
