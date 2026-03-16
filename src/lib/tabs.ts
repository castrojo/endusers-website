export type TabId = 'everyone' | 'end-users' | 'platinum' | 'gold' | 'silver' | 'academic';

export function initTabs(onTabChange: (tabId: TabId) => void): void {
  const saved = (localStorage.getItem('endusers-active-tab') as TabId) ?? 'everyone';
  activateTab(saved, onTabChange);
  document.querySelectorAll('.section-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = (btn as HTMLElement).dataset.tab as TabId;
      if (tab) { localStorage.setItem('endusers-active-tab', tab); activateTab(tab, onTabChange); }
    });
  });
}

export function activateTab(tabId: TabId, onTabChange: (tabId: TabId) => void): void {
  document.querySelectorAll('.section-link').forEach(btn => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.tab === tabId);
  });
  onTabChange(tabId);
}

export function filterByTab(members: import('./member-renderer').SafeMember[], tabId: TabId): import('./member-renderer').SafeMember[] {
  switch (tabId) {
    case 'everyone': return members;
    case 'end-users': return members.filter(m => m.isEndUser);
    case 'platinum': return members.filter(m => m.tier === 'Platinum');
    case 'gold': return members.filter(m => m.tier === 'Gold');
    case 'silver': return members.filter(m => m.tier === 'Silver');
    case 'academic': return members.filter(m => m.tier === 'Academic' || m.tier === 'Nonprofit');
    default: return members;
  }
}
