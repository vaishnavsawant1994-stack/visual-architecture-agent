# G8 Export + G9 Atomic Delivery Contract

## G8 Export
Required artifact surfaces: self-contained HTML, standalone SVG, PNG, WebP, clipboard, and share. HTML/SVG are deterministic products of IR + deterministic geometry. Raster output is produced through an isolated rasterizer interface. Every export carries an artifact byte hash and geometry hash. Validation occurs before delivery.

## G9 Atomic Delivery
Delivery MUST follow: candidate → validate → optional external/browser verification → promote atomically. A failed candidate is discarded and MUST NOT replace the last-known-good artifact.

Required behavior:
- Valid V1 becomes last-known-good.
- Invalid V2 reports errors and V1 remains available.
- Valid V3 replaces V1 only after all validation passes.
- Delivery records include specification hash, artifact hash, prior artifact hash when present, acceptance state, and errors.
- Browser verification may veto promotion.
