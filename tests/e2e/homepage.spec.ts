import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const previewPath = '/katherine-kalill-portfolio/dev/homepage/';

interface EntranceRecord {
  target: string;
  kind: string;
  targetClass: string;
  projectId: string;
  from: string;
  duration: number;
  delay: number;
}

declare global {
  interface Window {
    __portfolioEntrances?: EntranceRecord[];
    __portfolioScrollPositions?: number[];
    __portfolioScrollSettled?: boolean;
  }
}

async function recordEntrances(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const storageKey = 'homepage-entrance-records';
    window.__portfolioEntrances = JSON.parse(
      sessionStorage.getItem(storageKey) ?? '[]',
    ) as EntranceRecord[];
    const nativeAnimate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      const firstFrame = Array.isArray(keyframes)
        ? keyframes[0]
        : (keyframes as Keyframe);
      const entranceWindow = window as Window & {
        __portfolioEntrances?: EntranceRecord[];
      };
      const record = {
        target:
          this.getAttribute('data-reveal') === 'hero'
            ? 'hero'
            : (this.textContent?.replace(/\s+/g, ' ').trim().slice(0, 48) ??
              ''),
        kind: this.getAttribute('data-reveal') ?? '',
        targetClass:
          typeof (this as HTMLElement).className === 'string'
            ? (this as HTMLElement).className
            : '',
        projectId:
          (this as HTMLElement).closest<HTMLElement>('[data-project-id]')
            ?.dataset.projectId ?? '',
        from: String(firstFrame?.transform ?? ''),
        duration:
          typeof options === 'number'
            ? options
            : Number(options?.duration ?? 0),
        delay: typeof options === 'number' ? 0 : Number(options?.delay ?? 0),
      };
      entranceWindow.__portfolioEntrances?.push(record);
      sessionStorage.setItem(
        storageKey,
        JSON.stringify(entranceWindow.__portfolioEntrances ?? []),
      );
      return nativeAnimate.call(this, keyframes, options);
    };
  });
}

