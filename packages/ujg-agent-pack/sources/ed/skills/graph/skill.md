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
- `AdjacentTransition`
- `Command`
- `JourneyExit`
- `OutgoingTransition`
- `InvokingTransition`
- `StateCollection`
- `EntrySelector`

Keep runtime observations, selectors, typed values, timestamps, payloads, and analytics outside Graph.

## Modeling rules

Prefer the shallowest valid graph.

Use `JourneyEntryIndex` for catalogues, product-surface indexes, documentation indexes, or collections of known `JourneyEntry` contracts. Do not use it as a traversable journey.

Use `Journey` only for local traversable topology. A journey must have an IRI `@id`, at least one `entries` value, and at least one `states` value. It may have at most one `defaultEntry`. Its local vertices are `states` union `exits`.

Do not infer a default entry from `entries` ordering. If no entry is explicitly selected and no `defaultEntry` exists, entry selection remains unresolved by Graph and must be resolved externally by materialization or execution context. Graph does not define predicates, application-state expressions, domain-state mappings, or evaluation rules for contextual entry resolution.

Use `JourneyEntry` for explicit journey entry contracts. Each entry must have exactly one `state` that points to a `State` or `CompositeState` in the same journey's `states`. A `JourneyEntry` is not a transition endpoint.

Use ordinary `State` and local `Transition` for stable conditions on the same page, route, surface, modal, panel, or screen.

Use `Command` only for stable semantic identity of an intentional invocation in the modeled
experience. A `Command` is not a transition endpoint, does not replace `Transition` or
`OutgoingTransition`, and does not define source state, destination state, branching, condition
resolution, effect execution, visual representation, runtime execution, or execution results.

Use `CompositeState` to nest journeys: a step of a parent journey that is itself a journey, with its
own steps, entries, and exits. `subjourneys` is a set of child `Journey` IRIs and must contain at
least one value. Do not use the legacy singular child-journey field in ED JSON-LD.

`CompositeState` is a local vertex but not a `State`, and must not be typed as one. It needs an IRI
`@id` and exactly one `label`, and it never declares `states` or `entryTransitions`. It can be
listed in `states`, be a `Transition` or `AdjacentTransition` endpoint, and be a
`JourneyEntry.state` target. While it
is current, the user is at the current `State` of each child journey, and those States offer the
entry transitions.

When a `CompositeState` nests several child journeys, they must be co-present and independent: the
user can perceive and act on each at the same time in the same experience frame (a viewport,
window, screen, or dialog session), and a movement in one never moves another. Co-presence alone is
not enough: parts that are co-present but not independent belong to one journey. A `CompositeState`
may have a single child journey, and several composites may reference the same Journey, so shared
topology and the entry transitions its States list can be declared once and reused, for example a
sticky header beside page content, or a site-wide footer Journey referenced by a one-child footer
composite on each page. A State and a CompositeState belong to exactly one Journey; reuse happens
through Journeys.

`subjourneys` order does not define traversal order, priority, causality, scheduling,
synchronization, fork/join, all-children-complete behavior, or hidden graph edges.

On a parent `Transition` into a `CompositeState`, use `toEntry` only to select a specific child
`JourneyEntry`. The entry must belong to exactly one child journey referenced by that composite's
`subjourneys`; in this use `toEntry` remains a singular boundary refinement, not an endpoint or
a set of entries. Otherwise child entry selection uses the relevant child journey's
`defaultEntry` when one exists, or remains unresolved by Graph and must be resolved externally by
materialization or execution context. Do not infer a child entry from `entries` ordering or
`subjourneys` ordering.

Use `JourneyExit` for a terminal outcome that a Journey exports to an enclosing composite or to an
invoker. A parent reaction is optional: an exit that no parent reacts to is valid. Use `fromExit`
only where a parent reacts to a specific outcome. Model the outcome as a direct terminal
`JourneyExit`, not as a pseudo-state.

A child `JourneyExit` does not leave the containing `CompositeState` occurrence by itself. The
composite stays current, and sibling child journeys stay in scope, until the occurrence is left,
normally by a parent `Transition` whose `fromExit` is that exit. Reaching the exit takes that
Transition, and it is never taken before the exit is reached. With no such Transition the child is
simply complete, so a consent or banner journey can end while the page journey beside it continues.
A child exit does not complete sibling child journeys, synchronize them, or imply collective
composite completion. An occurrence of the same Journey entered through an `InvokingTransition` is
not a composite child; its exits complete the invocation.

