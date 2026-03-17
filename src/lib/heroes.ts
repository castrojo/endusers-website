import type { SafeMember } from './member-renderer';

function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return h >>> 0;
}

export function heroSlots(pool: SafeMember[], count = 8): SafeMember[] {
  if (!pool.length) return [];
  const sorted = [...pool].sort((a, b) => djb2(a.name) - djb2(b.name));
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const seen = new Set<string>();
  const result: SafeMember[] = [];
  for (let i = 0; result.length < count && i < sorted.length * 2; i++) {
    const m = sorted[(dayIndex + i) % sorted.length];
    if (!seen.has(m.slug)) { seen.add(m.slug); result.push(m); }
  }
  return result;
}

export interface HeroSets {
  everyone:  SafeMember[];
  platinum:  SafeMember[];
  gold:      SafeMember[];
  silver:    SafeMember[];
  academic:  SafeMember[];
}

export function selectHeroSets(members: SafeMember[]): HeroSets {
  const platinum = members.filter(m => m.tier === 'Platinum');
  const gold      = members.filter(m => m.tier === 'Gold');
  const silver    = members.filter(m => m.tier === 'Silver');
  const academic  = members.filter(m => m.tier === 'Academic' || m.tier === 'Nonprofit');
  return {
    // Everyone: 2 platinum + 2 gold + 3 silver + 1 academic = 8
    everyone: [
      ...heroSlots(platinum, 2),
      ...heroSlots(gold, 2),
      ...heroSlots(silver, 3),
      ...heroSlots(academic, 1),
    ],
    platinum: heroSlots(platinum),
    gold:     heroSlots(gold),
    silver:   heroSlots(silver),
    academic: heroSlots(academic),
  };
}
