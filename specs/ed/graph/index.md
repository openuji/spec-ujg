## Overview

This module defines the vocabulary for intended user flow. It extends [[UJG Core]] to support structured, interactive graphs with composition through one or more child-Journey references, exported exits from nested journeys, organization tags, and state-scoped navigation and invocation affordances. Graph describes intended topology and possible movement; it does not prescribe execution, scheduling, condition evaluation, or event processing.

## Terminology

- <dfn>Journey</dfn>: A named container for local traversable user flow topology.
- <dfn>JourneyEntry</dfn>: An explicit entry contract for a [=Journey=].
- <dfn>JourneyEntryIndex</dfn>: A catalogue of addressable [=JourneyEntry=] contracts that does not define traversal.
- <dfn>State</dfn>: A discrete node in the experience (e.g., a screen, modal).
- <dfn>State occurrence</dfn>: A concrete experienced occurrence of a [=State=] during traversal.
- <dfn>Transition</dfn>: A structural directed edge between local vertices of a [=Journey=].
- <dfn>Command</dfn>: A stable semantic identity of an intentional invocation in the modeled experience.
- <dfn>CompositeState</dfn>: A state that contains one or more child [=Journey|Journeys=]. Multiple child Journeys define independent local flows within the same composite scope.
- <dfn>Composite scope</dfn>: The set of child Journeys referenced by one [=CompositeState=].
- <dfn>JourneyExit</dfn>: A terminal local graph vertex and exported completion contract declared by a [=Journey=].
- <dfn>Local vertex</dfn>: A [=State=], [=CompositeState=], or [=JourneyExit=] in the local topology of a [=Journey=]: one of its `stateRefs` or `exitRefs`.
- <dfn>OutgoingTransition</dfn>: A navigational affordance that enters a [=Journey=] through a [=JourneyEntry=].
- <dfn>InvokingTransition</dfn>: An affordance that invokes a [=Journey=] through a [=JourneyEntry=] and resumes the source [=State occurrence=] when that Journey reaches one of its exits.
- <dfn>Entry transition</dfn>: An [=OutgoingTransition=] or [=InvokingTransition=]: an affordance available at a [=State=] that enters a [=Journey=] through a [=JourneyEntry=].

---

## State {data-cop-concept="state"}

A [=State=] is the base graph node for a discrete point in an intended user experience, such as a page, screen, modal, or other user-visible step.

This section defines the base state node. A State also lists the
[=Entry transition|entry transitions=] it offers, as described in the subsection below; the
transition classes themselves are defined in the Transitions section.

<spec-statement>
1. A [=State=] **MUST** be identified by an IRI.
2. A [=State=] **MUST** declare exactly one `label`.
3. A [=State=] **MAY** declare one or more `tags`.
4. Multiple concrete occurrences of the same [=State=] **MAY** exist within an active [=Journey=];
   Graph does not define occurrence identity, cardinality, lifecycle, or materialization.
</spec-statement>

```mermaid
classDiagram
  class State {
    id
    label
    tags
  }
```

Example JSON node:

```json
{
  "@type": "State",
  "@id": "urn:ujg:state:search-form",
  "label": "Search form",
  "tags": [
    "phase:search"
  ]
}
```

### State-scoped entry transitions {data-cop-concept="state-scoped-entry-transitions"}

A [=State=] lists the [=Entry transition|entry transitions=] it offers in `entryTransitionRefs`.
Entry transitions are for navigation and invocation options, not for ordinary internal progression
through a journey.

An entry transition is a node of its own, so several States can list the same one. A footer link
shown on every page is one [=OutgoingTransition=] listed by each page's State.

<spec-statement>
1. A [=State=], including a [=CompositeState=], **MAY** declare `entryTransitionRefs`.
2. Each `entryTransitionRefs` value **MUST** reference an [=OutgoingTransition=] or an
   [=InvokingTransition=]. One State **MAY** list both.
3. Each [=State=] that lists an entry transition is an effective source of that transition.
4. An entry transition listed by a [=CompositeState=] is available at every occurrence of that
   CompositeState and at every State occurrence nested inside it, through its child Journeys at any
   nesting depth. The CompositeState remains the effective source.
5. Entry transitions are not members of the enclosing [=Journey=]'s `transitionRefs`.
6. An entry transition's `toEntryRef` remains the same fixed IRI at every State that lists it.
   Consumers **MUST NOT** reinterpret that destination relative to the source state.
7. When the intended destination entry varies with the source, Producers **MUST** use
   source-specific [=OutgoingTransition|OutgoingTransitions=] or
   [=InvokingTransition|InvokingTransitions=] instead of one shared transition.
</spec-statement>

Share one entry transition across States only when the same destination entry is correct from each
of them. A shared transition cannot express “re-enter whichever state is currently active.” When an
affordance preserves one of several possible source states—such as a state-preserving locale
switch—model a separate [=OutgoingTransition=] for each source state and target a [=JourneyEntry=]
whose `stateRef` is that state. The entries and transitions are distinct even when the affordances
have the same label and locale metadata.

List an entry transition on a [=CompositeState=] when it should be available throughout that
composite occurrence, such as a footer on a page composed of several child Journeys. List it on a
State inside a child Journey when it should be available only while that State is current.

Consumers **SHOULD** treat entry transitions available at the same State occurrence, whether listed
by that State or by a containing [=CompositeState=], as one effective edge when they have the same
transition class, the same `toEntryRef`, and the same `commandRef` or no `commandRef`. Transitions
that differ in class or `commandRef` are never merged. Entries remain distinct targets even when
their `stateRef` values are equal.

While an [=InvokingTransition=] is in progress, its retained source is suspended, so entry
transitions available at the source are not offered inside the invoked Journey. A footer is
available there only when the invoked Journey's own States, or CompositeStates that contain them,
list it.

A State of Journey J that lists an [=InvokingTransition=] into J lets J invoke itself. Each
activation enters J again and retains the current State occurrence of J, so invocations of J nest.
For example, the States of a privacy settings Journey normally do not list the footer link that
opens the privacy settings.

```mermaid
classDiagram
  class State {
    entryTransitionRefs
  }
  class CompositeState
  class OutgoingTransition {
    toEntryRef
  }
  class InvokingTransition {
    toEntryRef
  }
  class JourneyEntry

  State <|-- CompositeState
  State --> OutgoingTransition : entryTransitionRefs
  State --> InvokingTransition : entryTransitionRefs
  OutgoingTransition --> JourneyEntry : toEntryRef
  InvokingTransition --> JourneyEntry : toEntryRef
```

