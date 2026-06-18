## Overview

This module defines a vocabulary for human-facing journeys whose visible states,
actions, artifacts, or outcomes depend on more than one independently operated authority.

Distributed Journey does not model internal server truth.

This module is intentionally second-level. It composes first-level bridge modules instead of adding
distributed systems semantics directly to Core, Graph, or Runtime:

- Actor identifies responsible systems and eligible participants.
- Surface identifies the machine-presented boundary a human sees or acts through.
- Action identifies side effects associated with Graph transitions or outgoing transitions.
- Artifact identifies files, archives, reports, invites, media, or other resources involved in the
  journey.

State Data is not a dependency of this module unless a distributed-journey document also needs
state-like data binding identity. Distributed Journey uses Artifact for portable resources that
cross authority boundaries.

Simple single-site forms, checkouts, dashboards, and app flows do not need this module.

## Normative Artifacts

This module is published through the following artifacts:

- `distributed-journey.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/distributed-journey`
- `distributed-journey.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/distributed-journey.context.jsonld`
- `distributed-journey.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/distributed-journey.shape`

Examples in this page compose the Core, Graph, Actor, Surface, Action, Artifact, and
Distributed Journey contexts as needed. Companion Runtime Evidence examples compose Core, Runtime,
Actor, and Runtime Evidence contexts and import the distributed graph document they describe.

## Terminology

- <dfn>Authority</dfn>: An independently operated machine or system boundary relevant to a
  human-facing surface, action, artifact, or outcome. `Authority` specializes Actor.
- <dfn>DistributedArtifact</dfn>: An [=Artifact=] that is visible to, handled by, produced by, or
  consumed by a human-facing journey that crosses authorities.
- <dfn>Presented authority</dfn>: The [=Authority=] that presents or controls a [=Surface=].

## Model

`Authority` identifies an independently operated boundary and declares one `origin`.

`presentedByAuthorityRef` links a `Surface` to the authority that presents or controls it. This is
the module's main human-facing attachment: it lets a journey cross multiple systems while keeping
the graph surface-oriented.

An `Action` may identify source and target authorities when the action itself crosses authority
boundaries and no more specific produced or consumed artifact carries that relationship.

`DistributedArtifact` specializes Artifact. It may identify source and target authorities when a
file, archive, report, invite, media object, or similar resource crosses authority boundaries.

Examples use the most-specific distributed type. `Authority` and `DistributedArtifact` inherit their
Actor and Artifact meaning through the ontology.

Pending, failed, partial, unavailable, accepted, revoked, and blocked are ordinary human-visible
`State` nodes when a person sees or experiences them. This module does not define value objects for
those statuses.

Protocol messages, server logs, API responses, queues, and synchronization state are Runtime facts,
Runtime Evidence metadata, artifacts, or private extension data unless they are directly exposed to
a human as a visible status, confirmation, error, affordance, unavailable action, recovery path, or
outcome.

## Non-Goals

Distributed Journey does not define:

- a new journey class
- graph traversal semantics
- runtime causal ordering
- mapping conformance semantics
- protocol vocabulary
- queue, retry, delivery, or synchronization semantics
- status, claim, gap, propagation, portability, or consistency taxonomies
- server truth, database state, or internal protocol state

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

1. **Human-facing graph:** Distributed Journey terms MUST NOT replace the human-facing UJG Journey
   graph. A UJG Journey remains a model of human interaction with machine-presented surfaces,
   affordances, responses, statuses, errors, and outcomes.
2. **Authority meaning:** `Authority` identifies a system boundary responsible for presenting or
   controlling a human-facing surface, action, artifact, or outcome. It MUST NOT be interpreted as a
   statement of what a server internally believes.
3. **Action authority metadata:** `sourceAuthorityRef` and `targetAuthorityRefs` MAY be attached to
   an `Action` when the human-facing action crosses authority boundaries directly. They MUST NOT be
   interpreted as graph edges, runtime causality, or server-internal state.
