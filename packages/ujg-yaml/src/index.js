import YAML from 'yaml';
import {
  ACCESSIBLE_REGISTRY,
  ALLOWED_TOP_LEVEL_KEYS,
  EXTENSION_RULES,
  PROPERTY_ORDER,
  SECTION_REGISTRY,
  STRUCTURAL_KEYS,
} from './registry.js';
import { diagnosticError, listTargets, loadTarget } from './targets.js';

export { listTargets, loadTarget };

const DOCUMENT_ID = 'urn:ujg:document';

export async function compileAuthoringYaml(input, options = {}) {
  const { value, diagnostics } = parseYaml(input, options);
  if (diagnostics.length > 0) return { ok: false, diagnostics };

  const targetId = value?.ujgTarget;
  if (typeof targetId !== 'string' || targetId.length === 0) {
    return failure('CONTEXT_NOT_LOCKED', 'YAML document must declare ujgTarget.');
  }

  let target;
  try {
    target = await loadTarget(targetId, options);
  } catch (error) {
    return { ok: false, diagnostics: error.diagnostics ?? [toDiagnostic(error)] };
  }

  const compiler = new Compiler(target, options);
  try {
    const document = compiler.compile(value);
    return {
      ok: true,
      document,
      diagnostics: compiler.diagnostics,
      provenance: {
        authoringFormat: 'ujg-yaml/1',
        ujgTarget: target.id,
        targetSource: target.source,
        usedModules: compiler.usedModules(),
      },
    };
  } catch (error) {
    return { ok: false, diagnostics: error.diagnostics ?? [toDiagnostic(error)] };
  }
}

export async function projectCanonicalJsonLd(input, options = {}) {
  let document;
  try {
    document = typeof input === 'string' ? JSON.parse(input) : input;
  } catch (error) {
    return failure('INVALID_JSON', `Canonical JSON-LD is not valid JSON: ${error.message}`);
  }

  const targetId = options.targetId ?? inferTargetFromContext(document['@context']);
  if (!targetId) {
    return failure('CONTEXT_NOT_LOCKED', 'Cannot infer ujgTarget from JSON-LD context.');
  }

  let target;
  try {
    target = await loadTarget(targetId, options);
  } catch (error) {
    return { ok: false, diagnostics: error.diagnostics ?? [toDiagnostic(error)] };
  }

  try {
    const authoring = projectDocument(document, target);
    const yaml = stringifyYaml(authoring);
    const compiled = await compileAuthoringYaml(yaml, options);
    if (!compiled.ok) return compiled;

    const original = normalizeCanonical(document, target.vocabulary);
    const roundTrip = normalizeCanonical(compiled.document, target.vocabulary);
    if (!normalizedNodeSetsEqual(original, roundTrip)) {
      return failure(
        'ROUND_TRIP_MISMATCH',
        'compile(project(canonical)) changed the normalized node set.'
      );
    }

    return { ok: true, authoring, yaml, diagnostics: [] };
  } catch (error) {
    return { ok: false, diagnostics: error.diagnostics ?? [toDiagnostic(error)] };
  }
}

export async function validateCanonicalJsonLd(input, options = {}) {
  let document;
  try {
    document = typeof input === 'string' ? JSON.parse(input) : input;
  } catch (error) {
    return failure('INVALID_JSON', `Canonical JSON-LD is not valid JSON: ${error.message}`);
  }

  const projected = await projectCanonicalJsonLd(document, options);
  if (!projected.ok) return projected;

  return { ok: true, diagnostics: [] };
}

class Compiler {
  constructor(target, options) {
    this.target = target;
    this.vocabulary = target.vocabulary;
    this.setProperties = new Set(this.vocabulary.setProperties ?? []);
    this.referenceProperties = new Set(this.vocabulary.referenceProperties ?? []);
    this.options = options;
    this.nodes = new Map();
    this.diagnostics = [];
  }

  compile(root) {
    assertPlainObject(root, '$');
    for (const key of Object.keys(root)) {
      if (!ALLOWED_TOP_LEVEL_KEYS.has(key)) {
        throw diagnosticError('UNKNOWN_AUTHORING_TERM', `Unknown top-level authoring section "${key}".`, {
          path: key,
        });
      }
    }

    for (const [sectionName, section] of Object.entries(SECTION_REGISTRY)) {
      if (root[sectionName] === undefined) continue;
      if (sectionName === 'journey') {
        this.processJourney(root[sectionName], '$.journey');
      } else if (section.collection === 'single') {
        this.processNode(root[sectionName], section.type, `$.${sectionName}`);
      } else {
        this.processKeyedSection(root[sectionName], section.type, `$.${sectionName}`);
      }
    }

    if (root.nodes !== undefined) this.processCanonicalNodes(root.nodes, '$.nodes');
    if (root.accessible !== undefined) this.processAccessible(root.accessible);

    this.validateReferences();

    const nodes = [...this.nodes.values()]
      .map((node) => normalizeNode(node, this.setProperties))
      .sort((left, right) => left['@id'].localeCompare(right['@id']));

    const document = normalizeNode(
      {
        '@context': this.contextsFor(nodes),
        '@id': root['@id'] ?? root.id ?? this.options.documentId ?? DOCUMENT_ID,
        '@type': 'UJGDocument',
        nodes,
      },
      this.setProperties
    );

    return document;
  }

