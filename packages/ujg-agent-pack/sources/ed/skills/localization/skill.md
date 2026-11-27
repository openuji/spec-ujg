# UJG ED Localization Modeling

Use this skill together with `ujg-ed-modeling`. Do not use it as a replacement for the parent modeling skill.

## Source of truth

Use the active Editor's Draft unless the user explicitly asks for a dated snapshot:

`https://ujg.specs.openuji.org/ed/modules/l10n`

Generate only terms defined by the active ED Localization context unless the user explicitly requests an extension.

## Scope

Localization attaches locale and copy metadata to UJG nodes.

It does not define routes, traversal, locale negotiation, runtime translation loading, JavaScript evaluation, ICU behavior, imports, or graph identity.

Graph defines topology.
Localization annotates UJG nodes with copy and locale metadata. It can be used with Phase `Step`
and `Phase` resources when the Phase context is composed, and with `PainPoint` only when the
Experience Annotation optional module is explicitly composed.

## Required context

When using Localization terms, include the Localization context:

```yaml
- https://ujg.specs.openuji.org/ed/ns/context.jsonld
- https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld
```

When using locale switches with `OutgoingTransition`, also include Graph context if it is not already included.

## Vocabulary

Use only these Localization classes:

```text
Locale
MessageMeta
Message
```

Use only these Localization properties:

```text
copy
localeCode
argumentNames
defaultLocale
fallbackLocales
rtl
messageMeta
locale
messageValue
targetLocale
```

Prefer the canonical compact terms in mixed-module examples. Use the published `ujgl10n:` prefix
when an explicit vocabulary prefix is useful.

Do not invent retired bundle-oriented shapes, key-oriented identity fields, aggregate locale maps, selector-state fields, translation-resource loaders, composite-message structures, or generic language-code aliases.

Use private `extensions` only for project-specific runtime hints that are not intended to be interoperable l10n semantics.

## Locale

Use `Locale` for addressable locale resources.

A `Locale` must have exactly one `localeCode`.

Example:

```yaml
type: Locale
id: urn:example:ujgl10n:locale:de
localeCode: de
```

## MessageMeta and Message

Use `MessageMeta` for reusable copy identity and shared message metadata. The `MessageMeta` IRI is the message identity.

A `MessageMeta` may have:

```text
argumentNames
defaultLocale
fallbackLocales
rtl
```

Use `Message` for a locale-specific string value. Each `Message` must have exactly one `messageMeta`, exactly one `locale`, and exactly one `messageValue`.

Do not create more than one `Message` for the same `messageMeta` and `locale` pair.

Treat `Message.messageValue` as opaque Localization data. It may contain project placeholders such as `${...}`, but Localization does not validate placeholder references or cycles.

Example:

```yaml
- type: Locale
  id: urn:example:ujgl10n:locale:de
  localeCode: de
- type: MessageMeta
  id: urn:example:ujgl10n:home-hero-title
  argumentNames:
    - userName
  defaultLocale: urn:example:ujgl10n:locale:de
- type: Message
  id: urn:example:ujgl10n:message:home-hero-title:de
  messageMeta: urn:example:ujgl10n:home-hero-title
  locale: urn:example:ujgl10n:locale:de
  messageValue: Hallo ${userName}
```

## copy

Use `ujgl10n:copy` to attach any addressable UJG node to one `MessageMeta`.

Example:

```yaml
type: State
id: urn:example:state:home-hero
label: Home hero
copy: urn:example:ujgl10n:home-hero-title
```

Do not use `copy` to define traversal, visibility, routing, state identity, component props, or runtime loading.

## Locale switch affordances

Use Graph `OutgoingTransition` for locale switch affordances.

Every locale-switch OutgoingTransition uses `toEntry` to select an explicit `JourneyEntry`,
never `entrySelector`: its destination is either the same entry wherever it is taken or depends
on the source State, which calls for source-specific transitions, not an `EntrySelector`.
`ujgl10n:targetLocale` declares requested-locale metadata and never infers the Graph destination.

