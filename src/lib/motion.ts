export type MotionCleanup = () => void;

interface MotionOptions {
  animateInitialHero?: boolean;
}

type ExitDirection = 'top' | 'bottom';

const entranceDuration = 500;
const minimumIntersectionRatio = 0.15;

export function mountMotion(
  root: ParentNode = document,
  { animateInitialHero = true }: MotionOptions = {},
): MotionCleanup {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealItems = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
  const parallaxItems = [
    ...root.querySelectorAll<HTMLElement>('[data-parallax]'),
  ];
  let revealObserver: IntersectionObserver | undefined;
  let parallaxObserver: IntersectionObserver | undefined;
  let frame = 0;
  const activeLayers = new Set<HTMLElement>();
  const armedItems = new Set<HTMLElement>();
  const initialHeroItems = new Set<HTMLElement>();
  const exitDirections = new Map<HTMLElement, ExitDirection>();
  const entranceAnimations = new Map<HTMLElement, Animation>();
  const designTokens = getComputedStyle(document.documentElement);
  const remInPixels = Number.parseFloat(designTokens.fontSize);
  const tabletBreakpoint =
    Number.parseFloat(designTokens.getPropertyValue('--breakpoint-tablet')) *
    remInPixels;
  const desktopBreakpoint =
    Number.parseFloat(designTokens.getPropertyValue('--breakpoint-desktop')) *
    remInPixels;
  const revealEasing =
    designTokens.getPropertyValue('--ease-editorial').trim() ||
    'cubic-bezier(0.22, 1, 0.36, 1)';
  const revealDurationToken = designTokens
    .getPropertyValue('--motion-reveal')
    .trim();
  const revealDurationValue = Number.parseFloat(revealDurationToken);
  const revealDuration =
    revealDurationToken.endsWith('s') && !revealDurationToken.endsWith('ms')
      ? revealDurationValue * 1000
      : revealDurationValue || entranceDuration;

  const cancelEntrance = (item: HTMLElement) => {
    entranceAnimations.get(item)?.cancel();
    entranceAnimations.delete(item);
  };

  const reset = () => {
    revealObserver?.disconnect();
    parallaxObserver?.disconnect();
    activeLayers.clear();
    cancelAnimationFrame(frame);
    frame = 0;
    for (const item of revealItems) {
      cancelEntrance(item);
      item.style.removeProperty('transform');
    }
    for (const item of parallaxItems) item.style.removeProperty('--parallax-y');
  };

  const seedRevealState = () => {
    armedItems.clear();
    initialHeroItems.clear();
    exitDirections.clear();
    for (const item of revealItems) {
      const bounds = item.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
        armedItems.add(item);
        exitDirections.set(item, bounds.bottom <= 0 ? 'top' : 'bottom');
      } else if (animateInitialHero && item.dataset.reveal === 'hero') {
        initialHeroItems.add(item);
      }
    }
  };

  const isFocusProtected = (item: HTMLElement): boolean => {
    const active = document.activeElement;
    return (
      active instanceof HTMLElement &&
      (item.contains(active) ||
        (active !== document.body && active.contains(item)))
    );
  };

  const animateEntrance = (item: HTMLElement) => {
    const distance = window.matchMedia('(max-width: 47.999rem)').matches
      ? 16
      : 24;
    const sign = exitDirections.get(item) === 'top' ? -1 : 1;
    const parsedDelay = Number.parseInt(item.dataset.revealDelay ?? '0', 10);
    const delay = Number.isFinite(parsedDelay)
      ? Math.max(0, Math.min(180, parsedDelay))
      : 0;
    cancelEntrance(item);
    const animation = item.animate(
      [
        { transform: `translateY(${sign * distance}px)` },
        { transform: 'translateY(0)' },
      ],
      {
        duration: revealDuration,
        delay,
        easing: revealEasing,
        fill: 'none',
      },
    );
    entranceAnimations.set(item, animation);
    animation.addEventListener(
      'finish',
      () => {
        if (entranceAnimations.get(item) === animation)
          entranceAnimations.delete(item);
      },
      { once: true },
    );
  };

  const updateParallax = () => {
    frame = 0;
    const distance =
      window.innerWidth < tabletBreakpoint
        ? 12
        : window.innerWidth < desktopBreakpoint
          ? 16
          : 24;
    for (const item of activeLayers) {
      const rect = item.getBoundingClientRect();
      const progress =
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const image =
        item instanceof HTMLImageElement ? item : item.querySelector('img');
      const safeDistance = image
        ? Math.min(distance, image.getBoundingClientRect().height * 0.034)
        : distance;
      const offset =
        (Math.max(0, Math.min(1, progress)) - 0.5) * 2 * safeDistance;
      item.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
    }
  };

  const scheduleParallax = () => {
    if (!frame && activeLayers.size > 0)
      frame = requestAnimationFrame(updateParallax);
  };

  const onRevealEntries = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      const item = entry.target as HTMLElement;
      if (!entry.isIntersecting) {
        armedItems.add(item);
        exitDirections.set(
          item,
          entry.boundingClientRect.bottom <= 0 ? 'top' : 'bottom',
        );
        cancelEntrance(item);
        continue;
      }
      if (entry.intersectionRatio < minimumIntersectionRatio) continue;
      const initialHero = initialHeroItems.has(item);
      if (!armedItems.has(item) && !initialHero) continue;
      if (isFocusProtected(item)) {
        armedItems.delete(item);
        initialHeroItems.delete(item);
        continue;
      }
      armedItems.delete(item);
      initialHeroItems.delete(item);
      animateEntrance(item);
    }
  };

  const onFocusIn = (event: FocusEvent) => {
    const focused = event.target;
    if (!(focused instanceof HTMLElement)) return;
    for (const item of revealItems) {
      if (item.contains(focused) || focused.contains(item)) {
        armedItems.delete(item);
        initialHeroItems.delete(item);
        cancelEntrance(item);
      }
    }
  };

  const setup = () => {
    reset();
    seedRevealState();
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    if (revealItems.length > 0) {
      revealObserver = new IntersectionObserver(onRevealEntries, {
        threshold: [0, minimumIntersectionRatio],
      });
      for (const item of revealItems) revealObserver.observe(item);
    }

    if (parallaxItems.length > 0) {
      parallaxObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const item = entry.target as HTMLElement;
          if (entry.isIntersecting) activeLayers.add(item);
          else activeLayers.delete(item);
        }
        scheduleParallax();
      });
      for (const item of parallaxItems) parallaxObserver.observe(item);
      window.addEventListener('scroll', scheduleParallax, { passive: true });
      window.addEventListener('resize', scheduleParallax, { passive: true });
    }
  };

  const onMotionPreferenceChange = () => setup();
  setup();
  reducedMotion.addEventListener('change', onMotionPreferenceChange);
  document.addEventListener('focusin', onFocusIn);

  return () => {
    reducedMotion.removeEventListener('change', onMotionPreferenceChange);
    document.removeEventListener('focusin', onFocusIn);
    window.removeEventListener('scroll', scheduleParallax);
    window.removeEventListener('resize', scheduleParallax);
    reset();
  };
}
