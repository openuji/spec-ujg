# AGENTS.md

## Purpose

You generate **actual UJG documents in JSON-LD** for interoperable user journeys and implementation generation.

Your outputs must be usable as:
- a graph-level source of truth for user flow behavior,
- a generator-facing source of truth for materialization,
- a portable input for multiple targets such as Next.js, Astro, Drupal, TYPO3, Magento-like commerce, Magnolia, Spryker, React Native, Compose, Flutter, and local CLI/headless/dockerized environments.

You must generate documents that are:
- valid UJG-style JSON-LD,
- readable by humans,
- stable enough for code generation,
- conservative about cross-extension coupling,
- generic first, stack-specific only when necessary.

---

## Core working model

Treat the overall system as four layers.

### 1. Graph layer
This is the behavioral source of truth.
Use UJG graph-native nodes such as:
- `Journey`
- `State`
- `CompositeState`
- `Transition`
- `OutgoingTransitionGroup`

### 2. Module layer
Use existing UJG modules where they already fit:
- Templates
- Routing
- L10n

Use module references such as:
- `templateRef`
- `routeRef`
- `copyRef`

Do not re-invent these as extensions.

### 3. Implementation extension layer
Use self-contained generator-facing extensions:
- `org.openuji.specs.ujg.surface.v1`
- `org.openuji.specs.ujg.form.v1`
- `org.openuji.specs.ujg.record.v1`
- `org.openuji.specs.ujg.collection.v1`
- `org.openuji.specs.ujg.command.v1`
- `org.openuji.specs.ujg.access.v1`
- `org.openuji.specs.ujg.target.v1`
- `org.openuji.specs.ujg.content.v1` when editorial/content modeling matters
- `org.openuji.specs.ujg.artifact.v1` when file/media/document handling matters

### 4. Project-specific rule layer
When the standard extension set is not enough, add a **project-specific namespaced extension** such as:
- `com.example.rules.v1`
- `com.example.checkout.v1`

Project-specific rules must stay:
- node-local,
- self-contained,
- documented,
- narrowly scoped,
- optional for generators that do not support them.

Do not use project-specific rules until the standard extension set is clearly insufficient.

---

## Hard rules

### Rule 1
Do not use Mapping for materialization.
Mapping is not the place for layout, rendering, component choice, data shape, or stack-specific realization.

### Rule 2
Do not put generator-critical semantics only into prose.
Anything a generator must act on belongs in JSON.

### Rule 3
Do not make extensions depend on private objects inside other extensions.
Extensions must be usable on their own.

Bad pattern:
- `policy` needing to dereference a private `formRef` defined deep inside another extension.

Good pattern:
- `form.v1` contains its own validation.
- `access.v1` governs node-level access.
- `command.v1` contains its own outcomes.
- `surface.v1` contains structure, design, and library placeholder together.

### Rule 4
Only rely on these external reference classes:
- UJG node IDs
- official module refs such as `templateRef`, `routeRef`, `copyRef`
- external published resources such as token files, schemas, or contract identifiers

### Rule 5
Keep extensions generic.
Do not encode:
- React component paths
- Flutter widget classes
- Compose composable names
- Drupal plugin IDs
- Magento XML handles
- REST URLs
- GraphQL queries
- SQL
- Dockerfiles
- CI pipelines

### Rule 6
Prefer one extension per whole generator use case.
Do not split one use case across many opaque blobs unless there is a very strong reason.

### Rule 7
Generate JSON-LD that is stable and diff-friendly.
Use deterministic ordering, stable IDs, and shallow nesting where possible.

---

## Default output package

Unless explicitly asked otherwise, produce these artifacts:

1. `journey.graph.jsonld`
2. `journey.templates.jsonld`
3. `journey.routes.jsonld`
4. `journey.l10n.jsonld`
5. `journey.materialization.jsonld`

Where:
- the graph file contains core graph nodes,
- templates/routes/l10n files contain module resources,
- the materialization file contains graph node overlays with implementation extensions.

For small examples, a single combined `UJGDocument` is acceptable.

---

## Required JSON-LD conventions

### Envelope
Use:
- `@context`
- `@id`
- `@type`
- `imports`
- `nodes`

### Document type
Use:
- `@type: "UJGDocument"`

### Extensions
Put extensions under:
- `extensions["namespace"]`

Do not put extension payloads at top level.
Do not put extension payloads on `UJGDocument` itself unless the target system explicitly supports that outside UJG rules.

### IDs
Use stable URI-like or URN-like IDs.

Examples:
- `urn:journey:checkout`
- `urn:state:checkout.shipping`
- `urn:transition:checkout.shipping.to.payment`
- `urn:template:checkout.step`
- `urn:route:checkout.payment`
- `urn:copy:checkout.payment`

### Node labels
Use clear human-readable labels, but never rely on labels for machine resolution.

---

## Extension usage rules

## org.openuji.specs.ujg.surface.v1

### Purpose
Own the full materialized surface contract:
- structure
- visual language
- design-system binding
- component-library placeholder

### Use it for
- `surfaceKind`
- slots/regions
- blocks
- layout/structural variants
- token or theme sources
- light/dark/high-contrast/density modes
- semantic appearance recipes
- library family placeholder
- block-to-recipe mapping
- adaptation posture

### Primary attachment targets
- `Template`
- `State`
- `CompositeState`

### Secondary targets
- `Journey`
- `Transition` for transient surfaces such as dialogs or completion sheets

### Keep it self-contained
Do not split:
- scaffold into one extension,
- design into another,
- library placeholder into another,
when generation depends on all of them together.

### Minimum shape
```json
{
  "surfaceKind": "page",
  "slots": ["header", "main", "aside", "footer"],
  "blocks": [
    { "id": "summary", "kind": "summary", "slot": "aside", "recipe": "card.summary" },
    { "id": "form", "kind": "form", "slot": "main", "recipe": "form.default" }
  ],
  "theme": {
    "tokenSources": [
      "https://example.com/tokens/base.json",
      "https://example.com/tokens/brand.json"
    ],
    "defaultMode": "light",
    "supportedModes": ["light", "dark"]
  },
  "library": {
    "family": "acme-ui",
    "version": "1"
  },
  "adaptation": "balanced"
}
