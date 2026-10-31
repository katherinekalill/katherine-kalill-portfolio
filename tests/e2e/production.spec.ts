import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const base = '/katherine-kalill-portfolio';
const slugs = [
  'all-city-mile',
  'your-mothers-run-crew',
  'freaks-of-nature',
  'you-deserve-your-flowers',
  'womens-self-defense',
  'for-all-mothers',
  'usa-track-championships',
];
const publicProjectSlugs = slugs;
const collaborators = [
  [
    'All City Mile',
    'Project · community race and product launch',
    'all-city-mile',
    'race-day-format',
  ],
  [
    'Freaks of Nature × Alba Optics × Runaway Milano',
    'Client and collaborators · community event and campaign',
    'freaks-of-nature',
    null,
  ],
  [
    'Little Words Project × goop',
    'Partners · Your Mothers Run Crew gatherings',
    'your-mothers-run-crew',
    null,
  ],
  [
    'Athletic Form',
    'Collaborator · Mom, You Deserve Your Flowers',
    'you-deserve-your-flowers',
    'event-activation',
  ],
  [
    'REI',
    'Collaborator · Women’s Self-Defense Initiative',
    'womens-self-defense',
    'community-led-event',
  ],
  [
    'Joie Baby × For All Mothers',
    'Brand and community partners · family storytelling',
    'for-all-mothers',
    null,
  ],
  [
    'Citius Magazine',
    'Editorial partner · championship community',
    'usa-track-championships',
    'community-run',
  ],
] as const;
const textualExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.mjs',
  '.svg',
  '.txt',
  '.xml',
]);
const storyTitles = [
  'Making Competition Feel Like Community',
  'Building a Community People Return To',
  'Creating a Reason to Gather',
  'Bridging Fashion Culture With a Passion for High Performance',
  'Using Brand Purpose to Create Practical Impact',
  'Making Space for Motherhood in Elite Sport',
  'Bringing Professional Athletes and Community Together',
];
const storyFacts = [
  ['300+', '30+', '$5,000', 'Sold out'],
  ['2'],
  ['50 spots', '2 reels'],
  ['Sold out', '200 shirts', '60+'],
  ['Sold out', '225%'],
  ['Kelly Curtis', 'Kaillie Humphries', 'Tabitha and Tara Peterson'],
  ['200+ people'],
];
const projectMetadata = [
  {
    slug: 'all-city-mile',
    name: 'Making Competition Feel Like Community',
    description:
      'New Balance revived Seattle’s All City Mile at UW Husky Track in 2025. The sold-out event welcomed 300+ runners across eight heats and relays, supported by 30+ volunteers, and raised $5,000 for Girls on the Run.',
    image: {
      src: '/work/all-city-mile-hero.webp',
      alt: 'Runners gather behind an All City Mile banner on the track.',
      width: 1290,
      height: 852,
    },
  },
  {
    slug: 'your-mothers-run-crew',
    name: 'Building a Community People Return To',
    description:
      'I founded Your Mothers Run Crew in Austin as a women-only monthly running community built around the buddy system before and after dark. In 2024, I led sold-out New Balance collaborations with Goop and Little Words Project, pairing a run or walk with distinct in-store gatherings.',
    image: {
      src: '/work/mothers-lwp-hero.webp',
      alt: 'Two runners talk at a post-run gathering.',
      width: 1067,
      height: 1600,
    },
  },
  {
    slug: 'freaks-of-nature',
    name: 'Creating a Reason to Gather',
    description:
      'For Freaks of Nature, I coordinated a Milan community event with Alba Optics and local running store Runaway Milano. A sold-out 50-place morning run paired two short-form videos with an outdoor-inspired gathering at Runaway Milano.',
    image: {
      src: '/work/freaks-of-nature-hero.webp',
      alt: 'Freaks of Nature run crew members pose together on a city street.',
      width: 1290,
      height: 969,
    },
  },
  {
    slug: 'you-deserve-your-flowers',
    name: 'Bridging Fashion Culture With a Passion for High Performance',
    description:
      'For New Balance, I developed a Mother’s Day partnership with Seattle gym Athletic Form to introduce a Hyrox audience to running shoes. The May 10, 2025 event sold out and paired shoe demos and a high-energy workout with bouquets, custom event branding, and brunch.',
    image: {
      src: '/work/you-deserve-flowers-run-your-way.webp',
      alt: 'A Run Your Way New Balance banner stands among athletes training in a gym.',
      width: 1013,
      height: 1350,
    },
  },
  {
    slug: 'womens-self-defense',
    name: 'Using Brand Purpose to Create Practical Impact',
    description:
      'For New Balance, I planned and managed a March 16, 2025 women’s self-defense event with REI in Seattle. Timed within REI’s member-sale weekend and the launch of the Hierro trail shoe, it paired a demo run with a runner-focused self-defense class and sold out.',
    image: {
      src: '/work/womens-self-defense-hero.webp',
      alt: 'Participants gather for a women’s self-defense event.',
      width: 1920,
      height: 1440,
    },
  },
  {
    slug: 'for-all-mothers',
    name: 'Making Space for Motherhood in Elite Sport',
    description:
      'Capturing the realities of motherhood alongside elite sport at the Winter Olympics in Cortina.',
    image: {
      src: '/work/cortina-family-curling.webp',
      alt: 'A spectator holds a young child while watching a curling match in an Olympic arena.',
      width: 1170,
      height: 2048,
    },
  },
  {
    slug: 'usa-track-championships',
    name: 'Bringing Professional Athletes and Community Together',
    description:
      'Partnered with Citius Magazine to curate community and athlete spotlights across the 2025 USA Track Championships in Eugene.',
    image: {
      src: '/work/usa-track-championships-community.webp',
      alt: 'A large group gathers behind a New Balance banner beneath a Citius Magazine logo.',
      width: 1290,
      height: 915,
    },
  },
] as const;

declare global {
  interface Window {
    __publicStoryEntrances?: Array<{ kind: string; text: string }>;
  }
}

async function readProductionText(directory: string): Promise<string> {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return readProductionText(path);
      if (!textualExtensions.has(extname(entry.name).toLowerCase())) return '';
      return readFile(path, 'utf8');
    }),
  );
  return contents.join('\n');
}

async function readStructuredData(
  page: import('@playwright/test').Page,
): Promise<Array<Record<string, unknown>>> {
  return page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map(
        (script) =>
          JSON.parse(script.textContent ?? '') as Record<string, unknown>,
      ),
    );
}

async function installPausedClock(page: import('@playwright/test').Page) {
  const start = new Date('2026-10-30T08:00:00.000Z');
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 1000));
}

async function waitForHeroIntersection(
  page: import('@playwright/test').Page,
  isIntersecting: boolean,
) {
  await page.evaluate(
    (expected) =>
      new Promise<void>((resolve) => {
        const hero = document.querySelector('.homepage-hero');
        if (!hero) throw new Error('Homepage hero is missing');
        const observer = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting === expected)) {
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(hero);
      }),
    isIntersecting,
  );
}

function expectedPersonStructuredData() {
  const personId = `https://katherinekalill.github.io${base}/#person`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: 'Katherine Kalill',
    url: `https://katherinekalill.github.io${base}/about/`,
    sameAs: ['https://www.linkedin.com/in/katherine-kalill/'],
  };
}

function expectedWebsiteStructuredData() {
  const personId = `https://katherinekalill.github.io${base}/#person`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Katherine Kalill',
    url: `https://katherinekalill.github.io${base}/`,
    publisher: { '@id': personId },
  };
}

async function waitForEntranceAnimations(
  page: import('@playwright/test').Page,
) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      const active = document.documentElement
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === 'running');
      if (active.length === 0) return;
      await Promise.all(
        active.map((animation) => animation.finished.catch(() => undefined)),
      );
    }
  });
}

