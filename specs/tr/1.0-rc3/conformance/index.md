## Normative Artifacts

This specification defines conformance using the following normative artifacts:

- **Ontology/Vocabulary** (`*.ttl`) for class and property semantics.
- **SHACL Shapes** (`*.shapes.ttl`) for validation constraints.
- **JSON-LD Context** (`*.context.jsonld`) for JSON-LD term mappings and coercions.
- **JSON Schema** (`*.schema.json`) for document-extension payloads that are defined as opaque JSON
  rather than RDF vocabulary.

Implementations MAY operate on compacted JSON-LD directly, but conformance is defined in terms of the RDF semantics obtained by applying the normative JSON-LD context, composing the resulting data graph with the applicable ontology/vocabulary graph(s), and validating that graph against the normative SHACL shapes. JSON-LD defines term mappings, type coercion, containers, and expansion behavior through `@context`; SHACL defines validation over RDF graphs and shape constraints.

---

## Conformance classes

An implementation conforms to this specification if it satisfies the requirements of one or more of the following conformance classes:

1. **Producer**
   - Generates JSON-LD documents that conform to the normative JSON-LD context and satisfy the normative SHACL constraints after JSON-LD interpretation and applicable ontology/vocabulary composition.

2. **Consumer**
   - Accepts JSON-LD documents and interprets them according to the normative JSON-LD context.
   - Processes documents as if JSON-LD term mappings and coercions from the normative context were applied.

3. **Validator**
   - Determines conformance of input documents by validating the interpreted RDF data graph, composed with the applicable ontology/vocabulary graph(s), against the normative SHACL shapes.
   - Validation outcomes MUST be equivalent to SHACL validation results (`sh:conforms`). SHACL validation reports and `sh:conforms` are defined by SHACL.

---

## Processing model

For the purposes of conformance, an implementation MUST behave equivalently to the following processing model:

1. Interpret the input JSON-LD using the applicable UJG JSON-LD context(s).
2. Resolve JSON terms to RDF property/class IRIs according to the context.
3. Apply JSON-LD coercions (for example, IRI-valued terms using `@type: @id`, set semantics using `@container: @set`, and any other context-defined rules).
4. Compose the resulting RDF data graph with the applicable module ontology/vocabulary graph(s) used for class and property semantics.
5. Validate the composed RDF data graph against the applicable SHACL shapes graph(s).

This specification permits alternative internal implementations (for example, direct JSON validation) provided the observable acceptance/rejection behavior is equivalent to the above model. JSON-LD term definition and expansion semantics are specified by JSON-LD; SHACL property constraints are expressed using `sh:path`, `sh:minCount`, `sh:maxCount`, and related vocabulary.

---

## Semantic constraints and serialization constraints

This specification distinguishes between:

- **Semantic constraints** (normative):
  - Defined by SHACL shapes and the ontology.
  - Examples: required properties, cardinality, value type/class constraints.

- **Serialization constraints** (normative for JSON-LD syntax):
  - Defined by the JSON-LD context and this specification’s JSON profile rules.
  - Examples: canonical term names, type coercions, container usage.

Where a semantic property IRI and a JSON key differ, the semantic requirement is defined on the property IRI, and the JSON key is the JSON-LD serialization alias for that property. JSON-LD contexts define these aliases and mappings.

---

## Module conformance

This specification is modular.

- The **Core Module** defines base classes, properties, and constraints.
- Additional modules (for example, Graph, Runtime, …) define module-specific classes and constraints.
- A profile or aggregate specification MAY require support for multiple modules.

For each module, conformance is determined by:

- the module ontology/vocabulary,
- the module SHACL shapes, and
- the module JSON-LD context (or composed context set).

The module ontology/vocabulary graph supplies the class and property statements used during SHACL validation. Validators MAY materialize an equivalent entailment or closure instead of physically merging graphs, provided validation outcomes are equivalent.

An implementation claiming conformance to a module MUST satisfy that module’s semantic and serialization constraints.

An implementation claiming conformance to a profile (aggregate specification) MUST satisfy the constraints of all required modules in that profile.

## Document extension conformance

Document Extensions are optional JSON payloads attached through Core `extensions` on
`UJGDocument`. Unless an extension specification says otherwise, the payload is opaque to generic
UJG JSON-LD processing and does not add RDF terms to the UJG graph.

For each Document Extension, conformance is determined by:

- the extension's attachment key,
- its JSON Schema or other explicitly identified validation artifact, and
- the processing rules defined by the extension specification.

Generic consumers that do not implement a Document Extension MAY ignore its semantics while
preserving the JSON payload during non-lossy read-transform-write.

---

## Test assertions

A conformance test suite SHOULD include, for each module:

1. **Positive tests**
   - Inputs that MUST be accepted.

2. **Negative tests**
   - Inputs that MUST be rejected (for example, missing required properties, invalid cardinality, invalid value types).

3. **Serialization tests**
   - Inputs that verify JSON-LD term mappings/coercions (for example, IRI-valued fields, set semantics).

4. **Module composition tests**
   - Inputs that combine Core + one or more modules and verify combined conformance behavior.

A validator MAY implement these tests using direct JSON-LD processing, but results MUST be equivalent to validation of the composed RDF graph against the normative SHACL shapes.

---

## Error reporting

When rejecting a document, an implementation SHOULD provide diagnostics that identify:

- the affected semantic property (IRI), and
- the corresponding JSON-LD term (if available in the applicable context), and
- the violated constraint (for example, required property missing, cardinality exceeded).

This improves interoperability and helps users correlate JSON syntax with semantic constraints.

---

## Examples

Example JSON-LD documents in this specification are informative unless explicitly marked normative. Conformance is determined by the normative artifacts (ontology, SHACL shapes, and JSON-LD context), not by example documents.

---

## Canonical JSON-LD Profile

A **Canonical JSON-LD Profile** may define required compact term names and serialization conventions. Conforming producers for the Canonical JSON-LD Profile MUST emit the specified compact terms and context usage. Conforming consumers/validators MUST accept any semantically equivalent JSON-LD representation unless this profile explicitly restricts accepted syntax.
