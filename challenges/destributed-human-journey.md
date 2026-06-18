# UJG Distributed Journey Human/Machine Perspective Challenge

## Purpose

Review the OpenUJG Editor’s Draft and the proposed Distributed Journey module from the perspective of UJG’s core principle:

> UJG models human interaction with machine-presented systems.

A UJG journey is not a model of what servers believe, how databases synchronize, or how protocols internally propagate state. Those may be relevant as evidence or implementation context, but they are not the primary journey.

The primary object of UJG remains:

* a human actor,
* interacting with one or more machine surfaces,
* through visible affordances and actions,
* receiving visible responses, confirmations, errors, pending states, limitations, or outcomes.

The Distributed Journey module should therefore support journeys where a human-facing experience crosses multiple independently operated systems, without turning UJG into a distributed systems state model.

---

## Current UJG Assumption to Challenge

UJG currently works well for a single website, product, checkout, submit form, dashboard, or app flow where one application owns:

* surfaces,
* states,
* transitions,
* submits,
* validation errors,
* success confirmations,
* runtime events,
* and user-visible outcomes.

Example:

> A user fills a checkout form, submits payment, sees an error or confirmation, and receives a receipt.

This is still the baseline. Simple webpage, form, and checkout journeys must remain simple.

---

## Revised Challenge

Can UJG describe a human-facing journey where one user intention crosses multiple independently operated systems, while preserving the rule that UJG models human/machine interaction rather than internal server state?

The question is not:

> Can UJG model what server A thinks and what server B thinks?

The question is:

> Can UJG model what a human sees, does, expects, confirms, cannot access, must wait for, or must recover from when the journey depends on more than one machine authority?

---

## Core Principle

A Distributed Journey module should model:

```text
Human intention
→ machine surface
→ human action
→ visible machine response
→ cross-authority dependency
→ visible pending/success/failure/limitation
→ human recovery or completion
```

It should not model protocol mechanics as journey states unless those mechanics become human-visible.

For example:

Bad UJG state:

```text
Server B received federation message.
```

Good UJG state:

```text
Bob sees an incoming remote share.
```

Bad UJG transition:

```text
Server A sent ActivityPub Follow request.
```

Good UJG transition:

```text
Alice clicks Follow and the UI shows “Follow request pending.”
```

Bad UJG outcome:

```text
Source and target server state are consistent.
```

Good UJG outcome:

```text
Alice sees “shared with Bob,” and Bob can open the shared file.
```

---

## Design Constraint

Distributed Journey terms must not replace the human-facing Journey graph.

They may only annotate, qualify, support, or provide evidence for user-visible states, actions, outcomes, and gaps that cross independently operated system boundaries.

A `ProtocolMessage`, `DistributedArtifact`, `PropagationState`, or `DistributedOperation` should not be treated as a Journey state unless it is exposed to a human as:

* a visible status,
* confirmation,
* error,
* available action,
* unavailable action,
* pending state,
* warning,
* limitation,
* recovery path,
* or outcome.

---

## Concepts to Evaluate

Evaluate whether the Distributed Journey module supports the following concepts while preserving the human/machine perspective.

### Authority

An `Authority` should not mean “a server that thinks something.”

It should mean:

> An independently operated machine/system boundary responsible for a human-facing surface, response, affordance, artifact, or observation.

Examples:

* Alice’s Nextcloud server
* Bob’s Nextcloud server
* old Mastodon instance
* new Mastodon instance
* local Lemmy instance
* remote Lemmy community instance
* identity provider
* payment provider
* export system
* import system

Questions:

* Can a State declare which Authority presents it to the human?
* Can a Surface declare which Authority controls it?
* Can Evidence declare which Authority observed or presented a human-visible state?
* Can a Journey cross an AuthorityBoundary without making Authority part of UJG Core?

---

### Surface

A distributed journey should remain surface-oriented.

Questions:

* Can UJG say that Alice interacts with Surface A, then Bob interacts with Surface B?
* Can two surfaces from different authorities participate in one Journey?
* Can a single user intention span several surfaces?
* Can a surface expose a remote result without owning the remote system?
* Can a surface show a pending, failed, or partial result caused by another authority?

---

### Human-Visible State

States should describe what is meaningful in the human/machine interaction.

