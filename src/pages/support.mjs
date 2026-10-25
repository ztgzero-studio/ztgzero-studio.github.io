import { html } from '../lib/html.mjs';
import { breadcrumbs } from '../components/ui.mjs';

const REPORT_FIELDS = [
  ['Asset name', 'For example: Vorthak, the Mountain’s Wrath'],
  ['Asset version', 'Shown in the Unity Package Manager under My Assets'],
  ['Unity Editor version', 'Help ▸ About Unity, for example 6000.6.6f1'],
  ['Render pipeline', 'URP, HDRP or Built-in, and the URP package version'],
  ['Steps to reproduce', 'What you did, what you expected, and what happened'],
  ['Screenshots or console errors', 'Copy the full Console message, including the stack trace'],
];

const TROUBLESHOOTING = [
  {
    q: 'The character renders pink or magenta',
    a: 'The material uses the URP/Lit shader. Install the Universal Render Pipeline package (com.unity.render-pipelines.universal) and make sure a URP asset is assigned in Project Settings ▸ Graphics and Project Settings ▸ Quality. In Built-in or HDRP projects, connect the included PBR textures to that pipeline’s Lit material instead.',
  },
  {
    q: 'The animations do not play',
    a: 'Use the prefab from the Prefabs folder, which already has the Animator Controller assigned. Walk plays while the Speed float parameter is above zero, and Attack plays when the Attack trigger is set. The demo scene shows both from on-screen buttons.',
  },
  {
    q: 'The clips do not work on my Humanoid character',
    a: 'The rig is Generic and the clips are authored for its own skeleton, so Humanoid retargeting is not supported.',
  },
  {
    q: 'The feet slide while walking',
    a: 'The walk clip is in place with no root motion. Move the character from your own script at a speed that matches the stride to keep the planted foot still.',
  },
  {
    q: 'Texture memory is too high for my target platform',
    a: 'The textures are 4096 × 4096. Lower Max Size in each texture’s import settings, for example to 2048 or 1024; the source files stay untouched.',
  },
];

const FAQ = [
  {
    q: 'Which Unity version do your assets support?',
    a: 'Each product page lists the exact Unity and render pipeline versions we tested with. Other versions may work, but we only state what we have tested.',
  },
  {
    q: 'Where do I buy ZTG Studio assets?',
    a: 'Our assets are sold through the Unity Asset Store. A product page links to its store listing once the listing is live; until then it is marked Coming Soon.',
  },
  {
    q: 'Can I use the assets in commercial games?',
    a: 'Assets bought on the Unity Asset Store are licensed under the Unity Asset Store End User License Agreement. Read that agreement for the exact terms.',
  },
  {
    q: 'Do you take requests for compatibility checks?',
    a: 'Yes. Tell us the asset, your Unity Editor version and your render pipeline, and we will tell you what we have and have not tested.',
  },
];

function contactBlock(site) {
  if (site.supportEmail) {
    return html`<p>Email <a href="mailto:${site.supportEmail}">${site.supportEmail}</a> with the details listed below.</p>`;
  }
  return html`<div class="notice" role="note">
    <p><strong>Our support email address is being set up.</strong> It will be published on this page as soon as it is active. Until then, please use the publisher contact option on the Unity Asset Store once our listing is live.</p>
  </div>`;
}

export default function support({ site }) {
  const body = html`
<section class="page-hero">
  <div class="container">
    ${breadcrumbs([{ href: '/', label: 'Home' }, { label: 'Support' }])}
    <h1>Customer Support</h1>
    <p class="lead">Help with ${site.name} assets: setup, troubleshooting, bug reports and compatibility questions.</p>
  </div>
</section>

<section class="section section-tight" aria-labelledby="contact-heading">
  <div class="container prose-grid">
    <div class="prose">
      <h2 id="contact-heading">Contact support</h2>
      ${contactBlock(site)}

      <h2 id="report-heading">Reporting a bug</h2>
      <p>Include the following details so we can reproduce the problem on our side:</p>
      <dl class="report-list">
        ${REPORT_FIELDS.map(([term, hint]) => html`<div><dt>${term}</dt><dd>${hint}</dd></div>`)}
      </dl>

      <h2 id="compat-heading">Compatibility inquiries</h2>
      <p>Before you buy, check the Compatibility section of the product page. If your setup is not listed, contact us with the asset name, your Unity Editor version, your render pipeline and its version, and your target platforms. We will tell you exactly what we have tested and what we have not.</p>
    </div>
    <aside class="info-card" aria-labelledby="checklist-heading">
      <h3 id="checklist-heading">Before you write</h3>
      <ul class="plain-list">
        <li>Update to the latest version of the asset.</li>
        <li>Try the included demo scene in a new, empty URP project.</li>
        <li>Read the package README in its Documentation folder.</li>
      </ul>
    </aside>
  </div>
</section>

<section class="section section-alt" aria-labelledby="troubleshooting-heading">
  <div class="container narrow">
    <h2 id="troubleshooting-heading">Troubleshooting</h2>
    <div class="accordion">
      ${TROUBLESHOOTING.map((item) => html`<details><summary>${item.q}</summary><p>${item.a}</p></details>`)}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="faq-heading">
  <div class="container narrow">
    <h2 id="faq-heading">Frequently asked questions</h2>
    <div class="accordion">
      ${FAQ.map((item) => html`<details><summary>${item.q}</summary><p>${item.a}</p></details>`)}
    </div>
  </div>
</section>`;

  return {
    file: 'support.html',
    page: {
      path: '/support.html',
      active: 'support',
      title: 'Customer Support',
      description: `Customer support for ${site.name} Unity assets: troubleshooting, FAQ, bug report checklist and compatibility inquiries.`,
      body,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [...TROUBLESHOOTING, ...FAQ].map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
        },
      ],
    },
  };
}