Example JSON nodes:

```json
{
  "@type": "State",
  "@id": "urn:ujg:state:w3c-searchpage-form",
  "label": "Search form",
  "entryTransitionRefs": [
    "urn:ujg:ot:w3c-searchpage-form-back-home"
  ]
}
```

```json
[
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:w3c-homepage",
    "defaultEntryRef": "urn:ujg:entry:w3c-homepage",
    "entryRefs": ["urn:ujg:entry:w3c-homepage"],
    "stateRefs": ["urn:ujg:state:w3c-root-homepage"]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:w3c-homepage",
    "stateRef": "urn:ujg:state:w3c-root-homepage"
  },
  {
    "@type": "State",
    "@id": "urn:ujg:state:w3c-root-homepage",
    "label": "W3C homepage"
  },
  {
    "@type": "OutgoingTransition",
    "@id": "urn:ujg:ot:w3c-searchpage-form-back-home",
    "label": "Back to home page",
    "toEntryRef": "urn:ujg:entry:w3c-homepage"
  }
]
```

This is a "Back to home page" navigation affordance, not an internal [=Transition=]. The source
Journey references the destination entry contract, never the destination State directly.

A footer that mixes navigation and invocation is shown in the [=InvokingTransition=] section.

---




## Transitions {data-cop-concept="transitions"}

Graph has three transition classes. A [=Transition=] is ordinary progression inside one
[=Journey=]. [=OutgoingTransition=] and [=InvokingTransition=] are
[=Entry transition|entry transitions=]: affordances available at a State that enter a Journey
through an explicit [=JourneyEntry=]. The two entry transition classes differ only in what happens
to the source [=State occurrence=].

```mermaid
flowchart TB
  subgraph T["Transition"]
    direction LR
    T1["State A<br/>not retained"] -->|"progress (from → to)"| T2["State B<br/>same Journey"]
  end

  subgraph O["OutgoingTransition"]
    direction LR
    O1["Source State<br/>not retained"] -->|"navigate (toEntryRef)"| O2["Journey B<br/>entered via JourneyEntry"]
  end

  subgraph I["InvokingTransition"]
    direction LR
    I1["Source State occurrence<br/>retained, suspended"] -->|"invoke (toEntryRef)"| I2["Invoked Journey<br/>entered via JourneyEntry"]
    I2 -.->|"resume at own JourneyExit"| I1
  end

  T ~~~ O
  O ~~~ I
```

| | [=Transition=] | [=OutgoingTransition=] | [=InvokingTransition=] |
| --- | --- | --- | --- |
| Source | Explicit local `from` vertex | State where the affordance is available | State where the affordance is available |
| Destination | Local `to` vertex | `toEntryRef` entry contract | `toEntryRef` entry contract |
| Declared through | `transitionRefs` on a [=Journey=] | `entryTransitionRefs` on a [=State=] | `entryTransitionRefs` on a [=State=] |
| Source State occurrence | Not retained | Not retained | Retained and suspended until the invocation completes or is cancelled |
| Meaning | Ordinary progression inside one Journey | Leave local progression and enter a Journey through a named entry | Enter a Journey through a named entry, then resume the source when that Journey exits |

An entry transition has no `from` property. Its effective source is each [=State=] that lists it in
`entryTransitionRefs`. All three classes can reference a [=Command=] with `commandRef`.

### Transition {data-cop-concept="transition"}

A [=Transition=] is a structural directed edge between local vertices of a [=Journey=]. It models ordinary progression inside the local topology of a [=Journey=].

A [=Transition=] is not owned by either endpoint state. It is owned by a journey through `transitionRefs`.

A [=Transition=] applies to every concrete occurrence of the [=State=] its `from` value references.
The [=Transition=] itself remains one stable Graph node.

The presence of multiple child Journeys in one [=CompositeState=] does not create implicit
Transitions between them.

<spec-statement>
1. A [=Transition=] **MUST** be identified by an IRI, declare exactly one `from`, and declare exactly one `to`.
2. A [=Transition=] **MAY** declare one `label`.
3. A [=Transition=] **MAY** reference one [=Command=] with `commandRef`.
4. When listed in a [=Journey=]'s `transitionRefs`, `from` **MUST** reference a [=State=] or [=CompositeState=] in that journey's `stateRefs`.
5. When listed in a [=Journey=]'s `transitionRefs`, `to` **MUST** reference a [=State=] or [=CompositeState=] in that journey's `stateRefs`, or a [=JourneyExit=] in that journey's `exitRefs`.
6. [=Transition=] endpoints **MUST** stay local to the enclosing [=Journey=].
7. `toEntryRef` **MAY** be used only on parent transitions into [=CompositeState=] nodes, as defined by the boundary mapping rules above.
8. A [=Transition=] **MUST** remain one Graph node regardless of how many concrete occurrences its endpoint [=State=]s have; per-instance transition properties are outside Graph.
9. A child Journey's [=Transition=] **MUST NOT** connect directly to a [=State=], [=CompositeState=], or [=JourneyExit=] owned only by another child Journey.
</spec-statement>

```mermaid
classDiagram
  class State
  class JourneyExit
  class Command

  class Transition {
    id
    label
    from
    to
    commandRef
  }

  Transition --> State : from
  Transition --> State : to
  Transition --> JourneyExit : to
  Transition --> Command : commandRef
```

Example JSON node:

```json
{
  "@type": "Transition",
  "@id": "urn:ujg:transition:search-form-to-results",
  "label": "Submit search",
  "from": "urn:ujg:state:search-form",
  "to": "urn:ujg:state:results",
  "commandRef": "urn:ujg:command:submit-search"
}
```

### OutgoingTransition {data-cop-concept="outgoing-transition"}

An [=OutgoingTransition=] is a navigational affordance that enters a Journey through an explicit
[=JourneyEntry=]. It does not declare structural progression in the source Journey's local topology.

The destination entry's `stateRef` identifies the first local [=State=] or [=CompositeState=] of the
destination Journey. Consumers do not bypass the entry contract by linking the outgoing affordance
directly to that state.

