import { html } from '../lib/html.mjs';
import { picture } from './media.mjs';

export const AVAILABILITY = {
  available: { label: 'Available', tone: 'available' },
  'coming-soon': { label: 'Coming Soon', tone: 'soon' },
  'in-development': { label: 'In Development', tone: 'dev' },
};

export function productPath(product) {
  return `/assets/${product.slug}/`;
}

export function logoMark() {
  return html`<svg class="logo-mark" viewBox="0 0 40 40" width="36" height="36" aria-hidden="true" focusable="false">
    <path d="M20 2 38 20 20 38 2 20Z" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M13 14h14L13 26h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"/>
  </svg>`;
}

const NAV = [
  { href: '/', label: 'Home', id: 'home' },
  { href: '/assets.html', label: 'Assets', id: 'assets' },
  { href: '/about.html', label: 'About', id: 'about' },
  { href: '/support.html', label: 'Support', id: 'support' },
];

export function header(site, active) {
  return html`<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${site.name} home">${logoMark()}<span class="brand-name">ZTG <span>Studio</span></span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" hidden>
      <span class="menu-toggle-bars" aria-hidden="true"></span><span class="visually-hidden">Menu</span>
    </button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul>
        ${NAV.map((item) => html`<li><a href="${item.href}"${item.id === active ? html` aria-current="page"` : ''}>${item.label}</a></li>`)}
      </ul>
    </nav>
  </div>
</header>`;
}

export function footer(site) {
  return html`<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <a class="brand" href="/">${logoMark()}<span class="brand-name">ZTG <span>Studio</span></span></a>
      <p>${site.type}. Game-ready 3D assets for Unity.</p>
    </div>
    <nav aria-label="Footer">
      <ul class="footer-links">
        <li><a href="/assets.html">Assets</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/support.html">Support</a></li>
        <li><a href="/privacy.html">Privacy</a></li>
      </ul>
    </nav>
  </div>
  <div class="container footer-legal">
    <p>© ${new Date().getUTCFullYear()} ${site.name}. Unity is a trademark of Unity Technologies; ${site.name} is an independent publisher and is not affiliated with Unity Technologies.</p>
  </div>
</footer>`;
}

export function breadcrumbs(items) {
  return html`<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol>
    ${items.map((item, i) =>
      i === items.length - 1
        ? html`<li><span aria-current="page">${item.label}</span></li>`
        : html`<li><a href="${item.href}">${item.label}</a></li>`,
    )}
  </ol>
</nav>`;
}

export function statusLabel(availability) {
  const state = AVAILABILITY[availability];
  return html`<span class="status status-${state.tone}">${state.label}</span>`;
}

export function categoryLabels(site, product) {
  return product.categories.map((id) => site.categories.find((c) => c.id === id).label);
}

export function productCard(site, media, product, { eager = false } = {}) {
  return html`<article class="product-card" data-categories="${product.categories.join(' ')}">
  <a class="product-card-link" href="${productPath(product)}">
    <div class="product-card-media">
      ${picture(media, product.media.card, { alt: `${product.name} product card`, sizes: '(min-width: 720px) 420px, 100vw', eager })}
    </div>
    <div class="product-card-body">
      <div class="product-card-meta">${statusLabel(product.availability)}<span class="tags">${categoryLabels(site, product).join(' · ')}</span></div>
      <h3>${product.name}</h3>
      <p>${product.summary}</p>
      <span class="text-link" aria-hidden="true">View details</span>
    </div>
  </a>
</article>`;
}

// Buttons are real links. A product without a verified store URL gets a disabled-looking
// status pill instead, never a link to a guessed URL.
export function storeAction(product, { showStatus = true } = {}) {
  if (product.availability === 'available' && product.storeUrl) {
    return html`<a class="button button-primary" href="${product.storeUrl}" rel="noopener">Get it on the Unity Asset Store</a>`;
  }
  return html`<p class="store-pending">${showStatus ? statusLabel(product.availability) : ''} ${product.availabilityNote}</p>`;
}
