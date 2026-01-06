## Abstract

This module defines the design-time model for journeys as a graph (similar to a state machine): states connected by transitions representing allowed movement between moments.

It also defines two features needed for real websites and apps:

- **Composition:** a state can "contain" another journey (pages and components).
- **Reusable transitions:** shared transitions (like global navigation) can be defined once and included in a journey without repetition.

This module is written to be readable for Product/UX teams and implementable for engineers.

## Scope

This module defines:

- Journey (design-time journey model)
- State and CompositeState
- Transition
- TransitionSet (shareable transitions)
- inclusion ("injection") rules and validity rules

This module does not define runtime tracking or event semantics.

## Terminology (plain English)

- **Journey:** the designed model of an experience.
- **State:** a meaningful moment (page, step, mode).
- **Composite State:** a state that points to a "nested" journey that happens inside it.
- **Transition:** an allowed move from one state to another.
- **Start State:** where the journey begins.
- **End States:** states where the journey can end (within this journey layer).
- **Transition Set:** reusable transitions that can be included in a journey (e.g., global navigation).
- **Owner (of a Transition Set):** the UI surface/component that provides the interaction that enables those transitions (e.g., the header navigation).
- **JourneyRef:** a versioned reference to a Journey: { id, version }.

## Data model (required fields only)

### Journey

A Journey MUST have:

- type = "Journey"
- id (stable identifier)
- version (version identifier)
- startState (a state id)
- endStates (array of state ids; use [] if none)
- states (array of State or CompositeState)
- transitions (array of Transition; use [] if none)
- includes (array of TransitionSet ids; use [] if none)

### State

A State MUST have:

- type = "State"
- id (unique within the Journey)
- label (human-readable)

### CompositeState

A CompositeState MUST have:

- type = "CompositeState"
- id (unique within the Journey)
- label
- subjourneyRef (JourneyRef: { id, version })

**Product/UX reading:** "This state is a page (or major step) with its own internal journey."

### Transition

A Transition MUST have:

- id (unique within the Journey)
- from (state id)
- to (state id)

**Design note (informative):** UJG does not require event names in design-time transitions. Runtime modules align traces to design by referencing transitionRef (the Transition id).

### JourneyRef

A JourneyRef MUST have:

- id (Journey id string)
- version (Journey version string)

## Transition Sets (shareable transitions)

### TransitionSet

A TransitionSet MUST have:

- type = "TransitionSet"
- id (stable identifier)
- owner (JourneyRef)
- transitions (array of TransitionSetTransition)

**Meaning:** A TransitionSet defines reusable transitions (often navigation). The owner says where the interaction comes from (e.g., "Header navigation owns global nav"), without forcing you to duplicate transitions inside the header journey.

### TransitionSetTransition

A TransitionSetTransition MUST have:

- id (unique within the TransitionSet)
- to (a state id in the host Journey)

A TransitionSetTransition intentionally does not include from. It is meant to be injected broadly into the host Journey.

## Inclusion and injection rules (precise but simple)

### Inclusion

A Journey.includes value MUST be the id of a TransitionSet available in the publication context.

### Injection (materialization)

For each TransitionSet included by a Journey:

- For every state S in the host Journey such that S.id is not in endStates:
  - for every TransitionSetTransition T:
    - inject an equivalent Transition with:
      - id = "<transitionSetId>::<S.id>::<T.id>"
      - from = S.id
      - to = T.to

### Conflicts

If an injected transition conflicts with an explicit transition in the Journey, the explicit transition wins.

A conflict occurs when the Journey already contains a Transition with the same from and to as the injected transition. In that case, the injected transition MUST NOT be materialized.

If an injected transition's derived id would collide with an explicit Transition id, the injected transition MUST NOT be materialized.

## Validity rules (well-formed journeys)

A Journey MUST be well-formed:

- startState MUST reference a state in states.
- Every id in endStates MUST reference a state in states.
- Every Transition's from and to MUST reference states in states.
- All State ids MUST be unique within the Journey.
- All Transition ids MUST be unique within the Journey.
- All TransitionSet ids in includes MUST resolve to existing TransitionSets.
- After injection, every injected transition's to MUST reference a state in the host Journey.

