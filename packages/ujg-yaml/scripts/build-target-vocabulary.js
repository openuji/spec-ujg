#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Parser } from 'n3';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = resolve(PACKAGE_ROOT, '../..');
const TARGETS_DIR = resolve(PACKAGE_ROOT, 'targets');

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const OWL_CLASS = 'http://www.w3.org/2002/07/owl#Class';
const OWL_OBJECT_PROPERTY = 'http://www.w3.org/2002/07/owl#ObjectProperty';
const OWL_DATATYPE_PROPERTY = 'http://www.w3.org/2002/07/owl#DatatypeProperty';
const SH_PATH = 'http://www.w3.org/ns/shacl#path';
const SH_MIN_COUNT = 'http://www.w3.org/ns/shacl#minCount';
const SH_MAX_COUNT = 'http://www.w3.org/ns/shacl#maxCount';
const SH_CLASS = 'http://www.w3.org/ns/shacl#class';
const SH_DATATYPE = 'http://www.w3.org/ns/shacl#datatype';
const SH_NODE_KIND = 'http://www.w3.org/ns/shacl#nodeKind';
const SH_NODE = 'http://www.w3.org/ns/shacl#node';

export async function buildVocabularyForTargetId(targetId, options = {}) {
  const targetPath = resolve(TARGETS_DIR, `${targetId}.json`);
  const target = JSON.parse(await readFile(targetPath, 'utf8'));
  return buildVocabularyForTarget(target, options);
}

export async function buildVocabularyForTarget(target, options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const contextTerms = {};
  const ontologyTerms = new Map();
  const moduleQuads = new Map();
  const sourceArtifactHashes = {};

  for (const moduleName of target.contextOrder ?? Object.keys(target.modules ?? {})) {
    const module = target.modules?.[moduleName];
    if (!module) continue;

    for (const artifact of Object.values(module.artifacts ?? {})) {
      sourceArtifactHashes[artifact.path] = artifact.hash;
    }

    const contextArtifact = module.artifacts?.context;
    if (contextArtifact) {
      const contextPath = resolve(repoRoot, contextArtifact.path);
      const contextDocument = JSON.parse(await readFile(contextPath, 'utf8'));
      const { terms } = parseJsonLdContext(contextDocument['@context'] ?? {}, moduleName);
      Object.assign(contextTerms, terms);
    }

    const ontologyArtifact = module.artifacts?.ontology;
    if (ontologyArtifact) {
      const ontologyPath = resolve(repoRoot, ontologyArtifact.path);
      const quads = parseTurtle(await readFile(ontologyPath, 'utf8'));
      moduleQuads.set(moduleName, quads);
      collectOntologyTerms(quads, moduleName, ontologyTerms);
    }
  }

  const iriToContextTerm = new Map();
  for (const [term, definition] of Object.entries(contextTerms)) {
    iriToContextTerm.set(definition.iri, term);
  }

  const classes = {};
  const properties = {};

  for (const term of [...ontologyTerms.values()].sort(compareOntologyTerms)) {
    const compactName = iriToContextTerm.get(term.iri) ?? localName(term.iri);
    if (term.kind === 'class') {
      classes[compactName] = {
        iri: term.iri,
        module: term.module,
      };
    } else {
      const contextTerm = contextTerms[compactName];
      properties[compactName] = {
        iri: term.iri,
        module: term.module,
        kind: term.kind,
        reference: contextTerm?.type === '@id',
        set: contextTerm?.container === '@set',
      };
      if (contextTerm?.type && contextTerm.type !== '@id') properties[compactName].type = contextTerm.type;
    }
  }

  for (const [term, definition] of Object.entries(contextTerms).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    if (classes[term] || properties[term]) continue;
    if (startsWithUppercase(term)) {
      classes[term] = {
        iri: definition.iri,
        module: definition.module,
        source: 'context',
      };
    } else {
      properties[term] = {
        iri: definition.iri,
        module: definition.module,
        kind: definition.type === '@id' ? 'object' : 'datatype',
        reference: definition.type === '@id',
        set: definition.container === '@set',
      };
      if (definition.type && definition.type !== '@id') properties[term].type = definition.type;
    }
  }

  const iriToModule = new Map();
  for (const value of Object.values(classes)) iriToModule.set(value.iri, value.module);
  for (const value of Object.values(properties)) iriToModule.set(value.iri, value.module);

  const moduleDependencies = {};
  for (const [moduleName, quads] of moduleQuads) {
    const dependencies = new Set();
    for (const quad of quads) {
      for (const term of [quad.subject, quad.object]) {
        if (term.termType !== 'NamedNode') continue;
        const dependency = iriToModule.get(term.value);
        if (dependency && dependency !== moduleName) dependencies.add(dependency);
      }
    }
    moduleDependencies[moduleName] = [...dependencies].sort();
  }

  const propertyShapes = await collectPropertyShapes(target, contextTerms, repoRoot);

  return stableObject({
    targetId: target.id,
    generatedFrom: {
      targetSource: target.source,
      artifactHashes: sourceArtifactHashes,
    },
    contextOrder: target.contextOrder,
    modules: Object.fromEntries(
      Object.entries(target.modules ?? {})
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([moduleName, module]) => [
          moduleName,
          {
            contextUrl: module.contextUrl,
            dependencies: moduleDependencies[moduleName] ?? [],
          },
        ])
    ),
    classes,
    properties,
    propertyShapes,
    setProperties: Object.entries(properties)
      .filter(([, property]) => property.set)
      .map(([term]) => term)
      .sort(),
    referenceProperties: Object.entries(properties)
      .filter(([, property]) => property.reference)
      .map(([term]) => term)
      .sort(),
  });
}

