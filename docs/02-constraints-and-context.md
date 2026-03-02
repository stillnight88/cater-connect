# Phase 2 — Constraints & Context

> Purpose: Explicitly define project limits so decisions remain realistic and sustainable.

---

## 1. Time & Effort Constraints

- Time Budget: 4 months
- Effort Level: Casual but consistent (not full-time)

### Implications

- Feature scope must remain tightly controlled.
- No large refactors mid-project.
- Avoid complex infrastructure or premature optimization.
- Focus on finishing a complete vertical slice first.

---

## 2. Project Intent

Priority Order:

1. Learning modern full-stack architecture (Next.js App Router)
2. Building a portfolio-grade system
3. Potential future use by real local users

### Implications

- Architectural clarity is more important than speed.
- Over-optimizing for scale is unnecessary.
- Code readability matters more than micro-performance.
- Documentation quality matters for portfolio value.

---

## 3. Expected Scale & Performance

- Initial usage: Small (local scope)
- Concurrent users: Low
- Performance Goal: Smooth experience, not hyperscale

### Implications

- Single database instance is sufficient.
- No need for microservices.
- Redis used for learning + moderate optimization, not scaling to millions.
- Basic indexing strategy is enough.

---

## 4. Hosting & Environment Constraints

- Hosting: Render
- Budget Sensitivity: Low (learning-focused)
- Infrastructure Complexity: Minimal

### Implications

- Accept cold starts.
- Avoid heavy background processing.
- Prefer stateless architecture.
- Keep environment setup simple (dev + prod only).

---

## 5. Team & Ownership

- Team Size: 1
- All roles self-owned (design, frontend, backend, DevOps)

### Implications

- Architecture must remain understandable.
- Avoid patterns that require multiple maintainers.
- Favor explicit structure over clever abstraction.
- Maintain strict folder and boundary discipline.

---

## 6. What This Phase Prevents

Because of these constraints, the project will NOT:

- Introduce microservices
- Use Kubernetes or complex cloud setups
- Implement advanced distributed systems patterns
- Optimize prematurely for global scaling
- Add complex CI/CD pipelines early

---

## Phase Completion Rule

This phase is complete when:

- All limits are explicit.
- Overengineering risks are reduced.
- Future decisions can reference these constraints.