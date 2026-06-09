## Overview

This optional module defines a graph-native vocabulary for attaching localization metadata to UJG
nodes. It lets a producer bind any addressable node to a reusable `MessageBundle` resource through
`l10n:copyRef` instead of hiding message keys, locale fallbacks, or locale maps inside opaque Core
`extensions`.

This module is optional. It annotates the shared graph with localization resources, but it does
**not** change graph topology, traversal rules, or import resolution.

## Normative Artifacts

This module is published through the following artifacts:

- `l10n.ttl`: ontology, published at `https://ujg.specs.openuji.org/ed/ns/l10n`
- `l10n.context.jsonld`: JSON-LD term mappings, published at `https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld`
- `l10n.shape.ttl`: SHACL validation rules, published at `https://ujg.specs.openuji.org/ed/ns/l10n.shape`

Examples in this page compose the shared baseline context `https://ujg.specs.openuji.org/ed/ns/context.jsonld`
with the Localization context.

**Non-goals:**

* This module does **not** define locale negotiation, runtime translation loading, or ICU formatting behavior.
* This module does **not** introduce new traversal semantics beyond [[UJG Graph]].
* This module does **not** replace opaque vendor-private hints carried in [[UJG Core]] `extensions`.

## Terminology

* <dfn>MessageBundle</dfn>: An addressable localization resource that carries message-key and locale payload metadata.

---

## Attachment Model

The module introduces real JSON-LD terms and RDF edges for localization attachment:

* `l10n:copyRef` links any UJG node to a `MessageBundle`.

The module also defines non-reference properties such as `l10n:namespace`, `l10n:messageKey`,
`l10n:defaultLocale`, `l10n:fallbackLocales`, `l10n:rtl`, and JSON-valued `l10n:locales`.

## Ontology {data-cop-concept="ontology"}

The normative Localization ontology is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/l10n`. It is the authoritative structural definition for
`MessageBundle` and the properties declared by this module.

:::include ./l10n.ttl :::

## JSON-LD Context {data-cop-concept="jsonld-context"}

The normative Localization JSON-LD context is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld`. It provides the compact JSON-LD term
mappings and coercions for Localization-specific properties and classes.

:::include ./l10n.context.jsonld :::

---

## Validation {data-cop-concept="validation"}

The normative Localization SHACL shape is defined below and is published at
`https://ujg.specs.openuji.org/ed/ns/l10n.shape`. It is the authoritative validation artifact for
Localization structural constraints.

:::include ./l10n.shape.ttl :::

The rules below define the remaining module semantics beyond the structural constraints captured by
the SHACL shape.

1. **Attachment only:** Localization properties **MUST NOT** change Graph validity, graph traversal
   behavior, import resolution, or core node identity.
2. **Bundle semantics:** `l10n:messageKey` identifies the canonical message entry for the attached
   node, while `l10n:locales` carries optional locale-specific payloads for implementations that
   choose to embed translated values.
3. **Graceful degradation:** A consumer that does not implement this module **MAY** ignore
   Localization semantics, but it **SHOULD** preserve recognized JSON-LD data during
   read-transform-write when possible.
4. **Private runtime hints:** Platform-specific i18n loader configuration that is not intended for
   shared queryability or validation **SHOULD** remain in Core `extensions`.

---

## Appendix: Combined JSON Example {.unnumbered}

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
      "@type": "ExperienceStep",
      "@id": "urn:ujg:step:order-confirmation",
      "label": "Order confirmation",
      "l10n:copyRef": "urn:l10n:bundle:order-confirmation"
    },
    {
      "@type": "l10n:MessageBundle",
      "@id": "urn:l10n:bundle:order-confirmation",
      "l10n:namespace": "checkout.confirmation",
      "l10n:messageKey": "order.confirmation.title",
      "l10n:defaultLocale": "en",
      "l10n:fallbackLocales": ["en", "de"],
      "l10n:rtl": false,
      "l10n:locales": {
        "en": {
          "title": "Order confirmed",
          "subtitle": "Your receipt is on the way."
        },
        "de": {
          "title": "Bestellung bestaetigt",
          "subtitle": "Ihre Quittung ist unterwegs."
        }
      }
    }
  ]
}
```

## Appendix: Opaque Runtime Hints {.unnumbered}

```json
{
  "@id": "urn:l10n:bundle:order-confirmation",
  "@type": "l10n:MessageBundle",
  "l10n:messageKey": "order.confirmation.title",
  "extensions": {
    "com.acme.i18n-runtime": {
      "resourceFile": "checkout/confirmation.json",
      "bundleFormat": "icu"
    }
  }
}
```
