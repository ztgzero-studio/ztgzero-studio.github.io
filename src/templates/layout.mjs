import { html, jsonLd } from '../lib/html.mjs';
import { footer, header } from '../components/ui.mjs';

export function absoluteUrl(site, path) {
  return site.url + path.replace(/^\/+/, '');
}

// page: { path, title, description, active, body, ogType?, bodyClass?, structuredData?, noindex? }
// Every page shares the 1200x630 social image, so its declared size is always correct.
export function layout(site, page) {
  const canonical = absoluteUrl(site, page.path);
  const title = page.path === '/' ? page.title : `${page.title} | ${site.name}`;
  const image = absoluteUrl(site, site.socialImage);
  const imageAlt = site.socialImageAlt;

  return `<!doctype html>
${html`<html lang="${site.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${page.description}">
${page.noindex ? html`<meta name="robots" content="noindex">` : html`<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#0B0F17">
<meta name="color-scheme" content="dark">
<script>document.documentElement.classList.add('js')</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/site.css">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${page.description}">
${page.noindex ? '' : html`<meta property="og:url" content="${canonical}">`}
<meta property="og:image" content="${image}">
<meta property="og:image:alt" content="${imageAlt}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${page.description}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${imageAlt}">
${(page.structuredData || []).map(jsonLd)}
<script type="module" src="/js/main.js"></script>
</head>
<body class="${page.bodyClass || ''}">
<a class="skip-link" href="#main">Skip to content</a>
${header(site, page.active)}
<main id="main">
${page.body}
</main>
${footer(site)}
</body>
</html>`}
`;
}
