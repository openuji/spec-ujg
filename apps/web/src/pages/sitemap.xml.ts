import type { APIRoute } from 'astro';

import { getDocuments } from '@/lib/load';
import { CANONICAL_SPEC_BASE_URL } from '@/lib/spec-artifacts';
import { TOP_LEVEL_CONTENT_PAGES } from '@/lib/static-pages';

const staticAstroPageModules = import.meta.glob('./**/*.astro', { eager: true });

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function canonicalUrl(pathname: string): string {
  return new URL(pathname, CANONICAL_SPEC_BASE_URL).toString();
}

function routePathFromStaticAstroPage(filePath: string): string | undefined {
  if (filePath.includes('[')) return undefined;

  const routePath = filePath
    .replace(/^\.\//, '/')
    .replace(/\.astro$/, '')
    .replace(/\/index$/, '');

  if (routePath === '/404') return undefined;
  return routePath || '/';
}

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths)];
}

function sortPaths(paths: string[]): string[] {
  return [...paths].sort((left, right) => {
    if (left === '/') return -1;
    if (right === '/') return 1;
    return left.localeCompare(right);
  });
}

export const GET: APIRoute = async () => {
  const documents = await getDocuments('ed');
  const staticAstroPaths = Object.keys(staticAstroPageModules)
    .map(routePathFromStaticAstroPage)
    .filter((pathname): pathname is string => pathname !== undefined);
  const topLevelContentPaths = TOP_LEVEL_CONTENT_PAGES.map((page) => `/${page.slug}`);
  const paths = sortPaths(
    uniquePaths([
      ...staticAstroPaths,
      ...topLevelContentPaths,
      ...documents.map((document) => `/ed/${document.id}`),
    ])
  );

  const urls = paths
    .map((pathname) => `  <url><loc>${escapeXml(canonicalUrl(pathname))}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    }
  );
};
