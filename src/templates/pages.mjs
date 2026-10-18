// Page templates. Each returns a page object that layout() turns into HTML.
import { esc, rich, join, when, routePath } from './lib.mjs';
import * as C from './components.mjs';
import * as F from './fun.mjs';

/* =================== HOME (3D) =================== */
export function home(ctx, data, { worldTail }) {
  const { pages, services, campaigns, clients, plans } = data;
  const H = pages.home;
  const homeServices = services.items.filter((s) => s.home).sort((a, b) => a.homeOrder - b.homeOrder);
  const strip = campaigns.items.filter((c) => c.published);
  const rail = [['top', 'Start'], ['about', 'About'], ['services', 'Services'], ['campaigns', 'Campaigns'], ['results', 'Results'], ['clients', 'Clients'], ['plans', 'Plans'], ['contact', 'Contact']];
  const svcHref = (s) => ctx.href(s.page ? `service:${s.slug}` : s.linkTo);
  const body = `<canvas id="world" aria-hidden="true"></canvas>
<div class="fallback" aria-hidden="true" style="--fallback-img:url('${esc(ctx.src('photos-hero-analyse'))}')"></div>
<div class="progress" id="progress"></div>
<nav class="rail" aria-label="Homepage sections">${join(rail, ([id, l], i) => `<a href="#${id}" data-i="${i}"><span>${l}</span><i></i></a>`)}</nav>
<div class="hud" id="hud" aria-hidden="true"><span class="dot"></span><span>Tap the floating icons</span><span>Likes <b id="likes">0</b></span></div>
<main id="main">
  <section class="sec hero" id="top" data-stop>
    <div class="wrap"><div class="hero-copy">
      ${C.eyebrow(H.hero.eyebrow)}
      <h1>${esc(H.hero.titleA)} <em class="grad">${esc(H.hero.titleEm)}</em> ${esc(H.hero.titleB)}</h1>
      <p class="lead">${esc(H.hero.lead)}</p>
      <div class="ctas">${C.btn(ctx, { label: 'Get your free audit', to: '#contact', arrow: true })}${C.btn(ctx, { label: ctx.site.booking.label, to: 'booking', kind: 'g' })}</div>
      <div class="hstats">${join(H.hero.stats, (s) => `<div class="hstat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`)}</div>
    </div></div>
    <div class="cue" aria-hidden="true"><i></i>Scroll to fly through</div>
  </section>

  <section class="sec about" id="about" data-stop>
    <div class="wrap"><div class="panel">
      ${C.eyebrow(H.about.eyebrow)}
      <h2>${C.titleGrad(H.about.titleA, H.about.titleEm)}</h2>
      ${join(H.about.paras, (p, i) => `<p class="lead"${i ? ' style="margin-top:12px"' : ''}>${esc(p)}</p>`)}
      <div class="collage">
        <figure class="tall">${ctx.img('photos-office-tower', 'UrbTech Tower in Sector 132, Noida, home of the Credtech office')}<figcaption>UrbTech Tower, Noida</figcaption></figure>
        <figure>${ctx.img('photos-hero-analyse', 'Keyboard lit in blue on a dark desk')}<figcaption>Analyse &amp; amplify</figcaption></figure>
        <figure>${ctx.img('photos-office-wide', 'Credtech office building in Sector 132, Noida')}<figcaption>Our office</figcaption></figure>
      </div>
      ${C.tags(H.about.tags)}
      <a class="more" href="${esc(ctx.href('about'))}">More about Credtech &rarr;</a>
    </div></div>
  </section>

  <section class="sec services" id="services" data-stop>
    <div class="wrap"><div class="panel svc-panel">
      ${C.eyebrow(H.services.eyebrow)}
      <h2>${C.titleGrad(H.services.titleA, H.services.titleEm)}</h2>
      <div class="svc-list m-slide m-in">${join(homeServices, (s) => `<a class="svc" href="${esc(svcHref(s))}">${ctx.img(s.thumb, '')}<div><h3>${esc(s.title)}</h3><p>${esc(s.short)}</p></div><span class="arr" aria-hidden="true">&rarr;</span></a>`)}</div>
      <a class="more" href="${esc(ctx.href('services'))}">All services &rarr;</a>
    </div></div>
  </section>

  <section class="sec campaigns" id="campaigns" data-stop>
    <div class="wrap camp-head">
      <div class="panel">
        ${C.eyebrow(H.campaigns.eyebrow)}
        <h2>${C.titleGrad(H.campaigns.titleA, H.campaigns.titleEm)}</h2>
        <p class="lead" style="margin-top:12px">${esc(H.campaigns.hint)} <a class="more" style="margin-top:0" href="${esc(ctx.href('campaigns'))}">All campaigns &rarr;</a></p>
      </div>
      <div class="strip-ctl"><button type="button" id="prev" aria-label="Previous posters" aria-controls="strip">&larr;</button><button type="button" id="next" aria-label="Next posters" aria-controls="strip">&rarr;</button></div>
    </div>
    <div class="wrap"><div class="strip" id="strip" tabindex="0" role="region" aria-label="Campaign posters, scroll sideways">${join(strip, (c) => C.filmCard(ctx, c))}</div></div>
  </section>

  <section class="sec results" id="results" data-stop>
    <div class="wrap">
      <div class="panel res-head">${C.eyebrow(H.results.eyebrow)}<h2>${C.titleGrad(H.results.titleA, H.results.titleEm)}</h2></div>
      <div class="res-grid m-slide">${join(campaigns.results, (r) => C.resultCard(ctx, r))}</div>
    </div>
  </section>

  <section class="sec clients" id="clients" data-stop>
    <div class="wrap cl-head"><div class="panel">${C.eyebrow(H.clients.eyebrow)}<h2>${C.titleGrad(H.clients.titleA, H.clients.titleEm)}</h2><a class="more" href="${esc(ctx.href('clients'))}">Read client stories &rarr;</a></div></div>
    <div>${C.marquee(ctx, clients.logos)}</div>
  </section>

  <section class="sec plans" id="plans" data-stop>
    <div class="wrap">
      <div class="plans-head"><div class="panel">${C.eyebrow(H.plans.eyebrow)}<h2>${C.titleGrad(H.plans.titleA, H.plans.titleEm)}</h2></div></div>
      <div class="plan-grid m-slide">${join(plans.items, (p) => C.planCard(ctx, p, { limit: p.homeFeatures }))}</div>
      <p class="consult">${esc(H.plans.consult)} <a class="ext" href="${esc(ctx.site.booking.url)}" target="_blank" rel="noopener">${esc(H.plans.consultLink)} &rarr;</a></p>
    </div>
  </section>

  <section class="sec contact" id="contact" data-stop>
    <div class="wrap">
      <div class="panel">
        ${C.eyebrow(H.contact.eyebrow)}
        <h2>${C.titleGrad(H.contact.titleA, H.contact.titleEm)}</h2>
        <p class="lead" style="margin-top:14px">${esc(H.contact.lead)}</p>
        ${C.contactRows(ctx)}
        ${C.socialLinks(ctx)}
        <div class="office">${ctx.img('photos-office-wide', 'Credtech office at UrbTech Tower')}<span>Sector 132, Noida</span></div>
      </div>
      ${C.enquiryForm(ctx, { id: 'audit', kind: 'contact', eyebrowText: H.contact.formEyebrow, title: H.contact.formTitle, subject: 'Free audit request', fields: C.contactFields })}
    </div>
  </section>
</main>`;
  return {
    id: 'home', home: true, fullTitle: H.seo.title, description: H.seo.description, body, tail: worldTail,
  };
}

/* world data for the 3D scene */
export function worldData(ctx, data) {
  const { services, campaigns, clients, plans } = data;
  return {
    services: services.items.filter((s) => s.home).sort((a, b) => a.homeOrder - b.homeOrder).map((s) => ({ title: s.title, sub: s.ringSub, src: ctx.src(s.thumb), href: ctx.href(s.page ? `service:${s.slug}` : s.linkTo) })),
    campaigns: campaigns.items.filter((c) => c.published && c.id !== 'tanaav').map((c) => ({ id: c.id, src: ctx.src(c.poster) })),
    results: campaigns.results.map((r) => { const m = ctx.m(r.image); return { src: ctx.src(r.image), aspect: m.width / m.height, alt: r.alt }; }),
    logos: clients.logos.map((l) => ctx.src(l.image)),
    plans: plans.items.map((p) => ({ name: p.name, price: `${p.price} ${p.period}`, id: `plan-${p.id}` })),
  };
}

/* =================== ABOUT =================== */
export function about(ctx, data) {
  const A = data.pages.about;
  const trail = [{ id: 'about', label: 'About' }];
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: A.eyebrow, title: A.title, lead: A.lead, image: 'photos-office-building', imageAlt: 'Credtech office building at UrbTech Tower, Sector 132, Noida' })}
  <section class="wrap block"><div class="panel split">
    <div class="prose"><h2 style="margin-top:0">${esc(A.why.heading)}</h2>${C.paras(A.why.paras)}${C.paras(A.story.paras)}</div>
    <div class="stack odo-grid">${join(A.growth.items, (g) => `<div class="stat"><b>${F.odometer(g.value)}</b><span>${esc(g.label)}</span></div>`)}<p class="chip" style="justify-self:start;white-space:normal">${esc(A.growth.note)}</p></div>
  </div></section>
  ${F.elevator([...A.pillars.map((p) => ({ heading: p.heading, short: p.heading, paras: [p.text] })), { heading: A.government.heading, short: A.government.heading, paras: A.government.paras }])}
  <section class="wrap block"><div class="panel">
    ${C.eyebrow('Capabilities')}<h2>${esc(A.capabilities.heading)}</h2><p class="lead" style="margin-top:12px">${esc(A.capabilities.text)}</p>
    <div class="tags" style="margin-top:18px">${join(A.capabilities.items, (t) => C.chip(t))}</div>
    <a class="more" href="${esc(ctx.href('services'))}">Explore our services &rarr;</a>
  </div></section>
  ${C.ctaBand(ctx)}
</main>`;
  return { id: 'about', title: A.seo.title, fullTitle: `${A.seo.title}`, description: A.seo.description, trail, body };
}

