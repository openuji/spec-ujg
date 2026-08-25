import Ajv2020 from 'ajv/dist/2020.js';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const EXTENSION_ROOT = join(REPO_ROOT, 'specs/ed/extensions/domain-model');
const SCHEMA_PATH = join(EXTENSION_ROOT, 'domain-model.schema.json');
const FIXTURES_ROOT = join(EXTENSION_ROOT, 'fixtures');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function listJsonFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listJsonFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(path);
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function fixtureModel(fixture, path) {
  if (
    fixture &&
    typeof fixture === 'object' &&
    Array.isArray(fixture.domainRequirementIds) &&
    fixture.domainModel &&
    typeof fixture.domainModel === 'object'
  ) {
    return fixture.domainModel;
  }

  throw new Error(`${relative(REPO_ROOT, path)} must contain domainRequirementIds and domainModel`);
}

function fixtureRequirementIds(fixture) {
  return new Set(fixture.domainRequirementIds);
}

function fixtureTargetRequirementIds(fixture) {
  if (!Array.isArray(fixture.targetDomainRequirementIds)) return null;
  return new Set(fixture.targetDomainRequirementIds);
}

function domainElements(model) {
  return [
    ...model.entities,
    ...model.entities.flatMap((entity) => entity.properties),
    ...model.valueObjects,
    ...model.valueObjects.flatMap((valueObject) => valueObject.properties),
    ...model.relationships,
    ...model.domainOperations,
    ...model.invariants,
  ];
}

function validateSemantics(model, availableRequirementIds, targetRequirementIds) {
  const errors = [];
  const elementRefs = new Map();
  const entityOrValueObjectRefs = new Set();
  const allElements = domainElements(model);
  const coveredRequirementRefs = new Set();

  for (const entity of model.entities) entityOrValueObjectRefs.add(entity.id);
  for (const valueObject of model.valueObjects) entityOrValueObjectRefs.add(valueObject.id);

  for (const element of allElements) {
    if (elementRefs.has(element.id)) errors.push(`Duplicate Domain Model element id ${element.id}`);
    elementRefs.set(element.id, element);

    for (const ref of element.domainRequirementRefs) {
      if (!availableRequirementIds.has(ref)) {
        errors.push(`${element.id} references unresolved requirement ${ref}`);
      }
      coveredRequirementRefs.add(ref);
    }
  }

  if (targetRequirementIds) {
    for (const ref of targetRequirementIds) {
      if (!availableRequirementIds.has(ref)) {
        errors.push(`Target requirement set contains unresolved requirement ${ref}`);
      } else if (!coveredRequirementRefs.has(ref)) {
        errors.push(`Target requirement set contains uncovered requirement ${ref}`);
      }
    }

    for (const ref of coveredRequirementRefs) {
      if (!targetRequirementIds.has(ref)) {
        errors.push(`Coverage includes requirement outside target set ${ref}`);
      }
    }
  }

  for (const relationship of model.relationships) {
    if (!entityOrValueObjectRefs.has(relationship.sourceRef)) {
      errors.push(`${relationship.id}.sourceRef does not resolve: ${relationship.sourceRef}`);
    }
    if (!entityOrValueObjectRefs.has(relationship.targetRef)) {
      errors.push(`${relationship.id}.targetRef does not resolve: ${relationship.targetRef}`);
    }
  }

  for (const operation of model.domainOperations) {
    for (const ref of operation.actsOnRefs) {
      if (!entityOrValueObjectRefs.has(ref)) {
        errors.push(`${operation.id}.actsOnRefs does not resolve: ${ref}`);
      }
    }
  }

  for (const invariant of model.invariants) {
    for (const ref of invariant.appliesToRefs) {
      if (!elementRefs.has(ref)) {
        errors.push(`${invariant.id}.appliesToRefs does not resolve: ${ref}`);
      }
    }
  }

  return errors;
}

function expectedKind(path) {
  const relativePath = relative(FIXTURES_ROOT, path);
  if (relativePath.startsWith('positive/')) return 'positive';
  if (relativePath.startsWith('negative/schema/')) return 'schema-negative';
  if (relativePath.startsWith('negative/semantic/')) return 'semantic-negative';
  throw new Error(`Fixture must be under positive, negative/schema, or negative/semantic: ${path}`);
}

function main() {
  if (!existsSync(FIXTURES_ROOT)) throw new Error(`Missing fixtures directory: ${FIXTURES_ROOT}`);

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(readJson(SCHEMA_PATH));
  const failures = [];
  let checked = 0;

  for (const file of listJsonFiles(FIXTURES_ROOT)) {
    checked += 1;
    const kind = expectedKind(file);
    const fixture = readJson(file);
    const model = fixtureModel(fixture, file);
    const schemaValid = validate(model);
    const semanticErrors = schemaValid
      ? validateSemantics(model, fixtureRequirementIds(fixture), fixtureTargetRequirementIds(fixture))
      : [];
    const semanticValid = semanticErrors.length === 0;
    const relPath = relative(REPO_ROOT, file);

    if (kind === 'positive' && (!schemaValid || !semanticValid)) {
      failures.push(`${relPath} expected valid but failed`);
    } else if (kind === 'schema-negative' && schemaValid) {
      failures.push(`${relPath} expected schema failure but passed schema validation`);
    } else if (kind === 'semantic-negative' && (!schemaValid || semanticValid)) {
      failures.push(`${relPath} expected semantic-only failure`);
    }

    if (failures.at(-1)?.startsWith(relPath)) {
      if (!schemaValid) {
        failures.push(
          ...validate.errors.map((error) => `  schema ${error.instancePath || '/'} ${error.message}`)
        );
      }
      for (const error of semanticErrors) failures.push(`  semantic ${error}`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
    return;
  }

  console.log(`${checked} Domain Model fixture(s) valid`);
}

main();
