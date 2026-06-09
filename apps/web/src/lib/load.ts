import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { type Document } from '@openuji/speculator';

import { buildWorkspaces } from '@openuji/speculator';

export type EditorDraftDocumentFamily = 'spec' | 'module';
export type SpecWorkspaceKey = 'ed' | 'tr-2026-06';

export const WORKSPACE_CONFIG: Record<
  SpecWorkspaceKey,
  { title: string; basePath: string; label: string }
> = {
  ed: {
    title: "Editor's Draft",
    basePath: '/ed',
    label: 'ED',
  },
  'tr-2026-06': {
    title: 'First Editors\u2019 Draft',
    basePath: '/tr/2026.06',
    label: '2026.06',
  },
};

const FAMILY_ORDER: Record<EditorDraftDocumentFamily, number> = {
  spec: 0,
  module: 1,
};

function getDocumentCustom(doc: Document): Record<string, unknown> {
  const custom = doc.metadata?.custom;
  return custom && typeof custom === 'object' ? (custom as Record<string, unknown>) : {};
}

export function getDocumentFamily(doc: Document): EditorDraftDocumentFamily {
  const family = getDocumentCustom(doc).family;
  if (family === 'module') return 'module';
  return 'spec';
}

function shouldPublishDocument(doc: Document): boolean {
  return getDocumentFamily(doc) === 'spec' || getDocumentFamily(doc) === 'module';
}

export function getDocumentOrder(doc: Document): number {
  const order = Number(getDocumentCustom(doc).order);
  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
}

export function getDocumentModuleLevel(doc: Document): number {
  if (getDocumentFamily(doc) !== 'module') return 0;
  const moduleLevel = Number(getDocumentCustom(doc).moduleLevel);
  return Number.isFinite(moduleLevel) ? moduleLevel : 1;
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

function applyContentManifest(doc: Document): Document {
  const documentPath = doc.sourcePos?.file;
  if (!documentPath) {
    throw new Error(`Document "${doc.id}" does not have a source file`);
  }

  const manifestPath = join(dirname(documentPath), 'content-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { updatedAt?: unknown };
  if (typeof manifest.updatedAt !== 'string') {
    throw new Error(`${manifestPath} does not contain a valid updatedAt timestamp`);
  }

  doc.metadata ??= {};
  doc.metadata.lastUpdateDate = new Date(manifest.updatedAt).toISOString().slice(0, 10);
  return doc;
}

export const getDocuments = async (workspace: SpecWorkspaceKey = 'ed'): Promise<Document[]> => {
  const workspaceContent = readFileSync('ujg.workspace.json', 'utf-8');
  const entryMap = JSON.parse(workspaceContent);

  const result = await buildWorkspaces({ entryMap, env: import.meta.env });
  if (result.errors.length > 0) {
    console.error('Errors building workspaces:', result.errors);
  }
  return [...(result.workspaces[workspace]?.documents || [])]
    .map(applyContentManifest)
    .filter(shouldPublishDocument)
    .sort(compareDocuments);
};

export const loadDocument = async (spec: string, workspace: SpecWorkspaceKey = 'ed') => {
  const docs = await getDocuments(workspace);
  return docs.find((doc: Document) => doc.id === spec);
};
