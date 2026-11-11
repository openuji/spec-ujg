## Overview

This optional module defines a graph-native vocabulary for attaching localization metadata to UJG
nodes. It lets a producer bind any addressable node to a reusable `MessageMeta` resource through
`l10n:copyRef`, and model concrete locale-specific text as addressable `Message` nodes.

This module is optional. Its properties annotate Graph resources and do not themselves change
topology, traversal rules, or import resolution. A producer may nevertheless model different Graph
Journeys, States, or affordances when content structure genuinely differs by locale; Graph owns
those topology differences.

## Terminology

* <dfn>Locale</dfn>: An addressable locale resource identified by a language tag.
* <dfn>MessageMeta</dfn>: An addressable message identity and shared metadata resource.
* <dfn>Message</dfn>: An addressable locale-specific value for one `MessageMeta` and one `Locale`.

## Locale {data-cop-concept="locale"}

A [=Locale=] identifies one locale used by localization metadata or locale-specific messages.

```mermaid
classDiagram
  class Locale {
    id
    localeCode
  }
```

Example JSON node:

```json
{
  "@type": "l10n:Locale",
  "@id": "urn:l10n:locale:en",
  "l10n:localeCode": "en"
}
```

## MessageMeta {data-cop-concept="message-meta"}

A [=MessageMeta=] identifies a reusable copy contract. The `MessageMeta` IRI is the stable message
identity. UJG nodes reference a message meta node with `l10n:copyRef`.

```mermaid
classDiagram
  class Locale
  class MessageMeta {
    id
    argumentNames
    defaultLocaleRef
    fallbackLocaleRefs
    rtl
  }
  MessageMeta --> Locale : defaultLocaleRef
  MessageMeta --> "0..*" Locale : fallbackLocaleRefs
```

Example JSON node:

```json
{
  "@type": "l10n:MessageMeta",
  "@id": "urn:l10n:message-meta:order-confirmation-title",
  "l10n:argumentNames": ["orderNumber"],
  "l10n:defaultLocaleRef": "urn:l10n:locale:en",
  "l10n:fallbackLocaleRefs": ["urn:l10n:locale:en", "urn:l10n:locale:de"],
  "l10n:rtl": false
}
```

## Message {data-cop-concept="message"}

A [=Message=] carries one locale-specific string value for one [=MessageMeta=] and one [=Locale=].
The value is an opaque string from the perspective of Localization conformance.

```mermaid
classDiagram
  class MessageMeta
  class Locale
  class Message {
    id
    messageMetaRef
    localeRef
    value
  }
  Message --> MessageMeta : messageMetaRef
  Message --> Locale : localeRef
```

Example JSON node:

```json
{
  "@type": "l10n:Message",
  "@id": "urn:l10n:message:order-confirmation-title:en",
  "l10n:messageMetaRef": "urn:l10n:message-meta:order-confirmation-title",
  "l10n:localeRef": "urn:l10n:locale:en",
  "l10n:value": "Order ${orderNumber} confirmed"
}
```

## Attachment Model

The module introduces real JSON-LD terms and RDF edges for localization attachment:

* `l10n:copyRef` links any UJG node to a `MessageMeta`.
* `l10n:messageMetaRef` links a `Message` to the `MessageMeta` it realizes.
* `l10n:localeRef` links a `Message` to its `Locale`.
* `l10n:defaultLocaleRef` and `l10n:fallbackLocaleRefs` link `MessageMeta` to fallback locale
  resources.
* `l10n:targetLocaleRef` declares the requested `Locale` associated with an [=OutgoingTransition=].

```mermaid
classDiagram
  class Node {
    copyRef
  }
  class MessageMeta
  class Locale
  class OutgoingTransition {
    targetLocaleRef
  }
  Node --> MessageMeta : copyRef
  OutgoingTransition --> Locale : targetLocaleRef
```

Example JSON nodes:

```json
[
  {
    "@type": "Journey",
    "@id": "urn:ujg:journey:order-confirmation",
    "defaultEntryRef": "urn:ujg:entry:order-confirmation",
    "entryRefs": ["urn:ujg:entry:order-confirmation"],
    "stateRefs": ["urn:ujg:state:order-confirmation"]
  },
  {
    "@type": "JourneyEntry",
    "@id": "urn:ujg:entry:order-confirmation",
    "stateRef": "urn:ujg:state:order-confirmation"
  },
  {
    "@type": "State",
    "@id": "urn:ujg:state:order-confirmation",
    "label": "Order confirmation",
    "entryTransitionRefs": ["urn:example:ot:language-english"],
    "l10n:copyRef": "urn:l10n:message-meta:order-confirmation-title"
  },
  {
    "@type": "l10n:Locale",
    "@id": "urn:l10n:locale:en",
    "l10n:localeCode": "en"
  },
  {
    "@type": "l10n:MessageMeta",
    "@id": "urn:l10n:message-meta:order-confirmation-title",
    "l10n:argumentNames": ["orderNumber"],
    "l10n:defaultLocaleRef": "urn:l10n:locale:en"
  },
  {
    "@type": "l10n:Message",
    "@id": "urn:l10n:message:order-confirmation-title:en",
    "l10n:messageMetaRef": "urn:l10n:message-meta:order-confirmation-title",
    "l10n:localeRef": "urn:l10n:locale:en",
    "l10n:value": "Order ${orderNumber} confirmed"
  },
  {
    "@type": "OutgoingTransition",
    "@id": "urn:example:ot:language-english",
    "label": "English",
    "toEntryRef": "urn:ujg:entry:order-confirmation",
    "l10n:targetLocaleRef": "urn:l10n:locale:en"
  }
]
```

Here the locale switch explicitly re-enters the same Journey and State through its entry contract.
Localization supplies the requested locale; Graph supplies the destination.

The module also defines non-reference properties `l10n:localeCode`, `l10n:argumentNames`,
`l10n:rtl`, and `l10n:value`.

## Normative Artifacts

This module is published through the following artifacts:

- `l10n.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/l10n`
- `l10n.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld`
- `l10n.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/l10n.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`
with the Localization context.

**Non-goals:**

* This module does **not** define locale negotiation, runtime translation loading, JavaScript
  evaluation, ICU formatting behavior, pluralization, or runtime interpolation APIs.
* This module does **not** introduce new traversal semantics beyond [[UJG Graph]].
* This module does **not** replace opaque vendor-private hints carried in [[UJG Core]] `extensions`.

### Ontology {data-cop-concept="ontology"}

The normative Localization ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/l10n`. It is the authoritative structural definition for
`Locale`, `MessageMeta`, `Message`, and the properties declared by this module.

:::include ./l10n.ttl :::

### JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Localization JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld`. It provides the compact JSON-LD term
mappings and coercions for Localization-specific properties and classes.

:::include ./l10n.context.jsonld :::

---

### Validation {data-cop-concept="validation"}