  processKeyedSection(sectionValue, defaultType, path) {
    assertPlainObject(sectionValue, path);
    for (const [id, value] of Object.entries(sectionValue)) {
      this.processKeyedNode(id, value, defaultType, `${path}.${id}`);
    }
  }

  processKeyedNode(id, value, defaultType, path) {
    return this.processNode(withKeyedIdentity(id, value, path), defaultType, path);
  }

  processCanonicalNodes(nodes, path) {
    assertArray(nodes, path);
    for (const [index, node] of nodes.entries()) {
      this.processCanonicalNode(node, `${path}[${index}]`);
    }
  }

  processCanonicalNode(value, path) {
    assertPlainObject(value, path);
    const id = value['@id'] ?? value.id;
    if (typeof id !== 'string' || id.length === 0) {
      throw diagnosticError('MISSING_ID', `Canonical node at ${path} needs id.`, { path });
    }

    const type = value['@type'] ?? value.type;
    if (typeof type !== 'string' || type.length === 0 || !this.vocabulary.classes?.[type]) {
      throw diagnosticError('TYPE_CONFLICT', `Unsupported UJG type "${type}" for ${id}.`, {
        path,
        id,
      });
    }

    const node = { '@id': id, '@type': type };
    for (const [key, rawValue] of Object.entries(value)) {
      if (key === 'id' || key === '@id' || key === 'type' || key === '@type') continue;
      if (key === '@context') {
        throw diagnosticError(
          'UNKNOWN_AUTHORING_TERM',
          'Node-local @context is not supported in canonical authoring nodes.',
          { path: `${path}.@context`, id }
        );
      }
      this.assignProperty(node, key, rawValue, `${path}.${key}`);
    }

    this.addNode(node, path);
    return node;
  }

  processAccessible(accessible) {
    assertPlainObject(accessible, '$.accessible');
    for (const key of Object.keys(accessible)) {
      if (!ACCESSIBLE_REGISTRY[key]) {
        throw diagnosticError(
          'UNKNOWN_AUTHORING_TERM',
          `Unknown accessible authoring section "${key}".`,
          { path: `$.accessible.${key}` }
        );
      }
      this.processKeyedSection(accessible[key], ACCESSIBLE_REGISTRY[key], `$.accessible.${key}`);
    }
  }

  processJourney(value, path) {
    return this.processNode(value, 'Journey', path);
  }

  processNode(value, defaultType, path, owner = undefined) {
    assertPlainObject(value, path);
    const id = value['@id'] ?? value.id;
    if (typeof id !== 'string' || id.length === 0) {
      throw diagnosticError('MISSING_ID', `Addressable authoring node at ${path} needs id.`, {
        path,
      });
    }
    const type = value['@type'] ?? value.type ?? defaultType;
    if (!this.vocabulary.classes?.[type]) {
      throw diagnosticError('TYPE_CONFLICT', `Unsupported UJG type "${type}" for ${id}.`, {
        path,
        id,
      });
    }

    const node = { '@id': id, '@type': type };
    const nested = {};

    for (const [key, rawValue] of Object.entries(value)) {
      if (key === 'id' || key === '@id' || key === 'type' || key === '@type') continue;
      if (STRUCTURAL_KEYS.has(key)) {
        nested[key] = rawValue;
        continue;
      }
      this.assignProperty(node, key, rawValue, `${path}.${key}`);
    }

    this.addNode(node, path);

    if (nested.subjourney !== undefined) {
      const childJourney = this.processJourney(nested.subjourney, `${path}.subjourney`);
      this.patchNode(id, { subjourneyId: childJourney['@id'] });
    }

    if (nested.surface !== undefined) {
      const surface = this.processNode(
        nested.surface,
        'Surface',
        `${path}.surface`,
        { graphNodeRef: id }
      );
      this.patchNode(surface['@id'], { graphNodeRef: id });
    }

    if (type === 'Journey') {
      this.processJourneyChildren(id, nested, path);
    }

    if (owner?.graphNodeRef) this.patchNode(id, { graphNodeRef: owner.graphNodeRef });

    return this.nodes.get(id);
  }

