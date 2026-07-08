# Phase 15 — Decision Log

> **Purpose:** Maintain a historical record of significant architectural, business, technical, and process decisions made throughout the project.
>
> This document records **why the project evolved into its current design**, not every implementation change.

---

# 1. Decision Recording Principles

A decision should be recorded only if it significantly affects one or more of the following:

- System Architecture
- Business Rules
- Security Model
- Data Model
- Technology Stack
- Infrastructure
- Development Process

Routine implementation details, bug fixes, refactoring, dependency upgrades, and configuration changes should **not** be recorded.

---

# 2. Decision Status

| Status | Meaning |
|---------|---------|
| Active | Current project decision. |
| Deferred | Intentionally postponed for future review. |
| Superseded | Replaced by a newer decision but retained for historical context. |
| Rejected | Considered but intentionally not adopted. |

---

# 3. Decision Categories

| Prefix | Category |
|---------|----------|
| ARCH | Architecture |
| TECH | Technology |
| AUTH | Authentication & Security |
| DATA | Data & Domain |
| BUS | Business Rules |
| PROC | Development Process |

---

# 4. Decision Index

| ID | Decision | Status |
|----|----------|--------|
| TECH-001 | Next.js App Router | Active |
| ARCH-001 | Layered Architecture | Active |
| TECH-002 | MongoDB + Mongoose | Active |
| AUTH-001 | Auth.js Authentication | Superseded |
| AUTH-002 | Custom JWT Authentication | Active |
| DATA-001 | Identity Model (Open Decision) | Superseded |
| DATA-002 | Unified User Identity Model | Active |
| BUS-001 | Vendor Onboarding Design (Open Decision) | Superseded |
| BUS-002 | Admin Approval Workflow | Active |
| AUTH-003 | Role-Based Access Control (RBAC) | Active |
| TECH-003 | Redis Infrastructure | Active |
| TECH-004 | BullMQ Background Jobs | Active |
| TECH-005 | Resend Email Service | Active |
| TECH-006 | Validation Strategy (Zod) | Active |
| TECH-007 | Deployment Platform (Vercel) | Active |
| TECH-008 | Redis Caching Strategy | Deferred |
| PROC-001 | Phase-Based Development Workflow | Active |

---

# 5. Decision Records

---

## TECH-001 — Next.js App Router

**Status**

Active

**Decision**

Use Next.js App Router as the application's full-stack framework.

**Reason**

Provides modern React architecture, integrated backend capabilities, and aligns with the project's learning goals.

**Related Phases**

- Phase 8
- Phase 9

---

## ARCH-001 — Layered Architecture

**Status**

Active

**Decision**

Adopt a layered architecture consisting of:

- Presentation
- Server Entry
- Business
- Infrastructure
- Data

**Reason**

Improves maintainability, separation of responsibilities, and long-term scalability.

**Related Phases**

- Phase 6
- Phase 9

---

## TECH-002 — MongoDB + Mongoose

**Status**

Active

**Decision**

Use MongoDB with Mongoose as the primary persistence layer.

**Reason**

Supports iterative development while matching project complexity and learning goals.

**Related Phases**

- Phase 8

---

## AUTH-001 — Auth.js Authentication

**Status**

Superseded

**Original Decision**

Use Auth.js for authentication.

**Reason for Replacement**

Project goals shifted toward learning authentication internals through a custom implementation.

**Superseded By**

AUTH-002

---

## AUTH-002 — Custom JWT Authentication

**Status**

Active

**Decision**

Implement authentication using:

- JWT
- Refresh Tokens
- OTP Verification
- RBAC

**Reason**

Provides complete architectural control while supporting the project's learning objectives.

**Related Phases**

- Phase 8
- Phase 10
- Phase 12

---

## DATA-001 — Identity Model (Open Decision)

**Status**

Superseded

**Original Decision**

Identity model intentionally left open during planning.

**Alternatives Considered**

- Separate Customer and Vendor models
- Unified User model

**Reason for Replacement**

Implementation showed a unified identity model better supported authentication and authorization.

**Superseded By**

DATA-002

---

## DATA-002 — Unified User Identity Model

**Status**

Active

**Decision**

