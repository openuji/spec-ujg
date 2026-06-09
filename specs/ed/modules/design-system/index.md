## Overview

This optional module defines a graph-native vocabulary for describing how design-system artifacts
realize Surface module resources.

The module is intentionally second-level. It depends on the Surface module as the bridge between
Graph topology and user-facing materialization. Graph nodes do not point to design-system artifacts,
and Surface resources remain design-system-agnostic.

The DesignSystem module introduces `SurfaceRealization` as the design-system-side bridge. A
`SurfaceRealization` references exactly one `Surface` and then identifies either a `Component` or a
`Template` as the primary realization. When a template is used, the realization may reference
`SlotBinding` nodes that fill template-declared `Slot` nodes.

This module is optional. It annotates the shared graph with interoperable design-system realization
resources, but it does not change graph topology, traversal rules, Surface attachment rules, import
resolution, rendering behavior, or runtime semantics.

## Normative Artifacts

This module is published through the following artifacts:

- `design-system.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/design-system`
- `design-system.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/design-system.context.jsonld`
- `design-system.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/design-system.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`
with the Surface and DesignSystem contexts.

Non-goals:

- This module does not define component implementation APIs, component props, component variants, or
  component lifecycle.
- This module does not define layout algorithms, rendering engines, framework adapters, responsive
  behavior, hydration behavior, or platform-specific UI behavior.
- This module does not define design-token syntax, token inheritance, token value resolution, or
  token path semantics.
- This module does not define accessibility implementation rules.
- This module does not introduce graph traversal, state activation, transition validity,
  composite-state containment, execution order, or lifecycle semantics.

## Terminology

- <dfn>DesignSystem</dfn>: A graph-native catalog or scope for design-system artifacts available to
  realize surfaces.
- <dfn>TokenSource</dfn>: An addressable token source, package, manifest, or token set. The internal
  token format is external to UJG.
- <dfn>Component</dfn>: An addressable design-system artifact that can realize a surface or fill a
  slot.
- <dfn>Template</dfn>: A reusable design-system artifact that declares slots.
- <dfn>Slot</dfn>: An addressable slot declaration owned by or referenced from a template.
- <dfn>SurfaceRealization</dfn>: A design-system-side node that references one surface and describes
  its primary component or template realization.
- <dfn>SlotBinding</dfn>: A realization-local binding from a template slot to one presentation
  target.

## Realization Model

A `Surface` is a design-system-agnostic materialized boundary for exactly one Graph subject. The
Surface module defines the relation between supported Graph subjects and `Surface`. This module does
not add properties to `Surface` and does not make `Surface` depend on design-system artifacts.

Design-system realization is expressed by `SurfaceRealization` nodes:

- A `DesignSystem` MAY reference `SurfaceRealization` nodes through `surfaceRealizationRefs`.
- A `SurfaceRealization` MUST reference exactly one `Surface`.
- A `SurfaceRealization` MUST reference exactly one primary realization, either `componentRef` or
  `templateRef`.
- A `Template` MAY declare `Slot` nodes through `slotRefs`.
- A template-backed `SurfaceRealization` MAY reference `SlotBinding` nodes through
  `slotBindingRefs`.
- A `SlotBinding` MUST reference exactly one `Slot` and exactly one target.

This shape allows multiple design systems to realize the same surface independently without changing
the surface or assigning multiple surfaces to the same graph subject.

## DesignSystem Catalog

A `DesignSystem` groups design-system artifacts and realizations available in a design-system
context. It is not a renderer and does not define component internals, layout rules, or token
syntax.

The catalog properties are:

- `tokenSourceRefs`: references zero or more `TokenSource` nodes.
- `componentRefs`: references zero or more `Component` nodes.
- `templateRefs`: references zero or more `Template` nodes.
- `surfaceRealizationRefs`: references zero or more `SurfaceRealization` nodes.

`TokenSource` identifies a token source, token package, token manifest, or token set. Individual
token names, token paths, token groups, token values, aliases, and inheritance rules are outside this
module.

## Templates And Slots

