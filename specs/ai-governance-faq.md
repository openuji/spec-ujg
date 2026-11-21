# AI Governance

This page explains how User Journey Graphs can be used to constrain, validate, review, and audit
AI-generated product artifacts.

UJG should not be presented as a complete AI governance framework. Instead, UJG can provide a
machine-readable product-journey contract that AI systems must follow when generating flows, UI
surfaces, variants, copy, instrumentation, tests, or implementation code.

For general rollout and enterprise adoption concerns, see [Adoption FAQ](/adoption-faq). 

## What problem does UJG solve for AI-assisted product work?

AI tools can generate product artifacts quickly, but speed creates a governance problem:

```text
AI can generate screens, flows, copy, variants, tests, and code
without knowing whether they match the approved product journey.
```

UJG can help by making the approved journey explicit and machine-readable.

With UJG, an AI system can be constrained by:

* allowed journeys
* allowed states
* allowed transitions
* allowed surfaces
* required runtime events
* approved design-system bindings
* required fallback paths
* required policy or compliance steps

The goal is not to stop AI generation. The goal is to ensure generated artifacts stay aligned with
the approved journey contract.

## What is the core idea?

Without UJG:

```text
AI generates:
- screens
- flows
- copy
- tracking events
- variants
- components
- tests

But there is no stable journey contract.
```

With UJG:

```text
AI is only allowed to generate artifacts that conform to:
- known Journey
- known State
- known Transition
- known Surface
- known variant rules
- known design-system bindings
- known runtime event contracts
```

UJG becomes a constraint system around AI-generated product work.

## What can UJG govern?

UJG can help govern AI-generated product artifacts such as:

* UX flows
* journey states
* transitions
* screens or surfaces
* page regions or composite-state slots
* render variants
* design-system bindings
* product copy
* analytics instrumentation
* runtime tracking events
* test cases
* journey documentation
* implementation scaffolds

The useful scope is:

```text
AI-generated product artifacts that should align with an approved journey graph.
```

## What can UJG not govern?

UJG is not a complete AI governance framework.

By itself, UJG does not govern:

* model training data
* model bias
* foundation-model safety
* privacy compliance
* copyright compliance
* security of the model provider
* prompt injection
* data retention
* human oversight obligations
* organization-wide AI policy
* high-risk AI classification
* employment, credit, health, or legal decisioning
* systemic AI risk

The safer claim is:

```text
UJG can govern AI-generated product artifacts against an approved journey contract.
```

Not:

```text
UJG is a complete AI governance framework.
```

## What is the generate-or-propose principle?

A useful rule for AI-assisted product development is:

```text
If the requested artifact fits the approved UJG:
  generate it.

If it changes the journey semantics:
  do not silently generate implementation.
  propose a UJG change instead.
```

Example: a user asks an AI assistant:

```text
Add a one-click refund approval state after the refund form.
```

The current UJG requires:

```text
refund-form -> eligibility-check -> approved | rejected | manual-review
```

The AI should not silently generate:

```text
refund-form -> approved
```

Instead, it should respond with a proposed graph change:

```text
This request changes the journey semantics.
The current graph requires an eligibility check before approval.
I will create a UJG change proposal instead of modifying the UI directly.
```

This is the governance mechanism.

## How should AI-generated UX flows be handled?

An AI system may be asked to generate a new flow:

```text
Generate the refund request flow.
```

A UJG validator can check:

* Did it use only approved `stateRef`s?
* Did it preserve required transitions?
* Did it include required fallback states?
* Did it remove a mandatory compliance step?
* Did it create an untracked dead end?
* Did it invent states not present in the approved graph?
* Did it skip required support or manual-review paths?

If the AI creates:

```text
refund-form -> refund-success
```

but the approved graph requires:

```text
refund-form -> eligibility-check -> approved | rejected | manual-review
```

then the output should fail validation or become a graph-change proposal.

## How should AI-generated UI surfaces be handled?

AI-generated UI should bind to known journey objects.

Example rule:

```text
Every generated page, screen, or component surface must declare:
- stateRef
- surfaceRef
- designSystem.componentRef
- runtime exposure event
```

A generated component should be rejected if it renders a user-facing surface without a valid
exposure event.

Example required instrumentation:

```ts
trackStateExposure(renderPlan, userId)
```

