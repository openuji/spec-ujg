import type { SpecWorkspaceKey } from './load';

export interface TechnicalReport {
  slug: string;
  title: string;
  status: string;
  published: string;
  workspace: SpecWorkspaceKey;
  basePath: string;
  namespaceSlug?: string;
}

export const TECHNICAL_REPORTS = [
  {
    slug: '1.0-rc3',
    title: 'UJG 1.0 Release Candidate 3',
    status: 'Release Candidate',
    published: '2026-11-09',
    workspace: 'tr-1-0-rc3',
    basePath: '/tr/1.0-rc3',
  },
  {
    slug: '1.0-rc2',
    title: 'UJG 1.0 Release Candidate 2',
    status: 'Release Candidate',
    published: '2026-09-11',
    workspace: 'tr-1-0-rc2',
    basePath: '/tr/1.0-rc2',
  },
  {
    slug: '1.0-rc1',
    title: 'UJG 1.0 Release Candidate 1',
    status: 'Release Candidate',
    published: '2026-07-27',
    workspace: 'tr-1-0-rc1',
    basePath: '/tr/1.0-rc1',
  },
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

export function shouldRenderTechnicalReportRoutes(): boolean {
  return process.env.UJG_RENDER_TR_ROUTES === '1';
}

export function getTechnicalReport(slug: string): TechnicalReport | undefined {
  return TECHNICAL_REPORTS.find((report) => report.slug === slug);
}

export function getTechnicalReportByNamespaceSlug(slug: string): TechnicalReport | undefined {
  return TECHNICAL_REPORTS.find(
    (report: TechnicalReport) =>
      report.slug === slug || (report.namespaceSlug ?? report.slug) === slug
  );
}
