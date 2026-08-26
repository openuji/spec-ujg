# UJG ED Domain Model Evaluation

Use this skill to evaluate a generated `DomainModel` against the UJG semantics and Domain Requirements from which it was derived.

Do not compare against a preferred reference model. Different domain models may validly satisfy the same requirements.

## Source of truth

Use the active Editor's Draft unless the user explicitly requests a dated snapshot:

`https://ujg.specs.openuji.org/ed/extensions/domain-model`

Also use the active Domain Requirements specification and the supplied Domain Model JSON Schema.

## Inputs

Required:

* canonical UJG document;
* Domain Requirements being evaluated;
* generated `DomainModel`;
* Domain Model JSON Schema.

Optional:

* Domain Model generation SKILL used to produce the model;
* model, provider, or run identifier.

Treat UJG IDs, Domain Requirement IDs, and the supplied schema as authoritative.

## Evaluation principle

A strong Domain Model is:

* sufficient for every Domain Requirement;
* precisely traceable;
* minimal;
* free of unsupported semantics;
* internally coherent;
* faithful to source terminology;
* neutral about technical realization.

Evaluate whether the model expresses the required domain semantics, not whether it matches a preferred DDD decomposition.

## Hard validation

Check:

1. JSON Schema validity;
2. internal Domain Model reference resolution;
3. resolution of every `domainRequirementRefs` value.

Report failures, but continue semantic evaluation where possible.

## Requirement satisfaction

Evaluate every input Domain Requirement independently.

Score:

* `0` — not represented;
* `1` — materially insufficient;
* `2` — substantially represented but incomplete or weakened;
* `3` — fully and faithfully represented.

A requirement is not satisfied merely because its ID occurs in `domainRequirementRefs`.

Inspect the actual model semantics carrying the reference.

Requirement satisfaction measures sufficiency only. Unsupported extra semantics are evaluated separately.

## Element necessity audit

Audit every:

* `Entity`;
* `ValueObject`;
* `Property`;
* `Relationship`;
* `DomainOperation`;
* `Invariant`.

For each element ask:

1. What required semantics justify it?
2. Would removing it lose or materially weaken required semantics?
3. Does it introduce meaning not supported by the Domain Requirements or necessary surrounding UJG semantics?

Classify each element:

* `REQUIRED` — necessary for required semantics;
* `ALTERNATIVE_MODELING` — valid representation of required semantics without unsupported meaning;
* `REDUNDANT` — semantics are already fully represented elsewhere;
* `UNSUPPORTED` — the inputs do not justify the semantic claim.

A plausible implementation mechanism is not justification.

Do not infer timestamps from validity, authentication from continuity, persistence fields from representability, counters from availability, or technical identifiers from identity requirements unless the inputs require them.

## DomainOperation audit

For every `DomainOperation`:

* preconditions must describe semantics that already hold before the operation;
* postconditions must describe semantics established by the operation;
* effect operations must establish every required consequence;
* condition-related operations must make the required distinction determinable;
* entry-resolution operations must establish the required identity or continuity.

When checking circularity, compare the semantic subject and distinction required by the Domain Requirement with both the operation's preconditions and postconditions.

Mark an operation `CIRCULAR` when a precondition already asserts the same required subject identity, state distinction, relationship, continuity, or determination that the operation exists to establish.

For entry-resolution operations in particular, do not accept `identifies`, `resolves`, `selects`, `binds to`, or equivalent wording in a precondition when establishing that identity or binding is itself the requirement being evaluated.

For example:

```text
requirement:
external entry resolves a specific domain object

operation:
resolve object

precondition:
the entry identifies that specific object
```

is `CIRCULAR`.

A `CIRCULAR` operation cannot by itself fully satisfy the affected requirement.

If no other Domain Model semantics independently establish the missing semantics, the affected Domain Requirement MUST score below `3`.

## Traceability precision

Evaluate every element-to-requirement reference:

* `1.0` — necessary to express that requirement;
* `0.5` — related but broader or more indirect than necessary;
* `0.0` — unsupported or merely participating in related behavior.

Traceability precision is the mean of these values.

Do not reward more references.

A `Relationship` should reference a requirement only when the relationship itself is necessary to express required identity, scope, or continuity.

## Minimality

Score element classifications as:

* `REQUIRED` = `1.0`;
* `ALTERNATIVE_MODELING` = `1.0`;
* `REDUNDANT` = `0.5`;
* `UNSUPPORTED` = `0.0`.

Minimality is the mean.

Do not penalize a different valid decomposition.

## Additional quality checks

Score each from `0` to `5`.

### Assumption discipline

`5` means no unsupported semantic assumptions.

Any `UNSUPPORTED` element requires a score below `5`.

### Semantic coherence

Check for contradictions, circular operations, inconsistent lifecycle semantics, missing scope or continuity, and conflicting semantic ownership.

### Terminology fidelity

Prefer terminology established by Domain Requirements and surrounding UJG semantics.

Do not penalize harmless grammatical normalization.

### Realization neutrality

