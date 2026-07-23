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

export const profileDemandStatuses = [
  { value: 'all', label: 'Vše' },
  { value: 'nova', label: 'Nová' },
  { value: 'schvalena', label: 'Schválena' },
  { value: 'ceka-na-platbu', label: 'Čeká na platbu' },
  { value: 'zaplaceno', label: 'Zaplaceno' },
  { value: 'dokonceno', label: 'Dokončeno' },
  { value: 'zruseno', label: 'Zrušeno' },
]

export const mockCatalogDemands = [
  {
    id: 1,
    title: 'Sekání trávníku',
    services: ['Sekání trávníku'],
    citySlug: 'praha',
    city: 'Praha',
    workTypeSlugs: ['travnik'],
    preview: 'Potřebuji posekat velký trávník před domem, cca 200 m²...',
    date: '2026-06-15',
  },
  {
    id: 2,
    title: 'Výsadba keřů',
    services: ['Výsadba keřů'],
    citySlug: 'hradec-kralove',
    city: 'Hradec Králové',
    workTypeSlugs: ['vysadba'],
    preview: 'Chci vysadit živý plot podél plotu, délka cca 30 m...',
    date: '2026-07-01',
  },
  {
    id: 3,
    title: 'Záhon s bylinkami',
    services: ['Údržba zahrady'],
    citySlug: 'pardubice',
    city: 'Pardubice',
    workTypeSlugs: ['udrzba'],
    preview: 'Příprava záhonu 3×2 m, osázení bylinkami dle výběru...',
    date: '2026-07-20',
  },
]

export const mockGardenDemands = [
  {
    id: 1,
    title: 'Sekání trávníku',
    services: ['Sekání trávníku'],
    preview: 'Potřebuji posekat velký trávník před domem, cca 200 m²...',
    dueDate: '2026-06-15',
    status: 'NOVA',
  },
  {
    id: 2,
    title: 'Výsadba keřů',
    services: ['Výsadba keřů'],
    preview: 'Chci vysadit živý plot podél plotu, délka cca 30 m...',
    dueDate: '2026-07-01',
    status: 'SCHVALENA',
  },
  {
    id: 3,
    title: 'Záhon s bylinkami',
    services: ['Údržba zahrady'],
    preview: 'Příprava záhonu 3×2 m, osázení bylinkami dle výběru...',
    dueDate: '2026-07-20',
    status: 'CEKA_NA_PLATBU',
  },
]

export const mockProfileDemands = [
  {
    id: 1,
    title: 'Sekání trávníku',
    services: ['Sekání trávníku', 'Údržba záhonů'],
    preview: 'Potřebuji posekat velký trávník před domem, cca 200 m²...',
    description:
      'Potřebuji posekat velký trávník před domem, cca 200 m². Trávník je poměrně zarostlý, takže bude potřeba důkladné sekání. Ideálně bych chtěl i odvoz trávy. Zahrada je přístupná z ulice, parkování přímo před domem.',
    address: 'Zahrada: Lomena 1314, Pardubice',
    city: 'Pardubice',
    date: '2026-06-15',
    status: 'ceka-na-platbu',
  },
  {
    id: 2,
    title: 'Sekání trávníku',
    services: ['Sekání trávníku', 'Údržba záhonů'],
    preview: 'Potřebuji posekat velký trávník před domem, cca 200 m²...',
    description:
      'Potřebuji posekat velký trávník před domem, cca 200 m². Trávník je poměrně zarostlý, takže bude potřeba důkladné sekání. Ideálně bych chtěl i odvoz trávy. Zahrada je přístupná z ulice, parkování přímo před domem.',
    address: 'Zahrada: Lomena 1314, Pardubice',
    city: 'Pardubice',
    date: '2026-06-15',
    status: 'ceka-na-platbu',
  },
  {
    id: 3,
    title: 'Výsadba keřů',
    services: ['Výsadba keřů'],
    preview: 'Chci vysadit živý plot podél plotu, délka cca 30 m...',
    description: 'Chci vysadit živý plot podél plotu, délka cca 30 m. Preferuji stálezelené dřeviny.',
    address: 'Zahrada: Jabloňová 27 1156, Hradec Králové',
    city: 'Hradec Králové',
    date: '2026-07-01',
    status: 'schvalena',
  },
]
