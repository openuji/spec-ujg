import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const filePath = fileURLToPath(
  new URL('../../../../../../specs/ed/core/core.shape.ttl', import.meta.url)
);

export const GET: APIRoute = async () => {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');

    return new Response(fileContent, {
      headers: {
        'Content-Type': 'text/turtle; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