The generated implementation should not invent new state or surface identifiers unless it is
explicitly creating a proposed graph change.

## How should AI-generated variants be handled?

AI tools often create variants casually:

```text
Variant A: short form
Variant B: conversational form
Variant C: promotional form
```

UJG governance can define what variants are allowed to change.

Recommended rule:

```text
Variants may change presentation.
Variants may not change journey semantics unless modeled as separate states.
Variants must preserve required disclosures.
Variants must emit the same runtime contract.
Variants must bind to approved design-system references.
```

If a variant only changes copy, layout, density, or component realization, it can remain a surface
realization.

If a variant changes available actions, required steps, eligibility logic, or downstream
transitions, it should be modeled as a graph change.

## How should AI-generated copy be handled?

For copy generation, UJG can provide state-specific constraints.

Example:

```json
{
  "stateRef": "urn:state:refund-ineligible",
  "requiredIntent": "Explain why refund is unavailable",
  "mustInclude": [
    "reason",
    "next step",
    "support fallback"
  ],
  "mustNotInclude": [
    "guaranteed refund",
    "misleading urgency"
  ]
}
```

The AI-generated copy can then be checked against the state contract.

This is especially useful for:

* refunds
* returns
* cancellation
* consent
* pricing
* legal disclosure
* support escalation
* payment failure
* identity verification

## How should AI-generated analytics instrumentation be handled?

AI-generated code should emit known runtime events.

Possible rules:

```text
Every exposed surface must emit surface_exposed.
Every exposed surface event must include stateRef.
Every exposed surface event must include surfaceRef.
Every variant exposure must include variant and realizationId.
Every experiment exposure must include assignmentId.
Every fallback must include fallback metadata.
Every design-system-bound surface should include componentRef or componentVariantRef.
```

This turns UJG into a tracking contract.

Generated code should fail validation if it renders a state without emitting the required runtime
event.

## How can UJG support AI-generated tests?

UJG can be used to generate tests.

For every state, an AI assistant can generate tests such as:

* the surface renders
* the exposure event is emitted
* the event includes the correct `stateRef`
* the event includes the correct `surfaceRef`
* the required transition controls exist
* fallback states are reachable
* variants preserve runtime tracking integrity
* required design-system bindings are present

For every transition, it can generate tests such as:

* the transition can be triggered
* the target state exists
* blocked transitions show the expected fallback or error state
* invalid transitions are not silently allowed

This is one of the most practical governance applications.

## How should teams prompt with UJG contracts?

Internal AI tools can require a UJG contract in every generation prompt.

Example prompt pattern:

```text
You must generate only artifacts aligned with the supplied UJG contract.

Allowed stateRefs:
- urn:state:refund-form
- urn:state:eligibility-check
- urn:state:refund-approved
- urn:state:refund-rejected
- urn:state:manual-review

Allowed surfaceRefs:
- urn:surface:refund-form
- urn:surface:eligibility-check
- urn:surface:refund-approved
- urn:surface:refund-rejected
- urn:surface:manual-review

Required transitions:
- refund-form -> eligibility-check
- eligibility-check -> refund-approved
- eligibility-check -> refund-rejected
- eligibility-check -> manual-review

Required runtime events:
- surface_exposed
- button_clicked
- transition_attempted

Allowed design-system components:
- RefundForm
- StatusBanner
- ErrorSummary
- SupportContactModule

Do not invent states, surfaces, transitions, or event names.

If the requested change requires a new journey state or transition,
output a UJG change proposal instead of implementation code.
```

This converts UJG from documentation into an AI-generation boundary.

## How should AI-generated artifacts be validated?

A validator can check AI-generated artifacts at multiple levels.

### Flow validation

* Uses only known states
* Uses only known transitions
* Preserves required states
* Preserves required fallback paths
* Does not introduce dead ends
* Does not skip required compliance steps

### Surface validation

* Uses known `surfaceRef`
* Binds to expected `stateRef`
* Emits required exposure event
* Uses allowed design-system component
* Includes required accessibility references

### Variant validation

* Variant exists in the allowed realization set
* Variant does not change journey semantics unless modeled as graph structure
* Variant preserves required runtime event contract
* Variant preserves required disclosures
* Variant binds to approved design-system references

### Copy validation

