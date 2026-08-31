# Business Rules

Business rules define **domain logic** that the backend and PostgreSQL must enforce. They go beyond CRUD by encoding workforce policies as invariant conditions and calculations.

Rules are labeled **REQ** (MVP) or **FUTURE** (deferred). Values marked **TBD** must be finalized before implementation.

---

## 1. Employee Rules

| ID | Rule | Priority |
|----|------|----------|
| BR-EMP-01 | **REQ** — An employee must belong to exactly one department at a time | MVP |
| BR-EMP-02 | **REQ** — An employee must be assigned exactly one primary shift at a time | MVP |
| BR-EMP-03 | **REQ** — Deactivated employees cannot check in, accrue new leave, or appear in new payroll runs | MVP |
| BR-EMP-04 | **REQ** — Employee must have a unique employee code or identifier within the organization | MVP |
| BR-EMP-05 | **REQ** — Face registration requires an active employee record in PostgreSQL | MVP |

---

## 2. Shift & Attendance Rules

| ID | Rule | Priority |
|----|------|----------|
| BR-ATT-01 | **REQ** — A check-in creates an attendance session with a check-in timestamp | MVP |
| BR-ATT-02 | **REQ** — A check-out closes the open session with a check-out timestamp | MVP |
| BR-ATT-03 | **REQ** — An employee cannot have more than one open attendance session at a time | MVP |
| BR-ATT-04 | **REQ** — Check-out without a prior check-in on the same session is rejected | MVP |
| BR-ATT-05 | **REQ** — Attendance is evaluated against the employee's assigned shift for lateness determination | MVP |
| BR-ATT-06 | **TBD** — Grace period for late check-in (e.g., 15 minutes) | MVP — value TBD |
| BR-ATT-07 | **TBD** — Whether early check-in is allowed or clamped to shift start | MVP — policy TBD |
| BR-ATT-08 | **REQ** — Manual attendance correction by admin requires audit log entry with reason | MVP |
| BR-ATT-09 | **REQ** — Approved leave on a date overrides absence marking for that date | MVP |
| BR-ATT-10 | **FUTURE** — Automatic half-day/absent classification based on hours worked | Deferred |

### Attendance State Machine (Conceptual)

```
[No open session]
      │ check-in (valid employee, active, face match)
      ▼
[Checked in] ──check-out──► [Completed session]
      │
      └── duplicate check-in ──► REJECTED
```

**Why:** Explicit session states prevent duplicate or orphan records that would corrupt payroll hour calculations.

---

## 3. Face Recognition Rules

| ID | Rule | Priority |
|----|------|----------|
| BR-FACE-01 | **REQ** — Recognition must meet a minimum similarity threshold to return a match (**threshold: TBD**) | MVP |
| BR-FACE-02 | **REQ** — Below-threshold or no match → no attendance side effects | MVP |
| BR-FACE-03 | **REQ** — Recognition returns employee ID; backend re-validates employee status before attendance write | MVP |
| BR-FACE-04 | **REQ** — Only registered employees appear in similarity search scope | MVP |
| BR-FACE-05 | **TBD** — Policy when multiple embeddings match above threshold (highest score wins vs. reject ambiguous) | MVP — TBD |
| BR-FACE-06 | **FUTURE** — Liveness detection to prevent photo spoofing | Deferred |

**Why:** Biometric identification is probabilistic. Backend validation ensures recognition errors do not directly corrupt authoritative records.

---

## 4. Leave Rules

| ID | Rule | Priority |
|----|------|----------|
| BR-LEAVE-01 | **REQ** — Leave request must specify type, start date, and end date | MVP |
| BR-LEAVE-02 | **REQ** — Leave requests start in `PENDING` status | MVP |
| BR-LEAVE-03 | **REQ** — Only `ADMIN` can transition leave to `APPROVED` or `REJECTED` | MVP |
| BR-LEAVE-04 | **REQ** — Approved leave deducts from employee leave balance for the leave type | MVP |
| BR-LEAVE-05 | **REQ** — Cannot approve leave that exceeds available balance (unless admin override — **override policy: TBD**) | MVP |
| BR-LEAVE-06 | **TBD** — Leave types and annual entitlements (e.g., casual: 12, sick: 10) | MVP — values TBD |
| BR-LEAVE-07 | **REQ** — Rejected leave does not affect balance | MVP |
| BR-LEAVE-08 | **FUTURE** — Carry-forward unused leave to next year | Deferred |

---

## 5. Overtime Rules

| ID | Rule | Priority |
|----|------|----------|
| BR-OT-01 | **REQ** — Overtime must be linked to a specific employee and work date | MVP |
| BR-OT-02 | **REQ** — Overtime starts in `PENDING` status until admin approval | MVP |
| BR-OT-03 | **REQ** — Only approved overtime is included in payroll calculation | MVP |
| BR-OT-04 | **TBD** — Overtime rate multiplier (e.g., 1.5× base hourly rate) | MVP — value TBD |
| BR-OT-05 | **TBD** — Maximum overtime hours per day/month | MVP — TBD |
| BR-OT-06 | **FUTURE** — Auto-suggest overtime from attendance exceeding shift end | Deferred |

