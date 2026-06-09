import type { APIRoute } from 'astro';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createJsonResponse,
  getSpecBaseUrl,
  rewriteCanonicalSpecBaseUrl,
} from '@/lib/spec-artifacts';
import {
  BASELINE_CONTEXT_ARTIFACTS,
  TECHNICAL_REPORTS,
  getTechnicalReport,
} from '@/lib/technical-reports';

const SPEC_BASE_URL = getSpecBaseUrl(import.meta.env.SPEC_BASE_URL);

function getReportRoot(slug: string): string {
  return fileURLToPath(new URL(`../../../../../../../specs/tr/${slug}/`, import.meta.url));
}

function walk(directory: string): string[] {
  const files: string[] = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else if (entry.isFile()) files.push(path);
  }

  return files;
}

function artifactNameFromFile(path: string): string | undefined {
  const name = basename(path);

  if (name.endsWith('.context.jsonld')) return name;
  if (name.endsWith('.shape.ttl')) return name.replace(/\.ttl$/, '');
  if (name.endsWith('.ttl')) return name.replace(/\.ttl$/, '');
  return undefined;
}

function discoverArtifacts(reportSlug: string): string[] {
  const root = getReportRoot(reportSlug);
  const artifacts = new Set<string>(['context.jsonld']);

  for (const file of walk(root)) {
    const artifact = artifactNameFromFile(file);
    if (artifact) artifacts.add(artifact);
  }

  return [...artifacts].sort();
}

function findArtifactSource(reportSlug: string, artifact: string): string | undefined {
  const root = getReportRoot(reportSlug);
  let namespaceName = artifact;
  let fileName = `${artifact}.ttl`;

  if (artifact.endsWith('.context.jsonld')) {
    namespaceName = artifact.replace(/\.context\.jsonld$/, '');
    fileName = `${namespaceName}.context.jsonld`;
  } else if (artifact.endsWith('.shape')) {
    namespaceName = artifact.replace(/\.shape$/, '');
    fileName = `${namespaceName}.shape.ttl`;
  }

  const candidates = [
    join(root, namespaceName, fileName),
    join(root, 'modules', namespaceName, fileName),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function getArtifactContentType(artifact: string): string {
  return artifact.endsWith('.jsonld')
    ? 'application/ld+json; charset=utf-8'
    : 'text/turtle; charset=utf-8';
}

export function getStaticPaths() {
  return TECHNICAL_REPORTS.flatMap((report) =>
    discoverArtifacts(report.slug).map((artifact) => ({
      params: { report: report.slug, artifact },
    }))
  );
}

export const GET: APIRoute = async ({ params }) => {
  const reportSlug = params.report;
  const artifact = params.artifact;

  if (!reportSlug || !artifact || !getTechnicalReport(reportSlug)) {
    return new Response('Not found', { status: 404 });
  }

  if (artifact === 'context.jsonld') {
    return createJsonResponse({
      '@context': BASELINE_CONTEXT_ARTIFACTS.map(
        (contextArtifact) => `${SPEC_BASE_URL}/tr/${reportSlug}/ns/${contextArtifact}`
      ),
    });
  }

  const sourcePath = findArtifactSource(reportSlug, artifact);
  if (!sourcePath) return new Response('Not found', { status: 404 });

  const fileContent = await fsPromises.readFile(sourcePath, 'utf-8');
  const responseBody = rewriteCanonicalSpecBaseUrl(fileContent, SPEC_BASE_URL);

  return new Response(responseBody, {
    headers: {
      'Content-Type': getArtifactContentType(artifact),
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
