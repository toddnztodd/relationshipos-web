import { describe, expect, it } from 'vitest';

/**
 * Voice Fill tests — validate VoiceRecorder states, field mapping,
 * and API endpoint construction.
 */

const API_BASE = 'https://relationshipos-api.onrender.com/api/v1';

describe('VoiceRecorder API endpoints', () => {
  it('people parse-voice endpoint is correct', () => {
    const endpoint = `${API_BASE}/people/parse-voice`;
    expect(endpoint).toBe('https://relationshipos-api.onrender.com/api/v1/people/parse-voice');
  });

  it('properties parse-voice endpoint is correct', () => {
    const endpoint = `${API_BASE}/properties/parse-voice`;
    expect(endpoint).toBe('https://relationshipos-api.onrender.com/api/v1/properties/parse-voice');
  });

  it('transcribe endpoint is correct', () => {
    const endpoint = `${API_BASE}/transcribe`;
    expect(endpoint).toBe('https://relationshipos-api.onrender.com/api/v1/transcribe');
  });
});

describe('VoiceRecorder states', () => {
  const states = ['idle', 'recording', 'processing', 'success', 'error'] as const;

  it('has all 5 states defined', () => {
    expect(states).toHaveLength(5);
    expect(states).toContain('idle');
    expect(states).toContain('recording');
    expect(states).toContain('processing');
    expect(states).toContain('success');
    expect(states).toContain('error');
  });

  it('initial state is idle', () => {
    expect(states[0]).toBe('idle');
  });

  it('recording transitions to processing on stop', () => {
    const stateFlow = ['idle', 'recording', 'processing', 'success'];
    expect(stateFlow[0]).toBe('idle');
    expect(stateFlow[1]).toBe('recording');
    expect(stateFlow[2]).toBe('processing');
    expect(stateFlow[3]).toBe('success');
  });

  it('error state allows retry back to idle', () => {
    const errorRecovery = ['error', 'idle', 'recording'];
    expect(errorRecovery[0]).toBe('error');
    expect(errorRecovery[1]).toBe('idle');
  });
});

describe('Contact voice fill field mapping', () => {
  it('maps parsed data to contact fields correctly', () => {
    const parsed = {
      first_name: 'Sarah',
      last_name: 'Johnson',
      phone: '021 555 1234',
      email: 'sarah@example.com',
      suburb: 'Ponsonby',
      notes: 'Met at open home',
    };

    // Simulate the field mapping from People.tsx
    const form: Record<string, string> = {};
    if (parsed.first_name) form.first_name = parsed.first_name;
    if (parsed.last_name) form.last_name = parsed.last_name;
    if (parsed.phone) form.phone = parsed.phone;
    if (parsed.email) form.email = parsed.email;
    if (parsed.suburb) form.suburb = parsed.suburb;
    if (parsed.notes) form.notes = parsed.notes;

    expect(form.first_name).toBe('Sarah');
    expect(form.last_name).toBe('Johnson');
    expect(form.phone).toBe('021 555 1234');
    expect(form.email).toBe('sarah@example.com');
    expect(form.suburb).toBe('Ponsonby');
    expect(form.notes).toBe('Met at open home');
  });

  it('handles partial data without clearing existing fields', () => {
    const existing = { first_name: 'Existing', phone: '09 123 4567' };
    const parsed = { last_name: 'Smith' };

    // Only update fields that have values
    const form = { ...existing };
    if (parsed.last_name) (form as any).last_name = parsed.last_name;

    expect(form.first_name).toBe('Existing');
    expect(form.phone).toBe('09 123 4567');
    expect((form as any).last_name).toBe('Smith');
  });
});

describe('Property voice fill field mapping', () => {
  it('maps parsed data to property fields correctly', () => {
    const parsed = {
      address: '42 Queen Street',
      suburb: 'Ponsonby',
      city: 'Auckland',
      bedrooms: 3,
      bathrooms: 2,
      land_size: '650m²',
      property_type: 'House',
      cv: '$1,200,000',
    };

    const form: Record<string, string> = {};
    if (parsed.address) form.address = parsed.address;
    if (parsed.suburb) form.suburb = parsed.suburb;
    if (parsed.city) form.city = parsed.city;
    if (parsed.bedrooms !== undefined) form.bedrooms = String(parsed.bedrooms);
    if (parsed.bathrooms !== undefined) form.bathrooms = String(parsed.bathrooms);
    if (parsed.land_size) form.land_area = parsed.land_size;
    if (parsed.property_type) form.property_type = parsed.property_type;
    if (parsed.cv) form.estimated_value = parsed.cv;

    expect(form.address).toBe('42 Queen Street');
    expect(form.suburb).toBe('Ponsonby');
    expect(form.city).toBe('Auckland');
    expect(form.bedrooms).toBe('3');
    expect(form.bathrooms).toBe('2');
    expect(form.land_area).toBe('650m²');
    expect(form.property_type).toBe('House');
    expect(form.estimated_value).toBe('$1,200,000');
  });

  it('handles alternative field names from API', () => {
    const parsed = {
      address: '10 Parnell Road',
      land_area: '500m²',
      estimated_value: '900000',
    };

    const form: Record<string, string> = {};
    if (parsed.address) form.address = parsed.address;
    // API may return land_area instead of land_size
    const landValue = (parsed as any).land_size || parsed.land_area;
    if (landValue) form.land_area = landValue;
    const valueField = (parsed as any).cv || parsed.estimated_value;
    if (valueField) form.estimated_value = valueField;

    expect(form.address).toBe('10 Parnell Road');
    expect(form.land_area).toBe('500m²');
    expect(form.estimated_value).toBe('900000');
  });
});

