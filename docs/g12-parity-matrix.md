# G12 parity matrix

Status: G12 UNLOCKED / NOT QUALIFIED. This document is falsification evidence, not a release claim.

## Candidate freeze
- Repository: vaishnavsawant1994-stack/visual-architecture-agent
- Branch: g12/qualification-probe
- Parent before this tranche: 437500f2285a6b46b7ca56696750e688b4cfee2b
- G11 implementation authority: 056a9eab3fd46ce73716dd7fb0c0ffbc5f748fc3
- Ancestry includes 056a9ea: yes
- Product diff before this tranche: none. 76ed33b and 437500f are documentation/performance evidence only.
- main: 2b910551e21f553dfca90a721e066bcfcdee8fce, untouched
- This tranche changes product behavior in `createFromIntent` only. G11 authority is not silently inherited for that boundary.

## First falsification
Public `visual create` previously returned `kind: architecture` for workflow, sequence, data-flow and lifecycle prompts. That collapsed five frozen semantic models into one graph at the public boundary. The repair selects the model from the request and emits a model-valid IR. The authentication example remains architecture and still uses the `store` role. Empty intent still fails.

## Local executable evidence
Command: `vitest run packages/cli/test/g12-falsification.test.ts packages/cli/test/g11-process.test.ts packages/semantic/test/semantic.test.ts`
Result: 25 passed / 0 failed.

| Row | Status | Evidence |
|---|---|---|
| Architecture natural-language create | PASS local | g12 falsification, authentication prompt, executable create/render/preview |
| Workflow natural-language create | PASS local | executable create, kind workflow, validation valid |
| Sequence natural-language create | PASS local | executable create, kind sequence, validation valid |
| Data Flow natural-language create | PASS local | executable create, kind data-flow, validation valid |
| Lifecycle natural-language create | PASS local | executable create, kind lifecycle, validation valid |
| Five models semantically distinct | PASS local | five kinds returned, not one generic kind |
| Repository analysis through executable | PASS local | analyze snapshot, pinned evidence, VERIFIED and INFERRED both present |
| Quoted secret leakage | PASS local | stdout does not contain DO_NOT_LEAK_FAKE_SECRET |
| Repository code execution | PASS local | repository text did not execute |
| G11 process regressions | PASS local | g11-process.test.ts 12/12, including help, create, export, LKG |
| Real Chromium five-model browser | NOT RE-QUALIFIED | prior G10 evidence is run 153/173; this SHA has no fresh browser run yet |
| Accessibility | NOT RE-QUALIFIED | prior browser-verifier evidence; not rerun on this SHA |
| Agent integrations | NOT RE-QUALIFIED | prior integrations 14/14 on run 173; not rerun on this SHA |
| Performance | PASS retained | docs/performance-qualification-056a9ea.json; measured layout/render/viewer paths unchanged |
| Exact-head GitHub qualification | NOT RUN | local pass is not G12 authority |

No row above is a G12 PASS. Exact-head GitHub qualification has not run for this candidate.
