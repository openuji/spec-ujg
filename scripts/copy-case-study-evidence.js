import { cpSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CASE_STUDIES_ROOT = join(REPO_ROOT, 'specs/case-studies');
const PUBLIC_CASE_STUDIES_ROOT = join(REPO_ROOT, 'apps/web/public/case-studies');

function copyCaseStudyEvidence() {
  if (!existsSync(CASE_STUDIES_ROOT)) return;

  const slugs = readdirSync(CASE_STUDIES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  let copied = 0;
  for (const slug of slugs) {
    const evidenceDir = join(CASE_STUDIES_ROOT, slug, 'evidence');
    if (!existsSync(evidenceDir) || !statSync(evidenceDir).isDirectory()) continue;

    const destDir = join(PUBLIC_CASE_STUDIES_ROOT, slug, 'evidence');
    cpSync(evidenceDir, destDir, { recursive: true });
    copied += 1;
    console.log(`[copy-case-study-evidence] ${slug}/evidence -> public/case-studies/${slug}/evidence`);
  }

  if (copied === 0) {
    console.log('[copy-case-study-evidence] no case-study evidence directories found');
  }
}

copyCaseStudyEvidence();