/* =================== SERVICES INDEX =================== */
export function servicesIndex(ctx, data) {
  const S = data.services;
  const trail = [{ id: 'services', label: 'Services' }];
  const ordered = [...S.items].sort((a, b) => (a.homeOrder || 99) - (b.homeOrder || 99));
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: S.intro.eyebrow, title: S.intro.title, leadParas: S.intro.paras, solo: true })}
  ${C.ferrisWheel(ctx, ordered)}
  ${C.serviceTrain(ctx, S.more)}
  ${C.ctaBand(ctx, { title: 'Not sure where to start?', text: 'Ask for a free audit of your social presence and reputation, or compare our monthly plans.' })}
</main>`;
  return { id: 'services', title: 'Digital Marketing and PR Services in Noida', description: 'Social media marketing, amplification, PR, influencer marketing, online reputation management, ads, analytics, SEO, content and website development from Credtech Solutions.', trail, body };
}

/* =================== SERVICE DETAIL =================== */
export function serviceDetail(ctx, data, s) {
  const trail = [{ id: 'services', label: 'Services' }, { id: `service:${s.slug}`, label: s.title }];
  const related = data.services.items.filter((x) => x.page && x.slug !== s.slug).slice(0, 3);
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: 'Service', title: s.title, leadParas: s.intro, image: s.heroImage, imageAlt: s.heroAlt, tagList: s.introTags, actions: C.btn(ctx, { label: 'Get your free audit', to: 'contact#audit', arrow: true }) + C.btn(ctx, { label: 'See plans', to: 'plans', kind: 'g' }) })}
  <section class="wrap block svc-journey">${F.metro(s.sections)}<div class="stack">${join(s.sections, (sec, i) => C.serviceSection(ctx, sec, i))}</div></section>
  <section class="wrap block">${C.eyebrow('Related services')}<div class="cards m-slide" style="margin-top:14px">${join(related, (r) => C.serviceCard(ctx, r))}</div></section>
  ${C.ctaBand(ctx)}
</main>`;
  return {
    id: `service:${s.slug}`, title: s.seo.title, description: s.seo.description, trail, body,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Service', name: s.title, serviceType: s.title, description: s.seo.description, provider: { '@id': ctx.site.siteUrl + '/#org' }, areaServed: 'IN', url: ctx.abs(routePath(`service:${s.slug}`)) }],
  };
}

