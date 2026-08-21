// Úložiště v paměti pro demo verzi. Resetuje se při každém načtení stránky.
//
// Názvy polí a tvary DTO jsou 1:1 ověřeny podle skutečného backendu
// (zahrada_backend/src/main/java/upce/fei/garden/dto/**, /controller/**).

// ---------- Generátory ID (jednoduché počítadla) ----------
const seq = (start = 1) => {
  let i = start;
  return () => i++;
};
export const nextUserId = seq(100);
export const nextGardenId = seq(1);
export const nextDemandId = seq(1);
export const nextProposalId = seq(1);
export const nextWorkReportId = seq(1);
export const nextReviewId = seq(1);

// ---------- Enumy (1:1 s backendem) ----------
export const UserRole = { OWNER: 'OWNER', WORKER: 'WORKER' };

// Životní cyklus: NOVA -> SCHVALENA -> CEKA_NA_PLATBU -> ZAPLACENA -> PRACE_DOKONCENY -> PRACE_SCHVALENY
// (nebo ZRUSENA kdykoliv) - viz CLAUDE.md / DemandService.
export const DemandStatus = {
  NOVA: 'NOVA',
  SCHVALENA: 'SCHVALENA',
  CEKA_NA_PLATBU: 'CEKA_NA_PLATBU',
  ZAPLACENA: 'ZAPLACENA',
  PRACE_DOKONCENY: 'PRACE_DOKONCENY',
  PRACE_SCHVALENY: 'PRACE_SCHVALENY',
  ZRUSENA: 'ZRUSENA',
};

export const ProposalStatus = {
  NOVY: 'NOVY',
  SCHVALEN: 'SCHVALEN',
  ZAMITNUT: 'ZAMITNUT',
  UPRAVY_POZADOVANY: 'UPRAVY_POZADOVANY',
};

// id odpovídá názvu enumu odesílanému/přijímanému jako DemandUrgency; label je český zobrazovaný text
// (odpovídá DemandUrgencyResponse { id, label } z /api/demands/urgencies).
export const DemandUrgency = {
  CO_NEJDRIVE: { id: 'CO_NEJDRIVE', label: 'Co nejdříve' },
  DO_TYDNE: { id: 'DO_TYDNE', label: 'Do týdne' },
  DO_MESICE: { id: 'DO_MESICE', label: 'Do měsíce' },
  DO_TRI_MESICU: { id: 'DO_TRI_MESICU', label: 'Do tří měsíců' },
  FLEXIBILNI: { id: 'FLEXIBILNI', label: 'Flexibilní' },
};

