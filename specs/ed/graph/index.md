## Overview

This module defines the vocabulary for **intended** user flow. It extends [[UJG Core]] to support structured, interactive graphs with composition via sub-journey references, exported exits from nested journeys, organization tags, and reusable outgoing navigation patterns.

## Normative Artifacts

This module is published through the following artifacts:

- `graph.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/graph`
- `graph.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld`
- `graph.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/graph.shape`

Examples in this page use an explicit context array composed from the published module contexts. The same composition is also published as the convenience context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`.

## Terminology

- <dfn>Journey</dfn>: A named container for local traversable user flow topology.
- <dfn>JourneyIndex</dfn>: A catalogue of addressable journey entry states that does not define traversal.
- <dfn>State</dfn>: A discrete node in the experience (e.g., a screen, modal).
- <dfn>Transition</dfn>: A directed edge between two states.
- <dfn>CompositeState</dfn>: A state that encapsulates another [=Journey=] (sub-journey).
- <dfn>BoundaryState</dfn>: A terminal [=State=] that represents an exported outcome of a [=Journey=].
- <dfn>JourneyExit</dfn>: An exported boundary contract declared by a [=Journey=].
- <dfn>OutgoingTransition</dfn>: A navigational affordance pointing to a next possible [=State=] or [=CompositeState=].
- <dfn>OutgoingTransitionGroup</dfn>: A reusable set of outgoing transitions that a Consumer can treat as present on multiple states (e.g., global nav).

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
  }
```

Example JSON node:

```json
{
  "@type": "State",
  "@id": "urn:ujg:state:search-form",
  "label": "Search form",
  "tags": ["phase:search"]
}
```

---

## Transition {data-cop-concept="transition"}

A [=Transition=] is a structural directed edge between graph states. It models ordinary progression inside the local topology of a [=Journey=].

A [=Transition=] is not owned by either endpoint state. It is owned by a journey through `transitionRefs`.

<spec-statement>
1. A [=Transition=] **MUST** be identified by an IRI.
2. A [=Transition=] **MUST** declare exactly one `from` value.
3. A [=Transition=] **MUST** declare exactly one `to` value.
4. The `from` and `to` values of a [=Transition=] **MUST** reference a [=State=] or a valid [=State=] subclass defined by this module.
5. A [=Transition=] listed in a [=Journey=]'s `transitionRefs` **MUST** have `from` and `to` values listed in that same journey's `stateRefs`.
6. A [=Transition=] **MUST NOT** use `from` or `to` to reference states belonging to another journey.
7. A [=Transition=] **MUST NOT** declare more than one `label`.
</spec-statement>

```mermaid
classDiagram
  class State {
    id
    label
  }

  class Transition {
    id
    label
    from
    to
  }

  Transition --> State : from
  Transition --> State : to
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

---

## Journey {data-cop-concept="journey"}

A [=Journey=] is the local container for intended flow topology. It lists the states that belong to the journey and, when present, the transitions that connect those states.

Use [=Journey=] when the modeled object owns local traversal, progression, or structural order. If the model only needs to list known entry points into pages, surfaces, flows, or journeys, use [=JourneyIndex=] instead.

<spec-statement>
1. A [=Journey=] **MUST** be identified by an IRI.
2. A [=Journey=] **MUST** declare exactly one `startStateRef`.
3. A [=Journey=] **MUST** declare at least one `stateRefs` value.
4. A [=Journey=] **MAY** declare `transitionRefs`.
5. Each `stateRefs` value **MUST** reference a [=State=] or a valid [=State=] subclass defined by this module.
6. If present, each `transitionRefs` value **MUST** reference a [=Transition=].
7. A [=Journey=] **MUST** contain one or more [=State|States=] and **MAY** connect those states with [=Transition|Transitions=].
8. Every `stateRefs` value of a [=Journey=] **SHOULD** belong to that journey's local topology.
9. A state belongs to a journey when it is the `startStateRef`, a `from` or `to` endpoint of a transition listed in that journey's `transitionRefs`, an exported boundary state referenced by a local [=JourneyExit=], or a local observable segment or condition connected by the journey's structural order.
10. A [=Journey=] **MUST NOT** list a linked destination page, surface, flow, or journey entry inside `stateRefs` merely because an [=OutgoingTransition=] can reach it.
</spec-statement>

```mermaid
classDiagram
  class Journey {
    id
    label
    startStateRef
    stateRefs
    transitionRefs
  }

  class State {
    id
    label
  }

  class Transition {
    id
    from
    to
  }

  Journey --> State : startStateRef
  Journey --> State : stateRefs
  Journey --> Transition : transitionRefs
  Transition --> State : from
  Transition --> State : to