Use a single User model with role-based behavior.

Roles:

- customer
- vendor
- admin

**Reason**

Simplifies identity management while supporting future expansion.

**Related Phases**

- Phase 2
- Phase 8

---

## BUS-001 — Vendor Onboarding Design (Open Decision)

**Status**

Superseded

**Original Decision**

Vendor onboarding workflow intentionally left open during planning.

**Reason for Replacement**

Business rules became clearer during implementation.

**Superseded By**

BUS-002

---

## BUS-002 — Admin Approval Workflow

**Status**

Active

**Decision**

Users become vendors through an administrator-approved Vendor Application workflow.

Workflow:

Customer

↓

Vendor Application

↓

Admin Review

↓

Approved / Rejected

↓

Vendor Profile

**Reason**

Separates authentication from business onboarding while improving security and administrative control.

**Related Phases**

- Phase 3
- Phase 5
- Phase 7

---

## AUTH-003 — Role-Based Access Control (RBAC)

**Status**

Active

**Decision**

Use role-based authorization for customer, vendor, and administrator permissions.

**Reason**

Centralizes permission management while supporting future roles.

---

## TECH-003 — Redis Infrastructure

**Status**

Active

**Decision**

Use Redis as supporting infrastructure.

**Current Usage**

- BullMQ

**Future Usage**

- Rate Limiting
- Caching

**Review Required**

When caching strategy is finalized.

---

## TECH-004 — BullMQ Background Jobs

**Status**

Active

**Decision**

Execute long-running tasks outside the request-response lifecycle.

**Current Usage**

- Email processing

---

## TECH-005 — Resend Email Service

**Status**

Active

**Decision**

Use Resend for transactional email delivery.

**Reason**

Simple integration with Next.js while supporting authentication workflows.

---

## TECH-006 — Validation Strategy (Zod)

**Status**

Active

**Decision**

Use Zod as the application's validation library.

**Reason**

Provides runtime validation, strong TypeScript integration, and reusable validation schemas.

**Related Phases**

- Phase 8
- Phase 10

---

## TECH-007 — Deployment Platform

**Status**

Active

**Decision**

Deploy the application using Vercel.

**Reason**

Provides first-class Next.js support, preview deployments, and a simplified deployment workflow.

---

## TECH-008 — Redis Caching Strategy

**Status**

Deferred

**Decision**

Caching strategy intentionally postponed.

**Current Understanding**

- MongoDB remains the source of truth.
- Redis caching will be introduced only when justified by performance requirements.

**Review Trigger**

Performance profiling demonstrates a measurable need for caching.

---

## PROC-001 — Phase-Based Development Workflow

**Status**

Active

**Decision**

Develop the project iteratively using the following cycle:

Planning

↓

Implementation

↓

Review

↓

Planning Update

↓

Next Phase

**Reason**

Allows architectural decisions to evolve intentionally while reducing project risk.

**Related Phases**

- Phase 13
- Phase 14

---

# 6. Deferred Decisions

The following areas remain intentionally undecided:

- Redis caching implementation
- Monitoring platform
- Metrics collection strategy
- CDN strategy
- Multi-region deployment
- Disaster recovery planning

These decisions will be finalized only when supported by project requirements.

---

# 7. Superseded Decisions

Historical decisions are retained for future reference.

| Original Decision | Replaced By |
|-------------------|-------------|
| Auth.js Authentication | Custom JWT Authentication |
| Identity Model (Open Decision) | Unified User Identity Model |
| Vendor Onboarding Design | Admin Approval Workflow |

Historical decisions provide architectural context and should not be deleted.

---

# 8. Decision Review Guidelines

Review an existing decision only when:

- Business requirements significantly change.
- Security requirements evolve.
- Architecture no longer supports project growth.
- Technology limitations become significant.
- A demonstrably better solution exists.

Technology trends alone are **not** sufficient reason to revisit a decision.

---

## Phase Completion Rule

This phase is complete when:

- Significant project decisions are documented.
- Active, deferred, and superseded decisions are clearly distinguished.
- Historical decisions remain traceable.
- Deferred decisions are intentionally acknowledged.
- Future architectural reviews have sufficient historical context.