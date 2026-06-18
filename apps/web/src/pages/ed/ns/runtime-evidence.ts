import { createArtifactHandler } from '../../../lib/spec-artifacts';

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/modules/runtime-evidence/runtime-evidence.ttl',
  'text/turtle; charset=utf-8'
);
