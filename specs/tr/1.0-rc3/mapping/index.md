## Overview

This module defines the basic vocabulary and processing model for mapping causally ordered Runtime
events back to the intended Graph journey model.

Runtime records what happened. Graph defines the intended journey topology. Mapping connects the two
by resolving state-observation `RuntimeEvent.surfaceInstanceRef` values to `SurfaceInstance` nodes,
then resolving each instance's `surfaceRef` to a `Surface` and that surface's `graphNodeRef` to the
observed Graph state-like node. Mapping associates each journey-local segment of the resolved
execution with an explicit root Graph `Journey`.

Mapping roots are traversable Graph [=Journey|Journeys=]. A [=JourneyEntryIndex=] can help discover known
[=JourneyEntry=] contracts before mapping, but it is not a local traversal scope and is not the target of
`mappedJourneyRef`.

Mapping surfaces model drift, tracking gaps, direct invocations, menu jumps, and other out-of-model
movement. It does not assume every jump is an error.

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/tr/1.0-rc3/ns/context.jsonld`
with the Mapping context.

## Terminology

- <dfn>JourneyMapping</dfn>: An addressable mapping record that binds one journey-local segment of a
  Runtime execution chain to the root Graph `Journey` used to interpret that segment. The mapped
  journey is a traversable topology, not a `JourneyEntryIndex`.
- <dfn>Journey segment</dfn>: A causally ordered set of mapped state observations interpreted under
  one `mappedJourneyRef`. Entering through an [=OutgoingTransition=] always starts a new segment.
- <dfn>MappedStep</dfn>: An addressable mapping record for one state-observation `RuntimeEvent` in
  the mapped chain.
- <dfn>Mapped runtime</dfn>: The `JourneyExecution` whose causal `RuntimeEvent` chain is being
  resolved.
- <dfn>Mapped state</dfn>: A Graph `State` or `CompositeState` resolved from a
  `RuntimeEvent.surfaceInstanceRef` through `SurfaceInstance.surfaceRef` and
  `Surface.graphNodeRef`.
- <dfn>Observed affordance</dfn>: A `Command` resolved from a runtime
  event's surface.
- <dfn>Relevant effective transition</dfn>: A Graph transition that can explain an observed movement
  between two resolved runtime states.
- <dfn>Jump</dfn>: A non-root mapped step where no relevant effective transition explains the
  observed movement.

## JourneyMapping {data-cop-concept="journey-mapping"}

A [=JourneyMapping=] binds one journey-local segment of a Runtime execution chain to the root Graph
Journey used to interpret that segment and to its MappedStep records.

<spec-statement>
1. A [=JourneyMapping=] **MUST** be identified by an IRI.
2. A [=JourneyMapping=] **MUST** declare exactly one `mappedRuntimeRef` to a `JourneyExecution`.
3. A [=JourneyMapping=] **MUST** declare exactly one `mappedJourneyRef` to a traversable `Journey`.
4. `mappedJourneyRef` **MUST NOT** reference a `JourneyEntryIndex`.
5. A [=JourneyMapping=] **MUST** declare one or more `mappedStepRef` values.
6. The JSON order of `mappedStepRef` values **MUST NOT** define step order.
7. One `JourneyExecution` **MAY** be referenced by more than one [=JourneyMapping=].
8. [=JourneyMapping|JourneyMappings=] for the same `JourneyExecution` **MUST NOT** reference the
   same [=MappedStep=] or different MappedSteps whose `mappedEventRef` values are equal.
</spec-statement>

```mermaid
classDiagram
  class JourneyExecution
  class Journey
  class MappedStep
  class JourneyMapping {
    id
    mappedRuntimeRef
    mappedJourneyRef
    mappedStepRef
  }
  JourneyMapping --> JourneyExecution : mappedRuntimeRef
  JourneyMapping --> Journey : mappedJourneyRef
  JourneyMapping --> "1..*" MappedStep : mappedStepRef
