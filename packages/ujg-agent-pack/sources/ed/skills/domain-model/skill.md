# UJG ED Domain Model Design

Use this skill together with `ujg-ed-modeling`. Do not use it as a replacement for the parent modeling skill.

## Purpose

Design a coherent, minimal, technology-neutral `DomainModel` directly from canonical UJG topology and optional explicit domain knowledge.

This is a design activity, not mechanical derivation.

UJG constrains observable behavior. Domain knowledge may add semantics that UJG intentionally does not represent. Domain design chooses a coherent model satisfying both.

The result MUST conform to:

`https://ujg.specs.openuji.org/ed/extensions/domain-model`

and its JSON Schema.

## Inputs

Required:

* canonical UJG document;
* Domain Model JSON Schema.

Optional:

* existing `DomainModel`;
* explicit business/domain knowledge;
* business invariants;
* established domain terminology;
* prior approved design decisions.

Do not require a separate intermediate requirement layer.

## Placement

Produce the canonical payload for:

```text
UJGDocument.extensions["org.openuji.domain-model"]
```

Do not add a payload-level extension version marker. Select the schema from the containing UJG
document's specification family and namespace artifact route.

Preserve unrelated UJG content and extensions.

## Semantic sources

Distinguish three sources.

### UJG-constrained semantics

Semantics required by UJG topology:

* States that must be materializable;
* Conditions that must be decidable;
* Effects that must be realizable;
* branch and lifecycle distinctions;
* identity or continuity required by journey structure.

These MAY justify `ujgRefs`.

### Explicit domain knowledge

Business semantics supplied independently of UJG, such as:

* invariants;
* policies;
* consistency constraints;
* legal or organizational rules;
* domain classifications.

Do not claim these are derived from UJG.

They MAY produce Domain Model elements without `ujgRefs`.

### Domain-design choices

Choices needed because UJG does not uniquely determine domain representation.

For example, availability may be represented by capacity, remaining places, or another coherent domain concept.

Such choices are allowed but MUST be reported as design decisions.

## Topology-first analysis

Analyze canonical UJG directly.

Do not first translate UJG into prose requirements.

For each `CompositeState` with `subjourneyRefs`, analyze every referenced child `Journey` as its own
semantic evidence scope before correlating across siblings. A child journey's evidence includes its
`JourneyEntry` contracts, reachable `State` and `CompositeState` nodes, local `Transition` nodes,
`JourneyExit` contracts, and applicable optional-module nodes referenced by those topology elements.
Conditions and Effects attached to transitions are evidence in the behavioral concern of each
transition's owning journey; a shared Condition or Effect may contribute evidence in each owning
journey scope without changing Graph ownership.

For each reachable State or relevant CompositeState, inspect as needed:

* incoming transitions;
* outgoing transitions;
* Conditions;
* Effects;
* sibling branches in ConditionalTransitionSets;
* connected States and JourneyExits;
* JourneyEntries;
* enclosing Journey and composite context;
* User and Touchpoint when relevant to identity or continuity.

Do not serialize this topology into the Domain Model.

Do not flatten sibling child journeys in a multi-journey `CompositeState` into one implied sequence
or one combined state space.

## State realization

For every reachable UJG State ask:

> What implementation semantics must exist so this State can be materialized correctly?

Conceptually classify the State as:

* domain-backed;
* derived from domain;
* application/interaction state;
* presentation/validation state;
* structural.

Only domain semantics belong in the `DomainModel`.

Do not create a Domain Model element merely because a UJG State exists.

Forms, reviews, navigation states, and validation-error states normally remain outside the Domain Model unless they have independent domain meaning.

## Transition analysis

For each relevant transition consider:

```text
source
  + condition
  + effect
  → target
```

### Conditions

Determine what domain facts or rules are necessary for the branch to be decidable.

Do not automatically create:

```text
isX: boolean
```

or:

```text
determineX()
```

merely because a Condition exists.

Design coherent domain semantics from which the Condition can be evaluated.

### Effects

Determine what domain behavior or state change is required.

Create a `DomainOperation` when genuine domain behavior is involved.

Its postconditions MUST correspond to modeled domain semantics.

### Target States

Determine what must be true after the transition so the target State can be materialized.

### Alternative branches

Determine what semantic distinction allows alternative transitions to be selected correctly.

Use ConditionalTransitionSet context when available.

## Entry and continuity

Inspect entries and EntryBindings only where they introduce domain-relevant context or identity.

Do not infer accounts, sessions, authentication systems, tokens, database IDs, or routing mechanisms merely because external entry exists.

When UJG requires the same logical resource to continue across touchpoints, design stable domain identity sufficient to support that continuity.

If such continuity is desired but not represented by UJG or supplied domain knowledge, report an alignment question rather than inventing it.

## Domain synthesis

Design the model globally after topology analysis.

Prefer concepts that explain several related States, Conditions, and Effects.

Do not model each State independently.

