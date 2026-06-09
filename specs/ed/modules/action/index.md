## Overview

This optional module defines a minimal graph-native vocabulary for attaching declared side effects
to Graph `Transition` and `OutgoingTransition` nodes.

Without an action primitive, implementations tend to hide form submission, API invocation, analytics
events, or navigate-with-payload behavior in opaque extensions. That makes a graph appear to advance
while the effect that caused the transition remains non-portable.

This first version is intentionally small. It declares that an effective transition has an associated
`Action`; it does not define transport protocols, API request formats, queues, form libraries,
analytics payloads, backend workers, or framework event handlers.

## Normative Artifacts

This module is published through the following artifacts:

- `action.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/action`
- `action.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/action.context.jsonld`
- `action.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/action.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`
with the Action context.

## Terminology

- <dfn>Action</dfn>: An addressable declaration of a side effect associated with a Graph transition
  edge.
- <dfn>Action attachment</dfn>: The relation that assigns a transition to an action declaration.

## Attachment Model

The module introduces one canonical interoperable attachment:

- `action:actionRef` links a Graph `Transition` or `OutgoingTransition` to an `Action`.

A transition without `actionRef` remains fully valid and traversable. Consumers MAY ignore this
module and still process the graph.

## Ontology {data-cop-concept="ontology"}

The normative Action ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/action`.

:::include ./action.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Action JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/action.context.jsonld`.

:::include ./action.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative Action SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/action.shape`.

:::include ./action.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Declaration only:** Action describes that a transition edge has an associated side effect; it
   does not define how that effect is invoked.
2. **Graph preservation:** `actionRef` MUST NOT create a hidden edge or change the `from`/`to`
   semantics of the host `Transition` or `OutgoingTransition`.
3. **Graceful degradation:** Consumers that do not implement this module MAY ignore Action semantics,
   but SHOULD preserve recognized JSON-LD data during read-transform-write when possible.
4. **Private contracts:** Transport, command, mutation, retry, idempotency, and result-handling
   details SHOULD remain in Core `extensions` unless a future optional module defines them as
   interoperable vocabulary.

## Minimal Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/action.context.jsonld"
  ],
  "@id": "https://example.com/ujg/action/checkout.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:transition:submit-payment",
      "@type": "Transition",
      "from": "urn:state:payment",
      "to": "urn:state:confirmation",
      "actionRef": "urn:action:authorize-payment"
    },
    {
      "@id": "urn:action:authorize-payment",
      "@type": "Action"
    }
  ]
}
```
