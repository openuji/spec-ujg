## Status of This Document {.unnumbered}

This document is the **Runtime** module of the User Journey Graph (UJG) specification. It defines the data model for describing _actual_ user behavior—traces, sessions, and events—and how those behaviors reference the **Designed** journey model.

## Abstract {.unnumbered}

The UJG Runtime module defines a standard vocabulary for **Journey Executions**: the sequence of events that actually occurred during a user session.

Because distributed systems and client-side clocks are often unreliable, this module introduces **Event Chaining**: a structural mechanism where events explicitly reference their predecessors. This allows consumers to reconstruct the exact causal order of a journey without relying solely on timestamps, enabling high-fidelity path analysis and optional integrity verification.

## Scope

This module covers:

- The structure of **Runtime Events** and **Journey Executions**.
- The **Event Chaining** mechanism for causal ordering.
- **Alignment**: How runtime data references [=Designed=] objects ([=State=], [=Journey=]).
- Conformance classes for different levels of tracking fidelity.

This module does **not** cover:

- Transport protocols (HTTP, WebSocket, etc.).
- Specific algorithms for identifier generation (UUID vs. Hash).
- Aggregated metrics or conversion calculations (see **Observed** module).

## Terminology

- <dfn>JourneyExecution</dfn>: A bounded sequence of events representing a single logical session or user trace.
- <dfn>RuntimeEvent</dfn>: An atomic record of a user moment (e.g., entering a state) or action.
- <dfn>Event Chaining</dfn>: The practice of including the predecessor's identifier in the current event to establish an unbroken causal link.
- <dfn>Alignment</dfn>: The degree to which a [=RuntimeEvent=] explicitly maps to a [=Designed=] [=State=].

## Data Model (Normative)

All objects defined here are [=UJG Object=]s and **MUST** conform to the **Serialization** module rules (JSON format, reserved keys, timestamps).

### 1. RuntimeEvent (The Atom)

A `RuntimeEvent` represents a single discrete moment in a journey.

It supports two methods of ordering:

1. **Temporal:** Using `timestamp`.
2. **Causal:** Using `previousId` (Event Chaining).

**`RuntimeEvent` Object:**

- `type`: The string `"RuntimeEvent"`.
- `id`: A non-empty string acting as the unique handle for this specific event instance.
- `previousId`: (Optional) The `id` string of the immediate predecessor event in this execution.
- If present, this value **MUST** match the `id` of exactly one other event in the execution.
- If missing or empty (`""`), the event is treated as a **Root** (start of execution).

- `timestamp`: An RFC 3339 timestamp string.
- `payload`: A JSON object containing domain-specific data (e.g., URL, button ID, metadata).
- `stateRef`: (Optional) The `id` string of the Designed [=State=] this event represents.
- `journeyRef`: (Optional) A [=Journey Reference=] object (`{id, version}`) identifying the context.

#### Example: A Chained Event

```json
{
  "type": "RuntimeEvent",
  "id": "evt-a1b2c3d4",
  "previousId": "evt-9z8y7x6w",
  "timestamp": "2026-01-22T09:05:01Z",
  "stateRef": "urn:ujg:example:state:shipping",
  "payload": {
    "variant": "A",
    "browser": "mobile-safari"
  }
}
```

### 2. JourneyExecution (The Container)

A `JourneyExecution` represents a collected trace of events (a session). It serves as the envelope for processing, storage, and exchange.

**`JourneyExecution` Object:**

- `type`: The string `"JourneyExecution"`.
- `id`: A unique identifier for the execution context (e.g., Session ID).
- `events`: An array of `RuntimeEvent` objects.
- **Ordering:** The array **MAY** be unordered if `previousId` linkage is used. If `previousId` is absent, the array **MUST** be time-ordered.

- `journeyRef`: (Optional) A [=Journey Reference=] object indicating the primary [=Designed Journey=] this execution attempted to follow.
- `attributes`: (Optional) A JSON object for session-level metadata (e.g., user agent, region).

