export const homepageHeroMediaOrder = [
  'all-city-mile-hero',
  'all-city-mile-huddle',
  'freaks-of-nature-hero',
  'womens-self-defense-hero',
  'womens-self-defense-partner',
  'all-city-mile-community',
  'all-city-mile-results',
  'usa-track-championships-community',
  'usa-track-championships-collaborators',
] as const;

export interface HomepageHeroMedia {
  id: string;
  src: string;
  width: number;
  height: number;
  focalPoint: { x: number; y: number };
  alt: string;
  variants: Array<{ src: string; width: number; height: number }>;
}

export interface HomepageHeroSlide {
  id: string;
  src: string;
  width: number;
  height: number;
  focalPoint: { x: number; y: number };
  srcSet: string;
}

export function createHomepageHeroSlides(
  media: HomepageHeroMedia[],
  resolveUrl: (src: string) => string = (src) => src,
): HomepageHeroSlide[] {
  return homepageHeroMediaOrder.flatMap((id) => {
    const item = media.find((candidate) => candidate.id === id);
    if (!item || item.width <= item.height) return [];
    return [
      {
        id: item.id,
        src: resolveUrl(item.src),
        width: item.width,
        height: item.height,
        focalPoint: item.focalPoint,
        srcSet: [item, ...item.variants]
          .map((variant) => `${resolveUrl(variant.src)} ${variant.width}w`)
          .join(', '),
      },
    ];
  });
}
