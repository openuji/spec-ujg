**Title:** `org.openuji.specs.ujg.design-system.v1`

**Status:** incubating implementation extension for design-system metadata carried in UJG Core `extensions`.

## Namespace

- Canonical namespace string: `org.openuji.specs.ujg.design-system.v1`
- Payload location: `extensions["org.openuji.specs.ujg.design-system.v1"]`
- Published JSON Schema: `https://ujg.specs.openuji.org/ed/ns/design-system.schema.json`

## Purpose

This extension describes the stable design-system hierarchy associated with a materialized surface.

It exists so that generators and renderers can understand:

- which design system applies,
- which design-system version and package are expected,
- which pattern and primary component are being materialized,
- where source artifacts such as Storybook, Figma, or repository entries live,
- which tokens, content keys, and accessibility requirements are relevant.

Concrete component variants and layout recipes are selected at realization time by
`org.openuji.specs.ujg.render.v1`.

## Scope

This extension covers:

- design-system identity,
- design-system version and package reference,
- pattern and component references,
- source artifact references,
- design token references,
- content key references,
- accessibility requirement references.

The extension is self-contained. It may be combined with render realization metadata, but it does not
depend on private renderer props for correctness.

## Non-goals

This extension does not standardize:

- token file formats,
- component implementation APIs,
- CSS or utility-class naming,
- Figma document structure,
- Storybook story IDs,
- package-manager behavior,
- accessibility test runners.

## Primary Attachment Targets

- `Surface`

`Surface` is the preferred host when the Surface module is used because the design-system payload
describes the materialized interface boundary.

## Secondary Attachment Targets

- `State` or `CompositeState` when a producer keeps materialization metadata directly on the
  graph node
- `Template` for reusable design-system defaults shared by several state-like nodes
- `Journey` for broad defaults such as a shared system, package, or token source

## Discouraged Or Disallowed Attachment Targets

- `Transition` is discouraged because transitions normally invoke actions rather than define a
  surface-level design-system hierarchy.
- `OutgoingTransitionGroup` is discouraged because it is not a design-system host.
- `Route` is discouraged because addressability belongs in Routing.
- `MessageBundle` is discouraged because translated copy belongs in L10n and structured editorial
  binding belongs in Content.
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

- `systemRef`, `systemVersion`, `packageRef`, `patternRef`, and `componentRef` are singular values.
  The more specific value replaces the inherited one.
- `sourceRefs` merges by key. A more specific `storybook`, `figma`, or `repository` value replaces
  the inherited value for the same key.
- `tokenRefs`, `contentRefs`, and `a11yRefs` combine across inheritance with duplicate removal.

## Property Vocabulary

- `systemRef`: identity of the design system. Expected shape: string. Allowed categories:
  design-system IDs or opaque external identifiers. Implementation intent: tells generators which
  design-system inventory applies.
- `systemVersion`: design-system version. Expected shape: string. Implementation intent: lets
  generators distinguish incompatible design-system revisions.
- `packageRef`: implementation package reference. Expected shape: string. Allowed categories:
  package-manager references, repository references, or opaque adapter-local references.
  Implementation intent: points target implementations to the expected component package.
- `patternRef`: design-system pattern reference. Expected shape: string. Implementation intent:
  identifies the pattern or template family represented by the surface.
- `componentRef`: primary design-system component reference. Expected shape: string.
  Implementation intent: identifies the stable component family before realization-specific variants
  are selected.
- `sourceRefs`: source artifact references. Expected shape: object with optional `storybook`,
  `figma`, and `repository` keys. Implementation intent: gives generators and reviewers traceable
  source locations without standardizing vendor-specific formats.
- `tokenRefs`: design token references. Expected shape: array of strings. Implementation intent:
  identifies token dependencies relevant to the surface.
- `contentRefs`: content key references. Expected shape: array of strings. Implementation intent:
  links design-system materialization to stable content keys without replacing L10n or Content.
- `a11yRefs`: accessibility requirement references. Expected shape: array of strings.
  Implementation intent: declares design-system accessibility requirements that should be preserved
  during materialization.

## Recommended Controlled Values

Recommended source reference keys:

- `storybook`
- `figma`
- `repository`

Recommended URN prefix conventions:

- `systemRef`: `urn:ds:system:`
- `patternRef`: `urn:ds:pattern:`
- `componentRef`: `urn:ds:component:`
- `tokenRefs`: `urn:ds:token:`
- `contentRefs`: `urn:content:`
- `a11yRefs`: `urn:ds:a11y:`

