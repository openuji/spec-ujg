# UJG ED Operability Modeling

Use this skill together with `ujg-ed-modeling` and `ujg-ed-observability-modeling`. Do not use it as a replacement for either of them.

## Source of truth

Use the active Editor's Draft unless the user explicitly asks for a dated snapshot:

`https://ujg.specs.openuji.org/ed/modules/operability`

Generate only terms defined by the active ED Operability context and the modules it depends on, unless the user explicitly requests an extension.

## Scope

Operability describes how a user performs a Graph transition through an input modality. One Graph transition can have several `TransitionMaterialization` nodes, for example one by keyboard, one by pointer, and one by shortcut. Each materialization lists the steps the user takes: moving past the buttons in between, then activating the target.

Use Operability for:

- `TransitionMaterialization` nodes that describe one way to perform one `Transition`, `AdjacentTransition`, `OutgoingTransition`, or `InvokingTransition` through one `InputModality`.
- `MoveStep`, `ActivationStep`, and `ShortcutStep` nodes, linked one after another with `stepPreviousRef`.
- Platform-neutral `MoveKind` values such as `operability:nextStop` and `operability:nextItem`.
- `MaterializationDirection` values for the two movements of an `AdjacentTransition`.

Do not use Operability for Graph topology, recognition contracts, Runtime events, test scripts, key bindings, or timing.

## Contexts

When using Operability terms, include Core, Surface, Localization, Observability, and Operability contexts:

```json
[
  "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/observability.context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/operability.context.jsonld"
]
```

## Vocabulary

Use only these Operability classes:

```text
TransitionMaterialization
MoveStep
ActivationStep
ShortcutStep
MoveKind
MaterializationDirection
```

Use only these Operability properties:

```text
materializationTransitionRef
materializationModalityRef
materializationStepRefs
materializationStartLocatorRef
materializationSourceStateRef
materializationDirectionRef
stepPreviousRef
stepLocatorRef
stepMoveKindRef
```

Use these standard individuals:

```text
operability:nextStop
operability:previousStop
operability:nextItem
operability:previousItem
operability:firstItem
operability:lastItem
operability:forward
operability:backward
```

Do not invent:

```text
keyChord
key
keys
keyCode
modifiers
stepIndex
stepOrder
order
sequence
script
waitFor
focusTarget
selector
```

Do not use ordered arrays for steps. Do not name concrete keys such as `Tab`, `ArrowRight`, or `Enter` in Operability terms; a platform adapter performs each move kind and activation with the gestures of its platform.

## Materialization model

A `TransitionMaterialization` must reference exactly one transition with `materializationTransitionRef`, exactly one `InputModality` with `materializationModalityRef`, and at least one step with `materializationStepRefs`.

Use `observability:keyboard` or `observability:pointer` for `materializationModalityRef` where they apply. A shortcut materialization uses the keyboard modality and a single `ShortcutStep`.

Several materializations of one transition are alternatives.

Use `materializationStartLocatorRef` to name the object the user is at before the first step when the start matters. Omit it when the start is not known.

Use `materializationSourceStateRef` only when the transition does not determine the State where the steps happen: for an entry transition, name a State that lists it in `entryTransitionRefs`; for a transition that leaves a `CompositeState`, name a State nested in it.

Use `materializationDirectionRef` exactly when the transition is an `AdjacentTransition`. `operability:forward` moves from `from` to `to`; `operability:backward` moves the other way.

## Steps

- `MoveStep`: the user moves to another object. Use `stepMoveKindRef` for the kind of focus move.
- `ActivationStep`: the user activates the object they are at.
- `ShortcutStep`: the user performs the shortcut that the `stepLocatorRef` object exposes, without reaching it first.

Each step may name the object it reaches or acts on with `stepLocatorRef`, which references an Observability `AccessibleLocator` or `CustomLocator`. This detail is optional.

Link the steps with `stepPreviousRef`. Exactly one step has no `stepPreviousRef`; every other step names a step of the same materialization; no two steps name the same previous step; steps form no cycle. Each step belongs to exactly one materialization.

The last step takes the transition. Usually it is an `ActivationStep` or a `ShortcutStep`; it is a `MoveStep` when the move itself takes the transition, as in a tab list whose selection follows focus.

## Separation rules

Buttons passed on the way are steps, not Graph States or transitions. When the user passes through another Graph State on the way, model each part as its own transition with its own materialization.

Operability does not change Graph traversal, Graph validity, Observability recognition, or `requiredInputModalityProfileRefs`.

When the transition has a `commandRef`, make the object of its `ActivationStep` or `ShortcutStep` one that an `ObservationBinding` recognizes for a `Surface` of that `Command`.

Put concrete shortcut keys that are not exposed through the accessibility API in private Core `extensions`, never in Operability terms.

## Checks before answering

* Did I include the Operability context only when Operability terms are used?
* Does every `TransitionMaterialization` reference exactly one transition, one `InputModality`, and at least one step?
* Did I keep the Graph transition unchanged and add no States for buttons passed on the way?
* Does a path through another Graph State use separate transitions with their own materializations?
* Are steps ordered only through `stepPreviousRef`, with exactly one first step and no cycle?
* Does every step belong to exactly one materialization?
* Is `stepMoveKindRef` used only on `MoveStep`?
* Is `materializationDirectionRef` present exactly for `AdjacentTransition` materializations?
* Is `materializationSourceStateRef` used only for entry transitions or transitions that leave a `CompositeState`?
* Did I avoid concrete keys, gestures, and ordered arrays?
* Do step locators reference Observability locators, with names through `MessageMeta`?
