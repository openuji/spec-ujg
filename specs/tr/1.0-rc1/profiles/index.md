## Overview

Profiles define named interoperability bundles for UJG implementations. A profile identifies a set
of required UJG modules and the conformance classes that an implementation claims for that set.
Profiles do not define new JSON-LD terms, ontology classes, or SHACL shapes.

The [Optional Modules](/tr/1.0-rc1#optional-modules) published in this release candidate are the
official optional capability family. A profile can require one or more optional modules when a
capability needs shared semantics across tools. Opaque Core `extensions` remain outside semantic
profile claims except for preservation and pass-through behavior.

Archived extension specifications under `specs/archive/extensions` are historical material only.
Profiles MUST NOT treat those archived packages as active release-candidate capabilities.

## Profile Model {data-cop-concept="profile-model"}

- <dfn>UJG Profile</dfn>: A named conformance bundle that declares required UJG modules and required
  conformance classes.
- <dfn>Profile claim</dfn>: An out-of-band statement that a producer, consumer, validator, or tool
  conforms to a profile for one or more conformance classes.
- <dfn>Profile identifier</dfn>: A URI or document-fragment identifier that names a profile.
- <dfn>Required module</dfn>: A UJG module whose semantic constraints, JSON-LD context, and SHACL
  validation rules are required by a profile.

<spec-statement>
1. A UJG Profile **MUST** identify each required UJG module.
2. A UJG Profile **MUST** identify the conformance classes to which a claim can apply.
3. A profile claim **MUST** be made out of band, such as in implementation statements, package
   manifests, product documentation, HTTP metadata, registry entries, or other deployment metadata.
4. A profile claim **MUST NOT** be inferred from JSON-LD document content alone.
5. A profile claim **MUST NOT** use opaque Core `extensions` to satisfy a missing required module.
6. Unknown profile identifiers have no standardized conformance meaning.
</spec-statement>

This release candidate does not define a JSON-LD property for profile declarations. Documents MAY
contain deployment-private profile metadata in `extensions`, but such metadata is not a standardized
UJG profile claim and cannot affect profile conformance.

## Profile Conformance {data-cop-concept="profile-conformance"}

Profile conformance is claimed per conformance class. A tool can conform as a Producer for a profile
without also claiming Consumer or Validator conformance for that profile.

<spec-statement>
1. A Producer claiming conformance to a profile **MUST** generate documents that satisfy every
   required module for that profile.
2. A Consumer claiming conformance to a profile **MUST** process terms from every required module
   according to that module's semantics.
3. A Validator claiming conformance to a profile **MUST** validate documents against the SHACL
   shapes for every required module in that profile.
4. A profile-conforming implementation **MUST** satisfy the dependency closure of each required
   module.
5. A document **MAY** use modules outside a claimed profile, but those modules are outside the
   profile claim unless another profile claim covers them.
6. A consumer that does not implement an optional module **MAY** ignore that module's semantics only
   where the module permits graceful degradation, and **SHOULD** preserve recognized JSON-LD data
   during read-transform-write when possible.
</spec-statement>

Profile conformance does not replace module conformance. It packages module requirements so
implementations can make precise interoperability claims without requiring every tool to implement
every optional module.

## Starter Profiles {data-cop-concept="starter-profiles"}

The following starter profiles are document-fragment identifiers in this Profiles draft. Future
versions can publish additional profile identifiers without changing the module semantics below.

| Profile | Required modules | Intended use |
| --- | --- | --- |
| `#core` | Core | UJG document containers and addressable nodes. |
| `#graph` | Core, Graph | Intended journey topology. |
| `#surface-runtime` | Core, Graph, Surface, Runtime | Surface-aware runtime traces. |
| `#mapping-metrics` | Core, Graph, Surface, Runtime, Mapping, Metrics | Resolved mappings and aggregate metrics. |
| `#localized-observability` | Core, Graph, Surface, Localization, Observability | Accessible recognition contracts with localized names and descriptions. |
| `#design-system` | Core, Graph, Surface, Design System | Design-system realization of graph-facing surfaces. |
| `#automation-resources` | Core, Graph, Surface, Phase, Observability, Entry Binding, Effect, Artifact | Automation-oriented entry selection, observable resources, declared effects, and portable artifacts. |

### Core {data-cop-concept="core"}

The `#core` profile requires [UJG Core](/tr/1.0-rc1/core). It is suitable for tools that exchange UJG document
containers, imports, top-level nodes, and opaque node extensions without claiming graph semantics.

### Graph {data-cop-concept="graph"}

The `#graph` profile requires [UJG Core](/tr/1.0-rc1/core) and [UJG Graph](/tr/1.0-rc1/graph). It is suitable for tools that exchange
intended journey topology, entries, states, transitions, exits, outgoing navigation, and indexes.

### Surface Runtime {data-cop-concept="surface-runtime"}

The `#surface-runtime` profile requires [UJG Core](/tr/1.0-rc1/core), [UJG Graph](/tr/1.0-rc1/graph),
[UJG Surface](/tr/1.0-rc1/surface), and [UJG Runtime](/tr/1.0-rc1/runtime). It is suitable for tools
that connect runtime observations to graph-facing surfaces.

### Mapping Metrics {data-cop-concept="mapping-metrics"}

The `#mapping-metrics` profile requires [UJG Core](/tr/1.0-rc1/core), [UJG Graph](/tr/1.0-rc1/graph),
[UJG Surface](/tr/1.0-rc1/surface), [UJG Runtime](/tr/1.0-rc1/runtime), [UJG Mapping](/tr/1.0-rc1/mapping),
and [UJG Metrics](/tr/1.0-rc1/metrics). It is suitable for tools that compute mapping-derived
measurements over observed journeys.

### Localized Observability {data-cop-concept="localized-observability"}

The `#localized-observability` profile requires [UJG Core](/tr/1.0-rc1/core), [UJG Graph](/tr/1.0-rc1/graph),
[UJG Surface](/tr/1.0-rc1/surface), [UJG Localization](/tr/1.0-rc1/modules/l10n), and
[UJG Observability](/tr/1.0-rc1/modules/observability). It is suitable for tools that recognize
surface instances through accessibility-oriented locators and localized names or descriptions.

### Design System {data-cop-concept="design-system"}

The `#design-system` profile requires [UJG Core](/tr/1.0-rc1/core), [UJG Graph](/tr/1.0-rc1/graph),
[UJG Surface](/tr/1.0-rc1/surface), and [UJG Design System](/tr/1.0-rc1/modules/design-system). It is
suitable for tools that connect graph-facing surfaces to design-system components, templates, slots,
token sources, and realizations.

### Automation Resources {data-cop-concept="automation-resources"}

The `#automation-resources` profile requires [UJG Core](/tr/1.0-rc1/core), [UJG Graph](/tr/1.0-rc1/graph),
[UJG Surface](/tr/1.0-rc1/surface), [UJG Phase](/tr/1.0-rc1/modules/phase),
[UJG Observability](/tr/1.0-rc1/modules/observability),
[UJG Entry Binding](/tr/1.0-rc1/modules/entry-binding), [UJG Effect](/tr/1.0-rc1/modules/effect), and
[UJG Artifact](/tr/1.0-rc1/modules/artifact), including the dependency closure of those modules. It
is suitable for automation tools that need stable entry selection values, observable surface/resource
context, phase-oriented grouping, declared effects, and portable resources.

## Opaque Extensions And Profiles {data-cop-concept="opaque-extensions-and-profiles"}

Core `extensions` are useful for deployment-private data, vendor integration, local hints, and
experimental metadata. They are not a substitute for profile-required modules.

<spec-statement>
1. A profile claim **MUST NOT** require consumers to interpret unknown Core `extensions`.
2. A profile claim **MUST NOT** treat an opaque extension key as equivalent to a required UJG
   module.
3. Profile-specific interoperable semantics **SHOULD** be published as UJG modules instead of
   hidden in opaque extension payloads.
</spec-statement>
