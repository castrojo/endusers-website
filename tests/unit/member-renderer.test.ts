import { describe, it, expect } from 'vitest';
import { renderCard, type SafeMember } from '../../src/lib/member-renderer';

const base: SafeMember = {
  name: 'Google', slug: 'google', description: 'Cloud and tech company',
  tier: 'Platinum', isEndUser: false, logoUrl: 'https://example.com/google.svg',
  country: 'United States', city: 'Mountain View', updatedAt: '2024-01-01',
  joinedAt: '2016-03-01', industries: ['Cloud', 'Software'],
};

describe('renderCard', () => {
  it('renders platinum card', () => {
    const html = renderCard(base);
    expect(html).toContain('Platinum');
    expect(html).toContain('Google');
  });

  it('escapes XSS in name', () => {
    const html = renderCard({ ...base, name: '<script>xss</script>', slug: 'xss' });
    expect(html).not.toContain('<script>');
  });

  it('renders location', () => {
    const html = renderCard(base);
    expect(html).toContain('Mountain View');
  });

  it('renders industries', () => {
    const html = renderCard(base);
    expect(html).toContain('Cloud');
  });

  it('renders end user tier color', () => {
    const eu: SafeMember = { ...base, tier: 'End User', isEndUser: true, slug: 'eu-test' };
    const html = renderCard(eu);
    expect(html).toContain('End User');
    expect(html).toContain('#0086FF');
  });

  it('formats funding', () => {
    const funded: SafeMember = { ...base, slug: 'funded', totalFunding: 2_500_000_000 };
    const html = renderCard(funded);
    expect(html).toContain('$2.5B');
  });

  it('renders platinum tier color #E5E4E2', () => {
    const html = renderCard(base);
    expect(html).toContain('#E5E4E2');
  });

  it('renders gold tier color #FFB300', () => {
    const gold: SafeMember = { ...base, slug: 'gold-co', tier: 'Gold', isEndUser: false };
    const html = renderCard(gold);
    expect(html).toContain('#FFB300');
  });

  it('renders homepage link as href', () => {
    const m: SafeMember = { ...base, slug: 'link-test', homepageUrl: 'https://google.com' };
    const html = renderCard(m);
    expect(html).toContain('href="https://google.com"');
  });

  it('sets data-enduser="true" for end users', () => {
    const eu: SafeMember = { ...base, slug: 'eu-attr', tier: 'End User', isEndUser: true };
    const html = renderCard(eu);
    expect(html).toContain('data-enduser="true"');
  });

  it('renders country flag emoji in location', () => {
    const m: SafeMember = { ...base, slug: 'flag-test', city: 'Toronto', country: 'Canada', countryFlag: '🇨🇦' };
    const html = renderCard(m);
    expect(html).toContain('🇨🇦');
  });

  it('formats employee range with en-dash', () => {
    const m: SafeMember = { ...base, slug: 'emp-test', employeesMin: 1000, employeesMax: 5000 };
    const html = renderCard(m);
    expect(html).toContain('1,000');
    expect(html).toContain('5,000');
  });

  it('renders stock exchange and ticker', () => {
    const m: SafeMember = { ...base, slug: 'ticker-test', ticker: 'GOOG', stockExchange: 'NASDAQ' };
    const html = renderCard(m);
    expect(html).toContain('NASDAQ: GOOG');
  });
});
