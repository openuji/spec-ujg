import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import jsonld from 'jsonld';
import Ajv from 'ajv/dist/2020.js';
import { Parser, Store, Writer } from 'n3';
import { parseAllDocuments, isMap, isSeq, isScalar, isAlias } from 'yaml';

export const ED = 'https://ujg.specs.openuji.org/ed/ns/';
export const CORE = `${ED}core#`;
export const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
export const ED_ROOT = join(ROOT, 'specs/ed');
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const array = (value) => (Array.isArray(value) ? value : [value]);
const absolute = (value) =>
  typeof value === 'string' && /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) && !value.startsWith('_:');

export class UjgError extends Error {
  constructor(stage, message, details = {}) {
    super(message);
    this.name = 'UjgError';
    this.diagnostic = { stage, message, ...details };
  }
}
function fail(stage, message, details) {
  throw new UjgError(stage, message, details);
}

export async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]
    )
  );
  return result.flat().sort();
}

export function parseYaml(text, source = '') {
  let documents;
  try {
    documents = parseAllDocuments(text, {
      version: '1.2',
      schema: 'core',
      uniqueKeys: true,
      merge: false,
      strict: true,
    });
  } catch (error) {
    fail('parse', error.message, { source });
  }
  if (documents.length !== 1)
    fail('parse', 'UJG requires exactly one YAML document per resource', { source });
  const document = documents[0];
  if (document.errors.length || document.warnings.length)
    fail('parse', [...document.errors, ...document.warnings].map((e) => e.message).join('; '), {
      source,
    });
  if (document.directives.yaml.version !== '1.2')
    fail('parse', 'YAML-LD requires YAML 1.2 scalar resolution', { source });
  const active = new Set();
  const checked = new Set();
  function visit(node) {
    if (!node) return;
    if (active.has(node)) fail('parse', 'Cyclic YAML aliases are not permitted', { source });
    if (checked.has(node)) return;
    active.add(node);
    if (isAlias(node)) visit(node.resolve(document));
    else if (isMap(node)) {
      for (const pair of node.items) {
        if (!isScalar(pair.key) || typeof pair.key.value !== 'string')
          fail('parse', 'YAML-LD mapping keys must be strings', { source });
        visit(pair.value);
      }
    } else if (isSeq(node)) node.items.forEach(visit);
    else if (isScalar(node)) {
      if (typeof node.value === 'number' && !Number.isFinite(node.value))
        fail('parse', 'YAML-LD numbers must be JSON-compatible', { source });
      if (
        node.tag &&
        ![
          'tag:yaml.org,2002:str',
          'tag:yaml.org,2002:int',
          'tag:yaml.org,2002:float',
          'tag:yaml.org,2002:bool',
          'tag:yaml.org,2002:null',
        ].includes(node.tag)
      )
        fail('parse', `Unsupported YAML-LD tag: ${node.tag}`, { source });
    }
    active.delete(node);
    checked.add(node);
  }
  visit(document.contents);
  try {
    return document.toJS({ maxAliasCount: 1000 });
  } catch (error) {
    fail('parse', error.message, { source });
  }
}

