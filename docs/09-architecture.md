# Phase 9 — Architecture

> **Purpose:** Define how the system is organized at a high level by establishing architectural principles, system layers, business domains, communication rules, and evolution guidelines before focusing on implementation details.

This phase describes **how the system is structured**, not **how it is coded**. Folder names, frameworks, and implementation details may evolve, but the architectural principles should remain stable.

---

# 1. Architectural Principles

The system is designed around the following principles:

- Separation of Concerns
- Single Responsibility
- Layered Architecture
- Clear Ownership Boundaries
- Replaceable Infrastructure
- Business Logic Independent of Framework
- Low Coupling between modules
- High Cohesion within modules

These principles guide every architectural decision throughout the project.

---

# 2. System Architecture

The application follows a layered architecture.

```text
Presentation Layer
        │
        ▼
Server Entry Layer
        │
        ▼
Business Layer
        │
        ▼
Infrastructure Layer
        │
        ▼
Data Layer
```

### Layer Responsibilities

### Presentation Layer

Responsible for:

- User interface
- User interaction
- Rendering
- Local UI state
- Calling server operations

---

### Server Entry Layer

Responsible for:

- Receiving requests
- Authentication
- Authorization
- Input validation
- Delegating work to the Business Layer
- Returning consistent responses

---

### Business Layer

Responsible for:

- Business rules
- Business workflows
- Entity ownership
- Lifecycle transitions
- Business invariants

This is the system's primary decision-making layer.

---

### Infrastructure Layer

Responsible for technical capabilities including:

- Database connectivity
- Background job processing
- Email delivery
- Caching
- Rate limiting
- Logging
- Configuration

Infrastructure supports the application without defining business behavior.

---

### Data Layer

Responsible for:

- Database models
- Persistence
- Queries
- Indexes

The Data Layer stores information but does not contain business decisions.

---

# 3. Business Domains

The system is divided into independent business domains.

## Identity & Users

Responsible for:

- User accounts
- Authentication
- Roles
- User identity

---

## Vendor Management

Responsible for:

- Vendor applications
- Vendor profiles
- Vendor onboarding

---

## Services

Responsible for:

- Vendor service offerings
- Service management

---

## Bookings

Responsible for:

- Booking creation
- Booking lifecycle
- Booking ownership

---

## Reviews

Responsible for:

- Review creation
- Review eligibility
- Service ratings

Each business domain owns its own business rules and should expose controlled operations without tightly coupling to other domains.

---

# 4. Infrastructure Services

The following modules provide technical capabilities to support the business domains.

- MongoDB
- Mongoose
- Redis
- BullMQ
- Resend
- Audit Logging
- Validation
- Environment Configuration

These services support the application but should remain replaceable without changing business behavior.

---

# 5. Communication Rules

Application layers communicate in a single direction.

```text
Presentation
      │
      ▼
Server Entry
      │
      ▼
Business
      │
      ▼
Infrastructure
      │
      ▼
Data
```

Allowed communication:

- Presentation → Server Entry
- Server Entry → Business
- Business → Infrastructure
- Business → Data
- Infrastructure → External Services

Not allowed:

- Presentation → Database
- Presentation → Redis
- Presentation → External Services
- Infrastructure → Presentation
- Data → Business

---

# 6. Dependency Rules

The architecture follows inward dependency.

Business rules should not depend on:

- UI framework
- Next.js features
- Database implementation
- Email provider
- Queue implementation

Infrastructure depends on the Business Layer.

The Business Layer should never depend on infrastructure-specific implementation.

This allows infrastructure to evolve without rewriting business logic.

---

# 7. Architecture Evolution

Architecture is expected to evolve as the project grows.

Examples of acceptable evolution:

- Folder restructuring
- Technology replacement
- Infrastructure improvements
- Module reorganization

The following should remain stable:

- Layer responsibilities
- Business domain ownership
- Communication direction
- Separation of concerns

Implementation details may change.

Architectural principles should remain consistent.

---

# 8. Reference Implementation

The current implementation reflects this architecture through a modular project structure.

Major project areas include:

```text
app/            → Presentation & Server Entry
components/     → Shared UI
lib/
    ├── auth/
    ├── db/
    ├── email/
    ├── audit/
    ├── validation/
    ├── middleware/
    └── api/
types/          → Shared type definitions
worker.ts       → Background worker
```

This folder structure is **one implementation** of the architecture described above.

Future refactoring may reorganize folders without changing the architectural principles.

---

# 9. Runtime Components

The application consists of multiple runtime components.

## Web Application

Responsible for:

- User interface
- API handling
- Server Actions
- Authentication
- Business workflows

---

## Background Worker

Responsible for:

- Processing queued jobs
- Sending emails
- Executing asynchronous tasks

Separating background processing from request-response operations improves scalability and keeps user interactions responsive.

---

# 10. Diagram References

Architecture diagrams should describe the system conceptually rather than mirror folder structures.

Recommended diagrams:

- System Layer Diagram : `diagrams/architecture/system-layer.drawio`
- Business Domain Diagram
- Runtime Component Diagram
- Module Dependency Diagram

---

## Phase Completion Rule

This phase is complete when:

- Architectural principles are defined.
- System layers have clear responsibilities.
- Business domains are separated.
- Infrastructure responsibilities are identified.
- Communication and dependency rules are documented.
- Runtime components are recognized.
- The architecture can evolve without changing its core principles.

---