The normative Localization SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/l10n.shape`. It is the authoritative validation artifact for
Localization structural constraints.

:::include ./l10n.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Attachment only:** Localization properties **MUST NOT** change Graph validity, graph traversal
   behavior, import resolution, or core node identity. Locale-dependent topology **MAY** be modeled
   explicitly with distinct Graph Journeys, Entries, States, and Transitions.
2. **Message identity:** A `MessageMeta` IRI identifies the reusable message contract. Producers
   **MUST** use that IRI as the shared message identity.
3. **Locale identity:** Locale references use `Locale` IRIs. A `Locale.localeCode` value identifies
   the language tag represented by that locale resource.
4. **Message uniqueness:** Producers **MUST NOT** create more than one `Message` for the same
   `messageMetaRef` and `localeRef` pair.
5. **Opaque value:** `Message.value` is a string value. Consumers **MUST NOT** infer UJG graph edges,
   message dependencies, JavaScript execution, ICU behavior, or cycle constraints from the string.
6. **Locale target metadata:** `l10n:targetLocaleRef` declares the requested locale associated with an
   outgoing affordance. It does not itself define graph traversal behavior. The host
   [=OutgoingTransition=]'s `toEntryRef` selects the destination [=JourneyEntry=].
7. **Shared-topology state preservation:** When a locale switch must preserve whichever of several
   States is active, each source State **MUST** directly reference a state-specific OutgoingTransition.
   Each transition's `toEntryRef` **MUST** target the JourneyEntry for the corresponding destination
   State.
8. **Shared locale switches:** Several States **MAY** list the same locale-switch transition only
   when its one fixed destination entry is correct for each of them. Consumers **MUST NOT**
   reinterpret a shared transition's `toEntryRef` as relative to the active State.
9. **Locale topology:** When locales share topology, a state-scoped locale-switch OutgoingTransition
   may target an entry whose `stateRef` is the same State where that affordance is available. When
   content structure differs by locale, it may target an entry owned by a locale-specific Journey
   with different local topology.
10. **No locale inference:** Consumers **MUST NOT** infer a Journey, JourneyEntry, or State from
   `targetLocaleRef`; the Graph reference remains explicit and authoritative.
11. **Graceful degradation:** A consumer that does not implement this module **MAY** ignore
   Localization semantics, but it **SHOULD** preserve recognized JSON-LD data during
   read-transform-write when possible.
12. **Private runtime hints:** Platform-specific i18n loader configuration that is not intended for
   shared queryability or validation **SHOULD** remain in Core `extensions`.

---

## Examples

### Shared-Topology State-Preserving Switches

A state-preserving switch is source-specific because each OutgoingTransition has one fixed
`toEntryRef`. In this shared-topology checkout Journey, switching to English from `Form` re-enters
`Form`, while switching from `Success` re-enters `Success`:

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld"
  ],
  "@type": "UJGDocument",
  "@id": "https://example.com/ujg/l10n/shared-topology-switch.jsonld",
  "nodes": [
    {
      "@type": "l10n:Locale",
      "@id": "urn:l10n:locale:en",
      "l10n:localeCode": "en"
    },
    {
      "@type": "Journey",
      "@id": "urn:journey:checkout",
      "defaultEntryRef": "urn:entry:checkout-form",
      "entryRefs": [
        "urn:entry:checkout-form",
        "urn:entry:checkout-success"
      ],
      "stateRefs": [
        "urn:state:checkout-form",
        "urn:state:checkout-success"
      ],
      "transitionRefs": ["urn:transition:checkout-submit"]
    },
    {
      "@type": "JourneyEntry",
      "@id": "urn:entry:checkout-form",
      "stateRef": "urn:state:checkout-form"
    },
    {
      "@type": "JourneyEntry",
      "@id": "urn:entry:checkout-success",
      "stateRef": "urn:state:checkout-success"
    },
    {
      "@type": "State",
      "@id": "urn:state:checkout-form",
      "label": "Form",
      "entryTransitionRefs": ["urn:ot:english-from-form"]
    },
    {
      "@type": "State",
      "@id": "urn:state:checkout-success",
      "label": "Success",
      "entryTransitionRefs": ["urn:ot:english-from-success"]
    },
    {
      "@type": "Transition",
      "@id": "urn:transition:checkout-submit",
      "from": "urn:state:checkout-form",
      "to": "urn:state:checkout-success"
    },
    {
      "@type": "OutgoingTransition",
      "@id": "urn:ot:english-from-form",
      "label": "English",
      "toEntryRef": "urn:entry:checkout-form",
      "l10n:targetLocaleRef": "urn:l10n:locale:en"
    },
    {
      "@type": "OutgoingTransition",
      "@id": "urn:ot:english-from-success",
      "label": "English",
      "toEntryRef": "urn:entry:checkout-success",
      "l10n:targetLocaleRef": "urn:l10n:locale:en"
    }
  ]
}
```

The two locale-switch affordances may look identical in the interface, but they are different Graph
edges with different destination entries. One locale-switch transition listed by both States would
be wrong for this state-preserving behavior: it has one fixed entry. Sharing one transition remains
appropriate when every source intentionally enters the same locale landing entry.