```json
{
  "type": "JourneyExecution",
  "id": "urn:session:12345",
  "journeyRef": {
    "id": "https://ujg.example/journeys/checkout",
    "version": "2026.01"
  },
  "events": [
    { "type": "RuntimeEvent", "id": "1", "previousId": "", ... },
    { "type": "RuntimeEvent", "id": "2", "previousId": "1", ... }
  ]
}

```

## Event Chaining & Reconstruction (Normative)

Distributed systems often suffer from clock skew, duplicate delivery, or out-of-order arrival. To guarantee the integrity of a user's path, this specification defines **Event Chaining**.

### 1. The Chain Rule

Producers **SHOULD** populate `previousId` for every event after the first one in a session.

- **Root Event:** `previousId` is null, undefined, or empty string.
- **Subsequent Event:** `previousId` == the `id` of the event immediately preceding it.

### 2. Reconstruction Logic

Consumers processing a `JourneyExecution` **MUST** prioritize explicit linkage over timestamps when reconstructing the path:

1. Identify the **Root Event** (where `previousId` is empty).
2. Find the event where `previousId` matches the Root's `id`.
3. Repeat until no subsequent event is found.

### 3. Integrity & Cryptography (Informative)

While this specification treats `id` as an opaque string, implementers **MAY** use cryptographic methods to generate `id`.

- _Example:_ `id = Hash(payload + previousId + secret_seed)`.
- This creates a **Tamper-Evident Chain**: simpler consumers can just follow the strings, while advanced consumers can verify the hashes to prove the trace hasn't been altered or fabricated.

## Alignment to Design (Normative)

Runtime data becomes most valuable when mapped to the [=Designed=] model.

### 1. State Reference (`stateRef`)

An event **MAY** include a `stateRef`.

- **Value:** Must match a [=State=] `id` or [=CompositeState=] `id` defined in the associated [=Designed Journey=].
- **Validation:** Consumers **MAY** validate that the transition from `Event A (stateRef: X)` to `Event B (stateRef: Y)` corresponds to a valid [=Transition=] in the Design.

### 2. Divergence (Violations)

If a runtime execution moves between two states that are _not_ connected by a [=Transition=] in the Design, this is a **Divergence**.

- Consumers **MUST NOT** discard divergent events. They represent real user behavior.
- Consumers **SHOULD** flag these sequences as "Violations" or "Unexpected Paths" for analysis.

## Conformance Classes

### Level 1: Raw Trace

- Events contain `payload` and `timestamp`.
- No `stateRef` (mapping is done heuristically by the consumer).
- No `previousId` (ordering relies entirely on timestamps).

### Level 2: Aligned Trace

- Events contain `stateRef` matching a [=Designed Journey=].
- Allows direct comparison of "Design vs. Reality".

### Level 3: Verified Chain

- Events contain `stateRef` AND `previousId`.
- The execution forms a complete linked list.
- Guarantees exact playback of the user's sequence, independent of clock accuracy.

## Appendix: JSON Schema (Informative)

```json
{
  "$id": "https://ujg.example/schemas/runtime-event.schema.json",
  "type": "object",
  "description": "A single observed event in a user journey execution.",
  "required": ["type", "id", "timestamp"],
  "properties": {
    "type": { "const": "RuntimeEvent" },
    "id": {
      "type": "string",
      "description": "Unique identifier for this event. May be a UUID, hash, or counter."
    },
    "previousId": {
      "type": "string",
      "description": "The ID of the immediate predecessor. Empty for root events."
    },
    "timestamp": { "type": "string", "format": "date-time" },
    "stateRef": {
      "type": "string",
      "description": "The ID of the Designed State this event corresponds to."
    },
    "journeyRef": {
      "type": "object",
      "required": ["id", "version"],
      "properties": {
        "id": { "type": "string" },
        "version": { "type": "string" }
      }
    },
    "payload": {
      "type": "object",
      "description": "Domain-specific event data (URL, clicks, etc)."
    }
  }
}
```