Lower the score only for unjustified choices concerning persistence, API style, frontend/backend placement, framework, authentication mechanism, messaging, or deployment.

## Invariants

An `Invariant` is justified only when it expresses a required rule not already fully represented by `Property`, `Relationship`, or `DomainOperation` semantics.

Otherwise classify it as `REDUNDANT`.

Do not require invariants merely because the schema supports them.

## Scores

Use:

| Metric                   | Weight |
| ------------------------ | -----: |
| Structural conformance   |     10 |
| Requirement satisfaction |     30 |
| Traceability precision   |     15 |
| Minimality               |     10 |
| Assumption discipline    |     15 |
| Semantic coherence       |     10 |
| Terminology fidelity     |      5 |
| Realization neutrality   |      5 |

Calculate:

```text
Requirement satisfaction %
=
sum(requirement scores) / (3 × requirement count) × 100
```

Convert percentage metrics proportionally to `0–5`.

Calculate the weighted total out of `100`.

Any metric below `5` MUST be supported by at least one explicit finding in the requirement matrix, element audit, DomainOperation audit, or defect table.

Do not deduct points for unspecified general concerns.

## Hard gates

A model cannot be `REFERENCE_QUALITY` if:

* schema validation fails;
* references do not resolve;
* any Domain Requirement scores below `3`;
* any element is `UNSUPPORTED`;
* any required operation is `CIRCULAR`;
* a material semantic contradiction exists;
* an unjustified realization choice exists.

Any `UNSUPPORTED` element requires `Assumption discipline < 5`.

Any `REDUNDANT` element requires `Minimality < 5`.

Weighted strengths must not override these gates.

## Classification

Use:

* `REFERENCE_QUALITY`
* `STRONG`
* `NEEDS_REFINEMENT`
* `INSUFFICIENT`

`REFERENCE_QUALITY` requires:

* overall score ≥ `95`;
* all hard gates pass;
* every Domain Requirement scores `3`.

`STRONG` means all required semantics are present with only minor precision or redundancy issues.

`NEEDS_REFINEMENT` means the model is substantially useful but contains unsupported semantics, circular operations, incomplete requirement realization, or other material derivation defects.

`INSUFFICIENT` means important requirements are missing or major semantic inconsistencies exist.

## Output

Produce the following sections.

### Scorecard

| Metric | Raw result | Score 0-5 | Weight | Weighted points |
| ------ | ---------: | --------: | -----: | --------------: |

### Requirement matrix

| Domain Requirement | Type | Satisfaction 0-3 | Necessary model semantics | Evidence in model | Deficiency |
| ------------------ | ---- | ---------------: | ------------------------- | ----------------- | ---------- |

Identify the minimum semantics actually required. Do not merely list every element carrying the requirement ID.

### Element audit

| Element | Type | Classification | Requirement justification | Issue |
| ------- | ---- | -------------- | ------------------------- | ----- |

Audit nested `Property` elements separately.

### DomainOperation audit

| DomainOperation | Requirement(s) | Preconditions valid? | Postconditions sufficient? | Circular? | Issue |
| --------------- | -------------- | -------------------- | -------------------------- | --------- | ----- |

### Defects

List substantive defects:

| Severity | Element | Finding | Requirement(s) | Root cause |
| -------- | ------- | ------- | -------------- | ---------- |

Severity:

* `CRITICAL`
* `MAJOR`
* `MINOR`

Root cause:

* `GENERATION_SKILL`
* `DOMAIN_MODEL_SCHEMA`
* `DOMAIN_REQUIREMENTS`
* `SOURCE_UJG`
* `MODEL_OUTPUT_ONLY`

Choose the earliest layer that actually causes or permits the defect.

## Generation-SKILL feedback

If the generation SKILL is supplied, compare findings against its existing rules.

Produce:

| Observed failure pattern | Generalizable rule | Generator rule status |
| ------------------------ | ------------------ | --------------------- |

Use:

* `MISSING` — the generation SKILL lacks the required general rule;
* `ALREADY_PRESENT` — the rule already exists but the generated model violated it;
* `NOT_APPROPRIATE` — the issue should not be addressed by the generation SKILL.

Do not recommend adding a duplicate rule when an equivalent rule already exists.

If the generation SKILL is not supplied, do not claim that a rule is missing. Use `UNKNOWN` for rule status.

Do not fix the generation SKILL for problems caused by the source UJG, Domain Requirements, or Domain Model specification.

## Comparable summary

End with exactly:

| Model | Overall | Req. satisfaction | Traceability | Minimality | Assumptions | Classification |
| ----- | ------: | ----------------: | -----------: | ---------: | ----------: | -------------- |

Use `DomainModel.id` when no run identifier is supplied.

## Core Rule

Evaluate whether the Domain Model is the smallest faithful representation of the supplied Domain Requirements.

Do not reward plausible implementation assumptions.

Do not compare against a preferred architecture.

Do not allow a high overall score to hide unsupported semantics, circular derivation, or unsatisfied requirements.
