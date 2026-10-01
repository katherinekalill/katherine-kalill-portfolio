const initializeNavigation = () => {
  const navigation = document.querySelector<HTMLElement>(
    '[data-site-navigation]',
  );
  const toggle =
    navigation?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = navigation?.querySelector<HTMLElement>('[data-menu-panel]');
  const header = navigation?.closest<HTMLElement>('.site-header');
  if (!navigation || !toggle || !panel || navigation.dataset.initialized)
    return;

  const mobile = window.matchMedia('(max-width: 47.999rem)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const links = [...panel.querySelectorAll<HTMLAnchorElement>('a[href]')];
  const sectionLinks = links.flatMap((link) => {
    const id = link.dataset.sectionId;
    const target = id ? document.getElementById(id) : null;
    return target ? [{ link, target }] : [];
  });
  const scrollKeys = new Set([
    'ArrowDown',
    'ArrowUp',
    'PageDown',
    'PageUp',
    'Home',
    'End',
    ' ',
  ]);
  let sectionFrame = 0;
  let focusFrame = 0;
  let scrollFrame = 0;
  let requestedTarget: HTMLElement | undefined;
  let settledTarget: HTMLElement | undefined;
  let navigationFocusedTarget: HTMLElement | undefined;
  let lastInputWasPointer = false;

  navigation.dataset.initialized = 'true';
  navigation.dataset.enhanced = 'true';
  header?.setAttribute('data-navigation-enhanced', 'true');
  toggle.hidden = false;

  const setOpen = (isOpen: boolean) => {
    navigation.dataset.menuOpen = String(isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  const setCurrentSection = () => {
    sectionFrame = 0;
    if (sectionLinks.length === 0) return;
    const navBottom = navigation.getBoundingClientRect().bottom;
    const passed = sectionLinks.filter(
      ({ target }) => target.getBoundingClientRect().top <= navBottom + 48,
    );
    const atPageEnd =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2;
    const lastVisible = sectionLinks.filter(({ target }) => {
      const bounds = target.getBoundingClientRect();
      return bounds.top < window.innerHeight && bounds.bottom > navBottom;
    });
    const settledTargetLink = lastVisible.find(
      ({ target }) => target === settledTarget,
    );
    const current = requestedTarget
      ? sectionLinks.find(({ target }) => target === requestedTarget)
      : (settledTargetLink ??
        (atPageEnd
          ? lastVisible.at(-1)
          : (passed.at(-1) ?? lastVisible.at(-1))));
    for (const { link } of sectionLinks) link.removeAttribute('aria-current');
    current?.link.setAttribute('aria-current', 'location');
  };

  const scheduleCurrentSection = () => {
    if (!sectionFrame) sectionFrame = requestAnimationFrame(setCurrentSection);
  };

  const cancelScrollAnimation = () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
  };

  const cancelPendingFocus = () => {
    cancelAnimationFrame(focusFrame);
    focusFrame = 0;
  };

  const getScrollDestination = (target: HTMLElement): number => {
    const bounds = target.getBoundingClientRect();
    const scrollMargin = Number.parseFloat(
      getComputedStyle(target).scrollMarginBlockStart,
    );
    return Math.max(
      0,
      Math.min(
        document.documentElement.scrollHeight - window.innerHeight,
        window.scrollY +
          bounds.top -
          (Number.isFinite(scrollMargin) ? scrollMargin : 0),
      ),
    );
  };

  const finishRequestedScroll = () => {
    if (!requestedTarget) return;
    cancelAnimationFrame(sectionFrame);
    sectionFrame = 0;
    setCurrentSection();
    settledTarget = requestedTarget;
    requestedTarget = undefined;
  };

  const onScroll = () => {
    scheduleCurrentSection();
  };

  const onHistoryNavigation = () => {
    cancelScrollAnimation();
    cancelPendingFocus();
    requestedTarget = undefined;
    settledTarget = undefined;
    scheduleCurrentSection();
  };

  const interruptRequestedScroll = () => {
    if (!requestedTarget && !settledTarget) return;
    cancelScrollAnimation();
    cancelPendingFocus();
    requestedTarget = undefined;
    settledTarget = undefined;
    window.scrollTo({
      left: window.scrollX,
      top: window.scrollY,
      behavior: 'instant',
    });
    scheduleCurrentSection();
  };

  const clearNavigationFocus = (target = navigationFocusedTarget) => {
    target?.removeAttribute('data-navigation-focus');
    if (navigationFocusedTarget === target) navigationFocusedTarget = undefined;
  };

  const onPointerDown = () => {
    clearNavigationFocus();
    lastInputWasPointer = true;
    interruptRequestedScroll();
  };

  const onUserKeydown = (event: KeyboardEvent) => {
    clearNavigationFocus();
    lastInputWasPointer = false;
    const origin = event.target;
    if (
      scrollKeys.has(event.key) &&
      !(
        origin instanceof HTMLElement &&
        origin.closest('input, textarea, select, [contenteditable="true"]')
      )
    ) {
      interruptRequestedScroll();
    }
  };

  const onBreakpointChange = () => {
    if (mobile.matches) {
      toggle.hidden = false;
      if (panel.contains(document.activeElement)) toggle.focus();
      setOpen(false);
    } else {
      setOpen(true);
      if (document.activeElement === toggle) links[0]?.focus();
      toggle.hidden = true;
    }
  };

  const onToggle = () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (
      event.key === 'Escape' &&
      mobile.matches &&
      toggle.getAttribute('aria-expanded') === 'true'
    ) {
      setOpen(false);
      toggle.focus();
    }
  };

  const onNavigationClick = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (event.target instanceof Element &&
        event.target.closest('a[target], a[download]'))
    )
      return;
    const origin = event.target;
    if (!(origin instanceof Element)) return;
    const link = origin.closest<HTMLAnchorElement>('a[href]');
    if (!link) return;
    if (mobile.matches) setOpen(false);

    const targetId = link.dataset.sectionId;
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;
    const destination = new URL(link.href);
    if (
      destination.origin !== window.location.origin ||
      destination.pathname !== window.location.pathname ||
      decodeURIComponent(destination.hash.slice(1)) !== target.id
    )
      return;

    event.preventDefault();
    if (destination.hash !== window.location.hash) {
      window.history.pushState(window.history.state, '', destination.href);
    }
    for (const { link: item } of sectionLinks)
      item.removeAttribute('aria-current');
    link.setAttribute('aria-current', 'location');
    cancelScrollAnimation();
    requestedTarget = target;
    settledTarget = undefined;
    cancelPendingFocus();
    focusFrame = requestAnimationFrame(() => {
      focusFrame = 0;
      if (requestedTarget !== target) return;
      if (lastInputWasPointer) {
        target.dataset.navigationFocus = 'pointer';
      } else target.dataset.navigationFocus = 'keyboard';
      navigationFocusedTarget = target;
      target.addEventListener('blur', () => clearNavigationFocus(target), {
        once: true,
      });
      target.focus({ preventScroll: true });
      const start = window.scrollY;
      const destinationY = getScrollDestination(target);
      if (reducedMotion.matches || Math.abs(destinationY - start) < 1) {
        window.scrollTo({ top: destinationY, behavior: 'instant' });
        finishRequestedScroll();
        return;
      }

      const duration = 800;
      const startedAt = performance.now();
      const animateScroll = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const easedProgress =
          progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        window.scrollTo({
          top: start + (destinationY - start) * easedProgress,
          behavior: 'instant',
        });
        if (progress < 1) {
          scrollFrame = requestAnimationFrame(animateScroll);
          return;
        }
        scrollFrame = 0;
        finishRequestedScroll();
      };
      scrollFrame = requestAnimationFrame(animateScroll);
    });
  };

  const cleanup = () => {
    toggle.removeEventListener('click', onToggle);
    navigation.removeEventListener('keydown', onKeydown);
    navigation.removeEventListener('click', onNavigationClick);
    mobile.removeEventListener('change', onBreakpointChange);
    reducedMotion.removeEventListener('change', onReducedMotionChange);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('popstate', onHistoryNavigation);
    window.removeEventListener('resize', scheduleCurrentSection);
    window.removeEventListener('wheel', interruptRequestedScroll);
    window.removeEventListener('touchstart', interruptRequestedScroll);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('keydown', onUserKeydown);
    cancelScrollAnimation();
    cancelPendingFocus();
    cancelAnimationFrame(sectionFrame);
    clearNavigationFocus();
    navigation.removeAttribute('data-initialized');
    header?.removeAttribute('data-navigation-enhanced');
  };

  const onReducedMotionChange = () => {
    if (!reducedMotion.matches || !requestedTarget) return;
    cancelScrollAnimation();
    if (focusFrame) return;
    const destinationY = getScrollDestination(requestedTarget);
    window.scrollTo({ top: destinationY, behavior: 'instant' });
    finishRequestedScroll();
  };

  for (const { target } of sectionLinks) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  }
  toggle.addEventListener('click', onToggle);
  navigation.addEventListener('keydown', onKeydown);
  navigation.addEventListener('click', onNavigationClick);
  mobile.addEventListener('change', onBreakpointChange);
  reducedMotion.addEventListener('change', onReducedMotionChange);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('popstate', onHistoryNavigation);
  window.addEventListener('resize', scheduleCurrentSection, { passive: true });
  window.addEventListener('wheel', interruptRequestedScroll, { passive: true });
  window.addEventListener('touchstart', interruptRequestedScroll, {
    passive: true,
  });
  window.addEventListener('pointerdown', onPointerDown, {
    passive: true,
  });
  window.addEventListener('keydown', onUserKeydown);
  window.addEventListener('pagehide', cleanup, { once: true });
  setOpen(!mobile.matches);
  toggle.hidden = !mobile.matches;
  setCurrentSection();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNavigation, {
    once: true,
  });
} else {
  initializeNavigation();
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) initializeNavigation();
});
