import type {
  Person, PersonCreate, Property, PropertyCreate, Activity, ActivityCreate,
  DashboardData, BriefingData, NextBestContact, BuyerInterest, PropertyOwner,
  CommunityEntity, CommunityEntityCreate, AuthCredentials, AuthRegister, AuthToken,
  Checklist, ChecklistItem,
} from '@/types';

const API_BASE = 'https://relationshipos-api.onrender.com/api/v1';
const TIMEOUT = 20_000;

// ── Token management ──
let _token: string | null = localStorage.getItem('ros_token');

export function getToken(): string | null { return _token; }

export function setToken(token: string | null) {
  _token = token;
  if (token) localStorage.setItem('ros_token', token);
  else localStorage.removeItem('ros_token');
}

export function isAuthenticated(): boolean { return !!_token; }

// ── Fetch helper ──
async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> ?? {}),
  };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    signal: opts.signal ?? AbortSignal.timeout(TIMEOUT),
  });

  if (res.status === 401) {
    setToken(null);
    throw new Error('Unauthorized — please log in again');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Auth ──
export async function register(data: AuthRegister): Promise<{ id: number; email: string }> {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function login(data: AuthCredentials): Promise<AuthToken> {
  const token = await apiFetch<AuthToken>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  setToken(token.access_token);
  return token;
}

export function logout() { setToken(null); }

// ── People ──
export async function getPeople(): Promise<Person[]> {
  return apiFetch('/people/');
}

export async function getPerson(id: number | string): Promise<Person> {
  return apiFetch(`/people/${id}`);
}

export async function createPerson(data: PersonCreate): Promise<Person> {
  return apiFetch('/people/', { method: 'POST', body: JSON.stringify(data) });
}

export async function updatePerson(id: number | string, data: Partial<PersonCreate>): Promise<Person> {
  return apiFetch(`/people/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function searchPeople(q: string): Promise<Person[]> {
  return apiFetch(`/people/search?q=${encodeURIComponent(q)}`);
}

export async function getNextBestContacts(): Promise<NextBestContact[]> {
  return apiFetch('/people/next-best');
}

export async function parseVoicePerson(transcription: string): Promise<Partial<PersonCreate>> {
  return apiFetch('/people/parse-voice', {
    method: 'POST',
    body: JSON.stringify({ transcription }),
  });
}

// ── Vault / Privacy ──
export async function vaultContact(id: number, vaultNote?: string): Promise<Person> {
  return apiFetch(`/people/${id}/vault`, {
    method: 'PATCH',
    body: JSON.stringify({ vault_note: vaultNote }),
  });
}

export async function restoreContact(id: number): Promise<Person> {
  return apiFetch(`/people/${id}/restore`, { method: 'PATCH' });
}

export async function makeContactPrivate(id: number): Promise<Person> {
  return apiFetch(`/people/${id}/make-private`, { method: 'PATCH' });
}

export async function bulkVaultContacts(ids: number[], vaultNote?: string): Promise<{ vaulted: number }> {
  return apiFetch('/people/bulk-vault', {
    method: 'POST',
    body: JSON.stringify({ ids, vault_note: vaultNote }),
  });
}

export async function checkDuplicate(params: { phone?: string; email?: string; name?: string }): Promise<{ match: Person | null; match_type: 'phone' | 'email' | 'name' | null }> {
  try {
    return await apiFetch('/people/check-duplicate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    return { match: null, match_type: null };
  }
}

export async function deletePerson(id: number): Promise<void> {
  await apiFetch(`/people/${id}`, { method: 'DELETE' });
}

export async function getVaultedContacts(): Promise<Person[]> {
  try {
    return await apiFetch('/people/vaulted');
  } catch {
    // Fallback: try with query param
    try {
      return await apiFetch('/people/?include_status=vaulted');
    } catch {
      return [];
    }
  }
}

export async function getPrivateContacts(): Promise<Person[]> {
  try {
    return await apiFetch('/people/private');
  } catch {
    // Fallback: try with query param
    try {
      return await apiFetch('/people/?include_status=private');
    } catch {
      return [];
    }
  }
}

// ── Activities ──
export async function getActivities(params?: { person_id?: number; property_id?: number }): Promise<Activity[]> {
  const qs = new URLSearchParams();
  if (params?.person_id) qs.set('person_id', String(params.person_id));
  if (params?.property_id) qs.set('property_id', String(params.property_id));
  const q = qs.toString();
  return apiFetch(`/activities/${q ? '?' + q : ''}`);
}

export async function createActivity(data: ActivityCreate): Promise<Activity> {
  return apiFetch('/activities/', { method: 'POST', body: JSON.stringify(data) });
}

// ── Properties ──
export async function getProperties(): Promise<Property[]> {
  return apiFetch('/properties/');
}

export async function getProperty(id: number | string): Promise<Property> {
  return apiFetch(`/properties/${id}`);
}

export async function createProperty(data: PropertyCreate): Promise<Property> {
  return apiFetch('/properties/', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProperty(id: number | string, data: Partial<PropertyCreate>): Promise<Property> {
  return apiFetch(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function getPropertyBuyerInterest(id: number | string): Promise<BuyerInterest[]> {
  return apiFetch(`/properties/${id}/buyer-interest`);
}

export async function getPropertyOwners(id: number | string): Promise<PropertyOwner[]> {
  return apiFetch(`/properties/${id}/owners`);
}

export async function parseVoiceProperty(transcription: string): Promise<Partial<PropertyCreate>> {
  return apiFetch('/properties/parse-voice', {
    method: 'POST',
    body: JSON.stringify({ transcription }),
  });
}

// ── Checklists ──
export async function getPropertyChecklist(propertyId: number): Promise<Checklist | null> {
  try {
    return await apiFetch(`/properties/${propertyId}/listing-checklist`);
  } catch (e: any) {
    if (e?.message?.includes('404')) return null;
    return null;
  }
}

export async function createChecklist(propertyId: number, saleMethod: string): Promise<Checklist> {
  return apiFetch(`/properties/${propertyId}/listing-checklist`, {
    method: 'POST',
    body: JSON.stringify({ sale_method: saleMethod }),
  });
}

export async function updateChecklistItem(
  itemId: number,
  updates: { is_complete?: boolean; due_date?: string; note?: string },
): Promise<ChecklistItem> {
  return apiFetch(`/checklist-items-v2/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function updateChecklistPhase(
  checklistId: number,
  currentPhase: number,
): Promise<Checklist> {
  return apiFetch(`/checklists/${checklistId}/phase`, {
    method: 'PATCH',
    body: JSON.stringify({ current_phase: currentPhase }),
  });
}

export async function deleteChecklist(checklistId: number): Promise<void> {
  await apiFetch(`/checklists/${checklistId}`, { method: 'DELETE' });
}

// ── Dashboard ──
export async function getDashboard(): Promise<DashboardData> {
  return apiFetch('/dashboard');
}

export async function getBriefing(): Promise<BriefingData> {
  return apiFetch('/dashboard/briefing');
}

// ── Community ──
export async function getCommunityEntities(): Promise<CommunityEntity[]> {
  return apiFetch('/community-entities/');
}

export async function getCommunityEntity(id: number | string): Promise<CommunityEntity> {
  return apiFetch(`/community-entities/${id}`);
}

export async function createCommunityEntity(data: CommunityEntityCreate): Promise<CommunityEntity> {
  return apiFetch('/community-entities/', { method: 'POST', body: JSON.stringify(data) });
}