export function stringifyVocabulary(vocabulary) {
  return `${JSON.stringify(stableObject(vocabulary), null, 2)}\n`;
}

async function collectPropertyShapes(target, contextTerms, repoRoot) {
  const iriToTerm = new Map(Object.entries(contextTerms).map(([term, definition]) => [definition.iri, term]));
  const shapes = {};

  for (const [moduleName, module] of Object.entries(target.modules ?? {})) {
    const shapeArtifact = module.artifacts?.shape;
    if (!shapeArtifact) continue;
    const shapePath = resolve(repoRoot, shapeArtifact.path);
    const quads = parseTurtle(await readFile(shapePath, 'utf8'));
    const quadsBySubject = groupQuadsBySubject(quads);

    for (const quad of quads) {
      if (quad.predicate.value !== SH_PATH || quad.object.termType !== 'NamedNode') continue;
      const property = iriToTerm.get(quad.object.value) ?? localName(quad.object.value);
      const shapeQuads = quadsBySubject.get(quad.subject.id) ?? [];
      const constraint = compactShapeConstraint(shapeQuads, moduleName);
      shapes[property] ??= [];
      shapes[property].push(constraint);
    }
  }

  for (const constraints of Object.values(shapes)) {
    constraints.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  }

  return shapes;
}

function compactShapeConstraint(quads, moduleName) {
  const constraint = { module: moduleName };
  for (const quad of quads) {
    if (quad.predicate.value === SH_MIN_COUNT) constraint.minCount = Number(quad.object.value);
    if (quad.predicate.value === SH_MAX_COUNT) constraint.maxCount = Number(quad.object.value);
    if (quad.predicate.value === SH_CLASS && quad.object.termType === 'NamedNode') {
      constraint.classIri = quad.object.value;
    }
    if (quad.predicate.value === SH_DATATYPE && quad.object.termType === 'NamedNode') {
      constraint.datatype = quad.object.value;
    }
    if (quad.predicate.value === SH_NODE_KIND && quad.object.termType === 'NamedNode') {
      constraint.nodeKind = localName(quad.object.value);
    }
    if (quad.predicate.value === SH_NODE && quad.object.termType === 'NamedNode') {
      constraint.nodeShape = quad.object.value;
    }
  }
  return stableObject(constraint);
}

