import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Parser, Store } from 'n3';
import { stringify } from 'yaml';
import {
  CORE,
  ED,
  interpretDocument,
  parseYaml,
  processClosure,
  validateDocument,
  validateShapesBatch,
  loadCatalog,
} from '../processor.js';

const source = 'https://example.com/package/main.yamlld';
const coreContext = ED + 'core.context.jsonld';
const graphContext = [coreContext, ED + 'graph.context.jsonld'];
const doc = (nodes = [], rest = {}) => ({
  '@context': coreContext,
  id: 'urn:document',
  type: 'UJGDocument',
  nodes,
  ...rest,
});
const node = (id) => ({ id, type: 'Node' });
const tripleSet = (rdf) =>
  new Set(
    new Parser({ format: 'N-Quads' })
      .parse(rdf)
      .map((q) => `${q.subject.value} ${q.predicate.value} ${q.object.value}`)
  );

const nested = () =>
  doc(
    [
      {
        id: 'urn:journey',
        type: 'Journey',
        label: 'Checkout',
        entries: [{ id: 'urn:entry', type: 'JourneyEntry', state: 'urn:cart' }],
        defaultEntry: 'urn:entry',
        states: [
          { id: 'urn:cart', type: 'State', label: 'Cart' },
          { id: 'urn:pay', type: 'State', label: 'Payment' },
        ],
        transitions: [{ id: 'urn:continue', type: 'Transition', from: 'urn:cart', to: 'urn:pay' }],
      },
    ],
    { '@context': graphContext }
  );

test('nested RDF and source membership match an independently specified graph', async () => {
  const result = await interpretDocument(nested(), { source });
  const expected = await readFile(new URL('./checkout.expected.nt', import.meta.url), 'utf8');
  assert.deepEqual(tripleSet(result.rdf), tripleSet(expected));
  assert.deepEqual(result.members, [
    'urn:cart',
    'urn:continue',
    'urn:entry',
    'urn:journey',
    'urn:pay',
  ]);
  assert.equal(
    new Store(new Parser().parse(result.rdf)).countQuads(null, `${CORE}members`, null),
    0
  );
});

test('flat and nested forms have the same domain data and effective membership in both formats', async () => {
  const n = nested();
  const journey = n.nodes[0];
  const flat = structuredClone(n);
  flat.nodes = [
    {
      ...journey,
      entries: ['urn:entry'],
      states: ['urn:cart', 'urn:pay'],
      transitions: ['urn:continue'],
    },
    ...journey.entries,
    ...journey.states,
    ...journey.transitions,
  ];
  const results = await Promise.all(
    [n, flat].flatMap((input) => [
      interpretDocument(JSON.stringify(input), { source }),
      interpretDocument(stringify(input), { source, format: 'yamlld' }),
    ])
  );
  const domain = (result) =>
    new Set([...tripleSet(result.rdf)].filter((t) => !t.includes(` ${CORE}nodes `)));
  for (const result of results) {
    assert.deepEqual(domain(result), domain(results[0]));
    assert.deepEqual(result.members, results[0].members);
  }
  assert.notDeepEqual(tripleSet(results[0].rdf), tripleSet(results[2].rdf));
  const outcomes = await validateShapesBatch(
    await Promise.all([n, flat].map((input) => processClosure(input, { source })))
  );
  assert.ok(
    outcomes.every((r) => r.conforms),
    outcomes.map((r) => r.report).join('\n')
  );
});

test('reference-only roots, index metadata, and opaque JSON never create membership', async () => {
  const input = doc([
    { id: 'urn:external' },
    { id: 'urn:indexed', '@index': 'tag' },
    { ...node('urn:local'), extensions: { 'com.example': { id: 'urn:hidden', type: 'State' } } },
  ]);
  assert.deepEqual((await interpretDocument(input, { source })).members, ['urn:local']);
});