let catalogPromise;
export function loadCatalog() {
  return (catalogPromise ??= (async () => {
    const paths = await files(ED_ROOT);
    const modules = new Map();
    const contexts = new Map();
    const known = new Set();
    const properties = new Set();
    const classes = new Set();
    const namespaces = new Set();
    for (const path of paths.filter((p) => p.endsWith('/config.json'))) {
      const config = JSON.parse(await readFile(path, 'utf8'));
      const directory = dirname(path);
      const artifacts = paths.filter((p) => dirname(p) === directory);
      modules.set(config.id, {
        ...config,
        directory,
        ontology: artifacts.find((p) => p.endsWith('.ttl') && !p.endsWith('.shape.ttl')),
        schema: artifacts.find((p) => p.endsWith('.schema.json')),
        shape: artifacts.find((p) => p.endsWith('.shape.ttl')),
      });
    }
    for (const path of paths.filter((p) => p.endsWith('.context.jsonld'))) {
      contexts.set(`${ED}${path.split('/').at(-1)}`, JSON.parse(await readFile(path, 'utf8')));
    }
    contexts.set(`${ED}context.jsonld`, {
      '@context': ['core', 'graph', 'surface', 'runtime'].map((n) => `${ED}${n}.context.jsonld`),
    });
    const vocabulary = new Store();
    for (const module of modules.values())
      if (module.ontology)
        vocabulary.addQuads(
          new Parser({ blankNodePrefix: `${module.id.replaceAll('/', '-')}-` }).parse(
            await readFile(module.ontology, 'utf8')
          )
        );
    for (const module of modules.values()) {
      if (module.ontology)
        namespaces.add(`${ED}${module.ontology.split('/').at(-1).replace('.ttl', '')}#`);
    }
    for (const quad of vocabulary) {
      if (
        quad.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
        quad.subject.termType === 'NamedNode' &&
        quad.subject.value.startsWith(ED)
      ) {
        known.add(quad.subject.value);
        if (
          [
            'http://www.w3.org/2002/07/owl#ObjectProperty',
            'http://www.w3.org/2002/07/owl#DatatypeProperty',
          ].includes(quad.object.value)
        )
          properties.add(quad.subject.value);
        if (quad.object.value === 'http://www.w3.org/2002/07/owl#Class')
          classes.add(quad.subject.value);
      }
    }
    return { modules, contexts, vocabulary, known, properties, classes, namespaces };
  })());
}

export async function localDocumentLoader(url) {
  const catalog = await loadCatalog();
  if (!catalog.contexts.has(url))
    fail('context', `No local context registered for ${url}`, { source: url });
  return { document: catalog.contexts.get(url), documentUrl: url, contextUrl: null };
}

function expandKey(context, key) {
  const mapping = jsonld.getContextValue(context, key, '@id');
  if (mapping) return mapping;
  if (key.startsWith('@')) return key;
  if (key.includes(':')) {
    const [prefix, ...suffix] = key.split(':');
    const base = jsonld.getContextValue(context, prefix, '@id');
    return base ? base + suffix.join(':') : key;
  }
  const vocab = context['@vocab'];
  return vocab ? vocab + key : null;
}

