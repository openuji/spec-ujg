## Abstract

The **User Journey Graph (UJG)** standardizes user experience as **computable data**. It decouples the **Definition of Intent** (Design) from the **Observation of Reality** (Telemetry). This separation creates a single source of truth for Designers, Developers, and Analysts. As a deterministic protocol, it supports automation by AI agents across these roles, ensuring structural consistency.

## The Core Philosophy

Building human facing digital products requires three distinct translations: **Design** (The Map), **Code** (The Logic), and **Analytics** (The Scoreboard). UJG unifies these by enforcing a single **Graph-based Mental Model**:

* **The Map (Intent):** A directed graph where nodes are *States* and edges are allowed *Transitions*.
* **The Path (Reality):** A linear, causal sequence of *Events* linked by predecessor.
* **The Binding:** Shared URIs that allow the Path to be mathematically projected onto the Map.

## Conceptual Stack

The standard is organized into four logical layers:

1. **The Wire (Transport):** The universal JSON-LD envelope. Ensures any tool—human or AI—can parse the file structure without ambiguity.
2. **The Blueprint (Definition):** Defines the "Happy Path." It is the vocabulary for States, Transitions, and Composition (nesting).
3. **The Runtime (Execution):** Captures the "Actual Path." It records events as a causal chain, not just timestamped logs.
4. **The Mapping (Conformance):** Closes the loop. It overlays Reality onto Intent to calculate conversion and detect friction.