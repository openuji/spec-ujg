## Overview

This optional module defines append-friendly metadata records for Runtime executions.

Runtime remains the UJG observation channel. A `RuntimeEvidenceRecord` is not a second event stream:
it is an addressable metadata node that points back to a `JourneyExecution` and, when needed, one
`RuntimeEvent`. Producers can ingest and store these records alongside runtime data without
mutating the `JourneyExecution` into a container of records.

The module is intentionally narrow. It does not define generic evidence about arbitrary UJG nodes,
provenance graphs, redaction vocabularies, confidence scoring, signing, trust policy, or audit-log
retention.

## Normative Artifacts

This module is published through the following artifacts:

- `runtime-evidence.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/runtime-evidence`
- `runtime-evidence.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/runtime-evidence.context.jsonld`
- `runtime-evidence.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/runtime-evidence.shape`

Examples in this page compose the Core, Graph, Runtime, Actor, and Runtime Evidence contexts.

## Terminology

- <dfn>RuntimeEvidenceRecord</dfn>: An addressable metadata record for a `JourneyExecution`, and
  optionally for one `RuntimeEvent` in that execution.
- <dfn>Execution-level runtime evidence</dfn>: A record whose `journeyExecutionRef` points to an
  execution and whose `runtimeEventRef` is omitted.
- <dfn>Event-level runtime evidence</dfn>: A record whose `journeyExecutionRef` points to an
  execution and whose `runtimeEventRef` points to one event in that same execution.

## Runtime Evidence Model

A `RuntimeEvidenceRecord` uses:

- `runtimeEvidence:journeyExecutionRef` to identify the owning `JourneyExecution`.
- `runtimeEvidence:runtimeEventRef` to identify one `RuntimeEvent` in that execution, when the
  metadata is event-specific.
- `runtimeEvidence:observedByActorRef` to identify the observing actor, when known.
- `runtimeEvidence:evidencePayload` for opaque JSON metadata that is useful to the producer or
  deployment.

This module intentionally does not reuse `runtime:executionId` on `RuntimeEvidenceRecord`.
`executionId` remains the Runtime property that associates `RuntimeEvent` nodes with an append-only
event chain. Runtime Evidence uses `journeyExecutionRef` so evidence metadata can be indexed by
execution without changing Runtime core.

If `runtimeEventRef` is present, the referenced event MUST belong to the same `JourneyExecution` as
`journeyExecutionRef`. If `runtimeEventRef` is omitted, the record describes the execution as a
whole.

## Non-Goals

Runtime Evidence does not define:

- runtime event order
- root-event semantics
- mapping conformance
- metrics semantics
- redaction or confidence vocabularies
- cryptographic signing
- trust scoring
- audit-log retention
- payload redaction algorithms

## Ontology {data-cop-concept="ontology"}

The normative Runtime Evidence ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/runtime-evidence`.

:::include ./runtime-evidence.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Runtime Evidence JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/runtime-evidence.context.jsonld`.

:::include ./runtime-evidence.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative Runtime Evidence SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/runtime-evidence.shape`.

:::include ./runtime-evidence.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Runtime scoped:** A `RuntimeEvidenceRecord` MUST describe a `JourneyExecution` and MAY describe
   one `RuntimeEvent` in that execution.
2. **Not runtime order:** A `RuntimeEvidenceRecord` MUST NOT be interpreted as a `RuntimeEvent`, a
   `previousId` link, or a member of the causal Runtime event chain.
3. **Runtime preservation:** Runtime Evidence MUST NOT change Runtime event ordering, root-event
   semantics, journey scope resolution, Mapping behavior, or Metrics behavior.
4. **Append-friendly processing:** Producers SHOULD process Runtime Evidence beside runtime
   ingestion and storage, indexed by `journeyExecutionRef`, rather than mutating `JourneyExecution`
   into a list container.
5. **Opaque payload:** `evidencePayload` is deployment-owned JSON metadata. Consumers MUST NOT
   require it for Runtime ordering, state resolution, Mapping, or Metrics behavior.
6. **Graceful degradation:** Consumers that do not implement this module MAY ignore Runtime Evidence
   semantics, but SHOULD preserve recognized JSON-LD data during read-transform-write when possible.

## Minimal Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/runtime.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/runtime-evidence.context.jsonld"
  ],
  "@id": "https://example.com/ujg/runtime-evidence/execution-12345.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:actor:server-observer",
      "@type": "Actor"
    },
    {
      "@id": "urn:journey:checkout",
      "@type": "Journey",
      "label": "Checkout",
      "defaultEntryRef": "urn:entry:checkout-default",
      "entryRefs": [
        "urn:entry:checkout-default"
      ],
      "stateRefs": [
        "urn:state:shipping-form"
      ]
    },
    {
      "@type": "JourneyEntry",
      "@id": "urn:entry:checkout-default",
      "ujggraph:stateRef": "urn:state:shipping-form"
    },
    {
      "@id": "urn:state:shipping-form",
      "@type": "State",
      "label": "Shipping form"
    },
    {
      "@id": "urn:execution:12345",
      "@type": "JourneyExecution"
    },
    {
      "@id": "urn:journey-instance:checkout:12345",
      "@type": "JourneyInstance",
      "journeyRef": "urn:journey:checkout"
    },
    {
      "@id": "urn:event:12345:100",
      "@type": "RuntimeEvent",
      "executionId": "urn:execution:12345",
      "stateRef": "urn:state:shipping-form",
      "journeyInstanceRef": "urn:journey-instance:checkout:12345",
      "payload": {
        "action": "surface.enter"
      }
    },
    {
      "@id": "urn:runtime-evidence:execution-accepted",
      "@type": "RuntimeEvidenceRecord",
      "journeyExecutionRef": "urn:execution:12345",
      "observedByActorRef": "urn:actor:server-observer",
      "evidencePayload": {
        "source": "server-ingest",
        "status": "accepted"
      }
    },
    {
      "@id": "urn:runtime-evidence:event-100-observed",
      "@type": "RuntimeEvidenceRecord",
      "journeyExecutionRef": "urn:execution:12345",
      "runtimeEventRef": "urn:event:12345:100",
      "observedByActorRef": "urn:actor:server-observer",
      "evidencePayload": {
        "source": "server-ingest",
        "record": "event-observed"
      }
    }
  ]
}
```
