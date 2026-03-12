# Relate — Frontend System Snapshot

> **The Relationship Operating System**
> Rebuild-safe reference document for the RelationshipOS frontend.
> Generated: March 2026

---

## 1. GitHub Repository

| Field | Value |
|---|---|
| Repository URL | https://github.com/toddnztodd/relationshipos-web |
| Branch | `main` |
| Latest Commit | `9e0ee23` |
| Commit Message | Stability + Branding Cleanup: fixed service worker stale-bundle crash, version-stamped cache names, SW_UPDATED hard reload, tagline updated to "The Relationship Operating System", improved ErrorBoundary with stale-cache detection and clear-cache recovery path, added startup logging |
| Total Source Files | 111 TypeScript/TSX files |
| Test Files | 13 Vitest test files — 260 tests, all passing |

---

## 2. Live Frontend URL

**https://relateos-harvu26p.manus.space**

The app is deployed as a public PWA on the Manus platform. It is installable on iPhone (Safari → Add to Home Screen) and Android (Chrome → Install App).

---

## 3. Backend API

The frontend connects to a separate backend API hosted on Render:

```
https://relationshipos-api.onrender.com/api/v1
```

This URL is hardcoded in `client/src/lib/api.ts`. To point to a different backend, update the `API_BASE` constant in that file. Authentication uses a JWT bearer token stored in `localStorage` under the key `ros_token`.

---

## 4. Environment Variables

### Frontend (Vite — `VITE_*` prefix, injected at build time)

These variables are used by the Manus platform OAuth and AI integrations. They are automatically injected by the Manus hosting platform and do **not** need to be set manually when deploying on Manus.

| Variable | Purpose |
|---|---|
| `VITE_APP_ID` | Manus OAuth application ID |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL (frontend redirect) |
| `VITE_FRONTEND_FORGE_API_KEY` | Bearer token for frontend access to Manus built-in APIs |
| `VITE_FRONTEND_FORGE_API_URL` | Manus built-in API base URL (frontend) |

### Server (Node.js — `process.env`, set at runtime)

| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string | **Yes** |
| `JWT_SECRET` | Session cookie signing secret | **Yes** |
| `VITE_APP_ID` | Manus OAuth application ID (also read server-side) | **Yes** |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL | **Yes** |
| `OWNER_OPEN_ID` | Owner's Manus OpenID (for owner notifications) | **Yes** |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API base URL (server-side) | **Yes** |
| `BUILT_IN_FORGE_API_KEY` | Bearer token for server-side Manus built-in APIs | **Yes** |
| `NODE_ENV` | Set to `production` in production deployments | Recommended |
| `PORT` | HTTP port (defaults to 3000 if unset) | Optional |

> **Note:** All of the above are automatically injected by the Manus hosting platform. If deploying outside Manus, you must supply these values manually via a `.env` file or your hosting provider's secret management.

---

## 5. Build and Deployment Instructions

### Prerequisites

- Node.js v22+ (tested on v22.13.0)
- pnpm v9+

### Install dependencies

```bash
pnpm install
```

### Run locally (development)

```bash
pnpm dev
```

The dev server starts at `http://localhost:3000`. The Express server and Vite HMR run together via `tsx watch`.

### Run tests

```bash
pnpm test
```

Runs all 260 Vitest tests across 13 test files.

### Build for production

```bash
pnpm build
```

This command:
1. Runs `vite build` — compiles and bundles the React frontend with content-hashed asset filenames into `dist/`
2. Runs `esbuild` — bundles the Express server into `dist/index.js`
3. Runs `node scripts/stamp-sw.mjs` — stamps the service worker with a unique build version string to prevent stale-cache crashes on deploy

### Start production server

```bash
pnpm start
```

Runs `NODE_ENV=production node dist/index.js`. The server serves both the API and the built frontend on the configured `PORT`.

### Database migrations

```bash
pnpm db:push
```

Generates Drizzle migration SQL from `drizzle/schema.ts` and applies it to the configured `DATABASE_URL`.

### Deploy on Manus

The project is managed by the Manus platform. To deploy:
1. Save a checkpoint via the Manus Management UI or `webdev_save_checkpoint`
2. Click **Publish** in the Management UI header, or use `webdev_deploy_project`
3. Select visibility: **public** / **team** / **owner**

### Deploy on external hosting (e.g. Railway, Render)

1. Set all required environment variables listed in Section 4
2. Run `pnpm install && pnpm build`
3. Start with `pnpm start`
4. Ensure the hosting provider routes all non-API traffic to the built `index.html` (SPA fallback)

