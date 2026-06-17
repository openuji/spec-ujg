## Overview

This optional module defines a bridge vocabulary for evidence about UJG nodes.

Evidence records describe how a UJG node was observed, inferred, redacted, or combined with other
evidence. The evidence node points to the observed subject from the outside. It does not add
provenance properties directly to Runtime, Mapping, Graph, or module-specific nodes.

This keeps Runtime focused on causal event chains and Mapping focused on interpreting those chains
against Graph intent, while still allowing partial, merged, inferred, or privacy-preserving evidence
to be exchanged interoperably.

## Normative Artifacts

This module is published through the following artifacts:

- `evidence.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/evidence`
- `evidence.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/evidence.context.jsonld`
- `evidence.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/evidence.shape`

Examples in this page compose the Core, Actor, and Evidence contexts.

## Terminology

- <dfn>EvidenceRecord</dfn>: An addressable record that describes evidence for one UJG node.
- <dfn>EvidenceSet</dfn>: A grouping of evidence records, such as a merged trace evidence set.
- <dfn>EvidenceState</dfn>: A value-object node describing evidence completeness or confidence.
- <dfn>ObservationScope</dfn>: A value-object node describing where the evidence was observed.
- <dfn>RedactionState</dfn>: A value-object node describing whether the evidence is full, redacted,
  or withheld.

## Evidence Model

An `EvidenceRecord` uses:

- `evidence:evidenceSubjectRef` to identify the UJG node that the evidence describes.
- `evidence:observedByActorRef` to identify the observing actor, when known.
- `evidence:evidenceStateRef` to identify a value-object evidence state.
- `evidence:observationScopeRef` to identify a value-object observation scope.
- `evidence:redactionStateRef` to identify a value-object redaction state.
- `evidence:sourceEvidenceRefs` to identify evidence records that were combined or derived.

An `EvidenceSet` uses `evidence:evidenceRecordRefs` to group evidence records.

This module intentionally uses value-object nodes for state-like values instead of controlled string
values. Profiles can publish known value-object IRIs, and deployments can add their own values
without changing the module shape.

## Non-Goals

Evidence does not define:

- event order
- runtime causality
- mapping conformance
- timestamp semantics
- cryptographic signing
- audit-log retention
- payload redaction algorithms
- observer trust scoring

## Ontology {data-cop-concept="ontology"}

The normative Evidence ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/evidence`.

:::include ./evidence.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Evidence JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/evidence.context.jsonld`.

:::include ./evidence.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative Evidence SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/evidence.shape`.

:::include ./evidence.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **External evidence:** Evidence records describe other UJG nodes from the outside. They MUST NOT
   be interpreted as adding properties to the subject node.
2. **Runtime preservation:** Evidence MUST NOT change Runtime event ordering, root-event semantics,
   or journey scope resolution.
3. **Mapping preservation:** Evidence MUST NOT change Mapping state resolution, explained movement,
   or jump derivation.
4. **Value-object values:** Evidence state, observation scope, and redaction state are value-object
   nodes. Consumers MUST NOT assume this module defines a closed vocabulary of those values.
5. **Graceful degradation:** Consumers that do not implement this module MAY ignore Evidence
   semantics, but SHOULD preserve recognized JSON-LD data during read-transform-write when possible.

## Minimal Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/runtime.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/evidence.context.jsonld"
  ],
  "@id": "https://example.com/ujg/evidence/runtime-event.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:actor:local-server",
      "@type": "Actor"
    },
    {
      "@id": "urn:evidence-state:partial",
      "@type": "EvidenceState"
    },
    {
      "@id": "urn:observation-scope:local-server",
      "@type": "ObservationScope"
    },
    {
      "@id": "urn:redaction:redacted",
      "@type": "RedactionState"
    },
    {
      "@id": "urn:execution:follow-1",
      "@type": "JourneyExecution"
    },
    {
      "@id": "urn:evidence:execution-follow-1",
      "@type": "EvidenceRecord",
      "evidenceSubjectRef": "urn:execution:follow-1",
      "observedByActorRef": "urn:actor:local-server",
      "evidenceStateRef": "urn:evidence-state:partial",
      "observationScopeRef": "urn:observation-scope:local-server",
      "redactionStateRef": "urn:redaction:redacted"
    }
  ]
}
```
