# RelationshipOS TODO

## Milestone 1 — Shell, Types, Routing, API Client
- [x] Create types/index.ts with all shared types
- [x] Create lib/api.ts with all fetch functions
- [x] Create lib/signals-api.ts with signal-specific fetches
- [x] Create layout/AppShell.tsx with sidebar navigation
- [x] Create layout/Sidebar.tsx with nav links
- [x] Set up routing (Dashboard, People, PersonDetail, Properties, Community, Settings)
- [x] Update index.css with design tokens
- [x] Update App.tsx with routing
- [x] Create placeholder pages for all routes
- [x] Deploy Milestone 1

## Milestone 2 — People
- [x] Build People list page with search + tier filter
- [x] Build HealthBadge component
- [x] Build PersonCard component
- [x] Build PersonDetail page with PersonDetailPanel
- [x] Build RelationshipTimeline component
- [x] Add Signals section to PersonDetail
- [x] Deploy Milestone 2

## Milestone 3 — Dashboard
- [x] Build DailyBriefing card
- [x] Build NextBestContacts widget
- [x] Build SignalsSection with top 3 signals + refresh
- [x] Build SignalCard component
- [x] Build cadence health bar
- [x] Build stats row (Total Contacts, Tier A, Active Listings, Needs Attention)
- [x] Build A-Tier Drifting section
- [x] Deploy Milestone 3

## Milestone 4 — Properties
- [x] Build Properties list with search
- [x] Build PropertyDetailPanel
- [x] Build PropertyIntelligenceTile (inline in detail)
- [x] Build BuyerInterestSection (inline in detail)
- [x] Build SellabilitySelector (confidence bar in detail)
- [x] Build OwnerLinkSection (inline in detail)
- [x] Add Signals section to PropertyDetailPanel
- [x] Deploy Milestone 4

## Milestone 5 — Voice Fill
- [x] Build VoiceFillButton component (placeholder)
- [x] Wire into Add Contact form
- [x] Wire into Add/Edit Property form
- [x] Deploy Milestone 5

## Milestone 6 — Community + Checklist
- [x] Build Community Entities list and detail
- [ ] Build Listing Checklist with 12-phase accordion
- [ ] Build 4 sale method templates
- [ ] Deploy Milestone 6

## Auth
- [x] Build Login page with register/sign-in tabs
- [x] Token management with localStorage
- [x] Auth gate in App.tsx

## Tests
- [x] Signal type configuration tests (6 types, distinct colors, labels)
- [x] personDisplayName helper tests
- [x] Health status type tests
- [x] Confidence bar calculation tests
- [x] Time ago formatting tests
- [x] Tier configuration tests
- [x] Token management logic tests
- [x] Dashboard top signals filtering tests
- [x] API URL construction tests

## Contact Vault System
- [x] Add vault API functions to lib/api.ts (vaultContact, restoreContact, makeContactPrivate, bulkVaultContacts, checkDuplicate)
- [x] Create VaultDialog component (3 options: vault, private, delete)
- [x] Create BulkVaultDialog component (bulk vault with shared note)
- [x] Create ContactReappearancePrompt component (duplicate detection banner)
- [x] Wire VaultDialog into People.tsx via trash icon on PersonCard
- [x] Add bulk selection mode to People.tsx with BulkVaultDialog
- [x] Wire checkDuplicate into Add Contact form with ContactReappearancePrompt
- [x] Write vitest tests for vault features
- [x] Deploy with public visibility
- [x] Push to GitHub

## UI Alignment + Voice Vault + Mic Position
- [x] Apply Relate visual tokens globally (paper bg, #6FAF8F accent, card styles)
- [x] Update AppShell/Sidebar with aligned tokens
- [x] Update Dashboard cards with aligned tokens
- [x] Update People/PersonCard with aligned tokens
- [x] Update Properties/PropertyDetailPanel with aligned tokens
- [x] Update dialogs/modals with aligned tokens
- [x] Update SignalCard with aligned tokens
- [x] Reposition floating mic to bottom-center fixed
- [x] Add voice recording to VaultDialog vault note
- [x] Add Contacts/Vault/Private tabs to People.tsx
- [x] Fetch vaulted contacts for Vault tab
- [x] Fetch private contacts for Private tab
- [x] Write vitest tests
- [x] Deploy with public visibility
- [x] Push to GitHub

## Voice Fill Completion
- [x] Create shared VoiceRecorder.tsx component
- [x] Wire VoiceRecorder into Add Contact form (People.tsx)
- [x] Wire VoiceRecorder into Add Property form (Properties.tsx)
- [x] Update VaultDialog to use shared VoiceRecorder
- [x] Write vitest tests for VoiceRecorder
- [x] Deploy with public visibility
- [x] Push to GitHub

## Property Listing Checklist
- [x] Add Checklist/ChecklistPhase/ChecklistItem types to types/index.ts
- [x] Add checklist API functions to lib/api.ts
- [x] Add checklist hooks to hooks/useProperties.ts
- [x] Create ListingChecklist.tsx component with accordion phases
- [x] Wire ListingChecklist into PropertyDetailPanel
- [x] Write vitest tests for checklist
- [x] Deploy with public visibility
- [x] Push to GitHub

## Audit Fixes (March 2026)
- [x] Fix 1: Property data-loss bug — include listing history fields in Add Property submit payload
- [x] Fix 2: Edit capability for contacts and properties (inline edit forms, wire to PATCH/PUT endpoints)
- [x] Fix 3: Buyer interest add/edit UI on PropertyDetailPanel
- [x] Fix 4: Owner linking UI on PropertyDetailPanel
- [x] Fix 5: Wire floating mic to context-aware global voice capture modal
- [x] Fix 6: Daily Briefing empty state message instead of hiding section
- [x] Fix 7: Sellability option 5 (Very High) in Add/Edit Property forms
- [x] Fix 8: Community add UI (Add Community button and form)

## Territory Intelligence Phase 1 (March 2026)
- [x] Territory types added to types/index.ts
- [x] Territory API functions added to lib/api.ts
- [x] Territory hooks (useTerritories)
- [x] Territory List view with cards, stats, coverage bar
- [x] Territory Detail view with 4 tabs (Overview, Properties, Coverage, Programs)
- [x] Territory creation modal with canvas boundary drawing
- [x] Sidebar nav item for Territory
- [x] Property detail integration (territory chips)
- [x] Tests for territory features

## Door Knock Workflow (March 2026)
- [x] Door Knock types added to types/index.ts
- [x] Door Knock API functions added to lib/api.ts
- [x] Door Knock hooks (useDoorKnock)
- [x] DoorKnock page with session start, active session, post-knock panel
- [x] 10-10-20 Nearby panel
- [x] Session summary screen
- [x] Follow-up tasks on Dashboard
- [x] Floating mic Door Knock integration
- [x] /door-knock route in App.tsx
- [x] Entry point on Territory detail page
- [x] Tests for door knock features
