# Phase 8 — Tech Stack Selection

> Purpose: Select tools intentionally based on constraints, risks, and learning goals.

---

## 1. Frontend / Framework

### Chosen: Next.js (App Router)

Why:

- Enables full-stack development in a single project.
- Supports Server Components and SSR for SEO and performance.
- Aligns with modern React architecture patterns.
- Forces clear separation between server and client logic.

Why App Router (not Pages Router):

- Encourages server-first thinking.
- Better data-fetching patterns.
- Closer to current industry standards (2026).

Alternatives Rejected:

- React + Express (separate deployments, more infrastructure complexity)
- Other frontend frameworks (not aligned with learning path)

Trade-offs:

- Higher complexity than SPA.
- Risk of mixing Server and Client components incorrectly.
- Harder debugging due to hybrid rendering model.

---

## 2. Backend Strategy

### Chosen: Layered architecture inside Next.js

Pattern:

UI → Domain Logic → Data Layer

Implementation:

- Server Actions for form-driven operations.
- API Routes for reusable or complex endpoints.
- Shared domain modules for business logic.

Reason:

- Allows learning both modern (Server Actions) and traditional API patterns.
- Keeps business rules centralized.
- Avoids logic duplication.

Risk:

- Hybrid pattern requires discipline.
- Without boundaries, architecture drift can occur.

---

## 3. Database

### Chosen: MongoDB

Why:

- Familiarity reduces learning overhead.
- Flexible schema supports iterative development.
- Works well with Next.js hosting platforms.

Alternatives Rejected:

- PostgreSQL (strong relational enforcement but higher modeling complexity at this stage)
- Firebase (vendor lock-in, different architectural model)

Trade-offs:

- Weaker relational guarantees.
- Requires careful enforcement of business invariants in application layer.
- Less suitable for complex transactional systems.

Decision Justification:

Given small scale and learning-first goal, MongoDB is acceptable.

---

## 4. Authentication

### Chosen: Auth.js (formerly NextAuth)

Why:

- Reduces early security implementation risk.
- Integrates cleanly with Next.js App Router.
- Supports session-based authentication.
- Allows future migration if deeper control needed.

Trade-offs:

- Less low-level control.
- Migration complexity if switching to custom JWT strategy later.

---

## 5. Caching & Infrastructure

### Chosen: Redis

Why:

- Used for caching read-heavy endpoints.
- Supports rate limiting.
- Enables experimentation with infrastructure patterns.

Important Clarification:

Redis is not required for scale at this stage.
It is used for:
- Learning infrastructure patterns.
- Improving read performance.
- Supporting rate limiting logic.

Trade-offs:

- Additional operational complexity.
- Cache invalidation risks.

---

## 6. Hosting

### Chosen: Render

Why:

- Simple deployment process.
- Suitable for small-scale usage.
- Free tier available.
- Familiar platform.

Trade-offs:

- Cold starts.
- Limited scaling.
- Not optimized for high concurrency SSR workloads.

Given Phase 2 constraints, this is acceptable.

---

## Phase Completion Rule

This phase is complete when:

- Each tool choice is justified.
- Trade-offs are acknowledged.
- Alternatives are documented.
- Decisions align with constraints defined in Phase 2.