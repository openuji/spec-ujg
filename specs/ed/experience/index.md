## Overview

This module defines a vocabulary for **experience semantics** traditionally found in User Journey Maps (e.g., steps, touchpoints, phases, pain points). It **annotates** [[UJG Graph]] without changing graph topology.

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

## Data Model

### ExperienceStep

An [=ExperienceStep=] **MUST** include:
* `type`: `"ExperienceStep"`
* `id`: Unique URI.
* `label`: Human-readable string.
* `stateRefs`:  Array of IDs of [=State=] or [=CompositeState=] Nodes.

An [=ExperienceStep=] **MAY** include:

* `phaseRef`: ID of a [=Phase=].
* `touchpointRefs`: Array of IDs of [=Touchpoint=].
* `tags`: Array of strings for grouping.


**Notes:**

* A Step **MUST NOT** imply traversal order. Order is defined only by [[UJG Graph]] transitions.
* A Step **MAY** include multiple states; multiple steps **MAY** reference the same state (e.g., when a state serves multiple intents).

### Phase

A [=Phase=] **MUST** include:
* `type`: `"Phase"`
* `id`: Unique URI.
* `label`: Human-readable string.

A [=Phase=] **MAY** include:

* `order`: number (for intended presentation ordering only).

### Touchpoint

A [=Touchpoint=] **MUST** include:
* `type`: `"Touchpoint"`
* `id`: Unique URI.
* `label`: Human-readable string.

A [=Touchpoint=] **MAY** include:

* `channel`: string (e.g., `web`, `mobile`, `email`, `store`).

### PainPoint

A [=PainPoint=] **MUST** include:
* `type`: `"PainPoint"`
* `id`: Unique URI/URN.
* `label`: Human-readable string.
* `graphRefs`: Array of IDs of annotated [[UJG Graph]] Nodes (e.g., [=State=], [=CompositeState=], [=Transition=], [=OutgoingTransition=]).

A [=PainPoint=] **MAY** include:

* `severity`: number in the range 0..1 (design intent, not measurement).
* `description`: string.
* `tags`: array of strings.

---

## Validation Rules

1. **Resolution:** Every ID in `stateRefs`, `graphRefs`, `phaseRef`, `touchpointRefs` **MUST** resolve to a [=Node=] within the current scope or imported modules.
2. **Non-Structural:** Experience objects **MUST NOT** introduce additional traversal semantics beyond [[UJG Graph]].


---

## Appendix: Combined JSON Example {.unnumbered}

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/context.jsonld",
  "type": "UJGDocument",
  "specVersion": "1.0",
  "items": [
    { "type": "State", "id": "urn:ujg:state:shipping-form", "label": "Shipping" },

    { "type": "State", "id": "urn:ujg:state:payment", "label": "Payment" },

    { "type": "Phase", "id": "urn:ujg:phase:checkout", "label": "Checkout", "order": 2 },

    { "type": "Touchpoint", "id": "urn:ujg:touchpoint:web", "label": "Web", "channel": "web" },

    {
      "type": "ExperienceStep",
      "id": "urn:ujg:step:enter-shipping",
      "label": "Enter shipping details",
      "stateRefs": ["urn:ujg:state:shipping-form"],
      "phaseRef": "urn:ujg:phase:checkout",
      "touchpointRefs": ["urn:ujg:touchpoint:web"]
    },

    {
      "type": "PainPoint",
      "id": "urn:ujg:pain:address-validation",
      "label": "Address validation friction",
      "severity": 0.7,
      "graphRefs": ["urn:ujg:state:shipping-form" ]
    },

    {
      "type": "JourneyExecution",
      "id": "urn:ujg:execution:12345",
      "eventRefs": ["urn:ujg:event:12345:100"]
    },

    {
      "type": "RuntimeEvent",
      "id": "urn:ujg:event:12345:100",
      "executionId": "urn:ujg:execution:12345",
      "previousId": null,
      "stateRef": "urn:ujg:state:shipping-form"
    }
  ]
}
```
