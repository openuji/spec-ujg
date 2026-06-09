## Overview

This optional module defines a graph-native vocabulary for attaching routing metadata to UJG nodes.
It lets a producer bind any addressable node to a reusable `Route` resource through
`routing:routeRef` instead of hiding route names, path templates, or fallback targets inside opaque
Core `extensions`.

This module is optional. It annotates the shared graph with routing resources, but it does **not**
change graph topology, traversal rules, or import resolution.

## Normative Artifacts

This module is published through the following artifacts:

- `routing.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/routing`
- `routing.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/routing.context.jsonld`
- `routing.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/routing.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`
with the Routing context.

**Non-goals:**

* This module does **not** define router execution, redirect policies, or platform-specific path matching.
* This module does **not** introduce new traversal semantics beyond [[UJG Graph]].
* This module does **not** replace opaque vendor-private hints carried in [[UJG Core]] `extensions`.

## Terminology

* <dfn>Route</dfn>: An addressable routing resource that carries path, deep-link, and fallback metadata.

---

## Attachment Model

The module introduces real JSON-LD terms and RDF edges for routing attachment:

* `routing:routeRef` links any UJG node to a `Route`.
* `routing:fallbackNodeRef` links a `Route` to a fallback UJG node.

The module also defines non-reference properties such as `routing:routeName`, `routing:path`,
`routing:deepLink`, `routing:guards`, and JSON-valued `routing:params`.

## Ontology {data-cop-concept="ontology"}

The normative Routing ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/routing`. It is the authoritative structural definition for
`Route` and the properties declared by this module.

:::include ./routing.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Routing JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/routing.context.jsonld`. It provides the compact JSON-LD term
mappings and coercions for Routing-specific properties and classes.

:::include ./routing.context.jsonld :::

---

## Validation {data-cop-concept="validation"}

The normative Routing SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/routing.shape`. It is the authoritative validation artifact for
Routing structural constraints.

:::include ./routing.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Attachment only:** Routing properties **MUST NOT** change Graph validity, graph traversal
   behavior, import resolution, or core node identity.
2. **Fallback resolution:** Every `routing:fallbackNodeRef` **MUST** resolve to a UJG node within
   the current scope or imported modules.
3. **Graceful degradation:** A consumer that does not implement this module **MAY** ignore Routing
   semantics, but it **SHOULD** preserve recognized JSON-LD data during read-transform-write when
   possible.
4. **Private runtime hints:** Platform-specific router configuration that is not intended for shared
   queryability or validation **SHOULD** remain in Core `extensions`.

---

## Appendix: Combined JSON Example {.unnumbered}

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/routing.context.jsonld"
  ],
  "@id": "https://example.com/ujg/routing/checkout.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "State",
      "@id": "urn:ujg:state:checkout.shipping",
      "label": "Shipping",
      "routing:routeRef": "urn:routing:route:checkout-shipping"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:cart",
      "label": "Cart"
    },
    {
      "@type": "routing:Route",
      "@id": "urn:routing:route:checkout-shipping",
      "routing:routeName": "checkout-shipping",
      "routing:path": "/checkout/shipping",
      "routing:deepLink": "myapp://checkout/shipping",
      "routing:guards": ["cart-not-empty", "user-authenticated"],
      "routing:params": {
        "market": ":market",
        "locale": ":locale"
      },
      "routing:fallbackNodeRef": "urn:ujg:state:cart"
    }
  ]
}
```

## Appendix: Opaque Runtime Hints {.unnumbered}

```json
{
  "@id": "urn:routing:route:checkout-shipping",
  "@type": "routing:Route",
  "routing:routeName": "checkout-shipping",
  "routing:path": "/checkout/shipping",
  "extensions": {
    "com.acme.router": {
      "prefetch": "intent",
      "cachePolicy": "stale-while-revalidate"
    }
  }
}
```
