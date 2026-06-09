## Overview

This optional module defines a graph-native vocabulary for assigning a Graph subject to its own
addressable `Surface`.

A `Surface` identifies the design-system-agnostic materialized interface boundary for one graph
subject. Supported graph subjects are `State`, `CompositeState`, `Transition`,
`OutgoingTransition`, and `OutgoingTransitionGroup`. A surface may represent a page, screen, dialog,
prompt, frame, application shell, transition affordance, action bar, reusable choice group, or other
user-facing boundary. The relation is intentionally one-to-one. A single `Surface` is not a reusable
scaffold shared by many graph subjects.

This module is optional. It annotates the shared graph with surface identity, but it does not change
graph topology, traversal rules, import resolution, rendering behavior, or runtime semantics.
It also does not define how a surface is realized by a design system.

## Normative Artifacts

This module is published through the following artifacts:

- `surface.ttl`: ontology, published at `https://ujg.specs.openuji.org/tr/2026.06/ns/surface`
- `surface.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/tr/2026.06/ns/surface.context.jsonld`
- `surface.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/tr/2026.06/ns/surface.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/tr/2026.06/ns/context.jsonld`
with the Surface context.

Non-goals:

- This module does not define rendering engines, widget libraries, styling systems, hydration
  behavior, component trees, region trees, layout semantics, or presentation semantics.
- This module does not define references from `Surface` to `DesignSystem`, `Component`, `Template`,
  `Slot`, `SlotBinding`, `TokenSource`, or `SurfaceRealization` resources.
- This module does not introduce new traversal semantics beyond UJG Graph.
- This module does not replace opaque vendor-private hints carried in UJG Core `extensions`.

## Terminology

- <dfn>Surface</dfn>: An addressable, design-system-agnostic materialized boundary for exactly one
  Graph subject.
- <dfn>Surface attachment</dfn>: The relation that assigns a graph subject to its surface.

## Attachment Model

The module introduces one canonical interoperable attachment:

- `surface:surfaceRef` links a Graph subject to a `Surface`.

Allowed graph subjects are:

- `State`
- `CompositeState`
- `Transition`
- `OutgoingTransition`
- `OutgoingTransitionGroup`

`surfaceRef` is the canonical assignment form.

A graph subject without `surfaceRef` remains fully valid and traversable. Consumers MAY ignore this
module and still process the graph.

A `Surface` MUST be assigned to exactly one Graph subject in the validated document set using
`surfaceRef`. Producers SHOULD use one `Surface` resource per realized graph subject.

A `CompositeState` MAY have its own `Surface` when the composite state has a user-facing material
boundary as a whole, such as a shell, frame, scaffold, wizard frame, dashboard region, checkout
shell, kiosk session frame, or settings layout. A composite-state surface does not replace child
state surfaces and does not define containment beyond Graph semantics.

Transition and outgoing-transition surfaces represent user-facing transition affordances or
invocation boundaries. They MUST NOT imply transition execution, transition availability, traversal,
state activation, ordering, or lifecycle semantics.

An `OutgoingTransitionGroup` MAY have its own `Surface`. Each child `OutgoingTransition` MAY also
have its own `Surface`. These surfaces are independent: the group surface represents the group-level
presentation boundary, while each outgoing-transition surface represents that outgoing transition's
own affordance. A group surface does not override, inherit into, or replace child outgoing-transition
surfaces. If both are present, consumers MAY materialize the group surface as a container and child
outgoing-transition surfaces as individual affordances, but this remains presentation only and MUST
NOT change outgoing-transition injection, traversal, transition availability, state activation, or
Graph validity.

Multi-platform, multi-renderer, or multi-design-system output SHOULD NOT be represented by assigning
multiple surfaces to the same graph subject. Such alternatives belong in realization resources
defined by modules that depend on Surface.

## Ontology {data-cop-concept="ontology"}

The normative Surface ontology is defined below and is published at
`https://ujg.specs.openuji.org/tr/2026.06/ns/surface`. It is the authoritative structural definition for
`Surface` and `surfaceRef`.

