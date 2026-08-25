# Task: Add a second-level UJG `Domain Requirements` optional module

Implement a new **second-level optional UJG module** named **Domain Requirements**.

The purpose of this module is intentionally narrow:

> Make domain requirements implied by UJG journey semantics explicit and machine-addressable, without defining a domain model or changing any existing UJG semantics.

The module must be maximally non-invasive.

No Core, Graph, Surface, Condition, Effect, Entry Binding, Runtime, Mapping, or other existing UJG concept may depend on this module.

The dependency direction is only:

```text
Core / Graph
     ▲
     │
Condition   Effect   Entry Binding
     ▲        ▲           ▲
     └────────┼───────────┘
              │
      Domain Requirements
      [second-level optional]
```

Existing UJG documents must remain valid without this module.

Consumers that do not understand the module must be able to ignore it without changing Graph traversal or any other existing UJG semantics.

---

# 1. Architectural purpose

UJG describes user-observable journey semantics.

For example:

```text
Waitlisted
    │
    │ spot becomes available
    ▼
Offer available
    │
    ├── accept ──> Confirmed
    ├── decline ─> Waitlisted
    └── expire ──> Offer expired
```

Existing optional modules can add semantics such as:

* a `Condition` that must be satisfied for a transition to be eligible;
* an `Effect` associated with a transition;
* an `EntryBinding` that connects an external invocation to a journey entry.

Those concepts intentionally do **not** specify how an application's domain model realizes them.

The Domain Requirements module fills only this gap:

```text
UJG semantics
      │
      ▼
Domain Requirements
      │
      ▼
outside UJG:
domain model / backend / persistence / APIs / implementation
```

A `DomainRequirement` says that the implementation domain must support some capability because of one specific UJG semantic source.

It does not describe how that capability is implemented.

---

# 2. This is NOT a Domain Model module

Be aggressive about this boundary.

The module MUST NOT define vocabulary for:

* entities;
* aggregates;
* value objects;
* fields or properties;
* database schemas;
* tables;
* primary keys;
* persistence;
* API endpoints;
* HTTP;
* RPC;
* commands;
* domain events;
* repositories;
* services;
* transport;
* transactions;
* locks;
* queues;
* authentication mechanisms;
* authorization mechanisms;
* sessions;
* OAuth/OIDC;
* ORM mappings;
* framework-specific concepts;
* programming-language types.

For example, this is a valid Domain Requirement:

```text
The implementation must be able to determine whether
the outstanding workshop offer is still valid.
```

This is NOT a Domain Requirement:

```text
SpotOffer.expiresAt must be a timestamp column.
```

The latter is one possible domain-model realization and belongs outside UJG.

---

# 3. Do not introduce an opaque `kind` system

Do NOT implement this as:

```json
{
  "@type": "DomainRequirement",
  "kind": "effect",
  "basisRefs": ["..."]
}
```

There must be:

* no `kind`;
* no requirement-type enum;
* no generic `basisRefs`;
* no generic `sourceRef`;
* no hidden subtype dispatch through string values.

If a semantic distinction matters, it must be explicit in the ontology.

Use explicit classes and explicit properties.

---

# 4. Normative vocabulary

The initial module must contain exactly these requirement classes:

```text
DomainRequirement
├── StateDomainRequirement
├── ConditionDomainRequirement
├── EffectDomainRequirement
└── EntryBindingDomainRequirement
```

Do not add more requirement classes in this first version.

In particular, do NOT add speculative classes such as:

```text
TransitionDomainRequirement
UserDomainRequirement
SurfaceDomainRequirement
ArtifactDomainRequirement
InvariantDomainRequirement
CompositeDomainRequirement
DomainEntity
DomainConcept
DomainOperation
DomainProperty
```

Those may be considered by future versions if concrete case studies prove they are necessary.

## 4.1 `DomainRequirement`

`DomainRequirement` is the common abstract superclass.

It:

* is a subclass of Core `Node`;
* exists for ontology organization and generic querying;
* MUST NOT be used as the sole type of a concrete requirement.

Concrete requirements must use one of the four concrete subclasses.

`DomainRequirement` introduces one datatype property:

```text
requirement
```

`requirement`:

* MUST contain exactly one string;
* contains the human-readable domain obligation;
* describes what the implementation domain must support;
* MUST remain technology-neutral.