```

Example JSON node:

```json
{
  "@type": "Journey",
  "@id": "urn:ujg:journey:site-search",
  "label": "Site search",
  "startStateRef": "urn:ujg:state:search-form",
  "stateRefs": [
    "urn:ujg:state:search-form",
    "urn:ujg:state:results"
  ],
  "transitionRefs": [
    "urn:ujg:transition:search-form-to-results"
  ]
}
```

A single-state journey can omit `transitionRefs`:

```json
{
  "@type": "Journey",
  "@id": "urn:ujg:journey:privacy-policy",
  "label": "Privacy policy",
  "startStateRef": "urn:ujg:state:privacy-policy",
  "stateRefs": [
    "urn:ujg:state:privacy-policy"
  ]
}
```

---

## JourneyIndex {data-cop-concept="journey-index"}

A [=JourneyIndex=] is a Graph class and Core [=Node=] that acts as a catalogue of addressable journey entry states. It is not a subclass of [=Journey=] and does not define traversal. A Consumer **MUST NOT** infer that indexed states are reachable from one another, ordered as a path, or part of a parent-owned progression.

Use [=Journey=] when modeling local topology. Use [=JourneyIndex=] when listing known entry points into modeled journeys. A root [=Journey=] should only be used when the root itself owns real traversal, progression, or structural order.

In common use, a [=JourneyIndex=] lists [=CompositeState=] entries whose `subjourneyId` values point to modeled pages, surfaces, flows, or journeys.

<spec-statement>
1. A [=JourneyIndex=] **MUST** be identified by an IRI.
2. A [=JourneyIndex=] **MUST** declare at least one `stateRefs` value.
3. Each `stateRefs` value **MUST** reference a resolvable [=State=] or [=CompositeState=].
4. Each referenced state **MUST** be a top-level node in the same document or resolvable through imports.
5. Each referenced state **SHOULD** be a [=CompositeState=] when it represents a page, surface, or nested journey entry.
6. A [=JourneyIndex=] **MUST NOT** reference a [=BoundaryState=] in `stateRefs`.
7. A [=JourneyIndex=] **MUST NOT** declare `startStateRef`.
8. A [=JourneyIndex=] **MUST NOT** declare `transitionRefs`.
9. A [=JourneyIndex=] **MUST NOT** declare `exitRefs`.
10. A [=JourneyIndex=] **MUST NOT** declare `outgoingTransitionGroupRefs`.
11. A [=JourneyIndex=] **MUST NOT** declare `from`.
12. A [=JourneyIndex=] **MUST NOT** declare `to`.
13. A [=JourneyIndex=] **MUST NOT** declare `fromExitRef`.
14. A [=JourneyIndex=] **MUST NOT** declare `subjourneyId`.
15. A [=JourneyIndex=] **MUST NOT** declare `exitStateRef`.
16. A [=JourneyIndex=] **MUST NOT** declare `outgoingTransitionRefs`.
17. `stateRefs` on a [=JourneyIndex=] **MUST NOT** imply traversal order, reachability, user path, progression, or parent continuation.
18. The order of values in `stateRefs` **MUST NOT** be interpreted normatively unless a future ordering mechanism is explicitly added.
</spec-statement>

[=JourneyIndex=] is intended for top-level page maps, product surface indexes, search-result target indexes, documentation indexes, route or catalogue manifests, and other collections of known journey entry points. Do not use [=JourneyIndex=] to model page-segment order, local journey progression, child completion, runtime observations, or experience annotations.

```mermaid
classDiagram
  class JourneyIndex {
    id
    label
    stateRefs
  }

  class State {
    id
    label
  }

  class CompositeState {
    subjourneyId
  }

  JourneyIndex --> State : stateRefs
  JourneyIndex --> CompositeState : stateRefs
  CompositeState --> Journey : subjourneyId
```

Example JSON node:

```json
{
  "@type": "JourneyIndex",
  "@id": "urn:ujg:index:site-pages",
  "label": "Site page index",
  "stateRefs": [
    "urn:ujg:state:home-page",
    "urn:ujg:state:search-page",
    "urn:ujg:state:profile-page"
  ]
}
```

The indexed states are known entry points. Their order above does not define a path from the home page to search to profile.

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

## BoundaryState {data-cop-concept="boundary-state"}

A [=BoundaryState=] is a terminal [=State=] that represents an exported outcome of a journey. A nested journey uses boundary states to expose completed outcomes to a parent journey through [=JourneyExit=].

Boundary states remain local states of the journey that declares them.

<spec-statement>
1. A [=BoundaryState=] **MUST** be a [=State=].
2. A [=BoundaryState=] **MUST NOT** also be a [=CompositeState=].
3. A [=BoundaryState=] **MUST NOT** declare `subjourneyId`.
4. A [=BoundaryState=] **MUST NOT** declare `outgoingTransitionRefs`.
5. A [=BoundaryState=] listed in a [=Journey=]'s `stateRefs` **MUST NOT** be used as the `from` value of another [=Transition=] listed in that same journey's `transitionRefs`.
6. Outgoing transition group injection **MUST NOT** create effective outgoing transitions from a [=BoundaryState=].
</spec-statement>

Informative visualization:

```mermaid
classDiagram
  class State
  class BoundaryState
  class Journey {
    stateRefs
  }
  class Transition {
    from
    to
  }

  State <|-- BoundaryState
  Journey --> BoundaryState : stateRefs
  Transition --> BoundaryState : to
