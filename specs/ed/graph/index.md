## Overview

This module defines the vocabulary for **intended** user flow. It extends [[UJG Core]] to support structured, interactive graphs with composition via sub-journey references, exported exits from nested journeys, organization tags, and reusable outgoing navigation patterns.

## Terminology

- <dfn>Journey</dfn>: A named container for local traversable user flow topology.
- <dfn>JourneyEntry</dfn>: An explicit entry contract for a [=Journey=].
- <dfn>JourneyEntryIndex</dfn>: A catalogue of addressable [=JourneyEntry=] contracts that does not define traversal.
- <dfn>LocalVertex</dfn>: An abstract local topology vertex of a [=Journey=].
- <dfn>State</dfn>: A discrete node in the experience (e.g., a screen, modal).
- <dfn>State occurrence</dfn>: A concrete experienced occurrence of a [=State=] during traversal.
- <dfn>Transition</dfn>: A structural directed edge between local vertices of a [=Journey=].
- <dfn>CompositeState</dfn>: A state that encapsulates another [=Journey=] (sub-journey).
- <dfn>JourneyExit</dfn>: A terminal local graph vertex and exported completion contract declared by a [=Journey=].
- <dfn>OutgoingTransition</dfn>: A navigational affordance pointing to a next possible [=State=] or [=CompositeState=].
- <dfn>OutgoingTransitionGroup</dfn>: A reusable set of outgoing transitions that a Consumer can treat as present on multiple states (e.g., global nav).

---

## LocalVertex {data-cop-concept="local-vertex"}

A [=LocalVertex=] is the abstract topology node type for the local topology of a [=Journey=].

[=State=] and [=JourneyExit=] are sibling kinds of [=LocalVertex=]. A [=CompositeState=] is a specialized [=State=]. A [=JourneyExit=] is not a [=State=].

<spec-statement>
1. A [=State=] **MUST** be a [=LocalVertex=].
2. A [=CompositeState=] **MUST** be a [=State=].
3. A [=JourneyExit=] **MUST** be a [=LocalVertex=].
4. A [=JourneyExit=] **MUST NOT** be a [=State=].
</spec-statement>

```mermaid
classDiagram
  class LocalVertex
  class State
  class CompositeState
  class JourneyExit

  LocalVertex <|-- State
  State <|-- CompositeState
  LocalVertex <|-- JourneyExit
```

[=LocalVertex=] is abstract. Documents use concrete [=State=], [=CompositeState=], or
[=JourneyExit=] nodes rather than serializing ordinary `LocalVertex` nodes.

---

## State {data-cop-concept="state"}

A [=State=] is the base graph node for a discrete point in an intended user experience, such as a page, screen, modal, or other user-visible step.

Later sections define navigation affordances that can be attached to eligible states. This section defines only the base state node.

<spec-statement>
1. A [=State=] **MUST** be identified by an IRI.
2. A [=State=] **MUST** declare exactly one `label`.
3. A [=State=] **MAY** declare one or more `tags`.
</spec-statement>

```mermaid
classDiagram
  class State {
    id
    label
    tags
    multiInstance
  }
```

Example JSON node:

```json
{
  "@type": "State",
  "@id": "urn:ujg:state:search-form",
  "label": "Search form",
  "tags": [
    "phase:search"
  ]
}
```

### multiInstance {data-cop-concept="multi-instance"}

<spec-statement>
`multiInstance` is optional. If present, it **MUST** be a boolean. Absence of `multiInstance`, or
`multiInstance: false`, means that the [=State=] does not declare multiple concurrent concrete
occurrences.

`multiInstance: true` means that one canonical [=State=] may appear as multiple concrete occurrences
within one active [=Journey=]. It **MUST NOT** define an occurrence count, occurrence IDs, data
source, collection logic, domain entity mapping, query, expression, or rendering behavior.
</spec-statement>

Example multi-instance state:

```json
{
  "@type": "State",
  "@id": "urn:ujg:state:workshop-teaser",
  "label": "Workshop teaser",
  "multiInstance": true
}
```

A Graph with this node still contains one canonical `Workshop teaser` [=State=]. Runtime or
application data may present multiple concrete workshop teaser occurrences.

---

## Transition {data-cop-concept="transition"}

A [=Transition=] is a structural directed edge between local vertices of a [=Journey=]. It models ordinary progression inside the local topology of a [=Journey=].

