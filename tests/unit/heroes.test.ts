import { describe, it, expect } from 'vitest';
import { selectHeroes } from '../../src/lib/heroes';
import type { SafeMember } from '../../src/lib/member-renderer';

const mk = (name: string, tier: string, isEndUser = false): SafeMember => ({
  name, slug: name.toLowerCase(), tier, isEndUser, logoUrl: '', updatedAt: '', joinedAt: '2020-01-01',
});

describe('selectHeroes', () => {
  const members = [mk('Google', 'Platinum'), mk('Adidas', 'Silver', true), mk('MIT', 'Academic'), mk('CERN', 'Nonprofit')];

  it('selects platinum hero', () => expect(selectHeroes(members).platinum?.tier).toBe('Platinum'));
  it('selects endUser hero', () => expect(selectHeroes(members).endUser?.isEndUser).toBe(true));
  it('returns null for empty community pool when none qualify', () => {
    const result = selectHeroes([mk('Google', 'Platinum')]);
    expect(result.community).toBeNull();
  });
  it('selects community hero from academic or nonprofit', () => {
    const hero = selectHeroes(members).community;
    expect(hero?.tier === 'Academic' || hero?.tier === 'Nonprofit').toBe(true);
  });
  it('returns null endUser when no end users', () => {
    const result = selectHeroes([mk('Google', 'Platinum'), mk('Apple', 'Gold')]);
    expect(result.endUser).toBeNull();
  });
});
