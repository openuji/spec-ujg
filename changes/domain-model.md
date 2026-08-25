# UJG Domain Model Extension

## 1. Purpose

Define an optional UJG **Domain Model Extension** for attaching a technology-neutral application domain model to a `UJGDocument`.

The extension:

* is attached at document level;
* is defined normatively by JSON Schema;
* is not RDF vocabulary;
* derives its traceability from UJG Domain Requirements;
* does not prescribe technical realization.

The extension is intended to be evolvable into an independent Domain Model specification later.

---

## 2. Classification

The Domain Model is a **Document Extension**, not an RDF optional module.

Publish it under a new specification category:

```text
Document Extensions
└── Domain Model
```

The specification route MUST be:

```text
/extensions/domain-model
```

The Editor's Draft route MUST follow the site's corresponding ED convention:

```text
/ed/extensions/domain-model
```

Add a **Document Extensions** section to the specification overview and list **Domain Model** there.

Do not list Domain Model under First-Level Optional Modules or Second-Level Optional Modules.

---

## 3. Generic UJGDocument extension support

Core currently defines `extensions` for `Node`.

Extend the same generic mechanism to `UJGDocument`.

`extensions` MAY appear on:

* `Node`;
* `UJGDocument`.

The rules MUST remain generic:

* `extensions` MUST be a JSON object;
* each top-level key MUST identify an extension namespace;
* each extension value MUST be a JSON object;
* unknown extensions MUST be preserved during non-lossy read-transform-write;
* unknown extensions MUST NOT affect Core identity, import resolution, reference resolution, or Graph semantics.

Core MUST NOT contain Domain Model-specific properties or processing rules.

Do not introduce:

```text
domainModel
domainModelRef
```

into Core.

---

## 4. Extension identity

The Domain Model Extension key is:

```text
org.openuji.domain-model
```

Example attachment:

```json
{
  "@type": "UJGDocument",
  "@id": "https://example.org/journey.jsonld",

  "extensions": {
    "org.openuji.domain-model": {
      "formatVersion": "0.1",
      "id": "urn:domain:model:example",
      "domainRequirementRefs": [],
      "entities": [],
      "valueObjects": [],
      "associations": [],
      "domainOperations": [],
      "invariants": []
    }
  },

  "nodes": []
}
```

The value of `org.openuji.domain-model` is the `DomainModel`.

---

## 5. Processing model

From the perspective of generic UJG JSON-LD processing, the Domain Model payload is opaque JSON.

It MUST NOT be expanded into RDF terms.

A processor implementing the Domain Model Extension additionally:

1. validates the payload using the Domain Model JSON Schema;
2. resolves referenced Domain Requirements;
3. resolves internal Domain Model references;
4. applies the semantic rules defined by this specification.

A processor that does not implement this extension MAY ignore its semantics while preserving its JSON payload.

---

## 6. Relationship to Domain Requirements

The Domain Model Extension depends on the UJG Domain Requirements specification.

Traceability follows:

```text
DomainModel element
        │
        │ domainRequirementRefs
        ▼
DomainRequirement
        │
        │ source-specific requirement reference
        ▼
UJG semantics
```

The Domain Model Extension MUST NOT duplicate direct references to Conditions, Effects, States, EntryBindings, or other UJG semantic sources for requirement traceability.

Domain Requirements are the boundary between UJG journey semantics and the Domain Model.

---

## 7. Vocabulary

Version `0.1` defines:

```text
DomainModel
Entity
ValueObject
Property
Association
DomainOperation
Invariant
```

Do not introduce additional DDD concepts in `0.1` without demonstrated need.

In particular, `0.1` does not define:

```text
Aggregate
AggregateRoot
DomainService
DomainEvent
Repository
Command
BoundedContext
```

---

## 8. DomainModel

A `DomainModel` contains:

```text
formatVersion
id
domainRequirementRefs
entities
valueObjects
associations
domainOperations
invariants
```

### `formatVersion`

MUST be:

```text
0.1
```

### `id`

MUST be a stable identifier for the Domain Model.

### `domainRequirementRefs`

Declares the complete set of UJG Domain Requirements this Domain Model claims to satisfy.