/* =================== CAMPAIGNS =================== */
export function campaignsPage(ctx, data) {
  const { campaigns, pages } = data;
  const P = pages.campaignsPage;
  const trail = [{ id: 'campaigns', label: 'Campaigns' }];
  const cases = campaigns.caseStudies;
  const items = campaigns.items.filter((c) => c.published);
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: campaigns.intro.eyebrow, title: campaigns.intro.title, lead: campaigns.intro.lead, solo: true })}
  ${F.posterTower(ctx, items)}
  ${F.caseBook(ctx, cases)}
  <section class="wrap block"><div class="res-grid m-slide">${join(campaigns.results, (r) => C.resultCard(ctx, r, 'camp-results'))}</div></section>
  ${F.bigScreen(ctx, items)}
  <section class="wrap block"><div class="panel split">
    <div class="prose"><h2 style="margin-top:0">${esc(P.portfolio.heading)}</h2>${C.paras(P.portfolio.paras)}${C.list(P.portfolio.bullets)}</div>
    <div class="media">${ctx.img('photos-hero-connect', 'Person using a smartphone')}</div>
  </div></section>
  ${C.ctaBand(ctx)}
</main>`;
  return { id: 'campaigns', title: P.seo.title, description: P.seo.description, trail, body, ogImage: 'results-badanaam-outcome' };
}

/* =================== CASE STUDY =================== */
export function caseStudy(ctx, data, cs) {
  const trail = [{ id: 'campaigns', label: 'Campaigns' }, { id: `case:${cs.slug}`, label: cs.title }];
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: cs.eyebrow, title: cs.title, leadParas: cs.summary.slice(0, 1), image: cs.hero, imageAlt: cs.heroAlt, actions: when(cs.cta, () => C.btn(ctx, { label: cs.cta.label, to: cs.cta.url, kind: 'g' })) })}
  <section class="wrap block">${F.odoStats(cs.stats)}</section>
  ${when(cs.summary.length > 1, () => `<section class="wrap block"><div class="panel prose" style="max-width:none"><h2 style="margin-top:0">Campaign summary</h2>${C.paras(cs.summary.slice(1))}</div></section>`)}
  ${when(cs.objectives, () => `<section class="wrap block"><h2>Objectives</h2><div class="mini-grid m-slide" style="margin-top:18px">${join(cs.objectives, (o) => `<div class="panel"><h3 style="font-size:20px">${esc(o.title)}</h3><p style="margin-top:8px;color:#cfd8f2">${esc(o.text)}</p></div>`)}</div></section>`)}
  ${when(cs.blocks, () => `<section class="wrap block"><div class="mini-grid m-slide">${join(cs.blocks, (b) => `<div class="panel"><h3 style="font-size:19px;margin-bottom:8px">${esc(b.heading)}</h3>${C.kvTable(b.rows, b.heading)}</div>`)}</div></section>`)}
  ${when(cs.table, () => `<section class="wrap block"><div class="panel"><h2 style="margin-top:0">${esc(cs.table.heading)}</h2><div class="table-wrap" style="margin-top:14px"><table class="kv wide"><thead><tr>${join(cs.table.columns, (c, i) => `<th scope="col"${i ? ' style="text-align:right"' : ''}>${esc(c)}</th>`)}</tr></thead><tbody>${join(cs.table.rows, (r) => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1] || '')}</td><td>${esc(r[2])}</td></tr>`)}</tbody></table></div><p class="form-note">${esc(cs.table.sourceNote)}</p></div></section>`)}
  ${when(cs.videos, () => `<section class="wrap block"><div class="panel"><h2 style="margin-top:0">${esc(cs.videosTitle)}</h2><p class="lead" style="margin-top:8px">${esc(cs.videosIntro)}</p><div class="video-list" style="margin-top:18px">${join(cs.videos, (v) => `<div class="video"><div><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p><a class="ext" href="${esc(v.url)}" target="_blank" rel="noopener">Watch on YouTube</a></div><div class="vw">${esc(v.views)}<small>views</small></div></div>`)}</div></div></section>`)}
  ${when(cs.reception, () => `<section class="wrap block"><div class="panel prose" style="max-width:none"><h2 style="margin-top:0">${esc(cs.reception.heading)}</h2>${C.paras(cs.reception.paras)}${when(cs.reception.bullets, () => C.list(cs.reception.bullets))}</div></section>`)}
  <section class="wrap block"><h2>Report highlights</h2><p class="lead" style="margin:8px 0 18px">Select a slide to enlarge it.</p>${C.gallery(ctx, cs.gallery, 'g-' + cs.slug)}</section>
  ${C.ctaBand(ctx, { title: 'Want results like these?', text: 'Tell us about your film, show or brand and we will plan the campaign with you.' })}