```

Example JSON node:

```json
{
  "@type": "BoundaryState",
  "@id": "urn:ujg:state:checkout-complete",
  "label": "Checkout complete",
  "tags": ["outcome:success"]
}
```

---

## JourneyExit {data-cop-concept="journey-exits"}

A [=JourneyExit=] is an exported boundary contract declared by a [=Journey=]. It identifies one local [=BoundaryState=] using `exitStateRef`.

A parent journey can use exported exits to distinguish which outcome of a child journey was reached, without directly referencing child states.

<spec-statement>
1. A [=Journey=] **MAY** declare `exitRefs`.
2. Each value of `exitRefs` **MUST** reference a [=JourneyExit=].
3. A [=JourneyExit=] **MUST** declare exactly one `exitStateRef`.
4. The `exitStateRef` of a [=JourneyExit=] declared by a journey **MUST** reference a [=BoundaryState=] listed in that same journey's `stateRefs`.
5. A [=JourneyExit=] `exitStateRef` **MUST NOT** reference a [=CompositeState=].
6. A [=JourneyExit=] **MUST** be declared by no more than one [=Journey=].
7. A [=Journey=] **MUST NOT** list more than one [=JourneyExit=] with the same `exitStateRef`.
8. A [=JourneyExit=] **MUST NOT** be used for ordinary internal child transitions.
9. Runtime observations, user actions, form values, clicked elements, submitted values, selected values, analytics facts, or other runtime facts **MUST NOT** be modeled in the Graph module through [=JourneyExit=].
</spec-statement>

If a [=CompositeState=] completes and needs to export an outcome upward, the declaring journey SHOULD transition to a local [=BoundaryState=], and the [=JourneyExit=] SHOULD reference that [=BoundaryState=].

```mermaid
classDiagram
  class Journey {
    stateRefs
    exitRefs
  }
  class BoundaryState
  class JourneyExit {
    exitStateRef
  }

  Journey --> BoundaryState : stateRefs
  Journey --> JourneyExit : exitRefs
  JourneyExit --> BoundaryState : exitStateRef
```

Example JSON graph:

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
  "@id": "https://example.com/ujg/checkout-exit.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:checkout",
      "label": "Checkout journey",
      "startStateRef": "urn:ujg:state:checkout-form",
      "stateRefs": [
        "urn:ujg:state:checkout-form",
        "urn:ujg:state:checkout-complete"
      ],
      "transitionRefs": [
        "urn:ujg:transition:checkout-form-to-complete"
      ],
      "exitRefs": [
        "urn:ujg:exit:checkout-complete"
      ]
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:checkout-form",
      "label": "Checkout form"
    },
    {
      "@type": "BoundaryState",
      "@id": "urn:ujg:state:checkout-complete",
      "label": "Checkout complete"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:checkout-form-to-complete",
      "label": "Submit checkout",
      "from": "urn:ujg:state:checkout-form",
      "to": "urn:ujg:state:checkout-complete"
    },
    {
      "@type": "JourneyExit",
      "@id": "urn:ujg:exit:checkout-complete",
      "label": "Checkout complete",
      "exitStateRef": "urn:ujg:state:checkout-complete"
    }
  ]
}
```

### Parent Continuation with fromExitRef {data-cop-concept="parent-continuation"}

`fromExitRef` is a mapping property on a parent [=Transition=]. It identifies which exported [=JourneyExit=] completed for the child journey of the transition's `from` [=CompositeState=].

`fromExitRef` is not a transition endpoint. The transition's `from` and `to` values remain local to the enclosing journey.

