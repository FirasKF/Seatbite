# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SeatBite** is a React + Vite front-end prototype for a cinema food-ordering app aimed at Saudi cinema chains (muvi, AMC, VOX). Built as the Front-End Prototype milestone for a SWE course (team: Firas Almashama, Hassan Alshabanah, Ahmed Alromaih, Mohammed Alayyash). It is a UI/UX prototype — not an AI app — with no backend integration in the current milestone.

## Commands

Run from the project root:

- `npm install` — install front-end dependencies
- `npm run dev` — start Vite dev server (default http://localhost:5173)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle locally
- `npm run lint` — run ESLint over `**/*.{js,jsx}`
- `npm run server:dev` — start the backend dev server (passthrough to `server/`'s nodemon; defaults to http://localhost:5000)

The backend is a **separate npm package** under [server/](server/) with its own `package.json` and `node_modules`. First-time setup: `npm --prefix server install` (or `cd server && npm install`). The root `server:dev` script just delegates into that package — nodemon, Express, Mongoose, etc. are not in the root's deps.

There is **no test framework configured** — no `test` script, no Vitest/Jest dependency. Don't fabricate test commands.

## Architecture

The entire app is a single ~480-line React component in [src/App.jsx](src/App.jsx). There is no router, no component split, no state management library, no backend. Future milestones (notably Milestone 5) are expected to add a back end and break this up.

**Step-driven flow.** A single `step` state variable (0–4) drives a linear 5-screen flow rendered as conditional blocks in one component:

0. Pick a movie → 1. Pick a venue → 2. Pick a seat → 3. Build a cart → 4. Order tracking timeline.

Each step gates the next via a "next" button whose `disabled` state depends on the relevant selection (`movie`, `venue`, `seat`, `cart` non-empty).

**Data lives at the top of App.jsx as module-level constants:**

- `FALLBACK_MOVIES` — 12 hardcoded movies, each with `chains: ["muvi"|"AMC"|"VOX"]`.
- `ALL_VENUES` — venues grouped by chain. `getVenuesForMovie()` samples 2–3 venues per chain **using `Math.random()`**, so the venue list is non-deterministic across re-entries and venue `id`s are positional (`"muvi-0"`, etc.) — a previously selected venue can change identity if the user backs out and re-enters Step 1.
- `MENU` — 14 items, bilingual EN/AR, categorized as `snacks | meals | drinks`.
- `SEAT_ROWS` + `TAKEN` — hardcoded seat grid; `0` represents an aisle gap. `TAKEN` is a global constant, not per-screening.
- `ORDER_STAGES` — the 4-stage timeline (`confirmed → preparing → onway → delivered`).

**Implicit data shapes** (no formal models): see the constants above. **There is no `Order` entity** — checkout state is just the bundle of `movie + venue + seat + cart`, and `oStage` (0–3) advances via a `setTimeout` chain in `useEffect` ([App.jsx:215-217](src/App.jsx#L215-L217)). No order ID, no timestamp, no user, no payment.

**Cart shape:** plain object `{ [menuItemId]: quantity }`. Reads coerce keys with `+id` because object keys are strings.

**Anthropic API fetch in App.jsx is dead code in practice.** [App.jsx:118-132](src/App.jsx#L118-L132) calls `https://api.anthropic.com/v1/messages` directly from the browser with no `Authorization` header, so it always 401s and the `catch` block falls back to `FALLBACK_MOVIES` / `getVenuesForMovie()`. The "LIVE / CACHED" badge in the header reflects whether that call succeeded (it doesn't). Treat the static fallback path as the actual runtime behavior. Do not put API keys in client JS — if a real data source is needed in a future milestone, it belongs behind a server.

**Styles are inline.** Styling is done with inline `style={{...}}` objects throughout App.jsx (helpers `btn`, `cardSt`, `fbtn`, `stSeat`, `glass`). [src/App.css](src/App.css) is listed in the README's project structure but is **not imported** by [src/main.jsx](src/main.jsx) — only [src/index.css](src/index.css) is. Don't assume styles come from `App.css`.

**Persistence:** none. A page refresh wipes movie/venue/seat/cart/order state.

## ESLint

Flat config in [eslint.config.js](eslint.config.js) — `js.configs.recommended` plus `react-hooks` and `react-refresh/vite`. One custom rule: `no-unused-vars` ignores identifiers matching `^[A-Z_]` (so SCREAMING_CASE constants like `FALLBACK_MOVIES` won't trip the rule even if temporarily unused).

## Conventions worth respecting

- The whole UI is in one file by design for this milestone — don't preemptively split it into many components unless the task asks for it.
- Bilingual labels (Arabic + English) appear throughout the UI; preserve both when editing user-facing strings.
- The orange brand color is a single constant `oc = "#e85d04"` ([App.jsx:113](src/App.jsx#L113)) — reuse it rather than hardcoding hex values.
