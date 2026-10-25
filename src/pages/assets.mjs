import { html } from '../lib/html.mjs';
import { breadcrumbs, productCard } from '../components/ui.mjs';

export default function assets({ site, products, media }) {
  const body = html`
<section class="page-hero">
  <div class="container">
    ${breadcrumbs([{ href: '/', label: 'Home' }, { label: 'Assets' }])}
    <h1>Asset Catalog</h1>
    <p class="lead">Released and upcoming ${site.name} assets for Unity. Every listing shows real renders of the shipped model.</p>
  </div>
</section>

<section class="section section-tight" aria-labelledby="catalog-heading">
  <div class="container">
    <h2 id="catalog-heading" class="visually-hidden">Assets</h2>
    <div class="filter-bar" role="group" aria-label="Filter by category" data-filter hidden>
      <button type="button" class="filter-button" data-category="all" aria-pressed="true">All Assets</button>
      ${site.categories.map((c) => html`<button type="button" class="filter-button" data-category="${c.id}" aria-pressed="false">${c.label}</button>`)}
    </div>
    <p class="filter-status" role="status" aria-live="polite" data-filter-status></p>
    <div class="product-grid" data-product-grid>
      ${products.map((product, i) => productCard(site, media[product.mediaKey], product, { eager: i === 0 }))}
    </div>
    <div class="empty-state" data-empty-state hidden>
      <h2>Nothing here yet</h2>
      <p>We have not released assets in this category. We only list assets that exist, so check back later or <a href="/assets.html">view all assets</a>.</p>
    </div>
  </div>
</section>`;

  return {
    file: 'assets.html',
    page: {
      path: '/assets.html',
      active: 'assets',
      title: 'Asset Catalog',
      description: `Browse ${site.name} game assets for Unity, including Vorthak, the Mountain’s Wrath, a rigged and animated rock golem boss.`,
      body,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${site.name} Asset Catalog`,
          url: `${site.url}assets.html`,
          hasPart: products.map((p) => ({ '@type': '3DModel', name: p.name, url: `${site.url}assets/${p.slug}/` })),
        },
      ],
    },
  };
}