<spec-statement>
1. A [=Transition=] **MAY** declare `fromExitRef`.
2. A [=Transition=] **MUST NOT** declare more than one `fromExitRef`.
3. A [=Transition=] with `fromExitRef` **MUST** have a `from` value that references a [=CompositeState=].
4. The [=CompositeState=] referenced by `from` **MUST** declare exactly one `subjourneyId`.
5. The `subjourneyId` value **MUST** resolve to a [=Journey=].
6. The `fromExitRef` value **MUST** be listed in the `exitRefs` of the journey referenced by the `from` composite state's `subjourneyId`.
7. `fromExitRef` **MUST NOT** weaken, replace, or bypass local transition endpoint validation.
8. A parent transition **MUST NOT** directly reference a child journey's state as `from`, `to`, or through any child-state-specific transition property.
9. A journey **MUST NOT** contain more than one transition with the same `from` value and the same `fromExitRef` value.
</spec-statement>

<spec-statement>
When a Consumer enters a [=CompositeState=], it **MAY** resolve the composite state's `subjourneyId` and interpret the referenced child [=Journey=].

If interpretation of the child journey reaches a [=BoundaryState=] that is the `exitStateRef` of a [=JourneyExit=] listed in that child journey's `exitRefs`, that [=JourneyExit=] becomes the exported exit of the child journey.

The enclosing journey may then continue only by taking a parent transition whose:

1. `from` value is the active parent-local [=CompositeState=]; and
2. `fromExitRef` value is the exported [=JourneyExit=].

If exactly one matching parent transition exists, the Consumer **MAY** continue to that transition's parent-local `to` state.

If no matching parent transition exists, the Consumer **MUST NOT** synthesize an implicit parent transition.

If more than one matching parent transition exists, the graph is invalid. A Consumer **MUST NOT** choose one arbitrarily.

A Consumer **MUST NOT** treat `fromExitRef` as a replacement for `from` or `to`.

A Consumer **MUST NOT** treat a parent transition without `fromExitRef` as a fallback for an exported child journey exit.
</spec-statement>

Use [=JourneyExit=] and `fromExitRef` when a nested journey has multiple explicit boundary outcomes that the parent journey needs to distinguish. Do not use [=JourneyExit=] for ordinary transitions inside the child journey; use normal child [=Transition=] resources for internal child movement.

```mermaid
classDiagram
  class Journey
  class CompositeState {
    subjourneyId
  }
  class BoundaryState
  class JourneyExit
  class Transition {
    from
    to
    fromExitRef
  }

  CompositeState --> Journey : subjourneyId
  Journey --> JourneyExit : exitRefs
  JourneyExit --> BoundaryState : exitStateRef
  Transition --> CompositeState : from
  Transition --> JourneyExit : fromExitRef
```

Example JSON graph:

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
  "@id": "https://example.com/ujg/checkout-with-exit.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:shop",
      "label": "Shop journey",
      "startStateRef": "urn:ujg:state:cart",
      "stateRefs": [
        "urn:ujg:state:cart",
        "urn:ujg:state:checkout-flow",
        "urn:ujg:state:confirmation"
      ],
      "transitionRefs": [
        "urn:ujg:transition:cart-to-checkout",
        "urn:ujg:transition:checkout-to-confirmation"
      ]
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:cart",
      "label": "Cart"
    },
    {
      "@type": "CompositeState",
      "@id": "urn:ujg:state:checkout-flow",
      "label": "Checkout flow",
      "subjourneyId": "urn:ujg:journey:checkout"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:confirmation",
      "label": "Confirmation"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:cart-to-checkout",
      "label": "Start checkout",
      "from": "urn:ujg:state:cart",
      "to": "urn:ujg:state:checkout-flow"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:checkout-to-confirmation",
      "label": "Show confirmation",
      "from": "urn:ujg:state:checkout-flow",
      "to": "urn:ujg:state:confirmation",
      "fromExitRef": "urn:ujg:exit:checkout-complete"
    },
    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:checkout",
      "label": "Checkout child journey",
      "startStateRef": "urn:ujg:state:checkout-form",
      "stateRefs": [
        "urn:ujg:state:checkout-form",
        "urn:ujg:state:checkout-complete"
      ],
      "transitionRefs": [
        "urn:ujg:transition:checkout-form-to-complete"
      ],
      "exitRefs": [
        "urn:ujg:exit:checkout-complete"
      ]
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:checkout-form",
      "label": "Checkout form"
    },
    {
      "@type": "BoundaryState",
      "@id": "urn:ujg:state:checkout-complete",
      "label": "Checkout complete"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:checkout-form-to-complete",
      "label": "Submit checkout",
      "from": "urn:ujg:state:checkout-form",
      "to": "urn:ujg:state:checkout-complete"
    },
    {
      "@type": "JourneyExit",
      "@id": "urn:ujg:exit:checkout-complete",
      "label": "Checkout complete",
      "exitStateRef": "urn:ujg:state:checkout-complete"
    }
  ]
}
```

---

## OutgoingTransition {data-cop-concept="outgoing-transition"}

An [=OutgoingTransition=] is a navigational affordance. It defines a possible effective target state but does not declare a structural transition in a journey's local topology.

An [=OutgoingTransition=] has no explicit `from` property. Its effective source comes from either a state-scoped `outgoingTransitionRefs` value or an injected [=OutgoingTransitionGroup=].

<spec-statement>
1. An [=OutgoingTransition=] **MUST** be identified by an IRI.
2. An [=OutgoingTransition=] **MUST** declare exactly one effective target mechanism: either exactly one `to` value, or `toCurrentState: true`.
3. An [=OutgoingTransition=] with `toCurrentState: true` **MUST NOT** also declare `to`.
4. An [=OutgoingTransition=] with neither `to` nor `toCurrentState: true` is invalid.
5. `toCurrentState: false` is equivalent to the property being absent and does not satisfy the target requirement.
6. `OutgoingTransition.to` **MAY** reference a resolvable [=State=] or [=CompositeState=] outside the journey that contributes the affordance.
7. `OutgoingTransition.to` **MUST NOT** reference a [=BoundaryState=].
8. An [=OutgoingTransition=] **MUST NOT** be listed in a [=Journey=]'s `transitionRefs`.
9. An [=OutgoingTransition=] **MUST NOT** be used for ordinary internal journey progression when a local [=Transition=] is appropriate.
10. An [=OutgoingTransition=] **MUST NOT** declare more than one `label`.
</spec-statement>

If the `to` target is a known page, surface, or flow entry, it should normally be listed in a [=JourneyIndex=]. Do not list that target in the source [=Journey=]'s `stateRefs` unless it also belongs to the source journey's local topology.

```mermaid
classDiagram
  class OutgoingTransition {
    id
    label
    to
    toCurrentState
  }
  class State
  class CompositeState

  OutgoingTransition --> State : effective target
  OutgoingTransition --> CompositeState : effective target
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