test('graph and included wrappers are traversed; definitions under reverse properties retain their provenance', async () => {
  const input = {
    '@context': [coreContext, { link: { '@id': 'https://example.com/link', '@type': '@id' } }],
    '@graph': [
      doc([], { '@context': undefined }),
      {
        ...node('urn:a'),
        '@included': [node('urn:included')],
        '@reverse': { link: { id: 'urn:referenced' } },
      },
    ],
  };
  delete input['@graph'][0]['@context'];
  const result = await interpretDocument(input, { source });
  assert.deepEqual(result.members, ['urn:a', 'urn:included']);
  assert.ok(result.rdf.includes('<urn:referenced> <https://example.com/link> <urn:a>'));
});

test('empty assertions and reference-only nodes with context do not define nodes', async () => {
  const input = doc([{ id: 'urn:empty', extensions: null }]);
  // Core requires extension objects, including when a JSON-LD processor would discard null.
  await assert.rejects(interpretDocument(input, { source }), /extensions/);
  const empty = doc([{ id: 'urn:empty', '@type': [], '@context': {} }]);
  assert.deepEqual((await interpretDocument(empty, { source })).members, []);
});

test('source imports are normalized independently from semantic @base', async () => {
  const input = doc([node('#local')], {
    '@context': [coreContext, { '@base': 'https://identity.example/flow/' }],
    id: '',
    imports: ['./shared.jsonld', { id: '../common.yamlld' }],
  });
  const result = await interpretDocument(input, { source });
  assert.equal(result.id, 'https://identity.example/flow/');
  assert.deepEqual(result.members, ['https://identity.example/flow/#local']);
  assert.deepEqual(result.imports.sort(), [
    'https://example.com/common.yamlld',
    'https://example.com/package/shared.jsonld',
  ]);
  assert.ok(result.rdf.includes('<https://example.com/package/shared.jsonld>'));
});

test('external artifacts remain references with each module’s declared resolution base', async () => {
  const input = doc(
    [
      { id: 'urn:tokens', type: 'TokenSource', source: { id: './tokens.json' } },
      { id: 'urn:schema', type: 'DataSchema', dataSchemaSource: './schema.json' },
    ],
    {
      '@context': [
        coreContext,
        ED + 'design-system.context.jsonld',
        ED + 'data-contract.context.jsonld',
        { '@base': 'https://identity.example/' },
      ],
    }
  );
  const result = await interpretDocument(input, { source });
  assert.ok(result.rdf.includes('<https://example.com/package/tokens.json>'));
  assert.ok(result.rdf.includes('<https://identity.example/schema.json>'));
  assert.deepEqual(result.members, ['urn:schema', 'urn:tokens']);
  for (const [index, property] of [
    [0, 'source'],
    [1, 'dataSchemaSource'],
  ]) {
    const invalid = structuredClone(input);
    invalid.nodes[index][property] = { id: 'urn:external', type: 'Node' };
    await assert.rejects(interpretDocument(invalid, { source }), /only IRI references/);
  }
  const expandedImport = doc([], { [CORE + 'imports']: [{ '@id': './shared.jsonld' }] });
  assert.deepEqual((await interpretDocument(expandedImport, { source })).imports, [
    'https://example.com/package/shared.jsonld',
  ]);
});

test('file imports preserve byte validation and determine format from the URL path', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'ujg-import-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const location = pathToFileURL(join(directory, 'root.yamlld')).href;
  await writeFile(join(directory, 'shared.jsonld'), JSON.stringify(doc([node('urn:local')])));
  const result = await processClosure(doc([], { imports: ['./shared.jsonld?version=1'] }), {
    source: location,
  });
  assert.deepEqual(result.sources[1].members, ['urn:local']);
  await writeFile(join(directory, 'bad.yamlld'), new Uint8Array([0xff]));
  await assert.rejects(
    processClosure(doc([], { imports: ['./bad.yamlld'] }), { source: location }),
    /UTF-8/
  );
  await assert.rejects(
    processClosure(doc([], { imports: ['./unknown.txt'] }), { source: location }),
    /Cannot determine serialization/
  );
});

