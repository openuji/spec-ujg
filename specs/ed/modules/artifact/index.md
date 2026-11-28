## Overview

This optional module defines a minimal vocabulary for addressable artifacts that can participate as
resources in a journey.

An artifact is a portable identity for a file, media object, archive, token, invite, report,
protocol object, generated document, or other resource that participates in a journey. An
`Artifact` is a concrete [[UJG Effect]] `EffectResource`, so effects can reference artifacts through
generic `producedResources` and `consumedResources`. An artifact can also identify the source and target
touchpoints where that resource is produced and consumed, and it can reference a localized
human-facing name. The module does not define storage backends, transfer protocols, upload widgets,
media processing, or artifact lifecycle state. Modules and profiles can specialize `Artifact` when
they need more domain-specific semantics.

## Terminology

- <dfn>Artifact</dfn>: An addressable resource that may be produced, consumed, exchanged, or
  referenced during a journey.
- <dfn>Artifact name</dfn>: A localized [=MessageMeta=] referenced by an artifact as its
  human-facing name.
- <dfn>Produced artifact</dfn>: An artifact created, emitted, prepared, exported, generated, or made
  available by an [=Effect=].
- <dfn>Consumed artifact</dfn>: An artifact accepted, imported, read, redeemed, or otherwise used by
  an [=Effect=].
- <dfn>Artifact source touchpoint</dfn>: The touchpoint where an artifact is produced, exported, or made available.
- <dfn>Artifact target touchpoint</dfn>: A touchpoint where an artifact is consumed, imported, redeemed, or otherwise used.

## Artifact {data-cop-concept="artifact"}

An [=Artifact=] is an addressable portable resource identity and a concrete [=EffectResource=]. It
can be referenced by producing or consuming effects, and it can identify source and target
touchpoints when the resource crosses touchpoint boundaries. It does not define transfer, storage,
rendering, security, or lifecycle semantics.

<spec-statement>
1. An [=Artifact=] **MUST** be identified by an IRI.
2. An [=Artifact=] **MAY** declare at most one `name`.
3. Every `name` value **MUST** reference a [=MessageMeta=].
4. An [=Artifact=] **MAY** declare at most one `sourceTouchpoint`.
5. Every `sourceTouchpoint` value **MUST** reference a [=Touchpoint=].
6. An [=Artifact=] **MAY** declare one or more `targetTouchpoints`.
7. Every `targetTouchpoints` value **MUST** reference a [=Touchpoint=].
8. `name`, `sourceTouchpoint`, and `targetTouchpoints` **MUST NOT** create hidden Graph edges, change
   traversal behavior, assert delivery, or change Runtime event ordering.
</spec-statement>

```mermaid
classDiagram
  class Touchpoint
  class MessageMeta
  class EffectResource
  class Artifact {
    id
    name
    sourceTouchpoint
    targetTouchpoints
  }
  EffectResource <|-- Artifact
  Artifact --> MessageMeta : name
  Artifact --> Touchpoint : sourceTouchpoint
  Artifact --> "0..*" Touchpoint : targetTouchpoints
```

Example node:

```ujg-example
./examples/example-04.yamlld
```

## Localized Names

`ujgartifact:name` links an [=Artifact=] to one [=MessageMeta=] that provides the artifact's
human-facing name. Locale-specific [=Message=] nodes MAY use opaque values and `argumentNames`.

`name` is descriptive metadata on the artifact. It does not determine production, consumption,
transfer, storage, availability, rendering, or lifecycle state.

## Effect Integration

The Artifact module introduces artifact-owned references:

- `ujgartifact:name` links an [=Artifact=] to the localized [=MessageMeta=] used as its
  human-facing name.
- `ujgartifact:sourceTouchpoint` links an [=Artifact=] to the [=Touchpoint=] where it is produced,
  exported, or made available.
- `ujgartifact:targetTouchpoints` links an [=Artifact=] to one or more [=Touchpoint|Touchpoints=]
  where it is consumed, imported, redeemed, or otherwise used.

Production and consumption relationships are defined by [[UJG Effect]], not by this module. Effects
use `producedResources` and `consumedResources` to point to [=Artifact=] nodes. Producers SHOULD NOT use those
references to create hidden Graph traversal or to replace Graph `Transition` semantics.

Touchpoint metadata belongs to the [=Artifact=], not the producing or consuming [=Effect=]. Effects
declare only `producedResources` and `consumedResources`; the referenced artifact declares where it crosses
touchpoint boundaries.

## Non-Goals

Artifact does not define:

- upload, download, or preview presentation
- media-kind taxonomies
- storage, CDN, filesystem, or database details
- protocol delivery semantics
- artifact lifecycle, freshness, or cache policy
- validation of artifact payload contents
- cross-touchpoint effect semantics beyond artifact-owned touchpoint metadata

The archived artifact implementation extension remains useful for generator-specific upload and
preview hints, but those hints are not part of this module.

## Normative Artifacts

This module is published through the following artifacts:

- `artifact.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/artifact`
- `artifact.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/artifact.context.jsonld`
- `artifact.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/artifact.shape`

Examples in this page compose the Core context with the Artifact context. Examples that use effects
also compose the Effect context; examples that use touchpoint metadata also compose the Surface
context; examples that use `name` also compose the Localization context.

### Ontology {data-cop-concept="ontology"}

The normative Artifact ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/artifact`.

:::include ./artifact.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Artifact JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/artifact.context.jsonld`.

:::include ./artifact.context.jsonld :::

### Validation {data-cop-concept="validation"}

The normative Artifact SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/artifact.shape`.

:::include ./artifact.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Identity only:** `Artifact` identifies a resource; it does not define transfer, storage,
   rendering, security, or lifecycle semantics.
2. **Effect resource:** `Artifact` is a concrete [=EffectResource=] and MAY be referenced by Effect
   `producedResources` or `consumedResources`.
3. **Graph preservation:** Artifact references MUST NOT create hidden graph edges or change Graph
   traversal behavior.
4. **Localized artifact names:** `name` belongs on [=Artifact=] and references one
   [=MessageMeta=]. It is descriptive metadata and does not define rendering, transfer, storage, or
   lifecycle semantics.
5. **Artifact-owned touchpoint metadata:** `sourceTouchpoint` and `targetTouchpoints` belong on
   [=Artifact=], not on `Effect`; effects only produce or consume resources.
6. **Graceful degradation:** Consumers that do not implement this module MAY ignore Artifact
   semantics, but SHOULD preserve recognized JSON-LD data during read-transform-write when possible.

## Examples

### Minimal Example

```ujg-example
./examples/example-03.yamlld
```

### Localized Name Example

```ujg-example
./examples/example-02.yamlld
```

### Cross-Touchpoint Artifact Example

This example models a federated share as the resource crossing touchpoints. Effects only declare
whether they produce or consume that resource.

```ujg-example
./examples/example-01.yamlld
```