test('production home and all seven published stories work under the project base', async ({
  page,
  request,
}) => {
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  const home = await page.goto(`${base}/`);
  expect(home?.status()).toBe(200);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.locator('.homepage-range')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Katherine Kalill',
  );
  await expect(page.locator('.homepage-hero__eyebrow')).toHaveText(
    'Sport · Fashion · Culture',
  );
  await expect(page.locator('.homepage-hero__thesis')).toHaveText(
    'The Business of Human Connection',
  );
  await expect(page.locator('[data-headshot-source]')).toHaveAttribute(
    'fetchpriority',
    'high',
  );
  await expect(page.locator('[data-headshot-source]')).toHaveAttribute(
    'srcset',
    /640w.*960w.*1440w/,
  );
  const heroSlides = await page
    .locator('[data-hero-slides]')
    .evaluate(
      (script) =>
        JSON.parse(script.textContent ?? '[]') as Array<{ id: string }>,
    );
  expect(heroSlides.map(({ id }) => id)).toEqual([
    'all-city-mile-hero',
    'all-city-mile-huddle',
    'freaks-of-nature-hero',
    'womens-self-defense-hero',
    'womens-self-defense-partner',
    'all-city-mile-community',
    'all-city-mile-results',
    'usa-track-championships-community',
    'usa-track-championships-collaborators',
  ]);
  await expect(page.locator('[data-hero-controls]')).toBeVisible();
  await expect(
    page
      .locator('[data-project-id="all-city-mile"]')
      .locator('.featured-story__context'),
  ).toContainText(
    'New Balance field marketing · community event · product launch',
  );
  await expect(page.locator('#archive')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Browse all work' }),
  ).toHaveAttribute('href', `${base}/archive/`);
  await expect(
    page.getByRole('link', { name: 'Read more about my work' }),
  ).toHaveAttribute('href', `${base}/about/`);
  const homeNav = page.locator('[data-site-navigation] a');
  await expect(homeNav).toHaveText(['Work', 'About', 'Contact']);
  expect(
    await homeNav.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    ),
  ).toEqual(['#work', `${base}/about/`, '#contact']);
  await expect(homeNav.nth(0)).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://katherinekalill.github.io${base}/`,
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    'content',
    'website',
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Katherine Kalill — The Business of Human Connection',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `https://katherinekalill.github.io${base}/work/freaks-of-nature-hero.webp`,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    'content',
    'Freaks of Nature run crew members pose together on a city street.',
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
    'content',
    '1290',
  );
  await expect(
    page.locator('meta[property="og:image:height"]'),
  ).toHaveAttribute('content', '969');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    'content',
    `https://katherinekalill.github.io${base}/work/freaks-of-nature-hero.webp`,
  );
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    'content',
    'Freaks of Nature run crew members pose together on a city street.',
  );
  const homeStructuredData = await readStructuredData(page);
  expect(homeStructuredData).toEqual([
    expectedPersonStructuredData(),
    expectedWebsiteStructuredData(),
  ]);

  const sitemapResponse = await request.get(`${base}/sitemap.xml`);
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  const parsedSitemap = await page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    return {
      parseErrors: Array.from(document.getElementsByTagName('parsererror')).map(
        (error) => error.textContent,
      ),
      rootName: document.documentElement.localName,
      namespace: document.documentElement.namespaceURI,
      locations: Array.from(
        document.getElementsByTagNameNS(
          'http://www.sitemaps.org/schemas/sitemap/0.9',
          'loc',
        ),
      ).map((location) => location.textContent),
    };
  }, sitemap);
  expect(parsedSitemap.parseErrors).toEqual([]);
  expect(parsedSitemap.rootName).toBe('urlset');
  expect(parsedSitemap.namespace).toBe(
    'http://www.sitemaps.org/schemas/sitemap/0.9',
  );
  const expectedSitemapLocations = [
    `https://katherinekalill.github.io${base}/`,
    `https://katherinekalill.github.io${base}/about/`,
    `https://katherinekalill.github.io${base}/archive/`,
    ...publicProjectSlugs.map(
      (slug) => `https://katherinekalill.github.io${base}/work/${slug}/`,
    ),
  ].sort();
  expect(parsedSitemap.locations.sort()).toEqual(expectedSitemapLocations);
  const robotsResponse = await request.get(`${base}/robots.txt`);
  expect(robotsResponse.status()).toBe(200);
  const robots = await robotsResponse.text();
  expect(robots).toContain('Allow: /katherine-kalill-portfolio/');
  expect(robots).toContain(
    `Sitemap: https://katherinekalill.github.io${base}/sitemap.xml`,
  );
  await expect(
    page
      .getByRole('navigation', { name: 'Contact Katherine' })
      .getByRole('link', { name: /LinkedIn/ }),
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/katherine-kalill/');
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: /LinkedIn/ }),
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/katherine-kalill/');
  await expect(
    page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'katherinerkalill@gmail.com' }),
  ).toHaveAttribute('href', 'mailto:katherinerkalill@gmail.com');
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: 'Archive' }),
  ).toHaveAttribute('href', `${base}/archive/`);
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: 'About' }),
  ).toHaveAttribute('href', `${base}/about/`);
  await expect(
    page
      .getByRole('contentinfo')
      .getByRole('link', { name: /Photo credit · All City Mile/ }),
  ).toHaveAttribute('href', `${base}/work/all-city-mile/#credits`);

  const cards = page.locator('[data-project-id]');
  await expect(cards).toHaveCount(slugs.length);
  expect(
    await cards.evaluateAll((items) =>
      items.map((item) => item.getAttribute('data-project-id')),
    ),
  ).toEqual(slugs);
  for (const slug of slugs) {
    const card = page.locator(`[data-project-id="${slug}"]`);
    await expect(card.getByRole('link')).toHaveAttribute(
      'href',
      `${base}/work/${slug}/`,
    );
  }

  const nav = page.locator('[data-site-navigation] a');
  const navHrefs = await nav.evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );
  expect(navHrefs).toEqual(['#work', `${base}/about/`, '#contact']);
  for (const href of navHrefs) {
    expect(href).toBeTruthy();
  }
  await expect(page.locator('#work')).toHaveCount(1);
  await expect(page.locator('#contact')).toHaveCount(1);

  const collaboratorList = page.getByRole('list', {
    name: 'Brands and collaborators',
  });
  await expect(collaboratorList.getByRole('listitem')).toHaveCount(7);
  expect(
    await collaboratorList
      .locator('.collaborator-list__name')
      .allTextContents(),
  ).toEqual(collaborators.map(([name]) => name));
  for (const [name, relationship, slug, chapter] of collaborators) {
    const link = collaboratorList.getByRole('link', { name: new RegExp(name) });
    await expect(link).toBeVisible();
    await expect(link).toContainText(relationship);
    await expect(link).toHaveAttribute(
      'href',
      chapter
        ? `${base}/work/${slug}/#chapter-${chapter}`
        : `${base}/work/${slug}/`,
    );
    await expect(link.locator('img')).not.toHaveCount(0);
  }
  const allCityMileLink = collaboratorList.getByRole('link', {
    name: /All City Mile/,
  });
  await expect(allCityMileLink).not.toHaveAttribute(
    'aria-describedby',
    /credit/,
  );
  await expect(page.locator('#all-city-mile-photo-credit')).toHaveCount(0);
  await expect(
    page
      .getByRole('contentinfo')
      .getByRole('link', { name: /Photo credit · All City Mile/ }),
  ).toBeVisible();

  const fontHref = await page
    .locator('link[rel="preload"][as="font"]')
    .getAttribute('href');
  expect(fontHref).toBeTruthy();
  const fontResponse = await request.get(new URL(fontHref!, home!.url()).href);
  expect(fontResponse.status()).toBe(200);

  for (const [index, slug] of slugs.entries()) {
    const path = `${base}/work/${slug}/`;
    const response = await page.goto(path);
    expect(response?.status(), `${path} should be published`).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    const storyNav = page.locator('[data-site-navigation] a');
    await expect(storyNav).toHaveText(['Work', 'About', 'Contact']);
    expect(
      await storyNav.evaluateAll((links) =>
        links.map((link) => link.getAttribute('href')),
      ),
    ).toEqual([`${base}/#work`, `${base}/about/`, `${base}/#contact`]);
    await expect(storyNav.nth(0)).toHaveAttribute('aria-current', 'location');
    await expect(storyNav.nth(1)).not.toHaveAttribute('aria-current');
    await expect(storyNav.nth(2)).not.toHaveAttribute('aria-current');
    await expect(
      page.locator(
        `[data-case-study="${slug}"] .case-study__body > section h2`,
      ),
    ).toHaveText(['Overview', 'Approach', 'Experience', 'Impact and credits']);
    const story = page.locator(`[data-case-study="${slug}"]`);
    for (const fact of storyFacts[index] ?? []) {
      await expect(story).toContainText(fact);
    }
    if (slug === 'all-city-mile') {
      for (const claim of ['300+', '30+', '$5,000'])
        await expect(story).toContainText(claim);
      await expect(story).toContainText('Cooper Reid');
    }
    const chapterIds: Record<string, string[]> = {
      'for-all-mothers': [
        'caregiving-and-competition',
        'family-support-at-the-games',
        'stories-for-social-and-beyond',
      ],
      'usa-track-championships': [
        'community-run',
        'live-podcast-coverage',
        'athlete-house',
      ],
      'all-city-mile': ['race-day-format'],
      'your-mothers-run-crew': ['goop', 'little-words-project'],
      'freaks-of-nature': [
        'shared-outdoor-culture',
        'back-in-bed',
        'event-content',
      ],
      'you-deserve-your-flowers': ['event-activation', 'community-response'],
      'womens-self-defense': ['community-led-event', 'retail-context'],
    };
    expect(
      await story
        .locator('.case-study__chapter')
        .evaluateAll((chapters) =>
          chapters.map((chapter) => chapter.id.replace(/^chapter-/, '')),
        ),
    ).toEqual(chapterIds[slug]);
    if (slug === 'womens-self-defense') {
      await expect(story).toContainText('225%');
      await expect(story).toContainText(
        /not attributed to it|not presented as an event-attributed result/i,
      );
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://katherinekalill.github.io${path}`,
    );
    const expectedProject = projectMetadata[index];
    expect(expectedProject?.slug).toBe(slug);
    expect(expectedProject).toBeDefined();
    expect(
      await story.locator('.case-study__hero img').getAttribute('src'),
    ).toContain(expectedProject!.image.src);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'article',
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      `https://katherinekalill.github.io${path}`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      `${expectedProject?.name} — Katherine Kalill`,
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute('content', expectedProject?.description ?? '');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `https://katherinekalill.github.io${base}${expectedProject?.image.src}`,
    );
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      'content',
      expectedProject?.image.alt ?? '',
    );
    await expect(
      page.locator('meta[property="og:image:width"]'),
    ).toHaveAttribute('content', String(expectedProject?.image.width));
    await expect(
      page.locator('meta[property="og:image:height"]'),
    ).toHaveAttribute('content', String(expectedProject?.image.height));
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      `https://katherinekalill.github.io${base}${expectedProject?.image.src}`,
    );
    await expect(
      page.locator('meta[name="twitter:image:alt"]'),
    ).toHaveAttribute('content', expectedProject?.image.alt ?? '');
    const personId = `https://katherinekalill.github.io${base}/#person`;
    const storyStructuredData = await readStructuredData(page);
    expect(storyStructuredData).toEqual([
      expectedPersonStructuredData(),
      expectedWebsiteStructuredData(),
      {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: expectedProject?.name,
        headline: expectedProject?.name,
        description: expectedProject?.description,
        url: `https://katherinekalill.github.io${path}`,
        image: {
          '@type': 'ImageObject',
          url: `https://katherinekalill.github.io${base}${expectedProject?.image.src}`,
          width: expectedProject?.image.width,
          height: expectedProject?.image.height,
          caption: expectedProject?.image.alt,
        },
        creator: { '@id': personId },
      },
    ]);
    const pagination = page.getByRole('navigation', {
      name: 'Featured project navigation',
    });
    await expect(pagination).toBeVisible();
    await expect(
      pagination.getByRole('link', { name: 'All featured work' }),
    ).toHaveAttribute('href', `${base}/#work`);
    const previous = pagination.getByRole('link', { name: /Previous/ });
    const next = pagination.getByRole('link', { name: /Next/ });
    if (index === 0) await expect(previous).toHaveCount(0);
    else
      await expect(previous).toHaveAttribute(
        'href',
        `${base}/work/${slugs[index - 1]}/`,
      );
    if (index === slugs.length - 1) await expect(next).toHaveCount(0);
    else
      await expect(next).toHaveAttribute(
        'href',
        `${base}/work/${slugs[index + 1]}/`,
      );
  }

  // Check every same-site link target and every raster source emitted on public
  // pages, including responsive srcset candidates.
  const routePaths = [
    `${base}/`,
    `${base}/archive/`,
    `${base}/about/`,
    ...publicProjectSlugs.map((slug) => `${base}/work/${slug}/`),
  ];
  const routeIds = new Map<string, Set<string>>();
  const fragmentLinks: Array<{ pathname: string; fragment: string }> = [];
  for (const route of routePaths) {
    await page.goto(route);
    routeIds.set(
      route,
      new Set(
        await page
          .locator('[id]')
          .evaluateAll((items) => items.map((item) => item.id)),
      ),
    );
    const links = await page
      .locator('a[href]')
      .evaluateAll((anchors) =>
        anchors.map((anchor) => anchor.getAttribute('href')!).filter(Boolean),
      );
    const localTargets = new Set<string>();
    for (const href of links) {
      if (/^(mailto:|tel:|https?:\/\/)/i.test(href)) continue;
      const target = new URL(href, `https://local.test${route}`);
      if (target.origin !== 'https://local.test') continue;
      expect(target.pathname.startsWith(`${base}/`)).toBe(true);
      expect(target.pathname.split(base).length - 1).toBe(1);
      localTargets.add(`${target.pathname}${target.search}`);
      if (target.hash) {
        fragmentLinks.push({
          pathname: target.pathname,
          fragment: decodeURIComponent(target.hash.slice(1)),
        });
      }
    }
    for (const target of localTargets) {
      const checked = await request.get(target);
      expect(checked.status(), `${route} links to ${target}`).toBe(200);
    }

    const imageSources = await page.locator('img').evaluateAll((images) =>
      images.flatMap((image) => {
        const sources = [image.getAttribute('src')];
        const srcset = image.getAttribute('srcset');
        const candidates = srcset
          ? srcset
              .split(',')
              .map((candidate) => candidate.trim().split(/\s+/)[0])
              .filter((source): source is string => Boolean(source))
          : [];
        return [...sources, ...candidates].filter((source): source is string =>
          Boolean(source),
        );
      }),
    );
    expect(
      imageSources.length,
      `${route} should have published media`,
    ).toBeGreaterThan(0);
    for (const source of new Set(imageSources)) {
      const target = new URL(source, `https://local.test${route}`);
      expect(target.pathname.startsWith(`${base}/`)).toBe(true);
      const imageResponse = await request.get(target.pathname);
      expect(imageResponse.status(), `${route} image ${target.pathname}`).toBe(
        200,
      );
      expect(imageResponse.headers()['content-type']).toMatch(/^image\//);
    }
  }
  for (const { pathname, fragment } of fragmentLinks) {
    expect(
      routeIds.get(pathname),
      `fragment destination ${pathname}`,
    ).toBeDefined();
    expect(
      routeIds.get(pathname)?.has(fragment),
      `fragment #${fragment} on ${pathname}`,
    ).toBe(true);
  }

  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.setViewportSize({ width: 320, height: 780 });
  expect(
    await page.locator('body').evaluate((body) => body.scrollWidth),
  ).toBeLessThanOrEqual(320);
  expect(consoleErrors).toEqual([]);
});

