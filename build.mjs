#!/usr/bin/env node
// Static site generator for credtechsolutions.com. No dependencies: `node build.mjs`.
//   node build.mjs                 -> dist/     production build (pretty URLs, shared CSS/JS, local three.js)
//   node build.mjs --preview       -> preview/  single-folder preview (flat .html files, inlined CSS/JS, CDN three.js)
//   node build.mjs --out <dir>     -> custom output folder
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCtx, routePath, outFile, esc } from './src/templates/lib.mjs';
import { layout } from './src/templates/components.mjs';
import * as P from './src/templates/pages.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const preview = args.includes('--preview');
const flat = preview || args.includes('--flat');
const OUT = path.resolve(ROOT, args.includes('--out') ? args[args.indexOf('--out') + 1] : (preview ? 'preview' : 'dist'));
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));

const data = {
  site: read('site.json'), media: read('media.json'), pages: read('pages.json'), services: read('services.json'),
  campaigns: read('campaigns.json'), clients: read('clients.json'), plans: read('plans.json'), posts: read('posts.json'),
  migration: read('migration-log.json'),
};
const { site, media } = data;
// Deploy-time overrides, so secrets and per-environment settings can live in the host's environment variables.
if (process.env.CT_FORM_ENDPOINT) site.forms.endpoint = process.env.CT_FORM_ENDPOINT;
if (process.env.CT_CAREERS_ENDPOINT) site.forms.careersEndpoint = process.env.CT_CAREERS_ENDPOINT;
if (process.env.CT_GA4) site.analytics.ga4 = process.env.CT_GA4;
if (process.env.CT_SITE_URL) site.siteUrl = process.env.CT_SITE_URL.replace(/\/$/, '');
const base = '/';

/* ---------- validation: catch broken references before anything is written ---------- */
const problems = [];
const need = (key, where) => { if (!media[key]) problems.push(`Missing media "${key}" (${where})`); };
data.services.items.forEach((s) => { need(s.thumb, s.id); if (s.page) { need(s.heroImage, s.id); s.sections.forEach((x) => x.image && need(x.image, s.id + '#' + x.id)); } });
data.campaigns.items.forEach((c) => need(c.poster, c.id));
data.campaigns.results.forEach((r) => need(r.image, 'result ' + r.id));
data.campaigns.caseStudies.forEach((c) => { need(c.hero, c.slug); c.gallery.forEach((g) => need(g.image, c.slug)); });
data.clients.logos.forEach((l) => need(l.image, l.id));
data.posts.items.filter((p) => p.status === 'published').forEach((p) => { need(p.image, p.slug); (p.bodyHtml.match(/\{\{media:([a-z0-9-]+)\}\}/g) || []).forEach((m) => need(m.slice(8, -2), p.slug)); });
const dash = /[\u2013\u2014]/;
const scanDashes = (obj, where) => { if (typeof obj === 'string') { if (dash.test(obj) && !/^https?:/.test(obj)) problems.push(`En/em dash in ${where}: "${obj.slice(0, 60)}"`); } else if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) if (k !== 'sourceUrl') scanDashes(v, where + '.' + k); };
['pages', 'services', 'campaigns', 'clients', 'plans', 'site'].forEach((k) => scanDashes(data[k], k));
data.posts.items.filter((p) => p.status === 'published').forEach((p) => scanDashes(p, 'posts.' + p.slug));
if (problems.length) { console.error('Content problems:\n - ' + problems.join('\n - ')); process.exit(1); }

