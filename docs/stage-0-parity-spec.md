# Stage 0 — Frozen Parity Specification

This is the acceptance contract for the independent implementation.

## Product contract

Input → Analysis → Typed IR → Validation → Layout → SVG → Interactive Viewer → Verification → Self-contained HTML.

Reproduce documented/public capabilities and observable behavior, not reference source code.

## Five semantic engines

1. Architecture — components, connections, boundaries, groups, external systems, data stores, trust boundaries.
2. Workflow — lanes, phases, groups, nodes, edges, main path, semantic checks.
3. Sequence — participants, messages, activations, segments.
4. Data Flow — stages, nodes, flows, sources, stores, destinations.
5. Lifecycle — lanes, states, transitions; START, ACTIVE, WAITING, RETRYING, FAILED, CANCELLED, COMPLETED.

A generic diagram must not be disguised as all five.

## Typed IR

Version 1.0 uses durable node and relationship IDs plus explicit nodes, relationships, boundaries, evidence, and presentation. Deep links must address nodes and relationships.

## Validation

Schema → Semantic → Relationship → Graph → Layout → SVG → Artifact.

Unknown or malformed fields must not silently disappear. Diagnostics contain stage, code, subject, message, and optional fixes.

## Evidence

Repository-derived claims require revision-pinned evidence with repository, commit SHA, file/range, blob/content hash where available, classification, and confidence.

Classifications: VERIFIED, INFERRED, USER_SUPPLIED, UNKNOWN.

## Determinism

The same IR must produce the same geometry unless explicit randomization is requested. Geometry hashes are an acceptance gate.

## Viewer

Zoom, pan, fit, reset, overview, fullscreen; search, focus, reach, route, relationship inspection, semantic lenses; dark, light, presentation, reduced motion; deep links restore meaningful viewer state.

## Lenses and themes

Lenses: Security, Data, Storage, AI, External, Infrastructure, Runtime, Trust.

Themes: Classic, Signal, Blueprint, Editorial. Themes are presentation-only and cannot alter semantic IDs or meaning.

## Accessibility and localization

Keyboard navigation, semantic labels, focus indicators, screen-reader metadata, reduced motion, contrast validation, and non-color-only relationship meaning.

Initial viewer UI languages: English, Hindi, Marathi, Chinese, Japanese, Spanish.

## Export and delivery

HTML, SVG, PNG, WebP, clipboard and share image. Delivery is atomic: candidate → validate → artifact checks → replacement. Invalid artifacts never replace the last known good artifact.

## CLI

visual doctor, guide, create, analyze, validate, inspect, render, preview, deliver, compare, export, verify, examples.

## Security

Repositories are untrusted and read-only by default. No arbitrary execution, automatic secret ingestion, authored-data network calls, HTML injection, unsafe URL schemes, or filesystem escape.

## Performance targets

100 nodes instant interaction; 500 smooth; 1,000 usable; 5,000 relationships supported; typical viewer load under 2 seconds; typical search/focus under 100 ms.

These are benchmark targets, not unverified claims.

## Parity gates

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
G11 Agent integrations
G12 Full parity qualification

No later gate compensates for an unfinished earlier gate.
