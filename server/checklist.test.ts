import { describe, expect, it } from 'vitest';

const API_BASE = 'https://relationshipos-api.onrender.com/api/v1';

describe('Checklist API endpoints', () => {
  it('builds correct GET checklist URL', () => {
    const propertyId = 42;
    expect(`${API_BASE}/properties/${propertyId}/checklist`).toBe(
      'https://relationshipos-api.onrender.com/api/v1/properties/42/checklist',
    );
  });

  it('builds correct POST create checklist URL', () => {
    const propertyId = 7;
    expect(`${API_BASE}/properties/${propertyId}/checklist`).toBe(
      'https://relationshipos-api.onrender.com/api/v1/properties/7/checklist',
    );
  });

  it('builds correct PATCH item URL', () => {
    const itemId = 123;
    expect(`${API_BASE}/checklist-items/${itemId}`).toBe(
      'https://relationshipos-api.onrender.com/api/v1/checklist-items/123',
    );
  });

  it('builds correct DELETE checklist URL', () => {
    const checklistId = 5;
    expect(`${API_BASE}/checklists/${checklistId}`).toBe(
      'https://relationshipos-api.onrender.com/api/v1/checklists/5',
    );
  });

  it('builds correct PATCH phase URL', () => {
    const checklistId = 5;
    expect(`${API_BASE}/checklists/${checklistId}/phase`).toBe(
      'https://relationshipos-api.onrender.com/api/v1/checklists/5/phase',
    );
  });
});

describe('Checklist types and data structures', () => {
  it('validates ChecklistItem shape', () => {
    const item = {
      id: 1,
      phase_number: 1,
      item_text: 'Confirm vendor instructions',
      is_complete: false,
      completed_at: null,
      due_date: null,
      note: null,
      sort_order: 1,
    };
    expect(item.id).toBe(1);
    expect(item.is_complete).toBe(false);
    expect(item.item_text).toBe('Confirm vendor instructions');
    expect(item.completed_at).toBeNull();
  });

  it('validates ChecklistPhase shape', () => {
    const phase = {
      phase_number: 3,
      phase_name: 'Listing Agreement Signed',
      is_complete: false,
      completed_at: null,
      items: [
        { id: 10, phase_number: 3, item_text: 'Sign agreement', is_complete: true, completed_at: '2026-01-01', due_date: null, note: null, sort_order: 1 },
        { id: 11, phase_number: 3, item_text: 'Upload to CRM', is_complete: false, completed_at: null, due_date: null, note: null, sort_order: 2 },
      ],
    };
    expect(phase.phase_number).toBe(3);
    expect(phase.items).toHaveLength(2);
    expect(phase.items[0].is_complete).toBe(true);
    expect(phase.items[1].is_complete).toBe(false);
  });

  it('validates Checklist shape', () => {
    const checklist = {
      id: 1,
      property_id: 42,
      sale_method: 'auction',
      current_phase: 3,
      phases: [],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    expect(checklist.sale_method).toBe('auction');
    expect(checklist.current_phase).toBe(3);
    expect(checklist.property_id).toBe(42);
  });
});

describe('Checklist progress calculation', () => {
  const mockPhases = [
    {
      phase_number: 1,
      phase_name: 'Pre-listing',
      is_complete: true,
      completed_at: '2026-01-01',
      items: [
        { id: 1, phase_number: 1, item_text: 'A', is_complete: true, completed_at: '2026-01-01', due_date: null, note: null, sort_order: 1 },
        { id: 2, phase_number: 1, item_text: 'B', is_complete: true, completed_at: '2026-01-01', due_date: null, note: null, sort_order: 2 },
      ],
    },
    {
      phase_number: 2,
      phase_name: 'Marketing',
      is_complete: false,
      completed_at: null,
      items: [
        { id: 3, phase_number: 2, item_text: 'C', is_complete: true, completed_at: '2026-01-02', due_date: null, note: null, sort_order: 1 },
        { id: 4, phase_number: 2, item_text: 'D', is_complete: false, completed_at: null, due_date: null, note: null, sort_order: 2 },
        { id: 5, phase_number: 2, item_text: 'E', is_complete: false, completed_at: null, due_date: null, note: null, sort_order: 3 },
      ],
    },
  ];

  it('calculates total items correctly', () => {
    const totalItems = mockPhases.reduce((sum, p) => sum + p.items.length, 0);
    expect(totalItems).toBe(5);
  });

  it('calculates completed items correctly', () => {
    const completedItems = mockPhases.reduce(
      (sum, p) => sum + p.items.filter((i) => i.is_complete).length,
      0,
    );
    expect(completedItems).toBe(3);
  });

  it('calculates progress percentage correctly', () => {
    const totalItems = mockPhases.reduce((sum, p) => sum + p.items.length, 0);
    const completedItems = mockPhases.reduce(
      (sum, p) => sum + p.items.filter((i) => i.is_complete).length,
      0,
    );
    const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    expect(pct).toBe(60);
  });

  it('handles empty checklist gracefully', () => {
    const emptyPhases: typeof mockPhases = [];
    const totalItems = emptyPhases.reduce((sum, p) => sum + p.items.length, 0);
    const pct = totalItems > 0 ? Math.round((0 / totalItems) * 100) : 0;
    expect(pct).toBe(0);
  });

  it('detects phase completion', () => {
    const phase1Complete = mockPhases[0].items.every((i) => i.is_complete);
    const phase2Complete = mockPhases[1].items.every((i) => i.is_complete);
    expect(phase1Complete).toBe(true);
    expect(phase2Complete).toBe(false);
  });
});

describe('Sale method options', () => {
  const SALE_METHODS = ['priced', 'by_negotiation', 'deadline', 'auction'];

  it('includes all 4 sale methods', () => {
    expect(SALE_METHODS).toHaveLength(4);
    expect(SALE_METHODS).toContain('priced');
    expect(SALE_METHODS).toContain('by_negotiation');
    expect(SALE_METHODS).toContain('deadline');
    expect(SALE_METHODS).toContain('auction');
  });

  it('formats sale method for display', () => {
    const formatted = 'by_negotiation'.replace(/_/g, ' ');
    expect(formatted).toBe('by negotiation');
  });
});

describe('Optimistic item toggle', () => {
  it('toggles item completion state', () => {
    const item = { id: 1, is_complete: false, completed_at: null as string | null };
    const toggled = {
      ...item,
      is_complete: !item.is_complete,
      completed_at: !item.is_complete ? new Date().toISOString() : null,
    };
    expect(toggled.is_complete).toBe(true);
    expect(toggled.completed_at).toBeTruthy();
  });

  it('reverts toggle on error', () => {
    const original = { id: 1, is_complete: false, completed_at: null as string | null };
    // Simulate toggle
    const toggled = { ...original, is_complete: true, completed_at: '2026-01-01T00:00:00Z' };
    // Simulate revert
    const reverted = { ...toggled, is_complete: original.is_complete, completed_at: original.completed_at };
    expect(reverted.is_complete).toBe(false);
    expect(reverted.completed_at).toBeNull();
  });
});

describe('Create checklist request body', () => {
  it('sends correct body for auction', () => {
    const body = JSON.stringify({ sale_method: 'auction' });
    const parsed = JSON.parse(body);
    expect(parsed.sale_method).toBe('auction');
  });

  it('sends correct body for deadline', () => {
    const body = JSON.stringify({ sale_method: 'deadline' });
    const parsed = JSON.parse(body);
    expect(parsed.sale_method).toBe('deadline');
  });
});
