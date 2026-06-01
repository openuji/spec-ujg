**Title:** `org.openuji.specs.ujg.render.v1`

**Status:** incubating implementation extension for renderer component and realization metadata carried in UJG Core `extensions`.

## Namespace

- Canonical namespace string: `org.openuji.specs.ujg.render.v1`
- Payload location: `extensions["org.openuji.specs.ujg.render.v1"]`
- Published JSON Schema: `https://ujg.specs.openuji.org/ed/ns/render.schema.json`

## Purpose

This extension describes how a materialized surface is rendered by an implementation.

It exists so that generators and renderers can understand:

- which renderer component is responsible for the surface,
- how runtime selection chooses a realization,
- which concrete realizations are available,
- which fallback realization should be used,
- which renderer-level slots bind a shell surface to child states,
- which concrete design-system component variant and layout recipe are used by a realization.

This extension is intentionally separate from the Surface module. The Surface module identifies the
addressable interface boundary. This extension describes renderer-specific realization of that
boundary.

## Scope

This extension covers:

- renderer component identity,
- experiment-style realization selection,
- variant-keyed realizations,
- default realization metadata,
- renderer-level slot composition,
- realization-level design-system bindings.

The extension is self-contained. Slot values may refer to UJG `State` or `CompositeState` node IDs,
but the slot contract itself remains renderer metadata and does not change graph topology.

## Non-goals

This extension does not standardize:

- framework component APIs,
- component source file paths,
- bundler or hydration behavior,
- experiment assignment services,
- DOM trees or native view trees,
- design-token formats,
- analytics or runtime-event schemas.

## Primary Attachment Targets

- `Surface`

`Surface` is the preferred host when the Surface module is used because the render payload describes
one materialized interface boundary.

## Secondary Attachment Targets

- `State` or `CompositeState` when a producer keeps materialization metadata directly on the
  graph node
- `Template` for reusable render defaults shared by several state-like nodes
- `Journey` for broad renderer defaults such as a shared component family or selection posture

## Discouraged Or Disallowed Attachment Targets

- `Transition` is discouraged because transitions invoke behavior rather than define a rendered
  surface.
- `OutgoingTransitionGroup` is discouraged because it is not a render host.
- `Route` is discouraged because addressability belongs in Routing.
- `MessageBundle` is disallowed in normal use because localization resources are not render
  resources.
- `UJGDocument` is disallowed because Core extensions are node-scoped.

## Inheritance Model

For a surface with an assigned state-like graph node, generators should apply inheritance in this
order:

1. `Journey`
2. each enclosing `CompositeState`, from outermost to innermost
3. resolved `Template`, if `templateRef` is present
4. the assigned `State` or `CompositeState`
5. the local `Surface`

When the extension is attached directly to a state-like node without a Surface resource, the local
state-like node is the most specific host.

## Precedence And Override Rules

Use this precedence order:

1. `Surface`
2. assigned `State` or `CompositeState`
3. `Template`
4. innermost enclosing `CompositeState`
5. outer enclosing `CompositeState`
6. `Journey`

Merge and replacement rules:

- `component`, `selection`, and `defaultRealization` are singular values or objects. The more
  specific value replaces the inherited one.
- `realizations` merges by variant key. A more specific realization with the same key replaces the
  inherited realization for that key.
- `slots` merges by slot name. A more specific slot with the same name replaces the inherited slot
  target.
- `props` are renderer-specific and are not interpreted by this extension beyond JSON object shape.

## Property Vocabulary

- `component`: renderer component identity. Expected shape: string. Allowed categories: component
  registry keys, adapter-local component names, or opaque implementation identifiers. Implementation
  intent: tells the renderer which component family or entry to instantiate.
- `selection`: runtime realization selection posture. Expected shape: object with `type`,
  `experimentId`, and `fallbackVariant`. Allowed categories for `type`: `experiment`.
  Implementation intent: tells the renderer that an assignment resolver chooses among
  `realizations`.
- `realizations`: variant-keyed concrete render realizations. Expected shape: object keyed by
  variant keys such as `A`, `B`, `default`, `control`, or `treatment`. Implementation intent:
  carries the concrete props and realization-local design-system binding.
- `defaultRealization`: concrete realization used when no selection model is present or when a
  renderer needs a deterministic fallback. Expected shape: realization object.
- `slots`: renderer-level slot composition contract. Expected shape: object keyed by slot name,
  with values that identify child `State` or `CompositeState` nodes. Implementation intent: lets
  composite shell surfaces name child graph states without changing Graph semantics.
- `designSystem`: realization-local design-system binding. Expected shape: object with
  `componentVariantRef`, `layoutRecipeRef`, and optional `tokenRefs`. Implementation intent:
  identifies the concrete design-system variant and layout recipe used by the selected realization.

