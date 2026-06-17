## Abstract

The **User Journey Graph (UJG)** standardizes user experience as **computable data**. It decouples the **Definition of Intent** (Design) from the **Observation of Reality** (Telemetry). This separation creates a single source of truth for Designers, Developers, and Analysts. As a deterministic protocol, it supports automation by AI agents across these roles, ensuring structural consistency.

## Conceptual Stack

The standard is organized into five logical layers:

1. **The Core (Transport):** The universal JSON-LD envelope. Ensures any tool—human or AI—can parse the file structure without ambiguity.
2. **The Graph (Definition):** Defines the "Happy Path." It is the vocabulary for States, Transitions, and Composition (sub-journey referencing).
3. **The Experience (Semantic):** Describes the journey in canonical human semantics (Steps, Touchpoints, Phases, Pain Points), enabling qualitative intent to be represented as data.
4. **The Runtime (Execution):** Captures the "Actual Path." It records events as a causal chain.
5. **The Mapping (Conformance):** Closes the loop. It overlays Reality(*Runtime*) onto Intent(*Graph*) to calculate conversion and detect friction.

## Guiding Principles

1. **Graph First:** User experience is an automata, not a list of URLs.
2. **Stable Identity:** Entities must be named with URIs to survive refactors.
3. **Separation of Concerns:** A "Journey" (the plan) is immutable; a "Session" (the instance) is ephemeral.
4. **Vendor Neutrality:** The spec defines _data shapes_, not visualization rules.

## Optional Modules

The Editor's Draft also publishes a parallel family of **optional modules** for capabilities that
build on the core UJG layers without expanding the shared interoperability baseline. Earlier drafts
called these "supported extensions", but the normative model is now module-oriented: optional
capabilities that need interoperable graph terms publish their own ontology, JSON-LD context, and
SHACL shape.

Optional modules MAY add semantics above the shared layers, but they MUST NOT silently redefine
Core, Graph, Runtime, Experience, Mapping, or Metrics semantics. Capabilities that become universal
across compliant implementations should graduate from the optional module family into the main spec
family rather than remain optional add-ons.

Optional modules can be layered when a capability is intentionally mediated by another optional
module. A first-level module MAY attach directly to Core or Graph nodes. A second-level module SHOULD
depend on the first-level bridge instead of adding representational detail to Core or Graph nodes.
For user-interface materialization, the Surface module is the first-level bridge from
`State`/`CompositeState` to an addressable `Surface`; design-system realization belongs in a
Surface-dependent module, not directly on graph topology.

The same layering principle applies outside visual UI semantics. Actor, Action, Artifact, and
Evidence modules provide small bridge vocabularies for responsibility, side effects, exchanged
resources, and observation evidence. Distributed Journey is modeled as a second-level module over
those bridges: it describes cross-authority operations, protocol messages, portability, and
consistency without attaching distributed-system semantics directly to Graph, Runtime, or Mapping
nodes.

## Opaque Extensions

Core `extensions` remains the pass-through mechanism for vendor-private or deployment-specific JSON
payloads on UJG node objects. Opaque extensions do not participate in standardized graph semantics,
reference resolution, or profile conformance, even when their payloads happen to contain identifiers
or structured JSON objects.

Earlier Editor's Draft extension specifications are archived under `specs/archive/extensions` as
historical, non-normative material. They are not part of the active Editor's Draft publication set
and MUST NOT constrain evaluation of active optional modules.
