import type { Signal } from '@/types';

const API_BASE = 'https://relationshipos-api.onrender.com/api/v1';
const TIMEOUT = 20000;

function headers(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export interface DetectResult {
  created: number;
  deactivated: number;
}

export async function getSignals(filters?: {
  signal_type?: string;
  entity_type?: string;
  confidence_min?: number;
}): Promise<Signal[]> {
  const params = new URLSearchParams();
  if (filters?.signal_type) params.set('signal_type', filters.signal_type);
  if (filters?.entity_type) params.set('entity_type', filters.entity_type);
  if (filters?.confidence_min !== undefined)
    params.set('confidence_min', String(filters.confidence_min));
  const qs = params.toString();
  const url = `${API_BASE}/signals${qs ? '?' + qs : ''}`;
  const res = await fetch(url, {
    headers: headers(),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getPropertySignals(propertyId: string | number): Promise<Signal[]> {
  const res = await fetch(`${API_BASE}/properties/${propertyId}/signals`, {
    headers: headers(),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getPersonSignals(personId: string | number): Promise<Signal[]> {
  const res = await fetch(`${API_BASE}/people/${personId}/signals`, {
    headers: headers(),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function detectSignals(): Promise<DetectResult> {
  const res = await fetch(`${API_BASE}/signals/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers() },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error('Detection failed');
  return res.json();
}
