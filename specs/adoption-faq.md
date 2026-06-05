# Adoption FAQ

This FAQ explains how User Journey Graphs can be adopted in real product organizations without
replacing existing websites, apps, analytics stacks, design systems, or experimentation platforms.

UJG is not a frontend framework. It is a machine-readable journey model that can align design
intent, implementation, runtime observation, and validation.

## Is UJG deployable in large companies?

Yes, but usually not as a full runtime replacement.

In large companies, UJG is most realistic as an overlay:

```text
existing app
+ stable journey identifiers
+ state and surface references
+ runtime exposure events
+ design-system bindings
+ conformance checks
```

The existing stack remains in place. UJG adds a semantic layer that helps teams answer:

* What journey state was intended?
* What surface was actually exposed?
* Which variant did the user see?
* Which design-system component or pattern was used?
* Did the implementation match the intended journey?
* Where does the real journey diverge from the designed journey?

UJG should not try to own rendering. It should own journey identity and alignment.

## Would a company like Booking, Uber, or Airbnb replace its frontend with UJG?

Probably not.

Large product companies already have mature systems:

* web frontends
* native mobile apps
* microfrontends
* backend-for-frontend layers
* feature flags
* experimentation platforms
* analytics pipelines
* design systems
* localization systems
* CMS and content platforms
* observability tooling
* team-specific deployment pipelines

A successful UJG adoption should not require replacing those systems.

The realistic adoption path is:

```text
Do not replace the stack.
Instrument the stack.
Describe important journeys.
Emit UJG-compatible runtime events.
Validate whether implementation and behavior match the intended graph.
```

## What would make UJG acceptable to a large company?

A large company would likely need these answers:

| Question                              | Acceptable answer                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| Does UJG require rewriting the app?   | No.                                                                                  |
| Does UJG replace routing?             | No.                                                                                  |
| Does UJG replace analytics?           | No, it enriches analytics with journey semantics.                                    |
| Does UJG replace feature flags?       | No, it records resolved assignments and exposed variants.                            |
| Does UJG replace the design system?   | No, it can reference design-system patterns, components, and tokens.                 |
| Does UJG add runtime latency?         | It should not; runtime integration should be lightweight metadata and event emission. |
| Can teams adopt it gradually?         | Yes, journey by journey or surface by surface.                                       |
| Can it fail safely?                   | Yes, the app should still render if UJG metadata is missing.                         |
| Can it support web and native apps?   | Yes, with SDKs or adapters for each platform.                                        |
| Can it validate implementation drift? | Yes, if state, surface, and runtime events are consistently emitted.                 |

The adoption message should be:

```text
UJG is not a new app platform.
UJG is a shared journey contract and observability layer.
```

## What is the strongest enterprise use case?

The strongest use case is not the homepage or the entire product surface. It is an operational
journey with measurable failures:

* account recovery
* checkout failure recovery
* payment failure
* refund request
* return flow
* subscription cancellation
* address correction
* support escalation
* vendor onboarding
* rider onboarding
* identity verification
* claim submission
* complaint handling

These flows are good candidates because they usually have:

* clear start and end states
* repeated failure points
* support cost
* compliance or audit needs
* cross-team ownership
* measurable drop-off
* design-system dependencies
* experimentation and localization complexity

UJG becomes valuable when it helps teams see where the intended journey, implemented journey, and
observed journey no longer match.

## What would adoption look like in a large company?

A practical enterprise rollout can happen in levels.

### Level 1: Journey documentation

A team models a key journey as UJG.

Output:

* states
* transitions
* surfaces
* phases
* pain points
* known failure paths

Value:

* shared vocabulary
* better product/design/engineering alignment

Risk:

* can become stale if not connected to implementation

### Level 2: Runtime instrumentation

The app emits runtime events with UJG identifiers.

Example:

```json
{
  "stateRef": "urn:state:checkout-payment",
  "payload": {
    "action": "surface_exposed",
    "surfaceRef": "urn:surface:checkout-payment",
    "variant": "B",
    "realizationId": "payment-form.compact"
  }
}
```

Value:

* teams can see what was actually exposed
* analytics becomes journey-aware
* design intent can be compared with runtime behavior

Risk:

* requires instrumentation discipline

### Level 3: Design-system and experiment binding

A render plan resolves:

* state
* surface
* variant
* realization
* design-system component
* design-system component variant
* content keys
* accessibility rules

Value:

* teams can answer "what did we actually show?"
* design-system drift becomes visible
* A/B testing becomes easier to interpret

Risk:

* metadata must be maintained

### Level 4: CI and conformance checks

Build or CI checks verify that implementation references valid UJG objects.

Examples:

* every `stateRef` used in code exists in the UJG document
* every `surfaceRef` resolves
* every tracked exposure event includes a valid state
* every required journey state has instrumentation
* every design-system reference points to a known component or pattern

Value:

* prevents drift
* catches broken journey instrumentation early

Risk:

* overly strict validation can block teams if not introduced gradually

### Level 5: Runtime orchestration

The application uses UJG as a runtime control plane for rendering or navigation.

This is the hardest adoption level and should not be the first target.

Value:

* strongest source-of-truth model

Risk:

* high organizational and technical cost
* conflicts with existing routing, feature flag, and frontend systems
* difficult across web, iOS, Android, and backend-rendered surfaces

Most companies should start at Level 2 or Level 3, not Level 5.

## Is UJG useful for startups?

Yes, but the value is different.

Startups usually do not need heavy governance. They need speed, clarity, and fewer product mistakes.

UJG can help startups by providing:

* a clear model of critical flows
* better handoff between founder, designer, and engineer
* lightweight analytics semantics
* fewer ambiguous states
* easier onboarding for new team members
* reusable journey patterns as the product grows

Good startup use cases include onboarding, activation, checkout, subscription upgrades,
cancellation, invite flows, account setup, and the first successful task.

For startups, UJG should be lightweight:

```text
Model only the flows that matter.
Do not model the entire product.
Emit simple runtime events.
Use UJG to prevent confusion, not to create bureaucracy.
```

## Is UJG useful for agencies?

Yes. Agencies may be one of the strongest early audiences.

Agencies often create product journeys, prototypes, audits, service blueprints, design systems, and
implementation handoff documents for clients. UJG can make those deliverables more structured and
less disposable.

Agency use cases include:

* journey audit
* UX flow documentation
* design-system dependency mapping
* implementation handoff
* prototype-to-build alignment
* usability findings mapped to journey states
* redesign migration planning
* client workshops

For agencies, UJG can become a handoff artifact:

```text
not just screens,
not just a Figma file,
not just a journey map,
but a machine-readable journey contract.
```

This can help clients understand what states exist, which states are missing, where users can fail,
what components are needed, what events should be tracked, and where product decisions are
unresolved.

## Is UJG useful for design-system teams?

Yes, if UJG does not try to become the design system.

The useful integration is referencing design-system metadata from surfaces or render plans:

* pattern reference
* component reference
* component variant reference
* token references
* content key references
* accessibility rule references
* Storybook/Figma/repository references

This helps teams answer:

* which journeys use this component?
* which surfaces depend on this pattern?
* where is a deprecated component still exposed?
* which runtime events used which design-system variant?
* did an A/B test use approved design-system variants?

UJG should not define component trees or styling rules. It should reference design-system objects
where relevant.

## Is UJG useful for product analytics teams?

Yes, because it gives analytics events a stable journey context.

Typical analytics events answer:

```text
What happened?
```

UJG-enriched runtime events can also answer:

```text
Where in the intended journey did it happen?
Which surface was exposed?
Which variant was shown?
Which step did the user skip?
Which transition failed?
Which state caused support escalation?
```

This helps bridge the gap between product analytics and UX intent.

## Is UJG useful for engineers?

Yes, if it reduces ambiguity instead of adding ceremony.

Useful engineering applications:

* typed state and surface identifiers
* runtime event contracts
* validation in CI
* test fixtures for journeys
* mapping feature flags to exposed variants
* detecting missing instrumentation
* debugging inconsistent user flows
* linking UI surfaces to design-system references

Engineers should not be asked to manually maintain giant journey diagrams. UJG adoption should
provide SDKs, helper functions, tests, and validation tools.

## Is UJG useful for product managers?

Yes, because it makes product decisions explicit.

A UJG journey can show:

* what paths exist
* what paths are blocked
* what decisions cause branching
* where policy affects UX
* where support fallback exists
* which variants are being tested
* which states are not yet instrumented
* where implementation differs from the planned journey

For product managers, UJG is useful when it becomes a shared planning and validation artifact, not
only a technical format.

## Is UJG useful for UX researchers?

Yes, if research findings can be mapped to journey states.

Examples:

* pain point attached to a state
* usability issue attached to a transition
* confusion attached to a surface
* drop-off attached to an experience step
* quote or finding attached to a journey phase

This allows research findings to become more actionable:

```text
Not: users are confused in checkout.
But: users are confused at state checkout-payment-method when the saved-card fallback appears.
```

## Is UJG useful for UX research platforms?

Potentially yes, especially for tools that run usability studies, prototype tests, website tests,
surveys, interviews, session recordings, journey research, or research repositories.

