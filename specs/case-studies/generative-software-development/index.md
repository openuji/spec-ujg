---
title: "Guided Generative Software Development with UJG"

summary: A controlled case study comparing how different AI models realize the same User Journey Graph under implicit and explicit generation guidance.

teaser: This case study examines whether explicit user-journey semantics can constrain generative software development across models, and whether stronger phase gating improves the quality, traceability, and faithfulness of the resulting software.

tags:
  - Generative Software
  - Evaluation
  - Journey Semantics
  - AI Guidance
  - Non-normative

vocabulary:
  "Structure": |
    **Published phase score · 0–100.** How well the generated design-system structure matches the UJG model: artifact coverage, composition, data contracts, identity, modularity, and Storybook inspectability.
    
    The score is the mean of six 0–5 quality scores, averaged across both evaluators. **Higher is better.**

  "Tokens": |
    **Published phase score · 0–100.** How well the generated DTCG token and Theme realization works: token structure, source-of-truth discipline, portability, traceability, visual fidelity, and inspectability.
    
    The score is the mean of six 0–5 quality scores, averaged across both evaluators. **Higher is better.**

  "Styling": |
    **Published phase score · 0–100.** How well styling applies the generated token system without changing the established structure, while preserving visual and responsive quality.
    
    The score is the mean of six 0–5 quality scores, averaged across both evaluators. **Higher is better.**

  "Application": |
    **Published phase score · 0–100.** How well the generated application realizes the manifest-selected interfaces and preserves UJG behavior, domain rules, design-system integration, source-of-truth boundaries, and verification.
    
    The score is the mean of six 0–5 quality scores, averaged across both evaluators. **Higher is better.**

  "Mean": |
    **Derived score.** Average of the four published phase scores—Structure, Tokens, Styling, and Application—for one run.
    
    Useful as a compact summary, but the phase scores are more informative than this single number.

  "Artifact coverage": |
    **Quality score · 0–5.** How completely the implementation contains the UJG Components and Templates it is expected to realize. **Higher is better.**

  "Composition fidelity": |
    **Quality score · 0–5.** How closely generated Templates, Slots, and their composition follow the UJG design-system model. **Higher is better.**

  "Data-contract fidelity": |
    **Quality score · 0–5.** How accurately generated artifact inputs and outputs follow the UJG-referenced data contracts. **Higher is better.**

  "Identity containment": |
    **Quality score · 0–5.** Whether UJG identities stay clear in the implementation instead of being duplicated or replaced by competing semantic identities. **Higher is better.**

  "Implementation modularity": |
    **Quality score · 0–5.** How well the generated code reuses implementation pieces instead of repeating the same logic or structure. **Higher is better.**

  "Storybook inspectability": |
    **Quality score · 0–5.** How easily generated Components, Templates, states, and interactions can be inspected in Storybook. **Higher is better.**

  "Token-model quality": |
    **Quality score · 0–5.** How clear, reusable, and well-structured the generated foundation and semantic DTCG token system is. **Higher is better.**

  "Source-of-truth integrity": |
    **Quality score · 0–5.** How consistently the implementation uses the intended authoritative source—such as DTCG tokens, UJG, or schemas—instead of maintaining competing copies. **Higher is better.**

  "Theme portability": |
    **Quality score · 0–5.** How easily Themes can change through token data rather than component-specific theme logic. **Higher is better.**

  "Traceability": |
    **Quality score · 0–5.** How well generated token decisions can be traced to supplied screenshot evidence or recorded inference. **Higher is better.**

  "Visual-foundation fidelity": |
    **Quality score · 0–5.** How well the generated token foundation reflects the supplied visual references. **Higher is better.**

  "Inspectability": |
    **Quality score · 0–5.** How easily the generated result for the phase can be inspected through Storybook, documentation, or other retained evidence. **Higher is better.**

  "Visual fidelity": |
    **Quality score · 0–5.** How closely the generated styling reflects the supplied reference screenshots. **Higher is better.**

  "Token/theme adherence": |
    **Quality score · 0–5.** How consistently styling uses the generated DTCG tokens and Themes instead of hardcoded or parallel visual values. **Higher is better.**

  "Structural-scope preservation": |
    **Quality score · 0–5.** Whether Styling preserves the Components, Templates, composition, and behavior established during Structure. **Higher is better.**

  "Responsive quality": |
    **Quality score · 0–5.** How well the generated UI adapts across relevant viewport sizes. **Higher is better.**

  "Styling modularity": |
    **Quality score · 0–5.** How reusable and well-separated the styling implementation is, without avoidable duplication. **Higher is better.**

  "Manifest realization coverage": |
    **Quality score · 0–5.** How completely the application implements the targets and interfaces selected by the implementation manifest. **Higher is better.**

  "UJG behavioral fidelity": |
    **Quality score · 0–5.** How closely runtime behavior follows the UJG, including entries, commands, conditions, branches, effects, outcomes, and continuations. **Higher is better.**

  "Domain integrity": |
    **Quality score · 0–5.** How consistently the generated runtime enforces the domain rules and invariants relevant to the journey. **Higher is better.**

  "Design-system integration": |
    **Quality score · 0–5.** How correctly application interfaces use the generated design system instead of rebuilding presentation or interaction behavior separately. **Higher is better.**

  "Verification coverage": |
    **Evaluator diagnostic or quality score, depending on context.** As a percentage, it is `verified branches / modeled branches`. As a 0–5 quality score, it judges the breadth and usefulness of maintained executable verification. **Higher is better.**

  "Components": |
    **Repository metric.** Number of UJG `Component` identities implemented out of the number expected.
    
    `12 / 12` means every modeled Component has an implementation artifact.

  "Templates": |
    **Repository metric.** Number of UJG `Template` identities implemented out of the number expected.
    
    `9 / 9` means every modeled Template has an implementation artifact.

  "Implementation primitives": |
    **Repository metric.** Additional reusable UI helpers created by the implementation, such as a small `Field`, `Card`, or `StatusIcon`.
    
    They are implementation choices, not UJG Components or Templates. More or fewer is not automatically better.

  "Missing stories": |
    **Evaluator diagnostic.** Number of generated Components or Templates that should be inspectable in Storybook but have no Storybook story. **Lower is better; `0` means none are missing.**

  "Composition violations": |
    **Evaluator diagnostic.** Number of places where generated Component/Template/Slot composition does not match the UJG design-system structure. **Lower is better.**

  "Data-contract violations": |
    **Evaluator diagnostic.** Number of generated artifacts whose data shape does not match the UJG-referenced data contract. **Lower is better.**

  "Interaction-story coverage": |
    **Evaluator diagnostic.** Percentage of generated Components and Templates with modeled user actions that also have Storybook stories demonstrating those actions—for example open, edit, submit, confirm, accept, or decline.
    
    `100%` means every expected interactive artifact has corresponding Storybook interaction evidence. **Higher is better.**

  "DTCG tokens": |
    **Repository metric.** Total number of design tokens in the generated DTCG token files.
    
    The count describes the implementation; a larger token inventory is not automatically better.

  "Foundation / semantic tokens": |
    **Repository metric.** Split between basic visual tokens—such as color, spacing, typography, radius, and shadow—and semantic tokens that name roles such as action foreground or error border.
    
    Different implementations may choose different splits.

  "Themes": |
    **Repository metric.** Number of generated UJG Theme realizations backed by the run's token sources.

  "Unresolved aliases": |
    **Evaluator diagnostic.** Number of DTCG token references that point to a token that cannot be resolved. **Lower is better; `0` means all evaluated aliases resolve.**

  "Raw-value leaks": |
    **Evaluator diagnostic.** Number of visual values written outside the intended DTCG token path—for example a hardcoded color, spacing value, radius, or font size where a token should be used. **Lower is better.**

  "Parallel token / theme registry": |
    **Evaluator diagnostic.** Two counts shown as `token catalog / theme registry`.
    
    They indicate separately maintained token-like or theme-like value sources that duplicate the intended DTCG / UJG Theme source of truth. **Lower is better; `0 / 0` means none were identified.**

  "Token provenance coverage": |
    **Derived repository metric.** Percentage of generated DTCG tokens whose origin is classified as either directly supported by the screenshots or inferred during generation.
    
    `classified tokens / all DTCG tokens`. **Higher means more token decisions are traceable.**

  "Component inventory changed": |
    **Evaluator diagnostic.** Whether Styling added, removed, or changed the established modeled Component inventory. The expected result is **No** because Styling should not redefine Structure.

  "Template inventory changed": |
    **Evaluator diagnostic.** Whether Styling added, removed, or changed the established modeled Template inventory. The expected result is **No**.

  "Duplicated style patterns": |
    **Evaluator diagnostic.** Number of repeated styling patterns that could reasonably have been shared instead. **Lower is generally better.**

  "Misplaced style rules": |
    **Evaluator diagnostic.** Number of style rules placed at the wrong ownership level—for example component-specific rules in a global stylesheet. **Lower is better.**

  "Responsive artifacts": |
    **Evaluator diagnostic.** Number of generated artifacts for which explicit responsive behavior was identified.
    
    This is descriptive: a higher count is not automatically better.

  "Responsive documentation": |
    **Evaluator diagnostic.** Percentage of responsive artifacts that have Storybook or equivalent evidence where the responsive behavior can be inspected. **Higher is better.**

  "Interfaces realized": |
    **Evaluator diagnostic.** Number of manifest-selected interfaces found in the implementation.
    
    `2 / 2` means both selected interfaces—browser and email in this case study—were realized.

  "Verified branches": |
    **Evaluator diagnostic.** Number of modeled behavioral branches for which maintained executable verification was found.
    
    `30 / 35` means 30 of the 35 branches identified by that evaluator have verification evidence.

  "Design-system integration violations": |
    **Evaluator diagnostic.** Number of places where the application bypasses or duplicates the generated design system instead of using it as intended. **Lower is better.**

  "Parallel semantic projections": |
    **Evaluator diagnostic.** Number of places where the implementation creates a second representation of UJG-owned journey semantics that can become a competing source of truth—for example duplicated workflow states or outcome taxonomies. **Lower is better.**

  "Effect / invariant violations": |
    **Evaluator diagnostic.** Number of implementation behaviors that violate a modeled effect or a relevant domain invariant—for example producing the wrong journey outcome. **Lower is better.**

  "Parallel token/theme sources": |
    **Derived diagnostic used in the guidance comparison.** Combined count of separately maintained token or theme sources outside the intended DTCG / UJG Theme path. **Lower is better.**

