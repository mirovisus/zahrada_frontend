// MSW handlery pro demo verzi. Cesty a tvary DTO odpovídají 1:1 skutečnému backendu -
// ověřeno podle zahrada_backend/src/main/java/upce/fei/garden/{controller,dto}/**.
//
// Logika:
//  - JWT token je předstíraný ("mock-jwt-{userId}-{role}"), parsování je triviální
//  - 404 (ne 403) u cizích zdrojů - odpovídá chování skutečného backendu
//  - 409 při pokusu upravit/smazat poptávku, která už má nabídky
//  - Kaskáda při přijetí: nabídka->SCHVALEN, ostatní->ZAMITNUT, poptávka->SCHVALENA
//  - Seznamové endpointy podložené Spring Data vrací skutečný tvar Page<T>: { content, totalElements,
//    totalPages, number, size } - frontend čte page.content / page.totalPages.

import { http, HttpResponse, delay } from 'msw';
import {
  db,
  UserRole,
  DemandStatus,
  ProposalStatus,
  DemandUrgency,
  nextUserId,
  nextGardenId,
  nextDemandId,
  nextProposalId,
  nextWorkReportId,
  nextReviewId,
  findUserById,
  findUserByEmail,
  findGardenById,
  findDemandById,
  findProposalById,
  findWorkReportByDemandId,
  findReviewByDemandId,
} from './db';

// ---------- Pomocné funkce ----------

// Malé zpoždění, aby UI působilo responzivně (loading stavy, spinnery).
const NETWORK_DELAY = 200;

// Stavy poptávky, u kterých se přijatá nabídka pracovníka počítá jako aktivní "zakázka"
// (WorkReportService.ACTIVE_JOB_STATUSES na skutečném backendu). CEKA_NA_PLATBU a ZAPLACENA
// existují v enumu DemandStatus, ale žádná služba je nikdy nenastavuje - přijetí nabídky jde
// rovnou do SCHVALENA a submitReport vyžaduje SCHVALENA (ne ZAPLACENA, přestože Javadoc
// controlleru uvádí "Zaplaceno" - to je zastaralý komentář, platby ještě nejsou zapojené).
const JOB_STATUSES = [DemandStatus.SCHVALENA, DemandStatus.PRACE_DOKONCENY, DemandStatus.PRACE_SCHVALENY];

// Stavy poptávky, které blokují smazání účtu vlastníka/pracovníka (ProfileService.BLOCKING_DEMAND_STATUSES).
const BLOCKING_DEMAND_STATUSES = [DemandStatus.SCHVALENA, DemandStatus.ZAPLACENA, DemandStatus.PRACE_DOKONCENY];

const makeToken = (user) => `mock-jwt-${user.id}-${user.role}`;

const parseToken = (authHeader) => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const match = token.match(/^mock-jwt-(\d+)-(OWNER|WORKER)$/);
  if (!match) return null;
  const userId = Number(match[1]);
  return findUserById(userId) ?? null;
};

