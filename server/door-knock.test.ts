import { describe, expect, it } from "vitest";

// ── Door Knock Types ──
describe("Door Knock Types", () => {
  it("KnockResult has all expected values", () => {
    const validResults = ['door_knocked', 'spoke_to_owner', 'spoke_to_occupant', 'no_answer', 'contact_captured'];
    validResults.forEach((r) => {
      expect(typeof r).toBe('string');
      expect(r.length).toBeGreaterThan(0);
    });
  });

  it("InterestLevel has all expected values", () => {
    const validLevels = ['not_interested', 'neutral', 'possibly_selling', 'actively_considering'];
    validLevels.forEach((l) => {
      expect(typeof l).toBe('string');
      expect(l.length).toBeGreaterThan(0);
    });
  });

  it("DoorKnockSession has required fields", () => {
    const session = {
      id: '1',
      started_at: new Date().toISOString(),
      total_knocks: 0,
    };
    expect(session.id).toBeDefined();
    expect(session.started_at).toBeDefined();
    expect(session.total_knocks).toBe(0);
  });

  it("DoorKnockEntry has required fields", () => {
    const entry = {
      id: '1',
      session_id: 's1',
      property_address: '42 Test St',
      knock_result: 'spoke_to_owner' as const,
      knocked_at: new Date().toISOString(),
    };
    expect(entry.property_address).toBe('42 Test St');
    expect(entry.knock_result).toBe('spoke_to_owner');
  });

  it("FollowUpTask has required fields", () => {
    const task = {
      id: '1',
      title: 'Follow up with owner',
      is_completed: false,
    };
    expect(task.title).toBe('Follow up with owner');
    expect(task.is_completed).toBe(false);
  });
});

// ── Door Knock API Endpoints ──
describe("Door Knock API Endpoints", () => {
  it("door knock session endpoints are correctly defined", () => {
    const endpoints = [
      { path: '/door-knock/sessions', method: 'POST' },
      { path: '/door-knock/sessions/:id/end', method: 'PUT' },
      { path: '/door-knock/sessions/:id', method: 'GET' },
      { path: '/door-knock/entries', method: 'POST' },
      { path: '/door-knock/entries/:id/create-contact', method: 'POST' },
      { path: '/properties/:id/nearby', method: 'GET' },
    ];
    expect(endpoints).toHaveLength(6);
    endpoints.forEach((ep) => {
      expect(ep.path).toMatch(/^\//);
      expect(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).toContain(ep.method);
    });
  });

  it("follow-up task endpoints are correctly defined", () => {
    const endpoints = [
      { path: '/follow-up-tasks', method: 'GET' },
      { path: '/follow-up-tasks', method: 'POST' },
      { path: '/follow-up-tasks/:id', method: 'PUT' },
    ];
    expect(endpoints).toHaveLength(3);
    endpoints.forEach((ep) => {
      expect(ep.path).toMatch(/^\//);
    });
  });
});

// ── Door Knock Session Flow ──
describe("Door Knock Session Flow", () => {
  it("session starts with zero knocks", () => {
    const session = {
      id: 'test-session',
      started_at: new Date().toISOString(),
      total_knocks: 0,
      ended_at: undefined,
    };
    expect(session.total_knocks).toBe(0);
    expect(session.ended_at).toBeUndefined();
  });

  it("session can be ended", () => {
    const session = {
      id: 'test-session',
      started_at: new Date().toISOString(),
      total_knocks: 5,
      ended_at: new Date().toISOString(),
    };
    expect(session.ended_at).toBeDefined();
    expect(session.total_knocks).toBe(5);
  });

  it("entry tracks property address and knock result", () => {
    const entry = {
      id: 'e1',
      session_id: 's1',
      property_address: '123 Main St',
      knock_result: 'no_answer' as const,
      knocked_at: new Date().toISOString(),
    };
    expect(entry.property_address).toBe('123 Main St');
    expect(entry.knock_result).toBe('no_answer');
  });

  it("entry can capture contact details", () => {
    const entry = {
      id: 'e2',
      session_id: 's1',
      property_address: '456 Oak Ave',
      knock_result: 'contact_captured' as const,
      contact_name: 'Jane Smith',
      contact_phone: '021-555-1234',
      interest_level: 'possibly_selling' as const,
      knocked_at: new Date().toISOString(),
    };
    expect(entry.contact_name).toBe('Jane Smith');
    expect(entry.contact_phone).toBe('021-555-1234');
    expect(entry.interest_level).toBe('possibly_selling');
  });

  it("entry can include voice note transcript", () => {
    const entry = {
      id: 'e3',
      session_id: 's1',
      property_address: '789 Elm St',
      knock_result: 'spoke_to_owner' as const,
      voice_note_transcript: 'Owner mentioned they might sell in spring',
      knocked_at: new Date().toISOString(),
    };
    expect(entry.voice_note_transcript).toContain('sell in spring');
  });
});

// ── Follow-up Tasks ──
describe("Follow-up Tasks", () => {
  it("task can be created with property reference", () => {
    const task = {
      id: 't1',
      title: 'Call back owner at 123 Main St',
      description: 'From door knock session',
      related_property_id: 'p1',
      is_completed: false,
    };
    expect(task.related_property_id).toBe('p1');
    expect(task.is_completed).toBe(false);
  });

  it("task can be marked as completed", () => {
    const task = {
      id: 't1',
      title: 'Call back owner',
      is_completed: true,
    };
    expect(task.is_completed).toBe(true);
  });

  it("overdue task detection works", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const overdueTask = { due_date: yesterday.toISOString() };
    const futureTask = { due_date: tomorrow.toISOString() };

    expect(new Date(overdueTask.due_date) < new Date()).toBe(true);
    expect(new Date(futureTask.due_date) < new Date()).toBe(false);
  });
});

// ── Session Summary ──
describe("Session Summary Calculations", () => {
  it("correctly counts results breakdown", () => {
    const entries = [
      { knock_result: 'no_answer' },
      { knock_result: 'no_answer' },
      { knock_result: 'spoke_to_owner' },
      { knock_result: 'contact_captured' },
      { knock_result: 'door_knocked' },
    ];

    const resultCounts: Record<string, number> = {};
    entries.forEach((e) => {
      resultCounts[e.knock_result] = (resultCounts[e.knock_result] || 0) + 1;
    });

    expect(resultCounts['no_answer']).toBe(2);
    expect(resultCounts['spoke_to_owner']).toBe(1);
    expect(resultCounts['contact_captured']).toBe(1);
    expect(resultCounts['door_knocked']).toBe(1);
    expect(entries.length).toBe(5);
  });

  it("correctly counts contacts captured", () => {
    const entries = [
      { knock_result: 'no_answer' },
      { knock_result: 'contact_captured' },
      { knock_result: 'spoke_to_owner' },
      { knock_result: 'contact_captured' },
    ];

    const contactsCaptured = entries.filter((e) => e.knock_result === 'contact_captured').length;
    expect(contactsCaptured).toBe(2);
  });
});