If the locale switch preserves whichever of several States is active, use one state-scoped
OutgoingTransition per source State. Each transition targets the JourneyEntry whose `state` is
that State:

```yaml
- type: State
  id: urn:example:state:form
  entryTransitions:
    - urn:example:ot:locale-en-from-form
- type: JourneyEntry
  id: urn:example:entry:form
  state: urn:example:state:form
- type: OutgoingTransition
  id: urn:example:ot:locale-en-from-form
  label: English
  toEntry: urn:example:entry:form
  targetLocale: urn:example:ujgl10n:locale:en
- type: State
  id: urn:example:state:success
  entryTransitions:
    - urn:example:ot:locale-en-from-success
- type: JourneyEntry
  id: urn:example:entry:success
  state: urn:example:state:success
- type: OutgoingTransition
  id: urn:example:ot:locale-en-from-success
  label: English
  toEntry: urn:example:entry:success
  targetLocale: urn:example:ujgl10n:locale:en
```

The owning Journey lists both States and both Entries. Do not list one of these transitions on both
States: a transition has one fixed `toEntry` and cannot mean “the entry for whichever State is
active.” A locale switch shared by several States is valid only when every source intentionally
enters the same locale landing entry.

If content structure differs by locale, model the distinct Graph Journeys, Entries, States, and
Transitions and target the destination locale's JourneyEntry. Localization annotations do not
themselves mutate topology; Graph owns the difference.

Add Graph `command` to a locale-switch `OutgoingTransition` only when the locale switch has stable
intentional invocation identity that needs a Surface attached to a Command or shared command
identity. Do not create a `Command` merely because `targetLocale` exists.

Do not create duplicate locale-specific states unless locale changes graph topology, available journeys, states, or affordances.

## Separation rules

Keep runtime locale selection out of Localization unless the user explicitly asks for Runtime traces.

Do not model clicked language, selected language, URL locale segment, timestamp, cookie value, browser language, request header, payload, or translation-loader behavior as l10n graph metadata.

Do not use Localization to fix missing Graph structure.

Do not use `targetLocale` without an `OutgoingTransition`.

Do not use `ujgl10n:copy` without a referenced `MessageMeta`.

Do not model composite messages with `messagePartRefs`, `CompositeMessage`, or `MessagePart`.

## Checks before answering

* Did I include l10n context only when l10n terms are used?
* Are all l10n terms defined by the active ED?
* Does every `copy` point to a `MessageMeta`?
* Does every `Locale` have one `localeCode`?
* Does every `Message` have one `messageMeta`, one `locale`, and one `messageValue`?
* Did I avoid duplicate `Message` nodes for the same `messageMeta` and `locale`?
* Is `targetLocale` used only on `OutgoingTransition`?
* Does every locale switch use one explicit `toEntry`?
* If a locale switch re-enters the same State, does its JourneyEntry point to that State?
* If several States preserve their own position across a locale switch, does each State have its
  own OutgoingTransition and matching JourneyEntry rather than one shared transition?
* If locale changes structure, is the different topology modeled explicitly in Graph?
* Did I avoid duplicate locale states unless topology really differs?
* Did I keep runtime locale facts, loaders, URLs, and payloads out of l10n?
* Did Localization avoid inferring or changing Graph traversal by itself?

## Current ED authoring and source scope

Use the current canonical property names and matching vocabulary IRIs. Retired terms are not
aliases. Prefer nested YAML-LD; accept flat or nested JSON-LD and YAML-LD under the same module
semantics. Do not change instance identity when changing serialization or filenames.

Resolve imports against each source location independently of `@base`; ordinary node identities
and references follow standard JSON-LD base rules. Unknown JSON payloads remain opaque.

Consult `references/authoring-terms.json` for canonical mappings and
`references/specs/authoring/index.md` with its accompanying YAML fixtures for the complete style.
