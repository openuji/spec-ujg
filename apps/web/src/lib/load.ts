import { readFileSync } from 'node:fs';
import { type Document } from '@openuji/speculator';

import { buildWorkspaces } from '@openuji/speculator';

export const getDocuments = async (): Promise<Document[]> => {
  const workspaceContent = readFileSync('ujg.workspace.json', 'utf-8');
  const entryMap = JSON.parse(workspaceContent);

  console.log('DEBUG: SPEC_BASE_URL from import.meta.env:', import.meta.env.SPEC_BASE_URL);
  const result = await buildWorkspaces({ entryMap, env: import.meta.env });

  return result.workspaces.ed.documents;
};

export const loadDocument = async (spec: string) => {
  const docs = await getDocuments();
  return docs.find((doc: Document) => doc.id === spec);
};
