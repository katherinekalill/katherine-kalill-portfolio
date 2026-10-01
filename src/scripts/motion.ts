import { mountMotion, type MotionCleanup } from '../lib/motion';

const navigationEntry = performance.getEntriesByType('navigation').at(0) as
  PerformanceNavigationTiming | undefined;
let cleanup: MotionCleanup = mountMotion(document, {
  animateInitialHero: navigationEntry?.type !== 'back_forward',
});

window.addEventListener('pagehide', () => cleanup());
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  cleanup();
  cleanup = mountMotion(document, { animateInitialHero: false });
});
