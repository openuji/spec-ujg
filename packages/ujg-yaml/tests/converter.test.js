import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  compileAuthoringYaml,
  listTargets,
  loadTarget,
  projectCanonicalJsonLd,
  validateCanonicalJsonLd,
} from '../src/index.js';
import { projectionRegistryDiagnostics } from '../src/registry.js';
import {
  buildVocabularyForTargetId,
  stringifyVocabulary,
} from '../scripts/build-target-vocabulary.js';

test('lists the locked ed-2026-07-13 target', () => {
  assert.deepEqual(listTargets(), ['ed-2026-07-13']);
});

test('loads generated vocabulary from the locked target', async () => {
  const target = await loadTarget('ed-2026-07-13');

  assert.equal(target.vocabulary.targetId, 'ed-2026-07-13');
  assert.equal(target.vocabulary.classes.Journey.module, 'graph');
  assert.equal(target.vocabulary.properties.stateDataRef.module, 'stateData');
  assert.ok(target.vocabulary.referenceProperties.includes('stateDataRef'));
});

test('generated vocabulary is deterministic', async () => {
  const generated = stringifyVocabulary(await buildVocabularyForTargetId('ed-2026-07-13'));
  const locked = await readFile(
    new URL('../targets/ed-2026-07-13.vocab.json', import.meta.url),
    'utf8'
  );

  assert.equal(generated, locked);
});

test('projection registry validates against target vocabulary', async () => {
  const target = await loadTarget('ed-2026-07-13');
  const diagnostics = projectionRegistryDiagnostics({
    ...target.vocabulary,
    classes: {
      ...target.vocabulary.classes,
      Touchpoint: undefined,
    },
  });

  assert.ok(diagnostics.some((message) => message.includes('Touchpoint')));
});

test('compiles the complex fixture to deterministic canonical JSON-LD', async () => {
  const source = await readFile(new URL('../fixtures/complex.yaml', import.meta.url), 'utf8');
  const result = await compileAuthoringYaml(source);

  assert.equal(result.ok, true);
  assert.equal(result.provenance.ujgTarget, 'ed-2026-07-13');
  assert.equal(result.document['@type'], 'UJGDocument');
  assert.ok(result.document['@context'].includes('https://ujg.specs.openuji.org/ed/ns/core.context.jsonld'));
  assert.ok(result.document.nodes.some((node) => node['@type'] === 'JourneyEntryIndex'));
  assert.ok(result.document.nodes.some((node) => node['@type'] === 'DistributedArtifact'));
  assert.ok(result.document.nodes.some((node) => node['@type'] === 'AccessibleLocator'));
});

test('compiles the auth fixture and preserves sampleScreenRef as a namespaced extension', async () => {
  const source = await readFile(new URL('../fixtures/auth.yaml', import.meta.url), 'utf8');
  const result = await compileAuthoringYaml(source);

  assert.equal(result.ok, true);
  const surface = result.document.nodes.find((node) => node['@id'] === 'app-sign-in-required-surface');
  assert.equal(
    surface.extensions['https://openuji.org/ujg-yaml/extensions#sampleScreenRef'],
    'screens/app-sign-in-required.png'
  );
});

test('uses keyed map keys as canonical ids and accepts matching body ids', async () => {
  const result = await compileAuthoringYaml(`ujgTarget: ed-2026-07-13
actions:
  urn:action:key-only:
    label: Key only
  urn:action:matching-id:
    id: urn:action:matching-id
    label: Matching id
  urn:action:matching-at-id:
    "@id": urn:action:matching-at-id
    label: Matching @id
`);

  assert.equal(result.ok, true);
  assert.ok(result.document.nodes.some((node) => node['@id'] === 'urn:action:key-only'));
  assert.ok(result.document.nodes.some((node) => node['@id'] === 'urn:action:matching-id'));
  assert.ok(result.document.nodes.some((node) => node['@id'] === 'urn:action:matching-at-id'));
});

test('rejects keyed map entries whose body id conflicts with the key', async () => {
  const result = await compileAuthoringYaml(`ujgTarget: ed-2026-07-13
actions:
  urn:action:key:
    id: urn:action:other
    label: Conflicting id
`);

  assert.equal(result.ok, false);
  assert.equal(result.diagnostics[0].code, 'ID_CONFLICT');
});

test('projects compiled JSON-LD to literal canonical nodes that compile again', async () => {
  const source = await readFile(new URL('../fixtures/complex.yaml', import.meta.url), 'utf8');
  const compiled = await compileAuthoringYaml(source);
  const projected = await projectCanonicalJsonLd(compiled.document);
  const recompiled = await compileAuthoringYaml(projected.yaml);

  assert.equal(projected.ok, true);
  assert.equal(recompiled.ok, true);
  assert.equal(projected.authoring.ujgTarget, 'ed-2026-07-13');
  assert.equal(projected.authoring.journey, undefined);
  assert.ok(Array.isArray(projected.authoring.nodes));
  assert.deepEqual(recompiled.document.nodes, compiled.document.nodes);
});

