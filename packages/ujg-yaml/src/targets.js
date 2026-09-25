import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectionRegistryDiagnostics } from './registry.js';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = resolve(PACKAGE_ROOT, '../..');

const TARGET_FILES = {
  'ed-2026-07-13': resolve(PACKAGE_ROOT, 'targets/ed-2026-07-13.json'),
};

const TARGET_VOCABULARY_FILES = {
  'ed-2026-07-13': resolve(PACKAGE_ROOT, 'targets/ed-2026-07-13.vocab.json'),
};

export function listTargets() {
  return Object.keys(TARGET_FILES).sort();
}

export async function loadTarget(targetId, options = {}) {
  const path = TARGET_FILES[targetId];
  if (!path) {
    throw diagnosticError('CONTEXT_NOT_LOCKED', `Unknown UJG target "${targetId}".`, {
      targetId,
      remediation: `Use one of: ${listTargets().join(', ')}`,
    });
  }

  const target = JSON.parse(await readFile(path, 'utf8'));
  target.vocabulary = await loadTargetVocabulary(targetId);
  if (options.verifyArtifacts !== false) {
    await verifyTargetArtifacts(target);
    verifyTargetVocabulary(target);
    verifyProjectionRegistry(target);
  }
  return target;
}

async function loadTargetVocabulary(targetId) {
  const path = TARGET_VOCABULARY_FILES[targetId];
  if (!path) {
    throw diagnosticError('CONTEXT_NOT_LOCKED', `Missing vocabulary lock for target "${targetId}".`, {
      targetId,
      remediation: 'Generate the target vocabulary before compiling.',
    });
  }

  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    throw diagnosticError('CONTEXT_NOT_LOCKED', `Cannot load vocabulary lock for target "${targetId}".`, {
      targetId,
      cause: error.message,
      remediation: 'Run pnpm --filter @openuji/ujg-yaml run vocab:update.',
    });
  }
}

export async function verifyTargetArtifacts(target) {
  const mismatches = [];

  for (const module of Object.values(target.modules ?? {})) {
    for (const artifact of Object.values(module.artifacts ?? {})) {
      const absolutePath = resolve(REPO_ROOT, artifact.path);
      const content = await readFile(absolutePath);
      const actualHash = `sha256:${createHash('sha256').update(content).digest('hex')}`;
      if (actualHash !== artifact.hash) {
        mismatches.push(`${artifact.path}: expected ${artifact.hash}, got ${actualHash}`);
      }
    }
  }

  if (mismatches.length > 0) {
    throw diagnosticError(
      'CONTEXT_NOT_LOCKED',
      `Target "${target.id}" artifact lock is stale.`,
      {
        targetId: target.id,
        details: mismatches,
        remediation: 'Regenerate the dated ED target lock before compiling.',
      }
    );
  }
}

function verifyTargetVocabulary(target) {
  const mismatches = [];
  const vocabulary = target.vocabulary;

  if (vocabulary?.targetId !== target.id) {
    mismatches.push(`targetId: expected ${target.id}, got ${vocabulary?.targetId ?? '<missing>'}`);
  }

  const lockedHashes = collectArtifactHashes(target);
  const vocabularyHashes = vocabulary?.generatedFrom?.artifactHashes ?? {};
  for (const [artifactPath, hash] of Object.entries(lockedHashes)) {
    if (vocabularyHashes[artifactPath] !== hash) {
      mismatches.push(
        `${artifactPath}: target lock has ${hash}, vocabulary has ${
          vocabularyHashes[artifactPath] ?? '<missing>'
        }`
      );
    }
  }

  const targetContextOrder = JSON.stringify(target.contextOrder ?? []);
  const vocabularyContextOrder = JSON.stringify(vocabulary?.contextOrder ?? []);
  if (targetContextOrder !== vocabularyContextOrder) {
    mismatches.push('contextOrder differs between target lock and vocabulary lock.');
  }

  for (const [moduleName, module] of Object.entries(target.modules ?? {})) {
    const vocabularyContextUrl = vocabulary?.modules?.[moduleName]?.contextUrl;
    if (vocabularyContextUrl !== module.contextUrl) {
      mismatches.push(
        `${moduleName}.contextUrl: expected ${module.contextUrl}, got ${
          vocabularyContextUrl ?? '<missing>'
        }`
      );
    }
  }

  if (mismatches.length > 0) {
    throw diagnosticError(
      'CONTEXT_NOT_LOCKED',
      `Target "${target.id}" vocabulary lock is stale.`,
      {
        targetId: target.id,
        details: mismatches,
        remediation: 'Run pnpm --filter @openuji/ujg-yaml run vocab:update.',
      }
    );
  }
}

function verifyProjectionRegistry(target) {
  const diagnostics = projectionRegistryDiagnostics(target.vocabulary);
  if (diagnostics.length > 0) {
    throw diagnosticError(
      'CONTEXT_NOT_LOCKED',
      `Projection registry does not match target "${target.id}" vocabulary.`,
      {
        targetId: target.id,
        details: diagnostics,
        remediation: 'Update the projection registry or regenerate the target vocabulary.',
      }
    );
  }
}

function collectArtifactHashes(target) {
  const hashes = {};
  for (const module of Object.values(target.modules ?? {})) {
    for (const artifact of Object.values(module.artifacts ?? {})) {
      hashes[artifact.path] = artifact.hash;
    }
  }
  return hashes;
}

export function diagnosticError(code, message, extra = {}) {
  const error = new Error(message);
  error.diagnostics = [
    {
      code,
      severity: 'error',
      message,
      ...extra,
    },
  ];
  return error;
}