  processJourneyChildren(journeyId, nested, path) {
    const entryRefs = [];
    const stateRefs = [];
    const exitRefs = [];
    const transitionRefs = [];
    const outgoingTransitionGroupRefs = [];

    if (nested.entries !== undefined) {
      assertPlainObject(nested.entries, `${path}.entries`);
      for (const [id, entry] of Object.entries(nested.entries)) {
        const node = this.processKeyedNode(id, entry, 'JourneyEntry', `${path}.entries.${id}`);
        entryRefs.push(node['@id']);
      }
    }

    if (nested.states !== undefined) {
      assertPlainObject(nested.states, `${path}.states`);
      for (const [id, state] of Object.entries(nested.states)) {
        const node = this.processKeyedNode(id, state, 'State', `${path}.states.${id}`);
        if (node['@type'] === 'JourneyExit') {
          exitRefs.push(node['@id']);
        } else {
          stateRefs.push(node['@id']);
        }
        for (const transition of state.transitions ?? []) {
          const transitionNode = this.processNode(
            { from: id, ...transition },
            'Transition',
            `${path}.states.${id}.transitions`
          );
          transitionRefs.push(transitionNode['@id']);
        }
      }
    }

    if (nested.exits !== undefined) {
      assertPlainObject(nested.exits, `${path}.exits`);
      for (const [id, exit] of Object.entries(nested.exits)) {
        const node = this.processKeyedNode(id, exit, 'JourneyExit', `${path}.exits.${id}`);
        exitRefs.push(node['@id']);
      }
    }

    if (nested.transitions !== undefined) {
      assertArray(nested.transitions, `${path}.transitions`);
      for (const transition of nested.transitions) {
        const node = this.processNode(transition, 'Transition', `${path}.transitions`);
        transitionRefs.push(node['@id']);
      }
    }

    if (nested.outgoingTransitionGroups !== undefined) {
      assertPlainObject(nested.outgoingTransitionGroups, `${path}.outgoingTransitionGroups`);
      for (const [id, group] of Object.entries(nested.outgoingTransitionGroups)) {
        const node = this.processKeyedNode(
          id,
          group,
          'OutgoingTransitionGroup',
          `${path}.outgoingTransitionGroups.${id}`
        );
        outgoingTransitionGroupRefs.push(node['@id']);
      }
    }

    this.patchNode(journeyId, {
      entryRefs,
      stateRefs,
      transitionRefs,
      exitRefs,
      outgoingTransitionGroupRefs,
    });
  }

  assignProperty(node, key, value, path) {
    if (EXTENSION_RULES[key]) {
      node.extensions ??= {};
      node.extensions[EXTENSION_RULES[key]] = value;
      return;
    }

    if (!isKnownProperty(key, this.vocabulary)) {
      throw diagnosticError('UNKNOWN_AUTHORING_TERM', `Unknown authoring property "${key}".`, {
        path,
      });
    }

    const property = key === 'l10n:targetLocale' ? 'targetLocale' : key;
    node[property] = value;
  }

  addNode(node, path) {
    const previous = this.nodes.get(node['@id']);
    if (previous) {
      throw diagnosticError('DUPLICATE_ID', `Duplicate definition for ${node['@id']}.`, {
        path,
        id: node['@id'],
      });
    }
    this.nodes.set(node['@id'], node);
  }

  patchNode(id, properties) {
    const node = this.nodes.get(id);
    if (!node) throw new Error(`Cannot patch unknown node ${id}`);
    for (const [key, value] of Object.entries(properties)) {
      if (value === undefined) continue;
      if (this.setProperties.has(key)) {
        node[key] = mergeSet(node[key], value);
      } else if (node[key] === undefined || value !== undefined) {
        node[key] = value;
      }
    }
  }

  validateReferences() {
    for (const node of this.nodes.values()) {
      for (const [property, value] of Object.entries(node)) {
        if (!this.referenceProperties.has(property)) continue;
        const refs = Array.isArray(value) ? value : [value];
        for (const ref of refs) {
          if (typeof ref !== 'string') continue;
          if (this.nodes.has(ref)) continue;
          if (isExternalReference(ref)) continue;
          throw diagnosticError('UNRESOLVED_REFERENCE', `Unresolved reference ${ref}.`, {
            id: node['@id'],
            property,
            reference: ref,
          });
        }
      }
    }
  }