4. **Visible statuses:** Pending, failed, partial, unavailable, accepted, revoked, and blocked
   outcomes SHOULD be modeled as ordinary Graph states when they are visible or meaningful to a
   human.
5. **Machine details stay outside graph:** Protocol messages, logs, API responses, queues, and sync
   state SHOULD remain Runtime, Runtime Evidence, Artifact, or private extension data unless
   directly exposed to a human.
6. **No hidden graph behavior:** Distributed terms MUST NOT create hidden graph edges or change
   transition endpoint semantics.
7. **Graceful degradation:** Consumers that do not implement this module MAY ignore Distributed
   Journey semantics, but SHOULD preserve recognized JSON-LD data during read-transform-write when
   possible.

## Nextcloud Federated File Sharing Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/action.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/artifact.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/distributed-journey.context.jsonld"
  ],
  "@id": "https://example.com/ujg/distributed/nextcloud-share.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:authority:cloud-a",
      "@type": "Authority",
      "origin": "https://cloud-a.example"
    },
    {
      "@id": "urn:authority:cloud-b",
      "@type": "Authority",
      "origin": "https://cloud-b.example"
    },
    {
      "@id": "urn:journey:federated-share",
      "@type": "Journey",
      "label": "Federated file share",
      "startStateRef": "urn:state:alice-share-panel",
      "stateRefs": [
        "urn:state:alice-share-panel",
        "urn:state:alice-recipient-recognized",
        "urn:state:alice-share-confirmed",
        "urn:state:bob-incoming-share",
        "urn:state:bob-file-available",
        "urn:state:bob-access-removed"
      ],
      "transitionRefs": [
        "urn:transition:recognize-recipient",
        "urn:transition:confirm-share",
        "urn:transition:bob-opens-cloud",
        "urn:transition:bob-accepts",
        "urn:transition:alice-revokes"
      ]
    },
    {
      "@id": "urn:state:alice-share-panel",
      "@type": "State",
      "label": "Alice sees the share panel",
      "surfaceRef": "urn:surface:alice-share-panel",
      "responsibleActorRef": "urn:authority:cloud-a"
    },
    {
      "@id": "urn:state:alice-recipient-recognized",
      "@type": "State",
      "label": "Alice sees Bob recognized as a remote recipient",
      "surfaceRef": "urn:surface:alice-recipient-recognized",
      "responsibleActorRef": "urn:authority:cloud-a"
    },
    {
      "@id": "urn:state:alice-share-confirmed",
      "@type": "State",
      "label": "Alice sees shared with Bob",
      "surfaceRef": "urn:surface:alice-share-confirmed",
      "responsibleActorRef": "urn:authority:cloud-a"
    },
    {
      "@id": "urn:state:bob-incoming-share",
      "@type": "State",
      "label": "Bob sees an incoming remote share",
      "surfaceRef": "urn:surface:bob-incoming-share",
      "responsibleActorRef": "urn:authority:cloud-b"
    },
    {
      "@id": "urn:state:bob-file-available",
      "@type": "State",
      "label": "Bob can open the shared folder",
      "surfaceRef": "urn:surface:bob-file-available",
      "responsibleActorRef": "urn:authority:cloud-b"
    },
    {
      "@id": "urn:state:bob-access-removed",
      "@type": "State",
      "label": "Bob sees access removed",
      "surfaceRef": "urn:surface:bob-access-removed",
      "responsibleActorRef": "urn:authority:cloud-b"
    },
    {
      "@id": "urn:surface:alice-share-panel",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:cloud-a"
    },
    {
      "@id": "urn:surface:alice-recipient-recognized",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:cloud-a"
    },
    {
      "@id": "urn:surface:alice-share-confirmed",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:cloud-a"
    },
    {
      "@id": "urn:surface:bob-incoming-share",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:cloud-b"
    },
    {
      "@id": "urn:surface:bob-file-available",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:cloud-b"
    },
    {
      "@id": "urn:surface:bob-access-removed",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:cloud-b"
    },
    {
      "@id": "urn:transition:recognize-recipient",
      "@type": "Transition",
      "from": "urn:state:alice-share-panel",
      "to": "urn:state:alice-recipient-recognized"
    },
    {
      "@id": "urn:transition:confirm-share",
      "@type": "Transition",
      "from": "urn:state:alice-recipient-recognized",
      "to": "urn:state:alice-share-confirmed",
      "actionRef": "urn:action:share-with-bob"
    },
    {
      "@id": "urn:transition:bob-accepts",
      "@type": "Transition",
      "from": "urn:state:bob-incoming-share",
      "to": "urn:state:bob-file-available",
      "actionRef": "urn:action:bob-accepts-share"
    },
    {
      "@id": "urn:transition:bob-opens-cloud",
      "@type": "Transition",
      "from": "urn:state:alice-share-confirmed",
      "to": "urn:state:bob-incoming-share",
      "actionRef": "urn:action:bob-opens-cloud"
    },
    {
      "@id": "urn:transition:alice-revokes",
      "@type": "Transition",
      "from": "urn:state:bob-file-available",
      "to": "urn:state:bob-access-removed",
      "actionRef": "urn:action:revoke-share"
    },
    {
      "@id": "urn:action:share-with-bob",
      "@type": "Action",
      "producedArtifactRefs": ["urn:artifact:remote-share"]
    },
    {
      "@id": "urn:action:bob-accepts-share",
      "@type": "Action",
      "consumedArtifactRefs": ["urn:artifact:remote-share"]
    },
    {
      "@id": "urn:action:bob-opens-cloud",
      "@type": "Action"
    },
    {
      "@id": "urn:action:revoke-share",
      "@type": "Action"
    },
    {
      "@id": "urn:artifact:remote-share",
      "@type": "DistributedArtifact",
      "sourceAuthorityRef": "urn:authority:cloud-a",
      "targetAuthorityRefs": ["urn:authority:cloud-b"]
    }
  ]
}
```

This example keeps Alice's confirmation and Bob's access as separate visible states. The model does
not claim that Alice seeing "shared with Bob" is the same as Bob being able to open the folder.

A companion Runtime Evidence document can record that Bob's visible access state was observed in a
runtime execution without adding evidence nodes to the distributed graph itself:

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/runtime.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/runtime-evidence.context.jsonld"
  ],
  "@id": "https://example.com/ujg/runtime-evidence/execution-12345.jsonld",
  "@type": "UJGDocument",
  "imports": ["https://example.com/ujg/distributed/nextcloud-share.jsonld"],
  "nodes": [
    {
      "@id": "urn:authority:cloud-b",
      "@type": "Actor"
    },
    {
      "@id": "urn:execution:nextcloud-share-12345",
      "@type": "JourneyExecution"
    },
    {
      "@id": "urn:journey-instance:federated-share:12345",
      "@type": "JourneyInstance",
      "journeyRef": "urn:journey:federated-share"
    },
    {
      "@id": "urn:event:nextcloud-share-12345:bob-file-available",
      "@type": "RuntimeEvent",
      "executionId": "urn:execution:nextcloud-share-12345",
      "stateRef": "urn:state:bob-file-available",
      "journeyInstanceRef": "urn:journey-instance:federated-share:12345",
      "payload": { "action": "surface.visible" }
    },
    {
      "@id": "urn:runtime-evidence:nextcloud-share:bob-file-available",
      "@type": "RuntimeEvidenceRecord",
      "journeyExecutionRef": "urn:execution:nextcloud-share-12345",
      "runtimeEventRef": "urn:event:nextcloud-share-12345:bob-file-available",
      "observedByActorRef": "urn:authority:cloud-b",
      "evidencePayload": { "source": "cloud-b-runtime", "record": "state-observed" }
    }
  ]
}
```

