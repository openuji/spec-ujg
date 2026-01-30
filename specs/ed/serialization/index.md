## Abstract {.unnumbered}

This document defines the **shared wire format** for User Journey Graph (UJG) data. It specifies cross-module serialization rules—including JSON/JSON-LD conventions, identifier uniqueness, timestamp formats, and extensibility—that apply to all UJG modules.

This module is intentionally minimal: it defines _how_ data is structured on the wire, while the specific object models (e.g., Journey, State, Transition) are defined in their respective modules (Designed, Runtime, Observed).

## Scope

This module defines:

- JSON serialization constraints
- [=UJG Document=] forms (single object or bundle)
- Common fields and [=Reserved key|Reserved keys=]
- Timestamp representation
- Reference conventions (including journeyRef)
- Extensibility container (extensions)
- Forward compatibility behavior
- Optional JSON-LD handling (`@context`)
- A baseline processing model for Consumers
- A shared "wire rules" JSON Schema (structure-level validation)

This module does not define:

- The design-time journey model (Designed)
- Runtime tracking or event semantics
- Module-specific required fields beyond what is stated here

## Conformance

### Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** are to be interpreted as described in RFC 2119 and RFC 8174.

### Conformance classes

This specification defines requirements for:

- **UJG Producer**: software that emits (serializes) UJG JSON.
- **UJG Consumer**: software that ingests (parses/validates/processes) UJG JSON.
- **UJG Round-tripper** (optional): a Consumer that re-emits the ingested data while preserving unrecognized extension content (§Extensibility).

A system MAY conform to more than one class.

## Terminology

This module covers:

