# Phase 3 — Core Data Concepts

> Purpose: Identify the fundamental business entities and their relationships before designing schemas or APIs.

---

## 1. Core Entities

### User
Represents every account in the system. A user may act as a customer, vendor, or administrator depending on their assigned role.

### Vendor Application
A request submitted by a customer to become a vendor. It is reviewed by an administrator before a vendor account can be activated.

### Vendor Profile
Represents a vendor's business information after a vendor application has been approved.

### Service
A specific catering service offered and managed by a vendor.

### Booking
A record connecting a customer with a service for a specific event.

### Review
Feedback written by a customer after a completed booking.

---

## 2. Entity Independence

- User → Exists independently.
- Vendor Application → Belongs to a User.
- Vendor Profile → Belongs to a User with the **vendor** role.
- Service → Belongs to a Vendor Profile.
- Booking → Connects a User (customer) and a Service.
- Review → Depends on a completed Booking.

---

## 3. High-Level Relationships

- A User can create multiple Bookings.
- A User can submit Vendor Applications.
- A User with the **vendor** role owns one Vendor Profile.
- A Vendor Profile can offer multiple Services.
- A Service belongs to exactly one Vendor Profile.
- A Booking connects one User (customer) and one Service.
- A Review belongs to one Booking and one User.

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

### Vendor Application Lifecycle

Possible states:

- pending
- approved
- rejected

Rules:

- Every application begins as **pending**.
- Only administrators can approve or reject an application.
- An approved application results in the creation of a Vendor Profile.
- A rejected application does not create a Vendor Profile.

---

## 5. Core Business Invariants

The following must always be true:

- A review must reference a valid completed booking.
- A booking must reference an existing service.
- A service must belong to an existing Vendor Profile.
- A customer cannot write multiple reviews for the same booking.
- Users cannot modify entities they do not own.
- A user can have only one pending vendor application at a time.
- A Vendor Profile can exist only for users with the **vendor** role.
- Only approved vendor applications may create Vendor Profiles.

These invariants exist independent of implementation.

---

## 6. Identity Model

The system uses a unified **User** entity for every account.

Supported roles:

- customer
- vendor
- admin

Business-specific information is separated from user identity:

- **Vendor Application** manages the vendor onboarding process.
- **Vendor Profile** stores vendor business information after approval.

This separation keeps authentication, authorization, and business data independent while allowing users to transition from customer to vendor without creating a new account.

---

## Phase Completion Rule

This phase is complete when:

- Core business entities are clearly identified.
- Relationships between entities are defined.
- Business lifecycles are acknowledged.
- Core business invariants are explicitly documented.
- No database schema decisions are made yet.