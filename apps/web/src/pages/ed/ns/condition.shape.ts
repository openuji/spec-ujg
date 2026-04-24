import { createArtifactHandler } from '../../../lib/spec-artifacts';

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/modules/condition/condition.shape.ttl',
  'text/turtle; charset=utf-8'
);
