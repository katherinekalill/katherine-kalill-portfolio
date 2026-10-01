import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

async function readProductionOutput(directory: string): Promise<string> {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? readProductionOutput(path)
        : readFile(path, 'utf8');
    }),
  );
  return contents.join('\n');
}

test('production home is reachable under the GitHub Pages project base', async ({
  page,
  request,
}) => {
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  const response = await page.goto('/katherine-kalill-portfolio/');
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'The Business of Human Connection',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'LinkedIn', exact: true }),
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/katherine-kalill/');
  await expect(
    page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'katherinerkalill@gmail.com' }),
  ).toHaveAttribute('href', 'mailto:katherinerkalill@gmail.com');
  await expect(
    page.getByRole('heading', { name: 'Emotion is the strategy' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Bring people closer to the things they care about.',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Let’s make a moment matter.' }),
  ).toBeVisible();
  const navLinks = page.locator('[data-site-navigation] a');
  const navHrefs = await navLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );
  for (const href of navHrefs) {
    expect(href).toMatch(/^#/);
    await expect(page.locator(href!)).toHaveCount(1);
  }
  await expect(page.getByRole('link', { name: 'Archive' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Work' })).toHaveCount(0);
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

test('production build omits every homepage review fixture', async ({
  request,
}) => {
  for (const fixture of ['foundation', 'homepage', 'story']) {
    const response = await request.get(
      `/katherine-kalill-portfolio/dev/${fixture}/`,
    );
    expect(response.status()).toBe(404);
  }
  const productionText = await readProductionOutput('dist');
  for (const marker of [
    'All City Mile',
    'PRIVATE_SOURCE_SENTINEL',
    'PRIVATE_METRIC_SENTINEL',
    'Review only · Draft project content',
    'data:image/svg+xml',
    '/dev/homepage/',
    '/dev/story/',
  ]) {
    expect(productionText).not.toContain(marker);
  }
});
