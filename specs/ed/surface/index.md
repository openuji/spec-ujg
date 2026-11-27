## Overview

This core-family specification describes how an intended journey is made visible to people. It
defines four concepts:

- A [=Persona=] describes a human role or perspective, such as a customer or support agent.
- A [=Touchpoint=] describes where an experience is presented, such as a website, mobile app,
  kiosk, or call center.
- A [=Surface=] gives a stable identity to something visible that represents a Graph node.
- A [=SurfaceInstance=] identifies one concrete occurrence of a Surface at runtime.

The concepts form two independent relationship chains:

```mermaid
flowchart LR
  Persona -->|touchpoints| Touchpoint
  Touchpoint -->|journeys| Journey
  SurfaceInstance -->|surface| Surface
  Surface -->|graphNode| GraphNode["State, CompositeState, or Command"]
```

The first chain describes the human perspective and presenting boundary around a Journey. The
second describes how visible materialization connects to Graph meaning. Neither chain adds Graph
edges, changes traversal, or identifies who actually used a system at runtime.

Graph does not depend on Surface. A Graph model remains meaningful without personas, touchpoints,
surfaces, or runtime instances.

Examples compose the shared baseline context with
`https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld`.

## Terminology

- <dfn>Persona</dfn>: A human role, archetype, or participant perspective relevant to an
  experience.
- <dfn>Touchpoint</dfn>: A system, channel, or service boundary through which one or more Journeys
  are presented.
- <dfn>Surface</dfn>: A stable, addressable, design-system-agnostic visible boundary for one
  supported Graph node.
- <dfn>SurfaceInstance</dfn>: One concrete runtime-visible occurrence of a Surface.

## Persona {data-cop-concept="persona"}

A [=Persona=] gives a name to a human perspective that matters to an experience. For example,
"Customer", "Support agent", and "Store manager" can be personas. A persona can be associated with
one or more [=Touchpoint|Touchpoints=] through `touchpoints`.

A Persona is not a person record. It does not identify an account, authenticated identity, runtime
actor, authorization subject, legal person, system, or organization. It also does not own Graph
nodes. Graph nodes therefore never need a Persona in order to be understood.

<spec-statement>
1. A [=Persona=] **MUST** have an IRI so it can be referenced consistently.
2. A [=Persona=] **MAY** have a `label`, `tags`, and one or more `touchpoints`.
3. Every `touchpoints` value **MUST** identify a [=Touchpoint=].
4. Graph nodes **MUST NOT** reference a [=Persona=] directly.
5. Persona relationships **MUST NOT** create Graph edges, alter Graph traversal, assert that
   something occurred, identify a Runtime actor, or imply authentication or authorization.
</spec-statement>

```mermaid
classDiagram
  class Persona {
    id
    label
    tags
    touchpoints
  }
  class Touchpoint
  Persona --> "0..*" Touchpoint : touchpoints
```

Example nodes:

```ujg-example
./examples/example-06.yamlld
```

## Touchpoint {data-cop-concept="touchpoint"}

A [=Touchpoint=] describes where people encounter an experience. A website, mobile app, kiosk,
branch office, and call center are all possible touchpoints. The optional `channel` is a short name
for the kind of boundary, while `journeys` identifies the [=Journey|Journeys=] presented there.

Touchpoints connect to meaningful Journey boundaries rather than individual States or Surfaces.
This keeps a coherent part of an experience together. A Touchpoint does not identify a Persona,
account, Runtime observer, or protocol state by itself.

<spec-statement>
1. A [=Touchpoint=] **MUST** have an IRI and one `label`.
2. A [=Touchpoint=] **MAY** have one `channel` and one or more `journeys`.
3. Every `journeys` value **MUST** identify a [=Journey=].
4. Touchpoint assignment **SHOULD** be made at a Journey boundary when that Journey represents one
   coherent experience on the Touchpoint.
5. `journeys` **MUST NOT** create hidden Graph edges, change traversal, assert occurrence, or
   change Runtime event ordering.
</spec-statement>

```mermaid
classDiagram
  class Touchpoint {
    id
    label
    channel
    journeys
  }
  class Journey
  Touchpoint --> "0..*" Journey : journeys
```

Example node:

```ujg-example
./examples/example-05.yamlld
```

## Surface {data-cop-concept="surface"}

A [=Surface=] gives a stable identity to one visible boundary and connects that boundary to its
Graph meaning with `graphNode`. The referenced Graph node can be a `State`, `CompositeState`, or
`Command`.

For example, a shipping form can be the Surface for a shipping `State`. A visible "Place order"
control can be the Surface for a `Command`. Referencing a Command does not prescribe a button, link,
or any other widget; it only says which intentional invocation the visible boundary represents.

Multiple Surfaces can reference the same Graph node when they are genuinely different visible
boundaries. A different color, framework, or renderer does not by itself make a new Surface.

