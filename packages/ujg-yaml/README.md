# @openuji/ujg-yaml

Deterministic conversion between developer-oriented UJG authoring YAML and normalized canonical UJG JSON-LD.

This package is intentionally a projection layer. The YAML format is not a second UJG specification. It is a nested, ordered, author-friendly representation that compiles into the project-selected canonical JSON-LD form used for JSON-LD expansion, RDF interpretation, SHACL, conformance checks, execution references, and interchange.

## Status

This package currently provides:

- YAML authoring compile to canonical UJG JSON-LD.
- Canonical JSON-LD projection back to strict literal `nodes:` YAML.
- Locked target loading for `ed-2026-07-13`.
- Generated target vocabulary derived from locked context, ontology, and SHACL artifacts.
- Projection-registry validation against the generated target vocabulary.
- Deterministic output ordering for nodes, set-valued arrays, and properties.
- Structural round-trip validation.

Known gaps:

- Only the local Editor's Draft target `ed-2026-07-13` is registered today.
- Immutable TR/snapshot targets such as `2026.06` are the intended next target class, but are not registered in this package yet.
- Full JSON-LD expansion and RDF dataset comparison are not implemented yet.
- SHACL and UJG conformance validation are not implemented yet.
- Reverse projection intentionally emits no authoring sugar yet; it fails instead of guessing or dropping data.
- The CLI `validate` command currently reports strict structural project/compile equivalence only.

## Representations

The package works with two explicit representations.

Authoring YAML:

```yaml
ujgTarget: ed-2026-07-13
touchpoints:
  app:
    label: App
journey:
  id: app-journey
  defaultEntryRef: app-entry
  entries:
    app-entry:
      stateRef: app-ready
  states:
    app-ready:
      label: App ready
      surface:
        id: app-ready-surface
        touchpointRef: app
```

Canonical JSON-LD:

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld"
  ],
  "@id": "urn:ujg:document",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "app",
      "@type": "Touchpoint",
      "label": "App"
    }
  ]
}
```

The exact canonical output contains all lifted nodes, sorted by `@id`.

## How It Works

### 1. Target Selection

Every YAML document must declare a target:

```yaml
ujgTarget: ed-2026-07-13
```

The target is loaded from:

- `targets/ed-2026-07-13.json`
- `targets/ed-2026-07-13.vocab.json`

The target JSON locks the source ED commit, context files, ontology files, and SHACL files by hash. The generated vocabulary JSON is derived from those locked artifacts and records the same artifact hashes.

Runtime conversion does not fetch the current Editor's Draft and does not infer behavior from remote state. If the local artifacts or vocabulary lock are stale, target loading fails with `CONTEXT_NOT_LOCKED`.

#### Editor's Draft Targets

Targets whose id starts with `ed-` are special. They refer to a moving Editor's Draft, so the converter must not trust whatever happens to be online at runtime.

For `ed-*` targets, the package expects the corresponding spec artifacts to exist in the local checkout under `specs/ed/...`. Target loading verifies those local files against the hashes recorded in the target lock. This means `ed-*` conversion works only when the local checkout contains the exact locked artifact contents.

The check is content-based, not Git-branch-based:

- a checkout at the recorded commit works;
- a different checkout with identical artifact contents also works;
- a checkout where any locked context, ontology, or SHACL file changed fails with `CONTEXT_NOT_LOCKED`;
- a checkout missing the local `specs/ed/...` artifacts cannot satisfy the `ed-*` lock.

The commit metadata in `targets/ed-2026-07-13.json` is provenance. The enforced lock is the artifact hash set.

#### TR and Snapshot Targets

Immutable published targets, for example a future target such as `2026.06`, should not require a local spec checkout.

For those targets, the ontology, contexts, and SHACL artifacts are expected to be stable published resources. The target metadata can lock their public URLs and hashes, and the generated vocabulary can be produced from those immutable artifacts. Once such a target is registered, normal conversion should work from the package target files and generated vocabulary without requiring `specs/ed/...` to be checked out locally.

In short:

- `ed-*`: local Editor's Draft checkout required, verified by locked artifact hashes.
- immutable snapshot/TR target: no local ED checkout should be required once the target is registered and its published artifacts are locked.

### 2. Generated Target Vocabulary

The generated vocabulary is created by:

```sh
pnpm -F @openuji/ujg-yaml run vocab:update
```

The generator reads the locked target artifacts:

- `*.context.jsonld` for compact terms, `@id` references, `@set` containers, datatype hints, and context URLs.
- `*.ttl` ontology files for classes, properties, and module ownership.
- `*.shape.ttl` SHACL files for property-shape metadata such as `minCount`, `maxCount`, class/datatype hints, and node-kind hints.

The generated file contains:

- `classes`
- `properties`
- `modules`
- `propertyShapes`
- `referenceProperties`
- `setProperties`
- source artifact hashes

The package uses this generated target vocabulary for:

- supported class checks;
- known property checks;
- reference-property detection;
- set-valued array normalization;
- module and context selection;
- projection-registry validation.

### 3. Projection Registry

`src/registry.js` contains authoring projection rules that cannot be derived from ontology alone.

Examples:

- `touchpoints` maps to `Touchpoint`.
- `journeyEntryIndex` is a singleton section for `JourneyEntryIndex`.
- `accessible.features` maps to `AccessibleFeature`.
- nested `journey.states` lift into top-level canonical `nodes`.
- nested `surface` produces a canonical `Surface` and synthesizes `graphNodeRef`.
- `sampleScreenRef` is project-private YAML sugar stored under namespaced `extensions`.

These rules are explicit and versioned. The ontology tells the converter what terms exist; the projection registry tells it how YAML authors express those terms.

When a target is loaded, the projection registry is validated against the generated vocabulary. For example, if `touchpoints` maps to a class missing from the locked target vocabulary, conversion fails before compiling.

### 4. Compile Flow

`compileAuthoringYaml()` runs the following stages:

1. Parse YAML with duplicate-key detection.
2. Require `ujgTarget`.
3. Load the target lock and generated vocabulary.
4. Validate top-level authoring sections.
5. Process registered keyed sections.
6. Lift nested structural authoring forms into canonical nodes.
7. Validate local references.
8. Normalize canonical JSON-LD deterministically.
9. Return the document and provenance.

Important compile behaviors:

- A keyed map key becomes `@id`.
- Authoring `id` becomes `@id`.
- Authoring `type` becomes `@type`.
- Unknown top-level sections fail.
- Unknown properties fail unless they are registered extension sugar.
- Explicit types are accepted only if they exist in the generated target vocabulary.
- Local references must resolve after lifting.
- Absolute IRI references such as `https:`, `urn:`, and blank nodes are preserved as external references.
- Set-valued arrays are deduplicated and sorted based on the generated vocabulary.
- Order-sensitive arrays remain in authoring order.

### 5. Structural Lifting

The compiler lifts nested YAML definitions into top-level canonical `nodes`.

Supported examples:

```text
CompositeState.subjourney
  -> lift Journey
  -> set subjourneyId on the CompositeState