---

> **Exploratory case study — non-normative**

>

> This page is not part of the normative UJG specification. It documents a controlled generative-software experiment and is updated as evaluation evidence is completed.

|  |  |
| ----- | ----- |
| Implementation models | GPT-5.5 Codex, Claude Sonnet 5 |
| Experiment repository | [openuji/ujg-generative-se-case-study](https://github.com/openuji/ujg-generative-se-case-study) |
| UJG version | [UJG 1.0 Release Candidate 2](https://ujg.specs.openuji.org/tr/1.0-rc2) |
| Author | [Seva Dolgopolov](https://www.linkedin.com/in/seva-dolgopolov/) |

## Research question {#1-research-question}
User Journey Graph is intended to describe user-facing journey semantics independently from one specific software implementation. Generative software development provides a useful stress test for that separation: different AI models can make different implementation choices while still being constrained by the same intended experience.

This case study asks two related questions:

**RQ-1:** **Can one explicit UJG constrain multiple generative models toward the same intended journey without prescribing one implementation?**

**RQ-2:** **Does stronger generation guidance improve the quality and faithfulness of the realization?**

The study therefore compares not only models, but also **guidance protocols**. The same clean-room inputs are realized using an implicit guided process and an explicit phase-gated process.

The aim is not to make different models produce identical source code or identical interfaces. The aim is to examine whether independently generated implementations preserve the same semantic scope and whether their quality changes when generation is broken into inspectable, verified stages.

## What is held constant {#2-what-is-held-constant}
Through all generative jobs we used this same 3 inputs: **UJG document**, **Implementation manifest** and **Screenshots** to obtain the style.

### UJG
[Workshop registration UJG](https://github.com/openuji/ujg-generative-se-case-study/blob/main/ujg/workshop-registration.ujg.jsonld) · [schemas](https://github.com/openuji/ujg-generative-se-case-study/tree/main/ujg/schemas)

```stat-grid


UJG Document Graph Nodes

Journeys = 9
States = 30
Transitions = 35
```

The UJG is the semantic and structural source for the experiment.

### Implementation manifest
[ujg-implementation.yaml](https://github.com/openuji/ujg-generative-se-case-study/blob/main/ujg-implementation.yaml)

```yaml
domain_engine:
  target: apps/domain

interfaces:
  - touchpoint_ref: urn:ujg:touchpoint:workshop-app
    target: apps/ui
    kind: browser

  - touchpoint_ref: urn:ujg:touchpoint:email
    kind: email
```

The manifest fixes the controlled realization target and implementation choices used across runs.

### Reference screenshots
**10 screenshots** used as appearance evidence for token and styling realization.

<a href="https://github.com/openuji/ujg-generative-se-case-study/tree/main/references/workshop-registration/screens">
  <img src="https://raw.githubusercontent.com/openuji/ujg-generative-se-case-study/main/references/workshop-registration/screens/screen.png" alt="Workshop registration reference screenshot" style="width:23%; height:auto;" loading="lazy" />
</a>
<a href="https://github.com/openuji/ujg-generative-se-case-study/tree/main/references/workshop-registration/screens">
  <img src="https://raw.githubusercontent.com/openuji/ujg-generative-se-case-study/main/references/workshop-registration/screens/screen_3.png" alt="Workshop registration reference screenshot" style="width:23%; height:auto;" loading="lazy" />
</a>
<a href="https://github.com/openuji/ujg-generative-se-case-study/tree/main/references/workshop-registration/screens">
  <img src="https://raw.githubusercontent.com/openuji/ujg-generative-se-case-study/main/references/workshop-registration/screens/screen_6.png" alt="Workshop registration reference screenshot" style="width:23%; height:auto;" loading="lazy" />
</a>
<a href="https://github.com/openuji/ujg-generative-se-case-study/tree/main/references/workshop-registration/screens">

  <img src="https://raw.githubusercontent.com/openuji/ujg-generative-se-case-study/main/references/workshop-registration/screens/screen_9.png" alt="Workshop registration reference screenshot" style="width:23%; height:auto;" loading="lazy" />

</a>

[View all 10 screenshots →](https://github.com/openuji/ujg-generative-se-case-study/tree/main/references/workshop-registration/screens)

## The 3 + 1 realization process {#3-the-3-1-realization-process}
The realization is deliberately decomposed into three design-system phases followed by application realization.

```mermaid

flowchart TD

    U["UJG, Manifest, Screenshots"] --> S["1 · Structure"]

    S --> T["2 · Tokens"]

    T --> V["3 · Styling"]

    V --> A["+1 · Application"]

    S --> SO["Components · Templates · Slots · Stories"]

    T --> TO["DTCG tokens · Themes · provenance"]

    V --> VO["Styled + responsive Storybook artifacts"]

    A --> AO["Browser · domain runtime · persistence · email"]

```

### Structure {#31-structure}
The structure phase realizes the UJG Design System model without prematurely inventing the visual system. Components, Templates, Slots, SlotBindings, SurfaceRealizations, data-bound props, and Storybook inspection surfaces are established here.

The important question is whether the generated design-system structure preserves the UJG composition rather than turning semantic identities into ad-hoc screens or duplicating application behavior inside components.

<!-- Publication evidence planned here:

- representative Storybook structure screenshots

- annotations for Template / Slot / Command-backed Surface composition

-->

### Tokens {#32-tokens}
The token phase derives a reusable visual foundation from the supplied appearance evidence. Foundation and semantic DTCG tokens remain distinct, Theme differences stay data-driven, and provenance records whether evidence was directly visible or inferred.

The token phase also adds the generated Theme and TokenSource realization to the run-local UJG without changing the seeded journey semantics.

<!-- Publication evidence planned here:

- light/dark token specimens

- typography, spacing, palette and semantic-role extracts

- provenance examples

-->

### Styling {#33-styling}
The styling phase applies the token system to the already-established component and template structure. It is evaluated both for visual fidelity and for whether styling preserves the structural scope established earlier.

The strongest visual comparison is therefore not a random final screenshot: it is the **same modeled artifact before and after styling**, together with mobile and desktop inspection where responsive behavior exists.

<!-- Publication evidence planned here:

- before/after Storybook artifact pairs

- responsive variants

- reference-to-realization annotations

-->

### Application {#34-application}
The final phase realizes the manifest-selected interfaces and runtime boundaries. In this case that includes the browser application, domain runtime, HTTP/OpenAPI boundary, SQLite persistence, identity adapter, and email delivery adapter.

At this point the primary question changes from presentation fidelity to **behavioral fidelity**: do entries, commands, guarded branches, effects, invariants, continuations, data contracts, and touchpoint boundaries survive implementation?

<!-- Publication evidence planned here:

- representative application states

- journey outcome screenshots

- generated SQLite ER diagram

- selected verification evidence

-->

## Two guidance protocols {#4-two-guidance-protocols}
The experimental variable is how the model is guided through the same realization problem.

| | Implicit-gated guidance | Explicit-gated guidance |
| --- | --- | --- |
| Design-system generation | One orchestration skill guides structure → tokens → styling in sequence. | Structure, tokens, and styling are separate model invocations. |
| Application generation | Separate application realization. | Separate application realization. |
| Phase boundary | Mostly encoded inside orchestration guidance. | Every phase is explicitly opened and closed. |
| Verification | Retained legacy validation/evaluation evidence. | Static validation and executable verification must pass before the next phase starts. |
| Main question | Can a model follow the intended staged process from guidance alone? | Does making the stages and gates explicit reduce drift and improve realization quality? |

```mermaid

flowchart TB

    subgraph E["Explicit-gated"]

      direction TB

      EC["DS coordinator skill<br/>control-only"] --> EB1["begin structure phase"]

      EB1 --> ES["Structure skill<br/>fresh invocation"]

      ES --> EG1["validate + verify<br/>close structure"]

      EG1 --> EB2["begin tokens phase"]

      EB2 --> ET["Token skill<br/>fresh invocation"]

      ET --> EG2["validate + verify<br/>close tokens"]

      EG2 --> EB3["begin styling phase"]

      EB3 --> EST["Styling skill<br/>fresh invocation"]

      EST --> EG3["validate + verify<br/>close styling"]

      EG3 --> EB4["begin application phase"]

      EB4 --> EA["Application skill<br/>fresh invocation"]

      EA --> EG4["validate + verify<br/>close application"]

      EG4 --> EE["post-generation evaluations<br/>structure + tokens + styling + application"]

    end

    subgraph I["Implicit-gated"]

      direction TB

      IC["DS coordinator skill<br/>executes DS phases"] --> IS["Structure skill"]

      IS --> IG1["validate + verify"]

      IG1 --> IE1["evaluate structure"]

      IE1 --> IT["Token skill"]

      IT --> IG2["validate + verify"]

      IG2 --> IE2["evaluate tokens"]

      IE2 --> IST["Styling skill"]

      IST --> IG3["validate + verify"]

      IG3 --> IE3["evaluate styling"]

      IE3 --> IA["Application skill"]

      IA --> IG4["validate + verify"]

      IG4 --> IE4["evaluate application<br/>complete validation"]

    end

    top(( )):::anchor

    top ~~~ EC

    top ~~~ IC

    classDef anchor width:0px,height:0px,fill:none,stroke:none

```

Both protocols use the same realization profile. The difference is therefore not “Claude used one stack and Codex another”; it is the degree to which generation phases and their gates are made explicit to the model.

## Experiment matrix {#5-experiment-matrix}
The repository currently retains the following implementation runs.

| Implementation model | Implicit-gated | Explicit-gated |
| --- | :---: | :---: |
| GPT-5.5 Codex | ✓ | ✓ |
| Claude Sonnet 5 | ✓ | ✓ |



## Evaluation design
Each run is evaluated independently for the four realization phases. Every phase has six quality dimensions scored from **0 to 5**. Their arithmetic mean produces the phase quality score; the published 0–100 score is the same mean scaled by 20.

Complexity indicators such as file count, infrastructure LOC, dependency count, and abstraction burden are reported separately. They do **not** raise or lower the quality score.

| Phase           | Quality dimensions                                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Structure]^i**   | [Artifact coverage]^i · [Composition fidelity]^i · [Data-contract fidelity]^i · [Identity containment]^i · [Implementation modularity]^i · [Storybook inspectability]^i |
| **[Tokens]^i**      | [Token-model quality]^i · [Source-of-truth integrity]^i · [Theme portability]^i · [Traceability]^i · [Visual-foundation fidelity]^i · [Inspectability]^i |
| **[Styling]^i**     | [Visual fidelity]^i · [Token/theme adherence]^i · [Structural-scope preservation]^i · [Responsive quality]^i · [Styling modularity]^i · [Inspectability]^i |
| **[Application]^i** | [Manifest realization coverage]^i · [UJG behavioral fidelity]^i · [Domain integrity]^i · [Design-system integration]^i · [Source-of-truth integrity]^i · [Verification coverage]^i |

### Two evaluators, one published phase score
Every retained Claude Sonnet 5 and GPT-5.5 Codex implementation is evaluated by both evaluator models.

For each implementation run and phase:

**published phase score = mean(Claude evaluator score, GPT-5.5 Codex evaluator score)**

The evaluator-specific values are retained so disagreement remains visible. The two-evaluator mean is used only for the comparable phase-quality scores.

Diagnostic counts are not averaged between evaluators because apparently factual measurements can depend on interpretation — for example which files count as infrastructure, which branches are considered modeled, or what constitutes a prohibited projection.

### Deterministic and diagnostic evidence
The results combine three kinds of evidence.

| Evidence                             | Source                                    | Examples                                                                                                |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Deterministic repository metrics** | Counted directly from generated artifacts | Components, Templates, Slots, SurfaceRealizations, implementation primitives, DTCG token counts, Themes |
| **Evaluator diagnostics**            | Phase evaluation JSON                     | composition violations, raw-value leaks, responsive coverage, verified branches, parallel semantic projections |
| **Evaluator quality judgments**      | Six scored dimensions per phase           | source-of-truth integrity, token/theme adherence, UJG behavioral fidelity                               |

Where a property can be counted mechanically, the repository artifact is preferred as the measurement source. Evaluator diagnostics are used where the metric requires interpretation, while evaluator scores capture qualitative judgment.

This distinction is particularly important for the evidence below: the design-system inventory, implementation primitive count, and DTCG token inventory are counted from generated artifacts rather than inferred from the published quality score.

### Evaluator disagreement
Evaluator comparison is also treated as evidence. It can expose two different kinds of disagreement:

* **measurement disagreement** — evaluators identify or count evidence differently;

* **judgment disagreement** — evaluators inspect similar evidence but assign different quality scores.

Large disagreements are therefore shown rather than hidden by the published mean.

## RQ1 — Cross-model convergence
> **Can one explicit UJG constrain multiple generative models toward the same intended journey without prescribing one implementation?**

The four retained Claude Sonnet 5 and GPT-5.5 Codex runs use the same UJG and realization policy. This makes it possible to compare whether independently generated implementations converge at the modeled semantic and structural boundaries while remaining free to choose different source architectures and implementation helpers.

### Structural convergence
The UJG Design System model defines a shared reusable vocabulary of:

```stat-grid

title: Modeled design-system structure

subtitle: Shared UJG input for all four runs

Artifacts

Components = 12

Templates = 9

Slots = 18

SurfaceRealizations = 54

Reuse

Reusable Components + Templates = 21

SurfaceRealizations = 54

Realizations per reusable identity = 2.57

```

All four runs realize the complete Component and Template inventory.

| Run                        | [Components]^i | [Templates]^i | [Implementation primitives]^i | [Missing stories]^i | [Composition violations]^i | [Data-contract violations]^i | [Interaction-story coverage]^i |
| -------------------------- | ---------- | --------- | -------------------------- | ---------------- | ----------------------- | ------------------------- | --------------------------- |
| Claude Sonnet 5 · explicit |    12 / 12 |     9 / 9 |                         3 |               0 |                      0 |                        0 |                       100% |
| Claude Sonnet 5 · implicit |    12 / 12 |     9 / 9 |                         4 |               0 |                      0 |                        0 |                        50% |
| GPT-5.5 Codex · explicit   |    12 / 12 |     9 / 9 |                         0 |               0 |                      0 |                        0 |                       100% |
| GPT-5.5 Codex · implicit   |    12 / 12 |     9 / 9 |                         2 |               0 |                      0 |                        1 |                       100% |

`Component`, `Template`, `Slot`, and `SurfaceRealization` are modeled UJG Design System artifacts. **Implementation primitives** are additional generated code-level helpers and are reported separately.

The result is strong structural convergence: 54 modeled SurfaceRealizations are served by the same 12 Components and 9 Templates in every implementation rather than by state-specific UI artifacts. At the same time, the models independently introduce between zero and four additional implementation primitives.

The common modeled vocabulary is therefore preserved while the concrete implementation architecture remains unconstrained.

### DTCG token realization
The token phase materializes the visual system as DTCG token artifacts. Foundation and semantic tokens are counted from the generated DTCG files; Theme and TokenSource realization remains connected to the run-local UJG.

| Run                        | [DTCG tokens]^i | [Foundation / semantic tokens]^i | [Themes]^i | [Unresolved aliases]^i | [Raw-value leaks]^i | [Parallel token / theme registry]^i | [Token provenance coverage]^i | [Source-of-truth integrity]^i |
| -------------------------- | ----------- | ---------------------- | ------ | ------------------- | ---------------- | ---------------------------------- | ---------------------- | -------------------------- |
| Claude Sonnet 5 · explicit |         168 |              100 / 68 |      2 |                  0 |               0 |                             0 / 0 |                  100% |                   4.9 / 5 |
| Claude Sonnet 5 · implicit |         110 |               66 / 44 |      2 |                  0 |             116 |                             0 / 1 |                 40.0% |                   4.0 / 5 |
| GPT-5.5 Codex · explicit   |         106 |               50 / 56 |      2 |                  0 |               0 |                             0 / 0 |                 52.8% |                   5.0 / 5 |
| GPT-5.5 Codex · implicit   |          63 |               31 / 32 |      2 |                  0 |              73 |                             1 / 1 |                 50.8% |                   2.3 / 5 |

The two models do **not** converge on an identical token inventory: Claude and Codex independently choose different numbers of foundation and semantic tokens. They do converge on the required two-Theme realization and produce resolvable DTCG token graphs.

This is an example of the intended boundary: UJG constrains the Theme and TokenSource semantics without prescribing one exact token taxonomy.

The more important variation is source-of-truth discipline. Both explicit runs keep generated styling values inside the DTCG realization, while the implicit runs retain substantial raw-value leakage or parallel theme/token registries.

### Styling realization
Styling is evaluated after the structural inventory has already been established.

| Run                        | [Raw-value leaks]^i | [Component inventory changed]^i | [Template inventory changed]^i | [Duplicated style patterns]^i | [Misplaced style rules]^i | [Responsive artifacts]^i | [Responsive documentation]^i | [Token/theme adherence]^i |
| -------------------------- | ----------------------- | ---------------------------- | ----------------------------- | ---------------------------- | ------------------------ | --------------------- | --------------------------- | ---------------------- |
| Claude Sonnet 5 · explicit |                      0 |              No             |             No             |                         0 |                     0 |                    9 |                      38% |               4.8 / 5 |
| Claude Sonnet 5 · implicit |                    116 |              No             |             No             |                         6 |                     2 |                   10 |                      22% |               3.0 / 5 |
| GPT-5.5 Codex · explicit   |                      0 |              No             |             No             |                         1 |                     0 |                    2 |                       0% |               4.5 / 5 |
| GPT-5.5 Codex · implicit   |                     73 |              No             |             No             |                         2 |                     2 |                    7 |                      33% |               2.1 / 5 |

All four runs preserve the modeled Component and Template inventory through styling. The generated implementations therefore remain structurally comparable even though the concrete CSS architecture, responsive strategy, and implementation-level reuse differ.

The clearest divergence is again source-of-truth ownership: the explicit runs contain no reported raw visual-value leakage, while both implicit runs maintain substantial styling values outside the DTCG-controlled path.

#### Same modeled template, different implementation models
| Claude Sonnet 5 · explicit-gated | GPT-5.5 Codex · explicit-gated |
| --- | --- |
| [![ReviewWithActions realized by Claude Sonnet 5 under explicit guidance](/case-studies/generative-software-development/evidence/review-with-actions-claude-explicit.png)](/case-studies/generative-software-development/evidence/review-with-actions-claude-explicit.png) | [![ReviewWithActions realized by GPT-5.5 Codex under explicit guidance](/case-studies/generative-software-development/evidence/review-with-actions-codex-explicit.png)](/case-studies/generative-software-development/evidence/review-with-actions-codex-explicit.png) |

Both implementations realize the same UJG-modeled `ReviewWithActions`

Template under the same explicit-gated protocol. The implementations

remain free to choose their own styling realization while preserving the

established Template and Component inventory.

### Application realization
The application phase tests whether the common journey semantics survive realization into the manifest-selected interfaces, domain runtime, persistence, and integration boundaries.

| Run                        | [Interfaces realized]^i | [Verified branches]^i | [Verification coverage]^i | [Design-system integration violations]^i | [Parallel semantic projections]^i | [Effect / invariant violations]^i | [UJG behavioral fidelity]^i |
| -------------------------- | -------------------- | ------------------ | ---------------------- | -------------------------- | ------------------------- | ------------------------------ | ------------------------ |
| Claude Sonnet 5 · explicit |               2 / 2 |           30 / 35 |                 86.0% |                         0 |                      1 |                             0 |                 4.6 / 5 |
| Claude Sonnet 5 · implicit |               2 / 2 |           12 / 21 |                 57.1% |                         0 |                      2 |                             1 |                 3.7 / 5 |
| GPT-5.5 Codex · explicit   |               2 / 2 |           11 / 13 |                 84.6% |                         0 |                      0 |                             0 |                4.25 / 5 |
| GPT-5.5 Codex · implicit   |               2 / 2 |           13 / 22 |                 59.1% |                         2 |                      2 |                             0 |                 3.4 / 5 |

All four implementations realize the two selected interfaces, but behavioral convergence is weaker than structural convergence.

The implementations differ materially in runtime architecture, verification depth, semantic projections, and persistence realization. The UJG therefore constrains the principal journey and interface scope without forcing the models toward one source architecture.

#### Example persistence realization
The generated persistence architecture also remains an implementation choice.

```mermaid

erDiagram

    PARTICIPANTS ||--o{ REGISTRATIONS : registers

    WORKSHOPS ||--o{ REGISTRATIONS : receives

    PARTICIPANTS ||--o{ WAITLIST : joins

    WORKSHOPS ||--o{ WAITLIST : contains

    PARTICIPANTS ||--o{ OFFERS : receives

    WORKSHOPS ||--o{ OFFERS : provides

    PARTICIPANTS {

        TEXT id PK

        TEXT name

        TEXT email

    }

    WORKSHOPS {

        TEXT slug PK

        TEXT title

        TEXT summary

        TEXT description

        TEXT event_date

        TEXT location

        INTEGER capacity

        INTEGER registration_open

        INTEGER waitlist_open

    }

    REGISTRATIONS {

        TEXT workshop_slug PK, FK

        TEXT participant_id PK, FK

        TEXT name

        TEXT email

        TEXT accessibility_notes

        TEXT created_at

    }

    WAITLIST {

        TEXT workshop_slug PK, FK

        TEXT participant_id PK, FK

        TEXT name

        TEXT email

        TEXT notes

        TEXT created_at

    }

    OFFERS {

        TEXT id PK

        TEXT workshop_slug FK

        TEXT participant_id FK

        TEXT status

        TEXT expires_at

        TEXT created_at

    }

```

This diagram shows the **generated SQLite persistence realization for the explicit GPT-5.5 Codex run**. It is not the UJG domain model: SQLite and this relational schema are implementation choices made within the controlled realization policy.

### Fazit
**RQ1 result:** convergence is strongest at the UJG semantic and design-system boundaries. Independent models reproduce the same modeled artifact inventory and principal journey scope while generating substantially different code structures, token inventories, implementation primitives, and runtime architectures. Divergence increases in the application phase, where semantic projections and incomplete branch verification can affect behavioral fidelity.

## RQ2 — Effect of explicit guidance
> **Does stronger generation guidance improve the quality and faithfulness of the realization?**

For each implementation model, the implicit and explicit runs are compared directly. The implementation model is held constant while the guidance protocol changes.

### Effect of explicit guidance
Values below are the change in the two-evaluator phase mean, explicit minus implicit, in percentage points.

```stat-grid

title: Effect of explicit guidance

subtitle: Change in two-evaluator mean, explicit minus implicit (points)

Claude Sonnet 5

Structure = +2.67

Tokens = +6.50

Styling = +7.67

Application = +7.84

Average uplift = +6.17

GPT-5.5 Codex

Structure = +3.17

Tokens = +22.16

Styling = +21.00

Application = +30.84

Average uplift = +19.29

```

Explicit guidance improves every paired phase comparison.

The structural uplift is relatively small for both models because all four runs already reproduce the complete modeled Component and Template inventory. The difference widens in Tokens and Styling and is largest in Application, particularly for GPT-5.5 Codex.

### Quality through the realization pipeline
Scores are the two-evaluator mean, 0–100.

| Run                        | [Structure]^i | [Tokens]^i | [Styling]^i | [Application]^i | [Mean]^i |
| -------------------------- | --------: | -----: | ------: | ----------: | --------: |
| Claude Sonnet 5 · explicit |     98.50 |  94.17 |   89.84 |       93.17 | **93.92** |
| Claude Sonnet 5 · implicit |     95.83 |  87.67 |   82.17 |       85.34 | **87.75** |
| GPT-5.5 Codex · explicit   |     98.34 |  90.83 |   85.00 |       77.50 | **87.92** |
| GPT-5.5 Codex · implicit   |     95.17 |  68.67 |   64.00 |       46.67 | **68.63** |

The phase profile shows that guidance has relatively little effect on initial structural coverage but increasingly affects the preservation of source-of-truth boundaries and runtime behavior later in the realization pipeline.

### What explicit guidance changed
The evaluator scores can be connected to concrete implementation properties.

| Metric                               | Claude implicit → explicit | GPT-5.5 Codex implicit → explicit |
| ------------------------------------ | -------------------------: | --------------------------------: |
| [Raw-value leaks]^i                  |                116 → **0** |                        73 → **0** |
| [Parallel token/theme sources]^i     |                  1 → **0** |                         2 → **0** |
| [Duplicated style patterns]^i        |                  6 → **0** |                         2 → **1** |
| [Verification coverage]^i            |          57.1% → **86.0%** |                 59.1% → **84.6%** |
| [Parallel semantic projections]^i    |                  2 → **1** |                         2 → **0** |
| [Design-system integration violations]^i |                      0 → 0 |                         2 → **0** |

#### Same implementation model, different guidance protocol
| GPT-5.5 Codex · implicit-gated | GPT-5.5 Codex · explicit-gated |
| --- | --- |
| [![GPT-5.5 Codex · implicit-gated](/case-studies/generative-software-development/evidence/codex-implicit.png)](/case-studies/generative-software-development/evidence/codex-implicit.png) | [![GPT-5.5 Codex · explicit-gated](/case-studies/generative-software-development/evidence/codex-explicit.png)](/case-studies/generative-software-development/evidence/codex-explicit.png) |

Both screenshots show the workshop-overview application generated by the

same implementation model under different guidance protocols. The

explicit-gated realization is more tightly aligned with the staged

Structure → Tokens → Styling → Application process, while the

implicit-gated realization introduces a broader and less constrained

application shell.



The strongest effect is therefore not additional structural coverage. Explicit guidance improves **continuity between phases**:

* generated DTCG artifacts remain the styling source of truth;

* styling preserves the structure established in the previous phase;

* later application realization introduces fewer parallel semantic authorities;

* a larger proportion of evaluated behavioral branches is backed by verification evidence.

The effect is present for both models but substantially larger for GPT-5.5 Codex.

### Result sensitivity to evaluator
The published phase values are evaluator means, but evaluator disagreement is not uniform.

```bar-chart

title: Result sensitivity to evaluator

subtitle: Largest absolute differences between Claude Sonnet 5 and GPT-5.5 Codex evaluator scores (points)

max: 35

GPT-5.5 Codex implementation · implicit-gated · Application = 33.33

Claude Sonnet 5 implementation · implicit-gated · Application = 22.67

GPT-5.5 Codex implementation · explicit-gated · Application = 21.66

GPT-5.5 Codex implementation · implicit-gated · Styling = 14.66

```

Application has the highest evaluator sensitivity. This is also the phase where evaluation depends most strongly on interpreting runtime behavior, invariants, projections, integration boundaries, and verification evidence rather than inspecting a finite design-system inventory.

The guidance effect should therefore be read together with the underlying implementation metrics rather than from the aggregate score alone.



### Fazit
**RQ2 result:** explicit phase gating improves the evaluated quality of both implementation models. The effect is modest at the already-strong Structure phase and considerably larger in Tokens, Styling, and Application. The implementation evidence suggests that the main benefit is stronger preservation of source-of-truth and phase boundaries rather than simply generating more artifacts.

## Reproducibility and limitations
The experiment is intentionally narrow. It tests one workshop-registration case, one controlled realization profile, two implementation models, and two guidance protocols. It should not be read as a general ranking of AI coding systems.

The clean-room boundary is designed to reduce contamination between runs: the canonical UJG, referenced schemas, implementation manifest, and shared appearance references are supplied, while a reference application is excluded from the generation input.

The retained run directories, historical guidance skills, verification tooling, evaluation rubrics, evaluator JSON files, generated UJG documents, DTCG token sources, and application implementations are available in the [experiment repository](https://github.com/openuji/ujg-generative-se-case-study).

Repository-level counts used in the results — such as Component, Template, Slot, SurfaceRealization, implementation-primitive, DTCG-token, and Theme counts — are derived directly from the retained generated artifacts. Evaluator diagnostics and qualitative scores remain traceable to their corresponding evaluator result files.

Several limitations remain:

* only one product journey is studied;

* only two implementation models have complete paired implicit/explicit runs;

* the realization profile intentionally fixes the technology environment, so the experiment does not measure technology-selection quality;

* visual fidelity is partly dependent on static inspection where evaluator-time rendered evidence was unavailable;

* some diagnostic concepts require interpretation and can therefore differ between evaluators;

* the generated implementations were compared for semantic and quality convergence, not source-code identity.

The reproducibility target is therefore not identical generated source code. It is a traceable experiment in which the semantic input, realization policy, generation protocol, generated artifacts, evaluation rubric, supporting measurements, and published results can all be inspected independently.