# Visual Architecture Agent — Clean-room Diagram Engine — Project Handbook

**GitHub repository:** [vaishnavsawant1994-stack/visual-architecture-agent](https://github.com/vaishnavsawant1994-stack/visual-architecture-agent)  
**Documentation baseline:** 15 November 2026 · **Assessment type:** code structure, readme, manifests and available evidence—not a fresh production/CI/visual audit.

## 1. Product identity and objective
Independent system for analyzing structures and rendering architecture, workflow, sequence, data-flow and lifecycle diagrams.

**Who benefits:** Developers, architects, technical writers and AI coding agents.

## 2. Feature areas and user journeys
1. Typed intermediate representation and validation.
2. Deterministic layout and SVG/HTML rendering.
3. Viewer exploration, deep links and exports.
4. Repository evidence, CLI and agent adapters as gated targets.

A feature name may denote a documented requirement or source area; actual implemented, wired, and accepted status must be proven separately.

## 3. System architecture and repository map
TypeScript pnpm workspace (`packages/`, `integrations/`, `docs/`) with Vitest and `pnpm check` typecheck/tests. Detailed frozen stage-0 spec and G12 gap/qualification registers.

## 4. Current development and release status
G12 says parity not certified. Semantic diagrams, browser UI, accessibility, real PNG/WebP raster output, CLI behavior and benchmarks remain incomplete or pending executable evidence.

**Evidence hierarchy:** observed source and exact-head tests > dated reports > roadmap statements. Live deployment and third-party operations must be independently verified.

## 5. Developer setup and validation
Node >=22, pnpm 10.17.1, `pnpm install`, `pnpm check`, `pnpm build`. Browser tests and raster artifact checks require separate execution.

Read configuration carefully; use isolated data, staging credentials and approved migration plans. Presence of a command is not evidence it succeeded today.

## 6. Security, privacy, quality and risk
- Treat imported repository source as read-only unless explicitly approved.
- Escape untrusted labels/diagram content.
- Require deterministic output and verified accessibility for diagram consumers.
Every future release should assess access control, input validation, failure modes, monitoring, retention, backup/restore, accessibility and rollback as applicable.

## 7. Next recommended milestones
1. Close G12 FAIL/OPEN rows against frozen acceptance.
2. Verify real browser/screenshots, keyboard and contrast.
3. Validate actual raster outputs and CLI smoke.
4. Certify only after exact gate evidence.

## 8. Authoritative files and records
- [`README.md`](../README.md)
- [`docs/stage-0-parity-spec.md`](../docs/stage-0-parity-spec.md)
- [`docs/g12-gap-register.md`](../docs/g12-gap-register.md)
- [`docs/g12-parity-qualification.md`](../docs/g12-parity-qualification.md)
- [`package.json`](../package.json)

**Update policy:** revise this handbook when verified source and deployment evidence changes, and retain historical test/qualification records with original dates.
