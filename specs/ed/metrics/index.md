## Overview

This module defines a minimal shared vocabulary for metric observations that can be exchanged
between UJG producers, stores, and consumers. The first standardized slice is Mapping-derived
metrics: counts and rates computed from Runtime event chains after they have been resolved against
Graph intent by Mapping.

Metrics intentionally describe observed facts, not product-specific interpretations. For example,
an unexplained movement records that Mapping could not identify a relevant effective transition for
the movement. It does not imply that the movement was erroneous, invalid, or undesirable.

This draft does not standardize conversion goals, drop-off semantics, dwell-time metrics,
histograms, sketches, or event taxonomies. Those can be defined by profiles or future modules.

## Terminology

- <dfn>MetricObservation</dfn>: An addressable observation that attaches one metric value to one
  metric subject.
- <dfn>Metric subject</dfn>: The UJG object that a metric describes, identified by
  `metricSubjectRef`.
- <dfn>Metric key</dfn>: The portable name of the measured fact, identified by `metricKey`.
- <dfn>Count metric</dfn>: A non-negative integer metric that counts occurrences.
- <dfn>Rate metric</dfn>: A decimal metric in the closed interval `0..1`, computed from an explicit
  numerator and denominator.
- <dfn>Mapping-derived metric</dfn>: A metric computed from one or more [=JourneyMapping=] records
  and their [=MappedStep=] records.
- <dfn>Source mapping</dfn>: The [=JourneyMapping=] used to compute a single-execution metric,
  identified by `sourceMappingRef` when applicable.

## Metric Model {data-cop-concept="metric-model"}

A [=MetricObservation=] records a metric value using these fields:

- `metricSubjectRef`: the UJG object that the metric describes.
- `metricKey`: the metric name.
- `metricValue`: the metric value.
- `metricUnit`: the unit of `metricValue`.
- `numeratorCount`: the numerator used to compute a rate metric, when applicable.
- `denominatorCount`: the denominator used to compute a rate metric, when applicable.
- `aggregationMethod`: the method used to combine or derive an aggregate metric, when applicable.
- `sourceMappingRef`: the [=JourneyMapping=] used to compute the metric, when the metric is derived
  from a single mapping.

<spec-statement>

1. A [=MetricObservation=] MUST identify exactly one metric subject using `metricSubjectRef`.
2. A [=MetricObservation=] MUST identify exactly one metric key using `metricKey`.
3. A [=MetricObservation=] MUST provide exactly one metric value using `metricValue`.
4. A [=MetricObservation=] SHOULD provide `metricUnit`.
5. A rate [=MetricObservation=] SHOULD provide `numeratorCount` and `denominatorCount`.
6. A single-mapping [=Mapping-derived metric=] SHOULD provide `sourceMappingRef`.

</spec-statement>

## Mapping-derived Metrics {data-cop-concept="mapping-derived-metrics"}

Mapping is the canonical interpretation layer for analytics over UJG execution data. Runtime records
what happened, Graph defines the intended journey topology, and Mapping resolves each Runtime event
to Graph state and transition intent.

Mapping-derived metrics use these primary attachment points:

| Attachment point | Meaning | Appropriate metrics |
| --- | --- | --- |
| [=JourneyMapping=] | One interpreted execution chain | `stepCount`, `movementCount`, `explainedMovementCount`, `unexplainedMovementCount`, `unexplainedMovementRate`, `boundaryCrossingCount`, `maxScopeDepth` |
| [=MappedStep=] | One interpreted runtime event | boolean per-step observations such as whether the step is root, explained, or unexplained |
| [=Journey=] | Aggregate over mappings resolved to this root journey | `executionCount`, `stepCount`, `unexplainedMovementRate`, `stateVisitCount`, `transitionTraversalCount` |
| [=State=] or [=CompositeState=] | Aggregate over mapped steps resolving to this state | `stateVisitCount`, `boundaryEntryCount`, `boundaryExitCount` |
| [=Transition=] or [=OutgoingTransition=] | Aggregate over explained movements | `transitionTraversalCount`, `outgoingTraversalCount` |

For Mapping-derived metrics, the Runtime event chain defines order. The serialized order of
`mappedStepRef` is not significant.

<spec-statement>

1. A Consumer computing Mapping-derived metrics MUST reconstruct mapped step order using the Runtime
   causal chain of each `MappedStep.mappedEventRef`.
2. A Consumer computing Mapping-derived metrics MUST NOT use the serialized order of
   `mappedStepRef` as the metric order.
3. The root mapped step MUST be included in `stepCount`.
4. The root mapped step MUST be included in state visit counts for the state resolved by that step.
5. The root mapped step MUST NOT be included in `movementCount`, `explainedMovementCount`,
   `unexplainedMovementCount`, or movement-rate denominators.
6. A non-root mapped step is an explained movement when Mapping semantics determine that its
   `explainedByTransitionRef` identifies a relevant effective [=Transition=] or
   [=OutgoingTransition=].
7. A non-root mapped step is an unexplained movement when Mapping semantics derive a jump for that
   step.
8. `unexplainedMovementRate` MUST be computed as
   `unexplainedMovementCount / movementCount`.
9. If `movementCount` is zero, `unexplainedMovementRate` is undefined and MUST NOT be serialized as
   `0`.

</spec-statement>

## Core Metric Keys

The following metric keys are core for this draft.

