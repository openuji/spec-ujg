import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { MarkdownInstance } from 'astro';
import { buildWorkspaces, MemoryFileProvider, type Document } from '@openuji/speculator';

export interface CaseStudyFrontmatter {
  title?: unknown;
  summary?: unknown;
  teaser?: unknown;
  tags?: unknown;
  heroImage?: unknown;
  cardImage?: unknown;
  vocabulary?: unknown;
}

export interface CaseStudyManifest {
  publishedAt: string;
  updatedAt: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
  teaser?: string;
  tags: string[];
  heroImage?: string;
  cardImage?: string;
  vocabulary: Record<string, string>;
  publishedAt: string;
  updatedAt: string;
  entryPath: string;
  document: Document;
}

type CaseStudyMetadata = Omit<CaseStudy, 'document'>;

const caseStudyModules = import.meta.glob<MarkdownInstance<CaseStudyFrontmatter>>(
  '../../../../specs/case-studies/*/index.md'
);

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '');
}

function asStringRecord(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string' && entry.trim() !== '') {
      result[key] = entry;
    }
  }
  return result;
}

function readManifest(entryPath: string): CaseStudyManifest {
  const directory = dirname(entryPath);
  const manifestUrl = new URL(`${directory}/content-manifest.json`, import.meta.url);
  const manifest = JSON.parse(readFileSync(fileURLToPath(manifestUrl), 'utf8')) as {
    publishedAt?: unknown;
    updatedAt?: unknown;
  };

  if (typeof manifest.publishedAt !== 'string' || typeof manifest.updatedAt !== 'string') {
    throw new Error(`${directory}/content-manifest.json must define publishedAt and updatedAt`);
  }

  return {
    publishedAt: manifest.publishedAt,
    updatedAt: manifest.updatedAt,
  };
}

function getSlug(entryPath: string): string {
  const match = entryPath.match(/\/case-studies\/([^/]+)\/index\.md$/);
  if (!match) {
    throw new Error(`Cannot derive case study slug from ${entryPath}`);
  }
  return match[1];
}

function readEntrySource(entryPath: string): { path: string; content: string } {
  const path = fileURLToPath(new URL(entryPath, import.meta.url));
  return {
    path,
    content: readFileSync(path, 'utf8'),
  };
}

function stripFrontmatter(source: string): string {
  const content = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;
  const frontmatter = content.match(/^---(?:\r?\n)[\s\S]*?(?:\r?\n)---(?:\r?\n|$)/);
  return frontmatter ? content.slice(frontmatter[0].length) : content;
}

function stripHtmlCommentsOutsideCode(source: string): string {
  const lines = source.split(/\r?\n/);
  const output: string[] = [];
  let inFence = false;
  let fenceChar = '';
  let fenceLength = 0;
  let inComment = false;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const fence = trimmed.match(/^(`{3,}|~{3,})/);

    if (!inComment && fence) {
      const marker = fence[1];
      if (!inFence) {
        inFence = true;
        fenceChar = marker[0];
        fenceLength = marker.length;
        output.push(line);
        continue;
      }

      if (marker[0] === fenceChar && marker.length >= fenceLength) {
        inFence = false;
        fenceChar = '';
        fenceLength = 0;
        output.push(line);
        continue;
      }
    }

    if (inFence) {
      output.push(line);
      continue;
    }

    let rest = line;
    let nextLine = '';

    while (rest.length > 0) {
      if (inComment) {
        const end = rest.indexOf('-->');
        if (end === -1) {
          rest = '';
          break;
        }
        rest = rest.slice(end + 3);
        inComment = false;
        continue;
      }

      const start = rest.indexOf('<!--');
      if (start === -1) {
        nextLine += rest;
        break;
      }

      nextLine += rest.slice(0, start);
      rest = rest.slice(start + 4);
      inComment = true;
    }

    output.push(nextLine);
  }

  return output.join('\n');
}

function prepareCaseStudyMarkdown(source: string): string {
  return stripHtmlCommentsOutsideCode(stripFrontmatter(source));
}

async function buildCaseStudyDocuments(
  studies: CaseStudyMetadata[]
): Promise<Map<string, Document>> {
  const files: Record<string, string> = {};
  const entries = studies.map((study) => {
    const source = readEntrySource(study.entryPath);
    const configPath = `${dirname(source.path)}/config.json`;

    files[source.path] = prepareCaseStudyMarkdown(source.content);
    files[configPath] = JSON.stringify({
      id: study.slug,
      title: study.title,
      custom: {
        family: 'case-study',
      },
    });

    return {
      entry: source.path,
      configPath,
    };
  });

  if (entries.length === 0) return new Map();

  const result = await buildWorkspaces({
    entryMap: {
      caseStudies: entries,
    },
    fileProvider: new MemoryFileProvider(files),
    env: import.meta.env,
  });

  if (result.errors.length > 0) {
    console.error('Errors building case study workspace:', result.errors);
  }

  return new Map(
    (result.workspaces.caseStudies?.documents || []).map((document) => [document.id, document])
  );
}

function buildCaseStudy(
  entryPath: string,
  post: MarkdownInstance<CaseStudyFrontmatter>
): CaseStudyMetadata {
  const slug = getSlug(entryPath);
  const { frontmatter } = post;
  const title = asOptionalString(frontmatter.title);
  const summary = asOptionalString(frontmatter.summary);

  if (!title) throw new Error(`Case study "${slug}" must define a title`);
  if (!summary) throw new Error(`Case study "${slug}" must define a summary`);

  const manifest = readManifest(entryPath);

  return {
    slug,
    title,
    summary,
    teaser: asOptionalString(frontmatter.teaser),
    tags: asStringArray(frontmatter.tags),
    heroImage: asOptionalString(frontmatter.heroImage),
    cardImage: asOptionalString(frontmatter.cardImage),
    vocabulary: asStringRecord(frontmatter.vocabulary),
    publishedAt: manifest.publishedAt,
    updatedAt: manifest.updatedAt,
    entryPath,
  };
}

function compareCaseStudies(left: CaseStudy, right: CaseStudy): number {
  const dateDiff = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  if (Number.isFinite(dateDiff) && dateDiff !== 0) return dateDiff;
  return left.title.localeCompare(right.title);
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const metadata = await Promise.all(
    Object.entries(caseStudyModules)
      .filter(([entryPath]) => !getSlug(entryPath).startsWith('_'))
      .map(async ([entryPath, loader]) => buildCaseStudy(entryPath, await loader()))
  );
  const documents = await buildCaseStudyDocuments(metadata);
  const studies = metadata.map((study) => {
    const document = documents.get(study.slug);
    if (!document) {
      throw new Error(`Case study "${study.slug}" could not be parsed`);
    }

    return {
      ...study,
      document,
    };
  });

  return studies.sort(compareCaseStudies);
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  const studies = await getCaseStudies();
  return studies.find((study) => study.slug === slug);
}
