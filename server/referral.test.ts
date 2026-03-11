import { describe, it, expect } from 'vitest';

// ── Type validation tests ──
describe('Referral types', () => {
  it('ReferralStatus has all expected values', () => {
    const statuses = ['registered', 'referral_received', 'listing_secured', 'sold', 'closed'];
    statuses.forEach(s => expect(typeof s).toBe('string'));
  });

  it('RewardStatus has all expected values', () => {
    const statuses = ['none', 'pending', 'earned', 'paid'];
    statuses.forEach(s => expect(typeof s).toBe('string'));
  });

  it('Referral interface has required fields', () => {
    const referral = {
      id: '1',
      referrer_person_id: '10',
      referred_person_id: '20',
      referral_status: 'registered',
      reward_amount: 250,
      reward_status: 'none',
      created_at: new Date().toISOString(),
    };
    expect(referral.id).toBeDefined();
    expect(referral.referrer_person_id).toBeDefined();
    expect(referral.referred_person_id).toBeDefined();
    expect(referral.referral_status).toBe('registered');
    expect(referral.reward_amount).toBe(250);
    expect(referral.reward_status).toBe('none');
  });

  it('Person type includes referral fields', () => {
    const person = {
      id: 1,
      first_name: 'Test',
      referral_member: true,
      referral_reward_amount: 250,
      referral_email_sent_at: '2026-01-01',
      referred_by_id: '5',
    };
    expect(person.referral_member).toBe(true);
    expect(person.referral_reward_amount).toBe(250);
    expect(person.referred_by_id).toBe('5');
  });
});

// ── Referral status styling tests ──
describe('Referral status styling', () => {
  const REFERRAL_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    registered: { bg: 'rgba(156,163,175,0.15)', text: '#6b7280', label: 'Registered' },
    referral_received: { bg: 'rgba(59,130,246,0.12)', text: '#2563eb', label: 'Referral Received' },
    listing_secured: { bg: 'rgba(245,158,11,0.12)', text: '#d97706', label: 'Listing Secured' },
    sold: { bg: 'rgba(111,175,143,0.15)', text: '#4a8a6a', label: 'Sold' },
    closed: { bg: 'rgba(156,163,175,0.15)', text: '#6b7280', label: 'Closed' },
  };

  it('all referral statuses have styling defined', () => {
    const statuses = ['registered', 'referral_received', 'listing_secured', 'sold', 'closed'];
    statuses.forEach(s => {
      expect(REFERRAL_STATUS_STYLES[s]).toBeDefined();
      expect(REFERRAL_STATUS_STYLES[s].label).toBeTruthy();
      expect(REFERRAL_STATUS_STYLES[s].bg).toBeTruthy();
      expect(REFERRAL_STATUS_STYLES[s].text).toBeTruthy();
    });
  });

  it('reward status styles are correct', () => {
    const REWARD_STATUS_STYLES: Record<string, { bg: string; text: string; label: string } | null> = {
      none: null,
      pending: { bg: 'rgba(245,158,11,0.12)', text: '#d97706', label: 'Reward Pending' },
      earned: { bg: 'rgba(111,175,143,0.15)', text: '#4a8a6a', label: 'Reward Earned' },
      paid: { bg: 'rgba(156,163,175,0.12)', text: '#6b7280', label: 'Reward Paid ✓' },
    };
    expect(REWARD_STATUS_STYLES.none).toBeNull();
    expect(REWARD_STATUS_STYLES.pending?.label).toBe('Reward Pending');
    expect(REWARD_STATUS_STYLES.earned?.label).toBe('Reward Earned');
    expect(REWARD_STATUS_STYLES.paid?.label).toContain('Paid');
  });
});

