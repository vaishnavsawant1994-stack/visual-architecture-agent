# G8 Real Export Qualification Evidence

Implementation: `3431a54e1f3f9297131d978fa61693defa522a94`

Qualification: Run #147, Run ID `37239294476`

Status: PASS

The authoritative Qualification workflow passed install/bootstrap, Chromium provisioning, all package typechecks, and `pnpm check`. Workspace regression is 151/151 tests across 16 files. Exporter qualification is 24/24. Browser-verifier qualification is 20/20 across three files, including four real G8 Chromium tests and the permanent two-test G6 desktop/mobile-touch Chromium regression.

G8 evidence includes real SVG and self-contained HTML; offline HTML with zero observed HTTP(S) requests and preserved viewer interactions; genuine PNG and WebP bytes; five-model SVG/HTML/PNG/WebP generation; multilingual/multiline and light/dark coverage; real viewer controls for HTML/SVG/PNG/WebP downloads; browser-captured downloads with format validation, MIME blob observation, nonzero bytes, and safe hostile-title filenames; decoded PNG/WebP pixel inspection; wide, tall, and nested-container raster fixtures; distributed non-background region assertions and PNG/WebP dimension/content-region consistency; resource limits; controlled environment/path/credential metadata sentinels; raster sentinel scans; hostile authored-content escaping; clipboard success/unavailable/permission-denied/unsupported-MIME regression coverage; and share payload/invocation/unsupported behavior.

Native OS share-sheet completion is outside browser automation ownership and is not fabricated. The qualified behavior proves the payload, invocation boundary, metadata, and unsupported path under project control.