test('homepage background cycling honors pause, reduced motion, and decode failures', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${base}/`);
  const toggle = page.locator('[data-hero-toggle]');
  const layers = page.locator('[data-hero-layer]');
  await expect(layers.nth(0)).toHaveClass(/is-visible/);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Play background images');
  await page.waitForTimeout(1100);
  await expect(layers.nth(0)).toHaveClass(/is-visible/);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Pause background images');
  await expect
    .poll(() =>
      layers.nth(1).evaluate((layer) => layer.classList.contains('is-visible')),
    )
    .toBe(true);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Play background images');
  await page.waitForTimeout(1100);
  await expect(layers.nth(1)).toHaveClass(/is-visible/);
  await toggle.focus();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-disabled', 'true');
  await expect(toggle).toHaveAttribute(
    'aria-label',
    'Background image playback unavailable',
  );
  await expect(layers.nth(0)).toHaveClass(/is-visible/);
  await expect(layers.nth(1)).not.toHaveClass(/is-visible/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-disabled', 'false');
  await expect(toggle).toHaveAttribute('aria-label', 'Play background images');
  await expect(layers.nth(0)).toHaveClass(/is-visible/);
  await toggle.click();
  await expect
    .poll(() =>
      layers.nth(1).evaluate((layer) => layer.classList.contains('is-visible')),
    )
    .toBe(true);

  await page.route('**/work/all-city-mile-hero*', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const failedHeroRequest = page.waitForEvent('requestfailed', (request) =>
    request.url().includes('all-city-mile-hero'),
  );
  await page.reload();
  await failedHeroRequest;
  await expect(layers.nth(0)).toHaveClass(/is-visible/);
  await expect
    .poll(() => layers.nth(1).locator('img').getAttribute('src'))
    .toContain('all-city-mile-huddle');
  await expect(layers.nth(1)).toHaveClass(/is-visible/);
});

test('homepage background completes the ten-frame loop on the 4000 ms clock', async ({
  page,
}) => {
  await installPausedClock(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${base}/`);
  const layers = page.locator('[data-hero-layer]');
  await page
    .locator('[data-headshot-source]')
    .evaluate((image) => (image as HTMLImageElement).decode());
  await waitForHeroIntersection(page, true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page
    .locator('[data-hero-layer="1"] img')
    .evaluate((image) => (image as HTMLImageElement).decode());

  await page.clock.runFor(3999);
  await expect(layers.nth(0)).toHaveClass(/is-visible/);
  await page.clock.runFor(1);

  const sequence = [
    'all-city-mile-hero',
    'all-city-mile-huddle',
    'freaks-of-nature-hero',
    'womens-self-defense-hero',
    'womens-self-defense-partner',
    'all-city-mile-community',
    'all-city-mile-results',
    'usa-track-championships-community',
    'usa-track-championships-collaborators',
  ];
  for (const mediaId of sequence) {
    const active = page.locator('.homepage-hero__layer.is-visible');
    await expect(active.locator('img')).toHaveAttribute(
      'src',
      new RegExp(mediaId),
    );
    await page.clock.runFor(4000);
  }
  await expect(
    page.locator('.homepage-hero__layer.is-visible [data-headshot-source]'),
  ).toHaveCount(1);
  await page.clock.runFor(4000);
  await expect(
    page.locator('.homepage-hero__layer.is-visible img'),
  ).toHaveAttribute('src', /all-city-mile-hero/);
});

