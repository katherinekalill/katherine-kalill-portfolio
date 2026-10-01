const navigationEntry = performance.getEntriesByType('navigation').at(0) as
  PerformanceNavigationTiming | undefined;

const objectState = (): Record<string, unknown> => {
  const current = history.state;
  return current && typeof current === 'object' && !Array.isArray(current)
    ? (current as Record<string, unknown>)
    : {};
};

for (const rail of document.querySelectorAll<HTMLElement>(
  '[data-featured-rail]',
)) {
  const section = rail.closest<HTMLElement>('.featured-work');
  const previous =
    section?.querySelector<HTMLButtonElement>('[data-rail-prev]');
  const next = section?.querySelector<HTMLButtonElement>('[data-rail-next]');
  const status = section?.querySelector<HTMLElement>('[data-rail-status]');
  if (!section || !previous || !next) continue;

  const cards = Array.from(
    rail.querySelectorAll<HTMLElement>('.featured-story'),
  );
  if (cards.length < 2) continue;

  section.dataset.railEnhanced = 'true';

  let animationFrame = 0;
  let saveFrame = 0;
  let stateReady = navigationEntry?.type !== 'back_forward';
  let animationTarget = rail.scrollLeft;
  const initialSaved = objectState().homepageRail;
  const initialSavedLeft =
    initialSaved && typeof initialSaved === 'object'
      ? (initialSaved as { left?: unknown }).left
      : undefined;

  const savedLeftFromHistory = () => {
    const saved = objectState().homepageRail;
    return saved && typeof saved === 'object'
      ? (saved as { left?: unknown }).left
      : undefined;
  };

  const cardStart = (card: HTMLElement) =>
    card.getBoundingClientRect().left -
    rail.getBoundingClientRect().left +
    rail.scrollLeft;

  const savePosition = () => {
    const current = objectState();
    history.replaceState(
      {
        ...current,
        homepageRail: { left: rail.scrollLeft, pageY: window.scrollY },
      },
      '',
    );
  };

  const updateControls = () => {
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    previous.disabled = rail.scrollLeft <= 1;
    next.disabled = maxScroll <= 1 || rail.scrollLeft >= maxScroll - 1;

    if (!stateReady) return;
    if (saveFrame) return;
    saveFrame = requestAnimationFrame(() => {
      saveFrame = 0;
      savePosition();
    });
  };

  const move = (direction: -1 | 1) => {
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const searchLeft = animationFrame ? animationTarget : rail.scrollLeft;
    const candidate =
      direction > 0
        ? cards.find((item) => cardStart(item) > searchLeft + 1)
        : [...cards].reverse().find((item) => cardStart(item) < searchLeft - 1);
    const target = Math.min(
      maxScroll,
      Math.max(0, candidate ? cardStart(candidate) : searchLeft),
    );
    if (candidate && status) {
      const index = cards.indexOf(candidate) + 1;
      const title = candidate
        .querySelector('.featured-story__title')
        ?.textContent?.trim();
      if (title)
        status.textContent = `Project ${index} of ${cards.length}: ${title}`;
    }

    cancelAnimation();
    animationTarget = target;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rail.scrollLeft = target;
      updateControls();
      return;
    }

    const start = rail.scrollLeft;
    const distance = target - start;
    const startedAt = performance.now();
    const duration = 350;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      rail.scrollLeft = start + distance * eased;
      if (progress < 1) animationFrame = requestAnimationFrame(tick);
      else {
        animationFrame = 0;
        updateControls();
      }
    };
    animationFrame = requestAnimationFrame(tick);
  };

  const cancelAnimation = () => {
    if (!animationFrame) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const restore = (left: unknown) => {
    if (typeof left === 'number' && Number.isFinite(left)) {
      rail.scrollLeft = Math.max(
        0,
        Math.min(left, rail.scrollWidth - rail.clientWidth),
      );
    }
    stateReady = true;
    updateControls();
  };

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  rail.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls, { passive: true });
  rail.addEventListener('wheel', cancelAnimation, { passive: true });
  rail.addEventListener('touchstart', cancelAnimation, { passive: true });
  rail.addEventListener('pointerdown', cancelAnimation, { passive: true });
  rail.addEventListener(
    'click',
    (event) => {
      if ((event.target as Element).closest('a')) savePosition();
    },
    true,
  );
  rail.addEventListener('focusin', (event) => {
    const card = (event.target as Element).closest<HTMLElement>(
      '.featured-story',
    );
    if (!card) return;
    cancelAnimation();
    const left = cardStart(card);
    const right = left + card.getBoundingClientRect().width;
    if (left < rail.scrollLeft) rail.scrollLeft = left;
    else if (right > rail.scrollLeft + rail.clientWidth) {
      rail.scrollLeft = right - rail.clientWidth;
    }
    updateControls();
  });
  window.addEventListener(
    'scroll',
    () => {
      if (!stateReady || saveFrame) return;
      saveFrame = requestAnimationFrame(() => {
        saveFrame = 0;
        savePosition();
      });
    },
    { passive: true },
  );
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion.addEventListener('change', (event) => {
    if (!event.matches || !animationFrame) return;
    cancelAnimation();
    rail.scrollLeft = animationTarget;
    updateControls();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      stateReady = false;
      const left = savedLeftFromHistory();
      requestAnimationFrame(() => restore(left));
    }
  });

  updateControls();
  if (navigationEntry?.type === 'back_forward') {
    requestAnimationFrame(() => restore(initialSavedLeft));
  }
}