The `fromExit` value must belong to exactly one child journey referenced by the source
composite's `subjourneys` and remains singular.

Use `Transition` between local vertices. `from` must be in the enclosing journey's `states`; `to` must be in the enclosing journey's `states` or `exits`. Never use `JourneyExit` as `from`.
Do not create transitions between child journeys unless both endpoints are local vertices of the same
owning journey. Parent transitions may enter a `CompositeState` or continue after a matching child
exit, but they must not target child states directly.
Use `command` only when the transition is associated with invoking a stable `Command`. Multiple
transitions may share one `command`; that shared command identity does not define branching,
selection, ordering, or resolution semantics.

When a transition's `from` references a `State` with multiple concrete occurrences, traverse the one
stable transition from a concrete occurrence of that state. Do not add transition properties such as
`perInstance`, `perSourceInstance`, `perTargetInstance`, or `repeatableTransition`.

Use `StateCollection` when one `State` or `CompositeState` stands for many similar parts that the
user moves between, such as rows, cards, or slides. Every member offers what the member State offers.
Do not declare one State per part. `memberState` names that State or CompositeState, the member State; it must be in a
Journey's `states`, and it has at most one collection, declared in the same source document.
`memberTransitions` lists one or more member transitions that move from one member to another:
an `AdjacentTransition` for crossing the border to a neighboring member, or a `Transition`, typically
with `command`, for a move such as "Next item". Each member transition has the member State as
both `from` and `to`, is listed only by the collection, and is never in a Journey's
`transitions`. Like any Transition, it leaves the member it starts from and enters another
member; the user moves between members only this way. The Graph
never names either member; Mapping binds them from the observed SurfaceInstances. A self-loop
Transition on the member State in `transitions` leaves and re-enters the member where it is taken. Taking a Transition from the member State to another vertex leaves the collection. When each
part has its own steps, use a CompositeState member State: each member then has
its own child Journey occurrences, and a member Transition may use `toEntry` or `fromExit` of
those child Journeys. Do not encode order, item keys, data, or presentation in the collection.
Self-check: use a collection only when one State or CompositeState describes every part; a part
that needs its own description is its own State or Journey. A part that differs only in which entry
one of its entry transitions enters is still a member; give that transition an `EntrySelector`.

Use `AdjacentTransition` between two local vertices of the same journey that sit next to each other
in one experience frame and share a border. One AdjacentTransition describes crossing that border in
both directions. Name the vertex before the border `from` and the vertex after it `to`, in reading
order, and list it in the journey's `transitions`. Both endpoints must be a `State` or
`CompositeState` in that journey's `states`, never a `JourneyExit`, and they must differ. The one
exception is a member AdjacentTransition between neighboring members of a `StateCollection`: the
collection lists it in `memberTransitions`, and both endpoints are its member State. It never
declares `command`, `toEntry`, `fromExit`, `condition`, or `effect`. Model a movement
that has its own command, guard, effect, or child-entry selection as a separate `Transition`, even
between the same vertices; do not add a plain `Transition` that repeats one direction of the
adjacency. Adjacent vertices are not co-present: only one of them is current at a time.
Self-check: use an AdjacentTransition only when both vertices belong to one frame, share a border,
and the user can move between them in either direction without a command, guard, or effect.

Use `OutgoingTransition` for ordinary navigation affordances. Every `OutgoingTransition` declares
exactly one destination: `toEntry` to a `JourneyEntry` owned by exactly one Journey, or
`entrySelector` when the entry is selected each time it is taken (see below). Resolve a fixed
destination as `toEntry -> JourneyEntry.state`; never put `to` on an OutgoingTransition or
reference a destination State directly. The entry may belong to the source Journey, including when
it points to the same State; that is explicit Journey re-entry rather than an implicit current-state
target. Several States may list the same OutgoingTransition; it keeps the same destination, its
fixed `toEntry` or its `EntrySelector`, at every one of them. Never reinterpret that target
relative to the source. Share a transition only when the
fixed destination entry is correct from each State; when the destination must preserve one of
several active States, define a separate OutgoingTransition and matching JourneyEntry for each State.
Use `command` on an `OutgoingTransition` only when the outgoing affordance has stable intentional
invocation identity.