test('homepage waits for the high-priority headshot before starting its clock', async ({
  page,
}) => {
  let releaseHeadshot!: () => void;
  let markRequested!: () => void;
  const imageGate = new Promise<void>((resolve) => {
    releaseHeadshot = resolve;
  });
  const imageRequested = new Promise<void>((resolve) => {
    markRequested = resolve;
  });
  await installPausedClock(page);
  await page.route('**/katherine-kalill-headshot*', async (route) => {
    const response = await route.fetch();
    markRequested();
    await imageGate;
    await route.fulfill({ response });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  const headshot = page.locator('[data-headshot-source]');
  const layers = page.locator('[data-hero-layer]');
  await expect(headshot).toHaveAttribute('fetchpriority', 'high');
  await imageRequested;
  await waitForHeroIntersection(page, true);
  await page.clock.runFor(5000);
  await expect(layers.nth(0)).toHaveClass(/is-visible/);
  await expect(layers.nth(1).locator('img')).toHaveCount(0);

  releaseHeadshot();
  await headshot.evaluate((image) => (image as HTMLImageElement).decode());
  await page
    .locator('[data-hero-layer="1"] img')
    .evaluate((image) => (image as HTMLImageElement).decode());
  await page.clock.runFor(3999);
  await expect(layers.nth(0)).toHaveClass(/is-visible/);
  await page.clock.runFor(1);
  await expect(layers.nth(1)).toHaveClass(/is-visible/);
});

test('homepage background suspends offscreen and starts a fresh interval when visible', async ({
  page,
}) => {
  await installPausedClock(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${base}/`);
  const hero = page.locator('.homepage-hero');
  const layers = page.locator('[data-hero-layer]');
  await page
    .locator('[data-headshot-source]')
    .evaluate((image) => (image as HTMLImageElement).decode());
  await waitForHeroIntersection(page, true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page
    .locator('[data-hero-layer="1"] img')
    .evaluate((image) => (image as HTMLImageElement).decode());
  await page.clock.runFor(4000);
  await expect(layers.nth(1)).toHaveClass(/is-visible/);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.clock.runFor(16);
  await waitForHeroIntersection(page, false);
  await expect
    .poll(() =>
      hero.evaluate((element) => element.getBoundingClientRect().bottom),
    )
    .toBeLessThanOrEqual(0);
  await page.clock.runFor(5000);
  await expect(layers.nth(1)).toHaveClass(/is-visible/);
  await expect(layers.nth(1).locator('img')).toHaveAttribute(
    'src',
    /all-city-mile-hero/,
  );

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.clock.runFor(16);
  await waitForHeroIntersection(page, true);
  await expect
    .poll(() =>
      hero.evaluate((element) => element.getBoundingClientRect().bottom > 0),
    )
    .toBe(true);
  await page
    .locator('[data-hero-layer="0"] img')
    .evaluate((image) => (image as HTMLImageElement).decode());
  await page.clock.runFor(900);
  await expect(layers.nth(1)).toHaveClass(/is-visible/);
  await page.clock.runFor(200);
  await expect(layers.nth(0)).toHaveClass(/is-visible/);
  await expect(layers.nth(0).locator('img')).toHaveAttribute(
    'src',
    /all-city-mile-huddle/,
  );
});

test('homepage keeps the visible frame while the next image request is delayed', async ({
  page,
}) => {
  let releaseImage!: () => void;
  let markRequested!: () => void;
  const imageGate = new Promise<void>((resolve) => {
    releaseImage = resolve;
  });
  const imageRequested = new Promise<void>((resolve) => {
    markRequested = resolve;
  });
  await page.route('**/work/all-city-mile-hero*', async (route) => {
    const response = await route.fetch();
    markRequested();
    await imageGate;
    await route.fulfill({ response });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  const layers = page.locator('[data-hero-layer]');
  await page
    .locator('[data-headshot-source]')
    .evaluate((image) => (image as HTMLImageElement).decode());
  await waitForHeroIntersection(page, true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await imageRequested;
  await page.waitForTimeout(1100);
  await expect(layers.nth(0)).toHaveClass(/is-visible/);
  await expect(layers.nth(1)).not.toHaveClass(/is-visible/);
  releaseImage();
  await layers
    .nth(1)
    .locator('img')
    .evaluate((image) => (image as HTMLImageElement).decode());
  await expect(layers.nth(1)).toHaveClass(/is-visible/);
});

test('homepage hero keeps its copy inside the frame on narrow and zoomed screens', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${base}/`);
  await page.setViewportSize({ width: 320, height: 700 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.homepage-hero__description')).toBeVisible();
  expect(
    await page.locator('body').evaluate((body) => body.scrollWidth),
  ).toBeLessThanOrEqual(320);
  let bounds = await page.evaluate(() => {
    const heroBounds = document
      .querySelector('.homepage-hero')!
      .getBoundingClientRect();
    const copyBounds = document
      .querySelector('.homepage-hero__content')!
      .getBoundingClientRect();
    return { heroBottom: heroBounds.bottom, copyBottom: copyBounds.bottom };
  });
  expect(bounds.copyBottom).toBeLessThanOrEqual(bounds.heroBottom + 1);

  await page.setViewportSize({ width: 1280, height: 360 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '200%';
  });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.homepage-hero__description')).toBeVisible();
  bounds = await page.evaluate(() => {
    const heroBounds = document
      .querySelector('.homepage-hero')!
      .getBoundingClientRect();
    const copyBounds = document
      .querySelector('.homepage-hero__content')!
      .getBoundingClientRect();
    return { heroBottom: heroBounds.bottom, copyBottom: copyBounds.bottom };
  });
  expect(bounds.copyBottom).toBeLessThanOrEqual(bounds.heroBottom + 1);
  expect(
    await page.locator('body').evaluate((body) => body.scrollWidth),
  ).toBeLessThanOrEqual(1280);
});

test('Cortina and USA Track stories publish their approved facts, imagery, and metadata', async ({
  page,
}) => {
  const cases = [
    {
      slug: 'for-all-mothers',
      title: 'Making Space for Motherhood in Elite Sport',
      name: 'Making Space for Motherhood in Elite Sport',
      description:
        'Capturing the realities of motherhood alongside elite sport at the Winter Olympics in Cortina.',
      image: {
        src: '/work/cortina-family-curling.webp',
        alt: 'A spectator holds a young child while watching a curling match in an Olympic arena.',
        width: 1170,
        height: 2048,
      },
      facts: [
        'For All Mothers grants helped families bring children to the Games',
        'Joie Baby products supported them there',
        'edited two social reels',
        'Kelly Curtis',
        'Kaillie Humphries',
        'Tabitha and Tara Peterson',
      ],
      imageAlts: [
        'A spectator holds a young child while watching a curling match in an Olympic arena.',
        'Families share a shuttle ride between Winter Games venues, with a child beside an adult in a blue jacket.',
        'Two Team USA athletes celebrate in competition suits, holding mascots and wearing medals.',
      ],
    },
    {
      slug: 'usa-track-championships',
      title: 'Bringing Professional Athletes and Community Together',
      name: 'Bringing Professional Athletes and Community Together',
      description:
        'Partnered with Citius Magazine to curate community and athlete spotlights across the 2025 USA Track Championships in Eugene.',
      image: {
        src: '/work/usa-track-championships-community.webp',
        alt: 'A large group gathers behind a New Balance banner beneath a Citius Magazine logo.',
        width: 1290,
        height: 915,
      },
      facts: [
        'Eugene',
        'Emma Coburn',
        'SC Elite racing shoes and the Rebel',
        '200+ people',
        'Sydney McLaughlin-Levrone',
        'athlete-house decor',
      ],
      imageAlts: [
        'A large group gathers behind a New Balance banner beneath a Citius Magazine logo.',
        'Runners pose in front of a Citius Magazine and New Balance backdrop.',
      ],
    },
  ];
  const personId = `https://katherinekalill.github.io${base}/#person`;

  for (const item of cases) {
    const path = `${base}/work/${item.slug}/`;
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toContainText(item.title);
    const story = page.locator(`[data-case-study="${item.slug}"]`);
    for (const fact of item.facts) await expect(story).toContainText(fact);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      `${item.name} — Katherine Kalill`,
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute('content', item.description);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `https://katherinekalill.github.io${base}${item.image.src}`,
    );
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      'content',
      item.image.alt,
    );
    await expect(
      page.locator('meta[property="og:image:width"]'),
    ).toHaveAttribute('content', String(item.image.width));
    await expect(
      page.locator('meta[property="og:image:height"]'),
    ).toHaveAttribute('content', String(item.image.height));
    for (const alt of item.imageAlts) {
      const image = story.getByAltText(alt);
      await expect(image).toBeVisible();
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate((node: HTMLImageElement) => node.naturalWidth),
        )
        .toBeGreaterThan(0);
    }
    expect(await readStructuredData(page)).toEqual([
      expectedPersonStructuredData(),
      expectedWebsiteStructuredData(),
      {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: item.name,
        headline: item.name,
        description: item.description,
        url: `https://katherinekalill.github.io${path}`,
        image: {
          '@type': 'ImageObject',
          url: `https://katherinekalill.github.io${base}${item.image.src}`,
          width: item.image.width,
          height: item.image.height,
          caption: item.image.alt,
        },
        creator: { '@id': personId },
      },
    ]);
  }
});

test('published story heroes sit beside their copy and keep approved image behavior', async ({
  page,
}) => {
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of slugs) {
      await page.goto(`${base}/work/${slug}/`);
      await waitForEntranceAnimations(page);
      const article = page.locator('.case-study--has-hero');
      const header = article.locator('.case-study__header');
      const hero = article.locator('.case-study__hero');
      const image = hero.locator('img');
      await expect(header).toBeVisible();
      await expect(hero).toHaveCount(1);
      await expect(image).toHaveAttribute('loading', 'eager');
      await expect(image).not.toHaveAttribute('data-parallax', '');
      await expect(image).toHaveAttribute('width', /\d+/);
      await expect(image).toHaveAttribute('height', /\d+/);
      await expect(article.locator('.case-study__body')).toBeVisible();

      const media = await image.evaluate((element: HTMLImageElement) => ({
        fit: getComputedStyle(element).objectFit,
        width: element.naturalWidth,
        height: element.naturalHeight,
        loaded: element.complete && element.naturalWidth > 0,
      }));
      expect(media.fit).toBe('contain');
      expect(media.loaded).toBe(true);
      expect(media.width).toBeGreaterThan(0);
      expect(media.height).toBeGreaterThan(0);

      const [headerBounds, heroBounds, frameBounds] = await Promise.all([
        header.boundingBox(),
        hero.boundingBox(),
        hero.locator('.media-frame__content').boundingBox(),
      ]);
      expect(headerBounds).not.toBeNull();
      expect(heroBounds).not.toBeNull();
      expect(frameBounds).not.toBeNull();
      expect(heroBounds!.x).toBeGreaterThan(
        headerBounds!.x + headerBounds!.width / 2,
      );
      expect(frameBounds!.height).toBeLessThanOrEqual(480 + 1);
      expect(frameBounds!.height).toBeLessThanOrEqual(900 * 0.65 + 1);
      await expect(
        article.locator('.case-study__body img[data-parallax]').first(),
      ).toBeAttached();
    }
  }
});

