# UJG ED Graph Modeling Skill

Use this skill when the task is specifically about Graph vocabulary for the active UJG Editor's Draft.

## Source of truth

Use the active Editor's Draft Graph module:

`https://ujg.specs.openuji.org/ed/graph`

Treat `/ed` as moving. Do not silently mix dated snapshots with current ED.

## Scope

Focus on intended topology:

- `JourneyEntryIndex`
- `Journey`
- `JourneyEntry`
- `State`
- `CompositeState`
- `Transition`
- `Command`
- `JourneyExit`
- `OutgoingTransition`
- `InvokingTransition`

Keep runtime observations, selectors, typed values, timestamps, payloads, and analytics outside Graph.

## Modeling rules

Prefer the shallowest valid graph.

Use `JourneyEntryIndex` for catalogues, product-surface indexes, documentation indexes, or collections of known `JourneyEntry` contracts. Do not use it as a traversable journey.

Use `Journey` only for local traversable topology. A journey must have an IRI `@id`, at least one `entryRefs` value, and at least one `stateRefs` value. It may have at most one `defaultEntryRef`. Its local vertices are `stateRefs` union `exitRefs`.

Do not infer a default entry from `entryRefs` ordering. If no entry is explicitly selected and no `defaultEntryRef` exists, entry selection remains unresolved by Graph and must be resolved externally by materialization or execution context. Graph does not define predicates, application-state expressions, domain-state mappings, or evaluation rules for contextual entry resolution.

Use `JourneyEntry` for explicit journey entry contracts. Each entry must have exactly one `stateRef` that points to a `State` or `CompositeState` in the same journey's `stateRefs`. A `JourneyEntry` is not a transition endpoint.

Use ordinary `State` and local `Transition` for stable conditions on the same page, route, surface, modal, panel, or screen.

Use `Command` only for stable semantic identity of an intentional invocation in the modeled
experience. A `Command` is not a transition endpoint, does not replace `Transition` or
`OutgoingTransition`, and does not define source state, destination state, branching, condition
resolution, effect execution, visual representation, runtime execution, or execution results.

Use `CompositeState` only when a parent journey contains or exposes one or more nested child
journeys with `subjourneyRefs`. `subjourneyRefs` is a set of child `Journey` IRIs and must contain at
least one value. Do not use the legacy singular child-journey field in ED JSON-LD.

Multiple child journeys inside one `CompositeState` must coexist in the same composite scope: each
is independently available without requiring progression through another. Their `subjourneyRefs`
serialization order does not define traversal order, priority, causality, scheduling,
synchronization, fork/join, all-children-complete behavior, or hidden graph edges. Observations from
sibling child journeys may overlap or interleave without changing Graph topology. Do not group child
journeys that are experienced in a defined sequence (e.g., shipping before payment, step 1 before
step 2) under one `CompositeState` — model that sequence as separate `State`/`CompositeState` nodes
connected by `Transition` within the enclosing journey instead.

On a parent `Transition` into a `CompositeState`, use `toEntryRef` only to select a specific child
`JourneyEntry`. The entry must belong to exactly one child journey referenced by that composite's
`subjourneyRefs`; in this use `toEntryRef` remains a singular boundary refinement, not an endpoint or
a set of entries. Otherwise child entry selection uses the relevant child journey's
`defaultEntryRef` when one exists, or remains unresolved by Graph and must be resolved externally by
materialization or execution context. Do not infer a child entry from `entryRefs` ordering or
`subjourneyRefs` ordering.

Use `JourneyExit` and `fromExitRef` only for exported child outcomes that a parent genuinely reacts
to. Model the child outcome as a direct terminal `JourneyExit`, not as a pseudo-state. A child
`JourneyExit` leaves the containing `CompositeState` occurrence; it does not complete sibling child
journeys, synchronize them, or imply collective composite completion. The `fromExitRef` value must
belong to exactly one child journey referenced by the source composite's `subjourneyRefs` and remains
singular.

