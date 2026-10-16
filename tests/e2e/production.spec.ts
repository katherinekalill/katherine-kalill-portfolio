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
];
const collaborators = [
  [
    'New Balance',
    'Employer · community events and brand experience',
    'all-city-mile',
    'race-day-format',
  ],
  [
    'Freaks of Nature',
    'Client · community event and campaign',
    'freaks-of-nature',
    'event-content',
  ],
  [
    'goop',
    'Collaborator · Your Mothers Run Crew gathering',
    'your-mothers-run-crew',
    'goop',
  ],
  [
    'Little Words Project',
    'Collaborator · Your Mothers Run Crew gathering',
    'your-mothers-run-crew',
    'little-words-project',
  ],
  [
    'Alba Optics',
    'Collaborator · Back In Bed event',
    'freaks-of-nature',
    'back-in-bed',
  ],
  [
    'Runaway Milano',
    'Collaborator · community and local host',
    'freaks-of-nature',
    'shared-outdoor-culture',
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
  'Turning a Retail Moment Into a Personal Gesture',
  'Using Brand Purpose to Create Practical Impact',
];
const storyFacts = [
  ['300+', '30+', '$5,000', 'Sold out'],
  ['2'],
  ['50 spots', '2 reels'],
  ['Sold out', '200 shirts', '60+'],
  ['Sold out', '225%'],
];

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

test('production home and five published stories work under the project base', async ({
  page,
  request,
}) => {
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  const home = await page.goto(`${base}/`);
  expect(home?.status()).toBe(200);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.locator('.homepage-range')).toBeVisible();
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
  const homeStructuredData = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const homeSchemaTypes = homeStructuredData.map(
    (value) => (JSON.parse(value) as { '@type': string })['@type'],
  );
  expect(homeSchemaTypes).toEqual(['Person', 'WebSite']);

  const sitemapResponse = await request.get(`${base}/sitemap.xml`);
  expect(sitemapResponse.status()).toBe(200);
  expect(sitemapResponse.headers()['content-type']).toMatch(/application\/xml/);
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain(`https://katherinekalill.github.io${base}/`);
  for (const slug of slugs) {
    expect(sitemap).toContain(
      `https://katherinekalill.github.io${base}/work/${slug}/`,
    );
  }
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
  await expect(collaboratorList.getByRole('listitem')).toHaveCount(8);
  for (const [name, relationship, slug, chapter] of collaborators) {
    const link = collaboratorList.getByRole('link', { name: new RegExp(name) });
    await expect(link).toBeVisible();
    await expect(link).toContainText(relationship);
    await expect(link).toHaveAttribute(
      'href',
      `${base}/work/${slug}/#chapter-${chapter}`,
    );
    await expect(link.locator('img')).not.toHaveCount(0);
  }
  const newBalanceLink = collaboratorList.getByRole('link', {
    name: /New Balance/,
  });
  await expect(newBalanceLink).toHaveAttribute(
    'aria-describedby',
    'all-city-mile-photo-credit',
  );
  await expect(page.locator('#all-city-mile-photo-credit')).toHaveText(
    'All City Mile photography: Cooper Reid.',
  );
  const collaboratorListBounds = await collaboratorList.boundingBox();
  const creditBounds = await page
    .locator('#all-city-mile-photo-credit')
    .boundingBox();
  expect(creditBounds!.y).toBeGreaterThanOrEqual(
    collaboratorListBounds!.y + collaboratorListBounds!.height,
  );
  expect(
    Math.abs(creditBounds!.x - collaboratorListBounds!.x),
  ).toBeLessThanOrEqual(1);

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
      await expect(story).not.toContainText(/420%|275%/);
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://katherinekalill.github.io${path}`,
    );
    if (index === 0) {
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
        'content',
        'article',
      );
      const storyStructuredData = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      expect(
        storyStructuredData.map(
          (value) => (JSON.parse(value) as { '@type': string })['@type'],
        ),
      ).toEqual(['Person', 'WebSite', 'CreativeWork']);
    }
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
    ...slugs.map((slug) => `${base}/work/${slug}/`),
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

  await page.goto(`${base}/`);
  await page.setViewportSize({ width: 320, height: 780 });
  expect(
    await page.locator('body').evaluate((body) => body.scrollWidth),
  ).toBeLessThanOrEqual(320);
  expect(consoleErrors).toEqual([]);
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
    await page.emulateMedia({ reducedMotion: 'no-preference' });
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
      const credit = firstCard.locator('.featured-story__credit');
      await expect(credit).toHaveText('Photo: Cooper Reid');
      await expect(firstCard.getByRole('link')).toHaveAttribute(
        'aria-describedby',
        /work-credit-all-city-mile/,
      );
      const creditBounds = await firstCard.evaluate((card) => {
        const credit = card.querySelector('.featured-story__credit');
        const link = card.querySelector('.featured-story__link');
        if (!credit || !link) return null;
        return {
          linkLeft: link.getBoundingClientRect().left,
          linkRight: link.getBoundingClientRect().right,
          creditLeft: credit.getBoundingClientRect().left,
          creditRight: credit.getBoundingClientRect().right,
        };
      });
      expect(creditBounds).not.toBeNull();
      expect(creditBounds!.creditLeft).toBeGreaterThanOrEqual(
        creditBounds!.linkLeft - 1,
      );
      expect(creditBounds!.creditRight).toBeLessThanOrEqual(
        creditBounds!.linkRight + 1,
      );
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
      const desktopCreditBounds = await page
        .locator('[data-project-id="all-city-mile"]')
        .evaluate((card) => {
          const credit = card.querySelector('.featured-story__credit');
          const link = card.querySelector('.featured-story__link');
          if (!credit || !link) return null;
          return {
            linkLeft: link.getBoundingClientRect().left,
            linkRight: link.getBoundingClientRect().right,
            creditLeft: credit.getBoundingClientRect().left,
            creditRight: credit.getBoundingClientRect().right,
          };
        });
      expect(desktopCreditBounds).not.toBeNull();
      expect(desktopCreditBounds!.creditLeft).toBeGreaterThanOrEqual(
        desktopCreditBounds!.linkLeft - 1,
      );
      expect(desktopCreditBounds!.creditRight).toBeLessThanOrEqual(
        desktopCreditBounds!.linkRight + 1,
      );
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
  await expect(cards).toHaveCount(5);
  await expect(page.locator('[data-archive-card] img')).toHaveCount(5);
  expect(
    await cards.evaluateAll((items) =>
      items.map((item) =>
        item.querySelector('a')?.getAttribute('href')?.split('/').at(-2),
      ),
    ),
  ).toEqual(slugs);

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
    await expect(count).toHaveText('5 projects');
    expect(await visibleSlugs()).toEqual(slugs);
  }

  await page.locator('[data-archive-filter="digital"]').click();
  await expect(page).toHaveURL(
    new RegExp(`${base}/archive/\\?discipline=digital$`),
  );
  await expect(count).toHaveText('1 project');
  await expect(buttons.nth(4)).toHaveAttribute('aria-pressed', 'true');
  expect(await visibleSlugs()).toEqual(['freaks-of-nature']);

  await page.locator('[data-archive-filter="retail"]').click();
  await expect(page).toHaveURL(
    new RegExp(`${base}/archive/\\?discipline=retail$`),
  );
  await expect(count).toHaveText('1 project');
  expect(await visibleSlugs()).toEqual(['womens-self-defense']);
  await page.goBack();
  await expect(buttons.nth(4)).toHaveAttribute('aria-pressed', 'true');
  expect(await visibleSlugs()).toEqual(['freaks-of-nature']);
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
  await expect(count).toHaveText('5 projects');
  await expect(page.locator('[data-archive-empty]')).toBeHidden();

  await page.locator('[data-archive-filter="owned-platform"]').click();
  await expect(count).toHaveText('1 project');
  expect(await visibleSlugs()).toEqual(['your-mothers-run-crew']);

  await page.goto(`${base}/archive/?discipline=not-a-category`);
  await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(count).toHaveText('5 projects');
  expect(await visibleSlugs()).toEqual(slugs);
  await page.locator('[data-archive-filter="all"]').click();
  await expect(page).toHaveURL(`${base}/archive/`);

  await page.locator('[data-archive-filter="digital"]').focus();
  await expect(page.locator('[data-archive-filter="digital"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(count).toHaveText('1 project');
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
  await expect(noJsPage.locator('[data-archive-card]')).toHaveCount(5);
  for (const card of await noJsPage.locator('[data-archive-card]').all()) {
    await expect(card).toBeVisible();
  }
  await noJsContext.close();

  for (const draft of [
    'western-canada-market-expansion',
    'urban-hike-sara',
    'luxury-concepts',
  ]) {
    const response = await page.request.get(
      `http://127.0.0.1:4321${base}/work/${draft}/`,
    );
    expect(response.status(), `${draft} stays unpublished`).toBe(404);
  }
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
    'iRestore',
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
  expect(aboutCopy).not.toMatch(/\b(?:275%|420%|1,400\+|50,000\+|1M\+)\b/i);
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
  await expect(rail.locator(':scope > li')).toHaveCount(5);
  await expect(rail.locator('.featured-story__title')).toHaveCount(5);
  await expect(rail.locator('.featured-story__client')).toHaveCount(5);
  await expect(rail.locator('.featured-story__context')).toHaveCount(5);

  const next = page.getByRole('button', { name: 'Next project' });
  const previous = page.getByRole('button', { name: 'Previous project' });
  await next.scrollIntoViewIfNeeded();
  while (await next.isEnabled()) await next.click();
  const initialLeft = await rail.evaluate((element) => element.scrollLeft);
  const story = rail.locator(':scope > li').last().getByRole('link');
  await story.scrollIntoViewIfNeeded();
  const initialY = await page.evaluate(() => window.scrollY);
  await story.click();
  await expect(page).toHaveURL(`${base}/work/womens-self-defense/`);
  await page.goBack();
  await expect(page).toHaveURL(`${base}/`);
  await expect
    .poll(() => rail.evaluate((element) => element.scrollLeft))
    .toBe(initialLeft);
  expect(await page.evaluate(() => window.scrollY)).toBe(initialY);

  await previous.click();
  const secondLeft = await rail.evaluate((element) => element.scrollLeft);
  const secondStory = rail.locator(':scope > li').nth(1).getByRole('link');
  await secondStory.scrollIntoViewIfNeeded();
  const secondY = await page.evaluate(() => window.scrollY);
  await secondStory.click();
  await expect(page).toHaveURL(`${base}/work/your-mothers-run-crew/`);
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
  await expect(previews).toHaveCount(8);
  for (const preview of await previews.all()) {
    await expect(preview).toHaveCSS('visibility', 'hidden');
    await expect(preview).toHaveCSS('opacity', '0');
    expect(
      await preview.evaluate((element) =>
        getComputedStyle(element).transitionDuration.split(',')[0]?.trim(),
      ),
    ).toBe('0.32s');
  }

  const newBalance = list.getByRole('link', { name: /New Balance/ });
  const hovered = list.getByRole('link', { name: /Freaks of Nature/ });
  await hovered.hover();
  await expect(hovered.locator('.collaborator-list__previews')).toHaveCSS(
    'opacity',
    '1',
  );
  await expect(newBalance.locator('.collaborator-list__previews')).toHaveCSS(
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
  const focused = list.getByRole('link', { name: /New Balance/ });
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
  await expect(rows).toHaveCount(8);
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
  await expect(collaborators.getByRole('listitem')).toHaveCount(8);
  await expect(collaborators.getByRole('link')).toHaveCount(8);
  const newBalance = collaborators.getByRole('link', { name: /New Balance/ });
  await expect(newBalance).toBeVisible();
  await expect(page.locator('#all-city-mile-photo-credit')).toBeVisible();
  await expect(newBalance).toHaveAttribute(
    'aria-describedby',
    'all-city-mile-photo-credit',
  );
  const preview = newBalance.locator('.collaborator-list__previews');
  await expect(preview).toHaveCSS('visibility', 'hidden');
  await newBalance.hover();
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
  for (const slug of slugs) {
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
