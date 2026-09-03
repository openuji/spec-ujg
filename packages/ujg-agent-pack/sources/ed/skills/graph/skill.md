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
- `LocalVertex`
- `State`
- `CompositeState`
- `Transition`
- `Command`
- `JourneyExit`
- `OutgoingTransition`
- `OutgoingTransitionGroup`

Keep runtime observations, selectors, typed values, timestamps, payloads, and analytics outside Graph.

Use `State.multiInstance` only when one canonical `State` may have multiple concurrently
addressable concrete occurrences within one active occurrence of its enclosing `Journey`.
`multiInstance` is optional, boolean, and defaults semantically to false when absent.

Do not use `multiInstance` to encode occurrence counts, instance keys, data sources, collection
iteration, domain entities, queries, expressions, or rendering behavior.

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

Use `CompositeState` only when a parent journey contains or exposes a nested journey with `subjourneyId`.

Use `toEntryRef` only when a parent transition into a `CompositeState` must select a specific child `JourneyEntry`. Otherwise the child journey starts at its `defaultEntryRef` when one exists. If neither `toEntryRef` nor child `defaultEntryRef` exists, the child entry remains unresolved by Graph and must be resolved externally by materialization or execution context. Do not infer a child entry from `entryRefs` ordering.

Use `JourneyExit` and `fromExitRef` only for exported child outcomes that a parent genuinely reacts to. Model the child outcome as a direct terminal `JourneyExit`, not as a pseudo-state.

Use `Transition` between local vertices. `from` must be in the enclosing journey's `stateRefs`; `to` must be in the enclosing journey's `stateRefs` or `exitRefs`. Never use `JourneyExit` as `from`.
Use `commandRef` only when the transition is associated with invoking a stable `Command`. Multiple
transitions may share one `commandRef`; that shared command identity does not define branching,
selection, ordering, or resolution semantics.

When a transition's `from` references a multi-instance `State`, traverse the one stable transition
from a concrete occurrence of that state. Do not add transition properties such as `perInstance`,
`perSourceInstance`, `perTargetInstance`, or `repeatableTransition`.

Use `OutgoingTransition` for ordinary navigation affordances. Use `toCurrentState: true` only when the effective graph state is preserved and only a non-topological dimension changes.
Use `commandRef` on an `OutgoingTransition` only when the outgoing affordance has stable intentional
invocation identity.

## Cross-skill awareness

When Graph modeling touches surface structure, design-system binding, localization metadata, runtime observations, or implementation extensions, consult the generated related-skills reference before continuing.
