import { defineConfig } from 'astro/config';

const foundationPreview = process.env.FOUNDATION_PREVIEW === '1';

export default defineConfig({
  site: 'https://katherinekalill.github.io',
  base: '/katherine-kalill-portfolio',
  trailingSlash: 'always',
  outDir: foundationPreview ? './.foundation-dist' : './dist',
  output: 'static',
});
