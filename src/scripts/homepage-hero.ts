interface HeroSlide {
  id: string;
  src: string;
  width: number;
  height: number;
  focalPoint: { x: number; y: number };
  srcSet: string;
}

const cadence = 4000;
const transitionDuration = 1200;
function initializeHero(root: HTMLElement) {
  const layers = [...root.querySelectorAll<HTMLElement>('[data-hero-layer]')];
  const headshot = root.querySelector<HTMLImageElement>(
    '[data-headshot-source]',
  );
  const controls = document.querySelector<HTMLElement>(
    '[data-hero-controls]:has([data-hero-toggle][aria-controls="homepage-hero"])',
  );
  const toggle =
    controls?.querySelector<HTMLButtonElement>('[data-hero-toggle]');
  const toggleLabel = controls?.querySelector<HTMLElement>(
    '[data-hero-toggle-label]',
  );
  const json = root.querySelector('[data-hero-slides]')?.textContent;
  if (layers.length !== 2 || !headshot || !json) return;
  const initialHeadshot = headshot;
  const pauseButton = toggle;

  let slides: HeroSlide[];
  try {
    slides = JSON.parse(json) as HeroSlide[];
  } catch {
    return;
  }
  if (slides.length === 0) return;

  const headshotSrc = initialHeadshot.currentSrc || initialHeadshot.src;
  const headshotSrcSet = initialHeadshot.srcset;
  const headshotSizes = initialHeadshot.sizes;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const bounds = root.getBoundingClientRect();
  const mediaState = {
    userPaused: false,
    timer: 0,
    preloadTimer: 0,
    index: 0,
    activeLayer: 0,
    ready: false,
    transitionEndsAt: 0,
    inViewport: bounds.bottom > 0 && bounds.top < window.innerHeight,
    requestId: 0,
    preparedIndex: -1,
    preparedLayerIndex: -1,
  };
  const pendingDecodes = new WeakMap<
    HTMLImageElement,
    { key: string; promise: Promise<boolean> }
  >();
  const unavailable = () =>
    reducedMotion.matches ||
    document.hidden ||
    !mediaState.inViewport ||
    mediaState.userPaused;

  root.dataset.heroEnhanced = 'true';

  if (controls && toggle) controls.hidden = false;

  function syncControl() {
    if (!toggle || !pauseButton) return;
    const disabled = reducedMotion.matches || slides.length === 0;
    pauseButton.setAttribute('aria-disabled', String(disabled));
    pauseButton.setAttribute(
      'aria-label',
      disabled
        ? 'Background image playback unavailable'
        : mediaState.userPaused
          ? 'Play background images'
          : 'Pause background images',
    );
    if (toggleLabel)
      toggleLabel.textContent = disabled
        ? 'Paused'
        : mediaState.userPaused
          ? 'Play'
          : 'Pause';
  }

  function clearTimer() {
    window.clearTimeout(mediaState.timer);
    mediaState.timer = 0;
  }

  function clearPreloadTimer() {
    window.clearTimeout(mediaState.preloadTimer);
    mediaState.preloadTimer = 0;
  }

  function scheduleNext(delay = cadence) {
    clearTimer();
    if (!unavailable() && mediaState.ready)
      mediaState.timer = window.setTimeout(advance, delay);
  }

  function prepareWhenSafe() {
    clearPreloadTimer();
    const delay = Math.max(0, mediaState.transitionEndsAt - performance.now());
    if (delay === 0) {
      void prepareNext();
      return;
    }
    mediaState.preloadTimer = window.setTimeout(
      () => void prepareNext(),
      delay + 10,
    );
  }

  function restoreHeadshot(layer: HTMLImageElement) {
    if (layer.srcset !== headshotSrcSet) layer.srcset = headshotSrcSet;
    if (layer.sizes !== headshotSizes) layer.sizes = headshotSizes;
    if (layer.src !== headshotSrc) layer.src = headshotSrc;
    layer.style.objectPosition = '40% 20%';
  }

  function imageIn(layer: HTMLElement): HTMLImageElement {
    const existing = layer.querySelector<HTMLImageElement>('img');
    if (existing) return existing;
    const image = document.createElement('img');
    image.className = 'homepage-hero__image';
    image.alt = '';
    image.width = 1920;
    image.height = 1080;
    image.decoding = 'async';
    layer.append(image);
    return image;
  }

  function setSlide(layer: HTMLImageElement, slide: HeroSlide) {
    if (layer.srcset !== slide.srcSet) layer.srcset = slide.srcSet;
    if (layer.sizes !== '100vw') layer.sizes = '100vw';
    if (layer.src !== new URL(slide.src, document.baseURI).href)
      layer.src = slide.src;
    layer.style.objectPosition = `${slide.focalPoint.x * 100}% ${slide.focalPoint.y * 100}%`;
  }

  function decodeImage(image: HTMLImageElement): Promise<boolean> {
    const key = `${image.src}|${image.srcset}`;
    const pending = pendingDecodes.get(image);
    if (pending?.key === key) return pending.promise;
    const promise = image.decode().then(
      () => true,
      () => false,
    );
    pendingDecodes.set(image, { key, promise });
    void promise.then(() => {
      if (pendingDecodes.get(image)?.promise === promise)
        pendingDecodes.delete(image);
    });
    return promise;
  }

  async function prepareNext() {
    if (unavailable() || !mediaState.ready) return;
    const index = mediaState.index;
    const layerIndex = 1 - mediaState.activeLayer;
    const layer = layers[layerIndex];
    if (!layer) return;
    const image = imageIn(layer);
    const slide = slides[index];
    if (slide) setSlide(image, slide);
    else restoreHeadshot(image);
    const requestId = mediaState.requestId;
    if (!(await decodeImage(image))) return;
    if (requestId !== mediaState.requestId || unavailable()) return;
    mediaState.preparedIndex = index;
    mediaState.preparedLayerIndex = layerIndex;
  }

  async function advance() {
    clearTimer();
    clearPreloadTimer();
    if (unavailable()) return;
    const requestId = mediaState.requestId;
    const targetLayerIndex = 1 - mediaState.activeLayer;
    const targetLayer = layers[targetLayerIndex];
    if (!targetLayer) return;
    const target = imageIn(targetLayer);
    const slide = slides[mediaState.index];
    if (
      mediaState.preparedIndex !== mediaState.index ||
      mediaState.preparedLayerIndex !== targetLayerIndex
    ) {
      if (slide) setSlide(target, slide);
      else restoreHeadshot(target);
    }
    if (!(await decodeImage(target))) {
      if (requestId !== mediaState.requestId || unavailable()) return;
      mediaState.index = (mediaState.index + 1) % (slides.length + 1);
      mediaState.preparedIndex = -1;
      scheduleNext(cadence);
      prepareWhenSafe();
      return;
    }
    if (requestId !== mediaState.requestId || unavailable()) return;
    targetLayer.classList.add('is-visible');
    layers[mediaState.activeLayer]?.classList.remove('is-visible');
    mediaState.transitionEndsAt = performance.now() + transitionDuration;
    mediaState.activeLayer = targetLayerIndex;
    mediaState.index = slide ? mediaState.index + 1 : 0;
    mediaState.preparedIndex = -1;
    mediaState.preparedLayerIndex = -1;
    // The next transition starts one cadence after this transition starts.
    scheduleNext(cadence);
    prepareWhenSafe();
  }

  function resumeIfReady() {
    if (!unavailable() && mediaState.ready) {
      scheduleNext(cadence);
      prepareWhenSafe();
    }
  }

  function pauseForEnvironment() {
    clearTimer();
    clearPreloadTimer();
    mediaState.requestId += 1;
    mediaState.preparedIndex = -1;
    if (reducedMotion.matches) {
      layers.forEach((layer, index) => {
        if (index === 0) restoreHeadshot(initialHeadshot);
        layer.classList.toggle('is-visible', index === 0);
      });
      mediaState.activeLayer = 0;
      mediaState.index = 0;
      mediaState.transitionEndsAt = 0;
    }
    syncControl();
    resumeIfReady();
  }

  pauseButton?.addEventListener('click', () => {
    if (reducedMotion.matches) return;
    mediaState.userPaused = !mediaState.userPaused;
    mediaState.requestId += 1;
    mediaState.preparedIndex = -1;
    syncControl();
    clearTimer();
    clearPreloadTimer();
    resumeIfReady();
  });
  document.addEventListener('visibilitychange', pauseForEnvironment);
  reducedMotion.addEventListener('change', pauseForEnvironment);
  window.addEventListener('pagehide', () => {
    clearTimer();
    clearPreloadTimer();
    mediaState.requestId += 1;
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) pauseForEnvironment();
  });
  const observer = new IntersectionObserver(
    ([entry]) => {
      mediaState.inViewport = Boolean(entry?.isIntersecting);
      pauseForEnvironment();
    },
    { threshold: 0 },
  );
  observer.observe(root);

  const startAfterHeadshotSettles = () => {
    mediaState.ready = true;
    resumeIfReady();
  };
  void headshot
    .decode()
    .then(startAfterHeadshotSettles, startAfterHeadshotSettles);
  syncControl();
}

document
  .querySelectorAll<HTMLElement>('[data-homepage-hero]')
  .forEach(initializeHero);
