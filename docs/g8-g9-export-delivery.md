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


## G9 Qualification Evidence
- Repository: vaishnavsawant1994-stack/visual-architecture-agent
- Branch: g12/qualification-probe
- Implementation SHA: db1342436f955f4e3fbdfe7b589bd2f0348958ab
- Qualification: Run #151 / ID 37242650232 — SUCCESS
- Workflow: pnpm install, Chromium install, pnpm check — PASS
- V1/V2/V3: valid V1 promoted; invalid V2 rejected with V1 bytes/hash preserved; valid V3 promoted only after validation.
- Failure falsification: returned/throwing verification, malformed/partial/hash-mismatched candidates, staged tampering, missing candidate, destination write failure, promotion failure and cleanup failure handling are executable tests.
- Hash integrity: canonical specification hashing is stable across object key ordering and meaningful changes differ; candidate/promoted artifact hashes are rechecked against bytes.
- Cleanup/atomicity: candidate-first validation and promotion-last semantics preserve the active artifact on rejected candidates and exceptions.
- G9 STATUS: PASS.
