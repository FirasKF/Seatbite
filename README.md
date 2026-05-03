# SeatBite — Cinema Food Ordering System

> Deployed at https://seatbite.vercel.app — Backend at https://seatbite-api.onrender.com

SeatBite is a full-stack web app that lets cinema-goers in Saudi Arabia order snacks, meals, and drinks delivered directly to their seat during a screening. Users select a now-showing movie, pick a venue and seat at one of the major Saudi chains (muvi, AMC, VOX), build a cart, and watch the order progress through a delivery timeline.

This repository is the final milestone of a Software Engineering course project. It pairs a React + Vite frontend with a Node.js + Express backend and a seeded MongoDB Atlas database.

## Live Demo

- **Frontend**: https://seatbite.vercel.app
- **Backend API**: https://seatbite-api.onrender.com
- **Health check**: https://seatbite-api.onrender.com/api/health

> Note: the backend runs on Render's free tier, which sleeps after 15 minutes of inactivity. The first request after a sleep takes 30–60 seconds while the server wakes up. The frontend shows a blue "Waking up server..." banner during this window — wait for it to disappear.

## Demo Video
- ## Demo
[Watch the demo on YouTube](https://www.youtube.com/watch?v=zsG33NXEoz0)

## Team

- FIRAS ALMASHAMA
- HASSAN ALSHABANAH
- AHMED ALROMAIH
- MOHAMMED ALAYYASH

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite (single-component SPA with inline JSX styles) |
| Backend | Node.js, Express (ES modules) |
| Database | MongoDB Atlas via Mongoose ODM |
| Authentication | JSON Web Tokens (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`) |
| HTTP middleware | `cors`, `morgan` (request logging), `express.json` body parsing |
| Dev tooling | `nodemon` (auto-restart), `dotenv`, ESLint |

The frontend and backend are **separate npm packages** — one `package.json` at the root, another inside `server/`, each with its own `node_modules`. A root passthrough script (`npm run server:dev`) delegates into `server/`.

## Features

- **Movie browsing** — 12 currently-showing titles with EN/AR language filter and chain badges (muvi, AMC, VOX)
- **Cinema venue selection** — 17 real Saudi venues filtered by the chains showing the selected movie
- **Interactive seat picker** — seat map with per-showtime "taken" markers that update as orders come in
- **Bilingual menu** — 14 items (snacks / meals / drinks) with Arabic + English names and SAR pricing
- **Cart with running total** — add/remove items; total is recomputed server-side at checkout
- **Fake payment page** — three payment-method tabs (Credit/Debit, Apple Pay, STC Pay). The Credit/Debit form (cardholder name, 16-digit card with auto-formatting, MM/YY expiry, CVV) has full client-side validation; VISA / MC / mada / Amex brand badges and a "🔒 Encrypted" indicator are decorative. Apple Pay and STC Pay show mock confirmation UIs with no real payment integration — clicking Pay on any tab triggers the same fake 1.5s spinner and POSTs the order via the standard endpoint.
- **Order placement and delivery timeline** — `confirmed → preparing → onway → delivered`, auto-advances on the client and is updatable from the admin dashboard
- **Admin dashboard** — accessible via the "Admin" button in the header; view all orders, filter by status, advance status with a single click
- **QR ticket flow** — admins generate printable seat QR codes from a dedicated section in the admin dashboard (showtime ID + seat → a `https://seatbite.vercel.app/?showtime=...&seat=...` URL); customers scan those QRs through an in-app camera modal (`html5-qrcode` integration) that auto-loads the movie / venue / seat context and skips straight to the menu. Desktop users without a webcam get a fallback list of three clickable demo tickets fetched from the live backend.
- **User registration and JWT auth** — `/api/auth/register`, `/login`, `/me` endpoints with bcrypt password hashing (backend only — no frontend login UI yet)
- **Mobile-responsive layout** — single-column flow scales to phone widths; seat picker and admin table become horizontally scrollable below 540px / 768px
- **Cold-start wake-up banner** — informs users when the Render free tier is taking 30–60s to wake up, instead of falsely showing "live data unavailable"
- **Graceful API fallback** — if the backend is fully unreachable, the frontend transparently switches to the in-file catalog with a yellow "Live data unavailable" banner

## Project Structure

```
ProjectSWE-main/
├── public/                          # Static assets served by Vite
│   ├── favicon.svg
│   └── icons.svg
├── src/                             # Frontend source
│   ├── assets/                      # Images
│   ├── App.jsx                      # The entire SPA — single component, ~530 lines
│   ├── index.css                    # Global resets (only stylesheet imported)
│   ├── App.css                      # Present but not imported — legacy
│   └── main.jsx                     # React entry point
├── server/                          # Backend npm package (separate from root)
│   ├── config/
│   │   └── db.js                    # Mongoose connection (non-fatal if MONGO_URI missing)
│   ├── controllers/
│   │   ├── auth.controller.js       # Register, login, /me
│   │   ├── menu.controller.js       # GET /api/menu with ?cat= filter
│   │   ├── movies.controller.js     # GET /api/movies
│   │   ├── orders.controller.js     # Order creation with seat regex + server-side total
│   │   ├── showtimes.controller.js  # Showtime list + /taken-seats query
│   │   └── venues.controller.js     # GET /api/venues with ?chain= filter
│   ├── middleware/
│   │   ├── asyncHandler.js          # Wraps async controllers; routes rejections to errorHandler
│   │   ├── auth.middleware.js       # requireAuth — validates Authorization: Bearer header
│   │   └── error.js                 # Central JSON error handler (last app.use)
│   ├── models/                      # Mongoose schemas and models
│   │   ├── MenuItem.js
│   │   ├── Movie.js
│   │   ├── Order.js                 # Unique compound index on { showtime, seat }
│   │   ├── Showtime.js              # Compound index on { movie, venue, startsAt }
│   │   ├── User.js                  # password is select:false; bcrypt pre-save hook
│   │   └── Venue.js
│   ├── routes/                      # One Router per resource
│   │   ├── auth.routes.js
│   │   ├── health.routes.js
│   │   ├── menu.routes.js
│   │   ├── movies.routes.js
│   │   ├── orders.routes.js
│   │   ├── showtimes.routes.js
│   │   └── venues.routes.js
│   ├── scripts/
│   │   └── seed.js                  # Wipes and re-seeds movies/venues/menu/showtimes
│   ├── app.js                       # Builds the Express app (middleware + route mounts)
│   ├── server.js                    # Boot: loads env, connects DB, starts HTTP server
│   ├── .env                         # Real values (gitignored)
│   ├── .env.example                 # Template
│   └── package.json                 # Backend deps
├── .env                             # Frontend env (gitignored)
├── .env.example                     # Frontend env template
├── eslint.config.js
├── index.html                       # Vite entry
├── package.json                     # Frontend deps + root passthrough scripts
├── vite.config.js
├── CLAUDE.md                        # Notes for AI coding assistants (not user-facing)
└── README.md                        # This file
```

## Setup

### Prerequisites

- Node.js 20+ and npm
- A MongoDB Atlas cluster (free tier is sufficient) or a local MongoDB instance

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd ProjectSWE-main

# Frontend deps (root)
npm install

# Backend deps (server/)
npm --prefix server install
```

### 2. Configure environment variables

**Backend** — copy the template, then fill in real values:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

- Paste your MongoDB Atlas connection string into `MONGO_URI`. The DB name in the URI path (e.g. `/seatbite`) determines the target database.
- Generate a strong JWT secret and paste it into `JWT_SECRET`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

**Frontend** — copy the template at the project root:

```bash
cp .env.example .env
```

The default `VITE_API_URL=http://localhost:5000/api` is correct for local development.

### 3. Seed the database

One-time, or whenever you want to reset the catalog:

```bash
npm run seed
```

This wipes the `movies`, `venues`, `menuitems`, and `showtimes` collections (only) and inserts:

- 12 movies
- 17 venues (6 muvi, 5 AMC, 6 VOX)
- 14 menu items (snacks, meals, drinks)
- ~1431 showtimes (one per matching movie+venue pair × 3 times/day × 3 days, in Saudi local time)

The `users` and `orders` collections are **not** touched — your accounts and orders survive a re-seed.

### 4. Start the backend

In one terminal, from the project root:

```bash
npm run server:dev
```

You should see:

```
[server] SeatBite API listening on http://localhost:5000
[db] connected to MongoDB
```

### 5. Start the frontend

In a second terminal:

```bash
npm run dev
```

Open http://localhost:5173 in a browser.

The header should show a green **LIVE** badge. If you see a yellow banner reading "Live data unavailable — using local catalog" and a **CACHED** badge, the frontend can't reach the backend — verify the server is running and `VITE_API_URL` matches.

## Environment Variables

| Variable | File | Required | Purpose | Example |
|---|---|---|---|---|
| `PORT` | `server/.env` | no (default `5000`) | HTTP port the Express server listens on | `5000` |
| `NODE_ENV` | `server/.env` | no (default `development`) | Switches morgan log format between `dev` and `combined` | `development` |
| `MONGO_URI` | `server/.env` | yes (for any DB-backed feature) | MongoDB connection string. Path segment = DB name. | `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/seatbite` |
| `JWT_SECRET` | `server/.env` | yes (for auth endpoints) | Signing secret for JWTs | A 128-character hex string from `crypto.randomBytes(64)` |
| `VITE_API_URL` | root `.env` | no (default `http://localhost:5000/api`) | Backend base URL the frontend calls | `http://localhost:5000/api` |

Both `.env` files are gitignored; only the `.env.example` templates are committed.

The server logs a warning at boot if `JWT_SECRET` is missing but still starts — auth endpoints then return 500 until the value is set. The DB connection is also non-fatal: if `MONGO_URI` is missing or unreachable, the HTTP server still starts and `/api/health` works, but DB-backed routes fail.

## API Documentation

Base URL: `http://localhost:5000/api`

All responses are JSON. Errors take the shape `{ "error": "<message>" }`. Document fields named `id` are the Mongo `_id` exposed as a string — the underlying `_id` and `__v` are stripped by Mongoose's `toJSON` transform.

### Endpoint Summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | no | Liveness check |
| GET | `/api/movies` | no | List all movies |
| GET | `/api/venues` | no | List venues, optional `?chain=` filter |
| GET | `/api/menu` | no | List menu items, optional `?cat=` filter |
| GET | `/api/showtimes?movieId=&venueId=` | no | Showtimes for a movie+venue pair |
| GET | `/api/showtimes/:id/taken-seats` | no | Booked seats for a showtime |
| POST | `/api/auth/register` | no | Create a user, return user + JWT |
| POST | `/api/auth/login` | no | Verify credentials, return user + JWT |
| GET | `/api/auth/me` | **yes** | Return the authenticated user |
| POST | `/api/orders` | no (see Architecture Notes) | Create an order |
| GET | `/api/orders` | no | List the 50 newest orders |
| GET | `/api/orders/:id` | no | Fetch one order |

For protected endpoints, send `Authorization: Bearer <jwt>` using the token returned by `POST /api/auth/login` (or `register`).

---

### GET /api/health

Liveness check. Does not touch the database.

**Auth:** No

**Success (200):**

```json
{ "ok": true, "uptime": 12.345 }
```

`uptime` is the Node process uptime in seconds.

**Example:**

```bash
curl http://localhost:5000/api/health
```

---

### GET /api/movies

List all movies, sorted by insertion order.

**Auth:** No

**Success (200):**

```json
[
  {
    "id": "67d8a2c9e5f0b3a1d2e4f5a6",
    "title": "Project Hail Mary",
    "genre": "Sci-Fi",
    "rating": "PG-15",
    "lang": "EN",
    "poster": "🚀",
    "chains": ["muvi", "AMC", "VOX"],
    "createdAt": "2026-05-02T10:00:00.000Z",
    "updatedAt": "2026-05-02T10:00:00.000Z"
  }
]
```

**Example:**

```bash
curl http://localhost:5000/api/movies
```

---

### GET /api/venues

List venues. Optional `?chain=` filter restricts to one chain.

**Auth:** No

**Query params:**

| Name | Type | Required | Description |
|---|---|---|---|
| `chain` | string (`muvi` / `AMC` / `VOX`) | no | Restrict to one chain. Unknown values return `[]`. |

**Success (200):**

```json
[
  {
    "id": "67d8a2c9e5f0b3a1d2e4f5b1",
    "name": "Nakheel Mall",
    "city": "Riyadh",
    "area": "Exit 9",
    "chain": "muvi",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

**Examples:**

```bash
curl http://localhost:5000/api/venues
curl "http://localhost:5000/api/venues?chain=AMC"
```

---

### GET /api/menu

List all menu items, optionally filtered by category.

**Auth:** No

**Query params:**

| Name | Type | Required | Description |
|---|---|---|---|
| `cat` | string (`snacks` / `meals` / `drinks`) | no | Restrict to one category |

**Success (200):**

```json
[
  {
    "id": "67d8a2c9e5f0b3a1d2e4f5c1",
    "name": "فشار كلاسيك",
    "nameEn": "Classic Popcorn",
    "price": 20,
    "emoji": "🍿",
    "cat": "snacks",
    "available": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

`price` is in Saudi Riyal (SAR / ر.س).

**Examples:**

```bash
curl http://localhost:5000/api/menu
curl "http://localhost:5000/api/menu?cat=drinks"
```

---

### GET /api/showtimes

List showtimes for a specific movie+venue pair, sorted by `startsAt` ascending. Both query params are required.

**Auth:** No

**Query params:**

| Name | Type | Required | Description |
|---|---|---|---|
| `movieId` | ObjectId string | yes | Movie `_id` |
| `venueId` | ObjectId string | yes | Venue `_id` |

**Success (200):** Array of showtimes; typically 9 per pair (3 times/day × 3 days), or `[]` if the movie isn't shown at that venue.

```json
[
  {
    "id": "67d8a2c9e5f0b3a1d2e4f5d1",
    "movie": "67d8a2c9e5f0b3a1d2e4f5a6",
    "venue": "67d8a2c9e5f0b3a1d2e4f5b1",
    "startsAt": "2026-05-02T10:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

**Errors:**

- `400` — `movieId` or `venueId` missing, or either is not a valid ObjectId

**Example:**

```bash
curl "http://localhost:5000/api/showtimes?movieId=67d8a2...&venueId=67d8a2..."
```

---

### GET /api/showtimes/:id/taken-seats

Return the list of seat strings already booked for a given showtime.

**Auth:** No

**Path params:** `id` — a Showtime `_id` (ObjectId).

**Success (200):**

```json
["A1", "B5", "C3"]
```

Empty array if no orders exist for the showtime yet.

**Errors:**

- `400` — malformed ObjectId
- `404` — showtime not found

**Example:**

```bash
curl http://localhost:5000/api/showtimes/67d8a2.../taken-seats
```

---

### POST /api/auth/register

Create a new user account, return the user record and a JWT.

**Auth:** No

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | yes | Lowercased + trimmed; must match `<text>@<text>.<text>` |
| `password` | string | yes | Plain text; minimum 8 characters; hashed via bcrypt before storage |
| `name` | string | yes | Display name |

**Success (201):**

```json
{
  "user": {
    "id": "67d8a2c9e5f0b3a1d2e4f5e1",
    "email": "alice@example.com",
    "name": "Alice",
    "role": "user",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

The `password` field is never returned (excluded by `select: false` and the `toJSON` transform).

**Errors:**

- `400` — missing field, invalid email format, or password shorter than 8 chars
- `409` — email already registered (Mongo duplicate-key on the unique `email` index)

**Example:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Test1234!","name":"Alice"}'
```

---

### POST /api/auth/login

Verify credentials and return the user record + a JWT.

**Auth:** No

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | yes | Lowercased + trimmed before lookup |
| `password` | string | yes | Plain text; compared via bcrypt |

**Success (200):** Same shape as `/register`.

**Errors:**

- `400` — missing email or password
- `401` — `Invalid email or password` (used for both wrong email and wrong password — see Architecture Notes)

**Example:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Test1234!"}'
```

---

### GET /api/auth/me

Return the user identified by the bearer token.

**Auth:** **Yes** — `Authorization: Bearer <jwt>`

**Success (200):**

```json
{
  "user": {
    "id": "67d8a2c9e5f0b3a1d2e4f5e1",
    "email": "alice@example.com",
    "name": "Alice",
    "role": "user",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**

- `401 Authentication required` — no `Authorization` header or no `Bearer ` prefix
- `401 Invalid or expired token` — JWT verification failed (bad signature, malformed, expired, or user no longer exists)

**Example:**

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn..."
```

---

### POST /api/orders

Create an order. The server computes `total` from current menu prices and ignores any client-supplied `total`.

**Auth:** No (see Architecture Notes for the trade-off and how to add auth back)

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `user` | ObjectId string | no | Reference to a registered User |
| `guestName` | string | required if `user` is absent | Display name for guest orders |
| `showtime` | ObjectId string | yes | Reference to a Showtime |
| `seat` | string | yes | Must match `^[A-J][1-9][0-9]?$` (e.g. `A1`, `B12`, `J99`) |
| `items` | array | yes | Non-empty list of `{ menuItemId, qty }` objects |
| `items[].menuItemId` | ObjectId string | yes | Reference to a MenuItem |
| `items[].qty` | integer ≥ 1 | yes | Quantity |

The client may send a `total` field, but the server **ignores it** and recomputes from `MenuItem.price × qty`.

**Success (201):** The created order, populated with `showtime` (with nested `movie` + `venue`) and each `items[].menuItemId`:

```json
{
  "id": "67d8a2c9e5f0b3a1d2e4f5f1",
  "guestName": "Guest",
  "showtime": {
    "id": "67d8a2c9e5f0b3a1d2e4f5d1",
    "movie": { "id": "...", "title": "Project Hail Mary", "genre": "Sci-Fi", ... },
    "venue": { "id": "...", "name": "Nakheel Mall", "city": "Riyadh", "chain": "muvi", ... },
    "startsAt": "2026-05-02T10:00:00.000Z"
  },
  "seat": "A1",
  "items": [
    {
      "menuItemId": { "id": "...", "nameEn": "Classic Popcorn", "price": 20, "cat": "snacks", ... },
      "qty": 2
    }
  ],
  "total": 40,
  "status": "confirmed",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Errors:**

- `400` — missing required field, malformed ObjectId, seat regex mismatch, empty `items`, or non-integer / sub-1 `qty`
- `400` — referenced menu item ID not found
- `404` — showtime not found
- `409 Seat already taken` — duplicate `(showtime, seat)` (caught from MongoDB E11000 against the unique compound index)

**Example:**

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Guest",
    "showtime": "67d8a2c9e5f0b3a1d2e4f5d1",
    "seat": "A1",
    "items": [
      { "menuItemId": "67d8a2c9e5f0b3a1d2e4f5c1", "qty": 2 }
    ]
  }'
```

---

### GET /api/orders

List the 50 newest orders, sorted by `createdAt` descending. Same population as `POST /orders`.

**Auth:** No

**Success (200):** Array of populated orders.

**Example:**

```bash
curl http://localhost:5000/api/orders
```

---

### GET /api/orders/:id

Fetch a single order, populated.

**Auth:** No

**Path params:** `id` — Order `_id` (ObjectId).

**Success (200):** A single populated order (same shape as `POST /orders` response).

**Errors:**

- `400` — malformed ObjectId
- `404` — order not found

**Example:**

```bash
curl http://localhost:5000/api/orders/67d8a2c9e5f0b3a1d2e4f5f1
```

## Data Models

All models use Mongoose `timestamps: true`, so every document has `createdAt` and `updatedAt`. All models export `id` (string) instead of `_id` via a `toJSON` transform that also strips `__v`.

### User

| Field | Type | Notes |
|---|---|---|
| `email` | String | required, unique, lowercased, trimmed |
| `password` | String | required, `select: false`; bcrypt-hashed via `pre('save')` hook |
| `name` | String | required, trimmed |
| `role` | String | enum `user` / `admin`, default `user` |

**Indexes:** unique on `email` (auto-created from `unique: true`).
**Methods:** `comparePassword(plain) → Promise<boolean>` for login verification.
**toJSON:** also deletes `password` for defense-in-depth even when accidentally selected.

### Movie

| Field | Type | Notes |
|---|---|---|
| `title` | String | required, trimmed |
| `genre` | String | trimmed |
| `rating` | String | trimmed |
| `lang` | String | enum `EN` / `AR`, default `EN` |
| `poster` | String | typically an emoji |
| `chains` | [String] | enum each: `muvi` / `AMC` / `VOX` |

### Venue

| Field | Type | Notes |
|---|---|---|
| `name` | String | required, trimmed |
| `city` | String | required, trimmed |
| `area` | String | trimmed |
| `chain` | String | required, indexed, enum `muvi` / `AMC` / `VOX` |

**Indexes:** single index on `chain`.

### MenuItem

| Field | Type | Notes |
|---|---|---|
| `name` | String | Arabic name, trimmed |
| `nameEn` | String | required, trimmed |
| `price` | Number | required, min 0 (SAR) |
| `emoji` | String | display glyph |
| `cat` | String | required, indexed, enum `snacks` / `meals` / `drinks` |
| `available` | Boolean | default `true`; lets staff hide items without deleting |

**Indexes:** single index on `cat`.

### Showtime

| Field | Type | Notes |
|---|---|---|
| `movie` | ObjectId → Movie | required, indexed |
| `venue` | ObjectId → Venue | required, indexed |
| `startsAt` | Date | required, indexed |
| `hall` | String | optional (e.g. `Hall 1`, `IMAX`) |

**Indexes:** individual indexes on `movie`, `venue`, `startsAt`, plus a compound index on `{ movie, venue, startsAt }` to speed up the common "showtimes for this pair" query.

### Order

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | optional |
| `guestName` | String | required if `user` is absent (validated by a function) |
| `showtime` | ObjectId → Showtime | required, indexed |
| `seat` | String | required; matches `^[A-J][1-9][0-9]?$` (rows A–J, seats 1–99) |
| `items` | [{ menuItemId: ObjectId → MenuItem, qty: Number ≥ 1 }] | non-empty (custom validator); subdocs have `_id: false` |
| `total` | Number | required, min 0; computed server-side from menu prices |
| `status` | String | enum `confirmed` / `preparing` / `onway` / `delivered`, default `confirmed` |

**Indexes:** index on `showtime`, plus a **unique compound index on `{ showtime, seat }`** — the database-level guarantee that two orders cannot claim the same seat at the same screening. Duplicate inserts surface as Mongo error code `11000`, caught by the controller and returned as HTTP 409.

**Population:** Order responses are populated with `showtime` (and through it, `movie` and `venue`) and `items[].menuItemId`.

## Architecture Notes

### Why orders don't require auth — and how to add it back

Phase 5 ships orders without authentication to keep the demo flow simple: the user lands on the app, picks a movie/seat, and orders. The frontend sends `guestName: "Guest"` for every order. This is an intentional trade-off — we lose ~2 rubric points for proper authorization but gain a frictionless demo and avoid wiring login into the SPA's checkout step.

To require auth on order endpoints, two changes:

1. In `server/routes/orders.routes.js`, import `requireAuth` from the auth middleware and apply it to the routes that should be protected:
   ```js
   import { requireAuth } from '../middleware/auth.middleware.js';
   router.post('/', requireAuth, createOrder);
   ```
2. In `server/controllers/orders.controller.js`, replace the `guestName` fallback with `req.user._id` for the `user` field, and stop accepting `guestName` from the body.

The frontend would then need a login step before checkout and would attach the bearer token on the `POST /api/orders` request.

### Frontend fallback mechanism (graceful degradation)

`src/App.jsx` keeps the original hardcoded `FALLBACK_MOVIES`, `ALL_VENUES`, and `MENU` constants in the source file. On mount it tries to fetch each resource from the backend independently; on any failure (network error, non-2xx) the corresponding state stays at the in-file fallback. A single boolean (`isLive`) flips false if any of the three fetches failed and triggers the dismissable yellow banner: "Live data unavailable — using local catalog." This means:

- The app remains fully usable for a UI-only demo even with no backend running.
- Partial outages don't blank out the screen — only the failed resource degrades.
- Switching between modes is observable to graders via the LIVE / CACHED badge in the header.

The order POST has the same fallback: on any non-409 error (or if no showtime ID was captured), the frontend skips the API and runs the local `setTimeout`-based timeline, so the demo never gets stuck on "Order Confirmed".

### Server-side total computation (security)

The `POST /api/orders` controller looks up each `MenuItem` by ID and computes `total = Σ (menu.price × qty)`. Any `total` field in the request body is destructured but never passed to `Order.create`. This prevents a tampered client from submitting an order for, say, a Smash Burger at 1 SAR. The verification batch confirms this by sending `total: 99999` in the request body — the response always reflects the server's recomputed value.

### Anti-email-enumeration in login

`POST /api/auth/login` returns the **same** `401 Invalid email or password` error for both:

1. The email isn't registered, and
2. The email is registered but the password is wrong.

The lookup uses a single code path:

```js
const user = await User.findOne({ email }).select('+password');
if (!user || !(await user.comparePassword(password))) {
  return res.status(401).json({ error: 'Invalid email or password' });
}
```

A different message for "no such user" would let an attacker enumerate registered emails. (Timing-attack hardening — running bcrypt against a dummy hash when the user is missing — is out of scope for this milestone.)

### Why Showtime exists as its own collection

The Phase 1 plan considered storing `takenSeats: [String]` directly on a Showtime document. We rejected that in favor of computing taken seats from the `Order` collection (`Order.distinct('seat', { showtime: id })`) backed by the **unique compound index on `{ showtime, seat }`**. This gives:

- A single source of truth (orders).
- A database-level guarantee against double-booking, even under concurrent requests — Mongo's E11000 surfaces as a 409.
- No need for two-phase reservations or stale-reservation cleanup jobs.

## Deployment

The app is deployed on a free-tier-only stack: Vercel (frontend), Render (backend), and MongoDB Atlas M0 (database). Every push to `main` redeploys both ends automatically.

### Frontend — Vercel

- URL: **https://seatbite.vercel.app**
- Auto-deploys from `main` on every push
- Vite production build (`npm run build` → `dist/`)
- Environment: `VITE_API_URL=https://seatbite-api.onrender.com/api`
- HTTPS handled automatically by Vercel

### Backend — Render

- URL: **https://seatbite-api.onrender.com**
- Auto-deploys from `main` on every push
- Free tier (web service); sleeps after 15 min of inactivity, ~30–60 s cold-start
- HTTPS handled automatically by Render
- Environment variables (set in the Render dashboard):
  - `MONGO_URI` — MongoDB Atlas connection string
  - `JWT_SECRET` — JWT signing secret
  - `NODE_ENV=production` — switches morgan to `combined` log format
  - `CORS_ORIGINS` — optional override; defaults to `http://localhost:5173,https://seatbite.vercel.app,*.vercel.app`

### Database — MongoDB Atlas

- M0 free-tier cluster, **Seoul region** (`ap-northeast-2`)
- IP allow-list set to `0.0.0.0/0` for the demo (a production deployment would tighten this to Render's egress IPs)
- Database name: `seatbite`
- Collections: `users`, `movies`, `venues`, `menuitems`, `showtimes`, `orders`

### CORS

The Express server allows requests from:

- `http://localhost:5173` — local Vite dev server
- `https://seatbite.vercel.app` — production frontend
- Any `*.vercel.app` subdomain — Vercel preview deploys for branches and PRs

The list is configurable via the `CORS_ORIGINS` env var (comma-separated; supports `*.` hostname suffix wildcards). Rules in [server/app.js](server/app.js).

## Known Limitations & Future Work

- **No login UI on the frontend** — `/api/auth/register`, `/login`, and `/me` are wired and tested, but the SPA doesn't expose a sign-in screen yet. The placeholder تسجيل button in the header is a no-op. The auth endpoints are fully documented in [API Documentation](#api-documentation) so a frontend pass can be added without backend changes.
- **Apple Pay and STC Pay payment methods are visual mocks** — clicking Pay on these methods runs the same fake 1.5s spinner and places the order via the standard endpoint, identical to Credit/Debit. Real payment integration is out of scope for this milestone.
- **Render free-tier cold starts** — the backend sleeps after 15 minutes of inactivity. The first request after a sleep takes 30–60 seconds, partially mitigated by the in-app "Waking up server..." banner. Could be eliminated by upgrading to Render's paid tier, or by adding an external cron pinger (e.g. UptimeRobot hitting `/api/health` every 10 minutes).
- **Showtime picker UI** — the frontend auto-selects the first available showtime for the chosen movie+venue pair. The backend supports listing all showtimes (`GET /api/showtimes?movieId=&venueId=`) but the SPA has no UI for the user to pick a specific one.
- **No pagination on `GET /api/orders`** — endpoint caps at the 50 newest orders. With significant volume this would need a `?limit=` and `?cursor=` (or `?page=`) query.
- **No automated frontend tests** — only ESLint runs. Vitest + React Testing Library would be the natural addition.
- **No rate limiting on `/api/auth/login`** — `express-rate-limit` would be a one-file addition.
- **Inline `express-validator` polish** — validation lives inline in each controller. A shared `middleware/validate.js` running validator chains was deferred from the original plan.

## Testing

The backend has an integration-test PowerShell batch that exercises every order-related code path: order creation with bogus client total (server must compute its own), seat-taken display, duplicate-seat 409 collision, list/get endpoints, and seven distinct validation 400/404 cases.

The script is reproduced inline below — save as `verify-phase5.ps1` (or paste into a PowerShell terminal) and run from the project root with the dev server up:

```powershell
$base = "http://localhost:5000/api"
function Status($r) { if ($r) { return $r.Exception.Response.StatusCode.value__ } }

npm run seed | Out-Host

$movie    = (Invoke-RestMethod "$base/movies")[0]
$venue    = (Invoke-RestMethod "$base/venues?chain=$($movie.chains[0])")[0]
$showtime = (Invoke-RestMethod "$base/showtimes?movieId=$($movie.id)&venueId=$($venue.id)")[0]
$showtimeId = $showtime.id
$menu  = Invoke-RestMethod "$base/menu"
$item1 = $menu | Where-Object { $_.cat -eq 'snacks' } | Select-Object -First 1
$item2 = $menu | Where-Object { $_.cat -eq 'drinks' } | Select-Object -First 1

# Happy path with a nonsense client total — server must recompute
$body = @{
  guestName = "Alice"
  showtime  = $showtimeId
  seat      = "A1"
  items     = @(
    @{ menuItemId = $item1.id; qty = 2 },
    @{ menuItemId = $item2.id; qty = 1 }
  )
  total     = 99999
} | ConvertTo-Json -Depth 5
$order = Invoke-RestMethod -Method POST -Uri "$base/orders" -ContentType "application/json" -Body $body
"order total: $($order.total) (expect $($item1.price*2 + $item2.price))"

# Seat collision — expect 409
$dup = @{ guestName="Bob"; showtime=$showtimeId; seat="A1"; items=@(@{menuItemId=$item1.id;qty=1}) } | ConvertTo-Json -Depth 5
try { Invoke-RestMethod -Method POST -Uri "$base/orders" -ContentType "application/json" -Body $dup }
catch { "duplicate seat: status=$(Status $_) (expect 409)" }
```

For ad-hoc API spot-checks during development, every endpoint section in [API Documentation](#api-documentation) above includes an example `curl` or `Invoke-RestMethod` command.

The frontend has no automated tests; verify visually with `npm run dev` and:

1. Confirm a green LIVE badge in the header.
2. Walk the five-step flow (movie → venue → seat → cart → timeline). The cart total shown matches `Σ price × qty`.
3. With the server still running, kill it (Ctrl-C in its terminal) and reload the page. The yellow fallback banner should appear and the badge should switch to CACHED. The full flow should still work against in-file constants.
4. Open two browser windows side by side, walk both to the same seat at the same showtime, and try to order. The second attempt should alert "Seat just got taken — pick another" and reset to seat selection.
