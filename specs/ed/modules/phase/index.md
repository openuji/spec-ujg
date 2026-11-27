## Overview

This optional module defines journey-map grouping over intended Graph topology. A [=Phase=] is a
high-level grouping, and a [=Step=] identifies one experienced [=CompositeState=] through
`compositeState`.

The module is intentionally first-level. It attaches directly to [[UJG Graph]] composition without
requiring Surface, Runtime, Mapping, Observability, or Design System data. Surfaces describe how
Graph subjects are presented. Runtime and Mapping describe what was actually observed.

Phase terms do not create Graph traversal, alter transition semantics, select child journey entries,
or imply Runtime execution order. Runtime occurrence and phase-start derivation are defined by
[[UJG Mapping]], not by this module.

Documents using this module compose the Graph context with
`https://ujg.specs.openuji.org/ed/ns/phase.context.jsonld`.

## Terminology

- <dfn>Phase</dfn>: A high-level presentation grouping of Steps.
- <dfn>Step</dfn>: A journey-map step that identifies exactly one experienced Graph
  [=CompositeState=].

## Phase {data-cop-concept="phase"}

A [=Phase=] is a high-level grouping for [=Step|Steps=]. `order` is display
metadata; it does not determine Graph traversal, Mapping step order, or Runtime event order.

<spec-statement>
1. A [=Phase=] **MUST** be identified by an IRI.
2. A [=Phase=] **MAY** declare at most one integer `order`.
3. `order` **MUST NOT** be interpreted as Graph traversal, Mapping step order, Runtime event order,
   occurrence, or phase start.
4. A [=Phase=] groups the [=Step|Steps=] whose `phase` resolves to it; it
   does not list or own them.
5. A [=Phase=] **MUST NOT** directly reference journeys, composite states, states, or surfaces.
</spec-statement>

```mermaid
classDiagram
  class Phase {
    id
    order
  }
```

Example node:

```ujg-example
./examples/example-03.yamlld
```

## Step {data-cop-concept="step"}

A [=Step=] identifies one experienced [=CompositeState=]. The referenced composite state represents
a distinct nested segment of the intended journey topology; its `subjourneys` identify the child
journeys contained by that segment.

<spec-statement>
1. A [=Step=] **MUST** be identified by an IRI.
2. A [=Step=] **MUST** declare exactly one `compositeState`.
3. `compositeState` **MUST** reference a [=CompositeState=] defined in the Graph model.
4. A [=Step=] **MAY** declare at most one `phase` referencing a [=Phase=].
5. A [=Step=] **MAY** declare at most one integer `order`.
6. `order` **MUST NOT** be interpreted as Graph traversal, child journey traversal order, Mapping
   step order, Runtime event order, occurrence, or phase start.
7. `compositeState` **MUST NOT** create traversal, alter transition semantics, select child
   journey entries, or imply Runtime execution order.
8. A [=Step=] **MUST NOT** use Surface resources as its semantic subject.
9. A [=Step=]'s `compositeState` remains singular even when the referenced [=CompositeState=]
   contains more than one child [=Journey=].
</spec-statement>

```mermaid
classDiagram
  class CompositeState
  class Phase
  class Step {
    id
    compositeState
    phase
    order
  }
  Step --> CompositeState : compositeState
  Step --> Phase : phase
```

Example node:

```ujg-example
./examples/example-02.yamlld
```

## Shared Semantics

1. `compositeState` is the canonical assignment from a [=Step=] to Graph topology.
2. A [=Phase=]'s associated topology is derived from the `compositeState` values of the
   [=Step|Steps=] that reference it with `phase`.
3. The `subjourneys` values of the referenced [=CompositeState=] identify contained child
   journeys; their serialization order does not imply child traversal order, priority,
   synchronization, or completion order.
4. `Step.order`, `Phase.order`, and `subjourneys` order do not imply child traversal order.
5. [=Step=] and [=Phase=] terms do not repair missing Graph topology.
6. Consumers that do not implement this module MAY ignore Phase semantics while preserving
   recognized JSON-LD data during read-transform-write.

## Normative Artifacts

### Ontology {data-cop-concept="ontology"}

The Phase ontology is published at `https://ujg.specs.openuji.org/ed/ns/phase`.

:::include ./phase.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The Phase context is published at `https://ujg.specs.openuji.org/ed/ns/phase.context.jsonld`.

:::include ./phase.context.jsonld :::

### Validation {data-cop-concept="validation"}

The Phase SHACL shape is published at `https://ujg.specs.openuji.org/ed/ns/phase.shape`.

:::include ./phase.shape.ttl :::

## Examples

### Graph Segment With Phase Grouping

```ujg-example
./examples/example-01.yamlld
```
