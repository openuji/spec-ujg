## Overview

This module defines the basic vocabulary and processing model for mapping causally ordered Runtime
events back to the intended Graph journey model.

Runtime records what happened. Graph defines the intended journey topology. Mapping connects the two
by resolving each `RuntimeEvent.stateRef` in the local journey scope supplied by the event's
`journeyInstanceRef`, then associating the resolved execution with an explicit root Graph
`Journey`.

Mapping roots are traversable Graph [=Journey|Journeys=]. A [=JourneyEntryIndex=] can help discover known
entry states before mapping, but it is not a local traversal scope and is not the target of
`mappedJourneyRef`.

Mapping surfaces model drift, tracking gaps, deep links, menu jumps, and other out-of-model
movement. It does not assume every jump is an error.

## Normative Artifacts

This module is published through the following artifacts:

- `mapping.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/mapping`
- `mapping.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/mapping.context.jsonld`
- `mapping.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/mapping.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`
with the Mapping context.

## Terminology

- <dfn>JourneyMapping</dfn>: An addressable mapping record that binds one Runtime execution chain to
  the root Graph `Journey` used to interpret it. The mapped journey is a traversable topology, not a
  `JourneyEntryIndex`.
- <dfn>MappedStep</dfn>: An addressable mapping record for one `RuntimeEvent` in the mapped chain.
- <dfn>Mapped runtime</dfn>: The `JourneyExecution` whose causal `RuntimeEvent` chain is being
  resolved.
- <dfn>Mapped state</dfn>: A Graph `State` or `CompositeState` resolved from a
  `RuntimeEvent.stateRef`.
- <dfn>Relevant effective transition</dfn>: A Graph transition that can explain an observed movement
  between two resolved runtime states.
- <dfn>Jump</dfn>: A non-root mapped step where no relevant effective transition explains the
  observed movement.

## Mapping Model

A `JourneyMapping` links:

- `mapping:mappedRuntimeRef` to the Runtime `JourneyExecution` being mapped.
- `mapping:mappedJourneyRef` to the root Graph `Journey` for the interpreted execution.
- `mapping:mappedStepRef` to the `MappedStep` records for events in the runtime chain.

Each `MappedStep` links:

- `mapping:mappedEventRef` to the Runtime `RuntimeEvent` being interpreted.
- `mapping:mappedStateRef` to the resolved Graph `State` or `CompositeState`.
- `mapping:explainedByTransitionRef`, when present, to the effective `Transition` or
  `OutgoingTransition` that explains the movement.

Mapping does not serialize a separate step scope. For each `MappedStep`, the local Graph `Journey`
scope is derived from the referenced `RuntimeEvent`: resolve `RuntimeEvent.journeyInstanceRef` to
its `JourneyInstance`, then use that instance's `journeyRef`.

The Runtime event order remains defined by Runtime's causal chain: a root event followed by the
unique successor sequence obtained through `previousId`. `mappedStepRef` is a set of step records;
its JSON order is not normative.

## Ontology {data-cop-concept="ontology"}

The normative Mapping ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/mapping`.

:::include ./mapping.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Mapping JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/mapping.context.jsonld`.

