export type MotionCleanup = () => void;

interface MotionOptions {
  animateInitialHero?: boolean;
}

type ExitDirection = 'top' | 'bottom';

const entranceDuration = 600;
const imageEntranceDuration = 700;
const revealGroupStagger = 60;
const maximumRevealDelay = 180;
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
  let revealResizeObserver: ResizeObserver | undefined;
  let parallaxObserver: IntersectionObserver | undefined;
  let revealThresholdKey = '';
  let frame = 0;
  const activeLayers = new Set<HTMLElement>();
  const armedItems = new Set<HTMLElement>();
  const initialHeroItems = new Set<HTMLElement>();
  const exitDirections = new Map<HTMLElement, ExitDirection>();
  const entranceAnimations = new Map<HTMLElement, Animation>();
  let isInitialSetup = true;
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
  const imageDurationToken = designTokens
    .getPropertyValue('--motion-image-reveal')
    .trim();
  const imageDurationValue = Number.parseFloat(imageDurationToken);
  const imageDuration =
    imageDurationToken.endsWith('s') && !imageDurationToken.endsWith('ms')
      ? imageDurationValue * 1000
      : imageDurationValue || imageEntranceDuration;

  const revealDelay = (item: HTMLElement): number => {
    const group = item.closest<HTMLElement>('[data-reveal-group]');
    if (!group) return 0;
    const explicitDelay = item.dataset.revealDelay;
    if (explicitDelay !== undefined) {
      const parsed = Number.parseInt(explicitDelay, 10);
      return Number.isFinite(parsed)
        ? Math.max(0, Math.min(maximumRevealDelay, parsed))
        : 0;
    }
    const relatedItems = [
      ...group.querySelectorAll<HTMLElement>('[data-reveal]'),
    ].filter((candidate) => candidate.closest('[data-reveal-group]') === group);
    return Math.min(
      maximumRevealDelay,
      Math.max(0, relatedItems.indexOf(item)) * revealGroupStagger,
    );
  };

  const cancelEntrance = (item: HTMLElement) => {
    entranceAnimations.get(item)?.cancel();
    entranceAnimations.delete(item);
  };

  const reset = () => {
    revealObserver?.disconnect();
    revealResizeObserver?.disconnect();
    parallaxObserver?.disconnect();
    revealThresholdKey = '';
    window.removeEventListener('scroll', scheduleParallax);
    window.removeEventListener('resize', onMotionResize);
    activeLayers.clear();
    cancelAnimationFrame(frame);
    frame = 0;
    for (const item of revealItems) cancelEntrance(item);
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
      } else if (
        animateInitialHero &&
        isInitialSetup &&
        (item.dataset.reveal === 'hero' ||
          item.hasAttribute('data-reveal-initial'))
      ) {
        initialHeroItems.add(item);
      }
    }
  };

  const isInteractiveFocusContainer = (item: HTMLElement): boolean =>
    item.matches(
      'a[href], button, input, select, textarea, summary, [contenteditable="true"], [role="button"], [role="link"]',
    );

  const isFocusProtected = (item: HTMLElement): boolean => {
    const active = document.activeElement;
    return (
      active instanceof HTMLElement &&
      (item.contains(active) ||
        (active !== document.body &&
          active.contains(item) &&
          isInteractiveFocusContainer(active)))
    );
  };

  const animateEntrance = (item: HTMLElement) => {
    const distance = window.matchMedia('(max-width: 47.999rem)').matches
      ? 16
      : 24;
    const sign = exitDirections.get(item) === 'top' ? -1 : 1;
    const delay = revealDelay(item);
    const isImage = item.dataset.reveal === 'image';
    const fromTransform = isImage
      ? `translateY(${sign * distance}px) scale(1.025)`
      : `translateY(${sign * distance}px)`;
    cancelEntrance(item);
    const animation = item.animate(
      isImage
        ? [
            { transform: fromTransform },
            { transform: 'translateY(0) scale(1)' },
          ]
        : [
            { opacity: 0.35, transform: fromTransform },
            { opacity: 1, transform: 'translateY(0)' },
          ],
      {
        duration: isImage ? imageDuration : revealDuration,
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

  const getVisibilityThreshold = (item: HTMLElement): number => {
    const bounds = item.getBoundingClientRect();
    const itemArea = bounds.width * bounds.height;
    const rail = item.closest<HTMLElement>('[data-featured-rail]');
    const visibleWidth = Math.min(
      bounds.width,
      window.innerWidth,
      rail?.clientWidth ?? window.innerWidth,
    );
    const visibleHeight = Math.min(bounds.height, window.innerHeight);
    return Math.min(
      minimumIntersectionRatio,
      itemArea > 0
        ? (visibleWidth * visibleHeight * 0.5) / itemArea
        : minimumIntersectionRatio,
    );
  };

  const observeRevealItems = () => {
    const thresholds = [
      ...new Set([
        0,
        ...revealItems.map((item) => getVisibilityThreshold(item)),
      ]),
    ].sort((left, right) => left - right);
    const thresholdKey = thresholds.join(',');
    if (revealObserver && thresholdKey === revealThresholdKey) return;

    revealObserver?.disconnect();
    revealThresholdKey = thresholdKey;
    if (revealItems.length === 0) return;
    revealObserver = new IntersectionObserver(onRevealEntries, {
      threshold: thresholds,
    });
    for (const item of revealItems) revealObserver.observe(item);
  };

  const onMotionResize = () => {
    observeRevealItems();
    scheduleParallax();
  };

  const onRevealEntries = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      const item = entry.target as HTMLElement;
      if (!entry.isIntersecting || entry.intersectionRatio === 0) {
        const bounds = entry.boundingClientRect;
        const fullyExitedAbove = bounds.bottom <= 0;
        const fullyExitedBelow = bounds.top >= window.innerHeight;
        const railBounds = item
          .closest<HTMLElement>('[data-featured-rail]')
          ?.getBoundingClientRect();
        const fullyExitedHorizontally =
          bounds.right <= (railBounds?.left ?? 0) ||
          bounds.left >= (railBounds?.right ?? window.innerWidth);
        if (fullyExitedAbove || fullyExitedBelow || fullyExitedHorizontally) {
          armedItems.add(item);
          exitDirections.set(item, fullyExitedAbove ? 'top' : 'bottom');
          cancelEntrance(item);
        }
        continue;
      }
      const visibilityThreshold = getVisibilityThreshold(item);
      const focusProtected = isFocusProtected(item);
      if (entry.intersectionRatio < visibilityThreshold) continue;
      const initialHero = initialHeroItems.has(item);
      if (!armedItems.has(item) && !initialHero) continue;
      if (focusProtected) {
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
      if (
        item.contains(focused) ||
        (focused.contains(item) && isInteractiveFocusContainer(focused))
      ) {
        armedItems.delete(item);
        initialHeroItems.delete(item);
        cancelEntrance(item);
      }
    }
  };

  const setup = () => {
    reset();
    seedRevealState();
    isInitialSetup = false;
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    if (revealItems.length > 0) {
      observeRevealItems();
      if ('ResizeObserver' in window) {
        revealResizeObserver = new ResizeObserver(observeRevealItems);
        for (const item of revealItems) revealResizeObserver.observe(item);
      }
      window.addEventListener('resize', onMotionResize, { passive: true });
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
      window.addEventListener('resize', onMotionResize, { passive: true });
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
    reset();
  };
}
