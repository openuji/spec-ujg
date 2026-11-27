# UJG ED Observability Modeling

Use this skill together with `ujg-ed-modeling`. Do not use it as a replacement for the parent modeling skill.

## Source of truth

Use the active Editor's Draft unless the user explicitly asks for a dated snapshot:

`https://ujg.specs.openuji.org/ed/modules/observability`

Generate only terms defined by the active ED Observability context and required bridge modules unless the user explicitly requests an extension.

## Scope

Observability defines recognition contracts for `Surface` nodes. Use it when a surface needs browser, native, synthetic, or adapter-facing recognition through accessibility objects or custom locators.

Use Observability for:

- `ObservationBinding` nodes that bind recognition evidence to one `Surface`.
- `ObservationEvent` contracts such as presence or activation.
- `InputModality` and `InputModalityProfile` requirements declared by `ObservationEvent` nodes.
- `AccessibleLocator`, `AccessibleFeature`, and `AccessibleRelation` definitions.
- `SurfaceInstanceResolver` rules that identify repeated surface instances from accessible features.
- `CustomLocator` escape hatches with Core `extensions`.

Do not use Observability for Graph traversal, Runtime ordering, raw analytics payloads, test scripts, selector-only automation, authorization, server truth, queue state, or protocol state.

## Contexts

When using Observability terms, include Core, Surface, Localization, and Observability contexts:

```yaml
- https://ujg.specs.openuji.org/ed/ns/context.jsonld
- https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld
- https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld
- https://ujg.specs.openuji.org/ed/ns/observability.context.jsonld
```

Include Runtime context only when serializing actual `RuntimeEvent` or `JourneyExecution` nodes. Runtime correlation is derived through `RuntimeEvent.surfaceInstance -> SurfaceInstance.surface -> ObservationBinding.observeSurface`.

## Vocabulary

Use only these Observability classes:

```text
ObservationBinding
ObservationEvent
InputModality
InputModalityProfile
AccessibleLocator
AccessibleFeature
AccessibleRelation
CustomLocator
SurfaceInstanceResolver
```

Use only these Observability properties:

```text
observeSurface
observationEvent
requiredInputModalityProfiles
inputModalities
locators
surfaceInstanceResolver
expectedMatchCount
instanceKeyFeature
role
accessibleName
accessibleDescription
accessibleFeatures
accessibleRelations
contextLocators
accessibleFeatureName
accessibleFeatureValue
accessibleRelationType
targetLocator
```

Do not invent:

```text
selector
cssSelector
xpath
playwrightLocator
testId
runtimeEventRef
surfaceInstance
observedAt
collectorRef
assertion
apiProbe
waitFor
```

Use private `extensions` only on `CustomLocator` nodes or other UJG nodes for adapter-specific details that are not interoperable Observability semantics.

## Binding model

An `ObservationBinding` must identify exactly one `Surface` with `observeSurface`.

It must identify one `ObservationEvent` with `observationEvent`.

It must list one or more locators with `locators`. Locators inside one binding are conjunctive; model alternatives as separate bindings pointing to the same surface.

It may declare `expectedMatchCount` as an exact non-negative integer for the full conjunctive locator match. Use `expectedMatchCount: 0` when the exact locator contract should find no matching objects. If `expectedMatchCount` is omitted, do not infer exact cardinality.

Input-modality profile references belong to the referenced `ObservationEvent`, not to `ObservationBinding`, Graph `Command`, or Graph `Transition`.

An `ObservationEvent` may list input-modality profiles with `requiredInputModalityProfiles`.

An `InputModalityProfile` must list one or more modalities with `inputModalities`. All referenced modalities participate in that independently evaluable profile. Do not infer ordering from array order.

Use producer-defined IRIs for concrete `ObservationEvent` nodes. Use `ujgobservability:keyboard` and `ujgobservability:pointer` for standard keyboard and pointer input modalities. Producers may define additional modality IRIs for other input modalities.

## Accessible locators

Prefer `AccessibleLocator` for human-facing UI. Model accessible-object semantics, not DOM structure, CSS selectors, raw text, or tool-specific query syntax.

