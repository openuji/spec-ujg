import { createArtifactHandler } from '../../../lib/spec-artifacts';

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/modules/domain-requirements/domain-requirements.ttl',
  'text/turtle; charset=utf-8'
);