A `Template` declares reusable slots with `slotRefs`. A template MUST NOT hard-code concrete
surfaces, components, transitions, or outgoing transitions into those slots.

A `SurfaceRealization` that uses a `Template` references `SlotBinding` nodes. Each `SlotBinding`
references one declared slot and one target.

Allowed slot binding targets are:

- `targetSurfaceRef`
- `targetComponentRef`

When a `SlotBinding` targets a `Surface`, the target surface is composed into the slot for
presentation purposes only. The binding MUST NOT imply graph traversal, state activation, transition
validity, composite-state containment, execution order, or lifecycle semantics. A renderer, MCP
server, skill, or design-system resolver MAY resolve the graph-level subject associated with a target
surface through the Surface module.

If a transition, outgoing transition, or outgoing-transition group affordance belongs in a slot, the
Graph subject SHOULD reference its own `Surface` through the Surface module and the slot binding
SHOULD target that surface with `targetSurfaceRef`.

## Ontology {data-cop-concept="ontology"}

The normative DesignSystem ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/design-system`. It is the authoritative structural definition
for the classes and properties declared by this module.

:::include ./design-system.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative DesignSystem JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/design-system.context.jsonld`. It provides compact JSON-LD term
mappings and coercions for DesignSystem-specific properties and classes.

`surfaceRef` already exists in the Surface context for graph-subject attachment. To preserve that
existing term, this module maps the realization-side `surfaceRef` through the type-scoped context of
`SurfaceRealization`.

:::include ./design-system.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative DesignSystem SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/design-system.shape`. It is the authoritative validation
artifact for DesignSystem structural constraints.

:::include ./design-system.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Surface purity:** DesignSystem properties MUST NOT change Surface attachment semantics or make a
   Surface depend on design-system artifacts.
2. **Realization bridge:** A `SurfaceRealization` MUST reference exactly one `Surface`.
3. **Primary realization:** A `SurfaceRealization` MUST reference exactly one primary realization,
   either a `Component` or a `Template`.
4. **Template-only bindings:** `slotBindingRefs` MUST be used only by a `SurfaceRealization` that
   references a `Template`.
5. **Slot declaration vs binding:** `Template` slot references are declarations. `SurfaceRealization`
   slot bindings are concrete assembly for that realization.
6. **Single binding target:** A `SlotBinding` MUST reference exactly one target, either a `Surface`
   or a `Component`.
7. **Presentation only:** A slot binding to a surface MUST NOT imply graph traversal, state
   activation, transition validity, composite-state containment, execution order, or lifecycle
   semantics.
8. **Graceful degradation:** A consumer that does not implement this module MAY ignore DesignSystem
   semantics, but it SHOULD preserve recognized JSON-LD data during read-transform-write when
   possible.
9. **Private details:** Component internals, token syntax, framework adapters, render plans, and
   platform-specific behavior SHOULD remain outside this module unless a future module defines them
   as interoperable vocabulary.

## Example A: Surface Without Realization

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld"
  ],
  "@id": "https://example.com/ujg/surface-only.jsonld",
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

This example assigns a state to a surface. It does not declare any design-system realization.

## Example B: Component Realization

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/design-system.context.jsonld"
  ],
  "@id": "https://example.com/ujg/cart-component.jsonld",
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
    },
    {
      "@id": "urn:ds:acme",
      "@type": "DesignSystem",
      "componentRefs": ["urn:component:CartView"],
      "surfaceRealizationRefs": ["urn:realization:cart-web"]
    },
    {
      "@id": "urn:component:CartView",
      "@type": "Component"
    },
    {
      "@id": "urn:realization:cart-web",
      "@type": "SurfaceRealization",
      "surfaceRef": "urn:surface:cart",
      "componentRef": "urn:component:CartView"
    }
  ]
}
```

The surface remains unchanged. The design system owns the realization node that points to the
surface.

