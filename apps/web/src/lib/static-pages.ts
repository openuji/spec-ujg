export interface TopLevelContentPage {
  slug: string;
  fileName: string;
  title: string;
  toc?: boolean;
}

export const TOP_LEVEL_CONTENT_PAGES = [
  {
    slug: 'governance',
    fileName: 'governance.md',
    title: 'Governance',
  },
  {
    slug: 'contributing',
    fileName: 'contribution.md',
    title: 'Contributing',
  },
  {
    slug: 'adoption-faq',
    fileName: 'adoption-faq.md',
    title: 'Adoption FAQ',
    toc: true,
  },
  {
    slug: 'ai-governance-faq',
    fileName: 'ai-governance-faq.md',
    title: 'AI Governance',
    toc: true,
  },
  {
    slug: 'foundations',
    fileName: 'foundations.md',
    title: 'Foundations',
    toc: true,
  },
] as const satisfies readonly TopLevelContentPage[];
