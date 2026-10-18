// Reusable page components. Every function takes the page context (ctx) plus content records.
import { esc, rich, join, when, icon, routePath } from './lib.mjs';

/* ---------- small pieces ---------- */
export const eyebrow = (t) => `<span class="eyebrow"><i></i>${esc(t)}</span>`;
export const titleGrad = (a, em, b = '') => `${esc(a)} <span class="grad">${esc(em)}</span>${b ? ' ' + esc(b) : ''}`;
export const chip = (t, win = false) => `<span class="chip${win ? ' win' : ''}">${esc(t)}</span>`;
export const tags = (list) => when(list && list.length, () => `<div class="tags">${join(list, (t) => chip(t))}</div>`);
export function btn(ctx, { label, to, kind = 'p', cls = '', arrow = false }) {
  const ext = ctx.isExternal(to);
  return `<a class="btn ${kind}${cls ? ' ' + cls : ''}${ext ? ' ext' : ''}" href="${esc(ctx.href(to))}"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(label)}${arrow ? ' &rarr;' : ''}</a>`;
}
export const checks = (items) => `<ul class="checks">${join(items, (b) => `<li><span>${rich(b)}</span></li>`)}</ul>`;
export function list(items, ordered = false) {
  const t = ordered ? 'ol' : 'ul';
  return `<${t}>${join(items, (b) => `<li><span>${rich(b)}</span></li>`)}</${t}>`;
}
export const paras = (arr) => join(arr, (p) => `<p>${rich(p)}</p>`);

/* ---------- header / nav ---------- */
export function header(ctx) {
  const { site } = ctx;
  const links = join(site.nav, (n) => `<a href="${esc(ctx.href(n.page))}"${ctx.current(n.page)}>${esc(n.label)}</a>`);
  return `<a class="skip" href="#main">Skip to content</a>
<header class="nav">
  <div class="nav-in">
    <a class="logo" href="${esc(ctx.href('home'))}" aria-label="${esc(site.name)} home">${ctx.img('brand-logo', site.name, { eager: true })}</a>
    <nav class="nav-links" aria-label="Main">${links}</nav>
    <div class="nav-right">
      ${btn(ctx, { label: site.booking.label, to: 'booking', kind: 'w' })}
      <button type="button" class="menu-btn" aria-expanded="false" aria-controls="menu" aria-label="Open menu">${icon.menu}</button>
    </div>
  </div>
</header>
<nav class="menu" id="menu" aria-label="Mobile">
  <a href="${esc(ctx.href('home'))}"${ctx.current('home')}>Home <span aria-hidden="true">&rarr;</span></a>
  ${join(site.nav, (n) => `<a href="${esc(ctx.href(n.page))}"${ctx.current(n.page)}>${esc(n.label)} <span aria-hidden="true">&rarr;</span></a>`)}
  ${btn(ctx, { label: site.booking.label, to: 'booking', kind: 'w' })}
</nav>`;
}

/* ---------- footer ---------- */
export function socialLinks(ctx) {
  return `<div class="socials">${join(ctx.site.social, (s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)} (opens in a new tab)">${icon[s.id] || ''}<span>${esc(s.label)}</span></a>`)}</div>`;
}
export function footer(ctx) {
  const { site } = ctx;
  const c = site.contact;
  return `<footer>
  <div class="wrap">
    <div class="brand">
      ${ctx.img('brand-logo', site.name)}
      <p style="margin-top:14px">${esc(site.shortDescription)}</p>
      ${socialLinks(ctx)}
    </div>
    <div class="cols">
      <div><h4>Capabilities</h4>${join(site.footer.capabilities, (l) => `<a href="${esc(ctx.href(l.page))}">${esc(l.label)}</a>`)}</div>
      <div><h4>Company</h4>${join(site.footer.company, (l) => `<a href="${esc(ctx.href(l.page))}">${esc(l.label)}</a>`)}</div>
      <div><h4>Office</h4>
        <address>
          <a href="${esc(c.mapUrl)}" target="_blank" rel="noopener">${esc(c.addressLine)}</a>
          <a href="tel:${esc(c.phoneE164)}">${esc(c.phoneDisplay)}</a>
          <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>
          <a class="ext" href="${esc(site.booking.url)}" target="_blank" rel="noopener">${esc(site.booking.label)}</a>
        </address>
      </div>
    </div>
    <div class="bottom"><span>&copy; ${new Date().getFullYear()} ${esc(site.legalName)}</span><span>${esc(site.tagline)}</span></div>
  </div>
