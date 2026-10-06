const filters = document.querySelector<HTMLElement>('[data-archive-filters]');
const grid = document.querySelector<HTMLElement>('[data-archive-grid]');

if (filters && grid) {
  const buttons = [
    ...filters.querySelectorAll<HTMLButtonElement>('[data-archive-filter]'),
  ];
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-archive-card]')];
  const count = document.querySelector<HTMLElement>('[data-archive-count]');
  const empty = document.querySelector<HTMLElement>('[data-archive-empty]');
  const reset = document.querySelector<HTMLButtonElement>(
    '[data-archive-reset]',
  );
  const validFilters = new Set(
    buttons.map((button) => button.dataset.archiveFilter),
  );

  const selectedFromUrl = () => {
    const value = new URL(window.location.href).searchParams.get('discipline');
    return value && validFilters.has(value) ? value : 'all';
  };

  const render = (selected: string) => {
    let visibleCount = 0;
    for (const card of cards) {
      const categories = card.dataset.categories?.split(' ') ?? [];
      const visible = selected === 'all' || categories.includes(selected);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    }
    for (const button of buttons) {
      button.setAttribute(
        'aria-pressed',
        button.dataset.archiveFilter === selected ? 'true' : 'false',
      );
    }
    if (count)
      count.textContent = `${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'}`;
    if (empty) empty.hidden = visibleCount > 0;
  };

  const applySelection = (selected: string, updateHistory: boolean) => {
    if (updateHistory) {
      const url = new URL(window.location.href);
      if (selected === 'all') url.searchParams.delete('discipline');
      else url.searchParams.set('discipline', selected);
      window.history.pushState(
        {},
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
    render(selected);
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const selected = button.dataset.archiveFilter ?? 'all';
      applySelection(selected, true);
    });
  }
  reset?.addEventListener('click', () => {
    applySelection('all', true);
    buttons.find((button) => button.dataset.archiveFilter === 'all')?.focus();
  });
  window.addEventListener('popstate', () => render(selectedFromUrl()));

  render(selectedFromUrl());
  filters.hidden = false;
}