test('published story overview fits at desktop and the hero stacks below the desktop breakpoint', async ({
  page,
}) => {
  const route = `${base}/work/all-city-mile/`;
  for (const width of [1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await waitForEntranceAnimations(page);
    await expect(
      page.getByRole('heading', { name: 'Overview', level: 2 }),
    ).toBeInViewport();
    const [headerBounds, heroBounds] = await Promise.all([
      page.locator('.case-study__header').boundingBox(),
      page.locator('.case-study__hero').boundingBox(),
    ]);
    expect(heroBounds!.x).toBeGreaterThan(
      headerBounds!.x + headerBounds!.width / 2,
    );
  }

  await page.setViewportSize({ width: 1023, height: 720 });
  await page.goto(route);
  await waitForEntranceAnimations(page);
  await expect(page.locator('.case-study--has-hero')).toHaveCSS(
    'display',
    'block',
  );
  const [headerBounds, heroBounds, frameBounds] = await Promise.all([
    page.locator('.case-study__header').boundingBox(),
    page.locator('.case-study__hero').boundingBox(),
    page.locator('.case-study__hero .media-frame__content').boundingBox(),
  ]);
  expect(heroBounds!.y).toBeGreaterThanOrEqual(
    headerBounds!.y + headerBounds!.height,
  );
  expect(frameBounds!.height).toBeLessThanOrEqual(360 + 1);
  expect(frameBounds!.height).toBeLessThanOrEqual(720 * 0.5 + 1);
  expect(
    await page.locator('body').evaluate((body) => body.scrollWidth),
  ).toBeLessThanOrEqual(1023);
});

test('featured story zoom responds to hover and focus independently of parallax', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${base}/`);
  const story = page.locator('.featured-story').first();
  const link = story.getByRole('link');
  const zoom = story.locator('.media-frame__zoom--enabled');
  const image = story.locator('img[data-parallax]');
  await link.scrollIntoViewIfNeeded();
  await waitForEntranceAnimations(page);
  const before = await page.evaluate(() => {
    const story = document.querySelector<HTMLElement>('.featured-story')!;
    const bounds = (selector: string) => {
      const element = story.querySelector<HTMLElement>(selector)!;
      return {
        top: element.offsetTop,
        left: element.offsetLeft,
        width: element.offsetWidth,
        height: element.offsetHeight,
      };
    };
    return {
      frame: bounds('.featured-story__image .media-frame__content'),
      copy: bounds('.featured-story__copy'),
      imageScale: (() => {
        const image = story.querySelector<HTMLElement>('img[data-parallax]')!;
        const matrix = new DOMMatrixReadOnly(getComputedStyle(image).transform);
        return [matrix.a, matrix.b, matrix.c, matrix.d];
      })(),
    };
  });

  await link.hover();
  await expect(zoom).toHaveCSS('transform', 'matrix(1.035, 0, 0, 1.035, 0, 0)');
  expect(
    await image.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return [matrix.a, matrix.b, matrix.c, matrix.d];
    }),
  ).toEqual(before.imageScale);

  const afterHover = await page.evaluate(() => {
    const story = document.querySelector<HTMLElement>('.featured-story')!;
    const bounds = (selector: string) => {
      const element = story.querySelector<HTMLElement>(selector)!;
      return {
        top: element.offsetTop,
        left: element.offsetLeft,
        width: element.offsetWidth,
        height: element.offsetHeight,
      };
    };
    return {
      frame: bounds('.featured-story__image .media-frame__content'),
      copy: bounds('.featured-story__copy'),
    };
  });
  expect(afterHover).toEqual({ frame: before.frame, copy: before.copy });

  await page.mouse.move(1, 1);
  await expect(zoom).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await page.keyboard.press('Tab');
  await link.focus();
  await expect(link).toBeFocused();
  expect(
    await link.evaluate((element) => element.matches(':focus-visible')),
  ).toBe(true);
  await expect(zoom).toHaveCSS('transform', 'matrix(1.035, 0, 0, 1.035, 0, 0)');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(zoom).toHaveCSS('transform', 'none');
  await expect(zoom).toHaveCSS('transition-duration', '0s');
  await expect(image).toHaveCSS('transform', 'none');
});

test('published pages remain accessible and fit phone and desktop viewports', async ({
  page,
}) => {
  const routes = [`${base}/`, ...slugs.map((slug) => `${base}/work/${slug}/`)];

  for (const route of routes) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({
      reducedMotion: route === `${base}/` ? 'reduce' : 'no-preference',
    });
    await page.goto(route);
    await waitForEntranceAnimations(page);
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations, `${route} accessibility`).toEqual([]);

    const loadedImages = await page.evaluate(async () => {
      await document.fonts.ready;
      const images = Array.from(document.images);
      return Promise.all(
        images.map(async (image) => {
          image.loading = 'eager';
          try {
            await image.decode();
          } catch {
            return { src: image.currentSrc || image.src, loaded: false };
          }
          return {
            src: image.currentSrc || image.src,
            loaded: image.complete && image.naturalWidth > 0,
          };
        }),
      );
    });
    expect(loadedImages.length, `${route} published images`).toBeGreaterThan(0);
    expect(
      loadedImages.filter(({ loaded }) => !loaded).map(({ src }) => src),
    ).toEqual([]);

    await page.setViewportSize({ width: 320, height: 780 });
    const phoneWidth = await page
      .locator('body')
      .evaluate((body) => body.scrollWidth);
    const overflowingElements = await page.locator('body').evaluate((body) =>
      Array.from(body.querySelectorAll<HTMLElement>('*'))
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            className:
              typeof element.className === 'string' ? element.className : '',
            left: Math.round(bounds.left),
            right: Math.round(bounds.right),
            width: Math.round(bounds.width),
          };
        })
        .filter((element) => element.right > 321 || element.left < -1)
        .slice(0, 8),
    );
    expect(
      phoneWidth,
      `${route} phone layout ${JSON.stringify(overflowingElements)}`,
    ).toBeLessThanOrEqual(320);
    if (route === `${base}/`) {
      const firstCard = page.locator('[data-project-id="all-city-mile"]');
      await expect(firstCard.locator('.featured-story__credit')).toHaveCount(0);
      await expect(firstCard).not.toContainText('Cooper Reid');
    }
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      expect(
        await page.locator('body').evaluate((body) => body.scrollWidth),
        `${route} at ${width}px`,
      ).toBeLessThanOrEqual(width);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    expect(
      await page.locator('body').evaluate((body) => body.scrollWidth),
      `${route} desktop layout`,
    ).toBeLessThanOrEqual(1440);
    if (route === `${base}/`) {
      await expect(
        page.locator(
          '[data-project-id="all-city-mile"] .featured-story__credit',
        ),
      ).toHaveCount(0);
    }
  }
});

test('each published story runs its initial title, metadata, and image entrances', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const nativeAnimate = Element.prototype.animate;
    window.__publicStoryEntrances = [];
    Element.prototype.animate = function (keyframes, options) {
      window.__publicStoryEntrances?.push({
        kind: this.getAttribute('data-reveal') ?? '',
        text: this.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      });
      return nativeAnimate.call(this, keyframes, options);
    };
  });

  for (const [index, slug] of slugs.entries()) {
    if (index > 0) {
      await page.evaluate(() => {
        sessionStorage.setItem('public-story-entrances', '[]');
      });
    }
    await page.goto(`${base}/work/${slug}/`);
    const title = storyTitles[index];
    await expect(page.locator('main h1')).toHaveText(title!);
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window.__publicStoryEntrances ?? []).some(
            ({ kind, text }) =>
              kind === 'story-title' &&
              text ===
                document
                  .querySelector('main h1')
                  ?.textContent?.replace(/\s+/g, ' ')
                  .trim(),
          ),
        ),
      )
      .toBe(true);
    await page
      .locator('.case-study__hero[data-reveal="image"]')
      .scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window.__publicStoryEntrances ?? []).some(
            ({ kind }) => kind === 'story-meta',
          ),
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window.__publicStoryEntrances ?? []).some(
            ({ kind }) => kind === 'image',
          ),
        ),
      )
      .toBe(true);
  }
});

test('archive filters, query history, empty category, and progressive enhancement work', async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/archive/`);
  await expect(page.getByRole('heading', { name: 'Archive' })).toBeVisible();

  const cards = page.locator('[data-archive-card]');
  await expect(cards).toHaveCount(7);
  await expect(page.locator('[data-archive-card] img')).toHaveCount(7);
  expect(
    await cards.evaluateAll((items) =>
      items.map((item) =>
        item.querySelector('a')?.getAttribute('href')?.split('/').at(-2),
      ),
    ),
  ).toEqual(slugs);
  await expect(
    page.locator('[data-archive-card] a[href$="/work/for-all-mothers/"]'),
  ).toContainText('Joie Baby × For All Mothers');
  await expect(
    page.locator('[data-archive-card] a[href$="/work/for-all-mothers/"]'),
  ).toContainText('Making Space for Motherhood in Elite Sport');
  await expect(
    page.locator(
      '[data-archive-card] a[href$="/work/usa-track-championships/"]',
    ),
  ).toContainText('Bringing Professional Athletes and Community Together');

  const filters = page.locator('[data-archive-filters]');
  await expect(filters).toBeVisible();
  const buttons = filters.locator('[data-archive-filter]');
  await expect(buttons).toHaveCount(8);
  await expect(buttons).toHaveText([
    'All',
    'Community',
    'Partnerships',
    'Experiences',
    'Digital',
    'Retail',
    'Luxury Strategy',
    'Owned Platform',
  ]);
  const count = page.locator('[data-archive-count]');
  const visibleSlugs = async () =>
    cards.evaluateAll((items) =>
      items
        .filter((item) => !item.hasAttribute('hidden'))
        .map((item) =>
          item.querySelector('a')?.getAttribute('href')?.split('/').at(-2),
        ),
    );

  for (const category of ['community', 'partnerships', 'experiences']) {
    await page.locator(`[data-archive-filter="${category}"]`).click();
    await expect(count).toHaveText('7 projects');
    expect(await visibleSlugs()).toEqual(slugs);
  }

  await page.locator('[data-archive-filter="digital"]').click();
  await expect(page).toHaveURL(
    new RegExp(`${base}/archive/\\?discipline=digital$`),
  );
  await expect(count).toHaveText('2 projects');
  await expect(buttons.nth(4)).toHaveAttribute('aria-pressed', 'true');
  expect(await visibleSlugs()).toEqual(['freaks-of-nature', 'for-all-mothers']);

  await page.locator('[data-archive-filter="retail"]').click();
  await expect(page).toHaveURL(
    new RegExp(`${base}/archive/\\?discipline=retail$`),
  );
  await expect(count).toHaveText('1 project');
  expect(await visibleSlugs()).toEqual(['womens-self-defense']);
  await page.goBack();
  await expect(buttons.nth(4)).toHaveAttribute('aria-pressed', 'true');
  expect(await visibleSlugs()).toEqual(['freaks-of-nature', 'for-all-mothers']);
  await page.goForward();
  await expect(buttons.nth(5)).toHaveAttribute('aria-pressed', 'true');
  expect(await visibleSlugs()).toEqual(['womens-self-defense']);

  await page.locator('[data-archive-filter="luxury-strategy"]').click();
  await expect(page).toHaveURL(
    new RegExp(`${base}/archive/\\?discipline=luxury-strategy$`),
  );
  await expect(count).toHaveText('0 projects');
  await expect(page.locator('[data-archive-empty]')).toBeVisible();
  await page.locator('[data-archive-reset]').focus();
  await page.keyboard.press('Enter');
  await expect(buttons.first()).toBeFocused();
  await expect(page).toHaveURL(`${base}/archive/`);
  await expect(count).toHaveText('7 projects');
  await expect(page.locator('[data-archive-empty]')).toBeHidden();

  await page.locator('[data-archive-filter="owned-platform"]').click();
  await expect(count).toHaveText('1 project');
  expect(await visibleSlugs()).toEqual(['your-mothers-run-crew']);

  await page.goto(`${base}/archive/?discipline=not-a-category`);
  await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(count).toHaveText('7 projects');
  expect(await visibleSlugs()).toEqual(slugs);
  await page.locator('[data-archive-filter="all"]').click();
  await expect(page).toHaveURL(`${base}/archive/`);

  await page.locator('[data-archive-filter="digital"]').focus();
  await expect(page.locator('[data-archive-filter="digital"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(count).toHaveText('2 projects');
  await expect(page.locator('[data-archive-filter="digital"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  for (const [width, columns] of [
    [390, 1],
    [768, 2],
    [1280, 3],
  ] as const) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('[data-archive-filter="all"]').click();
    await expect
      .poll(() =>
        page
          .locator('[data-archive-grid]')
          .evaluate(
            (grid) =>
              getComputedStyle(grid).gridTemplateColumns.split(' ').length,
          ),
      )
      .toBe(columns);
    expect(
      await page.locator('body').evaluate((body) => body.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const archiveZoom = page
    .locator('[data-archive-card]')
    .first()
    .locator('.media-frame__zoom--enabled');
  await page.locator('[data-archive-card]').first().hover();
  await expect(archiveZoom).toHaveCSS('transform', 'none');
  await expect(archiveZoom).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations, 'archive accessibility').toEqual([]);

  const noJsContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(`http://127.0.0.1:4321${base}/archive/`);
  await expect(noJsPage.locator('[data-archive-filters]')).toBeHidden();
  await expect(noJsPage.locator('[data-archive-card]')).toHaveCount(7);
  for (const card of await noJsPage.locator('[data-archive-card]').all()) {
    await expect(card).toBeVisible();
  }
  await noJsContext.close();
});

test('About navigation, capability evidence, contact, credits, and approved bio boundaries work', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto(`${base}/about/`);
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', {
      name: 'Katherine Kalill',
      level: 1,
    }),
  ).toBeVisible();
  const portrait = page.getByRole('img', { name: 'Katherine Kalill' });
  await expect(portrait).toBeVisible();
  await expect
    .poll(() =>
      portrait.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);

  const nav = page.locator('[data-site-navigation] a');
  await expect(nav).toHaveText(['Work', 'About', 'Contact']);
  expect(
    await nav.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    ),
  ).toEqual([`${base}/#work`, `${base}/about/`, `${base}/#contact`]);
  await expect(nav.nth(0)).not.toHaveAttribute('aria-current');
  await expect(nav.nth(1)).toHaveAttribute('aria-current', 'page');
  await expect(nav.nth(2)).not.toHaveAttribute('aria-current');
  await nav.nth(0).click();
  await expect(page).toHaveURL(`${base}/#work`);
  await expect(page.locator('#work')).toBeVisible();
  await page.goto(`${base}/about/`);

  const capabilities = page.locator(
    '#about-capabilities .about-page__capability',
  );
  await expect(capabilities).toHaveCount(4);
  const expectedEvidence = [
    [`${base}/work/all-city-mile/`, `${base}/work/you-deserve-your-flowers/`],
    [`${base}/work/your-mothers-run-crew/`, `${base}/work/freaks-of-nature/`],
    [`${base}/work/all-city-mile/`, `${base}/work/womens-self-defense/`],
    [
      `${base}/work/freaks-of-nature/`,
      `${base}/work/you-deserve-your-flowers/`,
    ],
  ];
  for (const [index, capability] of (await capabilities.all()).entries()) {
    expect(
      await capability
        .locator('a')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
    ).toEqual(expectedEvidence[index]);
  }

  const aboutCopy = await page.locator('.about-page').innerText();
  for (const fact of [
    'New Balance',
    'Katherine Kalill Productions',
    'VMware',
    'Your Mothers Run Crew',
    '@kikhianti',
    'Milano Fashion Institute',
  ]) {
    expect(aboutCopy).toContain(fact);
  }
  expect(aboutCopy).not.toMatch(
    /\b(?:graduated|graduation|currently enrolled)\b/i,
  );
  expect(await page.locator('.about-page a[href$=".pdf"]').count()).toBe(0);
  await expect(page.locator('.about-page a[href^="tel:"]')).toHaveCount(0);

  const contacts = page.getByRole('navigation', { name: 'Contact Katherine' });
  await expect(
    contacts.getByRole('link', { name: /@katherine|katherinerkalill/ }),
  ).toHaveAttribute('href', 'mailto:katherinerkalill@gmail.com');
  await expect(
    contacts.getByRole('link', { name: /LinkedIn/ }),
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/katherine-kalill/');

  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: 'Archive' })).toHaveAttribute(
    'href',
    `${base}/archive/`,
  );
  await expect(footer.getByRole('link', { name: 'About' })).toHaveAttribute(
    'href',
    `${base}/about/`,
  );
  await expect(
    footer.getByRole('link', { name: /Photo credit · All City Mile/ }),
  ).toHaveAttribute('href', `${base}/work/all-city-mile/#credits`);

  await nav.nth(2).click();
  await expect(page).toHaveURL(`${base}/#contact`);
  await expect(page.locator('#contact')).toBeVisible();
  await page.goto(`${base}/about/`);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations, 'About accessibility').toEqual([]);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.locator('body').evaluate((body) => body.scrollWidth),
      `About layout at ${width}px`,
    ).toBeLessThanOrEqual(width);
  }

  await page.goto(`${base}/work/all-city-mile/#credits`);
  await expect(page.locator('#credits')).toBeVisible();
  await expect(page.locator('#credits')).toHaveText('With thanks');
});

