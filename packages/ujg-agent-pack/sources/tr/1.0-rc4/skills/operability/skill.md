# UJG TR 1.0 RC4 Operability Modeling

Use this skill together with `ujg-tr-1-0-rc4-modeling` and `ujg-tr-1-0-rc4-observability-modeling`. Do not use it as a replacement for either of them.

## Source of truth

Use the frozen UJG 1.0 RC4 snapshot unless the user explicitly requests another version:

`https://ujg.specs.openuji.org/tr/1.0-rc4/modules/operability`

Generate only terms defined by the UJG 1.0 RC4 Operability context and the modules it depends on, unless the user explicitly requests an extension.

## Scope

Operability describes how a user performs a Graph transition through an input modality. One Graph transition can have several `TransitionMaterialization` nodes, for example one by keyboard, one by pointer, and one by shortcut. Each materialization lists the steps the user takes: moving past the buttons in between, then activating the target.

Use Operability for:

- `TransitionMaterialization` nodes that describe one way to perform one `Transition`, `AdjacentTransition`, `OutgoingTransition`, or `InvokingTransition` through one `InputModality`.
- `MoveStep`, `ActivationStep`, and `ShortcutStep` nodes, linked one after another with `stepPreviousRef`.
- Platform-neutral `FocusMoveKind` values such as `operability:nextStop` and `operability:nextItem`, and `MoveKind` values for moves that do not move focus, such as `operability:pointAt` and `operability:nextPage`.
- `MaterializationDirection` values for the two movements of an `AdjacentTransition`.

Do not use Operability for Graph topology, recognition contracts, Runtime events, test scripts, key bindings, or timing.

This version covers moving between objects, activating them, and shortcuts. Do not model entering or selecting text, or changing a value, as Operability steps.

## Contexts

When using Operability terms, include Core, Surface, Localization, Observability, and Operability contexts:

```json
[
  "https://ujg.specs.openuji.org/tr/1.0-rc4/ns/context.jsonld",
  "https://ujg.specs.openuji.org/tr/1.0-rc4/ns/surface.context.jsonld",
  "https://ujg.specs.openuji.org/tr/1.0-rc4/ns/l10n.context.jsonld",
  "https://ujg.specs.openuji.org/tr/1.0-rc4/ns/observability.context.jsonld",
  "https://ujg.specs.openuji.org/tr/1.0-rc4/ns/operability.context.jsonld"
]
```

## Vocabulary

Use only these Operability classes:

```text
TransitionMaterialization
MoveStep
ActivationStep
ShortcutStep
FocusMoveKind
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
# FocusMoveKind: moves focus (keyboard and other focus-moving modalities)
operability:nextStop
operability:previousStop
operability:nextItem
operability:previousItem
operability:firstItem
operability:lastItem

# MoveKind: moves the pointer or the view, not focus
operability:pointAt
operability:nextPage
operability:previousPage

# MaterializationDirection
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
activationKey
activationGesture
typeText
```

Do not use ordered arrays for steps. Do not name concrete keys such as `Tab`, `ArrowRight`, or `Enter` in Operability terms; a platform adapter performs each move kind and activation with the gestures of its platform.

## Materialization model

A `TransitionMaterialization` must reference exactly one transition with `materializationTransitionRef`, exactly one `InputModality` with `materializationModalityRef`, and at least one step with `materializationStepRefs`.

Use `observability:keyboard` or `observability:pointer` for `materializationModalityRef` where they apply. A keyboard shortcut is often modeled as a keyboard materialization whose only step is a `ShortcutStep`, but the spec requires neither: a `ShortcutStep` can appear anywhere in a chain.

Do not materialize a `Transition` that declares `fromExitRef`. Reaching the child exit takes it, not a user action. Materialize the child Journey's `Transition` into that exit instead.

Several materializations of one transition are alternatives.

Use `materializationStartLocatorRef` to name the object the user is at before the first step when the start matters. Omit it when the start is not known.

Use `materializationSourceStateRef` only when the transition does not determine the State where the steps happen: for an entry transition, name a State that lists it in `entryTransitionRefs`; for a transition that leaves a `CompositeState`, name a State nested in it.

Use `materializationDirectionRef` exactly when the transition is an `AdjacentTransition`. `operability:forward` moves from `from` to `to`; `operability:backward` moves the other way. These are the only two directions; do not define others.

## Steps

- `MoveStep`: the user moves to another object, or moves the view by a page. Use `stepMoveKindRef` for its kind: a `FocusMoveKind` for focus moves, or a `MoveKind` (`operability:pointAt`, `operability:nextPage`, `operability:previousPage`) for moves that do not move focus. A pointer materialization uses `operability:pointAt`, never a focus move; `operability:pointAt` appears only in pointer materializations. A pointer click is a `pointAt` MoveStep followed by an `ActivationStep`.
- `ActivationStep`: the user activates the object they are at.
- `ShortcutStep`: the user performs the shortcut that the `stepLocatorRef` object exposes, without reaching it first.

