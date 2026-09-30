import { defineConfig, devices } from '@playwright/test';

const browserEngines = [
  { name: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  retries: process.env.CI ? 1 : 0,
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: browserEngines.flatMap(({ name, device }) => [
    {
      name: `production-${name}`,
      testMatch: 'production.spec.ts',
      use: { ...device, baseURL: 'http://127.0.0.1:4321' },
    },
    {
      name: `foundation-${name}`,
      testMatch: 'foundation.spec.ts',
      use: { ...device, baseURL: 'http://127.0.0.1:4322' },
    },
  ]),
  webServer: [
    {
      command:
        'cross-env PREVIEW_DIRECTORY=dist PORT=4321 node scripts/serve-static-preview.mjs',
      url: 'http://127.0.0.1:4321/katherine-kalill-portfolio/',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command:
        'cross-env PREVIEW_DIRECTORY=.foundation-dist PORT=4322 node scripts/serve-static-preview.mjs',
      url: 'http://127.0.0.1:4322/katherine-kalill-portfolio/dev/foundation/',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