</footer>`;
}

/* ---------- contact rows (with copy buttons, since tel/mailto do not open everywhere) ---------- */
export function contactRows(ctx) {
  const c = ctx.site.contact;
  return `<div class="crow"><span class="ic">${icon.phone}</span><div><small>Call us</small><a class="v" href="tel:${esc(c.phoneE164)}">${esc(c.phoneDisplay)}</a></div><button type="button" class="copy" data-copy="${esc(c.phoneDisplay)}" aria-label="Copy phone number">Copy</button></div>
<div class="crow"><span class="ic">${icon.mail}</span><div><small>Email us</small><a class="v" href="mailto:${esc(c.email)}">${esc(c.email)}</a></div><button type="button" class="copy" data-copy="${esc(c.email)}" aria-label="Copy email address">Copy</button></div>
<div class="crow"><span class="ic">${icon.pin}</span><div><small>Visit us</small><a class="v" href="${esc(c.mapUrl)}" target="_blank" rel="noopener">${esc(c.addressLine)}</a></div></div>
<div class="crow"><span class="ic">${icon.cal}</span><div><small>Book a call</small><a class="v ext" href="${esc(ctx.site.booking.url)}" target="_blank" rel="noopener">${esc(ctx.site.booking.label)}</a></div></div>`;
}

/* ---------- forms ---------- */
function field(f, prefix) {
  const id = `${prefix}-${f.name}`;
  const req = f.required ? ' required' : '';
  const star = f.required ? ' <span class="req" aria-hidden="true">*</span>' : '';
  const common = `id="${id}" name="${f.name}" data-label="${esc(f.label)}"${req} aria-describedby="${id}-err"`;
  let control;
  if (f.type === 'textarea') control = `<textarea ${common} placeholder="${esc(f.placeholder || '')}"></textarea>`;
  else if (f.type === 'select') control = `<select ${common}><option value="">${esc(f.placeholder || 'Choose one')}</option>${join(f.options, (o) => `<option>${esc(o)}</option>`)}</select>`;
  else control = `<input ${common} type="${f.type || 'text'}"${f.autocomplete ? ` autocomplete="${f.autocomplete}"` : ''} placeholder="${esc(f.placeholder || '')}">`;
  return `<div class="f${f.full ? ' full' : ''}"><label for="${id}">${esc(f.label)}${star}</label>${control}<span class="err" id="${id}-err" aria-live="polite"></span></div>`;
}
export function enquiryForm(ctx, { id = 'audit', kind = 'contact', eyebrowText, title, subject, submit = 'Send', fields }) {
  const configured = Boolean(kind === 'careers' ? (ctx.site.forms.careersEndpoint || ctx.site.forms.endpoint) : ctx.site.forms.endpoint);
  return `<form class="panel" id="${id}" data-form="${kind}" data-subject="${esc(subject)}" novalidate>
  ${when(eyebrowText, eyebrow(eyebrowText))}
  <h2 style="font-size:28px">${esc(title)}</h2>
  <div class="grid">${join(fields, (f) => field(f, id))}</div>
  <div class="hp" aria-hidden="true"><label for="${id}-gotcha">Leave this empty</label><input id="${id}-gotcha" class="hp-in" type="text" name="_gotcha" tabindex="-1" autocomplete="off"></div>
  <button class="btn p" type="submit">${esc(submit)} &rarr;</button>
  <div class="form-status" role="status" aria-live="polite"></div>
  ${when(!configured, `<p class="form-note">Fields marked * are required. Online sending is not connected yet, so this form will help you email us instead.</p>`)}
  ${when(configured, `<p class="form-note">Fields marked * are required.</p>`)}
