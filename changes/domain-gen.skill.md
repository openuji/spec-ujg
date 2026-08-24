# UJG Domain Model Derivation

## Purpose

Derive the smallest stable `DomainModel` that satisfies a defined set of UJG Domain Requirements.

The result MUST conform to the UJG Domain Model Extension specification and its supplied JSON Schema.

This skill derives domain semantics. It does not define the Domain Model format or choose technical realization.

## Inputs

Required:

* canonical UJG document;
* Domain Requirements to be covered;
* Domain Model JSON Schema.

Optional:

* an existing `DomainModel` to evolve.

Treat UJG IDs, Domain Requirement IDs, and the supplied schema as authoritative.

## Derivation

For each Domain Requirement:

1. determine what domain semantics are necessary to satisfy it;
2. represent those semantics using the Domain Model Extension vocabulary;
3. reuse existing Domain Model elements when they preserve the required distinctions;
4. add the Domain Requirement ID to each resulting element's `domainRequirementRefs`.

Use surrounding UJG semantics when needed to understand the requirement.

Do not mechanically translate UJG nodes into Domain Model elements.

Do not derive domain semantics from conventional application stereotypes.

## Modeling

Use the definitions from the Domain Model Extension specification.

In particular:

* use `Entity` when independent domain identity matters;
* use `ValueObject` when meaning is defined by value rather than independent identity;
* use `Property` for required information belonging to an Entity or ValueObject;
* use `Association` for required relationships;
* use `DomainOperation` for required domain behavior;
* use `Invariant` for rules that must remain true across valid domain behavior.

Do not introduce a Domain Model element merely because it is common DDD practice.

## Traceability

Set the root `DomainModel.domainRequirementRefs` to the complete set of Domain Requirements this derivation covers.

Every generated Domain Model element MUST contain at least one `domainRequirementRefs` entry.

Every element-level requirement reference MUST also occur in the root `domainRequirementRefs`.

Every root Domain Requirement MUST be covered by at least one Domain Model element.

Do not add direct UJG semantic references when traceability is already provided through Domain Requirements.

## Minimality

Produce the smallest model that satisfies all declared Domain Requirements.

Reuse elements that satisfy several requirements when doing so does not collapse required distinctions.

Remove redundant or unjustified elements.

A Domain Model element without Domain Requirement justification is a defect.

## Ambiguity

Do not invent missing semantics.

If satisfying a requirement requires a decision that cannot be derived from the inputs:

* report the unresolved decision separately;
* reference the affected Domain Requirement IDs;
* do not silently encode the assumption into the Domain Model;
* do not report the model as complete.

## Stability

When an existing `DomainModel` is supplied, evolve it rather than rebuilding it unnecessarily.

Preserve existing:

* IDs;
* names;
* element boundaries;
* associations;
* domain operations;
* invariants

when their semantics remain valid.

Change the model only when changed requirements justify a semantic change.

Avoid stylistic renaming or restructuring.

## Realization boundary

Derive domain semantics only.

Do not choose:

* frontend or backend placement;
* local or remote execution;
* persistence technology;
* API or transport design;
* framework architecture;
* repository or service structure;
* authentication mechanisms;
* messaging infrastructure;
* deployment topology.

If the inputs constrain realization, express the required domain semantics rather than selecting a technology.

## Validation

Before returning the result:

1. validate the `DomainModel` against the supplied Domain Model JSON Schema;
2. resolve every `domainRequirementRefs` value;
3. verify every root Domain Requirement is covered;
4. resolve all internal Domain Model references;
5. verify every generated element has requirement justification;
6. remove redundant or unsupported elements;
7. verify that no realization decision has been introduced as domain semantics.

Do not return an invalid or incomplete model as complete.

## Output

Produce the canonical `DomainModel` payload for:

```text
UJGDocument.extensions["org.openuji.domain-model"]
```

Keep unresolved derivation issues outside the canonical Domain Model payload unless a later Domain Model Extension version explicitly defines such a construct.

When modifying an existing UJG document, preserve all unrelated UJG content and all unrelated extension payloads unchanged.

## Core Rule

UJG defines the journey.

Domain Requirements define what that journey requires from the application domain.

The Domain Model Extension defines how those domain semantics are represented.

This skill derives the smallest stable conforming `DomainModel`.

Technical realization happens afterwards.