</main>`;
  return {
    id: `case:${cs.slug}`, title: cs.seo.title, description: cs.seo.description, trail, body, ogImage: cs.hero, ogType: 'article',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: cs.title, description: cs.seo.description, image: ctx.abs(ctx.m(cs.hero).src), author: { '@id': ctx.site.siteUrl + '/#org' }, publisher: { '@id': ctx.site.siteUrl + '/#org' }, dateModified: cs.sourceModified.slice(0, 10), mainEntityOfPage: ctx.abs(routePath(`case:${cs.slug}`)) }],
  };
}

/* =================== CLIENTS =================== */
export function clientsPage(ctx, data) {
  const K = data.clients;
  const trail = [{ id: 'clients', label: 'Clients' }];
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: K.intro.eyebrow, title: K.intro.title, lead: 'Twelve channels, brands and institutions circle the Credtech planet. Pick a linked logo to jump to that client story.', visual: F.logoOrbit(ctx, K.logos, K.stories.map((x) => x.id)) })}
  <section class="wrap block"><div class="logo-grid">${join(K.logos, (l) => C.logoTile(ctx, l))}</div></section>
  <section class="wrap block"><div class="panel"><h2 style="margin-top:0">${esc(K.why.heading)}</h2><div style="margin-top:16px">${C.checks(K.why.bullets)}</div></div></section>
  <section class="wrap block">${C.eyebrow('Client stories')}<h2>What we did and what changed</h2>
    <div class="stack stories m-slide m-start" style="margin-top:20px">${join(K.stories, (s) => `<article class="panel story" id="story-${esc(s.id)}">
      <figure class="logo-tile" style="margin:0">${ctx.img(s.logo, s.client)}</figure>
      <div><h3>${esc(s.client)}</h3>${when(s.campaign, () => `<p style="color:var(--ink2);margin-top:4px">${esc(s.campaign)}</p>`)}
        <h4>Objectives</h4>${C.checks(s.objectives)}
        <h4>Strategy</h4>${C.checks(s.strategy)}
        ${when(s.results, () => `<div class="res"><b>Results.</b> ${esc(s.results)}</div>`)}
      </div></article>`)}</div>
  </section>
  ${C.ctaBand(ctx)}
</main>`;
  return { id: 'clients', title: 'Our Clients and Success Stories', description: 'Credtech Solutions clients include Sony LIV, Amazon miniTV, Aaj Tak, ITV Network, Patanjali, Yolohealth, MG Motor, Amar Ujala, News Nation and Varanasi Nagar Nigam.', trail, body };
}

