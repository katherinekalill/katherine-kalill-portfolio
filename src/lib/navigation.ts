import { routeHref, SITE_BASE } from './site';

export interface SiteNavigationItem {
  href: string;
  label: string;
  sectionId?: string;
  current?: 'page' | 'location';
}

export function createSiteNavigation(pathname: string): SiteNavigationItem[] {
  const rawPath =
    pathname === SITE_BASE
      ? '/'
      : pathname.startsWith(`${SITE_BASE}/`)
        ? pathname.slice(SITE_BASE.length)
        : pathname;
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  const isPreview = path.startsWith('/dev/');
  const isPreviewHome = path === '/dev/homepage';
  const isPreviewStory = /^\/dev\/work\/[^/]+$/.test(path);
  const isHome = path === '/' || isPreviewHome;
  const isStory = /^\/work\/[^/]+$/.test(path) || isPreviewStory;
  const isAbout = path === '/about';
  const isArchive = path === '/archive';
  const homeHref = isPreview ? '/dev/homepage/' : '/';
  const sectionHref = (id: string) =>
    isHome ? `#${id}` : routeHref(`${homeHref}#${id}`);

  return [
    {
      href: sectionHref('work'),
      label: 'Work',
      ...(isHome ? { sectionId: 'work' } : {}),
      ...(isHome || isStory || isArchive
        ? { current: 'location' as const }
        : {}),
    },
    {
      href: routeHref('/about/'),
      label: 'About',
      ...(isAbout ? { current: 'page' as const } : {}),
    },
    {
      href: sectionHref('contact'),
      label: 'Contact',
      ...(isHome ? { sectionId: 'contact' } : {}),
    },
  ];
}
