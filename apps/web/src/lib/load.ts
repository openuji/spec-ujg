import { readFileSync } from 'node:fs';
import { type Document } from '@openuji/speculator';

import { buildWorkspaces } from '@openuji/speculator';

export type EditorDraftDocumentFamily = 'spec' | 'module' | 'extension';
export type SpecWorkspaceKey = 'ed';

export const WORKSPACE_CONFIG: Record<
  SpecWorkspaceKey,
  { title: string; basePath: string; label: string }
> = {
  ed: {
    title: "Editor's Draft",
    basePath: '/ed',
    label: 'ED',
  },
};

const FAMILY_ORDER: Record<EditorDraftDocumentFamily, number> = {
  spec: 0,
  module: 1,
  extension: 2,
};

function getDocumentCustom(doc: Document): Record<string, unknown> {
  const custom = doc.metadata?.custom;
  return custom && typeof custom === 'object' ? (custom as Record<string, unknown>) : {};
}

export function getDocumentFamily(doc: Document): EditorDraftDocumentFamily {
  const family = getDocumentCustom(doc).family;
  if (family === 'module') return 'module';
  if (family === 'extension') return 'extension';
  return 'spec';
}

function shouldPublishDocument(doc: Document): boolean {
  if (getDocumentFamily(doc) !== 'extension') return true;
  return (
    import.meta.env.PUBLISH_UJG_EXTENSIONS === 'true' || getDocumentCustom(doc).publish === true
  );
}

export function getDocumentOrder(doc: Document): number {
  const order = Number(getDocumentCustom(doc).order);
  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
}

export function getWorkspaceConfig(workspace: SpecWorkspaceKey) {
  return WORKSPACE_CONFIG[workspace];
}

function compareDocuments(left: Document, right: Document): number {
  const familyDiff = FAMILY_ORDER[getDocumentFamily(left)] - FAMILY_ORDER[getDocumentFamily(right)];
  if (familyDiff !== 0) return familyDiff;

  const orderDiff = getDocumentOrder(left) - getDocumentOrder(right);
  if (orderDiff !== 0) return orderDiff;

  return (left.metadata?.title || left.id).localeCompare(right.metadata?.title || right.id);
}

export const getDocuments = async (workspace: SpecWorkspaceKey = 'ed'): Promise<Document[]> => {
  const workspaceContent = readFileSync('ujg.workspace.json', 'utf-8');
  const entryMap = JSON.parse(workspaceContent);

  const result = await buildWorkspaces({ entryMap, env: import.meta.env });
  if (result.errors.length > 0) {
    console.error('Errors building workspaces:', result.errors);
  }
  return [...(result.workspaces[workspace]?.documents || [])]
    .filter(shouldPublishDocument)
    .sort(compareDocuments);
};

export const loadDocument = async (spec: string, workspace: SpecWorkspaceKey = 'ed') => {
  const docs = await getDocuments(workspace);
  return docs.find((doc: Document) => doc.id === spec);
};