// ---------- Počáteční data ----------
export const db = {
  users: [
    {
      id: 1,
      email: 'jnovak@seznam.cz',
      password: 'Demo1234',
      role: UserRole.OWNER,
      firstName: 'Jan',
      lastName: 'Novák',
      phoneNumber: '+420777123456',
      avatarUrl: null,
    },
    {
      id: 2,
      email: 'petrzahr@seznam.cz',
      password: 'Demo1234',
      role: UserRole.WORKER,
      firstName: 'Petr',
      lastName: 'Zahradník',
      phoneNumber: '+420777987654',
      avatarUrl: null,
      bio: 'Zahradničím přes 10 let, specializuji se na údržbu okrasných zahrad a stříhání živých plotů.',
      averageRating: 4.5,
    },
    {
      id: 3,
      email: 'evasvobodova@seznam.cz',
      password: 'Demo1234',
      role: UserRole.OWNER,
      firstName: 'Eva',
      lastName: 'Svobodová',
      phoneNumber: '+420777222333',
      avatarUrl: null,
    },
    {
      id: 4,
      email: 'tomas@seznam.cz',
      password: 'Demo1234',
      role: UserRole.WORKER,
      firstName: 'Tomáš',
      lastName: 'Dvořák',
      phoneNumber: '+420777444555',
      avatarUrl: null,
      bio: null,
      averageRating: null,
    },
  ],

  serviceTypes: [
    { id: 1, code: 'SECENI_TRAVY', name: 'Sečení trávy' },
    { id: 2, code: 'STRIHANI_ZIVYCH_PLOTU', name: 'Stříhání živých plotů' },
    { id: 3, code: 'VYSADBA', name: 'Výsadba' },
    { id: 4, code: 'PLETI', name: 'Pletí' },
    { id: 5, code: 'PROREZAVANI_STROMU', name: 'Prořezávání stromů' },
    { id: 6, code: 'UDRZBA_ZAHRADY', name: 'Údržba zahrady' },
  ],

  // Plochá struktura odpovídá GardenDetailResponse / CreateGardenRequest / UpdateGardenRequest.
  gardens: [
    {
      id: 1,
      ownerId: 1,
      gardenName: 'Zahrada u domu',
      areaSqm: 200,
      city: 'Pardubice',
      street: 'Hlavní',
      houseNumber: '12',
      postalCode: '530 02',
      mainPhotoUrl: null,
    },
    {
      id: 2,
      ownerId: 1,
      gardenName: 'Chata Vysočina',
      areaSqm: 800,
      city: 'Jihlava',
      street: 'Lesní',
      houseNumber: '45',
      postalCode: '586 01',
      mainPhotoUrl: null,
    },
    {
      id: 3,
      ownerId: 3,
      gardenName: 'Rodinný dům Brno',
      areaSqm: 500,
      city: 'Brno',
      street: 'Květinová',
      houseNumber: '8',
      postalCode: '602 00',
      mainPhotoUrl: null,
    },
  ],

  demands: [
    // NOVA - viditelná ve veřejném katalogu, pracovníci mohou podávat nabídky
    {
      id: 1,
      gardenId: 1,
      title: 'Posekat trávník',
      description: 'Hledám spolehlivého člověka na pravidelné sekání trávníku (1000 m²) cca 1x za 14 dní během celé sezóny.',
      status: DemandStatus.NOVA,
      urgency: 'DO_TYDNE',
      serviceTypeIds: [1],
      createdAt: '2026-08-15T09:00:00Z',
    },
    {
      id: 2,
      gardenId: 2,
      title: 'Prořezat ovocné stromy',
      description: 'Potřebuji pokácet starou, uschlou jabloň a odvézt dřevo. Strom stojí dál od domu, přístup je dobrý.',
      status: DemandStatus.NOVA,
      urgency: 'FLEXIBILNI',
      serviceTypeIds: [5],
      createdAt: '2026-08-10T14:00:00Z',
    },
    {
      id: 3,
      gardenId: 3,
      title: 'Kompletní jarní údržba',
      description: 'Dobrý den, hledám spolehlivého zahradníka na kompletní jarní údržbu zahrady po zimě. Práce zahrnuje důkladné sečení a začištění trávníku, pletí a úklid všech záhonů a následnou výsadbu nových okrasných keřů. Veškerý vzniklý bioodpad je potřeba odvézt. Rozpočet je stanoven do 15 000 Kč.',
      status: DemandStatus.NOVA,
      urgency: 'CO_NEJDRIVE',
      serviceTypeIds: [1, 3, 4, 6],
      createdAt: '2026-08-18T08:30:00Z',
    },
    // SCHVALENA - nabídka přijata; toto je již aktivní stav "zakázky" pro pracovníka
    // (WorkReportService nemá samostatný krok "zahájit práci" - viz poznámka u JOB_STATUSES
    // v handlers.js), report ještě nebyl odeslán
    {
      id: 4,
      gardenId: 1,
      title: 'Stříhání živého plotu',
      description: 'Živý plot podél celého pozemku, cca 30 m.',
      status: DemandStatus.SCHVALENA,
      urgency: 'DO_MESICE',
      serviceTypeIds: [2],
      createdAt: '2026-08-01T10:00:00Z',
    },
    // SCHVALENA - druhá aktivní zakázka pro stejného pracovníka, ale jinou zahradu
    {
      id: 5,
      gardenId: 2,
      title: 'Vysadit nové jehličnany',
      description: 'Poptávám výsadbu 15 kusů tují podél plotu. Sazenice již mám připravené, jde pouze o výkopové práce a samotnou výsadbu.',
      status: DemandStatus.SCHVALENA,
      urgency: 'DO_TRI_MESICU',
      serviceTypeIds: [3],
      createdAt: '2026-07-20T11:00:00Z',
    },
    // PRACE_DOKONCENY - pracovník 4 už nahlásil dokončení, čeká na schválení vlastníkem
    {
      id: 6,
      gardenId: 1,
      title: 'Úklid podzimního listí',
      description: 'Hledám někoho na podzimní úklid zahrady — hrabání listí, zastřihnutí okrasných keřů a přípravu záhonů na zimu.',
      status: DemandStatus.PRACE_DOKONCENY,
      urgency: 'DO_TYDNE',
      serviceTypeIds: [4],
      createdAt: '2026-07-01T08:00:00Z',
    },
  ],

  proposals: [
    // Aktivní nabídky u poptávek ve stavu NOVA
    {
      id: 1,
      demandId: 1,
      workerId: 2,
      price: 800,
      description: 'Mohu přijet ve čtvrtek. Vlastní vybavení.',
      status: ProposalStatus.NOVY,
      createdAt: '2026-08-16T10:00:00Z',
      comments: [],
    },
    {
      id: 2,
      demandId: 1,
      workerId: 4,
      price: 950,
      description: 'K dispozici o víkendu, cena včetně úklidu.',
      status: ProposalStatus.NOVY,
      createdAt: '2026-08-16T15:20:00Z',
      comments: [],
    },
    {
      id: 3,
      demandId: 3,
      workerId: 2,
      price: 12000,
      description: 'Kompletní balíček, cca 3 dny práce.',
      status: ProposalStatus.NOVY,
      createdAt: '2026-08-19T09:00:00Z',
      comments: [],
    },
    // Přijatá nabídka u poptávky ve stavu SCHVALENA
    {
      id: 4,
      demandId: 4,
      workerId: 2,
      price: 2500,
      description: 'Zvládnu za den, profesionální nůžky.',
      status: ProposalStatus.SCHVALEN,
      createdAt: '2026-08-02T14:00:00Z',
      comments: [],
    },
    // Zamítnutá (soupeřila s přijatou nabídkou)
    {
      id: 5,
      demandId: 4,
      workerId: 4,
      price: 3000,
      description: 'Do 2 dnů, cena včetně odvozu.',
      status: ProposalStatus.ZAMITNUT,
      createdAt: '2026-08-02T16:00:00Z',
      comments: [],
    },
    // Přijatá nabídka stojící za zakázkou ve stavu ZAPLACENA (poptávka 5)
    {
      id: 6,
      demandId: 5,
      workerId: 2,
      price: 3200,
      description: 'Sazenice zajištěny, práce od pondělí.',
      status: ProposalStatus.SCHVALEN,
      createdAt: '2026-07-21T09:00:00Z',
      comments: [],
    },
    // Přijatá nabídka stojící za zakázkou ve stavu PRACE_DOKONCENY (poptávka 6)
    {
      id: 7,
      demandId: 6,
      workerId: 4,
      price: 1200,
      description: 'Úklid do dvou dnů, odvoz v ceně.',
      status: ProposalStatus.SCHVALEN,
      createdAt: '2026-07-02T10:00:00Z',
      comments: [],
    },
  ],

  // Report již odeslaný pracovníkem 4 k poptávce 6 (PRACE_DOKONCENY) - umožňuje vlastníkovi
  // vyzkoušet postup "přijmout práci".
  workReports: [
    {
      id: 1,
      demandId: 6,
      description:
        'Zahrada byla kompletně uklizena, veškeré listí odvezeno na kompostárnu. Práce trvala jeden den.',
      photoUrls: [],
      createdAt: '2026-07-05T16:00:00Z',
    },
  ],

  // Recenze vznikají prostřednictvím postupu přijetí práce; prázdné, dokud vlastník nepřijme dokončenou zakázku.
  reviews: [],
};

// ---------- Pomocné vyhledávací funkce ----------
export const findUserById = (id) => db.users.find((u) => u.id === id);
export const findUserByEmail = (email) => db.users.find((u) => u.email === email);
export const findGardenById = (id) => db.gardens.find((g) => g.id === id);
export const findDemandById = (id) => db.demands.find((d) => d.id === id);
export const findProposalById = (id) => db.proposals.find((p) => p.id === id);
export const findWorkReportByDemandId = (demandId) => db.workReports.find((wr) => wr.demandId === demandId);
export const findReviewByDemandId = (demandId) => db.reviews.find((r) => r.demandId === demandId);
