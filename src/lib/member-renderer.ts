export interface SafeMember {
  name: string; slug: string; description?: string; homepageUrl?: string;
  logoUrl: string; tier: string; isEndUser: boolean; joinedAt?: string;
  twitterUrl?: string; linkedInUrl?: string; city?: string; country?: string;
  countryFlag?: string; employeesMin?: number; employeesMax?: number;
  totalFunding?: number; industries?: string[]; stockExchange?: string; ticker?: string;
  updatedAt: string;
}

const TIER_COLORS: Record<string, string> = {
  Platinum: '#B0B0B0', Gold: '#FFB300', Silver: '#C0C0C0',
  'End User': '#0086FF', Academic: '#7B2FBE', Nonprofit: '#00A86B',
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatEmployees(min?: number, max?: number): string {
  if (!min) return '';
  if (max && max > min) return `${min.toLocaleString()}\u2013${max.toLocaleString()}`;
  return `${min.toLocaleString()}+`;
}

function formatFunding(n?: number): string {
  if (!n) return '';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }); }
  catch { return iso; }
}

export function renderCard(m: SafeMember): string {
  const color = TIER_COLORS[m.tier] ?? '#8b949e';
  const name = escapeHtml(m.name);
  const desc = escapeHtml(m.description ?? '');
  const location = [m.city, m.countryFlag ? `${m.country} ${m.countryFlag}` : m.country].filter(Boolean).join(', ');

  const links: string[] = [];
  if (m.homepageUrl) links.push(`<a class="card-link" href="${escapeHtml(m.homepageUrl)}" target="_blank" rel="noopener">Website</a>`);
  if (m.linkedInUrl) links.push(`<a class="card-link" href="${escapeHtml(m.linkedInUrl)}" target="_blank" rel="noopener">LinkedIn</a>`);
  if (m.twitterUrl) links.push(`<a class="card-link" href="${escapeHtml(m.twitterUrl)}" target="_blank" rel="noopener">Twitter</a>`);

  const meta: string[] = [];
  if (location) meta.push(`<div class="card-meta-row">${escapeHtml(location)}</div>`);
  if (m.industries?.length) meta.push(`<div class="card-meta-row card-category">${escapeHtml(m.industries.slice(0, 3).join(', '))}</div>`);
  const emp = formatEmployees(m.employeesMin, m.employeesMax);
  if (emp) meta.push(`<div class="card-meta-row">Employees: ${escapeHtml(emp)}</div>`);
  const funding = formatFunding(m.totalFunding);
  if (funding) meta.push(`<div class="card-meta-row">Funding: ${escapeHtml(funding)}</div>`);
  if (m.joinedAt) meta.push(`<div class="card-meta-row">Joined: ${escapeHtml(formatDate(m.joinedAt))}</div>`);

  const badgeTextColor = (m.tier === 'Platinum' || m.tier === 'Silver') ? '#333' : 'white';

  return `<article
    class="member-card"
    style="--card-accent: ${color}"
    data-tier="${escapeHtml(m.tier.toLowerCase().replace(' ', '-'))}"
    data-enduser="${m.isEndUser}"
    data-slug="${escapeHtml(m.slug)}"
  >
    <div class="card-header">
      <span class="tier-badge" style="background:${color};color:${badgeTextColor}">${escapeHtml(m.tier)}</span>
      ${m.logoUrl ? `<img class="card-logo" src="${escapeHtml(m.logoUrl)}" alt="${name} logo" width="40" height="40" loading="lazy" style="width:40px;height:40px;object-fit:contain" />` : ''}
    </div>
    <div class="card-body">
      <h3 class="card-name">${name}</h3>
      ${desc ? `<p class="card-description">${desc}</p>` : ''}
      ${meta.join('')}
      ${links.length ? `<div class="card-links">${links.join('')}</div>` : ''}
    </div>
  </article>`;
}

export function renderCards(members: SafeMember[]): string {
  return members.map(renderCard).join('\n');
}
