# Phase 5 — User & System Flows

> Purpose: Translate scope into structured movement across frontend, backend, and data layers.

---

## Flow 1 — Discover Caterers (Read Flow)

1. User enters system.
2. User selects or provides location.
3. Frontend requests caterer list.
4. Backend validates query parameters.
5. Backend retrieves data from DB (or cache).
6. Response returned and rendered.

Failure Cases:
- Invalid location
- No results found

---

## Flow 2 — View Service Details & Reviews (Read Flow)

1. User selects a service.
2. Frontend requests service details.
3. Backend validates service existence.
4. Backend retrieves service + verified reviews.
5. Response returned to UI.

Rules:
- Only reviews tied to completed bookings are included.

Failure Cases:
- Invalid service ID
- Service not found

---

## Flow 3 — Create Booking (Write Flow — Critical)

1. User selects service.
2. Authentication check occurs.
3. User submits booking form.
4. Backend validates:
   - Auth session
   - Service existence
   - Event date validity
5. Booking created with status = "pending".
6. Response returns booking ID and status.

Failure Cases:
- Not authenticated
- Invalid input
- Service not found

---

## Flow 4 — Booking Status Update (State Transition)

Status may transition:
pending → accepted → completed  
pending → rejected  
pending → cancelled

Rules:
- Only authorized roles can update booking status.
- Status transitions must follow valid lifecycle order.
- Customer cannot directly set booking to completed.

---

## Flow 5 — Submit Review (Write Flow — Controlled)

Precondition:
- Booking must exist.
- Booking must belong to user.
- Booking status must be "completed".
- No previous review exists.

1. User submits review.
2. Backend validates preconditions.
3. Review stored and linked to booking.
4. Service rating recalculated (optional).
5. Response confirms creation.

Failure Cases:
- Duplicate review
- Booking not completed
- Unauthorized access

---

## Read vs Write Summary

Mostly Read:
- Discover caterers
- View services
- View booking status

Write-Critical:
- Create booking
- Submit review
- Booking status update

---

## Diagram Reference

- 01-user-journey-flow.drawio (User progression)
