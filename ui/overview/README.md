# DataBridge AI — Overview app

A domain-configurable analytics overview (React 18 + TypeScript + Vite, three.js / React Three Fiber / Drei,
Recharts, Lucide). It is built into `frontend/overview/`, so DataBridge serves it with no extra setup:

- open **http://localhost:8000/overview** (or the **Overview** link in the DataBridge sidebar)
- the built files are committed, so Node.js is only needed if you change the source here

## Run / build

```bash
cd ui/overview
npm install            # once
npm run dev            # http://localhost:5173 — /api is proxied to DataBridge on :8000 (set DATABRIDGE_URL to change)
npm run typecheck      # TypeScript strict check
npm run build          # type-check + build into ../../frontend/overview
```

## Live boards: the Overview on your own tables

**Dashboards › Build with AI › More options › Build a full-page Overview** (or the header switcher › *New full-page Overview
from your tables*) creates a board from a table: `backend/boards.py` finds the date, location, city / state / country (or latitude / longitude),
main measure, orders, customers, rate, category and segment columns from their names, and the page opens with
`?board=<id>`. Every card, filter, page and export then uses the real numbers:

- the server sends daily totals per location (and per category / segment) — `GET /api/dashboards/<id>/board-data`,
  run by the dashboard engine (DuckDB on the warehouse files, Spark otherwise) with governance rules applied
- regions are continents when the business spans countries, otherwise states (or cities); places are found in the
  bundled gazetteer (`frontend/vendor/maps/places.json`)
- events and insights are worked out from the same data; nothing is simulated on a live board
- **Settings › Board data** changes which column plays which role and the words on the cards (saved for everyone)

## The globe in the Dashboards tab

`src/embed/globeEmbed.tsx` is a second build entry (`frontend/overview/embed/overview-embed.js`). The classic Dashboards
tab loads it on demand for its **Globe overview** widget (`frontend/dash_overview.js`):
`window.DBOverviewEmbed.mountGlobe(element, props)` returns `{ update(props), unmount() }` and draws the same `GlobeScene`
(Earth, markers, region callouts, the top locations as buildings) or the 2D map without WebGL. Styles are scoped to
`.dbx-embed`. **Build with AI › Overview** in the Dashboards tab makes a whole dashboard from ordinary widgets (KPI row,
globe, trend, top list, categories, donut, AI insights) — see `backend/dash_overview.py`.

## What is real and what is demo

| Part | Source |
|---|---|
| KPIs, charts, globe, buildings, top lists, categories, segments | **Demo data** generated in the browser from a fixed seed per domain (`src/data/demo/generator.ts`), labelled "Demo Data" in the header |
| AI insights | Rule-based, computed from the numbers on screen (`src/services/insightsService.ts`) |
| System health | **Live** CPU / memory / disk / network of the DataBridge host (`GET /api/overview/host`) when signed in; otherwise simulated and labelled so |
| Recent events | Simulated stream (`src/services/eventsService.ts`) |
| Dashboards, Data Catalog, Users pages | **Live** from the DataBridge API when available, sample rows otherwise (each page says which) |
| Data sources, integrations, report schedules | Demo state kept in this browser; CSV downloads are real files built from the numbers on screen |

To use real business numbers, implement `MetricsService` (`src/services/types.ts`) against your API and swap it
in `src/app/data.tsx` (`const metrics = demoMetricsService`). No credentials or secrets live in the browser code.

## Structure

```
src/app/            App shell, routes, state (domain, dates, region, theme, settings) and shared data
src/domains/        Typed domain registry: retail, healthcare, finance, manufacturing, education, custom
src/services/       metrics (demo), insights, events, health, DataBridge platform API client
src/components/     layout (sidebar, header, search, date range), kpi, widgets, 3d (globe + buildings), maps (2D)
src/pages/          Overview, Analytics, Data Sources, Dashboards, Reports, AI Insights, Catalog, Monitoring, Users, Integrations, Settings
src/data/geo/       world-lite.json (made by scripts/make_world_lite.py)
```

## Licences

Map: Natural Earth (public domain), India's point-of-view edition, so India's borders follow the official Indian position.
Fonts: Inter and Plus Jakarta Sans (SIL Open Font License 1.1, see `src/assets/fonts/LICENSES.txt`).
Libraries: React, three.js, React Three Fiber, Drei, Recharts, Lucide, React Router (MIT / ISC licences).
