# Visual Architecture Agent

An independent, clean-room TypeScript implementation of an architecture analysis and diagramming pipeline. The intended flow is:

**Input → Analysis → Typed IR → Validation → Layout → SVG → Interactive Viewer → Verification → Self-contained HTML**

The reference target is documented public behavior of Archify; this is not a copy of its source code or a certified functionally identical product.

## Source areas

- `packages/`: shared packages and implementation layers
- `integrations/`: integration and adapter work
- `docs/`: frozen acceptance contract, repository analysis, export/delivery, browser accessibility, integration, and parity qualification records

The frozen acceptance baseline is in [Stage 0 parity specification](docs/stage-0-parity-spec.md) and [frozen acceptance contract](docs/stage-0-frozen-acceptance-contract.md).

## Current status — not parity certified

Development extends beyond the early G1/G2 scaffolding, but **full parity and release acceptance have not been achieved**. The [G12 gap register](docs/g12-gap-register.md) lists incomplete semantic diagram behavior, layout/renderer gaps, viewer interactions, localization, real raster exports, CLI execution, and browser/accessibility verification. The [G12 qualification matrix](docs/g12-parity-qualification.md) marks required evidence as pending. These are recorded engineering findings, not a freshly rerun test result.

## Local development

Requires Node.js 22+ and pnpm 10.17.1 (as declared in `package.json`).

```bash
corepack enable
pnpm install
pnpm check
pnpm build
```

`pnpm check` runs typechecking and tests; it does **not** replace real browser qualification, raster output validation or independent release review.

## Release rule

Do not claim 100% reference parity or production readiness until the frozen G12 requirements are all satisfied with reproducible executable evidence, real browser and accessibility observations, actual raster artifact tests, and an accepted release review.
