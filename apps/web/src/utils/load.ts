import fs from "node:fs";
import path from "node:path";
import {
    SpeculatorPipeline,
    corePlugins,
    NodeFileProvider,
    type Document,
} from "@openuji/speculator";

const specRoot = path.resolve(process.cwd(), "../../specs/ed");

export const listSpecs = () => {

    if (!fs.existsSync(specRoot)) {
        return [];
    }

    const specs = fs
        .readdirSync(specRoot, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    return specs;
};


export const loadDocuments = async () => {
    const fileProvider = new NodeFileProvider();

    const pipeline = new SpeculatorPipeline(corePlugins);
    const specs = listSpecs();
    const result = await pipeline.runWorkspace({
        entries: specs.map((spec) => ({ entry: path.join(specRoot, `${spec}/index.md`) })),
        fileProvider,
    });

    const docs: Record<string, Document> = {};
    specs.forEach((spec, index) => {
        if (!result.workspace?.documents[index]) {
            throw new Error(`Document ${spec} not found`);
        }
        docs[spec] = result.workspace?.documents[index];
    });

    return docs;
}

export const loadDocument = async (spec: string) => {
    const docs = await loadDocuments();
    return docs[spec];
}