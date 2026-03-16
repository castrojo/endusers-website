export type TabId = 'everyone' | 'endusers' | 'platinum' | 'gold' | 'silver' | 'community';

export function initTabs(onTabChange: (tabId: TabId) => void): void {
  const saved = (localStorage.getItem('endusers-active-tab') as TabId) ?? 'everyone';
  activateTab(saved, onTabChange);
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = (btn as HTMLElement).dataset.tab as TabId;
      if (tab) { localStorage.setItem('endusers-active-tab', tab); activateTab(tab, onTabChange); }
    });
  });
}

export function activateTab(tabId: TabId, onTabChange: (tabId: TabId) => void): void {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.tab === tabId);
  });
  onTabChange(tabId);
}

export function filterByTab(members: import('./member-renderer').SafeMember[], tabId: TabId): import('./member-renderer').SafeMember[] {
  switch (tabId) {
    case 'everyone': return members;
    case 'endusers': return members.filter(m => m.isEndUser);
    case 'platinum': return members.filter(m => m.tier === 'Platinum');
    case 'gold': return members.filter(m => m.tier === 'Gold');
    case 'silver': return members.filter(m => m.tier === 'Silver');
    case 'community': return members.filter(m => m.tier === 'Academic' || m.tier === 'Nonprofit');
    default: return members;
  }
}