Do not infer any of the following solely from multi-journey `CompositeState` topology: one child
journey maps to exactly one `Entity`, `ValueObject`, `Relationship`, `DomainOperation`, or
`Invariant`; sibling child journeys imply a domain relationship; a child journey is a bounded context,
aggregate, service, component, persistence boundary, or technical module; sibling journeys
synchronize, depend on each other, cause each other, or share a lifecycle; sibling child states form
Cartesian-product domain states; a child `JourneyExit` is collective composite or aggregate
completion.

Use only the Domain Model vocabulary defined by the specification:

* `Entity`;
* `ValueObject`;
* `Property`;
* `Relationship`;
* `DomainOperation`;
* `Invariant`.

Do not introduce unsupported DDD vocabulary merely because it is conventional.

## Modeling discipline

Use an `Entity` when independent identity matters.

Use a `ValueObject` when meaning is defined by value.

Use a `Property` for stable domain information, not UI or transport fields.

Use a `Relationship` when the relationship itself has domain meaning.

Use a `DomainOperation` for domain behavior that establishes or changes domain semantics.

Use an `Invariant` for a rule that must remain true across valid domain behavior.

Do not encode technical architecture.

## Invariants

Treat invariants by origin.

### UJG-constrained invariant

If topology constrains the rule:

* include relevant `ujgRefs`;
* do not state more than UJG supports.

### Supplied business invariant

If explicitly supplied as domain knowledge:

* include it;
* do not fabricate `ujgRefs`.

### Candidate invariant

If merely plausible but unsupported:

* do not add it to the canonical Domain Model;
* report it separately as a domain question.

Do not invent business policy to make the model appear complete.

## Observable-behavior alignment

For any domain rule ask:

> Could this rule change observable UJG behavior?

Examples:

* preventing a transition;
* selecting another branch;
* preventing an Effect;
* introducing another user-visible outcome;
* changing reachable States.

If yes and UJG does not represent that behavior, report a UJG alignment issue.

Domain knowledge that does not alter represented journey behavior may remain solely in the Domain Model.

## Traceability

Use optional `ujgRefs` for direct UJG design traceability.

A `ujgRefs` value means:

> this UJG semantic element constrains, motivates, or explains this Domain Model element.

It does not mean the model element was mechanically derived from UJG.

Do not fabricate `ujgRefs` for independent domain knowledge.

Do not add irrelevant transitive references.

A child `Journey` referenced by `subjourneyRefs` may appear in `ujgRefs` only when that journey
directly constrains, motivates, or explains the Domain Model element. One Domain Model element may
reference multiple child journeys, and multiple elements may reference the same child journey; neither
case is a mechanical derivation rule.

## Minimality

Produce the smallest coherent domain design that supports the required journey behavior and supplied domain knowledge.

Prefer:

* established terminology;
* concepts explaining multiple topology elements;
* minimal lifecycle duplication;
* explicit domain meaning;
* technology-neutral semantics.

Remove:

* duplicate concepts;
* presentation-only concepts;
* tautological operations;
* redundant invariants;
* unjustified properties;
* unnecessary traceability.

## Existing models

When an existing `DomainModel` is supplied, evolve it rather than rebuilding it unnecessarily.

Preserve stable IDs and semantics where still valid.

Do not remove valid independent business knowledge merely because it has no `ujgRefs`.

## Realization boundary

Do not choose:

* frontend or backend placement;
* persistence technology;
* database schema;
* API design;
* transport;
* framework architecture;
* repositories or controllers;
* authentication implementation;
* messaging infrastructure;
* deployment topology.

Model domain semantics only.

## Validation

Before returning the result:

1. validate against the Domain Model JSON Schema;
2. verify all Domain Model IDs are unique;
3. resolve all internal Domain Model references;
4. resolve every present `ujgRefs` value;
5. inspect every reachable UJG State for realizability;
6. inspect relevant Conditions for decidability;
7. inspect domain-relevant Effects for realizability;
8. verify alternative branches have sufficient semantic distinctions;
9. verify multi-journey composite children were analyzed independently before cross-child
   correlation;
10. verify no unsupported sibling relationship, synchronization, bounded-context, aggregate,
    technical-module, or Cartesian-product domain-state inference was introduced;
11. verify DomainOperation postconditions are represented by the model;
12. verify every Domain Model element is justified by UJG, supplied domain knowledge, or a documented design choice;
13. verify every Invariant has a clear origin;
14. keep unsupported candidate invariants outside the canonical payload;
15. report domain rules that conflict with or extend observable UJG behavior;
16. remove presentation-only and unnecessary concepts;
17. verify no technical realization decision was introduced.

## Output

Return:

1. the canonical `DomainModel` payload;
2. material domain-design decisions;
3. supplied domain knowledge incorporated into the model;
4. unsupported candidate domain questions;
5. UJG alignment issues, if any.

Keep rationale outside the canonical payload unless the specification defines a canonical field for it.

## Core rule

UJG defines observable journey behavior.

Topology reveals what must be materializable, decidable, and realizable.

Explicit domain knowledge may add semantics that UJG does not contain.

Domain design creates the smallest coherent technology-neutral model satisfying both.

Do not confuse topology constraints, domain knowledge, and design choices.