test('mixed recursive imports terminate cycles and keep references out of local membership', async () => {
  const importedSource = 'https://example.com/package/shared.jsonld';
  let calls = 0;
  const root = doc([{ id: 'urn:imported' }], { imports: ['./shared.jsonld'] });
  const imported = doc([node('urn:imported')], { id: 'urn:shared', imports: ['./main.yamlld'] });
  const result = await processClosure(stringify(root), {
    source,
    format: 'yamlld',
    loadResource: async (url) => {
      calls++;
      assert.equal(url, importedSource);
      return { input: JSON.stringify(imported), format: 'jsonld' };
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.sources.length, 2);
  assert.deepEqual(result.sources[0].members, []);
  assert.deepEqual(result.sources[1].members, ['urn:imported']);
});

test('missing imports and unsupported imported formats produce incomplete results', async () => {
  const root = doc([], { imports: ['shared.yamlld'] });
  const missing = await validateDocument(root, { source });
  assert.equal(missing.incomplete, true);
  assert.equal(missing.diagnostics[0].stage, 'imports');
  const unsupported = await validateDocument(root, {
    source,
    formats: ['jsonld'],
    loadResource: async () => ({ input: stringify(doc()), format: 'yamlld' }),
  });
  assert.equal(unsupported.incomplete, true);
  assert.equal(unsupported.diagnostics[0].stage, 'capability');
});

test('authored inventory errors survive processing and cannot be repaired by membership derivation', async () => {
  for (const input of [
    doc(['urn:literal']),
    doc([{ type: 'Node' }]),
    doc([{ id: '_:blank', type: 'Node' }]),
    doc([], { members: ['urn:forged'] }),
  ]) {
    const result = await validateDocument(input, { source });
    assert.equal(result.conforms, false);
    assert.notEqual(result.diagnostics[0].stage, 'shacl');
  }
});

test('exactly one authored document root is required before ontology/import composition', async () => {
  await assert.rejects(
    interpretDocument({ '@context': coreContext, ...node('urn:only-node') }, { source }),
    /exactly one/
  );
  await assert.rejects(
    interpretDocument([doc(), doc([], { id: 'urn:second' })], { source }),
    /exactly one/
  );
});

test('retired compact names and RDF property IRIs have no current vocabulary interpretation', async () => {
  await assert.rejects(
    interpretDocument(doc([{ id: 'urn:s', type: 'Node', stateRef: 'urn:target' }]), { source }),
    /Unmapped compact property/
  );
  await assert.rejects(
    interpretDocument(
      doc([{ id: 'urn:s', type: 'Node', [ED + 'graph#stateRef']: { id: 'urn:target' } }]),
      { source }
    ),
    /Undeclared UJG term/
  );
});

test('YAML aliases resolve by value without introducing identity or order', async () => {
  const yaml = `"@context": ${coreContext}\nid: urn:document\ntype: UJGDocument\nnodes:\n  - id: &same urn:shared\n    type: Node\n  - id: *same\n`;
  const result = await interpretDocument(yaml, { source, format: 'yamlld' });
  assert.deepEqual(result.members, ['urn:shared']);
  assert.equal(parseYaml('date: 2026-11-27\nflag: yes\n').date, '2026-11-27');
  assert.equal(parseYaml('flag: yes\n').flag, 'yes');
});

test('invalid YAML streams, cycles, keys, tags, scalars, and duplicate keys are rejected', () => {
  for (const invalid of [
    '',
    'a: 1\n---\nb: 2',
    'a: &a { b: *a }',
    'true: value',
    'a: .nan',
    'a: !!timestamp 2026-11-27',
    'a: 1\na: 2',
  ])
    assert.throws(() => parseYaml(invalid), undefined, invalid);
});

test('StateCollection membership is checked in one source scope, even with repeated document IDs', async () => {
  const state = { id: 'urn:member', type: 'State', label: 'Rows' };
  const move = { id: 'urn:move', type: 'Transition', from: 'urn:member', to: 'urn:member' };
  const collection = {
    id: 'urn:collection',
    type: 'StateCollection',
    memberState: 'urn:member',
    memberTransitions: ['urn:move'],
  };
  const journey = {
    id: 'urn:journey',
    type: 'Journey',
    states: ['urn:member'],
    entries: [{ id: 'urn:entry', type: 'JourneyEntry', state: 'urn:member' }],
  };
  const local = doc([state, move, collection, journey], { '@context': graphContext });
  const split = doc([move, collection], { '@context': graphContext, imports: ['shared.jsonld'] });
  const other = doc([state, journey], { '@context': graphContext }); // same semantic document id, separate source
  const closures = [
    await processClosure(local, { source }),
    await processClosure(split, {
      source,
      loadResource: async () => ({ input: other, format: 'jsonld' }),
    }),
  ];
  const [yes, no] = await validateShapesBatch(closures);
  assert.equal(yes.conforms, true, yes.report);
  assert.equal(no.conforms, false);
  assert.match(no.report, /effective membership/);
});

test('compatible partial definitions merge, while module cardinality conflicts fail SHACL', async () => {
  const input = nested();
  input.nodes.push({ id: 'urn:cart', label: 'A different label' });
  const result = await validateDocument(input, { source });
  assert.equal(result.conforms, false);
  assert.equal(result.diagnostics[0].stage, 'shacl');
});

test('all active modules compose under the same semantic mapping', async () => {
  const catalog = await loadCatalog();
  const contexts = [...catalog.contexts.keys()].filter((url) => !url.endsWith('/context.jsonld'));
  const result = await interpretDocument(doc([node('urn:local')], { '@context': contexts }), {
    source,
  });
  assert.deepEqual(result.members, ['urn:local']);
});

test('invalid embedded node types remain module validation failures', async () => {
  const input = nested();
  input.nodes[0].states[0].type = 'Command';
  const result = await validateDocument(input, { source });
  assert.equal(result.conforms, false);
  assert.equal(result.diagnostics[0].stage, 'shacl');
});

test('redirect aliases share one retrieved source without changing its semantic base', async () => {
  const root = doc([], { imports: ['alias.jsonld', 'final.jsonld'] });
  let calls = 0;
  const result = await processClosure(root, {
    source,
    loadResource: async (url) => {
      calls++;
      assert.equal(url, 'https://example.com/package/alias.jsonld');
      return {
        source: 'https://example.com/package/final.jsonld',
        format: 'jsonld',
        input: doc([node('#local')], {
          '@context': [coreContext, { '@base': 'https://semantic.example/' }],
          id: 'urn:redirected',
        }),
      };
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.sources.length, 2);
  assert.equal(result.sources[1].source, 'https://example.com/package/final.jsonld');
  assert.deepEqual(result.sources[1].members, ['https://semantic.example/#local']);
});

test('invalid UTF-8 and document-only properties on modeled nodes are source failures', async () => {
  await assert.rejects(
    interpretDocument(new Uint8Array([0xff]), { source, format: 'yamlld' }),
    /UTF-8/
  );
  await assert.rejects(
    interpretDocument(doc([{ ...node('urn:bad'), imports: ['#other'] }]), { source }),
    /UJGDocument root/
  );
});

test('declared Domain Model extensions are schema-checked even under graph wrappers', async () => {
  const payload = {
    '@context': coreContext,
    '@graph': [
      doc([], {
        '@context': undefined,
        extensions: { 'org.openuji.domain-model': { id: 'urn:incomplete' } },
      }),
    ],
  };
  delete payload['@graph'][0]['@context'];
  const result = await validateDocument(payload, { source, modules: ['extensions/domain-model'] });
  assert.equal(result.conforms, false);
  assert.equal(result.diagnostics[0].stage, 'extension');
});

test('Metrics supports integer counts, decimal rates, and boolean observations without conflating types', async () => {
  const make = (metricKey, metricValue, metricUnit) =>
    doc(
      [
        {
          id: 'urn:metric',
          type: 'MetricObservation',
          metricSubject: 'urn:subject',
          metricKey,
          metricValue,
          metricUnit,
        },
      ],
      { '@context': [coreContext, ED + 'metrics.context.jsonld'] }
    );
  const closures = await Promise.all(
    [
      make('movementCount', 4, 'count'),
      make('unexplainedMovementRate', 0.25, 'ratio'),
      make('com.example:isRoot', true, 'boolean'),
      make('movementCount', 0.5, 'count'),
      make('unexplainedMovementRate', 2, 'ratio'),
    ].map((input) => processClosure(input, { source }))
  );
  assert.deepEqual(
    (await validateShapesBatch(closures)).map((r) => r.conforms),
    [true, true, true, false, false]
  );
});