* Includes required content
* Avoids forbidden claims
* Matches the purpose of the state
* Preserves legal or policy requirements
* Provides a next step when needed

### Instrumentation validation

* Emits `surface_exposed`
* Includes `stateRef`
* Includes `surfaceRef`
* Includes variant metadata when relevant
* Includes design-system metadata when relevant
* Uses known event names

### Test validation

* Covers required states
* Covers required transitions
* Covers failure paths
* Covers fallback behavior
* Covers variant tracking integrity

## What does a governance rule look like?

```json
{
  "ruleId": "refund-form-must-track-exposure",
  "appliesTo": {
    "stateRef": "urn:ujg:state:refund-form"
  },
  "requires": {
    "surfaceRef": "urn:ujg:surface:refund-form",
    "runtimeEvent": {
      "action": "surface_exposed",
      "requiredPayload": [
        "surfaceRef",
        "variant",
        "realizationId",
        "assignmentId",
        "designSystem.componentRef"
      ]
    }
  },
  "failure": {
    "severity": "block",
    "message": "Generated refund form does not emit a valid surface_exposed RuntimeEvent."
  }
}
```

## What happens when an AI artifact is invalid?

An AI tool generates:

```json
{
  "generatedBy": "AI",
  "artifactType": "surface-materialization",
  "stateRef": "urn:ujg:state:refund-form",
  "surfaceRef": "urn:ujg:surface:refund-form",
  "variant": "C",
  "realizationId": "refund-form.promotional",
  "transitions": [
    "urn:ujg:transition:refund-form-to-success"
  ]
}
```

The validator responds:

```text
Invalid artifact.

Reasons:
- Variant C is not declared for urn:ujg:surface:refund-form.
- Transition urn:ujg:transition:refund-form-to-success is not allowed.
- The approved graph requires eligibility-check before success.
- Runtime surface_exposed contract is missing.
- Approved design-system componentRef is missing.

Action:
Create a UJG change proposal instead of implementation code.
```

## Why does runtime evidence matter?

Governance should not stop at generation time.

UJG can also help verify what was actually exposed to users.

Example runtime event:

```json
{
  "stateRef": "urn:ujg:state:refund-form",
  "payload": {
    "action": "surface_exposed",
    "surfaceRef": "urn:ujg:surface:refund-form",
    "variant": "B",
    "realizationId": "refund-form.compact",
    "assignmentId": "refund-layout-test:user-42:B",
    "designSystem": {
      "componentRef": "urn:ds:component:RefundForm",
      "componentVariantRef": "urn:ds:component-variant:RefundForm.compact"
    }
  }
}
```

This lets teams compare:

```text
What the AI generated
vs.
What was approved
vs.
What users actually saw
```

That is the audit loop.

## What human review workflow should teams use?

UJG can support human review by separating generation from approval.

A practical workflow:

```text
1. AI receives UJG contract.
2. AI generates artifact or graph-change proposal.
3. Validator checks artifact against UJG.
4. Passing artifacts can be reviewed normally.
5. Failing artifacts become proposed UJG changes.
6. Product/design/engineering/legal review graph changes.
7. Approved changes update the UJG registry.
8. Runtime tracking verifies what was exposed.
```

This avoids silent drift.

## Which teams use the UJG contract?

Different teams may use the same UJG contract for different checks.

### Product

* Does the generated artifact preserve the intended user journey?
* Does it introduce a new product decision?
* Does it change eligibility, pricing, or policy behavior?

### Design

* Does it preserve the intended experience?
* Does it use approved surfaces and patterns?
* Does it introduce unsupported UI states?

### Engineering

* Does it use valid state and surface identifiers?
* Does it emit required runtime events?
* Does it preserve transitions and error paths?

### Design system

* Does it use approved components?
* Does it use valid component variants?
* Does it reference required tokens and accessibility rules?

### Legal or compliance

* Does it preserve required disclosures?
* Does it remove required consent or cancellation steps?
* Does runtime tracking provide evidence of exposure?

## How can a UJG registry become an AI control boundary?

A UJG registry can provide the source of truth for AI tools.

It may contain:

* journey definitions
* state definitions
* transition definitions
* surface definitions
* composite-state slot contracts
* design-system references
* required runtime event contracts
* copy constraints
* policy constraints
* validation rules

