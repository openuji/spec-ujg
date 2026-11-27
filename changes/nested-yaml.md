Yes. I would specify the nested representation, but distinguish carefully between **normative serialization requirements** and **recommended authoring conventions**.

UJG should standardize enough that different implementations can reliably consume, produce and exchange nested YAML-LD documents, without inventing another serialization language or enforcing an unnecessarily rigid document structure.

Simply adding YAML-LD examples alongside JSON-LD examples would not be sufficient.

## **1. What should be specified?**

| Aspect                                 | Specification level    |
| -------------------------------------- | ---------------------- |
| YAML-LD serialization support          | Normative              |
| Semantic equivalence with JSON-LD      | Normative              |
| Embedded node definitions              | Normative              |
| Node identity and reference resolution | Normative              |
| Document membership                    | Normative              |
| Import processing                      | Normative              |
| Compact context aliases                | Normative              |
| YAML anchors and aliases               | Normative support      |
| Preferred nesting structure            | Recommended            |
| Journey-oriented file organization     | Informative            |
| Module-oriented file organization      | Informative            |
| Formatting and naming conventions      | Informative            |
| YAML-LD and JSON-LD examples           | Informative            |
| Conformance test cases                 | Normative requirements |

## **2. Where it belongs in the existing UJG specification**

I would extend the existing specification structure rather than introduce another functional module.

**Core**

Serialization formats, embedded nodes, document identity, membership, imports and context composition.

Extend

**Conformance**

Serialization-independent validation, supported formats and semantic equivalence tests.

Extend

**Graph and other modules**

Compact term aliases, module-specific embedding recommendations and YAML-LD examples.

Extend

**Authoring Guidelines**

Recommended document organization, nesting patterns, anchors, imports and practical examples.

New

The existing [Core specification](https://github.com/openuji/spec-ujg/blob/main/specs/ed/core/index.md?utm_source=chatgpt.com) and [Conformance specification](https://github.com/openuji/spec-ujg/blob/main/specs/ed/conformance/index.md?utm_source=chatgpt.com) already provide most of the architectural foundation.

## **3. Core: Serialization formats**

Add a normative section defining supported serializations.

|                       | JSON-LD               | YAML-LD                       |
| --------------------- | --------------------- | ----------------------------- |
| Specification         | JSON-LD 1.1           | YAML-LD 1.0                   |
| Extension             | `.jsonld`             | `.yamlld`                     |
| Media type            | `application/ld+json` | `application/ld+yaml` (draft) |
| Flat representation   | Supported             | Supported                     |
| Nested representation | Supported             | Supported                     |
| Primary use           | Interchange           | Human authoring               |

YAML-LD should reference the W3C specification rather than redefine YAML processing. The latest published YAML-LD Working Draft, dated October 24, 2026, already defines anchors, aliases, scalar resolution, JSON-LD conversion and file extensions.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.w3.org\&sz=32)

w3.org+2



For UJG, I would additionally recommend restricting each file to one `UJGDocument` root initially, even though YAML-LD itself permits document streams.

## **4. Core: Nested node representation**

This is the most important addition.

I would explicitly define that a node-valued property can contain either an IRI reference or an embedded node definition, subject to the constraints of the respective module.

**Referenced representation:**

```
stateRefs:
  - "#cart"
  - "#payment"
```

**Embedded representation:**

```
stateRefs:
  - "@id": "#cart"
    "@type": State
    label: Shopping cart

  - "@id": "#payment"
    "@type": State
    label: Payment
```

**Mixed representation:**

```
stateRefs:
  - "@id": "#cart"
    "@type": State
    label: Shopping cart

  - "./shared-states.yamlld#payment"
```

All three should be supported when their resolved nodes satisfy the module's constraints.

The underlying mechanism is already part of JSON-LD's node-object representation. UJG does not need to invent embedding semantics.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.w3.org\&sz=32)

w3.org+1



### **Proposed normative requirements**

- Addressable embedded nodes MUST retain their explicit IRI identity.
- Consumers MUST resolve embedded definitions and references consistently.
- Nesting MUST NOT introduce implicit execution or ordering semantics.
- Embedding MUST NOT override module-specific semantic constraints.
- Referencing a node MUST NOT require that its definition appears earlier in the document, except where YAML alias syntax itself requires it.

## **5. Core: Document membership**

This is the one area where I would make a deliberate architectural decision before migrating.

Currently, `nodes` maps to the RDF property `ujg:documentNodes`.

Consider:

```
nodes:
  - id: "#checkout"
    type: Journey

    states:
      - id: "#cart"
        type: State
```

The resulting semantic relationships are:

The direct documentNodes relationship to the embedded State is not automatically generated by JSON-LD nesting.

There are two possible approaches:

| Approach                | Consequence                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| Explicit node inventory | Preserve existing membership triples, potentially requiring redundant references.                       |
| Root-oriented documents | Allow `nodes` to identify root definitions without requiring an exhaustive inventory of embedded nodes. |

I would lean towards **root-oriented documents**, provided no existing processing requirement depends on exhaustive `documentNodes` membership.

However, this must be an explicit semantic decision. Removing existing membership triples is not strictly a lossless serialization conversion.

## **6. Module-specific nesting recommendations**

I would not define one giant normative nesting schema. Instead, each module should recommend how its own concepts are embedded.

For Graph:

| Parent         | Property          | Preferred representation |
| -------------- | ----------------- | ------------------------ |
| Journey        | `states`          | Embedded                 |
| Journey        | `transitions`     | Embedded                 |
| Journey        | `entries`         | Embedded                 |
| Journey        | `exits`           | Embedded                 |
| CompositeState | `subjourneys`     | Embedded or referenced   |
| State          | Entry transitions | Embedded or referenced   |
| Transition     | `from`            | Reference                |
| Transition     | `to`              | Reference                |
| Transition     | Command           | Embedded or referenced   |

