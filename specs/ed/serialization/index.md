## Abstract

This module defines the JSON and optional JSON-LD conventions for User Journey Graph (UJG) data: identifiers, timestamps, reference shapes, extensibility containers, and forward compatibility rules.

It is intentionally minimal: object models live in their modules (Core, Runtime, Observed, etc.). This module defines the wire format rules shared across all modules.

## Serialization format (normative)

### JSON

- UJG data MUST be serialized as JSON values as defined by RFC 8259.
- Text MUST be encoded as UTF-8.
- Objects MUST use string keys.
- Arrays MUST preserve element order.

### Bundling

A UJG document MAY contain a single top-level object, or a bundle:

```json
{
  "type": "UJGDocument",
  "items": [
    { "type": "Journey", "...": "..." },
    { "type": "TransitionSet", "...": "..." }
  ]
}
```

If bundling is used:

- items MUST be an array of UJG objects.

## Common fields and conventions (normative)

### type

- Every top-level UJG object MUST include a type property whose value is a string.
- Embedded objects MAY omit type only when the parent property defines an unambiguous object kind.
- If a module requires type on an embedded object, that module's rule applies.

### id

- Referencable objects MUST have an id string.
- id SHOULD be globally unique within the publisher's context.
- Recommended forms: URI/URL, URN, or namespaced strings.

### version

- Contract-defining objects MUST include version.
- Per Core: Journey MUST include version.

## Timestamps (normative)

Whenever timestamps are used (e.g., runtime modules):

- They MUST be RFC 3339 / ISO 8601 strings (e.g., 2025-12-29T10:12:00Z).
- They SHOULD include a timezone offset or Z.

## References (normative)

### journeyRef

When runtime/derived objects reference a Journey version, they MUST use:

```json
"journeyRef": { "id": "<journeyId>", "version": "<journeyVersion>" }
```

### Other references

Unless a module defines otherwise:

- references are by identifier string (e.g., Transition from/to reference State ids).

**Design/runtime note (informative):** In UJG, design-time transitions are structural. Runtime alignment is intended to use transitionRef (a transition id) rather than requiring event names inside the design-time model.

## Reserved keys (normative)

The following keys are reserved across UJG objects:

- type, id, version, name, description, createdAt, updatedAt, extensions, @context

- Producers MUST NOT change the meaning of reserved keys.
- Consumers MUST treat reserved-key misuse as an error.

## Extensibility container (normative mechanics)

Any UJG object MAY include an extensions object.

Rules:

- extensions MUST be a JSON object.
- Keys inside extensions SHOULD be namespaced to avoid collisions.

Consumers:

- MUST ignore unknown extensions keys by default.
- SHOULD preserve extensions when round-tripping, when practical.

## Forward compatibility (normative)

Consumers MUST be forward compatible by default:

- MUST ignore unknown keys that are not reserved.
- MUST fail validation if required fields are missing or invalid (per module rules).

## Optional JSON-LD mode (informative)

If a publisher wants JSON-LD:

- The document MAY include @context.
- Consumers that do not support JSON-LD MUST treat @context as ignorable when used correctly.

Minimal pattern:

```json
{
  "@context": "https://ujg.example/ns/context.jsonld",
  "type": "Journey",
  "id": "https://ujg.example/TR/2026.01/journeys/checkout",
  "version": "2026.01",
  "...": "..."
}
```
