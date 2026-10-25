import { html } from '../lib/html.mjs';
import { largest, picture } from '../components/media.mjs';
import { breadcrumbs, categoryLabels, productPath, statusLabel, storeAction } from '../components/ui.mjs';

function specTable(rows, caption) {
  return html`<table class="spec-table">
    <caption class="visually-hidden">${caption}</caption>
    <tbody>${rows.map((r) => html`<tr><th scope="row">${r.label}</th><td>${r.value}</td></tr>`)}</tbody>
  </table>`;
}

function gallery(media, product) {
  return html`<ul class="gallery" data-gallery>
    ${product.media.gallery.map((item) => {
      const full = largest(media, item.key);
      return html`<li>
        <figure>
          <a class="gallery-link" href="/${full.src}" data-full-width="${full.width}" data-full-height="${full.height}" data-caption="${item.caption}">
            ${picture(media, item.key, { alt: item.alt, sizes: '(min-width: 1100px) 360px, (min-width: 640px) 45vw, 100vw' })}
            <span class="visually-hidden">Open larger image</span>
          </a>
          <figcaption>${item.caption}</figcaption>
        </figure>
      </li>`;
    })}
  </ul>`;
}

export default function product({ site, media: allMedia }, p) {
  const media = allMedia[p.mediaKey];
  const path = productPath(p);
  const video = p.media.video && media[p.media.video.key] ? p.media.video : null;
  const poster = video ? largest(media, video.poster) : null;

  const body = html`
<section class="product-hero">
  <div class="container product-hero-inner">
    <div class="product-hero-copy">
      ${breadcrumbs([{ href: '/', label: 'Home' }, { href: '/assets.html', label: 'Assets' }, { label: p.name }])}
      <div class="product-meta">${statusLabel(p.availability)}<span class="tags">${categoryLabels(site, p).join(' · ')}</span></div>
      <h1>${p.name}</h1>
      <p class="lead">${p.summary}</p>
      ${storeAction(p, { showStatus: false })}
      <dl class="stats">
        ${p.highlights.map((h) => html`<div><dt>${h.label}</dt><dd>${h.value}</dd></div>`)}
      </dl>
    </div>
    <div class="product-hero-media">
      ${picture(media, p.media.hero, { alt: `${p.name}, full body in a three-quarter front view`, sizes: '(min-width: 900px) 55vw, 100vw', eager: true })}
    </div>
  </div>
</section>

<nav class="product-subnav" aria-label="On this page">
  <div class="container">
    <ul>
      <li><a href="#overview">Overview</a></li>
      <li><a href="#gallery">Gallery</a></li>
      <li><a href="#features">Features</a></li>
      <li><a href="#specifications">Specifications</a></li>
      <li><a href="#animations">Animations</a></li>
      <li><a href="#compatibility">Compatibility</a></li>
      <li><a href="#contents">Contents</a></li>
      <li><a href="#support">Support</a></li>
    </ul>
  </div>
</nav>

<section class="section" id="overview" aria-labelledby="overview-heading">
  <div class="container prose-grid">
    <div class="prose">
      <h2 id="overview-heading">Overview</h2>
      ${p.description.map((para) => html`<p>${para}</p>`)}
    </div>
    <aside class="info-card" aria-label="Package at a glance">
      <h3>At a glance</h3>
      ${specTable([
        { label: 'Publisher', value: site.name },
        { label: 'Version', value: p.version },
        { label: 'Render pipeline', value: 'URP' },
        { label: 'Status', value: p.availability === 'available' ? 'Available' : 'Coming Soon' },
      ], 'Package at a glance')}
    </aside>
  </div>
</section>

<section class="section section-alt" id="gallery" aria-labelledby="gallery-heading">
  <div class="container">
    <div class="section-head">
      <h2 id="gallery-heading">Gallery</h2>
      <p>Every image is a real-time Unity render of the shipped model, materials, skeleton and animation data. Select an image to enlarge it.</p>
    </div>
    ${gallery(media, p)}
    ${video ? html`
    <figure class="video-block">
      <video controls preload="none" playsinline width="1920" height="1080" poster="/${poster.src}">
        <source src="/${largest(media, video.key).src}" type="video/mp4">
        <a href="/${largest(media, video.key).src}">Download the showcase video (MP4)</a>
      </video>
      <figcaption>${video.caption}</figcaption>
    </figure>` : ''}
  </div>
</section>

<section class="section" id="features" aria-labelledby="features-heading">
  <div class="container">
    <h2 id="features-heading">Main features</h2>
    <ul class="feature-list">${p.features.map((f) => html`<li>${f}</li>`)}</ul>
  </div>
</section>

<section class="section section-alt" id="specifications" aria-labelledby="specs-heading">
  <div class="container two-col">
    <div>
      <h2 id="specs-heading">Technical specifications</h2>
      ${specTable(p.specs, 'Technical specifications')}
    </div>
    <div>
      <h2 id="rigging-heading">Rigging</h2>
      ${specTable(p.rigging, 'Rigging')}
    </div>
  </div>
</section>

<section class="section" id="animations" aria-labelledby="animations-heading">
  <div class="container">
    <h2 id="animations-heading">Animations</h2>
    <p>${p.animationNotes}</p>
    <div class="table-scroll">
      <table class="data-table">
        <caption class="visually-hidden">Included animation clips</caption>
        <thead><tr><th scope="col">Clip</th><th scope="col">Length</th><th scope="col">Loop</th><th scope="col">Motion</th></tr></thead>
        <tbody>
          ${p.animations.map((a) => html`<tr><th scope="row"><code>${a.name}</code></th><td>${a.length}</td><td>${a.loop ? 'Yes' : 'No'}</td><td>${a.detail}</td></tr>`)}
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="section section-alt" id="compatibility" aria-labelledby="compat-heading">
  <div class="container two-col">
    <div>
      <h2 id="compat-heading">Compatibility</h2>
      ${specTable(p.compatibility, 'Compatibility')}
    </div>
    <div>
      <h2 id="limitations-heading">Good to know</h2>
      <ul class="plain-list">${p.limitations.map((l) => html`<li>${l}</li>`)}</ul>
    </div>
  </div>
</section>

<section class="section" id="contents" aria-labelledby="contents-heading">
  <div class="container two-col">
    <div>
      <h2 id="contents-heading">Package contents</h2>
      <table class="spec-table">
        <caption class="visually-hidden">Package contents</caption>
        <tbody>${p.contents.map((c) => html`<tr><th scope="row"><code>${c.path}</code></th><td>${c.detail}</td></tr>`)}</tbody>
      </table>
    </div>
    <div>
      <h2 id="docs-heading">Documentation</h2>
      <p>${p.documentation}</p>
      ${p.documentationUrl ? html`<p><a class="text-link" href="${p.documentationUrl}">Read the documentation online</a></p>` : ''}
      <h2 id="production-heading">How it was made</h2>
      <p>${p.productionNotes}</p>
    </div>
  </div>
</section>

<section class="section section-alt" id="support" aria-labelledby="support-heading">
  <div class="container cta-inner">
    <div>
      <h2 id="support-heading">Support</h2>
      <p>Questions about compatibility, or found a problem? The support page explains what to include so we can help quickly.</p>
    </div>
    <div class="actions">
      <a class="button button-ghost" href="/support.html">Get support</a>
    </div>
  </div>
</section>

<dialog class="lightbox" data-lightbox aria-label="Image viewer">
  <div class="lightbox-frame">
    <img class="lightbox-image" alt="" data-lightbox-image>
    <p class="lightbox-caption" data-lightbox-caption></p>
  </div>
  <button type="button" class="lightbox-button lightbox-close" data-lightbox-close aria-label="Close image viewer">×</button>
  <button type="button" class="lightbox-button lightbox-prev" data-lightbox-prev aria-label="Previous image">‹</button>
  <button type="button" class="lightbox-button lightbox-next" data-lightbox-next aria-label="Next image">›</button>
</dialog>`;

  return {
    file: `assets/${p.slug}/index.html`,
    page: {
      path,
      active: 'assets',
      title: `${p.name}: ${p.seoTitleSuffix}`,
      description: p.metaDescription,
      body,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': '3DModel',
          name: p.name,
          description: p.description.join(' '),
          url: site.url + path.slice(1),
          image: p.media.gallery.map((g) => site.url + largest(media, g.key).src),
          creator: { '@type': 'Organization', name: site.name, url: site.url },
          keywords: categoryLabels(site, p).join(', '),
          version: p.version,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
            { '@type': 'ListItem', position: 2, name: 'Assets', item: `${site.url}assets.html` },
            { '@type': 'ListItem', position: 3, name: p.name, item: site.url + path.slice(1) },
          ],
        },
      ],
    },
  };
}
