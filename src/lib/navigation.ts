import { routeHref, SITE_BASE } from './site';

export interface SiteNavigationItem {
  href: string;
  label: string;
  sectionId?: string;
  current?: 'page' | 'location';
}

const sections = [
  { id: 'work', label: 'Work' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'contact', label: 'Contact' },
] as const;

export function createSiteNavigation(pathname: string): SiteNavigationItem[] {
  const rawPath =
    pathname === SITE_BASE
      ? '/'
      : pathname.startsWith(`${SITE_BASE}/`)
        ? pathname.slice(SITE_BASE.length)
        : pathname;
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  const isPreviewHome = path === '/dev/homepage';
  const isPreviewStory = /^\/dev\/work\/[^/]+$/.test(path);
  const isHome = path === '/' || isPreviewHome;
  const isStory = /^\/work\/[^/]+$/.test(path) || isPreviewStory;
  const homeHref = path.startsWith('/dev/') ? '/dev/homepage/' : '/';

  return sections.map(({ id, label }) => ({
    href: isHome ? `#${id}` : routeHref(`${homeHref}#${id}`),
    label,
    ...(isHome ? { sectionId: id } : {}),
    ...(id === 'work' && (isHome || isStory)
      ? { current: 'location' as const }
      : {}),
  }));
}