```

Example JSON node:

```json
{
  "@type": "JourneyMapping",
  "@id": "urn:mapping:checkout-1",
  "mappedRuntimeRef": "urn:execution:checkout-1",
  "mappedJourneyRef": "urn:journey:checkout",
  "mappedStepRef": [
    "urn:mapping:checkout-1:100",
    "urn:mapping:checkout-1:200"
  ]
}
```

## MappedStep {data-cop-concept="mapped-step"}

A [=MappedStep=] records the Graph state-like node resolved for one state-observation RuntimeEvent.
Affordance events remain in the Runtime causal chain and may be referenced as evidence, but are not
serialized as separate MappedStep records.

<spec-statement>
1. A [=MappedStep=] **MUST** be identified by an IRI.
2. A [=MappedStep=] **MUST** declare exactly one `mappedEventRef` to a state-observation `RuntimeEvent`.
3. A [=MappedStep=] **MUST** declare exactly one `mappedStateRef` to the resolved `State` or `CompositeState`.
4. A [=MappedStep=] **MAY** declare at most one `observedAffordanceEventRef` to its immediate predecessor event.
5. A [=MappedStep=] **MAY** declare at most one `explainedByTransitionRef` to a relevant effective transition.
</spec-statement>

```mermaid
classDiagram
  class RuntimeEvent
  class State
  class CompositeState
  class Transition
  class OutgoingTransition
  class MappedStep {
    id
    mappedEventRef
    mappedStateRef
    observedAffordanceEventRef
    explainedByTransitionRef
  }
  MappedStep --> RuntimeEvent : mappedEventRef
  MappedStep --> RuntimeEvent : observedAffordanceEventRef
  MappedStep --> State : mappedStateRef
  MappedStep --> CompositeState : mappedStateRef
  MappedStep --> Transition : explainedByTransitionRef
  MappedStep --> OutgoingTransition : explainedByTransitionRef
