## Overview

This optional module defines a minimal graph-native vocabulary for attaching state data context or
binding identity to Graph `State` and `CompositeState` nodes.

Without a state data primitive, implementations tend to invent incompatible state-management,
data-context, and binding conventions inside opaque extensions. This module gives producers a shared
place to say which addressable state data declaration belongs to a state-like node while leaving
lifecycle and runtime details for later work.

This first version is intentionally small. It declares that a state-like node has an associated
`StateData` resource; it does not define schemas, reactive stores, fetch policies, cache
directives, lifecycle status, authentication context, or realtime behavior.

State Data is not the general resource primitive for UJG. Portable resources that are produced,
consumed, or exchanged during a journey are modeled by the Artifact module.

## Normative Artifacts

This module is published through the following artifacts:

- `state-data.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/state-data`
- `state-data.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/state-data.context.jsonld`
- `state-data.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/state-data.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`
with the State Data context.

## Terminology

- <dfn>StateData</dfn>: An addressable declaration of data context or binding identity for a Graph
  state-like node.
- <dfn>State data attachment</dfn>: The relation that assigns a state-like node to a state data
  declaration.

## Attachment Model

The module introduces one canonical interoperable attachment:

- `stateData:stateDataRef` links a Graph `State` or `CompositeState` to `StateData`.

A state without `stateDataRef` remains fully valid and traversable. Consumers MAY ignore this
module and still process the graph.

State Data and Artifact intentionally remain separate. Use `StateData` when a state-like graph node
needs a stable data-context or binding identity. Use `Artifact` when a file, archive, report,
invite, media object, token, protocol object, or other portable resource is produced, consumed, or
exchanged. If the same external thing is both the context behind a state and a transferred resource,
model separate `StateData` and `Artifact` nodes unless a future module defines an explicit
relationship between them.

## Ontology {data-cop-concept="ontology"}

The normative State Data ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/state-data`.

:::include ./state-data.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative State Data JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/state-data.context.jsonld`.

:::include ./state-data.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative State Data SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/state-data.shape`.

:::include ./state-data.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Declaration only:** State Data describes that a state-like node has associated state data
   identity; it does not define how the data is loaded, updated, cached, or observed.
2. **Shared state data identity:** Multiple state-like nodes MAY reference the same `StateData`
   resource when they intentionally share a data context or binding identity.
3. **Graph preservation:** `stateDataRef` MUST NOT change Graph topology or traversal semantics.
4. **Artifact boundary:** `StateData` MUST NOT be interpreted as a produced, consumed, or exchanged
   resource. Use Artifact for portable resource identity.
5. **Graceful degradation:** Consumers that do not implement this module MAY ignore State Data
   semantics, but SHOULD preserve recognized JSON-LD data during read-transform-write when possible.
6. **Private lifecycle details:** Fetch policy, cache behavior, lifecycle status, and reactive-store
   bindings SHOULD remain in Core `extensions` unless a future optional module defines them as
   interoperable vocabulary.

## Minimal Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/state-data.context.jsonld"
  ],
  "@id": "https://example.com/ujg/state-data/checkout.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:state:payment",
      "@type": "State",
      "label": "Payment",
      "stateDataRef": "urn:statedata:checkout-draft"
    },
    {
      "@id": "urn:statedata:checkout-draft",
      "@type": "StateData"
    }
  ]
}
```
