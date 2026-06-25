## Source of truth

Use the active Editor's Draft unless the user explicitly asks for a dated snapshot:

`https://ujg.specs.openuji.org/ed/modules/design-system`

Generate only terms defined by the active ED Design System and Surface contexts unless the user explicitly requests an extension.

## Scope

Design System describes how design-system artifacts realize `Surface` resources.

Correct layer order:

```text
Graph subject -> surfaceRef -> Surface
SurfaceRealization -> surfaceRef + componentRef/templateRef
DesignSystem -> componentRefs/templateRefs/tokenSourceRefs/surfaceRealizationRefs
```

Graph defines topology.
Surface defines materialization boundaries.
Design System realizes surfaces.

## Required contexts

When using Design System terms, include the Surface and Design System contexts:

```json
[
  "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/design-system.context.jsonld"
]
```

## Vocabulary

Use only these Design System classes:

```text
DesignSystem
TokenSource
Component
Template
Slot
SurfaceRealization
SlotBinding
```

Use only these common Design System properties:

```text
tokenSourceRefs
componentRefs
templateRefs
surfaceRealizationRefs
surfaceRef
componentRef
templateRef
slotRefs
slotBindingRefs
slotRef
targetSurfaceRef
targetComponentRef
```

Do not invent:

```text
UIView
viewRef
themeRef
variant
slots
tokenRefs
props
componentName
cssClass
route
url
action
transitionRef
outgoingTransitionRef
```

## Binding rule

Graph nodes must not point directly to components, templates, token sources, design-system variants, props, or registry items.

Correct:

```json
{
  "@type": "State",
  "@id": "urn:example:state:registration-form",
  "surfaceRef": "urn:example:surface:registration-form"
}
```

Then realize the surface:

```json
{
  "@type": "Surface",
  "@id": "urn:example:surface:registration-form"
},
{
  "@type": "Component",
  "@id": "urn:example:component:RegistrationForm"
},
{
  "@type": "SurfaceRealization",
  "@id": "urn:example:realization:registration-form",
  "surfaceRef": "urn:example:surface:registration-form",
  "componentRef": "urn:example:component:RegistrationForm"
}
```

## SurfaceRealization

A `SurfaceRealization` must have:

```text
surfaceRef
componentRef OR templateRef
```

Use `componentRef` for direct component realization.

Use `templateRef` for composed layouts.

Do not use both `componentRef` and `templateRef`.

Use `slotBindingRefs` only with `templateRef`.

## Template, Slot, SlotBinding

Use `Template` for reusable layout structure.

A `Template` declares slots with `slotRefs`.

A `SlotBinding` connects one declared slot to exactly one target:

```text
slotRef + targetSurfaceRef
or
slotRef + targetComponentRef
```

Use `targetSurfaceRef` when the slotted content corresponds to a modeled surface.

Use `targetComponentRef` when the slotted content is only a design-system component.

Slot bindings are presentation composition only. They do not imply traversal, state order, nesting, runtime lifecycle, or form behavior.

## TokenSource

Use `TokenSource` only to reference a token source, package, manifest, or token set.

Do not encode token values, CSS variables, aliases, themes, or style calculations unless the user explicitly asks for a project extension.

## Navigation and forms

Keep navigation in Graph.

Use Graph `Transition`, `OutgoingTransition`, and `OutgoingTransitionGroup` for journey topology, links, CTAs, header/footer navigation, and locale switchers.

Use Design System only to realize the surfaces that display those affordances.

Keep form states and outcomes in Graph. Use Design System only to say which component or template realizes each form/result surface.

## Checks before answering

* Did Graph bind to Surface, not directly to Design System?
* Are all Design System terms defined by ED?
* Is every `SurfaceRealization` attached to a `Surface`?
* Does every realization use exactly one of `componentRef` or `templateRef`?
* Are slots declared by `Template` and filled through `SlotBinding`?
* Did I avoid invented props, variants, class names, routes, URLs, CSS, runtime events, and business logic?
* Did Design System avoid changing Graph traversal?
