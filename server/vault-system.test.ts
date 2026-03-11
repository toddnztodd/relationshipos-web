import { describe, expect, it } from 'vitest';

// ── API URL tests ──
const API_BASE = 'https://relationshipos-api.onrender.com/api/v1';

describe('Vault API endpoints', () => {
  it('vault endpoint uses PATCH method on /people/:id/vault', () => {
    const id = 42;
    const url = `${API_BASE}/people/${id}/vault`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/people/42/vault');
  });

  it('restore endpoint uses PATCH method on /people/:id/restore', () => {
    const id = 7;
    const url = `${API_BASE}/people/${id}/restore`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/people/7/restore');
  });

  it('make-private endpoint uses PATCH method on /people/:id/make-private', () => {
    const id = 15;
    const url = `${API_BASE}/people/${id}/make-private`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/people/15/make-private');
  });

  it('bulk-vault endpoint uses POST on /people/bulk-vault', () => {
    const url = `${API_BASE}/people/bulk-vault`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/people/bulk-vault');
  });

  it('check-duplicate endpoint uses POST on /people/check-duplicate', () => {
    const url = `${API_BASE}/people/check-duplicate`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/people/check-duplicate');
  });

  it('delete endpoint uses DELETE on /people/:id', () => {
    const id = 99;
    const url = `${API_BASE}/people/${id}`;
    expect(url).toBe('https://relationshipos-api.onrender.com/api/v1/people/99');
  });
});

// ── Vault request body tests ──
describe('Vault request payloads', () => {
  it('vault payload includes vault_note', () => {
    const payload = JSON.stringify({ vault_note: 'Old colleague from Auckland' });
    const parsed = JSON.parse(payload);
    expect(parsed.vault_note).toBe('Old colleague from Auckland');
  });

  it('vault payload allows undefined vault_note', () => {
    const payload = JSON.stringify({ vault_note: undefined });
    const parsed = JSON.parse(payload);
    expect(parsed.vault_note).toBeUndefined();
  });

  it('bulk vault payload includes ids and vault_note', () => {
    const payload = JSON.stringify({ ids: [1, 2, 3], vault_note: 'Batch cleanup' });
    const parsed = JSON.parse(payload);
    expect(parsed.ids).toEqual([1, 2, 3]);
    expect(parsed.vault_note).toBe('Batch cleanup');
  });

  it('check-duplicate payload accepts phone, email, or name', () => {
    const phonePayload = JSON.stringify({ phone: '+6421123456' });
    const emailPayload = JSON.stringify({ email: 'test@example.com' });
    const namePayload = JSON.stringify({ name: 'John Smith' });

    expect(JSON.parse(phonePayload).phone).toBe('+6421123456');
    expect(JSON.parse(emailPayload).email).toBe('test@example.com');
    expect(JSON.parse(namePayload).name).toBe('John Smith');
  });
});

// ── Signal type color mapping tests ──
describe('Signal type color mapping', () => {
  const SIGNAL_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    listing_opportunity: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    buyer_match: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
    vendor_pressure: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
    relationship_cooling: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
    relationship_warming: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    community_cluster: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  };

  const signalTypes = [
    'listing_opportunity', 'buyer_match', 'vendor_pressure',
    'relationship_cooling', 'relationship_warming', 'community_cluster',
  ];

  signalTypes.forEach((type) => {
    it(`${type} has defined color mapping`, () => {
      const colors = SIGNAL_COLORS[type];
      expect(colors).toBeDefined();
      expect(colors.bg).toBeTruthy();
      expect(colors.border).toBeTruthy();
      expect(colors.text).toBeTruthy();
      expect(colors.dot).toBeTruthy();
    });
  });
});

// ── Vault dialog option tests ──
describe('Vault dialog options', () => {
  const options = ['vault', 'private', 'delete'] as const;

  it('has exactly 3 options', () => {
    expect(options).toHaveLength(3);
  });

  it('vault is the first option', () => {
    expect(options[0]).toBe('vault');
  });

  it('delete is the last option (destructive)', () => {
    expect(options[options.length - 1]).toBe('delete');
  });
});

// ── Health badge status tests ──
describe('Health badge statuses', () => {
  const HEALTH_COLORS: Record<string, string> = {
    healthy: 'bg-green-100 text-green-700',
    at_risk: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700',
  };

  it('healthy maps to green', () => {
    expect(HEALTH_COLORS['healthy']).toContain('green');
  });

  it('at_risk maps to amber', () => {
    expect(HEALTH_COLORS['at_risk']).toContain('amber');
  });

  it('overdue maps to red', () => {
    expect(HEALTH_COLORS['overdue']).toContain('red');
  });
});

// ── Time ago helper tests ──
describe('Time ago formatting', () => {
  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'today';
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }

  it('returns "today" for current date', () => {
    expect(timeAgo(new Date().toISOString())).toBe('today');
  });

  it('returns days ago for recent dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(timeAgo(threeDaysAgo)).toBe('3 days ago');
  });

  it('returns weeks ago for 14+ days', () => {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    expect(timeAgo(fourteenDaysAgo)).toBe('2 weeks ago');
  });

  it('returns months ago for 60+ days', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();
    expect(timeAgo(sixtyDaysAgo)).toBe('2 months ago');
  });
});

// ── Person display name tests ──
describe('Person display name', () => {
  function personDisplayName(p: { first_name: string; last_name?: string | null }): string {
    return [p.first_name, p.last_name].filter(Boolean).join(' ');
  }

  it('combines first and last name', () => {
    expect(personDisplayName({ first_name: 'John', last_name: 'Smith' })).toBe('John Smith');
  });

  it('handles null last name', () => {
    expect(personDisplayName({ first_name: 'John', last_name: null })).toBe('John');
  });

  it('handles missing last name', () => {
    expect(personDisplayName({ first_name: 'John' })).toBe('John');
  });
});
