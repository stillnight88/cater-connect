# Phase 11 — State & Data Strategy

> **Purpose:** Define how application state is owned, stored, synchronized, and refreshed across the client and server while maintaining data consistency throughout the system.

This phase focuses on **state management strategy**, not API design, authentication implementation, or system architecture.

---

# 1. State Categories

The application manages several categories of state, each with a different owner and lifecycle.

## Server State (Source of Truth)

Persistent business data stored in MongoDB.

Examples:

- Users
- Vendor Applications
- Vendor Profiles
- Services
- Bookings
- Reviews

The server is always the authoritative owner of business state.

Client applications must never override server-managed data.

---

## Client State (UI State)

Temporary state used to manage user interactions.

Examples:

- Form inputs
- Search filters
- Dialog visibility
- Loading indicators
- Error messages
- Local UI preferences

Client state is temporary and may be discarded without affecting business data.

---

## Cached State (Deferred Decision)

> **Decision Status:** Deferred

A dedicated caching strategy has **not yet been finalized**.

Current assumptions:

- MongoDB remains the single source of truth.
- Any future cache will exist only as a performance optimization.
- Cached data must never become the authoritative source of business state.

The specific caching strategy, cache lifetime, cache invalidation rules, and cacheable resources will be defined when performance requirements justify introducing caching.

---

# 2. State Ownership

Each category of state has a clearly defined owner.

| State | Primary Owner |
|--------|---------------|
| UI State | Client |
| Business State | Server |
| Persistent Data | MongoDB |
| Cached Data | Deferred (Future Decision) |

Every piece of state should have one authoritative owner.

---

# 3. Read Strategy

General principles:

- Read-heavy pages should retrieve data on the server whenever practical.
- Interactive interfaces should consume trusted server-provided data.
- Client-side state should support presentation, not replace business data.
- Frequently changing business data should be refreshed when necessary.

---

# 4. Write Strategy

All business state modifications occur through trusted server operations.

General workflow:

1. Validate incoming data.
2. Validate authentication and authorization.
3. Apply business rules.
4. Persist changes.
5. Refresh affected application state.

The client never modifies business state directly.

---

# 5. Business State Consistency

Business workflows that use state transitions must remain consistent.

Examples include:

- Booking lifecycle
- Vendor Application lifecycle

General principles:

- State transitions are controlled by the server.
- Invalid transitions are rejected.
- Business invariants are always enforced.
- Related updates should remain consistent.

---

# 6. Optimistic UI Policy

Optimistic updates should only be used when temporary inconsistencies cannot affect business correctness.

Potentially appropriate:

- UI preferences
- Temporary interface interactions

Not appropriate:

- Booking creation
- Booking status changes
- Vendor application approval
- Review creation

Business integrity always takes priority over perceived responsiveness.

---

# 7. Protected State Access

Protected business data should only be exposed after successful server-side verification.

General principles:

- Authentication determines identity.
- Authorization determines permissions.
- Permission checks occur on the server.
- Client-side state never grants additional privileges.

Client state may improve the user experience but is never considered authoritative.

---

# 8. Synchronization Strategy

Whenever business data changes:

1. Validate the request.
2. Apply business rules.
3. Persist changes.
4. Refresh affected server-managed data.
5. Return the updated state to the client.

Synchronization should always favor correctness over minimizing network requests.

---

# 9. Data Consistency Principles

The following principles apply throughout the application:

- MongoDB is the single source of truth.
- Client state never overrides server-managed business state.
- Business invariants are enforced on the server.
- Server-managed state always takes precedence over cached or client-managed state.
- Consistency is prioritized over temporary UI responsiveness.

---

## Phase Completion Rule

This phase is complete when:

- State ownership is clearly defined.
- Read and write strategies are documented.
- Business state consistency rules are established.
- Protected state access is understood.
- Synchronization strategy is defined.
- Deferred state management decisions are explicitly documented.