## Abstract

The **User Journey Graph (UJG)** standardizes user experience as **computable data**. It decouples the **Definition of Intent** (Design) from the **Observation of Reality** (Telemetry). This separation creates a single source of truth for Designers, Developers, and Analysts. As a deterministic protocol, it supports automation by AI agents across these roles, ensuring structural consistency.

## Conceptual Stack

The main spec family is organized into five logical layers:

1. **The Core (Transport):** The universal JSON-LD envelope. Ensures any tool—human or AI—can parse the file structure without ambiguity.
2. **The Graph (Definition):** Defines the "Happy Path." It is the vocabulary for States, Transitions, and Composition (sub-journey referencing).
3. **The Surface (Materialization):** Exposes supported Graph nodes as addressable
   human-facing surfaces, touchpoints scoped to Journey boundaries, human users, and visible
   occurrences.
4. **The Runtime (Execution):** Captures the "Actual Path." It records observed surface events as a causal chain.
5. **The Mapping (Conformance):** Closes the loop. It resolves Reality(*Runtime*) through Surface onto Intent(*Graph*) to calculate conversion and detect friction.

## Guiding Principles

1. **Graph First:** User experience is an automata, not a list of URLs.
2. **Stable Identity:** Entities must be named with URIs to survive refactors.
3. **Separation of Concerns:** A "Journey" (the plan) is immutable; observed surface events are runtime facts.
4. **Vendor Neutrality:** The spec defines _data shapes_, not visualization rules.

## Optional Modules

The Editor's Draft also publishes a parallel family of **optional modules** for capabilities that
build on the core UJG layers without expanding the shared interoperability baseline. Earlier drafts
called these "supported extensions", but the normative model is now module-oriented: optional
capabilities that need interoperable graph terms publish their own ontology, JSON-LD context, and
SHACL shape.

Optional modules are where new ideas can live before every UJG document needs them. They can add
meaning on top of the main spec family, but they should leave the older layers intact. When an idea
becomes common enough that most compliant tools need it, it belongs in the main spec family instead
of staying optional.

Optional modules can grow in steps. A small module can first give the shared UJG layers a simple
thing to point at. Later modules can build on that thing and describe it in more detail. This lets
new capabilities become precise without forcing the shared baseline, or this architecture page, to
know every specialized vocabulary that may be added later.


First-level optional modules are small bridges that attach directly to main spec concepts. Second-level optional modules compose one or more shared
layers or first-level bridges.

## Opaque Extensions

The specification distinguishes published module vocabularies from opaque deployment-private
payloads. Opaque payloads are useful for local metadata and vendor integration, but they are not a
substitute for terms that need interoperable semantics. Processing rules for opaque payloads and
published module terms are defined by the modules that own those mechanisms.

## Document Extensions

Document Extensions define optional interoperable JSON structures attached to a `UJGDocument`.
Unlike graph-native optional modules, their payloads do not participate directly in the UJG RDF
graph and may use their own validation mechanisms.
