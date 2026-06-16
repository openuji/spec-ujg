import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = join(packageRoot, 'scripts/agent-pack.js');
const manifestPath = join(packageRoot, 'manifest.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function manifest() {
  return readJson(manifestPath);
}

function targetSkills(targetId) {
  const target = manifest().targets.find((item) => item.id === targetId);
  assert.ok(target, `missing target ${targetId}`);
  return target.skills;
}

function tempCodexHome(t) {
  const path = mkdtempSync(join(tmpdir(), 'ujg-agent-pack-codex-'));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  return path;
}

function runAgentPack(args, codexHome, options = {}) {
  try {
    const stdout = execFileSync(process.execPath, [cliPath, ...args], {
      cwd: packageRoot,
      env: { ...process.env, CODEX_HOME: codexHome },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (options.fail) {
      assert.fail(`expected command to fail: ${args.join(' ')}`);
    }

    return { stdout, stderr: '', status: 0 };
  } catch (error) {
    const result = {
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || '',
      status: error.status,
    };

    if (!options.fail) {
      assert.fail(`command failed: ${args.join(' ')}\n${result.stdout}${result.stderr}`);
    }

    return result;
  }
}

function installedSkillPath(codexHome, name) {
  return join(codexHome, 'skills', name);
}

function installedStatePath(codexHome, name) {
  return join(installedSkillPath(codexHome, name), 'references', 'package-state.json');
}

function generatedStatePath(name) {
  return join(packageRoot, 'codex', name, 'references', 'package-state.json');
}

function assertInstalled(codexHome, name) {
  assert.ok(existsSync(join(installedSkillPath(codexHome, name), 'SKILL.md')), `${name} should be installed`);
  assert.ok(existsSync(installedStatePath(codexHome, name)), `${name} should have package-state.json`);
}

function assertNotInstalled(codexHome, name) {
  assert.equal(existsSync(installedSkillPath(codexHome, name)), false, `${name} should not be installed`);
}

test('target install installs only that target', (t) => {
  const codexHome = tempCodexHome(t);

  runAgentPack(['install', 'codex', '--target', 'ed'], codexHome);

  for (const item of targetSkills('ed')) {
    assertInstalled(codexHome, item.name);
  }

  for (const item of targetSkills('tr/2026.06')) {
    assertNotInstalled(codexHome, item.name);
  }
});

test('target install replaces current generated skills for that target', (t) => {
  const codexHome = tempCodexHome(t);
  const graph = targetSkills('ed').find((item) => item.key === 'graph');
  assert.ok(graph, 'missing ED graph skill');

  runAgentPack(['install', 'codex', '--target', 'ed'], codexHome);
  rmSync(installedStatePath(codexHome, graph.name), { force: true });
  runAgentPack(['install', 'codex', '--target', 'ed'], codexHome);

  assert.equal(
    readFileSync(installedStatePath(codexHome, graph.name), 'utf8'),
    readFileSync(generatedStatePath(graph.name), 'utf8'),
    `${graph.name} installed package-state.json should match generated package-state.json`
  );
});

test('target install removes stale managed skills for that target only', (t) => {
  const codexHome = tempCodexHome(t);
  const staleEd = join(codexHome, 'skills', 'ujg-ed-obsolete-modeling');
  const staleTr = join(codexHome, 'skills', 'ujg-tr-2026-06-obsolete-modeling');

  mkdirSync(join(staleEd, 'references'), { recursive: true });
  mkdirSync(join(staleTr, 'references'), { recursive: true });
  writeFileSync(
    join(staleEd, 'references', 'package-state.json'),
    JSON.stringify({ package: { id: 'ujg-agent-pack' }, target: { id: 'ed' } })
  );
  writeFileSync(
    join(staleTr, 'references', 'package-state.json'),
    JSON.stringify({ package: { id: 'ujg-agent-pack' }, target: { id: 'tr/2026.06' } })
  );

  runAgentPack(['install', 'codex', '--target', 'ed'], codexHome);

  assert.equal(existsSync(staleEd), false, 'stale ED managed skill should be removed');
  assert.equal(existsSync(staleTr), true, 'stale TR managed skill should be preserved');
});

test('install requires an explicit target', (t) => {
  const codexHome = tempCodexHome(t);
  const result = runAgentPack(['install', 'codex'], codexHome, { fail: true });

  assert.match(result.stderr, /Codex install requires --target <id>/);
});

test('single-skill install flags are rejected', (t) => {
  const codexHome = tempCodexHome(t);
  const result = runAgentPack(
    ['install', 'codex', '--target', 'ed', '--skill', 'graph'],
    codexHome,
    { fail: true }
  );

  assert.match(result.stderr, /target-level installs only/);

  for (const item of targetSkills('ed')) {
    assertNotInstalled(codexHome, item.name);
  }
});

test('with-deps install flag is rejected', (t) => {
  const codexHome = tempCodexHome(t);
  const result = runAgentPack(
    ['install', 'codex', '--target', 'ed', '--with-deps'],
    codexHome,
    { fail: true }
  );

  assert.match(result.stderr, /target-level installs only/);
});

test('generated package-state metadata matches manifest skills', () => {
  for (const target of manifest().targets) {
    for (const item of target.skills) {
      const state = readJson(generatedStatePath(item.name));

      assert.equal(state.package.id, 'ujg-agent-pack');
      assert.equal(state.target.id, target.id);
      assert.equal(state.skill.key, item.key);
      assert.equal(state.skill.name, item.name);
      assert.equal(state.sourceHash, item.sourceHash);
      assert.equal(state.specHash, item.specHash);
      assert.equal(state.artifactHash, item.artifactHash);
      assert.equal('installDependencies' in state, false);
      assert.equal('installDependencies' in item, false);
    }
  }
});