A [=Transition=] is not owned by either endpoint state. It is owned by a journey through `transitionRefs`.

When a [=Transition=]'s `from` value references a [=State=] with `multiInstance: true`, the same
[=Transition=] applies to each concrete occurrence of that state. The [=Transition=] itself remains
one stable Graph node.

<spec-statement>
1. A [=Transition=] **MUST** be identified by an IRI, declare exactly one `from`, and declare exactly one `to`.
2. A [=Transition=] **MAY** declare one `label`.
3. When listed in a [=Journey=]'s `transitionRefs`, `from` **MUST** reference a [=State=] or [=CompositeState=] in that journey's `stateRefs`.
4. When listed in a [=Journey=]'s `transitionRefs`, `to` **MUST** reference a [=State=] or [=CompositeState=] in that journey's `stateRefs`, or a [=JourneyExit=] in that journey's `exitRefs`.
5. [=Transition=] endpoints **MUST** stay local to the enclosing [=Journey=].
6. `toEntryRef` **MAY** be used only on parent transitions into [=CompositeState=] nodes, as defined by the boundary mapping rules below.
7. A [=Transition=] from a [=State=] with `multiInstance: true` **MUST** remain one Graph node; per-instance transition properties are outside Graph.
</spec-statement>

```mermaid
classDiagram
  class State
  class JourneyExit

  class Transition {
    id
    label
    from
    to
  }

  Transition --> State : from
  Transition --> State : to
  Transition --> JourneyExit : to
```

Example JSON node:

```json
{
  "@type": "Transition",
  "@id": "urn:ujg:transition:search-form-to-results",
  "label": "Submit search",
  "from": "urn:ujg:state:search-form",
  "to": "urn:ujg:state:results"
}
```

Example transition from a multi-instance state:

```json
{
  "@type": "Transition",
  "@id": "urn:ujg:transition:open-workshop",
  "label": "Open workshop",
  "from": "urn:ujg:state:workshop-teaser",
  "to": "urn:ujg:state:workshop-detail"
}
```

The `open-workshop` transition is declared once; it may be taken from any concrete `Workshop teaser`
occurrence.

---

## Journey {data-cop-concept="journey"}

A [=Journey=] is the local container for intended flow topology. It lists the experiential states that belong to the journey, the terminal exits exported by the journey, and, when present, the transitions that connect those local vertices.

Use [=Journey=] when the modeled object owns local traversal, progression, or structural order. If the model only needs to list known entry points into pages, surfaces, flows, or journeys, use [=JourneyEntryIndex=] instead.

<spec-statement>
1. A [=Journey=] **MUST** be identified by an IRI and declare at least one `entryRefs` value and one `stateRefs` value.
2. A [=Journey=] **MAY** declare one `defaultEntryRef`; if present, it **MUST** also appear in `entryRefs`.
3. `entryRefs`, `stateRefs`, `transitionRefs`, `exitRefs`, and `outgoingTransitionGroupRefs` **MUST** reference nodes of the corresponding Graph classes.
4. A [=Journey=]'s local vertices are its `stateRefs` plus its `exitRefs`.
5. `stateRefs` **MUST** describe local experiential topology, not destinations that are merely reachable through [=OutgoingTransition=] navigation.
</spec-statement>

```mermaid
classDiagram
  class Journey {
    id
    label
    defaultEntryRef
    entryRefs
    stateRefs
    transitionRefs
    exitRefs
  }

  class JourneyEntry {
    id
    stateRef
  }

  class State {
    id
    label
  }

  class JourneyExit {
    id
    label
  }

  class Transition {
    id
    from
    to
  }

  Journey --> JourneyEntry : defaultEntryRef
  Journey --> JourneyEntry : entryRefs
  JourneyEntry --> State : stateRef
  Journey --> State : stateRefs
  Journey --> JourneyExit : exitRefs
  Journey --> Transition : transitionRefs
  Transition --> State : from
  Transition --> State : to
  Transition --> JourneyExit : to
```

Example JSON node:

```json
[
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:site-search",
    "label": "Site search",
    "defaultEntryRef": "urn:ujg:entry:site-search-default",
    "entryRefs": [
      "urn:ujg:entry:site-search-default"
    ],
    "stateRefs": [
      "urn:ujg:state:search-form",
      "urn:ujg:state:results"
    ],
    "transitionRefs": [
      "urn:ujg:transition:search-form-to-results"
    ]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:site-search-default",
    "stateRef": "urn:ujg:state:search-form"
  }
]
```

