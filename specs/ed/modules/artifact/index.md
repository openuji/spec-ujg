## Overview

This optional module defines a minimal bridge vocabulary for addressable artifacts that are produced
or consumed by UJG nodes.

An artifact is a portable identity for a file, media object, archive, token, invite, report,
protocol object, generated document, or other resource that participates in a journey. The module
does not define storage backends, transfer protocols, upload widgets, media processing, or artifact
lifecycle state. Modules and profiles can specialize `Artifact` when they need more domain-specific
semantics.

## Normative Artifacts

This module is published through the following artifacts:

- `artifact.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/artifact`
- `artifact.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/artifact.context.jsonld`
- `artifact.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/artifact.shape`

Examples in this page compose the Core context with the Artifact context.

## Terminology

- <dfn>Artifact</dfn>: An addressable resource that may be produced, consumed, exchanged, or
  referenced during a journey.
- <dfn>Produced artifact</dfn>: An artifact created, emitted, prepared, exported, generated, or made
  available by a UJG node.
- <dfn>Consumed artifact</dfn>: An artifact accepted, imported, read, redeemed, or otherwise used by
  a UJG node.

## Attachment Model

The module introduces two interoperable references:

- `artifact:producedArtifactRefs` links a Core `Node` to one or more produced [=Artifact|Artifacts=].
- `artifact:consumedArtifactRefs` links a Core `Node` to one or more consumed [=Artifact|Artifacts=].

The references are intentionally generic. Producers SHOULD attach them to the node that owns the
artifact-producing or artifact-consuming semantics, such as an Action, a domain operation, or an
evidence node. Producers SHOULD NOT use artifact references to create hidden Graph traversal or to
replace Graph `Transition` semantics.

## Non-Goals

Artifact does not define:

- upload, download, or preview presentation
- media-kind taxonomies
- storage, CDN, filesystem, or database details
- protocol delivery semantics
- artifact lifecycle, freshness, or cache policy
- validation of artifact payload contents

The archived artifact implementation extension remains useful for generator-specific upload and
preview hints, but those hints are not part of this module.

## Ontology {data-cop-concept="ontology"}

The normative Artifact ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/artifact`.

:::include ./artifact.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Artifact JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/artifact.context.jsonld`.

:::include ./artifact.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative Artifact SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/artifact.shape`.

:::include ./artifact.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Identity only:** `Artifact` identifies a resource; it does not define transfer, storage,
   rendering, security, or lifecycle semantics.
2. **Graph preservation:** Artifact references MUST NOT create hidden graph edges or change Graph
   traversal behavior.
3. **Host responsibility:** Producers SHOULD attach artifact references to the node that owns the
   artifact-producing or artifact-consuming meaning.
4. **Graceful degradation:** Consumers that do not implement this module MAY ignore Artifact
   semantics, but SHOULD preserve recognized JSON-LD data during read-transform-write when possible.

## Minimal Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/action.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/artifact.context.jsonld"
  ],
  "@id": "https://example.com/ujg/artifact/export.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:action:prepare-export",
      "@type": "Action",
      "producedArtifactRefs": ["urn:artifact:account-archive"]
    },
    {
      "@id": "urn:artifact:account-archive",
      "@type": "Artifact"
    }
  ]
}
```