### Locale Switch Affordance Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/core.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld"
  ],
  "@type": "UJGDocument",
  "@id": "https://example.com/ujg/l10n/locale-switch.jsonld",
  "nodes": [
    {
      "@type": "l10n:Locale",
      "@id": "urn:l10n:locale:en",
      "l10n:localeCode": "en"
    },
    {
      "@type": "l10n:Locale",
      "@id": "urn:l10n:locale:de",
      "l10n:localeCode": "de"
    },
    {
      "@type": "Journey",
      "@id": "urn:journey:confirmation-en",
      "defaultEntryRef": "urn:entry:confirmation-en",
      "entryRefs": ["urn:entry:confirmation-en"],
      "stateRefs": ["urn:state:confirmation-en"]
    },
    {
      "@type": "JourneyEntry",
      "@id": "urn:entry:confirmation-en",
      "stateRef": "urn:state:confirmation-en"
    },
    {
      "@type": "State",
      "@id": "urn:state:confirmation-en",
      "label": "English confirmation",
      "entryTransitionRefs": ["urn:example:ot:language-german"]
    },
    {
      "@type": "Journey",
      "@id": "urn:journey:confirmation-de",
      "defaultEntryRef": "urn:entry:confirmation-de",
      "entryRefs": ["urn:entry:confirmation-de"],
      "stateRefs": ["urn:state:summary-de", "urn:state:legal-notice-de"],
      "transitionRefs": ["urn:transition:summary-to-legal-notice-de"]
    },
    {
      "@type": "JourneyEntry",
      "@id": "urn:entry:confirmation-de",
      "stateRef": "urn:state:summary-de"
    },
    {
      "@type": "State",
      "@id": "urn:state:summary-de",
      "label": "German order summary"
    },
    {
      "@type": "State",
      "@id": "urn:state:legal-notice-de",
      "label": "German legal notice"
    },
    {
      "@type": "Transition",
      "@id": "urn:transition:summary-to-legal-notice-de",
      "from": "urn:state:summary-de",
      "to": "urn:state:legal-notice-de"
    },
    {
      "@type": "OutgoingTransition",
      "@id": "urn:example:ot:language-german",
      "label": "Deutsch",
      "toEntryRef": "urn:entry:confirmation-de",
      "l10n:targetLocaleRef": "urn:l10n:locale:de"
    }
  ]
}
```

The English Journey has one confirmation State. The German Journey has a summary followed by a
separate legal-notice State. The locale switch therefore targets the German entry contract rather
than assuming that both locales share a State or topology.

### Combined JSON Example

```json
{
  "@context": [
    "https://ujg.specs.openuji.org/ed/ns/context.jsonld",
    "https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld"
  ],
  "@id": "https://example.com/ujg/l10n/checkout.jsonld",
  "@type": "UJGDocument",
  "nodes": [
    {
      "@type": "l10n:Locale",
      "@id": "urn:l10n:locale:en",
      "l10n:localeCode": "en"
    },
    {
      "@type": "l10n:Locale",
      "@id": "urn:l10n:locale:de",
      "l10n:localeCode": "de"
    },
    {
      "@type": "State",
      "@id": "urn:ujg:state:order-confirmation",
      "label": "Order confirmation",
      "l10n:copyRef": "urn:l10n:message-meta:order-confirmation-title"
    },
    {
      "@type": "l10n:MessageMeta",
      "@id": "urn:l10n:message-meta:order-confirmation-title",
      "l10n:argumentNames": ["orderNumber"],
      "l10n:defaultLocaleRef": "urn:l10n:locale:en",
      "l10n:fallbackLocaleRefs": ["urn:l10n:locale:en", "urn:l10n:locale:de"],
      "l10n:rtl": false
    },
    {
      "@type": "l10n:Message",
      "@id": "urn:l10n:message:order-confirmation-title:en",
      "l10n:messageMetaRef": "urn:l10n:message-meta:order-confirmation-title",
      "l10n:localeRef": "urn:l10n:locale:en",
      "l10n:value": "Order ${orderNumber} confirmed"
    },
    {
      "@type": "l10n:Message",
      "@id": "urn:l10n:message:order-confirmation-title:de",
      "l10n:messageMetaRef": "urn:l10n:message-meta:order-confirmation-title",
      "l10n:localeRef": "urn:l10n:locale:de",
      "l10n:value": "Bestellung ${orderNumber} bestaetigt"
    }
  ]
}
```

### Opaque Runtime Hints

```json
{
  "@id": "urn:l10n:message-meta:order-confirmation-title",
  "@type": "l10n:MessageMeta",
  "extensions": {
    "com.acme.i18n-runtime": {
      "resourceFile": "checkout/confirmation.json",
      "bundleFormat": "icu"
    }
  }
}
```