async function waitForEntranceAnimations(page: Page): Promise<void> {
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

test('homepage review presents all seven sections and the confirmed story order', async ({
  page,
}) => {
  const response = await page.goto(previewPath);
  expect(response?.status()).toBe(200);
  await expect(
    page.getByText(
      'Review only · Draft project content and synthetic images are not approved for publication.',
    ),
  ).toBeVisible();

  const headings = await page.locator('main h1, main h2').allTextContents();
  expect(headings).toEqual([
    'The Business of Human Connection',
    'Emotion is the strategy',
    'A reason to come together.',
    'From global brands to independent communities',
    'Bring people closer to the things they care about.',
    'Explore more work.',
    'The Business of Human Connection',
  ]);

  await expect(page.locator('[data-project-id]').first()).toHaveAttribute(
    'data-project-id',
    'all-city-mile',
  );
  expect(
    await page
      .locator('[data-project-id]')
      .evaluateAll((stories) =>
        stories.map((story) => story.getAttribute('data-project-id')),
      ),
  ).toEqual([
    'all-city-mile',
    'your-mothers-run-crew',
    'freaks-of-nature',
    'you-deserve-your-flowers',
    'womens-self-defense',
  ]);
  await expect(page.locator('.featured-story img')).toHaveCount(5);
  await expect(
    page.getByRole('link', {
      name: 'Making Competition Feel Like Community',
    }),
  ).toHaveAttribute(
    'href',
    '/katherine-kalill-portfolio/dev/work/all-city-mile/',
  );

  await waitForEntranceAnimations(page);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('featured rail exposes every card through one-card controls and keeps native scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(previewPath);
  const rail = page.locator('[data-featured-rail]');
  const cards = rail.locator('.featured-story');
  const previous = page.getByRole('button', { name: 'Previous project' });
  const next = page.getByRole('button', { name: 'Next project' });
  await expect(cards).toHaveCount(5);
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();

  let lastScrollLeft = await rail.evaluate((element) => element.scrollLeft);
  let controlMoves = 0;
  while (await next.isEnabled()) {
    await next.focus();
    await page.keyboard.press('Enter');
    await expect
      .poll(() => rail.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(lastScrollLeft + 1);
    const current = await rail.evaluate((element) => element.scrollLeft);
    expect(current - lastScrollLeft).toBeLessThanOrEqual(
      await rail.evaluate((element) => {
        const card = element.querySelector('.featured-story');
        if (!card) return 0;
        const styles = getComputedStyle(element);
        const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
        return card.getBoundingClientRect().width + gap + 2;
      }),
    );
    lastScrollLeft = current;
    controlMoves += 1;
  }
  expect(controlMoves).toBeGreaterThanOrEqual(2);
  await expect(next).toBeDisabled();
  await expect(page.locator('[data-rail-status]')).toContainText(
    `Project ${controlMoves + 1} of 5:`,
  );
  const lastCardBounds = await cards.last().evaluate((card) => {
    const railBounds = card.parentElement!.getBoundingClientRect();
    const bounds = card.getBoundingClientRect();
    return {
      left: bounds.left,
      right: bounds.right,
      railLeft: railBounds.left,
      railRight: railBounds.right,
    };
  });
  expect(lastCardBounds.left).toBeGreaterThanOrEqual(
    lastCardBounds.railLeft - 1,
  );
  expect(lastCardBounds.right).toBeLessThanOrEqual(
    lastCardBounds.railRight + 1,
  );

  while (await previous.isEnabled()) {
    await previous.click();
  }
  await expect(previous).toBeDisabled();
  await expect
    .poll(() => rail.evaluate((element) => element.scrollLeft))
    .toBe(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(next).toBeEnabled();
  const lastLink = cards.last().getByRole('link');
  await lastLink.focus();
  await expect
    .poll(() => rail.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await expect
    .poll(() =>
      lastLink.evaluate((link) => {
        const railBounds = link
          .closest('[data-featured-rail]')!
          .getBoundingClientRect();
        const bounds = link.getBoundingClientRect();
        return (
          bounds.left >= railBounds.left - 1 &&
          bounds.right <= railBounds.right + 1
        );
      }),
    )
    .toBe(true);
});

test('featured rail retains every story without JavaScript and supports touch scrolling', async ({
  browser,
}) => {
  const noScriptContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:4322',
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto(previewPath);
  const noScriptRail = noScriptPage.locator('[data-featured-rail]');
  await expect(noScriptRail.locator('.featured-story')).toHaveCount(5);
  await expect(
    noScriptPage.getByRole('button', { name: 'Next project' }),
  ).toBeHidden();
  expect(
    await noScriptRail.evaluate((element) => ({
      overflowX: getComputedStyle(element).overflowX,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    })),
  ).toMatchObject({ overflowX: 'auto' });
  await noScriptRail.locator('.featured-story').last().scrollIntoViewIfNeeded();
  await expect(
    noScriptRail.locator('.featured-story').last().getByRole('link'),
  ).toBeVisible();
  await noScriptContext.close();

  const touchContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:4322',
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const touchPage = await touchContext.newPage();
  await touchPage.emulateMedia({ reducedMotion: 'reduce' });
  await touchPage.goto(previewPath);
  const rail = touchPage.locator('[data-featured-rail]');
  const next = touchPage.getByRole('button', { name: 'Next project' });
  await next.scrollIntoViewIfNeeded();
  const bounds = await next.boundingBox();
  expect(bounds).toBeTruthy();
  await touchPage.touchscreen.tap(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await expect
    .poll(() => rail.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await touchContext.close();
});

test('mobile disclosure supports keyboard focus, Escape, and section navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(previewPath);
  const toggle = page.getByRole('button', { name: 'Menu' });
  const workLink = page.getByRole('link', { name: 'Work', exact: true });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(workLink).toBeHidden();

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await workLink.focus();
  await expect(workLink).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(toggle).toBeHidden();
  await expect(workLink).toBeVisible();
  await expect(workLink).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await workLink.focus();
  await expect(workLink).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();

  await toggle.click();
  await page.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(
    page.getByRole('heading', { name: 'Let’s make a moment matter.' }),
  ).toBeInViewport();
  await expect(page.locator('#contact')).toBeFocused();
  await expect(page.locator('#contact')).toHaveCSS('outline-style', 'none');
  await expect
    .poll(() =>
      page
        .locator('#contact [data-reveal]')
        .evaluateAll((elements) =>
          elements.reduce(
            (count, element) => count + element.getAnimations().length,
            0,
          ),
        ),
    )
    .toBe(0);
  await expect(page.locator('[data-section-id="contact"]')).toHaveAttribute(
    'aria-current',
    'location',
  );
});

test('homepage entrances replay after full exits and follow scroll direction', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page);
  await page.goto(previewPath);
  await expect
    .poll(() => page.evaluate(() => window.__portfolioEntrances?.length ?? 0))
    .toBeGreaterThan(0);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const initialEntrances = await page.evaluate(
    () => window.__portfolioEntrances ?? [],
  );
  expect(initialEntrances.map(({ target }) => target)).toEqual(['hero']);
  expect(initialEntrances[0]).toMatchObject({
    from: 'translateY(24px)',
    duration: 600,
  });

  const firstCapability = page
    .locator('.capabilities__list li[data-reveal]')
    .first();
  await firstCapability.scrollIntoViewIfNeeded();
  const firstRowText = await firstCapability.evaluate((element) =>
    element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 48),
  );
  const rowEntrances = () =>
    page.evaluate(
      (target) =>
        (window.__portfolioEntrances ?? []).filter(
          (entrance) => entrance.target === target,
        ),
      firstRowText,
    );
  await expect.poll(async () => (await rowEntrances()).length).toBe(1);
  expect((await rowEntrances())[0]).toMatchObject({
    from: 'translateY(24px)',
    duration: 600,
    delay: 0,
  });

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect
    .poll(() =>
      firstCapability.evaluate(
        (element) => element.getBoundingClientRect().top >= window.innerHeight,
      ),
    )
    .toBe(true);
  await firstCapability.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await rowEntrances()).length).toBe(2);

  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'instant',
    }),
  );
  await expect
    .poll(() =>
      firstCapability.evaluate(
        (element) => element.getBoundingClientRect().bottom <= 0,
      ),
    )
    .toBe(true);
  await firstCapability.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await rowEntrances()).length).toBe(3);
  expect((await rowEntrances())[2]?.from).toBe('translateY(-24px)');

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  await expect
    .poll(() =>
      firstCapability.evaluate(
        (element) => element.getBoundingClientRect().top >= window.innerHeight,
      ),
    )
    .toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await firstCapability.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await rowEntrances()).length).toBe(4);
  expect((await rowEntrances())[3]).toMatchObject({
    from: 'translateY(16px)',
    duration: 600,
  });
});

