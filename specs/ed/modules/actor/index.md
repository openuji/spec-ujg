## Overview

This optional module defines a minimal graph-native vocabulary for attaching actor responsibility
and eligibility metadata to foundational Graph nodes.

Without an actor primitive, implementations tend to hide responsibility, approval eligibility, or
participant metadata in opaque payloads and extensions. That makes governance and human-in-the-loop
questions difficult to validate, query, or preserve across tools.

This first version is intentionally small. It declares `Actor` nodes and two references for Graph
metadata. It does not define identity systems, accounts, enforcement, provenance, or runtime
attribution.

## Normative Artifacts

This module is published through the following artifacts:

- `actor.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/actor`
- `actor.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld`
- `actor.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/actor.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`
with the Actor context.

## Terminology

- <dfn>Actor</dfn>: An addressable participant, role-like entity, system, organization, or other
  responsible party represented as a Core `Node`.
- <dfn>Responsible actor</dfn>: The actor responsible for ownership or stewardship of a Graph node.
- <dfn>Eligible actor</dfn>: An actor described as eligible to perform, approve, or trigger a
  transition-like Graph edge.

## Attachment Model

The module introduces two interoperable attachments:

- `actor:responsibleActorRef` links an allowed Graph node to one [=Actor=].
- `actor:eligibleActorRefs` links an allowed transition-like Graph edge to one or more [=Actor|Actors=].

The allowed host nodes are intentionally limited.

`responsibleActorRef` is allowed on:

- [=Journey=]
- [=State=]
- [=CompositeState=]
- [=Transition=]
- [=OutgoingTransition=]
- [=OutgoingTransitionGroup=]

`eligibleActorRefs` is allowed on:

- [=Transition=]
- [=OutgoingTransition=]

A Graph node without Actor references remains fully valid and traversable. Consumers MAY ignore this
module and still process the graph.

## Non-Goals

Actor does not define:

- authentication
- authorization enforcement
- IAM groups
- user accounts
- PII fields
- org charts
- legal accountability
- runtime access-control APIs
- delegation workflows
- cryptographic signing
- traversal semantics
- transition eligibility evaluation

Actor v0 also does not attach actors to runtime nodes, journey stacks, experience annotations,
opaque extension payloads, or nodes defined by other optional modules.

## Runtime Attribution Research Notice

Runtime actor attribution is intentionally not standardized in Actor v0.

Open questions include whether observed performer, uploader, subject, or evidence identity belongs
on runtime events, journey stack frames, payload evidence, a provenance or audit module, or a future
runtime-observation module. Until that is standardized, runtime actor attribution should remain
implementation-specific or be carried in extensions.

## Ontology {data-cop-concept="ontology"}

The normative Actor ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/actor`.

:::include ./actor.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Actor JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld`.

:::include ./actor.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative Actor SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/actor.shape`.

:::include ./actor.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Graph metadata only:** Actor references describe Graph responsibility and eligibility metadata.
   They MUST NOT create hidden graph edges or change traversal behavior.
2. **Responsibility meaning:** `responsibleActorRef` identifies ownership or stewardship, not legal
   accountability.
3. **Eligibility meaning:** `eligibleActorRefs` describes intended actor eligibility, not
   authorization enforcement.
4. **Graceful degradation:** Consumers that do not implement this module MAY ignore Actor semantics,
   but SHOULD preserve recognized JSON-LD data during read-transform-write when possible.
5. **Host boundary:** Actor v0 MUST NOT be interpreted as defining actor attachments for nodes
   outside the allowed Graph host classes.

## Minimal Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld"
  ],
  "@id": "https://example.com/ujg/actor/physical-ai-decision.jsonld",
  "@type": "UJGDocument",
  "specVersion": "1.0",
  "nodes": [
    {
      "@id": "urn:ujg:actor:physical-ai-system",
      "@type": "Actor",
      "label": "Physical AI System"
    },
    {
      "@id": "urn:ujg:actor:production-engineer",
      "@type": "Actor",
      "label": "Production Engineer"
    },
    {
      "@id": "urn:ujg:actor:supervisor",
      "@type": "Actor",
      "label": "Supervisor"
    },
    {
      "@id": "urn:ujg:journey:physical-ai-review",
      "@type": "Journey",
      "startState": "urn:ujg:state:engineer-approval-required",
      "stateRefs": [
        "urn:ujg:state:engineer-approval-required",
        "urn:ujg:state:decision-approved"
      ],
      "transitionRefs": ["urn:ujg:transition:approve-ai-decision"],
      "responsibleActorRef": "urn:ujg:actor:production-engineer"
    },
    {
      "@id": "urn:ujg:state:engineer-approval-required",
      "@type": "State",
      "label": "Engineer approval required",
      "responsibleActorRef": "urn:ujg:actor:production-engineer"
    },
    {
      "@id": "urn:ujg:state:decision-approved",
      "@type": "State",
      "label": "Decision approved"
    },
    {
      "@id": "urn:ujg:transition:approve-ai-decision",
      "@type": "Transition",
      "from": "urn:ujg:state:engineer-approval-required",
      "to": "urn:ujg:state:decision-approved",
      "eligibleActorRefs": [
        "urn:ujg:actor:production-engineer",
        "urn:ujg:actor:supervisor"
      ]
    }
  ]
}
```
