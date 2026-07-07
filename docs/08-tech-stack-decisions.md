# Phase 8 — Tech Stack Selection

> **Purpose:** Select technologies intentionally based on project constraints, architectural goals, and long-term maintainability rather than popularity or trends.

---

# 1. Frontend Framework

## Chosen: Next.js (App Router)

### Why

- Enables full-stack development within a single project.
- Supports modern React architecture using Server and Client Components.
- Provides built-in routing, layouts, metadata handling, and server-side capabilities.
- Encourages clear separation between client and server responsibilities.
- Aligns with the project's learning goals and modern industry practices.

### Alternatives Considered

- React + Express
  - Separate frontend and backend projects.
  - More deployment and infrastructure overhead.
- Other frontend frameworks
  - Not aligned with the project's learning roadmap.

### Trade-offs

- Higher learning curve than a traditional SPA.
- Requires understanding different rendering strategies.
- Incorrect use of Server and Client Components can increase complexity.

---

# 2. Backend Strategy

## Chosen: Layered Architecture within Next.js

### Architecture

```text
Presentation Layer
        ↓
Server Entry Layer
        ↓
Business Layer
        ↓
Infrastructure Layer
        ↓
Data Layer
```

### Implementation Strategy

- Route Handlers for reusable HTTP endpoints.
- Server Actions for server-side form interactions where appropriate.
- Shared business modules to centralize business rules.

### Why

- Keeps business logic independent from UI.
- Reduces duplication.
- Supports long-term maintainability.
- Encourages clear responsibility boundaries.

### Trade-offs

- Requires discipline to maintain layer separation.
- Slightly more initial structure than placing everything inside Route Handlers.

---

# 3. Database

## Chosen: MongoDB

### Why

- Familiar technology reduces unnecessary learning overhead.
- Flexible document model supports iterative development.
- Well suited for the project's current scale.
- Business consistency is enforced by the application layer rather than database constraints.

### Alternatives Considered

- PostgreSQL
  - Strong relational guarantees.
  - Better suited for highly relational systems.
  - Increased modeling complexity for current project goals.

- Firebase
  - Vendor-specific architecture.
  - Less control over backend implementation.

### Trade-offs

- Application must enforce relationships and business invariants.
- Complex transactional workflows require additional care.

---

# 4. ODM

## Chosen: Mongoose

### Why

- Mature MongoDB ODM.
- Schema validation support.
- Middleware and hooks when needed.
- Familiar ecosystem.

### Trade-offs

- Additional abstraction over MongoDB.
- Requires understanding both MongoDB and Mongoose behavior.

---

# 5. Authentication & Authorization

## Chosen: Custom JWT Authentication

### Features

- Access Tokens
- Refresh Tokens
- OTP-based verification
- Role-Based Access Control (RBAC)

### Why

- Complete control over authentication flow.
- Better understanding of authentication internals.
- Supports project-specific business requirements.
- Easier integration with custom authorization logic.

### Alternatives Considered

- Auth.js

Reason not chosen:

- Less control over authentication implementation.
- Learning objective is to build authentication rather than configure a library.

### Trade-offs

- Greater implementation responsibility.
- Security must be carefully designed and maintained.

---

# 6. Validation

## Chosen: Zod

### Why

- Runtime validation.
- Strong TypeScript integration.
- Reusable validation schemas.
- Consistent validation across the application.

### Trade-offs

- Additional maintenance of validation schemas.

---

# 7. Infrastructure Services

## Chosen: Redis

### Current Responsibilities

- BullMQ queue backend.
- Temporary data storage where appropriate.

### Planned Responsibilities

- API rate limiting.
- Response caching.

### Why

- Introduces practical infrastructure concepts.
- Enables asynchronous background processing.
- Supports future performance improvements.

### Trade-offs

- Additional infrastructure to maintain.
- Cache invalidation requires careful design.

---

## Background Jobs

### Chosen: BullMQ

### Why

- Reliable background job processing.
- Retry mechanisms.
- Queue management.
- Keeps long-running tasks outside request-response cycles.

### Current Usage

- Email processing.

---

## Email Service

### Chosen: Resend

### Why

- Modern email API.
- Good developer experience.
- Reliable transactional email delivery.
- Simple integration with Next.js.

---

# 8. Hosting

## Chosen: Vercel

### Why

- Native support for Next.js.
- Simple deployment workflow.
- Automatic preview deployments.
- Suitable for portfolio and small-to-medium production projects.

### Trade-offs

- Background workers require separate deployment.
- Serverless environments have execution limitations.
- Some infrastructure services must run outside Vercel.

---

# 9. Technology Selection Principles

Every technology should satisfy at least one of the following:

- Solves a real project requirement.
- Improves maintainability.
- Improves developer productivity.
- Supports learning goals.
- Reduces unnecessary complexity.

Technologies are **not** selected solely because they are popular.

---

## Phase Completion Rule

This phase is complete when:

- Every technology has a clear justification.
- Major alternatives have been considered.
- Trade-offs are acknowledged.
- Technology choices align with the project's constraints and architecture.
- No technology is included without a clear purpose.