Example conceptual value:

```text
"The implementation must be able to determine whether
the outstanding offer is valid."
```

Graph `label` may additionally be used as an optional short title according to existing Graph semantics.

---

# 5. `StateDomainRequirement`

A `StateDomainRequirement` identifies a domain capability necessary to support the semantics of one Graph `State`.

Properties:

```text
requirement
stateRef
```

`stateRef`:

* MUST occur exactly once;
* MUST reference a Graph `State`;
* may therefore also reference a valid `State` subclass such as `CompositeState` according to existing ontology semantics.

Meaning:

> The referenced user-journey state requires some information or distinction to be supportable by the implementation domain.

Example:

```json
{
  "@type": "StateDomainRequirement",
  "@id": "urn:ujg:domain-requirement:waitlisted-participation",
  "label": "Waitlisted participation is distinguishable",
  "stateRef": "urn:ujg:state:waitlisted",
  "requirement": "The implementation must preserve that the participant is currently waiting for a place in the workshop."
}
```

Important:

A `StateDomainRequirement` does NOT mean that a UJG State is a domain state.

It only says that realization of this user-visible state requires supporting domain semantics.

Most UJG States do not need a `StateDomainRequirement`.

Do not require one for every State.

---

# 6. `ConditionDomainRequirement`

A `ConditionDomainRequirement` identifies domain information or capability necessary to determine one existing UJG `Condition`.

Properties:

```text
requirement
conditionRef
```

`conditionRef`:

* MUST occur exactly once;
* MUST reference a `Condition` from the Conditions module.

Meaning:

> The implementation domain must provide sufficient information or capability for the referenced Condition to be determinable.

Example:

```json
{
  "@type": "ConditionDomainRequirement",
  "@id": "urn:ujg:domain-requirement:offer-validity",
  "label": "Offer validity can be determined",
  "conditionRef": "urn:ujg:condition:offer-valid",
  "requirement": "The implementation must be able to determine whether the outstanding workshop offer is currently valid."
}
```

The requirement MUST NOT define:

* a condition expression language;
* an evaluator API;
* a database lookup;
* an implementation field such as `expiresAt`;
* runtime execution semantics.

For example, the requirement above does not imply how validity is represented.

---

# 7. `EffectDomainRequirement`

An `EffectDomainRequirement` identifies a domain consequence or state-changing capability required to realize one existing UJG `Effect`.

Properties:

```text
requirement
effectRef
```

`effectRef`:

* MUST occur exactly once;
* MUST reference an `Effect` from the Effect module.

Meaning:

> The implementation domain must be capable of realizing the declared consequence associated with the referenced Effect.

Example:

```json
{
  "@type": "EffectDomainRequirement",
  "@id": "urn:ujg:domain-requirement:accept-offer",
  "label": "Accepted offer confirms participation",
  "effectRef": "urn:ujg:effect:accept-offer",
  "requirement": "Accepting the outstanding offer must consume that offer and establish confirmed workshop participation."
}
```

The requirement MUST NOT define how this happens.

It must not introduce:

* API calls;
* HTTP methods;
* commands;
* database updates;
* transactions;
* retries;
* idempotency implementation;
* service boundaries.

Those remain downstream implementation concerns.

---

# 8. `EntryBindingDomainRequirement`

An `EntryBindingDomainRequirement` identifies domain identity or continuity semantics required when resolving one existing `EntryBinding`.

Properties:

```text
requirement
entryBindingRef
```

`entryBindingRef`:

* MUST occur exactly once;
* MUST reference an `EntryBinding` from the Entry Binding module.

Meaning:

> Resolving the referenced external journey entry requires some domain context, identity, or continuity property to be preserved.

Example for the workshop email → application journey:

```json
{
  "@type": "EntryBindingDomainRequirement",
  "@id": "urn:ujg:domain-requirement:spot-offer-continuity",
  "label": "Offer identity survives touchpoint change",
  "entryBindingRef": "urn:ujg:entry-binding:spot-offer",
  "requirement": "The external application entry must resolve the same outstanding participant-specific offer represented by the notification."
}
```

This explicitly expresses the domain need for continuity without specifying:

* accounts;
* login;
* sessions;
* JWT;
* OAuth;
* cookies;
* URL tokens;
* database IDs.

An implementation may choose any appropriate realization.

---

# 9. One semantic source per requirement

Keep this version intentionally simple.

Each concrete requirement is anchored to exactly one semantic source:

```text
StateDomainRequirement
        → stateRef

ConditionDomainRequirement
        → conditionRef

EffectDomainRequirement
        → effectRef

EntryBindingDomainRequirement
        → entryBindingRef
```

Do NOT introduce multi-source `basisRefs`.

Do NOT reproduce the UJG Graph inside this module.

If several aspects of UJG jointly imply domain semantics, express the necessary requirements independently against their respective semantic sources.

Example:

```text
Condition: offer-valid
    ↓
ConditionDomainRequirement:
offer validity must be determinable

Effect: accept-offer
    ↓
EffectDomainRequirement:
acceptance must establish confirmation

State: confirmed
    ↓
StateDomainRequirement:
confirmed participation must be representable
```

The existing UJG topology already relates the Condition, Transition, Effect, and States.

The Domain Requirements module must not create a second graph of those relationships.

---

# 10. Requirement semantics

A Domain Requirement is a declarative downstream obligation.

It MUST NOT:

* create a Graph edge;
* change `from` or `to`;
* create a State;
* create a Transition;
* make a Transition eligible;
* evaluate a Condition;
* execute an Effect;
* resolve an EntryBinding;
* alter Runtime ordering;
* create RuntimeEvents;
* change Mapping;
* imply navigation;
* imply execution order.

The referenced UJG node retains all of its original semantics independently of this module.

A requirement merely states what an implementation domain must support in order to realize that semantic source.

---

# 11. Traceability is assertion, not proof

The reference property means:

> This Domain Requirement is justified by this UJG semantic source.

It does NOT mean:

> Every processor can mechanically derive this requirement from that source.

The module does not standardize a derivation algorithm.

Requirements may be:

* human-authored;
* AI-derived;
* tool-generated;
* imported from another requirements workflow.

The module standardizes the resulting interoperable requirement and its traceability anchor.

Do NOT add properties such as:

```text
confidence
derived
assumed
designChoice
reasoning
generator
model
```

Those belong to generation/evaluation tooling or opaque extensions, not the normative vocabulary.

---

# 12. Avoid redundant requirements

Normative prose should state that a Domain Requirement SHOULD add domain semantics that are not already completely represented by UJG topology itself.

Bad requirement:

```text
The implementation must allow the user to move from
Offer to Confirmed.
```

Graph already represents that transition.

Good requirement:

```text
The implementation must ensure that accepting the
outstanding offer establishes confirmed participation.
```

This captures a domain consequence not represented by topology alone.

Likewise, do not create a `StateDomainRequirement` for every State simply because the class exists.

---

# 13. Cross-node invariants are deliberately out of scope for v1

Do not solve general domain invariants in this first version.

For example:

```text
Two participants must never consume the same final workshop seat.
```

may involve several states, effects, and conditions.

Do NOT respond by adding generic constructs such as:

```text
InvariantDomainRequirement
CompositeDomainRequirement
basisRefs
relatedRefs
```

Leave this problem explicitly listed as a possible future extension.

The first version should validate whether source-specific requirements are sufficient in real case studies before expanding the vocabulary.

---

# 14. Ontology

Use repository conventions and create a dedicated namespace for the module, using the module slug:

```text
domain-requirements
```

Follow the same publication/version patterns used by existing UJG optional modules.

Conceptually the ontology must contain:

```turtle
DomainRequirement
    rdfs:subClassOf ujg:Node .

StateDomainRequirement
    rdfs:subClassOf DomainRequirement .

ConditionDomainRequirement
    rdfs:subClassOf DomainRequirement .

EffectDomainRequirement
    rdfs:subClassOf DomainRequirement .

EntryBindingDomainRequirement
    rdfs:subClassOf DomainRequirement .
```

Properties:

```text
requirement
    DatatypeProperty
    domain: DomainRequirement
    range: xsd:string

stateRef
    ObjectProperty
    domain: StateDomainRequirement
    range: Graph State

conditionRef
    ObjectProperty
    domain: ConditionDomainRequirement
    range: Condition

effectRef
    ObjectProperty
    domain: EffectDomainRequirement
    range: Effect

entryBindingRef
    ObjectProperty
    domain: EntryBindingDomainRequirement
    range: EntryBinding
```

