# Phase 3 — Core Data Concepts

> Purpose: Identify the fundamental business entities and their relationships before designing schemas or APIs.

---

## 1. Core Entities

### Customer
A person who creates bookings and writes reviews.

### Caterer
A service provider who offers catering services.

### Service
A specific catering offering created and managed by a caterer.

### Booking
A record connecting a customer with a service for a specific event.

### Review
Feedback written by a customer after a completed booking.

---

## 2. Entity Independence

- Customer → Exists independently
- Caterer → Exists independently
- Service → Exists under a Caterer
- Booking → Connects Customer and Service
- Review → Depends on Booking completion

---

## 3. High-Level Relationships

- A Customer can create multiple Bookings.
- A Caterer can offer multiple Services.
- A Service belongs to exactly one Caterer.
- A Booking connects one Customer and one Service.
- A Review belongs to one Booking and one Customer.

---

## 4. Entity Lifecycles

### Booking Lifecycle
Possible states:
- pending
- accepted
- rejected
- completed
- cancelled

Rules:
- Only "completed" bookings can generate reviews.
- Booking status transitions must be controlled by the backend.

---

## 5. Core Business Invariants

The following must always be true:

- A review must reference a valid completed booking.
- A booking must reference an existing service.
- A service must belong to an existing caterer.
- A customer cannot write multiple reviews for the same booking.
- Users cannot modify entities they do not own.

These invariants exist independent of implementation.

---

## 6. Identity Model (Open Decision)

Open Question:
- Are Customer and Caterer separate models?
- Or are they roles under a unified User entity?

This decision affects:
- Authentication strategy
- Authorization rules
- Schema structure
- Future extensibility

This will be finalized in later phases.

---

## Phase Completion Rule

This phase is complete when:

- Core business entities are clear.
- Relationships are defined.
- Lifecycles are acknowledged.
- Invariants are explicitly written.
- No database schema decisions are made yet.