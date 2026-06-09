import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MANIFEST_NAME = 'content-manifest.json';
const MANIFEST_VERSION = 1;
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ED_ROOT = join(REPO_ROOT, 'specs/ed');
const TR_ROOT = join(REPO_ROOT, 'specs/tr');
const SPEC_ROOTS = [ED_ROOT, TR_ROOT];

function findDocumentDirectories(directory) {
  const directories = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const child = join(directory, entry.name);
    if (existsSync(join(child, 'index.md')) && existsSync(join(child, 'config.json'))) {
      directories.push(child);
    }
    directories.push(...findDocumentDirectories(child));
  }

  return directories.sort();
}

function findAllDocumentDirectories() {
  return SPEC_ROOTS.filter(existsSync)
    .flatMap((directory) => findDocumentDirectories(directory))
    .sort();
}

function listContentFiles(directory, current = directory) {
  const files = [];

  for (const entry of readdirSync(current, { withFileTypes: true })) {
    const path = join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...listContentFiles(directory, path));
    } else if (entry.isFile() && entry.name !== MANIFEST_NAME) {
      files.push(path);
    }
  }

  return files.sort((left, right) =>
    relative(directory, left).localeCompare(relative(directory, right))
  );
}

function calculateContentHash(directory) {
  const hash = createHash('sha256');

  for (const file of listContentFiles(directory)) {
    hash.update(relative(directory, file));
    hash.update('\0');
    hash.update(readFileSync(file));
    hash.update('\0');
  }

  return `sha256:${hash.digest('hex')}`;
}

function readManifest(directory) {
  const path = join(directory, MANIFEST_NAME);
  if (!existsSync(path)) return undefined;

  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`${relative(REPO_ROOT, path)} is not valid JSON: ${error.message}`);
  }
}

function isIsoTimestamp(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function validateManifest(directory, manifest, expectedHash) {
  const path = relative(REPO_ROOT, join(directory, MANIFEST_NAME));
  const errors = [];

  if (!manifest) return [`${path} is missing`];
  if (manifest.version !== MANIFEST_VERSION) errors.push(`${path}: version must be 1`);
  if (!isIsoTimestamp(manifest.publishedAt))
    errors.push(`${path}: publishedAt must be UTC ISO-8601`);
  if (!isIsoTimestamp(manifest.updatedAt)) errors.push(`${path}: updatedAt must be UTC ISO-8601`);
  if (
    isIsoTimestamp(manifest.publishedAt) &&
    isIsoTimestamp(manifest.updatedAt) &&
    manifest.publishedAt > manifest.updatedAt
  ) {
    errors.push(`${path}: publishedAt must not be later than updatedAt`);
  }
  if (manifest.contentHash !== expectedHash) {
    errors.push(`${path}: contentHash is stale; run pnpm content-manifests:update`);
  }

  return errors;
}

function getInitialGitDates(directory) {
  const documentPath = relative(REPO_ROOT, directory);
  const manifestPath = `${documentPath}/${MANIFEST_NAME}`;
  let output;

  try {
    output = execFileSync(
      'git',
      ['log', '--format=%aI', '--reverse', '--', documentPath, `:(exclude)${manifestPath}`],
      { cwd: REPO_ROOT, encoding: 'utf8' }
    );
  } catch (error) {
    throw new Error(`Cannot derive initial dates for ${documentPath} from Git: ${error.message}`);
  }

  const dates = output
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((value) => new Date(value).toISOString());

  if (dates.length === 0) {
    throw new Error(`Cannot derive initial dates for ${documentPath}: no Git history found`);
  }

  return { publishedAt: dates[0], updatedAt: dates.at(-1) };
}

function updateManifests() {
  let updated = 0;
  const now = new Date().toISOString();

  for (const directory of findAllDocumentDirectories()) {
    const path = join(directory, MANIFEST_NAME);
    const existing = readManifest(directory);
    const contentHash = calculateContentHash(directory);

    if (
      existing?.contentHash === contentHash &&
      validateManifest(directory, existing, contentHash).length === 0
    ) {
      continue;
    }

    const initialDates = existing ? undefined : getInitialGitDates(directory);
    const manifest = {
      version: MANIFEST_VERSION,
      publishedAt: existing?.publishedAt ?? initialDates.publishedAt,
      updatedAt: existing ? now : initialDates.updatedAt,
      contentHash,
    };

    writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Updated ${relative(REPO_ROOT, path)}`);
    updated += 1;
  }

  console.log(`${updated} content manifest(s) updated`);
}

function checkManifests() {
  const errors = [];

  const directories = findAllDocumentDirectories();

  for (const directory of directories) {
    const manifest = readManifest(directory);
    errors.push(...validateManifest(directory, manifest, calculateContentHash(directory)));
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
    return;
  }

  console.log(`${directories.length} content manifest(s) valid`);
}

const command = process.argv[2];
if (command === 'update') {
  updateManifests();
} else if (command === 'check') {
  checkManifests();
} else {
  console.error('Usage: node scripts/content-manifests.js <update|check>');
  process.exitCode = 1;
}
