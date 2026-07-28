# UJG 1.0 Release Candidate 1

UJG 1.0 RC1 is the first release-candidate snapshot for the UJG 1.0 line. It is published under `/tr/1.0-rc1/` and is intended for final review, implementation trials, and vocabulary stabilization before UJG 1.0 Final.

Compared with the previous public snapshot, [`2026.06`](../2026.06/), RC1 expands the model from the initial Core, Graph, Runtime, Mapping, Metrics, and Experience-era draft into a broader Draft-quality specification set with an explicit 1.0 namespace line.

## Release Status

- Release tag: `v1.0-rc1`
- Snapshot path: `/tr/1.0-rc1/`
- Vocabulary namespace line: `/tr/1.0/ns/`
- Release maturity: release candidate
- Intended status: pre-release until UJG 1.0 Final is published

The `https://ujg.specs.openuji.org/tr/1.0/ns/` namespace identifies the UJG 1.0 vocabulary line. Until UJG 1.0 Final is published, release-candidate snapshots may update artifacts in this namespace. After UJG 1.0 Final, incompatible vocabulary changes require a new major-version namespace.

## Highlights Since 2026.06

- Added the `/tr/1.0-rc1/` release-candidate snapshot.
- Published UJG 1.0 vocabulary artifacts under `/tr/1.0/ns/`.
- Promoted all ED and RC1 specifications to at least Draft maturity.
- Added the top-level Surface specification.
- Added the Profiles specification as a Draft-quality conformance model.
- Reworked the older Experience/Surface split into Surface, Phase, and Experience Annotation.
- Added optional modules for Phase, Observability, Entry Binding, Effect, Artifact, and Experience Annotation.
- Updated Core, Graph, Runtime, Mapping, Metrics, Localization, Design System, Architecture, and Conformance around the RC1 module set.
- Regenerated JSON-LD contexts, Turtle ontologies, SHACL shapes, content manifests, and agent-pack skill outputs for the RC1 snapshot.
- Updated the web start page W3C Community Group pill so it links accessibly to `https://www.w3.org/community/ujg/`.

## Profiles

RC1 introduces UJG Profiles as named, out-of-band conformance bundles. A profile declares required UJG modules and required conformance classes. Profile claims are made through implementation statements, package manifests, HTTP or document metadata, registry entries, or product documentation.

A profile claim must not be inferred from JSON-LD content alone. Opaque Core `extensions` cannot satisfy missing module requirements and remain outside semantic profile claims.

Starter profile identifiers:

- `#core`: Core document container and addressable nodes.
- `#graph`: Core plus Graph topology.
- `#surface-runtime`: Core, Graph, Surface, and Runtime.
- `#mapping-metrics`: Core, Graph, Surface, Runtime, Mapping, and Metrics.
- `#localized-observability`: Core, Graph, Surface, Localization, and Observability.
- `#design-system`: Core, Graph, Surface, and Design System.
- `#automation-resources`: Core, Graph, Surface, Phase, Observability, Entry Binding, Effect, and Artifact, including each module's dependency closure.

Profiles remain out-of-band for v1. RC1 does not add profile JSON-LD terms, context documents, ontology terms, or SHACL artifacts.

## Module Changes

### Surface

Surface is now a top-level module. It provides the structural layer for states, components, controls, and UI-facing resources that other modules can reference.

### Phase

Phase is introduced as an optional module for grouping journey progression and experience stages without keeping the previous top-level Experience module shape.

### Experience Annotation

Experience Annotation preserves annotative experience concepts as an optional module layered on Core, Graph, and Phase.

### Observability

Observability adds observation bindings and event-oriented metadata for connecting modeled journeys to instrumentation and evidence.

### Entry Binding

Entry Binding adds explicit entry-point binding semantics for associating external entry surfaces, routes, or triggers with graph nodes.

### Effect

Effect adds a structured way to describe intended or observed effects associated with transitions and surface/resource interactions.

### Artifact

Artifact adds resource-oriented metadata for artifacts used or produced by automated journeys and effect flows.

## Maturity Updates

The following specifications are Draft in RC1 and the Editor's Draft:

- Profiles
- Artifact
- Effect
- Entry Binding

No `incubating` maturity labels remain under `specs/ed` or `specs/tr/1.0-rc1`.

## Generated Artifacts

RC1 includes refreshed generated artifacts for the updated module set:

- Content manifests for changed specifications.
- JSON-LD contexts for vocabulary-bearing modules.
- Turtle ontologies for vocabulary-bearing modules.
- SHACL shapes for validation-bearing modules.
- Agent-pack outputs and accepted generated skill reviews for changed root targets.

## Validation

The RC1 work was checked with:

```sh
pnpm content-manifests:check
pnpm --filter @openuji/web lint
pnpm --filter @openuji/web build
pnpm agent-pack:update
pnpm agent-pack:check
pnpm agent-pack:validate
pnpm agent-pack:test
```

Additional acceptance checks confirmed that the Profiles pages render for `/ed/profiles` and `/tr/1.0-rc1/profiles`, and that the starter profile fragment anchors exist in both ED and RC1 output.

## Notes For Implementers

This is a release candidate, not UJG 1.0 Final. Implementers should treat RC1 as stable enough for integration trials, compatibility checks, vocabulary review, and feedback, while allowing for final adjustments before the 1.0 Final snapshot.