A single-state journey can omit `transitionRefs`:

```json
[
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:privacy-policy",
    "label": "Privacy policy",
    "defaultEntryRef": "urn:ujg:entry:privacy-policy-default",
    "entryRefs": [
      "urn:ujg:entry:privacy-policy-default"
    ],
    "stateRefs": [
      "urn:ujg:state:privacy-policy"
    ]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:privacy-policy-default",
    "stateRef": "urn:ujg:state:privacy-policy"
  }
]
```

A journey can also omit `defaultEntryRef` when no entry is semantically a general fallback. In that
case, entry selection is unresolved by Graph unless an execution or materialization context selects
exactly one listed [=JourneyEntry=].

```json
[
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:workshop-detail",
    "label": "Workshop detail",
    "entryRefs": [
      "urn:ujg:entry:workshop-registration-open",
      "urn:ujg:entry:workshop-waitlist-open",
      "urn:ujg:entry:workshop-registration-closed"
    ],
    "stateRefs": [
      "urn:ujg:state:workshop-registration-open",
      "urn:ujg:state:workshop-waitlist-open",
      "urn:ujg:state:workshop-registration-closed"
    ]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:workshop-registration-open",
    "label": "Registration open",
    "stateRef": "urn:ujg:state:workshop-registration-open"
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:workshop-waitlist-open",
    "label": "Waitlist open",
    "stateRef": "urn:ujg:state:workshop-waitlist-open"
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:workshop-registration-closed",
    "label": "Registration closed",
    "stateRef": "urn:ujg:state:workshop-registration-closed"
  }
]
```

---

## JourneyEntry {data-cop-concept="journey-entry"}

A [=JourneyEntry=] is an explicit entry contract for a [=Journey=]. It identifies the local [=State=] or [=CompositeState=] where traversal begins without making that entry node part of the local transition topology.

<spec-statement>
1. A [=JourneyEntry=] **MUST** be identified by an IRI and declare exactly one `stateRef`.
2. `stateRef` **MUST** reference a [=State=] or [=CompositeState=] listed in the declaring [=Journey=]'s `stateRefs`.
3. A [=JourneyEntry=] **MUST** be listed in exactly one [=Journey=]'s `entryRefs`.
4. A [=JourneyEntry=] **MUST NOT** be used as a [=Transition=] endpoint.
5. A [=JourneyEntry=] **MAY** declare one `label` and one or more `tags`.
</spec-statement>

Top-level traversal of a [=Journey=] begins at an explicitly selected [=JourneyEntry=]. If no
entry is explicitly selected and the [=Journey=] declares `defaultEntryRef`, traversal begins at
the `stateRef` of that default entry. If neither applies, entry selection remains unresolved by
Graph.

When Graph leaves entry selection unresolved, a materialization or execution context may select one
listed entry. Consumers do not infer a default from `entryRefs` order, and contextual entry selection
does not change Graph topology. If no entry can be selected, traversal into that [=Journey=] remains
unresolved; that does not make the Graph invalid.

```mermaid
classDiagram
  class Journey {
    defaultEntryRef
    entryRefs
    stateRefs
  }
  class JourneyEntry {
    id
    stateRef
  }
  class State
  class CompositeState

  Journey --> JourneyEntry : defaultEntryRef
  Journey --> JourneyEntry : entryRefs
  JourneyEntry --> State : stateRef
  JourneyEntry --> CompositeState : stateRef
```

Example JSON node:

```json
{
  "@type": "JourneyEntry",
  "@id": "urn:ujg:entry:site-search-default",
  "label": "Default search entry",
  "stateRef": "urn:ujg:state:search-form"
}
```

---

## JourneyEntryIndex {data-cop-concept="journey-index"}

A [=JourneyEntryIndex=] is a Graph class and Core [=Node=] that acts as a catalogue of addressable [=JourneyEntry=] contracts. It is not a subclass of [=Journey=] and does not define traversal. A Consumer **MUST NOT** infer that indexed entries are reachable from one another, ordered as a path, or part of a parent-owned progression.

Use [=Journey=] when modeling local topology. Use [=JourneyEntryIndex=] when listing known entry points into modeled journeys. A root [=Journey=] should only be used when the root itself owns real traversal, progression, or structural order.

