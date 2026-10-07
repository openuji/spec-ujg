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

Generated outputs are not committed. `pnpm agent-pack:generate` writes them to the gitignored `build/` folder so they can be inspected before install:

- `build/agents/<target>/<skill-key>/AGENTS.md`
- `build/codex/<skill-name>/SKILL.md`
- `build/codex/<skill-name>/agents/openai.yaml`
- `build/codex/<skill-name>/references/{skill-tree.json,related-skills.md,package-state.json}`
- `build/claude/<skill-name>/SKILL.md`
- `build/claude/<skill-name>/references/{skill-tree.json,related-skills.md,package-state.json}`
- `build/manifest.json`

Codex and Claude skills are built from the same source and share the same `SKILL.md` frontmatter (`name`, `description`) and body. Claude skills do not include the Codex-only `agents/openai.yaml`.

`build/` is disposable: `generate`, `install`, and `pack` wipe and regenerate it from `sources/`, `agent-pack.config.json`, and the spec tree. Never edit it; edit the sources instead.

## Skill Awareness

The generator reads spec `config.json` files from each target spec tree. It uses module dependencies to create related-skill references.

For example, `modules/design-system` depends on `graph` and `surface`, so the generated design-system skill knows it should consult graph-related guidance when topology or traversal is involved.

Each generated Codex and Claude skill includes lightweight references:

- `references/skill-tree.json`: machine-readable target, skill, and module dependency graph.
- `references/related-skills.md`: human-readable sibling-skill summary.

## Commands

Run from the repository root:

```sh
pnpm agent-pack:generate
pnpm agent-pack:validate
pnpm agent-pack:review
pnpm agent-pack:review:accept -- --target ed --skill root
pnpm agent-pack:review:check
pnpm agent-pack:check
pnpm agent-pack:test
pnpm agent-pack:pack
pnpm agent-pack:install:codex -- --target ed
pnpm agent-pack:install:claude -- --target ed
```

Package-local equivalents:

```sh
pnpm --filter @openuji/ujg-agent-pack run generate
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
4. Optionally run `pnpm agent-pack:generate` and inspect the generated skills under `build/`.
5. Accept reviewed skill states with `pnpm agent-pack:review:accept -- --target <target> --skill <skill-key>`.
6. Run `pnpm agent-pack:check`.

Review acceptance is stored in `reviews/registry.json`. The registry records the accepted source hash and relevant spec hash for each target/skill pair. `check` fails when generated skills fail validation (frontmatter shape, name and description limits) or a source/spec change has not been accepted.

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

Every install first validates the skills and checks review state, then regenerates `build/` and copies the selected target's skills from `build/<format>/`. What you inspected in `build/` is what gets installed, as long as the sources have not changed in between.

### Codex

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

### Claude

`pnpm agent-pack:install:claude -- --target <id>` installs generated Claude skills for one target into the user skill directory:

```text
${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/<skill-name>
```

Pass `--project <dir>` to install into a project's skill directory instead:

```sh
pnpm agent-pack:install:claude -- --target ed --project /path/to/repo
# -> /path/to/repo/.claude/skills/<skill-name>
```

Claude install follows the same rules as Codex install. It is target-level only, replaces the current skills for that target, and removes managed skills for that target that no longer exist, without touching unrelated skills.

Every generated Codex and Claude skill includes `references/package-state.json`, which records the package id/version, target id, skill key/name, source hash, spec hash, config hash, and artifact hash.

## Files To Edit

Edit:

- `agent-pack.config.json`
- `sources/**/skill.md`
- `scripts/agent-pack.js`
- `README.md`

Do not hand-edit:

- `build/**` (gitignored, regenerated)
- `reviews/**/latest.md`

Review registry changes should be made through `pnpm agent-pack:review:accept`.
