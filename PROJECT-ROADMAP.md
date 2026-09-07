# Project Roadmap — Smart Workforce Attendance & Payroll Management System

This roadmap reflects the **actual** project status. Items marked **COMPLETE** have implementation or design artifacts in the repository. Items marked **PLANNED** or **NEXT** are not yet implemented.

---

## PHASE 1 — Requirements & Architecture

**STATUS: COMPLETE**

| Deliverable | Location |
|-------------|----------|
| Problem statement | `docs/requirements/problem-statement.md` |
| Objectives | `docs/requirements/objectives.md` |
| Scope | `docs/requirements/scope.md` |
| Functional requirements | `docs/requirements/functional-requirements.md` |
| Non-functional requirements | `docs/requirements/non-functional-requirements.md` |
| User roles | `docs/requirements/user-roles.md` |
| Business rules | `docs/requirements/business-rules.md` |
| System architecture | `docs/requirements/system-architecture.md` |
| API / integration contract | `docs/integration/api-contract.md` |

---

## PHASE 2.1 — Database + Face Data Design

**STATUS: COMPLETE** (design only)

| Deliverable | Location |
|-------------|----------|
| ER diagram | `docs/database/er-diagram.md` |
| Relational schema | `docs/database/relational-schema.md` |
| Normalization | `docs/database/normalization.md` |
| Database constraints | `docs/database/database-constraints.md` |
| Face data architecture | `docs/face/face-data-architecture.md` |
| Face registration flow | `docs/face/face-registration-flow.md` |
| Face recognition flow | `docs/face/face-recognition-flow.md` |
| Vector DB design | `docs/face/vector-db-design.md` |
| Integration decisions | `docs/phase2/decisions.md` |

---

## PHASE 2.2 — PostgreSQL Database Implementation

### Step 1 — PostgreSQL / Docker

**STATUS: COMPLETE**

- `docker-compose.yml` — PostgreSQL 16 Alpine
- `database/migrations/20240903000000_foundation.sql`
- `database/scripts/migrate.sh`
- `.env.example`, `database/README.md`

### Step 2 — Schema + Constraints

**STATUS: COMPLETE**

- `database/migrations/20240903100000_application_schema.sql` — 20 tables, 11 enums
- Foreign keys, unique constraints, check constraints, partial unique indexes
- `database/scripts/verify_step2_constraints.sql` — tests A–H

### Step 3 — Functions / Triggers / Views / Transactions / Indexes / DML / Tests

**STATUS: COMPLETE**

- `database/migrations/20240903110000_advanced_dbms_features.sql`
- PostgreSQL functions, triggers, views, transaction helpers, supporting indexes
- `database/scripts/verify_step3_dbms.sql` — tests S3-01..S3-20
- Documentation: `docs/database/functions.md`, `triggers.md`, `views.md`, `transactions.md`, `indexes.md`

**Known DB-layer deferrals (documented, not implemented):**

- `CALENDAR_WORKING_DAYS` payroll divisor calculation
- Leave balance admin override
- Deduction cap / `net_pay >= 0` enforcement
- Attendance lateness grace period

---

## PHASE 2.3 — Backend Application

### Step 1 — Backend Foundation + PostgreSQL Integration

**STATUS: COMPLETE**

- `backend/` — Node.js + Express + TypeScript
- PostgreSQL connection via `DATABASE_URL`, parameterized query layer, connection pooling
- `GET /api/v1/health` — real PostgreSQL connectivity check
- `GET /api/v1/employees` — list employees from PostgreSQL
- Validation (Zod), structured error handling, Vitest + Supertest tests
- `docs/integration/backend-architecture.md`

**Known deferred item:** `GET /employees` ADMIN authentication — placeholder middleware only; real auth is Step 2.

### Step 2 — Authentication + Authorization

**STATUS: NEXT**

- `POST /auth/login`, JWT or session (per contract)
- Protect routes by role (`ADMIN`, `EMPLOYEE`)
- Enforce `GET /employees` ADMIN requirement