| Metric key | Unit | Subject | Definition |
| --- | --- | --- | --- |
| `stepCount` | `count` | [=JourneyMapping=], [=Journey=] | Number of mapped steps, including the root step. |
| `movementCount` | `count` | [=JourneyMapping=], [=Journey=] | Number of non-root mapped steps. |
| `explainedMovementCount` | `count` | [=JourneyMapping=], [=Journey=] | Number of non-root mapped steps explained by a relevant effective transition. |
| `unexplainedMovementCount` | `count` | [=JourneyMapping=], [=Journey=] | Number of non-root mapped steps for which Mapping derives a jump. |
| `unexplainedMovementRate` | `ratio` | [=JourneyMapping=], [=Journey=] | `unexplainedMovementCount / movementCount`. |
| `stateVisitCount` | `count` | [=State=], [=CompositeState=], [=Journey=] | Number of mapped steps resolving to the subject state. |
| `transitionTraversalCount` | `count` | [=Transition=], [=Journey=] | Number of explained movements whose effective transition is the subject transition. |
| `outgoingTraversalCount` | `count` | [=OutgoingTransition=], [=Journey=] | Number of explained movements whose effective transition is the subject outgoing transition. |
| `boundaryEntryCount` | `count` | [=CompositeState=], [=Journey=] | Number of mapped movements that enter the subject boundary. |
| `boundaryExitCount` | `count` | [=CompositeState=], [=Journey=] | Number of mapped movements that exit the subject boundary. |
| `boundaryCrossingCount` | `count` | [=JourneyMapping=], [=Journey=] | Number of mapped movements that enter or exit a journey boundary. |
| `maxScopeDepth` | `count` | [=JourneyMapping=], [=Journey=] | Maximum nested journey scope depth observed in the mapped execution set. |

These keys use `unexplainedMovement*` terminology rather than `jump*`, `error*`, or `conversion*`.
Mapping can derive a jump when no relevant effective transition explains a movement, but Metrics
does not classify that movement as an error.

## Units and Value Conventions {data-cop-concept="units-and-value-conventions"}

<spec-statement>

1. Count metrics MUST use non-negative integer values.
2. Count metric keys SHOULD NOT use a unit suffix.
3. Rate metrics MUST use decimal values in the closed interval `0..1`.
4. Rate metrics MUST use `ratio` as `metricUnit`.
5. Duration metrics, when defined by a profile or future module, MUST use integer milliseconds.
6. Duration metric keys SHOULD end in `Ms`.
7. Boolean metrics MUST use `true` or `false` values.
8. Boolean metrics SHOULD be used only for per-step observations, not aggregate counts.

</spec-statement>

Runtime ordering is causal, not timestamp-based. This draft defines duration value conventions but
does not define dwell-time or elapsed-time metric keys as core metrics.

## Aggregation {data-cop-concept="aggregation"}

Metrics may be computed from one [=JourneyMapping=] or aggregated over disjoint sets of mappings.
Aggregates must preserve the meaning of the underlying metric key.

<spec-statement>

1. Count metrics are additive across disjoint execution sets.
2. Rate metrics MUST be recomputed from their underlying numerator and denominator.
3. Consumers SHOULD NOT average precomputed rates unless the averaging method is explicitly declared
   using `aggregationMethod`.
4. For Mapping-derived movement rates, the denominator MUST be `movementCount`.
5. For state visit rates, the denominator MUST be declared by the metric definition or profile.
6. Percentiles, histograms, and sketches are not core Metrics features and MUST NOT be assumed unless
   a profile defines them.

</spec-statement>

## Extension Metric Keys {data-cop-concept="extension-metric-keys"}

Profiles and implementations may define additional metric keys for product-specific analytics,
domain-specific event taxonomies, or richer statistical summaries.

Extension metric keys SHOULD be namespaced so they do not collide with core metric keys. An
extension metric definition SHOULD specify:

- the metric subject type;
- the unit and value type;
- the calculation rule;
- aggregation behavior;
- whether the metric is computed from Mapping, Runtime, Graph, or external data.

The following metrics are intentionally profile-defined in this draft:

| Metric | Reason |
| --- | --- |
| `conversionRate` | Requires a definition of goal or success semantics. |
| `dropoffRate` | Requires expected continuation, terminal-state, timeout, session, or cohort semantics. |
| `errorRate` | Mapping does not classify unexplained movement as an error. |
| `dwellTimeMs` | Requires timestamp or event-time semantics beyond Runtime causal ordering. |
| `retryCount` | Requires a standardized definition of retry or repeated intent. |
| `frictionScore` | Requires a scoring model and event taxonomy. |

## Validation

This draft describes the Metrics model but does not yet publish Metrics ontology, JSON-LD context,
or SHACL artifacts. Producers and consumers can still validate the baseline model by checking that:

- every metric observation has one subject, one key, and one value;
- count values are non-negative integers;
- rate values are in the closed interval `0..1`;
- rate observations include or can derive their numerator and denominator;
- Mapping-derived movement rates use `movementCount` as the denominator;
- undefined rates are omitted rather than serialized as `0`.

## Examples

### Unexplained movement rate for one mapping

```json
{
  "@id": "urn:ujg:metric:checkout:unexplained-rate",
  "@type": "MetricObservation",
  "metricSubjectRef": "urn:ujg:mapping:execution-12345",
  "metricKey": "unexplainedMovementRate",
  "metricValue": 0.25,
  "metricUnit": "ratio",
  "numeratorCount": 1,
  "denominatorCount": 4,
  "sourceMappingRef": "urn:ujg:mapping:execution-12345"
}
```

### Traversal count for a transition

```json
{
  "@id": "urn:ujg:metric:checkout:transition-cart-payment",
  "@type": "MetricObservation",
  "metricSubjectRef": "urn:ujg:transition:cart-to-payment",
  "metricKey": "transitionTraversalCount",
  "metricValue": 812,
  "metricUnit": "count",
  "aggregationMethod": "sum"
}
```
