# SHADOWGUARD — AI Governance Platform

A full-stack app for monitoring and governing how employees use AI tools
(ChatGPT, Copilot, Gemini, etc.) inside an organization: what's allowed,
what's restricted, what's blocked, and why.

This project has two halves:

```
shadowguard/
├── frontend/   React + TypeScript + Vite + Tailwind (the UI you already built)
└── backend/    Node.js + Express + TypeScript + SQLite (new — the real API)
```

Before, the frontend generated random fake data in the browser every time
you refreshed the page. Now the frontend asks a real server for real data,
and that data lives in an actual database file. That's what "adding a
backend" means in practice.

---

## 1. How the whole system fits together

```
 ┌─────────────────────┐        HTTP requests        ┌──────────────────────┐
 │  frontend (Vite)     │  ───  e.g. GET /api/policies ──▶ │  backend (Express)   │
 │  localhost:5173      │  ◀───   JSON responses      ───  │  localhost:4000      │
 └─────────────────────┘                              └──────────┬───────────┘
                                                                   │
                                                                   ▼
                                                        ┌──────────────────────┐
                                                        │  shadowguard.db      │
                                                        │  (SQLite file)        │
                                                        └──────────────────────┘
```

- **Frontend** = what the user sees and clicks. It has zero knowledge of
  SQL or databases — it only knows how to call functions like
  `getPolicies()` and render whatever comes back.
- **Backend** = a small Express server. Its only job is: receive an HTTP
  request, run a database query, send back JSON.
- **Database** = one file, `backend/shadowguard.db`. SQLite stores the
  entire database in this single file — no separate database server to
  install or run.

Every page in the app maps to one backend route:

| Page (frontend/src/pages)   | Backend route                     | Backend file                          |
|------------------------------|------------------------------------|----------------------------------------|
| Dashboard                    | `GET /api/dashboard/metrics`       | `backend/src/routes/dashboard.ts`      |
| AI Activity                  | `GET /api/ai-interactions`         | `backend/src/routes/interactions.ts`   |
| Risk Assessment               | `GET /api/risk-assessments`        | `backend/src/routes/risk.ts`           |
| Data Security                 | `GET /api/data-security`           | `backend/src/routes/dataSecurity.ts`   |
| Policies                      | `GET/PATCH /api/policies`          | `backend/src/routes/policies.ts`       |
| Audit Logs                    | `GET /api/audit-logs`              | `backend/src/routes/auditLogs.ts`      |
| Settings                      | `GET /api/settings/*`              | `backend/src/routes/settings.ts`       |

The **only** file in the frontend that talks to the backend is
`frontend/src/services/api.ts`. Every page imports functions from that one
file instead of calling `fetch` directly — so if the API ever changes,
there's exactly one file to update.

---

## 2. Running it in VS Code

**Requirements:** [Node.js](https://nodejs.org) version **22 or later** (check
with `node -v` in a terminal). This project uses Node's built-in SQLite
support, which was added in Node 22 — no separate database software to
install, and no native-module compilation step (some SQLite npm packages
need Visual Studio Build Tools on Windows to compile; this project
deliberately avoids that by using what ships with Node itself).

### Step 1 — Open the project
Open the `shadowguard` folder (the one this README is in) in VS Code:
`File → Open Folder…`

### Step 2 — Install dependencies
Open a terminal in VS Code (`` Ctrl+` `` / `` Cmd+` ``) and run, from the
project root:

```bash
npm run install:all
```