Questions:

* Can UJG distinguish a backend event from a human-visible state?
* Can UJG represent “pending,” “accepted,” “failed,” “unavailable,” or “partially complete” only when those are visible or meaningful to the human?
* Can UJG represent that the user is intentionally not shown some backend result?
* Can UJG represent an invisible backend dependency as evidence or annotation rather than as a Journey state?

---

### Distributed Operation

A `DistributedOperation` should be attached to a human-facing action or outcome.

Example:

```text
Alice clicks “Share with Bob.”
```

This may depend on:

```text
cross-server share delivery
remote recipient lookup
permission negotiation
remote acceptance
```

But the journey step remains:

```text
Alice confirms the share.
```

Questions:

* Can a human-facing Action trigger a DistributedOperation?
* Can the DistributedOperation explain why a visible state is pending, failed, or partial?
* Can DistributedOperation remain optional and non-invasive for normal checkout/form journeys?
* Can the spec avoid making machine operations first-class journey states by default?

---

### Evidence

Evidence should support a claim about a human-visible state or outcome.

It should not become the journey itself.

Questions:

* Can Evidence say that a user-visible state was observed through UI, API, log, browser automation, or user report?
* Can Evidence be partial?
* Can Evidence come from different authorities?
* Can Evidence be redacted for privacy?
* Can Evidence support or contradict a visible claim?
* Can Mapping compare intended human-facing states against incomplete evidence?

Example:

Human-facing state:

```text
Bob sees the incoming remote share.
```

Evidence may include:

```text
browser screenshot
UI automation trace
Nextcloud OCS API response
server log
manual test report
```

The evidence exists to support the state. It is not the state.

---

## Use Case 1: Nextcloud Federated File Sharing

### Scenario

Alice uses `cloud-a.example`.

Bob uses `cloud-b.example`.

Alice wants to share a file with Bob using Nextcloud Federated Sharing.

### Human-Facing Journey

1. Alice opens her file list.
2. Alice selects a file or folder.
3. Alice opens the share panel.
4. Alice enters Bob’s federated cloud ID.
5. Alice sees Bob recognized as a remote recipient.
6. Alice confirms the share.
7. Alice sees that the file is shared with Bob.
8. Bob opens his Nextcloud.
9. Bob sees an incoming remote share.
10. Bob accepts the share.
11. Bob sees the shared file or folder in his files.
12. Bob opens the file or folder.
13. Alice revokes the share.
14. Bob can no longer open the file or sees an access removed/unavailable state.

### Machine Context

The journey may depend on:

* remote recipient lookup,
* federated share invitation,
* target-side acceptance,
* permissions,
* expiration,
* password protection,
* revocation,
* delivery failure,
* or inconsistent source/target visibility.

These machine-level details should only enter UJG as:

* evidence,
* annotations,
* artifacts,
* authority boundaries,
* distributed operation metadata,
* or user-visible pending/error states.

### Questions for the Spec

* Can the Journey remain human-facing while crossing two Nextcloud authorities?
* Can Alice’s visible confirmation be modeled separately from Bob’s visible access?
* Can the model express that “Alice sees shared” is not equivalent to “Bob can open”?
* Can Bob’s acceptance be a human-facing Action on a different Authority?
* Can revocation be modeled as a later human-facing action with a visible effect?
* Can permissions be represented as user-visible constraints?
* Can failed delivery become a visible error or pending state?
* Can invisible server-to-server details remain evidence instead of journey states?

---

## Use Case 2: Federated Account Migration

### Scenario

A user wants to move from:

```text
alice@old.example
```

to:

```text
alice@new.example
```

### Human-Facing Journey

1. Alice logs into the old server.
2. Alice opens migration or export settings.
3. Alice requests an export.
4. Alice sees export preparation progress.
5. Alice downloads an export archive or sees export unavailable.
6. Alice logs into the new server.
7. Alice opens import or migration settings.
8. Alice imports supported data.
9. Alice sees what was imported successfully.
10. Alice sees what could not be imported.
11. Alice configures redirect or alias from the old account.
12. Alice sees migration confirmation.
13. Followers or contacts may see the new account.
14. Alice receives warnings about non-portable content.

### Machine Context

The journey may involve:

