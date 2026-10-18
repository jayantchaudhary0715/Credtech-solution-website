// Interactive set pieces, one per page type, all part of the "Credtech City" world.
// Each renders complete, readable HTML without JavaScript; src/site.js adds the motion.
import { esc, join, when } from './lib.mjs';
import { eyebrow, chip } from './components.mjs';

/* ---------- About: elevator ride up UrbTech Tower ---------- */
export function elevator(floors) {
  const n = floors.length;
  const levels = floors.map((f, i) => `<li class="lv" style="--k:${i}"><span>${String(i + 1).padStart(2, '0')}</span><em>${esc(f.short)}</em></li>`).reverse().join('');
  return `<section class="wrap block lift-sec" aria-labelledby="lift-h">
  <div class="lift-head">${eyebrow('Inside UrbTech Tower')}<h2 id="lift-h">Ride up through how we work</h2><p class="lead" style="margin-top:10px">Scroll and the lift climbs one floor for each part of our story.</p></div>
  <div class="lift" style="--n:${n}">
    <div class="lift-shaft" aria-hidden="true">
      <ol class="lift-levels">${levels}</ol>
      <div class="lift-cable"></div>
      <div class="lift-car" id="lift-car"><b id="lift-no">01</b><i class="door l"></i><i class="door r"></i></div>
    </div>
    <div class="lift-floors">${join(floors, (f, i) => `<article class="panel lift-card" data-floor="${i}"><span class="lift-tag">Floor ${String(i + 1).padStart(2, '0')}</span><h3>${esc(f.heading)}</h3>${join(f.paras, (p) => `<p>${esc(p)}</p>`)}</article>`)}</div>
  </div>
</section>`;
}

/* ---------- Service pages: metro line of the sections ---------- */
export function metro(sections) {
  return `<nav class="metro" id="metro" aria-label="On this page">
    <p class="metro-title">Stops on this line</p>
    <ol>${join(sections, (s, i) => `<li><a href="#${esc(s.id)}" data-i="${i}"><i></i><span>${esc(s.heading)}</span></a></li>`)}</ol>
    <span class="metro-car" aria-hidden="true"><i></i><i></i></span>
  </nav>`;
}

/* ---------- Case studies: odometer digits ---------- */
export function odometer(value) {
  let d = 0;
  const cells = [...String(value)].map((ch) => /\d/.test(ch)
    ? `<span class="odo-d"><span class="odo-s" style="--v:${ch};--i:${d++}">0123456789</span></span>`
    : `<span class="odo-c">${esc(ch)}</span>`).join('');
  return `<span class="sr-only">${esc(value)}</span><span class="odo" aria-hidden="true">${cells}</span>`;
}
export function odoStats(stats) {
  return `<div class="stats odo-grid">${join(stats, (s) => `<div class="stat"><b>${odometer(s.value)}</b><span>${esc(s.label)}</span></div>`)}</div>`;
}

/* ---------- Campaigns: revolving billboard tower ---------- */
export function posterTower(ctx, items) {
  const step = 360 / items.length;
  return `<section class="wrap block pt-sec" aria-labelledby="pt-h">
  <div class="pt-head">
    <div>${eyebrow('Now showing')}<h2 id="pt-h">The billboard tower</h2><p class="lead" style="margin-top:8px">Drag to spin it. Pick a poster to read about that campaign.</p></div>
    <div class="fw-ctl" style="margin:0"><button type="button" id="pt-prev" aria-label="Previous poster">&larr;</button><button type="button" id="pt-play" aria-pressed="false" aria-label="Pause the tower">Pause</button><button type="button" id="pt-next" aria-label="Next poster">&rarr;</button></div>
  </div>
  <div class="pt-stage" id="pt-stage">
    <div class="pt-ring" id="pt-ring" style="--step:${step}deg">${join(items, (c, i) => `<a class="pt-face" href="#c-${esc(c.id)}" style="--i:${i}" data-title="${esc(c.title)}" data-chip="${esc(c.chip)}" draggable="false">${ctx.img(c.poster, c.posterAlt)}</a>`)}</div>
    <div class="pt-pillar" aria-hidden="true"></div><div class="pt-base" aria-hidden="true"></div>
  </div>
  <p class="pt-now">Front of the tower: <b id="pt-title">${esc(items[0].title)}</b> <span class="chip" id="pt-chip">${esc(items[0].chip)}</span></p>
</section>`;
}