:::include ./surface.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Surface JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/tr/2026.06/ns/surface.context.jsonld`. It provides the compact JSON-LD term
mappings and coercions for Surface-specific properties and classes.

:::include ./surface.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative Surface SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/tr/2026.06/ns/surface.shape`. It is the authoritative validation artifact for
Surface structural constraints.

:::include ./surface.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Attachment only:** Surface properties MUST NOT change Graph validity, graph traversal behavior,
   import resolution, or core node identity.
2. **One-to-one surface identity:** A `Surface` MUST identify exactly one Graph subject, and a graph
   subject MUST NOT be assigned to more than one `Surface`.
3. **Canonical direction:** `surfaceRef` is the canonical assignment from graph subject to surface.
4. **Graceful degradation:** A consumer that does not implement this module MAY ignore Surface
   semantics, but it SHOULD preserve recognized JSON-LD data during read-transform-write when
   possible.
5. **Design-system agnostic:** Surface properties MUST NOT define or imply design-system
   realization, component selection, template selection, slot binding, token-source selection, or
   rendering behavior.
6. **Interoperable realization:** Component, template, slot, slot-binding, token-source, and
   surface-realization relationships intended for interoperability SHOULD be expressed by an optional
   module that depends on Surface.

## State Surface Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/tr/2026.06/ns/context.jsonld",
    "https://ujg.specs.openuji.org/tr/2026.06/ns/surface.context.jsonld"
  ],
  "@id": "https://example.com/ujg/surface/checkout.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:state:cart",
      "@type": "State",
      "label": "Cart",
      "surfaceRef": "urn:surface:cart"
    },
    {
      "@id": "urn:surface:cart",
      "@type": "Surface"
    }
  ]
}
```

This example means:

- `cart` has its own addressable surface identity.
- `urn:surface:cart` is not a reusable template for other states.
- the graph remains the only source of truth for state and transition behavior.

## Transition Surface Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/tr/2026.06/ns/context.jsonld",
    "https://ujg.specs.openuji.org/tr/2026.06/ns/surface.context.jsonld"
  ],
  "@id": "https://example.com/ujg/surface/transition.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:state:cart",
      "@type": "State",
      "label": "Cart"
    },
    {
      "@id": "urn:state:checkout",
      "@type": "State",
      "label": "Checkout"
    },
    {
      "@id": "urn:transition:checkout",
      "@type": "Transition",
      "from": "urn:state:cart",
      "to": "urn:state:checkout",
      "surfaceRef": "urn:surface:checkout-action"
    },
    {
      "@id": "urn:surface:checkout-action",
      "@type": "Surface"
    }
  ]
}
```

This example assigns a surface to the user-facing affordance for a transition. It does not execute
the transition or change traversal semantics.

## Outgoing Transition Group Surface Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/tr/2026.06/ns/context.jsonld",
    "https://ujg.specs.openuji.org/tr/2026.06/ns/surface.context.jsonld"
  ],
  "@id": "https://example.com/ujg/surface/outgoing-group.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:outgoing:home",
      "@type": "OutgoingTransition",
      "to": "urn:state:home",
      "surfaceRef": "urn:surface:home-action"
    },
    {
      "@id": "urn:outgoing:profile",
      "@type": "OutgoingTransition",
      "to": "urn:state:profile"
    },
    {
      "@id": "urn:outgoing-group:global-nav",
      "@type": "OutgoingTransitionGroup",
      "outgoingTransitionRefs": ["urn:outgoing:home", "urn:outgoing:profile"],
      "surfaceRef": "urn:surface:global-nav"
    },
    {
      "@id": "urn:surface:global-nav",
      "@type": "Surface"
    },
    {
      "@id": "urn:surface:home-action",
      "@type": "Surface"
    }
  ]
}
```

The group surface represents the shared navigation boundary. The child outgoing-transition surface
represents that outgoing transition's own affordance. Neither surface overrides the other.

## Appendix: Private Extension Payloads {.unnumbered}

Core `extensions` remains available for private data that is not intended to participate in
interoperable Surface semantics.

```json
{
  "@id": "urn:surface:cart",
  "@type": "Surface",
  "extensions": {
    "com.acme.audit": {
      "reviewTicket": "ACME-1234"
    }
  }
}
```