  contextsFor(nodes) {
    const modules = new Set(['core']);
    for (const node of nodes) {
      addModuleWithDependencies(modules, moduleForType(node['@type'], this.vocabulary), this.vocabulary);
      for (const property of Object.keys(node)) {
        addModuleWithDependencies(modules, moduleForProperty(property, this.vocabulary), this.vocabulary);
      }
    }

    return this.target.contextOrder
      .filter((moduleName) => modules.has(moduleName))
      .map((moduleName) => this.vocabulary.modules?.[moduleName]?.contextUrl)
      .filter(Boolean);
  }

  usedModules() {
    const modules = new Set(['core']);
    for (const node of this.nodes.values()) {
      addModuleWithDependencies(modules, moduleForType(node['@type'], this.vocabulary), this.vocabulary);
      for (const property of Object.keys(node)) {
        addModuleWithDependencies(modules, moduleForProperty(property, this.vocabulary), this.vocabulary);
      }
    }
    return [...modules].sort();
  }
}

function projectDocument(document, target) {
  assertProjectableCanonicalDocument(document, target.vocabulary);
  const normalized = normalizeCanonical(document, target.vocabulary);
  const authoring = { ujgTarget: target.id };
  if (typeof normalized['@id'] === 'string') authoring.id = normalized['@id'];
  authoring.nodes = normalized.nodes.map(projectCanonicalNode);
  return authoring;
}

function projectCanonicalNode(node) {
  const projected = {
    id: node['@id'],
    type: node['@type'],
  };
  for (const [key, value] of Object.entries(node)) {
    if (key === '@id' || key === '@type') continue;
    projected[key] = value;
  }
  return projected;
}

function assertProjectableCanonicalDocument(document, vocabulary) {
  assertPlainObject(document, '$');
  if (document['@type'] !== 'UJGDocument') {
    throw diagnosticError(
      'INVALID_CANONICAL_JSONLD',
      'Canonical JSON-LD document must have @type "UJGDocument".',
      { path: '$.@type' }
    );
  }
  if (!Array.isArray(document.nodes)) {
    throw diagnosticError('INVALID_CANONICAL_JSONLD', 'Canonical JSON-LD document needs nodes.', {
      path: '$.nodes',
    });
  }

  for (const key of Object.keys(document)) {
    if (key === '@context' || key === '@id' || key === '@type' || key === 'nodes') continue;
    throw diagnosticError(
      'LOSSY_PROJECTION',
      `Cannot project document-level property "${key}" without losing data.`,
      {
        path: `$.${key}`,
        property: key,
        remediation: 'Keep the document in canonical JSON-LD until this property is supported.',
      }
    );
  }

  for (const [index, node] of document.nodes.entries()) {
    const path = `$.nodes[${index}]`;
    assertPlainObject(node, path);
    const id = node['@id'];
    if (typeof id !== 'string' || id.length === 0) {
      throw diagnosticError('MISSING_ID', `Canonical node at ${path} needs @id.`, { path });
    }
    const type = node['@type'];
    if (typeof type !== 'string' || type.length === 0 || !vocabulary.classes?.[type]) {
      throw diagnosticError('TYPE_CONFLICT', `Unsupported UJG type "${type}" for ${id}.`, {
        path: `${path}.@type`,
        id,
      });
    }
    for (const key of Object.keys(node)) {
      if (key === '@id' || key === '@type') continue;
      if (key === '@context') {
        throw diagnosticError(
          'LOSSY_PROJECTION',
          'Cannot project node-local @context without losing data.',
          {
            path: `${path}.@context`,
            id,
            property: '@context',
            remediation: 'Use only top-level locked contexts for canonical projection.',
          }
        );
      }
      if (!isKnownCanonicalProperty(key, vocabulary)) {
        throw diagnosticError('UNKNOWN_AUTHORING_TERM', `Unknown canonical property "${key}".`, {
          path: `${path}.${key}`,
          id,
          property: key,
        });
      }
    }
  }
}

function parseYaml(input, options) {
  const diagnostics = [];
  const document = YAML.parseDocument(input, {
    prettyErrors: false,
    uniqueKeys: true,
  });

  for (const error of document.errors) {
    diagnostics.push({
      code: error.code === 'DUPLICATE_KEY' ? 'DUPLICATE_KEY' : 'YAML_SYNTAX',
      severity: 'error',
      message: error.message,
      file: options.filePath,
      line: error.linePos?.[0]?.line,
      column: error.linePos?.[0]?.col,
    });
  }

  if (diagnostics.length > 0) return { diagnostics };

  return {
    value: document.toJS({ mapAsMap: false }),
    diagnostics,
  };
}