Use `Transition` between local vertices. `from` must be in the enclosing journey's `stateRefs`; `to` must be in the enclosing journey's `stateRefs` or `exitRefs`. Never use `JourneyExit` as `from`.
Do not create transitions between child journeys unless both endpoints are local vertices of the same
owning journey. Parent transitions may enter a `CompositeState` or continue after a matching child
exit, but they must not target child states directly.
Use `commandRef` only when the transition is associated with invoking a stable `Command`. Multiple
transitions may share one `commandRef`; that shared command identity does not define branching,
selection, ordering, or resolution semantics.

When a transition's `from` references a `State` with multiple concrete occurrences, traverse the one
stable transition from a concrete occurrence of that state. Do not add transition properties such as
`perInstance`, `perSourceInstance`, `perTargetInstance`, or `repeatableTransition`.

Use `OutgoingTransition` for ordinary navigation affordances. Every `OutgoingTransition` must declare
exactly one `toEntryRef` to a `JourneyEntry` owned by exactly one Journey. Resolve the destination as
`toEntryRef -> JourneyEntry.stateRef`; never put `to` on an OutgoingTransition or reference a
destination State directly. The entry may belong to the source Journey, including when it points to
the same State; that is explicit Journey re-entry rather than an implicit current-state target.
Several States may list the same OutgoingTransition; it keeps the same fixed `toEntryRef` at every
one of them. Never reinterpret that target relative to the source. Share a transition only when the
fixed destination entry is correct from each State; when the destination must preserve one of
several active States, define a separate OutgoingTransition and matching JourneyEntry for each State.
Use `commandRef` on an `OutgoingTransition` only when the outgoing affordance has stable intentional
invocation identity.

`OutgoingTransition` and `InvokingTransition` are both entry transitions. A State or CompositeState
lists them, in `entryTransitionRefs`; neither class declares `from`, `fromExitRef`, or
`entryTransitionRefs`. A Journey never declares them; for a footer or header shown on many States,
list the same transitions on each of those States. An entry transition listed on a CompositeState
is available at every State nested inside it, through child Journeys at any depth, so list a footer
on a composed page once on its CompositeState. List it on a child State only when it is available just there. Two entry
transitions available at the same State occurrence merge only when class, `toEntryRef`, and
`commandRef` all match.

Use `InvokingTransition` instead of `OutgoingTransition` when the affordance opens another Journey
and the user returns to the same source State when that Journey exits, such as a settings dialog
opened from a footer. It has the same shape as an OutgoingTransition: exactly one `toEntryRef`,
optional `commandRef`, no `to`, never in `transitionRefs`, and it attaches through the same
`entryTransitionRefs` on a State. One State may list both classes.
The Journey that owns its `toEntryRef` must declare at least one `exitRefs` value. Reaching any of
that Journey's own exits resumes the source State. While the invocation runs, the source is
suspended: nothing listed on it, or on a CompositeState that contains it, is offered through it, so a
footer is not available inside the invoked Journey unless that Journey's own States list it. Leaving
it any other way cancels the invocation
without a return, and that includes any OutgoingTransition taken inside it, even one that re-enters
the same Journey. Cancellation leaves the retained source as well, and cancels any enclosing
invocation in turn. If the source is left first, for example because a sibling child Journey in its
composite scope reaches an exit, the invocation is cancelled too. So a link inside an invoked Journey
never returns to the source; if the user must come back after following it, model a separate
InvokingTransition for that link. Never add the invoked Journey to `subjourneyRefs`, never model the return as a
Transition or OutgoingTransition back to the source, and never type one node as both classes. Do
not list an InvokingTransition on States of the Journey it invokes unless nested self-invocation is
intended. Mapping does not yet explain invocations, so do not add
`explainedByTransitionRef` values pointing at an InvokingTransition.

## Cross-skill awareness

When Graph modeling touches surface structure, design-system binding, localization metadata, runtime observations, or implementation extensions, consult the generated related-skills reference before continuing.
