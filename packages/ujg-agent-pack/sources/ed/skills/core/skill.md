# UJG ED Core Modeling

Use this skill together with `ujg-ed-modeling`. Do not use it as a replacement for the parent modeling skill.

## Source of truth

Use the active Editor's Draft unless the user explicitly asks for a dated snapshot:

`https://ujg.specs.openuji.org/ed/core`

Generate only terms defined by the active ED Core context unless the user explicitly requests an extension.

## Scope

Core defines the document container and shared addressable-node mechanism.

Core does not define journeys, states, transitions, runtime traces, experience annotations, localization metadata, surfaces, or design-system realization. Use module contexts for module-specific terms.

## Context

Every compact UJG JSON-LD document must include Core context:

```json
"https://ujg.specs.openuji.org/ed/ns/core.context.jsonld"
```

Compose it with module contexts only when their terms are used:

```json
[
  "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld"
]
```

## Vocabulary

Use only these Core classes:

```text
UJGDocument
Node
```

Use only these Core properties:

```text
imports
nodes
extensions
```

Do not invent Core terms such as:

```text
specVersion
metadata
title
description
createdAt
updatedAt
version
modules
graph
states
runtime
contextRefs
extension
```

Use non-Core terms only when a defined module or explicit project extension provides them.

## UJGDocument and nodes

Use `UJGDocument` as the root document container.

Give the document a stable IRI `@id`.

Put all addressable modeled objects in top-level `nodes`.

Give each node a stable IRI `@id`.

Do not nest addressable objects inside custom properties. Put them in `nodes` and reference them by IRI.

Do not place graph topology, runtime facts, design-system bindings, localization metadata, or app metadata directly on `UJGDocument` unless a defined module term permits it.

## imports

Use `imports` only to reference other UJG documents.

`imports` values are IRI references. Relative imports resolve against the importing document location.

Use imports for UJG document modularization, not for graph traversal, navigation, runtime loading, package discovery, or component imports.

## extensions

Use `extensions` only on nodes.

Do not put `extensions` on `UJGDocument`.

`extensions` must be a JSON object.

Use namespaced top-level extension keys, preferably reverse-DNS or URI-like.

Do not hide interoperable UJG semantics in `extensions`.

If a concept affects traversal, target resolution, validation, graph meaning, localization, runtime interpretation, surface binding, or design-system realization, use a defined module term or define a proper extension module.

Consumers must not let unknown extensions affect Core identity, import resolution, or standardized reference resolution.

## Checks before answering

* Is Core context included?
* Are extra contexts included only for terms actually used?
* Is the root object a `UJGDocument`?
* Does the document have a stable IRI `@id`?
* Are addressable objects in top-level `nodes`?
* Do nodes have stable IRI `@id` values?
* Are `imports` only UJG document IRI references?
* Are `extensions` used only on nodes?
* Is every `extensions` value a JSON object?
* Did I avoid invented Core terms?
* Did I avoid hiding module semantics inside Core or `extensions`?