An `AccessibleLocator` must provide at least one of:

```text
role
accessibleName
accessibleDescription
accessibleFeatures
accessibleRelations
contextLocators
```

Use `accessibleName` and `accessibleDescription` to point to Localization `MessageMeta` nodes.

Use `AccessibleFeature` for accessibility-model states and properties such as `selected`, `expanded`, `disabled`, `checked`, `pressed`, `current`, `invalid`, `required`, `busy`, or `hidden`.

Use `AccessibleRelation` for accessibility-model relations such as `controls`, `labelled-by`, `described-by`, `owns`, `active-descendant`, `details`, or `error-message`.

Use `contextLocators` to scope a locator by surrounding accessible objects. Multiple context locators are conjunctive.

## Surface instance resolution

Use `SurfaceInstanceResolver` when the same stable `Surface` can appear in repeated concrete occurrences and an adapter needs a stable instance key.

`SurfaceInstanceResolver.instanceKeyFeature` must point to one `AccessibleFeature` that supplies the instance key source.

A resolver must not point to concrete `SurfaceInstance` nodes and must not require one binding per repeated occurrence.

For the member State of a Graph `StateCollection`, use a resolver key that distinguishes members, so each member gets its own SurfaceInstance and keeps it while it exists. Mapping tells members apart by that SurfaceInstance.

## Custom locators

Use `CustomLocator` when interoperable accessible-object recognition is not enough.

Put adapter-specific semantics in Core `extensions`. Keep them namespaced and opaque to consumers that do not understand the extension.

Do not promote project-specific selectors or Playwright expressions into Observability vocabulary.

## Separation rules

Observability does not define `graphNode`, `surface`, `surfaceInstance`, or touchpoint boundary assignment such as `journeys`. Those are Surface and Runtime terms.

Observability has no direct dependency on Runtime. Runtime events do not need to reference `ObservationBinding`.

Do not model automation commands, screenshots, API probes, timestamps, execution order, payloads, or click facts as Observability terms. Use Runtime for observed events and private extensions for adapter details.

For invocation modality profile references, model the Graph topology with Graph, attach
`command` from the relevant `Transition`, `OutgoingTransition`, or `InvokingTransition` to a `Command`, attach a
`Surface` to that `Command`, bind recognition with `ObservationBinding`, and put input-modality
profile references on the referenced `ObservationEvent`.

## Checks before answering

* Did I include Observability context only when Observability terms are used?
* Does every `ObservationBinding` identify one `Surface`?
* Does every binding identify one `ObservationEvent`?
* Does every binding list at least one locator?
* Are input-modality profile references declared on `ObservationEvent`, not on `ObservationBinding`, Graph `Command`, or other Graph nodes?
* Does every `InputModalityProfile` list at least one `InputModality`?
* Did I use producer-defined concrete event IRIs, standard `ujgobservability:keyboard` / `ujgobservability:pointer` modality IRIs where applicable, and producer-defined modality IRIs only for additional modalities?
* If a binding asserts absence, did it keep `locators` and use `expectedMatchCount: 0`?
* Are alternative locator strategies separate bindings rather than one disjunctive binding?
* Do accessible names and descriptions point to `MessageMeta` nodes?
* Are role, feature, and relation names accessibility-model oriented?
* Does each `SurfaceInstanceResolver` point to one `AccessibleFeature`, not a `SurfaceInstance`?
* Did I keep Runtime correlation derived rather than adding an Observability-to-Runtime reference?
* Do invocation affordance bindings observe Surfaces attached to Commands?
* Did Observability avoid changing Graph traversal or Surface identity?

## Current ED authoring and source scope

Use the current canonical property names and matching vocabulary IRIs. Retired terms are not
aliases. Prefer nested YAML-LD; accept flat or nested JSON-LD and YAML-LD under the same module
semantics. Do not change instance identity when changing serialization or filenames.

Resolve imports against each source location independently of `@base`; ordinary node identities
and references follow standard JSON-LD base rules. Unknown JSON payloads remain opaque.

Consult `references/authoring-terms.json` for canonical mappings and
`references/specs/authoring/index.md` with its accompanying YAML fixtures for the complete style.