## Modeling guidance (keeps journeys readable)

### Journeys may be partial

A Journey MAY have transitions: []. This commonly means:

- the journey layer is used for composition (pages contain components), or
- there are no meaningful state changes worth modeling at that layer.

### Make "no outgoing transitions" explicit

If a State has no outgoing transitions in this Journey layer, authors SHOULD list that State in endStates, unless the journey is intentionally partial.

**Product/UX reading:** "End states here mean 'we're done modeling inside this layer', not 'the user is gone forever'."

### Avoid "noise transitions"

Put transitions in the journey layer where the state actually changes:

- Page navigation belongs in the website journey (pages change).
- Header/footer journeys only model their own internal state (e.g., menu open/close), not every click as a self-loop.
- Use TransitionSets for cross-cutting navigation so you don't repeat edges.

## Example: Classical website (pages + components + global nav)

### 1) Component journey: Header

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

### 2) TransitionSet: Global navigation (owned by Header)

```json
{
  "type": "TransitionSet",
  "id": "ts:globalNav",
  "owner": { "id": "journey:cmp:header", "version": "ed" },
  "transitions": [
    { "id": "toHome", "to": "page:home" },
    { "id": "toBlog", "to": "page:blogIndex" },
    { "id": "toContact", "to": "page:contact" }
  ]
}
```

### 3) Website journey: pages are composite states, global nav is included once

```json
{
  "type": "Journey",
  "id": "journey:website",
  "version": "ed",
  "startState": "page:home",
  "endStates": ["site:exit"],
  "includes": ["ts:globalNav"],
  "states": [
    {
      "type": "CompositeState",
      "id": "page:home",
      "label": "Home",
      "subjourneyRef": { "id": "journey:page:home", "version": "ed" }
    },
    {
      "type": "CompositeState",
      "id": "page:blogIndex",
      "label": "Blog Index",
      "subjourneyRef": { "id": "journey:page:blogIndex", "version": "ed" }
    },
    {
      "type": "CompositeState",
      "id": "page:post",
      "label": "Post",
      "subjourneyRef": { "id": "journey:page:post", "version": "ed" }
    },
    {
      "type": "CompositeState",
      "id": "page:contact",
      "label": "Contact",
      "subjourneyRef": { "id": "journey:page:contact", "version": "ed" }
    },
    { "type": "State", "id": "site:exit", "label": "Exit" }
  ],
  "transitions": [
    { "id": "openPost", "from": "page:blogIndex", "to": "page:post" },
    { "id": "backToList", "from": "page:post", "to": "page:blogIndex" }
  ]
}
```

### 4) Page journeys (mostly compositional)

#### Home page journey (composition-only)

```json
{
  "type": "Journey",
  "id": "journey:page:home",
  "version": "ed",
  "startState": "home:hero",
  "endStates": ["home:hero"],
  "includes": [],
  "states": [
    {
      "type": "CompositeState",
      "id": "home:header",
      "label": "Header",
      "subjourneyRef": { "id": "journey:cmp:header", "version": "ed" }
    },
    { "type": "State", "id": "home:hero", "label": "Hero" }
  ],
  "transitions": []
}
```

#### Contact page journey (internal success end state)

```json
{
  "type": "Journey",
  "id": "journey:page:contact",
  "version": "ed",
  "startState": "contact:form",
  "endStates": ["contact:success"],
  "includes": [],
  "states": [
    {
      "type": "CompositeState",
      "id": "contact:header",
      "label": "Header",
      "subjourneyRef": { "id": "journey:cmp:header", "version": "ed" }
    },
    { "type": "State", "id": "contact:form", "label": "Form" },
    { "type": "State", "id": "contact:success", "label": "Message sent" }
  ],
  "transitions": [
    { "id": "submitSuccess", "from": "contact:form", "to": "contact:success" }
  ]
}
```

## Consistency note for the rest of the spec family

- Use Journey as the design-time object name.
- Use journeyRef: { id, version } when runtime/derived data needs to reference a Journey version.
- Keep stateRef values consistent with Core State.id / CompositeState.id strings.
- Runtime alignment is intended to use transitionRef (Transition id) rather than requiring event naming in Core.