<spec-statement>
1. An [=OutgoingTransition=] **MUST** be identified by an IRI and **MAY** declare one `label`.
2. An [=OutgoingTransition=] **MUST** declare exactly one `toEntryRef`.
3. An [=OutgoingTransition=] **MAY** reference one [=Command=] with `commandRef`.
4. `toEntryRef` **MUST** reference a [=JourneyEntry=] owned by exactly one [=Journey=].
5. The destination entry's `stateRef` **MUST** reference a [=State=] or [=CompositeState=] in that
   owner Journey's `stateRefs`.
6. The destination entry **MAY** belong to the Journey where the affordance is available. Such a
   target is explicit Journey re-entry, including when the entry points to the effective source state.
7. An [=OutgoingTransition=] **MUST NOT** declare `from`, `fromExitRef`, `to`, or
   `entryTransitionRefs`, target a [=JourneyExit=], appear in `transitionRefs`, or model ordinary
   internal progression.
</spec-statement>

A [=JourneyEntryIndex=] may catalogue the destination entry for discovery, but index membership is
not required for navigation. The entry remains owned by its declaring Journey.

```mermaid
classDiagram
  class OutgoingTransition {
    toEntryRef
    commandRef
  }
  class Journey {
    entryRefs
    stateRefs
  }
  class JourneyEntry {
    stateRef
  }
  class State
  class CompositeState
  class Command

  OutgoingTransition --> JourneyEntry : toEntryRef
  Journey --> JourneyEntry : entryRefs
  JourneyEntry --> State : stateRef
  JourneyEntry --> CompositeState : stateRef
  OutgoingTransition --> Command : commandRef
```

Cross-Journey navigation names the destination entry rather than its State:

```json
[
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:home",
    "defaultEntryRef": "urn:ujg:entry:home",
    "entryRefs": ["urn:ujg:entry:home"],
    "stateRefs": ["urn:ujg:state:home"]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:home",
    "label": "Home entry",
    "stateRef": "urn:ujg:state:home"
  },
  {
    "@type": "State",
    "@id": "urn:ujg:state:home",
    "label": "Home"
  },
  {
    "@type": "OutgoingTransition",
    "@id": "urn:ujg:ot:go-home",
    "label": "Home",
    "toEntryRef": "urn:ujg:entry:home",
    "commandRef": "urn:ujg:command:go-home"
  },
  {
    "@type": "Command",
    "@id": "urn:ujg:command:go-home",
    "label": "Go home"
  }
]
```

The same pattern represents same-state re-entry: the OutgoingTransition targets a JourneyEntry whose
`stateRef` is the state where the affordance is available. This remains explicit re-entry, not an
implicit relative target.

```json
[
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:confirmation",
    "defaultEntryRef": "urn:ujg:entry:confirmation",
    "entryRefs": ["urn:ujg:entry:confirmation"],
    "stateRefs": ["urn:ujg:state:confirmation"]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:confirmation",
    "stateRef": "urn:ujg:state:confirmation"
  },
  {
    "@type": "State",
    "@id": "urn:ujg:state:confirmation",
    "label": "Confirmation",
    "entryTransitionRefs": ["urn:ujg:ot:reenter-confirmation"]
  },
  {
    "@type": "OutgoingTransition",
    "@id": "urn:ujg:ot:reenter-confirmation",
    "label": "Re-enter confirmation",
    "toEntryRef": "urn:ujg:entry:confirmation"
  }
]
```

### InvokingTransition {data-cop-concept="invoking-transition"}

An [=InvokingTransition=] invokes a Journey through an explicit [=JourneyEntry=]. It has the same
source and destination model as an [=OutgoingTransition=]. The difference is lifecycle: the source
[=State occurrence=] is retained, and it resumes when the invoked Journey reaches one of its exits.

<spec-statement>
1. An [=InvokingTransition=] **MUST** be identified by an IRI and **MAY** declare one `label`. It
   **MUST** declare exactly one `toEntryRef` and **MAY** reference one [=Command=] with
   `commandRef`. It **MUST NOT** declare `from`, `fromExitRef`, `to`, or `entryTransitionRefs`,
   target a [=JourneyExit=], appear in `transitionRefs`, model ordinary internal progression, or
   also be typed [=OutgoingTransition=].
2. The effective source of an [=InvokingTransition=] is each [=State=] that lists it in
   `entryTransitionRefs`, exactly as for an [=OutgoingTransition=].
3. `toEntryRef` **MUST** reference a [=JourneyEntry=] owned by exactly one [=Journey=], and the
   entry's `stateRef` **MUST** reference a [=State=] or [=CompositeState=] in that owner Journey's
   `stateRefs`. That Journey is the *invoked Journey*. The invoked Journey **MUST** declare at least
   one `exitRefs` value.
4. The invoked Journey **MAY** be the Journey where the affordance is available. Each activation is a
   separate, nested invocation.
5. Activating an [=InvokingTransition=] enters the invoked Journey through `toEntryRef` and retains
   the source [=State occurrence=], including any active composite scope. The source occurrence is
   not left. While the invocation is in progress, the retained source occurrence, together with any
   composite scope retained with it, is suspended: no [=Transition=] or entry transition is taken
   from it, whether the entry transition is listed by the source State or by a [=CompositeState=]
   that contains it. Entry transitions listed by a containing CompositeState remain available only
   at State occurrences inside it that are not suspended, such as States of a sibling child Journey.
6. Reaching a [=JourneyExit=] listed in the invoked Journey's own `exitRefs` completes the
   invocation. The retained source occurrence then resumes without entering a [=JourneyEntry=] or
   taking a [=Transition=]. A child [=JourneyExit=] reached inside a [=CompositeState=] of the
   invoked Journey is not completion; it follows the composite-scope rules.
7. The reached [=JourneyExit=] is the outcome of the invocation. Graph assigns no per-outcome
   continuation.
8. An invocation is cancelled, not completed, when the invoked Journey is left in any way other than
   reaching one of its own exits. Traversing an [=OutgoingTransition=] from any [=State occurrence=]
   of the invoked Journey, including one inside its composite scopes, leaves the invoked Journey,
   even when the destination entry belongs to the invoked Journey itself. Activating an
   [=InvokingTransition=] from inside the invoked Journey does not leave it.
