import { expect, test } from '@playwright/test';

test('production home is reachable under the GitHub Pages project base', async ({
  page,
  request,
}) => {
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  const response = await page.goto('/katherine-kalill-portfolio/');
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'The Business of Human Connection' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/katherine-kalill/',
  );
  await expect(page.getByText(/@example\.com|555[- )]/i)).toHaveCount(0);
  await expect(page.getByText('PRIVATE_SOURCE_SENTINEL')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://katherinekalill.github.io/katherine-kalill-portfolio/',
  );
  const fontHref = await page
    .locator('link[rel="preload"][as="font"]')
    .getAttribute('href');
  expect(fontHref).toBeTruthy();
  const fontResponse = await request.get(
    new URL(fontHref!, response!.url()).href,
  );
  expect(fontResponse.status()).toBe(200);
  await expect(
    page.getByText('Review fixture · not portfolio content'),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 780 });
  expect(
    await page.locator('body').evaluate((body) => body.scrollWidth),
  ).toBeLessThanOrEqual(320);
  expect(consoleErrors).toEqual([]);
});

test('production output has a working not-found page', async ({ page }) => {
  const response = await page.goto(
    '/katherine-kalill-portfolio/not-a-real-page/',
  );
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute(
    'href',
    '/katherine-kalill-portfolio/',
  );
});

test('production build omits the foundation review fixture', async ({
  request,
}) => {
  const response = await request.get(
    '/katherine-kalill-portfolio/dev/foundation/',
  );
  expect(response.status()).toBe(404);
});
