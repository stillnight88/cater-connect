# Phase 5 — User & System Flows

> **Purpose:** Translate product scope into clear user journeys and system interactions across the frontend, backend, and data layers before implementation.

---

# 1. Authentication Flows

Authentication is the entry point for all protected functionality within the system.

## User Registration

1. User submits registration details.
2. Backend validates the request.
3. User account is created.
4. Email verification or OTP process begins.
5. User verifies ownership of their email.
6. Account becomes active.

Failure Cases:

* Invalid input
* Email already registered
* Verification expired or invalid

---

## User Login

1. User submits credentials.
2. Backend validates credentials.
3. Access and refresh tokens are issued.
4. Session is established.
5. User is redirected to the dashboard.

Failure Cases:

* Invalid credentials
* Unverified account
* Account disabled

---

# 2. Customer Flows

## Flow 1 — Discover Vendors (Read Flow)

1. User enters the platform.
2. User selects or provides a location.
3. Frontend requests available vendors.
4. Backend validates request parameters.
5. Backend retrieves vendor data from the database (or cache where applicable).
6. Results are returned and displayed.

Failure Cases:

* Invalid location
* No vendors found

---

## Flow 2 — View Service Details & Reviews (Read Flow)

1. User selects a service.
2. Frontend requests service details.
3. Backend validates the service exists.
4. Backend retrieves the service and verified reviews.
5. Results are displayed.

Rules:

* Only reviews linked to completed bookings are displayed.

Failure Cases:

* Invalid service ID
* Service not found

---

## Flow 3 — Apply to Become a Vendor (Write Flow)

1. Customer submits a vendor application.
2. Backend validates the request.
3. Application is created with a **pending** status.
4. Customer can track the application status.

Failure Cases:

* User already has a pending application.
* Invalid application data.
* User is already a vendor.

---

## Flow 4 — Create Booking (Write Flow)

1. Customer selects a service.
2. Authentication is verified.
3. Customer submits booking details.
4. Backend validates:

   * Authentication
   * Service existence
   * Event information
5. Booking is created with **pending** status.
6. Booking information is returned.

Failure Cases:

* User not authenticated
* Invalid request
* Service unavailable

---

## Flow 5 — Submit Review (Write Flow)

Preconditions:

* Booking exists.
* Booking belongs to the customer.
* Booking is completed.
* No previous review exists.

Flow:

1. Customer submits a review.
2. Backend validates all conditions.
3. Review is stored.
4. Service rating is recalculated.
5. Success response is returned.

Failure Cases:

* Duplicate review
* Booking not completed
* Unauthorized access

---

# 3. Vendor Flows

## Flow 6 — Manage Services

Preconditions:

* User has the **vendor** role.
* Vendor Profile exists.

Flow:

1. Vendor accesses the dashboard.
2. Vendor creates, updates, or removes services.
3. Backend validates ownership.
4. Changes are stored.
5. Updated information is returned.

Failure Cases:

* Unauthorized access
* Invalid service data
* Service not found

---

# 4. Admin Flows

## Flow 7 — Review Vendor Applications

1. Administrator views pending vendor applications.
2. Administrator reviews application details.
3. Administrator chooses:

   * Approve
   * Reject
4. Backend validates permissions.
5. System updates application status.
6. If approved:

   * User role becomes **vendor**
   * Vendor Profile is created
7. Audit event is recorded.
8. User is notified.

Failure Cases:

* Application already reviewed
* Invalid application
* Unauthorized administrator

---

## Flow 8 — View Audit Logs (Read Flow)

1. Administrator opens the audit log.
2. Backend retrieves audit events.
3. Administrator filters or searches entries.
4. Results are displayed.

Failure Cases:

* Unauthorized access
* Failed data retrieval

---

# 5. System State Transitions

## Booking Lifecycle

```text
pending
    │
    ├── accepted
    │       │
    │       └── completed
    │
    ├── rejected
    │
    └── cancelled
```

Rules:

* Only authorized users may change booking status.
* Status transitions must follow the defined lifecycle.
* Customers cannot directly complete bookings.

---

## Vendor Application Lifecycle

```text
pending
    │
    ├── approved
    │
    └── rejected
```

Rules:

* Every application starts as **pending**.
* Only administrators may approve or reject applications.
* Approval creates a Vendor Profile and updates the user's role.
* Rejected applications remain recorded for audit purposes.

---

# 6. Read vs Write Summary

## Read Flows

* Discover Vendors
* View Services
* View Reviews
* View Booking Status
* View Vendor Application Status
* View Audit Logs (Admin)

---

## Write Flows

* Register
* Login
* Apply to Become a Vendor
* Create Booking
* Submit Review
* Approve Vendor Application
* Reject Vendor Application
* Manage Vendor Services

---

## Diagram Reference

- 01-user-journey-flow.drawio (User progression)

---

## Phase Completion Rule

This phase is complete when:

* Major user journeys are documented.
* Frontend, backend, and data interactions are clearly described.
* Read and write operations are distinguished.
* Business state transitions are defined.
* Failure cases are identified for critical workflows.