test('projects canonical JSON-LD without authoring sugar', async () => {
  const projected = await projectCanonicalJsonLd({
    '@context': [
      'https://ujg.specs.openuji.org/ed/ns/core.context.jsonld',
      'https://ujg.specs.openuji.org/ed/ns/graph.context.jsonld',
      'https://ujg.specs.openuji.org/ed/ns/surface.context.jsonld',
      'https://ujg.specs.openuji.org/ed/ns/action.context.jsonld',
      'https://ujg.specs.openuji.org/ed/ns/l10n.context.jsonld',
    ],
    '@id': 'urn:document:test',
    '@type': 'UJGDocument',
    nodes: [
      { '@id': 'urn:action:submit', '@type': 'Action', label: 'Submit' },
      { '@id': 'urn:entry:start', '@type': 'JourneyEntry', stateRef: 'urn:state:start' },
      {
        '@id': 'urn:journey:test',
        '@type': 'Journey',
        entryRefs: ['urn:entry:start'],
        stateRefs: ['urn:state:start'],
        transitionRefs: ['urn:transition:submit'],
      },
      { '@id': 'urn:locator:submit', '@type': 'AccessibleLocator', role: 'button' },
      { '@id': 'urn:message:submit', '@type': 'MessageBundle', messageKey: 'submit' },
      { '@id': 'urn:state:orphan', '@type': 'State', label: 'Orphan state' },
      { '@id': 'urn:state:start', '@type': 'State' },
      { '@id': 'urn:surface:start', '@type': 'Surface', graphNodeRef: 'urn:state:start' },
      { '@id': 'urn:transition:submit', '@type': 'Transition', from: 'urn:state:start', to: 'urn:state:end' },
    ],
  });

  assert.equal(projected.ok, true);
  assert.equal(projected.authoring.actions, undefined);
  assert.equal(projected.authoring.journey, undefined);
  assert.equal(projected.authoring.nodes[0].id, 'urn:action:submit');
  assert.equal(projected.authoring.nodes[0].type, 'Action');
  assert.ok(projected.authoring.nodes.some((node) => node.id === 'urn:surface:start'));
  assert.ok(projected.yaml.includes('nodes:'));
  assert.equal(/^\s+surface:/m.test(projected.yaml), false);
  assert.equal(/^\s+transitions:/m.test(projected.yaml), false);
});

test('rejects canonical projection that would lose document-level data', async () => {
  const projected = await projectCanonicalJsonLd({
    '@context': ['https://ujg.specs.openuji.org/ed/ns/core.context.jsonld'],
    '@id': 'urn:document:test',
    '@type': 'UJGDocument',
    imports: ['urn:document:imported'],
    nodes: [],
  });

  assert.equal(projected.ok, false);
  assert.equal(projected.diagnostics[0].code, 'LOSSY_PROJECTION');
});

test('round-trip validation passes strict structural canonical equivalence', async () => {
  const source = await readFile(new URL('../fixtures/auth.yaml', import.meta.url), 'utf8');
  const compiled = await compileAuthoringYaml(source);
  const validation = await validateCanonicalJsonLd(compiled.document);

  assert.equal(validation.ok, true);
  assert.deepEqual(validation.diagnostics, []);
});

test('rejects YAML without ujgTarget', async () => {
  const result = await compileAuthoringYaml('touchpoints: {}\n');

  assert.equal(result.ok, false);
  assert.equal(result.diagnostics[0].code, 'CONTEXT_NOT_LOCKED');
});

test('accepts target vocabulary terms that are not in the projection property order', async () => {
  const result = await compileAuthoringYaml(`ujgTarget: ed-2026-07-13
states:
  app-state:
    label: App state
    stateDataRef: urn:external:state-data
`);

  assert.equal(result.ok, true);
  assert.ok(
    result.document['@context'].includes('https://ujg.specs.openuji.org/ed/ns/state-data.context.jsonld')
  );
  assert.equal(result.document.nodes[0].stateDataRef, 'urn:external:state-data');
});

test('rejects properties absent from the target vocabulary', async () => {
  const result = await compileAuthoringYaml(`ujgTarget: ed-2026-07-13
touchpoints:
  app:
    notInTheOntology: true
`);

  assert.equal(result.ok, false);
  assert.equal(result.diagnostics[0].code, 'UNKNOWN_AUTHORING_TERM');
});
