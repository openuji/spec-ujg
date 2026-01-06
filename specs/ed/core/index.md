## Abstract {.unnumbered}

This module models a designed experience as a graph: States (moments) connected by Transitions (allowed moves). It also supports:

- **Composition**: a state can "contain" another journey (nested journeys).
- **Reusable transitions**: define shared navigation once and include it in many journeys.

Design-time Core intentionally stays structural: transitions are from → to, not "event names". Runtime modules align observations back to design using journeyRef + transitionRef.

## 1) State

### What is a State?

A State is a meaningful moment the user can be "in".

Think: a page, a step in a flow, or a mode ("menu open").

### State (required fields)

A State MUST have:

- `type`: "State"
- `id` (unique within the Journey)
- `label` (human-readable)

### Example: a couple of states

```json
{ "type": "State", "id": "page:home", "label": "Home" }

{ "type": "State", "id": "checkout:shipping", "label": "Shipping details" }
```

## 2) Transition

### What is a Transition?

A Transition is an allowed move from one state to another:

- `from` = where you are now
- `to` = where you can go next

### Transition (required fields)

A Transition MUST have:

- `id` (unique within the Journey)
- `from` (state id)
- `to` (state id)

### Example: simple navigation

```json
{ "id": "goToCheckout", "from": "page:cart", "to": "checkout:shipping" }
```

### Example: toggling a UI mode

```json
{ "id": "openMenu", "from": "header:closed", "to": "header:open" }
```

## 3) Journey

### What is a Journey?

A Journey is the designed model of an experience at some layer (site, page, component).

It defines:

- where you start (`startState`)
- where you may end (`endStates`)
- what moments exist (`states`)
- what moves are allowed (`transitions`)
- optional reusable transitions included from elsewhere (`includes`)

### Journey (required fields)

A Journey MUST have:

- `type`: "Journey"
- `id` (stable identifier)
- `version` (version identifier)
- `startState` (a state id)
- `endStates` (array of state ids; `[]` if none)
- `states` (array of State or CompositeState)
- `transitions` (array of Transition; `[]` if none)
- `includes` (array of TransitionSet ids; `[]` if none)

### Example: a simple 3-step signup journey

```json
{
  "type": "Journey",
  "id": "journey:signup",
  "version": "ed",
  "startState": "signup:start",
  "endStates": ["signup:done"],
  "includes": [],
  "states": [
    { "type": "State", "id": "signup:start", "label": "Start" },
    { "type": "State", "id": "signup:form", "label": "Enter details" },
    { "type": "State", "id": "signup:done", "label": "Account created" }
  ],
  "transitions": [
    { "id": "begin", "from": "signup:start", "to": "signup:form" },
    { "id": "submit", "from": "signup:form", "to": "signup:done" }
  ]
}
```

**How to read endStates**: "We're done modeling at this layer." It does not mean the user disappears forever.

## 4) CompositeState (composition)

### What is a CompositeState?

A CompositeState is a state that points to a nested journey that happens "inside" it.

Product/UX translation: "This page/step has its own internal journey (components, sub-steps)."

### JourneyRef

A JourneyRef MUST have:

- `id` (Journey id string)
- `version` (Journey version string)

### CompositeState (required fields)

A CompositeState MUST have:

- `type`: "CompositeState"
- `id` (unique within the Journey)
- `label`
- `subjourneyRef` ({ id, version })

### Example: website journey with a composite "Checkout" page

```json
{
  "type": "Journey",
  "id": "journey:website",
  "version": "ed",
  "startState": "page:home",
  "endStates": ["site:exit"],
  "includes": [],
  "states": [
    { "type": "State", "id": "page:home", "label": "Home" },
    {
      "type": "CompositeState",
      "id": "page:checkout",
      "label": "Checkout",
      "subjourneyRef": { "id": "journey:page:checkout", "version": "ed" }
    },
    { "type": "State", "id": "site:exit", "label": "Exit" }
  ],
  "transitions": [
    { "id": "startCheckout", "from": "page:home", "to": "page:checkout" },
    { "id": "leaveSite", "from": "page:home", "to": "site:exit" }
  ]
}
```

### Example: the nested checkout page journey

This is the journey referenced by subjourneyRef above.