```

Example JSON node:

```json
{
  "@type": "MappedStep",
  "@id": "urn:mapping:checkout-1:200",
  "mappedEventRef": "urn:event:checkout-1:200",
  "observedAffordanceEventRef": "urn:event:checkout-1:150",
  "mappedStateRef": "urn:state:payment",
  "explainedByTransitionRef": "urn:transition:cart-to-payment"
}
```

## Mapping Model

A `JourneyMapping` links:

- `mapping:mappedRuntimeRef` to the Runtime `JourneyExecution` being mapped.
- `mapping:mappedJourneyRef` to the root Graph `Journey` for the interpreted segment.
- `mapping:mappedStepRef` to the state-resolving `MappedStep` records derived from the runtime
  chain.

Each `MappedStep` links:

- `mapping:mappedEventRef` to the state-observation Runtime `RuntimeEvent` being interpreted.
- `mapping:observedAffordanceEventRef`, when present, to the immediately preceding Runtime
  `RuntimeEvent` whose surface resolves to an observed affordance [=Command=].
- `mapping:mappedStateRef` to the resolved Graph `State` or `CompositeState`.
- `mapping:explainedByTransitionRef`, when present, to the effective `Transition` or
  `OutgoingTransition` that explains the movement.

Runtime events whose surfaces resolve to [=Command=] are affordance events. They remain in the
Runtime causal chain but are not serialized as separate `MappedStep` records. When an affordance
event appears immediately before a state-observation event, the following `MappedStep` can reference
it with `observedAffordanceEventRef`.

Mapping does not serialize a separate step scope or segment link. Segment membership is expressed by
`mappedStepRef`. For each `MappedStep`, the local Graph `Journey` scope is derived from the mapped
state's containment path rooted at `mappedJourneyRef`.

The Runtime event order remains defined by Runtime's causal chain: a root event followed by the
unique successor sequence obtained through `previousId`. `mappedStepRef` is a set of step records;
its JSON order is not normative.

## Processing Rules {data-cop-concept="processing-rules"}

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Runtime chain source:** A consumer mapping runtime behavior MUST reconstruct event order using
   the Runtime causal chain model.
2. **Step correspondence:** Each `MappedStep` MUST identify one state-observation `RuntimeEvent` in
   the mapped runtime chain through `mappedEventRef`.
3. **Surface resolution:** For each `MappedStep`, the Consumer MUST resolve the referenced
   `RuntimeEvent.surfaceInstanceRef` to a [=SurfaceInstance=], then follow `surfaceRef` to a
   [=Surface=].
4. **State resolution:** Each `MappedStep.mappedStateRef` MUST be the Graph `State` or
   `CompositeState` resolved from the `mappedEventRef` event surface's `graphNodeRef` in the mapped
   journey's containment path or imported documents. Runtime events whose surfaces resolve to
   `Command` MUST NOT be serialized as `MappedStep` records.
5. **Journey ownership:** `mappedJourneyRef` identifies the root Graph `Journey` for one mapped
   segment. `mappedJourneyRef` MUST NOT reference a [=JourneyEntryIndex=].
6. **Step order:** Mapping does not define a separate step order. Consumers MUST order mapped steps
   and segments by applying Runtime chain reconstruction to each step's `mappedEventRef`.
7. **Segment start:** The initial segment begins with the Runtime root state observation. A new
   segment begins when an [=OutgoingTransition=] is traversed or when an unexplained movement first
   resolves outside the current segment's mapped Journey containment path. Every outgoing traversal
   starts a new segment, including re-entry into the same Journey or the same State.
8. **Outgoing destination segment:** For an explained outgoing traversal, the destination segment's
   `mappedJourneyRef` MUST identify the unique Journey that owns the OutgoingTransition's
   `toEntryRef`. The segment's first `mappedStateRef` MUST equal that JourneyEntry's `stateRef`.
9. **Cross-segment predecessor:** For the first MappedStep of a segment entered through an
   OutgoingTransition, the movement predecessor is the latest earlier mapped State or CompositeState
   in Runtime causal order, even though it belongs to the preceding segment. Intervening Command
   events do not replace that state predecessor.
10. **Unexplained destination segment:** A movement that first resolves into another Journey without
    a matching effective OutgoingTransition starts a segment for that Journey. Its first MappedStep
    is a jump.
11. **Local journey scope:** Within a segment, a Consumer MUST derive each MappedStep's local
    [=Journey=] scope from the mapped state and the containment path rooted at `mappedJourneyRef`. If
    the mapped state is listed in the mapped root journey's `stateRefs`, the local scope is the mapped
    root journey. If the mapped state is listed in a child journey reached through a containing
    [=CompositeState=]'s `subjourneyRefs`, the local scope is that child journey for that containing
    composite occurrence. A mapped [=CompositeState=] belongs to the parent journey scope that lists
    it in `stateRefs`.
12. **Composite occurrence scope:** When the same [=CompositeState=] occurs more than once in the
    Runtime chain, Consumers MUST treat each occurrence as a separate containing scope for child
    journey predecessor lookup. Mapping does not serialize occurrence identifiers.
13. **Origin derivation:** Only the step whose RuntimeEvent omits `previousId` is the execution root
    and is not an observed movement. The first observation in a later segment is a movement. The first
    ordered observation in each local child journey scope for a containing composite occurrence is a
    local origin unless it is also a segment entry explained by an OutgoingTransition.
14. **Local origin evidence:** A local origin in a child journey MUST NOT use a mapped step from a
    sibling child journey as its predecessor. The origin is consistent with a parent Transition's
    `toEntryRef`, the child Journey's `defaultEntryRef`, or materialization or execution context
    selecting a child entry. A local origin needs no `explainedByTransitionRef`.
15. **Affordance event correlation:** If the immediate `RuntimeEvent.previousId` predecessor of a
    `MappedStep.mappedEventRef` event resolves through Surface to a `Command`, the MappedStep MAY
    reference that predecessor with `observedAffordanceEventRef`. `observedAffordanceEventRef` MUST
    NOT reference any event other than that immediate predecessor.
16. **Transition lookup:** A non-root MappedStep is explained when `explainedByTransitionRef` points
    to one relevant effective transition. For a Graph `Transition`, the local predecessor is the
    latest earlier MappedStep in Runtime causal order in the same local Journey scope and containing
    composite occurrence; observations from sibling child Journeys may interleave without becoming
    that predecessor. The Transition is relevant when its local `from` and `to` match that predecessor
    and the current mapped state. An [=OutgoingTransition=] is relevant when:
    - it is available directly from the predecessor State or through an OutgoingTransitionGroup on
      the predecessor's local Journey;
    - its `toEntryRef` is owned by the destination segment's `mappedJourneyRef`; and
    - that entry's `stateRef` equals the destination segment's first `mappedStateRef`.
17. **Child exit occurrence:** A child [=JourneyExit=] reached in a local child journey scope ends that
    containing [=CompositeState=] occurrence for Mapping. Later observations from any child Journey in
    the ended composite scope require a later occurrence of the containing composite or are out-of-scope
    movement under existing Mapping rules. A child exit does not imply simultaneous, joint, or all-child
    completion for sibling child journeys.
18. **Observed affordance evidence:** When `observedAffordanceEventRef` is present and resolves to a
    `Command`, `explainedByTransitionRef` SHOULD identify a relevant `Transition` or
    `OutgoingTransition` whose `commandRef` references that same Command, if one exists for the
    movement from the predecessor to the current mapped state.
19. **Outgoing group availability:** Consumers use
    `OutgoingTransitionGroup.outgoingTransitionRefs` only to determine child outgoing-transition
    availability; an OutgoingTransitionGroup itself is not surfaced.
20. **Condition eligibility:** If a consumer implements [[UJG Conditions]], a guarded transition
    only explains a mapped step when the transition is eligible under Condition semantics.
21. **Jump derivation:** A non-root mapped step is a jump when no relevant effective transition
    explains the observed movement. This includes the first step of an unexplained destination
    segment. A jump is a derived processing result, not serialized Mapping vocabulary.
22. **No intent assumption:** A derived jump reports that the observed movement is not explained by
    the mapped graph. It does not by itself decide whether the movement is legitimate or erroneous.

## Step Occurrence and Phase Start {data-cop-concept="step-occurrence"}

For documents that use [[UJG Phase]], Mapping also derives when [=Step|Steps=]
occur and when their [=Phase|Phases=] start. These are processing results, not serialized Mapping
vocabulary, and they do not change Runtime records, Graph traversal, or the `JourneyMapping` and
`MappedStep` wire shapes.

<spec-statement>
1. A Consumer deriving experience occurrence **MUST** order [=MappedStep|MappedSteps=] by applying
   Runtime chain reconstruction to each step's `mappedEventRef`.
2. A [=Step=] occurs at the earliest ordered [=MappedStep=] whose `mappedStateRef` equals
   that Step's `compositeStateRef`.
3. A [=Phase=] starts at the earliest occurrence of any Step whose `phaseRef` resolves to that Phase.
4. Repeated matching RuntimeEvents **MUST NOT** restart an already occurred Step or Phase.
5. A Step without `phaseRef` may occur but **MUST NOT** start a Phase.
6. A Phase with no occurring Step **MUST NOT** be considered started.
7. RuntimeEvents whose surfaces resolve to `Command` **MUST NOT** trigger a Step directly; only
   ordered [=MappedStep=] state observations are considered.
8. Serialized node order, `mappedStepRef` order, `Step.order`, and `Phase.order` **MUST NOT** determine occurrence or start time.
</spec-statement>

```mermaid
flowchart LR
  E[RuntimeEvent] -->|surfaceInstanceRef| SI[SurfaceInstance]
  SI -->|surfaceRef| S[Surface]
  S -->|graphNodeRef| G[Graph State or CompositeState]
  G -->|mappedStateRef| MS[MappedStep]
  MS -->|equals compositeStateRef| ES[Step occurs]
  ES -->|phaseRef; earliest step| P[Phase starts]
