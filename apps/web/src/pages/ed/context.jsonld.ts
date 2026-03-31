import type { APIRoute } from 'astro';

import { createJsonResponse } from '../../lib/spec-artifacts';

const CANONICAL_SPEC_BASE_URL = 'https://ujg.specs.openuji.org';
const SPEC_BASE_URL = String(import.meta.env.SPEC_BASE_URL ?? CANONICAL_SPEC_BASE_URL).replace(
  /\/$/,
  ''
);

export const GET: APIRoute = async () => {
  return createJsonResponse({
    '@context': [
      `${SPEC_BASE_URL}/ed/ns/core.context.jsonld`,
      `${SPEC_BASE_URL}/ed/ns/graph.context.jsonld`,
      `${SPEC_BASE_URL}/ed/ns/runtime.context.jsonld`,
      `${SPEC_BASE_URL}/ed/ns/experience.context.jsonld`,
    ],
  });
};
