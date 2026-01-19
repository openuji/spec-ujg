## Abstract {.unnumbered}

The User Journey Graph (UJG) specification family defines a vocabulary and data model for describing user journeys as automata-like graphs: a set of states (moments in the journey) connected by transitions (allowed moves between moments). The family separates design-time journey definitions from runtime journey traces so teams can design experiences and measure real behavior without mixing the two.

## What this is {.unnumbered}

UJG standardizes the structure of journeys so teams can:

- describe an intended experience (design-time),
- emit runtime traces from apps/services (runtime),
- compare reality to intent (conformance),
- compute funnels and metrics without re-inventing semantics per tool.

UJG is about the model, not about a specific visualization.

## Quick mental model (plain English) {.unnumbered}

- A journey definition is like a map of what's allowed: "from Browse you can go to Product, from Product you can go to Cart…"
- A journey trace is what actually happened for one user/session: "Browse → Product → Cart → Abandoned"
- Conformance is how you compare the two:
  - conformant path (expected),
  - optional path (allowed but not primary),
  - violation (unexpected),
  - drop-off (expected next step didn't happen).

## Design-time vs runtime (core distinction) {.unnumbered}

**Design-time Journey Definition**

- normative ("this is the intended model")
- stable identifiers
- used by design, engineering, QA, docs
- does not require event naming

**Runtime Journey Trace**

- descriptive ("this is what happened")
- timestamped events/traces
- used for metrics, debugging, analysis
- aligns to the design by referencing Journey + Transition identifiers

UJG makes both first-class so teams don't mix "what we planned" with "what we observed".

## Reading guidance {.unnumbered}

- New readers: start here (Overview), then Designed.
- Implementers: Designed → Serialization → Runtime → Conformance.
- Analysts: Runtime → Conformance → Observed → Metrics.
