import { describe, expect, it } from 'vitest';
import { createSiteNavigation } from './navigation';
import { routeHref, SITE_BASE } from './site';

const about = routeHref('/about/');

describe('site navigation routes and current location', () => {
  it.each(['/', `${SITE_BASE}`, `${SITE_BASE}/`])(
    'uses section fragments on the homepage path %s',
    (path) => {
      expect(createSiteNavigation(path)).toEqual([
        {
          href: '#work',
          label: 'Work',
          sectionId: 'work',
          current: 'location',
        },
        { href: about, label: 'About' },
        { href: '#contact', label: 'Contact', sectionId: 'contact' },
      ]);
    },
  );

  it.each(['/dev/homepage', `${SITE_BASE}/dev/homepage/`])(
    'uses review fragments for the preview home %s',
    (path) => {
      expect(createSiteNavigation(path)).toEqual([
        {
          href: '#work',
          label: 'Work',
          sectionId: 'work',
          current: 'location',
        },
        { href: about, label: 'About' },
        { href: '#contact', label: 'Contact', sectionId: 'contact' },
      ]);
    },
  );

  it.each([
    [`${SITE_BASE}/work/all-city-mile/`, 'story'],
    ['/work/womens-self-defense', 'story without trailing slash'],
    [`${SITE_BASE}/dev/work/all-city-mile/`, 'review story'],
  ])('points %s back to base-aware homepage sections (%s)', (path) => {
    const preview = path.includes('/dev/');
    const home = preview ? `${SITE_BASE}/dev/homepage/` : `${SITE_BASE}/`;
    expect(createSiteNavigation(path)).toEqual([
      { href: `${home}#work`, label: 'Work', current: 'location' },
      { href: about, label: 'About' },
      { href: `${home}#contact`, label: 'Contact' },
    ]);
  });

  it('marks About current on profile routes', () => {
    for (const path of ['/about', `${SITE_BASE}/about/`]) {
      expect(createSiteNavigation(path)).toEqual([
        { href: `${SITE_BASE}/#work`, label: 'Work' },
        { href: about, label: 'About', current: 'page' },
        { href: `${SITE_BASE}/#contact`, label: 'Contact' },
      ]);
    }
  });

  it('marks Work current on the archive route', () => {
    expect(createSiteNavigation(`${SITE_BASE}/archive/`)).toEqual([
      { href: `${SITE_BASE}/#work`, label: 'Work', current: 'location' },
      { href: about, label: 'About' },
      { href: `${SITE_BASE}/#contact`, label: 'Contact' },
    ]);
  });

  it('does not mark navigation current on unrelated routes', () => {
    for (const path of ['/404', `${SITE_BASE}/dev/foundation/`]) {
      expect(createSiteNavigation(path).every((item) => !item.current)).toBe(
        true,
      );
      const home = path.includes('/dev/')
        ? `${SITE_BASE}/dev/homepage/`
        : `${SITE_BASE}/`;
      expect(createSiteNavigation(path).map((item) => item.href)).toEqual([
        `${home}#work`,
        about,
        `${home}#contact`,
      ]);
    }
  });
});
