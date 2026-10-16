import type { APIRoute } from 'astro';
import { routeHref } from '../lib/site';
import { loadSiteContent } from '../lib/content/site-content';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async ({ site }) => {
  if (!site)
    throw new Error(
      'Astro.site must be configured to build the sitemap.',
    );

  const content = await loadSiteContent();
  const locations = [
    '/',
    '/about/',
    '/archive/',
    ...content.projects.map(({ slug }) => `/work/${slug}/`),
  ].map((path) => new URL(routeHref(path), site).href);
  const entries = locations
    .map((location) => `  <url><loc>${escapeXml(location)}</loc></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