test('story title, text, chapter imagery, and pagination reveal while focus stays put', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page);
  await page.goto('/katherine-kalill-portfolio/dev/work/all-city-mile/');
  await expect
    .poll(() => page.evaluate(() => window.__portfolioEntrances?.length ?? 0))
    .toBeGreaterThan(0);
  const portraitPair = page.locator('.case-study__gallery--portrait-pair');
  await expect(portraitPair).toHaveCount(1);
  await expect(portraitPair.locator(':scope > div')).toHaveCount(2);
  const desktopPairRects = await portraitPair
    .locator(':scope > div')
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().toJSON()),
    );
  expect(desktopPairRects[0]!.x).toBeLessThan(desktopPairRects[1]!.x);
  expect(
    Math.abs(desktopPairRects[0]!.y - desktopPairRects[1]!.y),
  ).toBeLessThan(2);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobilePairRects = await portraitPair
    .locator(':scope > div')
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().toJSON()),
    );
  expect(mobilePairRects[0]!.x).toBeCloseTo(mobilePairRects[1]!.x, 0);
  expect(mobilePairRects[0]!.y).toBeLessThan(mobilePairRects[1]!.y);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const initial = await page.evaluate(() => window.__portfolioEntrances ?? []);
  expect(
    initial.some(
      ({ kind, target }) =>
        kind === 'story-title' &&
        target === 'Making Competition Feel Like Community',
    ),
  ).toBe(true);
  expect(initial.some(({ kind }) => kind === 'story-meta')).toBe(true);
  const hero = page.locator('.case-study__hero[data-reveal="image"]');
  await hero.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window.__portfolioEntrances ?? []).some(
          ({ kind }) => kind === 'image',
        ),
      ),
    )
    .toBe(true);

  const galleryImage = page
    .locator('.case-study__gallery [data-reveal="image"]')
    .first();
  const focusBefore = await page.evaluate(
    () =>
      document.activeElement?.getAttribute('data-reveal') ??
      document.activeElement?.tagName,
  );
  await galleryImage.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window.__portfolioEntrances ?? []).filter(
            ({ kind }) => kind === 'image',
          ).length,
      ),
    )
    .toBeGreaterThan(1);
  expect(
    await page.evaluate(
      () =>
        document.activeElement?.getAttribute('data-reveal') ??
        document.activeElement?.tagName,
    ),
  ).toBe(focusBefore);

  const galleryRecordCount = await page.evaluate(
    () =>
      (window.__portfolioEntrances ?? []).filter(({ kind }) => kind === 'image')
        .length,
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect
    .poll(() =>
      galleryImage.evaluate(
        (element) => element.getBoundingClientRect().top >= window.innerHeight,
      ),
    )
    .toBe(true);
  await galleryImage.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window.__portfolioEntrances ?? []).filter(
            ({ kind }) => kind === 'image',
          ).length,
      ),
    )
    .toBeGreaterThan(galleryRecordCount);

  const pagination = page.locator(
    '.case-study__pagination[data-reveal="pagination"]',
  );
  await pagination.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window.__portfolioEntrances ?? []).filter(
            ({ kind }) => kind === 'pagination',
          ).length,
      ),
    )
    .toBe(1);
});

