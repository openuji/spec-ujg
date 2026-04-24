## Overview

This optional module defines a graph-native vocabulary for attaching domain-level conditions to UJG
Graph transitions.

A condition describes when a transition is eligible to be taken. A condition does not create a new
graph edge, does not act as a state, and does not point directly to a target state. All movement
between journey states remains represented by `Transition` nodes from the Graph module.

This module also defines `ConditionSet`, an addressable grouping node for conditional branches. A
`ConditionSet` groups two or more guarded transitions that share the same source state. In this
first version, a `ConditionSet` represents a branching point where one path is intended to be taken.

This module is optional. It extends Graph traversal semantics for consumers that understand
conditions, but it does not replace Graph's topology model.

**Non-goals:**

* This module does **not** define a condition expression language.
* This module does **not** define domain state models such as Git branch state, payment provider
  state, inventory state, authentication state, or feature-flag state.
* This module does **not** define runtime evaluation APIs.
* This module does **not** create hidden state-to-state edges outside Graph `Transition` nodes.
* This module does **not** model user-choice branches that can already be represented by ordinary
  labeled transitions.

## Normative Artifacts

This module is published through the following artifacts:

- `condition.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/condition`
- `condition.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/condition.context.jsonld`
- `condition.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/condition.shape`

Examples in this page compose the shared baseline context:

```json
[
  "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
  "https://ujg.specs.openuji.org/ed/ns/condition.context.jsonld"
]
```

## Terminology

* <dfn>Condition</dfn>: An addressable predicate-like node that describes when a transition is
  eligible.
* <dfn>Guarded transition</dfn>: A Graph `Transition` that has a `conditionRef`.
* <dfn>ConditionSet</dfn>: An addressable grouping of guarded transitions that form one conditional
  branch point.
* <dfn>Condition branch</dfn>: A group of conditional transitions from the same source state where
  one path is intended to be taken.

---

## Attachment Model

The module introduces real JSON-LD terms and RDF edges for conditional branching:

* `condition:conditionRef` links a Graph `Transition` to a `Condition`.
* `condition:conditionTransitionRefs` links a `ConditionSet` to the guarded transitions that form
  one branch point.

A `Condition` **MUST NOT** reference a target state directly.

A `ConditionSet` **MUST NOT** reference a source state directly. Its effective source state is
derived from the common `from` value of all referenced transitions.

A `ConditionSet` **MUST** reference transitions that all share the same `from` state.

A transition referenced by a `ConditionSet` **MUST** have exactly one `conditionRef`.

A consumer that implements this module **MUST** treat transitions in a `ConditionSet` as conditional
branch alternatives. In this first version of the module, a `ConditionSet` means that one referenced
transition is intended to be taken.

A consumer that does not implement this module **MAY** ignore condition semantics, but it **SHOULD**
preserve recognized JSON-LD data during read-transform-write when possible.

Opaque runtime bindings, expression syntax, platform-specific evaluators, and domain-state
references **SHOULD** remain in Core `extensions` unless a future optional module defines them as
interoperable vocabulary.

## Ontology {data-cop-concept="ontology"}

The normative Conditions ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/condition`. It is the authoritative structural definition for
`Condition`, `ConditionSet`, and the properties declared by this module.

:::include ./condition.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Conditions JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/condition.context.jsonld`. It provides the compact JSON-LD term
mappings and coercions for Conditions-specific properties and classes.

:::include ./condition.context.jsonld :::

---

## Validation {data-cop-concept="validation"}

