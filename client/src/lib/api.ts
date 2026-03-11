import type {
  Person,
  Property,
  Activity,
  BuyerInterest,
  CommunityEntity,
  Briefing,
} from '@/types';

const API_BASE = 'https://relationshipos-api.onrender.com/api/v1';
const TIMEOUT = 20000;

function headers(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers as Record<string, string> ?? {}) },
    signal: init?.signal ?? AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

// ── People ──────────────────────────────────────────────────────────────────
export async function getPeople(): Promise<Person[]> {
  return apiFetch<Person[]>('/people');
}

export async function getPerson(id: number | string): Promise<Person> {
  return apiFetch<Person>(`/people/${id}`);
}

export async function createPerson(data: Partial<Person>): Promise<Person> {
  return apiFetch<Person>('/people', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePerson(id: number | string, data: Partial<Person>): Promise<Person> {
  return apiFetch<Person>(`/people/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getPersonActivities(id: number | string): Promise<Activity[]> {
  return apiFetch<Activity[]>(`/people/${id}/activities`);
}

export async function createActivity(personId: number | string, data: Partial<Activity>): Promise<Activity> {
  return apiFetch<Activity>(`/people/${personId}/activities`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function parseVoicePerson(audioBlob: Blob): Promise<Partial<Person>> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  const res = await fetch(`${API_BASE}/people/parse-voice`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error('Voice parse failed');
  return res.json();
}

// ── Properties ──────────────────────────────────────────────────────────────
export async function getProperties(): Promise<Property[]> {
  return apiFetch<Property[]>('/properties');
}

export async function getProperty(id: number | string): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}`);
}

export async function createProperty(data: Partial<Property>): Promise<Property> {
  return apiFetch<Property>('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProperty(id: number | string, data: Partial<Property>): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getPropertyBuyerInterest(id: number | string): Promise<BuyerInterest[]> {
  return apiFetch<BuyerInterest[]>(`/properties/${id}/buyer-interest`);
}

export async function getPropertyOwners(id: number | string): Promise<Person[]> {
  return apiFetch<Person[]>(`/properties/${id}/owners`);
}

export async function parseVoiceProperty(audioBlob: Blob): Promise<Partial<Property>> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  const res = await fetch(`${API_BASE}/properties/parse-voice`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error('Voice parse failed');
  return res.json();
}

// ── Community ───────────────────────────────────────────────────────────────
export async function getCommunities(): Promise<CommunityEntity[]> {
  return apiFetch<CommunityEntity[]>('/communities');
}

export async function getCommunity(id: number | string): Promise<CommunityEntity> {
  return apiFetch<CommunityEntity>(`/communities/${id}`);
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export async function getBriefing(): Promise<Briefing> {
  return apiFetch<Briefing>('/dashboard/briefing');
}
