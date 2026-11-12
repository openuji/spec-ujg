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

`CompositeState` is a local vertex but not a `State`, and must not be typed as one. It needs an IRI
`@id` and exactly one `label`, and it never declares `stateRefs` or `entryTransitionRefs`. It can be
listed in `stateRefs`, be a `Transition` endpoint, and be a `JourneyEntry.stateRef` target. While it
is current, the user is at the current `State` of each child journey, and those States offer the
entry transitions.

Child journeys must be co-present: the user can perceive and act on each at the same time in the same
experience frame (a viewport, window, screen, or dialog session). Test: can the user act on both
without moving through the other? If yes, they are child journeys of one `CompositeState`. If one is
reached by moving through the other, such as a footer reached by scrolling or a step reached after
another, it is a `State` reached by a `Transition`. If one covers the other, as a modal does, use an
`InvokingTransition`. A sticky header or docked cart is a child journey of each page composite that
shows it; reference the same Journey from each. A State and a CompositeState belong to exactly one
Journey, so each page's content journey declares its own footer State, and those States can list the
same entry transition nodes.

Child journeys are independent. `subjourneyRefs` order does not define traversal order, priority,
causality, scheduling, synchronization, fork/join, all-children-complete behavior, or hidden graph
edges, and movement in one child journey does not move another.

On a parent `Transition` into a `CompositeState`, use `toEntryRef` only to select a specific child
`JourneyEntry`. The entry must belong to exactly one child journey referenced by that composite's
`subjourneyRefs`; in this use `toEntryRef` remains a singular boundary refinement, not an endpoint or
a set of entries. Otherwise child entry selection uses the relevant child journey's
`defaultEntryRef` when one exists, or remains unresolved by Graph and must be resolved externally by
materialization or execution context. Do not infer a child entry from `entryRefs` ordering or
`subjourneyRefs` ordering.

Use `JourneyExit` for a terminal outcome that a Journey exports to an enclosing composite or to an
invoker. A parent reaction is optional: an exit that no parent reacts to is valid. Use `fromExitRef`
only where a parent reacts to a specific outcome. Model the outcome as a direct terminal
`JourneyExit`, not as a pseudo-state.

A child `JourneyExit` does not leave the containing `CompositeState` occurrence by itself. The
composite stays current, and sibling child journeys stay in scope, until the occurrence is left,
normally by a parent `Transition` whose `fromExitRef` is that exit. Reaching the exit takes that
Transition, and it is never taken before the exit is reached. With no such Transition the child is
simply complete, so a consent or banner journey can end while the page journey beside it continues.
A child exit does not complete sibling child journeys, synchronize them, or imply collective
composite completion. An occurrence of the same Journey entered through an `InvokingTransition` is
not a composite child; its exits complete the invocation.

The `fromExitRef` value must belong to exactly one child journey referenced by the source
composite's `subjourneyRefs` and remains singular.

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

`OutgoingTransition` and `InvokingTransition` are both entry transitions. Only a State lists them,
in `entryTransitionRefs`; neither class declares `from`, `fromExitRef`, or `entryTransitionRefs`. A
CompositeState and a Journey never declare them, and an entry transition is never inherited by
nested States. A State or CompositeState must not be listed in the `stateRefs` of more than one
Journey. To reuse topology, reuse the Journey: reference it from several CompositeStates'
`subjourneyRefs` or enter it through an `OutgoingTransition` or `InvokingTransition`.

Use `InvokingTransition` instead of `OutgoingTransition` when the affordance opens another Journey
and the user returns to the same source State when that Journey exits, such as a settings dialog
opened from a page. It has the same shape as an OutgoingTransition: exactly one `toEntryRef`,
optional `commandRef`, no `to`, never in `transitionRefs`, and it attaches through the same
`entryTransitionRefs` on a State. One State may list both classes.
The Journey that owns its `toEntryRef` must declare at least one `exitRefs` value. Reaching any of
that Journey's own exits resumes the source State. While the invocation runs, the source is
suspended: nothing listed on it is offered through it, so those entry transitions are not available
inside the invoked Journey unless that Journey's own States list them. Leaving
it any other way cancels the invocation without a return, and that includes any OutgoingTransition
taken inside it, even one that re-enters the same Journey. Cancellation leaves the retained source as
well, and cancels any enclosing invocation in turn. If the source is left first, the invocation is
cancelled too; a sibling child Journey reaching an exit does not leave the source. So a link inside
an invoked Journey never returns to the source; if the user must come back after following it,
model a separate InvokingTransition for that link.

Never add the invoked Journey to `subjourneyRefs` to express the invocation. The same Journey may be
a composite child for a separate reason, such as a consent CompositeState that opens the same
settings; invoked occurrences are still not its children. Never model the return as a Transition or
OutgoingTransition back to the source, and never type one node as both classes. Do not list an
InvokingTransition on States of the Journey it invokes unless nested self-invocation is intended.
Mapping does not yet explain invocations, so do not add `explainedByTransitionRef` values pointing at
an InvokingTransition.

## Cross-skill awareness

When Graph modeling touches surface structure, design-system binding, localization metadata, runtime observations, or implementation extensions, consult the generated related-skills reference before continuing.
