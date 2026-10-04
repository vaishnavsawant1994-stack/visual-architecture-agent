# G10 Browser + Accessibility Verification

G10 verifies the delivered self-contained HTML artifact, not source-code intent.

Required observed checks:
- artifact loads successfully;
- no browser console errors;
- zoom, pan, fit, reset, search, focus, route and display-mode interactions work;
- desktop and mobile viewports do not clip or overflow;
- node/label overlaps and broken relationship arrows are absent;
- screenshot evidence is captured for visual review;
- controls are keyboard reachable and have visible focus;
- semantic labels are exposed;
- contrast passes;
- reduced-motion mode is honored;
- relationship meaning is available through non-color metadata/shape/labels.

Verification emits machine-readable diagnostics. Any error-level diagnostic vetoes G9 promotion. Missing screenshot evidence is explicitly reported and must not be represented as a completed visual review.

Structural verification may run without a browser and checks self-containment, viewport metadata, accessibility hooks, reduced-motion CSS, focus styles and non-color relationship metadata. Structural checks do not substitute for real browser observation.


## G10 Qualification Evidence
- Branch: g12/qualification-probe
- Implementation SHA: 154ccc827627a2f06be48442a231837d7776b393
- Qualification: Run #153 / ID 37243245414 — SUCCESS
- Job: qualify — SUCCESS
- Install: pnpm install --no-frozen-lockfile — SUCCESS
- Chromium install: Playwright Chromium with dependencies — SUCCESS
- Full gate: pnpm check — SUCCESS
- Models: architecture, workflow, sequence, data-flow, lifecycle in real Chromium.
- Responsive matrix: desktop 1440×900, laptop 1280×720, tablet 820×1180 touch, mobile portrait 390×844 touch, mobile landscape 844×390 touch.
- Observed interactions: zoom, fit, reset, overview, search, node focus, relationship inspection, upstream/downstream reach, route, lens, themes and deep-link restoration.
- Browser evidence: console errors and page errors captured; screenshot bytes captured for each model and responsive matrix.
- Accessibility evidence: keyboard-only tab order and Enter activation, computed visible focus, semantic toolbar/diagram labels, reduced-motion media emulation/runtime state, and non-color relationship-kind metadata. Automated contrast failure diagnostics remain part of the verifier contract/regression suite.
- G10 STATUS: PASS.
