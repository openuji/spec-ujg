## Overview

This specification defines a mandatory envelope for all **User Journey Graph (UJG)** files. It establishes a uniform wire protocol allowing any consumer to parse headers and enumerate contained objects, independent of the specific module types (e.g., Journey, State, Transition) contained within.

---

## General Requirements

> The keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [[!RFC2119]] and [[!RFC8174]].

### File Format {data-cop-concept="file-format"}

* <spec-statement>**Encoding:** Data **MUST** be valid [[JSON]] encoded in UTF-8.</spec-statement>
* <spec-statement>**Compliance:** Data **MUST** be valid [[JSON-LD 1.1.]].</spec-statement>

### Document Structure {data-cop-concept="data-structure"}

* <spec-statement>**Root Object:** The root of the file **MUST** be a valid single `UJGDocument` bundle.</spec-statement>
* <spec-statement>**Context**: The root **MUST** include a `@context` object defining:
  * `id` aliased to `@id`
  * `type` aliased to `@type`
  * `items` aliased to `@graph`
  * A vocabulary (via `@vocab` or prefix like `ujg:`) ensuring types are resolvable (e.g., `Journey` or `ujg:Journey`).
  </spec-statement>
* <spec-statement>**Payload**: The `items` property **MUST** be an array of Nodes. This array represents the JSON-LD graph.</spec-statement>

### Node Integrity and Uniqueness {data-cop-concept="uniqueness"}

* <spec-statement>**Identity:** Every Node in `items[]` **MUST** possess:
  * `type`: A non-empty string.
  * `id`: A non-empty string representing a valid URI/URN.</spec-statement>
* <spec-statement>**Uniqueness:** No two Nodes within a single document **MAY** share the same `id`.</spec-statement>
* <spec-statement>**Reserved Keys:** The keys `@context`, `type`, `id`, `meta`, `extensions`, `specVersion`, and `items` are reserved for system use.</spec-statement>

---

## The Root Object (The Envelope) {data-cop-concept="root"}

The Root Object acts as the container for the graph data and is defined by [=UJGDocument=].

### UJGDocument

<dfn>UJGDocument</dfn>: A JSON-LD bundle that serves as the container for the graph data. 
<spec-statement>It **MUST** satisfy the following schema:

| Field | Requirement | Description |
| :--- | :--- | :--- |
| `@context` | `required` | JSON-LD context definitions. |
| `type` | `required` | Must be `"UJGDocument"`. |
| `specVersion` | `required` | The version of the UJG Core spec (e.g., `"1.0"`). |
| `items`| `required` | An array of **Universal Nodes**. |
</spec-statement>

### Example Envelope

```json
{
  "@context": {
    "@vocab": "[https://ujg.specs.openuji.org/ns#](https://ujg.specs.openuji.org/ns#)",
    "id": "@id",
    "type": "@type",
    "items": "@graph"
  },
  "type": "UJGDocument",
  "specVersion": "1.0",
  "items": [
    {"type": "Journey", "id": "urn:ujg:journey:checkout"},
    {"type": "State", "id": "urn:ujg:state:cart"}
  ]
}

```

---

## The Universal Node {#node data-cop-concept="node"}

Every object inside `items` is a [=Node=].

### Node

<dfn>Node</dfn>: The first-level unit of the graph.
<spec-statement>It **MUST** satisfy the following schema:

| Field | Requirement | Description |
| --- | --- | --- |
| `type` | `required` | The object class (e.g., `Journey`, `State`). |
| `id` | `required` | Unique URI/URN identifier. |
| `meta` | `optional` | Metadata object (versioning, timestamps). |
| `extensions` | `optional` | Use case and/or Vendor-specific data. |
 </spec-statement>

### Handling Meta & Extensions

* <spec-statement>**Timestamps:** Any timestamp within `meta` **MUST** adhere to [[RFC3339]] with timezone information (e.g., `Z` or `+01:00`).</spec-statement>
* **Extensions** (if present):
* <spec-statement>**Structure:** `extensions` **MUST** be a Map (represented as a [§#example-node|JSON object]).</spec-statement>
* <spec-statement>**Key:** Every key in the map **MUST** be a string representing a unique namespace (e.g., reverse-DNS notation).</spec-statement>
* <spec-statement>**Value**: The value for every key **MUST** be a JSON object.</spec-statement>



### Example Node

```json
{
  "type": "Journey",
  "id": "urn:ujg:journey:checkout",
  "meta": {
    "created": "2026-02-11T12:00:00Z",
    "version": "v1.2"
  },
  "extensions": {
    "io.security.audit": {
      "checksum": "sha256:abc1234..."
    }
  }
}

```