Journey.entries
  -> lift JourneyEntry nodes
  -> set entryRefs on the Journey

Journey.states
  -> lift State or CompositeState nodes
  -> set stateRefs on the Journey

Journey.transitions
  -> lift Transition nodes
  -> set transitionRefs on the Journey

Graph node surface
  -> lift Surface
  -> set Surface.graphNodeRef to the owning graph node id
```

Nested state-local transitions are also lifted. The containing state id is used as the transition `from` value.

### 6. Reverse Projection

`projectCanonicalJsonLd()` projects canonical JSON-LD back to strict literal `nodes:` YAML.

The reverse projection:

- infers the target from the JSON-LD context, or uses `options.targetId`;
- emits every canonical node as an item under top-level `nodes`;
- uses `id` and `type` only as direct YAML spellings for `@id` and `@type`;
- does not group, nest, omit types, infer ownership, or emit authoring sugar;
- compiles the projected YAML and verifies the normalized node set is unchanged;
- fails with `LOSSY_PROJECTION` when document-level data or node-local contexts would be dropped;
- never recreates original comments, anchors, aliases, quoting, or original YAML key order.

The result is deterministic normalized YAML, not the original source text.

## CLI Usage

The package exposes the `ujg-yaml` binary.

From the workspace, use `pnpm exec` or the package filter.

List targets:

```sh
pnpm -F @openuji/ujg-yaml exec ujg-yaml targets list
```

Compile authoring YAML to canonical JSON-LD:

```sh
pnpm -F @openuji/ujg-yaml exec ujg-yaml compile packages/ujg-yaml/fixtures/complex.yaml
```

Write compile output to a file:

```sh
pnpm -F @openuji/ujg-yaml exec ujg-yaml compile input.ujg.yaml -o output.ujg.jsonld
```

Write a compile provenance report:

```sh
pnpm -F @openuji/ujg-yaml exec ujg-yaml compile input.ujg.yaml -o output.ujg.jsonld --report report.json
```

Project canonical JSON-LD back to normalized YAML:

```sh
pnpm -F @openuji/ujg-yaml exec ujg-yaml project output.ujg.jsonld -o normalized.ujg.yaml
```

Run structural validation:

```sh
pnpm -F @openuji/ujg-yaml exec ujg-yaml validate output.ujg.jsonld
```

## Programmatic Usage

Import from the package root:

```js
import {
  compileAuthoringYaml,
  listTargets,
  loadTarget,
  projectCanonicalJsonLd,
  validateCanonicalJsonLd,
} from '@openuji/ujg-yaml';
```

Compile YAML:

```js
import { readFile } from 'node:fs/promises';
import { compileAuthoringYaml } from '@openuji/ujg-yaml';