## Example C: Template Realization

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/design-system.context.jsonld"
  ],
  "@id": "https://example.com/ujg/refund-template.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:state:refund",
      "@type": "State",
      "label": "Refund request",
      "surfaceRef": "urn:surface:refund"
    },
    {
      "@id": "urn:surface:refund",
      "@type": "Surface"
    },
    {
      "@id": "urn:transition:submit-refund",
      "@type": "Transition",
      "from": "urn:state:refund",
      "to": "urn:state:refund-submitted",
      "surfaceRef": "urn:surface:submit-refund"
    },
    {
      "@id": "urn:surface:submit-refund",
      "@type": "Surface"
    },
    {
      "@id": "urn:ds:acme",
      "@type": "DesignSystem",
      "componentRefs": ["urn:component:RefundForm"],
      "templateRefs": ["urn:template:FormShell"],
      "surfaceRealizationRefs": ["urn:realization:refund-form"]
    },
    {
      "@id": "urn:component:RefundForm",
      "@type": "Component"
    },
    {
      "@id": "urn:template:FormShell",
      "@type": "Template",
      "slotRefs": ["urn:slot:main", "urn:slot:submit"]
    },
    {
      "@id": "urn:slot:main",
      "@type": "Slot"
    },
    {
      "@id": "urn:slot:submit",
      "@type": "Slot"
    },
    {
      "@id": "urn:binding:refund-main",
      "@type": "SlotBinding",
      "slotRef": "urn:slot:main",
      "targetComponentRef": "urn:component:RefundForm"
    },
    {
      "@id": "urn:binding:refund-submit",
      "@type": "SlotBinding",
      "slotRef": "urn:slot:submit",
      "targetSurfaceRef": "urn:surface:submit-refund"
    },
    {
      "@id": "urn:realization:refund-form",
      "@type": "SurfaceRealization",
      "surfaceRef": "urn:surface:refund",
      "templateRef": "urn:template:FormShell",
      "slotBindingRefs": ["urn:binding:refund-main", "urn:binding:refund-submit"]
    }
  ]
}
```

The template declares slots. The realization binds those slots for this surface.

## Example D: Composite Surface With Child Surfaces

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/design-system.context.jsonld"
  ],
  "@id": "https://example.com/ujg/product-discovery.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:state:product-discovery",
      "@type": "CompositeState",
      "label": "Product discovery",
      "stateRefs": [
        "urn:state:search-query",
        "urn:state:filters",
        "urn:state:results",
        "urn:state:product-preview"
      ],
      "surfaceRef": "urn:surface:product-discovery"
    },
    {
      "@id": "urn:state:search-query",
      "@type": "State",
      "label": "Search query",
      "surfaceRef": "urn:surface:search-query"
    },
    {
      "@id": "urn:state:filters",
      "@type": "State",
      "label": "Filters",
      "surfaceRef": "urn:surface:filters"
    },
    {
      "@id": "urn:state:results",
      "@type": "State",
      "label": "Results",
      "surfaceRef": "urn:surface:results"
    },
    {
      "@id": "urn:state:product-preview",
      "@type": "State",
      "label": "Product preview",
      "surfaceRef": "urn:surface:product-preview"
    },
    {
      "@id": "urn:surface:product-discovery",
      "@type": "Surface"
    },
    {
      "@id": "urn:surface:search-query",
      "@type": "Surface"
    },
    {
      "@id": "urn:surface:filters",
      "@type": "Surface"
    },
    {
      "@id": "urn:surface:results",
      "@type": "Surface"
    },
    {
      "@id": "urn:surface:product-preview",
      "@type": "Surface"
    },
    {
      "@id": "urn:template:ProductDiscovery",
      "@type": "Template",
      "slotRefs": ["urn:slot:search", "urn:slot:filters", "urn:slot:results", "urn:slot:preview"]
    },
    {
      "@id": "urn:slot:search",
      "@type": "Slot"
    },
    {
      "@id": "urn:slot:filters",
      "@type": "Slot"
    },
    {
      "@id": "urn:slot:results",
      "@type": "Slot"
    },
    {
      "@id": "urn:slot:preview",
      "@type": "Slot"
    },
    {
      "@id": "urn:binding:search",
      "@type": "SlotBinding",
      "slotRef": "urn:slot:search",
      "targetSurfaceRef": "urn:surface:search-query"
    },
    {
      "@id": "urn:binding:filters",
      "@type": "SlotBinding",
      "slotRef": "urn:slot:filters",
      "targetSurfaceRef": "urn:surface:filters"
    },
    {
      "@id": "urn:binding:results",
      "@type": "SlotBinding",
      "slotRef": "urn:slot:results",
      "targetSurfaceRef": "urn:surface:results"
    },
    {
      "@id": "urn:binding:preview",
      "@type": "SlotBinding",
      "slotRef": "urn:slot:preview",
      "targetSurfaceRef": "urn:surface:product-preview"
    },
    {
      "@id": "urn:realization:product-discovery",
      "@type": "SurfaceRealization",
      "surfaceRef": "urn:surface:product-discovery",
      "templateRef": "urn:template:ProductDiscovery",
      "slotBindingRefs": [
        "urn:binding:search",
        "urn:binding:filters",
        "urn:binding:results",
        "urn:binding:preview"
      ]
    },
    {
      "@id": "urn:ds:commerce",
      "@type": "DesignSystem",
      "templateRefs": ["urn:template:ProductDiscovery"],
      "surfaceRealizationRefs": ["urn:realization:product-discovery"]
    }
  ]
}
```

