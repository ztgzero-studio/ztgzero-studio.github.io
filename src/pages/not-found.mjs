import { html } from '../lib/html.mjs';

export default function notFound({ site }) {
  const body = html`
<section class="page-hero not-found">
  <div class="container narrow">
    <p class="eyebrow">Error 404</p>
    <h1>This page could not be found</h1>
    <p class="lead">The address may be mistyped, or the page may have moved.</p>
    <div class="actions">
      <a class="button button-primary" href="/">Go to the homepage</a>
      <a class="button button-ghost" href="/assets.html">Browse assets</a>
      <a class="button button-ghost" href="/support.html">Get support</a>
    </div>
  </div>
</section>`;

  return {
    file: '404.html',
    page: {
      path: '/404.html',
      title: 'Page Not Found',
      description: `The page you requested does not exist on the ${site.name} website.`,
      noindex: true,
      body,
    },
  };
}