test('section links scroll smoothly, focus destinations, and preserve history', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(previewPath);
  await page.evaluate(() => {
    window.__portfolioScrollPositions = [];
    window.addEventListener(
      'scroll',
      () => window.__portfolioScrollPositions?.push(window.scrollY),
      { passive: true },
    );
  });

  const workLink = page.locator('[data-section-id="work"]');
  await workLink.click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('#work')).toBeFocused();
  await page.waitForTimeout(250);
  expect(
    await page
      .locator('#work')
      .evaluate((element) => element.getBoundingClientRect().top),
  ).toBeGreaterThan(150);
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.abs(
          document.querySelector('#work')!.getBoundingClientRect().top - 112,
        ),
      ),
    )
    .toBeLessThan(32);
  const scrollPositions = await page.evaluate(
    () => window.__portfolioScrollPositions ?? [],
  );
  const finalPosition = await page.evaluate(() => window.scrollY);
  expect(
    scrollPositions.some(
      (position) => position > 0 && position < finalPosition - 10,
    ),
  ).toBe(true);
  await expect(workLink).toHaveAttribute('aria-current', 'location');

  await workLink.click();
  await expect(page).toHaveURL(/#work$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/dev\/homepage\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await workLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#work')).toBeFocused();
  await expect(page.locator('#work')).toHaveCSS('outline-style', 'solid');
});

