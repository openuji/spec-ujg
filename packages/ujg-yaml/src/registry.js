export const SECTION_REGISTRY = {
  touchpoints: { type: 'Touchpoint', collection: 'map' },
  actors: { type: 'Actor', collection: 'map' },
  artifacts: { type: 'DistributedArtifact', collection: 'map' },
  actions: { type: 'Action', collection: 'map' },
  states: { type: 'State', collection: 'map' },
  journeyEntryIndex: { type: 'JourneyEntryIndex', collection: 'single' },
  messageBundle: { type: 'MessageBundle', collection: 'map' },
  resolvers: { type: 'SurfaceInstanceResolver', collection: 'map' },
  observationBindings: { type: 'ObservationBinding', collection: 'map' },
  phases: { type: 'Phase', collection: 'map' },
  experienceSteps: { type: 'ExperienceStep', collection: 'map' },
  journey: { type: 'Journey', collection: 'legacy-single' },
};

export const ACCESSIBLE_REGISTRY = {
  features: 'AccessibleFeature',
  relations: 'AccessibleRelation',
  locators: 'AccessibleLocator',
};

export const TYPE_TO_SECTION = {
  Touchpoint: 'touchpoints',
  Actor: 'actors',
  Artifact: 'artifacts',
  DistributedArtifact: 'artifacts',
  Action: 'actions',
  JourneyEntryIndex: 'journeyEntryIndex',
  State: 'states',
  CompositeState: 'states',
  MessageBundle: 'messageBundle',
  SurfaceInstanceResolver: 'resolvers',
  ObservationBinding: 'observationBindings',
  Phase: 'phases',
  ExperienceStep: 'experienceSteps',
};

export const ACCESSIBLE_TYPE_TO_SECTION = {
  AccessibleFeature: 'features',
  AccessibleRelation: 'relations',
  AccessibleLocator: 'locators',
  CustomLocator: 'locators',
};

export const EXTENSION_RULES = {
  sampleScreenRef: 'https://openuji.org/ujg-yaml/extensions#sampleScreenRef',
};

export const STRUCTURAL_KEYS = new Set([
  'entries',
  'states',
  'transitions',
  'exits',
  'outgoingTransitionGroups',
  'outgoingTransitions',
  'subjourney',
  'surface',
]);

export const ALLOWED_TOP_LEVEL_KEYS = new Set([
  'ujgTarget',
  'id',
  '@id',
  'nodes',
  ...Object.keys(SECTION_REGISTRY),
  'accessible',
]);

export const PROPERTY_ORDER = [
  '@id',
  '@type',
  '@context',
  'imports',
  'nodes',
  'label',
  'tags',
  'defaultEntryRef',
  'entryRefs',
  'stateRef',
  'stateRefs',
  'transitionRefs',
  'exitRefs',
  'outgoingTransitionGroupRefs',
  'from',
  'to',
  'fromExitRef',
  'toEntryRef',
  'toCurrentState',
  'subjourneyId',
  'outgoingTransitionRefs',
  'subjectActorRef',
  'graphNodeRef',
  'touchpointRef',
  'surfaceRef',
  'surfaceRefs',
  'phaseRef',
  'order',
  'channel',
  'origin',
  'actionRef',
  'producedArtifactRefs',
  'consumedArtifactRefs',
  'sourceTouchpointRef',
  'targetTouchpointRefs',
  'namespace',
  'messageKey',
  'defaultLocale',
  'fallbackLocales',
  'rtl',
  'locales',
  'targetLocale',
  'observeSurfaceRef',
  'observationEventRef',
  'locatorRefs',
  'surfaceInstanceResolverRef',
  'instanceKeyFeatureRef',
  'role',
  'accessibleNameRef',
  'accessibleDescriptionRef',
  'accessibleFeatureRefs',
  'accessibleRelationRefs',
  'contextLocatorRefs',
  'accessibleFeatureName',
  'accessibleFeatureValue',
  'accessibleRelationType',
  'targetLocatorRef',
  'conditionRef',
  'conditionTransitionRefs',
  'routeRef',
  'fallbackNodeRef',
  'routeName',
  'path',
  'deepLink',
  'guards',
  'params',
  'executionId',
  'previousId',
  'surfaceInstanceRef',
  'payload',
  'mappedJourneyRef',
  'mappedRuntimeRef',
  'mappedStepRef',
  'mappedEventRef',
  'observedAffordanceEventRef',
  'mappedStateRef',
  'explainedByTransitionRef',
  'experienceRefs',
  'severity',
  'description',
  'extensions',
];

const SYNTHESIZED_CANONICAL_PROPERTIES = [
  'subjourneyId',
  'entryRefs',
  'stateRefs',
  'transitionRefs',
  'exitRefs',
  'outgoingTransitionGroupRefs',
  'graphNodeRef',
  'from',
];

const EXTENSION_NAMESPACE = 'https://openuji.org/ujg-yaml/extensions#';

export function projectionRegistryDiagnostics(vocabulary) {
  const diagnostics = [];

  for (const [sectionName, section] of Object.entries(SECTION_REGISTRY)) {
    if (!vocabulary.classes?.[section.type]) {
      diagnostics.push(`Section "${sectionName}" references missing class "${section.type}".`);
    }
  }

  for (const [type, sectionName] of Object.entries(TYPE_TO_SECTION)) {
    if (!vocabulary.classes?.[type]) {
      diagnostics.push(`Projection type "${type}" references a missing target class.`);
    }
    if (!SECTION_REGISTRY[sectionName]) {
      diagnostics.push(`Projection type "${type}" maps to unknown section "${sectionName}".`);
    }
  }

  for (const [sectionName, type] of Object.entries(ACCESSIBLE_REGISTRY)) {
    if (!vocabulary.classes?.[type]) {
      diagnostics.push(`Accessible section "${sectionName}" references missing class "${type}".`);
    }
  }

  for (const [type, sectionName] of Object.entries(ACCESSIBLE_TYPE_TO_SECTION)) {
    if (!vocabulary.classes?.[type]) {
      diagnostics.push(`Accessible projection type "${type}" references a missing target class.`);
    }
    if (!ACCESSIBLE_REGISTRY[sectionName]) {
      diagnostics.push(`Accessible projection type "${type}" maps to unknown section "${sectionName}".`);
    }
  }

  for (const property of SYNTHESIZED_CANONICAL_PROPERTIES) {
    if (!vocabulary.properties?.[property]) {
      diagnostics.push(`Structural lifting synthesizes missing property "${property}".`);
    }
  }

  for (const [property, iri] of Object.entries(EXTENSION_RULES)) {
    if (!iri.startsWith(EXTENSION_NAMESPACE)) {
      diagnostics.push(`Extension "${property}" must stay under ${EXTENSION_NAMESPACE}.`);
    }
  }

  return diagnostics;
}
