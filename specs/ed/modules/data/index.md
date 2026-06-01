## Overview

This optional module defines a minimal graph-native vocabulary for attaching data context or binding
identity to Graph `State` and `CompositeState` nodes.

Without a data primitive, implementations tend to invent incompatible state-management,
data-context, and binding conventions inside opaque extensions. This module gives producers a shared
place to say which addressable data resource belongs to a state-like node while leaving lifecycle and
runtime details for later work.

This first version is intentionally small. It declares that a state-like node has an associated
`Data` resource; it does not define schemas, reactive stores, fetch policies, cache directives,
lifecycle status, authentication context, or realtime behavior.

## Normative Artifacts

This module is published through the following artifacts:

- `data.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/data`
- `data.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/data.context.jsonld`
- `data.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/data.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`
with the Data context.

## Terminology

- <dfn>Data</dfn>: An addressable declaration of data context or binding identity for a Graph
  state-like node.
- <dfn>Data attachment</dfn>: The relation that assigns a state to a data declaration.

## Attachment Model

The module introduces one canonical interoperable attachment:

- `data:dataRef` links a Graph `State` or `CompositeState` to `Data`.

A state without `dataRef` remains fully valid and traversable. Consumers MAY ignore this module and
still process the graph.

## Ontology {data-cop-concept="ontology"}

The normative Data ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/data`.

:::include ./data.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Data JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/data.context.jsonld`.

:::include ./data.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative Data SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/data.shape`.

:::include ./data.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Declaration only:** Data describes that a state-like node has associated data identity; it does
   not define how the data is loaded, updated, cached, or observed.
2. **Shared data identity:** Multiple state-like nodes MAY reference the same `Data` resource when
   they intentionally share a data context or binding identity.
3. **Graph preservation:** `dataRef` MUST NOT change Graph topology or traversal semantics.
4. **Graceful degradation:** Consumers that do not implement this module MAY ignore Data semantics,
   but SHOULD preserve recognized JSON-LD data during read-transform-write when possible.
5. **Private lifecycle details:** Fetch policy, cache behavior, lifecycle status, and reactive-store
   bindings SHOULD remain in Core `extensions` unless a future optional module defines them as
   interoperable vocabulary.

## Minimal Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/data.context.jsonld"
  ],
  "@id": "https://example.com/ujg/data/checkout.jsonld",
  "@type": "UJGDocument",
  "specVersion": "1.0",
  "nodes": [
    {
      "@id": "urn:state:payment",
      "@type": "State",
      "label": "Payment",
      "dataRef": "urn:data:checkout-draft"
    },
    {
      "@id": "urn:data:checkout-draft",
      "@type": "Data"
    }
  ]
}
```