/* ---------- Clients: logos orbiting the Credtech planet ---------- */
export function logoOrbit(ctx, logos, storyIds) {
  const half = Math.ceil(logos.length / 2);
  const item = (l, ring, k, count) => {
    const inner = ctx.img(l.image, l.name);
    const attrs = `class="orbit-item" data-ring="${ring}" data-k="${k}" data-n="${count}"`;
    return storyIds.includes(l.id) ? `<a ${attrs} href="#story-${esc(l.id)}" aria-label="${esc(l.name)}: read the client story">${inner}</a>` : `<span ${attrs}>${inner}</span>`;
  };
  const a = logos.slice(0, half), b = logos.slice(half);
  return `<div class="orbit" id="orbit">
    <div class="orbit-scale">
      <div class="orbit-scene">
        <div class="orbit-path p1" aria-hidden="true"></div><div class="orbit-path p2" aria-hidden="true"></div>
        <div class="orbit-core" aria-hidden="true">${ctx.img('brand-icon-512', '')}</div>
        ${a.map((l, k) => item(l, 1, k, a.length)).join('')}${b.map((l, k) => item(l, 2, k, b.length)).join('')}
      </div>
    </div>
    <p class="orbit-note">Clients with a story are linked. Hover to pause the orbit.</p>
  </div>`;
}

/* ---------- Plans: three towers that build floor by floor ---------- */
export function planSkyline(plans) {
  const heights = [170, 250, 330];
  return `<div class="sky" id="sky">
    <div class="sky-row">${join(plans, (p, i) => {
      const n = p.features.length, h = heights[i] || 200;
      return `<button type="button" class="sky-tower t${i}" data-plan="plan-${esc(p.id)}" style="--h:${h}px;--n:${n}" aria-label="${esc(p.name)} plan, ${esc(p.price)} ${esc(p.period)}: show details">
        <span class="sky-sign"><b>${esc(p.name)}</b><small>${esc(p.price)} ${esc(p.period)}</small></span>
        ${i === plans.length - 1 ? '<span class="sky-antenna" aria-hidden="true"></span>' : ''}
        <span class="sky-body" aria-hidden="true">${Array.from({ length: n }, (_, k) => `<i style="--f:${k}"></i>`).join('')}</span>
        <span class="sky-floors" aria-hidden="true">${n} floors, one per feature</span>
      </button>`;
    })}</div>
    <div class="sky-ground" aria-hidden="true"></div>
  </div>`;
}

/* ---------- Blog: LED news ticker ---------- */
export function newsTicker(ctx, posts) {
  const items = (hidden) => join(posts, (p) => `<a href="${esc(ctx.href('post:' + p.slug))}"${hidden ? ' tabindex="-1" aria-hidden="true"' : ''}>${esc(p.title)}</a><span class="tk-dot" aria-hidden="true">◆</span>`);
  return `<section class="wrap ticker-wrap" aria-label="Latest articles">
    <div class="ticker"><span class="tk-tag">Latest</span><div class="tk-window"><div class="tk-run">${items(false)}${items(true)}</div></div></div>
  </section>`;
}

/* ---------- Blog posts: reading rocket ---------- */
export function readingRocket(minutes) {
  return `<div class="rocket-track" id="rocket" aria-hidden="true" data-min="${minutes}">
    <span class="rk-line"><span class="rk-fill"></span></span>
    <span class="rk-ship"><svg viewBox="0 0 40 64" width="26" height="42"><path d="M20 2c9 8 13 20 12 34H8C7 22 11 10 20 2z" fill="#e8f6ff"/><circle cx="20" cy="22" r="5" fill="#2f7bff" stroke="#0139B7" stroke-width="2"/><path d="M8 36l-6 12 8-3zM32 36l6 12-8-3z" fill="#5ad1ff"/><path class="rk-flame" d="M13 46h14l-7 16z" fill="#ffc531"/></svg></span>
    <span class="rk-pct">0%</span>
  </div>`;
}

