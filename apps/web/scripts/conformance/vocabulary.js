import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Parser, Store } from 'n3';
import jsonld from 'jsonld';
import { ED, ED_ROOT, loadCatalog, localDocumentLoader, files } from './processor.js';

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const OWL = 'http://www.w3.org/2002/07/owl#';
export const TERMS_PATH = join(ED_ROOT, 'authoring/terms.json');

export async function authoringTerms() {
  const catalog = await loadCatalog();
  const terms = [];
  const global = new Map();
  for (const [url, document] of catalog.contexts) {
    if (Array.isArray(document['@context'])) continue;
    const context = document['@context'];
    const active = await jsonld.processContext(
      await jsonld.processContext(null, null, { base: url }),
      context,
      { base: url, documentLoader: localDocumentLoader }
    );
    for (const [key, value] of Object.entries(context)) {
      if (global.has(key) && JSON.stringify(global.get(key)) !== JSON.stringify(value))
        throw new Error(`Composed context collision: ${key}`);
      global.set(key, value);
    }
    for (const module of catalog.modules.values()) {
      if (
        !module.ontology ||
        `${ED}${module.ontology.split('/').at(-1).replace('.ttl', '.context.jsonld')}` !== url
      )
        continue;
      const graph = new Store(new Parser().parse(await readFile(module.ontology, 'utf8')));
      const properties = [...graph.getQuads(null, RDF_TYPE, null, null)]
        .filter((q) => [OWL + 'ObjectProperty', OWL + 'DatatypeProperty'].includes(q.object.value))
        .map((q) => q.subject.value)
        .sort();
      for (const iri of properties) {
        const local = iri.split('#')[1];
        if (
          !local ||
          /Refs?$/.test(local) ||
          ['documentNodes', 'documentImports', 'executionId', 'previousId'].includes(local)
        )
          throw new Error(`Retired property in active ontology: ${iri}`);
        const term = jsonld.getContextValue(active, local);
        if (!term || term['@id'] !== iri)
          throw new Error(`Missing canonical context term ${local} for ${iri}`);
        terms.push({
          module: module.id,
          term: local,
          iri,
          ...(term['@type'] ? { coercion: term['@type'] } : {}),
          ...(term['@container'] ? { container: term['@container'] } : {}),
          ...(local === 'members' ? { derived: true } : {}),
        });
      }
      // A context cannot declare a property alias that is absent from its ontology.
      for (const key of Object.keys(context)) {
        const iri = jsonld.getContextValue(active, key, '@id');
        if (!iri?.includes('#') || iri.endsWith('#') || key.startsWith('@')) continue;
        if (properties.includes(iri) && key !== iri.split('#')[1])
          throw new Error(`Noncanonical property alias: ${key}`);
      }
    }
  }
  return terms.sort((a, b) => a.module.localeCompare(b.module) || a.term.localeCompare(b.term));
}

export async function checkVocabulary() {
  const catalog = await loadCatalog();
  const terms = await authoringTerms();
  const expected = JSON.stringify({ version: 1, target: 'ed', terms }, null, 2) + '\n';
  const actual = await readFile(TERMS_PATH, 'utf8');
  if (actual !== expected)
    throw new Error(
      'Authoring term catalog is stale; run pnpm --filter @openuji/web vocabulary:update'
    );
  const allowed = new Set(terms.map((t) => t.iri));
  for (const path of (await files(ED_ROOT)).filter((p) => p.endsWith('.shape.ttl'))) {
    const graph = new Parser().parse(await readFile(path, 'utf8'));
    for (const q of graph) {
      if (
        q.predicate.value === 'http://www.w3.org/ns/shacl#path' &&
        q.object.termType === 'NamedNode' &&
        q.object.value.startsWith(ED) &&
        !allowed.has(q.object.value)
      )
        throw new Error(`Shape uses undeclared property: ${q.object.value}`);
      if (q.predicate.value === 'http://www.w3.org/ns/shacl#select') {
        // Parse SPARQL with the real runner in conformance tests; also reject retired names here.
        if (
          /\b\w+:(?:\w+Refs?|documentNodes|documentImports|executionId|previousId)\b/.test(
            q.object.value
          )
        )
          throw new Error(`Retired property in SPARQL: ${path}`);
      }
    }
  }
  // Processing a composed context also verifies the context graph as JSON-LD, not only key equality.
  await jsonld.expand(
    {
      '@context': [...catalog.contexts.values()]
        .map((d) => d['@context'])
        .filter((c) => !Array.isArray(c)),
      id: 'urn:ujg:context-check',
      type: 'Node',
    },
    { documentLoader: localDocumentLoader }
  );
  return terms;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === 'update')
      await writeFile(
        TERMS_PATH,
        JSON.stringify({ version: 1, target: 'ed', terms: await authoringTerms() }, null, 2) + '\n'
      );
    else
      console.log(
        `${(await checkVocabulary()).length} canonical property mappings and composed contexts valid`
      );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