const source = await readFile('input.ujg.yaml', 'utf8');
const result = await compileAuthoringYaml(source, {
  filePath: 'input.ujg.yaml',
});

if (!result.ok) {
  console.error(result.diagnostics);
  process.exit(1);
}

console.log(JSON.stringify(result.document, null, 2));
console.log(result.provenance);
```

Project JSON-LD:

```js
import { projectCanonicalJsonLd } from '@openuji/ujg-yaml';

const result = await projectCanonicalJsonLd(canonicalDocument, {
  targetId: 'ed-2026-07-13',
});

if (!result.ok) {
  console.error(result.diagnostics);
  process.exit(1);
}

console.log(result.yaml);
```

Validate JSON-LD structurally:

```js
import { validateCanonicalJsonLd } from '@openuji/ujg-yaml';

const result = await validateCanonicalJsonLd(canonicalDocument);

for (const diagnostic of result.diagnostics ?? []) {
  console.error(`${diagnostic.severity} ${diagnostic.code}: ${diagnostic.message}`);
}

if (!result.ok) {
  process.exit(1);
}
```

Load target metadata and vocabulary:

```js
import { loadTarget } from '@openuji/ujg-yaml';

const target = await loadTarget('ed-2026-07-13');

console.log(Object.keys(target.vocabulary.classes));
console.log(Object.keys(target.vocabulary.properties));
```

## API Reference

### `compileAuthoringYaml(input, options)`

Compiles UJG authoring YAML to canonical JSON-LD.

Parameters:

- `input`: YAML string.
- `options.filePath`: optional path used in YAML syntax diagnostics.
- `options.documentId`: optional fallback document `@id`.
- `options.verifyArtifacts`: set to `false` to skip target artifact/vocabulary verification. This is useful only in tests or specialized tooling.

Returns:

```js
{
  ok: true,
  document,
  diagnostics,
  provenance
}
```

or:

```js
{
  ok: false,
  diagnostics
}
```

### `projectCanonicalJsonLd(input, options)`

Projects canonical JSON-LD to strict literal `nodes:` YAML and verifies `compile(project(canonical))` preserves the normalized node set.

Parameters:

- `input`: JSON string or object.
- `options.targetId`: optional explicit target id. If omitted, the target is inferred from `@context`.
- `options.verifyArtifacts`: optional target-verification override.

Returns:

```js
{
  ok: true,
  authoring,
  yaml,
  diagnostics
}
```

### `validateCanonicalJsonLd(input, options)`

Runs strict structural project-compile-project validation.

This currently does not run JSON-LD expansion, RDF dataset construction, or SHACL. On structural success it returns `ok: true` with no diagnostics.

### `listTargets()`

Returns the available locked target ids.

### `loadTarget(targetId, options)`

Loads target metadata, generated vocabulary, verifies artifact hashes, verifies vocabulary-lock consistency, and validates the projection registry against the target vocabulary.

## Authoring YAML Shape

### Top-Level Keys

Supported top-level authoring sections include:

- `ujgTarget`
- `id` or `@id`
- `nodes`
- `touchpoints`
- `actors`
- `artifacts`
- `actions`
- `states`
- `journeyEntryIndex`
- `messageBundle`
- `resolvers`
- `observationBindings`
- `phases`
- `experienceSteps`
- `journey`
- `accessible`

Unknown top-level keys fail with `UNKNOWN_AUTHORING_TERM`.

### Keyed Sections

Most sections are keyed maps:

```yaml
touchpoints:
  app:
    label: App
```

The key `app` becomes canonical `@id: "app"`.

You can also use explicit `id` or `@id` inside node bodies. Duplicate canonical ids fail with `DUPLICATE_ID`.

### Type Defaults

Each registered section supplies a default type:

```yaml
actions:
  submit:
    label: Submit
