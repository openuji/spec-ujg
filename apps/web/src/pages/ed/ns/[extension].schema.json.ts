import type { APIRoute } from 'astro';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createArtifactHandler,
  getSpecBaseUrl,
  rewriteCanonicalSpecBaseUrl,
} from '../../../lib/spec-artifacts';

interface SchemaStaticPath {
  params: {
    extension: string;
  };
  props: {
    relativeSpecPath: string;
  };
}

interface SchemaRouteProps {
  relativeSpecPath: string;
}

const EXTENSIONS_DIRECTORY = fileURLToPath(
  new URL('../../../../../../specs/ed/extensions/', import.meta.url)
);
const SPEC_BASE_URL = getSpecBaseUrl(import.meta.env.SPEC_BASE_URL);

async function shouldPublishExtensionSchema(extensionName: string): Promise<boolean> {
  if (import.meta.env.PUBLISH_UJG_EXTENSIONS !== 'true') {
    try {
      const configContent = await readFile(
        join(EXTENSIONS_DIRECTORY, extensionName, 'config.json'),
        'utf-8'
      );
      const config = JSON.parse(configContent) as { custom?: { publish?: unknown } };

      return config.custom?.publish === true;
    } catch {
      return false;
    }
  }

  return true;
}

export async function getStaticPaths() {
  const entries = await readdir(EXTENSIONS_DIRECTORY, { withFileTypes: true });
  const staticPaths = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry): Promise<SchemaStaticPath | null> => {
        if (!(await shouldPublishExtensionSchema(entry.name))) {
          return null;
        }

        const schemaFilename = `${entry.name}.schema.json`;

        try {
          await access(join(EXTENSIONS_DIRECTORY, entry.name, schemaFilename));
        } catch {
          return null;
        }

        return {
          params: {
            extension: entry.name,
          },
          props: {
            relativeSpecPath: `../../../../../../specs/ed/extensions/${entry.name}/${schemaFilename}`,
          },
        };
      })
  );

  return staticPaths.filter((staticPath): staticPath is SchemaStaticPath => staticPath !== null);
}

export const GET: APIRoute = async ({ props }) => {
  const { relativeSpecPath } = props as SchemaRouteProps;
  const handler = createArtifactHandler(
    import.meta.url,
    relativeSpecPath,
    'application/schema+json; charset=utf-8',
    (fileContent) => rewriteCanonicalSpecBaseUrl(fileContent, SPEC_BASE_URL)
  );

  return handler();
};
