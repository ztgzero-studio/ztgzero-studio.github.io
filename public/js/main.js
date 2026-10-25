// Progressive enhancement only: every page is complete without this script.

function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  toggle.hidden = false;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', (mq) => mq.matches && setOpen(false));
}

function initFilter() {
  const bar = document.querySelector('[data-filter]');
  const grid = document.querySelector('[data-product-grid]');
  if (!bar || !grid) return;
  const buttons = [...bar.querySelectorAll('[data-category]')];
  const cards = [...grid.querySelectorAll('[data-categories]')];
  const empty = document.querySelector('[data-empty-state]');
  const status = document.querySelector('[data-filter-status]');
  bar.hidden = false;

  const apply = (category, updateUrl) => {
    const button = buttons.find((b) => b.dataset.category === category) || buttons[0];
    const active = button.dataset.category;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    let shown = 0;
    cards.forEach((card) => {
      const match = active === 'all' || card.dataset.categories.split(' ').includes(active);
      card.hidden = !match;
      if (match) shown += 1;
    });
    empty.hidden = shown > 0;
    grid.hidden = shown === 0;
    status.textContent = `Showing ${shown} ${shown === 1 ? 'asset' : 'assets'} in ${button.textContent.trim()}.`;
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (active === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', active);
      history.replaceState(null, '', url);
    }
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.category, true)));
  apply(new URLSearchParams(window.location.search).get('category') || 'all', false);
}

function initLightbox() {
  const dialog = document.querySelector('[data-lightbox]');
  const links = [...document.querySelectorAll('[data-gallery] .gallery-link')];
  if (!dialog || links.length === 0 || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('[data-lightbox-image]');
  const caption = dialog.querySelector('[data-lightbox-caption]');
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + links.length) % links.length;
    const link = links[index];
    const thumb = link.querySelector('img');
    // Show the already-loaded thumbnail at once, then swap in the full image when it arrives.
    image.src = thumb.currentSrc || thumb.src;
    const full = new Image();
    full.onload = () => {
      if (links[index] === link) image.src = full.src;
    };
    full.src = link.href;
    image.width = Number(link.dataset.fullWidth);
    image.height = Number(link.dataset.fullHeight);
    image.alt = thumb.alt;
    caption.textContent = `${link.dataset.caption} (${index + 1} of ${links.length})`;
  };

  links.forEach((link, i) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      opener = link;
      show(i);
      dialog.showModal();
      document.body.classList.add('has-modal');
      dialog.querySelector('[data-lightbox-close]').focus();
    });
  });

  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
  // Clicking the dark area around the image closes the viewer.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.classList.contains('lightbox-frame')) dialog.close();
  });
  // Escape is handled natively by <dialog> and also fires "close".
  dialog.addEventListener('close', () => {
    document.body.classList.remove('has-modal');
    image.removeAttribute('src');
    if (opener) opener.focus();
  });
}

initMenu();
initFilter();
initLightbox();