test('each featured story animates its initial title, metadata, and hero', async ({
  page,
}) => {
  const stories = [
    ['all-city-mile', 'Making Competition Feel Like Community'],
    ['your-mothers-run-crew', 'Building a Community People Return To'],
    ['freaks-of-nature', 'Creating a Reason to Gather'],
    [
      'you-deserve-your-flowers',
      'Turning a Retail Moment Into a Personal Gesture',
    ],
    ['womens-self-defense', 'Using Brand Purpose to Create Practical Impact'],
  ] as const;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page);

  for (const [index, [slug, title]] of stories.entries()) {
    if (index > 0) {
      await page.evaluate(() =>
        sessionStorage.setItem('homepage-entrance-records', '[]'),
      );
    }
    await page.goto(`/katherine-kalill-portfolio/dev/work/${slug}/`);
    await page
      .locator('.case-study__hero[data-reveal="image"]')
      .scrollIntoViewIfNeeded();
    await expect
      .poll(() => page.evaluate(() => window.__portfolioEntrances?.length ?? 0))
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        page.evaluate(
          (expectedTitle) =>
            (window.__portfolioEntrances ?? []).some(
              ({ kind, target }) =>
                kind === 'story-title' && target === expectedTitle,
            ),
          title,
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window.__portfolioEntrances ?? []).some(
            ({ kind }) => kind === 'story-meta',
          ),
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window.__portfolioEntrances ?? []).some(
            ({ kind }) => kind === 'image',
          ),
        ),
      )
      .toBe(true);
  }
});

test('oversized reveal targets enter below the standard intersection ratio', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page);
  await page.addInitScript(() => {});
  await page.goto(previewPath);
  await page.addStyleTag({
    content:
      '.capabilities__list li[data-reveal] { min-height: 10000px !important; }',
  });
  const firstCapability = page
    .locator('.capabilities__list li[data-reveal]')
    .first();
  await firstCapability.scrollIntoViewIfNeeded();
  const bounds = await firstCapability.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    width: element.getBoundingClientRect().width,
    intersectionCeiling:
      window.innerHeight / element.getBoundingClientRect().height,
  }));
  expect(bounds.height).toBeGreaterThan(9000);
  expect(bounds.intersectionCeiling).toBeLessThan(0.15);
  await expect
    .poll(() => page.evaluate(() => window.__portfolioEntrances?.length ?? 0))
    .toBeGreaterThan(1);
  const rowText = await firstCapability.evaluate((element) =>
    element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 48),
  );
  await expect
    .poll(() =>
      page.evaluate(
        (target) =>
          (window.__portfolioEntrances ?? []).filter(
            ({ target: recorded }) => recorded === target,
          ).length,
        rowText,
      ),
    )
    .toBe(1);
});

test('rail images rearm after leaving the rail clip and returning', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page);
  await page.goto(previewPath);
  const rail = page.locator('[data-featured-rail]');
  const firstImage = rail
    .locator('.featured-story')
    .first()
    .locator('[data-reveal="image"]');
  const featuredSection = rail.locator('xpath=..');
  const previous = page.getByRole('button', { name: 'Previous project' });
  const next = page.getByRole('button', { name: 'Next project' });
  await featuredSection.evaluate((section) => {
    section.tabIndex = -1;
    section.focus({ preventScroll: true });
  });
  await expect(featuredSection).toBeFocused();
  await firstImage.scrollIntoViewIfNeeded();
  const recordsForFirstImage = () =>
    page.evaluate(() =>
      (window.__portfolioEntrances ?? []).filter(
        ({ targetClass, projectId }) =>
          targetClass.includes('featured-story__image') &&
          projectId === 'all-city-mile',
      ),
    );
  await expect.poll(async () => (await recordsForFirstImage()).length).toBe(1);
  await expect(featuredSection).toBeFocused();
  await expect(next).toBeEnabled();
  await next.click();
  await expect
    .poll(() =>
      firstImage.evaluate((image) => {
        const railBounds = image
          .closest('[data-featured-rail]')!
          .getBoundingClientRect();
        const imageBounds = image.getBoundingClientRect();
        return imageBounds.right <= railBounds.left;
      }),
    )
    .toBe(true);
  await previous.click();
  await expect.poll(async () => (await recordsForFirstImage()).length).toBe(2);
});

