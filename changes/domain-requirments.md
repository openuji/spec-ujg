# Update Specification — UJG Domain Model Extension

## Purpose

Update the UJG Domain Model Extension so that Domain Requirement traceability has a single source of truth.

Remove `domainRequirementRefs` from the `DomainModel` root.

Keep `domainRequirementRefs` only on Domain Model elements that are directly justified by Domain Requirements.

Requirement coverage MUST be derived from those element-level references.

---

## 1. Remove root `domainRequirementRefs`

Change the `DomainModel` shape from:

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

to:

```text
formatVersion
id
entities
valueObjects
associations
domainOperations
invariants
```

A valid root therefore has the form:

```json
{
  "formatVersion": "0.1",
  "id": "urn:domain:model:example",
  "entities": [],
  "valueObjects": [],
  "associations": [],
  "domainOperations": [],
  "invariants": []
}
```

`DomainModel` MUST NOT define `domainRequirementRefs`.

---

## 2. Keep element-level traceability

The following Domain Model elements MUST continue to define:

```text
domainRequirementRefs
```

* `Entity`
* `ValueObject`
* `Property`
* `Association`
* `DomainOperation`
* `Invariant`

`domainRequirementRefs` MUST:

* contain at least one value;
* contain no duplicates within the element;
* reference valid UJG Domain Requirements.

Example:

```json
{
  "id": "urn:domain:operation:accept-offered-place",
  "label": "Accept offered place",
  "domainRequirementRefs": [
    "urn:ujg:domain-requirement:accept-offered-place"
  ],
  "actsOnRefs": [
    "urn:domain:entity:workshop-place-offer"
  ],
  "preconditions": [],
  "postconditions": []
}
```

---

## 3. Traceability semantics

`domainRequirementRefs` means:

> This Domain Model element is necessary to satisfy the referenced Domain Requirement.

A Domain Requirement MUST NOT be referenced merely because the element participates indirectly in a realization involving that requirement.

Producers SHOULD assign only the minimum Domain Requirement references necessary to justify the element.

The same Domain Requirement MAY justify multiple Domain Model elements.

One Domain Model element MAY satisfy multiple Domain Requirements.

---

## 4. Derived requirement coverage

Define **Domain Model Requirement Coverage** as a derived property.

The requirement coverage of a `DomainModel` is the set union of all `domainRequirementRefs` occurring on its contained Domain Model elements, including nested `Property` elements.

Conceptually:

```text
coverage(DomainModel)
    =
union(
  Entity.domainRequirementRefs,
  Entity.Property.domainRequirementRefs,
  ValueObject.domainRequirementRefs,
  ValueObject.Property.domainRequirementRefs,
  Association.domainRequirementRefs,
  DomainOperation.domainRequirementRefs,
  Invariant.domainRequirementRefs
)
```

This coverage MUST NOT be serialized redundantly on the `DomainModel` root.

---

## 5. Completeness is contextual

The Domain Model Extension MUST NOT assume that every Domain Requirement contained in the surrounding UJG document is necessarily in scope for one Domain Model.

Therefore:

* structural validity does not require coverage of every Domain Requirement in the containing UJG document;
* the extension defines which requirements the model demonstrably covers;
* a producer or derivation process MAY require a particular input set of Domain Requirements to be completely covered.

When such a target set exists, completeness is:

```text
target Domain Requirements
    ⊆
derived Domain Model Requirement Coverage
```

This target set belongs to the derivation or validation context and MUST NOT be duplicated into the canonical `DomainModel`.

---

## 6. Domain Requirement reference resolution

Every value in an element's `domainRequirementRefs` MUST resolve to:

```text
DomainRequirement
```

or one of its defined concrete subclasses through the containing UJG document and its normal import resolution.

A dangling Domain Requirement reference makes the Domain Model semantically invalid.

A reference resolving to a non-DomainRequirement node is invalid.

---

## 7. JSON Schema changes

Update `domain-model.schema.json`.

Remove `domainRequirementRefs` from:

```text
DomainModel.properties
DomainModel.required
```

If `additionalProperties: false` is used, root-level `domainRequirementRefs` MUST therefore be rejected.

Keep the existing reusable element definition requiring:

```text
domainRequirementRefs
```

with:

```text
minItems: 1
uniqueItems: true
```

for all Domain Model elements.

Do not encode completeness against external Domain Requirements in JSON Schema.

---

## 8. Processing changes

A Domain Model-aware processor MUST be able to derive requirement coverage by traversing all Domain Model elements.

A processor MUST NOT depend on a root requirement manifest.

A processor validating against a known target requirement set MAY report:

* covered requirements;
* uncovered requirements;
* references to requirements outside the expected target set.

The canonical Domain Model does not change as a result of those diagnostics.

---

## 9. Specification text changes

Remove normative text stating that:

> `DomainModel.domainRequirementRefs` declares the complete set of Domain Requirements the model claims to satisfy.

Remove rules stating that:

> every element-level reference must occur in the root `domainRequirementRefs`.

Replace them with:

> Domain Model requirement coverage is derived from the union of `domainRequirementRefs` on its contained Domain Model elements.

And:

> Completeness relative to a selected set of Domain Requirements is a validation-context concern rather than serialized Domain Model state.

---

## 10. Examples

Update all Domain Model examples from:

```json
{
  "formatVersion": "0.1",
  "id": "urn:domain:model:example",
  "domainRequirementRefs": [
    "urn:ujg:domain-requirement:a",
    "urn:ujg:domain-requirement:b"
  ],
  "entities": [],
  "valueObjects": [],
  "associations": [],
  "domainOperations": [],
  "invariants": []
}
```

to:

```json
{
  "formatVersion": "0.1",
  "id": "urn:domain:model:example",
  "entities": [],
  "valueObjects": [],
  "associations": [],
  "domainOperations": [],
  "invariants": []
}
```

Requirement references remain on actual Domain Model elements.


## 12. Acceptance criteria

* [ ] `DomainModel` no longer defines `domainRequirementRefs`.
* [ ] Root-level `domainRequirementRefs` is rejected by the JSON Schema.
* [ ] `domainRequirementRefs` remains mandatory on every Domain Model element.
* [ ] Requirement references resolve to UJG Domain Requirements.
* [ ] Requirement coverage is defined as a derived union of element-level references.
* [ ] Nested Property references participate in derived coverage.
* [ ] No duplicated root coverage manifest exists.
* [ ] Completeness against a selected Domain Requirement set is handled outside the canonical model.
* [ ] All specification examples use the new root structure.
* [ ] No other Domain Model vocabulary or realization semantics change as part of this update.
