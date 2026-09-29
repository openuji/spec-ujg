import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test, { before } from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = join(packageRoot, 'scripts/agent-pack.js');
const buildRoot = join(packageRoot, 'build');
const manifestPath = join(buildRoot, 'manifest.json');

const formats = {
  codex: {
    label: 'Codex',
    envVar: 'CODEX_HOME',
    generatedDir: 'codex',
    manifestHash: 'artifactHash',
  },
  claude: {
    label: 'Claude',
    envVar: 'CLAUDE_CONFIG_DIR',
    generatedDir: 'claude',
    manifestHash: 'claudeArtifactHash',
  },
};

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

function tempHome(t, formatKey) {
  const path = mkdtempSync(join(tmpdir(), `ujg-agent-pack-${formatKey}-`));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  return path;
}

function runAgentPack(args, format, home, options = {}) {
  try {
    const stdout = execFileSync(process.execPath, [cliPath, ...args], {
      cwd: packageRoot,
      env: { ...process.env, [format.envVar]: home },
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

function installedSkillPath(skillsRoot, name) {
  return join(skillsRoot, name);
}

function installedStatePath(skillsRoot, name) {
  return join(installedSkillPath(skillsRoot, name), 'references', 'package-state.json');
}

function generatedStatePath(format, name) {
  return join(buildRoot, format.generatedDir, name, 'references', 'package-state.json');
}

function assertInstalled(skillsRoot, name) {
  assert.ok(existsSync(join(installedSkillPath(skillsRoot, name), 'SKILL.md')), `${name} should be installed`);
  assert.ok(existsSync(installedStatePath(skillsRoot, name)), `${name} should have package-state.json`);
}

function assertNotInstalled(skillsRoot, name) {
  assert.equal(existsSync(installedSkillPath(skillsRoot, name)), false, `${name} should not be installed`);
}

before(() => {
  execFileSync(process.execPath, [cliPath, 'generate'], { cwd: packageRoot, stdio: 'ignore' });
});

for (const [formatKey, format] of Object.entries(formats)) {
  test(`${formatKey}: target install installs only that target`, (t) => {
    const home = tempHome(t, formatKey);
    const skillsRoot = join(home, 'skills');

    runAgentPack(['install', formatKey, '--target', 'ed'], format, home);

    for (const item of targetSkills('ed')) {
      assertInstalled(skillsRoot, item.name);
    }

    for (const item of targetSkills('tr/2026.06')) {
      assertNotInstalled(skillsRoot, item.name);
    }
  });

  test(`${formatKey}: target install replaces current generated skills for that target`, (t) => {
    const home = tempHome(t, formatKey);
    const skillsRoot = join(home, 'skills');
    const graph = targetSkills('ed').find((item) => item.key === 'graph');
    assert.ok(graph, 'missing ED graph skill');

    runAgentPack(['install', formatKey, '--target', 'ed'], format, home);
    rmSync(installedStatePath(skillsRoot, graph.name), { force: true });
    runAgentPack(['install', formatKey, '--target', 'ed'], format, home);

    assert.equal(
      readFileSync(installedStatePath(skillsRoot, graph.name), 'utf8'),
      readFileSync(generatedStatePath(format, graph.name), 'utf8'),
      `${graph.name} installed package-state.json should match generated package-state.json`
    );
  });

  test(`${formatKey}: target install removes stale managed skills for that target only`, (t) => {
    const home = tempHome(t, formatKey);
    const staleEd = join(home, 'skills', 'ujg-ed-obsolete-modeling');
    const staleTr = join(home, 'skills', 'ujg-tr-2026-06-obsolete-modeling');

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

    runAgentPack(['install', formatKey, '--target', 'ed'], format, home);

    assert.equal(existsSync(staleEd), false, 'stale ED managed skill should be removed');
    assert.equal(existsSync(staleTr), true, 'stale TR managed skill should be preserved');
  });

  test(`${formatKey}: install requires an explicit target`, (t) => {
    const home = tempHome(t, formatKey);
    const result = runAgentPack(['install', formatKey], format, home, { fail: true });

    assert.match(result.stderr, new RegExp(`${format.label} install requires --target <id>`));
  });

  test(`${formatKey}: single-skill install flags are rejected`, (t) => {
    const home = tempHome(t, formatKey);
    const result = runAgentPack(
      ['install', formatKey, '--target', 'ed', '--skill', 'graph'],
      format,
      home,
      { fail: true }
    );

    assert.match(result.stderr, /target-level installs only/);

    for (const item of targetSkills('ed')) {
      assertNotInstalled(join(home, 'skills'), item.name);
    }
  });

  test(`${formatKey}: with-deps install flag is rejected`, (t) => {
    const home = tempHome(t, formatKey);
    const result = runAgentPack(
      ['install', formatKey, '--target', 'ed', '--with-deps'],
      format,
      home,
      { fail: true }
    );

    assert.match(result.stderr, /target-level installs only/);
  });

  test(`${formatKey}: generated package-state metadata matches manifest skills`, () => {
    for (const target of manifest().targets) {
      for (const item of target.skills) {
        const state = readJson(generatedStatePath(format, item.name));

        assert.equal(state.package.id, 'ujg-agent-pack');
        assert.equal(state.target.id, target.id);
        assert.equal(state.skill.key, item.key);
        assert.equal(state.skill.name, item.name);
        assert.equal(state.sourceHash, item.sourceHash);
        assert.equal(state.specHash, item.specHash);
        assert.equal(state.artifactHash, item[format.manifestHash]);
        assert.equal('installDependencies' in state, false);
        assert.equal('installDependencies' in item, false);
      }
    }
  });
}

test('claude: project install writes into <project>/.claude/skills', (t) => {
  const home = tempHome(t, 'claude');
  const project = tempHome(t, 'claude-project');

  runAgentPack(['install', 'claude', '--target', 'ed', '--project', project], formats.claude, home);

  for (const item of targetSkills('ed')) {
    assertInstalled(join(project, '.claude', 'skills'), item.name);
    assertNotInstalled(join(home, 'skills'), item.name);
  }
});

test('claude: generated skills omit Codex-only openai.yaml', () => {
  for (const target of manifest().targets) {
    for (const item of target.skills) {
      assert.equal(existsSync(join(buildRoot, 'claude', item.name, 'SKILL.md')), true);
      assert.equal(existsSync(join(buildRoot, 'claude', item.name, 'agents', 'openai.yaml')), false);
    }
  }
});

test('codex: --project flag is rejected', (t) => {
  const home = tempHome(t, 'codex');
  const result = runAgentPack(
    ['install', 'codex', '--target', 'ed', '--project', home],
    formats.codex,
    home,
    { fail: true }
  );

  assert.match(result.stderr, /Codex install does not support --project/);
});