async function prepare(input, source, loader, catalog) {
  const options = { base: source, documentLoader: loader };
  const initial = await jsonld.processContext(null, null, options);
  // Resolve the bundled, base-free public contexts locally. This preserves their mappings
  // while avoiding the processor library's ten-remote-context loading limit in a full module
  // composition. Deployment/private contexts continue through the standard document loader.
  async function bundledContext(value) {
    if (Array.isArray(value)) return (await Promise.all(value.map(bundledContext))).flat();
    if (typeof value === 'string' && catalog.contexts.has(value)) {
      const document = await loader(value);
      return bundledContext(document.document['@context']);
    }
    return value;
  }
  async function visit(value, parentContext) {
    if (Array.isArray(value)) return Promise.all(value.map((v) => visit(v, parentContext)));
    if (!object(value)) return value;
    let context = parentContext;
    const localContext = '@context' in value ? await bundledContext(value['@context']) : undefined;
    if (localContext !== undefined)
      context = await jsonld.processContext(context, localContext, options);
    const beforeTypes = context;
    const typeKey = Object.keys(value).find((k) => expandKey(context, k) === '@type');
    if (typeKey && value[typeKey] !== '@json') {
      for (const type of array(value[typeKey])
        .filter((t) => typeof t === 'string')
        .sort()) {
        const scoped = jsonld.getContextValue(context, type, '@context');
        if (scoped) context = await jsonld.processContext(context, scoped, options);
      }
    }
    const result = {};
    for (const [key, entry] of Object.entries(value)) {
      if (key === '@context') {
        result[key] = localContext;
        continue;
      }
      const iri = expandKey(context, key);
      if (!iri) fail('vocabulary', `Unmapped compact property: ${key}`, { source, term: key });
      if ([...catalog.namespaces].some((ns) => iri.startsWith(ns)) && !catalog.properties.has(iri))
        fail('vocabulary', `Undeclared UJG term: ${iri}`, { source, term: key, property: iri });
      if (iri === `${CORE}members`)
        fail('membership', 'members is derived-only and must not be authored', {
          source,
          property: iri,
        });
      const externalReference = [
        `${CORE}imports`,
        `${ED}design-system#source`,
        `${ED}data-contract#dataSchemaSource`,
      ].includes(iri);
      if (externalReference) {
        const stage = iri === `${CORE}imports` ? 'imports' : 'source';
        result[key] = array(entry).map((reference) => {
          let lexical;
          if (typeof reference === 'string') lexical = reference;
          else if (object(reference)) {
            const keys = Object.keys(reference);
            if (keys.length === 1 && expandKey(context, keys[0]) === '@id')
              lexical = reference[keys[0]];
          }
          if (typeof lexical !== 'string' || lexical.startsWith('_:'))
            fail(stage, `${key} must contain only IRI references`, { source, property: iri });
          if (iri === `${ED}data-contract#dataSchemaSource`) return { '@id': lexical };
          try {
            return { '@id': new URL(lexical, source).href };
          } catch {
            fail(stage, `Invalid resource reference: ${lexical}`, { source, property: iri });
          }
        });
        continue;
      }
      const coercion = jsonld.getContextValue(context, key, '@type');
      if (iri === `${CORE}extensions`) {
        if (!object(entry) || Object.values(entry).some((v) => !object(v)))
          fail('source', 'extensions and each namespaced entry must be objects', { source });
        for (const namespace of Object.keys(entry))
          if (!namespace.includes('.') && !namespace.includes(':'))
            fail('source', 'Extension keys must be namespaced', { source });
      }
      if (coercion === '@json' || iri === '@value') {
        result[key] = entry;
        continue;
      }
      if (iri === '@id' || iri === '@type' || iri === '@index') {
        result[key] = entry;
        continue;
      }
      let childContext = beforeTypes;
      const scoped = jsonld.getContextValue(context, key, '@context');
      if (scoped) childContext = await jsonld.processContext(childContext, scoped, options);
      result[key] = await visit(entry, childContext);
    }
    return result;
  }
  return visit(structuredClone(input), initial);
}

