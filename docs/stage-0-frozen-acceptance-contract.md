# Stage 0 — Clean-Room Parity Acceptance Contract

Status: FROZEN / AUTHORITATIVE
Project: Visual Architecture Agent
Ownership: Independent implementation
Reference behavior target: Archify documented/public behavior
Reference source copied: 0%
Rule: reproduce capabilities and observable behavior, not implementation.

## Product pipeline
Input → Analysis → Typed IR → Validation → Layout → SVG → Interactive Viewer → Verification → Self-contained HTML.

Repository analysis is read-only/untrusted. Generated HTML must work independently.

## Required semantic models
Architecture: components, connections, boundaries, groups, external systems, data stores, trust boundaries.
Workflow: lanes, phases, groups, nodes, edges, main path, semantic checks.
Sequence: participants, messages, activations, segments.
Data Flow: stages, nodes, flows, sources, stores, destinations.
Lifecycle: lanes, states, transitions; START, ACTIVE, WAITING, RETRYING, FAILED, CANCELLED, COMPLETED.

These are distinct semantic models, not one generic graph presented five ways.

## Typed IR and validation
Durable node/relationship IDs; deep-linkable identity. Strict unknown-field rejection.
Validation stages: schema → semantic → relationship → graph → layout → SVG → artifact.
Structured diagnostics include stage/code/subject/message/fixes.

## Repository intelligence and evidence
Scanner → language → dependencies → entry points → modules → runtime relationships → security boundaries → evidence → architecture.
Evidence is revision-pinned: repository, commit SHA, file/range, blob/content hash, node/relation, confidence.
Classifications: VERIFIED, INFERRED, USER_SUPPLIED, UNKNOWN. Evidence before inference.

## Deterministic layout
Node/group/boundary placement, edge routing, labels, collision avoidance, canvas, legend, viewport fitting.
Same IR must yield same geometry hash unless explicitly randomized.

## Interactive viewer
Navigation: zoom, pan, fit, reset, overview, fullscreen.
Exploration: search, focus, reach, route, relationship inspection, semantic lens.
Display: dark, light, presentation, reduced motion.
Deep links restore node, relation, route and lens state.
Lenses: Security, Data, Storage, AI, External, Infrastructure, Runtime, Trust.
Route is authored-graph routing and must not imply observed telemetry.

## Visual system, motion, accessibility, localization
Presets: Classic, Signal, Blueprint, Editorial; presentation-only.
Optional presentation motion; prefers-reduced-motion honored.
Keyboard navigation, semantic labels, visible focus, screen-reader metadata, contrast, non-color-only meaning.
Viewer UI locales: English, Hindi, Marathi, Chinese, Japanese, Spanish. Diagram content and viewer UI localization are independent.

## Export and delivery
HTML, SVG, PNG, WebP, Clipboard, Share image.
Atomic delivery: candidate → validate → artifact/browser checks → promote only on PASS.
Invalid candidate never replaces last-known-good.
Delivery returns specification/artifact hashes.
Preview: valid V1 → invalid V2 keeps V1 → valid V3 replaces V1.

## CLI and compare
visual doctor, guide, create, analyze, validate, inspect, render, preview, deliver, compare, export, verify, examples.
Compare is BEFORE / DELTA / AFTER: added/removed components, changed connections, boundaries and evidence. No unsupported impact claims.

## Agent interface
Semantic adapters for ChatGPT/Codex, Claude Code, Cursor, OpenCode and extensible runtimes.
Repository-derived claims require evidence.

## Browser verification
Real browser: load, console, interactions, responsive/mobile, screenshots, visual verification.
No clipping, broken arrows, overlapping labels; zoom/focus/route/search/export/themes must work.

## Security
No arbitrary repository execution, automatic secret ingestion, untrusted scripts, authored-data network calls, HTML injection, unsafe URL schemes or filesystem escape.

## Performance targets
100 nodes instant; 500 smooth; 1,000 usable; 5,000 relationships supported; viewer load <2s typical; search <100ms typical; focus <100ms typical.
Targets require benchmarks; they cannot be self-asserted.

## Hard gates
G0 Product contract
G1 Typed IR
G2 Schema validation
G3 Five semantic engines
G4 Deterministic layout
G5 Renderer
G6 Interactive viewer
G7 Repository evidence
G8 Export
G9 Delivery
G10 Browser/accessibility verification
G11 Agent integrations + CLI
G12 Full parity qualification

Later gates cannot compensate for incomplete earlier gates.

## Release rule
Parity is certified only when every required capability has executable evidence-backed PASS. IMPLEMENTED is not PASS. Mock raster output is not real PNG/WebP qualification. Structural HTML inspection is not browser qualification. Missing performance/browser/accessibility evidence remains PENDING or FAIL.

Post-parity Stage 13+: Mermaid parsing, general-purpose auto-layout, hosted sharing, WYSIWYG editing, PDF/WebM/MP4 and other enhancements.