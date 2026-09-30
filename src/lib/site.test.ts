import { describe, expect, it } from 'vitest';
import { mediaStyle, routeHref } from './site';

describe('base-aware routes', () => {
  it('prefixes internal routes exactly once', () => {
    expect(routeHref('/')).toBe('/katherine-kalill-portfolio/');
    expect(routeHref('/work/story/')).toBe(
      '/katherine-kalill-portfolio/work/story/',
    );
    expect(routeHref('/katherine-kalill-portfolio/work/story/')).toBe(
      '/katherine-kalill-portfolio/work/story/',
    );
  });

  it('keeps external URLs, fragments, and query-only links intact', () => {
    expect(routeHref('https://example.com')).toBe('https://example.com');
    expect(routeHref('#content')).toBe('#content');
    expect(routeHref('?filter=community')).toBe('?filter=community');
  });
});

it('maps normalized focal coordinates to CSS percentages', () => {
  expect(mediaStyle({ x: 0.5, y: 0.25 })).toBe(
    '--focal-x: 50%; --focal-y: 25%',
  );
});