</form>`;
}
export const contactFields = [
  { name: 'name', label: 'Name', required: true, autocomplete: 'name', placeholder: 'Your full name' },
  { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email', placeholder: 'you@company.com' },
  { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel', placeholder: '+91' },
  { name: 'company', label: 'Company', autocomplete: 'organization', placeholder: 'Brand, film or campaign' },
  { name: 'message', label: 'Message', type: 'textarea', full: true, placeholder: 'What should we audit? Social pages, reputation, a launch...' },
];

/* ---------- campaign / result / logo / plan components ---------- */
export function filmCard(ctx, c) {
  const to = c.caseStudy ? `case:${c.caseStudy}` : `campaigns#c-${c.id}`;
  return `<a class="film" data-c="${esc(c.id)}" href="${esc(ctx.href(to))}" aria-label="${esc(c.title)}${c.caseStudy ? ': read the case study' : ': campaign details'}">
  <div class="card">${ctx.img(c.poster, c.posterAlt)}<div class="shine"></div>
    <div class="meta">${chip(c.chip)}<h3>${esc(c.title)}</h3><p>${esc(c.short)}</p>${when(c.highlight, () => chip('▲ ' + c.highlight, true))}</div>
  </div></a>`;
}
export function resultCard(ctx, r, group = 'results') {
  return `<article class="rcard">
  <button type="button" class="shot" data-full="${esc(ctx.src(r.image))}" data-group="${group}" aria-label="Enlarge: ${esc(r.alt)}"><div class="bar" aria-hidden="true"><i></i><i></i><i></i></div>${ctx.img(r.image, r.alt)}</button>
  <div class="txt"><b>${esc(r.stat)}</b><span>${esc(r.text)}</span>${when(r.caseStudy, () => `<a href="${esc(ctx.href('case:' + r.caseStudy))}">Read the case study &rarr;</a>`)}</div>
</article>`;
}
export function logoTile(ctx, l, hidden = false) {
  return `<figure class="logo-tile"${hidden ? ' aria-hidden="true"' : ''}>${ctx.img(l.image, hidden ? '' : l.name)}</figure>`;
}
export function marquee(ctx, logos) {
  const half = Math.ceil(logos.length / 2);
  const rowA = logos.slice(0, half), rowB = logos.slice(half);
  const row = (list, rev) => `<div class="marquee"><div class="track${rev ? ' rev' : ''}">${join(list, (l) => logoTile(ctx, l))}${join(list, (l) => logoTile(ctx, l, true))}</div></div>`;
  return row(rowA, false) + row(rowB, true);
}
export function planCard(ctx, p, { limit = 0 } = {}) {
  const feats = limit ? p.features.slice(0, limit) : p.features;
  const rest = limit ? p.features.length - feats.length : 0;
  const cta = p.cta.page === 'booking' ? { to: 'booking' } : { to: p.cta.page };
  return `<div class="panel plan${p.featured ? ' hot' : ''}" id="plan-${esc(p.id)}">
  <h3 class="nm">${esc(p.name)}</h3><div class="ds">${esc(p.description)}</div>
  <div class="pr"><b>${esc(p.price)}</b><span>${esc(p.period)}</span></div>
  ${btn(ctx, { label: p.cta.label, to: cta.to, kind: p.featured ? 'p' : 'g' })}
  <ul>${join(feats, (f) => `<li>${esc(f)}</li>`)}${when(rest > 0, () => `<li class="rest"><a href="${esc(ctx.href('plans#plan-' + p.id))}">+ ${rest} more in the full plan</a></li>`)}</ul>
</div>`;
}

