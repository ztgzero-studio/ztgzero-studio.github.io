import { html } from '../lib/html.mjs';
import { breadcrumbs } from '../components/ui.mjs';

export const PRIVACY_UPDATED = '2026-10-25';

export default function privacy({ site }) {
  const body = html`
<section class="page-hero">
  <div class="container">
    ${breadcrumbs([{ href: '/', label: 'Home' }, { label: 'Privacy Policy' }])}
    <h1>Privacy Policy</h1>
    <p class="lead">Last updated <time datetime="${PRIVACY_UPDATED}">25 October 2026</time>.</p>
  </div>
</section>

<section class="section section-tight">
  <div class="container narrow prose">
    <h2>Summary</h2>
    <p>This website is a static information site. It has no user accounts, no forms, no comments, no shop and no newsletter. ${site.name} does not use analytics, advertising, tracking pixels or cookies on this site, and does not load fonts, scripts or media from third-party services.</p>

    <h2>Hosting by GitHub Pages</h2>
    <p>The site is hosted on GitHub Pages, a service of GitHub, Inc. When you visit any page, your browser sends a request to GitHub’s servers. As with most web hosts, GitHub may process technical data such as your IP address, the requested page, and browser information to deliver the site and keep it secure. ${site.name} does not receive or have access to these server logs. For details, see the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub General Privacy Statement</a>.</p>

    <h2>Data stored in your browser</h2>
    <p>The site does not set cookies and does not write to local storage. The catalog category filter only changes the page address (for example <code>?category=monsters</code>) and is not stored.</p>

    <h2>Email</h2>
    <p>If you email ${site.name} for support, we receive the information you choose to send, such as your email address, your message and any attachments. We use it only to answer your request and keep it only as long as needed for that support case.</p>

    <h2>Purchases</h2>
    <p>${site.name} assets are sold through the Unity Asset Store, not on this website. Purchases, payments and downloads are handled by Unity Technologies under its own terms and privacy policy.</p>

    <h2>External links</h2>
    <p>This site links to other websites, such as GitHub and the Unity Asset Store. Their own privacy policies apply once you follow those links.</p>

    <h2>Changes</h2>
    <p>If the way this site handles data changes, for example if a contact form or analytics were added, this page will be updated first and the date above changed.</p>

    <h2>Contact</h2>
    <p>For privacy questions, use the contact details on the <a href="/support.html">Support page</a>.</p>
  </div>
</section>`;

  return {
    file: 'privacy.html',
    page: {
      path: '/privacy.html',
      title: 'Privacy Policy',
      description: `How the ${site.name} website handles data: no analytics, no cookies, no tracking, hosted on GitHub Pages.`,
      body,
    },
  };
}