When Graph traversal creates multiple concrete occurrences, the corresponding Surface can also
appear more than once. Surface does not define occurrence counts, instance keys, collection data,
or rendering behavior. Those details come from Graph semantics and runtime or application data.
A [=StateCollection=] is such Graph semantics; its members are told apart by their SurfaceInstances
(see [=SurfaceInstance=]).

<spec-statement>
1. A [=Surface=] **MUST** have an IRI and exactly one `graphNode`.
2. `graphNode` **MUST** identify a `State`, `CompositeState`, or `Command`.
3. A [=Surface=] **MUST NOT** declare a Persona or Touchpoint directly.
4. A [=Surface=] **MUST NOT** change Graph traversal or assert that its Graph node occurred.
5. A [=Surface=] **MUST NOT** define occurrence multiplicity, instance keys, data sources,
   collection iteration, or rendering behavior.
6. A [=Surface=] **MUST NOT** reference a [=Transition=], [=AdjacentTransition=],
   [=OutgoingTransition=], or [=InvokingTransition=] through `graphNode`.
</spec-statement>

```mermaid
classDiagram
  class State
  class CompositeState
  class Command
  class Surface {
    id
    graphNode
  }
  Surface --> State : graphNode
  Surface --> CompositeState : graphNode
  Surface --> Command : graphNode
```

Example node:

```ujg-example
./examples/example-04.yamlld
```

## SurfaceInstance {data-cop-concept="surface-instance"}

A [=SurfaceInstance=] identifies one concrete occurrence of a [=Surface=]. For example, the same
shipping form Surface can appear during many executions, and each visible occurrence can have its
own SurfaceInstance. Runtime events use `surfaceInstance` to say where an observed moment
occurred.

<spec-statement>
1. A [=SurfaceInstance=] **MUST** have an IRI and exactly one `surface`.
2. `surface` **MUST** identify a [=Surface=].
3. A [=SurfaceInstance=] **MUST NOT** declare Graph-node identity directly; its Graph meaning is
   found through the referenced Surface.
4. Each [=Collection member|member=] of a [=StateCollection=] **MUST** be observed through its own
   SurfaceInstance, and every observation of that member **MUST** use the same one. Mapping tells
   members apart only by their SurfaceInstances.
</spec-statement>

```mermaid
classDiagram
  class Surface
  class SurfaceInstance {
    id
    surface
  }
  SurfaceInstance --> Surface : surface
```

Example node:

```ujg-example
./examples/example-03.yamlld
```

## Shared Semantics

1. `Persona.touchpoints` and `Touchpoint.journeys` form the descriptive path from a human
   perspective to the Journeys presented for that perspective.
2. `Surface.graphNode` is the canonical relationship from a visible boundary to Graph meaning.
3. `SurfaceInstance.surface` is the canonical relationship from one concrete visible occurrence
   to its stable Surface.
4. To find the Touchpoints applicable to a Surface, a consumer first finds the Journey or Journeys
   in which the referenced Graph node is used, then finds Touchpoints whose `journeys` include
   those Journeys. A shared Graph node can therefore lead to more than one applicable Touchpoint.
5. To find the Personas associated with those Touchpoints, a consumer finds Personas whose
   `touchpoints` include them. This can produce no Persona, one Persona, or several Personas.
6. An associated Persona describes the intended human perspective. It **MUST NOT** be treated as
   the identity of a person observed at runtime.
7. When [=OutgoingTransition=] or [=InvokingTransition=] nodes need stable visible invocation
   identity, model a [=Command=] and let those transitions share that Command through
   `command`.
8. Surface terms do not select design-system components, templates, slots, tokens, or renderers.
9. Concrete Surface occurrence multiplicity derives from Graph traversal and runtime or application
   data; Surface does not add its own multiplicity vocabulary.
10. A consumer may ignore Surface semantics while preserving recognized JSON-LD data.

## Normative Artifacts

The following sections contain the exact machine-readable vocabulary, JSON-LD term mappings, and
validation rules. Readers who only need the conceptual model can continue to the examples.

### Ontology {data-cop-concept="ontology"}

The Surface ontology is published at `https://ujg.specs.openuji.org/ed/ns/surface`.

:::include ./surface.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The Surface context is published at `https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld`.

:::include ./surface.context.jsonld :::

### Validation {data-cop-concept="validation"}

The Surface SHACL shape is published at `https://ujg.specs.openuji.org/ed/ns/surface.shape`.

:::include ./surface.shape.ttl :::

## Examples

### Combined Surface Example

In this example, the Customer Persona is associated with the Web shop Touchpoint. That Touchpoint
presents the Checkout Journey. The shipping form Surface gives visible identity to the Shipping
State, and the SurfaceInstance identifies one concrete occurrence of that form.

```ujg-example
./examples/example-02.yamlld
```

### Private Extension Payloads

Core `extensions` remains available for vendor-private Surface data.

```ujg-example
./examples/example-01.yamlld
```
