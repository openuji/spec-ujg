# UJG 1.0 Release Candidate 3

UJG 1.0 RC3 is the third release-candidate snapshot for the UJG 1.0 line. It is published under `/tr/1.0-rc3/` and supersedes [`1.0-rc2`](../1.0-rc2/) as the current basis for implementation trials, compatibility checks, and vocabulary review before UJG 1.0 Final.

Compared with [`1.0-rc2`](../1.0-rc2/), RC3 removes the implicit `OutgoingTransition.toCurrentState` flag in favor of an explicit `toEntryRef` destination on every outgoing affordance, replaces Surface's graph-wide `User`/`userRef` ownership model with a touchpoint-scoped `Persona`, and reworks Mapping and Metrics around journey-local mapping segments instead of one mapping per whole execution.

## Release Status

- Release tag: `v1.0-rc3`
- Snapshot path: `/tr/1.0-rc3/`
- Vocabulary namespace line: `/tr/1.0/ns/`
- Release maturity: release candidate
- Intended status: pre-release until UJG 1.0 Final is published

The `https://ujg.specs.openuji.org/tr/1.0/ns/` namespace identifies the UJG 1.0 vocabulary line. Until UJG 1.0 Final is published, release-candidate snapshots may update artifacts in this namespace. After UJG 1.0 Final, incompatible vocabulary changes require a new major-version namespace.

## Highlights Since 1.0-rc2

- Removed `OutgoingTransition.toCurrentState`. Extended `toEntryRef`'s domain from `Transition` alone to `Transition` and `OutgoingTransition`, so every outgoing affordance now explicitly declares the `JourneyEntry` it lands on instead of relying on an implicit "stay on the current state" flag.
- Renamed Surface's `User` class to `Persona` and removed the `userRef` property entirely. `userRef` previously attached to `Journey`, `JourneyEntry`, `State`, `CompositeState`, `Command`, `Transition`, `JourneyExit`, `OutgoingTransition`, and `OutgoingTransitionGroup`; Surface's human-role concept is now scoped to grouping Touchpoints through `Persona.touchpointRefs` rather than acting as a graph-wide ownership reference.
- Redefined `JourneyMapping` as one journey-local **segment** of a mapped `JourneyExecution`, rather than one whole interpreted execution chain, reflecting that an `OutgoingTransition` re-entry (such as a locale switch) now starts a new mapping segment.
- Reworked `stepCount` and `movementCount` counting around per-segment `JourneyMapping` records: every mapped step is counted once within its segment, and the first mapped step of every non-initial segment — including a same-Journey or same-State re-entry through an `OutgoingTransition` — is itself a movement. Added the `outgoingTraversalCount` metric key. Aggregation rules now guard against double-counting a `MappedStep` across segments.
- Reworded the Effect module's "Graph preservation" invariant to cover `OutgoingTransition.toEntryRef` alongside `Transition`'s local `from`/`to` semantics.
- Replaced the `toCurrentState: true` idiom in Localization examples with explicit `toEntryRef` usage on locale-switch `OutgoingTransition`s. Added four new normative rules covering shared-topology state preservation, fixed `OutgoingTransitionGroup` destinations, locale-specific topology, and a prohibition on inferring Graph structure from `targetLocaleRef`. Added two new worked examples: shared-topology state-preserving switches, and a locale-specific-topology example where one locale's Journey has different States than another's.
- Regenerated JSON-LD contexts, Turtle ontologies, SHACL shapes, content manifests, and agent-pack skill outputs for the RC3 snapshot.

## Module Changes

### Graph

`OutgoingTransition.toCurrentState` is removed. `toEntryRef`'s domain is extended to `Transition ∪ OutgoingTransition`, so every `OutgoingTransition` explicitly selects a destination `JourneyEntry` rather than relying on an implicit "stay on current state" flag. A new SHACL constraint forbids `toCurrentState` outright and points implementers to `toEntryRef`.

### Surface

`User` is renamed to `Persona`. The `userRef` property is removed entirely — it previously let any of nine different Graph node types declare an owning user; that graph-wide ownership reference is gone. `touchpointRefs`'s domain moves from `User` to `Persona`, so Surface's human-role concept is now purely about grouping Touchpoints, not about tagging arbitrary Graph nodes with an owner.

