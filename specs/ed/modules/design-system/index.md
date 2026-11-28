## Overview

This optional module defines a graph-native vocabulary for describing how design-system artifacts
materialize Surface resources.

The module is intentionally first-level. It depends only on Graph and Surface. Surface is the bridge
between Graph topology and user-facing materialization. Graph nodes do not point to design-system
artifacts, and Surface resources remain design-system-agnostic.

The Design System module introduces `SurfaceMaterialization` as the design-system-side bridge. A
`SurfaceMaterialization` references exactly one `Surface` and then identifies either a `Component` or a
`Template` as the primary materialization. When a template is used, the materialization may reference
`SlotBinding` nodes that fill template-declared `Slot` nodes with surfaces.

This module is optional. It annotates the shared graph with interoperable design-system materialization
resources, but it does not change graph topology, traversal rules, Surface attachment rules, import
resolution, rendering behavior, or runtime semantics.

## Terminology

- <dfn>Theme</dfn>: A graph-native design-system scope that references token sources.
- <dfn>TokenSource</dfn>: An addressable token source, package, manifest, or token set with a
  resolvable `source`. The internal token format is external to UJG.
- <dfn>Component</dfn>: An addressable design-system artifact that can materialize a surface.
- <dfn>Template</dfn>: A reusable design-system artifact that declares slots.
- <dfn>Slot</dfn>: An addressable slot declaration owned by or referenced from a template.
- <dfn>SurfaceMaterialization</dfn>: A design-system-side node that references one surface and describes
  its primary component or template materialization.
- <dfn>SlotBinding</dfn>: A materialization-local binding from a template slot to one surface target.

## Surface Materialization

A `Surface` is a design-system-agnostic materialized boundary for exactly one supported Graph node.
Surface defines the relation from `Surface` to that supported Graph node. Graph nodes do not point
to design-system artifacts or depend on Surface. This module does not add properties to `Surface`
and does not make `Surface` depend on design-system artifacts.

Design-system materialization is expressed with `SurfaceMaterialization`, `Component`, `Template`, `Slot`,
and `SlotBinding` nodes. A materialization links a stable `Surface` to one primary design-system
artifact. Template-backed materializations can keep required composition explicit by binding declared
slots to child surfaces.

Component, template, and materialization inventories are derived from `Component`, `Template`, and
`SurfaceMaterialization` nodes instead of being maintained as duplicate lists on `Theme`.

### SurfaceMaterialization {data-cop-concept="surface-materialization"}

A [=SurfaceMaterialization=] links one [=Surface=] to its primary design-system materialization, either a
[=Component=] or a [=Template=]. Template-backed materializations may also reference [=SlotBinding|SlotBindings=].

```mermaid
classDiagram
  class Surface
  class Component
  class Template
  class SlotBinding
  class SurfaceMaterialization {
    id
    materializedSurface
    component
    template
    slotBindings
  }
  SurfaceMaterialization --> Surface : materializedSurface
  SurfaceMaterialization --> Component : component
  SurfaceMaterialization --> Template : template
  SurfaceMaterialization --> "0..*" SlotBinding : slotBindings
```

Example node:

```ujg-example
./examples/example-12.yamlld
```

A `SurfaceMaterialization` MUST reference exactly one `Surface` through `materializedSurface` and exactly one
primary materialization through either `component` or `template`. It MUST NOT use both
`component` and `template`.

Use `component` when one addressable artifact directly materializes the surface and no required child
composition needs to remain explicit. Use `template` when reusable slots or required child
surfaces/controls must remain derivable. `slotBindings` MUST be used only on a template-backed
materialization.

### Component {data-cop-concept="component"}

A [=Component=] is an addressable design-system artifact that can directly materialize a [=Surface=].

```mermaid
classDiagram
  class Component {
    id
  }
```

Example node:

```ujg-example
./examples/example-11.yamlld
```

### Template {data-cop-concept="template"}

The mental model for a `Template`, its `Slot` nodes, and the `SlotBinding` nodes that fill those
slots is:

```text
Template
   |
   +-- Slot "main"       <-- empty hole
   |
   +-- Slot "submit"     <-- empty hole


SurfaceMaterialization says:

    use Template FormShell

    AND

    bind "main"   -> Refund form surface
    bind "submit" -> Submit Refund surface
```

