#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import {
  compileAuthoringYaml,
  listTargets,
  projectCanonicalJsonLd,
  validateCanonicalJsonLd,
} from './index.js';

const [, , command, ...args] = process.argv;

try {
  if (command === 'compile') {
    await compileCommand(args);
  } else if (command === 'project') {
    await projectCommand(args);
  } else if (command === 'validate') {
    await validateCommand(args);
  } else if (command === 'targets' && args[0] === 'list') {
    for (const target of listTargets()) console.log(target);
  } else {
    usage();
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

async function compileCommand(args) {
  const { input, output, report } = parseIoArgs(args);
  const source = await readFile(input, 'utf8');
  const result = await compileAuthoringYaml(source, { filePath: input });
  if (!result.ok) exitDiagnostics(result.diagnostics);
  const json = `${JSON.stringify(result.document, null, 2)}\n`;
  await writeOrStdout(output, json);
  if (report) {
    await writeFile(
      report,
      `${JSON.stringify({ diagnostics: result.diagnostics, provenance: result.provenance }, null, 2)}\n`
    );
  }
}

async function projectCommand(args) {
  const { input, output } = parseIoArgs(args);
  const source = await readFile(input, 'utf8');
  const result = await projectCanonicalJsonLd(source);
  if (!result.ok) exitDiagnostics(result.diagnostics);
  await writeOrStdout(output, result.yaml);
}

async function validateCommand(args) {
  const { input } = parseIoArgs(args);
  const source = await readFile(input, 'utf8');
  const result = await validateCanonicalJsonLd(source);
  for (const diagnostic of result.diagnostics ?? []) printDiagnostic(diagnostic);
  if (!result.ok) process.exitCode = 1;
}

function parseIoArgs(args) {
  const parsed = { input: undefined, output: undefined, report: undefined };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '-o' || arg === '--output') {
      parsed.output = args[++index];
    } else if (arg === '--report') {
      parsed.report = args[++index];
    } else if (!parsed.input) {
      parsed.input = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  if (!parsed.input) throw new Error('Missing input file.');
  return parsed;
}

async function writeOrStdout(output, content) {
  if (output) {
    await writeFile(output, content);
  } else {
    process.stdout.write(content);
  }
}

function exitDiagnostics(diagnostics) {
  for (const diagnostic of diagnostics) printDiagnostic(diagnostic);
  process.exit(1);
}

function printDiagnostic(diagnostic) {
  const location = [diagnostic.file, diagnostic.line, diagnostic.column].filter(Boolean).join(':');
  const prefix = location ? `${location}: ` : '';
  console.error(`${prefix}${diagnostic.severity ?? 'error'} ${diagnostic.code}: ${diagnostic.message}`);
  if (diagnostic.remediation) console.error(`  ${diagnostic.remediation}`);
}

function usage() {
  console.error(`Usage:
  ujg-yaml compile <input.ujg.yaml> [-o output.ujg.jsonld] [--report report.json]
  ujg-yaml project <input.ujg.jsonld> [-o output.ujg.yaml]
  ujg-yaml validate <input.ujg.jsonld>
  ujg-yaml targets list`);
}