/* =================== PLANS =================== */
export function plansPage(ctx, data) {
  const P = data.plans;
  const trail = [{ id: 'plans', label: 'Plans' }];
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: P.intro.eyebrow, title: P.intro.title, lead: P.intro.lead, visual: F.planSkyline(P.items) })}
  <section class="wrap block"><div class="plan-grid m-slide">${join(P.items, (p) => C.planCard(ctx, p))}</div>
    <p class="consult">${esc(P.closing)} <a class="ext" href="${esc(ctx.site.booking.url)}" target="_blank" rel="noopener">Book your free consultation &rarr;</a></p></section>
  <section class="wrap block"><div class="panel split">
    <div class="prose"><h2 style="margin-top:0">Plans that fit your stage</h2>${C.paras(P.intro.paras)}</div>
    <div><h3 style="font-size:20px;margin-bottom:12px">${esc(P.why.heading)}</h3>${C.checks(P.why.bullets)}</div>
  </div></section>
  ${C.ctaBand(ctx, { title: 'Not sure which plan fits?', text: 'Book a free consultation and we will recommend the right package for your goals.' })}
</main>`;
  return {
    id: 'plans', title: 'Digital Marketing Plans and Packages', description: 'Basic $500 / month, Silver $1,000 / month and Gold $2,000 / month digital marketing packages from Credtech Solutions, covering social media, SEO, ORM, influencers and reporting.', trail, body,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'OfferCatalog', name: 'Credtech Solutions plans', itemListElement: P.items.map((p) => ({ '@type': 'Offer', name: `${p.name} Plan`, description: p.description, price: p.price.replace(/[^0-9.]/g, ''), priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: p.price.replace(/[^0-9.]/g, ''), priceCurrency: 'USD', unitText: 'MONTH' } })) }],
  };
}

/* =================== BLOG =================== */
export function blogIndex(ctx, data) {
  const B = data.posts;
  const posts = B.items.filter((p) => p.status === 'published').sort((a, b) => b.date.localeCompare(a.date));
  const trail = [{ id: 'blog', label: 'Blog' }];
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: B.intro.eyebrow, title: B.intro.title, lead: B.intro.lead, solo: true })}
  ${F.newsTicker(ctx, posts)}
  <section class="wrap block"><div class="cards m-slide">${join(posts, (p) => C.postCard(ctx, p))}</div></section>
  ${C.ctaBand(ctx)}
</main>`;
  return { id: 'blog', title: 'PR and Digital Marketing Blog', description: 'Articles from Credtech Solutions on social media marketing, content marketing, public relations and online reputation management.', trail, body };
}
export function post(ctx, data, p) {
  const trail = [{ id: 'blog', label: 'Blog' }, { id: `post:${p.slug}`, label: p.title }];
  const html = p.bodyHtml.replace(/\{\{media:([a-z0-9-]+)\}\}/g, (_, k) => ctx.src(k));
  const others = data.posts.items.filter((x) => x.status === 'published' && x.slug !== p.slug).slice(0, 3);
  const minutes = Math.max(1, Math.round(html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200));
  const body = `${F.readingRocket(minutes)}<main id="main" class="page">
  <section class="wrap"><div class="phero">
    <div>${C.crumbs(ctx, trail)}${C.eyebrow('Blog')}<h1>${esc(p.title)}</h1><p class="lead">${esc(p.excerpt)}</p>
      <div class="post-meta"><time datetime="${esc(p.date)}">${C.fmtDate(p.date)}</time><span aria-hidden="true">·</span><span>${minutes} min read</span><span aria-hidden="true">·</span><span>Credtech Solutions</span></div></div>
    <div class="frame">${ctx.img(p.image, p.imageAlt, { eager: true })}</div>
  </div></section>
  <section class="wrap block"><article class="panel narrow" id="post-body"><div class="prose">${html}</div></article></section>
  <section class="wrap block">${C.eyebrow('Keep reading')}<div class="cards m-slide" style="margin-top:14px">${join(others, (o) => C.postCard(ctx, o))}</div></section>
  ${C.ctaBand(ctx)}
</main>`;
  return {
    id: `post:${p.slug}`, title: p.title, description: p.excerpt, trail, body, ogType: 'article', ogImage: p.image,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.excerpt, datePublished: p.date, dateModified: (p.sourceModified || p.date).slice(0, 10), image: ctx.abs(ctx.m(p.image).src), author: { '@id': ctx.site.siteUrl + '/#org' }, publisher: { '@id': ctx.site.siteUrl + '/#org' }, mainEntityOfPage: ctx.abs(routePath(`post:${p.slug}`)) }],
  };
}

