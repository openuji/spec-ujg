import { createArtifactHandler } from '../../../lib/spec-artifacts';

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/modules/distributed-journey/distributed-journey.shape.ttl',
  'text/turtle; charset=utf-8'
);
