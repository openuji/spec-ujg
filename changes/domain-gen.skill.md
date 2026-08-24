# UJG Domain Model Derivation

## Purpose

Derive a minimal, stable, technology-neutral domain model from a UJG model and its Domain Requirements.

The result describes **what domain state, rules, identities, relationships, and operations must exist** so the journey can be realized.

It does not decide where those semantics execute or persist.

## Inputs

Required:

* canonical UJG
* UJG Domain Requirements, when present

Optional:

* an existing domain model to evolve rather than replace

Treat UJG identities as authoritative.

## Derivation

Work from requirements to domain semantics, never from application stereotypes.

For every Domain Requirement:

1. Determine what domain fact, lifecycle, relationship, operation, or continuity is required.
2. Reuse an existing domain concept when it can satisfy the requirement without losing an important distinction.
3. Introduce a new concept only when it has an independent identity, lifecycle, or responsibility.
4. Record which Domain Requirements justify every generated element.

Use the surrounding UJG to interpret each requirement, including relevant states, transitions, conditions, effects, entries, users, touchpoints, and other referenced semantics.

Do not mechanically translate UJG States into domain states.

## Minimality

Produce the smallest model that satisfies all requirements.

Do not introduce concepts merely because they are conventional for the application category.

A generated domain element without requirement justification is a defect.

## Ambiguity

Do not invent missing semantics.

When several domain models satisfy the same requirements, prefer the simplest model that preserves all required distinctions.

When an important choice cannot be derived from the inputs, report it as unresolved rather than silently selecting a conventional interpretation.

## Output

Produce a technology-neutral domain model containing only semantics required by the inputs.

Represent as applicable:

* domain concepts and stable identities;
* relationships;
* meaningful lifecycle or state distinctions;
* domain operations;
* preconditions and postconditions;
* invariants;
* identity and continuity semantics;
* temporal semantics.

Every generated element MUST reference the Domain Requirement or UJG evidence that justifies it.

Also report:

* unsatisfied requirements;
* unresolved semantic decisions;
* generated elements lacking adequate justification.

A model with unsatisfied or unresolved required semantics is not complete.

## Domain Semantics vs. Realization

The domain model specifies **what must remain true**, not how or where it is implemented.

Do not choose between implementations such as:

* browser memory;
* localStorage or IndexedDB;
* server-side state;
* SQL or NoSQL storage;
* edge or serverless state;
* local or remote execution.

Those are downstream realization decisions.

If a requirement constrains realization, express the semantic constraint rather than prescribing a technology.

For example, model:

> A shared capacity value must remain authoritative across concurrent participants.

Do not derive:

> Use a server-side relational database.

## Identity

Derive only the identity and continuity semantics required by the journey.

Do not equate UJG `User` with an authenticated account.

Do not introduce accounts, sessions, OAuth, passwords, roles, or other authentication mechanisms unless explicitly required by the modeled journey or external constraints.

## Stability

Prefer semantic stability over redesign.

When evolving an existing model:

* preserve concepts and IDs whose meaning has not changed;
* add, remove, or alter elements only when changed requirements justify it;
* avoid unnecessary renaming or restructuring.

Use deterministic identifiers derived from stable domain terminology.

## Boundaries

Do NOT generate or prescribe:

* persistence technology;
* database schemas;
* API endpoints or transport;
* frontend/backend placement;
* framework architecture;
* repositories, controllers, or services;
* authentication mechanisms;
* messaging infrastructure;
* deployment architecture.

These belong to downstream domain realization.

## Validation

Before returning the model, verify:

1. every Domain Requirement is satisfied or explicitly unresolved;
2. every generated domain element has traceable justification;
3. no required journey distinction was lost by collapsing concepts;
4. no unnecessary domain concepts were introduced;
5. no implementation choice is presented as domain semantics;
6. placement and persistence decisions remain outside the model unless the inputs explicitly constrain them.

## Core Rule

UJG describes the journey.

Domain Requirements state what that journey demands from the application domain.

This skill derives the smallest stable domain model that satisfies those demands.

Placement, persistence, transport, and execution architecture are downstream implementation decisions.
