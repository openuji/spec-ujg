"""Evaluate current UJG shapes, retaining named source-membership graphs."""
import json
import sys
from pyshacl import validate
from rdflib import Dataset, Graph, URIRef
from rdflib.namespace import RDF, SH


def check(request):
    data = Dataset(default_union=True)
    # The authored UJG data graph is the semantic union; provenance stays in named graphs.
    authored = data.default_graph
    authored.parse(data=request['rdf'], format='nt')
    for source in request['sources']:
        scope = data.graph(URIRef(source['scope']))
        for member in source['members']:
            scope.add((URIRef(source['id']), URIRef(request['membersIri']), URIRef(member)))
    shapes = Graph()
    for filename in request['ontologies']:
        authored.parse(filename, format='turtle')
    for filename in request['shapes']:
        shapes.parse(filename, format='turtle')
    conforms, report, text = validate(data, shacl_graph=shapes, inference='none', advanced=True)
    diagnostics = []
    for result in report.subjects(RDF.type, SH.ValidationResult):
        diagnostics.append({
            'stage': 'shacl',
            'node': str(report.value(result, SH.focusNode) or ''),
            'property': str(report.value(result, SH.resultPath) or ''),
            'message': '; '.join(str(x) for x in report.objects(result, SH.resultMessage)),
        })
    return {'conforms': bool(conforms), 'diagnostics': diagnostics, 'report': text}


try:
    requests = json.load(sys.stdin)
    print(json.dumps([check(request) for request in requests]))
except Exception as exc:
    print(json.dumps({'error': f'{type(exc).__name__}: {exc}'}))
    sys.exit(1)