function normalizeCanonical(document, vocabulary) {
  const setProperties = new Set(vocabulary.setProperties ?? []);
  const nodes = [...(document.nodes ?? [])]
    .map((node) => normalizeNode(node, setProperties))
    .sort(compareById);
  return normalizeNode({ ...document, nodes }, setProperties);
}

function normalizedNodeSetsEqual(left, right) {
  return JSON.stringify(left.nodes) === JSON.stringify(right.nodes);
}

function normalizeNode(node, setProperties = new Set()) {
  const normalized = {};
  for (const [key, value] of Object.entries(node)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      const mapped = value.map((item) =>
        isPlainObject(item) ? normalizeNode(item, setProperties) : item
      );
      normalized[key] = setProperties.has(key) ? [...new Set(mapped)].sort() : mapped;
    } else if (isPlainObject(value)) {
      normalized[key] = orderPlainObject(value);
    } else {
      normalized[key] = value;
    }
  }
  return orderPlainObject(normalized);
}

function stringifyYaml(value) {
  return YAML.stringify(value, {
    aliasDuplicateObjects: false,
    lineWidth: 0,
    sortMapEntries: false,
  });
}

function orderPlainObject(object) {
  const result = {};
  const entries = Object.entries(object);
  entries.sort(([left], [right]) => propertyRank(left) - propertyRank(right) || left.localeCompare(right));
  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      result[key] = value.map((item) => (isPlainObject(item) ? orderPlainObject(item) : item));
    } else if (isPlainObject(value)) {
      result[key] = orderPlainObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function propertyRank(key) {
  const index = PROPERTY_ORDER.indexOf(key);
  return index === -1 ? PROPERTY_ORDER.length : index;
}

function mergeSet(left, right) {
  const values = [
    ...(Array.isArray(left) ? left : left === undefined ? [] : [left]),
    ...(Array.isArray(right) ? right : right === undefined ? [] : [right]),
  ];
  return [...new Set(values)].sort();
}

function isKnownProperty(key, vocabulary) {
  return (
    key === 'extensions' ||
    key === 'type' ||
    key === '@type' ||
    key === 'id' ||
    key === '@id' ||
    Boolean(vocabulary.properties?.[key]) ||
    key === 'l10n:targetLocale'
  );
}

function isKnownCanonicalProperty(key, vocabulary) {
  return key === 'extensions' || Boolean(vocabulary.properties?.[key]);
}

function moduleForType(type, vocabulary) {
  return vocabulary.classes?.[type]?.module;
}

function moduleForProperty(property, vocabulary) {
  if (property === 'extensions') return 'core';
  return vocabulary.properties?.[property]?.module;
}

function addModuleWithDependencies(modules, moduleName, vocabulary) {
  if (!moduleName || modules.has(moduleName)) return;
  for (const dependency of vocabulary.modules?.[moduleName]?.dependencies ?? []) {
    addModuleWithDependencies(modules, dependency, vocabulary);
  }
  modules.add(moduleName);
}

function inferTargetFromContext(context) {
  const contexts = Array.isArray(context) ? context : [context];
  if (contexts.some((item) => typeof item === 'string' && item.includes('/ed/ns/'))) {
    return 'ed-2026-07-13';
  }
  return undefined;
}

function isExternalReference(ref) {
  return ref.startsWith('_:') || /^[A-Za-z][A-Za-z\d+.-]*:/.test(ref);
}

function compareById(left, right) {
  return left['@id'].localeCompare(right['@id']);
}

function withKeyedIdentity(id, value, path) {
  assertPlainObject(value, path);
  for (const property of ['id', '@id']) {
    const explicitId = value[property];
    if (explicitId === undefined) continue;
    if (explicitId !== id) {
      throw diagnosticError(
        'ID_CONFLICT',
        `Keyed node identity "${explicitId}" does not match map key "${id}".`,
        {
          path: `${path}.${property}`,
          id,
          property,
          remediation: 'Remove the redundant id field, or make it match the map key.',
        }
      );
    }
  }
  return { ...value, id };
}

function assertPlainObject(value, path) {
  if (!isPlainObject(value)) {
    throw diagnosticError('UNKNOWN_AUTHORING_TERM', `${path} must be a mapping.`, { path });
  }
}

function assertArray(value, path) {
  if (!Array.isArray(value)) {
    throw diagnosticError('UNKNOWN_AUTHORING_TERM', `${path} must be a sequence.`, { path });
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function failure(code, message, extra = {}) {
  return { ok: false, diagnostics: [{ code, severity: 'error', message, ...extra }] };
}

function toDiagnostic(error) {
  return {
    code: 'INTERNAL_ERROR',
    severity: 'error',
    message: error.message,
  };
}
