# Backend Architecture — Phase 2.3 Step 1

This document describes the backend foundation introduced in Phase 2.3 Step 1.

---

## 1. Backend Responsibility

The backend API is the **central orchestrator** between:

- Next.js frontend (presentation)
- PostgreSQL (authoritative business data)
- Face recognition service (identity candidate only)
- Vector DB (face embeddings only)

The backend owns:

- Request validation
- Authentication and authorization (future steps)
- Business rule enforcement
- Transaction boundaries around PostgreSQL operations
- Structured API responses and error handling

The backend does **not**:

- Store face embeddings (Vector DB)
- Run face detection/recognition models (dedicated service/pipeline)
- Allow the frontend to access PostgreSQL directly

---

## 2. Technology Decision (Phase 2.3 Step 1)

| Item | Decision | Rationale |
|------|----------|-----------|
| Runtime | **Node.js 20+** | Aligns with Next.js frontend ecosystem |
| Framework | **Express 4** | Mature REST support, simple middleware model |
| Language | **TypeScript** | Type safety for API contracts and data access |
| PostgreSQL driver | **pg** (node-postgres) | Connection pooling, parameterized queries, transactions |
| Validation | **Zod** | Request/query validation with structured errors |
| Testing | **Vitest + Supertest** | HTTP integration tests against real PostgreSQL |

**Note:** Backend language/framework was **OPEN** in Phase 1 docs. This step records the first implementation choice. Alternative valid stacks (e.g. Python/FastAPI, Go) remain possible in theory but are not used here.

---

## 3. Layered Structure

```
backend/src/
├── config/           # Environment loading
├── database/         # PostgreSQL pool, health check, transactions
├── repositories/     # Parameterized SQL data access
├── services/         # Business orchestration (thin in Step 1)
├── controllers/      # HTTP request/response mapping
├── routes/           # Route definitions
├── middleware/       # Error handling, auth placeholder
├── validation/       # Zod schemas
├── errors/           # AppError types
└── types/            # API DTOs
```

**Separation principle:** Route handlers do not contain raw SQL. Repositories execute parameterized queries; services coordinate business operations.

---

## 4. PostgreSQL Integration

| Concern | Implementation |
|---------|----------------|
| Connection | `DATABASE_URL` from root `.env` |
| Pooling | `pg.Pool` (max 10 connections) |
| Queries | `database.query(text, params)` — always parameterized |
| Transactions | `database.withTransaction(fn)` — `BEGIN` / `COMMIT` / `ROLLBACK` |
| Health check | `SELECT 1` via pool |

**SQL injection prevention:** User input is passed only as query parameters (`$1`, `$2`, …). SQL strings are never built via string concatenation with user values.

---

## 5. Frontend / Backend Boundary

```
Next.js Frontend  →  HTTPS/JSON REST  →  Backend API  →  PostgreSQL
```

- Frontend calls `{API_BASE_URL}/api/v1/*`
- Frontend never receives database credentials
- Frontend never writes attendance based solely on face recognition result

---

## 6. API Structure

**Base path:** `/api/v1` (per [api-contract.md](./api-contract.md))

### Implemented (Step 1)

| Endpoint | Contract section | Notes |
|----------|------------------|-------|
| `GET /health` | §17 | Returns `postgres` and `vector_db` status |
| `GET /employees` | §4 | Lists employees; `face_registered` derived from PostgreSQL metadata |

### Contract Gaps (Step 1)

| Item | Status |
|------|--------|
| `GET /employees` ADMIN auth | Auth not implemented; `authPlaceholder` middleware reserved |
| Pagination for list endpoints | OPEN in contract — not implemented |
| `vector_db: ok` on health | Returns `degraded` until Vector DB is integrated |

### Future Face Recognition Boundary

Per api-contract and architecture docs:

1. `POST /face/recognize` — returns `employee_id` candidate + confidence (future)
2. `POST /attendance/check-in` — backend validates eligibility and writes attendance (future)

**Face recognition must not write attendance directly.**

---

## 7. Error Handling

Standard envelope (api-contract §2.4):

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": []
  }
}
```

| HTTP | Code | Usage |
|------|------|-------|
| 400 | `VALIDATION_ERROR` | Invalid query/body |
| 404 | `NOT_FOUND` | Missing route/resource |
| 409 | `CONFLICT` | Reserved for future use |
| 500 | `INTERNAL_ERROR` | Server/database errors |

Raw PostgreSQL errors are logged server-side only; clients receive generic messages.

---

## 8. Authentication Boundary (Future)

Step 1 includes `authPlaceholder` middleware on protected routes. Future steps will:

1. Verify JWT or session from `POST /auth/login`
2. Enforce `ADMIN` / `EMPLOYEE` roles per endpoint
3. Scope employee self-service to own `employee_id`

Face recognition is **not** application authentication for the employee portal.

---

## 9. Environment Configuration

Root `.env` (not committed):

```
DATABASE_URL=postgres://...@localhost:5432/smart_attendance?sslmode=disable
BACKEND_PORT=3001
NODE_ENV=development
```

When backend runs on the host and PostgreSQL runs in Docker, use `localhost` and `POSTGRES_PORT` from `.env`.

---

## 10. Future Integration Points

| Component | Integration approach |
|-----------|---------------------|
| Vector DB | Separate client module; health check will probe connectivity |
| Face recognition | `POST /face/recognize` returns candidate ID; attendance service validates |
| Attendance | Call PostgreSQL functions (`complete_attendance_checkout`, etc.) via repository layer |
| Payroll / Leave | Service layer + PostgreSQL functions per `docs/database/transactions.md` |

---

## Related Documents

- [API Contract](./api-contract.md)
- [System Architecture](../requirements/system-architecture.md)
- [Database Transactions](../database/transactions.md)
- [Phase 2 Decisions](../phase2/decisions.md)