## Processing Model

A generator or renderer implementing this extension should:

1. Resolve the effective design-system payload using the inheritance and precedence rules above.
2. Normalize source references, token references, content references, and accessibility references.
3. Resolve the stable `systemRef`, `systemVersion`, `packageRef`, `patternRef`, and `componentRef`
   for the surface.
4. If `org.openuji.specs.ujg.render.v1` is also present, merge the stable design-system hierarchy
   with the selected realization's `componentVariantRef`, `layoutRecipeRef`, and realization-local
   `tokenRefs`.
5. Carry the resolved design-system binding in the render plan or target materialization artifact.

This extension should not cause an implementation to resolve assignment or select render
realizations by itself. Selection belongs to the render extension or to implementation-local runtime
logic.

## Semantic Validation Notes

JSON Schema validates payload structure. Implementations should also validate the effective
design-system payload after inheritance:

- `systemRef` should identify a design-system namespace,
- `patternRef` should identify a design-system pattern,
- `componentRef` should identify a design-system component,
- each `tokenRefs` value should identify a design-system token,
- each `contentRefs` value should identify a content key or content resource,
- each `a11yRefs` value should identify a design-system accessibility requirement.

## Cross-Stack Interpretation Notes

- Web: map to component libraries, Storybook entries, token packages, and design-system recipes.
- Native: map to platform component kits, token packages, and accessibility requirements.
- CMS: map to design-system backed page templates, editorial previews, and source artifacts.
- Commerce: map to storefront component families, checkout patterns, and merchandising templates.
- CLI or headless or background: map to report templates, output styles, and accessibility or
  readability constraints.

## Published JSON Schema

The published schema for this extension is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/design-system.schema.json`.

:::include ./design-system.schema.json :::

## Minimal Example Payload

```json
{
  "@id": "urn:surface:refund-form",
  "@type": "Surface",
  "surfaceStateRef": "urn:state:refund-form",
  "extensions": {
    "org.openuji.specs.ujg.design-system.v1": {
      "systemRef": "urn:ds:system:acme",
      "systemVersion": "3.4.0",
      "packageRef": "npm:@acme/design-system@3.4.0",
      "patternRef": "urn:ds:pattern:request-form",
      "componentRef": "urn:ds:component:RefundForm",
      "sourceRefs": {
        "storybook": "storybook://forms/refund-form",
        "figma": "figma://file/acme-refund-flow/node/refund-form",
        "repository": "github://acme/design-system/packages/forms/RefundForm"
      },
      "tokenRefs": [
        "urn:ds:token:color.surface.default",
        "urn:ds:token:color.text.default",
        "urn:ds:token:typography.heading.md"
      ],
      "contentRefs": [
        "urn:content:refund.form.headline",
        "urn:content:refund.form.cta",
        "urn:content:refund.form.reason"
      ],
      "a11yRefs": [
        "urn:ds:a11y:form-labels-required",
        "urn:ds:a11y:error-summary",
        "urn:ds:a11y:keyboard-submit"
      ]
    }
  }
}
```

## Resolution With Render Realizations

When a surface also carries `org.openuji.specs.ujg.render.v1`, a renderer should treat this
extension as the stable hierarchy and the selected render realization as the concrete variant
binding.

```json
{
  "systemRef": "urn:ds:system:acme",
  "systemVersion": "3.4.0",
  "packageRef": "npm:@acme/design-system@3.4.0",
  "patternRef": "urn:ds:pattern:request-form",
  "componentRef": "urn:ds:component:RefundForm",
  "componentVariantRef": "urn:ds:component-variant:RefundForm.standard",
  "layoutRecipeRef": "urn:ds:recipe:form.standard",
  "tokenRefs": [
    "urn:ds:token:color.surface.default",
    "urn:ds:token:spacing.form.relaxed"
  ],
  "contentRefs": [
    "urn:content:refund.form.headline"
  ],
  "a11yRefs": [
    "urn:ds:a11y:form-labels-required"
  ]
}
```

## Graduation Guidance

Thin parts that may later graduate into optional modules or shared references include:

- a design-system reference type,
- token and recipe reference vocabularies,
- source artifact reference conventions.

The following should remain extension-only:

- package-manager references,
- vendor-specific source artifact locations,
- project-specific content and accessibility catalog IDs.