test('published rail is ordered, labelled, and restores both scroll positions repeatedly', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${base}/`);
  await expect(page.locator('#range')).toHaveCount(1);
  const rail = page.locator('[data-featured-rail]');
  await expect(rail).toHaveJSProperty('tagName', 'OL');
  await expect(rail.locator(':scope > li')).toHaveCount(7);
  await expect(rail.locator('.featured-story__title')).toHaveCount(7);
  await expect(rail.locator('.featured-story__client')).toHaveCount(7);
  await expect(rail.locator('.featured-story__context')).toHaveCount(7);

  const next = page.getByRole('button', { name: 'Next project' });
  const previous = page.getByRole('button', { name: 'Previous project' });
  const lastFeaturedSlug = slugs.at(-1);
  await next.scrollIntoViewIfNeeded();
  while (await next.isEnabled()) await next.click();
  const story = rail.locator(':scope > li').last().getByRole('link');
  await story.scrollIntoViewIfNeeded();
  const initialLeft = await rail.evaluate((element) => element.scrollLeft);
  expect(initialLeft).toBeGreaterThan(0);
  const initialY = await page.evaluate(() => window.scrollY);
  await story.click();
  await expect(page).toHaveURL(`${base}/work/${lastFeaturedSlug}/`);
  await page.goBack();
  await expect(page).toHaveURL(`${base}/`);
  await expect
    .poll(() => rail.evaluate((element) => element.scrollLeft))
    .toBe(initialLeft);
  expect(await page.evaluate(() => window.scrollY)).toBe(initialY);

  await previous.click();
  const secondStoryIndex = slugs.length - 2;
  const secondStory = rail
    .locator(':scope > li')
    .nth(secondStoryIndex)
    .getByRole('link');
  await secondStory.scrollIntoViewIfNeeded();
  await expect
    .poll(() => rail.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  const secondLeft = await rail.evaluate((element) => element.scrollLeft);
  expect(secondLeft).not.toBe(initialLeft);
  const secondY = await page.evaluate(() => window.scrollY);
  await secondStory.click();
  await expect(page).toHaveURL(`${base}/work/${slugs[secondStoryIndex]}/`);
  await page.goBack();
  await expect(page).toHaveURL(`${base}/`);
  await expect
    .poll(() => rail.evaluate((element) => element.scrollLeft))
    .toBe(secondLeft);
  expect(await page.evaluate(() => window.scrollY)).toBe(secondY);
  await expect(previous).toBeEnabled();
});

test('collaborator previews show only for fine-pointer hover and hide on leave', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${base}/`);

  const list = page.getByRole('list', { name: 'Brands and collaborators' });
  const previews = list.locator('.collaborator-list__previews');
  await expect(previews).toHaveCount(7);
  for (const preview of await previews.all()) {
    await expect(preview).toHaveCSS('visibility', 'hidden');
    await expect(preview).toHaveCSS('opacity', '0');
    expect(
      await preview.evaluate((element) =>
        getComputedStyle(element).transitionDuration.split(',')[0]?.trim(),
      ),
    ).toBe('0.32s');
  }

  const allCityMile = list.getByRole('link', { name: /All City Mile/ });
  const hovered = list.getByRole('link', { name: /Freaks of Nature/ });
  await hovered.hover();
  await expect(hovered.locator('.collaborator-list__previews')).toHaveCSS(
    'opacity',
    '1',
  );
  await expect(allCityMile.locator('.collaborator-list__previews')).toHaveCSS(
    'opacity',
    '0',
  );

  await page.mouse.move(1, 1);
  await expect(hovered.locator('.collaborator-list__previews')).toHaveCSS(
    'visibility',
    'hidden',
  );
  await expect(hovered.locator('.collaborator-list__previews')).toHaveCSS(
    'opacity',
    '0',
  );
});