Each step may name the object it reaches or acts on with `stepLocatorRef`, which references an Observability `AccessibleLocator` or `CustomLocator`. This detail is optional.

Link the steps with `stepPreviousRef`. Exactly one step has no `stepPreviousRef`; every other step names a step of the same materialization; no two steps name the same previous step; steps form no cycle. Each step belongs to exactly one materialization.

The last step takes the transition. Usually it is an `ActivationStep` or a `ShortcutStep`; it is a `MoveStep` when the move itself takes the transition, as in a tab list whose selection follows focus.

An `ActivationStep` performs the default action of the object the user is at; every activation gesture of the platform, such as Enter or Space, performs it, so do not say which. A gesture that does something else, such as Enter submitting the form around a focused checkbox, is a `ShortcutStep` on the object it acts on (the submit button), with its gesture from the accessibility API or a private hint in Core `extensions`. A `MoveStep` reaches what its kind designates: the next item for a focus move, the object its locator names for `operability:pointAt`, or the page that comes into view for a page move. Except with `pointAt`, its locator describes what the step reaches and does not choose it.

## Performing a materialization

A materialization is performable when every `MoveStep` names its kind, every `pointAt` MoveStep also names its object with `stepLocatorRef`, and every `ShortcutStep` names an object that exposes its shortcut or carries a private hint in Core `extensions`. An `ActivationStep` acts on the object the user is at and needs nothing more. A `pointAt` locator must match exactly one object when the step runs; a locator that names a kind of object, such as any tab of a collection, makes the pointer materialization descriptive only. When the user asks for a materialization that a runner can execute, make it performable. A descriptive materialization may leave these details out.

A synthetic runner that performs a materialization:

- checks the start object before the first step when `materializationStartLocatorRef` is present;
- checks before a `pointAt` MoveStep that its locator matches exactly one object, and never chooses among several;
- checks after each `MoveStep` that the move happened (focus or the pointer is at a different object, or the view shows a different page) and, when the step names an object, that what it reached matches the locator;
- checks before each `ActivationStep` that names an object that the user is at a matching object;
- checks after the last step that the transition was taken, recognizing the destination however it chooses, for example through an `ObservationBinding` for a `Surface` of the destination State;
- treats a failed check as a failed materialization;
- may choose any of the platform's activation gestures for an `ActivationStep`, and performs the step once per gesture to check several;
- never places focus programmatically and never fills in a missing detail.

Each materialization is its own claim. To check an `ObservationEvent` requirement, evaluate each required `InputModalityProfile` on its own: a profile that lists exactly one modality is met by one working materialization through that modality of a transition whose `commandRef` is the Command of the observed Surface. That says nothing about the other materializations. A binding observes a `Surface`, not a `Command`, and the binding references its event. Which materializations a runner performs, and how it reports results, is up to the runner, which names a materialization by its IRI.

## Separation rules

Buttons passed on the way are steps, not Graph States or transitions. When the user passes through another Graph State on the way, model each part as its own transition with its own materialization.

Operability does not change Graph traversal, Graph validity, Observability recognition, or `requiredInputModalityProfileRefs`.

When the transition has a `commandRef`, make the object that its last step reaches or acts on one that an `ObservationBinding` recognizes for a `Surface` of that `Command`.

Put concrete shortcut keys that are not exposed through the accessibility API in private Core `extensions`, never in Operability terms.

## Checks before answering

* Did I include the Operability context only when Operability terms are used?
* Does every `TransitionMaterialization` reference exactly one transition, one `InputModality`, and at least one step?
* Did I keep the Graph transition unchanged and add no States for buttons passed on the way?
* Does a path through another Graph State use separate transitions with their own materializations?
* Are steps ordered only through `stepPreviousRef`, with exactly one first step and no cycle?
* Does every step belong to exactly one materialization?
* Is `stepMoveKindRef` used only on `MoveStep`?
* Do pointer materializations move with `operability:pointAt` or page moves instead of `FocusMoveKind` values, and does `operability:pointAt` appear only in pointer materializations?
* Is `materializationDirectionRef` present exactly for `AdjacentTransition` materializations, with `operability:forward` or `operability:backward` only?
* Did I avoid materializing a `Transition` that declares `fromExitRef`?
* Is `materializationSourceStateRef` used only for entry transitions or transitions that leave a `CompositeState`?
* Did I avoid concrete keys, gestures, and ordered arrays?
* When the materialization is meant to be executed, is it performable: a kind on every `MoveStep`, a locator on every `pointAt` MoveStep that matches exactly one object, and an exposing object or hint for every `ShortcutStep`?
* Did I avoid modeling activation-gesture variants or text entry as Operability terms?
* Do step locators reference Observability locators, with names through `MessageMeta`?
