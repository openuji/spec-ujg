## Overview

Domain Requirements is a second-level optional module for declaring implementation-domain
obligations anchored to existing UJG semantics. It does not define domain models or implementation
architecture.

UJG describes user-observable journey semantics. First-level optional modules can add semantics such
as transition conditions, transition effects, and opaque entry bindings. Domain Requirements makes
the implementation-domain obligations implied by those semantic sources explicit and
machine-addressable without changing the source modules.

This module is intentionally narrow. A [=DomainRequirement=] says that an implementation domain must
support some capability because of one specific UJG semantic source. It does not describe how that
capability is implemented.

Consumers that do not implement this module MAY ignore Domain Requirement nodes. Ignoring this
module MUST NOT change Graph topology, Graph traversal, Condition semantics, Effect semantics, Entry
Binding semantics, Surface semantics, Runtime, or Mapping.

## Non-goals and Future Considerations

This module does not define a domain model. It MUST NOT define vocabulary for entities, aggregates,
value objects, fields, database schemas, tables, primary keys, persistence, API endpoints, HTTP, RPC,
commands, domain events, repositories, services, transport, transactions, locks, queues,
authentication mechanisms, authorization mechanisms, sessions, OAuth/OIDC, ORM mappings, framework
concepts, or programming-language types.

Cross-node invariants are deliberately out of scope for this first version. A future module may
define additional vocabulary for invariants or multi-source requirements.

## Terminology

- <dfn>DomainRequirement</dfn>: An abstract superclass for implementation-domain obligations
  anchored to UJG semantic sources.
- <dfn>StateDomainRequirement</dfn>: A domain requirement anchored to one Graph `State`.
- <dfn>ConditionDomainRequirement</dfn>: A domain requirement anchored to one `Condition`.
- <dfn>EffectDomainRequirement</dfn>: A domain requirement anchored to one `Effect`.
- <dfn>EntryBindingDomainRequirement</dfn>: A domain requirement anchored to one `EntryBinding`.
- <dfn>Requirement source</dfn>: The single UJG node whose semantics justify a concrete domain
  requirement.

## DomainRequirement {data-cop-concept="domain-requirement"}

[=DomainRequirement=] is the common abstract superclass for concrete requirements. It exists for
ontology organization and generic querying.

A [=DomainRequirement=] MUST NOT be used as the sole concrete type of a requirement node. Concrete
requirements MUST use exactly one of the concrete classes defined by this module.

The `requirement` property contains the human-readable domain obligation. It describes what the
implementation domain must support and MUST remain technology-neutral.

<spec-statement>
1. A concrete Domain Requirement **MUST** be identified by an IRI.
2. A concrete Domain Requirement **MUST** declare exactly one `requirement`.
3. The `requirement` value **MUST** be an `xsd:string`.
4. The `requirement` value **MUST** remain technology-neutral.
5. `DomainRequirement` **MUST NOT** be used as the sole concrete requirement type.
6. A concrete Domain Requirement **MUST NOT** use more than one concrete Domain Requirements
   subclass.
</spec-statement>

## StateDomainRequirement {data-cop-concept="state-domain-requirement"}

A [=StateDomainRequirement=] identifies a domain capability necessary to support the semantics of
one Graph `State`. It does not mean that a UJG `State` is a domain state.

<spec-statement>
1. A [=StateDomainRequirement=] **MUST** declare exactly one `stateRef`.
2. The `stateRef` value **MUST** be an IRI.
3. The `stateRef` value **MUST** reference a Graph `State`, including valid subclasses such as
   `CompositeState`.
4. A [=StateDomainRequirement=] **MUST NOT** declare `conditionRef`, `effectRef`, or
   `entryBindingRef`.
5. A [=StateDomainRequirement=] **SHOULD** add domain semantics not already completely represented by
   UJG topology.
</spec-statement>

Example JSON node:

```json
{
  "@type": "StateDomainRequirement",
  "@id": "urn:ujg:domain-requirement:waitlisted-participation",
  "label": "Waitlisted participation is distinguishable",
  "stateRef": "urn:ujg:state:waitlisted",
  "requirement": "The implementation must preserve that the participant is currently waiting for a place in the workshop."
}
```

## ConditionDomainRequirement {data-cop-concept="condition-domain-requirement"}

A [=ConditionDomainRequirement=] identifies domain information or capability necessary to determine
one existing UJG `Condition`.

<spec-statement>
1. A [=ConditionDomainRequirement=] **MUST** declare exactly one `conditionRef`.
2. The `conditionRef` value **MUST** be an IRI.
3. The `conditionRef` value **MUST** reference a `Condition` from the Conditions module.
4. A [=ConditionDomainRequirement=] **MUST NOT** declare `stateRef`, `effectRef`, or
   `entryBindingRef`.