test('keyboard focus overrides pointer hover without reflowing collaborator copy', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${base}/`);

  const list = page.getByRole('list', { name: 'Brands and collaborators' });
  const focused = list.getByRole('link', { name: /All City Mile/ });
  const hovered = list.getByRole('link', { name: /Freaks of Nature/ });
  const name = focused.locator('.collaborator-list__name');
  const relationship = focused.locator('.collaborator-list__relationship');
  await focused.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => {
    const link = document.querySelector<HTMLElement>(
      '.collaborator-list__link',
    )!;
    return {
      link: { width: link.offsetWidth, height: link.offsetHeight },
      relationship: {
        top: link.querySelector<HTMLElement>(
          '.collaborator-list__relationship',
        )!.offsetTop,
        width: link.querySelector<HTMLElement>(
          '.collaborator-list__relationship',
        )!.offsetWidth,
        height: link.querySelector<HTMLElement>(
          '.collaborator-list__relationship',
        )!.offsetHeight,
      },
      fontSize: getComputedStyle(
        link.querySelector<HTMLElement>('.collaborator-list__name')!,
      ).fontSize,
    };
  });

  await page.keyboard.press('Tab');
  await focused.focus();
  expect(
    await focused.evaluate((element) => element.matches(':focus-visible')),
  ).toBe(true);
  await hovered.hover();
  await expect(focused.locator('.collaborator-list__previews')).toHaveCSS(
    'opacity',
    '1',
  );
  await expect(hovered.locator('.collaborator-list__previews')).toHaveCSS(
    'opacity',
    '0',
  );
  await expect(name).toHaveCSS('transform', 'matrix(1.04, 0, 0, 1.04, 0, 0)');

  const after = await page.evaluate(() => {
    const link = document.querySelector<HTMLElement>(
      '.collaborator-list__link',
    )!;
    return {
      link: { width: link.offsetWidth, height: link.offsetHeight },
      relationship: {
        top: link.querySelector<HTMLElement>(
          '.collaborator-list__relationship',
        )!.offsetTop,
        width: link.querySelector<HTMLElement>(
          '.collaborator-list__relationship',
        )!.offsetWidth,
        height: link.querySelector<HTMLElement>(
          '.collaborator-list__relationship',
        )!.offsetHeight,
      },
      fontSize: getComputedStyle(
        link.querySelector<HTMLElement>('.collaborator-list__name')!,
      ).fontSize,
    };
  });
  expect(after.link).toEqual(before.link);
  expect(after.relationship).toEqual(before.relationship);
  expect(after.fontSize).toBe(before.fontSize);
  await expect(relationship).toBeVisible();
});

test('touch-sized collaborator rows keep one static thumbnail per row', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/`);

  const rows = page
    .getByRole('list', { name: 'Brands and collaborators' })
    .getByRole('listitem');
  await expect(rows).toHaveCount(7);
  for (const row of await rows.all()) {
    const previews = row.locator('.collaborator-list__previews');
    await expect(previews).toHaveCSS('visibility', 'visible');
    await expect(previews).toHaveCSS('opacity', '1');
    await expect(
      row.locator('.collaborator-list__preview:visible'),
    ).toHaveCount(1);
    await expect(
      row.locator('.collaborator-list__preview--secondary'),
    ).toBeHidden();
  }
});