This installs both `backend/node_modules` and `frontend/node_modules` in
one go (it's just a shortcut for running `npm install` in each folder).

### Step 3 — Run both servers together

```bash
npm run dev
```

This uses a small tool called `concurrently` to start the backend and
frontend at the same time, in one terminal, with color-coded `[BACKEND]`
and `[FRONTEND]` prefixes so you can tell their logs apart.

- Backend runs at **http://localhost:4000**
- Frontend runs at **http://localhost:5173** ← open this one in your browser

The very first time the backend starts, it notices the database is empty
and automatically seeds it with sample data (87 AI interactions, 8
policies, 12 audit logs, etc.), so the dashboard isn't blank.

> You'll see a one-line `ExperimentalWarning: SQLite is an experimental
> feature` in the backend logs — that's expected and harmless. Node marks
> its built-in SQLite support as experimental, but it's fully functional
> and this project relies on it specifically to avoid native-module
> compilation issues (see the comment at the top of
> `backend/src/db/connection.ts` for the full explanation).

> Prefer two separate terminals instead? Run `npm run dev:backend` in one
> and `npm run dev:frontend` in the other — same result, just split up.

### Resetting the sample data

If you ever want to wipe the database back to a fresh state:

```bash
npm run seed
```

This deletes and regenerates all sample rows in `backend/shadowguard.db`.
(Or just delete `backend/shadowguard.db` entirely — the server will
re-seed it automatically on the next start.)

---

## 3. Project structure, explained

### `backend/`

```
backend/
├── src/
│   ├── index.ts              Entry point: starts Express, mounts routes, auto-seeds
│   ├── types.ts               TypeScript types shared across the backend
│   ├── utils.ts                Small helpers (pagination, JSON parsing)
│   ├── db/
│   │   ├── connection.ts      Opens the SQLite file, creates tables if missing
│   │   └── seed.ts            Generates and inserts sample data
│   └── routes/                One file per resource (dashboard, policies, etc.)
├── .env                        Local config (port, CORS origin) — not committed
├── .env.example                 Template for .env
└── package.json
```

**How a request flows, end to end** (using "toggle a policy off" as the
example):

1. On the **Policies** page, you click a toggle switch.
2. `frontend/src/pages/PoliciesPage.tsx` calls `updatePolicyStatus(id, 'disabled')`
   from `services/api.ts`.
3. That function sends `PATCH http://localhost:4000/api/policies/pol-008`
   with a JSON body `{ "status": "disabled" }`.
4. `backend/src/routes/policies.ts` receives it, validates the body, and
   runs an `UPDATE policies SET status = ? ...` SQL statement against
   `shadowguard.db`.
5. It sends back the updated policy as JSON.
6. The frontend updates its local state, and the UI reflects the change.

Refresh the page (or restart the server) and the change is still there —
because it's stored in the database file, not just in memory in the
browser like before.

**Why SQLite specifically?** For a project this size, a full database
server (Postgres, MySQL) would be overkill to set up and run. SQLite
stores everything in one file (`shadowguard.db`) that lives right next to
the code. Delete the file, run `npm run seed`, and you're back to a clean
slate. The SQL you write against it is standard SQL, so the concepts
transfer directly if this project ever needs to move to a bigger database
later.

### `frontend/`

Unchanged in structure from what you built — `pages/`, `components/`,
`types/`. The **only** file that changed meaningfully is
`src/services/api.ts`: it used to import from `src/data/mockData.ts` and
return fake data instantly; now it makes real `fetch()` calls to the
backend. Every function keeps the exact same name and return type as
before, so none of your page components needed to change.

`src/data/mockData.ts` is left in place for reference (it's what the
backend's seed script was ported from) but nothing imports it anymore.

---

## 4. Environment variables

Both apps read config from a `.env` file (already created for you, with
sensible defaults — you shouldn't need to change anything to run locally).

**`backend/.env`**
```
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
```
`FRONTEND_ORIGIN` is used for CORS — it tells the backend "it's OK to
accept requests from this address." If you ever run the frontend on a
different port, update this to match.

**`frontend/.env`**
```
VITE_API_URL=http://localhost:4000/api
```
This tells the frontend where to send its API requests. Vite exposes any
variable prefixed with `VITE_` to your browser code via `import.meta.env`.

---

## 5. Useful commands, all in one place

Run from the project root unless noted:

| Command                    | What it does                                            |
|-----------------------------|-----------------------------------------------------------|
| `npm run install:all`        | Installs dependencies for both frontend and backend       |
| `npm run dev`                 | Runs both servers together (for everyday development)     |
| `npm run dev:backend`         | Runs only the backend                                      |
| `npm run dev:frontend`        | Runs only the frontend                                      |
| `npm run seed`                | Resets the database to fresh sample data                    |
| `npm run build`                | Production build of both (backend → `backend/dist`, frontend → `frontend/dist`) |

---

## 6. Where to go next

Some natural next steps if you want to keep extending this for your major
project submission:

- **Authentication** — right now anyone can hit the API. Adding a login
  page + a JWT-based auth middleware (checking a token on protected
  routes) would be a strong addition, and ties in nicely with "Settings →
  User Profile."
- **Real interaction logging** — right now interactions are pre-seeded.
  You could add a `POST /api/ai-interactions` route that a browser
  extension or proxy could call in real time as employees use AI tools.
- **Charts/exports** — the Audit Logs page mentions CSV export in its
  sample data; wiring up a real `GET /api/audit-logs/export` endpoint that
  streams a CSV would be a nice, self-contained feature to add.
- **Tests** — the route files are small and pure enough (SQL in, JSON out)
  that they're straightforward to unit test with something like Vitest or
  Jest + `supertest`.

If anything in the code is unclear, every backend route file has comments
at the top explaining what it does and why — start there.