Use the actual prefixes and namespaces already defined by the repository for Graph, Condition, Effect, and Entry Binding. Do not invent aliases if existing ones differ.

Avoid unnecessary OWL machinery beyond what existing UJG modules normally use.

---

# 15. JSON-LD context

Publish a module-specific JSON-LD context following existing optional-module conventions.

It must expose these compact terms:

```text
DomainRequirement
StateDomainRequirement
ConditionDomainRequirement
EffectDomainRequirement
EntryBindingDomainRequirement

requirement
stateRef
conditionRef
effectRef
entryBindingRef
```

All four `*Ref` properties must be JSON-LD `@id` references.

Do NOT modify existing Core/Graph/Condition/Effect/Entry Binding contexts to add these terms.

Consumers opt into the new module by composing its context.

Example:

```json
{
  "@context": [
    "...core.context.jsonld",
    "...graph.context.jsonld",
    "...condition.context.jsonld",
    "...effect.context.jsonld",
    "...entry-binding.context.jsonld",
    "...domain-requirements.context.jsonld"
  ]
}
```

Use actual repository publication URLs.

---

# 16. SHACL validation

Create a normative SHACL shape following the patterns of existing modules.

## Common requirement constraint

Every concrete Domain Requirement MUST:

* be an IRI;
* have exactly one `requirement`;
* have `requirement` as `xsd:string`.

Bare `DomainRequirement` must not be accepted as the sole concrete requirement type.

## `StateDomainRequirement`

Must have:

```text
stateRef minCount 1
stateRef maxCount 1
stateRef class Graph State
stateRef nodeKind IRI
```

It MUST NOT need any of the other requirement-source properties.

## `ConditionDomainRequirement`

Must have:

```text
conditionRef minCount 1
conditionRef maxCount 1
conditionRef class Condition
conditionRef nodeKind IRI
```

## `EffectDomainRequirement`

Must have:

```text
effectRef minCount 1
effectRef maxCount 1
effectRef class Effect
effectRef nodeKind IRI
```

## `EntryBindingDomainRequirement`

Must have:

```text
entryBindingRef minCount 1
entryBindingRef maxCount 1
entryBindingRef class EntryBinding
entryBindingRef nodeKind IRI
```

Follow repository conventions for ontology-assisted SHACL class validation.

Do not introduce SHACL rules that infer domain models or attempt to judge whether the natural-language `requirement` is semantically correct.

---

# 17. Graceful degradation

Normatively specify:

A consumer that does not implement Domain Requirements semantics MAY ignore Domain Requirement nodes.

Such a consumer SHOULD preserve recognized JSON-LD data during read-transform-write when possible.

Ignoring Domain Requirements MUST NOT change:

* Graph topology;
* Graph traversal;
* Condition semantics;
* Effect semantics;
* Entry Binding semantics;
* Surface semantics;
* Runtime;
* Mapping.

---

# 18. Initial workshop example

Include at least one combined example illustrating why the module exists.

Use a small workshop waitlist scenario.

Example semantic sources:

```text
State:
urn:ujg:state:waitlisted

Condition:
urn:ujg:condition:offer-valid

Effect:
urn:ujg:effect:accept-offer

EntryBinding:
urn:ujg:entry-binding:spot-offer
```

And requirements:

```json
[
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
```

The surrounding example must make clear that none of these requirements implies a specific domain model.

A downstream generator could validly realize them using different models, for example:

```text
Workshop + Registration + SpotOffer
```

or another architecture satisfying the same requirements.

Do not put those generated domain concepts into the normative UJG example vocabulary.

---

# 19. Specification page structure

Follow the style of existing UJG optional modules.

The page should contain approximately:

```text
1. Overview
2. Non-goals / future considerations
3. Terminology
4. DomainRequirement
5. StateDomainRequirement
6. ConditionDomainRequirement
7. EffectDomainRequirement
8. EntryBindingDomainRequirement
9. Requirement Model / Processing Rules
10. Normative Artifacts
   10.1 Ontology
   10.2 JSON-LD Context
   10.3 SHACL
11. Examples
```