Some outgoing affordances do not target a fixed state. Instead, they preserve the current effective state and modify some non-topological dimension such as locale, presentation mode, or filter context. Such affordances **MAY** use `toCurrentState: true`. When used, the outgoing transition resolves to the effective source where the affordance is available, which can be a [=State=] or [=CompositeState=]. This allows reusable outgoing transition groups, such as global language switchers, to be attached across journeys without duplicating per-page transitions.

`toCurrentState` changes graph target resolution, but it does not imply any runtime event, click, URL, locale, payload, or private extension behavior.


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
1. An [=OutgoingTransitionGroup=] **MUST** be identified by an IRI.
2. An [=OutgoingTransitionGroup=] **MUST** declare at least one `outgoingTransitionRefs` value.
3. Each group `outgoingTransitionRefs` value **MUST** reference an [=OutgoingTransition=].
4. A [=Journey=] **MAY** reference an [=OutgoingTransitionGroup=] through `outgoingTransitionGroupRefs`.
</spec-statement>

<spec-statement>
For journey-level group injection:

1. The Consumer **MUST** resolve each referenced [=OutgoingTransitionGroup=] and each group `outgoingTransitionRefs` entry to an [=OutgoingTransition=].
2. The Consumer **MUST** iterate over every [=State=] and [=CompositeState=] ID in `stateRefs` except [=BoundaryState=] instances.
3. The Consumer **MUST** resolve each [=OutgoingTransition=] target at the iterated state where the group is applied.
4. For a resolved [=OutgoingTransition=] with `toCurrentState: true`, the effective target is the current iterated [=State=] or [=CompositeState=].
5. For a resolved [=OutgoingTransition=] with `to`, the effective target is the referenced `to` state.
6. The Consumer **MUST NOT** create effective outgoing transitions from a [=BoundaryState=].
7. A Consumer **SHOULD** treat duplicate effective outgoing edges with the same effective source state and same effective target as one effective edge.
</spec-statement>

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

Example JSON nodes for a shared language switcher:

```json
{
  "@type": "OutgoingTransitionGroup",
  "@id": "urn:ankommenskreis:otg:shared-header-language-switcher",
  "label": "Shared header language switcher",
  "outgoingTransitionRefs": [
    "urn:ankommenskreis:ot:lang-de",
    "urn:ankommenskreis:ot:lang-en",
    "urn:ankommenskreis:ot:lang-ar",
    "urn:ankommenskreis:ot:lang-fa",
    "urn:ankommenskreis:ot:lang-tr",
    "urn:ankommenskreis:ot:lang-uk",
    "urn:ankommenskreis:ot:lang-ru"
  ]
}
```

