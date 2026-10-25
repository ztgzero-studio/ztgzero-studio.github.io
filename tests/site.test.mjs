// Checks the generated dist/ output. Run with `npm test` (builds first).

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { validateData } from '../scripts/validate-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
const site = readJson('data/site.json');
const { products } = readJson('data/products.json');
const media = readJson('data/media-manifest.json');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}
const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const pages = htmlFiles.map((file) => ({ file, rel: relative(DIST, file).split('\\').join('/'), html: readFileSync(file, 'utf8') }));

const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) || [];
const meta = (html, key) => tags(html, 'meta').find((t) => attr(t, 'name') === key || attr(t, 'property') === key);
const canonicalOf = (html) => attr(tags(html, 'link').find((t) => attr(t, 'rel') === 'canonical') || '', 'href');
const PUBLIC_NAME = products[0].name;

test('product data passes schema validation', () => {
  assert.deepEqual(validateData({ site, products, media }), []);
});

test('all required pages are generated', () => {
  for (const rel of ['index.html', 'assets.html', 'assets/vorthak-the-mountains-wrath/index.html', 'about.html', 'support.html', 'privacy.html', '404.html', 'sitemap.xml', 'robots.txt', '.nojekyll']) {
    assert.ok(existsSync(join(DIST, rel)), `missing dist/${rel}`);
  }
});

test('every page has a unique title, a description and exactly one h1', () => {
  const titles = new Set();
  for (const { rel, html } of pages) {
    const title = /<title>([^<]+)<\/title>/.exec(html)?.[1]?.trim();
    assert.ok(title, `${rel}: missing <title>`);
    assert.ok(!titles.has(title), `${rel}: duplicate title "${title}"`);
    titles.add(title);
    const description = attr(meta(html, 'description') || '', 'content');
    assert.ok(description && description.length >= 50 && description.length <= 160, `${rel}: description missing or length ${description?.length}`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${rel}: expected one <h1>`);
    assert.ok(meta(html, 'og:title') && meta(html, 'og:image'), `${rel}: missing Open Graph tags`);
  }
});

test('canonical URLs are absolute, unique, without duplicate slashes, and match the sitemap', () => {
  const canonicals = pages.filter((p) => p.rel !== '404.html').map((p) => canonicalOf(p.html));
  canonicals.forEach((c) => {
    assert.ok(c?.startsWith(site.url), `bad canonical ${c}`);
    assert.ok(!c.slice('https://'.length).includes('//'), `duplicate slash in ${c}`);
  });
  assert.equal(new Set(canonicals).size, canonicals.length, 'duplicate canonical URLs');
  const sitemap = [...readFileSync(join(DIST, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual([...sitemap].sort(), [...canonicals].sort());
  assert.match(readFileSync(join(DIST, 'robots.txt'), 'utf8'), new RegExp(`Sitemap: ${site.url}sitemap.xml`));
  assert.match(pages.find((p) => p.rel === '404.html').html, /<meta name="robots" content="noindex">/);
});

test('internal links, images and anchors all resolve', () => {
  const resolveTarget = (url, fromRel) => {
    const clean = url.split('#')[0].split('?')[0];
    if (clean === '') return join(DIST, fromRel);
    const path = clean.startsWith('/') ? clean.slice(1) : posix.join(posix.dirname(fromRel), clean);
    const full = join(DIST, path);
    return existsSync(full) && statSync(full).isDirectory() ? join(full, 'index.html') : full;
  };
  for (const { rel, html } of pages) {
    const refs = [];
    for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) refs.push(m[1]);
    for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) m[1].split(',').forEach((part) => refs.push(part.trim().split(/\s+/)[0]));
    for (const ref of refs) {
      if (/^(https?:|mailto:|data:)/.test(ref)) continue;
      const target = resolveTarget(ref, rel);
      assert.ok(existsSync(target), `${rel}: broken link ${ref}`);
      const hash = ref.split('#')[1];
      if (hash) {
        const targetHtml = readFileSync(target, 'utf8');
        assert.ok(targetHtml.includes(`id="${hash}"`), `${rel}: missing anchor #${hash}`);
      }
    }
  }
});

