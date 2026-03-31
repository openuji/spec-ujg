import { createArtifactHandler } from '../../../lib/spec-artifacts';

const CANONICAL_SPEC_BASE_URL = 'https://ujg.specs.openuji.org';
const SPEC_BASE_URL = String(import.meta.env.SPEC_BASE_URL ?? CANONICAL_SPEC_BASE_URL).replace(
  /\/$/,
  ''
);

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/core/core.context.jsonld',
  'application/ld+json; charset=utf-8',
  (fileContent) => fileContent.replaceAll(CANONICAL_SPEC_BASE_URL, SPEC_BASE_URL)
);
