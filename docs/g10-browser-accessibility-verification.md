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
