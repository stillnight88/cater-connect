# Phase 9 — Architecture at Human Level

> Purpose: Define the major system layers and ownership boundaries before committing to exact folder names.

This phase defines structural discipline, not exact file paths.

---

## 1. High-Level Architecture

The system follows a layered approach:

UI Layer  
→ Domain Logic Layer  
→ Data & Infrastructure Layer

No layer may bypass the one below it.

---

## 2. Major Domains

The system contains the following business domains:

- Authentication
- Users
- Services
- Bookings
- Reviews

Each domain must:

- Own its business rules
- Define its invariants
- Expose controlled operations
- Avoid cross-domain coupling

---

## 3. Domain Logic Principle

All business rules must live in domain modules.

Examples:

- Booking lifecycle transitions
- Review eligibility validation
- Authorization checks
- Service ownership validation

Business logic must never be embedded in:

- React components
- Server Components
- Raw API route handlers

UI and API layers may call domain functions,
but never implement rules directly.

---

## 4. Infrastructure Layer

Infrastructure includes:

- MongoDB
- Redis (caching)
- Redis (rate limiting)
- Logging
- Environment configuration

Important:

Redis rate limiter integration is treated as infrastructure middleware.
It wraps routes or actions but does not contain business logic.

Infrastructure is replaceable.
Domain logic is not.

---

## 5. Next.js App Router Structural Rules

Because this is a Next.js project:

- `app/` handles routing and rendering only.
- Server Components may fetch data but must delegate logic.
- Server Actions call domain modules.
- API Routes act as entry points but contain no business logic.
- Middleware may apply rate limiting and auth guards.

No database calls should exist directly inside UI files.

---

## 6. Evolution Safety

Exact folder names are intentionally not finalized.

However, the following structure must exist conceptually:

- Routing Layer
- Domain Layer
- Data Access Layer
- Infrastructure Layer

Folder naming may evolve,
but layer boundaries must remain fixed.

---

## 7. Communication Pattern

UI → Domain → Database  
UI → Domain → Redis  
Middleware → Infrastructure (Rate Limiter)

No direct UI → Database or UI → Redis access is allowed.

---

## Diagram References

- System Layer Diagram: `diagrams/architecture/system-layer.drawio`
- Folder Architecture Diagram: `diagrams/architecture/folder-architecture.drawio`

These diagrams represent structural flow,
not exact file locations.

---

## Phase Completion Rule

This phase is complete when:

- Layer ownership is clearly defined.
- Domain logic placement is disciplined.
- Infrastructure is separated from business rules.
- Rate limiting is positioned correctly.
- Folder naming flexibility does not weaken architectural clarity.