export async function interpretDocument(
  input,
  { source, format = 'jsonld', documentLoader = localDocumentLoader } = {}
) {
  if (!absolute(source)) fail('source', 'An absolute source location is required');
  if (!['jsonld', 'yamlld'].includes(format))
    fail('capability', `Unsupported serialization: ${format}`, { source });
  if (input instanceof Uint8Array) {
    try {
      input = new TextDecoder('utf-8', { fatal: true }).decode(input);
    } catch {
      fail('parse', 'Input must be valid UTF-8', { source });
    }
  }
  const catalog = await loadCatalog();
  let parsed = input;
  if (typeof input === 'string') {
    try {
      parsed = format === 'yamlld' ? parseYaml(input, source) : JSON.parse(input);
    } catch (error) {
      if (error instanceof UjgError) throw error;
      fail('parse', error.message, { source });
    }
  }
  const usedModules = new Set(['core']);
  const loader = async (url) => {
    const module = [...catalog.modules.values()].find(
      (m) =>
        m.ontology &&
        url === `${ED}${m.ontology.split('/').at(-1).replace('.ttl', '.context.jsonld')}`
    );
    if (module) usedModules.add(module.id);
    return documentLoader(url);
  };
  const normalized = await prepare(parsed, source, loader, catalog);
  let expanded;
  try {
    expanded = await jsonld.expand(normalized, {
      base: source,
      documentLoader: loader,
      safe: true,
    });
  } catch (error) {
    if (error instanceof UjgError) throw error;
    fail('context', error.message, { source });
  }
  const members = new Set();
  const roots = new Set();
  const imports = new Set();
  const descriptions = new Map();
  function discover(value) {
    if (Array.isArray(value)) {
      value.forEach(discover);
      return;
    }
    if (!object(value) || '@value' in value) return;
    const types = value['@type'] || [];
    const assertions =
      types.length ||
      Object.keys(value).some((k) => !k.startsWith('@') && array(value[k]).length) ||
      (value['@reverse'] && Object.keys(value['@reverse']).length);
    if (assertions) {
      if (!absolute(value['@id']))
        fail('identity', 'Addressable node definitions require explicit IRI identities', {
          source,
          node: value['@id'],
        });
      if (!descriptions.has(value['@id'])) descriptions.set(value['@id'], []);
      descriptions.get(value['@id']).push(value);
      if (types.includes(`${CORE}UJGDocument`)) {
        roots.add(value['@id']);
        for (const ref of value[`${CORE}imports`] || []) imports.add(ref['@id']);
        for (const node of value[`${CORE}nodes`] || [])
          if (!absolute(node['@id']))
            fail('source', 'nodes values must be IRI-identified node objects', { source });
      } else members.add(value['@id']);
      for (const type of types)
        if ([...catalog.namespaces].some((ns) => type.startsWith(ns)) && !catalog.classes.has(type))
          fail('vocabulary', `Undeclared UJG class: ${type}`, { source, node: value['@id'] });
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === '@reverse') Object.values(child).forEach(discover);
      else if (!['@id', '@type', '@index'].includes(key)) discover(child);
    }
  }
  discover(expanded);
  if (roots.size !== 1)
    fail('source', 'A resource must contain exactly one authored UJGDocument root', { source });
  const id = [...roots][0];
  members.delete(id);
  for (const [nodeId, definitions] of descriptions) {
    if (nodeId !== id && definitions.some((n) => `${CORE}nodes` in n || `${CORE}imports` in n)) {
      fail('source', 'nodes and imports belong to the UJGDocument root', { source, node: nodeId });
    }
  }
  const rdf = await jsonld.toRDF(expanded, { format: 'application/n-quads' });
  return {
    source,
    id,
    members: [...members].sort(),
    imports: [...imports],
    modules: [...usedModules],
    expanded,
    normalized,
    rdf,
    rootDefinitions: descriptions.get(id),
    scope: `urn:ujg:validation-source:${createHash('sha256').update(source).digest('hex')}`,
  };
}