* export artifacts,
* import artifacts,
* remote account aliases,
* follower migration,
* redirects,
* unsupported data types,
* remote propagation,
* and partial success.

### Questions for the Spec

* Can UJG model migration as a human-facing journey across old and new systems?
* Can export and import artifacts be represented as things the human can request, download, upload, inspect, or be warned about?
* Can UJG express non-portable data as a human-visible limitation?
* Can the Journey end in partial success?
* Can “migration confirmed” include visible caveats?
* Can UJG avoid representing follower propagation as a journey state unless the user sees its status or effect?
* Can evidence from old and new authorities support the same journey without replacing it?

---

## Use Case 3: Remote Follow or Subscription

### Scenario

Alice is on `local.example`.

Alice wants to follow a person, channel, or community on `remote.example`.

### Human-Facing Journey

1. Alice searches for a remote identifier.
2. Alice sees a remote result.
3. Alice opens the remote profile/community/channel representation.
4. Alice clicks Follow or Subscribe.
5. Alice sees one of:

   * following,
   * request pending,
   * rejected,
   * unavailable,
   * blocked,
   * remote server unreachable.
6. Alice later sees remote updates in her local feed, or sees that no updates are available.

### Machine Context

The journey may involve:

* remote resolution,
* metadata fetch,
* protocol messages,
* allowlist/blocklist policy,
* moderation policy,
* asynchronous acceptance,
* delayed delivery,
* failed delivery.

### Questions for the Spec

* Can UJG represent the local UI’s remote search result as a human-facing state?
* Can UJG model pending follow/subscription as visible state?
* Can a remote policy failure become a visible outcome?
* Can invisible federation requests remain evidence or distributed operation metadata?
* Can UJG distinguish “user clicked follow” from “remote updates are now visible”?
* Can Mapping compare expected follow outcome with actual feed visibility?

---

## Use Case 4: Federated Media Publishing

### Scenario

A creator publishes media on one server and expects people on other servers to discover, follow, watch, or report it.

### Human-Facing Creator Journey

1. Creator uploads media.
2. Creator sees validation result.
3. Creator sees processing or transcoding progress.
4. Creator sees publication confirmation.
5. Creator sees whether the media is public, private, unlisted, or failed.
6. Creator sees whether the media is available to remote viewers, if exposed.
7. Creator sees reports, moderation notices, or takedown results if applicable.

### Human-Facing Viewer Journey

1. Remote viewer searches for the creator or media.
2. Remote viewer sees the media representation.
3. Remote viewer opens or plays the media.
4. Remote viewer sees playback, unavailable, blocked, or failed state.
5. Remote viewer reports the media if needed.
6. Remote viewer sees confirmation or lack of feedback.

### Machine Context

The journey may involve:

* transcoding,
* queueing,
* worker/runner processing,
* federation delivery,
* remote indexing,
* remote search,
* moderation,
* and content visibility policy.

### Questions for the Spec

* Can UJG connect creator and viewer journeys without merging them into one machine workflow?
* Can background processing be represented only when it affects visible user status?
* Can “published locally” be distinguished from “discoverable remotely” as human-facing outcomes?
* Can remote viewer inability to play content be modeled as a journey outcome?
* Can UJG avoid treating media federation messages as direct journey states?

---

## Use Case 5: Cross-Instance Moderation or Reporting

### Scenario

Alice views remote content through her local server and reports it.

### Human-Facing Journey

1. Alice views content through the local UI.
2. Alice opens report action.
3. Alice enters report reason.
4. Alice submits report.
5. Alice sees confirmation, warning, or failure.
6. Alice may see that the content is hidden locally.
7. A local moderator may see the report.
8. A remote moderator may or may not receive the report.
9. Alice may or may not receive follow-up feedback.

### Machine Context

The journey may involve:

* local report storage,
* optional forwarding,
* remote moderation systems,
* privacy boundaries,
* policy differences,
* local-only action,
* remote action,
* no feedback by design.

### Questions for the Spec

* Can UJG model a user-facing report flow without requiring visibility into remote moderation internals?
* Can local-only outcomes be represented clearly?
* Can a user be intentionally shielded from backend moderation details?
* Can privacy boundaries be attached to evidence and runtime traces?
* Can UJG represent that “report submitted” is not the same as “remote authority acted”?

