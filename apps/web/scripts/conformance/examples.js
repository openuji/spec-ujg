import { readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import jsonld from 'jsonld';
import Ajv from 'ajv/dist/2020.js';
import {
  ED,
  ED_ROOT,
  files,
  interpretDocument,
  loadCatalog,
  parseYaml,
  processClosure,
  validateShapesBatch,
} from './processor.js';

export async function loadExample(reference, documentPath) {
  const documentFile = resolve(documentPath);
  const marker = `${sep}specs${sep}ed${sep}`;
  const index = documentFile.lastIndexOf(marker);
  const documentRoot = index < 0 ? null : documentFile.slice(0, index + marker.length);
  const path = resolve(dirname(documentFile), reference.trim());
  // Derive the boundary from the source document, since Astro bundles this helper and changes
  // its import.meta.url. Source positions still point at the original specification files.
  if (!documentRoot || !path.startsWith(documentRoot) || !path.endsWith('.yamlld'))
    throw new Error(`Invalid ED example reference: ${reference}`);
  const yaml = new TextDecoder('utf-8', { fatal: true }).decode(await readFile(path));
  const metadata = JSON.parse(await readFile(path.replace('.yamlld', '.example.json'), 'utf8'));
  const data = parseYaml(yaml, path);
  return { path, yaml, json: JSON.stringify(data, null, 2), data, metadata };
}

export async function exampleInput(example) {
  const { data, metadata } = example;
  if (metadata.kind === 'payload') return null;
  if (metadata.kind === 'document') return data;
  const catalog = await loadCatalog();
  const contexts = metadata.modules
    .map((id) => catalog.modules.get(id)?.ontology)
    .filter(Boolean)
    .map((path) => `${ED}${path.split('/').at(-1).replace('.ttl', '.context.jsonld')}`);
  if (metadata.kind === 'context')
    return {
      ...(Array.isArray(data) ? { '@context': data } : data),
      id: metadata.source,
      type: 'UJGDocument',
    };
  return {
    '@context': contexts,
    id: metadata.source,
    type: 'UJGDocument',
    nodes: Array.isArray(data) ? data : [data],
  };
}

export async function checkExamples() {
  const paths = await files(ED_ROOT);
  const referenced = new Set();
  for (const path of paths.filter((p) => p.endsWith('/index.md'))) {
    for (const match of (await readFile(path, 'utf8')).matchAll(
      /^```ujg-example\s*\n([^\n]+)\n```/gm
    )) {
      const example = await loadExample(match[1], path);
      referenced.add(example.path);
    }
  }
  const full = [];
  const failures = [];
  const counts = {};
  for (const path of paths.filter((p) => p.endsWith('.yamlld') && p.includes('/examples/'))) {
    const name = relative(ED_ROOT, path);
    if (!referenced.has(path))
      failures.push(`${name}: fixture is not referenced by its specification page`);
    const example = await loadExample(
      './' + path.split('/').at(-1),
      join(dirname(path), 'index.md')
    );
    counts[example.metadata.kind] = (counts[example.metadata.kind] || 0) + 1;
    try {
      if (example.metadata.kind === 'payload') {
        if (example.metadata.schemaDocument) {
          const ajv = new Ajv({ strict: false });
          if (!ajv.validateSchema(example.data)) throw new Error(ajv.errorsText());
        }
        if (example.metadata.schema) {
          const schema = JSON.parse(
            await readFile(resolve(dirname(path), example.metadata.schema), 'utf8')
          );
          const ajv = new Ajv({ strict: false });
          if (!ajv.validate(schema, example.data)) throw new Error(ajv.errorsText());
        }
        continue;
      }
      const input = await exampleInput(example);
      const interpreted = await interpretDocument(input, { source: example.metadata.source });
      const fromJson = await interpretDocument(JSON.stringify(input), {
        source: example.metadata.source,
      });
      if (
        (await jsonld.canonize(interpreted.expanded)) !== (await jsonld.canonize(fromJson.expanded))
      )
        throw new Error('Paired formats have different RDF');
      if (example.metadata.validation === 'full') {
        full.push({
          name,
          closure: await processClosure(input, {
            source: example.metadata.source,
            modules: example.metadata.modules,
          }),
        });
      }
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
    }
  }
  if (full.length) {
    const results = await validateShapesBatch(full.map((f) => f.closure));
    results.forEach((r, i) => {
      if (!r.conforms)
        failures.push(
          `${full[i].name}: ${r.diagnostics.map((d) => `${d.node} ${d.message}`).join('; ')}`
        );
    });
  }
  if (failures.length) throw new Error(failures.join('\n'));
  return { counts, full: full.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify(await checkExamples()));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
