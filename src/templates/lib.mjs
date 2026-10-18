// Shared helpers: escaping, routing, media lookup and icons.
import path from 'node:path';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Content fields may contain a tiny whitelist of inline tags (<b>, <i>, <em>, <strong>, <br>). Everything else is escaped.
export const rich = (s) => esc(s).replace(/&lt;(\/?)(b|i|em|strong)&gt;/g, '<$1$2>').replace(/&lt;br\s*\/?&gt;/g, '<br>');
export const join = (arr, fn, sep = '') => (arr || []).map(fn).join(sep);
export const when = (cond, html) => (cond ? (typeof html === 'function' ? html() : html) : '');

/** Route table: page id -> URL path (production, pretty URLs that end in /). */
export function routePath(id) {
  const [base] = id.split('#');
  const [kind, slug] = base.includes(':') ? base.split(':') : [base, null];
  switch (kind) {
    case 'home': return '/';
    case 'about': return '/about/';
    case 'services': return '/services/';
    case 'service': return `/services/${slug}/`;
    case 'campaigns': return '/campaigns/';
    case 'case': return `/campaigns/${slug}/`;
    case 'clients': return '/clients/';
    case 'plans': return '/plans/';
    case 'blog': return '/blog/';
    case 'post': return `/blog/${slug}/`;
    case 'contact': return '/contact/';
    case 'schedule': return '/schedule-a-meeting/';
    case 'careers': return '/careers/';
    case 'privacy': return '/privacy-policy/';
    case '404': return '/404.html';
    default: throw new Error('Unknown page id: ' + id);
  }
}

/** Output file for a page path. Pretty mode keeps folders; flat mode puts every page at the root. */
export function outFile(urlPath, flat) {
  if (urlPath.endsWith('.html')) return urlPath.slice(1);
  if (urlPath === '/') return 'index.html';
  const clean = urlPath.replace(/^\/|\/$/g, '');
  return flat ? clean.replace(/\//g, '-') + '.html' : clean + '/index.html';
}

/** Per-page context that knows how to link from the current file. */
export function makeCtx({ site, media, flat, base = '/', currentId }) {
  const currentFile = outFile(routePath(currentId), flat);
  const fromDir = path.posix.dirname(currentFile);
  const ctx = {
    site, media, flat, currentId,
    href(target) {
      if (!target) return '#';
      if (/^(https?:|mailto:|tel:)/.test(target)) return target;
      if (target === 'booking') return site.booking.url;
      if (target.startsWith('#')) return target;
      const [id, hash] = target.split('#');
      const p = routePath(id);
      let url;
      if (flat) {
        url = path.posix.relative(fromDir, outFile(p, true)) || outFile(p, true);
        if (id === currentId && hash) return '#' + hash;
      } else {
        url = base.replace(/\/$/, '') + p;
      }
      return url + (hash ? '#' + hash : '');
    },
    isExternal(target) { return target === 'booking' || /^https?:/.test(target || ''); },
    asset(p) { return flat ? (path.posix.relative(fromDir, p) || p) : base.replace(/\/$/, '') + '/' + p; },
    abs(p) { return site.siteUrl.replace(/\/$/, '') + (p.startsWith('/') ? p : '/' + p); },
    m(key) { const m = media[key]; if (!m) throw new Error('Missing media key: ' + key); return m; },
    img(key, alt = '', o = {}) {
      const m = ctx.m(key);
      const attrs = [`src="${esc(ctx.asset(m.src))}"`, `width="${m.width}"`, `height="${m.height}"`, `alt="${esc(alt)}"`];
      if (o.cls) attrs.push(`class="${o.cls}"`);
      if (o.eager) attrs.push('fetchpriority="high"'); else attrs.push('loading="lazy"');
      attrs.push('decoding="async"');
      if (o.style) attrs.push(`style="${o.style}"`);
      return `<img ${attrs.join(' ')}>`;
    },
    src(key) { return ctx.asset(ctx.m(key).src); },
    current(id) {
      const section = { service: 'services', case: 'campaigns', post: 'blog' }[currentId.split(':')[0]] || currentId;
      return id === section ? ' aria-current="page"' : '';
    },
  };
  return ctx;
}

export const icon = {
  phone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
  mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
  pin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  cal: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 21 11.2 21 14.5V21h-4v-5.8c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V21H9z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.32l4.37 5.78zm-1.08 16.2h1.7L7.4 4.73H5.58z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5H16l.5-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10.5H8v3h2.5V21z"/></svg>',
};
