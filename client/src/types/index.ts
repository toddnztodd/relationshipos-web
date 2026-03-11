// ── Enums ──
export type Tier = 'A' | 'B' | 'C';
export type HealthStatus = 'healthy' | 'at_risk' | 'overdue';
export type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'text' | 'open_home' | 'door_knock' | 'social' | 'other';

export type SignalType =
  | 'listing_opportunity'
  | 'buyer_match'
  | 'vendor_pressure'
  | 'relationship_cooling'
  | 'relationship_warming'
  | 'community_cluster';

export type EntityType = 'person' | 'property' | 'community';
export type SourceType = 'voice_note' | 'email' | 'meeting' | 'system';

// ── Person ──
export interface Person {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
  suburb: string | null;
  relationship_type: string | null;
  relationship_types: string[] | null;
  influence_score: number | null;
  tier: Tier;
  lead_source: string | null;
  buyer_readiness_status: string | null;
  notes: string | null;
  is_relationship_asset: boolean | null;
  health_status: string | null;
  cadence_days: number | null;
  last_meaningful_interaction: string | null;
  days_since_contact: number | null;
  next_contact_due: string | null;
  last_interaction_channel: string | null;
  preferred_contact_channel: string | null;
  nickname: string | null;
  buyer_interest: number | null;
  seller_likelihood: number | null;
  perceived_value: string | null;
  tags: string[] | null;
  referral_member?: boolean;
  referral_reward_amount?: number;
  referral_email_sent_at?: string;
  referred_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonCreate {
  first_name: string;
  last_name?: string | null;
  phone: string;
  email?: string | null;
  suburb?: string | null;
  relationship_type?: string | null;
  relationship_types?: string[] | null;
  tier?: Tier;
  notes?: string | null;
  tags?: string[] | null;
  preferred_contact_channel?: string | null;
  nickname?: string | null;
}

/** Helper to get display name from any object with first_name/last_name */
export function personDisplayName(p: { first_name: string; last_name?: string | null }): string {
  return [p.first_name, p.last_name].filter(Boolean).join(' ');
}

// ── Property ──
export interface Property {
  id: number;
  user_id: number;
  address: string;
  suburb: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  ensuites: number | null;
  living_rooms: number | null;
  has_pool: boolean | null;
  renovation_status: string | null;
  years_owned: number | null;
  council_valuation: number | null;
  estimated_value: number | null;
  land_area: number | null;
  floor_area: number | null;
  property_type: string | null;
  zoning: string | null;
  sellability_score: number | null;
  sellability_label: string | null;
  appraisal_stage: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyCreate {
  address: string;
  suburb?: string | null;
  city?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  property_type?: string | null;
  notes?: string | null;
  estimated_value?: number | null;
  sellability_score?: number | null;
  sellability_label?: string | null;
  council_valuation?: number | null;
  land_area?: number | null;
  last_sold_amount?: number | null;
  last_sold_date?: string | null;
  current_listing_price?: number | null;
  listing_url?: string | null;
  listing_agent?: string | null;
  listing_agency?: string | null;
  last_listed_date?: string | null;
  last_listing_result?: string | null;
}

// ── Activity ──
export interface Activity {
  id: number;
  user_id: number;
  person_id: number | null;
  property_id: number | null;
  interaction_type: InteractionType;
  date: string;
  notes: string | null;
  is_meaningful: boolean;
  due_date: string | null;
  feedback: string | null;
  price_indication: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityCreate {
  person_id?: number | null;
  property_id?: number | null;
  interaction_type: InteractionType;
  date?: string;
  notes?: string | null;
  is_meaningful?: boolean;
}

// ── Signal ──
export interface Signal {
  id: number;
  signal_type: SignalType;
  entity_type: EntityType;
  entity_id: number;
  entity_name: string | null;
  confidence: number;
  source_contact_id: number | null;
  source_type: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignalListResponse {
  signals: Signal[];
  total: number;
}

export interface SignalDetectResponse {
  signals_created: number;
  signals_deactivated: number;
  total_active: number;
}

// ── Dashboard ──
export interface DriftingRelationship {
  id: number;
  first_name: string;
  last_name: string | null;
  tier: Tier;
  days_since_contact: number | null;
  health_status: string;
}

export interface DueForContact {
  id: number;
  first_name: string;
  last_name: string | null;
  tier: Tier;
  days_since_contact: number | null;
  cadence_days: number | null;
}

export interface CadenceSummary {
  total_people: number;
  green: number;
  amber: number;
  red: number;
  needs_attention: number;
}

export interface TierBreakdown {
  tier_a: number;
  tier_b: number;
  tier_c: number;
  tier_d: number;
  total: number;
}

export interface DashboardData {
  a_tier_drifting: DriftingRelationship[];
  due_for_contact_this_week: DueForContact[];
  cadence_summary: CadenceSummary;
  tier_breakdown: TierBreakdown;
  active_listings: number;
  active_appraisals: number;
}

// ── Briefing ──
export interface BriefingContact {
  id: number;
  first_name: string;
  last_name: string | null;
  phone: string;
  tier: Tier;
  health_status: string;
  days_since_contact: number | null;
  reason: string;
}

export interface BriefingSignal {
  id: number;
  signal_type: string;
  entity_type: string;
  entity_id: number;
  entity_name: string | null;
  confidence: number;
  description: string;
}

export interface BriefingData {
  contacts: BriefingContact[];
  signals: BriefingSignal[];
  total: number;
}

// ── Next Best Contacts ──
export interface NextBestContact {
  id: number;
  first_name: string;
  last_name: string | null;
  nickname: string | null;
  phone: string;
  email: string | null;
  tier: Tier;
  health_status: string;
  days_since_contact: number | null;
  cadence_limit: number;
  last_interaction_channel: string | null;
}

// ── Buyer Interest ──
export interface BuyerInterest {
  id: number;
  property_id: number;
  person_id: number | null;
  person_name: string | null;
  interest_level: number | null;
  notes: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

// ── Property Owner ──
export interface PropertyOwner {
  person_id: number;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
}

// ── Community Entity ──
export interface CommunityEntity {
  id: number;
  name: string;
  type: string;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  people: CommunityPersonLink[];
  properties: CommunityPropertyLink[];
  recent_activities: CommunityActivityLink[];
}

export interface CommunityPersonLink {
  person_id: number;
  first_name: string;
  last_name: string | null;
  role: string | null;
}

export interface CommunityPropertyLink {
  property_id: number;
  address: string;
}

export interface CommunityActivityLink {
  activity_id: number;
  interaction_type: string;
  date: string;
  notes: string | null;
}

export interface CommunityEntityCreate {
  name: string;
  type?: string;
  location?: string | null;
  notes?: string | null;
}

// ── Auth ──
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthRegister extends AuthCredentials {
  full_name: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

// ── Checklist ──
export interface ChecklistItem {
  id: number;
  phase_number: number;
  item_text: string;
  is_complete: boolean;
  completed_at: string | null;
  due_date: string | null;
  note: string | null;
  sort_order: number;
}

export interface ChecklistPhase {
  phase_number: number;
  phase_name: string;
  is_complete: boolean;
  completed_at: string | null;
  items: ChecklistItem[];
}

export interface Checklist {
  id: number;
  property_id: number;
  sale_method: string;
  current_phase: number;
  phases: ChecklistPhase[];
  created_at: string;
  updated_at: string;
}

// ── Territory ──
export type TerritoryType = 'core_territory' | 'expansion_zone' | 'tactical_route';

export interface Territory {
  id: string;
  name: string;
  type: TerritoryType;
  notes?: string;
  boundary_data?: any;
  map_image_url?: string;
  created_at: string;
  // computed stats
  property_count: number;
  owners_known: number;
  relationships_known: number;
  recent_sales: number;
  recent_listings: number;
  signal_count: number;
}

export interface TerritoryCreate {
  name: string;
  type: TerritoryType;
  notes?: string;
  boundary_data?: any;
  map_image_url?: string;
}

export interface CoverageActivity {
  id: string;
  territory_id?: string;
  property_id?: string;
  person_id?: string;
  activity_type: 'territory_intro' | 'flyer_drop' | 'magnet_drop' | 'door_knock' | 'welcome_touch' | 'market_update';
  notes?: string;
  completed_at: string;
}

export interface FarmingProgram {
  id: string;
  territory_id: string;
  title: string;
  recurrence: string;
  next_due_date?: string;
  last_completed_date?: string;
  notes?: string;
}

export interface CoverageSummary {
  total_properties: number;
  properties_introduced: number;
  properties_with_relationship: number;
  properties_untouched: number;
  recent_activities: CoverageActivity[];
}

export interface TerritoryProperty {
  id: number;
  address: string;
  suburb: string | null;
  sellability_score: number | null;
  last_listing_result?: string | null;
}

// ── Door Knock ──
export type KnockResult = 'door_knocked' | 'spoke_to_owner' | 'spoke_to_occupant' | 'no_answer' | 'contact_captured';
export type InterestLevel = 'not_interested' | 'neutral' | 'possibly_selling' | 'actively_considering';

export interface DoorKnockSession {
  id: string;
  territory_id?: string;
  started_at: string;
  ended_at?: string;
  total_knocks: number;
  notes?: string;
}

export interface DoorKnockEntry {
  id: string;
  session_id: string;
  property_id?: string;
  property_address: string;
  knock_result: KnockResult;
  contact_name?: string;
  contact_phone?: string;
  interest_level?: InterestLevel;
  voice_note_transcript?: string;
  notes?: string;
  created_contact_id?: string;
  knocked_at: string;
}

export interface FollowUpTask {
  id: string;
  title: string;
  description?: string;
  related_property_id?: string;
  related_person_id?: string;
  due_date?: string;
  is_completed: boolean;
}

// ── Buyer–Property Match Engine ──
export interface BuyerMatch {
  property: Property;
  score: number;
  score_pct: number;
  reasons: string[];
}

export interface PropertyBuyerMatch {
  buyer_interest: BuyerInterest;
  person: Person;
  score: number;
  score_pct: number;
  reasons: string[];
}
// ── Referral Program ──
export type ReferralStatus = 'registered' | 'referral_received' | 'listing_secured' | 'sold' | 'closed';
export type RewardStatus = 'none' | 'pending' | 'earned' | 'paid';

export interface Referral {
  id: string;
  referrer_person_id: string;
  referred_person_id: string;
  referral_status: ReferralStatus;
  reward_amount: number;
  reward_status: RewardStatus;
  reward_paid_at?: string;
  notes?: string;
  created_at: string;
  referrer?: Person;
  referred?: Person;
}
