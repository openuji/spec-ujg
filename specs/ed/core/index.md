## Overview

This module defines the shared Core artifacts for UJG documents.

The Core module consists of:

- `core.ttl`: the ontology for Core classes and properties
- `core.context.jsonld`: the JSON-LD context for compact JSON-LD documents
- `core.shape.ttl`: the SHACL shape used for Core validation

## Terminology

- <dfn>UJGDocument</dfn>: The Core document class for a JSON-LD bundle.
- <dfn>Node</dfn>: The base Core class for addressable objects that may appear in `nodes`.

## Ontology {data-cop-concept="ontology"}

The normative Core ontology is defined in the Turtle document below. It declares the `UJGDocument` and `Node` classes together with the Core properties used by this module.

:::include ./core.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Core JSON-LD context is defined below. Examples in this section use the compact terms from this context, including `@id`, `@type`, `specVersion`, `imports`, and `nodes`.

The current context does not define a compact term for `ujg:extensions`, so examples use the prefixed form when extension data is shown.

:::include ./core.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative Core SHACL shape is defined below. It constrains [=UJGDocument=] instances and is the validation artifact for Core semantics.

:::include ./core.shape.ttl :::

## Examples {.unnumbered}

The examples below are informative. Each example uses `./core.context.jsonld` as its JSON-LD context and stays within the Core vocabulary.

### Minimal Document

```json
{
  "@context": "./core.context.jsonld",
  "@id": "https://example.com/ujg/core/minimal.jsonld",
  "@type": "UJGDocument",
  "specVersion": "1.0"
}
```

### Document With Imports

```json
{
  "@context": "./core.context.jsonld",
  "@id": "https://example.com/ujg/core/importing.jsonld",
  "@type": "UJGDocument",
  "specVersion": "1.0",
  "imports": [
    "https://example.com/ujg/graph/base.jsonld",
    "https://example.com/ujg/runtime/events.jsonld"
  ]
}
```

### Document With Nodes

```json
{
  "@context": "./core.context.jsonld",
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
      "ujg:extensions": {
        "com.example.audit": {
          "checksum": "sha256:abc123"
        }
      }
    }
  ]
}
```
