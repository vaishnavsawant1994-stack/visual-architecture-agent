# G11 CLI + Agent Integration Contract

Required CLI surface:

`visual doctor | guide | create | analyze | validate | inspect | render | preview | deliver | compare | export | verify | examples`

Commands compose the same typed IR, validation, repository intelligence, layout, renderer, viewer, exporter and verifier packages used by the library. Missing required input fails closed.

Compare output is BEFORE / DELTA / AFTER and reports added/removed components and relationships. It must not infer business or security impact without evidence.

Agent runtimes: ChatGPT/Codex, Claude Code, Cursor and OpenCode. Adapters share one semantic request contract and require repository evidence, read-only analysis, explicit VERIFIED / INFERRED / USER_SUPPLIED / UNKNOWN classification and no false runtime-trace claims.

G11 qualification requires workspace typecheck/tests plus command and adapter falsification.