## Normative Artifacts

UJG conformance uses module ontologies (`*.ttl`), JSON-LD contexts (`*.context.jsonld`), SHACL shapes
(`*.shape.ttl`), normative processing and integrity requirements, and any claimed document
extension's validation artifact. JSON-LD and YAML-LD are serializations of the same module model.

The current Editor's Draft makes a hard cut to canonical property names and matching RDF IRI local
names. Retired terms are not aliases for current vocabulary. There is no compatibility translation,
old-context fallback, or old/new property-equivalence bridge. Published snapshots remain separate
specification targets.

## Conformance Classes {data-cop-concept="conformance-classes"}

<spec-statement>
1. A **Producer** **MUST** emit documents that satisfy Core processing requirements and the
   semantics of its claimed modules, using its declared output serialization(s).
2. A **Consumer** **MUST** process its claimed modules and declared input serialization(s) as if
   the normative contexts, Core discovery and import rules, and module semantics were applied.
3. A **Validator** **MUST** check source-processing requirements, import closure, vocabulary
   integrity, normative module integrity rules, and applicable SHACL constraints. Overall document
   conformance is **NOT** equivalent to `sh:conforms` alone.
4. Claims **MUST** identify their specification target, conformance class, module/profile scope,
   and supported serialization(s) out of band. JSON-LD is the baseline input serialization;
   YAML-LD is an additional capability. Producers declare the format(s) they emit.
5. Within each declared serialization, Consumers and Validators **MUST** accept both flat and
   nested representations, including mixtures of definitions and references permitted by modules.
6. An implementation **MUST NOT** report complete document conformance when a required import,
   context, or integrity check could not be processed. An unsupported format is an implementation
   capability failure, not evidence that the source document violates its format.
</spec-statement>

## Processing Model {data-cop-concept="processing-model"}

For complete document conformance, implementations MUST behave equivalently to these stages:

1. Load each resource with an absolute source location and declared format. Parse JSON-LD 1.1 or
   the UJG single-document YAML-LD profile. Preserve source diagnostics.
2. Interpret active contexts without losing lexical import references; normalize Core imports
   against source location, independently of `@base`, before ordinary expansion. Apply the same
   normalization to module resource locations when their owning module requires it, such as
   Design System `TokenSource.source`.
3. Expand node identities and properties, check authored roots and identities, and discover local
   definitions according to Core. Reject authored `members`, invalid root associations, and
   unmapped compact properties in modeled content. JSON literals remain opaque.
4. Resolve the transitive import closure, retaining source provenance and each resource's own
   semantic base. Do not infer imports from ordinary references.
5. Build the authored RDF graph(s), retaining authored `nodes` links. Derive effective `members`
   into separate source-scoped validation graphs. Never merge source memberships solely because
   their semantic root identifiers coincide.
6. Compose the data with applicable ontology/vocabulary graphs. Check undeclared terms in the
   namespaces of the claimed UJG modules and every normative integrity requirement of those
   modules, including requirements not expressed in SHACL.
7. Validate against the applicable SHACL shapes, including membership-sensitive constraints over
   the source-scoped validation dataset.
8. Apply the attachment and schema/processing rules of any claimed document extensions.

Alternative internal implementations are permitted when their observable results match this model.
A source-processing failure remains a failure even if a later derived graph satisfies SHACL.
RDF-only validation without source provenance MAY report shape validity, but MUST NOT claim
complete document conformance when source-dependent requirements cannot be established.

## Module and Profile Conformance

A module claim covers that module's normative prose, ontology, context, validation shapes, and
required dependency closure. A profile claim covers every module and conformance class it requires.
A claim does not automatically require implementation of all optional modules.

Optional-module unknown-term processing follows Core and the owning module's graceful-degradation
rules. It does not allow retired or undeclared properties in a claimed module's namespace to act
as standardized UJG semantics. Explicit extension contexts may define other vocabularies.

## Document Extension Conformance

Document Extensions attach through Core `extensions`. Their payloads are JSON values, even when
written using YAML syntax, and remain opaque to generic UJG RDF processing. Core requires each
`extensions` value and each namespaced entry to be an object.

A claimed Document Extension MUST satisfy its specified attachment key, JSON Schema or other
validation artifact, and normative processing rules. Unknown payloads MUST be preserved during
non-lossy read-transform-write and MUST NOT influence standardized references or membership.

## Representation Equivalence {data-cop-concept="representation-equivalence"}

Serialization equivalence compares current-vocabulary representations at the same semantic base
and with identical normalized import targets. Under those conditions, YAML/JSON syntax changes
MUST preserve RDF interpretation. Comments, anchor names, and mapping-key order carry no UJG
semantics. Sequence order follows the property's container and module semantics.

Changing flat inventory organization to nested roots may change authored `nodes` relationships.
Such documents are equivalent for UJG domain processing when their domain assertions, identities,
resolved references, and effective source memberships agree. Equality of domain RDF alone does
not prove equality of source membership. No RDF-equivalence claim applies across the breaking
vocabulary rename or to imports whose normalized retrieval targets differ.

The canonical authoring terms are recommended for interoperable authoring. Standard JSON-LD
keywords and explicitly defined alternative representations of current vocabulary remain valid;
this does not restore removed ED terms or old vocabulary IRIs.

## Test Assertions

The executable development suite is maintained in `apps/web/scripts/conformance`, with colocated
tests. Run `pnpm --filter @openuji/web conformance:test`, `pnpm --filter @openuji/web vocabulary:check`,
and `pnpm --filter @openuji/web examples:check`. Its fixtures are informative evidence for normative
requirements, not additional vocabulary. Expected RDF and membership sets MUST be specified
independently from format generation.

A suite SHOULD cover flat and nested JSON-LD/YAML-LD, every canonical context mapping, context
composition, positive and negative module constraints, definition/reference distinctions,
source-scoped membership, import closure, and document extension boundaries. Tests MUST NOT
establish correctness merely by comparing two outputs of the same converter.

## Error Reporting

Diagnostics SHOULD identify the processing stage, source location, affected node and semantic
property, authoring term when available, and violated requirement. Import failures SHOULD include
the importing source and normalized target. Shape reports retain their standard SHACL meaning;
they are only one part of a complete document report.

## Examples

Examples are informative. Complete documents are checked against their declared modules; fragments
have an explicit context and validation harness, and opaque payload examples use their own schema.
YAML-LD and JSON-LD tabs are generated from one source fixture to avoid documentation drift.