## Federated Account Migration Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/action.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/artifact.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/distributed-journey.context.jsonld"
  ],
  "@id": "https://example.com/ujg/distributed/account-migration.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:authority:old",
      "@type": "Authority",
      "origin": "https://old.example"
    },
    {
      "@id": "urn:authority:new",
      "@type": "Authority",
      "origin": "https://new.example"
    },
    {
      "@id": "urn:journey:account-migration",
      "@type": "Journey",
      "label": "Account migration",
      "startStateRef": "urn:state:export-settings",
      "stateRefs": [
        "urn:state:export-settings",
        "urn:state:archive-ready",
        "urn:state:import-settings",
        "urn:state:partial-import-confirmed",
        "urn:state:non-portable-warning"
      ],
      "transitionRefs": [
        "urn:transition:request-export",
        "urn:transition:open-import-settings",
        "urn:transition:import-archive",
        "urn:transition:show-warning"
      ]
    },
    {
      "@id": "urn:state:export-settings",
      "@type": "State",
      "label": "Alice sees export settings on the old server",
      "surfaceRef": "urn:surface:export-settings",
      "responsibleActorRef": "urn:authority:old"
    },
    {
      "@id": "urn:state:archive-ready",
      "@type": "State",
      "label": "Alice sees export archive ready",
      "surfaceRef": "urn:surface:archive-ready",
      "responsibleActorRef": "urn:authority:old"
    },
    {
      "@id": "urn:state:import-settings",
      "@type": "State",
      "label": "Alice sees import settings on the new server",
      "surfaceRef": "urn:surface:import-settings",
      "responsibleActorRef": "urn:authority:new"
    },
    {
      "@id": "urn:state:partial-import-confirmed",
      "@type": "State",
      "label": "Alice sees partial import confirmation",
      "surfaceRef": "urn:surface:partial-import-confirmed",
      "responsibleActorRef": "urn:authority:new"
    },
    {
      "@id": "urn:state:non-portable-warning",
      "@type": "State",
      "label": "Alice sees warnings about content that cannot be imported",
      "surfaceRef": "urn:surface:non-portable-warning",
      "responsibleActorRef": "urn:authority:new"
    },
    {
      "@id": "urn:surface:export-settings",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:old"
    },
    {
      "@id": "urn:surface:archive-ready",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:old"
    },
    {
      "@id": "urn:surface:import-settings",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:new"
    },
    {
      "@id": "urn:surface:partial-import-confirmed",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:new"
    },
    {
      "@id": "urn:surface:non-portable-warning",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:new"
    },
    {
      "@id": "urn:transition:request-export",
      "@type": "Transition",
      "from": "urn:state:export-settings",
      "to": "urn:state:archive-ready",
      "actionRef": "urn:action:request-export"
    },
    {
      "@id": "urn:transition:import-archive",
      "@type": "Transition",
      "from": "urn:state:import-settings",
      "to": "urn:state:partial-import-confirmed",
      "actionRef": "urn:action:import-archive"
    },
    {
      "@id": "urn:transition:open-import-settings",
      "@type": "Transition",
      "from": "urn:state:archive-ready",
      "to": "urn:state:import-settings"
    },
    {
      "@id": "urn:transition:show-warning",
      "@type": "Transition",
      "from": "urn:state:partial-import-confirmed",
      "to": "urn:state:non-portable-warning"
    },
    {
      "@id": "urn:action:request-export",
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
      "@type": "DistributedArtifact",
      "sourceAuthorityRef": "urn:authority:old",
      "targetAuthorityRefs": ["urn:authority:new"]
    }
  ]
}
```

The non-portable content warning is an ordinary visible state. The module does not need a
portability taxonomy to represent partial success.

A companion Runtime Evidence document can describe the runtime observation of the partial import
confirmation as metadata attached to a runtime event:

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/runtime.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/runtime-evidence.context.jsonld"
  ],
  "@id": "https://example.com/ujg/runtime-evidence/execution-23456.jsonld",
  "@type": "UJGDocument",
  "imports": ["https://example.com/ujg/distributed/account-migration.jsonld"],
  "nodes": [
    {
      "@id": "urn:authority:new",
      "@type": "Actor"
    },
    {
      "@id": "urn:execution:account-migration-23456",
      "@type": "JourneyExecution"
    },
    {
      "@id": "urn:journey-instance:account-migration:23456",
      "@type": "JourneyInstance",
      "journeyRef": "urn:journey:account-migration"
    },
    {
      "@id": "urn:event:account-migration-23456:partial-import-confirmed",
      "@type": "RuntimeEvent",
      "executionId": "urn:execution:account-migration-23456",
      "stateRef": "urn:state:partial-import-confirmed",
      "journeyInstanceRef": "urn:journey-instance:account-migration:23456",
      "payload": { "action": "surface.visible" }
    },
    {
      "@id": "urn:runtime-evidence:account-migration:partial-import-confirmed",
      "@type": "RuntimeEvidenceRecord",
      "journeyExecutionRef": "urn:execution:account-migration-23456",
      "runtimeEventRef": "urn:event:account-migration-23456:partial-import-confirmed",
      "observedByActorRef": "urn:authority:new",
      "evidencePayload": { "source": "new-server-runtime", "record": "state-observed" }
    }
  ]
}
```

