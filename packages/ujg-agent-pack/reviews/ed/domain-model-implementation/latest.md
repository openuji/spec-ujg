# Skill Review: ujg-ed-domain-model-implementation

Target: Editor's Draft
Skill scope: software implementation conformance against a full UJG document with the Domain Model Document Extension, including domain behavior, guarded branches, effects, invariants, and journey semantics
Source: sources/ed/skills/domain-model-implementation/skill.md
Spec URL: https://ujg.specs.openuji.org/ed/extensions/domain-model

## Status

- Previous review state found.
- Source and spec hashes are unchanged.

## Review Inputs

- Source hash: sha256:2be40fa8ef7524258a50436ba696d5d220be5e4833f695641da6aa3639711046
- Spec hash: sha256:fd1756c1588e08e503e62971f4315d6cf42f514a5ab16a784f53bb8ae8d612a5

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
- Run `pnpm agent-pack:update` after source edits.
- Accept the review only after the source and generated artifacts match the current spec.