---

## 6. Payroll Rules

| ID | Rule | Priority |
|----|------|----------|
| BR-PAY-01 | **REQ** — Payroll is calculated per defined pay period (start date, end date) | MVP |
| BR-PAY-02 | **REQ** — A pay period cannot be payroll-finalized twice (idempotent run protection) | MVP |
| BR-PAY-03 | **REQ** — Payroll run must be atomic (transaction) | MVP |
| BR-PAY-04 | **REQ** — Gross pay derives from base compensation and payable hours/units in the period | MVP |
| BR-PAY-05 | **REQ** — Net pay = gross + bonuses − deductions | MVP |
| BR-PAY-06 | **REQ** — Approved leave days are not counted as absence deductions | MVP |
| BR-PAY-07 | **REQ** — Unapproved absence may reduce payable amount (**formula: TBD**) | MVP |
| BR-PAY-08 | **REQ** — Approved overtime adds to gross per overtime rate rules | MVP |
| BR-PAY-09 | **REQ** — Bonuses and deductions for the period are summed into the calculation | MVP |
| BR-PAY-10 | **REQ** — Finalized payroll records are immutable; errors corrected via adjustment entries | MVP |
| BR-PAY-11 | **TBD** — Pay frequency (monthly, bi-weekly) | MVP — TBD |
| BR-PAY-12 | **TBD** — Base pay model (monthly fixed vs. hourly) | MVP — TBD |
| BR-PAY-13 | **FUTURE** — Pro-rata salary for mid-period joiners/leavers | Deferred |

### Payroll Calculation Inputs (Conceptual)

```
Payable amount =
    base pay component (per pay model)
  + approved overtime amount
  + sum(bonuses for period)
  − sum(deductions for period)
  − absence penalties (if applicable per policy)
```

**Why:** Payroll is the convergence point for attendance, leave, overtime, and adjustments. Explicit inputs make the calculation auditable and testable.

---

## 7. Bonus & Deduction Rules

| ID | Rule | Priority |
|----|------|----------|
| BR-BONUS-01 | **REQ** — Bonus must reference employee, amount, pay period, and reason | MVP |
| BR-DED-01 | **REQ** — Deduction must reference employee, amount, type, pay period, and reason | MVP |
| BR-DED-02 | **REQ** — Total deductions in a period cannot exceed gross pay (**or cap policy: TBD**) | MVP |
| BR-BONUS-02 | **FUTURE** — Recurring bonuses/deductions | Deferred |

---

## 8. Payment Rules

| ID | Rule | Priority |
|----|------|----------|
| BR-PMT-01 | **REQ** — Payment can only be recorded against finalized payroll records | MVP |
| BR-PMT-02 | **REQ** — Payment records include date and optional reference/note | MVP |
| BR-PMT-03 | **REQ** — Payroll status transitions: `DRAFT` → `FINALIZED` → `PAID` (conceptual; exact enum TBD) | MVP |
| BR-PMT-04 | **FUTURE** — Partial payments | Deferred |

---

## 9. Audit Rules

| ID | Rule | Priority |
|----|------|----------|
| BR-AUDIT-01 | **REQ** — Log attendance manual corrections | MVP |
| BR-AUDIT-02 | **REQ** — Log payroll finalization and payment recording | MVP |
| BR-AUDIT-03 | **REQ** — Log employee deactivation and face re-registration | MVP |
| BR-AUDIT-04 | **REQ** — Log bonus and deduction creation/modification | MVP |
| BR-AUDIT-05 | **REQ** — Audit entries are append-only from application layer | MVP |

---

## 10. Database-Level Enforcement (Planned)

The following are **design intentions** for Person A's PostgreSQL track — not implemented in Phase 1:

| Mechanism | Intended Use |
|-----------|--------------|
| **Constraints** | Unique employee codes, valid date ranges, non-negative amounts |
| **Triggers** | Auto-audit on sensitive updates; prevent modification of finalized payroll |
| **Stored functions** | Payroll calculation, leave balance check, attendance hour computation |
| **Views** | Admin payroll register, employee self-service summary |
| **Indexes** | Attendance by (employee, date), payroll by period |

**Why:** Pushing invariants closer to the database reduces the risk of application bugs corrupting financial data.

---

## Open Policy Decisions

The following business values must be agreed before implementation:

1. Pay frequency and pay period boundaries
2. Base pay model (monthly salary vs. hourly)
3. Late grace period and absence penalty formula
4. Leave types and annual entitlements
5. Overtime rate multiplier and caps
6. Face recognition similarity threshold and ambiguous match policy
7. Deduction cap behavior (can net pay go negative?)
