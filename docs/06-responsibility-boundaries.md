# Phase 6 — Responsibility Boundaries

> Purpose: Define strict ownership between UI, server logic, and data to prevent architectural drift.

---

## 1. Frontend Responsibilities (Client-Side)

The frontend is responsible for:

- Rendering UI components
- Collecting user input
- Managing local UI state
- Performing basic input validation (format, empty fields)
- Handling loading and error states
- Triggering server actions or API calls

The frontend is NOT responsible for:

- Enforcing business rules
- Determining booking status
- Authorizing access
- Trusting user identity from client state

---

## 2. Server Responsibilities (Business Logic Layer)

The server layer is responsible for:

- Authentication and session validation
- Authorization (ownership and role checks)
- Enforcing business invariants
- Validating all write operations
- Managing booking lifecycle transitions
- Coordinating database and cache interactions

The server acts as the single source of truth.

---

## 3. Data Layer Responsibilities

The data layer is responsible for:

- Persistence in MongoDB
- Indexing and query optimization
- Returning structured data
- Never containing business logic

Redis is treated as infrastructure:
- Used only for caching or rate limiting
- Never treated as permanent storage

---

## 4. Next.js-Specific Boundary Rules

Because this project uses Next.js App Router:

- Server Components may fetch data but must not contain business rule logic.
- Server Actions may validate input but must delegate core business rules to shared logic modules.
- API Routes handle complex operations and reusable endpoints.
- Client Components never access database or Redis directly.

All business logic must live in domain modules (e.g., /lib/domain).

---

## 5. Forbidden Patterns

The following are strictly disallowed:

- Business logic inside React components
- Direct database calls inside UI files
- Trusting client-provided user IDs
- Allowing client-side status transitions
- Duplicating validation logic across layers
- Embedding caching logic in UI components

---

## 6. Boundary Enforcement Principle

Every new feature must answer:

- Does this belong in UI?
- Does this belong in business logic?
- Does this belong in data infrastructure?

If unclear, default to server layer.

---

## Phase Completion Rule

This phase is complete when:

- Frontend, server, and data responsibilities are explicit.
- Business logic location is clearly defined.
- Forbidden shortcuts are documented.
- Next.js-specific risks are addressed.