```json
{
  "type": "Journey",
  "id": "journey:page:checkout",
  "version": "ed",
  "startState": "checkout:shipping",
  "endStates": ["checkout:confirmation"],
  "includes": [],
  "states": [
    { "type": "State", "id": "checkout:shipping", "label": "Shipping" },
    { "type": "State", "id": "checkout:payment", "label": "Payment" },
    { "type": "State", "id": "checkout:confirmation", "label": "Confirmation" }
  ],
  "transitions": [
    {
      "id": "toPayment",
      "from": "checkout:shipping",
      "to": "checkout:payment"
    },
    {
      "id": "confirm",
      "from": "checkout:payment",
      "to": "checkout:confirmation"
    }
  ]
}
```

## 5) TransitionSet (reusable transitions) + Owner

### What is a TransitionSet?

A TransitionSet is a reusable bundle of transitions (often global navigation) that can be included in a Journey without repeating edges everywhere.

### What is the Owner?

The owner says where the interaction comes from (e.g., "Header navigation"). It's a JourneyRef pointing to the UI surface/component journey that "provides" those transitions.

### TransitionSet (required fields)

A TransitionSet MUST have:

- `type`: "TransitionSet"
- `id` (stable identifier)
- `owner` (JourneyRef)
- `transitions` (array of TransitionSetTransition)

### TransitionSetTransition (required fields)

A TransitionSetTransition MUST have:

- `id` (unique within the TransitionSet)
- `to` (a state id in the host Journey)

**Note**: it intentionally has no `from`. It's meant to be injected broadly.

### Example: header component journey (the owner)

```json
{
  "type": "Journey",
  "id": "journey:cmp:header",
  "version": "ed",
  "startState": "header:closed",
  "endStates": [],
  "includes": [],
  "states": [
    { "type": "State", "id": "header:closed", "label": "Menu closed" },
    { "type": "State", "id": "header:open", "label": "Menu open" }
  ],
  "transitions": [
    { "id": "openMenu", "from": "header:closed", "to": "header:open" },
    { "id": "closeMenu", "from": "header:open", "to": "header:closed" }
  ]
}
```

### Example: TransitionSet "global nav" owned by the header

```json
{
  "type": "TransitionSet",
  "id": "ts:globalNav",
  "owner": { "id": "journey:cmp:header", "version": "ed" },
  "transitions": [
    { "id": "toHome", "to": "page:home" },
    { "id": "toPricing", "to": "page:pricing" },
    { "id": "toContact", "to": "page:contact" }
  ]
}
```

### Example: website journey that includes global nav once

```json
{
  "type": "Journey",
  "id": "journey:website:v2",
  "version": "ed",
  "startState": "page:home",
  "endStates": ["site:exit"],
  "includes": ["ts:globalNav"],
  "states": [
    { "type": "State", "id": "page:home", "label": "Home" },
    { "type": "State", "id": "page:pricing", "label": "Pricing" },
    { "type": "State", "id": "page:contact", "label": "Contact" },
    { "type": "State", "id": "site:exit", "label": "Exit" }
  ],
  "transitions": [
    { "id": "exitFromContact", "from": "page:contact", "to": "site:exit" }
  ]
}
```

## Inclusion and injection rules

### Inclusion

A Journey's `includes` entries MUST be ids of TransitionSets available in the publication context.

### Injection (materialization)

For each included TransitionSet, materialize transitions as if the nav exists in (almost) every state:

For every host state S where S.id is not in `endStates` and for every TransitionSetTransition T:

Inject an equivalent Transition:

- `id` = "<transitionSetId>::<S.id>::<T.id>"
- `from` = S.id
- `to` = T.to

### Conflicts

If the Journey already has an explicit Transition with the same `from` and `to`, the injected one MUST NOT be materialized (explicit wins).

If the injected id would collide with an explicit Transition id, it MUST NOT be materialized.

## Validity rules (well-formed journeys)

A Journey MUST be well-formed:

- `startState` MUST reference a state in `states`.
- Every id in `endStates` MUST reference a state in `states`.
- Every Transition `from` and `to` MUST reference states in `states`.
- All State ids MUST be unique within the Journey.
- All Transition ids MUST be unique within the Journey.
- All TransitionSet ids in `includes` MUST resolve to existing TransitionSets.
- After injection, every injected transition's `to` MUST reference a state in the host Journey.

## Modeling guidance

- A Journey MAY have `transitions: []` (composition-only layers are common).
- If a state has no outgoing transitions at this layer, authors SHOULD list it in `endStates` (unless the layer is intentionally partial).
- Avoid "noise transitions": model state changes where they meaningfully occur, and use TransitionSets for cross-cutting navigation instead of repeating edges.