function parseJsonLdContext(context, moduleName) {
  const prefixes = {};
  const terms = {};

  for (const [term, definition] of Object.entries(context)) {
    if (term.startsWith('@')) continue;
    if (typeof definition === 'string' && isPrefixIri(definition)) {
      prefixes[term] = definition;
    }
  }

  const vocab = typeof context['@vocab'] === 'string' ? context['@vocab'] : undefined;

  for (const [term, definition] of Object.entries(context)) {
    if (term.startsWith('@') || prefixes[term]) continue;

    if (typeof definition === 'string') {
      terms[term] = {
        iri: expandIri(definition, prefixes, vocab),
        module: moduleName,
      };
      continue;
    }

    if (isPlainObject(definition) && typeof definition['@id'] === 'string') {
      terms[term] = {
        iri: expandIri(definition['@id'], prefixes, vocab),
        module: moduleName,
      };
      if (definition['@type']) {
        terms[term].type =
          definition['@type'] === '@id' || definition['@type'] === '@json'
            ? definition['@type']
            : expandIri(definition['@type'], prefixes, vocab);
      }
      if (definition['@container']) terms[term].container = definition['@container'];
    }
  }

  return { prefixes, terms };
}

function collectOntologyTerms(quads, moduleName, terms) {
  for (const quad of quads) {
    if (quad.predicate.value !== RDF_TYPE || quad.subject.termType !== 'NamedNode') continue;
    if (quad.object.value === OWL_CLASS) {
      terms.set(quad.subject.value, { iri: quad.subject.value, module: moduleName, kind: 'class' });
    }
    if (quad.object.value === OWL_OBJECT_PROPERTY) {
      terms.set(quad.subject.value, { iri: quad.subject.value, module: moduleName, kind: 'object' });
    }
    if (quad.object.value === OWL_DATATYPE_PROPERTY) {
      terms.set(quad.subject.value, { iri: quad.subject.value, module: moduleName, kind: 'datatype' });
    }
  }
}

function parseTurtle(input) {
  return new Parser().parse(input);
}

function groupQuadsBySubject(quads) {
  const grouped = new Map();
  for (const quad of quads) {
    const key = quad.subject.id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(quad);
  }
  return grouped;
}

function expandIri(value, prefixes, vocab) {
  if (value.startsWith('@')) return value;
  const compactMatch = /^([A-Za-z][\w-]*):(.*)$/.exec(value);
  if (compactMatch && prefixes[compactMatch[1]]) {
    return `${prefixes[compactMatch[1]]}${compactMatch[2]}`;
  }
  if (/^[A-Za-z][A-Za-z\d+.-]*:/.test(value)) return value;
  if (vocab) return `${vocab}${value}`;
  return value;
}

function localName(iri) {
  const hashIndex = iri.lastIndexOf('#');
  if (hashIndex >= 0) return iri.slice(hashIndex + 1);
  const slashIndex = iri.lastIndexOf('/');
  return slashIndex >= 0 ? iri.slice(slashIndex + 1) : iri;
}

function compareOntologyTerms(left, right) {
  return left.iri.localeCompare(right.iri);
}

function startsWithUppercase(value) {
  return /^[A-Z]/.test(value);
}

function isPrefixIri(value) {
  return /^https?:\/\/.+[#/]$/.test(value) || /^[A-Za-z][\w+.-]*:\/\/.+[#/]$/.test(value);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map((item) => stableObject(item));
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stableObject(child)])
  );
}

async function runCli() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const targetIds = args.filter((arg) => arg !== '--check');
  const selectedTargets = targetIds.length > 0 ? targetIds : ['ed-2026-07-13'];

  for (const targetId of selectedTargets) {
    const outputPath = resolve(TARGETS_DIR, `${targetId}.vocab.json`);
    const vocabulary = await buildVocabularyForTargetId(targetId);
    const nextContent = stringifyVocabulary(vocabulary);

    if (check) {
      const currentContent = await readFile(outputPath, 'utf8');
      if (currentContent !== nextContent) {
        const currentHash = createHash('sha256').update(currentContent).digest('hex');
        const nextHash = createHash('sha256').update(nextContent).digest('hex');
        throw new Error(
          `${outputPath} is stale: current sha256:${currentHash}, generated sha256:${nextHash}`
        );
      }
      continue;
    }

    await writeFile(outputPath, nextContent);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