test('published home-to-story navigation works by keyboard without JavaScript or motion', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${base}/`);
  await expect(page.locator('#range')).toBeVisible();
  const collaborators = page.getByRole('list', {
    name: 'Brands and collaborators',
  });
  await expect(collaborators.getByRole('listitem')).toHaveCount(7);
  await expect(collaborators.getByRole('link')).toHaveCount(7);
  const allCityMile = collaborators.getByRole('link', {
    name: /All City Mile/,
  });
  await expect(allCityMile).toBeVisible();
  await expect(page.locator('#all-city-mile-photo-credit')).toHaveCount(0);
  await expect(page.locator('[data-hero-controls]')).toBeHidden();
  const preview = allCityMile.locator('.collaborator-list__previews');
  await expect(preview).toHaveCSS('visibility', 'hidden');
  await allCityMile.hover();
  await expect(preview).toHaveCSS('visibility', 'visible');
  const firstStory = page.locator(
    '[data-project-id="all-city-mile"] .featured-story__link',
  );
  await firstStory.focus();
  await expect(firstStory).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work\/all-city-mile\/$/);
  await expect(page.locator('main h1')).toBeVisible();

  await page.getByRole('link', { name: 'All featured work' }).click();
  await expect(page).toHaveURL(new RegExp(`${base}/#work$`));
  await expect(page.locator('#work')).toBeInViewport();
  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'Contact' })
    .click();
  await expect(page).toHaveURL(new RegExp(`${base}/#contact$`));
  await expect(page.locator('#contact')).toBeInViewport();
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${base}/#work$`));
  await page.getByRole('link', { name: 'Katherine Kalill' }).click();
  await expect(page).toHaveURL(new RegExp(`${base}/$`));
  await expect(page.locator('#work')).toBeVisible();
  await context.close();
});

test('production routes, text output, and binaries exclude review-only material', async ({
  request,
}) => {
  for (const fixture of ['foundation', 'homepage', 'story']) {
    const response = await request.get(`${base}/dev/${fixture}/`);
    expect(response.status()).toBe(404);
  }
  for (const slug of publicProjectSlugs) {
    expect((await request.get(`${base}/dev/work/${slug}/`)).status()).toBe(404);
    expect((await request.get(`${base}/work/${slug}/`)).status()).toBe(200);
  }
  const productionText = await readProductionText('dist');
  for (const marker of [
    'PRIVATE_SOURCE_SENTINEL',
    'PRIVATE_METRIC_SENTINEL',
    'PRIVATE_CONFIDENTIALITY_SENTINEL',
    'Review only · Draft project content',
    'data:image/svg+xml',
    '/dev/homepage/',
    '/dev/story/',
    'Synthetic copy used only to review',
    '/dev/work/all-city-mile/',
  ]) {
    expect(productionText).not.toContain(marker);
  }

  const files = await readdir('dist', { recursive: true });
  expect(files.some((file) => String(file).endsWith('.webp'))).toBe(true);
  expect(files.some((file) => String(file).endsWith('.woff2'))).toBe(true);
});

test('production output has a working not-found page', async ({ page }) => {
  const response = await page.goto(`${base}/not-a-real-page/`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute(
    'href',
    `${base}/`,
  );
  await expect(page.locator('[data-site-navigation] a')).toHaveText([
    'Work',
    'About',
    'Contact',
  ]);
  expect(
    await page
      .locator('[data-site-navigation] a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
  ).toEqual([`${base}/#work`, `${base}/about/`, `${base}/#contact`]);
  await expect(
    page.locator('[data-site-navigation] a[aria-current]'),
  ).toHaveCount(0);
});