A `Template` declares reusable holes. A `SurfaceMaterialization` chooses that template for one surface,
and its `SlotBinding` nodes fill those holes with surfaces for that materialization. A component appears
inside a slot only indirectly, by materializing a surface that a `SlotBinding` targets.

A [=Template=] is a reusable design-system artifact that declares zero or more [=Slot|Slots=].
A template declares reusable slots with `slots`. A template MUST NOT hard-code concrete surfaces,
components, transitions, or outgoing transitions into those slots.

```mermaid
classDiagram
  class Slot
  class Template {
    id
    slots
  }
  Template --> "0..*" Slot : slots
```

Example node:

```ujg-example
./examples/example-10.yamlld
```

### Slot {data-cop-concept="slot"}

A [=Slot=] is an addressable slot declaration used by a [=Template=].
Slots represent reusable presentation positions. Slots MUST NOT encode Graph nodes, traversal,
Command resolution, runtime instances, localization loading, data binding, collection iteration,
condition evaluation, or business logic.

```mermaid
classDiagram
  class Slot {
    id
  }
```

Example node:

```ujg-example
./examples/example-09.yamlld
```

### SlotBinding {data-cop-concept="slot-binding"}

A [=SlotBinding=] fills one declared [=Slot=] with exactly one [=Surface=].
Concrete assembly belongs to a `SurfaceMaterialization` through `SlotBinding` nodes.

```mermaid
classDiagram
  class Slot
  class Surface
  class SlotBinding {
    id
    slot
    targetSurface
  }
  SlotBinding --> Slot : slot
  SlotBinding --> Surface : targetSurface
```

Example nodes:

```ujg-example
./examples/example-08.yamlld
```

A `SlotBinding` MUST reference exactly one declared slot with `slot` and exactly one surface with
`targetSurface`.

When a `SlotBinding` targets a `Surface`, the target surface is composed into the slot for
presentation purposes only. The binding MUST NOT imply graph traversal, state activation, transition
validity, composite-state containment, execution order, or lifecycle semantics. A renderer, MCP
server, skill, or design-system resolver MAY resolve the graph-level subject associated with a target
surface through the Surface layer.

If a transition, outgoing transition, or outgoing-transition group affordance belongs in a slot,
model the stable invocation as a [=Command=], reference it from the applicable Graph edge with
`command`, model a `Surface` for that command through the Surface layer, and target that surface
with `targetSurface`.

## Token Scope

Theme and token-source resources describe token scope. They do not define which components,
templates, or surface materializations exist, and they are independent of the surface materialization chain.

A `Theme` identifies a design-system context by referencing token sources through `tokenSources`.
A `TokenSource` identifies the location of a token source, package, manifest, or token set through
`source`.

`source` values MUST be IRI references. A `source` value MAY be absolute or relative. Relative
`source` values MUST be resolved against the location of the containing [=UJGDocument=], following
the same base-resolution model used by Core imports.

Individual token names, token paths, token groups, token values, aliases, and inheritance rules are
outside this module. Consumers that need component, template, or materialization inventories derive them
from addressable design-system nodes and their references.

### Theme {data-cop-concept="theme"}

A [=Theme=] is a design-system scope that references token sources. Components, templates,
and surface materializations are discovered from their own nodes and are not duplicated on the
`Theme`.

```mermaid
classDiagram
  class TokenSource
  class Theme {
    id
    tokenSources
  }
  Theme --> "0..*" TokenSource : tokenSources
```

Example node:

```ujg-example
./examples/example-07.yamlld
```

### TokenSource {data-cop-concept="token-source"}

A [=TokenSource=] identifies a token source, token package, token manifest, or token set. A
`TokenSource` MUST declare exactly one `source`.

The internal token format is external to UJG.

```mermaid
classDiagram
  class TokenSource {
    id
    source
  }
```

Example node:

```ujg-example
./examples/example-06.yamlld
```

## Normative Artifacts

This module is published through the following artifacts:

- `design-system.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/design-system`
- `design-system.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/design-system.context.jsonld`
- `design-system.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/design-system.shape`