In common use, a [=JourneyEntryIndex=] lists default or named [=JourneyEntry=] contracts for modeled pages, surfaces, flows, or journeys. The referenced entries remain owned by their declaring [=Journey=].

<spec-statement>
1. A [=JourneyEntryIndex=] **MUST** be identified by an IRI and declare at least one `entryRefs` value.
2. Each `entryRefs` value **MUST** reference a [=JourneyEntry=] owned by exactly one [=Journey=].
3. A [=JourneyEntryIndex=] is a catalogue only: it **MUST NOT** own topology, entries, states, transitions, exits, outgoing groups, or child-journey mappings.
4. `entryRefs` on a [=JourneyEntryIndex=] **MUST NOT** imply order, reachability, progression, a user path, or parent continuation.
</spec-statement>

[=JourneyEntryIndex=] is intended for top-level page maps, product surface indexes, search-result target indexes, documentation indexes, entry catalogues, and other collections of known journey entry points. Do not use [=JourneyEntryIndex=] to model page-segment order, local journey progression, child completion, runtime observations, or experience annotations.

```mermaid
classDiagram
  class JourneyEntryIndex {
    id
    label
    entryRefs
  }

  class JourneyEntry {
    stateRef
  }

  class State
  class CompositeState
  JourneyEntryIndex --> JourneyEntry : entryRefs
  JourneyEntry --> State : stateRef
  JourneyEntry --> CompositeState : stateRef
```

Example JSON node:

```json
{
  "@type": "JourneyEntryIndex",
  "@id": "urn:ujg:index:site-pages",
  "label": "Site page index",
  "entryRefs": [
    "urn:ujg:entry:home-page-default",
    "urn:ujg:entry:search-page-default",
    "urn:ujg:entry:profile-page-default"
  ]
}
```

The indexed entries are known entry contracts. Their order above does not define a path from the home page to search to profile.

---

## CompositeState {data-cop-concept="composition"}

A [=CompositeState=] is a [=State=] that represents nested composition. It references a child [=Journey=] through `subjourneyId`, allowing consumers to interpret the referenced journey as a zoomable or nested graph.

The parent journey treats the [=CompositeState=] as a parent-local state. The parent journey does not list the child journey's states directly.

<spec-statement>
1. A [=CompositeState=] **MUST** be a [=State=].
2. A [=CompositeState=] **MUST** declare exactly one `subjourneyId`.
3. The `subjourneyId` value **MUST** resolve to a [=Journey=].
4. A [=CompositeState=] **MUST NOT** list child states directly with `stateRefs`.
</spec-statement>

```mermaid
classDiagram
  class State
  class CompositeState {
    subjourneyId
  }
  class Journey {
    stateRefs
    transitionRefs
  }

  State <|-- CompositeState
  Journey --> CompositeState : stateRefs
  CompositeState --> Journey : subjourneyId
```

Example JSON node:

```json
{
  "@type": "CompositeState",
  "@id": "urn:ujg:state:checkout-flow",
  "label": "Checkout flow",
  "subjourneyId": "urn:ujg:journey:checkout"
}
```

---

## JourneyExit {data-cop-concept="journey-exits"}

A [=JourneyExit=] is a terminal local graph vertex and exported completion contract declared by a [=Journey=]. It represents a terminal journey outcome that can be reached by a local [=Transition=].

A parent journey can use exported exits to distinguish which outcome of a child journey was reached, without directly referencing child states.

<spec-statement>
1. A [=JourneyExit=] **MUST** be identified by an IRI and listed in exactly one [=Journey=]'s `exitRefs`.
2. A [=JourneyExit=] **MAY** declare one `label` and one or more `tags`.
3. A [=JourneyExit=] **MAY** be the `to` endpoint of a [=Transition=] in the declaring [=Journey=].
4. A [=JourneyExit=] is terminal: it **MUST NOT** be a `from` endpoint or expose outgoing affordances.
5. A [=JourneyExit=] **MUST NOT** model runtime facts, submitted values, analytics facts, or ordinary internal child movement.
</spec-statement>

If a completion point is an actual user-visible screen, page, modal, or step, it should remain a normal [=State=]. A journey can then transition from that state to a [=JourneyExit=] that represents the exported terminal outcome.

Informative pattern:

```text
CheckoutForm -> SuccessScreen -> CheckoutCompleteExit
```

