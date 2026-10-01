import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const previewPath = '/katherine-kalill-portfolio/dev/homepage/';

interface EntranceRecord {
  target: string;
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
    'A wider collection of work is taking shape.',
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
  await expect(page.locator('.featured-story img[data-parallax]')).toHaveCount(
    5,
  );
  await expect(
    page.getByRole('link', { name: 'Open the navigation review fixture' }),
  ).toHaveAttribute('href', '/katherine-kalill-portfolio/dev/story/');

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
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
    duration: 500,
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
    duration: 500,
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
    duration: 500,
  });
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

  const capabilitiesLink = page.locator('[data-section-id="capabilities"]');
  await capabilitiesLink.click();
  await expect(page).toHaveURL(/#capabilities$/);
  await expect(page.locator('#capabilities')).toBeFocused();
  await page.waitForTimeout(250);
  expect(
    await page
      .locator('#capabilities')
      .evaluate((element) => element.getBoundingClientRect().top),
  ).toBeGreaterThan(150);
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.abs(
          document.querySelector('#capabilities')!.getBoundingClientRect().top -
            112,
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
  await expect(capabilitiesLink).toHaveAttribute('aria-current', 'location');

  await capabilitiesLink.click();
  await expect(page).toHaveURL(/#capabilities$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/dev\/homepage\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await capabilitiesLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#capabilities')).toBeFocused();
  await expect(page.locator('#capabilities')).toHaveCSS(
    'outline-style',
    'solid',
  );
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
  await noScriptPage.locator('[data-section-id="capabilities"]').click();
  await expect(noScriptPage).toHaveURL(/#capabilities$/);
  await expect(
    noScriptPage.getByRole('heading', {
      name: 'Bring people closer to the things they care about.',
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
  await expect(
    page.getByRole('link', { name: 'Archive', exact: true }),
  ).toBeVisible();
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
  await page.goto(previewPath);
  const image = page.locator('.featured-story img[data-parallax]').first();
  const story = page.locator('[data-project-id]').first();
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
  await recordEntrances(page);
  await page.goto(previewPath);
  const storyLink = page.getByRole('link', {
    name: 'Open the navigation review fixture',
  });
  await storyLink.scrollIntoViewIfNeeded();
  const previousY = await page.evaluate(() => window.scrollY);
  expect(previousY).toBeGreaterThan(0);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const entranceCountBeforeNavigation = await page.evaluate(
    () => window.__portfolioEntrances?.length ?? 0,
  );

  await storyLink.click();
  await expect(page).toHaveURL(/\/dev\/story\/$/);
  await expect(
    page.getByRole('heading', {
      name: 'Destination content loads immediately.',
    }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/dev\/homepage\/$/);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  const restoredY = await page.evaluate(() => window.scrollY);
  expect(Math.abs(restoredY - previousY)).toBeLessThan(100);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(
    await page.evaluate(() => window.__portfolioEntrances?.length ?? 0),
  ).toBe(entranceCountBeforeNavigation);
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
