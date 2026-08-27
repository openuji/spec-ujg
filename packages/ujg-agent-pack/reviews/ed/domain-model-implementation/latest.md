# Skill Review: ujg-ed-domain-model-implementation

Target: Editor's Draft
Skill scope: software implementation conformance against a full UJG document with the Domain Model Document Extension, including domain behavior, guarded branches, effects, invariants, and journey semantics
Source: sources/ed/skills/domain-model-implementation/skill.md
Spec URL: https://ujg.specs.openuji.org/ed/extensions/domain-model

## Status

- Previous review state found.
- Source and spec hashes are unchanged.

## Review Inputs

- Source hash: sha256:a8d738b3047ff5f497ea860d1bc6751acddc6fd29be1588b48827916dc95b434
- Spec hash: sha256:dff462241bc64427b2692e124d85e8b3050bd16e5c78f3cc8832a27966383be9

## Source Headings Likely Affected

- UJG Domain Implementation Conformance
- Purpose
- Required Inputs
- Establish the Realization Boundary
- Validate the Source Model
- Build an Auditable Trace Matrix
- Preserve Domain Semantics
- Prevent Unmodeled Behavior
- Verification Requirements
- Conformance Gates
- Review Output
- Common Failure Patterns

## Checklist

- Confirm source guidance still matches the current spec module definitions.
- Confirm cross-skill dependencies still route work to the right sibling skill.
- Update source skill text if the spec changed semantics, terms, constraints, or boundaries.
- Run `pnpm agent-pack:update` after source edits.
- Accept the review only after the source and generated artifacts match the current spec.
