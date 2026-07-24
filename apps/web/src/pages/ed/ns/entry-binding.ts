import { createArtifactHandler } from '../../../lib/spec-artifacts';

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/modules/entry-binding/entry-binding.ttl',
  'text/turtle; charset=utf-8'
);
