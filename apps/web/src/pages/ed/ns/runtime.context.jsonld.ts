import { createArtifactHandler } from '../../../lib/spec-artifacts';

export const GET = createArtifactHandler(
  import.meta.url,
  '../../../../../../specs/ed/runtime/runtime.context.jsonld',
  'application/ld+json; charset=utf-8'
);
