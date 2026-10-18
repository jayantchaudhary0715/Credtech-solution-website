/* Credtech Solutions: page UI shared by every page (no 3D). */
(function () {
  'use strict';
  var cfgEl = document.getElementById('site-config');
  var CFG = {};
  try { CFG = JSON.parse(cfgEl ? cfgEl.textContent : '{}'); } catch (e) { CFG = {}; }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------- mobile menu ---------- */
  var mBtn = $('.menu-btn'), menu = $('#menu');
  if (mBtn && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('open', open);
      mBtn.setAttribute('aria-expanded', String(open));
      mBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { var f = menu.querySelector('a'); if (f) f.focus(); }
    };
    mBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); mBtn.focus(); } });
    document.addEventListener('click', function (e) { if (menu.classList.contains('open') && !menu.contains(e.target) && !mBtn.contains(e.target)) setMenu(false); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ---------- scroll progress + journey rail (homepage) ---------- */
  var bar = $('#progress'), secs = $$('[data-stop]'), rail = $$('.rail a');
  if (bar || rail.length) {
    var onScroll = function () {
      if (rail.length) {
        var y = scrollY + innerHeight * 0.5, i = 0;
        secs.forEach(function (s, k) { if (s.offsetTop <= y) i = k; });
        rail.forEach(function (a, k) { a.classList.toggle('on', k === i); if (k === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
        var hud = document.getElementById('hud'); if (hud) hud.style.opacity = i >= secs.length - 1 ? '0' : '';
      }
      if (bar) { var max = document.documentElement.scrollHeight - innerHeight; bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%'; }
    };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
  }

  /* ---------- campaign strip ---------- */
  var strip = $('#strip');
  if (strip) {
    var by = function (d) { strip.scrollBy({ left: d * strip.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' }); };
    var p = $('#prev'), n = $('#next');
    if (p) p.addEventListener('click', function () { by(-1); });
    if (n) n.addEventListener('click', function () { by(1); });
  }
  if (!reduce && window.matchMedia && matchMedia('(hover: hover)').matches) {
    $$('.film').forEach(function (f) {
      var c = f.querySelector('.card');
      f.addEventListener('pointermove', function (e) {
        var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.transform = 'rotateY(' + ((x - 0.5) * 16) + 'deg) rotateX(' + ((0.5 - y) * 14) + 'deg) translateZ(10px)';
        c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
      });
      f.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }
  window.__flash = function (sel) {
    var el = document.querySelector(sel); if (!el) return;
    el.classList.add('flash'); setTimeout(function () { el.classList.remove('flash'); }, 1800);
  };

  /* ---------- services Ferris wheel ---------- */
  var fw = $('.fw');
  if (fw) {
    var stage = $('#fw-stage'), rotor = $('#fw-rotor'), cabs = $$('.fw-cab', fw), N = cabs.length, slot = 360 / N;
    var step = 0, playing = !reduce, held = false, inView = true;
    var fwTitle = $('#fw-title'), fwText = $('#fw-text'), fwLink = $('#fw-link'), fwNum = $('#fw-num'), fwPlay = $('#fw-play');
    var fit = function () {
      var s = Math.min(1, stage.clientWidth / 820);
      stage.style.setProperty('--s', s); stage.style.height = Math.round(920 * s) + 'px';
      fw.classList.toggle('compact', s < 0.66);
    };
    var show = function (i) {
      cabs.forEach(function (c, k) { c.classList.toggle('on', k === i); });
      var a = cabs[i].querySelector('.fw-card');
      fwTitle.textContent = a.getAttribute('data-title');
      fwText.textContent = a.getAttribute('data-text');
      fwLink.setAttribute('href', a.getAttribute('href'));
      fwLink.textContent = a.getAttribute('data-cta') + ' →';
      fwNum.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    };
    var current = function () { return ((step % N) + N) % N; };
    var apply = function () {
      var rot = -step * slot;
      rotor.style.transform = 'rotate(' + rot + 'deg)';
      cabs.forEach(function (c, k) { c.firstElementChild.style.transform = 'rotate(' + (-(k * slot + rot)) + 'deg)'; });
    };
    var sway = function () {
      if (reduce) return;
      $$('.fw-swing', fw).forEach(function (s) { s.classList.remove('sway'); void s.offsetWidth; s.classList.add('sway'); });
    };
    // Turn one cabin: the next service arrives at the bottom, the last one rises up the right side.
    var go = function (d) { step += d; apply(); sway(); show(current()); };
    var setPlay = function (on) {
      playing = on;
      fwPlay.textContent = on ? 'Pause' : 'Play';
      fwPlay.setAttribute('aria-pressed', String(!on));
      fwPlay.setAttribute('aria-label', on ? 'Pause the wheel' : 'Play the wheel');
    };
    setPlay(playing);
    fit(); addEventListener('resize', fit);
    $('#fw-prev').addEventListener('click', function () { go(-1); });
    $('#fw-next').addEventListener('click', function () { go(1); });
    fwPlay.addEventListener('click', function () { setPlay(!playing); });
    stage.addEventListener('mouseenter', function () { held = true; });
    stage.addEventListener('mouseleave', function () { held = false; show(current()); });
    cabs.forEach(function (c, k) {
      var a = c.querySelector('.fw-card');
      a.addEventListener('mouseenter', function () { show(k); });
      a.addEventListener('focus', function () { held = true; show(k); });
      a.addEventListener('blur', function () { held = false; });
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { inView = e[0].isIntersecting; }).observe(stage);
    setInterval(function () { if (playing && !held && inView && !document.hidden) go(1); }, 3200);
  }

  /* ---------- specialist services train ---------- */
  var track = $('#train-track');
  if (track) {
    var run = track.querySelector('.train-run'), tBtn = $('#train-play');
    // Keep a slow, constant speed (about 30 px per second) whatever the train length.
    var pace = function () {
      var copy = run.scrollWidth / 2, dur = Math.max(40, Math.round(copy / 30));
      run.style.setProperty('--train-dur', dur + 's');
      // Begin with the second locomotive about a quarter of the way in, so visitors see the engine first.
      var lead = Math.max(0, copy - track.clientWidth * 0.22);
      run.style.animationDelay = (-(lead / copy) * dur).toFixed(2) + 's';
    };
    pace(); addEventListener('resize', pace);
    var setTrain = function (moving) {
      track.classList.toggle('paused', !moving);
      tBtn.textContent = moving ? 'Pause' : 'Play';
      tBtn.setAttribute('aria-pressed', String(!moving));
      tBtn.setAttribute('aria-label', moving ? 'Pause the train' : 'Play the train');
    };
    if (reduce) { tBtn.hidden = true; } else { setTrain(true); tBtn.addEventListener('click', function () { setTrain(track.classList.contains('paused')); }); }
  }

  /* ---------- lightbox ---------- */
  function lightbox(items, start, opener) {
    var idx = start || 0;
    var d = document.createElement('div');
    d.className = 'lb'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Image viewer');
    d.innerHTML = '<img alt=""><p></p><button type="button" class="x" aria-label="Close">&times;</button>' +
      (items.length > 1 ? '<button type="button" class="nv prev" aria-label="Previous image">&larr;</button><button type="button" class="nv next" aria-label="Next image">&rarr;</button>' : '');
    var im = d.querySelector('img'), cap = d.querySelector('p');
    function show() { im.src = items[idx].src; im.alt = items[idx].alt || ''; cap.textContent = items[idx].alt || ''; }
    function close() { d.remove(); document.removeEventListener('keydown', key); document.body.style.overflow = ''; if (opener) opener.focus(); }
    function go(k) { idx = (idx + k + items.length) % items.length; show(); }
    function key(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' && items.length > 1) go(1);
      else if (e.key === 'ArrowLeft' && items.length > 1) go(-1);
      else if (e.key === 'Tab') { var b = $$('button', d), i = b.indexOf(document.activeElement); e.preventDefault(); b[(i + (e.shiftKey ? -1 : 1) + b.length) % b.length].focus(); }
    }
    d.addEventListener('click', function (e) {
      if (e.target.classList.contains('prev')) return go(-1);
      if (e.target.classList.contains('next')) return go(1);
      if (e.target === d || e.target.classList.contains('x')) close();
    });
    document.addEventListener('keydown', key);
    document.body.appendChild(d); document.body.style.overflow = 'hidden';
    show(); d.querySelector('.x').focus();
  }
  window.__lightbox = function (src, alt) { lightbox([{ src: src, alt: alt }], 0, document.activeElement); };
  var groups = {};
  $$('[data-full]').forEach(function (b) {
    var g = b.getAttribute('data-group') || ('_' + Math.random());
    (groups[g] = groups[g] || []).push(b);
  });
  Object.keys(groups).forEach(function (g) {
    var list = groups[g];
    var items = list.map(function (b) { var i = b.querySelector('img'); return { src: b.getAttribute('data-full'), alt: i ? i.alt : '' }; });
    list.forEach(function (b, i) { b.addEventListener('click', function () { lightbox(items, i, b); }); });
  });

  /* ---------- copy buttons ---------- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy'), label = b.textContent;
      var done = function (ok) { b.textContent = ok ? 'Copied' : 'Select and copy'; setTimeout(function () { b.textContent = label; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });
  });

  /* ---------- forms ---------- */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setErr(input, msg) {
    var box = document.getElementById(input.id + '-err');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (box) box.textContent = msg || '';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  $$('form[data-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var kind = form.getAttribute('data-form');
    var endpoint = (CFG.forms && (kind === 'careers' ? (CFG.forms.careersEndpoint || CFG.forms.endpoint) : CFG.forms.endpoint)) || '';
    var to = (CFG.forms && CFG.forms.recipientEmail) || (CFG.contact && CFG.contact.email) || '';
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') validate(e.target); });
    function validate(el) {
      var v = (el.value || '').trim(), msg = '';
      if (el.required && !v) msg = 'Please fill in ' + (el.getAttribute('data-label') || 'this field').toLowerCase() + '.';
      else if (el.type === 'email' && v && !emailRe.test(v)) msg = 'Enter an email address like name@company.com.';
      else if (el.type === 'tel' && v && v.replace(/\D/g, '').length < 10) msg = 'Enter a phone number with at least 10 digits.';
      setErr(el, msg); return !msg;
    }
    function summary() {
      var lines = [];
      $$('input,textarea,select', form).forEach(function (el) {
        if (!el.name || el.type === 'hidden' || el.classList.contains('hp-in') || !el.value.trim()) return;
        lines.push((el.getAttribute('data-label') || el.name) + ': ' + el.value.trim());
      });
      return lines.join('\n');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = $$('input,textarea,select', form).filter(function (el) { return el.name && el.type !== 'hidden' && !el.classList.contains('hp-in'); });
      var bad = fields.filter(function (el) { return !validate(el); });
      if (bad.length) { status.className = 'form-status bad'; status.textContent = 'Please fix the highlighted ' + (bad.length > 1 ? 'fields' : 'field') + '.'; bad[0].focus(); return; }
      var hp = form.querySelector('.hp-in'); if (hp && hp.value) return;
      var subject = form.getAttribute('data-subject') || 'Website enquiry';
      if (!endpoint) {
        var body = summary();
        var mail = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        status.className = 'form-status warn';
        status.innerHTML = '<b>Your message has not been sent.</b> Online form sending is not connected on this website yet. ' +
          'Please email <b>' + esc(to) + '</b> or call <b>' + esc((CFG.contact && CFG.contact.phoneDisplay) || '') + '</b>. ' +
          'You can open an email draft with your details or copy them below.' +
          '<span class="row"><a class="btn sm p" href="' + esc(mail) + '">Open email draft</a><button type="button" class="btn sm g" data-cp>Copy my details</button></span>';
        var cp = status.querySelector('[data-cp]');
        cp.addEventListener('click', function () {
          var ok = function () { cp.textContent = 'Copied'; };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('To: ' + to + '\nSubject: ' + subject + '\n\n' + body).then(ok, function () { cp.textContent = 'Copy failed'; });
        });
        status.setAttribute('tabindex', '-1'); status.focus();
        return;
      }
      var btn = form.querySelector('[type=submit]'), label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      status.className = 'form-status'; status.textContent = '';
      var fd = new FormData(form); fd.append('_subject', subject); fd.append('page', location.pathname);
      fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          var name = (form.querySelector('[name=name]') || {}).value || '';
          status.className = 'form-status ok';
          status.textContent = 'Thanks' + (name ? ', ' + name.trim().split(' ')[0] : '') + '. Your message was sent to our team.';
          form.reset();
        })
        .catch(function (err) {
          status.className = 'form-status bad';
          status.innerHTML = 'We could not send your message (' + esc(err.message) + '). Please email <b>' + esc(to) + '</b> instead.';
        })
        .then(function () { btn.disabled = false; btn.textContent = label; status.setAttribute('tabindex', '-1'); status.focus(); });
    });
  });
})();

/* Credtech Solutions: one interactive set piece per page (markup in src/templates/fun.mjs). */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var hasIO = 'IntersectionObserver' in window;
  // Run fn once when el first scrolls into view (or straight away without IntersectionObserver).
  var onView = function (el, fn, margin) {
    if (!hasIO) { fn(); return; }
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: margin || '0px 0px -15% 0px' });
    io.observe(el);
  };
  // Track whether el is on screen, so off-screen loops can rest.
  var watch = function (el, cb) {
    if (!hasIO) { cb(true); return; }
    new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }).observe(el);
  };
  // rAF-throttled scroll and resize listener.
  var onScroll = function (fn) {
    var queued = false;
    var tick = function () { queued = false; fn(); };
    var q = function () { if (!queued) { queued = true; requestAnimationFrame(tick); } };
    addEventListener('scroll', q, { passive: true }); addEventListener('resize', q); fn();
  };
  var smooth = reduce ? 'auto' : 'smooth';

  /* ---------- Case studies + About: odometers ---------- */
  $$('.odo').forEach(function (o) { if (reduce) o.classList.add('on'); else onView(o, function () { o.classList.add('on'); }); });

  /* ---------- About: elevator ---------- */
  var car = $('#lift-car');
  if (car) {
    var liftCards = $$('.lift-card'), levels = $$('.lift-levels .lv').reverse(), liftNo = $('#lift-no'), floor = -1, doorT;
    var goFloor = function (f) {
      if (f === floor) return;
      floor = f;
      car.classList.remove('open');
      car.style.setProperty('--floor', f);
      liftNo.textContent = (f + 1 < 10 ? '0' : '') + (f + 1);
      levels.forEach(function (l, k) { l.classList.toggle('on', k === f); });
      liftCards.forEach(function (c, k) { c.classList.toggle('on', k === f); });
      clearTimeout(doorT); doorT = setTimeout(function () { car.classList.add('open'); }, reduce ? 0 : 1100);
    };
    onScroll(function () {
      var mid = innerHeight * 0.5, f = 0;
      liftCards.forEach(function (c, k) { if (c.getBoundingClientRect().top < mid) f = k; });
      goFloor(f);
    });
  }

  /* ---------- Service pages: metro line ---------- */
  var metro = $('#metro');
  if (metro) {
    var stops = $$('a[data-i]', metro), mCar = $('.metro-car', metro), mOl = $('ol', metro), active = -1;
    var targets = stops.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var place = function () {
      if (active < 0) return;
      var dot = stops[active].querySelector('i'), r = dot.getBoundingClientRect(), m = metro.getBoundingClientRect();
      var x = r.left - m.left - metro.clientLeft + r.width / 2 - mCar.offsetWidth / 2 - mCar.offsetLeft;
      var y = r.top - m.top - metro.clientTop + r.height / 2 - mCar.offsetHeight / 2 - mCar.offsetTop;
      mCar.style.setProperty('--cx', x.toFixed(1) + 'px'); mCar.style.setProperty('--cy', y.toFixed(1) + 'px');
    };
    var setStop = function (i) {
      if (i === active) return;
      active = i;
      stops.forEach(function (a, k) {
        a.classList.toggle('on', k === i); a.classList.toggle('done', k < i);
        if (k === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      });
      // In the horizontal (tablet and phone) layout, keep the active stop visible inside the line.
      if (mOl.scrollWidth > mOl.clientWidth + 2) {
        var a = stops[i], want = a.offsetLeft - (mOl.clientWidth - a.offsetWidth) / 2;
        mOl.scrollTo({ left: clamp(want, 0, mOl.scrollWidth - mOl.clientWidth), behavior: smooth });
      }
      place();
    };
    mOl.addEventListener('scroll', place, { passive: true });
    onScroll(function () {
      var line = innerHeight * 0.38, i = 0;
      targets.forEach(function (t, k) { if (t && t.getBoundingClientRect().top < line) i = k; });
      setStop(i); place();
    });
  }

  /* ---------- Campaigns: billboard tower ---------- */
  var ring = $('#pt-ring');
  if (ring) {
    var ptStage = $('#pt-stage'), faces = $$('.pt-face', ring), M = faces.length, stepA = 360 / M;
    var ptTitle = $('#pt-title'), ptChip = $('#pt-chip'), ptPlay = $('#pt-play');
    var ang = 0, vel = 0, target = null, auto = !reduce, hover = false, seen = true, drag = null, front = -1, resumeAt = 0, last = 0;
    var render = function () {
      ring.style.setProperty('--a', ang.toFixed(2) + 'deg');
      var f = ((Math.round(-ang / stepA) % M) + M) % M;
      if (f !== front) {
        front = f;
        faces.forEach(function (el, k) { el.classList.toggle('front', k === f); });
        ptTitle.textContent = faces[f].getAttribute('data-title');
        ptChip.textContent = faces[f].getAttribute('data-chip');
      }
    };
    var snapTo = function (a) { target = a; vel = 0; resumeAt = performance.now() + 3500; if (reduce) { ang = a; target = null; render(); } };
    var nearest = function () { return Math.round(ang / stepA) * stepA; };
    var setPt = function (on) {
      auto = on;
      ptPlay.textContent = on ? 'Pause' : 'Play';
      ptPlay.setAttribute('aria-pressed', String(!on));
      ptPlay.setAttribute('aria-label', on ? 'Pause the tower' : 'Play the tower');
    };
    setPt(auto);
    ptPlay.addEventListener('click', function () { setPt(!auto); if (!auto) snapTo(nearest()); });
    $('#pt-prev').addEventListener('click', function () { snapTo(nearest() + stepA); });
    $('#pt-next').addEventListener('click', function () { snapTo(nearest() - stepA); });
    ptStage.addEventListener('mouseenter', function () { hover = true; });
    ptStage.addEventListener('mouseleave', function () { hover = false; });
    faces.forEach(function (el, k) {
      // Keyboard: focusing a poster turns it to the front.
      el.addEventListener('focus', function () {
        var want = -k * stepA, turns = Math.round((ang - want) / 360);
        snapTo(want + turns * 360);
      });
    });
    ptStage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drag = { x: e.clientX, a: ang, t: performance.now(), moved: false, lastX: e.clientX };
      target = null; vel = 0;
    });
    addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; ptStage.classList.add('drag'); try { ptStage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
      if (!drag.moved) return;
      var now = performance.now(), dt = Math.max(1, now - drag.t);
      vel = ((e.clientX - drag.lastX) * 0.32) / dt * 16;
      drag.t = now; drag.lastX = e.clientX;
      ang = drag.a + dx * 0.32; render();
    });
    var endDrag = function () {
      if (!drag) return;
      var moved = drag.moved; drag = null; ptStage.classList.remove('drag');
      if (moved) { resumeAt = performance.now() + 3500; if (reduce || Math.abs(vel) < 0.4) snapTo(nearest()); }
      ptStage.dataset.moved = moved ? '1' : '';
    };
    addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
    // A drag should not count as a click on the poster under the pointer.
    ptStage.addEventListener('click', function (e) { if (ptStage.dataset.moved) { e.preventDefault(); ptStage.dataset.moved = ''; } }, true);
    watch(ptStage, function (v) { seen = v; });
    var loop = function (now) {
      var dt = Math.min(48, now - (last || now)); last = now;
      if (seen && !document.hidden && !drag) {
        if (target !== null) {
          ang += (target - ang) * Math.min(1, dt * 0.009);
          if (Math.abs(target - ang) < 0.05) { ang = target; target = null; }
        } else if (Math.abs(vel) > 0.02) {
          ang += vel * dt / 16; vel *= Math.pow(0.94, dt / 16);
          if (Math.abs(vel) <= 0.4) { vel = 0; snapTo(nearest()); }
        } else if (auto && !hover && now > resumeAt) {
          ang -= dt * 0.009; // about 9 degrees a second
        }
        render();
      }
      requestAnimationFrame(loop);
    };
    render();
    requestAnimationFrame(loop);
  }

  /* ---------- Campaigns: case study book ---------- */
  var book = $('#casebook');
  if (book) {
    book.classList.add('js');
    var bkPages = $('.bk-pages', book), spreads = $$('.bk-spread', book), BN = spreads.length;
    var marks = $$('.bk-mark', book), bkPlay = $('#bk-play'), bkBar = $('.bk-timer i', book), bkStatus = $('#bk-status');
    var bkCur = 0, bkBusy = false, bkOn = !reduce, bkHover = false, bkFocus = false, bkSeen = true, bkElapsed = 0, bkLast = 0;
    var DWELL = 6000, TURN = 1100;
    var singleMq = window.matchMedia ? matchMedia('(max-width:760px)') : { matches: false };
    var pgL = function (i) { return spreads[i].querySelector('.bk-l'); };
    var pgR = function (i) { return spreads[i].querySelector('.bk-r'); };
    var showPages = function (list) {
      spreads.forEach(function (sp) { $$('.bk-page', sp).forEach(function (p) { p.classList.toggle('vis', list.indexOf(p) > -1); }); });
    };
    var settle = function () {
      showPages([pgL(bkCur), pgR(bkCur)]);
      spreads.forEach(function (sp, k) { var on = k === bkCur; sp.inert = !on; sp.setAttribute('aria-hidden', String(!on)); });
      marks.forEach(function (m, k) { m.classList.toggle('on', k === bkCur); m.setAttribute('aria-pressed', String(k === bkCur)); });
      // On phones the bookmarks scroll sideways: keep the open one in view.
      var row = marks[0] && marks[0].parentNode, m = marks[bkCur];
      if (row && m && row.scrollWidth > row.clientWidth + 2) row.scrollTo({ left: Math.max(0, m.offsetLeft - (row.clientWidth - m.offsetWidth) / 2), behavior: smooth });
    };
    var face = function (src, side) {
      var f = document.createElement('div');
      f.className = 'bk-face ' + side;
      if (src) { var c = src.cloneNode(true); c.removeAttribute('role'); c.removeAttribute('aria-label'); c.removeAttribute('aria-hidden'); c.inert = false; f.appendChild(c); } else f.classList.add('blank');
      return f;
    };
    // One leaf turns over the spine. Forward: the right page lifts and lands as the next left page.
    var turnTo = function (to, dir) {
      if (bkBusy || to === bkCur) return;
      var from = bkCur; bkCur = to; bkElapsed = 0;
      var hadFocus = spreads[from].contains(document.activeElement);
      var refocus = function () { if (hadFocus) pgR(to).querySelector('.bk-go').focus({ preventScroll: true }); };
      bkStatus.textContent = spreads[to].getAttribute('aria-label');
      if (reduce) { settle(); refocus(); return; }
      var one = singleMq.matches, leaf = document.createElement('div');
      leaf.className = 'bk-leaf'; leaf.setAttribute('aria-hidden', 'true'); leaf.inert = true;
      if (dir > 0) {
        leaf.appendChild(face(one ? spreads[from] : pgR(from), 'a')); leaf.appendChild(face(one ? null : pgL(to), 'b'));
        showPages(one ? [pgL(to), pgR(to)] : [pgL(from), pgR(to)]);
      } else {
        leaf.appendChild(face(one ? spreads[to] : pgR(to), 'a')); leaf.appendChild(face(one ? null : pgL(from), 'b'));
        showPages(one ? [pgL(from), pgR(from)] : [pgL(to), pgR(from)]);
      }
      leaf.style.transform = 'rotateY(' + (dir > 0 ? 0 : -180) + 'deg)';
      bkPages.appendChild(leaf);
      bkBusy = true;
      void leaf.offsetWidth;
      leaf.classList.add('go');
      leaf.style.transform = 'rotateY(' + (dir > 0 ? -180 : 0) + 'deg)';
      var finished = false;
      var end = function () { if (finished) return; finished = true; leaf.remove(); bkBusy = false; settle(); refocus(); };
      leaf.addEventListener('transitionend', function (e) { if (e.target === leaf) end(); });
      setTimeout(end, TURN + 250);
    };
    var bkNext = function () { turnTo((bkCur + 1) % BN, 1); };
    var bkPrev = function () { turnTo((bkCur - 1 + BN) % BN, -1); };
    var setBook = function (on) {
      bkOn = on;
      bkPlay.textContent = on ? 'Pause' : 'Play';
      bkPlay.setAttribute('aria-pressed', String(!on));
      bkPlay.setAttribute('aria-label', on ? 'Pause the page turning' : 'Turn the pages automatically');
      bkStatus.setAttribute('aria-live', on ? 'off' : 'polite');
    };
    setBook(bkOn); settle();
    $('#bk-next').addEventListener('click', bkNext);
    $('#bk-prev').addEventListener('click', bkPrev);
    bkPlay.addEventListener('click', function () { setBook(!bkOn); });
    marks.forEach(function (m, k) { m.addEventListener('click', function () { if (k !== bkCur) turnTo(k, k > bkCur ? 1 : -1); }); });
    bkPages.addEventListener('mouseenter', function () { bkHover = true; });
    bkPages.addEventListener('mouseleave', function () { bkHover = false; });
    book.addEventListener('focusin', function (e) { bkFocus = !!(e.target.closest && e.target.closest('.bk-pages')); });
    book.addEventListener('focusout', function () { bkFocus = false; });
    book.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); bkNext(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); bkPrev(); }
    });
    // Page corners and swipes turn the page too.
    var sx = null, sy = 0, swiped = false;
    bkPages.addEventListener('click', function (e) {
      if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; return; }
      var c = e.target.closest && e.target.closest('.bk-corner');
      if (c) { if (c.classList.contains('nx')) bkNext(); else bkPrev(); }
    }, true);
    bkPages.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
    bkPages.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { swiped = true; setTimeout(function () { swiped = false; }, 400); if (dx < 0) bkNext(); else bkPrev(); }
    });
    bkPages.addEventListener('pointercancel', function () { sx = null; });
    if (singleMq.addEventListener) singleMq.addEventListener('change', settle); else if (singleMq.addListener) singleMq.addListener(settle);
    watch(book, function (v) { bkSeen = v; });
    var bkLoop = function (now) {
      var dt = Math.min(64, now - (bkLast || now)); bkLast = now;
      if (bkOn && !bkHover && !bkFocus && bkSeen && !bkBusy && !document.hidden) {
        bkElapsed += dt;
        if (bkElapsed >= DWELL) bkNext();
      }
      bkBar.style.transform = 'scaleX(' + Math.min(1, bkElapsed / DWELL).toFixed(4) + ')';
      requestAnimationFrame(bkLoop);
    };
    requestAnimationFrame(bkLoop);
  }

  /* ---------- Campaigns: the big screen ---------- */
  var scr = $('#bigscreen');
  if (scr) {
    scr.classList.add('js');
    var slides = $$('.scr-slide', scr), SN = slides.length, thumbs = $$('.scr-thumb', scr), reel = $('.scr-reel', scr);
    var sPlay = $('#scr-play'), sBar = $('.scr-bar i', scr), sStatus = $('#scr-status'), sFrame = $('.scr-frame', scr);
    var sCur = -1, sOn = !reduce, sHover = false, sFocus = false, sSeen = true, sEl = 0, sLast = 0, SDWELL = 5000;
    var showSlide = function (i, zap) {
      i = ((i % SN) + SN) % SN;
      if (i === sCur) { sEl = 0; return; }
      var had = sCur > -1 && slides[sCur].contains(document.activeElement);
      sCur = i; sEl = 0;
      slides.forEach(function (sl, k) { var on = k === i; sl.classList.toggle('on', on); sl.inert = !on; sl.setAttribute('aria-hidden', String(!on)); });
      thumbs.forEach(function (t, k) { t.classList.toggle('on', k === i); t.setAttribute('aria-pressed', String(k === i)); });
      if (zap && !reduce) { scr.classList.remove('zap'); void scr.offsetWidth; scr.classList.add('zap'); }
      sStatus.textContent = slides[i].getAttribute('aria-label');
      if (reel.scrollWidth > reel.clientWidth + 2) {
        var t = thumbs[i]; reel.scrollTo({ left: Math.max(0, t.offsetLeft - (reel.clientWidth - t.offsetWidth) / 2), behavior: smooth });
      }
      if (had) slides[i].querySelector('.scr-go').focus({ preventScroll: true });
    };
    var setScr = function (on) {
      sOn = on;
      sPlay.textContent = on ? 'Pause' : 'Play';
      sPlay.setAttribute('aria-pressed', String(!on));
      sPlay.setAttribute('aria-label', on ? 'Pause the screen' : 'Play the screen');
      sStatus.setAttribute('aria-live', on ? 'off' : 'polite');
    };
    // Links to #c-<campaign> (the billboard tower, the homepage) put that campaign on air.
    var fromHash = function (h) {
      h = (h || '').replace(/^#/, '');
      for (var k = 0; k < SN; k++) if (slides[k].id === h) return k;
      return -1;
    };
    setScr(sOn);
    var startAt = fromHash(location.hash);
    showSlide(startAt > -1 ? startAt : 0, false);
    addEventListener('hashchange', function () { var k = fromHash(location.hash); if (k > -1) showSlide(k, true); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#c-"]');
      if (!a || a.pathname !== location.pathname) return;
      var k = fromHash(a.hash); if (k > -1) showSlide(k, true);
    });
    $('#scr-next').addEventListener('click', function () { showSlide(sCur + 1, true); });
    $('#scr-prev').addEventListener('click', function () { showSlide(sCur - 1, true); });
    sPlay.addEventListener('click', function () { setScr(!sOn); });
    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { showSlide(k, true); }); });
    // Pointing at or tabbing into the screen holds the campaign, so its button is always safe to click.
    sFrame.addEventListener('mouseenter', function () { sHover = true; });
    sFrame.addEventListener('mouseleave', function () { sHover = false; });
    sFrame.addEventListener('focusin', function () { sFocus = true; });
    sFrame.addEventListener('focusout', function () { sFocus = false; });
    scr.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); showSlide(sCur + 1, true); } else if (e.key === 'ArrowLeft') { e.preventDefault(); showSlide(sCur - 1, true); }
    });
    var tx = null, ty = 0, tSwiped = false;
    sFrame.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { tx = e.clientX; ty = e.clientY; } });
    sFrame.addEventListener('pointerup', function (e) {
      if (tx === null) return;
      var dx = e.clientX - tx, dy = e.clientY - ty; tx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { tSwiped = true; setTimeout(function () { tSwiped = false; }, 400); showSlide(sCur + (dx < 0 ? 1 : -1), true); }
    });
    sFrame.addEventListener('pointercancel', function () { tx = null; });
    sFrame.addEventListener('click', function (e) { if (tSwiped) { e.preventDefault(); e.stopPropagation(); tSwiped = false; } }, true);
    watch(scr, function (v) { sSeen = v; });
    var sLoop = function (now) {
      var dt = Math.min(64, now - (sLast || now)); sLast = now;
      if (sOn && !sHover && !sFocus && sSeen && !document.hidden) {
        sEl += dt;
        if (sEl >= SDWELL) showSlide(sCur + 1, true);
      }
      sBar.style.transform = 'scaleX(' + Math.min(1, sEl / SDWELL).toFixed(4) + ')';
      requestAnimationFrame(sLoop);
    };
    requestAnimationFrame(sLoop);
  }

  /* ---------- Clients: logo orbit ---------- */
  var orbit = $('#orbit');
  if (orbit) {
    var oScale = $('.orbit-scale', orbit), oItems = $$('.orbit-item', orbit), oAng = 0, oHold = false, oSeen = true, oLast = 0;
    var oCompact = false;
    var oFit = function () {
      // Narrow columns use smaller rings so the logos stay a readable size.
      oCompact = orbit.clientWidth < 560;
      orbit.classList.toggle('compact', oCompact);
      var s = Math.min(1, orbit.clientWidth / (oCompact ? 490 : 700));
      oScale.style.setProperty('--s', s.toFixed(3)); oScale.style.height = Math.round((oCompact ? 330 : 440) * s) + 'px';
    };
    var oRender = function () {
      oItems.forEach(function (el) {
        var r = +el.getAttribute('data-ring'), k = +el.getAttribute('data-k'), n = +el.getAttribute('data-n');
        var R = oCompact ? (r === 1 ? 125 : 195) : (r === 1 ? 180 : 280), t = (k / n) * 360 + (r === 2 ? 180 / n : 0) + (r === 1 ? oAng : oAng * 0.6);
        el.style.transform = 'rotateX(66deg) rotateZ(' + t.toFixed(2) + 'deg) translateX(' + R + 'px) rotateZ(' + (-t).toFixed(2) + 'deg) rotateX(-66deg)';
        // Logos on the far side of the planet fade back a little.
        el.style.opacity = (0.5 + 0.5 * (Math.sin(t * Math.PI / 180) + 1) / 2).toFixed(3);
      });
    };
    oFit(); addEventListener('resize', function () { oFit(); oRender(); }); oRender();
    orbit.addEventListener('mouseenter', function () { oHold = true; });
    orbit.addEventListener('mouseleave', function () { oHold = false; });
    orbit.addEventListener('focusin', function () { oHold = true; });
    orbit.addEventListener('focusout', function () { oHold = false; });
    watch(orbit, function (v) { oSeen = v; });
    if (!reduce) {
      var oLoop = function (now) {
        var dt = Math.min(48, now - (oLast || now)); oLast = now;
        if (oSeen && !oHold && !document.hidden) { oAng += dt * 0.012; oRender(); }
        requestAnimationFrame(oLoop);
      };
      requestAnimationFrame(oLoop);
    }
  }

  /* ---------- Plans: skyline ---------- */
  var sky = $('#sky');
  if (sky) {
    if (reduce) sky.classList.add('built'); else onView(sky, function () { sky.classList.add('built'); }, '0px');
    $$('.sky-tower', sky).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-plan'), el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: smooth, block: 'center' });
        if (window.__flash) window.__flash('#' + id);
      });
    });
  }

  /* ---------- Blog posts: reading rocket ---------- */
  var rocket = $('#rocket'), postBody = $('#post-body');
  if (rocket && postBody) {
    var pct = $('.rk-pct', rocket);
    onScroll(function () {
      var r = postBody.getBoundingClientRect();
      var p = clamp((innerHeight * 0.8 - r.top) / Math.max(1, r.height), 0, 1);
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) p = 1;
      rocket.style.setProperty('--p', p.toFixed(4));
      pct.textContent = Math.round(p * 100) + '%';
      rocket.classList.toggle('landed', p >= 0.995);
    });
  }

  /* ---------- Contact: signal tower ---------- */
  var signal = $('#signal'), audit = $('#audit');
  if (signal && audit) {
    var bars = $$('.sig-bars i', signal), sigText = $('#sig-text'), sigStage = $('.sig-stage', signal), lastN = 0;
    var names = ['name', 'email', 'phone', 'company', 'message'];
    var words = ['Fill in the form to boost the signal.', 'Signal found. Keep going.', 'Signal getting stronger.', 'Strong signal.', 'Almost there.', 'Full signal. Ready to send.'];
    var ok = function (el) {
      if (!el) return false;
      var v = el.value.trim();
      if (!v) return false;
      if (el.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (el.type === 'tel') return v.replace(/\D/g, '').length >= 7;
      return true;
    };
    var burst = function () {
      if (reduce) return;
      var s = document.createElement('span'); s.className = 'sig-ring burst'; s.setAttribute('aria-hidden', 'true');
      sigStage.appendChild(s);
      setTimeout(function () { s.remove(); }, 1300);
    };
    var measure = function () {
      var n = names.filter(function (nm) { return ok(audit.querySelector('[name="' + nm + '"]')); }).length;
      bars.forEach(function (b, k) { b.classList.toggle('on', k < n); });
      if (n !== lastN) { sigText.textContent = words[n]; if (n > lastN) burst(); lastN = n; }
    };
    audit.addEventListener('input', measure); audit.addEventListener('change', measure);
    measure();
  }

  /* ---------- Schedule: split-flap board ---------- */
  var board = $('#board');
  if (board) {
    var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var clock = $('#bd-clock');
    var tickClock = function () {
      var d = new Date();
      clock.textContent = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    };
    tickClock(); setInterval(tickClock, 15000);
    var setCell = function (cell, c) { cell.textContent = c === ' ' ? ' ' : c; };
    // Flip one cell through a few random letters before it lands on its character.
    var flipTo = function (cell, c, delay) {
      if (reduce) { setCell(cell, c); return; }
      var n = 4 + Math.floor(Math.random() * 6), k = 0;
      setTimeout(function step() {
        cell.classList.remove('flip'); void cell.offsetWidth; cell.classList.add('flip');
        if (k++ < n) { setCell(cell, CH[Math.floor(Math.random() * CH.length)]); setTimeout(step, 70); }
        else { setCell(cell, c); setTimeout(function () { cell.classList.remove('flip'); }, 100); }
      }, delay);
    };
    var writeRow = function (cells, text, base) {
      var s = text.toUpperCase();
      cells.forEach(function (cell, i) { flipTo(cell, s[i] || ' ', (base || 0) + i * 35); });
    };
    var allRows = $$('.bd-rows li', board);
    onView(board, function () {
      allRows.forEach(function (li, r) {
        $$('.fl', li).forEach(function (cell, i) { flipTo(cell, cell.getAttribute('data-c'), r * 260 + i * 30); });
      });
    }, '0px');
    var stat = $$('.bd-c2', board).map(function (c) { return { el: c, cells: $$('.fl', c), a: $$('.fl', c).map(function (f) { return f.getAttribute('data-c'); }).join('').trim(), b: c.getAttribute('data-alt'), showB: false }; });
    var bdSeen = true; watch(board, function (v) { bdSeen = v; });
    if (!reduce) setInterval(function () {
      if (!bdSeen || document.hidden) return;
      stat.forEach(function (s, r) { if (s.b && s.b.toUpperCase() !== s.a.toUpperCase()) { s.showB = !s.showB; writeRow(s.cells, s.showB ? s.b : s.a, r * 220); } });
    }, 6000);
  }

  /* ---------- Careers: balloons ---------- */
  var balloonsBox = $('#balloons');
  if (balloonsBox) {
    var roleSel = $('#apply-role'), blNote = $('#bl-note'), applyForm = $('#apply');
    var bls = $$('.balloon', balloonsBox);
    bls.forEach(function (b) {
      b.addEventListener('click', function () {
        var role = b.getAttribute('data-role');
        bls.forEach(function (o) { o.classList.toggle('pick', o === b); });
        if (roleSel) { roleSel.value = role; roleSel.dispatchEvent(new Event('change', { bubbles: true })); }
        blNote.textContent = role + ' chosen. The form below is ready for you.';
        if (!reduce) { b.classList.add('lift'); setTimeout(function () { b.classList.remove('lift'); }, 2600); }
        if (applyForm) setTimeout(function () {
          applyForm.scrollIntoView({ behavior: smooth, block: 'start' });
          var first = applyForm.querySelector('[name="name"]'); if (first) first.focus({ preventScroll: true });
        }, reduce ? 0 : 900);
      });
    });
    if (roleSel) roleSel.addEventListener('change', function () { bls.forEach(function (o) { o.classList.toggle('pick', o.getAttribute('data-role') === roleSel.value); }); });
  }

  /* ---------- Privacy: vault dial ---------- */
  var dial = $('#vt-dial'), policy = $('#policy-body');
  if (dial && policy) {
    onScroll(function () {
      var r = policy.getBoundingClientRect();
      var p = clamp((innerHeight * 0.8 - r.top) / Math.max(1, r.height), 0, 1);
      dial.style.setProperty('--rot', (p * 720).toFixed(1) + 'deg');
    });
  }
})();

