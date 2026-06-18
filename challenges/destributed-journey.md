You are reviewing the OpenUJG Editor’s Draft at ./specs/ed.

Current UJG assumption to challenge:
UJG currently works well for a single website, product, checkout, or form flow where one application owns the surfaces, states, transitions, submits, validation errors, and runtime events.

Challenge:
Can UJG also describe a distributed/federated user journey where no single website owns the whole journey?

Evaluate whether UJG can support an optional module for “Federated / Multi-Origin / Portability Journeys”.

Core idea:
A federated journey is a user journey where one user intention crosses multiple independently operated systems, for example:
- old server and new server
- local instance and remote instance
- user-facing UI and server-to-server ActivityPub delivery
- export system and import system
- identity provider and consuming application
- local moderation UI and remote moderation target

The module should not redefine UJG Core, Graph, Runtime, Mapping, or Metrics. It should extend them with optional vocabulary for cross-server, cross-origin, asynchronous, and partially observable journeys.

Use case 1: Account migration between federated servers
A user wants to move from alice@old.example to alice@new.example.

Expected journey:
1. User logs into old server.
2. User requests data export.
3. Old server prepares archive or export artifact.
4. User creates or logs into account on new server.
5. User creates account alias or migration intent.
6. New server imports supported data.
7. Old server redirects profile to new account.
8. Followers or subscriptions are moved where supported.
9. User receives confirmation.
10. Some data may not be portable, such as old posts, media, settings, private messages, or moderation history.

Questions for UJG:
- Can one Journey contain states owned by different authorities?
- Can a State or Surface declare which server/origin/application owns it?
- Can UJG represent that one step happens on old.example and another on new.example?
- Can UJG model an export artifact produced by one system and consumed by another?
- Can UJG express that some artifacts are portable and others are non-portable?
- Can UJG model partial migration success?
- Can UJG model user-visible success while server-to-server propagation is still pending?
- Can Runtime events be recorded by different systems and later merged?
- Can Mapping compare an expected migration graph against incomplete runtime evidence?

Use case 2: Remote follow / subscription
A user on local.example follows a remote actor or community on remote.example.

Expected journey:
1. User searches for remote actor/community.
2. Local server resolves the remote identifier.
3. Local server fetches remote profile/community metadata.
4. User clicks follow/subscribe.
5. Local server sends federation request.
6. Remote server accepts, rejects, or delays the request.
7. Local UI shows pending/accepted/failed state.
8. Future remote updates appear in the local feed.

Questions for UJG:
- Can UJG separate user-facing states from server-to-server protocol states?
- Can a Transition be asynchronous?
- Can a Transition have pending, accepted, rejected, timeout, or retry outcomes?
- Can UJG represent remote authority policy, such as allowlist/blocklist?
- Can UJG represent that the user’s visible journey depends on remote server behavior?
- Can Runtime represent events observed locally, remotely, or inferred from protocol messages?

Use case 3: Federated media publishing
A creator publishes a video on one server and expects users on other servers to discover and watch it.

Expected journey:
1. Creator uploads media.
2. Local server validates file.
3. Local server queues processing/transcoding.
4. Processing may be done by a worker or remote runner.
5. Video becomes locally available.
6. Local server announces video to followers or federated peers.
7. Remote server receives the activity.
8. Remote user discovers/searches/follows/watches the video.
9. Reports or moderation actions may happen locally or remotely.

Questions for UJG:
- Can UJG model infrastructure steps that are not direct UI steps but affect user experience?
- Can UJG model queued/background work?
- Can UJG represent job failure and retry?
- Can UJG connect creator journey and viewer journey as related but separate journeys?
- Can UJG represent that the same content has local and remote representations?
- Can UJG compare “published locally” versus “discoverable remotely”?

Use case 4: Federated file sharing
A user on server A shares a file with a user on server B.

