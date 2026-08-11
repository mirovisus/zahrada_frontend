export const proposalStatusLabels = {
  NOVY: 'Nový',
  SCHVALEN: 'Schválen',
  ZAMITNUT: 'Zamítnut',
  UPRAVY_POZADOVANY: 'Úpravy požadovány',
}

// mapuje ProposalStatus na modifikátor chipu definovaný v _chip.scss (chip--nova, chip--schvalena, ...)
export const proposalStatusChipKeys = {
  NOVY: 'nova',
  SCHVALEN: 'schvalena',
  ZAMITNUT: 'zruseno',
  UPRAVY_POZADOVANY: 'ceka-na-platbu',
}

export const proposalStatusFilters = [
  { value: 'all', label: 'Vše' },
  { value: 'NOVY', label: proposalStatusLabels.NOVY },
  { value: 'SCHVALEN', label: proposalStatusLabels.SCHVALEN },
  { value: 'ZAMITNUT', label: proposalStatusLabels.ZAMITNUT },
  { value: 'UPRAVY_POZADOVANY', label: proposalStatusLabels.UPRAVY_POZADOVANY },
]
