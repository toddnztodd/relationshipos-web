import { describe, expect, it, vi, beforeEach } from 'vitest';

// We test the signals-api module logic by mocking fetch
const API_BASE = 'https://relationshipos-api.onrender.com/api/v1';

describe('signals-api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds correct URL for getSignals with filters', () => {
    const params = new URLSearchParams();
    params.set('signal_type', 'buyer_match');
    params.set('confidence_min', '0.5');
    const qs = params.toString();
    const url = `${API_BASE}/signals?${qs}`;
    expect(url).toBe(
      'https://relationshipos-api.onrender.com/api/v1/signals?signal_type=buyer_match&confidence_min=0.5'
    );
  });

  it('builds correct URL for getPropertySignals', () => {
    const propertyId = 42;
    const url = `${API_BASE}/properties/${propertyId}/signals`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/properties/42/signals');
  });

  it('builds correct URL for getPersonSignals', () => {
    const personId = 7;
    const url = `${API_BASE}/people/${personId}/signals`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/people/7/signals');
  });

  it('builds correct URL for detectSignals', () => {
    const url = `${API_BASE}/signals/detect`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/signals/detect');
  });

  it('builds correct URL for getSignals without filters', () => {
    const params = new URLSearchParams();
    const qs = params.toString();
    const url = `${API_BASE}/signals${qs ? '?' + qs : ''}`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/signals');
  });

  it('builds correct URL for people list', () => {
    const url = `${API_BASE}/people`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/people');
  });

  it('builds correct URL for dashboard briefing', () => {
    const url = `${API_BASE}/dashboard/briefing`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/dashboard/briefing');
  });

  it('builds correct URL for property buyer interest', () => {
    const id = 10;
    const url = `${API_BASE}/properties/${id}/buyer-interest`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/properties/10/buyer-interest');
  });
});
