// Schema checks for data/*.json. The build refuses to run on invalid content.

const AVAILABILITY = ['available', 'coming-soon', 'in-development'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const INTERNAL_ID = /\bMON\d{3}\b/;

export function validateData({ site, products, media }) {
  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);
  const str = (where, value) => (typeof value === 'string' && value.trim() !== '') || err(where, 'must be a non-empty string');
  const list = (where, value) => (Array.isArray(value) && value.length > 0) || err(where, 'must be a non-empty array');

  if (!/^https:\/\/[^/]+\/$/.test(site.url)) err('site.url', 'must be an https origin ending in a single "/"');
  for (const key of ['name', 'tagline', 'description', 'socialImage', 'socialImageAlt']) str(`site.${key}`, site[key]);
  if (site.supportEmail !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.supportEmail)) err('site.supportEmail', 'must be null or a valid address');
  if (site.supportEmail && /example\.(com|org)|@domain\.|your-?email|placeholder/i.test(site.supportEmail)) err('site.supportEmail', 'looks like a placeholder');
  if (site.unityPublisherUrl !== null && !/^https:\/\/(assetstore|marketplace)\.unity\.com\//.test(site.unityPublisherUrl)) err('site.unityPublisherUrl', 'must be null or a Unity Asset Store URL');
  const categoryIds = new Set(site.categories.map((c) => c.id));

  const slugs = new Set();
  products.forEach((p, i) => {
    const at = `products[${i}]`;
    for (const key of ['internalId', 'name', 'shortName', 'slug', 'mediaKey', 'summary', 'version', 'seoTitleSuffix', 'metaDescription']) str(`${at}.${key}`, p[key]);
    for (const key of ['description', 'features', 'specs', 'categories', 'highlights']) list(`${at}.${key}`, p[key]);
    if (p.metaDescription && (p.metaDescription.length > 160 || !p.metaDescription.startsWith(p.name))) err(`${at}.metaDescription`, 'must start with the public name and be at most 160 characters');
    if (!SLUG.test(p.slug)) err(`${at}.slug`, 'must be lowercase-kebab-case');
    if (slugs.has(p.slug)) err(`${at}.slug`, 'duplicate slug');
    slugs.add(p.slug);
    if (INTERNAL_ID.test(p.slug) || INTERNAL_ID.test(p.name)) err(at, 'internal ID must not appear in the public name or slug');
    if (!AVAILABILITY.includes(p.availability)) err(`${at}.availability`, `must be one of ${AVAILABILITY.join(', ')}`);
    if (p.availability === 'available' && !p.storeUrl) err(`${at}.storeUrl`, 'an available product needs a verified store URL');
    if (p.storeUrl !== null && !/^https:\/\/(assetstore|marketplace)\.unity\.com\//.test(p.storeUrl)) err(`${at}.storeUrl`, 'must be null or a Unity Asset Store URL');
    if (p.availability !== 'available' && !p.availabilityNote) err(`${at}.availabilityNote`, 'explain the availability state to customers');
    (p.categories || []).forEach((c) => categoryIds.has(c) || err(`${at}.categories`, `unknown category "${c}"`));

    const productMedia = media[p.mediaKey];
    if (!productMedia) {
      err(`${at}.mediaKey`, `no entry "${p.mediaKey}" in media-manifest.json`);
      return;
    }
    const keys = [...[].concat(p.media.card), p.media.hero, p.media.spotlight, ...p.media.gallery.map((g) => g.key)];
    keys.forEach((k) => productMedia[k] || err(`${at}.media`, `unknown media key "${k}"`));
    p.media.gallery.forEach((g, j) => {
      str(`${at}.media.gallery[${j}].alt`, g.alt);
      if (g.alt && !g.alt.includes(p.shortName)) err(`${at}.media.gallery[${j}].alt`, `alt text should name the product (${p.shortName})`);
    });
  });

  return errors;
}
