# Phase 6 — Responsibility Boundaries

> Purpose: Clearly define ownership across application layers so every responsibility has one place to live, preventing duplicated logic and architectural drift as the project grows.

---

## 1. Presentation Layer Responsibilities (Client)

The Presentation Layer is responsible for user interaction and application presentation.

Responsibilities:

- Rendering user interfaces
- Collecting user input
- Managing local UI state
- Performing client-side validation for user experience
- Displaying loading, success, and error states
- Calling Server Actions or API Routes
- Presenting data returned by the server

The Presentation Layer is **not** responsible for:

- Business rules
- Authorization
- Authentication decisions
- Data persistence
- Trusting client-provided data

---

## 2. Server Entry Layer Responsibilities

The Server Entry Layer receives requests from the client and coordinates the application's server-side execution.

Responsibilities:

- Receiving API requests or Server Action calls
- Authenticating requests
- Authorizing access
- Validating incoming data
- Delegating work to the Business Layer
- Returning consistent responses

The Server Entry Layer is **not** responsible for:

- Implementing business rules
- Directly managing application workflows
- Containing complex business decisions

---

## 3. Business Layer Responsibilities

The Business Layer contains the application's core business logic.

Responsibilities:

- Enforcing business rules
- Managing business workflows
- Applying lifecycle transitions
- Enforcing ownership rules
- Coordinating operations across multiple entities
- Maintaining business invariants

The Business Layer acts as the application's single source of truth for business behavior.

The Business Layer is **not** responsible for:

- Rendering UI
- Managing HTTP requests
- Database-specific implementation details

---

## 4. Infrastructure Layer Responsibilities

The Infrastructure Layer provides technical capabilities used by the application.

Responsibilities:

- Database connectivity
- Redis connectivity
- Background job processing
- Email delivery
- External service integrations
- Configuration management

Infrastructure supports the application but does not define business behavior.

---

## 5. Data Layer Responsibilities

The Data Layer is responsible for persistence.

Responsibilities:

- Database models
- Data persistence
- Query execution
- Indexing strategy
- Data retrieval

The Data Layer is **not** responsible for:

- Business validation
- Authorization
- Workflow decisions

---

## 6. Cross-Cutting Responsibilities

Some responsibilities span multiple layers while still having clearly defined ownership.

| Concern | Primary Owner |
|----------|---------------|
| Rendering | Presentation Layer |
| Authentication | Server Entry Layer |
| Authorization | Server Entry Layer |
| Input Validation | Client (UX) + Server (Security) |
| Business Rules | Business Layer |
| Data Persistence | Data Layer |
| Infrastructure Services | Infrastructure Layer |
| Error Handling | All Layers (within their responsibilities) |
| Logging & Monitoring | Infrastructure Layer |

---

## 7. Forbidden Patterns

The following practices are intentionally prohibited:

- Business logic inside UI components
- Direct database access from the Presentation Layer
- Trusting client-provided identifiers or permissions
- Client-controlled business state transitions
- Duplicating business rules across multiple layers
- Embedding infrastructure concerns inside UI components
- Mixing business logic with persistence logic

---

## 8. Boundary Enforcement Principles

Every new feature should answer the following questions before implementation:

- Which layer owns this responsibility?
- Is this business behavior or presentation behavior?
- Can this responsibility exist in only one place?
- Would moving this responsibility to another layer create duplication or tighter coupling?

When responsibility is unclear, prefer keeping business decisions inside the **Business Layer**, while allowing other layers to focus on their own concerns.

---

## Phase Completion Rule

This phase is complete when:

- Every major responsibility has a clearly defined owner.
- Layer boundaries are explicit.
- Business logic has a single authoritative location.
- Cross-cutting responsibilities are understood.
- Architectural shortcuts and duplication risks are documented.