Expected journey:
1. User selects file.
2. User enters remote recipient identifier.
3. Server A resolves server B.
4. Server A creates federated share invitation.
5. Server B receives invitation.
6. Remote user accepts or rejects.
7. Shared file appears in remote user’s files.
8. Permissions, expiration, password, and revocation are enforced.
9. Server A and B may disagree about state if delivery fails.

Questions for UJG:
- Can UJG represent shared state across two servers?
- Can UJG model permissions as part of the journey?
- Can UJG model revocation after success?
- Can UJG represent inconsistent state between two systems?
- Can UJG distinguish “local success” from “remote accepted”?

Use case 5: Cross-instance moderation/reporting
A user reports content that originated on another server.

Expected journey:
1. User views remote content through local server.
2. User submits report.
3. Local server stores report.
4. Local moderator may act locally.
5. Report may optionally be forwarded to remote server.
6. Remote server may accept, ignore, reject, or act on the report.
7. User may or may not receive feedback.
8. Content may be hidden locally but still exist remotely.

Questions for UJG:
- Can UJG represent actions whose effect is local-only, remote-only, or both?
- Can UJG represent multiple authorities with different policy decisions?
- Can UJG represent privacy boundaries around reports?
- Can UJG model journeys where the user is intentionally not shown all backend outcomes?

Required output:
1. Identify which current UJG concepts already cover these cases.
2. Identify which concepts are missing or ambiguous.
3. Decide whether this should be a first-level optional module, second-level module, or only an implementation profile.
4. Propose minimal vocabulary for a “Federated Journey” optional module.
5. Propose JSON-LD terms, but keep them small.
6. Propose SHACL validation rules.
7. Propose 3 example UJG documents.
8. Explain how this module can remain compatible with simple webpage/form/checkout journeys.

Potential optional module terms to evaluate:
- Authority: an independently operated system responsible for a state, surface, event, artifact, or transition.
- Origin: web origin, server, instance, domain, or service boundary.
- RemoteActor: actor identifier controlled by another authority.
- FederatedArtifact: data produced by one authority and consumed by another, such as export archive, ActivityPub object, invite, token, share, or report.
- ProtocolMessage: server-to-server message that influences the user journey.
- AsyncTransition: transition whose result may be pending, accepted, rejected, timed out, retried, or partially completed.
- PropagationState: local-only, remote-pending, remote-accepted, remote-rejected, partially-propagated, globally-observed.
- PortabilityClaim: statement about what data or identity can move between systems.
- PortabilityGap: data, relationship, permission, media, settings, or history that cannot be moved.
- ObservationScope: whether a runtime event was observed locally, remotely, by the user agent, by server logs, or inferred.
- AuthorityBoundary: marks that a journey crosses from one system’s control into another.
- ConsistencyExpectation: expected relationship between local and remote state.
- PartialSuccess: journey result where the main goal is partly achieved but some claims are not fulfilled.

Important design constraints:
- Do not put federation-specific semantics into UJG Core.
- Do not require every UJG journey to know about federation.
- Keep simple website journeys simple.
- Make federation an optional module that can attach to Graph, Runtime, Mapping, Surface, or Data.
- Preserve UJG’s idea that the Journey is intent and Runtime is observed reality.
- Allow incomplete evidence: one server may not see the whole journey.
- Allow multiple runtime traces from different observers to be merged or compared.
- Allow privacy-preserving redaction of runtime payloads.
- Avoid assuming ActivityPub only; the model should also work for Nextcloud federation, Matrix-style federation, remote identity, or cross-domain SaaS flows.

Main specification challenge:
In a normal UJG webpage journey, one system can usually say:
“The user moved from State A to State B.”

In a federated UJG journey, the spec may need to express:
“The user intended to move from State A on Authority 1 to State B on Authority 2, but the transition depended on asynchronous protocol messages, remote policy, export/import artifacts, and partial observations from multiple systems.”

Evaluate whether the current UJG Editor’s Draft can express this cleanly. If not, design the smallest optional module that makes it possible.