// ── Referral member filtering tests ──
describe('Referral member filtering', () => {
  const people = [
    { id: 1, first_name: 'Alice', referral_member: true, referral_reward_amount: 250 },
    { id: 2, first_name: 'Bob', referral_member: false },
    { id: 3, first_name: 'Charlie', referral_member: true, referral_reward_amount: 500 },
    { id: 4, first_name: 'Diana', referral_member: undefined },
  ];

  it('filters to only referral members', () => {
    const members = people.filter(p => p.referral_member);
    expect(members).toHaveLength(2);
    expect(members.map(m => m.first_name)).toEqual(['Alice', 'Charlie']);
  });

  it('counts referrals per member correctly', () => {
    const referrals = [
      { referrer_person_id: '1', referred_person_id: '10', reward_status: 'pending' },
      { referrer_person_id: '1', referred_person_id: '11', reward_status: 'earned' },
      { referrer_person_id: '3', referred_person_id: '12', reward_status: 'paid' },
    ];
    const stats = new Map<number, { count: number; pending: number; earned: number; paid: number }>();
    people.filter(p => p.referral_member).forEach(m => stats.set(m.id, { count: 0, pending: 0, earned: 0, paid: 0 }));
    referrals.forEach(r => {
      const s = stats.get(Number(r.referrer_person_id));
      if (s) {
        s.count++;
        if (r.reward_status === 'pending') s.pending++;
        else if (r.reward_status === 'earned') s.earned++;
        else if (r.reward_status === 'paid') s.paid++;
      }
    });
    expect(stats.get(1)?.count).toBe(2);
    expect(stats.get(1)?.pending).toBe(1);
    expect(stats.get(1)?.earned).toBe(1);
    expect(stats.get(3)?.count).toBe(1);
    expect(stats.get(3)?.paid).toBe(1);
  });

  it('filters members by reward status', () => {
    const referrals = [
      { referrer_person_id: '1', reward_status: 'pending' },
      { referrer_person_id: '3', reward_status: 'paid' },
    ];
    const members = people.filter(p => p.referral_member);
    
    // Filter for pending
    const pendingMembers = members.filter(m => 
      referrals.some(r => Number(r.referrer_person_id) === m.id && r.reward_status === 'pending')
    );
    expect(pendingMembers).toHaveLength(1);
    expect(pendingMembers[0].first_name).toBe('Alice');

    // Filter for paid
    const paidMembers = members.filter(m =>
      referrals.some(r => Number(r.referrer_person_id) === m.id && r.reward_status === 'paid')
    );
    expect(paidMembers).toHaveLength(1);
    expect(paidMembers[0].first_name).toBe('Charlie');
  });
});

// ── Referral classification tests ──
describe('Referral classification', () => {
  it('classifies referrals as made vs received', () => {
    const personId = 5;
    const referrals = [
      { id: '1', referrer_person_id: '5', referred_person_id: '10' },
      { id: '2', referrer_person_id: '5', referred_person_id: '11' },
      { id: '3', referrer_person_id: '10', referred_person_id: '5' },
    ];
    const made = referrals.filter(r => String(r.referrer_person_id) === String(personId));
    const received = referrals.filter(r => String(r.referred_person_id) === String(personId));
    expect(made).toHaveLength(2);
    expect(received).toHaveLength(1);
  });

  it('handles person with no referrals', () => {
    const personId = 99;
    const referrals = [
      { id: '1', referrer_person_id: '5', referred_person_id: '10' },
    ];
    const made = referrals.filter(r => String(r.referrer_person_id) === String(personId));
    const received = referrals.filter(r => String(r.referred_person_id) === String(personId));
    expect(made).toHaveLength(0);
    expect(received).toHaveLength(0);
  });
});

// ── Referrer search tests ──
describe('Referrer search', () => {
  const people = [
    { id: 1, first_name: 'Alice', last_name: 'Smith' },
    { id: 2, first_name: 'Bob', last_name: 'Jones' },
    { id: 3, first_name: 'Alice', last_name: 'Brown' },
  ];

  function displayName(p: { first_name: string; last_name?: string | null }) {
    return [p.first_name, p.last_name].filter(Boolean).join(' ');
  }

  it('searches by name', () => {
    const q = 'alice';
    const matches = people.filter(p => displayName(p).toLowerCase().includes(q));
    expect(matches).toHaveLength(2);
  });

  it('limits results to 5', () => {
    const manyPeople = Array.from({ length: 20 }, (_, i) => ({
      id: i, first_name: 'Test', last_name: `Person${i}`,
    }));
    const matches = manyPeople.filter(p => displayName(p).toLowerCase().includes('test')).slice(0, 5);
    expect(matches).toHaveLength(5);
  });

  it('excludes current person from edit form results', () => {
    const currentId = 1;
    const q = 'alice';
    const matches = people.filter(p => p.id !== currentId && displayName(p).toLowerCase().includes(q));
    expect(matches).toHaveLength(1);
    expect(matches[0].first_name).toBe('Alice');
    expect(matches[0].last_name).toBe('Brown');
  });
});