:::include ./mapping.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative Mapping SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/mapping.shape`.

:::include ./mapping.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Runtime chain source:** A consumer mapping runtime behavior MUST reconstruct event order using
   the Runtime causal chain model.
2. **Step correspondence:** Each `MappedStep` MUST identify one `RuntimeEvent` in the mapped
   runtime chain through `mappedEventRef`.
3. **Local scope derivation:** For each `MappedStep`, the Consumer MUST resolve the referenced
   `RuntimeEvent.journeyInstanceRef` and use that [=JourneyInstance=]'s `journeyRef` as the step's
   local Graph `Journey` scope.
4. **State resolution:** Each `MappedStep.mappedStateRef` MUST be the Graph `State` or
   `CompositeState` resolved from its `RuntimeEvent.stateRef` in the derived local scope or imported
   documents.
5. **Journey ownership:** `mappedJourneyRef` identifies the root Graph `Journey` for the mapped
   execution. The root [=JourneyInstance=] of each mapped event's derived ancestor chain SHOULD
   reference the same Graph `Journey`.
   `mappedJourneyRef` MUST NOT reference a [=JourneyEntryIndex=].
6. **Step order:** Mapping does not define a separate step order. Consumers MUST order mapped steps
   by applying Runtime chain reconstruction to each step's `mappedEventRef`.
7. **Origin derivation:** The root event step is derived from the absence of
   `RuntimeEvent.previousId`. It records the starting resolved state and is not an observed movement.
8. **Same-instance transition lookup:** When the previous and current mapped steps have the same
   local [=JourneyInstance=], a non-root mapped step is explained when `explainedByTransitionRef`
   points to one relevant effective transition in that instance's local scope. A relevant effective
   transition is either:
   - a Graph `Transition` whose `from` is the previous resolved state and whose `to` is the current
     resolved state; or
   - an effective `OutgoingTransition` contributed by an `OutgoingTransitionGroup` referenced by the
     local scope, where the previous resolved state is in the local scope and the outgoing
     transition's `to` is the current resolved state.
9. **Subjourney entry lookup:** When the current event's derived ancestor chain enters a subjourney
   relative to the previous event's derived ancestor chain, the entering [=JourneyInstance=] SHOULD
   provide `viaStateRef`. A movement into the subjourney is explained only when
   `explainedByTransitionRef` points to a relevant effective transition in the parent scope whose
   `from` is the previous resolved state and whose `to` is the entering instance's `viaStateRef`.
10. **Subjourney exit lookup:** When the current event's derived ancestor chain exits a subjourney
   relative to the previous event's derived ancestor chain, the exiting [=JourneyInstance=] SHOULD
   provide `viaStateRef`. A movement out of the subjourney is explained only when
   `explainedByTransitionRef` points to a relevant effective transition in the parent scope whose
   `from` is the exiting instance's `viaStateRef` and whose `to` is the current resolved state.
11. **Multiple boundary changes:** If a movement enters or exits more than one journey boundary,
   Consumers MUST evaluate exits from the previous local instance toward the nearest common ancestor,
   then entries from that ancestor toward the current local instance. If any required `viaStateRef`
   or relevant effective transition is missing, the movement is a jump.
12. **Condition eligibility:** If a consumer implements [[UJG Conditions]], a guarded transition only
   explains a mapped step when the transition is eligible under Condition semantics.
13. **Jump derivation:** A non-root mapped step is a jump when no relevant effective transition
   explains the observed movement, or when a journey boundary movement lacks the `viaStateRef`
   needed to evaluate it. A jump is a derived processing result, not serialized Mapping vocabulary.
14. **No intent assumption:** A derived jump reports that the observed movement is not explained by
   the mapped graph. It does not by itself decide whether the movement is legitimate or erroneous.

## Minimal Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/mapping.context.jsonld"
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

## Nested Scope Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/mapping.context.jsonld"
  ],
  "@id": "https://example.com/ujg/mapping/nested-execution.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "JourneyExecution",
      "@id": "urn:ujg:execution:nested-1"
    },
    {
      "@type": "JourneyInstance",
      "@id": "urn:ujg:journey-instance:checkout:nested-1",
      "journeyRef": "urn:ujg:journey:checkout"
    },
    {
      "@type": "JourneyInstance",
      "@id": "urn:ujg:journey-instance:checkout:nested-1:payment",
      "journeyRef": "urn:ujg:journey:payment",
      "parentInstanceRef": "urn:ujg:journey-instance:checkout:nested-1",
      "viaStateRef": "urn:ujg:state:checkout-payment"
    },
    {
      "@type": "RuntimeEvent",
      "@id": "urn:ujg:event:nested-1:100",
      "executionId": "urn:ujg:execution:nested-1",
      "stateRef": "urn:ujg:state:cart",
      "journeyInstanceRef": "urn:ujg:journey-instance:checkout:nested-1"
    },
    {
      "@type": "RuntimeEvent",
      "@id": "urn:ujg:event:nested-1:200",
      "executionId": "urn:ujg:execution:nested-1",
      "previousId": "urn:ujg:event:nested-1:100",
      "stateRef": "urn:ujg:state:payment-card",
      "journeyInstanceRef": "urn:ujg:journey-instance:checkout:nested-1:payment"
    },
    {
      "@id": "urn:mapping:nested-1",
      "@type": "JourneyMapping",
      "mappedRuntimeRef": "urn:ujg:execution:nested-1",
      "mappedJourneyRef": "urn:ujg:journey:checkout",
      "mappedStepRef": [
        "urn:mapping:nested-1:100",
        "urn:mapping:nested-1:200"
      ]
    },
    {
      "@id": "urn:mapping:nested-1:100",
      "@type": "MappedStep",
      "mappedEventRef": "urn:ujg:event:nested-1:100",
      "mappedStateRef": "urn:ujg:state:cart"
    },
    {
      "@id": "urn:mapping:nested-1:200",
      "@type": "MappedStep",
      "mappedEventRef": "urn:ujg:event:nested-1:200",
      "mappedStateRef": "urn:ujg:state:payment-card",
      "explainedByTransitionRef": "urn:ujg:transition:cart-to-checkout-payment"
    }
  ]
}
```

The second mapped step resolves its local scope from
`urn:ujg:event:nested-1:200` to `urn:ujg:journey-instance:checkout:nested-1:payment`, whose
`journeyRef` is `urn:ujg:journey:payment`. The transition reference explains the boundary movement
into the payment subjourney through the entering instance's `viaStateRef`.
