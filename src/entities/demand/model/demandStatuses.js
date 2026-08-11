export const gardenDemandStatuses = [
  { value: 'all', label: 'Vše' },
  { value: 'NOVA', label: 'Nová' },
  { value: 'SCHVALENA', label: 'Schválena' },
  { value: 'CEKA_NA_PLATBU', label: 'Čeká na platbu' },
  { value: 'ZAPLACENA', label: 'Zaplacena' },
  { value: 'PRACE_DOKONCENY', label: 'Práce dokončeny' },
  { value: 'PRACE_SCHVALENY', label: 'Práce schváleny' },
  { value: 'ZRUSENA', label: 'Zrušena' },
]

export const demandStatusLabels = gardenDemandStatuses.reduce((labels, filter) => {
  if (filter.value !== 'all') labels[filter.value] = filter.label
  return labels
}, {})

// mapuje DemandStatus na modifikátor chipu definovaný v _chip.scss (chip--nova, chip--schvalena, ...)
export const demandStatusChipKeys = {
  NOVA: 'nova',
  SCHVALENA: 'schvalena',
  CEKA_NA_PLATBU: 'ceka-na-platbu',
  ZAPLACENA: 'zaplaceno',
  PRACE_DOKONCENY: 'dokonceno',
  PRACE_SCHVALENY: 'dokonceno',
  ZRUSENA: 'zruseno',
}