/* ---------- inner page pieces ---------- */
export function crumbs(ctx, trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${esc(ctx.href('home'))}">Home</a></li>${join(trail, (t, i) => i === trail.length - 1 ? `<li><span aria-current="page">${esc(t.label)}</span></li>` : `<li><a href="${esc(ctx.href(t.id))}">${esc(t.label)}</a></li>`)}</ol></nav>`;
}
export function pageHero(ctx, { trail, eyebrowText, title, lead, leadParas, image, imageAlt, actions = '', tagList, solo = false, visual = '' }) {
  return `<section class="wrap"><div class="phero${(solo || !image) && !visual ? ' solo' : ''}">
  <div>${crumbs(ctx, trail)}${eyebrow(eyebrowText)}<h1>${rich(title)}</h1>
    ${when(lead, () => `<p class="lead">${rich(lead)}</p>`)}
    ${when(leadParas, () => join(leadParas, (p) => `<p class="lead" style="margin-top:14px">${rich(p)}</p>`))}
    ${when(tagList, () => tags(tagList).replace('class="tags"', 'class="tags" style="margin-top:20px"'))}
    ${when(actions, () => `<div class="ctas">${actions}</div>`)}
  </div>
  ${visual || when(image, () => `<div class="frame"><div class="bar" aria-hidden="true"><i></i><i></i><i></i></div>${ctx.img(image, imageAlt, { eager: true })}</div>`)}
</div></section>`;
}
export function ctaBand(ctx, { eyebrowText = 'Work with us', title = 'Ready to be the next thing people talk about?', text = 'Tell us about your brand and goals, or book a meeting with our team.' } = {}) {
  return `<section class="wrap block"><div class="panel cta-band mk-band">
  <div class="mk-copy">${eyebrow(eyebrowText)}<h2>${esc(title)}</h2><p class="lead" style="margin-top:10px">${esc(text)}</p></div>
  ${marketer(ctx)}
</div></section>`;
}