/* ---------- Contact: signal tower and form signal meter ---------- */
export function signalTower() {
  return `<div class="signal" id="signal">
    <div class="sig-stage" aria-hidden="true">
      <span class="sig-ring"></span><span class="sig-ring"></span><span class="sig-ring"></span>
      <svg class="sig-tower" viewBox="0 0 120 220" width="120" height="220"><g fill="none" stroke="#8fd0ff" stroke-width="3" stroke-linecap="round"><path d="M60 30L28 214M60 30l32 184M38 150h44M44 110h32M50 70h20M38 150l38-40M82 150L44 110M44 110l26-40M76 110L50 70"/></g><circle cx="60" cy="24" r="8" fill="#ff4f7b"/><path d="M60 16v-12" stroke="#bfe9ff" stroke-width="3"/></svg>
    </div>
    <div class="sig-meter"><span class="sig-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><p id="sig-text" aria-live="polite">Fill in the form to boost the signal.</p></div>
  </div>`;
}

/* ---------- Schedule: split-flap departures board ---------- */
export function flapBoard(rows) {
  const W1 = 16, W2 = 9;
  const cells = (s, w) => [...s.toUpperCase().padEnd(w).slice(0, w)].map((c) => `<span class="fl" data-c="${esc(c)}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
  return `<div class="board" id="board">
    <div class="bd-top"><span>Departures</span><span class="bd-clock" id="bd-clock">--:--</span></div>
    <div class="bd-head" aria-hidden="true"><span>Destination</span><span>Status</span></div>
    <ul class="bd-rows">${join(rows, (r) => `<li><span class="sr-only">${esc(r.to)}: ${esc(r.status)}</span><span class="bd-c1" aria-hidden="true">${cells(r.to, W1)}</span><span class="bd-c2" aria-hidden="true" data-alt="${esc(r.alt || r.status)}">${cells(r.status, W2)}</span></li>`)}</ul>
  </div>`;
}

/* ---------- Careers: hot-air balloons, one per role ---------- */
export function balloons(roles) {
  const colours = [['#5ad1ff', '#2f7bff'], ['#a99bff', '#6a4dff'], ['#ffd27a', '#f5a400'], ['#7dffb9', '#12b36b']];
  return `<div class="sky-balloons" id="balloons">
    ${join(roles, (r, i) => `<button type="button" class="balloon" data-role="${esc(r)}" style="--c1:${colours[i % 4][0]};--c2:${colours[i % 4][1]};--x:${8 + i * 23}%;--d:${(i * 0.9).toFixed(1)}s;--t:${(5 + (i % 3)).toFixed(0)}s" aria-label="Apply for ${esc(r)}">
      <span class="bl-env" aria-hidden="true"></span><span class="bl-ropes" aria-hidden="true"></span><span class="bl-basket" aria-hidden="true"></span><span class="bl-name">${esc(r)}</span>
    </button>`)}
    <p class="bl-note" id="bl-note" aria-live="polite">Pick a balloon to choose that role in the form.</p>
  </div>`;
}

/* ---------- Privacy: vault door that turns as you read ---------- */
export function vault(ctx) {
  return `<div class="vault" aria-hidden="true">
    <div class="vt-door"><div class="vt-bolts">${Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30}deg"></i>`).join('')}</div>
      <div class="vt-dial" id="vt-dial"><span class="vt-spoke"></span><span class="vt-spoke s2"></span><span class="vt-spoke s3"></span><span class="vt-hub">${ctx.img('brand-icon-512', '')}</span></div>
    </div>
    <p class="vt-note">The dial turns as you read.</p>
  </div>`;
}

/* ---------- 404: a lost train with the way back ---------- */
export function lostTrain(ctx) {
  const wheels = '<span class="bogie"><i class="wheel"></i><i class="wheel"></i></span><span class="bogie"><i class="wheel"></i><i class="wheel"></i></span>';
  const stops = [['home', 'Home', 'Back to Credtech City'], ['services', 'Services', 'Ride the Ferris wheel'], ['campaigns', 'Campaigns', 'Visit the billboard tower'], ['contact', 'Contact', 'Send us a signal']];
  return `<div class="rail-track lost" id="lost">
    <div class="lost-run"><div class="train">
      <div class="loco" aria-hidden="true"><div class="loco-body"><span class="loco-glass"></span><span class="loco-light"></span>${ctx.img('brand-icon-512', '', { cls: 'loco-mark' })}<span class="loco-stripe"></span></div><div class="bogies">${wheels}</div></div>
      ${join(stops, ([id, t, s]) => `<span class="coupler" aria-hidden="true"></span><a class="coach" href="${esc(ctx.href(id))}"><div class="coach-body"><div class="coach-windows" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><h3>${esc(t)}</h3><p>${esc(s)}</p><span class="coach-stripe" aria-hidden="true"></span></div><div class="bogies" aria-hidden="true">${wheels}</div></a>`)}
    </div></div>
    <div class="rails" aria-hidden="true"></div>
  </div>`;
}

/* ---------- Campaigns: the case study book ---------- */
export function caseBook(ctx, cases) {
  const N = cases.length, two = (n) => String(n).padStart(2, '0');
  const spread = (cs, i) => {
    const thumbs = (cs.gallery || []).slice(0, 2);
    const client = cs.eyebrow.replace(/^Case study\s*·\s*/, '');
    return `<div class="bk-spread" role="group" aria-roledescription="page" aria-label="Case study ${i + 1} of ${N}: ${esc(cs.title)}" data-k="${i}">
      <div class="bk-page bk-l">
        <p class="bk-kicker">Case study ${two(i + 1)} of ${two(N)}</p>
        <figure class="bk-hero">${ctx.img(cs.hero, cs.heroAlt)}</figure>
        ${when(thumbs.length, () => `<p class="bk-cap">From the campaign report</p><div class="bk-thumbs">${join(thumbs, (g) => ctx.img(g.image, g.alt))}</div>`)}
        <span class="bk-no" aria-hidden="true">${i * 2 + 1}</span><span class="bk-corner pv" aria-hidden="true"></span>
      </div>
      <div class="bk-page bk-r">
        <p class="bk-client">${esc(client)}</p>
        <h3>${esc(cs.title)}</h3>
        <p class="bk-sum">${esc(cs.summary[0])}</p>
        <dl class="bk-stats">${join(cs.stats.slice(0, 4), (s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`)}</dl>
        <a class="btn sm p bk-go" href="${esc(ctx.href('case:' + cs.slug))}">Read the full case study &rarr;</a>
        <span class="bk-no" aria-hidden="true">${i * 2 + 2}</span><span class="bk-corner nx" aria-hidden="true"></span>
      </div>
    </div>`;
  };
  return `<section class="wrap block bk-sec" aria-labelledby="bk-h">
  <div class="pt-head">
    <div>${eyebrow('Case studies')}<h2 id="bk-h">The campaign casebook</h2><p class="lead" style="margin-top:8px">The pages turn on their own every few seconds. Hover to hold a page, use the arrows, or pick a bookmark to jump to a campaign.</p></div>
    <div class="fw-ctl" style="margin:0"><button type="button" id="bk-prev" aria-label="Previous case study">&larr;</button><button type="button" id="bk-play" aria-pressed="false" aria-label="Pause the page turning">Pause</button><button type="button" id="bk-next" aria-label="Next case study">&rarr;</button></div>
  </div>
  <div class="bk" id="casebook">
    <div class="bk-book">
      <span class="bk-ribbon" aria-hidden="true"></span>
      <div class="bk-pages">${cases.map(spread).join('')}</div>
      <span class="bk-timer" aria-hidden="true"><i></i></span>
    </div>
    <div class="bk-marks" role="group" aria-label="Bookmarks">${join(cases, (cs, i) => `<button type="button" class="bk-mark" data-k="${i}"><b>${two(i + 1)}</b>${esc(cs.title)}</button>`)}</div>
    <p class="sr-only" id="bk-status" aria-live="off"></p>
  </div>
</section>`;
}

/* ---------- Campaigns: the big screen, one campaign every 5 seconds ---------- */
export function bigScreen(ctx, items) {
  const N = items.length, two = (n) => String(n).padStart(2, '0');
  const slide = (c, i) => `<article class="scr-slide" id="c-${esc(c.id)}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${N}: ${esc(c.title)}" data-k="${i}">
      <div class="scr-bg" aria-hidden="true">${ctx.img(c.poster, '')}</div>
      <div class="scr-poster">${ctx.img(c.poster, c.posterAlt)}</div>
      <div class="scr-info">
        <div class="scr-meta">${chip(c.chip)}<span class="scr-count">${two(i + 1)} / ${two(N)}</span></div>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.description)}</p>
        ${when(c.highlight, () => `<div class="tags">${chip('▲ ' + c.highlight, true)}</div>`)}
        ${when(c.videos && c.videosPublished, () => `<h4 style="font-size:13px;margin-top:14px">YouTube reviews</h4><ul class="checks" style="margin-top:8px;font-size:14px">${join(c.videos, (v) => `<li><span><a class="ext" href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.channel)}</a> · ${esc(v.views)} views</span></li>`)}</ul>`)}
        <div class="scr-cta">${c.caseStudy
          ? `<a class="btn p scr-go" href="${esc(ctx.href('case:' + c.caseStudy))}">Read the case study &rarr;</a>`
          : `<a class="btn g scr-go" href="${esc(ctx.href('contact#audit'))}">Plan a campaign like this &rarr;</a>`}</div>
      </div>
    </article>`;
  return `<section class="wrap block scr-sec" aria-labelledby="scr-h">
  <div class="pt-head">
    <div>${eyebrow('All campaigns')}<h2 id="scr-h">Every campaign on our wall</h2><p class="lead" style="margin-top:8px">Now playing on the Credtech big screen: a new campaign every 5 seconds. Point at the screen to hold it, or pick a poster below.</p></div>
    <div class="fw-ctl" style="margin:0"><button type="button" id="scr-prev" aria-label="Previous campaign">&larr;</button><button type="button" id="scr-play" aria-pressed="false" aria-label="Pause the screen">Pause</button><button type="button" id="scr-next" aria-label="Next campaign">&rarr;</button></div>
  </div>
  <div class="scr" id="bigscreen" aria-roledescription="carousel" aria-label="Campaign screen">
    <div class="scr-rig" aria-hidden="true"><span class="scr-lamp l"></span><span class="scr-lamp r"></span><span class="scr-beam l"></span><span class="scr-beam r"></span></div>
    <div class="scr-frame">
      <div class="scr-screen">
        <div class="scr-slides">${items.map(slide).join('')}</div>
        <span class="scr-live" aria-hidden="true"><i></i>Now showing</span>
        <span class="scr-fx" aria-hidden="true"></span><span class="scr-static" aria-hidden="true"></span>
        <span class="scr-bar" aria-hidden="true"><i></i></span>
      </div>
    </div>
    <div class="scr-stand" aria-hidden="true"><i></i><i></i></div>
    <div class="scr-reel" role="group" aria-label="Choose a campaign">${join(items, (c, i) => `<button type="button" class="scr-thumb" data-k="${i}" aria-label="Show ${esc(c.title)}">${ctx.img(c.poster, '')}<span>${esc(c.title)}</span></button>`)}</div>
    <p class="sr-only" id="scr-status" aria-live="off"></p>
  </div>
</section>`;
}