test('a focused featured-story link protects its nested image entrance', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page);
  await page.goto(previewPath);
  const firstStory = page.locator('[data-project-id="all-city-mile"]');
  const link = firstStory.getByRole('link');
  await link.focus();
  await expect(link).toBeFocused();
  await expect
    .poll(() =>
      firstStory.locator('.featured-story__image').evaluate((image) => {
        const bounds = image.getBoundingClientRect();
        return bounds.top < window.innerHeight && bounds.bottom > 0;
      }),
    )
    .toBe(true);
  await page.waitForTimeout(800);
  expect(
    await page.evaluate(
      () =>
        (window.__portfolioEntrances ?? []).filter(
          ({ projectId, targetClass }) =>
            projectId === 'all-city-mile' &&
            targetClass.includes('featured-story__image'),
        ).length,
    ),
  ).toBe(0);
  await expect(link).toBeFocused();
});

test('foundation navigation fixture has unique control target IDs', async ({
  page,
}) => {
  await page.goto('/katherine-kalill-portfolio/dev/foundation/');
  const targetIds = await page
    .locator('[data-menu-toggle]')
    .evaluateAll((toggles) =>
      toggles.map((toggle) => toggle.getAttribute('aria-controls')),
    );
  expect(targetIds).toEqual([
    'site-navigation-items',
    'foundation-review-navigation-items',
  ]);
  expect(
    await page
      .locator('[data-menu-panel]')
      .evaluateAll((panels) => panels.map((panel) => panel.id)),
  ).toEqual(targetIds);
  await waitForEntranceAnimations(page);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('wheel input interrupts smooth scrolling and updates the active section', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(previewPath);
  await page.evaluate(() => {
    let settleTimer = 0;
    window.__portfolioScrollSettled = true;
    window.addEventListener(
      'scroll',
      () => {
        window.__portfolioScrollSettled = false;
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
          window.__portfolioScrollSettled = true;
        }, 180);
      },
      { passive: true },
    );
    window.addEventListener(
      'wheel',
      () => {
        window.__portfolioScrollSettled = false;
      },
      { passive: true },
    );
    window.addEventListener(
      'scrollend',
      () => {
        window.__portfolioScrollSettled = true;
      },
      { passive: true },
    );
  });

  const contactLink = page.locator('[data-section-id="contact"]');
  await contactLink.click();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(20);
  await page.mouse.move(800, 450);
  await page.mouse.wheel(0, -360);
  await expect(contactLink).not.toHaveAttribute('aria-current', 'location');
  await expect
    .poll(() => page.evaluate(() => window.__portfolioScrollSettled))
    .toBe(true);
  await expect(contactLink).not.toHaveAttribute('aria-current', 'location');
});

test('scroll input before the first navigation frame cancels the destination', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(previewPath);
  await page.evaluate(() => {
    document
      .querySelector<HTMLAnchorElement>('[data-section-id="contact"]')!
      .dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          button: 0,
          detail: 1,
        }),
      );
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 360 }));
  });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(
    await page
      .locator('#contact')
      .evaluate((target) => target === document.activeElement),
  ).toBe(false);
});