9. An invocation is also cancelled when its retained source occurrence is left before the
   invocation completes, for example because a sibling child Journey in the same composite scope
   reaches a [=JourneyExit=]. The invoked Journey is then left as well, which cancels any invocation
   nested inside it.
10. When an invocation is cancelled, Consumers **MUST NOT** infer a return, and the retained source
    occurrence **MUST NOT** be resumed. A source occurrence that is still retained is left, including
    its active composite scope. If that source occurrence is inside a Journey that was itself
    invoked, that Journey is left as well, which cancels its invocation in turn. Cancellation
    therefore releases every retained occurrence in the invocation chain.
11. An [=InvokingTransition=] does not add the invoked Journey to any `subjourneyRefs`. The
    [=JourneyExit=] rules for a composite scope do not apply to the invoked Journey's exits, and
    completion never leaves a [=CompositeState=] that contains the source.
12. Graph does not define invocation identifiers or association data between source and invoked
    occurrences.
</spec-statement>

```mermaid
classDiagram
  class InvokingTransition {
    toEntryRef
    commandRef
  }
  class Journey {
    entryRefs
    stateRefs
    exitRefs
  }
  class JourneyEntry {
    stateRef
  }
  class JourneyExit
  class Command

  InvokingTransition --> JourneyEntry : toEntryRef
  Journey --> JourneyEntry : entryRefs
  Journey --> JourneyExit : exitRefs
  InvokingTransition --> Command : commandRef
```

A privacy settings dialog invoked from an article page. Either exit completes the invocation, and
the Article State occurrence resumes. `settings-saved` and `settings-dismissed` are distinguishable
outcomes, but neither is a destination.

```json
[
  {
    "@type": "State",
    "@id": "urn:ujg:state:article",
    "label": "Article",
    "entryTransitionRefs": ["urn:ujg:it:adjust-privacy-settings"]
  },
  {
    "@type": "InvokingTransition",
    "@id": "urn:ujg:it:adjust-privacy-settings",
    "label": "Adjust privacy settings",
    "toEntryRef": "urn:ujg:entry:privacy-settings",
    "commandRef": "urn:ujg:command:adjust-privacy-settings"
  },
  {
    "@type": "Command",
    "@id": "urn:ujg:command:adjust-privacy-settings",
    "label": "Adjust privacy settings"
  },
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:privacy-settings",
    "defaultEntryRef": "urn:ujg:entry:privacy-settings",
    "entryRefs": ["urn:ujg:entry:privacy-settings"],
    "stateRefs": ["urn:ujg:state:privacy-settings"],
    "transitionRefs": [
      "urn:ujg:transition:privacy-settings-save",
      "urn:ujg:transition:privacy-settings-dismiss"
    ],
    "exitRefs": [
      "urn:ujg:exit:settings-saved",
      "urn:ujg:exit:settings-dismissed"
    ]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:privacy-settings",
    "stateRef": "urn:ujg:state:privacy-settings"
  },
  {
    "@type": "State",
    "@id": "urn:ujg:state:privacy-settings",
    "label": "Privacy settings"
  },
  {
    "@type": "Transition",
    "@id": "urn:ujg:transition:privacy-settings-save",
    "label": "Save",
    "from": "urn:ujg:state:privacy-settings",
    "to": "urn:ujg:exit:settings-saved"
  },
  {
    "@type": "Transition",
    "@id": "urn:ujg:transition:privacy-settings-dismiss",
    "label": "Back",
    "from": "urn:ujg:state:privacy-settings",
    "to": "urn:ujg:exit:settings-dismissed"
  },
  {
    "@type": "JourneyExit",
    "@id": "urn:ujg:exit:settings-saved",
    "label": "Settings saved"
  },
  {
    "@type": "JourneyExit",
    "@id": "urn:ujg:exit:settings-dismissed",
    "label": "Settings dismissed"
  }
]
```

A footer shared by several pages can mix both transition classes. "Privacy policy" navigates away
from the current page. "Adjust privacy settings" invokes the privacy settings Journey from the
example above and returns to the current page when that Journey exits. Each page's State lists the
same two transitions; each node's class determines its semantics.

```json
[
  {
    "@type": "State",
    "@id": "urn:ujg:state:article",
    "label": "Article",
    "entryTransitionRefs": [
      "urn:ujg:ot:privacy-policy",
      "urn:ujg:it:adjust-privacy-settings"
    ]
  },
  {
    "@type": "State",
    "@id": "urn:ujg:state:search-results",
    "label": "Search results",
    "entryTransitionRefs": [
      "urn:ujg:ot:privacy-policy",
      "urn:ujg:it:adjust-privacy-settings"
    ]
  },
  {
    "@type": "OutgoingTransition",
    "@id": "urn:ujg:ot:privacy-policy",
    "label": "Privacy policy",
    "toEntryRef": "urn:ujg:entry:privacy-policy"
  },
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:privacy-policy",
    "defaultEntryRef": "urn:ujg:entry:privacy-policy",
    "entryRefs": ["urn:ujg:entry:privacy-policy"],
    "stateRefs": ["urn:ujg:state:privacy-policy"]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:privacy-policy",
    "stateRef": "urn:ujg:state:privacy-policy"
  },
  {
    "@type": "State",
    "@id": "urn:ujg:state:privacy-policy",
    "label": "Privacy policy"
  }
]
```

Mapping and Metrics do not yet account for [=InvokingTransition=]. Until they do, Mapping treats
both the entry into the invoked Journey and the resumption of the source State as unexplained
movements, so each completed invocation adds two derived jumps, and two to
`unexplainedMovementCount`, across the execution's JourneyMappings.

---


## Command {data-cop-concept="command"}

A [=Command=] identifies the stable semantic identity of an intentional invocation in the modeled
experience.

A [=Command=] can be referenced by [=Transition=], [=OutgoingTransition=], and
[=InvokingTransition=] nodes through `commandRef`. Multiple transitions may reference the same [=Command=]. Sharing a `commandRef`
establishes only common invocation identity. Graph does not assign branching, selection, ordering,
resolution, execution-result, or effect semantics to that relationship.

A [=Command=] is not a transition endpoint and does not replace [=Transition=],
[=OutgoingTransition=], or [=InvokingTransition=]. Structural, automatic, expiry-driven, or otherwise non-invoked transitions
can remain without `commandRef`.

