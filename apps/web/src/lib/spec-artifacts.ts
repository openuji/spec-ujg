import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

function resolveSpecPath(importMetaUrl: string, relativeSpecPath: string): string {
  return fileURLToPath(new URL(relativeSpecPath, importMetaUrl));
}

export function createArtifactHandler(
  importMetaUrl: string,
  relativeSpecPath: string,
  contentType: string,
  transform?: (fileContent: string) => string | Promise<string>
): APIRoute {
  const filePath = resolveSpecPath(importMetaUrl, relativeSpecPath);

  return async () => {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const responseBody = transform ? await transform(fileContent) : fileContent;

      return new Response(responseBody, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  };
}

export async function readJsonArtifact(
  importMetaUrl: string,
  relativeSpecPath: string
): Promise<Record<string, unknown>> {
  const filePath = resolveSpecPath(importMetaUrl, relativeSpecPath);
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent) as Record<string, unknown>;
}

function valuesEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function mergeContextObjects(
  contexts: Array<Record<string, unknown>>
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  for (const context of contexts) {
    for (const [key, value] of Object.entries(context)) {
      if (!(key in merged)) {
        merged[key] = value;
        continue;
      }

      if (!valuesEqual(merged[key], value)) {
        throw new Error(`Conflicting JSON-LD context definition for key: ${key}`);
      }
    }
  }

  return merged;
}

export function createJsonResponse(data: unknown): Response {
  return new Response(`${JSON.stringify(data, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/ld+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
