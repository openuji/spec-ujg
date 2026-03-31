## Overview

This module defines the shared Core artifacts for UJG documents.

The Core module is published under `https://ujg.specs.openuji.org/ed/ns/`. Implementations should use these canonical URLs when referencing the Core vocabulary, JSON-LD context, and SHACL validation shape.

The Core module consists of:

- `core.ttl`: the ontology for Core classes and properties, published at `https://ujg.specs.openuji.org/ed/ns/core`
- `core.context.jsonld`: the JSON-LD context for compact JSON-LD documents, published at `https://ujg.specs.openuji.org/ed/ns/core.context.jsonld`
- `core.shape.ttl`: the SHACL shape used for Core validation, published at `https://ujg.specs.openuji.org/ed/ns/core.shape`

## Terminology

- <dfn>UJGDocument</dfn>: The Core document class for a JSON-LD bundle.
- <dfn>Node</dfn>: The base Core class for addressable objects that may appear in `nodes`.

## Ontology {data-cop-concept="ontology"}

The normative Core ontology is defined in the Turtle document below and is published at `https://ujg.specs.openuji.org/ed/ns/core`. It declares the `UJGDocument` and `Node` classes together with the Core properties used by this module.

:::include ./core.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Core JSON-LD context is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/core.context.jsonld`. Examples in this section use the compact terms from this context, including `@id`, `@type`, `specVersion`, `imports`, `nodes`, and `extensions`.

:::include ./core.context.jsonld :::

### Context Composition

<spec-statement>A compact UJG JSON-LD document **MUST** include the Core JSON-LD context.</spec-statement>

<spec-statement>A specification that defines compact terms not defined by Core **MUST** normatively identify the published URL of the JSON-LD context that defines those terms.</spec-statement>

<spec-statement>A compact UJG JSON-LD document that uses terms not defined by Core **MUST** compose the Core context with the published contexts that define those terms.</spec-statement>

<spec-statement>When a compact UJG JSON-LD document uses terms not defined by Core, its `@context` **MUST** reference the published URLs of the contexts that define those terms.</spec-statement>

<spec-statement>Specifications or deployments **MAY** publish convenience aggregate contexts that compose the Core context with additional contexts, but such aggregate contexts are outside the scope of Core.</spec-statement>

A composed context is expressed as a JSON-LD `@context` array in which the Core context appears together with one or more additional contexts required by the document and published at `https://ujg.specs.openuji.org/ed/context.jsonld`

#### Composed Context Example
```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/runtime.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/experience.context.jsonld"
  ]
}
```

### Extensions

<spec-statement>`extensions` **MAY** appear on any [=Node=].</spec-statement>

<spec-statement>`extensions` **MUST NOT** appear on [=UJGDocument=].</spec-statement>

<spec-statement>If present, `extensions` **MUST** be a JSON object.</spec-statement>

<spec-statement>Each top-level key in `extensions` **MUST** be a namespace string controlled by the extension author. Authors **SHOULD** use reverse-DNS names or URI-based identifiers.</spec-statement>

<spec-statement>Each top-level value in `extensions` **MUST** be a JSON object.</spec-statement>

<spec-statement>Consumers **MUST** preserve unknown extension entries during read-transform-write unless operating in an explicitly lossy mode.</spec-statement>

<spec-statement>Consumers **MUST NOT** let unknown extensions affect core identity, import resolution, or reference resolution.</spec-statement>

<spec-statement>Consumers **MAY** apply namespace-specific processing for recognized extensions.</spec-statement>

<spec-statement>Extensions that change core graph meaning **SHOULD** be standardized as first-class UJG modules rather than hidden inside `extensions`.</spec-statement>

### Import Resolution

<spec-statement>`imports` values **MUST** be IRI references.</spec-statement>

<spec-statement>An `imports` value **MAY** be an absolute IRI or a relative IRI reference.</spec-statement>

<spec-statement>Relative import references **MUST** be resolved against the location of the importing [=UJGDocument=].</spec-statement>

<spec-statement>For a document retrieved via HTTP(S), the base for resolution is the document URL. For a document loaded from a file URL, the base for resolution is the file URL of the importing document.</spec-statement>

<spec-statement>Core does not define a manifest root, package root, or workspace root for import resolution.</spec-statement>

<spec-statement>If no stable document location is available, relative imports are implementation-specific and may not be portable.</spec-statement>

> Note: JSON-LD defines a base IRI mechanism, including local `@base`, but Core import resolution is defined by the importing document location. External contexts do not apply `@base`, and relative references are only reliable when a base is well defined. See [[JSON-LD 1.1.]].

> Note: Authors **SHOULD** prefer relative import references for intra-package documents so the same document set can be moved between local development and deployed environments without changing import values, provided the relative directory layout is preserved.

## Validation {data-cop-concept="validation"}

The normative Core SHACL shape is defined below and is published at `https://ujg.specs.openuji.org/ed/ns/core.shape`. It constrains [=UJGDocument=] and [=Node=] instances and is the validation artifact for Core semantics.

:::include ./core.shape.ttl :::

## Examples {.unnumbered}

The examples below are informative. Each example uses `https://ujg.specs.openuji.org/ed/ns/core.context.jsonld` as its JSON-LD context and stays within the Core vocabulary. `extensions` appears only on node objects; document-level `extensions` is invalid in Core.

### Minimal Document

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
  "@id": "https://example.com/ujg/core/minimal.jsonld",
  "@type": "UJGDocument",
  "specVersion": "1.0"
}
```

### Document With Relative Imports

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
  "@id": "https://example.com/ujg/flows/order/main.jsonld",
  "@type": "UJGDocument",
  "specVersion": "1.0",
  "imports": [
    "./shared/states.jsonld",
    "../runtime/events.jsonld",
    "https://example.com/ujg/common/errors.jsonld"
  ]
}
```

Resolved imports:

- `./shared/states.jsonld` → `https://example.com/ujg/flows/order/shared/states.jsonld`
- `../runtime/events.jsonld` → `https://example.com/ujg/flows/runtime/events.jsonld`
- `https://example.com/ujg/common/errors.jsonld` → unchanged

This follows [[RFC3986]] relative-reference resolution and the [[JSON-LD 1.1.]] rule that relative IRI references resolve from the document base IRI.

### Document With Nodes

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
  "@id": "https://example.com/ujg/core/nodes.jsonld",
  "@type": "UJGDocument",
  "specVersion": "1.0",
  "nodes": [
    {
      "@id": "urn:ujg:node:alpha",
      "@type": "Node"
    },
    {
      "@id": "urn:ujg:node:beta",
      "@type": "Node",
      "extensions": {
        "com.example.audit": {
          "checksum": "sha256:abc123"
        }
      }
    }
  ]
}
```
