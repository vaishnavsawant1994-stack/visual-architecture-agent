# G11 CLI + Agent Integration Contract

Required CLI surface:

`visual doctor | guide | create | analyze | validate | inspect | render | preview | deliver | compare | export | verify | examples`

Commands compose the same typed IR, validation, repository intelligence, layout, renderer, viewer, exporter and verifier packages used by the library. Missing required input fails closed.

Compare output is BEFORE / DELTA / AFTER and reports added/removed components and relationships. It must not infer business or security impact without evidence.

Agent runtimes: ChatGPT/Codex, Claude Code, Cursor and OpenCode. Adapters share one semantic request contract and require repository evidence, read-only analysis, explicit VERIFIED / INFERRED / USER_SUPPLIED / UNKNOWN classification and no false runtime-trace claims.

G11 qualification requires workspace typecheck/tests plus command and adapter falsification.


## G11 Qualification Evidence
- Branch: g12/qualification-probe
- Implementation SHA: 056a9eab3fd46ce73716dd7fb0c0ffbc5f748fc3
- Qualification: Run #173 / ID 37307427995 — SUCCESS
- Job: qualify / 111754385181 — SUCCESS
- URL: https://github.com/vaishnavsawant1994-stack/visual-architecture-agent/actions/runs/37307427995
- Runner: ubuntu-latest, Node 22, pnpm 10.17.1
- Install: pnpm install --no-frozen-lockfile — SUCCESS
- Chromium install: Playwright Chromium with dependencies — SUCCESS
- Browser: Chrome for Testing 153.0.8010.12, Playwright chromium v1243, plus chromium-headless-shell v1243
- Full gate: pnpm check (workspace typecheck and tests) — SUCCESS
- Typecheck: ir, schemas, evidence, semantic, layout, renderer, viewer-runtime, exporter, validator, delivery, browser-verifier, analyzer, cli, integrations — all Done
- Tests: 184 passed, 0 failed
  - ir 3, schemas 3, evidence 5, semantic 11, layout 16, renderer 14, viewer-runtime 16
  - exporter 24, delivery 8, validator 12, browser-verifier 27 across 4 files, analyzer 14
  - cli 17 (cli.test.ts 5 + g11-process.test.ts 12), integrations 14
- Process boundary: g11-process.test.ts 12/12 passed, including create/empty-create, analyze secret sentinel, validate exit codes, inspect/render/preview, compare, HTML/SVG/PNG/WebP export, verify, G9 delivery/LKG, unsafe-path rejection, and all 13 per-command help invocations (1958ms, under the 5s budget)
- Security regressions in this run: quoted secret redaction covered by analyzer tests (14/14) and the process analyze sentinel test inside the 12/12 process file; environment secret not printed by the unsafe-path process test
- Chromium coverage in this run: browser-verifier 27/27, including G6 desktop/mobile, G10 five-model interactions/deep links/screenshots/keyboard/reduced-motion, and G8 offline HTML plus PNG/WebP export
- Integrations: integrations.test.ts 14/14 passed
- G11 STATUS: PASS for implementation SHA 056a9eab3fd46ce73716dd7fb0c0ffbc5f748fc3
- Not claimed: performance qualification, G12 parity, release candidate. main untouched.