```

In the following fragment, the shipping step and checkout phase both begin at event `:100`.
The repeated mapped step for the same composite state at event `:200` does not restart either result.

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/tr/1.0-rc3/ns/context.jsonld",
    "https://ujg.specs.openuji.org/tr/1.0-rc3/ns/phase.context.jsonld",
    "https://ujg.specs.openuji.org/tr/1.0-rc3/ns/mapping.context.jsonld"
  ],
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "CompositeState",
      "@id": "urn:state:shipping-segment",
      "label": "Shipping segment",
      "subjourneyRefs": ["urn:journey:shipping-segment"]
    },
    {
      "@type": "Journey",
      "@id": "urn:journey:shipping-segment",
      "defaultEntryRef": "urn:entry:shipping-default",
      "entryRefs": ["urn:entry:shipping-default"],
      "stateRefs": ["urn:state:shipping-form"]
    },
    {
      "@type": "JourneyEntry",
      "@id": "urn:entry:shipping-default",
      "stateRef": "urn:state:shipping-form"
    },
    { "@type": "State", "@id": "urn:state:shipping-form", "label": "Shipping form" },
    { "@type": "Phase", "@id": "urn:phase:checkout", "order": 2 },
    {
      "@type": "Step",
      "@id": "urn:step:shipping",
      "compositeStateRef": "urn:state:shipping-segment",
      "phaseRef": "urn:phase:checkout"
    },
    { "@type": "Surface", "@id": "urn:surface:shipping", "graphNodeRef": "urn:state:shipping-segment" },
    { "@type": "SurfaceInstance", "@id": "urn:instance:shipping", "surfaceRef": "urn:surface:shipping" },
    { "@type": "JourneyExecution", "@id": "urn:execution:checkout" },
    {
      "@type": "RuntimeEvent",
      "@id": "urn:event:checkout:100",
      "executionId": "urn:execution:checkout",
      "surfaceInstanceRef": "urn:instance:shipping"
    },
    {
      "@type": "RuntimeEvent",
      "@id": "urn:event:checkout:200",
      "executionId": "urn:execution:checkout",
      "previousId": "urn:event:checkout:100",
      "surfaceInstanceRef": "urn:instance:shipping"
    },
    {
      "@type": "MappedStep",
      "@id": "urn:mapping:checkout:100",
      "mappedEventRef": "urn:event:checkout:100",
      "mappedStateRef": "urn:state:shipping-segment"
    },
    {
      "@type": "MappedStep",
      "@id": "urn:mapping:checkout:200",
      "mappedEventRef": "urn:event:checkout:200",
      "mappedStateRef": "urn:state:shipping-segment"
    }
  ]
}
```

