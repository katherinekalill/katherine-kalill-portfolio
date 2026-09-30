export type MotionCleanup = () => void;

export function mountMotion(root: ParentNode = document): MotionCleanup {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealItems = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
  const parallaxItems = [
    ...root.querySelectorAll<HTMLElement>('[data-parallax]'),
  ];
  let revealObserver: IntersectionObserver | undefined;
  let parallaxObserver: IntersectionObserver | undefined;
  let frame = 0;
  const activeLayers = new Set<HTMLElement>();
  const designTokens = getComputedStyle(document.documentElement);
  const remInPixels = Number.parseFloat(designTokens.fontSize);
  const tabletBreakpoint =
    Number.parseFloat(designTokens.getPropertyValue('--breakpoint-tablet')) *
    remInPixels;
  const desktopBreakpoint =
    Number.parseFloat(designTokens.getPropertyValue('--breakpoint-desktop')) *
    remInPixels;
  const revealDuration =
    designTokens.getPropertyValue('--motion-reveal').trim() || '400ms';
  const revealEasing =
    designTokens.getPropertyValue('--ease-editorial').trim() ||
    'cubic-bezier(0.22, 1, 0.36, 1)';

  const reset = () => {
    revealObserver?.disconnect();
    parallaxObserver?.disconnect();
    activeLayers.clear();
    cancelAnimationFrame(frame);
    frame = 0;
    for (const item of revealItems) {
      item.style.removeProperty('opacity');
      item.style.removeProperty('transform');
      item.style.removeProperty('transition');
    }
    for (const item of parallaxItems) item.style.removeProperty('--parallax-y');
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
      const offset = (Math.max(0, Math.min(1, progress)) - 0.5) * 2 * distance;
      item.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
    }
  };

  const scheduleParallax = () => {
    if (!frame && activeLayers.size > 0)
      frame = requestAnimationFrame(updateParallax);
  };

  const setup = () => {
    reset();
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    if (revealItems.length > 0) {
      revealObserver = new IntersectionObserver(
        (entries, observer) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const item = entry.target as HTMLElement;
            item.style.transition = `opacity ${revealDuration} ${revealEasing}, transform ${revealDuration} ${revealEasing}`;
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'translate3d(0, 0, 0)';
            });
            observer.unobserve(item);
          }
        },
        { threshold: 0.12 },
      );

      for (const item of revealItems) {
        item.style.opacity = '0';
        item.style.transform = 'translate3d(0, 16px, 0)';
        revealObserver.observe(item);
      }
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

  return () => {
    reducedMotion.removeEventListener('change', onMotionPreferenceChange);
    window.removeEventListener('scroll', scheduleParallax);
    window.removeEventListener('resize', scheduleParallax);
    reset();
  };
}