test('reduced-motion and no-JavaScript section navigation stay immediate', async ({
  browser,
}) => {
  const reducedContext = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 900 },
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(previewPath);
  await reducedPage.locator('[data-section-id="contact"]').click();
  await expect(reducedPage).toHaveURL(/#contact$/);
  await expect(reducedPage.locator('#contact')).toBeFocused();
  await expect
    .poll(() =>
      reducedPage.evaluate(
        () =>
          document.querySelector('#contact')!.getBoundingClientRect().top -
          document.querySelector('.site-header')!.getBoundingClientRect()
            .bottom,
      ),
    )
    .toBeGreaterThan(0);
  await reducedContext.close();

  const noScriptContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:4322',
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto(previewPath);
  await noScriptPage.locator('[data-section-id="work"]').click();
  await expect(noScriptPage).toHaveURL(/#work$/);
  await expect(
    noScriptPage.getByRole('heading', {
      name: 'A reason to come together.',
    }),
  ).toBeInViewport();
  await noScriptContext.close();
});

test('navigation links and all homepage copy remain available without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4322',
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(previewPath);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'The Business of Human Connection',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Work', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#archive')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  await expect(page.locator('.featured-story img')).toHaveCount(5);
  await page.getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL(/#work$/);
  const anchorPositions = await page.evaluate(() => {
    const headerBottom = document
      .querySelector('.site-header')!
      .getBoundingClientRect().bottom;
    const headingTop = document
      .querySelector('#work-title')!
      .getBoundingClientRect().top;
    return { headerBottom, headingTop };
  });
  expect(
    anchorPositions.headerBottom <= 0 ||
      anchorPositions.headingTop >= anchorPositions.headerBottom,
  ).toBe(true);
  await context.close();
});

test('touch interaction can open the mobile menu and follow an anchor', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4322',
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(previewPath);
  const toggle = page.getByRole('button', { name: 'Menu' });
  const toggleBounds = await toggle.boundingBox();
  expect(toggleBounds).toBeTruthy();
  await page.touchscreen.tap(
    toggleBounds!.x + toggleBounds!.width / 2,
    toggleBounds!.y + toggleBounds!.height / 2,
  );
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const work = page.getByRole('link', { name: 'Work', exact: true });
  const workBounds = await work.boundingBox();
  expect(workBounds).toBeTruthy();
  await page.touchscreen.tap(
    workBounds!.x + workBounds!.width / 2,
    workBounds!.y + workBounds!.height / 2,
  );
  await expect(page).toHaveURL(/#work$/);
  await expect(
    page.getByRole('heading', { name: 'A reason to come together.' }),
  ).toBeInViewport();
  await context.close();
});

test('image parallax stays inside the frame and turns off with reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/katherine-kalill-portfolio/');
  const image = page.locator('.featured-story img[data-parallax]').first();
  const story = page
    .locator('.featured-story__image[data-reveal="image"]')
    .first();
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => story.evaluate((element) => element.getAnimations().length))
    .toBeGreaterThan(0);
  await expect
    .poll(() =>
      image.evaluate((element) =>
        element.style.getPropertyValue('--parallax-y'),
      ),
    )
    .not.toBe('');
  const offset = await image.evaluate((element) => {
    const value = Number.parseFloat(
      element.style.getPropertyValue('--parallax-y'),
    );
    const visibleHeight = element.getBoundingClientRect().height;
    return { value, safeLimit: visibleHeight * 0.034 + 1 };
  });
  expect(Math.abs(offset.value)).toBeLessThanOrEqual(offset.safeLimit);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => story.evaluate((element) => element.getAnimations().length))
    .toBe(0);
  await expect(image).toHaveCSS('transform', 'none');
  expect(
    await image.evaluate((element) =>
      element.style.getPropertyValue('--parallax-y'),
    ),
  ).toBe('');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect(
    await story.evaluate((element) => element.getAnimations().length),
  ).toBe(0);
});