// Hodnoty HttpStatus.getReasonPhrase() pro stavové kódy, které tento mock skutečně vrací.
const REASON_PHRASES = { 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict' };

// Tvar ApiError (backend, viz GlobalExceptionHandler/JwtAuthenticationEntryPoint):
// { timestamp, status, error, message, path, fieldErrors }. Bez pole "code".
const apiError = (status, message, request, fieldErrors = null) =>
  HttpResponse.json(
    {
      timestamp: new Date().toISOString(),
      status,
      error: REASON_PHRASES[status] ?? '',
      message,
      path: request ? new URL(request.url).pathname : undefined,
      fieldErrors,
    },
    { status }
  );

const requireAuth = (request) => {
  const user = parseToken(request.headers.get('Authorization'));
  if (!user) {
    return {
      user: null,
      error: apiError(401, 'Pro přístup k tomuto zdroji je vyžadována platná autentizace.', request),
    };
  }
  return { user, error: null };
};

// Odpovídá JSON tvaru Page<T> ze Spring Data, omezeno na pole, která frontend skutečně čte
// (page.content, page.totalPages).
const paginate = (list, page, size) => ({
  content: list.slice(page * size, page * size + size),
  totalElements: list.length,
  totalPages: Math.ceil(list.length / size),
  number: page,
  size,
});

// ---------- Mapovací funkce (entita -> DTO) ----------

const toGardenDto = (g) => ({
  id: g.id,
  gardenName: g.gardenName,
  areaSqm: g.areaSqm,
  city: g.city,
  street: g.street,
  houseNumber: g.houseNumber,
  postalCode: g.postalCode,
  mainPhotoUrl: g.mainPhotoUrl,
});

// GardenSummary - vnořeno v DemandDetailResponse / WorkerJobSummary.
const toGardenSummaryDto = (g) => ({
  gardenName: g?.gardenName,
  city: g?.city,
  street: g?.street,
  houseNumber: g?.houseNumber,
  mainPhotoUrl: g?.mainPhotoUrl,
});

const toDemandSummaryDto = (d) => ({
  id: d.id,
  gardenName: findGardenById(d.gardenId)?.gardenName,
  descriptionPreview: d.description,
  urgency: d.urgency,
  urgencyLabel: DemandUrgency[d.urgency]?.label,
  status: d.status,
});

const toWorkReportDto = (wr) => ({
  id: wr.id,
  description: wr.description,
  photoUrls: wr.photoUrls ?? [],
  createdAt: wr.createdAt,
});

const toReviewDto = (r) => ({
  rating: r.rating,
  comment: r.comment,
  createdAt: r.createdAt,
});

const toDemandDetailDto = (d) => {
  const workReport = findWorkReportByDemandId(d.id);
  const review = findReviewByDemandId(d.id);
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    urgency: d.urgency,
    urgencyLabel: DemandUrgency[d.urgency]?.label,
    createdAt: d.createdAt,
    status: d.status,
    serviceTypeNames: d.serviceTypeIds
      .map((id) => db.serviceTypes.find((st) => st.id === id)?.name)
      .filter(Boolean),
    garden: toGardenSummaryDto(findGardenById(d.gardenId)),
    hasProposals: db.proposals.some((p) => p.demandId === d.id),
    workReport: workReport ? toWorkReportDto(workReport) : null,
    review: review ? toReviewDto(review) : null,
  };
};

const toProposalSummaryDto = (p) => {
  const worker = findUserById(p.workerId);
  return {
    id: p.id,
    demandId: p.demandId,
    workerFirstName: worker?.firstName ?? null,
    workerLastName: worker?.lastName ?? null,
    workerAvatarUrl: worker?.avatarUrl ?? null,
    workerBio: worker?.bio ?? null,
    description: p.description,
    price: p.price,
    status: p.status,
    createdAt: p.createdAt,
    comments: (p.comments ?? []).map((c) => ({ text: c.text, createdAt: c.createdAt })),
  };
};

const toWorkerJobSummaryDto = (d) => {
  const proposal = db.proposals.find((p) => p.demandId === d.id && p.status === ProposalStatus.SCHVALEN);
  return {
    demandId: d.id,
    title: d.title,
    description: d.description,
    garden: toGardenSummaryDto(findGardenById(d.gardenId)),
    status: d.status,
    price: proposal?.price ?? null,
    createdAt: d.createdAt,
    reportSubmitted: Boolean(findWorkReportByDemandId(d.id)),
  };
};

// Pole profilu se liší podle role (OwnerProfileResponse vs WorkerProfileResponse).
const toProfileDto = (u) => {
  if (u.role === UserRole.WORKER) {
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      bio: u.bio ?? null,
      averageRating: u.averageRating ?? null,
      email: u.email,
      phoneNumber: u.phoneNumber,
      avatarUrl: u.avatarUrl ?? null,
    };
  }
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phoneNumber: u.phoneNumber,
    avatarUrl: u.avatarUrl ?? null,
  };
};

