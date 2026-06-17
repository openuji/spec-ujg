## Overview

This optional module defines vocabulary for journeys whose intent crosses independently operated
systems.

A distributed journey is a user journey where one intention depends on more than one authority, such
as an old server and a new server, a local instance and a remote instance, an identity provider and
consuming application, an export system and import system, or a local moderation UI and remote
moderation target.

This module is intentionally second-level. It does not attach distributed semantics directly to
Graph, Runtime, JourneyExecution, Mapping, State, or Transition nodes. Instead, it composes bridge
modules:

- Actor identifies responsible systems and eligible participants.
- Action identifies side effects associated with Graph transitions or outgoing transitions.
- Artifact identifies produced and consumed resources.
- Evidence records partial, merged, inferred, or redacted observations from the outside.

## Normative Artifacts

This module is published through the following artifacts:

- `distributed-journey.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/distributed-journey`
- `distributed-journey.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/distributed-journey.context.jsonld`
- `distributed-journey.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/distributed-journey.shape`

Examples in this page compose the Core, Graph, Actor, Action, Artifact, Evidence, and Distributed
Journey contexts as needed.

## Terminology

- <dfn>Authority</dfn>: An independently operated system, organization, server, service, instance,
  origin, or application boundary. `Authority` specializes Actor.
- <dfn>DistributedOperation</dfn>: A cross-authority operation associated with an Action.
- <dfn>DistributedArtifact</dfn>: An artifact produced, consumed, exchanged, or interpreted across an
  authority boundary.
- <dfn>ProtocolMessage</dfn>: A distributed artifact that represents a cross-authority message.
- <dfn>PortabilityClaim</dfn>: A statement that some data, identity, relationship, permission, or
  history can move between authorities.
- <dfn>PortabilityGap</dfn>: A statement that some data, identity, relationship, permission, or
  history cannot move, or cannot move completely.
- <dfn>ConsistencyExpectation</dfn>: A statement describing the expected relationship between two
  local or remote representations.

## Value Objects

This module uses value-object nodes instead of controlled string values.

The value-object classes are:

- `PropagationState`
- `PortabilityStatus`
- `PortabilityGapKind`
- `ConsistencyMode`

Profiles MAY publish well-known value-object IRIs for common cases such as pending propagation,
partial portability, media-not-portable gaps, or eventual consistency. Deployments MAY define their
own value-object nodes without changing this module.

## Model

`Authority` identifies a system boundary and declares one `origin`.

`DistributedOperation` references exactly one Action using `operationActionRef`. It may also
reference source and target authorities, protocol messages, produced artifacts, consumed artifacts,
and a propagation-state value object.

`DistributedArtifact` specializes Artifact and may identify source and target authorities plus a
propagation-state value object.

`ProtocolMessage` specializes `DistributedArtifact` and MUST identify one source authority and one
or more target authorities.

`PortabilityClaim` records portability between one source authority and one or more target
authorities. It references a `PortabilityStatus` value object and may reference one or more
`PortabilityGap` nodes.

`ConsistencyExpectation` records the expected relationship between two UJG nodes through a
`ConsistencyMode` value object.

## Non-Goals

Distributed Journey does not define:

- a new journey class
- graph traversal semantics
- runtime causal ordering
- mapping conformance semantics
- ActivityPub-specific vocabulary
- Matrix-specific vocabulary
- identity-provider-specific vocabulary
- transport protocols, retry policy, or queue execution
- closed enumerations for propagation, portability, or consistency values

## Ontology {data-cop-concept="ontology"}

The normative Distributed Journey ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/distributed-journey`.

:::include ./distributed-journey.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Distributed Journey JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/distributed-journey.context.jsonld`.

:::include ./distributed-journey.context.jsonld :::

## Validation {data-cop-concept="validation"}

