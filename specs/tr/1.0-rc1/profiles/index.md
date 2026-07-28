**Goal:** define _interoperability_ when not everyone implements every optional module, while keeping opaque Core `extensions` outside semantic profile claims.

The [Optional Modules](/tr/1.0-rc1#optional-modules) published in this release candidate define the official
optional capability family. Profiles are the future place to describe how implementations declare
support for those modules, how modules are bundled into named capability sets, and how consumers
degrade gracefully when optional capabilities are absent. Opaque Core `extensions` remain outside
semantic profile claims except for pass-through behavior. This draft does not yet standardize the
declaration format for those claims.

Archived extension specifications under `specs/archive/extensions` are historical material only.
Profiles MUST NOT treat those archived packages as active release-candidate capabilities.

### Normatives to evaluate

- **Profiles**: named capability sets (e.g., `graph-core`, `graph-composition`, `runtime-basic`, `runtime-mapped`).
- **Profile declaration**: how a producer/emitter/consumer declares supported profiles (document-level field vs out-of-band).
- **Optional module interoperability rules**:
  - required publication artifacts (`*.ttl`, `*.context.jsonld`, `*.shape.ttl`),
  - collision handling for composed contexts and overlapping terms,
  - versioning expectations for module vocabularies,
  - graceful degradation when a module is unsupported.
- **Opaque extension safety rules**:
  - what "namespaced" means for `extensions` keys,
  - collision handling,
  - preservation and pass-through requirements for stores/proxies.
- **Profile conformance** rules:
  - what it means to "conform to profile X",
  - required keys/behaviors per profile,
  - how a consumer should degrade gracefully when profile data is missing.

### Informatives to evaluate

- Recommended starter profile set for TR v1.
- Patterns for optional modules and vendor-private opaque payloads (e.g., UI presentation, experimentation, privacy).
- Examples: same Journey expressed with/without optional profile features.

### Decisions to make

- Do profiles live **inside** the JSON payload (e.g., `profiles: ["..."]`) or **outside** (HTTP header, metadata)?
- Do you want a formal prefix registry for compact namespaces, or just "SHOULD be URI-like"?
- How should implementations declare support for the [Optional Modules](/tr/1.0-rc1#optional-modules) published in this release candidate?
- How should profiles bundle optional modules into named capability sets?
- Should opaque `extensions` pass-through guarantees be declared as part of a profile or stay solely in Core?

### Must-align with

- [[UJG Core]] extension mechanics
- [[UJG Graph]] explicit vs outgoing transitions
- [[UJG Surface]] graph-node surface attachment and visible surface instances
- [[UJG Runtime]] surface event tracing
- [[UJG Mapping]] strategies to handle cross-journey jumps
- [[UJG Metrics]] aggregation depth
