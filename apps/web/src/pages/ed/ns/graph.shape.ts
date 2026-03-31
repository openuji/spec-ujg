import { createArtifactHandler } from '../../../lib/spec-artifacts';

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/graph/graph.shape.ttl',
  'text/turtle; charset=utf-8'
);
