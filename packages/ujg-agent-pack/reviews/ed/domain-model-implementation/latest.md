# Skill Review: ujg-ed-domain-model-implementation

Target: Editor's Draft
Skill scope: software implementation conformance against a full UJG document with the Domain Model Document Extension, including domain behavior, guarded branches, effects, invariants, and journey semantics
Source: sources/ed/skills/domain-model-implementation/skill.md
Spec URL: https://ujg.specs.openuji.org/ed/extensions/domain-model

## Status

- Previous review state found.
- Source and spec hashes are unchanged.

## Review Inputs

- Source hash: sha256:d34aeee6af9b8aa02f26b9d45f6d4931b78756bd57b1961e9be28b2b5744d449
- Spec hash: sha256:8d75f20fd1ed555704c8bf7d69510fbc2cea2e38b3be79f12b3caac80d7a7ad9

## Source Headings Likely Affected

- UJG Domain Implementation Conformance
- Purpose
- Required Inputs
- Establish the Realization Boundary
- Validate the Source Model
- Build an Auditable Trace Matrix
- Preserve Domain Semantics
- Prevent Unmodeled Behavior
- Entry and Continuation Authority
- Verification Requirements
- Conformance Gates
- Review Output

## Checklist

- Confirm source guidance still matches the current spec module definitions.
- Confirm cross-skill dependencies still route work to the right sibling skill.
- Update source skill text if the spec changed semantics, terms, constraints, or boundaries.
- Run `pnpm agent-pack:generate` to inspect generated skills under `build/`.
- Accept the review only after the source matches the current spec.