### Mapping

`JourneyMapping` gains an explicit label and definition: a journey-local segment of a mapped `JourneyExecution`, not the whole execution chain. This supports executions that cross an `OutgoingTransition` re-entry, where each segment after the first begins at the re-entry's destination.

### Metrics

Counting rules for `stepCount` and `movementCount` are redefined around mapping segments rather than whole executions: every mapped step is counted once per segment, and a non-initial segment's first step — including a same-Journey or same-State re-entry via `OutgoingTransition` — counts as a movement. Added `outgoingTraversalCount`, incremented once per destination-segment first step explained by an `OutgoingTransition`. Aggregation rules now explicitly forbid counting the same `MappedStep` in more than one segment.

### Effect

The "Graph preservation" invariant now covers both hosts of `effectRef`: it must not change a `Transition`'s local `from`/`to` semantics, or an `OutgoingTransition`'s `toEntryRef` destination semantics.

### Localization

Locale-switch `OutgoingTransition`s now use explicit `toEntryRef` instead of the removed `toCurrentState: true` idiom. Four new normative rules were added: shared-topology state preservation (each source State must reference its own state-specific `OutgoingTransition`), fixed `OutgoingTransitionGroup` destinations (a grouped locale switch's one fixed entry must be correct for every source), locale topology (a state-scoped switch may target a same-State entry, while locale-specific content structure may target a different Journey's entry), and a prohibition on inferring Graph structure from `targetLocaleRef`. Two new worked examples illustrate shared-topology state-preserving switches and a locale-specific-topology switch.

## Draft Status

Every RC3 specification, module, and extension remains at `draft` maturity, matching the Editor's Draft. No `incubating` maturity labels remain under `specs/ed` or `specs/tr/1.0-rc3`.

## Generated Artifacts

RC3 includes refreshed generated artifacts for the changed module set:

- Content manifests for changed specifications.
- JSON-LD contexts, Turtle ontologies, and SHACL shapes for Graph, Surface, Mapping, Metrics, Effect, and Localization.
- Agent-pack outputs and accepted generated skill reviews for the `tr/1.0-rc3` target, covering the same eight skills as RC2 (root, core, graph, design-system, localization, observability, domain-model-evaluation, domain-model-implementation) with content updated to reflect `toEntryRef`-on-`OutgoingTransition`, `Persona`, and the mapping-segment model.

## Validation

The RC3 work was checked with:

```sh
pnpm content-manifests:check
pnpm --filter @openuji/web lint
pnpm --filter @openuji/web build
pnpm agent-pack:check
pnpm agent-pack:validate
pnpm agent-pack:review:check
pnpm agent-pack:test
pnpm tr-snapshots:freeze
```

(This corrects a stale reference in the RC1 and RC2 release notes to `pnpm agent-pack:update`, which is not a script defined in this repository. It also adds `pnpm tr-snapshots:freeze`, which both prior snapshots' frozen HTML shows was run but neither release notes documented.)

## Notes For Implementers

This is a release candidate, not UJG 1.0 Final. Implementers integrating against `1.0-rc2` should expect breaking changes when moving to RC3:

- `OutgoingTransition.toCurrentState` is removed. Every `OutgoingTransition`, including ones that previously used `toCurrentState: true` to stay on the active state, must set `toEntryRef` explicitly to the destination `JourneyEntry`.
- Surface's `User` class becomes `Persona`, and `userRef` is removed with no compatibility alias. Change each `User` node to `Persona` (its `@id` may stay the same), remove `userRef` from every Graph node, and connect each `Persona` to its Touchpoints with `touchpointRefs`.
- Mapping and Metrics consumers that treated one `JourneyMapping` as a whole execution chain must move to per-segment counting. `stepCount` and `movementCount` denominators change for any execution that crosses an `OutgoingTransition` re-entry, and a new `outgoingTraversalCount` metric key is available.
- Localization producers using `toCurrentState: true` for locale-preserving switches must switch to explicit `toEntryRef`, following the new shared-topology state-preservation rules.

Treat RC3 as stable enough for integration trials, compatibility checks, vocabulary review, and feedback, while allowing for final adjustments before the 1.0 Final snapshot.
