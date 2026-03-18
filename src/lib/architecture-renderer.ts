export interface SafeArchitecture {
  slug: string;
  title: string;
  orgName: string;
  orgTeam?: string;
  orgUrl?: string;
  orgLogoUrl: string;
  orgDescription?: string;
  orgSize?: string;
  userSize?: string;
  industries?: string[];
  tags?: string[];
  refArchTypes?: string[];
  archUrl: string;
  submittedAt?: string;
  projects?: ArchProject[];
}

export interface ArchProject {
  name: string;
  logoUrl?: string;
  maturity?: string; // "graduated" | "incubating" | "sandbox" | ""
  usingSince?: string;
}

// Maturity accent colors for project ribbon chips.
const MATURITY_COLORS: Record<string, string> = {
  graduated:  '#00B5D8', // CNCF teal
  incubating: '#F6AD55', // CNCF amber
  sandbox:    '#8b949e', // muted gray
};

const MAX_VISIBLE_PROJECTS = 6;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderProjectChip(p: ArchProject): string {
  const color = p.maturity ? (MATURITY_COLORS[p.maturity] ?? '') : '';
  const dot = color
    ? `<span class="arch-maturity-dot" style="background:${color}" title="${escapeHtml(p.maturity ?? '')}"></span>`
    : '';
  const logo = p.logoUrl
    ? `<img class="arch-project-logo" src="${escapeHtml(p.logoUrl)}" alt="${escapeHtml(p.name)} logo" width="18" height="18" loading="lazy" />`
    : '';
  return `<span class="arch-project-chip arch-project-chip--${escapeHtml(p.maturity ?? 'unknown')}" title="${escapeHtml(p.name)}${p.usingSince ? ' · since ' + escapeHtml(p.usingSince) : ''}">${logo}${dot}<span class="arch-project-name">${escapeHtml(p.name)}</span></span>`;
}

function renderProjectRibbon(projects: ArchProject[]): string {
  if (!projects.length) return '';

  const visible = projects.slice(0, MAX_VISIBLE_PROJECTS);
  const overflow = projects.length - visible.length;

  const chips = visible.map(renderProjectChip).join('');
  const overflowBadge = overflow > 0
    ? `<span class="arch-overflow-badge">+${overflow} more</span>`
    : '';

  return `<div class="arch-ribbon">
      <div class="arch-ribbon-label">CNCF Projects Used</div>
      <div class="arch-ribbon-chips">${chips}${overflowBadge}</div>
    </div>`;
}

/** Renders a single Reference Architecture as a hero card. */
export function renderArchCard(a: SafeArchitecture): string {
  const orgName = escapeHtml(a.orgName);
  const title = escapeHtml(a.title);
  const description = a.orgDescription ? escapeHtml(a.orgDescription) : '';

  const logoHtml = a.orgLogoUrl
    ? `<img class="arch-org-logo" src="${escapeHtml(a.orgLogoUrl)}" alt="${orgName} logo" loading="lazy" />`
    : '';

  const meta: string[] = [];
  if (a.orgTeam) meta.push(`<span class="arch-meta-team">${escapeHtml(a.orgTeam)}</span>`);
  if (a.refArchTypes?.length) {
    const types = a.refArchTypes.map(t => `<span class="arch-reftype">${escapeHtml(t)}</span>`).join('');
    meta.push(`<div class="arch-reftypes">${types}</div>`);
  }
  if (a.industries?.length) {
    meta.push(`<div class="arch-industries">${escapeHtml(a.industries.slice(0, 3).join(' · '))}</div>`);
  }

  const sizes: string[] = [];
  if (a.orgSize) sizes.push(`${escapeHtml(a.orgSize)} org`);
  if (a.userSize) sizes.push(`${escapeHtml(a.userSize)} users`);
  const sizesHtml = sizes.length
    ? `<div class="arch-sizes">${sizes.join(' · ')}</div>`
    : '';

  const readMore = a.orgUrl
    ? `<a class="arch-link" href="${escapeHtml(a.archUrl)}" target="_blank" rel="noopener">Read Architecture →</a>`
    : `<a class="arch-link" href="${escapeHtml(a.archUrl)}" target="_blank" rel="noopener">Read Architecture →</a>`;

  const ribbon = renderProjectRibbon(a.projects ?? []);

  return `<article
    class="arch-card"
    data-slug="${escapeHtml(a.slug)}"
  >
    <div class="arch-accent-bar"></div>
    <div class="arch-logo-box">${logoHtml}</div>
    <div class="arch-body">
      <div class="arch-badge">🏆 Reference Architecture</div>
      <h3 class="arch-org-name">${orgName}</h3>
      <p class="arch-title">${title}</p>
      ${description ? `<p class="arch-description">${description}</p>` : ''}
      ${meta.length ? `<div class="arch-meta">${meta.join('')}</div>` : ''}
      ${sizesHtml}
      ${readMore}
    </div>
    ${ribbon}
  </article>`;
}

/** Renders all architectures into a grid string. */
export function renderArchCards(architectures: SafeArchitecture[]): string {
  return architectures.map(renderArchCard).join('\n');
}