/* Credtech Solutions: phone sliders. On screens 640 px and narrower, card grids marked .m-slide
   scroll sideways (CSS). This adds dots, highlights the card in front and nudges once to show it swipes. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mq = window.matchMedia ? matchMedia('(max-width:640px)') : { matches: false };
  [].slice.call(document.querySelectorAll('.m-slide')).forEach(function (sl) {
    var items = [].slice.call(sl.children);
    if (items.length < 2) return;
    sl.classList.add('js');
    var dots = document.createElement('div');
    dots.className = 'm-dots'; dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = items.map(function (_, k) { return '<button type="button" tabindex="-1" data-k="' + k + '"></button>'; }).join('') + '<span class="m-hint">Swipe <i>&rarr;</i></span>';
    sl.parentNode.insertBefore(dots, sl.nextSibling);
    var dotEls = [].slice.call(dots.querySelectorAll('button')), cur = -1, queued = false, touched = false, nudging = false;
    var pad = function () { return parseFloat(getComputedStyle(sl).paddingLeft) || 0; };
    var update = function () {
      queued = false;
      if (!mq.matches) { items.forEach(function (it) { it.classList.remove('m-on'); }); cur = -1; return; }
      var x = sl.scrollLeft, p = pad(), best = 0, bd = Infinity;
      if (x >= sl.scrollWidth - sl.clientWidth - 4) best = items.length - 1;
      else items.forEach(function (it, k) { var d = Math.abs(it.offsetLeft - p - x); if (d < bd) { bd = d; best = k; } });
      if (best === cur) return;
      cur = best;
      items.forEach(function (it, k) { it.classList.toggle('m-on', k === best); });
      dotEls.forEach(function (d, k) { d.classList.toggle('on', k === best); });
    };
    var q = function () { if (!queued) { queued = true; requestAnimationFrame(update); } };
    sl.addEventListener('scroll', function () { q(); if (!touched && !nudging && sl.scrollLeft > 30) { touched = true; dots.classList.add('used'); } }, { passive: true });
    sl.addEventListener('pointerdown', function () { touched = true; if (nudging) { sl.style.scrollSnapType = ''; nudging = false; } });
    addEventListener('resize', q);
    if (mq.addEventListener) mq.addEventListener('change', q); else if (mq.addListener) mq.addListener(q);
    dotEls.forEach(function (d, k) {
      d.addEventListener('click', function () { sl.scrollTo({ left: items[k].offsetLeft - pad(), behavior: reduce ? 'auto' : 'smooth' }); });
    });
    // Keyboard and in-page links: bring a focused or targeted card into view.
    sl.addEventListener('focusin', function (e) {
      var it = items.filter(function (i) { return i.contains(e.target); })[0];
      if (it && mq.matches) sl.scrollTo({ left: it.offsetLeft - pad(), behavior: reduce ? 'auto' : 'smooth' });
    });
    update();
    // Show once that the row swipes: a small nudge the first time it comes into view.
    if (!reduce && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting || !mq.matches) return;
        io.disconnect();
        if (touched || sl.scrollLeft > 0) return;
        setTimeout(function () {
          if (touched) return;
          // Snapping would cancel a small scroll, so it is switched off for the nudge.
          nudging = true; sl.style.scrollSnapType = 'none';
          sl.scrollTo({ left: 56, behavior: 'smooth' });
          setTimeout(function () {
            if (!touched) sl.scrollTo({ left: 0, behavior: 'smooth' });
            setTimeout(function () { sl.style.scrollSnapType = ''; nudging = false; }, 500);
          }, 550);
        }, 350);
      }, { threshold: 0.6 });
      io.observe(sl);
    }
  });
})();