The Overview should clearly state:

> Domain Requirements is a second-level optional module for declaring implementation-domain obligations anchored to existing UJG semantics. It does not define domain models or implementation architecture.

---

# 20. Architecture/index integration

Register the new module under:

```text
Second-Level Optional Modules
```

in the Editor's Draft navigation/index.

Only make upstream documentation changes required to:

* list the module;
* link to it;
* describe its second-level dependency status if the repository maintains such metadata.

Do NOT add Domain Requirements vocabulary to Core, Graph, or first-level modules.

Do NOT make other modules normatively depend on Domain Requirements.

The architecture must remain:

```text
existing specs/modules
        ↑
        │ referenced by
        │
Domain Requirements
```

never:

```text
Domain Requirements
        ↑
        │ required by
        │
Graph / Condition / Effect / etc.
```

---

# 21. Normative artifact set

Follow current optional-module conventions and produce the equivalents of:

```text
domain-requirements.ttl
domain-requirements.context.jsonld
domain-requirements.shape.ttl
```

plus the specification source/page and repository metadata necessary for publication.

Use the project's existing generators/build tooling rather than duplicating generated output by hand where applicable.

---

# 22. Tests / fixtures

Add positive validation fixtures covering all four concrete requirement types.

Add negative fixtures for at least:

1. `DomainRequirement` used without a concrete subtype.
2. Missing `requirement`.
3. Multiple `requirement` values.
4. `StateDomainRequirement` without `stateRef`.
5. `StateDomainRequirement` with more than one `stateRef`.
6. `stateRef` pointing to a non-State.
7. `ConditionDomainRequirement` pointing to a non-Condition.
8. `EffectDomainRequirement` pointing to a non-Effect.
9. `EntryBindingDomainRequirement` pointing to a non-EntryBinding.
10. Missing source reference for each concrete subtype.

Run all existing specification validation/build tests and ensure this module causes no regressions.

---

# 23. Acceptance criteria

The implementation is complete only when all of the following are true:

* [ ] Domain Requirements appears as a second-level optional module.
* [ ] Existing Core and Graph vocabularies are unchanged.
* [ ] Existing first-level module vocabularies are unchanged.
* [ ] No existing module normatively depends on Domain Requirements.
* [ ] `DomainRequirement` exists as the common abstract superclass.
* [ ] `StateDomainRequirement` exists.
* [ ] `ConditionDomainRequirement` exists.
* [ ] `EffectDomainRequirement` exists.
* [ ] `EntryBindingDomainRequirement` exists.
* [ ] There is no `kind`.
* [ ] There is no generic `basisRefs`.
* [ ] There is no generic `sourceRef`.
* [ ] Each concrete class has its explicit typed `*Ref`.
* [ ] Every concrete requirement has exactly one textual `requirement`.
* [ ] Each source ref has the correct ontology range.
* [ ] Bare `DomainRequirement` is not a valid concrete instance.
* [ ] The module defines no domain-model vocabulary.
* [ ] The module defines no persistence/API/authentication vocabulary.
* [ ] The module creates no hidden Graph traversal.
* [ ] The module changes no Condition/Effect/Entry Binding semantics.
* [ ] Ontology, context, and SHACL artifacts are published.
* [ ] Positive and negative validation fixtures exist.
* [ ] A workshop waitlist example demonstrates all four requirement classes.
* [ ] Existing test/build/validation suites remain green.

---

# 24. Implementation discipline

Before editing, inspect the repository's current implementations of:

```text
Condition
Effect
Entry Binding
Experience Annotation
```

Use them to follow current conventions for:

* module directory structure;
* namespace publication;
* ontology formatting;
* JSON-LD contexts;
* SHACL shapes;
* specification source files;
* tests;
* navigation;
* generated artifacts.

Do not redesign repository infrastructure as part of this task.

If repository conventions conflict with incidental filenames or prefixes in this brief, preserve the semantic design in this brief but follow the repository's established mechanical conventions.

If implementing a requirement from this brief would require changing existing UJG semantics rather than merely referencing them, stop and treat that as a design problem rather than modifying the upstream spec.

The central invariant of this task is:

> **Domain Requirements may depend on and reference existing UJG semantics. Existing UJG semantics must remain completely independent of Domain Requirements.**