test('every image has alt text and explicit dimensions', () => {
  for (const { rel, html } of pages) {
    for (const img of tags(html, 'img')) {
      if (img.includes('data-lightbox-image')) continue; // filled in by the lightbox script
      assert.ok(attr(img, 'alt'), `${rel}: img without alt: ${img.slice(0, 80)}`);
      assert.ok(attr(img, 'width') && attr(img, 'height'), `${rel}: img without width/height: ${img.slice(0, 80)}`);
      const lazy = attr(img, 'loading') === 'lazy';
      const eager = img.includes('fetchpriority="high"');
      assert.ok(lazy || eager, `${rel}: img must be lazy-loaded or marked as the priority image`);
    }
  }
});

test('the internal product ID never appears in public output', () => {
  for (const file of files) {
    assert.ok(!/MON\d{3}/.test(relative(DIST, file)), `internal ID in public path ${file}`);
    if (/\.(html|xml|txt|js|css|svg)$/.test(file)) {
      assert.ok(!/MON\d{3}/.test(readFileSync(file, 'utf8')), `internal ID in ${relative(DIST, file)}`);
    }
  }
});

test('the public product name is used in title, h1, description and Open Graph', () => {
  const { html } = pages.find((p) => p.rel === 'assets/vorthak-the-mountains-wrath/index.html');
  const escaped = PUBLIC_NAME.replace(/'/g, '&#39;');
  assert.match(/<title>([^<]+)<\/title>/.exec(html)[1], new RegExp(`^${escaped}`));
  assert.match(/<h1>([^<]+)<\/h1>/.exec(html)[1], new RegExp(`^${escaped}$`));
  assert.ok(attr(meta(html, 'description'), 'content').startsWith(escaped));
  assert.ok(attr(meta(html, 'og:title'), 'content').startsWith(escaped));
});

test('no placeholder contact details or fabricated availability', () => {
  for (const { rel, html } of pages) {
    assert.ok(!/example\.(com|org)|@domain\.|your-?email|lorem ipsum|TODO|TBD/i.test(html), `${rel}: placeholder content`);
    assert.ok(!/InStock|PreOrder/.test(html), `${rel}: availability claimed in structured data`);
    for (const m of html.matchAll(/mailto:([^"]+)/g)) assert.equal(m[1], site.supportEmail, `${rel}: unverified email ${m[1]}`);
    for (const m of html.matchAll(/href="(https:\/\/(?:assetstore|marketplace)\.unity\.com[^"]*)"/g)) {
      assert.ok([site.unityPublisherUrl, ...products.map((p) => p.storeUrl)].includes(m[1]), `${rel}: unverified store link ${m[1]}`);
    }
  }
  if (!site.supportEmail) {
    assert.match(pages.find((p) => p.rel === 'support.html').html, /support email address is being set up/);
  }
});

test('coming-soon products show no purchase link', () => {
  for (const p of products.filter((x) => x.availability !== 'available')) {
    const { html } = pages.find((page) => page.rel === `assets/${p.slug}/index.html`);
    assert.ok(!html.includes('Get it on the Unity Asset Store'));
    assert.match(html, /Coming Soon/);
  }
});

test('structured data is valid JSON', () => {
  for (const { rel, html } of pages) {
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      assert.doesNotThrow(() => JSON.parse(m[1]), `${rel}: invalid JSON-LD`);
    }
  }
});

test('JavaScript files have valid syntax', () => {
  for (const file of files.filter((f) => f.endsWith('.js'))) {
    execFileSync(process.execPath, ['--check', file]);
  }
});

test('the hidden attribute always hides elements, even ones with a display rule', () => {
  const css = readFileSync(join(DIST, 'css', 'site.css'), 'utf8');
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
});