// ---------- Handlery ----------

export const handlers = [
  // ========== AUTENTIZACE ==========
  http.post('*/api/auth/register', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const body = await request.json();
    // RegisterRequest (backend): firstName, lastName, role, email, password. Bez telefonu - nastavuje se později přes profil.
    const { email, password, role, firstName, lastName } = body;

    if (!email || !password || !role) {
      return apiError(400, 'Chybí povinné údaje', request);
    }
    if (findUserByEmail(email)) {
      return apiError(409, 'Uživatel s tímto e-mailem již existuje', request);
    }

    const user = {
      id: nextUserId(),
      email,
      password,
      role,
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      phoneNumber: '',
      avatarUrl: null,
      ...(role === UserRole.WORKER ? { bio: null, averageRating: null } : {}),
    };
    db.users.push(user);

    // AuthResponse (backend): plochý tvar { id, email, role, token }, HTTP 200.
    return HttpResponse.json({ id: user.id, email: user.email, role: user.role, token: makeToken(user) });
  }),

  http.post('*/api/auth/login', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { email, password } = await request.json();
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      return apiError(401, 'Nesprávný e-mail nebo heslo', request);
    }
    return HttpResponse.json({ id: user.id, email: user.email, role: user.role, token: makeToken(user) });
  }),

  // ========== VEŘEJNÉ ČÍSELNÍKY ==========
  http.get('*/api/service-types', async () => {
    await delay(NETWORK_DELAY);
    return HttpResponse.json(db.serviceTypes.map((st) => ({ id: st.id, name: st.name })));
  }),

  http.get('*/api/demands/urgencies', async () => {
    await delay(NETWORK_DELAY);
    return HttpResponse.json(Object.values(DemandUrgency));
  }),

  // ========== KATALOG (veřejný) ==========
  http.get('*/api/demands/catalog', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const url = new URL(request.url);
    const city = url.searchParams.get('city');
    const serviceTypeIds = url.searchParams.getAll('serviceTypeIds').map(Number);
    const search = url.searchParams.get('search')?.toLowerCase();
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 10);

    let list = db.demands.filter((d) => d.status === DemandStatus.NOVA);

    if (city) {
      list = list.filter((d) => findGardenById(d.gardenId)?.city?.toLowerCase() === city.toLowerCase());
    }
    if (serviceTypeIds.length > 0) {
      list = list.filter((d) => d.serviceTypeIds.some((id) => serviceTypeIds.includes(id)));
    }
    if (search) {
      list = list.filter(
        (d) => d.title.toLowerCase().includes(search) || d.description.toLowerCase().includes(search)
      );
    }

    return HttpResponse.json(paginate(list.map(toDemandSummaryDto), page, size));
  }),

  // ========== POPTÁVKA - detail (veřejný pro NOVA, jinak soukromý) ==========
  http.get('*/api/demands/:id', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const demand = findDemandById(Number(params.id));
    if (!demand) return apiError(404, 'Poptávka nenalezena', request);

    const user = parseToken(request.headers.get('Authorization'));

    // Pravidlo viditelnosti ze zadání:
    //  - OWNER: vidí vlastní poptávky (jakýkoliv stav)
    //  - WORKER: vidí poptávku, pokud je NOVA NEBO na ni už má podanou nabídku
    //  - anonymní: vidí jen NOVA
    const garden = findGardenById(demand.gardenId);
    const isOwner = user?.role === UserRole.OWNER && garden?.ownerId === user.id;
    const isWorkerWithProposal =
      user?.role === UserRole.WORKER &&
      db.proposals.some((p) => p.demandId === demand.id && p.workerId === user.id);
    const isPublicNova = demand.status === DemandStatus.NOVA;

    if (!isOwner && !isPublicNova && !isWorkerWithProposal) {
      return apiError(404, 'Poptávka nenalezena', request);
    }

    return HttpResponse.json(toDemandDetailDto(demand));
  }),

  // ========== ZAHRADY ==========
  http.get('*/api/gardens', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.OWNER) return apiError(403, 'Pouze vlastník', request);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);

    const mine = db.gardens.filter((g) => g.ownerId === user.id).map(toGardenDto);
    return HttpResponse.json(paginate(mine, page, size));
  }),

  http.post('*/api/gardens', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.OWNER) return apiError(403, 'Pouze vlastník', request);

    const body = await request.json();
    const garden = {
      id: nextGardenId() + 100,
      ownerId: user.id,
      gardenName: body.gardenName,
      areaSqm: body.areaSqm,
      city: body.city,
      street: body.street,
      houseNumber: body.houseNumber,
      postalCode: body.postalCode,
      mainPhotoUrl: null,
    };
    db.gardens.push(garden);
    return HttpResponse.json(toGardenDto(garden), { status: 201 });
  }),

  http.get('*/api/gardens/:id', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const garden = findGardenById(Number(params.id));
    if (!garden || garden.ownerId !== user.id) {
      return apiError(404, 'Zahrada nenalezena', request);
    }
    return HttpResponse.json(toGardenDto(garden));
  }),

  http.put('*/api/gardens/:id', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const garden = findGardenById(Number(params.id));
    if (!garden || garden.ownerId !== user.id) {
      return apiError(404, 'Zahrada nenalezena', request);
    }
    const body = await request.json();
    Object.assign(garden, {
      gardenName: body.gardenName,
      areaSqm: body.areaSqm,
      city: body.city,
      street: body.street,
      houseNumber: body.houseNumber,
      postalCode: body.postalCode,
    });
    return HttpResponse.json(toGardenDto(garden));
  }),

  http.delete('*/api/gardens/:id', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const idx = db.gardens.findIndex((g) => g.id === Number(params.id) && g.ownerId === user.id);
    if (idx === -1) return apiError(404, 'Zahrada nenalezena', request);
    db.gardens.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Nahrání/smazání fotky - skutečné endpointy vrací celý GardenDetailResponse.
  http.post('*/api/gardens/:id/photo', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const garden = findGardenById(Number(params.id));
    if (!garden || garden.ownerId !== user.id) {
      return apiError(404, 'Zahrada nenalezena', request);
    }
    // TODO: pokud frontend vykresluje URL, poskytnout cestu k ukázkovému obrázku
    garden.mainPhotoUrl = `/mock-uploads/garden-${garden.id}-${Date.now()}.jpg`;
    return HttpResponse.json(toGardenDto(garden));
  }),

  http.delete('*/api/gardens/:id/photo', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const garden = findGardenById(Number(params.id));
    if (!garden || garden.ownerId !== user.id) {
      return apiError(404, 'Zahrada nenalezena', request);
    }
    garden.mainPhotoUrl = null;
    return HttpResponse.json(toGardenDto(garden));
  }),

  // Poptávky konkrétní zahrady (parametr status je přijímán, ale na serveru ignorován, stejně
  // jako u skutečného endpointu - frontend filtruje na klientovi jako pojistku).
  http.get('*/api/gardens/:gardenId/demands', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const garden = findGardenById(Number(params.gardenId));
    if (!garden || garden.ownerId !== user.id) {
      return apiError(404, 'Zahrada nenalezena', request);
    }
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);

    const list = db.demands.filter((d) => d.gardenId === garden.id).map(toDemandSummaryDto);
    return HttpResponse.json(paginate(list, page, size));
  }),

  // ========== POPTÁVKY - CRUD ==========
  http.get('*/api/demands', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.OWNER) return apiError(403, 'Pouze vlastník', request);

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);

    const myGardenIds = db.gardens.filter((g) => g.ownerId === user.id).map((g) => g.id);
    let list = db.demands.filter((d) => myGardenIds.includes(d.gardenId));
    if (status) list = list.filter((d) => d.status === status);

    return HttpResponse.json(paginate(list.map(toDemandSummaryDto), page, size));
  }),

  http.post('*/api/gardens/:gardenId/demands', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const garden = findGardenById(Number(params.gardenId));
    if (!garden || garden.ownerId !== user.id) {
      return apiError(404, 'Zahrada nenalezena', request);
    }
    const body = await request.json();
    const demand = {
      id: nextDemandId() + 100,
      gardenId: garden.id,
      title: body.title,
      description: body.description ?? '',
      status: DemandStatus.NOVA,
      urgency: body.urgency ?? 'FLEXIBILNI',
      serviceTypeIds: body.serviceTypeIds ?? [],
      createdAt: new Date().toISOString(),
    };
    db.demands.push(demand);
    return HttpResponse.json(toDemandDetailDto(demand), { status: 201 });
  }),

  http.put('*/api/demands/:id', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const demand = findDemandById(Number(params.id));
    if (!demand) return apiError(404, 'Poptávka nenalezena', request);

    const garden = findGardenById(demand.gardenId);
    if (garden?.ownerId !== user.id) {
      return apiError(404, 'Poptávka nenalezena', request);
    }
    if (db.proposals.some((p) => p.demandId === demand.id)) {
      return apiError(409, 'Poptávka již má nabídky, nelze upravovat', request);
    }

    const body = await request.json();
    Object.assign(demand, {
      title: body.title ?? demand.title,
      description: body.description ?? demand.description,
      urgency: body.urgency ?? demand.urgency,
      serviceTypeIds: body.serviceTypeIds ?? demand.serviceTypeIds,
    });
    return HttpResponse.json(toDemandDetailDto(demand));
  }),

  http.delete('*/api/demands/:id', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const demand = findDemandById(Number(params.id));
    if (!demand) return apiError(404, 'Poptávka nenalezena', request);
    const garden = findGardenById(demand.gardenId);
    if (garden?.ownerId !== user.id) {
      return apiError(404, 'Poptávka nenalezena', request);
    }
    if (db.proposals.some((p) => p.demandId === demand.id)) {
      return apiError(409, 'Poptávka již má nabídky, nelze smazat', request);
    }
    db.demands.splice(db.demands.indexOf(demand), 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Přehled poptávek vlastníka s počtem nabídek (DemandStatisticsResponse[]).
  http.get('*/api/demands/statistics', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.OWNER) return apiError(403, 'Pouze vlastník', request);

    const myGardenIds = db.gardens.filter((g) => g.ownerId === user.id).map((g) => g.id);
    const myDemands = db.demands.filter((d) => myGardenIds.includes(d.gardenId));

    return HttpResponse.json(
      myDemands.map((d) => ({
        demandId: d.id,
        title: d.title,
        status: d.status,
        proposalCount: db.proposals.filter((p) => p.demandId === d.id).length,
      }))
    );
  }),

  // ========== NABÍDKY ==========
  http.get('*/api/demands/:demandId/proposals', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const demand = findDemandById(Number(params.demandId));
    if (!demand) return apiError(404, 'Poptávka nenalezena', request);
    const garden = findGardenById(demand.gardenId);
    if (garden?.ownerId !== user.id) {
      return apiError(404, 'Poptávka nenalezena', request);
    }
    const list = db.proposals.filter((p) => p.demandId === demand.id);
    return HttpResponse.json(list.map(toProposalSummaryDto));
  }),

  http.post('*/api/demands/:demandId/proposals', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.WORKER) return apiError(403, 'Pouze pracovník', request);

    const demand = findDemandById(Number(params.demandId));
    if (!demand || demand.status !== DemandStatus.NOVA) {
      return apiError(404, 'Poptávka nenalezena', request);
    }
    if (db.proposals.some((p) => p.demandId === demand.id && p.workerId === user.id)) {
      return apiError(409, 'Na tuto poptávku jste již reagoval', request);
    }

    const body = await request.json();
    const proposal = {
      id: nextProposalId() + 100,
      demandId: demand.id,
      workerId: user.id,
      price: body.price,
      description: body.description ?? '',
      status: ProposalStatus.NOVY,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    db.proposals.push(proposal);
    return HttpResponse.json(toProposalSummaryDto(proposal), { status: 201 });
  }),

  // Parametr status frontend přijímá, ale skutečný endpoint takový parametr nemá - filtruje
  // se na klientovi jako pojistka, takže i zde jen stránkujeme vše.
  http.get('*/api/proposals/my', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.WORKER) return apiError(403, 'Pouze pracovník', request);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);

    const list = db.proposals.filter((p) => p.workerId === user.id).map(toProposalSummaryDto);
    return HttpResponse.json(paginate(list, page, size));
  }),

  // Kaskáda při přijetí: nabídka -> SCHVALEN, konkurenční nabídky -> ZAMITNUT, poptávka -> SCHVALENA
  http.post('*/api/proposals/:id/accept', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.OWNER) return apiError(403, 'Pouze vlastník', request);

    const proposal = findProposalById(Number(params.id));
    if (!proposal) return apiError(404, 'Nabídka nenalezena', request);
    const demand = findDemandById(proposal.demandId);
    const garden = findGardenById(demand?.gardenId);
    if (garden?.ownerId !== user.id) {
      return apiError(404, 'Nabídka nenalezena', request);
    }
    if (demand.status !== DemandStatus.NOVA) {
      return apiError(409, 'Poptávka již není otevřená', request);
    }

    proposal.status = ProposalStatus.SCHVALEN;
    db.proposals
      .filter((p) => p.demandId === demand.id && p.id !== proposal.id)
      .forEach((p) => (p.status = ProposalStatus.ZAMITNUT));
    demand.status = DemandStatus.SCHVALENA;

    return HttpResponse.json(toProposalSummaryDto(proposal));
  }),

  http.post('*/api/proposals/:id/reject', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.OWNER) return apiError(403, 'Pouze vlastník', request);

    const proposal = findProposalById(Number(params.id));
    if (!proposal) return apiError(404, 'Nabídka nenalezena', request);
    const demand = findDemandById(proposal.demandId);
    const garden = findGardenById(demand?.gardenId);
    if (garden?.ownerId !== user.id) {
      return apiError(404, 'Nabídka nenalezena', request);
    }
    proposal.status = ProposalStatus.ZAMITNUT;
    return HttpResponse.json(toProposalSummaryDto(proposal));
  }),

  // Vlastník požaduje úpravy u nabídky ve stavu NOVY -> UPRAVY_POZADOVANY, komentář se zaznamená.
  http.post('*/api/proposals/:id/request-changes', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.OWNER) return apiError(403, 'Pouze vlastník', request);

    const proposal = findProposalById(Number(params.id));
    if (!proposal) return apiError(404, 'Nabídka nenalezena', request);
    const demand = findDemandById(proposal.demandId);
    const garden = findGardenById(demand?.gardenId);
    if (garden?.ownerId !== user.id) {
      return apiError(404, 'Nabídka nenalezena', request);
    }
    if (proposal.status !== ProposalStatus.NOVY) {
      return apiError(409, 'Žádost o úpravy lze podat jen u nového návrhu', request);
    }

    const body = await request.json();
    proposal.status = ProposalStatus.UPRAVY_POZADOVANY;
    proposal.comments = [...(proposal.comments ?? []), { text: body.comment, createdAt: new Date().toISOString() }];

    return HttpResponse.json(toProposalSummaryDto(proposal));
  }),

  // Pracovník přepracuje vlastní nabídku po vyžádání úprav -> zpět do stavu NOVY.
  http.put('*/api/proposals/:id', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.WORKER) return apiError(403, 'Pouze pracovník', request);

    const proposal = findProposalById(Number(params.id));
    if (!proposal || proposal.workerId !== user.id) {
      return apiError(404, 'Nabídka nenalezena', request);
    }
    if (proposal.status !== ProposalStatus.UPRAVY_POZADOVANY) {
      return apiError(409, 'Návrh nelze upravit', request);
    }

    const body = await request.json();
    Object.assign(proposal, {
      price: body.price,
      description: body.description ?? proposal.description,
      status: ProposalStatus.NOVY,
    });

    return HttpResponse.json(toProposalSummaryDto(proposal));
  }),

  http.delete('*/api/proposals/:id', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    const proposal = findProposalById(Number(params.id));
    if (!proposal || proposal.workerId !== user.id) {
      return apiError(404, 'Nabídka nenalezena', request);
    }
    if (proposal.status !== ProposalStatus.NOVY && proposal.status !== ProposalStatus.UPRAVY_POZADOVANY) {
      return apiError(409, 'Nelze smazat zpracovanou nabídku', request);
    }
    db.proposals.splice(db.proposals.indexOf(proposal), 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ========== ZAKÁZKY PRACOVNÍKA A REPORTY O PRÁCI ==========
  http.get('*/api/worker/jobs', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.WORKER) return apiError(403, 'Pouze pracovník', request);

    const jobs = db.proposals
      .filter((p) => p.workerId === user.id && p.status === ProposalStatus.SCHVALEN)
      .map((p) => findDemandById(p.demandId))
      .filter((d) => d && JOB_STATUSES.includes(d.status))
      .map(toWorkerJobSummaryDto);

    return HttpResponse.json(jobs);
  }),

  http.post('*/api/demands/:id/work-report', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.WORKER) return apiError(403, 'Pouze pracovník', request);

    const demand = findDemandById(Number(params.id));
    const hasAcceptedProposal = db.proposals.some(
      (p) => p.demandId === demand?.id && p.workerId === user.id && p.status === ProposalStatus.SCHVALEN
    );
    if (!demand || !hasAcceptedProposal) return apiError(404, 'Poptávka nenalezena', request);
    if (demand.status !== DemandStatus.SCHVALENA) {
      return apiError(409, 'Report nelze odeslat, protože poptávka není ve stavu Schválena.', request);
    }

    const body = await request.json();
    const workReport = {
      id: nextWorkReportId() + 100,
      demandId: demand.id,
      description: body.description,
      photoUrls: body.photoUrls ?? [],
      createdAt: new Date().toISOString(),
    };
    db.workReports.push(workReport);
    demand.status = DemandStatus.PRACE_DOKONCENY;

    return HttpResponse.json(toWorkReportDto(workReport), { status: 201 });
  }),

  // ========== RECENZE (přijetí dokončené práce) ==========
  http.post('*/api/demands/:id/accept-work', async ({ params, request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.OWNER) return apiError(403, 'Pouze vlastník', request);

    const demand = findDemandById(Number(params.id));
    if (!demand) return apiError(404, 'Poptávka nenalezena', request);
    const garden = findGardenById(demand.gardenId);
    if (garden?.ownerId !== user.id) {
      return apiError(404, 'Poptávka nenalezena', request);
    }
    if (demand.status !== DemandStatus.PRACE_DOKONCENY) {
      return apiError(409, 'Práci lze přijmout jen po jejím dokončení', request);
    }

    const body = await request.json();
    const acceptedProposal = db.proposals.find(
      (p) => p.demandId === demand.id && p.status === ProposalStatus.SCHVALEN
    );
    const review = {
      id: nextReviewId() + 100,
      demandId: demand.id,
      workerId: acceptedProposal?.workerId,
      rating: body.rating,
      comment: body.comment ?? null,
      createdAt: new Date().toISOString(),
    };
    db.reviews.push(review);
    demand.status = DemandStatus.PRACE_SCHVALENY;

    const worker = findUserById(acceptedProposal?.workerId);
    if (worker) {
      const workerReviews = db.reviews.filter((r) => r.workerId === worker.id);
      worker.averageRating = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
    }

    return HttpResponse.json(toDemandDetailDto(demand));
  }),

  // ========== PROFIL ==========
  http.get('*/api/profile', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    return HttpResponse.json(toProfileDto(user));
  }),

  http.put('*/api/profile/owner', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.OWNER) return apiError(403, 'Pouze vlastník', request);

    const body = await request.json();
    if (body.email && body.email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = findUserByEmail(body.email);
      if (existing && existing.id !== user.id) {
        return apiError(409, 'Uživatel s tímto e-mailem již existuje.', request);
      }
    }

    Object.assign(user, {
      firstName: body.firstName ?? user.firstName,
      lastName: body.lastName ?? user.lastName,
      email: body.email ?? user.email,
      phoneNumber: body.phoneNumber ?? user.phoneNumber,
      avatarUrl: body.avatarUrl ?? user.avatarUrl,
    });
    if (body.newPassword) user.password = body.newPassword;

    return HttpResponse.json(toProfileDto(user));
  }),

  http.put('*/api/profile/worker', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;
    if (user.role !== UserRole.WORKER) return apiError(403, 'Pouze pracovník', request);

    const body = await request.json();
    if (body.email && body.email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = findUserByEmail(body.email);
      if (existing && existing.id !== user.id) {
        return apiError(409, 'Uživatel s tímto e-mailem již existuje.', request);
      }
    }

    Object.assign(user, {
      firstName: body.firstName ?? user.firstName,
      lastName: body.lastName ?? user.lastName,
      bio: body.bio ?? user.bio,
      email: body.email ?? user.email,
      phoneNumber: body.phoneNumber ?? user.phoneNumber,
      avatarUrl: body.avatarUrl ?? user.avatarUrl,
    });
    if (body.newPassword) user.password = body.newPassword;

    return HttpResponse.json(toProfileDto(user));
  }),

  http.delete('*/api/profile', async ({ request }) => {
    await delay(NETWORK_DELAY);
    const { user, error } = requireAuth(request);
    if (error) return error;

    if (user.role === UserRole.OWNER) {
      const gardenIds = db.gardens.filter((g) => g.ownerId === user.id).map((g) => g.id);
      const hasActiveDemand = db.demands.some(
        (d) => gardenIds.includes(d.gardenId) && BLOCKING_DEMAND_STATUSES.includes(d.status)
      );
      if (hasActiveDemand) {
        return apiError(
          409,
          'Účet nelze smazat, máte rozpracované zakázky. Nejprve je dokončete nebo zrušte.',
          request
        );
      }

      const demandIds = db.demands.filter((d) => gardenIds.includes(d.gardenId)).map((d) => d.id);
      db.workReports = db.workReports.filter((wr) => !demandIds.includes(wr.demandId));
      db.reviews = db.reviews.filter((r) => !demandIds.includes(r.demandId));
      db.proposals = db.proposals.filter((p) => !demandIds.includes(p.demandId));
      db.demands = db.demands.filter((d) => !gardenIds.includes(d.gardenId));
      db.gardens = db.gardens.filter((g) => g.ownerId !== user.id);
    } else {
      const hasActiveJob = db.proposals.some(
        (p) =>
          p.workerId === user.id &&
          p.status === ProposalStatus.SCHVALEN &&
          BLOCKING_DEMAND_STATUSES.includes(findDemandById(p.demandId)?.status)
      );
      if (hasActiveJob) {
        return apiError(409, 'Účet nelze smazat, máte rozpracované zakázky.', request);
      }

      db.reviews = db.reviews.filter((r) => r.workerId !== user.id);
      db.proposals = db.proposals.filter((p) => p.workerId !== user.id);
    }

    db.users = db.users.filter((u) => u.id !== user.id);
    return new HttpResponse(null, { status: 204 });
  }),
];