The normative Distributed Journey SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/distributed-journey.shape`.

:::include ./distributed-journey.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Second-level semantics:** Distributed Journey describes distributed operations, artifacts,
   messages, portability, and consistency through bridge nodes. It MUST NOT redefine Core, Graph,
   Runtime, Mapping, Action, Artifact, Actor, or Evidence semantics.
2. **No graph mutation:** Distributed terms MUST NOT create hidden graph edges or change transition
   endpoint semantics.
3. **No runtime mutation:** Distributed terms MUST NOT alter Runtime event ordering, execution
   identity, or journey scope resolution.
4. **No mapping mutation:** Distributed terms MUST NOT alter Mapping state resolution, explained
   movement, or jump derivation.
5. **Value-object openness:** Propagation state, portability status, gap kind, and consistency mode
   values are nodes. Consumers MUST NOT treat this module as defining a closed set of values.
6. **Graceful degradation:** Consumers that do not implement this module MAY ignore Distributed
   Journey semantics, but SHOULD preserve recognized JSON-LD data during read-transform-write when
   possible.

## Account Migration Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/action.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/artifact.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/distributed-journey.context.jsonld"
  ],
  "@id": "https://example.com/ujg/distributed/account-migration.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:authority:old",
      "@type": ["Authority", "Actor"],
      "origin": "https://old.example"
    },
    {
      "@id": "urn:authority:new",
      "@type": ["Authority", "Actor"],
      "origin": "https://new.example"
    },
    {
      "@id": "urn:dist:state:remote-pending",
      "@type": "PropagationState"
    },
    {
      "@id": "urn:dist:state:partial-portability",
      "@type": "PortabilityStatus"
    },
    {
      "@id": "urn:dist:gap-kind:posts-not-portable",
      "@type": "PortabilityGapKind"
    },
    {
      "@id": "urn:journey:account-migration",
      "@type": "Journey",
      "label": "Account migration",
      "startStateRef": "urn:state:request-export",
      "stateRefs": [
        "urn:state:request-export",
        "urn:state:archive-ready",
        "urn:state:import-pending",
        "urn:state:partial-confirmed"
      ],
      "transitionRefs": [
        "urn:transition:prepare-export",
        "urn:transition:import-archive",
        "urn:transition:confirm-partial"
      ],
      "responsibleActorRef": "urn:authority:old"
    },
    {
      "@id": "urn:state:request-export",
      "@type": "State",
      "label": "Export requested",
      "responsibleActorRef": "urn:authority:old"
    },
    {
      "@id": "urn:state:archive-ready",
      "@type": "State",
      "label": "Archive ready",
      "responsibleActorRef": "urn:authority:old"
    },
    {
      "@id": "urn:state:import-pending",
      "@type": "State",
      "label": "Import pending",
      "responsibleActorRef": "urn:authority:new"
    },
    {
      "@id": "urn:state:partial-confirmed",
      "@type": "State",
      "label": "Migration partially confirmed",
      "responsibleActorRef": "urn:authority:new"
    },
    {
      "@id": "urn:transition:prepare-export",
      "@type": "Transition",
      "from": "urn:state:request-export",
      "to": "urn:state:archive-ready",
      "actionRef": "urn:action:prepare-export"
    },
    {
      "@id": "urn:transition:import-archive",
      "@type": "Transition",
      "from": "urn:state:archive-ready",
      "to": "urn:state:import-pending",
      "actionRef": "urn:action:import-archive"
    },
    {
      "@id": "urn:transition:confirm-partial",
      "@type": "Transition",
      "from": "urn:state:import-pending",
      "to": "urn:state:partial-confirmed"
    },
    {
      "@id": "urn:action:prepare-export",
      "@type": "Action",
      "producedArtifactRefs": ["urn:artifact:account-archive"]
    },
    {
      "@id": "urn:action:import-archive",
      "@type": "Action",
      "consumedArtifactRefs": ["urn:artifact:account-archive"]
    },
    {
      "@id": "urn:artifact:account-archive",
      "@type": ["DistributedArtifact", "Artifact"],
      "sourceAuthorityRef": "urn:authority:old",
      "targetAuthorityRefs": ["urn:authority:new"]
    },
    {
      "@id": "urn:operation:prepare-export",
      "@type": "DistributedOperation",
      "operationActionRef": "urn:action:prepare-export",
      "sourceAuthorityRef": "urn:authority:old",
      "targetAuthorityRefs": ["urn:authority:new"],
      "producedArtifactRefs": ["urn:artifact:account-archive"],
      "propagationStateRef": "urn:dist:state:remote-pending"
    },
    {
      "@id": "urn:claim:migration-portability",
      "@type": "PortabilityClaim",
      "sourceAuthorityRef": "urn:authority:old",
      "targetAuthorityRefs": ["urn:authority:new"],
      "portabilityStatusRef": "urn:dist:state:partial-portability",
      "portabilityGapRefs": ["urn:gap:old-posts"]
    },
    {
      "@id": "urn:gap:old-posts",
      "@type": "PortabilityGap",
      "portabilityGapKindRef": "urn:dist:gap-kind:posts-not-portable"
    }
  ]
}
```

