import { describe, it, expect } from 'vitest';
import { heroSlots, selectHeroSets } from '../../src/lib/heroes';
import type { SafeMember } from '../../src/lib/member-renderer';

const mk = (name: string, tier: string): SafeMember => ({
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  tier,
  isEndUser: true,
  logoUrl: '',
  updatedAt: '',
  joinedAt: '2020-01-01',
});

const platinumPool  = Array.from({ length: 10 }, (_, i) => mk(`Platinum${i}`, 'Platinum'));
const goldPool      = Array.from({ length: 10 }, (_, i) => mk(`Gold${i}`, 'Gold'));
const silverPool    = Array.from({ length: 20 }, (_, i) => mk(`Silver${i}`, 'Silver'));
const academicPool  = Array.from({ length: 5 },  (_, i) => mk(`Academic${i}`, 'Academic'));
const nonprofitPool = Array.from({ length: 5 },  (_, i) => mk(`Nonprofit${i}`, 'Nonprofit'));
const allMembers    = [...platinumPool, ...goldPool, ...silverPool, ...academicPool, ...nonprofitPool];

describe('heroSlots', () => {
  it('returns requested count when pool is large enough', () => {
    expect(heroSlots(silverPool, 8)).toHaveLength(8);
  });

  it('returns all unique slugs (no duplicates) when pool >= count', () => {
    const slots = heroSlots(silverPool, 8);
    const slugs = slots.map(m => m.slug);
    expect(new Set(slugs).size).toBe(8);
  });

  it('returns at most pool-size unique members when count exceeds pool', () => {
    const smallPool = [mk('A', 'Platinum'), mk('B', 'Platinum')];
    const slots = heroSlots(smallPool, 8);
    const slugs = slots.map(m => m.slug);
    expect(new Set(slugs).size).toBeLessThanOrEqual(smallPool.length);
  });

  it('returns empty array for empty pool', () => {
    expect(heroSlots([], 8)).toHaveLength(0);
  });

  it('is deterministic (same output on repeated calls same day)', () => {
    const a = heroSlots(silverPool, 8).map(m => m.slug);
    const b = heroSlots(silverPool, 8).map(m => m.slug);
    expect(a).toEqual(b);
  });
});

describe('selectHeroSets', () => {
  const sets = selectHeroSets(allMembers);

  it('returns all 5 tab keys', () => {
    expect(Object.keys(sets)).toEqual(
      expect.arrayContaining(['everyone', 'platinum', 'gold', 'silver', 'academic'])
    );
  });

  it('everyone has exactly 8 heroes', () => {
    expect(sets.everyone).toHaveLength(8);
  });

  it('platinum set is non-empty', () => {
    expect(sets.platinum.length).toBeGreaterThan(0);
  });

  it('gold set is non-empty', () => {
    expect(sets.gold.length).toBeGreaterThan(0);
  });

  it('silver set is non-empty', () => {
    expect(sets.silver.length).toBeGreaterThan(0);
  });

  it('academic set is non-empty', () => {
    expect(sets.academic.length).toBeGreaterThan(0);
  });

  it('platinum set contains only Platinum members', () => {
    expect(sets.platinum.every(m => m.tier === 'Platinum')).toBe(true);
  });

  it('gold set contains only Gold members', () => {
    expect(sets.gold.every(m => m.tier === 'Gold')).toBe(true);
  });

  it('silver set contains only Silver members', () => {
    expect(sets.silver.every(m => m.tier === 'Silver')).toBe(true);
  });

  it('academic set contains only Academic or Nonprofit members', () => {
    expect(sets.academic.every(m => m.tier === 'Academic' || m.tier === 'Nonprofit')).toBe(true);
  });

  it('returns empty sets gracefully when members list is empty', () => {
    const empty = selectHeroSets([]);
    expect(empty.everyone).toHaveLength(0);
    expect(empty.platinum).toHaveLength(0);
    expect(empty.silver).toHaveLength(0);
  });
});
