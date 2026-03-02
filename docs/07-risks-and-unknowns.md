# Phase 7 — Risks & Unknowns

> Purpose: Identify technical, product, architectural, and operational risks before implementation begins.

---

## 1. Technical Risks

- Incorrect use of Next.js App Router patterns
- Mixing Server Components, Server Actions, and API Routes inconsistently
- Implementing secure authentication and session handling
- Protecting private routes and server actions
- Deployment issues on Render (cold starts, SSR behavior)
- Caching inconsistencies between Redis and MongoDB

---

## 2. Data Integrity Risks

- Invalid booking status transitions
- Duplicate reviews for a single booking
- Race conditions during status updates
- Stale cache serving outdated booking or service data
- Orphaned records due to improper deletion

Mitigation:
- Enforce backend invariants strictly
- Centralize lifecycle management logic
- Use atomic database operations when necessary

---

## 3. Abuse & Security Risks

- Fake or automated booking submissions
- Spam review attempts
- Brute-force authentication attempts
- Rate limiting misconfiguration
- Session misuse or privilege escalation

Mitigation:
- Rate limiting on critical routes
- Strict authorization checks
- Logging suspicious behavior
- Review creation tied strictly to completed bookings

---

## 4. Architectural Drift Risks

- Business logic spreading into UI files
- Mixing multiple backend patterns inconsistently
- Duplicate validation logic
- Caching logic leaking into UI layer

Mitigation:
- Enforce Phase 6 boundary rules
- Centralize domain logic in dedicated modules
- Regular refactor review after Phase 2

---

## 5. Identity Model Risk

Open Decision:
- Whether Customer and Caterer share a unified User model or separate models.

Impact:
- Affects schema design
- Affects authorization checks
- Affects future admin and role management

This must be finalized before schema implementation.

---

## 6. Product Risks

- Low initial caterer participation
- Low user trust at early stage
- Users abandoning bookings
- Incomplete or outdated service listings

Mitigation:
- Keep local scope small
- Emphasize verified review model
- Keep MVP narrow and reliable

---

## 7. Learning Risks

- Debugging SSR behavior
- Understanding caching in Next.js
- Managing environment variables securely
- Migrating auth strategy if needed

---

## 8. Overengineering Risk

Given learning goals and small scale:

Risk:
- Adding unnecessary abstractions
- Overusing infrastructure
- Designing for scale beyond current need

Mitigation:
- Follow constraints defined in Phase 2
- Optimize only after working baseline exists

---

## 9. Validation / Spikes Required

Before full implementation:

- Build minimal authentication prototype
- Test booking lifecycle in isolation
- Deploy early to Render
- Validate Redis caching behavior
- Test rate limiting integration
- Confirm identity model decision

---

## Phase Completion Rule

This phase is complete when:

- All major risk categories are visible.
- Unknown architectural decisions are documented.
- Mitigation strategies are defined.
- Validation experiments are planned.