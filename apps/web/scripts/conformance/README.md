# ED conformance development tools

The web package owns the example renderer's loader, vocabulary and example checks, and the
development conformance harness. Its tests and independent expected fixtures are colocated in
`tests/` beside these tools.

Install the JavaScript dependencies with `pnpm install`. From the repository root, prepare the
pinned Python environment and run the checks:

```sh
pnpm --filter @openuji/web conformance:setup
pnpm --filter @openuji/web vocabulary:check
pnpm --filter @openuji/web conformance:test
pnpm --filter @openuji/web examples:check
```

`UJG_SHACL_PYTHON` can select an existing Python environment containing the versions in
`requirements.txt`. Tests fail with setup instructions if the SHACL runner is unavailable; they do
not silently skip SPARQL constraints. Contexts and ontologies are read from the local ED; validation
and documentation checks do not fetch deployed contexts or example URLs.

Setup creates `apps/web/scripts/conformance/.venv/`. Ordinary documentation rendering uses the
example loader without invoking Python or SHACL. Root-level check commands delegate to this package;
from `apps/web`, the commands can also be run directly without `--filter @openuji/web`.

The processor keeps canonical source locations, semantic identities, and source membership separate.
Its authored RDF contains `core:nodes`; source-scoped derived `core:members` graphs are supplied only
to the validator. Import values are normalized against source location before ordinary JSON-LD
expansion. A caller supplies HTTP resources and redirect destinations through `loadResource`.
External artifact fields remain reference-only and follow their module's declared resolution base.
The tools check source rules, declared extension schemas, and shipped SHACL constraints. Module
integrity algorithms not encoded in these artifacts remain module-level implementation obligations.

Examples are YAML source files beside each spec, with explicit `.example.json` metadata. Complete
documents receive source and SHACL checks. Fragments use an explicit context/root harness for
interpretation; they do not claim standalone document conformance. Context examples and opaque JSON
or JSON Schema examples are distinguished from modeled node definitions. JSON tabs are generated in
memory from the same YAML. Independent expected RDF and membership fixtures live under
`apps/web/scripts/conformance/tests`.

The term catalog is maintained with `pnpm --filter @openuji/web vocabulary:update` and checked
against all contexts, ontologies, shape paths, and SPARQL property names. This command does not
translate old vocabularies or documents.