AI tools should read from the registry before generating product artifacts.

If an artifact cannot be generated within the registry constraints, the AI should propose a registry
update instead.

## What architecture is recommended?

```text
UJG Registry
  stores approved journeys, states, surfaces, transitions, constraints

AI Generator
  creates UX flows, code, copy, tests, variants, instrumentation

UJG Validator
  checks generated artifacts against the graph

Design-System Validator
  checks component, pattern, token, and accessibility references

Policy Validator
  checks state-specific rules and required disclosures

Runtime Tracker
  records what was actually exposed

Review Dashboard
  shows approved, rejected, drifted, and untracked artifacts
```

This architecture keeps UJG focused on journey governance while integrating with existing tools.

## What is the rule for AI-generated variants?

A useful variant rule:

```text
If the variant changes presentation only:
  keep the same State and Surface.
  model the variant as a render realization.

If the variant changes available actions, transitions, required inputs,
eligibility, or recovery paths:
  model the change as separate States or Transitions.
```

This prevents AI-generated variants from silently changing the product journey.

## How should AI handle CompositeState layouts?

If a `CompositeState` is used as a page shell and child states are rendered into slots, AI-generated
changes should respect this boundary.

Recommended rule:

```text
CompositeState owns the page shell Surface.
Child States own their own child Surfaces.
Slot composition belongs to renderer metadata.
Children do not inherit the parent surface.
Parent and child exposures are tracked separately.
```

AI-generated page layouts should not collapse child state instrumentation into one parent event.

If the AI changes the page shell, it should update the composite surface materialization.

If the AI changes a child component, it should update that child state's surface materialization.

## How should AI respect design systems?

AI-generated UI must stay aligned with approved design-system references.

Possible checks:

* component exists
* component variant exists
* token references are valid
* content keys are valid
* accessibility rules are present
* deprecated components are not used
* custom one-off UI is not introduced without approval

Example design-system binding:

```json
{
  "designSystem": {
    "systemRef": "urn:ds:acme-design-system",
    "systemVersion": "3.4.0",
    "patternRef": "urn:ds:pattern:request-form",
    "componentRef": "urn:ds:component:RefundForm",
    "componentVariantRef": "urn:ds:component-variant:RefundForm.compact",
    "layoutRecipeRef": "urn:ds:recipe:form.compact"
  }
}
```

The AI should not invent design-system identifiers unless it is explicitly proposing a design-system
change.

## What instrumentation should AI-generated implementation emit?

AI-generated implementation should not render user-facing surfaces without observability.

Minimum required event:

```json
{
  "stateRef": "urn:ujg:state:example",
  "payload": {
    "action": "surface_exposed",
    "surfaceRef": "urn:ujg:surface:example"
  }
}
```

For variants, add:

```json
{
  "variant": "B",
  "realizationId": "example.compact",
  "assignmentId": "example-test:user-42:B"
}
```

For design-system-bound surfaces, add:

```json
{
  "designSystem": {
    "componentRef": "urn:ds:component:Example",
    "componentVariantRef": "urn:ds:component-variant:Example.compact"
  }
}
```

This makes AI-generated product behavior auditable.

## What is a minimal implementation?

A minimum viable AI-governance integration needs:

1. a UJG registry or document
2. an AI prompt that includes the relevant UJG contract
3. a validator that checks generated artifacts
4. a runtime tracker that records exposed states and surfaces
5. a review workflow for graph-change proposals

The minimum viable rule:

```text
Do not generate product behavior that is not represented in the approved UJG.
If behavior must change, propose a UJG change first.
```

## What limits and safety boundaries remain?

UJG can help constrain generated product artifacts, but it does not remove the need for broader
review.

Teams should still review:

* legal compliance
* privacy implications
* security implications
* accessibility quality
* user harm
* misleading copy
* dark patterns
* model hallucinations
* prompt-injection risks
* data retention and logging

UJG is one layer in a broader governance system.

## What is the short version?

UJG can be used as a governance layer for AI-generated product artifacts.

It can ensure that AI-generated journeys, states, surfaces, variants, copy, instrumentation, tests,
and implementation scaffolds remain aligned with the approved journey graph.

The key rule is:

```text
Generate if aligned.
Propose a graph change if not aligned.
```

That is the safe and deployable version.
