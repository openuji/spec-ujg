import { createArtifactHandler } from '../../../lib/spec-artifacts';

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/modules/state-data/state-data.shape.ttl',
  'text/turtle; charset=utf-8'
);
