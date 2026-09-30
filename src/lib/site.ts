export const SITE_BASE = '/katherine-kalill-portfolio';

export function routeHref(path: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(path)) return path;
  const normalized = `/${path.replace(/^\/+/, '')}`;
  if (normalized === '/') return `${SITE_BASE}/`;
  if (normalized === `${SITE_BASE}` || normalized.startsWith(`${SITE_BASE}/`))
    return normalized;
  return `${SITE_BASE}${normalized}`;
}

export function mediaStyle(focalPoint: { x: number; y: number }): string {
  return `--focal-x: ${Math.round(focalPoint.x * 100)}%; --focal-y: ${Math.round(focalPoint.y * 100)}%`;
}