---

## Required Review Output

The reviewer should produce:

1. Which existing UJG concepts already support these human-facing distributed journeys.
2. Which current Distributed Journey terms risk becoming too machine-state-centric.
3. Which terms should be clarified to preserve the human/machine perspective.
4. Which terms should be renamed, constrained, or moved to Evidence/Artifact rather than Graph.
5. Minimal normative text that keeps the module human-facing.
6. Minimal JSON-LD vocabulary additions.
7. Minimal SHACL validation rules.
8. At least three example UJG documents:

   * Nextcloud federated file sharing,
   * federated account migration,
   * remote follow/subscription.
9. Explanation of how simple single-site form/checkout journeys remain unaffected.

---

## Vocabulary to Evaluate

### Keep, but clarify

* `Authority`
* `AuthorityBoundary`
* `Origin`
* `DistributedOperation`
* `DistributedArtifact`
* `ProtocolMessage`
* `ObservationScope`
* `ConsistencyExpectation`
* `PartialSuccess`

### Potentially rename or generalize

`FederatedArtifact` may be too protocol-specific.

Consider:

```text
DistributedArtifact
CrossAuthorityArtifact
```

`PortabilityClaim` may be too narrow for file sharing and permissions.

Consider:

```text
CrossAuthorityClaim
```

with optional subtypes:

```text
PortabilityClaim
AccessClaim
DeliveryClaim
VisibilityClaim
ConsistencyClaim
```

### Terms that must stay human-facing

`PropagationState` should not describe hidden server truth by default.

It should describe the user-relevant status of a cross-authority outcome, such as:

```text
pending
visible-to-source-user
visible-to-target-user
accepted-by-target-user
rejected-by-target-user
unavailable-to-user
partially-available
revoked
failed
```

---

## Proposed Normative Text

Distributed Journey terms MUST NOT be interpreted as replacing the human-facing UJG Journey graph. A UJG Journey remains a model of human interaction with machine-presented surfaces, affordances, responses, statuses, errors, and outcomes.

A Distributed Journey describes a human-facing journey whose visible states or outcomes depend on more than one independently operated authority.

A `ProtocolMessage`, `DistributedOperation`, or `DistributedArtifact` SHOULD NOT be modeled as a Journey `State` unless it is directly exposed to a human as a visible status, confirmation, error, affordance, unavailable action, recovery path, or outcome.

An `Authority` identifies the system boundary responsible for presenting, controlling, observing, or evidencing a human-facing surface, action, state, artifact, or outcome. It MUST NOT be interpreted as a statement of what a server internally believes.

A distributed module MAY attach machine-level evidence to a human-facing state or action. Such evidence MAY include API responses, logs, protocol messages, screenshots, browser traces, or manual observations, but the evidence does not replace the human-facing state.

When a journey crosses authorities, the module SHOULD allow incomplete evidence. No single authority is required to observe the entire journey.

When a system presents success to a human, the module SHOULD allow that success to be qualified by pending, partial, unavailable, revoked, or inconsistent downstream human-visible outcomes.

---

## Minimal Conformance Questions

A UJG Distributed Journey implementation should answer:

1. Who is the human actor?
2. Which machine surface does the human interact with?
3. Which authority presents or controls that surface?
4. What action does the human perform?
5. What visible response does the machine present?
6. Does the visible response depend on another authority?
7. Is the cross-authority dependency visible, hidden, pending, failed, or partial?
8. What evidence supports the visible state?
9. What can the human do next?
10. What limitation, warning, or recovery path is shown?

If the model cannot answer these questions, it is drifting away from UJG’s human/machine perspective.

---

## Main Specification Challenge

In a normal UJG webpage journey, the spec can usually express:

```text
The user interacts with Surface A, performs Action X, and reaches visible State B.
```

In a distributed UJG journey, the spec must express:

```text
The user interacts with Surface A controlled by Authority 1, performs Action X, and receives a visible response whose completion, limitation, or later availability depends on another machine authority. The journey remains human-facing, while protocol messages, distributed artifacts, and runtime observations provide supporting evidence.
```

The smallest successful Distributed Journey module is the one that makes this possible without turning UJG into a general-purpose distributed systems modeling language.