Use `entrySelector` instead of `toEntry` when the entry an `OutgoingTransition` or
`InvokingTransition` enters differs between occurrences of the State that lists it, for example
between the members of a `StateCollection` whose rows open different pages. The transition
references an `EntrySelector`; the Graph never names the selected entry, which is known only when the
transition is taken. Decide by where the destination varies:
- the same entry at every occurrence, with only the shown content differing: `toEntry`;
- a different entry depending on which State lists the affordance: separate source-specific entry
  transitions, never a selector;
- a different entry between occurrences of the same State: `entrySelector`.
List the possible destination Journeys in the selector's `candidateJourneys` whenever they are
known; it is optional, and without it any Journey's entry may be selected, but candidates keep
Mapping able to report drift. Candidates belong to the selector: when an `InvokingTransition`
references it, every candidate Journey must declare `exits`, and a selected entry whose Journey
has no exits cannot be invoked. A selection that resolves to no `JourneyEntry` enters nothing; never
treat an arbitrary address as an entry. The selector adds no States, Transitions, or entries, carries
no `command` (put it on the transition), and does not encode how candidates are listed, ranked,
or loaded. A locale switch with `targetLocale` always uses `toEntry`.
Self-check: use a selector only when the destination entry differs between occurrences of the same
State; if every occurrence enters the same entry, keep `toEntry`.

`OutgoingTransition` and `InvokingTransition` are both entry transitions. Only a State lists them,
in `entryTransitions`; neither class declares `from`, `fromExit`, or `entryTransitions`. A
CompositeState and a Journey never declare them, and an entry transition is never inherited by
nested States. A State or CompositeState must not be listed in the `states` of more than one
Journey. To reuse topology, reuse the Journey: reference it from several CompositeStates'
`subjourneys` or enter it through an `OutgoingTransition` or `InvokingTransition`.

Use `InvokingTransition` instead of `OutgoingTransition` when the affordance opens another Journey
and the user returns to the same source State when that Journey exits, such as a settings dialog
opened from a page. It has the same shape as an OutgoingTransition: exactly one destination,
`toEntry` or `entrySelector`, optional `command`, no `to`, never in `transitions`, and
it attaches through the same `entryTransitions` on a State. One State may list both classes.
The Journey that owns its destination entry must declare at least one `exits` value. Reaching any
of that Journey's own exits resumes the source State. While the invocation runs, the source is
suspended: nothing listed on it is offered through it, so those entry transitions are not available
inside the invoked Journey unless that Journey's own States list them. Leaving
it any other way cancels the invocation without a return, and that includes any OutgoingTransition
taken inside it, even one that re-enters the same Journey. Cancellation leaves the retained source as
well, and cancels any enclosing invocation in turn. If the source is left first, the invocation is
cancelled too; a sibling child Journey reaching an exit does not leave the source. So a link inside
an invoked Journey never returns to the source; if the user must come back after following it,
model a separate InvokingTransition for that link.

Never add the invoked Journey to `subjourneys` to express the invocation. The same Journey may be
a composite child for a separate reason, such as a consent CompositeState that opens the same
settings; invoked occurrences are still not its children. Never model the return as a Transition or
OutgoingTransition back to the source, and never type one node as both classes. Do not list an
InvokingTransition on States of the Journey it invokes unless nested self-invocation is intended.
Mapping does not yet explain invocations, so do not add `explainedByTransition` values pointing at
an InvokingTransition.

## Cross-skill awareness

When Graph modeling touches surface structure, design-system binding, localization metadata, runtime observations, or implementation extensions, consult the generated related-skills reference before continuing.

## Current ED authoring and source scope

Use the current canonical property names and matching vocabulary IRIs. Retired terms are not
aliases. Prefer nested YAML-LD; accept flat or nested JSON-LD and YAML-LD under the same module
semantics. Do not change instance identity when changing serialization or filenames.

Resolve imports against each source location independently of `@base`; ordinary node identities
and references follow standard JSON-LD base rules. Unknown JSON payloads remain opaque.

Consult `references/authoring-terms.json` for canonical mappings and
`references/specs/authoring/index.md` with its accompanying YAML fixtures for the complete style.
