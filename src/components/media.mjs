import { html } from '../lib/html.mjs';

// Every image is rendered from the media manifest, so width/height always match the real file.
export function variantsFor(media, key) {
  const variants = media[key];
  if (!variants || variants.length === 0) throw new Error(`Missing media "${key}" in data/media-manifest.json`);
  return variants;
}

export function largest(media, key) {
  const variants = variantsFor(media, key);
  return variants[variants.length - 1];
}

// `key` may be an array to merge variants of several renders of the same image (e.g. 1x and 2x cards).
export function picture(media, key, { alt, sizes = '100vw', eager = false, className = '' }) {
  const variants = [].concat(key).flatMap((k) => variantsFor(media, k));
  const fallback = variants[0];
  const srcset = variants.map((v) => `/${v.src} ${v.width}w`).join(', ');
  return html`<img class="${className}" src="/${fallback.src}" srcset="${srcset}" sizes="${sizes}"
    width="${fallback.width}" height="${fallback.height}" alt="${alt}"
    ${eager ? html`fetchpriority="high"` : html`loading="lazy"`} decoding="async">`;
}