/* =================== CONTACT / SCHEDULE / CAREERS / PRIVACY / 404 =================== */
export function contact(ctx, data) {
  const P = data.pages.contact;
  const trail = [{ id: 'contact', label: 'Contact' }];
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: P.eyebrow, title: P.title, lead: P.lead, visual: F.signalTower() })}
  <section class="contact" style="padding-bottom:40px"><div class="wrap">
    <div class="panel">${C.eyebrow('Credtech Solutions Private Limited')}<h2 style="font-size:28px">Reach us directly</h2>${C.contactRows(ctx)}${C.socialLinks(ctx)}
      <div class="office">${ctx.img('photos-office-wide', 'Credtech office at UrbTech Tower')}<span>${esc(ctx.site.contact.addressLine)}</span></div></div>
    ${C.enquiryForm(ctx, { id: 'audit', kind: 'contact', eyebrowText: 'Free audit', title: P.formTitle, subject: 'Website enquiry', fields: C.contactFields })}
  </div></section>
</main>`;
  return { id: 'contact', title: P.seo.title, fullTitle: P.seo.title, description: P.seo.description, trail, body };
}
export function schedule(ctx, data, { preview }) {
  const P = data.pages.schedule;
  const trail = [{ id: 'schedule', label: 'Schedule a meeting' }];
  const embed = preview
    ? `<div class="panel" style="text-align:center"><p class="lead" style="margin:0 auto">${esc(P.howTo)}</p><div class="ctas" style="justify-content:center">${C.btn(ctx, { label: 'Open the booking calendar', to: 'booking' })}</div><p class="form-note">The calendar opens on Google Calendar in a new tab. On the live website it is also embedded here.</p></div>`
    : `<div class="panel"><p class="lead" style="margin-bottom:16px">${esc(P.howTo)}</p><div class="embed"><iframe src="${esc(ctx.site.booking.url)}" title="Book a meeting with Credtech Solutions (Google Calendar)" loading="lazy"></iframe></div><p class="form-note">Calendar not loading? <a class="ext" href="${esc(ctx.site.booking.url)}" target="_blank" rel="noopener">Open it on Google Calendar</a>.</p></div>`;
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: P.eyebrow, title: P.title, lead: P.lead, actions: C.btn(ctx, { label: 'Open the booking calendar', to: 'booking' }), visual: F.flapBoard(P.board) })}
  <section class="wrap block"><div class="panel"><h2 style="margin-top:0;font-size:26px">${esc(P.expect.heading)}</h2><div style="margin-top:14px">${C.checks(P.expect.bullets)}</div></div></section>
  <section class="wrap block">${embed}</section>
</main>`;
  return { id: 'schedule', title: P.seo.title, description: P.seo.description, trail, body };
}
export function careers(ctx, data) {
  const P = data.pages.careers;
  const trail = [{ id: 'careers', label: 'Careers' }];
  const fields = [
    { name: 'name', label: 'Name', required: true, autocomplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, autocomplete: 'tel', placeholder: '+91' },
    { name: 'role', label: 'Apply for', type: 'select', required: true, options: P.roles, placeholder: 'Choose a role' },
    { name: 'message', label: 'Message', type: 'textarea', full: true, placeholder: 'Tell us about your experience and link your portfolio or LinkedIn' },
  ];
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: P.eyebrow, title: P.title, lead: P.lead, tagList: P.roles, visual: F.balloons(P.roles) })}
  <section class="wrap block" style="max-width:820px">${C.enquiryForm(ctx, { id: 'apply', kind: 'careers', title: 'Apply now', subject: 'Job application', submit: 'Send application', fields })}</section>
