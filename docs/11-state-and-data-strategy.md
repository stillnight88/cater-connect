# Phase 11 — State & Data Strategy

> Purpose: Define how data is stored, fetched, cached, and synchronized across UI and server.

---

## 1. State Categories

### Server State (Source of Truth)

Stored in MongoDB:

- Users
- Caterers
- Services
- Bookings
- Reviews

Server state is authoritative.
Client must never override it.

---

### Client State (UI State)

Stored in React components:

- Form inputs
- Search filters
- Modal visibility
- Loading and error states

Client state is ephemeral and disposable.

---

### Cached State (Performance Layer)

Stored in Redis:

- Popular caterer lists
- Service details
- Rate limiting counters

Cache is disposable and must never be treated as permanent storage.

---

## 2. Next.js Data Fetching Strategy

### Read Operations

Primary approach:

- Use Server Components for read-heavy pages.
- Fetch data directly on the server.
- Leverage built-in caching when appropriate.

For interactive UI:

- Use Client Components receiving server-fetched props.

---

### Write Operations

Use:

- Server Actions for form submissions.
- API Routes for reusable endpoints.

After successful writes:

- Use revalidation (revalidatePath / revalidateTag).
- Invalidate Redis cache where necessary.
- Avoid blind refetching when possible.

---

## 3. Cache Strategy

Cacheable Endpoints:

- Caterer list (location-based)
- Service details
- Review list

Cache Rules:

- Cache duration kept short (to reduce staleness).
- Invalidate cache after:
  - Review creation
  - Service update
  - Booking affecting rating

Redis is always secondary to MongoDB.

---

## 4. Booking State Consistency

Booking lifecycle must:

- Be updated only via server logic.
- Use atomic database operations where possible.
- Avoid race conditions in status transitions.

Client must always request fresh booking status.

No optimistic UI for booking state transitions.

---

## 5. Optimistic UI Policy

Allowed:

- Minor UI interactions (e.g., toggling favorites in Phase 2)

Not Allowed:

- Booking creation
- Booking status updates
- Review creation

Reason:
Trust and state integrity are more important than perceived speed.

---

## 6. Authentication State Flow

- Session validated on server for protected pages.
- Server Components receive session via auth helpers.
- Client Components use session hook only for UI adjustments.
- Authorization always rechecked server-side.

Client session is never trusted alone.

---

## 7. Synchronization Strategy

After write actions:

1. Validate and commit to DB.
2. Invalidate Redis if needed.
3. Trigger Next.js revalidation.
4. UI re-renders with fresh server state.

No manual client-side state merging.

---

## 8. Data Consistency Principles

- MongoDB is the single source of truth.
- Redis is an optimization layer only.
- Client state never overrides server state.
- All business invariants enforced server-side.

---

## Phase Completion Rule

This phase is complete when:

- Server vs client state ownership is clear.
- Cache invalidation strategy is defined.
- Write synchronization approach is explicit.
- Optimistic UI boundaries are documented.