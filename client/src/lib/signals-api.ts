import type { Signal, SignalListResponse, SignalDetectResponse } from '@/types';
import { getToken } from './api';

const API_BASE = 'https://relationshipos-api.onrender.com/api/v1';
const TIMEOUT = 20_000;

function authHeaders(): Record<string, string> {
  const token = getToken();
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
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
    headers: authHeaders(),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) return [];
  const data: SignalListResponse = await res.json();
  return data.signals ?? data as any;
}

export async function getPropertySignals(propertyId: string | number): Promise<Signal[]> {
  const res = await fetch(`${API_BASE}/properties/${propertyId}/signals`, {
    headers: authHeaders(),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.signals ?? data;
}

export async function getPersonSignals(personId: string | number): Promise<Signal[]> {
  const res = await fetch(`${API_BASE}/people/${personId}/signals`, {
    headers: authHeaders(),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.signals ?? data;
}

export async function detectSignals(): Promise<SignalDetectResponse> {
  const res = await fetch(`${API_BASE}/signals/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error('Detection failed');
  return res.json();
}
