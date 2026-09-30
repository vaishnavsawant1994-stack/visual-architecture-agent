# Visual Architecture Agent

Independent clean-room implementation of a visual architecture analysis and diagramming system.

- Reference behavior: Archify (behavioral/public specification only)
- Reference source copied: 0%
- Functional parity target: 100% of documented/public behavior
- Current gates: G1 Typed IR and G2 Schema validation

Pipeline: Input → Analysis → Typed IR → Validation → Layout → SVG → Interactive Viewer → Verification → Self-contained HTML

See [docs/stage-0-parity-spec.md](docs/stage-0-parity-spec.md) for the frozen acceptance contract.