```json
{
  "@type": "OutgoingTransition",
  "@id": "urn:ankommenskreis:ot:lang-en",
  "label": "English",
  "toCurrentState": true,
  "l10n:targetLocale": "en"
}
```

The `l10n:targetLocale` value in this example is locale metadata from the Localization module. The current-state target behavior is defined only by Graph's `toCurrentState`.

---

## State-scoped Outgoing Affordances {data-cop-concept="state-scoped-outgoing"}

A [=State=] can also declare outgoing affordances directly. These affordances apply only to that state and are not injected into other states.

Direct state-scoped affordances are for local navigational options, not for ordinary internal progression through a journey.

<spec-statement>
1. A [=State=] **MAY** declare `outgoingTransitionRefs`.
2. A [=CompositeState=] **MUST NOT** declare `outgoingTransitionRefs`.
3. A [=BoundaryState=] **MUST NOT** declare `outgoingTransitionRefs`.
4. Each state-scoped `outgoingTransitionRefs` value **MUST** reference an [=OutgoingTransition=].
5. The effective source of a state-scoped [=OutgoingTransition=] is the [=State=] that declares the `outgoingTransitionRefs` value.
6. For a state-scoped [=OutgoingTransition=] with `toCurrentState: true`, the effective target is the [=State=] that declares the `outgoingTransitionRefs` value.
7. For a state-scoped [=OutgoingTransition=] with `to`, the effective target is the referenced `to` state.
8. A Consumer **MUST NOT** treat a state-scoped [=OutgoingTransition=] as a member of the enclosing [=Journey=]'s `transitionRefs`.
9. A Consumer **SHOULD** treat duplicate effective outgoing edges with the same effective source state and same effective target as one effective edge.
</spec-statement>

If navigation should be available while a [=CompositeState=] is active, model it either as an [=OutgoingTransitionGroup=] referenced by the enclosing journey or as direct `outgoingTransitionRefs` on concrete states inside the composite state's subjourney.

```mermaid
classDiagram
  class State {
    outgoingTransitionRefs
  }
  class CompositeState
  class BoundaryState
  class OutgoingTransition {
    to
    toCurrentState
  }

  State --> OutgoingTransition : outgoingTransitionRefs
  OutgoingTransition --> State : effective target
  OutgoingTransition --> CompositeState : effective target
  note for OutgoingTransition "target mechanism is either to or toCurrentState"

  note for CompositeState "MUST NOT declare outgoingTransitionRefs"
  note for BoundaryState "MUST NOT declare outgoingTransitionRefs"
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

This example shows a search form state with a local "Back to home page" affordance. This is not a structural [=Transition=] from the SearchPage journey to a root journey or [=JourneyIndex=]. It is a state-scoped navigational affordance. The `to` target must resolve to a known [=State=] or [=CompositeState=], but it does not need to be listed in the current journey's `stateRefs`. If the home page is a known page entry, it should normally be listed in a [=JourneyIndex=].

---

## Ontology {data-cop-concept="ontology"}

The normative Graph ontology is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/graph`. It is the authoritative structural definition for Graph classes and properties, including `Journey`, `State`, `CompositeState`, `BoundaryState`, `Transition`, `JourneyExit`, `OutgoingTransition`, `OutgoingTransitionGroup`, `exitRefs`, `fromExitRef`, `exitStateRef`, `toCurrentState`, and `outgoingTransitionRefs`.

:::include ./graph.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Graph JSON-LD context is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld`. It provides the compact JSON-LD term mappings for the Graph vocabulary used by the examples on this page.

:::include ./graph.context.jsonld :::

---

## Validation {data-cop-concept="validation"}

The normative Graph SHACL shape is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/graph.shape`. It is the authoritative validation artifact for Graph structural constraints.

:::include ./graph.shape.ttl :::

---

## Graph Integrity and Resolution {data-cop-concept="graph-integrity"}

The rules below define additional graph integrity and resolution behavior beyond the structural constraints captured by the SHACL shape.

<spec-statement>
To ensure graph integrity, the following constraints **MUST** be met:
1. **Reference Integrity:** All `startStateRef`, `stateRefs`, `transitionRefs`, `exitRefs`, `outgoingTransitionGroupRefs`, and `outgoingTransitionRefs` IDs **MUST** resolve to valid Nodes within the current scope or imported modules.
2. **Transition Endpoint Resolution:** The `from` and `to` IDs of a [=Transition=] **MUST** resolve to valid Nodes, and are required to be members of the enclosing [=Journey=]'s `stateRefs`. A transition **MUST NOT** reference states belonging to other journeys.
3. **Composition Safety:** `subjourneyId` **MUST** resolve to a valid [=Journey=].
4. **Journey Exit Resolution:** Every ID in `exitRefs` **MUST** resolve to a [=JourneyExit=].
5. **Group Resolution:** Every ID in `outgoingTransitionGroupRefs` **MUST** resolve to an [=OutgoingTransitionGroup=].
6. **Outgoing Resolution:** Every ID in `outgoingTransitionRefs` **MUST** resolve to an [=OutgoingTransition=].
7. **Outgoing Target Resolution:** Each [=OutgoingTransition=] **MUST** resolve through exactly one effective target mechanism: a fixed `to` target, or `toCurrentState: true` resolved at the current effective source where the outgoing affordance is available.
</spec-statement>

