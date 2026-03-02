# Phase 10 — API & Data Contracts

> Purpose: Define stable communication contracts between frontend and backend before implementation.

---

## 1. Global Response Structure

All API responses follow this structure:

### Success (2xx)

{
  success: true,
  data: <payload>,
  error: null
}

### Error (4xx / 5xx)

{
  success: false,
  data: null,
  error: {
    code: string,
    message: string,
    details?: object
  }
}

---

## 2. HTTP Status Code Strategy

- 200 → Successful read
- 201 → Resource created
- 400 → Validation error
- 401 → Not authenticated
- 403 → Not authorized
- 404 → Resource not found
- 409 → Conflict (duplicate review, invalid state transition)
- 500 → Unexpected server error

Frontend must handle status codes explicitly.

---

## 3. Data Conventions

- All IDs are strings.
- All timestamps use ISO 8601 format.
- Dates are stored and returned in UTC.
- Numeric ratings are integers (1–5).

---

## 4. Discover Caterers

GET /api/caterers?location={city}&page={n}&limit={n}

Auth: Not Required

Returns:

{
  caterers: [
    {
      id,
      name,
      rating,
      location
    }
  ],
  pagination: {
    page,
    limit,
    total
  }
}

Cacheable: Yes (read-heavy endpoint)

---

## 5. View Service Details & Reviews

GET /api/services/{serviceId}

Auth: Not Required

Returns:

{
  service: {
    id,
    name,
    description,
    price
  },
  reviews: [
    {
      id,
      userName,
      rating,
      comment,
      createdAt
    }
  ]
}

Cacheable: Yes (invalidate after review creation)

---

## 6. Create Booking

POST /api/bookings

Auth: Required

Request Body:

{
  serviceId,
  eventDate,
  notes?
}

Validation Rules:

- serviceId must exist
- eventDate must be future date
- user must be authenticated

Returns (201):

{
  bookingId,
  status,
  createdAt
}

---

## 7. Get Booking Status

GET /api/bookings/{bookingId}

Auth: Required (Owner Only)

Returns:

{
  bookingId,
  status,
  lastUpdated
}

---

## 8. Create Review

POST /api/reviews

Auth: Required

Preconditions:

- Booking exists
- Booking belongs to user
- Booking status = "completed"
- No existing review

Request Body:

{
  bookingId,
  rating (1–5),
  comment
}

Returns (201):

{
  reviewId,
  createdAt
}

On duplicate review:

Status: 409 Conflict

---

## 9. Authentication (Auth.js)

Endpoint: /api/auth/*

Session Contains:

{
  userId,
  email,
  role
}

Role values:
- customer
- caterer
- admin

---

## Phase Completion Rule

This phase is complete when:

- All endpoints are defined.
- HTTP status behavior is clear.
- Data conventions are standardized.
- Validation expectations are documented.
- Caching behavior is acknowledged.