# Skill Review: ujg-ed-domain-model-implementation

Target: Editor's Draft
Skill scope: software implementation conformance against a full UJG document with the Domain Model Document Extension, including domain behavior, guarded branches, effects, invariants, and journey semantics
Source: sources/ed/skills/domain-model-implementation/skill.md
Spec URL: https://ujg.specs.openuji.org/ed/extensions/domain-model

## Status

- Previous review state found.
- Source and spec hashes are unchanged.

## Review Inputs

- Source hash: sha256:e53a23695413c243d83b2b5ee3d366d7282d95c52dc643edfc2170f5df7a702f
- Spec hash: sha256:7ef7792dcd6f397b5c8f8b57825e67cb43d3040b98f47896cdb7b44b9c77805c

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
