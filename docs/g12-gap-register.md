# G12 Gap Register — Frozen Contract vs Current Implementation

This register is falsification evidence. A gap remains open until executable qualification proves it closed.

| Area | Current finding | Qualification state |
|---|---|---|
| G1 Typed IR | Common graph IR exists; model-specific structural richness is limited | OPEN |
| G2 Validation | Strict field checks exist; full graph/layout/artifact staged validation chain is incomplete | OPEN |
| G3 Architecture | Basic nodes/boundaries checks; groups/external/store/trust semantics incomplete | FAIL |
| G3 Workflow | Basic node types/start; lanes/phases/groups/main-path semantics incomplete | FAIL |
| G3 Sequence | Participants/message types; activations/segments incomplete | FAIL |
| G3 Data Flow | Basic source/process/store/destination/stage types; richer stage/flow semantics incomplete | FAIL |
| G3 Lifecycle | Canonical states/start; lanes/transition/terminal constraints incomplete | FAIL |
| G4 Layout | Deterministic grid and routing exist; groups/boundaries/labels/collision/legend/viewport fitting incomplete | FAIL |
| G5 Renderer | Five entry points exist but share generic rendering; boundaries/lanes/lifelines/activations/stages/labels not fully rendered | FAIL |
| G6 Viewer navigation | zoom/fit/reset present; full pointer pan, overview, fullscreen incomplete | FAIL |
| G6 Exploration | Pure focus/reach/route/lens APIs exist; browser UI wiring/restoration incomplete | FAIL |
| G6 Deep links | parse/serialize exists; reload restoration contract incomplete | FAIL |
| G6 Localization | locale field exists; six-language viewer UI not implemented | FAIL |
| G6 Themes/motion | basic themes/reduced-motion CSS exist; complete presentation behavior not qualified | OPEN |
| G7 Repository evidence | read-only snapshot/evidence foundation exists; runtime relationship intelligence is heuristic/basic | OPEN |
| G8 HTML/SVG | deterministic foundations exist | PENDING EXECUTION |
| G8 PNG/WebP | interface/mock tests only; real raster qualification absent | FAIL |
| G8 Clipboard/share | programmatic surfaces exist; real browser qualification absent | OPEN |
| G9 Atomic delivery | PASS — hardened candidate-first delivery, last-known-good preservation, staged integrity/tamper detection, cleanup/error handling and canonical specification hashing | PASS — implementation `db1342436f955f4e3fbdfe7b589bd2f0348958ab`; Qualification #151 / Run ID `37242650232` SUCCESS |
| G10 Browser | verifier contract exists; no real browser evidence/screenshot run recorded | FAIL |
| G10 Accessibility | contract checks exist; no real keyboard/contrast/browser evidence recorded | FAIL |
| G11 CLI | command dispatcher exists; executable CLI currently only prints command name and does not execute command workflows | FAIL |
| G11 Compare | added/removed nodes/relationships only; changed boundaries/evidence incomplete | FAIL |
| G11 Agent adapters | four semantic adapters exist | PENDING EXECUTION |
| Performance | targets frozen; benchmark suite/evidence absent | FAIL |

## Certification state
PARITY CERTIFIED: NO
RELEASE ACCEPTED: NO

G12 must repair each FAIL/OPEN row and replace it with evidence-backed PASS.