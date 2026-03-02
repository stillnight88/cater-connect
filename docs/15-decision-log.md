# Phase 15 — Decision Log

> Purpose: Record architectural decisions, context, and trade-offs to prevent future confusion.

---

## Decision 1 — Use Next.js (App Router)

Context:
Learning-first project with full-stack intent.

Chosen:
Next.js (App Router)

Why:
- Unified full-stack framework.
- Encourages server-first architecture.
- Modern industry alignment (2026 standards).

Rejected:
- React + Express (split deployment, more infrastructure overhead).
- Other frameworks not aligned with current expertise.

Trade-offs:
- Increased architectural complexity.
- Risk of mixing server and client logic.

Status:
Closed.

---

## Decision 2 — Adopt Layered Architecture (UI → Domain → Infrastructure)

Context:
Prevent architectural drift in hybrid Next.js environment.

Why:
- Clear separation of responsibilities.
- Centralized business logic.
- Easier refactoring and testing.

Rejected:
- Logic inside components.
- Flat utility-based structure.

Trade-offs:
- Requires discipline.
- Slightly more boilerplate.

Status:
Closed.

---

## Decision 3 — Hybrid Backend Pattern (Server Actions + API Routes)

Context:
Next.js App Router environment.

Why:
- Server Actions for form-driven flows.
- API Routes for reusable and complex endpoints.
- Shared domain logic to avoid duplication.

Risk:
- Pattern inconsistency if discipline not enforced.

Mitigation:
- Domain logic centralized in /lib/domain.

Status:
Closed.

---

## Decision 4 — Use MongoDB as Primary Database

Context:
Learning-first + small-scale project.

Why:
- Familiarity reduces cognitive overhead.
- Flexible schema for iterative modeling.

Rejected:
- PostgreSQL (stronger relational enforcement but higher modeling cost).
- Firebase (vendor lock-in, different paradigm).

Trade-offs:
- Weaker relational guarantees.
- Application-level invariant enforcement required.

Status:
Closed.

---

## Decision 5 — Use Auth.js (formerly NextAuth)

Context:
Avoid implementing custom auth prematurely.

Why:
- Reduces early security risk.
- Integrated with Next.js.
- Supports session-based auth.

Trade-offs:
- Less low-level control.
- Migration complexity if switching later.

Status:
Closed.

---

## Decision 6 — Use Redis for Caching and Rate Limiting

Context:
Existing Redis rate limiter project available.

Why:
- Improve read performance.
- Integrate rate limiting without new infrastructure.
- Learn infrastructure layering.

Rejected:
- No caching.
- External rate limiting service.

Trade-offs:
- Added operational complexity.
- Cache invalidation risk.

Important:
Redis is not a source of truth.

Status:
Closed.

---

## Decision 7 — Identity Model (Unified User with Roles)

Context:
Need to model Customer and Caterer roles.

Chosen:
Single User model with role field.

Why:
- Simplifies authentication.
- Avoids duplication.
- Enables future extensibility (admin role).

Trade-offs:
- Requires careful authorization checks.

Status:
Closed.

---

## Decision 8 — Global API Response Format

Context:
Ensure predictable frontend handling.

Why:
- Consistent error management.
- Simplifies client logic.
- Easier debugging.

Trade-offs:
- Slight boilerplate overhead.

Status:
Closed.

---

## Decision 9 — Phase-Based Development Strategy

Context:
Prevent burnout and scope creep.

Why:
- Deliver vertical slice first.
- Stabilize before optimizing.
- Control execution risk.

Trade-offs:
- Requires discipline to stop adding features.

Status:
Closed.