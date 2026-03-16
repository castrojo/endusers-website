import type { TabId } from './tabs';

interface Opts {
  onSearch: () => void; onHelp: () => void; onTheme: () => void;
  onTab: (n: number) => void; onEscape: () => void;
}

export function initKeyboard(opts: Opts): void {
  document.addEventListener('keydown', (e) => {
    const inInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
    if (e.key === 'Escape') { opts.onEscape(); return; }
    if (inInput) return;
    if (e.key === '/' || e.key === 's') { e.preventDefault(); opts.onSearch(); }
    else if (e.key === '?') opts.onHelp();
    else if (e.key === 't') opts.onTheme();
    else if (e.key >= '1' && e.key <= '6') opts.onTab(parseInt(e.key));
  });
}

const TABS: TabId[] = ['everyone', 'endusers', 'platinum', 'gold', 'silver', 'community'];
export function tabFromNumber(n: number): TabId { return TABS[n - 1] ?? 'everyone'; }