<spec-statement>
1. A [=Command=] **MUST** be identified by an IRI.
2. A [=Command=] **MAY** declare one `label` and one or more `tags`.
3. A [=Command=] **MUST NOT** declare `from`, `to`, branching, condition resolution, effect execution, visual representation, runtime execution, or execution-result semantics.
4. `commandRef` **MAY** appear on a [=Transition=], [=OutgoingTransition=], or [=InvokingTransition=] and **MUST** reference a [=Command=].
5. A [=Transition=], [=OutgoingTransition=], or [=InvokingTransition=] **MUST NOT** reference more than one [=Command=].
6. Absence of `commandRef` makes no claim that the transition represents an intentional invocation.
</spec-statement>

```mermaid
classDiagram
  class Command {
    id
    label
    tags
  }
  class Transition {
    commandRef
  }
  class OutgoingTransition {
    commandRef
  }
  class InvokingTransition {
    commandRef
  }

  Transition --> Command : commandRef
  OutgoingTransition --> Command : commandRef
  InvokingTransition --> Command : commandRef
```

Example JSON node:

```json
{
  "@type": "Command",
  "@id": "urn:ujg:command:start-registration",
  "label": "Start registration"
}
```

Example transition associated with a command:

```json
{
  "@type": "Transition",
  "@id": "urn:ujg:transition:start-registration",
  "from": "urn:ujg:state:registration-open",
  "to": "urn:ujg:state:registration-form",
  "commandRef": "urn:ujg:command:start-registration"
}
```

---

## Journey {data-cop-concept="journey"}

A [=Journey=] is the local container for intended flow topology. It lists the experiential states that belong to the journey, the terminal exits exported by the journey, and, when present, the transitions that connect those local vertices.

Use [=Journey=] when the modeled object owns local traversal, progression, or structural order. If the model only needs to list known entry points into pages, surfaces, flows, or journeys, use [=JourneyEntryIndex=] instead.

The subsections below define the two contracts a Journey declares besides its states and
transitions: its entries (`entryRefs`) and its exits (`exitRefs`).

<spec-statement>
1. A [=Journey=] **MUST** be identified by an IRI and declare at least one `entryRefs` value and one `stateRefs` value.
2. A [=Journey=] **MAY** declare one `defaultEntryRef`; if present, it **MUST** also appear in `entryRefs`.
3. `entryRefs`, `stateRefs`, `transitionRefs`, and `exitRefs` **MUST** reference nodes of the corresponding Graph classes.
4. A [=Journey=]'s [=Local vertex|local vertices=] are its `stateRefs` plus its `exitRefs`.
5. `stateRefs` **MUST** describe local experiential topology, not destinations that are merely reachable through [=OutgoingTransition=] navigation or [=InvokingTransition=] invocation.
6. A [=Journey=] **MUST NOT** declare `entryTransitionRefs`. Entry transitions are listed by the
   States that offer them.
</spec-statement>

```mermaid
classDiagram
  class Journey {
    id
    label
    defaultEntryRef
    entryRefs
    stateRefs
    transitionRefs
    exitRefs
  }

  class JourneyEntry {
    id
    stateRef
  }

  class State {
    id
    label
  }

  class JourneyExit {
    id
    label
  }

  class Transition {
    id
    from
    to
  }

  Journey --> JourneyEntry : defaultEntryRef
  Journey --> JourneyEntry : entryRefs
  JourneyEntry --> State : stateRef
  Journey --> State : stateRefs
  Journey --> JourneyExit : exitRefs
  Journey --> Transition : transitionRefs
  Transition --> State : from
  Transition --> State : to
  Transition --> JourneyExit : to
```

Example JSON node:

```json
[
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:site-search",
    "label": "Site search",
    "defaultEntryRef": "urn:ujg:entry:site-search-default",
    "entryRefs": [
      "urn:ujg:entry:site-search-default"
    ],
    "stateRefs": [
      "urn:ujg:state:search-form",
      "urn:ujg:state:results"
    ],
    "transitionRefs": [
      "urn:ujg:transition:search-form-to-results"
    ]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:site-search-default",
    "stateRef": "urn:ujg:state:search-form"
  }
]
```

A single-state journey can omit `transitionRefs`:

```json
[
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:privacy-policy",
    "label": "Privacy policy",
    "defaultEntryRef": "urn:ujg:entry:privacy-policy-default",
    "entryRefs": [
      "urn:ujg:entry:privacy-policy-default"
    ],
    "stateRefs": [
      "urn:ujg:state:privacy-policy"
    ]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:privacy-policy-default",
    "stateRef": "urn:ujg:state:privacy-policy"
  }
]
```

A journey can also omit `defaultEntryRef` when no entry is semantically a general fallback. In that
case, entry selection is unresolved by Graph unless an execution or materialization context selects
exactly one listed [=JourneyEntry=].

```json
[
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:workshop-detail",
    "label": "Workshop detail",
    "entryRefs": [
      "urn:ujg:entry:workshop-registration-open",
      "urn:ujg:entry:workshop-waitlist-open",
      "urn:ujg:entry:workshop-registration-closed"
    ],
    "stateRefs": [
      "urn:ujg:state:workshop-registration-open",
      "urn:ujg:state:workshop-waitlist-open",
      "urn:ujg:state:workshop-registration-closed"
    ]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:workshop-registration-open",
    "label": "Registration open",
    "stateRef": "urn:ujg:state:workshop-registration-open"
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:workshop-waitlist-open",
    "label": "Waitlist open",
    "stateRef": "urn:ujg:state:workshop-waitlist-open"
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:workshop-registration-closed",
    "label": "Registration closed",
    "stateRef": "urn:ujg:state:workshop-registration-closed"
  }
]
```

### JourneyEntry {data-cop-concept="journey-entry"}

A [=JourneyEntry=] is an explicit entry contract for a [=Journey=]. It identifies the local [=State=] or [=CompositeState=] where traversal begins without making that entry node part of the local transition topology.

<spec-statement>
1. A [=JourneyEntry=] **MUST** be identified by an IRI and declare exactly one `stateRef`.
2. `stateRef` **MUST** reference a [=State=] or [=CompositeState=] listed in the declaring [=Journey=]'s `stateRefs`.
3. A [=JourneyEntry=] **MUST** be listed in exactly one [=Journey=]'s `entryRefs`.
4. A [=JourneyEntry=] **MUST NOT** be used as a [=Transition=] endpoint.
5. A [=JourneyEntry=] **MAY** declare one `label` and one or more `tags`.
</spec-statement>