The composite state's surface is realized as a shell. The child surfaces are placed into slots for
presentation only; Graph remains the source of containment and traversal semantics.

## Example E: Multiple Design Systems

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/design-system.context.jsonld"
  ],
  "@id": "https://example.com/ujg/multiple-design-systems.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:state:checkout",
      "@type": "State",
      "label": "Checkout",
      "surfaceRef": "urn:surface:checkout"
    },
    {
      "@id": "urn:surface:checkout",
      "@type": "Surface"
    },
    {
      "@id": "urn:component:WebCheckout",
      "@type": "Component"
    },
    {
      "@id": "urn:component:KioskCheckout",
      "@type": "Component"
    },
    {
      "@id": "urn:component:CliCheckout",
      "@type": "Component"
    },
    {
      "@id": "urn:realization:checkout-web",
      "@type": "SurfaceRealization",
      "surfaceRef": "urn:surface:checkout",
      "componentRef": "urn:component:WebCheckout"
    },
    {
      "@id": "urn:realization:checkout-kiosk",
      "@type": "SurfaceRealization",
      "surfaceRef": "urn:surface:checkout",
      "componentRef": "urn:component:KioskCheckout"
    },
    {
      "@id": "urn:realization:checkout-cli",
      "@type": "SurfaceRealization",
      "surfaceRef": "urn:surface:checkout",
      "componentRef": "urn:component:CliCheckout"
    },
    {
      "@id": "urn:ds:web",
      "@type": "DesignSystem",
      "componentRefs": ["urn:component:WebCheckout"],
      "surfaceRealizationRefs": ["urn:realization:checkout-web"]
    },
    {
      "@id": "urn:ds:kiosk",
      "@type": "DesignSystem",
      "componentRefs": ["urn:component:KioskCheckout"],
      "surfaceRealizationRefs": ["urn:realization:checkout-kiosk"]
    },
    {
      "@id": "urn:ds:cli",
      "@type": "DesignSystem",
      "componentRefs": ["urn:component:CliCheckout"],
      "surfaceRealizationRefs": ["urn:realization:checkout-cli"]
    }
  ]
}
```

The same surface can be realized by several design systems. The surface identity remains stable.

## MCP And Tooling Resolution

MCP servers, skills, AI tooling, design-system resolvers, and renderers MAY use referenced node IDs
plus active graph context to fetch implementation details. Those details can include framework
components, source files, Storybook entries, token files, runtime render plans, or platform adapters.

This module intentionally standardizes only the graph-native references needed for interoperability.
It does not duplicate design-system implementation catalogs or renderer configuration.

## Relationship To Core Extensions

Core `extensions` remains available for vendor-private, non-interoperable payloads. Component,
template, slot, slot-binding, surface-realization, and token-source relationships intended for
interoperability SHOULD use this module instead of opaque extension payloads.
