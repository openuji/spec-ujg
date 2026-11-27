import {
  createArtifactHandler,
  getSpecBaseUrl,
  rewriteCanonicalSpecBaseUrl,
} from '../../../lib/spec-artifacts';

const SPEC_BASE_URL = getSpecBaseUrl(import.meta.env.SPEC_BASE_URL);

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/authoring/terms.json',
  'application/json; charset=utf-8',
  (content) => rewriteCanonicalSpecBaseUrl(content, SPEC_BASE_URL)
);
