# Agent Pack Context Spec

The spec tree decides spec context for generated skills.

For each spec module, the sibling `config.json` is the source of truth for module identity, dependencies, and spec-local metadata.

`agent-pack.config.json` declares targets and skills only: target metadata, skill keys, titles, scopes, suffixes, and each skill's owning `moduleId`.

`agent-pack.config.json` MUST NOT declare dependency closures, related modules, extra modules, fallback modules, or hidden context lists.

A module skill's context is derived by resolving its `moduleId` in the target spec tree and walking `deps` transitively from sibling module configs.

A root skill's context is derived from all modules in the target spec tree.

Generated artifacts MAY expose the module graph derived from spec configs.

Generated artifacts MUST NOT add per-skill dependency lists that duplicate the config-derived graph.

Review state MAY store hashes of derived context, but MUST NOT persist per-skill module dependency lists.

If a skill needs additional spec context, add the dependency to the owning spec module's `config.json`.

If no spec dependency exists, write guidance in the source skill text instead of inventing a generated dependency list.

Any generator change that alters context selection must keep this file and `README.md` aligned.
