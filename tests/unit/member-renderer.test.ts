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
});
