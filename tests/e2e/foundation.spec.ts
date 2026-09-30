import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('foundation components have accessible structure and keyboard focus', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  const response = await page.goto(
    '/katherine-kalill-portfolio/dev/foundation/',
  );
  expect(response?.status()).toBe(200);
  await expect(
    page.getByText('Review fixture · not portfolio content'),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Visit LinkedIn' }),
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/katherine-kalill/');
  await expect(
    page.getByRole('button', { name: 'Unavailable action' }),
  ).toBeDisabled();
  await expect(page.getByText('Community', { exact: true })).toBeVisible();
  const skipLink = page.getByRole('link', { name: 'Skip to content' });
  if (test.info().project.name.includes('webkit')) {
    await skipLink.focus();
  } else {
    await page.keyboard.press('Tab');
  }
  await expect(skipLink).toBeFocused();
  await expect(page.getByRole('main')).toHaveAttribute('id', 'main-content');
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('motion respects reduced-motion preference and leaves content available', async ({
  browser,
}) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/katherine-kalill-portfolio/dev/foundation/');
  const reveal = page.locator('[data-reveal]');
  await expect(reveal).toBeVisible();
  expect(
    await reveal.evaluate((element) => getComputedStyle(element).opacity),
  ).toBe('1');
  await expect(page.locator('[data-parallax]')).toBeVisible();
  expect(
    await page.locator('body').evaluate((body) => body.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await context.close();
});

test('motion preference changes restore and then re-enable nonessential movement', async ({
  page,
}) => {
  await page.goto('/katherine-kalill-portfolio/dev/foundation/');
  const parallax = page.locator('[data-parallax]');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(parallax).toBeVisible();
  expect(
    await parallax.evaluate((element) =>
      element.style.getPropertyValue('--parallax-y'),
    ),
  ).toBe('');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await parallax.scrollIntoViewIfNeeded();
  await expect(parallax).toBeVisible();
  await expect
    .poll(() =>
      parallax.evaluate((element) =>
        element.style.getPropertyValue('--parallax-y'),
      ),
    )
    .not.toBe('');
  expect(
    await parallax.evaluate((element) => getComputedStyle(element).transform),
  ).not.toBe('none');
});

test('foundation copy stays visible when JavaScript is unavailable', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/katherine-kalill-portfolio/dev/foundation/');
  await expect(
    page.getByRole('heading', { name: 'A foundation for human stories.' }),
  ).toBeVisible();
  await expect(
    page.getByText('Parallax belongs to image layers.'),
  ).toBeVisible();
  await context.close();
});

test('foundation review remains usable at phone, tablet, and desktop widths', async ({
  page,
}) => {
  for (const width of [320, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/katherine-kalill-portfolio/dev/foundation/');
    expect(
      await page.locator('body').evaluate((body) => body.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await expect(
      page.getByRole('heading', { name: 'A foundation for human stories.' }),
    ).toBeVisible();
  }
});