> **Warning:** The Manus platform injects OAuth, database, and API credentials automatically. On external hosting you must supply all env vars manually and configure your own OAuth provider.

---

## 6. Key Pages and Routes

| Route | Page Component | Description |
|---|---|---|
| `/` | `Dashboard.tsx` | Main dashboard: signals, next best contacts, daily briefing, follow-up tasks |
| `/people` | `People.tsx` | Contact list with Contacts / Vault / Private / Referrals tabs |
| `/people/:id` | `PersonDetail.tsx` | Full contact detail: timeline, signals, matching properties, referrals |
| `/properties` | `Properties.tsx` | Property list with detail panel: owners, buyer interest, matching buyers, listing checklist |
| `/territory` | `Territory.tsx` | Territory intelligence: list view, detail with Overview / Properties / Coverage / Programs tabs |
| `/door-knock` | `DoorKnock.tsx` | Voice-first door knock session: start, active session, post-knock panel, 10-10-20 nearby, session summary |
| `/community` | `Community.tsx` | Community entities: list and add community |
| `/settings` | `Settings.tsx` | User settings |
| `/login` | `Login.tsx` | Authentication: sign in / register |
| `/404` | `NotFound.tsx` | 404 fallback |

---

## 7. Key Source Directories

```
client/
  public/
    manifest.json          ← PWA manifest
    sw.js                  ← Service worker (version-stamped on build)
    icons/                 ← PWA icons (192px, 512px, maskable 512px)
  src/
    pages/                 ← Page-level components (one per route)
    components/
      layout/              ← AppShell, Sidebar (with floating mic)
      people/              ← PersonCard, PersonDetailPanel, VaultDialog, EditContactForm, etc.
      properties/          ← ListingChecklist, EditPropertyForm
      shared/              ← VoiceRecorder, VoiceCaptureModal, MatchCard, SignalCard, HealthBadge, etc.
      ui/                  ← shadcn/ui primitives
    hooks/                 ← usePeople, useProperties, useTerritories, useDoorKnock, useSignals, etc.
    lib/
      api.ts               ← All backend API calls (REST to relationshipos-api.onrender.com)
      utils.ts             ← cn(), haptic(), and other utilities
      trpc.ts              ← tRPC client binding (Manus platform features)
    types/
      index.ts             ← All TypeScript interfaces and types
    index.css              ← Global styles, Relate design tokens, animation keyframes
server/
  routers.ts               ← tRPC procedures (Manus platform auth + features)
  db.ts                    ← Database query helpers
drizzle/
  schema.ts                ← Database schema
scripts/
  generate-icons.mjs       ← PWA icon generation (sharp)
  stamp-sw.mjs             ← Service worker version stamping (run after build)
```

---

## 8. Design System Tokens

| Token | Value | Usage |
|---|---|---|
| Paper background | `#F8F7F4` | All page backgrounds |
| Soft green accent | `#6FAF8F` | Buttons, active states, badges |
| Border colour | `#ECEAE5` | Card borders |
| Card radius | `14px` | `.relate-card` class |
| Core territory badge | Soft green | Territory type indicator |
| Expansion zone badge | Amber | Territory type indicator |
| Tactical route badge | Blue | Territory type indicator |

---

## 9. PWA Configuration

| Field | Value |
|---|---|
| App name | Relate |
| Short name | Relate |
| Description | The Relationship Operating System |
| Display mode | `standalone` |
| Orientation | `portrait-primary` |
| Theme colour | `#6FAF8F` |
| Background colour | `#F8F7F4` |
| Start URL | `/` |
| Icons | 192px standard, 512px standard, 512px maskable |
| Service worker | `/sw.js` — network-first for assets, network-only for `/api/`, version-stamped cache |

---

## 10. Recent Build History

| Commit | Description |
|---|---|
| `9e0ee23` | Stability + Branding Cleanup: SW crash fix, tagline, ErrorBoundary recovery |
| `faec92b` | UI Polish Pass: haptic utility, micro-animations, skeleton loaders, Lucide icons |
| `733828f` | PWA + Install Experience: manifest, icons, service worker, splash screen |
| `c488cb1` | Referral Program Tracking: types, API, Person Detail section, Referrals tab |
| `3813549` | Buyer–Property Match Engine: MatchCard, buyer preferences, property/person match sections |
| `3416f11` | Door Knock Workflow: full-screen session flow, post-knock panel, follow-up tasks |
| `616cc7a` | Territory Intelligence Phase 1: territory page, coverage tracking, farming programs |
| `1bec1f2` | Audit Fixes: property data-loss fix, edit capability, buyer interest UI, owner linking, floating mic |