## Remote Follow Evidence Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/action.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/artifact.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/evidence.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/distributed-journey.context.jsonld"
  ],
  "@id": "https://example.com/ujg/distributed/remote-follow-evidence.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:authority:local",
      "@type": ["Authority", "Actor"],
      "origin": "https://local.example"
    },
    {
      "@id": "urn:authority:remote",
      "@type": ["Authority", "Actor"],
      "origin": "https://remote.example"
    },
    {
      "@id": "urn:dist:state:remote-pending",
      "@type": "PropagationState"
    },
    {
      "@id": "urn:evidence-state:partial",
      "@type": "EvidenceState"
    },
    {
      "@id": "urn:observation-scope:local-server",
      "@type": "ObservationScope"
    },
    {
      "@id": "urn:redaction:redacted",
      "@type": "RedactionState"
    },
    {
      "@id": "urn:action:send-follow",
      "@type": "Action"
    },
    {
      "@id": "urn:message:follow",
      "@type": ["ProtocolMessage", "DistributedArtifact", "Artifact"],
      "sourceAuthorityRef": "urn:authority:local",
      "targetAuthorityRefs": ["urn:authority:remote"],
      "propagationStateRef": "urn:dist:state:remote-pending"
    },
    {
      "@id": "urn:operation:remote-follow",
      "@type": "DistributedOperation",
      "operationActionRef": "urn:action:send-follow",
      "sourceAuthorityRef": "urn:authority:local",
      "targetAuthorityRefs": ["urn:authority:remote"],
      "protocolMessageRefs": ["urn:message:follow"],
      "propagationStateRef": "urn:dist:state:remote-pending"
    },
    {
      "@id": "urn:evidence:local-follow-message",
      "@type": "EvidenceRecord",
      "evidenceSubjectRef": "urn:message:follow",
      "observedByActorRef": "urn:authority:local",
      "evidenceStateRef": "urn:evidence-state:partial",
      "observationScopeRef": "urn:observation-scope:local-server",
      "redactionStateRef": "urn:redaction:redacted"
    }
  ]
}
```

## File Share Consistency Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/distributed-journey.context.jsonld"
  ],
  "@id": "https://example.com/ujg/distributed/file-share-consistency.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:authority:a",
      "@type": ["Authority", "Actor"],
      "origin": "https://a.example"
    },
    {
      "@id": "urn:authority:b",
      "@type": ["Authority", "Actor"],
      "origin": "https://b.example"
    },
    {
      "@id": "urn:consistency-mode:eventual",
      "@type": "ConsistencyMode"
    },
    {
      "@id": "urn:state:revoked-on-a",
      "@type": "State",
      "label": "Share revoked on server A",
      "responsibleActorRef": "urn:authority:a"
    },
    {
      "@id": "urn:state:accepted-on-b",
      "@type": "State",
      "label": "Share accepted on server B",
      "responsibleActorRef": "urn:authority:b"
    },
    {
      "@id": "urn:consistency:file-share-revocation",
      "@type": "ConsistencyExpectation",
      "consistencySubjectRef": "urn:state:revoked-on-a",
      "counterpartRef": "urn:state:accepted-on-b",
      "consistencyModeRef": "urn:consistency-mode:eventual"
    }
  ]
}
```
