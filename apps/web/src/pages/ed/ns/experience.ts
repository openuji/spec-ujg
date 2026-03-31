import { createArtifactHandler } from '../../../lib/spec-artifacts';

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/experience/experience.ttl',
  'text/turtle; charset=utf-8'
);