/* The CTA band's marketer: an illustrated promoter holding up one sign in each hand. Each sign is the real link. */
function marketer(ctx) {
  const booking = ctx.href('booking');
  // Arm from the shoulder, out to the elbow, up to the hand that grips the sign's pole.
  const arm = (side) => {
    const m = side === 'l' ? 1 : -1, x = (v) => 280 - m * (280 - v);
    return `<svg class="mk-armsvg" viewBox="0 0 560 400" aria-hidden="true" focusable="false">
      <path d="M${x(134)} 132 V188" stroke="#8a6a3c" stroke-width="7" stroke-linecap="round"/>
      <path d="M${x(238)} 180 L${x(188)} 202 L${x(140)} 172" fill="none" stroke="url(#mk-sleeve)" stroke-width="23" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${x(150)} 179 L${x(143)} 174" stroke="#eef4ff" stroke-width="22" stroke-linecap="butt"/>
      <circle cx="${x(134)}" cy="166" r="11.5" fill="#c98b62"/><path d="M${x(134) - 9} 160 h18 M${x(134) - 9} 166 h18 M${x(134) - 8} 172 h16" stroke="#a96d4b" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`;
  };
  const sign = (side, inner) => `<div class="mk-layer ${side}"><div class="mk-wave">${arm(side)}<div class="mk-hold">${inner}</div></div></div>`;
  return `<div class="mk" role="group" aria-label="Choose how to start">
    <div class="mk-stage">
      <svg class="mk-sparks" viewBox="0 0 560 400" aria-hidden="true" focusable="false"><path d="M30 26l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M528 20l2.4 6.4 6.4 2.4-6.4 2.4-2.4 6.4-2.4-6.4-6.4-2.4 6.4-2.4z"/><path d="M280 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M548 250l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M14 236l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>
      <span class="mk-shadow" aria-hidden="true"></span>
      <div class="mk-bob">
        <svg class="mk-body" viewBox="0 0 560 400" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="mk-blazer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f74ff"/><stop offset="1" stop-color="#1238b8"/></linearGradient>
            <linearGradient id="mk-sleeve" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a6dff"/><stop offset="1" stop-color="#1a45c9"/></linearGradient>
          </defs>
          <path d="M253 284 L249 374 H271 L277 292 Z M283 292 L289 374 H311 L307 284 Z" fill="#1b2350"/>
          <path d="M238 372 h33 a6 6 0 0 1 6 6 v6 h-47 v-3 a9 9 0 0 1 8-9z M289 372 h33 a9 9 0 0 1 8 9 v3 h-47 v-6 a6 6 0 0 1 6-6z" fill="#f2f5ff"/>
          <path d="M230 385 h47 M283 385 h47" stroke="#2f7bff" stroke-width="3.5" stroke-linecap="round"/><path d="M247 377 h10 M298 377 h10" stroke="#9fb4e8" stroke-width="2" stroke-linecap="round"/>
          <rect x="268" y="138" width="24" height="30" rx="9" fill="#b67650"/>
          <path d="M234 180 Q238 166 256 162 L304 162 Q322 166 326 180 L335 294 Q280 303 225 294 Z" fill="url(#mk-blazer)"/>
          <path d="M262 162 L280 214 L298 162 Z" fill="#eef4ff"/>
          <path d="M262 162 L280 214 L268 224 L253 168 Z M298 162 L280 214 L292 224 L307 168 Z" fill="#0f2f9c"/>
          <path d="M243 196 l12 -2 -2 7 z" fill="#5ad1ff"/>
          <path d="M266 166 L276 236 M294 166 L284 236" stroke="#ffc531" stroke-width="3" stroke-linecap="round"/>
          <rect x="265" y="233" width="30" height="36" rx="5" fill="#fff"/>
          <image href="${esc(ctx.src('brand-icon-512'))}" x="270" y="238" width="20" height="20"/>
          <rect x="270" y="261" width="20" height="3" rx="1.5" fill="#0139B7"/>
          <g class="mk-head">
            <ellipse cx="246" cy="116" rx="6" ry="9" fill="#bf7f57"/><ellipse cx="314" cy="116" rx="6" ry="9" fill="#bf7f57"/>
            <ellipse cx="280" cy="112" rx="34" ry="38" fill="#c98b62"/>
            <path d="M246 106 Q242 70 280 67 Q320 68 315 104 Q306 88 290 89 Q268 85 256 94 Q250 98 246 106 Z" fill="#1c1830"/>
            <path d="M260 76 Q282 54 306 70 Q292 66 276 74 Z" fill="#2a2548"/>
            <path d="M259 100 q8 -5 16 -1 M285 99 q8 -4 16 1" stroke="#1c1830" stroke-width="3" fill="none" stroke-linecap="round"/>
            <g class="mk-blink"><g class="mk-look"><ellipse cx="267" cy="112" rx="3.8" ry="4.6" fill="#1c1830"/><ellipse cx="293" cy="112" rx="3.8" ry="4.6" fill="#1c1830"/><circle cx="268.4" cy="110.4" r="1.3" fill="#fff"/><circle cx="294.4" cy="110.4" r="1.3" fill="#fff"/></g></g>
            <path d="M280 114 q-3 8 2 10" stroke="#a5663f" stroke-width="2" fill="none" stroke-linecap="round"/>
            <circle cx="258" cy="125" r="5" fill="#ff7a7a" opacity=".22"/><circle cx="302" cy="125" r="5" fill="#ff7a7a" opacity=".22"/>
            <path class="mk-smile" d="M266 128 Q280 146 294 128 Z" fill="#6b1f24"/><path d="M269 129 Q280 134 291 129 L290.4 131 Q280 136 269.6 131 Z" fill="#fff"/>
          </g>
        </svg>
        ${sign('l', `<a class="mk-sign p" href="${esc(ctx.href('contact#audit'))}"><span>Get your free audit &rarr;</span></a>`)}
        ${sign('r', `<a class="mk-sign g" href="${esc(booking)}" target="_blank" rel="noopener"><span>${esc(ctx.site.booking.label)} <i aria-hidden="true">&#8599;</i></span><span class="sr-only"> (opens in a new tab)</span></a>`)}
      </div>
    </div>
  </div>`;
}
export function statGrid(stats) {
  return `<div class="stats">${join(stats, (s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`)}</div>`;
}
export function kvTable(rows, caption) {
  return `<div class="table-wrap"><table class="kv">${when(caption, `<caption class="sr-only">${esc(caption)}</caption>`)}<tbody>${join(rows, (r) => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`)}</tbody></table></div>`;
}
export function gallery(ctx, items, group) {
  return `<div class="gallery m-slide">${join(items, (g) => `<button type="button" data-full="${esc(ctx.src(g.image))}" data-group="${group}" aria-label="Enlarge: ${esc(g.alt)}">${ctx.img(g.image, g.alt)}</button>`)}</div>`;
}
export function serviceSection(ctx, s, i) {
  const text = `<div class="prose">
    <h2 id="${esc(s.id)}" style="margin-top:0">${esc(s.heading)}</h2>
    ${paras(s.paras)}
    ${when(s.bullets, () => list(s.bullets, s.ordered))}
    ${tags(s.tags)}
    ${when(s.link, () => `<a class="more" href="${esc(ctx.href(s.link.page))}">${esc(s.link.label)} &rarr;</a>`)}
  </div>`;
  if (!s.image) return `<div class="panel">${text}</div>`;
  return `<div class="panel split${i % 2 ? ' flip' : ''}">${text}<div class="media${s.imageTall ? ' tall' : ''}">${ctx.img(s.image, s.imageAlt)}</div></div>`;
}
export function serviceCard(ctx, s, services) {
  const to = s.page ? `service:${s.slug}` : s.linkTo;
  return `<a class="card" href="${esc(ctx.href(to))}">${ctx.img(s.thumb, '')}<div class="body"><h3>${esc(s.title)}</h3><p>${esc(s.detail || s.short)}</p><span class="go">${s.page ? 'Explore the service' : 'Learn more'} &rarr;</span></div></a>`;
}
export function postCard(ctx, p) {
  return `<a class="card" href="${esc(ctx.href('post:' + p.slug))}">${ctx.img(p.image, p.imageAlt)}<div class="body"><small><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time></small><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><span class="go">Read the article &rarr;</span></div></a>`;
}
export function fmtDate(d) {
  const [y, m, day] = d.split('-').map(Number);
  return `${day} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${y}`;
}

/* ---------- document ---------- */
export function layout(ctx, page, { css, siteJs, fragment, preview, assets }) {
  const { site } = ctx;
  const title = page.fullTitle || `${page.title} | ${site.name}`;
  const canonical = ctx.abs(routePath(page.id));
  const ogImg = ctx.abs(ctx.m(page.ogImage || 'brand-og-default').src);
  const org = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': site.siteUrl + '/#org',
    name: site.name, legalName: site.legalName, url: site.siteUrl + '/', logo: ctx.abs(ctx.m('brand-icon-512').src), image: ctx.abs(ctx.m('photos-office-building').src),
    description: site.shortDescription, telephone: site.contact.phoneE164, email: site.contact.email,
    address: { '@type': 'PostalAddress', streetAddress: site.contact.addressLine, addressLocality: 'Noida', addressRegion: site.contact.addressRegion, postalCode: site.contact.postalCode, addressCountry: site.contact.addressCountry },
    areaServed: 'IN', sameAs: site.social.map((s) => s.url),
  };
  const ld = [org, ...(page.jsonld || [])];
  if (page.trail) ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: site.siteUrl + '/' }, ...page.trail.map((t, i) => ({ '@type': 'ListItem', position: i + 2, name: t.label, item: ctx.abs(routePath(t.id)) }))] });
  const ga = site.analytics.ga4 && !preview ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.analytics.ga4)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(site.analytics.ga4)}');</script>` : '';
  const cfg = { forms: site.forms, contact: { phoneDisplay: site.contact.phoneDisplay, email: site.contact.email } };
  const head = `<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="claude:viewport-fit-sides" content="cover">
${preview ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
${when(!preview && site.seo && site.seo.googleSiteVerification, () => `<meta name="google-site-verification" content="${esc(site.seo.googleSiteVerification)}">`)}
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${esc(site.locale)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImg)}">
<meta property="og:image:width" content="${ctx.m(page.ogImage || 'brand-og-default').width}">
<meta property="og:image:height" content="${ctx.m(page.ogImage || 'brand-og-default').height}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@Credtech_Noida">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${esc(ogImg)}">
<meta name="theme-color" content="#030716">
<link rel="icon" type="image/png" sizes="32x32" href="${esc(ctx.src('brand-favicon-32'))}">
<link rel="apple-touch-icon" href="${esc(ctx.src('brand-apple-touch-icon'))}">
${when(!preview, `<link rel="manifest" href="${esc(ctx.asset('site.webmanifest'))}">`)}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
${css.inline ? `<style>${css.inline}</style>` : `<link rel="stylesheet" href="${esc(ctx.asset(css.href))}">`}
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld).replace(/</g, '\\u003c')}</script>
${ga}`;
  const bodyInner = `${page.home ? '' : '<div class="backdrop" aria-hidden="true"><div class="stars"></div><div class="orb"></div><div class="floor"></div></div>'}
${header(ctx)}
${page.body}
${footer(ctx)}
<script type="application/json" id="site-config">${JSON.stringify(cfg).replace(/</g, '\\u003c')}</script>
${siteJs.inline ? `<script>${siteJs.inline}</script>` : `<script src="${esc(ctx.asset(siteJs.src))}" defer></script>`}
${page.tail || ''}`;
  if (fragment) {
    // Artifact entry page: the host adds doctype, <html>, <head> and <body>.
    return `${head}\n${bodyInner}\n`;
  }
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${head}
</head>
<body${page.home ? ' class="home"' : ''}>
${bodyInner}
</body>
</html>
`;
}

/* ---------- services Ferris wheel ----------
   Gondola cards hang on a slowly turning 3D wheel. Every few seconds the wheel turns one slot, the next
   service reaches the boarding point at the bottom and the previous one rises up the right-hand side.
   Initial positions are written inline so the wheel renders without JavaScript. */
export function ferrisWheel(ctx, services) {
  const N = services.length, slot = 360 / N, R = 330;
  const spokes = Array.from({ length: N }, (_, i) => `<i style="transform:rotate(${(i * slot).toFixed(3)}deg)"></i>`).join('');
  const struts = Array.from({ length: N }, (_, i) => `<b style="transform:rotate(${(i * slot).toFixed(3)}deg) translateY(${R}px) rotateY(90deg)"></b>`).join('');
  const cabs = services.map((s, i) => {
    const a = i * slot;
    const to = s.page ? `service:${s.slug}` : s.linkTo;
    return `<li class="fw-cab${i === 0 ? ' on' : ''}" data-i="${i}" style="transform:rotate(${a.toFixed(3)}deg) translateY(${R}px)">
      <div class="fw-up" style="transform:rotate(${(-a).toFixed(3)}deg)"><div class="fw-swing">
        <a class="fw-card" href="${esc(ctx.href(to))}" data-title="${esc(s.title)}" data-text="${esc(s.detail || s.short)}" data-cta="${s.page ? 'Explore the service' : 'Learn more'}">${ctx.img(s.thumb, '')}<span>${esc(s.title)}</span></a>
      </div></div>
    </li>`;
  }).join('');
  const first = services[0];
  return `<section class="wrap block fw" aria-labelledby="fw-heading">
  <div class="panel fw-info">
    ${eyebrow('Now boarding')}
    <p class="fw-count"><b id="fw-num">01</b> / ${String(N).padStart(2, '0')}</p>
    <h2 id="fw-heading"><span id="fw-title">${esc(first.title)}</span></h2>
    <p class="lead" id="fw-text">${esc(first.detail || first.short)}</p>
    <a class="btn p" id="fw-link" href="${esc(ctx.href(first.page ? `service:${first.slug}` : first.linkTo))}">${first.page ? 'Explore the service' : 'Learn more'} &rarr;</a>
    <div class="fw-ctl">
      <button type="button" id="fw-prev" aria-label="Previous service">&larr;</button>
      <button type="button" id="fw-play" aria-pressed="false" aria-label="Pause the wheel">Pause</button>
      <button type="button" id="fw-next" aria-label="Next service">&rarr;</button>
    </div>
    <p class="form-note">Pick a cabin on the wheel to open that service.</p>
  </div>
  <div class="fw-stage" id="fw-stage">
    <div class="fw-scale">
      <div class="fw-ground" aria-hidden="true"></div>
      <div class="fw-wheel">
        <div class="fw-legs" aria-hidden="true"><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i></div>
        <div class="fw-rotor" id="fw-rotor">
          <div class="fw-rim back" aria-hidden="true"></div>
          <div class="fw-spokes back" aria-hidden="true">${spokes}</div>
          <div class="fw-struts" aria-hidden="true">${struts}</div>
          <div class="fw-rim front" aria-hidden="true"><div class="fw-bulbs"></div></div>
          <div class="fw-rim inner" aria-hidden="true"></div>
          <div class="fw-spokes front" aria-hidden="true">${spokes}</div>
          <div class="fw-hub" aria-hidden="true"></div>
          <ul class="fw-cabs" aria-label="Our services">${cabs}</ul>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* ---------- specialist services train ----------
   A locomotive pulls one coach per service along a track and loops slowly from right to left.
   The second copy only exists to make the loop seamless, so it is hidden from assistive tech. */
export function serviceTrain(ctx, more) {
  const wheels = '<span class="bogie"><i class="wheel"></i><i class="wheel"></i></span><span class="bogie"><i class="wheel"></i><i class="wheel"></i></span>';
  const engine = `<div class="loco" aria-hidden="true">
    <div class="loco-body"><span class="loco-glass"></span><span class="loco-light"></span>${ctx.img('brand-icon-512', '', { cls: 'loco-mark' })}<span class="loco-stripe"></span></div>
    <div class="bogies">${wheels}</div>
  </div>`;
  const coach = (m, hidden) => `<span class="coupler" aria-hidden="true"></span><article class="coach"${hidden ? ' aria-hidden="true"' : ''}>
    <div class="coach-body"><div class="coach-windows" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <h3>${esc(m.title)}</h3><p>${esc(m.text)}</p><span class="coach-stripe" aria-hidden="true"></span></div>
    <div class="bogies" aria-hidden="true">${wheels}</div>
  </article>`;
  const train = (hidden) => `<div class="train"${hidden ? ' aria-hidden="true"' : ''}>${engine}${join(more.items, (m) => coach(m, hidden))}</div>`;
  return `<section class="block rail-sec" aria-labelledby="train-heading">
  <div class="wrap rail-head">
    <div>${eyebrow('Specialist services')}<h2 id="train-heading">${esc(more.title)}</h2></div>
    <button type="button" class="train-btn" id="train-play" aria-pressed="false" aria-label="Pause the train">Pause</button>
  </div>
  <div class="rail-track" id="train-track" tabindex="0" role="region" aria-label="Specialist services, one per coach. Scroll or pause to read.">
    <div class="train-run">${train(false)}${train(true)}</div>
    <div class="rails" aria-hidden="true"></div>
  </div>
</section>`;
}
