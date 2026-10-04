# G12 Full Parity Qualification & Falsification

G12 is a certification gate. It does not add ordinary product features. A row is PASS only with executable evidence. IMPLEMENTED is not PASS.

| Capability | Gate | Required evidence | Status |
|---|---|---|---|
| Product contract | G0 | frozen contract | PASS |
| Typed IR | G1 | typecheck + tests | PENDING |
| Schema validation | G2 | hostile validation tests | PENDING |
| Architecture engine | G3 | semantic tests | PENDING |
| Workflow engine | G3 | semantic tests | PENDING |
| Sequence engine | G3 | semantic tests | PENDING |
| Data Flow engine | G3 | semantic tests | PENDING |
| Lifecycle engine | G3 | semantic tests | PENDING |
| Deterministic layout | G4 | repeat geometry hash tests | PENDING |
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
