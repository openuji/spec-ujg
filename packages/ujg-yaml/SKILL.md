---
name: ujg-authoring-canonical-converter
description: "Implement and review deterministic conversion between developer-oriented UJG YAML and normalized canonical UJG JSON-LD without changing journey semantics."
---

# UJG Authoring ↔ Canonical Converter

## Contract

Use this skill for two explicit representations:

- **Authoring representation — YAML** (`*.ujg.yaml`): nested, ordered, comment-friendly developer input.
- **Canonical UJG instance — JSON-LD** (`*.ujg.jsonld`): normalized compact JSON-LD used for expansion, RDF interpretation, SHACL, conformance, execution references, and interchange.

The YAML is a projection of UJG, not a second specification.

Here, **canonical** means the project-selected normalized JSON-LD form. It does not mean RDF Dataset Canonicalization or a cryptographic canonical form.

The converter projects syntax. It must not remodel, repair, or reinterpret the journey.

## Semantic invariant

```text
Authoring YAML --compile--> Canonical JSON-LD
Canonical JSON-LD --project--> Normalized authoring YAML
```

Correctness is RDF dataset equivalence, not byte equality:

```text
dataset(compile(project(canonical))) ≅ dataset(canonical)
```

Comments, anchors, aliases, quoting, and original key order are authoring metadata. Preserve them only in the YAML source or a source map; never pretend they can be reconstructed from JSON-LD.

## Versioned projection registry

Implement all authoring sugar through one explicit, versioned registry. Never infer classes from IRI prefixes or labels.

Use **key equivalence** for dedicated class sections: the YAML key is the lower-camel-case form of the canonical class name. Cardinality is defined by the registry, not by singular or plural spelling.

```text
journeyEntryIndex     -> JourneyEntryIndex
messageBundle         -> MessageBundle
touchpoints           -> Touchpoint
actors                -> Actor
artifacts             -> project-defined Artifact default
actions               -> Action
states                -> State, unless explicit type overrides
resolvers             -> SurfaceInstanceResolver
observationBindings   -> ObservationBinding
phases                -> Phase
experienceSteps       -> ExperienceStep
```

Accessibility definitions are grouped under one authoring namespace:

```yaml
accessible:
  features:
    urn:feature:example:
      accessibleFeatureName: selected
      accessibleFeatureValue: true
  relations:
    urn:relation:example:
      accessibleRelationType: controls
      targetLocatorRef: urn:locator:target
  locators:
    urn:locator:example:
      role: button
```

The nested mappings are fixed:

```text
accessible.features   -> AccessibleFeature
accessible.relations  -> AccessibleRelation
accessible.locators   -> AccessibleLocator, unless explicit type overrides
```

Do not accept top-level `features`, `relations`, or `locators` in the normalized authoring form. A migration reader may accept them temporarily, but the writer must always emit the `accessible` grouping.

A keyed-map key becomes `@id`. Authoring `id` becomes `@id`; `type` becomes `@type`. Explicit types must be permitted at that position. Unknown sections, properties, and types fail by default. Private data stays under namespaced `extensions`.

## Structural lifting

All addressable definitions become top-level canonical `nodes`.

```text
CompositeState.subjourney
  -> lift Journey
  -> replace with subjourneyId

Journey.entries
  -> lift JourneyEntry nodes
  -> create entryRefs

Journey.states
  -> lift State or CompositeState nodes
  -> create stateRefs

Journey.transitions
  -> lift Transition nodes
  -> create transitionRefs

GraphNode.surface
  -> lift Surface
  -> set graphNodeRef to the owning Graph node @id
```

Register equivalent rules for exits, outgoing transitions, groups, and other supported nesting.

Only synthesize projection mechanics: inferred default `@type`, ownership reference arrays, and `Surface.graphNodeRef`. Never invent missing messages, locators, surfaces, resolvers, states, transitions, outcomes, or references.

## References and identity

Treat registered `*Ref`, `*Refs`, `from`, and `to` properties as IRI references.

- Resolve shorthand only through explicit prefixes or an explicit base.
- Never resolve by label or proximity.
- Reject duplicate YAML keys before conversion.
- Reject conflicting definitions of one `@id`.
- Validate every local reference after lifting.
- Preserve external IRIs without requiring local definitions.

Use a CST-capable YAML parser when line/column diagnostics or comment-preserving authoring writes are required. Resolve anchors before projection and reject alias cycles.

## Canonical JSON-LD normalization

Emit one compact JSON-LD `UJGDocument` with explicit `@context`, `@id`, `@type`, and `nodes`. Every node has explicit `@id` and `@type`.

Include Core and only the module contexts required by emitted terms. Normalize deterministically:

```text
contexts: fixed dependency order
nodes: sort by @id
set-valued arrays: deduplicate and sort by IRI
order-sensitive arrays: preserve order
properties: stable project-defined order
YAML-only metadata: omit
```

Use context definitions or the registry to distinguish set-valued from ordered properties. Never treat presentation `order` as Graph traversal or Runtime ordering.

## Reverse projection

Project JSON-LD back to YAML conservatively:

- emit dedicated class sections using their registered lower-camel-case keys, including `journeyEntryIndex` and `messageBundle`;
- emit `AccessibleFeature`, `AccessibleRelation`, and `AccessibleLocator` nodes only under `accessible.features`, `accessible.relations`, and `accessible.locators`;
- group all other nodes by registered type;
- nest a Journey under a CompositeState only when ownership is unambiguous;
- nest entries, states, and transitions only when exactly one Journey owns them;
- nest a Surface under its Graph node only when unambiguous;
- keep shared or ambiguous nodes in their registered authoring sections;
- omit `type` only where the registry supplies one unambiguous default;
- never recreate comments or anchors from semantic data.

The result must be deterministic, but it need not reproduce the original YAML text.

## Validation and diagnostics

Run stages in this order:

```text
1. YAML syntax, duplicate keys, and alias-cycle checks
2. Authoring grammar validation
3. Lifting, identity, ownership, and local-reference checks
4. Canonical JSON-LD syntax and context checks
5. JSON-LD expansion / RDF dataset construction
6. UJG SHACL and conformance validation
7. Optional semantic round-trip comparison
```

Never run UJG semantic validation directly against the nested YAML projection.

Every error should include a stable code, severity, file/line/column, YAML path, canonical `@id` when known, affected property/reference, and concise remediation. Prefer codes such as:

```text
UNRESOLVED_REFERENCE
DUPLICATE_ID
TYPE_CONFLICT
UNKNOWN_AUTHORING_TERM
AMBIGUOUS_OWNERSHIP
CONTEXT_NOT_LOCKED
ROUND_TRIP_MISMATCH
```

## Reproducibility

Keep the authoring grammar version separate from the UJG target:

```yaml
ujgTarget: ed-2026-07-13
```

Because the Editor's Draft moves, pin a dated target or lock exact context and SHACL artifact contents with hashes. Remote changes must not silently alter a build. Store converter provenance in a sidecar or build report, not as undocumented `UJGDocument` properties.

## Required tests

```text
golden compile fixtures
key-equivalence fixtures for journeyEntryIndex and messageBundle
accessible grouping compile and reverse-projection fixtures
legacy top-level accessibility-key migration behavior
normalization idempotence
compile-project-compile dataset equivalence
unresolved-reference and duplicate-ID failures
ambiguous-ownership projection
unknown-term rejection
context-lock reproducibility
comments-and-anchors loss documentation
```

## Acceptance rule

The converter is correct when it produces a deterministic, conforming JSON-LD instance with the same declared UJG meaning as the YAML, while reporting every unresolved semantic input and every lossy authoring-only feature explicitly.
