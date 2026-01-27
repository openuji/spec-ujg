import { readFileSync } from "node:fs";
import {
    type Document,
} from "@openuji/speculator";

import { buildWorkspaces } from "@openuji/speculator";

const workspaceContent = readFileSync('ujg.workspace.json', 'utf-8');
const workspaceConfig = JSON.parse(workspaceContent);

const result = await buildWorkspaces(workspaceConfig);

export const getDocuments = async (): Promise<Document[]> => {
    return result.workspaces.ed.documents;
}

export const loadDocument = async (spec: string) => {
    const docs = await result.workspaces.ed.documents;
    return docs.find((doc: Document) => doc.id === spec);
}