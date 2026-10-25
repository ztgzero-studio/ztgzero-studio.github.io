import { html } from '../lib/html.mjs';
import { picture } from '../components/media.mjs';
import { productPath, statusLabel, storeAction } from '../components/ui.mjs';

const CAPABILITIES = [
  { title: 'Game-ready characters', text: 'Single-mesh characters at real-world scale with clean pivots, PBR materials and import settings checked in Unity.' },
  { title: 'Rigging and skinning', text: 'Custom skeletons and skin weights tuned so stone stays rigid and joints bend where they should.' },
  { title: 'Hand-keyed animation', text: 'Clips animated by hand with ground contact checked frame by frame, delivered with an Animator Controller.' },
  { title: 'Unity integration', text: 'Prefabs, URP materials and a demo scene in every package, validated in Play Mode before release.' },
];

export default function home({ site, products, media }) {
  const featured = products.filter((p) => p.featured);
  const lead = featured[0];
  const counts = Object.fromEntries(site.categories.map((c) => [c.id, products.filter((p) => p.categories.includes(c.id)).length]));

  const body = html`
<section class="hero">
  <div class="container hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">${site.name} · ${site.expandedName}</p>
      <h1>${site.tagline}</h1>
      <p class="lead">${site.name} builds game-ready 3D characters and creatures for Unity. Each asset ships with its rig, animations, a URP material, a prefab and a demo scene, so you can drop it into a project and start building.</p>
      <div class="actions">
        <a class="button button-primary" href="/assets.html">Browse assets</a>
        <a class="button button-ghost" href="${productPath(lead)}">Meet ${lead.shortName}</a>
      </div>
    </div>
    <div class="hero-art">
      ${picture(media[lead.mediaKey], 'hero-transparent', { alt: `${lead.name}, a rock golem boss with glowing lava seams and a chest gem`, sizes: '(min-width: 900px) 46vw, 90vw', eager: true })}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="featured-heading">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Featured Assets</p>
      <h2 id="featured-heading">Latest from the studio</h2>
    </div>
    ${featured.map((product) => html`
    <article class="spotlight">
      <div class="spotlight-media">
        ${picture(media[product.mediaKey], product.media.spotlight, { alt: `Close-up of ${product.name}: cracked rock, moss, lava seams and chest gem`, sizes: '(min-width: 900px) 55vw, 100vw' })}
      </div>
      <div class="spotlight-body">
        ${statusLabel(product.availability)}
        <h3>${product.name}</h3>
        <p>${product.summary}</p>
        <dl class="stats">
          ${product.highlights.map((h) => html`<div><dt>${h.label}</dt><dd>${h.value}</dd></div>`)}
        </dl>
        <div class="actions">
          <a class="button button-primary" href="${productPath(product)}">View ${product.shortName}</a>
        </div>
      </div>
    </article>`)}
  </div>
</section>

<section class="section section-alt" aria-labelledby="categories-heading">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Asset Categories</p>
      <h2 id="categories-heading">What you will find here</h2>
    </div>
    <ul class="category-grid">
      ${site.categories.map((c) => html`<li>
        <a class="category-tile" href="/assets.html?category=${c.id}">
          <span class="category-name">${c.label}</span>
          <span class="category-summary">${c.summary}</span>
          <span class="category-count">${counts[c.id] ? `${counts[c.id]} ${counts[c.id] === 1 ? 'asset' : 'assets'}` : 'No releases yet'}</span>
        </a>
      </li>`)}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="capabilities-heading">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Studio Capabilities</p>
      <h2 id="capabilities-heading">How we build</h2>
    </div>
    <ul class="capability-grid">
      ${CAPABILITIES.map((c, i) => html`<li class="capability"><span class="capability-index" aria-hidden="true">0${i + 1}</span><h3>${c.title}</h3><p>${c.text}</p></li>`)}
    </ul>
  </div>
</section>

<section class="section cta" aria-labelledby="store-heading">
  <div class="container cta-inner">
    <div>
      <p class="eyebrow">Unity Asset Store</p>
      <h2 id="store-heading">Get ${site.name} assets on the Unity Asset Store</h2>
      ${site.unityPublisherUrl
        ? html`<p>All ${site.name} assets are sold through the Unity Asset Store.</p>`
        : storeAction(lead)}
    </div>
    <div class="actions">
      ${site.unityPublisherUrl
        ? html`<a class="button button-primary" href="${site.unityPublisherUrl}" rel="noopener">Visit our publisher page</a>`
        : html`<a class="button button-ghost" href="${productPath(lead)}">See what is included</a>`}
    </div>
  </div>
</section>`;

  return {
    file: 'index.html',
    page: {
      path: '/',
      active: 'home',
      title: `${site.name}: ${site.tagline}`,
      description: site.description,
      bodyClass: 'page-home',
      body,
      structuredData: [
        { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, alternateName: site.expandedName, url: site.url, logo: `${site.url}favicon.svg`, description: site.description },
        { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url, inLanguage: site.language },
      ],
    },
  };
}