## Normative Artifacts

This module is published through the following artifacts.

### Ontology {data-cop-concept="ontology"}

The normative Mapping ontology is defined below and is published at
`https://ujg.specs.openuji.org/tr/1.0-rc3/ns/mapping`.

:::include ./mapping.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Mapping JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/tr/1.0-rc3/ns/mapping.context.jsonld`.

:::include ./mapping.context.jsonld :::

### Validation {data-cop-concept="validation"}

The normative Mapping SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/tr/1.0-rc3/ns/mapping.shape`.

:::include ./mapping.shape.ttl :::

## Examples

### Minimal Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/tr/1.0-rc3/ns/context.jsonld",
    "https://ujg.specs.openuji.org/tr/1.0-rc3/ns/mapping.context.jsonld"
  ],
  "@id": "https://example.com/ujg/mapping/execution-12345.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:mapping:execution-12345",
      "@type": "JourneyMapping",
      "mappedRuntimeRef": "urn:ujg:execution:12345",
      "mappedJourneyRef": "urn:ujg:journey:checkout",
      "mappedStepRef": [
        "urn:mapping:execution-12345:100",
        "urn:mapping:execution-12345:200",
        "urn:mapping:execution-12345:300"
      ]
    },
    {
      "@id": "urn:mapping:execution-12345:100",
      "@type": "MappedStep",
      "mappedEventRef": "urn:ujg:event:12345:100",
      "mappedStateRef": "urn:ujg:state:cart"
    },
    {
      "@id": "urn:mapping:execution-12345:200",
      "@type": "MappedStep",
      "mappedEventRef": "urn:ujg:event:12345:200",
      "mappedStateRef": "urn:ujg:state:payment",
      "explainedByTransitionRef": "urn:ujg:transition:cart-to-payment"
    },
    {
      "@id": "urn:mapping:execution-12345:300",
      "@type": "MappedStep",
      "mappedEventRef": "urn:ujg:event:12345:300",
      "mappedStateRef": "urn:ujg:state:confirmation",
      "explainedByTransitionRef": "urn:ujg:transition:payment-to-confirmation"
    }
  ]
}
```

This example states that the causal event chain for `urn:ujg:execution:12345` has been resolved
against the checkout root journey. The first mapped step is the root event. The later mapped steps
record the relevant effective transitions that explain the observed movements.

If a mapped movement is explained by a reusable outgoing transition, `explainedByTransitionRef`
points to the `OutgoingTransition` resource. A movement explained by an effective
`OutgoingTransition` from the mapped journey's `OutgoingTransitionGroup` is explained by the Graph
model and does not need a serialized status value.

### Affordance Event Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/tr/1.0-rc3/ns/context.jsonld",
    "https://ujg.specs.openuji.org/tr/1.0-rc3/ns/mapping.context.jsonld"
  ],
  "@id": "https://example.com/ujg/mapping/affordance-events.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "Journey",
      "@id": "urn:journey:checkout",
      "label": "Checkout",
      "defaultEntryRef": "urn:entry:checkout",
      "entryRefs": ["urn:entry:checkout"],
      "stateRefs": ["urn:state:cart", "urn:state:payment"],
      "transitionRefs": ["urn:transition:cart-to-payment"],
      "outgoingTransitionGroupRefs": ["urn:outgoing-group:global-nav"]
    },
    {
      "@type": "JourneyEntry",
      "@id": "urn:entry:checkout",
      "stateRef": "urn:state:cart"
    },
    {
      "@type": "State",
      "@id": "urn:state:cart",
      "label": "Cart"
    },
    {
      "@type": "State",
      "@id": "urn:state:payment",
      "label": "Payment"
    },
    {
      "@type": "Journey",
      "@id": "urn:journey:help",
      "label": "Help",
      "defaultEntryRef": "urn:entry:help",
      "entryRefs": ["urn:entry:help"],
      "stateRefs": ["urn:state:help"]
    },
    {
      "@type": "JourneyEntry",
      "@id": "urn:entry:help",
      "stateRef": "urn:state:help"
    },
    {
      "@type": "State",
      "@id": "urn:state:help",
      "label": "Help"
    },
    {
      "@type": "Transition",
      "@id": "urn:transition:cart-to-payment",
      "from": "urn:state:cart",
      "to": "urn:state:payment",
      "commandRef": "urn:command:checkout-action"
    },
    {
      "@type": "OutgoingTransition",
      "@id": "urn:outgoing:help",
      "toEntryRef": "urn:entry:help",
      "commandRef": "urn:command:help-action"
    },
    {
      "@type": "Command",
      "@id": "urn:command:checkout-action",
      "label": "Continue to payment"
    },
    {
      "@type": "Command",
      "@id": "urn:command:help-action",
      "label": "Open help"
    },
    {
      "@type": "OutgoingTransitionGroup",
      "@id": "urn:outgoing-group:global-nav",
      "outgoingTransitionRefs": ["urn:outgoing:help"]
    },
    {
      "@type": "Surface",
      "@id": "urn:surface:cart",
      "graphNodeRef": "urn:state:cart"
    },
    {
      "@type": "Surface",
      "@id": "urn:surface:checkout-action",
      "graphNodeRef": "urn:command:checkout-action"
    },
    {
      "@type": "Surface",
      "@id": "urn:surface:payment",
      "graphNodeRef": "urn:state:payment"
    },
    {
      "@type": "Surface",
      "@id": "urn:surface:help-action",
      "graphNodeRef": "urn:command:help-action"
    },
    {
      "@type": "Surface",
      "@id": "urn:surface:help",
      "graphNodeRef": "urn:state:help"
    },
    {
      "@type": "SurfaceInstance",
      "@id": "urn:surface-instance:cart",
      "surfaceRef": "urn:surface:cart"
    },
    {
      "@type": "SurfaceInstance",
      "@id": "urn:surface-instance:checkout-action",
      "surfaceRef": "urn:surface:checkout-action"
    },
    {
      "@type": "SurfaceInstance",
      "@id": "urn:surface-instance:payment",
      "surfaceRef": "urn:surface:payment"
    },
    {
      "@type": "SurfaceInstance",
      "@id": "urn:surface-instance:help-action",
      "surfaceRef": "urn:surface:help-action"
    },
    {
      "@type": "SurfaceInstance",
      "@id": "urn:surface-instance:help",
      "surfaceRef": "urn:surface:help"
    },
    {
      "@type": "JourneyExecution",
      "@id": "urn:execution:checkout-1"
    },
    {
      "@type": "RuntimeEvent",
      "@id": "urn:event:checkout-1:100",
      "executionId": "urn:execution:checkout-1",
      "surfaceInstanceRef": "urn:surface-instance:cart"
    },
    {
      "@type": "RuntimeEvent",
      "@id": "urn:event:checkout-1:150",
      "executionId": "urn:execution:checkout-1",
      "previousId": "urn:event:checkout-1:100",
      "surfaceInstanceRef": "urn:surface-instance:checkout-action"
    },
    {
      "@type": "RuntimeEvent",
      "@id": "urn:event:checkout-1:200",
      "executionId": "urn:execution:checkout-1",
      "previousId": "urn:event:checkout-1:150",
      "surfaceInstanceRef": "urn:surface-instance:payment"
    },
    {
      "@type": "RuntimeEvent",
      "@id": "urn:event:checkout-1:250",
      "executionId": "urn:execution:checkout-1",
      "previousId": "urn:event:checkout-1:200",
      "surfaceInstanceRef": "urn:surface-instance:help-action"
    },
    {
      "@type": "RuntimeEvent",
      "@id": "urn:event:checkout-1:300",
      "executionId": "urn:execution:checkout-1",
      "previousId": "urn:event:checkout-1:250",
      "surfaceInstanceRef": "urn:surface-instance:help"
    },
    {
      "@type": "JourneyMapping",
      "@id": "urn:mapping:checkout-1",
      "mappedRuntimeRef": "urn:execution:checkout-1",
      "mappedJourneyRef": "urn:journey:checkout",
      "mappedStepRef": [
        "urn:mapping:checkout-1:100",
        "urn:mapping:checkout-1:200"
      ]
    },
    {
      "@type": "JourneyMapping",
      "@id": "urn:mapping:checkout-1:help-segment",
      "mappedRuntimeRef": "urn:execution:checkout-1",
      "mappedJourneyRef": "urn:journey:help",
      "mappedStepRef": ["urn:mapping:checkout-1:300"]
    },
    {
      "@type": "MappedStep",
      "@id": "urn:mapping:checkout-1:100",
      "mappedEventRef": "urn:event:checkout-1:100",
      "mappedStateRef": "urn:state:cart"
    },
    {
      "@type": "MappedStep",
      "@id": "urn:mapping:checkout-1:200",
      "mappedEventRef": "urn:event:checkout-1:200",
      "observedAffordanceEventRef": "urn:event:checkout-1:150",
      "mappedStateRef": "urn:state:payment",
      "explainedByTransitionRef": "urn:transition:cart-to-payment"
    },
    {
      "@type": "MappedStep",
      "@id": "urn:mapping:checkout-1:300",
      "mappedEventRef": "urn:event:checkout-1:300",
      "observedAffordanceEventRef": "urn:event:checkout-1:250",
      "mappedStateRef": "urn:state:help",
      "explainedByTransitionRef": "urn:outgoing:help"
    }
  ]
}
```

`urn:event:checkout-1:150` and `urn:event:checkout-1:250` remain Runtime events, but they are not
separate `MappedStep` records because their surfaces resolve to commands. The second and third
mapped steps point back to those immediate predecessor events. Opening help ends the checkout
segment and starts a help segment in the same Runtime execution. The first help step resolves to
`urn:entry:help`'s `stateRef` and is explained by the outgoing transition available through
`urn:outgoing-group:global-nav`; the group itself has no surface.

The same segmentation rule applies in these boundary cases:

| Observed movement | Mapping result |
| --- | --- |
| OutgoingTransition to an entry in another Journey | End the source segment and start a segment whose `mappedJourneyRef` is the entry owner. |
| OutgoingTransition to an entry in the same Journey, including the same State | Start a new segment with the same `mappedJourneyRef`; the first step remains an explained movement, not a Runtime root. |
| First observation in another Journey with no matching outgoing affordance | Start a segment for that Journey and derive its first step as a jump. |