The general rule is:

**Embed locally defined components; reference shared components and graph connections.**

This makes nested authoring predictable without restricting the expressiveness of RDF.

## **7. Context improvements**

I would consider readable compact terms part of the migration, not merely cosmetic improvements.

```
{
  "@context": {
    "id": "@id",
    "type": "@type",
    "states": {
      "@id": "ujggraph:stateRefs",
      "@type": "@id",
      "@container": "@set"
    },
    "transitions": {
      "@id": "ujggraph:transitionRefs",
      "@type": "@id",
      "@container": "@set"
    }
  }
}
```

This illustrative context fragment assumes the existing `ujggraph` prefix definition.

I would place these aliases in the respective module contexts rather than create a separate vocabulary. Existing terms would remain valid for compatibility.

The composed context would need to be tested for naming collisions across modules.

## **8. Authoring Guidelines**

This should be a dedicated informative specification page.

It would establish the preferred document authoring style:

```
"@context": https://ujg.specs.openuji.org/ed/ns/context.jsonld

id: ""
type: UJGDocument

imports:
  - ../../shared/commands.yamlld

nodes:
  - id: "#checkout"
    type: Journey
    label: Checkout

    states:
      - id: &cart "#cart"
        type: State
        label: Shopping cart

      - id: &payment "#payment"
        type: State
        label: Payment

    entries:
      - id: &start "#start"
        type: JourneyEntry
        state: *cart

    defaultEntry: *start

    transitions:
      - id: "#proceed"
        type: Transition
        from: *cart
        to: *payment
```

The guidelines would cover nesting, anchors, naming, cross-document references, journey directories, separation by module and reuse through imports.

The specification should also clarify that anchor names, indentation, comments and mapping key order do not introduce semantic information. YAML-LD already establishes this principle.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.w3.org\&sz=32)

w3.org+1



## **9. Import processing**

Since imports will become central to UJG authoring, I would strengthen the normative processing model.

**Load root document**

JSON-LD or YAML-LD

**Resolve recursive imports**

Preserve document URLs, detect cycles, deduplicate

**Interpret each document**

Resolve YAML aliases, contexts and relative IRIs

**Compose semantic graphs**

Resolve node identities and imported references

**Validate**

Existing module ontologies and SHACL shapes

Import handling should explicitly cover transitive imports, mixed JSON-LD/YAML-LD imports, cyclic dependencies, unresolved imports, conflicting definitions and base IRI handling.

Import discovery may itself require parsing and interpreting the importing document. The diagram represents conceptual stages rather than a strict implementation algorithm.

I would also distinguish standalone file validation from validation of the complete imported document closure.

## **10. Examples in the specification**

I would provide alternative representations using format tabs rather than display both formats simultaneously.

**State definition**

YAML-LDJSON-LD

```
id: "#cart"
type: State
label: Shopping cart
```

Illustration using the proposed compact context aliases.

YAML-LD should be the default visible format. JSON-LD remains available for developers who prefer it.

Ideally, both examples would be generated from the same semantic fixture to prevent documentation inconsistencies.

## **11. Conformance test suite**

I would consider this essential.

| Test                              | Expected result                             |
| --------------------------------- | ------------------------------------------- |
| Flat JSON-LD vs. flat YAML-LD     | Equivalent RDF                              |
| Nested JSON-LD vs. nested YAML-LD | Equivalent RDF                              |
| Flat vs. nested representation    | Equivalent RDF when membership is preserved |
| Scalar anchors vs. explicit IRIs  | Equivalent RDF                              |
| Legacy terms vs. new aliases      | Equivalent RDF                              |
| Mixed-format imports              | Successful resolution                       |
| Recursive imports                 | Successful resolution                       |
| Cyclic imports                    | Safe termination                            |
| Cyclic YAML object aliases        | Rejected                                    |
| Missing imported document         | Meaningful diagnostic                       |
| Invalid nested node type          | SHACL validation failure                    |

This ensures YAML-LD becomes a genuinely interoperable serialization, rather than merely an alternative documentation syntax.

## **12. Proposed specification structure**

My preferred target structure would be:

```
UJG Specification
│
├── Architecture
│
├── Core
│   ├── Document Model
│   ├── Node Identity
│   ├── Serialization
│   │   ├── JSON-LD
│   │   ├── YAML-LD
│   │   ├── Embedded Nodes
│   │   └── References
│   ├── Context Composition
│   ├── Document Membership
│   └── Document Imports
│
├── Graph
├── Surface
├── Runtime
├── Mapping
├── Optional Modules
│
├── Conformance
│   ├── Semantic Conformance
│   ├── Serialization Conformance
│   └── Test Suites
│
└── Authoring Guidelines
    ├── Nested Authoring
    ├── Anchors and Aliases
    ├── Journey Clustering
    ├── Module Clustering
    ├── Shared Definitions
    └── Complete Examples
```

These are proposed changes to the Editor's Draft, not existing requirements. The proposed aliases and example documents have not yet been implemented or validated.

## **My recommendation**

Keep the normative specification relatively small. Delegate as much as possible to YAML-LD, JSON-LD and SHACL.

Standardize what is specific to UJG: document composition, identity, membership, module relationships, compact terms and conformance.

Then use the Authoring Guidelines to establish a strong, opinionated default for how UJG documents should actually be written.

**One semantic model, two serialization formats, one preferred authoring style.**

That gives UJG a recognizable, consistent authoring experience without unnecessarily limiting its graph-based architecture.