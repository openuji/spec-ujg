# UJG ED Base Modeling Skill

Use this skill to generate, review, correct, or reason about Editor's Draft UJG JSON-LD across the
base module family: Core, Graph, Surface, Runtime, Mapping, and Metrics.

Do not generate vocabulary outside these six modules. When a task requires another published
vocabulary, use the skill dedicated to that vocabulary instead of expanding this root skill.

## Source of truth

Use the active Editor's Draft unless the user explicitly requests a dated snapshot:

`https://ujg.specs.openuji.org/ed`

Treat `/ed` as moving. Do not mix it silently with dated snapshots.

## Module selection

Select only the base modules needed by the document:

- Core provides the document container, imports, addressable nodes, and opaque extensions.
- Graph defines intended journeys, entries, states, transitions, commands, exits, outgoing
  navigation, and indexes.
- Surface connects supported Graph nodes to human-facing surfaces and concrete surface instances.
- Runtime records observed events and their causal order.
- Mapping resolves Runtime observations through Surface to Graph.
- Metrics records measurements derived from mapped executions.

Core is always required. Add Graph for intended topology, Surface for materialized or observed
interfaces, Runtime for event traces, Mapping for trace interpretation, and Metrics for metric
observations. Include only the contexts for the selected modules.

## Core document rules

Use `UJGDocument` as the document container. Give every addressable resource an IRI and place it in
the top-level `nodes` array. Use `imports` only for referenced UJG documents.

Core `extensions` are opaque payloads. Do not place interoperable Graph, Surface, Runtime, Mapping,
or Metrics semantics in them.

Keep every node top-level. References connect nodes; JSON nesting does not establish ownership,
containment, traversal, or runtime order.

## Graph modeling

Prefer the shallowest valid graph. Use ordinary `State` and local `Transition` for stable conditions
and progression inside one Journey. Add `CompositeState` and child Journeys only when nesting
preserves meaning that a flat Journey would lose.

### Journeys and entries

Use `JourneyEntryIndex` only as a discovery catalogue. It is not traversable and does not define
order or reachability.

Every `Journey` has an IRI, at least one `entryRefs` value, and at least one `stateRefs` value. A
present `defaultEntryRef` must be one of that Journey's entries. Never infer a default from array
order.

Every `JourneyEntry` has exactly one `stateRef` to a `State` or `CompositeState` in its unique owner
Journey's `stateRefs`. A JourneyEntry is an entry contract, not a local transition vertex.

### States, composition, and exits

Use `State` for a stable observable condition.

Use `CompositeState` only when it exposes one or more child Journeys through `subjourneyRefs`.
Child states stay in their child Journey and never appear in the parent's `stateRefs`.

The order of `subjourneyRefs` does not imply traversal, priority, scheduling, synchronization, or
completion order. Reaching an exit in one child Journey does not complete sibling Journeys.

Use `JourneyExit` for a terminal child outcome that an enclosing Journey genuinely handles. A child
transitions directly to its own exit. A parent continuation from the corresponding CompositeState
uses one `fromExitRef` owned by exactly one referenced child Journey.

### Local transitions and commands

Use `Transition` for local progression. Its `from` must be in the owner Journey's `stateRefs`; its
`to` must be in that Journey's `stateRefs` or `exitRefs`. Never use a JourneyEntry or JourneyExit as
`from`.

On a parent Transition whose `to` is a CompositeState, `toEntryRef` may select one JourneyEntry
owned by exactly one referenced child Journey. Otherwise child entry selection uses that child
Journey's `defaultEntryRef` when present or remains unresolved.

Use `Command` only as stable semantic identity for an intentional invocation. A Command does not
define source, destination, branching, rendering, runtime occurrence, or results. A Transition or
OutgoingTransition may use `commandRef` when that stable invocation identity is needed.

### Outgoing navigation

Use `OutgoingTransition` for a navigational affordance that leaves local progression and enters a
Journey through a named entry. Every OutgoingTransition declares exactly one `toEntryRef` to a
JourneyEntry owned by exactly one Journey. Resolve its destination as:

```text
OutgoingTransition.toEntryRef -> JourneyEntry.stateRef
```

Never put `to` on an OutgoingTransition or reference its destination State directly. The entry may
belong to the source Journey, including same-State re-entry.

An OutgoingTransition has no explicit `from`. Its effective source is the State that references it
through `outgoingTransitionRefs` or a State where its `OutgoingTransitionGroup` is injected.

An OutgoingTransitionGroup injects the same transition and fixed `toEntryRef` at every effective
source. Use a group only when the same destination entry is correct everywhere. When the intended
destination varies by source, define source-specific OutgoingTransitions and entries.

Do not place OutgoingTransitions in `transitionRefs`, inject them from JourneyExit nodes, or use
them for ordinary internal progression.

## Surface modeling

Use `Surface` for a human-facing materialization of exactly one Graph `State`, `CompositeState`, or
`Command` through `graphNodeRef`. Do not point `graphNodeRef` at Transition or OutgoingTransition.

Use `SurfaceInstance` for one concrete occurrence of a Surface. Each SurfaceInstance has exactly
one `surfaceRef` and derives Graph meaning through:

```text
SurfaceInstance.surfaceRef -> Surface.graphNodeRef
```

Use `Touchpoint.journeyRefs` to associate a system or channel boundary with coherent Journey
boundaries. Use `Persona.touchpointRefs` to associate a human perspective with Touchpoints. Neither
relationship creates Graph edges, traversal, runtime actors, or state inheritance.

## Runtime modeling

Use `JourneyExecution` for one bounded logical trace and `RuntimeEvent` for one observed runtime
moment.

Every RuntimeEvent has exactly one `executionId` and one `surfaceInstanceRef`. Resolve its Graph
meaning through:

```text
RuntimeEvent.surfaceInstanceRef
  -> SurfaceInstance.surfaceRef
  -> Surface.graphNodeRef
```

Use `previousId` for the immediate predecessor in the same execution. Reconstruct order from the
`previousId` chain, not timestamps or JSON order. A valid execution has one root event, no missing
predecessor, no cycle, and no branch with multiple direct successors.

Keep observed values, URLs, timestamps, selectors, and payloads in Runtime rather than Graph.

## Mapping semantics

Use `JourneyMapping` for one Journey-local segment of a `JourneyExecution`. It has one
`mappedRuntimeRef`, one `mappedJourneyRef`, and one or more `mappedStepRef` values. One execution may
have several non-overlapping JourneyMappings.

Use `MappedStep` for a state-observation RuntimeEvent. It has one `mappedEventRef`, one
`mappedStateRef`, and may identify the immediately preceding affordance event and the effective
Transition or OutgoingTransition that explains the movement.

Order mapped steps through their Runtime events' causal chain, never by `mappedStepRef` or JSON
order. Events resolving to Commands are affordance observations and are not MappedSteps.

Every OutgoingTransition begins a new segment, including same-Journey and same-State re-entry. The
new segment's `mappedJourneyRef` is the Journey that owns the destination entry, and its first
`mappedStateRef` equals that entry's `stateRef`. Predecessor lookup crosses the segment boundary
through Runtime causal order.

An observed move into another Journey without a matching effective OutgoingTransition also begins a
new segment; its first step is an unexplained movement.

Within a segment, ordinary Transition explanations remain local to the owning Journey. Do not infer
Graph edges from observation order alone.

## Metrics semantics

Use `MetricObservation` for one metric value and one metric subject. Provide one `metricSubjectRef`,
one `metricKey`, and one `metricValue`; use the declared metric unit and numerator or denominator
fields where required by the metric definition.

For Mapping-derived metrics:

- Count each MappedStep once in exactly one JourneyMapping segment.
- Exclude only the Runtime root step from movement counts.
- Count the first step of every later segment as a movement, including same-Journey re-entry.
- Count an explained OutgoingTransition traversal exactly once.
- Treat unexplained movement as unresolved topology, not automatically as an error.
- Aggregate counts only over disjoint segment step sets.

## Separation rules

Graph defines intended topology. Surface materializes Graph meaning. Runtime records observations.
Mapping interprets those observations. Metrics measures the interpreted result.

Do not let one layer silently repair another:

- Runtime order does not create Graph transitions.
- Surface attachment does not change Journey ownership or traversal.
- Mapping explanation does not mutate Graph.
- Metrics does not redefine movement or classify unexplained movement as failure.
- Screenshots and observed page order are evidence, not topology by themselves.

## Decision procedure

1. Confirm the requested specification target.
2. Select only the required base modules and contexts.
3. Separate intended Graph structure from Surface materialization and Runtime facts.
4. Model the shallowest Journey topology that preserves the intended behavior.
5. Keep Transition endpoints local and route outgoing navigation through JourneyEntry contracts.
6. Add Surface and SurfaceInstance resources only for addressable materializations and occurrences.
7. Build Runtime order exclusively from `previousId`.
8. Split Mapping at every OutgoingTransition boundary.
9. Derive Metrics from non-overlapping mapped segments.
10. Remove invented fields and vocabulary outside this skill's base-module scope.

## Output workflow

When producing JSON-LD:

1. State which base modules are used.
2. Generate strict Editor's Draft JSON-LD.
3. Provide a short self-audit.
4. State uncertainty rather than inventing structure.

Before returning, check:

- Contexts match the modules actually used, and every addressable node is top-level.
- Journey entries and states have unique, valid ownership.
- Transition endpoints remain local.
- Parent-to-child entry and exit references preserve CompositeState boundaries.
- Every OutgoingTransition has exactly one valid `toEntryRef`; none has `to`.
- Grouped outgoing navigation uses a destination entry valid from every effective source.
- Surface references only State, CompositeState, or Command.
- Runtime events resolve through SurfaceInstance and form one causal chain per execution.
- JourneyMappings are non-overlapping Journey-local segments.
- Segment starts and outgoing traversals are counted once in Metrics.
- No unsupported field or vocabulary has been invented.

## Simplification and uncertainty

Before finalizing, ask whether a CompositeState can be a State, a child Journey can be folded into
its parent, an exit can be a local Transition, or an observed sequence is being mistaken for intended
topology.

If a flatter model preserves the same meaning, use it. If evidence is incomplete, identify what is
known, what is inferred, and what remains unresolved.
