# Backend API

Node.js + Express + TypeScript backend for the Smart Workforce Attendance & Payroll Management System.

## Prerequisites

- Node.js 20+
- PostgreSQL running via Docker (`docker compose up -d` from repository root)
- `.env` configured at repository root (see `.env.example`)

## Setup

```bash
cd backend
npm install
```

## Development

```bash
npm run dev
```

Server listens on `http://localhost:3001` by default (`BACKEND_PORT`).

## API Endpoints (Phase 2.3 Step 1)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/health` | No | Backend and PostgreSQL health |
| GET | `/api/v1/employees` | Placeholder | List employees from PostgreSQL |

## Tests

```bash
npm test
```

Tests use the development PostgreSQL database configured in the root `.env` file. Test data is cleaned up after employee endpoint tests.

## Environment Variables

Configured in the repository root `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BACKEND_PORT` | API port (default `3001`) |
| `NODE_ENV` | `development` / `test` / `production` |

See [backend architecture docs](../docs/integration/backend-architecture.md).