For a UX research platform, UJG should not replace existing reports, dashboards, recordings,
transcripts, tags, or repositories. The useful role is narrower:

```text
UJG can act as an export and handover layer for journey-based research evidence.
```

A research tool could use UJG to represent:

* the intended journey or task flow
* observed participant paths
* task success, failure, or abandonment
* friction points and usability issues
* quotes, clips, notes, or findings attached to journey states
* differences between the designed journey and the observed journey
* aggregate metrics for a journey, state, transition, or surface

This could make research outputs easier to reuse outside the research tool.

Examples:

* a product manager can see which journey state caused confusion
* an engineer can see which surface or transition failed
* an analytics team can compare observed study behavior with production behavior
* an AI tool can summarize findings against a structured journey model
* a client or stakeholder can receive a machine-readable handover, not only a PDF report

The adoption path should be lightweight.

A research platform does not need to implement UJG as a runtime system. A realistic first step could
be an optional export for one study type:

```text
study task
+ intended task flow
+ observed participant paths
+ task outcomes
+ friction points
+ selected evidence
= UJG-compatible research handover
```

For research platforms, UJG is most useful when it makes research findings portable without
commoditizing the whole research product.


## Is UJG useful for legal, compliance, or trust teams?

Potentially yes, especially in regulated or high-risk flows.

Examples:

* consent journeys
* cancellation flows
* refund and return flows
* identity verification
* age verification
* complaint handling
* payment authorization
* terms acceptance

UJG can help show:

* what the user was shown
* which state contained a required disclosure
* which surface was exposed
* which variant was active
* which runtime event confirms exposure

This is not a replacement for legal audit systems, but it can provide useful structured evidence.
For AI-specific governance concerns, see [AI Governance FAQ](/ai-governance-faq).

## What should UJG not try to do?

UJG should not try to be:

* a frontend framework
* a design tool replacement
* a feature flag platform
* an analytics platform
* a CMS
* a workflow engine
* a design-system component registry
* a product management tool
* a complete process-mining system

UJG should integrate with those systems by providing stable journey semantics.

## What are the biggest adoption risks?

### 1. Too much modeling

If teams try to model every tiny UI detail, UJG becomes heavy and unusable.

Better:

```text
Model meaningful journey states and surfaces.
Keep low-level rendering details in existing tools.
```

### 2. No runtime connection

If UJG stays as documentation only, it can become stale.

Better:

```text
Connect important states to runtime exposure events.
```

### 3. No ownership

If no team owns a journey graph, it will decay.

Better:

```text
Start with one flow and one accountable team.
```

### 4. Fighting existing tools

If UJG tries to replace feature flags, analytics, routing, or design systems, adoption becomes harder.

Better:

```text
Use UJG as a semantic bridge between existing systems.
```

### 5. Overclaiming standard maturity

If UJG is still evolving, it should be presented honestly.

Better:

```text
Use it for prototypes, pilots, and incremental adoption first.
```

For governance concerns around AI-assisted design, generation, validation, or observation, see
[AI Governance FAQ](/ai-governance-faq).

## What is the recommended first pilot?

A good first pilot should be:

* important
* bounded
* measurable
* cross-functional
* currently painful
* small enough to instrument in weeks, not quarters

Strong candidates:

* refund request
* account recovery
* payment failure
* cancellation
* support escalation
* onboarding completion

The pilot should produce:

* a UJG journey file
* state and surface identifiers
* runtime exposure events
* a simple dashboard or log view
* one or two validation checks
* a short report comparing intended and observed journey behavior

## What is the minimum viable UJG integration?

A minimum viable integration only needs:

1. stable `stateRef`
2. stable `surfaceRef`
3. exposure event when the surface is shown
4. optional variant and realization identifiers
5. optional design-system binding
6. a way to compare emitted events with the intended journey

Example:

```json
{
  "stateRef": "urn:state:refund-form",
  "payload": {
    "action": "surface_exposed",
    "surfaceRef": "urn:surface:refund-form",
    "variant": "B",
    "realizationId": "refund-form.compact"
  }
}
```

That is enough to start.

## How should teams think about maturity?

UJG adoption can mature gradually:

```text
Level 1: static journey model
Level 2: runtime exposure events
Level 3: variant and design-system binding
Level 4: conformance checks
Level 5: orchestration or runtime control
```

Most teams should start at Level 2.

Level 5 is optional and may never be necessary.

## What is the simplest adoption message?

UJG should not replace your stack.

UJG should make your stack observable in journey terms.

```text
Design defines the intended journey.
Engineering exposes state and surface identifiers.
Runtime records what users actually saw.
Analytics and validation compare intended vs actual.
```

That is the deployable version.