### Step 3 — Employee Management API

**STATUS: PLANNED**

- Create, read, update, deactivate employees
- Department and shift assignment

### Step 4 — Face Registration + Embedding Pipeline

**STATUS: PLANNED**

- Admin face registration flow
- Embedding generation coordination
- PostgreSQL `face_registration_metadata` writes

### Step 5 — Vector DB Integration + Face Recognition

**STATUS: PLANNED**

- Vector DB client and health check
- `POST /face/recognize` — returns candidate `employee_id`
- Similarity threshold validation

### Step 6 — Attendance APIs + Business Rules

**STATUS: PLANNED**

- Check-in / check-out via backend (not face service)
- Call PostgreSQL `complete_attendance_checkout()` and related functions
- Duplicate session prevention, inactive employee rejection

### Step 7 — Leave + Overtime APIs

**STATUS: PLANNED**

- Leave request, approval (`approve_leave_request()`)
- Overtime submission and approval

### Step 8 — Payroll Engine + Payroll APIs

**STATUS: PLANNED**

- Payroll run creation and finalization (`finalize_payroll_run()`)
- Bonus, deduction, payment recording

### Step 9 — Audit + Reporting APIs

**STATUS: PLANNED**

- Audit log queries
- Reporting views (`v_payroll_register`, `v_daily_attendance_report`, etc.)

---

## PHASE 3 — Next.js Frontend

**STATUS: PLANNED**

| Stage | Description |
|-------|-------------|
| Frontend foundation | Next.js app, API client, layout |
| Authentication UI | Login, session handling |
| Admin dashboard | Overview metrics |
| Employee dashboard | Self-service home |
| Employee management | Admin CRUD UI |
| Face registration UI | Camera capture for admin registration |
| Attendance UI | Kiosk / employee check-in flow |
| Leave / overtime UI | Request and approval screens |
| Payroll UI | Run payroll, view register |
| Reports | Admin and employee reports |

---

## PHASE 4 — Full System Integration

**STATUS: PLANNED**

End-to-end flow:

```
Camera
  → Face Detection
  → Face Embedding
  → Vector DB Similarity Search
  → Employee ID (candidate)
  → Backend API (validation)
  → Business Rules
  → PostgreSQL (authoritative write)
  → Dashboard (read via API)
```

---

## PHASE 5 — Testing & Security

**STATUS: PLANNED**

- Unit testing (backend services)
- Integration testing (API + PostgreSQL)
- API contract testing
- Database regression tests
- Authentication / authorization testing
- Face recognition accuracy and threshold testing
- Vector DB integration testing
- Security testing (injection, auth bypass, secret exposure)
- Validation and error-path testing
- Transaction and concurrency testing

---

## PHASE 6 — Deployment & Documentation

**STATUS: PLANNED**

- Production configuration (TLS, secrets management)
- Deployment (backend, frontend, PostgreSQL, Vector DB)
- Database backup and recovery considerations
- Environment configuration for staging/production
- Published API documentation
- Final ER diagram and DBMS documentation package
- Demo preparation and presentation materials

---

## Summary Status Table

| Phase | Status |
|-------|--------|
| Phase 1 — Requirements & Architecture | **COMPLETE** |
| Phase 2.1 — Database + Face Design | **COMPLETE** |
| Phase 2.2 Step 1 — Docker/PostgreSQL | **COMPLETE** |
| Phase 2.2 Step 2 — Schema + Constraints | **COMPLETE** |
| Phase 2.2 Step 3 — Advanced DBMS | **COMPLETE** |
| Phase 2.3 Step 1 — Backend Foundation | **COMPLETE** |
| Phase 2.3 Step 2 — Auth | **NEXT** |
| Phase 2.3 Steps 3–9 | **PLANNED** |
| Phase 3 — Frontend | **PLANNED** |
| Phase 4 — Full Integration | **PLANNED** |
| Phase 5 — Testing & Security | **PLANNED** |
| Phase 6 — Deployment & Docs | **PLANNED** |
