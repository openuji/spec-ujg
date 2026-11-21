# UJG 1.0 Release Candidate 4

UJG 1.0 RC4 is the fourth release-candidate snapshot for the UJG 1.0 line. It is published under `/tr/1.0-rc4/` and supersedes [`1.0-rc3`](../1.0-rc3/) as the current basis for implementation trials, compatibility checks, and vocabulary review before UJG 1.0 Final.

Compared with RC3, RC4 substantially refines Graph composition and movement semantics, adds the Operability module for describing how users perform Graph transitions through input modalities, and renames the Design System bridge from `SurfaceRealization` to `SurfaceMaterialization`.

## Release Status

- Release tag: `v1.0-rc4`
- Snapshot path: `/tr/1.0-rc4/`
- Vocabulary namespace: `/tr/1.0-rc4/ns/`
- Release maturity: release candidate
- Intended status: pre-release until UJG 1.0 Final is published

## Highlights Since 1.0-rc3

- Simplified the Graph state model by removing `LocalVertex`, `State.multiInstance`, `OutgoingTransitionGroup`, `outgoingTransitionGroupRefs`, and `outgoingTransitionRefs`.
- Added `AdjacentTransition` for bidirectional movement between neighboring states in one experience frame.
- Added `InvokingTransition` for temporarily invoking another Journey and returning to the suspended source after an exported exit.
- Added `StateCollection` to describe repeated, unnamed occurrences of one State and their member-level transitions without creating one Graph State per rendered item.
- Added `EntrySelector` for transitions whose destination entry is selected per occurrence rather than fixed in the Graph document.
- Reworked State entry affordances around `entryTransitionRefs`, including shared outgoing and invoking transitions.
- Clarified CompositeState semantics for one or more independently active child Journeys, shared child-Journey topology, nested composition, exported exits, and optional parent reactions.
- Added the Operability module with `TransitionMaterialization`, ordered `MoveStep`, `ActivationStep`, and `ShortcutStep` chains, modality and locator references, platform-neutral move kinds, and direction metadata for `AdjacentTransition`.
- Renamed Design System `SurfaceRealization` to `SurfaceMaterialization` and aligned profile descriptions, contexts, ontology terms, SHACL shapes, examples, and agent guidance with the materialization terminology.
- Updated Architecture, Core, Surface, Mapping, Metrics, Condition, Data Contract, Effect, Entry Binding, Localization, Domain Model, and agent guidance to align with the revised Graph model.

## Module Changes

### Graph

Graph now separates ordinary local `Transition`, neighboring `AdjacentTransition`, journey-entering `OutgoingTransition`, and suspending `InvokingTransition` semantics. States expose entry affordances directly through `entryTransitionRefs`. `StateCollection` and `EntrySelector` cover repeated UI parts and occurrence-specific destinations without leaking rendered occurrence identity into Graph topology.

CompositeState now explicitly represents a parent step that contains one or more independent child Journeys. Child exits are exported outcomes; reaching one does not leave the CompositeState unless a parent transition reacts to that exit.

### Operability

The new third-level Operability module describes alternative ways to perform Graph transitions through an input modality. A `TransitionMaterialization` identifies the Graph transition, modality, optional start locator and source state, and an ordered chain of movement, activation, or shortcut steps. Operability describes interaction mechanics without redefining Graph topology, recognition contracts, Runtime events, key bindings, or timing.

### Design System

The Design System bridge is now `SurfaceMaterialization`. It links one stable `Surface` to one primary `Component` or `Template`, with template-local `SlotBinding` composition where required. The former `SurfaceRealization` term is not part of the RC4 vocabulary.

### Related Modules

Dependent modules and examples now use the revised transition taxonomy, State entry affordances, CompositeState boundaries, and occurrence semantics. Mapping distinguishes member movement from same-occurrence self-loops and can use `AdjacentTransition` as a movement explanation. Optional-module architecture and profile descriptions include the new third-level Operability layer.

## Generated Artifacts

RC4 includes refreshed content manifests, JSON-LD contexts, Turtle ontologies, SHACL shapes, the Domain Model JSON Schema, and frozen HTML for the complete snapshot. The agent pack adds a `tr/1.0-rc4` target with nine reviewed skills: root, core, graph, design-system, localization, observability, operability, domain-model-evaluation, and domain-model-implementation.

## Validation

The RC4 work is checked with:

```sh
pnpm content-manifests:check
pnpm --filter @openuji/web lint
pnpm --filter @openuji/web build
pnpm agent-pack:generate
pnpm agent-pack:check
pnpm agent-pack:validate
pnpm agent-pack:review:check
pnpm agent-pack:test
pnpm tr-snapshots:freeze
git diff --check
```

## Notes For Implementers

RC4 is a release candidate, not UJG 1.0 Final. Implementers integrating against RC3 should expect breaking Graph changes:

- Replace removed `LocalVertex`, `multiInstance`, and outgoing-transition-group structures with the RC4 State, CompositeState, and `entryTransitionRefs` model.
- Select the transition class that matches the intended movement: local `Transition`, neighboring `AdjacentTransition`, journey-entering `OutgoingTransition`, or suspending `InvokingTransition`.
- Use `StateCollection` for repeated occurrences of one state and `EntrySelector` only when the selected destination entry genuinely varies per occurrence.
- Treat child Journeys in a CompositeState as independent flows and react to exported exits explicitly when the parent should move.
- Use Operability only for how a transition is performed; keep intended topology in Graph and observed behavior in Runtime and Mapping.
- Replace Design System `SurfaceRealization` nodes with `SurfaceMaterialization`; the class semantics and references are otherwise preserved under the new terminology.

Treat RC4 as stable enough for integration trials, compatibility checks, vocabulary review, and feedback while allowing for final adjustments before the UJG 1.0 Final snapshot.