/* ---------- assets ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const copyDir = (src, dst) => { fs.mkdirSync(dst, { recursive: true }); for (const e of fs.readdirSync(src, { withFileTypes: true })) { const s = path.join(src, e.name), d = path.join(dst, e.name); e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d); } };
copyDir(path.join(ROOT, 'assets/img'), path.join(OUT, 'assets/img'));
const cssSrc = fs.readFileSync(path.join(ROOT, 'src/styles.css'), 'utf8');
const minCss = cssSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}');
const siteJsSrc = fs.readFileSync(path.join(ROOT, 'src/site.js'), 'utf8');
const worldJsSrc = fs.readFileSync(path.join(ROOT, 'src/world.js'), 'utf8');
const threeSource = preview ? 'cdn' : site.three.source;
let css, siteJs;
if (flat) { css = { inline: minCss }; siteJs = { inline: siteJsSrc }; }
else {
  fs.mkdirSync(path.join(OUT, 'assets/css'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'assets/js'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'assets/css/styles.css'), minCss);
  fs.writeFileSync(path.join(OUT, 'assets/js/site.js'), siteJsSrc);
  fs.writeFileSync(path.join(OUT, 'assets/js/world.js'), worldJsSrc);
  css = { href: 'assets/css/styles.css' }; siteJs = { src: 'assets/js/site.js' };
}
if (threeSource === 'local' && !flat) copyDir(path.join(ROOT, 'vendor/three'), path.join(OUT, 'vendor/three'));

/* ---------- pages ---------- */
const built = [];
function emit(id, make) {
  const ctx = makeCtx({ site, media, flat, base, currentId: id });
  const page = make(ctx);
  if (preview && id === 'home') page.fullTitle = 'Credtech Solutions Website'; // artifact gallery name; production keeps the SEO title
  const fragment = preview && id === 'home';
  const html = layout(ctx, page, { css, siteJs, fragment, preview });
  const file = outFile(routePath(id), flat);
  fs.mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true });
  fs.writeFileSync(path.join(OUT, file), html);
  built.push({ id, file, path: routePath(id), lastmod: page.lastmod });
}

emit('home', (ctx) => {
  const wd = JSON.stringify(P.worldData(ctx, data)).replace(/</g, '\\u003c');
  const threeUrl = threeSource === 'local' ? { three: ctx.asset('vendor/three/three.module.min.js'), addons: ctx.asset('vendor/three/addons/') } : { three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js', addons: 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/' };
  const importmap = `<script type="importmap">${JSON.stringify({ imports: { three: threeUrl.three, 'three/addons/': threeUrl.addons } })}</script>`;
  const worldTail = `<script type="application/json" id="world-data">${wd}</script>\n${importmap}\n` +
    (flat ? `<script type="module">${worldJsSrc}</script>` : `<script type="module" src="${esc(ctx.asset('assets/js/world.js'))}"></script>`);
  return P.home(ctx, data, { worldTail });
});
emit('about', (ctx) => P.about(ctx, data));
emit('services', (ctx) => P.servicesIndex(ctx, data));
data.services.items.filter((s) => s.page).forEach((s) => emit(`service:${s.slug}`, (ctx) => P.serviceDetail(ctx, data, s)));
emit('campaigns', (ctx) => P.campaignsPage(ctx, data));
data.campaigns.caseStudies.forEach((c) => emit(`case:${c.slug}`, (ctx) => P.caseStudy(ctx, data, c)));
emit('clients', (ctx) => P.clientsPage(ctx, data));
emit('plans', (ctx) => P.plansPage(ctx, data));
emit('blog', (ctx) => P.blogIndex(ctx, data));
data.posts.items.filter((p) => p.status === 'published').forEach((p) => emit(`post:${p.slug}`, (ctx) => P.post(ctx, data, p)));
emit('contact', (ctx) => P.contact(ctx, data));
emit('schedule', (ctx) => P.schedule(ctx, data, { preview }));
emit('careers', (ctx) => P.careers(ctx, data));
emit('privacy', (ctx) => P.privacy(ctx, data));
emit('404', (ctx) => P.notFound(ctx, data));

