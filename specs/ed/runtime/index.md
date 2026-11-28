## Overview

This module defines the data model for recording actual user behavior as a **causally ordered event chain** within a bounded execution. Ordering is established by explicit linkage between events, not by timestamps. Runtime events reference the concrete `SurfaceInstance` where the runtime moment was observed.

Runtime records observed execution facts. A Client does not need to receive or understand the whole UJG graph document in order to emit runtime events. Each event records the observed surface instance, and Mapping can later resolve that instance through `SurfaceInstance.surface` and `Surface.graphNode`.

## Terminology

- <dfn>JourneyExecution</dfn>: A bounded execution identifier for one logical trace.
- <dfn>RuntimeEvent</dfn>: An atomic record of a single observed runtime moment.
- <dfn>Event Chain</dfn>: A sequence where each event references its immediate predecessor via `previousEvent`.
- <dfn>Root Event</dfn>: The event in a [=JourneyExecution=] whose `previousEvent` is omitted.

---

## Runtime Model {data-cop-concept="runtime-model"}

The Runtime model is a chain of [=RuntimeEvent|RuntimeEvents=] within one [=JourneyExecution=].
Each event points at the concrete [=SurfaceInstance=] where the observed runtime moment occurred.

```mermaid
graph TB
  subgraph JourneyExecution["Execution"]
    direction LR
    E1[RuntimeEvent A<br/>id e1]
    E2[RuntimeEvent B<br/>e2 after e1]
    E3[RuntimeEvent C<br/>e3 after e2]
  E2 -->|previousEvent| E1
  E3 -->|previousEvent| E2
  end
  E1 -->|surfaceInstance| SI1[SurfaceInstance<br/>cart]
  E2 -->|surfaceInstance| SI2[SurfaceInstance<br/>payment]
  E3 -->|surfaceInstance| SI3[SurfaceInstance<br/>confirmation]
  SI1 -->|surface| S1[Surface<br/>cart]
  SI2 -->|surface| S2[Surface<br/>payment]
  SI3 -->|surface| S3[Surface<br/>confirmation]
```

A [=JourneyExecution=] identifies one logical trace. It is not required to enumerate its [=RuntimeEvent|RuntimeEvents=]. Runtime events are associated with an execution by `execution`, which supports append-only event streams.

A [=RuntimeEvent=] records one runtime moment and may reference its immediate predecessor via `previousEvent`; if `previousEvent` is omitted, the event is the [=Root Event=].

A [=RuntimeEvent=] references exactly one [=SurfaceInstance=] using `surfaceInstance`. The referenced [=SurfaceInstance=] supplies the concrete visible occurrence where the event was observed.

The core runtime address is `RuntimeEvent.surfaceInstance`. Consumers that need Graph meaning resolve the surface instance through `SurfaceInstance.surface` and then through `Surface.graphNode`.

## JourneyExecution {data-cop-concept="journey-execution"}

A [=JourneyExecution=] identifies one bounded logical trace. It is referenced by events, but it does
not enumerate or own those events.

```mermaid
classDiagram
  class JourneyExecution {
    id
  }
```

Example node:

```ujg-example
./examples/example-03.yamlld
```

## RuntimeEvent {data-cop-concept="runtime-event"}

<spec-statement>

1. A [=RuntimeEvent=] MUST reference exactly one [=JourneyExecution=] using `execution`.
2. A [=RuntimeEvent=] MUST reference exactly one [=SurfaceInstance=] using `surfaceInstance`.
3. `surfaceInstance` MUST resolve to a `SurfaceInstance` in the current document set or imported documents.
4. The referenced surface instance MUST be sufficient to identify the observed runtime occurrence.
5. A [=RuntimeEvent=] MAY reference its immediate predecessor using `previousEvent`.
6. If `previousEvent` is omitted, the event is a [=Root Event=] in the execution chain.
7. Runtime event order MUST be reconstructed using `previousEvent` links, not timestamps.
8. The `payload` property, when present, is opaque runtime data and MUST NOT be required for resolving `surfaceInstance`.

</spec-statement>

```mermaid
classDiagram
  class JourneyExecution
  class SurfaceInstance
  class RuntimeEvent {
    id
    execution
    previousEvent
    surfaceInstance
    payload
  }
  RuntimeEvent --> JourneyExecution : execution
  RuntimeEvent --> RuntimeEvent : previousEvent
  RuntimeEvent --> SurfaceInstance : surfaceInstance
```

Example node:

```ujg-example
./examples/example-02.yamlld
```

## Normative Artifacts

This module is published through the following artifacts:

- `runtime.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/runtime`
- `runtime.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/runtime.context.jsonld`
- `runtime.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/runtime.shape`

Examples in this page use an explicit context array composed from the published module contexts. The same composition is also published as the convenience context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`.

### Ontology {data-cop-concept="ontology"}

The normative Runtime ontology is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/runtime`. It is the authoritative structural definition for `JourneyExecution`, `RuntimeEvent`, and the properties that connect them.

:::include ./runtime.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Runtime JSON-LD context is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/runtime.context.jsonld`. It provides the compact JSON-LD term mappings for Runtime examples, including IRI-valued references and opaque JSON `payload` values.

:::include ./runtime.context.jsonld :::

---

### Validation {data-cop-concept="validation"}

The normative Runtime SHACL shape is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/runtime.shape`. It is the authoritative validation artifact for Runtime structural constraints.

:::include ./runtime.shape.ttl :::

The rules below define additional causal constraints on event chains beyond the structural constraints captured by the SHACL shape.

<spec-statement>
Within a single execution (events where `execution` equals the [=JourneyExecution=] `@id`):
  1. **Root**: Exactly one event MUST be the [=Root Event=].
  2. **Resolution**: Every present `previousEvent` MUST match the `@id` of an event in the same execution.
  3. **Single Successor**: An event `@id` MUST NOT be referenced as `previousEvent` by more than one event in the same execution.
  4. **Acyclic**: The chain MUST NOT contain cycles.
</spec-statement>
If any rule above is violated, the [=JourneyExecution=] is invalid.

---

## Reconstruction {data-cop-concept="reconstruction"}

<spec-statement>

A Consumer reconstructing event order **MUST**:

1. Identify the [=Root Event=].
2. Repeatedly select the unique event whose `previousEvent` equals the current event's `@id`.
3. Continue until no successor exists.

</spec-statement>

A Consumer interpreting a runtime event's Graph meaning MUST resolve the event's `surfaceInstance` to a [=SurfaceInstance=], follow that instance's `surface` to a [=Surface=], and use that surface's `graphNode` as the observed Graph node.

---

## Examples

### Combined JSON Example

```ujg-example
./examples/example-01.yamlld
```
