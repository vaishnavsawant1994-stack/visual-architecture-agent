# Performance Qualification

Measured against the qualified G11 product tree. No G11 behavior was changed for this tranche. G12 remains locked.

## Authority
- Implementation SHA: `056a9eab3fd46ce73716dd7fb0c0ffbc5f748fc3`
- Measured tree: `76ed33b984019be4c4a703d29f5165f1d5a70258` (docs checkpoint only; product packages unchanged)
- Evidence file: `docs/performance-qualification-056a9ea.json`
- CI run: none. There is no performance workflow. This is a local reproducible measurement, not a GitHub Actions run.
- Command: `node --experimental-strip-types scripts/performance-qualification.ts`, with Chromium viewer load measured by the same fixture through Playwright.
- Date: 2026-10-05

## Environment
- Node v22.20.0, linux 6.12.8+, x64
- CPU: Intel(R) Xeon(R) Platinum 8481C CPU @ 2.70GHz, 2 cores
- Memory: 2078199808 bytes
- Chromium: Chrome for Testing 153.0.8010.12 / Playwright chromium v1243

## Policy
- Seed: `deterministic-indexed-v1`. No RNG. Architecture roles cycle through the allowed role set. Edges are indexed.
- Warm-up: 1 discarded run. Library repetitions: 7, except layout 3. Viewer load repetitions: 3 after 1 warm-up.
- Typical value: median. Targets: viewer load < 2000 ms, search < 100 ms, focus < 100 ms.
- Workloads: 100 nodes/100 relationships, 500/500, 1000/1000, and 1000 nodes/5000 relationships.
- Repository analysis: 100-file deterministic TypeScript snapshot, where applicable.

## Result
All four workloads validated, laid out deterministically, rendered, exported, and loaded in headless Chromium with no page errors. Geometry hashes were stable across repeated layout. Search and focus stayed under 100 ms typical in both the library API and the loaded viewer. Viewer load stayed under 2 s typical at every workload, including the 5000-relationship case.

| Workload | Validation median | Layout median | Viewer load median | Library search / focus | Browser search / focus | Geometry |
|---|---:|---:|---:|---:|---:|---|
| 100 / 100 | 14.273 ms | 0.918 ms | 34.430 ms | 0.033 / 0.008 ms | 1.1 / 1.0 ms | c19e9d72 |
| 500 / 500 | 83.484 ms | 5.989 ms | 71.469 ms | 0.164 / 0.020 ms | 4.5 / 2.9 ms | 9837578f |
| 1000 / 1000 | 179.327 ms | 20.527 ms | 153.360 ms | 0.089 / 0.036 ms | 10.3 / 6.2 ms | ad560feb |
| 1000 / 5000 | 462.600 ms | 23.066 ms | 242.535 ms | 0.536 / 0.110 ms | 40.3 / 16.7 ms | 766cea43 |

Repository analysis median was 1.606 ms for 100 files, 200 findings, 0 diagnostics.

Raw samples, fixture hashes, and export byte sizes are in the JSON evidence. No frozen numeric target failed, so no optimization was applied.

PERFORMANCE STATUS: PASS for implementation SHA `056a9eab3fd46ce73716dd7fb0c0ffbc5f748fc3`.
Not claimed: G12 parity, release candidate. main untouched.