## Recommended Controlled Values

Recommended `selection.type` values:

- `experiment`

Recommended variant key values:

- `A`
- `B`
- `default`
- `control`
- `treatment`

## Processing Model

A generator or renderer implementing this extension should:

1. Resolve the effective render payload using the inheritance and precedence rules above.
2. Resolve `component` and normalize the `realizations` map.
3. If `selection` is present, resolve the selected variant through the implementation assignment
   service and use `fallbackVariant` when no assignment is available.
4. If no `selection` is present, use `defaultRealization` when present or an implementation-defined
   default realization from `realizations`.
5. Resolve each `slots` value as a `State` or `CompositeState` node ID in the current document set.
6. Combine the selected realization with `org.openuji.specs.ujg.design-system.v1` when that
   extension is also present.
7. Materialize a target-specific render plan without changing graph traversal or Surface
   attachment semantics.

## Semantic Validation Notes

JSON Schema validates payload structure. Implementations should also validate the effective render
payload after inheritance:

- if `selection` exists, `realizations` must exist,
- `selection.fallbackVariant` must exist as a key in `realizations`,
- every slot value must resolve to a known `State` or `CompositeState`,
- every realization used by a render plan must provide `designSystem.componentVariantRef`,
- every realization used by a render plan must provide `designSystem.layoutRecipeRef`.

## Cross-Stack Interpretation Notes

- Web: map to component registry entries, page shells, experiment variants, and slot-to-route-state
  composition.
- Native: map to screen components, platform-specific realization props, and child screen slots.
- CMS: map to preview components, editorial shell composition, and design-system component variants.
- Commerce: map to checkout layouts, account pages, merchandising slots, and experiment variants.
- CLI or headless or background: map to terminal renderers, report templates, or job output
  renderers.

## Published JSON Schema

The published schema for this extension is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/render.schema.json`.

:::include ./render.schema.json :::

## Minimal Example Payload

```json
{
  "@id": "urn:surface:refund-form",
  "@type": "Surface",
  "surfaceStateRef": "urn:state:refund-form",
  "extensions": {
    "org.openuji.specs.ujg.render.v1": {
      "component": "RefundFormSurface",
      "selection": {
        "type": "experiment",
        "experimentId": "refund-form-layout-test",
        "fallbackVariant": "A"
      },
      "realizations": {
        "A": {
          "realizationId": "refund-form.standard",
          "label": "Standard form",
          "props": {
            "layout": "standard",
            "headline": "Request a refund",
            "cta": "Submit request"
          },
          "designSystem": {
            "componentVariantRef": "urn:ds:component-variant:RefundForm.standard",
            "layoutRecipeRef": "urn:ds:recipe:form.standard",
            "tokenRefs": [
              "urn:ds:token:spacing.form.relaxed",
              "urn:ds:token:layout.form.single-column"
            ]
          }
        },
        "B": {
          "realizationId": "refund-form.compact",
          "label": "Compact form",
          "props": {
            "layout": "compact",
            "headline": "Start your refund",
            "cta": "Send request"
          },
          "designSystem": {
            "componentVariantRef": "urn:ds:component-variant:RefundForm.compact",
            "layoutRecipeRef": "urn:ds:recipe:form.compact",
            "tokenRefs": [
              "urn:ds:token:spacing.form.compact",
              "urn:ds:token:layout.form.condensed"
            ]
          }
        }
      }
    }
  }
}
```

## Composite Shell Example

```json
{
  "@id": "urn:surface:account-page-layout",
  "@type": "Surface",
  "surfaceStateRef": "urn:state:account-page",
  "extensions": {
    "org.openuji.specs.ujg.render.v1": {
      "component": "AccountPageLayout",
      "defaultRealization": {
        "realizationId": "account-page.sidebar-left",
        "label": "Sidebar left layout",
        "props": {
          "layout": "sidebar-left",
          "headline": "Account settings"
        },
        "designSystem": {
          "componentVariantRef": "urn:ds:component-variant:AccountPageLayout.sidebarLeft",
          "layoutRecipeRef": "urn:ds:recipe:page.sidebar-left"
        }
      },
      "slots": {
        "header": "urn:state:account-header",
        "main": "urn:state:profile-form",
        "sidebar": "urn:state:account-navigation"
      }
    }
  }
}
```

## Graduation Guidance

Thin parts that may later graduate into optional modules or shared references include:

- a generic realization selector,
- a standardized slot-reference model,
- a shared design-system binding vocabulary.

The following should remain extension-only:

- renderer component registry keys,
- implementation-specific props,
- experiment resolver details,
- framework-specific render-plan construction.