Every reference MUST resolve to a `DomainRequirement` or one of its concrete subclasses.

Every requirement listed here MUST be referenced by at least one contained Domain Model element.

Every `domainRequirementRefs` value on a contained element MUST also occur in the root `domainRequirementRefs`.

### Collections

The following arrays MUST exist:

```text
entities
valueObjects
associations
domainOperations
invariants
```

They MAY be empty.

---

## 9. Common Domain Element

Every:

```text
Entity
ValueObject
Property
Association
DomainOperation
Invariant
```

MUST contain:

```text
id
label
domainRequirementRefs
```

and MAY contain:

```text
description
```

### `id`

MUST:

* uniquely identify the element within the Domain Model;
* remain stable while the element's semantics remain stable.

### `label`

MUST provide a concise human-readable domain name.

### `domainRequirementRefs`

MUST:

* contain at least one Domain Requirement reference;
* contain no duplicates;
* contain only references declared by the containing `DomainModel`.

The references express why the element exists in the Domain Model.

---

## 10. Entity

An `Entity` represents a domain object for which independent identity matters.

Shape:

```text
id
label
description?
domainRequirementRefs
properties
```

`properties` MUST be an array of `Property`.

The specification does not prescribe how entity instances are identified or persisted.

---

## 11. ValueObject

A `ValueObject` represents a domain value whose meaning is determined by its value rather than an independent identity lifecycle.

Shape:

```text
id
label
description?
domainRequirementRefs
properties
```

`properties` MUST be an array of `Property`.

A producer SHOULD NOT introduce a ValueObject merely to wrap a primitive value without domain significance.

---

## 12. Property

A `Property` describes domain information belonging to an Entity or ValueObject.

Shape:

```text
id
label
description?
domainRequirementRefs
valueType
allowedValues?
```

`valueType` in version `0.1` MUST be one of:

```text
string
integer
number
boolean
date
datetime
```

`allowedValues` MAY restrict the property to a finite set of values.

Example:

```json
{
  "id": "urn:domain:property:status",
  "label": "Status",
  "domainRequirementRefs": [
    "urn:ujg:domain-requirement:status"
  ],
  "valueType": "string",
  "allowedValues": [
    "pending",
    "complete"
  ]
}
```

The specification does not define:

* storage types;
* programming-language types;
* columns;
* nullability;
* serialization formats.

---

## 13. Association

An `Association` represents a required relationship between domain objects.

Shape:

```text
id
label
description?
domainRequirementRefs
sourceRef
targetRef
```

`sourceRef` and `targetRef` MUST resolve to an `Entity` or `ValueObject` in the same Domain Model.

Version `0.1` does not standardize cardinality.

It does not define ORM or persistence relationships.

---

## 14. DomainOperation

A `DomainOperation` represents behavior required from the domain.

Shape:

```text
id
label
description?
domainRequirementRefs
actsOnRefs
preconditions
postconditions
```

### `actsOnRefs`

MUST be an array of references to `Entity` or `ValueObject` elements in the same Domain Model.

### `preconditions`

MUST be an array of technology-neutral semantic statements.

### `postconditions`

MUST be an array of technology-neutral semantic statements.

Version `0.1` deliberately defines no predicate or expression language.

A `DomainOperation` does not imply:

* an API operation;
* an HTTP endpoint;
* a service method;
* a UI action handler;
* a specific execution location.

---

## 15. Invariant

An `Invariant` represents a domain rule that must remain true across valid domain behavior.

Shape:

```text
id
label
description?
domainRequirementRefs
appliesToRefs
assertion
```

`appliesToRefs` MUST reference Domain Model elements.

`assertion` MUST be a technology-neutral semantic statement.

Version `0.1` defines no executable invariant language.

---

## 16. Internal references

All Domain Model element IDs MUST be unique.

The following references MUST resolve within the same Domain Model:

```text
Association.sourceRef
Association.targetRef
DomainOperation.actsOnRefs
Invariant.appliesToRefs
```

A structurally valid JSON document containing dangling internal references is semantically invalid.

---

## 17. Domain Requirement resolution

Every value in `domainRequirementRefs` MUST resolve to a UJG Domain Requirement available through the containing UJG document and its normal import resolution.

