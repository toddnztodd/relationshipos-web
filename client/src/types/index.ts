export type Tier = 'A' | 'B' | 'C' | 'D';
export type HealthStatus = 'healthy' | 'at_risk' | 'overdue';
export type BuyerStage = 'seen' | 'interested' | 'hot' | 'offer' | 'purchased';
export type SignalType =
  | 'listing_opportunity'
  | 'buyer_match'
  | 'vendor_pressure'
  | 'relationship_cooling'
  | 'relationship_warming'
  | 'community_cluster';
export type SourceType = 'voice_note' | 'email' | 'meeting' | 'system';

export interface Person {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  tier?: Tier;
  health_status?: HealthStatus;
  last_contacted_at?: string;
  last_contact_channel?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export interface Property {
  id: number;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  land_size?: string;
  cv?: string;
  last_sold_amount?: string;
  last_sold_date?: string;
  current_listing_price?: string;
  listing_url?: string;
  listing_agent?: string;
  listing_agency?: string;
  last_listed_date?: string;
  last_listing_result?: string;
  sellability?: number;
  created_at: string;
}

export interface Signal {
  id: number;
  signal_type: SignalType;
  entity_type: 'person' | 'property' | 'community';
  entity_id: number;
  confidence: number;
  source_contact_id?: number;
  source_type?: SourceType;
  description: string;
  created_at: string;
  is_active: boolean;
  entity_name?: string;
}

export interface BuyerInterest {
  id: number;
  property_id: number;
  person_id: number;
  stage: BuyerStage;
  person_name?: string;
  notes?: string;
}

export interface Activity {
  id: number;
  person_id: number;
  type: string;
  notes?: string;
  created_at: string;
}

export interface CommunityEntity {
  id: number;
  name: string;
  type?: string;
  description?: string;
  created_at: string;
}

export interface BriefingContact {
  id: number;
  name: string;
  tier?: Tier;
  health_status?: HealthStatus;
  days_since_contact?: number;
  last_contact_channel?: string;
  reason?: string;
}

export interface Briefing {
  contacts: BriefingContact[];
  signals: Signal[];
  quick_wins?: any[];
}