export async function processClosure(input, options = {}) {
  if (!absolute(options.source)) fail('source', 'An absolute source location is required');
  const supported = options.formats || ['jsonld', 'yamlld'];
  const loaded = new Map();
  const sources = [];
  const modules = new Set(options.modules || []);
  const catalog = await loadCatalog();
  async function load(resource, requestedSource, format) {
    if (!supported.includes(format))
      fail('capability', `Unsupported serialization: ${format}`, { source: requestedSource });
    const source = new URL(requestedSource).href;
    if (loaded.has(source)) return;
    loaded.set(source, true);
    const interpreted = await interpretDocument(resource, {
      source,
      format,
      documentLoader: options.documentLoader,
    });
    sources.push(interpreted);
    interpreted.modules.forEach((m) => modules.add(m));
    for (const target of interpreted.imports) {
      if (loaded.has(target)) continue;
      let imported;
      try {
        if (options.loadResource) imported = await options.loadResource(target);
        else if (target.startsWith('file:')) {
          const location = new URL(target);
          const format = location.pathname.endsWith('.jsonld')
            ? 'jsonld'
            : location.pathname.endsWith('.yamlld')
              ? 'yamlld'
              : null;
          if (!format)
            fail('capability', `Cannot determine serialization of ${target}`, { source, target });
          imported = { input: await readFile(location), format };
        }
      } catch (error) {
        if (error instanceof UjgError) throw error;
        fail('imports', `Could not load ${target}: ${error.message}`, { source, target });
      }
      if (!imported)
        fail('imports', `No resource registered for import ${target}`, { source, target });
      const finalSource = imported.source || target;
      if (!loaded.has(finalSource)) await load(imported.input, finalSource, imported.format);
      loaded.set(target, true);
    }
  }
  await load(input, options.source, options.format || 'jsonld');
  function dependency(id) {
    const module = catalog.modules.get(id);
    if (!module) fail('modules', `Unknown module: ${id}`);
    for (const dep of module.deps || [])
      if (!modules.has(dep)) {
        modules.add(dep);
        dependency(dep);
      }
  }
  [...modules].forEach(dependency);
  for (const id of modules) {
    const module = catalog.modules.get(id);
    if (!module.schema || !module.custom?.extensionKey) continue;
    const ajv = new Ajv({ strict: false });
    const check = ajv.compile(JSON.parse(await readFile(module.schema, 'utf8')));
    for (const source of sources) {
      for (const literal of source.rootDefinitions.flatMap(
        (root) => root[`${CORE}extensions`] || []
      )) {
        const payload = literal['@value']?.[module.custom.extensionKey];
        if (payload !== undefined && !check(payload))
          fail('extension', ajv.errorsText(check.errors), {
            source: source.source,
            node: source.id,
            property: `${CORE}extensions`,
          });
      }
    }
  }
  // Preserve authored statements; normalize to a union data graph for SHACL, while source
  // memberships are passed separately. Existing UJG constraints are over this semantic graph.
  const store = new Store();
  for (const source of sources) {
    store.addQuads(
      new Parser({ format: 'N-Quads', blankNodePrefix: source.scope }).parse(source.rdf)
    );
  }
  const authoredGraphNames = new Set(
    [...store].filter((q) => q.graph.termType === 'NamedNode').map((q) => q.graph.value)
  );
  for (const source of sources) {
    while (authoredGraphNames.has(source.scope)) source.scope += ':members';
    authoredGraphNames.add(source.scope);
  }
  const writer = new Writer({ format: 'N-Triples' });
  for (const q of store) writer.addQuad(q.subject, q.predicate, q.object);
  const rdf = await new Promise((resolve, reject) =>
    writer.end((err, output) => (err ? reject(err) : resolve(output)))
  );
  return { sources, modules: [...modules], rdf };
}

export async function validateShapesBatch(closures) {
  const catalog = await loadCatalog();
  const requests = closures.map((closure) => ({
    rdf: closure.rdf,
    membersIri: `${CORE}members`,
    sources: closure.sources.map(({ id, members, scope }) => ({ id, members, scope })),
    ontologies: closure.modules.map((id) => catalog.modules.get(id).ontology).filter(Boolean),
    shapes: closure.modules.map((id) => catalog.modules.get(id).shape).filter(Boolean),
  }));
  const python =
    process.env.UJG_SHACL_PYTHON || fileURLToPath(new URL('./.venv/bin/python', import.meta.url));
  if (!existsSync(python))
    fail(
      'environment',
      'Run pnpm --filter @openuji/web conformance:setup, or set UJG_SHACL_PYTHON to a Python environment with the pinned SHACL dependencies'
    );
  const child = spawnSync(python, [fileURLToPath(new URL('./shacl.py', import.meta.url))], {
    input: JSON.stringify(requests),
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (child.error) fail('environment', child.error.message);
  let result;
  try {
    result = JSON.parse(child.stdout);
  } catch {
    fail('shacl', child.stderr || child.stdout || 'SHACL runner failed');
  }
  if (child.status !== 0 || result.error) fail('shacl', result.error || child.stderr);
  return result;
}

export async function validateDocument(input, options) {
  try {
    const closure = await processClosure(input, options);
    const [shapes] = await validateShapesBatch([closure]);
    return { ...shapes, closure };
  } catch (error) {
    if (!(error instanceof UjgError)) throw error;
    return {
      conforms: false,
      incomplete: ['imports', 'capability', 'context', 'environment'].includes(
        error.diagnostic.stage
      ),
      diagnostics: [error.diagnostic],
    };
  }
}
