## Overview

This optional module defines the smallest possible graph-native vocabulary for assigning one or more Graph States to the same reusable template.

Its purpose is narrow:

* organize states by shared template
* keep the graph as the single source of truth for behavior
* avoid component registries, region trees, rendering taxonomies, or UI-specific semantics in the spec

This module is optional. It annotates the shared graph with template attachments, but it does not change graph topology, traversal rules, import resolution, or runtime semantics.

## Normative Artifacts

This module is published through the following artifacts:

* `templates.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/templates`
* `templates.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/templates.context.jsonld`
* `templates.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/templates.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/ed/ns/context.jsonld` with the Templates context.

The Templates context MUST define at least the following JSON-LD terms:

```json
{
  "@context": {
    "templates": "https://ujg.specs.openuji.org/ed/ns/templates#",
    "Template": "https://ujg.specs.openuji.org/ed/ns/templates#Template",
    "templateRef": {
      "@id": "https://ujg.specs.openuji.org/ed/ns/templates#templateRef",
      "@type": "@id"
    },
    "stateRefs": {
      "@id": "https://ujg.specs.openuji.org/ed/ns/templates#stateRefs",
      "@type": "@id",
      "@container": "@set"
    }
  }
}
```

Non-goals:

* This module does not define rendering engines, widget libraries, styling systems, or hydration behavior.
* This module does not define component trees, region trees, layout semantics, or presentation semantics.
* This module does not introduce new traversal semantics beyond UJG Graph.
* This module does not replace opaque vendor-private hints carried in UJG Core `extensions`.

## Terminology

* **Template:** A reusable render scaffold that multiple states may share.
* **Template Attachment:** The relation that assigns a state to a template.

## Attachment Model

The module introduces one canonical interoperable attachment:

* `templates:templateRef` links a Graph State to a `Template`.

The module also allows one secondary attachment form for overlay documents:

* `templates:stateRefs` links a `Template` to one or more Graph States.

`templateRef` is the canonical assignment form.

`stateRefs` is an alternative attachment form intended for overlay packaging, such as cases where the base graph is externally owned, read-only, or published separately from a template pack.

A state without `templateRef` remains fully valid and traversable. Consumers MAY ignore this module and still process the graph.

If `templateRef` and `stateRefs` are both present across the same document set, they MUST resolve to the same state-template assignments. A mismatch is invalid.

Producers SHOULD use only one attachment direction within a document set unless cross-document overlay compatibility requires both forms.

## Ontology (first-pass sketch)

```turtle
@prefix ujg: <https://ujg.specs.openuji.org/ed/ns/core#> .
@prefix ujggraph: <https://ujg.specs.openuji.org/ed/ns/graph#> .
@prefix ujgtemplates: <https://ujg.specs.openuji.org/ed/ns/templates#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dct: <http://purl.org/dc/terms/> .

<https://ujg.specs.openuji.org/ed/ns/templates#> a owl:Ontology ;
  rdfs:label "UJG Templates Editor's Draft Vocabulary"@en ;
  dct:description "UJG Templates ontology declaration" .

ujgtemplates:Template a owl:Class ;
  rdfs:subClassOf ujg:Node .

ujgtemplates:templateRef a owl:ObjectProperty ;
  rdfs:domain ujggraph:State ;
  rdfs:range ujgtemplates:Template .

ujgtemplates:stateRefs a owl:ObjectProperty ;
  rdfs:domain ujgtemplates:Template ;
  rdfs:range ujggraph:State .
```

## Processing Model

A consumer that supports Templates processes it as follows:

1. Resolve the current Graph State.
2. Read its `templateRef`, if present.
3. If `templateRef` is absent, consumers MAY resolve template assignment through any `Template` resources whose `stateRefs` include the current state.
4. Treat states assigned to the same `Template` as sharing the same render scaffold.

A consumer MAY additionally derive template-relevant transition sets from Graph by resolving transitions whose `from` or `to` targets states assigned to the same template.

When such derivation is used, consumers SHOULD distinguish:

* **internal transitions:** transitions whose `from` and `to` both target states assigned to the same template
* **entry transitions:** transitions whose `to` targets a state assigned to the template and whose `from` does not
* **exit transitions:** transitions whose `from` targets a state assigned to the template and whose `to` does not

These derived transition sets are consumer-side interpretations only. They do not create new graph semantics, and they MUST NOT be stored as template-owned transition registries in the interoperable model.

This module does not define what the scaffold looks like, how actions are placed, or how a concrete renderer must implement the template.

## Design Constraints

* Templates is an attachment module, not a second graph.
* Templates MUST NOT duplicate or redefine transition topology.
* Templates MUST NOT define rendering semantics beyond shared template identity.
* Templates MUST NOT define template-owned transition registries as interoperable semantics.
* `templateRef` is the canonical assignment form.
* `stateRefs` MAY be used as a secondary overlay attachment form.
* Multiple states MAY reference the same template.
* A state MAY omit `templateRef`.
* Consumers MAY ignore templates and still traverse the graph.
* Producers SHOULD use templates only when shared scaffold identity is intended to be portable.

## Minimal example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/templates.context.jsonld"
  ],
  "@graph": [
    {
      "@id": "urn:state:cart",
      "@type": "State",
      "templateRef": "urn:template:checkout"
    },
    {
      "@id": "urn:state:coupon-open",
      "@type": "State",
      "templateRef": "urn:template:checkout"
    },
    {
      "@id": "urn:state:confirmation",
      "@type": "State",
      "templateRef": "urn:template:receipt"
    },
    {
      "@id": "urn:template:checkout",
      "@type": "Template",
      "stateRefs": [
        "urn:state:cart",
        "urn:state:coupon-open"
      ]
    },
    {
      "@id": "urn:template:receipt",
      "@type": "Template",
      "stateRefs": [
        "urn:state:confirmation"
      ]
    }
  ]
}
```

This example means:

* `cart` and `coupon-open` share the same template
* `confirmation` uses a different template
* the reverse `stateRefs` assignments express the same membership as the forward `templateRef` assignments
* the graph still remains the only source of truth for state and transition behavior

## Appendix: Opaque Runtime Hints {.unnumbered}

```json
{
  "@id": "urn:template:checkout",
  "@type": "templates:Template",
  "label": "Checkout Template",
  "extensions": {
    "com.acme.renderer": {
      "component": "CheckoutShell",
      "hydration": "eager"
    }
  }
}
```