test('native navigation returns to the homepage scroll position', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(previewPath);
  const rail = page.locator('[data-featured-rail]');
  const nextRail = page.getByRole('button', { name: 'Next project' });
  await nextRail.click();
  await nextRail.click();
  const expectedRailLeft = await rail.evaluate((element) => element.scrollLeft);
  expect(expectedRailLeft).toBeGreaterThan(0);
  const storyLink = rail.locator('.featured-story').nth(2).getByRole('link');
  await storyLink.scrollIntoViewIfNeeded();
  const previousY = await page.evaluate(() => window.scrollY);
  expect(previousY).toBeGreaterThan(0);

  await storyLink.click();
  await expect(page).toHaveURL(/\/dev\/work\/freaks-of-nature\/$/);
  await expect(
    page.getByRole('heading', {
      name: 'Creating a Reason to Gather',
    }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/dev\/homepage\/$/);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  const restoredY = await page.evaluate(() => window.scrollY);
  await expect
    .poll(() => rail.evaluate((element) => element.scrollLeft))
    .toBe(expectedRailLeft);
  const restoredLinkBounds = await storyLink.evaluate((element) => {
    const { top, bottom } = element.getBoundingClientRect();
    return { top, bottom, viewportHeight: window.innerHeight };
  });
  expect(restoredY).toBeGreaterThan(0);
  expect(restoredLinkBounds.top).toBeGreaterThanOrEqual(0);
  expect(restoredLinkBounds.bottom).toBeLessThanOrEqual(
    restoredLinkBounds.viewportHeight + 1,
  );

  await page.getByRole('button', { name: 'Previous project' }).click();
  const secondRailLeft = await rail.evaluate((element) => element.scrollLeft);
  expect(secondRailLeft).toBeLessThan(expectedRailLeft);
  const secondStoryLink = rail
    .locator('.featured-story')
    .nth(1)
    .getByRole('link');
  await secondStoryLink.scrollIntoViewIfNeeded();
  const secondExpectedY = await page.evaluate(() => window.scrollY);
  await secondStoryLink.click();
  await expect(page).toHaveURL(/\/dev\/work\/your-mothers-run-crew\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/dev\/homepage\/$/);
  await expect
    .poll(() => rail.evaluate((element) => element.scrollLeft))
    .toBe(secondRailLeft);
  expect(await page.evaluate(() => window.scrollY)).toBe(secondExpectedY);
});

test('case-study review pages demonstrate complete and sparse narrative layouts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    '/katherine-kalill-portfolio/dev/work/your-mothers-run-crew/',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,nofollow',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Goop' })).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Building a Community People Return To',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Little Words Project' }),
  ).toBeVisible();
  await expect(page.locator('.media-frame--full-bleed')).toHaveCount(1);
  expect(
    await page
      .locator('.media-frame--portrait .media-frame__content')
      .first()
      .evaluate((element) => {
        const box = element.getBoundingClientRect();
        return box.height > box.width;
      }),
  ).toBe(true);
  const fullBleedBounds = await page
    .locator('.media-frame--full-bleed')
    .first()
    .evaluate((element) => element.getBoundingClientRect());
  expect(Math.abs(fullBleedBounds.width - 1440)).toBeLessThanOrEqual(1);
  expect(Math.abs(fullBleedBounds.left)).toBeLessThanOrEqual(1);
  await expect(
    page.getByText(/Synthetic copy|Synthetic chapter/i).first(),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Previous/ })).toHaveAttribute(
    'href',
    '/katherine-kalill-portfolio/dev/work/all-city-mile/',
  );

  await page.goto('/katherine-kalill-portfolio/dev/work/freaks-of-nature/');
  await expect(
    page.getByRole('heading', { name: 'The human insight' }),
  ).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'What changed' })).toHaveCount(
    0,
  );
  await expect(page.getByRole('heading', { name: 'With thanks' })).toHaveCount(
    0,
  );
  await expect(page.getByRole('link', { name: /Previous/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Next/ })).toBeVisible();
});

test('homepage layout works from narrow phone through wide desktop widths', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(previewPath);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The Business of Human Connection',
      }),
    ).toBeVisible();
    expect(
      await page.locator('body').evaluate((body) => body.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await expect(page.locator('.featured-story img')).toHaveCount(5);
  }
});
