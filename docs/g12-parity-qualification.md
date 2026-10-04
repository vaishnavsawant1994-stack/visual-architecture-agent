# G12 Full Parity Qualification & Falsification

G12 is a certification gate. It does not add ordinary product features. A row is PASS only with executable evidence. IMPLEMENTED is not PASS.

| Capability | Gate | Required evidence | Status |
|---|---|---|---|
| Product contract | G0 | frozen contract | PASS |
| Typed IR | G1 | typecheck + tests | PASS — Run #75 baseline preserved through Run #89 |
| Schema validation | G2 | hostile validation tests | PASS — qualified baseline preserved through Run #89 |
| Architecture engine | G3 | semantic tests | PASS — 11-test G3 semantic suite preserved through Run #89 |
| Workflow engine | G3 | semantic tests | PASS — Run #89 regression |
| Sequence engine | G3 | semantic tests | PASS — Run #89 regression |
| Data Flow engine | G3 | semantic tests | PASS — Run #89 regression |
| Lifecycle engine | G3 | semantic tests | PASS — Run #89 regression |
| Deterministic layout | G4 | model-aware geometry, containment, collisions, sequence time/activations/segments, Unicode, dense stress, repeat geometry hash tests | PASS — SHA 6e53a92a27e24f431aac8494546835514e26f547; Qualification #89 / 37235007313; 16/16 G4 tests; 103/103 workspace tests across 14 files |
| SVG rendering | G5 | five renderer + injection tests | PENDING |
| Focus | G6 | viewer tests + browser observation | PENDING |
| Reach | G6 | viewer tests + browser observation | PENDING |
| Route | G6 | viewer tests + browser observation | PENDING |
| Semantic lens | G6 | viewer tests + browser observation | PENDING |
| Search | G6 | viewer tests + browser observation | PENDING |
| Deep links | G6 | round-trip + browser restoration | PENDING |
| Localization | G6 | locale artifact/browser evidence | PENDING |
| Themes | G6 | dark/light/presentation browser evidence | PENDING |
| Motion | G6 | reduced-motion browser evidence | PENDING |
| Repository analysis | G7 | analyzer hostile tests | PENDING |
| Evidence | G7 | revision-pinning tests | PENDING |
| HTML export | G8 | deterministic export tests | PENDING |
| SVG export | G8 | deterministic export tests | PENDING |
| PNG export | G8 | real raster artifact validation | PENDING |
| WebP export | G8 | real raster artifact validation | PENDING |
| Atomic delivery | G9 | V1/invalid-V2/V3 tests | PENDING |
| Preview | G9 | last-known-good verification | PENDING |
| Browser verification | G10 | real browser run, console + screenshots | PENDING |
| Accessibility | G10 | keyboard/focus/labels/contrast/motion | PENDING |
| CLI | G11 | command tests + executable smoke | PENDING |
| Agent integrations | G11 | four adapter tests | PENDING |

## Release rule
Parity may be declared only when every PENDING row becomes PASS with recorded evidence. A successful source-level unit test does not substitute for browser evidence where browser evidence is required. PNG/WebP mocks do not qualify real raster export. Structural HTML checks do not qualify visual/browser verification.


## G4 qualification receipt

G4 qualified at `6e53a92a27e24f431aac8494546835514e26f547` by Qualification Run #89 (`37235007313`). Install, all package typechecks, `pnpm check`, 16 layout qualification tests, and the complete 103-test/14-file workspace regression passed. Fixtures cover deterministic hashing/order, nested and empty boundaries, workflow lanes/phases, lifecycle lanes/terminal placement, sequence temporal ordering/activations/segments, multilingual labels, collision resolution/diagnostics, self-loops/cycles, legend/bounds, wide/tall layouts, and 100 nodes with 400 relationships.