</main>`;
  return { id: 'careers', title: P.seo.title, fullTitle: P.seo.title, description: P.seo.description, trail, body };
}
export function privacy(ctx, data) {
  const P = data.pages.privacy;
  const trail = [{ id: 'privacy', label: 'Privacy Policy' }];
  const body = `<main id="main" class="page">
  ${C.pageHero(ctx, { trail, eyebrowText: P.eyebrow, title: P.title, lead: 'What we collect, why we collect it and how we share it.', visual: F.vault(ctx) })}
  <section class="wrap block"><article class="panel narrow" id="policy-body"><div class="prose">${C.paras(P.intro)}${join(P.sections, (s) => `<h2>${esc(s.heading)}</h2>${C.paras(s.paras)}`)}<p>${esc(P.contactLine)}</p></div></article></section>
</main>`;
  return { id: 'privacy', title: P.seo.title, description: P.seo.description, trail, body };
}
export function notFound(ctx, data) {
  const P = data.pages.notFound;
  const body = `<main id="main" class="page nf"><div class="wrap" style="width:100%"><div class="panel" style="max-width:760px">
  ${C.eyebrow('404')}<h1 style="font-size:clamp(32px,4.4vw,52px);margin-top:12px">${esc(P.title)}</h1><p class="lead" style="margin-top:14px">${esc(P.lead)}</p>
  <div class="ctas">${C.btn(ctx, { label: 'Go to the homepage', to: 'home' })}${C.btn(ctx, { label: 'Services', to: 'services', kind: 'g' })}${C.btn(ctx, { label: 'Campaigns', to: 'campaigns', kind: 'g' })}${C.btn(ctx, { label: 'Contact', to: 'contact', kind: 'g' })}</div>
</div><div style="margin-top:30px">${F.lostTrain(ctx)}</div></div></main>`;
  return { id: '404', title: 'Page not found', description: P.lead, body };
}
