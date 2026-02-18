## Overview

This specification defines a mandatory envelope for all **User Journey Graph (UJG)** files. It establishes a uniform wire protocol allowing any consumer to parse headers and enumerate contained objects, independent of the specific module types (e.g., Journey, State, Transition) contained within.

---

## Terminology

* <dfn>UJGDocument</dfn>: A JSON-LD bundle that serves as the container for the graph data.
* <dfn>Node</dfn>: The atomic addressable object in UJG.

## General Requirements

> The keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [[!RFC2119]] and [[!RFC8174]].

### File Format {data-cop-concept="file-format"}

* <spec-statement>**Encoding:** Data **MUST** be valid [[JSON]] encoded in UTF-8.</spec-statement>
* <spec-statement>**Compliance:** Data **MUST** be valid [[JSON-LD 1.1.]].</spec-statement>

### Document Structure {data-cop-concept="data-structure"}

<spec-statement>
* **Root Object:** The root of the file **MUST** be a valid single `UJGDocument` bundle.

* **Context**: The root **MUST** include a `@context` object defining:
  * `id` aliased to `@id`
  * `type` aliased to `@type`
  * `items` aliased to `@graph`
  * A vocabulary (via `@vocab` or prefix like `ujg:`) ensuring types are resolvable (e.g., `Journey` or `ujg:Journey`).
  
* **Payload:** The `items` property **MUST** contain every [=Node=] in the document.
* **Flat Binding**: 
  * A reference to another Node **MUST** be expressed as either:
    * a string equal to the target [=Node=]’s `id`, or
    * a JSON object that is a [=Node=].
  * The referenced id **MUST** resolve to exactly one Node within the current resolution scope (including imports).
</spec-statement>

### Node Integrity and Uniqueness {data-cop-concept="uniqueness"}

* <spec-statement>**Identity:** Every Node in `items[]` **MUST** possess:
  * `type`: A non-empty string.
  * `id`: A non-empty string representing a valid URI/URN.</spec-statement>
* <spec-statement>**Uniqueness:** No two Nodes within a single document **MAY** share the same `id`.</spec-statement>
* <spec-statement>**Reserved Keys:** The keys reserved for system use `@context`, `type`, `id`, `meta`, `extensions`, `specVersion`, `items`, `imports` **MUST NOT** be used.</spec-statement>

---

## The Universal Node {#node data-cop-concept="node"}

Every object inside `items` is a [=Node=].

### Node

<spec-statement>It **MUST** satisfy the following schema:

| Field | Requirement | Description |
| --- | --- | --- |
| `type` | `required` | The object class (e.g., `Journey`, `State`). |
| `id` | `required` | Unique URI/URN identifier. |
| `meta` | `optional` | Metadata object (versioning, timestamps). |
| `extensions` | `optional` | Use case and/or Vendor-specific data. |
 </spec-statement>

### Node Reference

<dfn>Node Reference</dfn>: A JSON object used to reference a Node without embedding it.

<spec-statement>
A Node Reference have to satisfy:

  * It **MUST** contain id (a non-empty string representing a valid URI/URN).
  * It **MAY** contain type.
  * It **MUST NOT** contain any other keys.
</spec-statement>

### Handling Meta & Extensions
<spec-statement>
* **Timestamps:** Any timestamp within `meta` **MUST** adhere to [[RFC3339]] with timezone information (e.g., `Z` or `+01:00`).
* **Extensions** (if present):
  * **Structure:** `extensions` **MUST** be a Map (represented as a [§#example-node|JSON object]).
  * **Key:** Every key in the map **MUST** be a string representing a unique namespace (e.g., reverse-DNS notation).
* **Value**: The value for every key **MUST** be a JSON object.
</spec-statement>



### Example Node

```json
{
  "type": "ExampleNode",
  "id": "urn:ujg:journey:checkout",
  "meta": {
    "created": "2026-02-11T12:00:00Z"
  },
  "extensions": {
    "io.security.audit": {
      "checksum": "sha256:abc1234..."
    }
  }
}

```
---

## The Root Object (The Envelope) {data-cop-concept="root"}

The Root Object acts as the container for the graph data and is defined by [=UJGDocument=].

### UJGDocument

<spec-statement>It **MUST** satisfy the following schema:

| Field | Requirement | Description |
| :--- | :--- | :--- |
| `@context` | `required` | JSON-LD context definitions. |
| `type` | `required` | Must be `"UJGDocument"`. |
| `specVersion` | `required` | The version of the UJG Core spec (e.g., `"1.0"`). |
| `items`| `required` | An array of **Universal Nodes**. |
| `imports` | `optional` | Import declarations for additional UJGDocument resources. |
</spec-statement>

### Document Imports {data-cop-concept="imports"}

<spec-statement>A UJGDocument MAY declare dependencies on other UJGDocument resources via `imports`.</spec-statement>

* <spec-statement>If present, `imports` **MUST** be an array.</spec-statement>
* <spec-statement>Each entry in `imports` **MUST** be a valid URI.</spec-statement>

### Document Resolution (Processing Model) {data-cop-concept="resolution"}

Consumers may process multiple UJGDocument files as a single logical graph.
<spec-statement>
* A Consumer validating references across documents **MUST** treat the union of all loaded documents’ `items[]` arrays as a single resolution set.
* If `imports` is present, a Consumer performing full resolution **SHOULD** attempt to load each referenced import.
* If an imported document cannot be loaded, a Consumer performing full resolution **MUST** report unresolved references.
* A Consumer performing full resolution **MUST** detect import cycles.
* A Consumer **MUST** terminate resolution when an import cycle is detected.
</spec-statement>


### Example Envelope

```json
{
  "@context": "https://ujg.specs.openuji.org/ed/context.jsonld",
  "type": "UJGDocument",
  "specVersion": "1.0",
  "imports": [
    "https://example.com/ujg/graph-shard.json",
    "https://example.com/ujg/runtime-shard.json"
  ],
  "items": [
    {
      "type": "ExampleNode",
      "id": "urn:ujg:example:node:a",
      "thingRef": {
        "id": "urn:ujg:example:thing:b",
        "type": "ExampleThing"
      },
      "meta": {
        "created": "2026-02-16T10:26:58Z"
      }
    },
    {
      "type": "ExampleThing",
      "id": "urn:ujg:example:thing:b",
      "extensions": {
        "com.example.vendor": {
          "note": "Unknown fields are allowed by Core; successor specs may define semantics."
        }
      }
    }
  ]
}

```