```mermaid
classDiagram
  class Journey {
    stateRefs
    exitRefs
  }
  class State
  class JourneyExit
  class Transition

  Journey --> State : stateRefs
  Journey --> JourneyExit : exitRefs
  Transition --> State : from
  Transition --> JourneyExit : to
```

Example JSON nodes:

```json
{
  "@type": "JourneyExit",
  "@id": "urn:ujg:exit:checkout-complete",
  "label": "Checkout complete"
}
```

```json
{
  "@type": "Transition",
  "@id": "urn:ujg:transition:checkout-form-to-complete",
  "label": "Submit checkout",
  "from": "urn:ujg:state:checkout-form",
  "to": "urn:ujg:exit:checkout-complete"
}
```

### Boundary Entry and Exit Mapping {data-cop-concept="boundary-mapping"}

`toEntryRef` and `fromExitRef` are mapping properties on parent [=Transition=] resources. They describe how a parent-local [=CompositeState=] connects to the entry and exit contracts of its child [=Journey=].

These properties are not transition endpoints. The transition's `from` and `to` values remain local to the enclosing journey.

<spec-statement>
1. A [=Transition=] **MAY** declare one `toEntryRef` when its `to` value references a [=CompositeState=].
2. The `to` [=CompositeState=]'s `subjourneyId` **MUST** resolve to a [=Journey=], and `toEntryRef` **MUST** be listed in that journey's `entryRefs`.
3. A [=Transition=] **MAY** declare one `fromExitRef` when its `from` value references a [=CompositeState=].
4. The `from` [=CompositeState=]'s `subjourneyId` **MUST** resolve to a [=Journey=], and `fromExitRef` **MUST** be listed in that journey's `exitRefs`.
5. `toEntryRef` and `fromExitRef` refine child-boundary selection; they **MUST NOT** replace local `from` or `to`, point directly to child states, or create more than one parent continuation for the same child exit.
</spec-statement>

When a Consumer enters a [=CompositeState=], it may interpret the child [=Journey=] named by
`subjourneyId`. Child entry selection uses `toEntryRef` when present, otherwise the child journey's
`defaultEntryRef`, otherwise a materialization or execution context may select exactly one listed
entry. Consumers do not infer a default from `entryRefs` order; unresolved child entry selection does
not make the Graph invalid.

When child traversal reaches a [=JourneyExit=], parent continuation may use only a parent
[=Transition=] whose `from` is the active [=CompositeState=] and whose `fromExitRef` is that child
exit. No matching transition means there is no implicit continuation. More than one matching
transition is invalid.

Use `toEntryRef` when a parent transition must choose a specific child entry. Use [=JourneyExit=]
and `fromExitRef` when a nested journey has multiple explicit child outcomes that the parent
journey needs to distinguish. Do not use [=JourneyExit=] for ordinary transitions inside the child
journey; use normal child [=Transition=] resources for internal child movement.

```mermaid
classDiagram
  class CompositeState {
    subjourneyId
  }
  class Journey {
    defaultEntryRef
    entryRefs
    exitRefs
  }
  class JourneyEntry
  class JourneyExit
  class Transition {
    to
    toEntryRef
    from
    fromExitRef
  }

  CompositeState --> Journey : subjourneyId
  Journey --> JourneyEntry : defaultEntryRef
  Journey --> JourneyEntry : entryRefs
  Journey --> JourneyExit : exitRefs
  Transition --> CompositeState : to/from
  Transition --> JourneyEntry : toEntryRef
  Transition --> JourneyExit : fromExitRef
```

Example child entry selection:

```json
{
  "@type": "Transition",
  "@id": "urn:ujg:transition:password-to-mfa",
  "label": "Require MFA",
  "from": "urn:ujg:state:password-check",
  "to": "urn:ujg:state:mfa-challenge",
  "toEntryRef": "urn:ujg:entry:mfa-code-entry"
}
```

`urn:ujg:state:mfa-challenge` is the parent-local [=CompositeState=]. The selected
`toEntryRef` **MUST** be listed in the child MFA journey's `entryRefs`.

Example parent continuation after a child exit:

```json
{
  "@type": "Transition",
  "@id": "urn:ujg:transition:checkout-to-confirmation",
  "label": "Show confirmation",
  "from": "urn:ujg:state:checkout-flow",
  "to": "urn:ujg:state:confirmation",
  "fromExitRef": "urn:ujg:exit:checkout-complete"
}
```

---

