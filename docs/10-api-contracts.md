# Phase 10 — API & Data Contracts

> **Purpose:** Define stable communication contracts between the client and server before implementation. This phase establishes how different parts of the system communicate without documenting implementation-specific endpoints.

The focus of this phase is **communication consistency**, not individual API routes.

---

# 1. API Design Principles

Every API should follow these principles:

- Consistent request and response formats
- Predictable HTTP status codes
- Clear separation between authentication and business operations
- Stateless request handling
- Explicit validation of all external input
- Stable contracts that minimize breaking changes

The API contract should remain stable even if internal implementation changes.

---

# 2. Global Response Contract

All APIs should follow a consistent response structure.

## Success Response (2xx)

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

---

## Error Response (4xx / 5xx)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

Benefits:

- Predictable frontend handling.
- Consistent error processing.
- Easier API maintenance.

---

# 3. HTTP Status Code Strategy

| Status | Meaning |
|---------|---------|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful request with no response body |
| 400 | Validation failure |
| 401 | Authentication required or invalid session |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | Business conflict (duplicate application, invalid state transition, duplicate review, etc.) |
| 422 | Business rule validation failure (when applicable) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

The frontend should respond to status codes rather than relying solely on response messages.

---

# 4. Data Conventions

All APIs should follow consistent data conventions.

## Identifiers

- IDs are represented as strings.

---

## Dates & Time

- Stored in UTC.
- Returned in ISO 8601 format.

---

## Boolean Values

Use explicit booleans.

Examples:

- `emailVerified`
- `mfaEnabled`
- `isActive`

---

## Enumerations

Business state should use explicit enumerated values instead of free-form strings.

Examples:

- User roles
- Vendor application status
- Booking status
- Audit actions

---

# 5. Authentication Contract

Authentication is handled consistently across protected APIs.

General expectations:

- Public APIs require no authentication.
- Protected APIs require a valid authenticated session.
- Authorization is evaluated after authentication.
- User identity is resolved server-side.
- Client-provided roles or permissions are never trusted.

Authentication implementation details belong to the authentication architecture, not individual APIs.

---

# 6. API Categories

The system exposes APIs grouped by business capability rather than by implementation details.

## Authentication APIs

Responsibilities:

- User registration
- Email verification
- Login
- Session refresh
- Logout
- Password reset
- Current user retrieval

---

## Vendor Management APIs

Responsibilities:

- Vendor application submission
- Vendor application review
- Vendor approval
- Vendor rejection
- Vendor profile management

---

## Service Management APIs

Responsibilities:

- Service creation
- Service updates
- Service retrieval
- Service availability

---

## Booking APIs

Responsibilities:

- Booking creation
- Booking retrieval
- Booking lifecycle management

---

## Review APIs

Responsibilities:

- Review creation
- Review retrieval
- Rating management

---

## Admin APIs

Responsibilities:

- Vendor application administration
- Audit log access
- Administrative operations

The exact endpoint structure may evolve as the project grows without changing these business capabilities.

---

# 7. Validation Contract

Every external input should be validated before reaching business logic.

Validation principles:

- Client-side validation improves user experience.
- Server-side validation is mandatory.
- Validation rules should be reusable.
- Business logic should receive already-validated input.

Validation should produce consistent error responses regardless of the endpoint.

---

# 8. Error Contract

Errors should be predictable and machine-readable.

Every error should provide:

- A stable error code.
- A human-readable message.
- Optional validation or debugging details when appropriate.

Unexpected internal errors should never expose sensitive implementation details.

---

# 9. API Versioning Strategy

The current API is treated as **Version 1**.

General principles:

- Breaking changes should introduce a new API version.
- Existing clients should continue functioning whenever practical.
- Minor enhancements should remain backward compatible.

Versioning strategy exists to support future evolution without disrupting existing integrations.

---

# 10. Contract Stability

Implementation details may evolve over time.

Examples:

- Route organization
- Internal services
- Database queries
- Business module structure

However, communication contracts should remain stable whenever possible.

Stable contracts reduce frontend changes, simplify maintenance, and improve long-term reliability.

---

## Phase Completion Rule

This phase is complete when:

- API communication principles are clearly defined.
- Response structures are standardized.
- HTTP status behavior is documented.
- Data conventions are consistent.
- Authentication expectations are established.
- Business API categories are identified.
- Validation and error contracts are standardized.
- Versioning strategy is documented.