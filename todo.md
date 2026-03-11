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
- [ ] Wire into Add Contact form
- [ ] Wire into Add/Edit Property form
- [ ] Deploy Milestone 5

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
