import { describe, expect, it } from 'vitest';
import { createSiteNavigation } from './navigation';
import { SITE_BASE } from './site';

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
        {
          href: '#capabilities',
          label: 'Capabilities',
          sectionId: 'capabilities',
        },
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
        {
          href: '#capabilities',
          label: 'Capabilities',
          sectionId: 'capabilities',
        },
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
      {
        href: `${home}#work`,
        label: 'Work',
        current: 'location',
      },
      { href: `${home}#capabilities`, label: 'Capabilities' },
      { href: `${home}#contact`, label: 'Contact' },
    ]);
  });

  it('does not mark work current on not-found or unrelated routes', () => {
    for (const path of [
      '/404',
      `${SITE_BASE}/archive/`,
      `${SITE_BASE}/dev/foundation/`,
    ]) {
      expect(createSiteNavigation(path).every((item) => !item.current)).toBe(
        true,
      );
      const home = path.includes('/dev/')
        ? `${SITE_BASE}/dev/homepage/`
        : `${SITE_BASE}/`;
      expect(createSiteNavigation(path).map((item) => item.href)).toEqual([
        `${home}#work`,
        `${home}#capabilities`,
        `${home}#contact`,
      ]);
    }
  });
});