---

## Examples

### JourneyIndex with External Outgoing Target

This example lists known page entries in a [=JourneyIndex=]. The search page journey has a state-scoped [=OutgoingTransition=] to the profile page entry, but the profile page is not part of the search page journey's local `stateRefs`.

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
  "@id": "https://example.com/ujg/graph/page-index.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "JourneyIndex",
      "@id": "urn:ujg:index:pages",
      "label": "Page index",
      "stateRefs": [
        "urn:ujg:state:search-page",
        "urn:ujg:state:profile-page"
      ]
    },
    {
      "@type": "CompositeState",
      "@id": "urn:ujg:state:search-page",
      "label": "Search page",
      "subjourneyId": "urn:ujg:journey:search-page"
    },
    {
      "@type": "CompositeState",
      "@id": "urn:ujg:state:profile-page",
      "label": "Profile page",
      "subjourneyId": "urn:ujg:journey:profile-page"
    },
    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:search-page",
      "label": "Search page journey",
      "startStateRef": "urn:ujg:state:search-form",
      "stateRefs": [
        "urn:ujg:state:search-form",
        "urn:ujg:state:search-results"
      ],
      "transitionRefs": [
        "urn:ujg:transition:search-form-to-results"
      ]
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:search-form",
      "label": "Search form"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:search-results",
      "label": "Search results",
      "outgoingTransitionRefs": [
        "urn:ujg:ot:search-results-to-profile"
      ]
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:search-form-to-results",
      "label": "Submit search",
      "from": "urn:ujg:state:search-form",
      "to": "urn:ujg:state:search-results"
    },
    {
      "@type": "OutgoingTransition",
      "@id": "urn:ujg:ot:search-results-to-profile",
      "label": "Open profile",
      "to": "urn:ujg:state:profile-page"
    },
    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:profile-page",
      "label": "Profile page journey",
      "startStateRef": "urn:ujg:state:profile-summary",
      "stateRefs": [
        "urn:ujg:state:profile-summary"
      ]
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:profile-summary",
      "label": "Profile summary"
    }
  ]
}
```

### Form Child Journey with Parent Continuation

This example models a form as a child journey. The form exports `submitted` through [=BoundaryState=] and [=JourneyExit=]. The enclosing journey continues from the form [=CompositeState=] to a result-page [=CompositeState=] using `fromExitRef`.

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
  "@id": "https://example.com/ujg/graph/form-continuation.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "JourneyIndex",
      "@id": "urn:ujg:index:form-example-pages",
      "label": "Form example pages",
      "stateRefs": [
        "urn:ujg:state:contact-page",
        "urn:ujg:state:result-page"
      ]
    },
    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:contact-page",
      "label": "Contact page journey",
      "startStateRef": "urn:ujg:state:contact-form",
      "stateRefs": [
        "urn:ujg:state:contact-form",
        "urn:ujg:state:result-page"
      ],
      "transitionRefs": [
        "urn:ujg:transition:contact-form-to-result"
      ]
    },
    {
      "@type": "CompositeState",
      "@id": "urn:ujg:state:contact-page",
      "label": "Contact page",
      "subjourneyId": "urn:ujg:journey:contact-page"
    },
    {
      "@type": "CompositeState",
      "@id": "urn:ujg:state:contact-form",
      "label": "Contact form",
      "subjourneyId": "urn:ujg:journey:contact-form"
    },
    {
      "@type": "CompositeState",
      "@id": "urn:ujg:state:result-page",
      "label": "Result page",
      "subjourneyId": "urn:ujg:journey:result-page"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:contact-form-to-result",
      "label": "Show result page",
      "from": "urn:ujg:state:contact-form",
      "to": "urn:ujg:state:result-page",
      "fromExitRef": "urn:ujg:exit:contact-form-submitted"
    },
    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:contact-form",
      "label": "Contact form journey",
      "startStateRef": "urn:ujg:state:contact-form-editing",
      "stateRefs": [
        "urn:ujg:state:contact-form-editing",
        "urn:ujg:state:contact-form-submitted"
      ],
      "transitionRefs": [
        "urn:ujg:transition:contact-form-submit"
      ],
      "exitRefs": [
        "urn:ujg:exit:contact-form-submitted"
      ]
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:contact-form-editing",
      "label": "Contact form editing"
    },
    {
      "@type": "BoundaryState",
      "@id": "urn:ujg:state:contact-form-submitted",
      "label": "Submitted"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:contact-form-submit",
      "label": "Submit form",
      "from": "urn:ujg:state:contact-form-editing",
      "to": "urn:ujg:state:contact-form-submitted"
    },
    {
      "@type": "JourneyExit",
      "@id": "urn:ujg:exit:contact-form-submitted",
      "label": "Submitted",
      "exitStateRef": "urn:ujg:state:contact-form-submitted"
    },
    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:result-page",
      "label": "Result page journey",
      "startStateRef": "urn:ujg:state:result-summary",
      "stateRefs": [
        "urn:ujg:state:result-summary"
      ]
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:result-summary",
      "label": "Result summary"
    }
  ]
}
```

