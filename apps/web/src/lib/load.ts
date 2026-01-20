import fs from "node:fs";
import path from "node:path";
import {
    SpeculatorPipeline,
    corePlugins,
    NodeFileProvider,
    sortEntriesByDeps,
    type Document,
    type SortResult
} from "@openuji/speculator";

const specRoot = path.resolve(process.cwd(), "../../specs/ed");

export const listSortedSpecs = async (): Promise<SortResult> => {

    if (!fs.existsSync(specRoot)) {
        throw new Error("Specs directory not found");
    }

    const fileProvider = new NodeFileProvider();

    const specs = fs
        .readdirSync(specRoot, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    const sortedEntries = await sortEntriesByDeps(specs.map((spec) => ({ entry: path.join(specRoot, `${spec}/index.md`) })), fileProvider);

    return sortedEntries;
};


export const loadDocuments = async () => {
    const fileProvider = new NodeFileProvider();

    const pipeline = new SpeculatorPipeline(corePlugins);
    const sortedEntries = await listSortedSpecs();

    const result = await pipeline.runWorkspace({
        entries: sortedEntries.entries,
        fileProvider,
    });

    const docs: Record<string, Document> = {};
    sortedEntries.entries.forEach((spec, index) => {
        if (!result.workspace?.documents[index]) {
            throw new Error(`Document ${spec.entry} not found`);
        }
        docs[spec.config.id] = result.workspace?.documents[index];
    });

    return docs;
}

export const loadDocument = async (spec: string) => {
    const docs = await loadDocuments();
    return docs[spec];
}