## Remote Follow Or Subscription Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/action.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/distributed-journey.context.jsonld"
  ],
  "@id": "https://example.com/ujg/distributed/remote-follow.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@id": "urn:authority:local",
      "@type": "Authority",
      "origin": "https://local.example"
    },
    {
      "@id": "urn:authority:remote",
      "@type": "Authority",
      "origin": "https://remote.example"
    },
    {
      "@id": "urn:journey:remote-follow",
      "@type": "Journey",
      "label": "Remote follow",
      "startStateRef": "urn:state:remote-search",
      "stateRefs": [
        "urn:state:remote-search",
        "urn:state:remote-result-visible",
        "urn:state:follow-pending",
        "urn:state:following-visible",
        "urn:state:follow-rejected",
        "urn:state:remote-unavailable",
        "urn:state:remote-feed-visible"
      ],
      "transitionRefs": [
        "urn:transition:open-result",
        "urn:transition:click-follow",
        "urn:transition:follow-accepted",
        "urn:transition:follow-rejected",
        "urn:transition:remote-unavailable",
        "urn:transition:updates-visible"
      ]
    },
    {
      "@id": "urn:state:remote-search",
      "@type": "State",
      "label": "Alice searches for a remote account",
      "surfaceRef": "urn:surface:remote-search",
      "responsibleActorRef": "urn:authority:local"
    },
    {
      "@id": "urn:state:remote-result-visible",
      "@type": "State",
      "label": "Alice sees the remote account result",
      "surfaceRef": "urn:surface:remote-result-visible",
      "responsibleActorRef": "urn:authority:local"
    },
    {
      "@id": "urn:state:follow-pending",
      "@type": "State",
      "label": "Alice sees follow request pending",
      "surfaceRef": "urn:surface:follow-pending",
      "responsibleActorRef": "urn:authority:local"
    },
    {
      "@id": "urn:state:following-visible",
      "@type": "State",
      "label": "Alice sees following",
      "surfaceRef": "urn:surface:following-visible",
      "responsibleActorRef": "urn:authority:local"
    },
    {
      "@id": "urn:state:follow-rejected",
      "@type": "State",
      "label": "Alice sees the follow request rejected",
      "surfaceRef": "urn:surface:follow-rejected",
      "responsibleActorRef": "urn:authority:local"
    },
    {
      "@id": "urn:state:remote-unavailable",
      "@type": "State",
      "label": "Alice sees the remote account unavailable",
      "surfaceRef": "urn:surface:remote-unavailable",
      "responsibleActorRef": "urn:authority:local"
    },
    {
      "@id": "urn:state:remote-feed-visible",
      "@type": "State",
      "label": "Alice sees remote updates in her local feed",
      "surfaceRef": "urn:surface:remote-feed-visible",
      "responsibleActorRef": "urn:authority:local"
    },
    {
      "@id": "urn:surface:remote-search",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:local"
    },
    {
      "@id": "urn:surface:remote-result-visible",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:local"
    },
    {
      "@id": "urn:surface:follow-pending",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:local"
    },
    {
      "@id": "urn:surface:following-visible",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:local"
    },
    {
      "@id": "urn:surface:follow-rejected",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:local"
    },
    {
      "@id": "urn:surface:remote-unavailable",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:local"
    },
    {
      "@id": "urn:surface:remote-feed-visible",
      "@type": "Surface",
      "presentedByAuthorityRef": "urn:authority:local"
    },
    {
      "@id": "urn:transition:open-result",
      "@type": "Transition",
      "from": "urn:state:remote-search",
      "to": "urn:state:remote-result-visible"
    },
    {
      "@id": "urn:transition:click-follow",
      "@type": "Transition",
      "from": "urn:state:remote-result-visible",
      "to": "urn:state:follow-pending",
      "actionRef": "urn:action:click-follow"
    },
    {
      "@id": "urn:transition:updates-visible",
      "@type": "Transition",
      "from": "urn:state:following-visible",
      "to": "urn:state:remote-feed-visible"
    },
    {
      "@id": "urn:transition:follow-accepted",
      "@type": "Transition",
      "from": "urn:state:follow-pending",
      "to": "urn:state:following-visible"
    },
    {
      "@id": "urn:transition:follow-rejected",
      "@type": "Transition",
      "from": "urn:state:follow-pending",
      "to": "urn:state:follow-rejected"
    },
    {
      "@id": "urn:transition:remote-unavailable",
      "@type": "Transition",
      "from": "urn:state:remote-result-visible",
      "to": "urn:state:remote-unavailable"
    },
    {
      "@id": "urn:action:click-follow",
      "@type": "Action",
      "sourceAuthorityRef": "urn:authority:local",
      "targetAuthorityRefs": ["urn:authority:remote"]
    }
  ]
}
```

The invisible federation request is not modeled as a journey state. The visible pending state and
later feed visibility are the user-facing graph.

A companion Runtime Evidence document can describe the runtime observation of the remote feed
becoming visible while leaving the invisible federation request outside the graph:

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/runtime.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/actor.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/runtime-evidence.context.jsonld"
  ],
  "@id": "https://example.com/ujg/runtime-evidence/execution-34567.jsonld",
  "@type": "UJGDocument",
  "imports": ["https://example.com/ujg/distributed/remote-follow.jsonld"],
  "nodes": [
    {
      "@id": "urn:authority:local",
      "@type": "Actor"
    },
    {
      "@id": "urn:execution:remote-follow-34567",
      "@type": "JourneyExecution"
    },
    {
      "@id": "urn:journey-instance:remote-follow:34567",
      "@type": "JourneyInstance",
      "journeyRef": "urn:journey:remote-follow"
    },
    {
      "@id": "urn:event:remote-follow-34567:remote-feed-visible",
      "@type": "RuntimeEvent",
      "executionId": "urn:execution:remote-follow-34567",
      "stateRef": "urn:state:remote-feed-visible",
      "journeyInstanceRef": "urn:journey-instance:remote-follow:34567",
      "payload": { "action": "surface.visible" }
    },
    {
      "@id": "urn:runtime-evidence:remote-follow:remote-feed-visible",
      "@type": "RuntimeEvidenceRecord",
      "journeyExecutionRef": "urn:execution:remote-follow-34567",
      "runtimeEventRef": "urn:event:remote-follow-34567:remote-feed-visible",
      "observedByActorRef": "urn:authority:local",
      "evidencePayload": { "source": "local-runtime", "record": "state-observed" }
    }
  ]
}
```
