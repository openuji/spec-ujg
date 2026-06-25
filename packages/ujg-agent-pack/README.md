# UJG Agent Pack

This package turns UJG specification guidance into installable agent skills.

It manages the active Editor's Draft and dated Technical Report snapshots as versioned skill trees. A target can have multiple curated skills, such as root modeling, graph modeling, and design-system modeling.

## Source Model

Authored skill sources live under:

```text
sources/<target>/skills/<skill-key>/skill.md
```

Examples:

```text
sources/ed/skills/root/skill.md
sources/ed/skills/graph/skill.md
sources/ed/skills/design-system/skill.md
sources/tr/2026.06/skills/root/skill.md
```

The target and skill catalog is `agent-pack.config.json`. Each target owns its own `skills` array so ED and dated TR snapshots can diverge over time. A skill is generated only when its source file exists for that target.

Spec context ownership is defined in [`spec.md`](spec.md): sibling spec `config.json` files are the only source of truth for module dependencies and generated skill context.

The generator checks that every `specs/tr/<version>` directory has a matching `tr/<version>` target in `agent-pack.config.json`, so new published snapshots cannot be silently skipped.

## Generated Artifacts

Generated outputs are committed for reviewability:

- `agents/<target>/<skill-key>/AGENTS.md`
- `codex/<skill-name>/SKILL.md`
- `codex/<skill-name>/agents/openai.yaml`
- `codex/<skill-name>/references/skill-tree.json`
- `codex/<skill-name>/references/related-skills.md`
- `manifest.json`

Do not hand-edit generated files. Edit source files or `agent-pack.config.json`, then regenerate.

## Skill Awareness

The generator reads spec `config.json` files from each target spec tree. It uses module dependencies to create related-skill references.

For example, `modules/design-system` depends on `graph` and `modules/surface`, so the generated design-system skill knows it should consult graph-related guidance when topology or traversal is involved.

Each Codex skill includes lightweight references:

- `references/skill-tree.json`: machine-readable target, skill, and module dependency graph.
- `references/related-skills.md`: human-readable sibling-skill summary.

## Commands

Run from the repository root:

```sh
pnpm agent-pack:update
pnpm agent-pack:validate
pnpm agent-pack:review
pnpm agent-pack:review:accept -- --target ed --skill root
pnpm agent-pack:review:check
pnpm agent-pack:check
pnpm agent-pack:test
pnpm agent-pack:pack
pnpm agent-pack:install:codex -- --target ed
```

Package-local equivalents:

```sh
pnpm --filter @openuji/ujg-agent-pack run update
pnpm --filter @openuji/ujg-agent-pack run validate
pnpm --filter @openuji/ujg-agent-pack run review
pnpm --filter @openuji/ujg-agent-pack run review:accept -- --target ed --skill root
pnpm --filter @openuji/ujg-agent-pack run review:check
pnpm --filter @openuji/ujg-agent-pack run check
pnpm --filter @openuji/ujg-agent-pack run test:install
```

## Review Routine

After a published spec change:

1. Run `pnpm agent-pack:review`.
2. Inspect reports under `reviews/<target>/<skill-key>/latest.md`.
3. Update source skill text if the spec change affects guidance.
4. Run `pnpm agent-pack:update`.
5. Accept reviewed skill states with `pnpm agent-pack:review:accept -- --target <target> --skill <skill-key>`.
6. Run `pnpm agent-pack:check`.

Review acceptance is stored in `reviews/registry.json`. The registry records the accepted source hash and relevant spec hash for each target/skill pair. `check` fails when generated files are stale, validation fails, or a source/spec change has not been accepted.

### What Review Accept Means

`pnpm agent-pack:review:accept` records that the current source skill text has been reviewed against the current relevant spec modules.

It writes the current hashes into `reviews/registry.json`:

- the source skill hash from `sources/<target>/skills/<skill-key>/skill.md`,
- the combined spec hash for the modules that affect that skill,
- the report path for the accepted review.

Accepting a review is an explicit checkpoint. It means someone inspected the generated report, decided whether the skill source needed changes, made those changes if needed, regenerated artifacts, and is now marking the current state as the baseline for future checks.

It does not automatically prove the skill is semantically perfect. It only tells the tooling: this target/skill pair has been consciously reevaluated for the current source and spec hashes.

Use a targeted accept when only one skill was reviewed:

```sh
pnpm agent-pack:review:accept -- --target ed --skill graph
```

Run accept without filters only when every generated target/skill report has been reviewed:

```sh
pnpm agent-pack:review:accept
```

## Install Behavior

`pnpm agent-pack:install:codex -- --target <id>` installs generated Codex skills for one target into:

```text
${CODEX_HOME:-$HOME/.codex}/skills/<skill-name>
```

Install is target-level only. It brings the selected target's current generated skill tree into Codex exactly as generated by the package.

Install ED:

```sh
pnpm agent-pack:install:codex -- --target ed
```

Install a dated TR snapshot:

```sh
pnpm agent-pack:install:codex -- --target tr/2026.06
```

The installer syncs only the managed generated skill directories for the selected target. It installs the current generated skills, replaces existing ones for that target, and removes previously installed managed skills for that target when they no longer exist in the package. It does not touch unrelated local skills or generated skills for other targets.

Single-skill install is intentionally unsupported. Use target-level install whenever a target's generated skills should be updated.

Every generated Codex skill includes `references/package-state.json`, which records the package id/version, target id, skill key/name, source hash, spec hash, config hash, and artifact hash.

## Files To Edit

Edit:

- `agent-pack.config.json`
- `sources/**/skill.md`
- `scripts/agent-pack.js`
- `README.md`

Do not hand-edit:

- `agents/**`
- `codex/**`
- `manifest.json`
- `reviews/**/latest.md`

Review registry changes should be made through `pnpm agent-pack:review:accept`.
