# UJG TR 2026.06 Graph Modeling Skill

Use this skill when the task is specifically about Graph vocabulary for the UJG Technical Report 2026.06 snapshot.

## Source of truth

Use the dated Technical Report Graph module:

`https://ujg.specs.openuji.org/tr/2026.06/graph`

Do not silently use active ED Graph terms when the user asks for TR 2026.06.

## Scope

Focus on intended topology: journey indexes, journeys, states, composite states, boundary states, transitions, exits, outgoing navigation, and shared outgoing groups.

Keep runtime observations, selectors, typed values, timestamps, payloads, and analytics outside Graph.

## Modeling rules

Use `JourneyIndex` for catalogues and known entry states, not traversal.

Use `Journey` for local traversable topology with exactly one `startStateRef`.

Use ordinary `State` and local `Transition` for same-surface conditions unless a nested flow preserves meaning that a flat model would lose.

Use `CompositeState`, `BoundaryState`, `JourneyExit`, and `fromExitRef` only for complete nested-journey outcome patterns.

Use `OutgoingTransition` for ordinary navigation affordances.

## Cross-skill awareness

Consult the generated related-skills reference when Graph work touches Surface, Design System, Runtime, or whole-document integration.
