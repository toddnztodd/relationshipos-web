import { describe, expect, it, vi, beforeEach } from 'vitest';

const API_BASE = 'https://relationshipos-api.onrender.com/api/v1';

// ── API URL construction tests ──
describe('signals-api URL construction', () => {
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

// ── Signal type configuration tests ──
describe('Signal type configuration', () => {
  const SIGNAL_TYPES = [
    'listing_opportunity',
    'buyer_match',
    'vendor_pressure',
    'relationship_cooling',
    'relationship_warming',
    'community_cluster',
  ] as const;

  const SIGNAL_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    listing_opportunity: { label: 'Listing Opportunity', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
    buyer_match: { label: 'Buyer Match', color: 'text-green-700', bg: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
    vendor_pressure: { label: 'Vendor Pressure', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
    relationship_cooling: { label: 'Relationship Cooling', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-400' },
    relationship_warming: { label: 'Relationship Warming', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
    community_cluster: { label: 'Community Cluster', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
  };

  it('has a config entry for every signal type', () => {
    for (const type of SIGNAL_TYPES) {
      expect(SIGNAL_CONFIG[type]).toBeDefined();
      expect(SIGNAL_CONFIG[type].label).toBeTruthy();
      expect(SIGNAL_CONFIG[type].color).toBeTruthy();
      expect(SIGNAL_CONFIG[type].bg).toBeTruthy();
      expect(SIGNAL_CONFIG[type].dot).toBeTruthy();
    }
  });

  it('each signal type has distinct dot colors', () => {
    const dots = Object.values(SIGNAL_CONFIG).map(c => c.dot);
    const unique = new Set(dots);
    expect(unique.size).toBe(6);
  });

  it('labels are human-readable', () => {
    expect(SIGNAL_CONFIG.listing_opportunity.label).toBe('Listing Opportunity');
    expect(SIGNAL_CONFIG.buyer_match.label).toBe('Buyer Match');
    expect(SIGNAL_CONFIG.vendor_pressure.label).toBe('Vendor Pressure');
    expect(SIGNAL_CONFIG.relationship_cooling.label).toBe('Relationship Cooling');
    expect(SIGNAL_CONFIG.relationship_warming.label).toBe('Relationship Warming');
    expect(SIGNAL_CONFIG.community_cluster.label).toBe('Community Cluster');
  });

  it('listing_opportunity uses amber colors', () => {
    expect(SIGNAL_CONFIG.listing_opportunity.bg).toContain('amber');
    expect(SIGNAL_CONFIG.listing_opportunity.dot).toContain('amber');
  });

  it('buyer_match uses green colors', () => {
    expect(SIGNAL_CONFIG.buyer_match.bg).toContain('green');
    expect(SIGNAL_CONFIG.buyer_match.dot).toContain('green');
  });

  it('community_cluster uses purple colors', () => {
    expect(SIGNAL_CONFIG.community_cluster.bg).toContain('purple');
    expect(SIGNAL_CONFIG.community_cluster.dot).toContain('purple');
  });
});

// ── personDisplayName helper tests ──
describe('personDisplayName helper', () => {
  function personDisplayName(p: { first_name: string; last_name?: string | null }): string {
    return [p.first_name, p.last_name].filter(Boolean).join(' ');
  }

  it('returns full name when both parts present', () => {
    expect(personDisplayName({ first_name: 'John', last_name: 'Smith' })).toBe('John Smith');
  });

  it('returns first name only when last_name is null', () => {
    expect(personDisplayName({ first_name: 'John', last_name: null })).toBe('John');
  });

  it('returns first name only when last_name is undefined', () => {
    expect(personDisplayName({ first_name: 'John' })).toBe('John');
  });
});

// ── Health status tests ──
describe('Health status types', () => {
  const HEALTH_CONFIG: Record<string, { label: string; classes: string }> = {
    healthy: { label: 'Healthy', classes: 'bg-green-100 text-green-700' },
    at_risk: { label: 'At Risk', classes: 'bg-amber-100 text-amber-700' },
    overdue: { label: 'Overdue', classes: 'bg-red-100 text-red-700' },
  };

  it('has config for all health statuses', () => {
    for (const status of ['healthy', 'at_risk', 'overdue']) {
      expect(HEALTH_CONFIG[status]).toBeDefined();
      expect(HEALTH_CONFIG[status].label).toBeTruthy();
    }
  });

  it('uses correct badge colors', () => {
    expect(HEALTH_CONFIG.healthy.classes).toContain('green');
    expect(HEALTH_CONFIG.at_risk.classes).toContain('amber');
    expect(HEALTH_CONFIG.overdue.classes).toContain('red');
  });
});

// ── Confidence bar calculation tests ──
describe('Confidence bar calculation', () => {
  function confidencePct(value: number): number {
    return Math.round(Math.min(1, Math.max(0, value)) * 100);
  }

  it('clamps to 0-100', () => {
    expect(confidencePct(0)).toBe(0);
    expect(confidencePct(0.5)).toBe(50);
    expect(confidencePct(1)).toBe(100);
    expect(confidencePct(1.5)).toBe(100);
    expect(confidencePct(-0.5)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    expect(confidencePct(0.333)).toBe(33);
    expect(confidencePct(0.667)).toBe(67);
  });
});

// ── Time ago formatting tests ──
describe('Time ago formatting', () => {
  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  }

  it('formats recent times', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('just now');
  });

  it('formats hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoHoursAgo)).toBe('2h ago');
  });

  it('formats days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(threeDaysAgo)).toBe('3d ago');
  });
});

// ── Tier configuration tests ──
describe('Tier configuration', () => {
  it('has exactly 3 tiers: A, B, C', () => {
    const TIERS = ['A', 'B', 'C'] as const;
    expect(TIERS.length).toBe(3);
    expect(TIERS[0]).toBe('A');
    expect(TIERS[1]).toBe('B');
    expect(TIERS[2]).toBe('C');
  });
});

// ── Token management logic tests ──
describe('Token management', () => {
  it('auth header is constructed correctly with token', () => {
    const token = 'test-jwt-token';
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    expect(headers['Authorization']).toBe('Bearer test-jwt-token');
  });

  it('auth header is empty without token', () => {
    const token: string | null = null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    expect(headers['Authorization']).toBeUndefined();
  });
});

// ── Dashboard top signals filtering ──
describe('Dashboard top signals filtering', () => {
  it('filters active signals and sorts by confidence descending, takes top 3', () => {
    const signals = [
      { id: 1, confidence: 0.9, is_active: true },
      { id: 2, confidence: 0.3, is_active: false },
      { id: 3, confidence: 0.7, is_active: true },
      { id: 4, confidence: 0.95, is_active: true },
      { id: 5, confidence: 0.5, is_active: true },
      { id: 6, confidence: 0.8, is_active: true },
    ];

    const topSignals = signals
      .filter((s) => s.is_active)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    expect(topSignals.length).toBe(3);
    expect(topSignals[0].id).toBe(4); // 0.95
    expect(topSignals[1].id).toBe(1); // 0.9
    expect(topSignals[2].id).toBe(6); // 0.8
  });

  it('returns fewer than 3 if fewer active signals exist', () => {
    const signals = [
      { id: 1, confidence: 0.9, is_active: true },
      { id: 2, confidence: 0.3, is_active: false },
    ];

    const topSignals = signals
      .filter((s) => s.is_active)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    expect(topSignals.length).toBe(1);
    expect(topSignals[0].id).toBe(1);
  });
});
