import { createArtifactHandler } from '../../../lib/spec-artifacts';

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/modules/evidence/evidence.ttl',
  'text/turtle; charset=utf-8'
);