Top-level traversal of a [=Journey=] begins at an explicitly selected [=JourneyEntry=]. If no
entry is explicitly selected and the [=Journey=] declares `defaultEntryRef`, traversal begins at
the `stateRef` of that default entry. If neither applies, entry selection remains unresolved by
Graph.

When Graph leaves entry selection unresolved, a materialization or execution context may select one
listed entry. Consumers do not infer a default from `entryRefs` order, and contextual entry selection
does not change Graph topology. If no entry can be selected, traversal into that [=Journey=] remains
unresolved; that does not make the Graph invalid.

```mermaid
classDiagram
  class Journey {
    defaultEntryRef
    entryRefs
    stateRefs
  }
  class JourneyEntry {
    id
    stateRef
  }
  class State
  class CompositeState

  Journey --> JourneyEntry : defaultEntryRef
  Journey --> JourneyEntry : entryRefs
  JourneyEntry --> State : stateRef
  JourneyEntry --> CompositeState : stateRef
```

Example JSON node:

```json
{
  "@type": "JourneyEntry",
  "@id": "urn:ujg:entry:site-search-default",
  "label": "Default search entry",
  "stateRef": "urn:ujg:state:search-form"
}
```

### JourneyExit {data-cop-concept="journey-exits"}

A [=JourneyExit=] is a terminal local graph vertex and exported completion contract declared by a [=Journey=]. It represents a terminal journey outcome that can be reached by a local [=Transition=].

A parent journey can use exported exits to distinguish which outcome of a child journey was reached, without directly referencing child states.

<spec-statement>
1. A [=JourneyExit=] **MUST** be identified by an IRI and listed in exactly one [=Journey=]'s `exitRefs`.
2. A [=JourneyExit=] **MAY** declare one `label` and one or more `tags`.
3. A [=JourneyExit=] **MAY** be the `to` endpoint of a [=Transition=] in the declaring [=Journey=].
4. A [=JourneyExit=] is terminal: it **MUST NOT** be a `from` endpoint or expose entry transitions.
5. A [=JourneyExit=] **MUST NOT** model runtime facts, submitted values, analytics facts, or ordinary internal child movement.
6. A [=JourneyExit=] is not a [=State=]: a node **MUST NOT** be typed both [=JourneyExit=] and [=State=].
</spec-statement>

If a completion point is an actual user-visible screen, page, modal, or step, it should remain a normal [=State=]. A journey can then transition from that state to a [=JourneyExit=] that represents the exported terminal outcome.

Informative pattern:

```text
CheckoutForm -> SuccessScreen -> CheckoutCompleteExit
```

```mermaid
classDiagram
  class Journey {
    stateRefs
    exitRefs
  }
  class State
  class JourneyExit
  class Transition

  Journey --> State : stateRefs
  Journey --> JourneyExit : exitRefs
  Transition --> State : from
  Transition --> JourneyExit : to
```

Example JSON nodes:

```json
{
  "@type": "JourneyExit",
  "@id": "urn:ujg:exit:checkout-complete",
  "label": "Checkout complete"
}
```

```json
{
  "@type": "Transition",
  "@id": "urn:ujg:transition:checkout-form-to-complete",
  "label": "Submit checkout",
  "from": "urn:ujg:state:checkout-form",
  "to": "urn:ujg:exit:checkout-complete"
}
```

---

## JourneyEntryIndex {data-cop-concept="journey-index"}

A [=JourneyEntryIndex=] is a Graph class and Core [=Node=] that acts as a catalogue of addressable [=JourneyEntry=] contracts. It is not a subclass of [=Journey=] and does not define traversal. A Consumer **MUST NOT** infer that indexed entries are reachable from one another, ordered as a path, or part of a parent-owned progression.

Use [=Journey=] when modeling local topology. Use [=JourneyEntryIndex=] when listing known entry points into modeled journeys. A root [=Journey=] should only be used when the root itself owns real traversal, progression, or structural order.

In common use, a [=JourneyEntryIndex=] lists default or named [=JourneyEntry=] contracts for modeled pages, surfaces, flows, or journeys. The referenced entries remain owned by their declaring [=Journey=].

<spec-statement>
1. A [=JourneyEntryIndex=] **MUST** be identified by an IRI and declare at least one `entryRefs` value.
2. Each `entryRefs` value **MUST** reference a [=JourneyEntry=] owned by exactly one [=Journey=].
3. A [=JourneyEntryIndex=] is a catalogue only: it **MUST NOT** own topology, entries, states, transitions, exits, or child-journey mappings.
4. `entryRefs` on a [=JourneyEntryIndex=] **MUST NOT** imply order, reachability, progression, a user path, or parent continuation.
</spec-statement>

[=JourneyEntryIndex=] is intended for top-level page maps, product surface indexes, search-result target indexes, documentation indexes, entry catalogues, and other collections of known journey entry points. Do not use [=JourneyEntryIndex=] to model page-segment order, local journey progression, child completion, runtime observations, or experience annotations.

```mermaid
classDiagram
  class JourneyEntryIndex {
    id
    label
    entryRefs
  }

  class JourneyEntry {
    stateRef
  }

  class State
  class CompositeState
  JourneyEntryIndex --> JourneyEntry : entryRefs
  JourneyEntry --> State : stateRef
  JourneyEntry --> CompositeState : stateRef
```

Example JSON node:

```json
{
  "@type": "JourneyEntryIndex",
  "@id": "urn:ujg:index:site-pages",
  "label": "Site page index",
  "entryRefs": [
    "urn:ujg:entry:home-page-default",
    "urn:ujg:entry:search-page-default",
    "urn:ujg:entry:profile-page-default"
  ]
}
```

The indexed entries are known entry contracts. Their order above does not define a path from the home page to search to profile.

---

## CompositeState {data-cop-concept="composition"}

A [=CompositeState=] is a [=State=] that represents nested composition. It references one or more
child [=Journey=] resources through `subjourneyRefs`, allowing consumers to interpret those Journeys
as zoomable or nested local graphs.

The parent journey treats the [=CompositeState=] as one parent-local state. The parent journey does
not list the child Journeys' states directly.