JSON Schema is responsible only for structural validation.

Cross-reference resolution MUST be performed by a Domain Model-aware UJG validator.

A dangling Domain Requirement reference makes the Domain Model invalid.

---

## 18. Requirement coverage

For every Domain Requirement declared by:

```text
DomainModel.domainRequirementRefs
```

at least one contained Domain Model element MUST reference that requirement.

This permits:

```text
one requirement → multiple Domain Model elements
multiple requirements → one Domain Model element
```

No one-to-one mapping is implied.

---

## 19. Realization boundary

The Domain Model describes domain semantics.

It MUST NOT prescribe:

* frontend versus backend placement;
* browser versus server execution;
* local versus remote persistence;
* SQL or NoSQL;
* APIs or transport;
* framework architecture;
* repositories or controllers;
* authentication mechanisms;
* messaging infrastructure;
* deployment topology.

These are downstream realization decisions.

---

## 20. JSON Schema

Publish a normative JSON Schema using JSON Schema Draft 2020-12.

Publish it under:

```text
/extensions/domain-model/domain-model.schema.json
```

and the corresponding Editor's Draft route.

The schema MUST:

* validate `formatVersion`;
* define the complete `0.1` structural vocabulary;
* use `$defs` for reusable definitions;
* require all mandatory fields;
* set `additionalProperties: false` on defined objects;
* enforce non-empty `domainRequirementRefs` on Domain Model elements;
* enforce unique array values where appropriate;
* validate internal reference fields structurally as identifiers.

The JSON Schema MUST NOT attempt semantic UJG reference resolution.

---

## 21. Non-goals

Version `0.1` is not a complete DDD modeling language.

It does not standardize:

* aggregate boundaries;
* services;
* repositories;
* domain events;
* commands;
* persistence models;
* API models;
* executable rule languages;
* technical architecture.

New vocabulary SHOULD be introduced only when repeated use demonstrates a stable interoperability need.

---

## 22. Specification overview

Add a new overview section:

```text
Document Extensions
```

with explanatory text equivalent to:

> Document Extensions define optional interoperable JSON structures attached to a UJGDocument. Unlike graph-native optional modules, their payloads do not participate directly in the UJG RDF graph and may use their own validation mechanisms.

List:

```text
Domain Model
```

with a link to:

```text
/extensions/domain-model
```

---

## 23. Validation fixtures

Provide positive fixtures for:

* Entity and Property;
* ValueObject;
* Association;
* DomainOperation;
* Invariant;
* one requirement satisfied by multiple elements;
* one element satisfying multiple requirements.

Provide negative fixtures for:

* unsupported `formatVersion`;
* duplicate IDs;
* missing `domainRequirementRefs`;
* empty element `domainRequirementRefs`;
* undeclared element requirement reference;
* dangling Domain Requirement reference;
* uncovered root Domain Requirement;
* dangling Association reference;
* dangling `actsOnRefs`;
* dangling `appliesToRefs`;
* unknown JSON properties.

---

## 24. Acceptance criteria

* [ ] `extensions` is supported generically on `UJGDocument`.
* [ ] Core contains no Domain Model-specific vocabulary.
* [ ] `Document Extensions` exists as a specification overview category.
* [ ] `Domain Model` is listed under that category.
* [ ] The route is `/extensions/domain-model`.
* [ ] The extension key is `org.openuji.domain-model`.
* [ ] The payload is governed by JSON Schema rather than RDF/SHACL.
* [ ] The root type is `DomainModel`.
* [ ] The vocabulary is `Entity`, `ValueObject`, `Property`, `Association`, `DomainOperation`, and `Invariant`.
* [ ] The collection name is `domainOperations`.
* [ ] The requirement-reference property is consistently named `domainRequirementRefs`.
* [ ] The root declares the Domain Requirements covered by the model.
* [ ] Every Domain Model element has at least one `domainRequirementRefs` entry.
* [ ] Every declared Domain Requirement is covered by at least one element.
* [ ] Internal references are validated.
* [ ] No realization architecture is prescribed.
* [ ] Consumers without extension support can preserve and ignore the payload.