## OutgoingTransition {data-cop-concept="outgoing-transition"}

An [=OutgoingTransition=] is a navigational affordance. It defines a possible effective target state but does not declare a structural transition in a journey's local topology.

An [=OutgoingTransition=] has no explicit `from` property. Its effective source comes from either a state-scoped `outgoingTransitionRefs` value or an injected [=OutgoingTransitionGroup=].

<spec-statement>
1. An [=OutgoingTransition=] **MUST** be identified by an IRI and **MAY** declare one `label`.
2. An [=OutgoingTransition=] **MUST** use exactly one target mechanism: one `to` value, or `toCurrentState: true`.
3. `to` **MAY** reference a resolvable [=State=] or [=CompositeState=], including one outside the journey that contributes the affordance.
4. `toCurrentState: false` is equivalent to absence and does not satisfy the target requirement.
5. An [=OutgoingTransition=] is a navigational affordance, not local topology: it **MUST NOT** target a [=JourneyExit=], appear in `transitionRefs`, or model ordinary internal progression.
</spec-statement>

If the `to` target belongs to a known page, surface, or flow entry, that entry should normally be listed in a [=JourneyEntryIndex=]. Do not list the target state in the source [=Journey=]'s `stateRefs` unless it also belongs to the source journey's local topology.

```mermaid
classDiagram
  class OutgoingTransition {
    to
    toCurrentState
  }
  class State
  class CompositeState

  OutgoingTransition --> State : fixed target
  OutgoingTransition --> CompositeState : fixed target
  OutgoingTransition --> State : current-state target
  OutgoingTransition --> CompositeState : current-state target
  note for OutgoingTransition "target mechanism is either to or toCurrentState"
```

Example JSON nodes:

Fixed target navigation:

```json
{
  "@type": "OutgoingTransition",
  "@id": "urn:ujg:ot:go-home",
  "label": "Home",
  "to": "urn:ujg:state:home"
}
```

### Relative Current-State Targeting

Use `toCurrentState: true` for affordances that keep the current graph state while changing a
non-topological dimension such as locale, presentation mode, or filter context. The target resolves
to the [=State=] or [=CompositeState=] where the affordance is available.

`toCurrentState` changes only Graph target resolution. It does not define runtime events, URLs,
payloads, locale metadata, or private extension behavior.


Current-state targeting:

```json
{
  "@type": "OutgoingTransition",
  "@id": "urn:ujg:ot:keep-current-state",
  "label": "Keep current state",
  "toCurrentState": true
}
```

---

## OutgoingTransitionGroup {data-cop-concept="outgoing-transition-group"}

An [=OutgoingTransitionGroup=] defines a reusable set of outgoing affordances, such as header or footer navigation, that a Consumer can treat as present on multiple eligible states.

Group injection does not add structural [=Transition=] resources to `transitionRefs`.

<spec-statement>
1. An [=OutgoingTransitionGroup=] **MUST** be identified by an IRI and declare at least one `outgoingTransitionRefs` value.
2. Each `outgoingTransitionRefs` value **MUST** reference an [=OutgoingTransition=].
3. A [=Journey=] **MAY** attach a group through `outgoingTransitionGroupRefs`.
4. A journey-level group applies each referenced [=OutgoingTransition=] to each [=State=] or [=CompositeState=] in the journey's `stateRefs`.
5. `toCurrentState: true` resolves at the state where the group is applied; groups **MUST NOT** create outgoing affordances from [=JourneyExit=] nodes.
</spec-statement>

Consumers **SHOULD** treat duplicate effective outgoing edges with the same source and target as one
effective edge.

```mermaid
classDiagram
  class Journey {
    outgoingTransitionGroupRefs
  }
  class OutgoingTransitionGroup {
    outgoingTransitionRefs
  }
  class OutgoingTransition {
    to
    toCurrentState
  }
  class State
  class CompositeState

  Journey --> OutgoingTransitionGroup : outgoingTransitionGroupRefs
  OutgoingTransitionGroup --> OutgoingTransition : outgoingTransitionRefs
  OutgoingTransition --> State : effective target
  OutgoingTransition --> CompositeState : effective target
  note for OutgoingTransition "target mechanism is either to or toCurrentState"
```

Example JSON node:

```json
{
  "@type": "OutgoingTransitionGroup",
  "@id": "urn:ujg:otg:global-header",
  "outgoingTransitionRefs": [
    "urn:ujg:ot:go-home",
    "urn:ujg:ot:go-profile"
  ]
}
```