<spec-statement>
1. A [=CompositeState=] **MUST** be a [=State=].
2. A [=CompositeState=] **MUST** declare at least one `subjourneyRefs` value.
3. Every `subjourneyRefs` value **MUST** be an IRI that resolves to a [=Journey=].
4. `subjourneyRefs` is a set. Each resolved child Journey occurs at most once in the set.
5. A [=CompositeState=] **MUST NOT** list child states directly with `stateRefs`.
6. The parent [=Journey=] **MUST** treat the [=CompositeState=] as one local vertex regardless of the
   number of child Journeys.
7. Every referenced child Journey defines an independent local topology scope.
8. The order in which `subjourneyRefs` values are serialized **MUST NOT** imply priority, sequence,
   causality, activation order, or presentation order.
9. A Consumer **MUST NOT** infer a [=Transition=], dependency, condition, synchronization rule, or
   completion relationship between child Journeys from their common containment.
10. Multiple `subjourneyRefs` values represent child Journeys that coexist within the same
    [=CompositeState=] occurrence: each is independently available without requiring progression
    through another. While such an occurrence is current, observations belonging to different child
    Journeys **MAY** overlap or interleave. Child Journeys that are experienced in a defined sequence
    **MUST NOT** be grouped under one [=CompositeState=]; a Producer **MUST** instead model that
    sequence as separate States or CompositeStates connected by explicit Transitions within the
    enclosing Journey.
11. A child Journey's internal movement does not, by itself, change the current local position of
    another child Journey.
12. A [=CompositeState=] with one child Journey defines ordinary nested composition.
13. A [=CompositeState=] with more than one child Journey defines multi-Journey composition.
14. Each child Journey **SHOULD** represent one coherent behavioral concern that is independently
    understandable from its siblings.
15. Common containment of child Journeys **MUST NOT** by itself imply that they represent different
    domain entities, related domain entities, or parts of one domain aggregate.
</spec-statement>

```mermaid
classDiagram
  class State
  class CompositeState {
    subjourneyRefs 1..*
  }
  class Journey {
    stateRefs
    transitionRefs
    exitRefs
  }

  State <|-- CompositeState
  Journey --> CompositeState : stateRefs
  CompositeState --> Journey : subjourneyRefs
```

Example JSON node:

```json
{
  "@type": "CompositeState",
  "@id": "urn:ujg:state:product-page",
  "label": "Product page",
  "subjourneyRefs": [
    "urn:ujg:journey:product-browsing",
    "urn:ujg:journey:sticky-cart"
  ]
}
```

The Product browsing and Sticky cart Journeys are separate local topology scopes that coexist: the
sticky cart stays independently available regardless of how the shopper navigates product content,
and neither Journey must be entered first or finished before the other. A checkout flow where
shipping must be completed before payment becomes available is not this pattern — it is a sequence,
and belongs in separate States connected by explicit Transitions, per item 10 above.

### Nested composition

<spec-statement>
1. A child Journey **MAY** contain a [=CompositeState=] in its own `stateRefs`.
2. Composition is interpreted recursively; child Journeys **MUST NOT** be flattened into the parent
   Journey's local vertex set.
3. A child [=JourneyExit=] leaves the directly containing [=CompositeState=] occurrence in the
   applicable containment path.
4. Leaving a nested [=CompositeState=] does not by itself leave an ancestor [=CompositeState=]. The
   ancestor is left only through movement that exits that ancestor's own composite scope.
</spec-statement>

### Composite occurrence isolation

<spec-statement>
1. Multiple concrete occurrences of the same canonical [=CompositeState=] **MAY** coexist within one
   active [=Journey=].
2. Each concrete CompositeState occurrence has a distinct composite scope occurrence for Mapping
   purposes.
3. Child observations associated with one CompositeState occurrence **MUST NOT** be used as local
   predecessors for child observations associated with another occurrence.
4. Graph does not define occurrence identifiers or occurrence-association data.
</spec-statement>

### JourneyExit in a composite scope

A [=JourneyExit=] owned by any child Journey of a [=CompositeState=] is an exported exit from that
CompositeState.

These rules apply to child Journeys referenced through `subjourneyRefs`. Exits of a Journey entered
through an [=InvokingTransition=] are covered by the [=InvokingTransition=] rules.

<spec-statement>
1. Reaching a child [=JourneyExit=] means that the containing [=CompositeState=] occurrence has been
   left.
2. Once the [=CompositeState=] has been left, none of its child Journeys remains in scope for that
   occurrence.
3. A child Journey's [=JourneyExit=] **MUST NOT** mean only that the child has locally completed while
   the containing [=CompositeState=] remains current.
4. A locally complete point that does not leave the containing [=CompositeState=] **MUST** be modeled
   as a [=State=], not as a [=JourneyExit=].
5. Graph **MUST NOT** infer that every child Journey must reach an exit.
6. Graph **MUST NOT** infer a joint, collective, or all-child completion outcome.
7. Graph **MUST NOT** infer an ordering among exits belonging to different child Journeys.
</spec-statement>

Informative pattern:

```text
Payment Journey:
  Authorizing -> Authorized

Shipping Journey:
  Address -> DeliveryOption -> Confirmed
```

`Authorized` is a State when Payment may remain locally complete while Shipping continues.

```text
Payment Journey:
  Authorizing -> PaymentFailureExit
```

`PaymentFailureExit` leaves the containing Checkout CompositeState.

### Boundary Entry and Exit Mapping {data-cop-concept="boundary-mapping"}

When used on a parent [=Transition=], `toEntryRef` and `fromExitRef` describe how a parent-local
[=CompositeState=] connects to entry and exit contracts belonging to its child Journeys.

These properties are not transition endpoints. The transition's `from` and `to` values remain local to the enclosing journey.

#### Entry boundary

<spec-statement>
1. A [=Transition=] **MAY** declare at most one `toEntryRef` when its `to` value references a
   [=CompositeState=].
2. The `toEntryRef` value **MUST** reference a [=JourneyEntry=] listed in the `entryRefs` of exactly
   one Journey referenced by the target CompositeState's `subjourneyRefs`.
3. `toEntryRef` identifies the child entry represented by that parent boundary Transition.
4. `toEntryRef` applies only to the child Journey that owns the referenced [=JourneyEntry=].
5. `toEntryRef` **MUST NOT** select, initialize, or imply entries for the CompositeState's other child
   Journeys.
