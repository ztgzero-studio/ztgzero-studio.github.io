// Tagged template that escapes every interpolated value unless it is already SafeHtml.
// All page markup goes through this, so data from JSON can never inject HTML.

class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escape(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

function render(value) {
  if (value === null || value === undefined || value === false) return '';
  if (Array.isArray(value)) return value.map(render).join('');
  if (value instanceof SafeHtml) return value.value;
  return escape(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => {
    out += render(value) + strings[i + 1];
  });
  return new SafeHtml(out);
}

export function raw(value) {
  return new SafeHtml(String(value));
}

// JSON-LD lives inside <script>; escaping "<" keeps "</script>" in data from closing the tag.
export function jsonLd(data) {
  return raw(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`);
}