### Ontology {data-cop-concept="ontology"}

The normative Design System ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/design-system`. It is the authoritative structural definition
for the classes and properties declared by this module.

:::include ./design-system.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Design System JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/design-system.context.jsonld`. It provides compact JSON-LD term
mappings and coercions for Design System-specific properties and classes.

Surface uses `graphNode` for Graph attachment and `surface` on `SurfaceInstance`.
Design System uses the distinct canonical term `materializedSurface` on `SurfaceMaterialization`.
These terms have separate RDF properties and require no type-scoped override. All published module
contexts can therefore compose without an ambiguous `surface` property mapping.

:::include ./design-system.context.jsonld :::

### Validation {data-cop-concept="validation"}

The normative Design System SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/design-system.shape`. It is the authoritative validation
artifact for Design System structural constraints.

:::include ./design-system.shape.ttl :::

The remaining module semantics beyond the structural SHACL constraints are:

1. **Surface boundary:** Design System properties MUST NOT change Surface attachment semantics, make
   `Surface` depend on design-system artifacts, or introduce graph traversal, state activation,
   transition validity, composite-state containment, execution order, or lifecycle semantics.
2. **Surface materialization:** A `SurfaceMaterialization` MUST reference exactly one `Surface` and exactly
   one primary materialization, either `component` or `template`. `slotBindings` MUST be used
   only when `template` is present.
3. **Slot composition:** `Template` slot references are declarations. `SurfaceMaterialization` slot
   bindings are concrete assembly. A `SlotBinding` MUST reference exactly one `Surface` target
   through `targetSurface`, and surface targets compose presentation only.
4. **Token scope:** A `TokenSource` MUST declare exactly one `source` IRI reference. Relative
   `source` values MUST resolve against the containing `UJGDocument` location.
5. **Out of scope:** Component implementation APIs, props, variants, lifecycle, layout algorithms,
   rendering engines, framework adapters, responsive behavior, hydration behavior, token syntax,
   token value resolution, token inheritance, and accessibility implementation rules remain outside
   this module unless a future module defines them.
6. **Graceful degradation:** A consumer that does not implement this module MAY ignore Design System
   semantics, but it SHOULD preserve recognized JSON-LD data during read-transform-write when
   possible.

## MCP And Tooling Resolution

MCP servers, skills, AI tooling, design-system resolvers, and renderers MAY use referenced node IDs
plus active graph context to fetch implementation details. Those details can include framework
components, source files, Storybook entries, token files, runtime render plans, or platform adapters.

This module intentionally standardizes only the graph-native references needed for interoperability.
It does not duplicate design-system implementation catalogs or renderer configuration.

## Relationship To Core Extensions

Core `extensions` remains available for vendor-private, non-interoperable payloads. Component,
template, slot, slot-binding, surface-materialization, and token-source relationships intended for
interoperability SHOULD use this module instead of opaque extension payloads.

## Examples

Examples in this page compose the Core, Graph, Surface, and Design System contexts explicitly.
Examples include `label` values on Design System nodes for human readability. Those labels use the
shared Graph `label` term and are informative unless the referenced class requires labels elsewhere.

### Example A: Surface Without Materialization

```ujg-example
./examples/example-05.yamlld
```

This example assigns a state to a surface. It does not declare any design-system materialization.

### Example B: Component Materialization

```ujg-example
./examples/example-04.yamlld
```

The surface remains unchanged. The materialization node points to the surface directly, and clients can
derive the used component by following the materialization reference.

### Example C: Template Materialization

```ujg-example
./examples/example-03.yamlld
```

The template declares slots. The materialization binds those slots for this surface.

### Example D: Composite Surface With Child Surfaces

```ujg-example
./examples/example-02.yamlld
```

The composite state's surface is materialized as a shell. Child containment comes from the child journeys
referenced by `subjourneys`. The child surfaces are placed into slots for presentation only;
Graph remains the source of containment and traversal semantics.

### Example E: Multiple Design-System Token Scopes

```ujg-example
./examples/example-01.yamlld
```

Multiple themes can provide different token sources for the same surface and
materialization graph. Components, templates, and surface materializations remain discoverable from their own
nodes rather than from duplicated `Theme` lists.