- <dfn>JSON value</dfn>: As defined by RFC 8259.
- <dfn>UJG Object</dfn>: A JSON object that contains a `type` member whose value is a string.
- <dfn>UJG Document</dfn>: Either (a) a single [=UJG Object=], or (b) a UJG Document Wrapper Object containing an `items` array of [=UJG Object|UJG Objects=].
- <dfn>Reserved key</dfn>: A member name listed in [§#reserved-key|Reserved keys] whose meaning is defined by this specification.
- <dfn>Referencable object</dfn>: A [=UJG Object=] that contains an `id` member. (An object without `id` is not referencable by this specification.)

## Serialization format (normative)

### JSON

1. UJG data **MUST** be serialized as [=JSON value=]s as defined by RFC 8259.
2. A UJG Producer **MUST** encode serialized JSON text as UTF-8.
3. Arrays **MUST** preserve element order (array element order is significant).
4. A UJG Producer **MUST NOT** emit JSON objects with duplicate member names.
5. A UJG Consumer **MUST** treat duplicate member names as an error.
6. A UJG Consumer **MUST NOT** require any particular ordering of members within a JSON object.

## Document forms and bundling (normative)

### Single-object document

A [=UJG Document=] MAY be a single [=UJG Object=].

### Bundle document (UJG Document Wrapper Object)

A [=UJG Document=] MAY be a JSON object with:

- `type`: the string `"UJGDocument"`, and
- `items`: an array of [=UJG Object|UJG Objects=].

If a bundle document is used:

- `items` **MUST** be a JSON array.
- Each element of `items` **MUST** be a [=UJG Object=] (i.e., MUST include `type` as a string).
- If present, `id` on the wrapper identifies the document itself and **MUST NOT** be used as an identifier for objects within `items`.

**In-document uniqueness rule:** Within a single [=UJG Document=] (single-object or bundle), no two [=Referencable object=]s **MAY** share the same `id`. A UJG Consumer **MUST** treat duplicate `id` values within one document as an error.

Note (normative): Objects defined by modules (e.g., top-level items in _Designed_) are [=UJG Object=]s when they include `type`, and therefore participate in this uniqueness rule even when nested.

#### Example (bundle document)

```json
{
  "type": "UJGDocument",
  "id": "https://ujg.example/docs/checkout-bundle",
  "items": [
    {
      "type": "Journey",
      "id": "https://ujg.example/journeys/checkout",
      "version": "2026.01"
    },
    {
      "type": "TransitionSet",
      "id": "https://ujg.example/transitions/global-nav",
      "version": "2026.01"
    }
  ]
}
```

## Common fields and conventions (normative)

### type

Every [=UJG Object=] **MUST** include a `type` member whose value is a non-empty string.

Whether a nested object is a [=UJG Object=] is defined by the module that defines the containing property. This specification does not require `type` on non-UJG nested objects unless they are intended to be [=UJG Object=]s.

### id

A [=Referencable object=] **MUST** include an `id` member whose value is a non-empty string.

- `id` values **MUST** be globally unique within the publisher’s publication context.
- `id` values **MUST** be unique within a single [=UJG Document=] (see §In-document uniqueness rule).
- Consumers **MUST** treat `id` as an opaque string (no required parsing or dereferencing).

### version

If a [=UJG Object=] includes `version`, its value **MUST** be a non-empty string.

Unless a module specifies otherwise, Consumers **MUST** treat `version` as an opaque string and **MUST NOT** infer ordering semantics from it.

### Reserved key

The following member names are [=Reserved key|Reserved keys=] across [=UJG Object|UJG Objects=]:

`type`, `id`, `version`, `name`, `description`, `createdAt`, `updatedAt`, `extensions`, `@context`

### Reserved key integrity

- Producers **MUST NOT** change the meaning of [=Reserved key=]s.
- Consumers **MUST** treat [=Reserved key=]-misuse as an error.

### Reserved key misuse (testable conditions)

[=Reserved key=]-misuse occurs when:

- `type` exists and is not a string.
- `id` exists and is not a non-empty string.
- `version` exists and is not a non-empty string.
- `name` exists and is not a string.
- `description` exists and is not a string.
- `createdAt` or `updatedAt` exists and is not a timestamp string conforming to §Timestamps.
- `extensions` exists and is not a JSON object (§Extensibility container).
- `@context` exists and is neither a string nor a JSON object nor an array.

## Extensibility container

Any [=UJG Object=] **MAY** include an `extensions` member.

### Rules

- `extensions` **MUST** be a JSON object.
- Member names inside `extensions` **SHOULD** be collision-resistant (e.g., reverse-DNS like `com.example.foo` or an IRI-like namespace).
- `extensions` member names **MUST NOT** use [=Reserved key=] names listed in [§#reserved-key|Reserved keys].

### Consumer behavior

- Consumers **MUST** ignore unknown members inside `extensions` by default.
- A UJG Round-tripper **MUST** preserve the full `extensions` object (including unknown members) when re-serializing, unless preservation is impossible for the implementation.

## Timestamps (normative)

Whenever timestamps are used (including `createdAt`, `updatedAt`, and module-defined timestamp members):

- They **MUST** be RFC 3339 date-time strings.
- They **MUST** include an explicit timezone offset or "Z" (UTC).

### Example

```json
"2025-12-29T10:12:00Z"
```

## References (normative)

Unless a module defines otherwise, references to other objects **MUST** be by identifier string (the referenced object's `id`).

Consumers **MAY** validate that a referenced `id` exists within the same [=UJG Document=], but cross-document references are allowed and validation may require external context.

## Forward compatibility (normative)

### Unknown members

A Consumer **MUST** be forward-compatible by default:

- It **MUST** ignore unknown members that are not [=Reserved key=]s.
- It **MUST** apply module rules for required members and validity; missing/invalid required data **MUST** cause validation failure per the applicable module.

### Strictness

A Consumer **MAY** offer a "strict mode" that rejects unknown non-reserved members; strict mode is non-default and is not required for conformance.

## Optional JSON-LD mode (normative)

JSON-LD is **OPTIONAL**.

If JSON-LD mode is used:

- A Producer **MAY** include `@context`.
- A Consumer that does not implement JSON-LD processing **MUST** treat `@context` as an ignorable member (subject to reserved-key type constraints) and continue processing UJG data as plain JSON.

### Minimal pattern (example)

```json
{
  "@context": "https://ujg.example/ns/context.jsonld",
  "type": "Journey",
  "id": "https://ujg.example/TR/2026.01/journeys/checkout",
  "version": "2026.01"
}
```

## Processing model (normative)

A conforming Consumer **MUST**:

1. Parse the input as JSON (RFC 8259).
2. Fail if any JSON object contains duplicate member names.
3. Determine [=UJG Document=] form:
   - If top-level is a [=UJG Object=] (has `type` string), process it as a single-object document.
   - Else if top-level is an object with `type == "UJGDocument"` and `items` array, process each `items[i]` as a [=UJG Object=].
   - Else fail (not a [=UJG Document=]).
4. Enforce [=Reserved key=] constraints for all encountered [=UJG Object=]s (and the wrapper object, if present).
5. Enforce in-document `id` uniqueness for [=Referencable object|Referencable objects=].
6. Ignore unknown non-reserved members and ignore unknown `extensions` members by default.

## Designed terminology alignment note (informative)

- **UJG Object (wire-level)**: any JSON object with a string `type`.
- In Designed, all objects that are defined as top-level items (or bundle `items[]`) are [=UJG Object=]s.
- **Embedded objects**: Designed may define embedded shapes that can omit `type`. That is module-defined and intentionally not enforced by this shared serialization schema.
- **References in Designed**:
  - Designed structural references like `from`, `to`, `stateId`, `transitionId`, etc. should be string `id` references unless Designed explicitly defines a richer ref object.

## Examples (non-normative)

### Single-object document

```json
{
  "type": "Journey",
  "id": "https://ujg.example/journeys/checkout",
  "version": "2026.01",
  "name": "Checkout Journey",
  "extensions": {
    "com.example.analytics": { "trackingPlan": "v2" }
  }
}
```

### Journey version reference

```json
{
  "type": "ObservedSession",
  "id": "urn:session:12345",
  "journeyRef": {
    "id": "https://ujg.example/journeys/checkout",
    "version": "2026.01"
  }
}
```

## Security and privacy considerations (informative)

UJG data may contain identifiers, timestamps, and behavioral structure that can enable correlation or re-identification. Publishers should:

- Avoid embedding personal data in `id` values.
- Treat timestamps as potentially sensitive (correlation risk).
- Apply appropriate minimization, pseudonymization, and access controls when sharing runtime/observed data.

## Appendix A: UJG wire-rules JSON Schema (shared, cross-module)

This schema validates:

- top-level [=UJG Document=] form (single object or bundle wrapper),
- [=Reserved key=] types,
- journeyRef shape,
- extensions is an object and cannot use [=Reserved key=] names inside.

It does not validate:

- duplicate JSON object member names (parser-level),
- `id` uniqueness across a bundle's `items[]` (requires a separate check),
- forward-compat processing behavior (a runtime processing requirement).

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://ujg.example/schemas/ujg-wire-1.schema.json",
  "title": "UJG Wire Rules (Shared Serialization Constraints)",
  "type": ["object", "array", "string", "number", "boolean", "null"],
  "oneOf": [{ "$ref": "#/$defs/UJGObject" }, { "$ref": "#/$defs/UJGDocument" }],
  "$defs": {
    "NonEmptyString": {
      "type": "string",
      "minLength": 1
    },
    "TimestampRFC3339WithTZ": {
      "type": "string",
      "format": "date-time",
      "pattern": ".*(Z|[+-][0-9]{2}:[0-9]{2})$"
    },
    "ReservedKeys": {
      "enum": [
        "type",
        "id",
        "version",
        "name",
        "description",
        "createdAt",
        "updatedAt",
        "extensions",
        "@context"
      ]
    },
    "Extensions": {
      "type": "object",
      "propertyNames": {
        "not": { "$ref": "#/$defs/ReservedKeys" }
      },
      "additionalProperties": true
    },
    "JourneyRef": {
      "type": "object",
      "required": ["id", "version"],
      "properties": {
        "id": { "$ref": "#/$defs/NonEmptyString" },
        "version": { "$ref": "#/$defs/NonEmptyString" }
      },
      "additionalProperties": true
    },
    "UJGObject": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "$ref": "#/$defs/NonEmptyString" },
        "id": { "$ref": "#/$defs/NonEmptyString" },
        "version": { "$ref": "#/$defs/NonEmptyString" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "createdAt": { "$ref": "#/$defs/TimestampRFC3339WithTZ" },
        "updatedAt": { "$ref": "#/$defs/TimestampRFC3339WithTZ" },
        "extensions": { "$ref": "#/$defs/Extensions" },
        "@context": {
          "anyOf": [{ "type": "string" }, { "type": "object" }, { "type": "array" }]
        },
        "journeyRef": { "$ref": "#/$defs/JourneyRef" }
      },
      "additionalProperties": true
    },
    "UJGDocument": {
      "type": "object",
      "required": ["type", "items"],
      "properties": {
        "type": { "const": "UJGDocument" },
        "id": { "$ref": "#/$defs/NonEmptyString" },
        "version": { "$ref": "#/$defs/NonEmptyString" },
        "items": {
          "type": "array",
          "items": { "$ref": "#/$defs/UJGObject" }
        },
        "extensions": { "$ref": "#/$defs/Extensions" },
        "@context": {
          "anyOf": [{ "type": "string" }, { "type": "object" }, { "type": "array" }]
        }
      },
      "additionalProperties": true
    }
  }
}
```
