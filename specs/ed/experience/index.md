## Overview

This module defines a vocabulary for **experience semantics** traditionally found in User Journey Maps (e.g., steps, touchpoints, phases, pain points). It **annotates** [[UJG Graph]] without changing graph topology.

## Normative Artifacts

This module is published through the following artifacts:

- `experience.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/experience`
- `experience.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/experience.context.jsonld`
- `experience.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/experience.shape`

Examples in this page use an explicit context array composed from the published module contexts. The same composition is also published as the convenience context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`.

**Non-goals:**

* This module does **not** define new traversal rules.
* This module does **not** affect Graph validity.

---

## Terminology

* <dfn>ExperienceStep</dfn>: A semantic grouping representing a “step” in a journey map. Not necessarily 1:1 with [=State=].
* <dfn>Touchpoint</dfn>: A channel/surface where the experience occurs (e.g., web, mobile app, email, in-store).
* <dfn>Phase</dfn>: A high-level stage used for grouping (e.g., awareness, checkout).
* <dfn>PainPoint</dfn>: A named issue or friction hypothesis attached to part of the intended experience.

---

## Annotation Model

Experience annotations add semantic grouping and interpretation to a graph without changing traversal behavior. The normative structural definition is provided by the ontology below; the context and shape that follow also show the shared Graph terms reused by this module, including `label`, `tags`, and `stateRefs`.

`experienceRefs` records the journey steps a `PainPoint` annotates. Its values reference one or more `ExperienceStep` nodes, which in turn reference the underlying Graph states through `stateRefs`; it does not define new graph topology.

**Notes:**

* A Step **MUST NOT** imply traversal order. Order is defined only by [[UJG Graph]] transitions.
* A Step **MAY** include multiple states; multiple steps **MAY** reference the same state (e.g., when a state serves multiple intents).

## Ontology {data-cop-concept="ontology"}

The normative Experience ontology is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/experience`. It is the authoritative structural definition for `ExperienceStep`, `Touchpoint`, `Phase`, `PainPoint`, and the Experience-specific properties declared by this module.

:::include ./experience.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Experience JSON-LD context is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/experience.context.jsonld`. It provides the compact JSON-LD term mappings for the Experience vocabulary and the shared Graph terms reused by Experience examples.

:::include ./experience.context.jsonld :::

---

## Validation {data-cop-concept="validation"}

The normative Experience SHACL shape is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/experience.shape`. It is the authoritative validation artifact for Experience structural constraints and shared-term usage.

:::include ./experience.shape.ttl :::

The rules below define the remaining resolution and non-structural constraints for Experience annotations.

1. **Resolution:** Every ID in `stateRefs` **MUST** resolve to a [=State=] or [=CompositeState=]; every ID in `experienceRefs` **MUST** resolve to an [=ExperienceStep=]; `phaseRef` **MUST** resolve to a [=Phase=]; and every ID in `touchpointRefs` **MUST** resolve to a [=Touchpoint=]. All referenced IDs **MUST** be within the current scope or imported modules.
2. **Non-Structural:** Experience objects **MUST NOT** introduce additional traversal semantics beyond [[UJG Graph]].

---

## Appendix: Combined JSON Example {.unnumbered}

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
  "@id": "https://example.com/ujg/experience/checkout.jsonld",
  "@type": "UJGDocument",
  "specVersion": "1.0",
  "nodes": [
    { "@type": "State", "@id": "urn:ujg:state:shipping-form", "label": "Shipping" },

    { "@type": "State", "@id": "urn:ujg:state:payment", "label": "Payment" },

    { "@type": "Phase", "@id": "urn:ujg:phase:checkout", "label": "Checkout", "order": 2 },

    { "@type": "Touchpoint", "@id": "urn:ujg:touchpoint:web", "label": "Web", "channel": "web" },

    {
      "@type": "ExperienceStep",
      "@id": "urn:ujg:step:enter-shipping",
      "label": "Enter shipping details",
      "stateRefs": ["urn:ujg:state:shipping-form"],
      "phaseRef": "urn:ujg:phase:checkout",
      "touchpointRefs": ["urn:ujg:touchpoint:web"]
    },

    {
      "@type": "ExperienceStep",
      "@id": "urn:ujg:step:enter-payment",
      "label": "Enter payment details",
      "stateRefs": ["urn:ujg:state:payment"],
      "phaseRef": "urn:ujg:phase:checkout",
      "touchpointRefs": ["urn:ujg:touchpoint:web"]
    },

    {
      "@type": "PainPoint",
      "@id": "urn:ujg:pain:address-validation",
      "label": "Address validation friction",
      "severity": 0.7,
      "experienceRefs": [
        "urn:ujg:step:enter-shipping",
        "urn:ujg:step:enter-payment"
      ]
    },

    {
      "@type": "JourneyExecution",
      "@id": "urn:ujg:execution:12345",
      "eventRefs": ["urn:ujg:event:12345:100"]
    },

    {
      "@type": "RuntimeEvent",
      "@id": "urn:ujg:event:12345:100",
      "executionId": "urn:ujg:execution:12345",
      "stateRef": "urn:ujg:state:shipping-form"
    }
  ]
}
```