5. A [=ConditionDomainRequirement=] **MUST NOT** define a condition expression language, evaluator
   API, database lookup, implementation field, or runtime execution semantics.
</spec-statement>

Example JSON node:

```json
{
  "@type": "ConditionDomainRequirement",
  "@id": "urn:ujg:domain-requirement:offer-validity",
  "label": "Offer validity can be determined",
  "conditionRef": "urn:ujg:condition:offer-valid",
  "requirement": "The implementation must be able to determine whether the outstanding workshop offer is currently valid."
}
```

## EffectDomainRequirement {data-cop-concept="effect-domain-requirement"}

An [=EffectDomainRequirement=] identifies a domain consequence or state-changing capability required
to realize one existing UJG `Effect`.

<spec-statement>
1. An [=EffectDomainRequirement=] **MUST** declare exactly one `effectRef`.
2. The `effectRef` value **MUST** be an IRI.
3. The `effectRef` value **MUST** reference an `Effect` from the Effect module.
4. An [=EffectDomainRequirement=] **MUST NOT** declare `stateRef`, `conditionRef`, or
   `entryBindingRef`.
5. An [=EffectDomainRequirement=] **MUST NOT** define API calls, HTTP methods, commands, database
   updates, transactions, retries, idempotency implementation, or service boundaries.
</spec-statement>

Example JSON node:

```json
{
  "@type": "EffectDomainRequirement",
  "@id": "urn:ujg:domain-requirement:accept-offer",
  "label": "Accepted offer confirms participation",
  "effectRef": "urn:ujg:effect:accept-offer",
  "requirement": "Accepting the outstanding offer must consume that offer and establish confirmed workshop participation."
}
```

## EntryBindingDomainRequirement {data-cop-concept="entry-binding-domain-requirement"}

An [=EntryBindingDomainRequirement=] identifies domain identity or continuity semantics required
when resolving one existing `EntryBinding`.

<spec-statement>
1. An [=EntryBindingDomainRequirement=] **MUST** declare exactly one `entryBindingRef`.
2. The `entryBindingRef` value **MUST** be an IRI.
3. The `entryBindingRef` value **MUST** reference an `EntryBinding` from the Entry Binding module.
4. An [=EntryBindingDomainRequirement=] **MUST NOT** declare `stateRef`, `conditionRef`, or
   `effectRef`.
5. An [=EntryBindingDomainRequirement=] **MUST NOT** define accounts, login, sessions, JWT, OAuth,
   cookies, URL tokens, database identifiers, or any other identity implementation.
</spec-statement>

Example JSON node:

```json
{
  "@type": "EntryBindingDomainRequirement",
  "@id": "urn:ujg:domain-requirement:spot-offer-continuity",
  "label": "Offer identity survives touchpoint change",
  "entryBindingRef": "urn:ujg:entry-binding:spot-offer",
  "requirement": "The external application entry must resolve the same outstanding participant-specific offer represented by the notification."
}
```

## Requirement Model and Processing Rules

Each concrete requirement is anchored to exactly one semantic source:

- `StateDomainRequirement` uses `stateRef`.
- `ConditionDomainRequirement` uses `conditionRef`.
- `EffectDomainRequirement` uses `effectRef`.
- `EntryBindingDomainRequirement` uses `entryBindingRef`.

If several aspects of UJG jointly imply domain semantics, authors SHOULD express the necessary
requirements independently against their respective semantic sources. The existing UJG topology
already relates states, transitions, conditions, effects, and entries. Domain Requirements MUST NOT
create a second graph of those relationships.

Traceability is assertion, not proof. A reference property asserts that a requirement is justified
by its UJG semantic source. This module does not standardize a derivation algorithm. Requirements
may be human-authored, AI-derived, tool-generated, or imported from another requirements workflow.

A Domain Requirement is a declarative downstream obligation. It MUST NOT create a Graph edge, change
`from` or `to`, create a State, create a Transition, make a Transition eligible, evaluate a
Condition, execute an Effect, resolve an EntryBinding, alter Runtime ordering, create
RuntimeEvents, change Mapping, imply navigation, or imply execution order.

Domain Requirements SHOULD add domain semantics that are not already completely represented by UJG
topology itself. A requirement such as "The implementation must allow the user to move from Offer to
Confirmed" is redundant when Graph already represents that transition.

A consumer that does not implement Domain Requirements semantics MAY ignore Domain Requirement
nodes. Such a consumer SHOULD preserve recognized JSON-LD data during read-transform-write when
possible.

## Normative Artifacts

This module is published through the following artifacts:

- `domain-requirements.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/domain-requirements`
- `domain-requirements.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/domain-requirements.context.jsonld`
- `domain-requirements.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/domain-requirements.shape`

Examples in this page compose the shared baseline context with the Conditions, Effect, Entry
Binding, and Domain Requirements contexts:

```json
[
  "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/condition.context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/effect.context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/entry-binding.context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/domain-requirements.context.jsonld"
]
```

### Ontology {data-cop-concept="ontology"}

The normative Domain Requirements ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/domain-requirements`.

:::include ./domain-requirements.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Domain Requirements JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/domain-requirements.context.jsonld`.

:::include ./domain-requirements.context.jsonld :::

### Validation {data-cop-concept="validation"}

The normative Domain Requirements SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/domain-requirements.shape`.

:::include ./domain-requirements.shape.ttl :::

The SHACL shape validates structure and source-reference classes. It does not validate whether the
natural-language `requirement` value is semantically correct.

## Examples

### Workshop Waitlist Example

This example shows a participant moving through a workshop waitlist flow. The Graph, Condition,
Effect, and Entry Binding nodes retain their own semantics. Domain Requirement nodes only state the
implementation-domain obligations needed to realize those semantics.

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/condition.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/effect.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/entry-binding.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/domain-requirements.context.jsonld"
  ],
  "@id": "https://example.com/ujg/workshop-waitlist.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:workshop-waitlist",
      "defaultEntryRef": "urn:ujg:entry:workshop-waitlist-default",
      "entryRefs": [
        "urn:ujg:entry:workshop-waitlist-default",
        "urn:ujg:entry:workshop-offer"
      ],
      "stateRefs": [
        "urn:ujg:state:waitlisted",
        "urn:ujg:state:offer-available",
        "urn:ujg:state:confirmed",
        "urn:ujg:state:offer-expired"
      ],
      "transitionRefs": [
        "urn:ujg:transition:spot-available",
        "urn:ujg:transition:accept-offer",
        "urn:ujg:transition:decline-offer",
        "urn:ujg:transition:expire-offer"
      ]
    },
    {
      "@type": "JourneyEntry",
      "@id": "urn:ujg:entry:workshop-waitlist-default",
      "stateRef": "urn:ujg:state:waitlisted"
    },
    {
      "@type": "JourneyEntry",
      "@id": "urn:ujg:entry:workshop-offer",
      "stateRef": "urn:ujg:state:offer-available"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:waitlisted",
      "label": "Waitlisted"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:offer-available",
      "label": "Offer available"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:confirmed",
      "label": "Confirmed"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:offer-expired",
      "label": "Offer expired"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:spot-available",
      "from": "urn:ujg:state:waitlisted",
      "to": "urn:ujg:state:offer-available",
      "label": "Spot becomes available"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:accept-offer",
      "from": "urn:ujg:state:offer-available",
      "to": "urn:ujg:state:confirmed",
      "label": "Accept",
      "conditionRef": "urn:ujg:condition:offer-valid",
      "effectRef": "urn:ujg:effect:accept-offer"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:decline-offer",
      "from": "urn:ujg:state:offer-available",
      "to": "urn:ujg:state:waitlisted",
      "label": "Decline"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:expire-offer",
      "from": "urn:ujg:state:offer-available",
      "to": "urn:ujg:state:offer-expired",
      "label": "Expire"
    },
    {
      "@type": "Condition",
      "@id": "urn:ujg:condition:offer-valid"
    },
    {
      "@type": "Effect",
      "@id": "urn:ujg:effect:accept-offer"
    },
    {
      "@type": "EntryBinding",
      "@id": "urn:ujg:entry-binding:spot-offer",
      "entryRef": "urn:ujg:entry:workshop-offer",
      "value": "workshop-offer-entry"
    },
    {
      "@type": "StateDomainRequirement",
      "@id": "urn:ujg:domain-requirement:waitlisted",
      "stateRef": "urn:ujg:state:waitlisted",
      "requirement": "The implementation must preserve that the participant is currently waiting for a place in the workshop."
    },
    {
      "@type": "ConditionDomainRequirement",
      "@id": "urn:ujg:domain-requirement:offer-validity",
      "conditionRef": "urn:ujg:condition:offer-valid",
      "requirement": "The implementation must be able to determine whether the outstanding workshop offer is currently valid."
    },
    {
      "@type": "EffectDomainRequirement",
      "@id": "urn:ujg:domain-requirement:accept-offer",
      "effectRef": "urn:ujg:effect:accept-offer",
      "requirement": "Accepting the outstanding offer must consume that offer and establish confirmed workshop participation."
    },
    {
      "@type": "EntryBindingDomainRequirement",
      "@id": "urn:ujg:domain-requirement:offer-continuity",
      "entryBindingRef": "urn:ujg:entry-binding:spot-offer",
      "requirement": "The external application entry must resolve the same outstanding participant-specific offer represented by the notification."
    }
  ]
}
```

A downstream generator could satisfy these requirements using different implementation models. Those
downstream domain concepts are intentionally not part of the UJG vocabulary.