The normative Conditions SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/condition.shape`. It is the authoritative validation artifact
for Conditions structural constraints.

:::include ./condition.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Graph preservation:** A condition **MUST NOT** create an implicit edge. Every possible movement
   between states **MUST** be represented by a Graph `Transition`.
2. **Transition guard semantics:** A transition with `conditionRef` is eligible only when the
   referenced condition is satisfied by the implementation's domain/runtime context.
3. **Branch semantics:** A `ConditionSet` groups guarded transitions that form one branch point. In
   this version, a `ConditionSet` represents a branch where one referenced transition is intended to
   be taken.
4. **No expression language:** The meaning and evaluation of a condition are intentionally outside
   this module unless another optional module defines expression semantics.
5. **Graceful degradation:** Consumers that do not understand this module **MAY** render the
   underlying Graph normally and **MAY** ignore conditional eligibility.

---

## Appendix: Combined JSON Example {.unnumbered}

Codex chat branch-check example:

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/condition.context.jsonld"
  ],
  "@id": "https://example.com/ujg/codex/branch-condition.jsonld",
  "@type": "UJGDocument",
  "specVersion": "1.0",
  "nodes": [
    {
      "@type": "Journey",
      "@id": "urn:ujg:journey:codex-chat-in-ide",
      "startState": "urn:ujg:state:user-asks-codex-to-code",
      "stateRefs": [
        "urn:ujg:state:user-asks-codex-to-code",
        "urn:ujg:state:codex-starts-coding",
        "urn:ujg:state:branch-confirmation-popup",
        "urn:ujg:state:switch-back-to-original-branch",
        "urn:ujg:state:codex-starts-coding-on-original-branch"
      ],
      "transitionRefs": [
        "urn:ujg:transition:ask-code-to-start-coding",
        "urn:ujg:transition:ask-code-to-branch-popup",
        "urn:ujg:transition:popup-keep-current-branch",
        "urn:ujg:transition:popup-go-back",
        "urn:ujg:transition:switch-back-to-start-coding"
      ]
    },

    {
      "@type": "State",
      "@id": "urn:ujg:state:user-asks-codex-to-code",
      "label": "User asks Codex to make code changes"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:codex-starts-coding",
      "label": "Codex starts coding on the current branch"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:branch-confirmation-popup",
      "label": "Codex asks whether to continue on the current branch or return to the original branch"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:switch-back-to-original-branch",
      "label": "IDE switches back to the original branch associated with the chat"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:codex-starts-coding-on-original-branch",
      "label": "Codex starts coding on the original branch"
    },

    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:ask-code-to-start-coding",
      "from": "urn:ujg:state:user-asks-codex-to-code",
      "to": "urn:ujg:state:codex-starts-coding",
      "label": "Branch is unchanged",
      "conditionRef": "urn:ujg:condition:current-branch-equals-chat-branch"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:ask-code-to-branch-popup",
      "from": "urn:ujg:state:user-asks-codex-to-code",
      "to": "urn:ujg:state:branch-confirmation-popup",
      "label": "Branch differs",
      "conditionRef": "urn:ujg:condition:current-branch-differs-from-chat-branch"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:popup-keep-current-branch",
      "from": "urn:ujg:state:branch-confirmation-popup",
      "to": "urn:ujg:state:codex-starts-coding",
      "label": "Keep me on the current branch"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:popup-go-back",
      "from": "urn:ujg:state:branch-confirmation-popup",
      "to": "urn:ujg:state:switch-back-to-original-branch",
      "label": "Go back to the original branch"
    },
    {
      "@type": "Transition",
      "@id": "urn:ujg:transition:switch-back-to-start-coding",
      "from": "urn:ujg:state:switch-back-to-original-branch",
      "to": "urn:ujg:state:codex-starts-coding-on-original-branch",
      "label": "Continue coding"
    },

    {
      "@type": "ConditionSet",
      "@id": "urn:ujg:condition-set:resolve-branch-context-before-coding",
      "label": "Resolve branch context before coding",
      "conditionTransitionRefs": [
        "urn:ujg:transition:ask-code-to-start-coding",
        "urn:ujg:transition:ask-code-to-branch-popup"
      ]
    },

    {
      "@type": "Condition",
      "@id": "urn:ujg:condition:current-branch-equals-chat-branch",
      "label": "Current IDE Git branch equals the branch associated with this Codex chat session"
    },
    {
      "@type": "Condition",
      "@id": "urn:ujg:condition:current-branch-differs-from-chat-branch",
      "label": "Current IDE Git branch differs from the branch associated with this Codex chat session"
    }
  ]
}
```

## Appendix: Opaque Runtime Hints {.unnumbered}

Runtime condition bindings are intentionally not standardized by this module. Implementations that
need to bind a `Condition` to product-specific runtime state can use Core `extensions`.

```json
{
  "@type": "Condition",
  "@id": "urn:ujg:condition:current-branch-differs-from-chat-branch",
  "label": "Current IDE Git branch differs from the branch associated with this Codex chat session",
  "extensions": {
    "com.example.runtime-condition": {
      "conditionKey": "ide.git.currentBranchDiffersFromChatBranch",
      "domain": "ide.git",
      "evaluator": "product-private"
    }
  }
}
```