```

compiles as:

```json
{
  "@id": "submit",
  "@type": "Action",
  "label": "Submit"
}
```

Explicit `type` is permitted when the target vocabulary contains that class:

```yaml
states:
  checkout:
    type: CompositeState
    label: Checkout
```

### Accessibility Grouping

Accessibility nodes are grouped under `accessible`:

```yaml
accessible:
  features:
    urn:feature:selected:
      accessibleFeatureName: selected
      accessibleFeatureValue: true
  relations:
    urn:relation:controls:
      accessibleRelationType: controls
      targetLocatorRef: urn:locator:target
  locators:
    urn:locator:submit:
      role: button
```

Sugared authoring uses this grouping. Strict reverse projection currently emits accessibility nodes as literal `nodes:` entries rather than grouping them.

### Extensions

Project-private authoring sugar is registered in `EXTENSION_RULES`.

For example:

```yaml
surface:
  id: app-ready-surface
  touchpointRef: app
  sampleScreenRef: screens/app-ready.png
```

compiles into:

```json
{
  "extensions": {
    "https://openuji.org/ujg-yaml/extensions#sampleScreenRef": "screens/app-ready.png"
  }
}
```

Unregistered private data should be placed under namespaced `extensions` in canonical data.

## Target Vocabulary Maintenance

Update generated vocabulary after changing any locked context, ontology, SHACL, or target metadata:

```sh
pnpm -F @openuji/ujg-yaml run vocab:update
```

For the current `ed-2026-07-13` target, this command reads local locked artifacts from `specs/ed/...`. Run it from a checkout whose local ED files are intended to become the new lock.

For future immutable TR/snapshot targets, vocabulary generation should use the registered snapshot artifact locations instead of the local moving ED tree. Those generated vocabularies should still be committed with the package so runtime conversion remains deterministic.

Check that the generated vocabulary is up to date:

```sh
pnpm -F @openuji/ujg-yaml run vocab:check
```

Run full package checks:

```sh
pnpm -F @openuji/ujg-yaml check
```

The check command verifies:

- JavaScript syntax for `src/*.js` and `scripts/*.js`;
- deterministic generated vocabulary output.

Run tests:

```sh
pnpm -F @openuji/ujg-yaml test
```

## Diagnostics

The converter returns diagnostics instead of throwing for expected user-facing failures.

Common codes:

- `CONTEXT_NOT_LOCKED`: missing target, missing `ujgTarget`, stale target artifact lock, stale vocabulary lock, or an `ed-*` target whose required local checkout artifacts do not match the lock.
- `YAML_SYNTAX`: YAML parser failure.
- `DUPLICATE_KEY`: duplicate YAML key.
- `UNKNOWN_AUTHORING_TERM`: unknown section or property.
- `MISSING_ID`: addressable node missing an id.
- `ID_CONFLICT`: keyed map entry has a body-level `id` or `@id` that does not match its map key.
- `TYPE_CONFLICT`: unsupported target class.
- `DUPLICATE_ID`: duplicate canonical `@id`.
- `UNRESOLVED_REFERENCE`: local reference does not resolve after lifting.
- `LOSSY_PROJECTION`: canonical JSON-LD cannot be projected to the current YAML form without dropping data.
- `ROUND_TRIP_MISMATCH`: structural project/compile validation changed the normalized node set.

Diagnostic objects generally include:

```js
{
  code,
  severity,
  message,
  file,
  line,
  column,
  path,
  id,
  property,
  reference,
  remediation
}
```

Not every diagnostic currently has every field.

## Development Notes

The key design boundary is:

- Generated target vocabulary: facts derived from the locked UJG target.
- Projection registry: explicit YAML authoring decisions.

Do not add broad ontology facts back into `src/registry.js`. If a class, property, reference property, set property, module, or context URL is part of the UJG target, it should come from `targets/*.vocab.json`.

Do keep authoring sugar explicit in `src/registry.js`. The ontology does not know the YAML spelling, section shape, structural nesting rules, or private extension sugar.

## Fixtures

Example inputs live in:

- `fixtures/complex.yaml`
- `fixtures/auth.yaml`

These are useful for manual smoke tests:

```sh
pnpm -F @openuji/ujg-yaml exec ujg-yaml compile packages/ujg-yaml/fixtures/complex.yaml
pnpm -F @openuji/ujg-yaml exec ujg-yaml compile packages/ujg-yaml/fixtures/auth.yaml
```