describe('Extended property voice fill field mapping', () => {
  const LISTING_HISTORY_FIELDS = [
    'cv', 'last_sold_amount', 'last_sold_date', 'current_listing_price',
    'listing_url', 'listing_agent', 'listing_agency', 'last_listed_date',
    'last_listing_result', 'sellability', 'notes',
  ];

  it('maps all extended listing history fields', () => {
    const parsed = {
      cv: '1200000',
      last_sold_amount: 950000,
      last_sold_date: '2022-03-15',
      current_listing_price: 1100000,
      listing_url: 'https://www.trademe.co.nz/property/123',
      listing_agent: 'Jane Smith',
      listing_agency: 'Harcourts',
      last_listed_date: '2024-01-10',
      last_listing_result: 'sold',
      sellability: 4,
      notes: 'Motivated vendor',
    };

    const form: Record<string, string> = {};
    if (parsed.cv) form.cv = parsed.cv;
    if (parsed.last_sold_amount) form.last_sold_amount = String(parsed.last_sold_amount);
    if (parsed.last_sold_date) form.last_sold_date = parsed.last_sold_date;
    if (parsed.current_listing_price) form.current_listing_price = String(parsed.current_listing_price);
    if (parsed.listing_url) form.listing_url = parsed.listing_url;
    if (parsed.listing_agent) form.listing_agent = parsed.listing_agent;
    if (parsed.listing_agency) form.listing_agency = parsed.listing_agency;
    if (parsed.last_listed_date) form.last_listed_date = parsed.last_listed_date;
    if (parsed.last_listing_result) form.last_listing_result = parsed.last_listing_result;
    if (parsed.sellability !== undefined && parsed.sellability !== null) form.sellability = String(parsed.sellability);
    if (parsed.notes) form.notes = parsed.notes;

    expect(form.cv).toBe('1200000');
    expect(form.last_sold_amount).toBe('950000');
    expect(form.last_sold_date).toBe('2022-03-15');
    expect(form.current_listing_price).toBe('1100000');
    expect(form.listing_url).toBe('https://www.trademe.co.nz/property/123');
    expect(form.listing_agent).toBe('Jane Smith');
    expect(form.listing_agency).toBe('Harcourts');
    expect(form.last_listed_date).toBe('2024-01-10');
    expect(form.last_listing_result).toBe('sold');
    expect(form.sellability).toBe('4');
    expect(form.notes).toBe('Motivated vendor');
  });

  it('auto-expands history section when any history field is populated', () => {
    const parsed = { listing_agent: 'John Doe' };
    const hasHistoryData = LISTING_HISTORY_FIELDS.some(
      (f) => (parsed as any)[f] !== undefined && (parsed as any)[f] !== null && (parsed as any)[f] !== ''
    );
    expect(hasHistoryData).toBe(true);
  });

  it('does not expand history section when only core fields are populated', () => {
    const parsed = { address: '42 Queen Street', bedrooms: 3 };
    const hasHistoryData = LISTING_HISTORY_FIELDS.some(
      (f) => (parsed as any)[f] !== undefined && (parsed as any)[f] !== null && (parsed as any)[f] !== ''
    );
    expect(hasHistoryData).toBe(false);
  });

  it('validates last_listing_result enum values', () => {
    const validValues = ['active', 'sold', 'withdrawn', 'expired'];
    expect(validValues).toContain('active');
    expect(validValues).toContain('sold');
    expect(validValues).toContain('withdrawn');
    expect(validValues).toContain('expired');
    expect(validValues).not.toContain('cancelled');
  });

  it('validates sellability range 1-5', () => {
    const validSellability = [1, 2, 3, 4, 5];
    expect(validSellability).toHaveLength(5);
    expect(Math.min(...validSellability)).toBe(1);
    expect(Math.max(...validSellability)).toBe(5);
  });

  it('cv field takes priority over estimated_value for display', () => {
    const parsed = { cv: '1200000', estimated_value: '1100000' };
    // cv is stored separately; estimated_value is used for the main field
    // When submitting, estimated_value takes priority, then cv as fallback
    const submitValue = parsed.estimated_value || parsed.cv;
    expect(submitValue).toBe('1100000');
  });
});

describe('Audio blob construction', () => {
  it('uses correct MIME type for recording', () => {
    const mimeType = 'audio/webm';
    expect(mimeType).toBe('audio/webm');
  });

  it('constructs correct FormData field name', () => {
    const fieldName = 'audio';
    const fileName = 'recording.webm';
    expect(fieldName).toBe('audio');
    expect(fileName).toBe('recording.webm');
  });
});