6. Entry into a [=CompositeState=] without `toEntryRef` does not select a child Journey or child entry
   at the parent boundary.
7. When traversal of a particular child Journey is interpreted without an explicitly selected entry,
   that child Journey independently uses its `defaultEntryRef`, otherwise a materialization or
   execution context may select exactly one of its listed entries.
8. A Consumer **MUST NOT** infer that every child Journey's default entry is selected merely because
   the containing [=CompositeState=] was entered.
</spec-statement>

#### Exit boundary

<spec-statement>
1. A [=Transition=] **MAY** declare at most one `fromExitRef` when its `from` value references a
   [=CompositeState=].
2. The `fromExitRef` value **MUST** reference a [=JourneyExit=] listed in the `exitRefs` of exactly
   one Journey referenced by the source CompositeState's `subjourneyRefs`.
3. Reaching that child [=JourneyExit=] means that the source [=CompositeState=] occurrence has been
   left.
4. Parent continuation for the child exit may use only a parent [=Transition=] whose `from` is the
   containing [=CompositeState=] and whose `fromExitRef` is that child exit.
5. No matching parent Transition means that no parent continuation is inferred.
6. More than one parent Transition with the same `from` and `fromExitRef` pair is invalid.
7. Taking a parent Transition from a [=CompositeState=], whether or not it declares `fromExitRef`,
   leaves the CompositeState and ends the composite scope for that occurrence.
8. `fromExitRef` remains singular. It identifies one concrete exported child outcome and **MUST NOT**
   represent a conjunction, disjunction, set, or synchronization of exits.
</spec-statement>

In this parent-boundary use, `toEntryRef` and `fromExitRef` **MUST NOT** replace local `from` or `to`,
point directly to child States, or create hidden Graph edges.

```mermaid
classDiagram
  class CompositeState {
    subjourneyRefs 1..*
  }
  class Journey {
    entryRefs
    exitRefs
  }
  class JourneyEntry
  class JourneyExit
  class Transition {
    to
    toEntryRef
    from
    fromExitRef
  }

  CompositeState --> Journey : subjourneyRefs
  Journey --> JourneyEntry : entryRefs
  Journey --> JourneyExit : exitRefs
  Transition --> CompositeState : to/from
  Transition --> JourneyEntry : toEntryRef
  Transition --> JourneyExit : fromExitRef
```

Example child entry selection:

```json
{
  "@type": "Transition",
  "@id": "urn:ujg:transition:cart-to-checkout",
  "label": "Start checkout",
  "from": "urn:ujg:state:cart",
  "to": "urn:ujg:state:checkout",
  "toEntryRef": "urn:ujg:entry:shipping-address"
}
```

The selected `toEntryRef` applies to the Shipping child Journey. It does not select or initialize
entries for the Checkout CompositeState's other child Journeys.

Example parent continuation after a child exit:

```json
{
  "@type": "Transition",
  "@id": "urn:ujg:transition:checkout-to-payment-error",
  "label": "Show payment error",
  "from": "urn:ujg:state:checkout",
  "to": "urn:ujg:state:payment-error",
  "fromExitRef": "urn:ujg:exit:payment-failed"
}
```

---


## Normative Artifacts

This module is published through the following artifacts:

- `graph.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/graph`
- `graph.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld`
- `graph.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/graph.shape`

Examples on this page use compact JSON-LD fragments. Complete documents can use the aggregate
context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`, which preserves Graph's compact
`stateRef` term for [=JourneyEntry=].

### Ontology {data-cop-concept="ontology"}

The normative Graph ontology is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/graph`. It is the authoritative structural definition for Graph classes and properties, including `Journey`, `JourneyEntry`, `JourneyEntryIndex`, `State`, `CompositeState`, `Transition`, `Command`, `JourneyExit`, `OutgoingTransition`, `InvokingTransition`, `defaultEntryRef`, `entryRefs`, `stateRef`, `exitRefs`, `toEntryRef`, `fromExitRef`, `commandRef`, `subjourneyRefs`, and `entryTransitionRefs`.

:::include ./graph.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Graph JSON-LD context is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld`. It provides the compact JSON-LD term mappings for the Graph vocabulary used by the examples on this page.

:::include ./graph.context.jsonld :::

---

### Validation {data-cop-concept="validation"}

The normative Graph SHACL shape is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/graph.shape`. It is the authoritative validation artifact for Graph structural constraints.

:::include ./graph.shape.ttl :::

---

## Graph Integrity and Resolution {data-cop-concept="graph-integrity"}

The rules below define additional graph integrity and resolution behavior beyond the structural constraints captured by the SHACL shape.

<spec-statement>
To ensure graph integrity, the following constraints **MUST** be met:

1. Every Graph reference **MUST** resolve within the current scope or imported modules.
2. References **MUST** resolve to the class expected by the property that uses them.
3. Local [=Transition=] endpoints **MUST** stay inside the declaring [=Journey=]'s local vertex set.
4. On a [=Transition=], `toEntryRef` and `fromExitRef` **MUST** resolve through one of the child
   Journeys referenced by the relevant [=CompositeState=]'s `subjourneyRefs`. The referenced
   [=JourneyEntry=] or [=JourneyExit=] **MUST** be owned by exactly one such child Journey.
5. On an [=OutgoingTransition=] or [=InvokingTransition=], `toEntryRef` **MUST** resolve to a
   [=JourneyEntry=] owned by exactly one [=Journey=], and the entry's `stateRef` **MUST** resolve
   inside that Journey's `stateRefs`.
6. Every `subjourneyRefs` value **MUST** resolve to a [=Journey=].
7. A `subjourneyRefs` set **MUST** contain at least one Journey.
8. The same Journey **MUST NOT** occur more than once in the RDF set represented by `subjourneyRefs`.
9. Child Journey containment **MUST NOT** weaken [=Transition=] endpoint locality.
10. No edge between child Journeys is inferred from their common [=CompositeState=].
11. Each [=OutgoingTransition=] and [=InvokingTransition=] **MUST** declare exactly one `toEntryRef`
    and **MUST NOT** declare `from`, `fromExitRef`, or `to`.
12. Each `commandRef` **MUST** resolve to a [=Command=].
13. The [=Journey=] that owns an [=InvokingTransition=]'s `toEntryRef` **MUST** declare at least one
    `exitRefs` value.
</spec-statement>