/* ---------- SEO + hosting files (production) ---------- */
if (!preview) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = built.filter((b) => b.id !== '404').map((b) => `  <url><loc>${site.siteUrl}${b.path}</loc><lastmod>${today}</lastmod></url>`).join('\n');
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`);
  fs.writeFileSync(path.join(OUT, 'site.webmanifest'), JSON.stringify({ name: site.name, short_name: 'Credtech', start_url: '/', display: 'standalone', background_color: '#030716', theme_color: '#030716', icons: [{ src: '/' + media['brand-icon-512'].src, sizes: '512x512', type: 'image/png' }, { src: '/' + media['brand-apple-touch-icon'].src, sizes: '180x180', type: 'image/png' }] }, null, 1));
  // 301 redirects from every old WordPress URL whose address changed.
  const redirects = [];
  for (const e of data.migration.entries) {
    const from = new URL(e.sourceUrl).pathname;
    const to = e.newPath || '/blog/';
    if (from !== to) redirects.push([from, to]);
  }
  for (const extra of [['/wp-admin/*', '/'], ['/category/*', '/blog/'], ['/feed/*', '/blog/']]) redirects.push(extra);
  const uniq = [...new Map(redirects.map((r) => [r[0], r])).values()];
  fs.writeFileSync(path.join(OUT, '_redirects'), uniq.map(([a, b]) => `${a} ${b} 301`).join('\n') + '\n');
  // Security headers. Inline executable scripts (import map, GA snippet) are allowed by SHA-256 hash, not 'unsafe-inline'.
  const hashes = new Set();
  const htmlFiles = [];
  const findHtml = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) findHtml(p); else if (e.name.endsWith('.html')) htmlFiles.push(p); } };
  findHtml(OUT);
  for (const f of htmlFiles) for (const m of fs.readFileSync(f, 'utf8').matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\ssrc=/.test(m[1]) || /type="application\/(json|ld\+json)"/.test(m[1]) || !m[2].trim()) continue;
    hashes.add(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`);
  }
  const ga = !!site.analytics.ga4;
  const origin = (u) => { try { return new URL(u).origin; } catch { return ''; } };
  const formOrigins = [...new Set([site.forms.endpoint, site.forms.careersEndpoint].map(origin).filter(Boolean))];
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].join(' ')}${ga ? ' https://www.googletagmanager.com' : ''}`.trim(),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    `connect-src 'self'${ga ? ' https://*.google-analytics.com https://www.googletagmanager.com' : ''}${formOrigins.length ? ' ' + formOrigins.join(' ') : ''}`,
    'frame-src https://calendar.google.com',
    "object-src 'none'",
    "base-uri 'self'",
    `form-action 'self'${formOrigins.length ? ' ' + formOrigins.join(' ') : ''}`,
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
  const secHeaders = [
    ['Content-Security-Policy', csp],
    ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
    ['X-Content-Type-Options', 'nosniff'],
    ['X-Frame-Options', 'DENY'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'],
    ['Cross-Origin-Opener-Policy', 'same-origin'],
  ];
  fs.writeFileSync(path.join(OUT, 'vercel.json'), JSON.stringify({ cleanUrls: false, trailingSlash: true, headers: [{ source: '/(.*)', headers: secHeaders.map(([key, value]) => ({ key, value })) }], redirects: uniq.map(([a, b]) => ({ source: a.replace('/*', '/:path*'), destination: b, permanent: true })) }, null, 1));
  fs.writeFileSync(path.join(OUT, '.htaccess'), 'ErrorDocument 404 /404.html\nOptions -Indexes\nRewriteEngine On\nRewriteRule (^|/)\\.(?!well-known) - [F]\n' + uniq.map(([a, b]) => a.endsWith('/*') ? `RedirectMatch 301 ^${a.slice(0, -1)}.*$ ${b}` : `Redirect 301 ${a} ${b}`).join('\n') + '\n' +
    '<IfModule mod_expires.c>\nExpiresActive On\nExpiresByType image/webp "access plus 1 year"\nExpiresByType image/png "access plus 1 year"\nExpiresByType image/jpeg "access plus 1 year"\nExpiresByType text/css "access plus 1 week"\nExpiresByType application/javascript "access plus 1 week"\n</IfModule>\n' +
    '<IfModule mod_headers.c>\n' + secHeaders.map(([k, v]) => `Header always set ${k} "${v}"`).join('\n') + '\n</IfModule>\n');
}

/* ---------- manifest for publishing ---------- */
const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(path.relative(OUT, p)); } };
walk(OUT);
const bytes = files.reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`Built ${built.length} pages, ${files.length} files, ${(bytes / 1024 / 1024).toFixed(2)} MB -> ${path.relative(ROOT, OUT)}/ (${preview ? 'preview' : 'production'})`);
