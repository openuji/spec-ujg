import {
  createArtifactHandler,
  getSpecBaseUrl,
  rewriteCanonicalSpecBaseUrl,
} from '../../../lib/spec-artifacts';

const SPEC_BASE_URL = getSpecBaseUrl(import.meta.env.SPEC_BASE_URL);

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/extensions/domain-model/domain-model.schema.json',
  'application/schema+json; charset=utf-8',
  (fileContent) => rewriteCanonicalSpecBaseUrl(fileContent, SPEC_BASE_URL)
);