## State-scoped Outgoing Affordances {data-cop-concept="state-scoped-outgoing"}

A [=State=] can also declare outgoing affordances directly. These affordances apply only to that state and are not injected into other states.

Direct state-scoped affordances are for local navigational options, not for ordinary internal progression through a journey.

<spec-statement>
1. A [=State=] **MAY** declare `outgoingTransitionRefs`.
2. Each state-scoped `outgoingTransitionRefs` value **MUST** reference an [=OutgoingTransition=].
3. The declaring [=State=] is the effective source of the referenced [=OutgoingTransition=].
4. `toCurrentState: true` resolves to the declaring [=State=].
5. State-scoped outgoing affordances are not members of the enclosing [=Journey=]'s `transitionRefs`.
</spec-statement>

Only ordinary [=State=] nodes declare state-scoped outgoing affordances. If navigation should be
available while a [=CompositeState=] is active, model it as an [=OutgoingTransitionGroup=] on the
enclosing journey or as direct `outgoingTransitionRefs` on states inside the child journey.

```mermaid
classDiagram
  class State {
    outgoingTransitionRefs
  }
  class CompositeState
  class JourneyExit
  class OutgoingTransition {
    to
    toCurrentState
  }

  State --> OutgoingTransition : outgoingTransitionRefs
  OutgoingTransition --> State : effective target
  OutgoingTransition --> CompositeState : effective target
  note for OutgoingTransition "target mechanism is either to or toCurrentState"
```

Example JSON nodes:

```json
{
  "@type": "State",
  "@id": "urn:ujg:state:w3c-searchpage-form",
  "label": "Search form",
  "outgoingTransitionRefs": [
    "urn:ujg:ot:w3c-searchpage-form-back-home"
  ]
}
```

```json
{
  "@type": "OutgoingTransition",
  "@id": "urn:ujg:ot:w3c-searchpage-form-back-home",
  "label": "Back to home page",
  "to": "urn:ujg:state:w3c-root-homepage"
}
```

This is a local "Back to home page" navigation affordance, not an internal [=Transition=]. Its `to`
target can be outside the current journey's `stateRefs`.

---


## Normative Artifacts

This module is published through the following artifacts:

- `graph.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/graph`
- `graph.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld`
- `graph.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/graph.shape`

Examples on this page use compact JSON-LD fragments. Complete documents can use the aggregate
context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`, which preserves Graph's compact
`stateRef` term for [=JourneyEntry=].

### Ontology {data-cop-concept="ontology"}

The normative Graph ontology is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/graph`. It is the authoritative structural definition for Graph classes and properties, including `Journey`, `JourneyEntry`, `JourneyEntryIndex`, `LocalVertex`, `State`, `CompositeState`, `Transition`, `JourneyExit`, `OutgoingTransition`, `OutgoingTransitionGroup`, `defaultEntryRef`, `entryRefs`, `stateRef`, `exitRefs`, `toEntryRef`, `fromExitRef`, `multiInstance`, `toCurrentState`, and `outgoingTransitionRefs`.

:::include ./graph.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Graph JSON-LD context is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld`. It provides the compact JSON-LD term mappings for the Graph vocabulary used by the examples on this page.

:::include ./graph.context.jsonld :::

---

### Validation {data-cop-concept="validation"}

The normative Graph SHACL shape is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/graph.shape`. It is the authoritative validation artifact for Graph structural constraints.

:::include ./graph.shape.ttl :::

---

## Graph Integrity and Resolution {data-cop-concept="graph-integrity"}

The rules below define additional graph integrity and resolution behavior beyond the structural constraints captured by the SHACL shape.

<spec-statement>
To ensure graph integrity, the following constraints **MUST** be met:

1. Every Graph reference **MUST** resolve within the current scope or imported modules.
2. References **MUST** resolve to the class expected by the property that uses them.
3. Local [=Transition=] endpoints **MUST** stay inside the declaring [=Journey=]'s local vertex set.
4. `toEntryRef` and `fromExitRef` **MUST** resolve through the child [=Journey=] named by the relevant [=CompositeState=]'s `subjourneyId`.
5. Each [=OutgoingTransition=] **MUST** resolve to exactly one target mechanism: fixed `to` or `toCurrentState: true`.
</spec-statement>
