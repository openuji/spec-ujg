## Overview

This page is informative. It describes the preferred authoring style for the current Editor's Draft:
**nested YAML-LD, explicit identities, and shared resources connected by references**. Core defines
membership and imports; each module defines the meaning of its relationships.

JSON-LD remains available beside every example. Flat documents using the current vocabulary are
valid, but an exhaustive `nodes` inventory is unnecessary.

## Start With a Journey

List root and standalone definitions in `nodes`. Embed locally defined entries, states, transitions,
and exits under their owning Journey. Keep connection endpoints such as `from`, `to`, `state`,
`toEntry`, and `fromExit` as IRI references. A nested `states` relationship expresses Journey
membership because Graph defines that relationship; indentation does not add another meaning.

```ujg-example
./examples/example-01.yamlld
```

Every locally defined node is discovered regardless of depth. Do not write `members`, or repeat
embedded definitions in `nodes` solely to establish document membership.

## Shared Definitions and File Organization

Embed a definition where it has one clear local home. Put a shared command, reusable child Journey,
or other shared definition in `nodes` once and refer to it from its users. Use `subjourneys` only
for Graph composition, not as a general folder structure.

Journey-oriented packages can keep one coherent flow per file. Module-oriented packages can keep
Surface, Runtime, or Design System definitions in separate documents. Import the documents needed
to resolve references; a reference alone does not load its target document. A StateCollection and
its member State must both be locally defined in one source document.

Optional modules keep their own constraints. For example, a DataSchema points to an external JSON
Schema; nesting does not permit embedding that schema into the UJG node. Opaque `extensions` and
Runtime `payload` stay JSON values and do not contribute modeled node definitions.

## Nesting Across Modules

These are authoring recommendations, not additional ownership rules. Shared definitions keep one
identity and may remain standalone even when an example embeds a local definition.

| Module | Embed locally defined components | Usually keep as references |
| --- | --- | --- |
| Graph | `entries`, `states`, `transitions`, `exits`, local `subjourneys`; local `command`, `condition`, `effect` | `from`, `to`, `toEntry`, `fromExit`, shared entry selectors and child Journeys |
| Mapping | `mappedSteps` | Runtime events, mapped Journey and States, explaining transitions |
| Observability | `locators`, `accessibleFeatures`, `accessibleRelations`, local required modality profiles | Shared locators, relation targets, localized copy, Surface bindings |
| Operability | `materializationSteps` | `previousStep`, locator targets, source State, modality and movement-kind individuals |
| Design System | `slots`, `slotBindings`, local token sources | Shared Components and Templates, `materializedSurface`, slot targets |
| Data Contract | A local `dataSchema` wrapper | External JSON Schema through `dataSchemaSource`; Surface bindings |
| Effect and Artifact | Local effect declarations and unshared produced/consumed resource definitions | Shared resources, Touchpoints, localized names |
| Localization | Local copy metadata when it has one clear home | Shared MessageMeta and Locale; standalone Messages |
| Surface, Runtime, and Phase | Local definitions where an existing node-valued relationship permits them | Cross-layer Graph/Surface links, causal predecessors, Phase associations |

## Anchors and Aliases

YAML anchors can reduce repeated IRI strings. Prefer scalar anchors such as `id: &cart "#cart"`
and a later `from: *cart`. The anchor name is not the node's identity: the explicit IRI is.
Anchors are local to a YAML document and cannot replace imports or forward IRI references.

Keep fragment identifiers quoted: an unquoted `#cart` starts a YAML comment. Comments, anchor names,
indentation choices, and mapping-key order do not add UJG semantics. Cyclic YAML object aliases are
invalid, while cycles formed by ordinary UJG IRI references are governed by the relevant module.

## Source Location and Semantic Base

A source URL tells a loader where a document was retrieved. A semantic base tells JSON-LD how to
resolve node identities and ordinary references. They serve different purposes.

Relative `imports` always use the source location. A local `@base` changes node-reference resolution
and does not move the imports. Preserve the source location and semantic base of every imported
resource independently.

External artifact locations follow their owning module's rules: Design System `TokenSource.source`
uses source location, while Data Contract `dataSchemaSource` uses the semantic base.

When changing a filename from `.jsonld` to `.yamlld`, a relative `id: "#cart"` would otherwise acquire
a different absolute IRI. Keep a stable semantic base, as in the example above, or use absolute node
identifiers. Sharing a semantic base does not make two differently located files one membership
scope.

## Canonical Terms and Modules

Use the canonical property names from each module's published context. The RDF property local name
matches its authoring term: for example, `states` maps to `graph#states`. Removed terms and previous
ED contexts are not supported by the current ED.

Compose Core with the contexts needed for the modules used. The base convenience aggregate includes
Core, Graph, Surface, and Runtime; it does not silently enable every optional module. The complete
machine-readable authoring term catalog is published at
`https://ujg.specs.openuji.org/ed/ns/authoring-terms.json`.

Normative context/schema files remain JSON, and ontology/shape files remain Turtle. Only document
and node example presentation changes between the YAML-LD and JSON-LD tabs.
