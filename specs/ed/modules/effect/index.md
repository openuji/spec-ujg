## Overview

This optional module defines graph-native vocabulary for attaching declared effects to Graph
`Transition` and `OutgoingTransition` nodes.

Without an effect primitive, implementations tend to hide form submission, API invocation,
analytics events, generated data, or navigate-with-payload behavior in opaque extensions. That
makes a graph appear to advance while the effect that caused or accompanies the transition remains
non-portable.

This first version declares that an effective transition has an associated `Effect`. It also
defines generic produced and consumed resource references so an effect can point to concrete
resources from other modules, such as [[UJG Artifact]] `Artifact`, without the Effect module owning
those resource-specific semantics.

The module does not define transport protocols, API request formats, queues, form libraries,
analytics payloads, backend workers, framework event handlers, or resource lifecycle semantics.
Graph [=Command=] nodes can identify intentional invocation, but Effect attachment remains on the
transition edge whose progression has the associated side effect.

## Terminology

- <dfn>Effect</dfn>: An addressable declaration of a side effect associated with a Graph transition
  edge.
- <dfn>Effect attachment</dfn>: The relation that assigns a transition to an effect declaration.
- <dfn>EffectResource</dfn>: An abstract superclass for concrete resources that may be produced or
  consumed by an effect.
- <dfn>Produced resource</dfn>: An `EffectResource` created, emitted, prepared, exported, generated,
  or made available by an `Effect`.
- <dfn>Consumed resource</dfn>: An `EffectResource` accepted, imported, read, redeemed, or otherwise
  used by an `Effect`.

## Effect {data-cop-concept="effect"}

An [=Effect=] declares that a transition edge has an associated side effect. The effect is
addressable, but this module does not define how the side effect is invoked.

An effect can reference produced or consumed resources through `producedResources` and `consumedResources`.
Those references point to concrete subclasses of [=EffectResource=], not to arbitrary graph nodes.

```mermaid
classDiagram
  class Effect {
    id
    producedResources
    consumedResources
  }
  class EffectResource
  Effect --> "0..*" EffectResource : producedResources
  Effect --> "0..*" EffectResource : consumedResources
```

Example node:

```ujg-example
./examples/example-03.yamlld
```

## EffectResource {data-cop-concept="effect-resource"}

[=EffectResource=] is an abstract superclass for resources that can be produced or consumed by an
[=Effect=]. It gives the generic `producedResources` and `consumedResources` properties a shared range while
leaving concrete resource semantics to other modules.

Concrete modules specialize [=EffectResource=]. For example, [[UJG Artifact]] defines portable
resources.

```mermaid
classDiagram
  class EffectResource
  class Artifact
  EffectResource <|-- Artifact
```

`EffectResource` should not be used as the only concrete type of a resource node in interoperable
examples. Use a concrete subclass such as `Artifact`.

## Attachment Model

The module introduces one transition attachment and two resource references:

- `ujgeffect:effect` links a Graph `Transition` or `OutgoingTransition` to an `Effect`.
- `ujgeffect:producedResources` links an `Effect` to one or more produced [=EffectResource=] nodes.
- `ujgeffect:consumedResources` links an `Effect` to one or more consumed [=EffectResource=] nodes.

A transition without `effect` remains fully valid and traversable. Consumers MAY ignore this
module and still process the graph.

A [=Command=] **MUST NOT** declare `effect`. A command identifies what was intentionally invoked;
the transition identifies what progression occurred; the effect identifies the mutation associated
with that progression.

Crossing a border that two states share through an `AdjacentTransition` has no side effect, so it
carries no effect. A movement with an effect is a Graph `Transition` with `effect`.

Resource-specific metadata belongs to the referenced resource, not the effect. For example,
`sourceTouchpoint` and `targetTouchpoints` belong on an `Artifact`; an effect only declares
that it produces or consumes the artifact.

## Normative Artifacts

This module is published through the following artifacts:

- `effect.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/effect`
- `effect.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/effect.context.jsonld`
- `effect.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/effect.shape`

Examples in this page compose the shared baseline context
`https://ujg.specs.openuji.org/ed/ns/context.jsonld` with the Effect context. Examples that use
artifacts also compose the Artifact context; examples that reference touchpoints also compose the
Surface context.

### Ontology {data-cop-concept="ontology"}

The normative Effect ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/effect`.

:::include ./effect.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Effect JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/effect.context.jsonld`.

:::include ./effect.context.jsonld :::

### Validation {data-cop-concept="validation"}

The normative Effect SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/effect.shape`.

:::include ./effect.shape.ttl :::

Effect validation depends on the Effect SHACL shape and the ontology graph for each composed
resource module. The `producedResources` and `consumedResources` `sh:class` constraints are evaluated against
the referenced resource node's concrete class and the resource module's subclass declarations.
Processors MUST NOT require documents to serialize `EffectResource` as an additional `@type` merely
to satisfy these constraints.

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Declaration only:** Effect describes that a transition edge has an associated side effect; it
   does not define how that effect is invoked.
2. **Graph preservation:** `effect` MUST NOT create a hidden edge or change the local `from`/`to`
   semantics of a host `Transition`, or the destination semantics of a host `OutgoingTransition`,
   whether its entry is fixed by `toEntry` or selected through `entrySelector`.
3. **Resource boundary:** `producedResources` and `consumedResources` MUST point to concrete resources that
   are subclasses of [=EffectResource=]. They MUST NOT be used to create hidden Graph traversal.
4. **Command separation:** `effect` MUST NOT appear on `Command`.
5. **Resource-owned metadata:** Metadata about a produced or consumed resource belongs on the
   referenced resource node. For example, artifact touchpoint metadata belongs on `Artifact`, not
   on `Effect`.
6. **Graceful degradation:** Consumers that do not implement this module MAY ignore Effect
   semantics, but SHOULD preserve recognized JSON-LD data during read-transform-write when possible.
7. **Private contracts:** Transport, command, mutation, retry, idempotency, and result-handling
   details SHOULD remain in Core `extensions` unless a future optional module defines them as
   interoperable vocabulary.

## Examples

### Minimal Example

```ujg-example
./examples/example-02.yamlld
```

### Artifact Production And Consumption Example

This example shows a federated share represented as an artifact crossing touchpoints. Effects
declare whether they produce or consume the artifact; the artifact declares source and target
touchpoints.

```ujg-example
./examples/example-01.yamlld
```
