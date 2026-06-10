import type { SpecWorkspaceKey } from './load';

export interface TechnicalReport {
  slug: string;
  title: string;
  status: string;
  published: string;
  workspace: SpecWorkspaceKey;
  basePath: string;
}

export const TECHNICAL_REPORTS = [
  {
    slug: '2026.06',
    title: 'First Editors\u2019 Draft',
    status: 'Draft',
    published: '2026-06-10',
    workspace: 'tr-2026-06',
    basePath: '/tr/2026.06',
  },
] as const satisfies readonly TechnicalReport[];

export const BASELINE_CONTEXT_ARTIFACTS = [
  'core.context.jsonld',
  'graph.context.jsonld',
  'runtime.context.jsonld',
  'experience.context.jsonld',
] as const;

export function getTechnicalReport(slug: string): TechnicalReport | undefined {
  return TECHNICAL_REPORTS.find((report) => report.slug === slug);
}
