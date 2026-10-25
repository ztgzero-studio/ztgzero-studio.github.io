// Static site generator: data/*.json + src/ templates -> dist/
// Usage: node scripts/build.mjs

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateData } from './validate-data.mjs';
import { absoluteUrl, layout } from '../src/templates/layout.mjs';
import home from '../src/pages/home.mjs';
import assets from '../src/pages/assets.mjs';
import product from '../src/pages/product.mjs';
import about from '../src/pages/about.mjs';
import support from '../src/pages/support.mjs';
import privacy from '../src/pages/privacy.mjs';
import notFound from '../src/pages/not-found.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

const readJson = async (rel) => JSON.parse(await readFile(join(ROOT, rel), 'utf8'));

export async function build() {
  const site = await readJson('data/site.json');
  const { products } = await readJson('data/products.json');
  const media = await readJson('data/media-manifest.json');
  const ctx = { site, products, media };

  const errors = validateData(ctx);
  if (errors.length) {
    throw new Error(`Invalid site data:\n  ${errors.join('\n  ')}`);
  }

  const pages = [home(ctx), assets(ctx), ...products.map((p) => product(ctx, p)), about(ctx), support(ctx), privacy(ctx), notFound(ctx)];

  await rm(DIST, { recursive: true, force: true });
  await cp(join(ROOT, 'public'), DIST, { recursive: true });

  for (const { file, page } of pages) {
    const target = join(DIST, file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, layout(site, page));
  }

  const today = new Date().toISOString().slice(0, 10);
  const urls = pages.filter(({ page }) => !page.noindex).map(({ page }) => absoluteUrl(site, page.path));
  await writeFile(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`)
      .join('\n')}\n</urlset>\n`,
  );
  await writeFile(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}sitemap.xml\n`);
  // Serve files as-is; without this GitHub Pages runs Jekyll over the output.
  await writeFile(join(DIST, '.nojekyll'), '');

  if (!site.supportEmail) {
    console.warn('WARNING: site.supportEmail is not set. The Support page shows a "being set up" notice (Publisher Profile blocker).');
  }
  console.log(`Built ${pages.length} pages and ${urls.length} sitemap URLs into dist/`);
  return { pages, urls };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  build().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
