# Project Prompts Log

This document records all user prompts submitted during the development of the **PulseBus Civic Velocity** / **MCP Bus** application.

---

### Prompt 1: Initial App Creation & Design Specification
**Timestamp:** 2026-10-06T21:38:25-07:00  

```markdown
Build me an app with screens that look like this. You can hotlink images from the html
```

**Design System Specifications Provided:**
- **App Name:** PulseBus Civic Velocity
- **Theme & Colors:**
  - `surface`: `#f8f9ff`
  - `on-surface`: `#0b1c30`
  - `primary`: `#006d36` (deep forest green)
  - `primary-container`: `#00c365` (Electric Emerald)
  - `secondary`: `#0B1528` (Deep Transit Navy)
  - `tertiary`: `#F59E0B` (Alert Amber)
  - `error`: `#EF4444` (Disruption Red)
  - `neutral`: `#64748B` (Cool Slate Gray)
- **Typography:** Space Grotesk (numerical countdowns, route badges) & Plus Jakarta Sans (humanist interface text).
- **Core Features:**
  - Live Radar Transit Map with animated GPS bus positions and directional vectors.
  - Departure Board with real-time countdown clocks, tabular figures, and occupancy silhouettes.
  - Route Inspector with vertical corridor diagrams and downstream stop ETAs.
  - Multi-modal Trip Planner with carbon savings calculation.
  - Dynamic fleet telemetry inspector & civic service advisories center.

---

### Prompt 2: GitHub Repository Setup & Push
**Timestamp:** 2026-10-06T21:49:12-07:00  

```bash
git push https://ghp_****@https://github.com/josephineleehuiyee-ai/mcp-bus.git
```

**Actions Executed:**
- Initialized Git repository.
- Configured user email and author profile.
- Created initial commit containing complete frontend architecture.
- Set up remote tracking and pushed to branch `main`.

---

### Prompt 3: Backend API Architecture & Singapore LTA DataMall Integration
**Timestamp:** 2026-10-06T22:08:50-07:00  

```text
1) create a /api folder under the project main to store all the apis
2) create a /api/health.js to monitor if the apis are working
3) integrate the LTA bus information api endpoint GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
Header:  AccountKey: [your key in your email]
# BusStopCode is the only required parameter.
# Add &ServiceNo=7 to ask about one service only.
# Refreshes every 20 seconds. JSON comes back by default.

i will add the LTA+ACCOUNT_KEY in vercel environment variables later
```

**Actions Executed:**
- Created `/api` root directory for serverless backend endpoints.
- Implemented `/api/health.js` monitoring uptime, environment, and LTA account key status.
- Implemented `/api/bus-arrival.js` (and `/api/busArrival.js` alias) proxying `GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival` with `AccountKey` header from environment variables (`LTA_ACCOUNT_KEY`).
- Configured local Vite dev server connect middleware to run `/api/*` endpoints seamlessly during development.
- Created `src/components/LtaDataMallView.tsx` with Singapore bus stop selector, service filter, live countdowns, and load indicators (`SEA`, `SDA`, `LSD`).
- Updated `.env.example` with `LTA_ACCOUNT_KEY`.

---

### Prompt 4: GitHub Repository Update Push
**Timestamp:** 2026-10-06T22:17:53-07:00  

```bash
git push https://ghp_****@https://github.com/josephineleehuiyee-ai/mcp-bus.git
```

**Actions Executed:**
- Verified Git working tree and remote synchronization.
- Pushed commit `94b1554` (`feat: add /api endpoints for health monitor and LTA DataMall v3 bus arrival`) to GitHub repository.

---

### Prompt 5: Prompts Documentation
**Timestamp:** 2026-10-06T22:37:23-07:00  

```text
create a prompt.md containing all my prompts located at project main
```

**Actions Executed:**
- Created `/prompt.md` documenting all user prompts and corresponding implementation logs.
