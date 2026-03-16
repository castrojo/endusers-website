import type { SafeMember } from './member-renderer';

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

function dailyHero(pool: SafeMember[]): SafeMember | null {
  if (!pool.length) return null;
  const sorted = [...pool].sort((a, b) => djb2(a.name) - djb2(b.name));
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return sorted[dayIndex % sorted.length];
}

export interface HeroSet {
  endUser: SafeMember | null;
  platinum: SafeMember | null;
  recentlyJoined: SafeMember | null;
  community: SafeMember | null;
}

export function selectHeroes(members: SafeMember[]): HeroSet {
  return {
    endUser: dailyHero(members.filter(m => m.isEndUser)),
    platinum: dailyHero(members.filter(m => m.tier === 'Platinum')),
    recentlyJoined: dailyHero([...members].sort((a, b) => (b.joinedAt ?? '') > (a.joinedAt ?? '') ? 1 : -1).slice(0, 30)),
    community: dailyHero(members.filter(m => m.tier === 'Academic' || m.tier === 'Nonprofit')),
  };
}
