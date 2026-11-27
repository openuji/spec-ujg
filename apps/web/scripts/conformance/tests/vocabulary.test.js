import test from 'node:test';
import assert from 'node:assert/strict';
import jsonld from 'jsonld';
import { ED, loadCatalog } from '../processor.js';
import { checkVocabulary } from '../vocabulary.js';

// This contract is intentionally independent of the context and catalog generators.
const expected = {
  core: 'imports nodes members extensions',
  graph:
    'label tags defaultEntry entries state states transitions exits from to fromExit toEntry command subjourneys entryTransitions memberState memberTransitions entrySelector candidateJourneys',
  surface: 'graphNode surface touchpoints journeys channel',
  runtime: 'execution previousEvent surfaceInstance payload',
  mapping:
    'mappedJourney mappedRuntime mappedSteps mappedEvent observedAffordanceEvent mappedState explainedByTransition',
  metrics:
    'metricSubject metricKey metricValue metricUnit numeratorCount denominatorCount aggregationMethod sourceMapping',
  'modules/artifact': 'name sourceTouchpoint targetTouchpoints',
  'modules/condition': 'condition conditionTransitions',
  'modules/data-contract': 'dataSchemaSource dataSurface dataSchema',
  'modules/design-system':
    'tokenSources source materializedSurface component template slotBindings slots slot targetSurface',
  'modules/effect': 'effect producedResources consumedResources',
  'modules/entry-binding': 'entry bindingValue',
  'modules/experience-annotation': 'painpointSteps severity description',
  'modules/l10n':
    'copy localeCode argumentNames defaultLocale fallbackLocales rtl messageMeta locale messageValue targetLocale',
  'modules/observability':
    'observeSurface observationEvent requiredInputModalityProfiles inputModalities locators surfaceInstanceResolver expectedMatchCount instanceKeyFeature role accessibleName accessibleDescription accessibleFeatures accessibleRelations contextLocators accessibleFeatureName accessibleFeatureValue accessibleRelationType targetLocator',
  'modules/operability':
    'materializationTransition materializationModality materializationSteps materializationStartLocator materializationSourceState materializationDirection previousStep stepLocator stepMoveKind',
  'modules/phase': 'compositeState phase order',
};
const literalTerms = new Set(
  'label tags channel payload extensions metricKey metricValue metricUnit numeratorCount denominatorCount aggregationMethod bindingValue severity description localeCode argumentNames rtl messageValue expectedMatchCount role accessibleFeatureName accessibleFeatureValue accessibleRelationType order nodes'.split(
    ' '
  )
);
const sets = new Set(
  'imports nodes members tags entries states transitions exits subjourneys entryTransitions memberTransitions candidateJourneys touchpoints journeys mappedSteps targetTouchpoints conditionTransitions tokenSources slotBindings slots producedResources consumedResources painpointSteps argumentNames fallbackLocales requiredInputModalityProfiles inputModalities locators accessibleFeatures accessibleRelations contextLocators materializationSteps'.split(
    ' '
  )
);
const typed = {
  numeratorCount: 'nonNegativeInteger',
  denominatorCount: 'nonNegativeInteger',
  expectedMatchCount: 'nonNegativeInteger',
  order: 'integer',
  severity: 'decimal',
  localeCode: 'language',
};

test('all 112 canonical property names, IRIs, coercions, and containers match the independent contract', async () => {
  const catalog = await loadCatalog();
  const actual = await checkVocabulary();
  const all = [...catalog.contexts.values()]
    .map((d) => d['@context'])
    .filter((c) => !Array.isArray(c));
  assert.equal(
    actual.length,
    Object.values(expected).reduce((n, terms) => n + terms.split(' ').length, 0)
  );
  for (const [module, terms] of Object.entries(expected)) {
    const namespace = `${ED}${module.replace('modules/', '')}#`;
    assert.deepEqual(
      actual
        .filter((t) => t.module === module)
        .map((t) => t.term)
        .sort(),
      terms.split(' ').sort()
    );
    for (const term of terms.split(' ')) {
      const contract = actual.find((t) => t.module === module && t.term === term);
      assert.equal(contract.iri, namespace + term);
      assert.deepEqual(contract.container || [], sets.has(term) ? ['@set'] : [], term);
      let value = literalTerms.has(term) ? 'a value' : 'urn:target';
      if (term === 'nodes') value = { id: 'urn:target', type: 'Node' };
      if (['payload', 'extensions'].includes(term))
        value = { 'com.example': { id: 'opaque', stateRef: 'opaque key' } };
      if (term === 'rtl') value = true;
      if (term in typed) value = term === 'localeCode' ? 'en' : term === 'severity' ? 0.5 : 5;
      const [expanded] = await jsonld.expand({
        '@context': all,
        id: 'urn:subject',
        [term]: sets.has(term) ? [value] : value,
      });
      const result = expanded[namespace + term][0];
      if (!literalTerms.has(term) || term === 'nodes')
        assert.equal(result['@id'], 'urn:target', term);
      else {
        assert.deepEqual(result['@value'], value, term);
        if (term in typed)
          assert.equal(result['@type'], `http://www.w3.org/2001/XMLSchema#${typed[term]}`);
        if (['payload', 'extensions'].includes(term)) assert.equal(result['@type'], '@json');
      }
    }
  }
});

test('the two Surface relationships and the two value properties remain unambiguous in either context order', async () => {
  const catalog = await loadCatalog();
  const contexts = [...catalog.contexts.values()]
    .map((d) => d['@context'])
    .filter((c) => !Array.isArray(c));
  const data = {
    id: 'urn:subject',
    surface: 'urn:instance-surface',
    materializedSurface: 'urn:materialized-surface',
    bindingValue: 'binding',
    messageValue: 'message',
  };
  const expand = (context) => jsonld.expand({ '@context': context, ...data });
  assert.deepEqual(await expand(contexts), await expand(contexts.toReversed()));
});
