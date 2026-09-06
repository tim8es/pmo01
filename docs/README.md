# PMO01 Documentation Map

This directory is the source of truth for product, learning, content, architecture, and delivery decisions.

## Current strategy

PMO01 follows an **A → C** evolution path:

1. Treat the current `main` implementation as a **reference prototype**.
2. Validate which learning and product mechanisms are worth keeping.
3. Design a separate scalable v1 architecture.
4. Migrate only validated content, interactions, and data contracts into v1.

The reference prototype is not the long-term architecture.

## Documents

### Product
- `product/PRODUCT.md` — product purpose, users, value proposition, principles, non-goals.
- `product/LEARNING_MODEL.md` — how PMO01 expects learning to happen.
- `product/CURRICULUM.md` — competency map and curriculum contract.
- `product/PRODUCT_REQUIREMENTS.md` — product capabilities and staged requirements.
- `product/METRICS.md` — validation and learning-effectiveness metrics.

### Content
- `content/CONTENT_MODEL.md` — canonical entities and rules for lessons, drills, cases, assessments, and artifacts.

### Architecture
- `architecture/ARCHITECTURE.md` — current-state and target-state architecture.
- `architecture/adr/0001-reference-prototype-to-v1.md` — decision record for the A → C strategy.

### Delivery
- `ROADMAP.md` — gates from prototype validation to scalable v1.

### Design specs
- `superpowers/specs/2026-09-03-pmo01-v0-design.md` — historical V0 design. It remains useful context but is not the current architecture source of truth.
- `superpowers/specs/2026-09-06-pmo01-platform-foundation-design.md` — current platform foundation design.

## Source-of-truth precedence

When documents conflict, use this order:

1. Accepted ADRs.
2. Current platform foundation design.
3. Product and architecture documents listed above.
4. Historical V0 specs.
5. Existing prototype implementation.

The prototype describes what exists today. It does not override an accepted product or architecture decision for v1.
