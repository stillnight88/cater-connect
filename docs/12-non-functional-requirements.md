# Phase 12 — Non-Functional Requirements

> Purpose: Define how the system behaves under real-world conditions beyond core functionality.

---

## 1. Performance Requirements

Target expectations (small-scale usage):

- Page loads: ≤ 2 seconds under normal conditions
- API responses:
  - Cached reads: ≤ 200ms
  - Non-cached reads: ≤ 500ms
- Write operations: ≤ 800ms (acceptable for booking flow)

Notes:
- Cold starts on Render are acceptable.
- Performance optimization is secondary to correctness.
- Redis is used to reduce load, not guarantee speed.

---

## 2. Security Requirements

The system explicitly defends against:

- Unauthorized access to bookings and reviews
- Fake review submissions
- Duplicate reviews
- Brute-force authentication attempts
- Abuse via repeated booking or review requests

Security rules:

- All write actions require authentication.
- Authorization checks are enforced server-side.
- Input validation is mandatory for all write endpoints.
- Rate limiting is applied to critical routes.
- Sensitive fields are never returned to the client.

Out of scope (initially):

- Advanced fraud detection
- DDoS protection beyond basic rate limiting
- Compliance standards (PCI, GDPR enforcement tooling)

---

## 3. Error Handling Strategy

User-facing errors:

- Clear, human-readable messages
- No internal details exposed
- Consistent error format

System-facing errors:

- Logged with context
- Stack traces stored server-side only
- Critical errors flagged for investigation

Retry policy:

- Reads may retry once automatically
- Writes fail fast to avoid duplicate state changes

---

## 4. Logging & Observability

Log categories:

- Authentication failures
- Booking lifecycle changes
- Review creation attempts
- Unexpected server errors

Logging principles:

- No sensitive data logged
- Logs differ by environment (dev vs prod)
- Logs are used for debugging, not analytics

---

## 5. Availability & Degradation Strategy

- MongoDB is the primary dependency.
- Redis is optional; system must function without it.
- If Redis is unavailable:
  - Caching is skipped
  - Rate limiting falls back to safe defaults
- Partial degradation is acceptable for non-critical features.

---

## 6. Environment & Configuration

- Secrets stored in environment variables only.
- Separate configs for development and production.
- No credentials committed to repository.
- Configuration changes do not require code changes.

---

## 7. Scalability Boundaries

The system is designed for:

- Local or small-region usage
- Low to moderate concurrency
- Single-instance backend

Explicitly not designed for:

- High-frequency real-time systems
- Global multi-region traffic
- Massive concurrent writes

---

## Phase Completion Rule

This phase is complete when:

- Performance targets are realistic and scoped.
- Security boundaries are explicit.
- Failure behavior is documented.
- Degradation paths are understood.