### Anti-Example: Linked Destination in Source Journey

The following source journey incorrectly lists `urn:ujg:state:profile-page` in `stateRefs` merely because an outgoing affordance can reach it. The profile page should be listed in a [=JourneyIndex=] and referenced by `OutgoingTransition.to`; it should not be promoted into the search page journey's local topology.

```json
{
  "@type": "Journey",
  "@id": "urn:ujg:journey:search-page",
  "label": "Search page journey",
  "startStateRef": "urn:ujg:state:search-form",
  "stateRefs": [
    "urn:ujg:state:search-form",
    "urn:ujg:state:search-results",
    "urn:ujg:state:profile-page"
  ],
  "transitionRefs": [
    "urn:ujg:transition:search-form-to-results"
  ]
}
```

### Combined JSON Example

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
  "@id": "https://example.com/ujg/graph/main-site.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "JourneyIndex",
      "@id": "urn:ujg:index:main-site-pages",
      "label": "Main site pages",
      "stateRefs": [
        "urn:ujg:state:home-page",
        "urn:ujg:state:checkout-flow",
        "urn:ujg:state:profile-page"
      ]
    },

    {
      "@type": "CompositeState",
      "@id": "urn:ujg:state:home-page",
      "label": "Home page",
      "subjourneyId": "urn:ujg:journey:home-page"
    },

    {
      "@type": "CompositeState",
      "@id": "urn:ujg:state:checkout-flow",
      "label": "Checkout process",
      "subjourneyId": "urn:ujg:journey:checkout"
    },

    {
      "@type": "CompositeState",
      "@id": "urn:ujg:state:profile-page",
      "label": "Profile page",
      "subjourneyId": "urn:ujg:journey:profile"
    },

    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:home-page",
      "label": "Home page journey",
      "startStateRef": "urn:ujg:state:home",
      "stateRefs": ["urn:ujg:state:home", "urn:ujg:state:checkout-flow"],
      "transitionRefs": ["urn:ujg:transition:home-to-checkout"],
      "outgoingTransitionGroupRefs": ["urn:ujg:otg:global-header"]
    },

    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:home-to-checkout",
      "from": "urn:ujg:state:home",
      "to": "urn:ujg:state:checkout-flow",
      "label": "Buy Now"
    },

    {
      "@type": "State",
      "@id": "urn:ujg:state:home",
      "label": "Home Page",
      "tags": ["phase:landing"]
    },

    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:checkout",
      "label": "Checkout journey",
      "startStateRef": "urn:ujg:state:checkout-cart",
      "stateRefs": ["urn:ujg:state:checkout-cart"]
    },

    {
      "@type": "State",
      "@id": "urn:ujg:state:checkout-cart",
      "label": "Checkout cart"
    },

    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:profile",
      "label": "Profile journey",
      "startStateRef": "urn:ujg:state:profile-summary",
      "stateRefs": ["urn:ujg:state:profile-summary"]
    },

    {
      "@type": "State",
      "@id": "urn:ujg:state:profile-summary",
      "label": "Profile summary"
    },

    {
      "@type": "OutgoingTransition",
      "@id": "urn:ujg:ot:go-home",
      "to": "urn:ujg:state:home-page",
      "label": "Home"
    },

    {
      "@type": "OutgoingTransition",
      "@id": "urn:ujg:ot:go-profile",
      "to": "urn:ujg:state:profile-page",
      "label": "Profile"
    },

    {
      "@type": "OutgoingTransitionGroup",
      "@id": "urn:ujg:otg:global-header",
      "outgoingTransitionRefs": ["urn:ujg:ot:go-home", "urn:ujg:ot:go-profile"]
    }
  ]
}
```
