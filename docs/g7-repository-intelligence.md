# G7 Repository Intelligence & Evidence Contract

Repository input is treated as untrusted, read-only data. The analyzer MUST NOT execute repository code, install its dependencies, invoke package scripts, import analyzed modules, follow unsafe filesystem paths, or ingest secrets automatically.

Every source-backed finding is revision-pinned to repository, commit SHA, file, line range, blob SHA, and content hash. Direct structural observations may be VERIFIED. Heuristic architectural interpretations are INFERRED with confidence. User assertions remain USER_SUPPLIED. Unsupported claims remain UNKNOWN.

Pipeline:

Repository Snapshot → File Identity Validation → Language Detection → Dependency Analysis → Entry Point Detection → Module Analysis → Runtime Signal Analysis → Storage/AI/Security Signal Analysis → Evidence Records → Architecture IR.

Architecture generation must preserve evidence IDs and classification. Inferred relationships may aid exploration but MUST NOT be represented as observed runtime traces.

G7 qualification requires hostile tests for path escape, missing revision identity, inference promotion, and evidence pinning, plus successful workspace typecheck/test execution.