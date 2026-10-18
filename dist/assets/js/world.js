/* Credtech City: the homepage WebGL scene from the design prototype.
   Each homepage section parks the camera at one landmark: planet, signal tower, service ring,
   poster boulevard, results wall, client orbit, plan towers, skyline.
   Content (services, posters, results, logos, plans) comes from #world-data, built from /content. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const DATA = JSON.parse(document.getElementById('world-data').textContent);
const canvas = document.getElementById('world');
const nav = navigator;
// Data-saver mode or very low-memory devices get the static image instead of the 3D city.
const lowEnd = Boolean((nav.connection && nav.connection.saveData) || (nav.deviceMemory && nav.deviceMemory < 2));
let renderer = null;
if (!lowEnd) {
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { renderer = null; }
}
if (renderer) build(); else document.body.classList.add('no-webgl');

function build() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let motion = reduce.matches ? 0 : 1;
  const isSmall = () => innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall() ? 1.3 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030716);
  scene.fog = new THREE.FogExp2(0x061033, 0.0078);
  // Phones get a wider lens so the city sits further back and looks smaller behind the text.
  const camera = new THREE.PerspectiveCamera(isSmall() ? 80 : 48, innerWidth / innerHeight, 0.1, 1600);

  scene.add(new THREE.HemisphereLight(0x8aa6ff, 0x0b0a24, 1.0));
  const sun = new THREE.DirectionalLight(0xc4dcff, 1.1); sun.position.set(-40, 90, 50); scene.add(sun);

  const loader = new THREE.TextureLoader();
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  let dirty = true; // redraw request for on-demand rendering when motion is reduced
  const tex = (src) => { const t = loader.load(src, () => { dirty = true; }); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t; };
  const canvasTex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t; };
  const clickables = [];
  const tick = [];
  const add = (o, p) => { (p || scene).add(o); return o; };

  /* ---- sky, stars, ground ---- */
  add(new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vP,1.); }',
    fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 top = vec3(.006,.012,.04); vec3 hor = vec3(.05,.10,.36); vec3 c = mix(hor, top, smoothstep(-.02,.5,h)); c += vec3(.20,.08,.38)*pow(1.-abs(h),10.)*.55; gl_FragColor = vec4(c,1.); }'
  })));
  {
    const n = 1600, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * .9 + .1), r = 900;
      p[i*3] = r * Math.sin(ph) * Math.cos(th); p[i*3+1] = r * Math.cos(ph) + 20; p[i*3+2] = r * Math.sin(ph) * Math.sin(th) - 150; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbfd6ff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: .8 })));
  }
  const ground = add(new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshStandardMaterial({ color: 0x050c26, roughness: .38, metalness: .7 })));
  ground.rotation.x = -Math.PI / 2; ground.position.z = -150;
  const grid = add(new THREE.GridHelper(1600, 320, 0x2d64ff, 0x16348f)); grid.position.set(0, .03, -150);
  grid.material.transparent = true; grid.material.opacity = .3; grid.material.depthWrite = false;

  /* ---- the journey road ---- */
  const stripMat = new THREE.MeshBasicMaterial({ color: 0x4fb4ff });
  for (const x of [-5.5, 5.5]) { const s = add(new THREE.Mesh(new THREE.PlaneGeometry(.22, 420), stripMat)); s.rotation.x = -Math.PI/2; s.position.set(x, .05, -130); }
  const dashes = add(new THREE.InstancedMesh(new THREE.PlaneGeometry(.3, 2.6), new THREE.MeshBasicMaterial({ color: 0xbfeaff }), 70));
  const dObj = new THREE.Object3D(), dashZ = [];
  for (let i = 0; i < 70; i++) dashZ.push(80 - i * 6);
  tick.push((t, dt) => { for (let i = 0; i < 70; i++) { dashZ[i] -= dt * 14 * motion; if (dashZ[i] < -340) dashZ[i] += 420;
    dObj.position.set(0, .06, dashZ[i]); dObj.rotation.set(-Math.PI/2, 0, 0); dObj.updateMatrix(); dashes.setMatrixAt(i, dObj.matrix); } dashes.instanceMatrix.needsUpdate = true; });

  /* ---- city ---- */
  const win = document.createElement('canvas'); win.width = 64; win.height = 256;
  { const g = win.getContext('2d'); g.fillStyle = '#060b22'; g.fillRect(0, 0, 64, 256);
    for (let y = 3; y < 256; y += 7) for (let x = 3; x < 64; x += 7) { const r = Math.random(); if (r < .3) { g.globalAlpha = .35 + Math.random() * .55; g.fillStyle = r < .05 ? '#ffd9a0' : r < .2 ? '#8fd0ff' : '#3a6dff'; g.fillRect(x, y, 4, 4); } } }
  const winTex = canvasTex(win); winTex.magFilter = THREE.NearestFilter;
  const bMat = new THREE.MeshStandardMaterial({ color: 0x0c1640, roughness: .5, metalness: .55, emissive: 0xffffff, emissiveMap: winTex, emissiveIntensity: .85 });
  const bGeo = new THREE.BoxGeometry(1, 1, 1); bGeo.translate(0, .5, 0);
  const keepOut = [ { x: -34, z: -8, r: 18 }, { x: 0, z: -80, r: 30 }, { x: 0, z: -212, r: 26 }, { x: 0, z: -248, r: 22 }, { x: 0, z: -292, r: 26 } ];
  const N = isSmall() ? 190 : 320, city = add(new THREE.InstancedMesh(bGeo, bMat, N)), tops = [];
  { let k = 0, tries = 0; const o = new THREE.Object3D();
    while (k < N && tries++ < 8000) {
      const z = 100 - Math.random() * 470, side = Math.random() < .5 ? -1 : 1, x = side * (11 + Math.pow(Math.random(), 1.3) * 140);
      if (keepOut.some(q => Math.hypot(x - q.x, z - q.z) < q.r)) continue;
      if (Math.abs(x) < 24 && z < -100 && z > -196) continue;
      if (z > -50 && Math.abs(x) < 34) continue;
      const near = Math.abs(x) < 45;
      const w = 3 + Math.random() * 6, d = 3 + Math.random() * 6, h = 4 + Math.pow(Math.random(), 2.1) * (near ? 20 : 46) + Math.min(Math.abs(x) / 5, 14);
      o.position.set(x, 0, z); o.scale.set(w, h, d); o.updateMatrix(); city.setMatrixAt(k++, o.matrix);
      if (Math.random() < .55) tops.push(x, h + .7, z);
    }
    city.count = k; }
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(tops, 3));
    const beacons = add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x7fd8ff, size: .9, transparent: true })));
    tick.push(t => { beacons.material.opacity = .55 + .45 * Math.sin(t * 2.2 * (motion || 0)); }); }

  /* ---- the planet (hero landmark) ---- */
  const planet = add(new THREE.Group()); planet.position.set(26, 44, -48); planet.scale.setScalar(1.25);
  { const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#a8d6ff'); gr.addColorStop(.22, '#3b7dff'); gr.addColorStop(.52, '#0139B7'); gr.addColorStop(.8, '#16207a'); gr.addColorStop(1, '#050b30');
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 160; i++) { g.globalAlpha = Math.random() * .14; g.fillStyle = Math.random() < .5 ? '#cfe8ff' : '#0a1a5c'; g.fillRect(0, Math.random() * 512, 1024, 2 + Math.random() * 16); }
    for (let i = 0; i < 70; i++) { g.globalAlpha = Math.random() * .16; g.fillStyle = '#8fd0ff'; g.beginPath(); g.ellipse(Math.random() * 1024, Math.random() * 512, 20 + Math.random() * 100, 5 + Math.random() * 18, 0, 0, 7); g.fill(); }
    const globe = add(new THREE.Mesh(new THREE.SphereGeometry(10, 64, 48), new THREE.MeshStandardMaterial({ map: canvasTex(c), emissive: 0x1a4dff, emissiveMap: canvasTex(c), emissiveIntensity: .55, roughness: .5, metalness: .15 })), planet);
    tick.push((t, dt) => { globe.rotation.y += dt * .05 * motion; }); }
  add(new THREE.Mesh(new THREE.SphereGeometry(12.4, 64, 48), new THREE.ShaderMaterial({ transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying vec3 vN; void main(){ float i = pow(.72 - dot(vN, vec3(0.,0.,1.)), 3.); gl_FragColor = vec4(vec3(.25,.6,1.)*i*.85, 1.); }' })), planet);
  const ringG = add(new THREE.Group(), planet); ringG.rotation.set(1.22, .18, -.32);
  add(new THREE.Mesh(new THREE.TorusGeometry(16, .3, 16, 260), new THREE.MeshBasicMaterial({ color: 0x5fb8f0 })), ringG);
  add(new THREE.Mesh(new THREE.TorusGeometry(18.6, .12, 12, 260), new THREE.MeshBasicMaterial({ color: 0x9a8cff })), ringG);
  const moons = [];
  for (let i = 0; i < 3; i++) { const m = add(new THREE.Mesh(new THREE.SphereGeometry(i ? .9 : 1.4, 32, 24), new THREE.MeshStandardMaterial({ color: i === 1 ? 0xb7a8ff : 0x9fdcff, emissive: i === 1 ? 0x6a4dff : 0x3BA7FF, emissiveIntensity: .9 })), ringG); moons.push([m, i * 2.1, i ? 18.6 : 16]); }
  tick.push((t) => { moons.forEach(([m, ph, r], i) => { const a = t * (.25 + i * .07) * motion + ph; m.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); }); });

  /* ---- camera stops, one per section ---- */
  const stops = [
    [[-6, 20, 72], [6, 28, -20]],
    [[-8, 17, 24], [-24, 19, -10]],
    [[9, 10.5, -53], [-5, 8, -80]],
    [[0, 7.5, -100], [0, 10, -150]],
    [[0, 9.5, -184], [0, 9.5, -214]],
    [[17, 14, -224], [2, 10, -248]],
    [[0, 13, -263], [0, 6, -292]],
    [[-46, 64, -330], [0, 8, -170]]];
  const pathPts = new THREE.CatmullRomCurve3(stops.map(s => new THREE.Vector3(...s[0])), false, 'centripetal').getPoints(220);
  const nearPath = v => pathPts.some(q => q.distanceTo(v) < 13);

  /* ---- floating social icons (tap to pop) ---- */
  const glyphs = [['♥', '#ff4f7b'], ['#', '#2f7bff'], ['▶', '#ff3b3b'], ['@', '#12b36b'], ['★', '#f5a400'], ['✓', '#0ea5e9'], ['+1', '#6a4dff'], ['♥', '#ff4f7b']];
  const glyphTex = (ch, col) => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#dfe8ff'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.fillStyle = col; g.font = '800 150px Sora, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 128, 140); return canvasTex(c); };
  const tokGeo = new RoundedBoxGeometry(2.4, 2.4, .8, 4, .42), tokens = [];
  const tokCount = isSmall() ? 18 : 34;
  for (let i = 0; i < tokCount; i++) {
    const [ch, col] = glyphs[i % glyphs.length];
    const m = add(new THREE.Mesh(tokGeo, new THREE.MeshStandardMaterial({ map: glyphTex(ch, col), roughness: .3, metalness: .05, emissive: 0x2a3b80, emissiveIntensity: .35, transparent: true })));
    let base, tries = 0;
    do { const z = 60 - (i / tokCount) * 380 + (Math.random() - .5) * 14, side = i % 2 ? 1 : -1; base = new THREE.Vector3(side * (8 + Math.random() * 14), 5 + Math.random() * 16, z); } while (nearPath(base) && ++tries < 40);
    m.userData = { kind: 'token', base, ph: Math.random() * 6.3, sp: .6 + Math.random() * .6, pop: 0 };
    m.position.copy(m.userData.base); m.rotation.set(Math.random(), Math.random() * 6, Math.random() * .4);
    tokens.push(m); clickables.push(m);
  }
  tick.push((t, dt) => { tokens.forEach(m => { const u = m.userData;
    if (u.pop > 0) { u.pop += dt; const k = u.pop; m.scale.setScalar(1 + k * 3); m.material.opacity = Math.max(0, 1 - k * 2.2); if (k > 2.6) { u.pop = 0; m.scale.setScalar(1); m.material.opacity = 1; } }
    m.position.y = u.base.y + Math.sin(t * u.sp + u.ph) * .9 * motion; m.rotation.y += dt * .55 * motion; m.rotation.x = Math.sin(t * .4 + u.ph) * .25 * motion; }); });
  let likes = 0; const likesEl = document.getElementById('likes');
  const floaters = [];
  const plusTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); g.font = '800 84px Sora, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#9fe3ff'; g.fillText('+1 ♥', 128, 66); return canvasTex(c); })();
  function popToken(m) { if (m.userData.pop > 0) return; m.userData.pop = .001; likes++; if (likesEl) likesEl.textContent = likes;
    const s = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: plusTex, transparent: true, depthWrite: false }))); s.scale.set(4, 2, 1); s.position.copy(m.position); floaters.push([s, 0]); }
  tick.push((t, dt) => { for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f[1] += dt; f[0].position.y += dt * 4; f[0].material.opacity = 1 - f[1] / 1.4; if (f[1] > 1.4) { scene.remove(f[0]); floaters.splice(i, 1); } } });

  /* ---- 1: signal tower + audience network ---- */
  const net = add(new THREE.Group()); net.position.set(-34, 0, -8);
  { const tower = add(new THREE.Mesh(new THREE.CylinderGeometry(.7, 1.6, 12, 16), new THREE.MeshStandardMaterial({ color: 0x0d1a4d, metalness: .7, roughness: .3, emissive: 0x0a2a9a, emissiveIntensity: .4 })), net); tower.position.y = 6;
    const mast = add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 6, 8), new THREE.MeshBasicMaterial({ color: 0x9fe3ff })), net); mast.position.y = 15;
    const tip = add(new THREE.Mesh(new THREE.SphereGeometry(.5, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff4f7b })), net); tip.position.y = 18.2;
    const rings = [];
    for (let i = 0; i < 3; i++) { const r = add(new THREE.Mesh(new THREE.RingGeometry(.95, 1.1, 96), new THREE.MeshBasicMaterial({ color: 0x5ad1ff, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })), net); r.rotation.x = -Math.PI / 2; r.position.y = 12.2; rings.push(r); }
    tick.push(t => { rings.forEach((r, i) => { const k = ((t * .45 * (motion || .2) + i / 3) % 1); r.scale.setScalar(1 + k * 16); r.material.opacity = (1 - k) * .9; }); });
    const n = 54, pts = [], C = new THREE.Vector3(0, 22, 0);
    for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.399963; pts.push(new THREE.Vector3(Math.cos(th) * rr, y * .75, Math.sin(th) * rr).multiplyScalar(10).add(C).add(new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).multiplyScalar(1.6))); }
    const edges = [], seg = [];
    pts.forEach((p, i) => { pts.map((q, j) => [j, p.distanceTo(q)]).filter(a => a[0] !== i).sort((a, b) => a[1] - b[1]).slice(0, 3).forEach(([j]) => { if (i < j) { edges.push([i, j]); seg.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z); } }); });
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x4f9dff, transparent: true, opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false })), net);
    const nodeMesh = add(new THREE.InstancedMesh(new THREE.SphereGeometry(.34, 12, 10), new THREE.MeshBasicMaterial({ color: 0x9fe3ff }), n), net);
    const o = new THREE.Object3D(); pts.forEach((p, i) => { o.position.copy(p); o.scale.setScalar(.7 + Math.random() * .9); o.updateMatrix(); nodeMesh.setMatrixAt(i, o.matrix); });
    const pulses = []; const pm = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 26; i++) { const m = add(new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), pm), net); pulses.push({ m, e: edges[(Math.random() * edges.length) | 0], k: Math.random(), sp: .4 + Math.random() * .8 }); }
    tick.push((t, dt) => { pulses.forEach(p => { p.k += dt * p.sp * (motion || .3); if (p.k >= 1) { p.k = 0; const end = p.e[1]; const opts = edges.filter(e => e[0] === end || e[1] === end); const e = opts[(Math.random() * opts.length) | 0] || p.e; p.e = e[0] === end ? e : [e[1], e[0]]; }
      p.m.position.lerpVectors(pts[p.e[0]], pts[p.e[1]], p.k); }); });
  }

  /* ---- 2: ring of service monoliths ---- */
  const services = DATA.services;
  const ring = add(new THREE.Group()); ring.position.set(0, 0, -80);
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  const wrapText = (g, txt, x, y, maxW, lh) => { const words = txt.split(' '); let line = ''; for (const w of words) { const test = line ? line + ' ' + w : w; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); line = w; y += lh; } else line = test; } g.fillText(line, x, y); return y; };
  services.forEach(({ title, sub, src, href }, i) => {
    const a = (i / services.length) * Math.PI * 2, R = 19;
    const grp = add(new THREE.Group(), ring); grp.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); grp.rotation.y = a + Math.PI;
    const body = add(new THREE.Mesh(new RoundedBoxGeometry(6.2, 9.4, .7, 3, .28), new THREE.MeshStandardMaterial({ color: 0x0b1640, metalness: .7, roughness: .22, emissive: 0x0a2a9a, emissiveIntensity: .25 })), grp); body.position.y = 6.9;
    const c = document.createElement('canvas'); c.width = 448; c.height = 680; const g = c.getContext('2d'); const t = canvasTex(c);
    const paint = (img) => { const gr = g.createLinearGradient(0, 0, 0, 680); gr.addColorStop(0, '#0e1f63'); gr.addColorStop(1, '#050b26'); g.fillStyle = gr; g.fillRect(0, 0, 448, 680);
      if (img) { const r = Math.max(448 / img.width, 300 / img.height), w = img.width * r, h = img.height * r; g.save(); g.beginPath(); g.rect(0, 0, 448, 300); g.clip(); g.drawImage(img, (448 - w) / 2, (300 - h) / 2, w, h); g.restore(); }
      g.fillStyle = '#5ad1ff'; g.fillRect(28, 330, 44, 5);
      g.fillStyle = '#ffffff'; g.font = '700 40px Sora, Arial, sans-serif'; const y = wrapText(g, title, 28, 392, 392, 46);
      g.fillStyle = '#aeb9da'; g.font = '500 25px Manrope, Arial, sans-serif'; wrapText(g, sub, 28, y + 48, 392, 32);
      g.strokeStyle = 'rgba(143,208,255,.55)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 445, 677); t.needsUpdate = true; dirty = true; };
    paint(null); const im = new Image(); im.onload = () => fontsReady.then(() => paint(im)); im.src = src; fontsReady.then(() => paint(im.complete && im.naturalWidth ? im : null));
    for (const s of [1, -1]) { const face = add(new THREE.Mesh(new THREE.PlaneGeometry(5.6, 8.5), new THREE.MeshBasicMaterial({ map: t, color: 0xd8d8d8, toneMapped: false })), grp); face.position.set(0, 6.9, .37 * s); if (s < 0) face.rotation.y = Math.PI; face.userData = { kind: 'service', href }; clickables.push(face); }
    const halo = add(new THREE.Mesh(new THREE.RingGeometry(3.6, 3.9, 64), new THREE.MeshBasicMaterial({ color: 0x3BA7FF, side: THREE.DoubleSide })), grp); halo.rotation.x = -Math.PI / 2; halo.position.y = .07;
  });
  { const base = add(new THREE.Mesh(new THREE.RingGeometry(2.4, 2.8, 64), new THREE.MeshBasicMaterial({ color: 0x5ad1ff, side: THREE.DoubleSide })), ring); base.rotation.x = -Math.PI / 2; base.position.y = .08; }
  const core = add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 1), new THREE.MeshStandardMaterial({ color: 0x1d4fd8, emissive: 0x2f7bff, emissiveIntensity: .45, flatShading: true, metalness: .5, roughness: .25 })), ring); core.position.y = 9;
  add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.5, 1)), new THREE.LineBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: .7 })), core);
  tick.push((t, dt) => { ring.rotation.y += dt * .06 * motion; core.rotation.y -= dt * .4 * motion; core.rotation.x += dt * .2 * motion; core.position.y = 9 + Math.sin(t) * .6 * motion; });

  /* ---- 3: poster boulevard ---- */
  const boards = [];
  DATA.campaigns.slice(0, 8).forEach(({ id, src }, i) => {
    const side = i % 2 ? 1 : -1, z = -116 - Math.floor(i / 2) * 21;
    const b = add(new THREE.Group()); b.position.set(side * 13.5, 0, z); b.rotation.y = -side * .5;
    const col = i % 2 ? 0x9a8cff : 0x5ad1ff;
    add(new THREE.Mesh(new THREE.BoxGeometry(.4, 5, .4), new THREE.MeshStandardMaterial({ color: 0x0d1a4d, metalness: .8, roughness: .3 })), b).position.y = 2.5;
    add(new THREE.Mesh(new THREE.BoxGeometry(7.6, 11.1, .35), new THREE.MeshStandardMaterial({ color: 0x070d2a, metalness: .6, roughness: .4 })), b).position.set(0, 10.4, -.25);
    add(new THREE.Mesh(new THREE.PlaneGeometry(7.3, 10.8), new THREE.MeshBasicMaterial({ color: col })), b).position.set(0, 10.4, -.05);
    const poster = add(new THREE.Mesh(new THREE.PlaneGeometry(6.8, 10.2), new THREE.MeshBasicMaterial({ map: tex(src), color: 0xdcdcdc, toneMapped: false })), b); poster.position.set(0, 10.4, 0);
    poster.userData = { kind: 'poster', id, grp: b }; clickables.push(poster);
    const beam = add(new THREE.Mesh(new THREE.ConeGeometry(4.4, 12, 40, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })), b);
    beam.position.set(0, 6.5, 2.2); beam.rotation.x = Math.PI + .35;
    const pad = add(new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .25, depthWrite: false })), b); pad.rotation.x = -Math.PI / 2; pad.position.set(0, .06, 2);
    boards.push(b);
  });
  { const arch = add(new THREE.Mesh(new THREE.TorusGeometry(11, .35, 16, 120, Math.PI), new THREE.MeshBasicMaterial({ color: 0x5ad1ff })), scene); arch.position.set(0, 0, -106); }

  /* ---- 4: results wall ---- */
  const wall = add(new THREE.Group()); wall.position.set(0, 0, -208);
  add(new THREE.Mesh(new THREE.BoxGeometry(27.5, 17.6, .5), new THREE.MeshStandardMaterial({ color: 0x060c26, metalness: .7, roughness: .35 })), wall).position.set(0, 10, -.5);
  add(new THREE.Mesh(new THREE.PlaneGeometry(28.3, 18.4), new THREE.MeshBasicMaterial({ color: 0x2f7bff })), wall).position.set(0, 10, -.8);
  for (const x of [-12.5, 12.5]) add(new THREE.Mesh(new THREE.BoxGeometry(.6, 20, .6), new THREE.MeshStandardMaterial({ color: 0x0d1a4d, metalness: .8, roughness: .3 })), wall).position.set(x, 10, -.6);
  const cells = [[-6.6, 14.3], [6.6, 14.3], [-6.6, 5.9], [6.6, 5.9]];
  DATA.results.slice(0, 4).forEach(({ src, aspect, alt }, i) => {
    const w = 12.4, h = Math.min(7.6, w / aspect);
    const g = add(new THREE.Group(), wall); g.position.set(cells[i][0], cells[i][1], 0);
    add(new THREE.Mesh(new THREE.PlaneGeometry(w + .36, h + .36), new THREE.MeshBasicMaterial({ color: i % 3 ? 0x8b7bff : 0x5ad1ff })), g).position.z = -.04;
    const scr = add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(src), color: 0xb4b4b4, toneMapped: false })), g);
    scr.userData = { kind: 'result', src, alt }; clickables.push(scr);
  });

  /* ---- 5: client orbit ---- */
  const orbit = add(new THREE.Group()); orbit.position.set(0, 0, -248);
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 22, 24), new THREE.MeshStandardMaterial({ color: 0x1a3bff, emissive: 0x2f7bff, emissiveIntensity: .9, metalness: .4, roughness: .3 })), orbit).position.y = 11;
  const ringA = add(new THREE.Group(), orbit), ringB = add(new THREE.Group(), orbit);
  const logos = DATA.logos, half = Math.ceil(logos.length / 2);
  logos.forEach((src, i) => {
    const inA = i < half, list = inA ? half : logos.length - half, idx = inA ? i : i - half, R = inA ? 10.5 : 14, y = inA ? 7 : 13.5, a = idx / list * Math.PI * 2 + (inA ? 0 : .3);
    const sp = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(src), color: 0xc8c8c8, toneMapped: false })), inA ? ringA : ringB);
    sp.position.set(Math.sin(a) * R, y, Math.cos(a) * R); sp.scale.set(4.6, 2.55, 1);
    const glow = add(new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x3BA7FF, transparent: true, opacity: .55, depthWrite: false })), inA ? ringA : ringB);
    glow.position.copy(sp.position).multiplyScalar(1.004); glow.position.y = y; glow.scale.set(4.95, 2.9, 1); glow.renderOrder = -1;
  });
  tick.push((t, dt) => { ringA.rotation.y += dt * .16 * motion; ringB.rotation.y -= dt * .11 * motion; });

  /* ---- 6: plan towers ---- */
  const towerStyle = [[-12, 11, 0x5ad1ff], [0, 17, 0x6f8dff], [12, 24, 0xffc531]];
  const crystals = [];
  DATA.plans.slice(0, 3).forEach(({ name, price, id }, i) => {
    const [x, h, col] = towerStyle[i];
    const g = add(new THREE.Group()); g.position.set(x, 0, -292);
    const geo = new RoundedBoxGeometry(6.4, h, 6.4, 3, .5);
    const tw = winTex.clone(); tw.needsUpdate = true; tw.wrapS = tw.wrapT = THREE.RepeatWrapping; tw.repeat.set(1, h / 12);
    const body = add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x0a143a, metalness: .8, roughness: .18, emissive: col, emissiveMap: tw, emissiveIntensity: .9 })), g); body.position.y = h / 2;
    body.userData = { kind: 'plan', id }; clickables.push(body);
    const edges = add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(6.5, h, 6.5)), new THREE.LineBasicMaterial({ color: col })), g); edges.position.y = h / 2;
    const cr = add(new THREE.Mesh(new THREE.OctahedronGeometry(1.5), new THREE.MeshBasicMaterial({ color: col })), g); cr.position.y = h + 3; crystals.push([cr, h + 3]);
    const c = document.createElement('canvas'); c.width = 512; c.height = 200; const ctx = c.getContext('2d'); const st = canvasTex(c);
    const draw = () => { ctx.clearRect(0, 0, 512, 200); ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.font = '800 76px Sora, Arial, sans-serif'; ctx.fillText(name, 256, 84); ctx.fillStyle = '#' + col.toString(16).padStart(6, '0'); ctx.font = '700 44px Sora, Arial, sans-serif'; ctx.fillText(price, 256, 160); st.needsUpdate = true; dirty = true; };
    draw(); fontsReady.then(draw);
    const sp = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: st, transparent: true, depthWrite: false, toneMapped: false })), g); sp.scale.set(9, 3.5, 1); sp.position.y = h + 7.5;
  });
  tick.push((t, dt) => { crystals.forEach(([c, y], i) => { c.rotation.y += dt * 1.2 * motion; c.position.y = y + Math.sin(t * 1.5 + i) * .5 * motion; }); });

  /* ---- camera path: one stop per section ---- */
  const posCurve = new THREE.CatmullRomCurve3(stops.map(s => new THREE.Vector3(...s[0])), false, 'centripetal');
  const lookCurve = new THREE.CatmullRomCurve3(stops.map(s => new THREE.Vector3(...s[1])), false, 'centripetal');
  const secs = [].slice.call(document.querySelectorAll('[data-stop]'));
  const ease = f => { const x = Math.min(1, Math.max(0, (f - .12) / .76)); return x * x * (3 - 2 * x); };
  let centers = [];
  const measure = () => { centers = secs.map(s => s.offsetTop + s.offsetHeight / 2); };
  measure();
  function target() { const y = scrollY + innerHeight * .5, c = centers;
    if (y <= c[0]) return 0; for (let i = 0; i < c.length - 1; i++) if (y < c[i + 1]) return (i + ease((y - c[i]) / (c[i + 1] - c[i]))) / (c.length - 1); return 1; }
  let u = target(), mx = 0, my = 0, smx = 0, smy = 0;
  const look = new THREE.Vector3();

  /* ---- pointer: parallax, hover, click in the 3D world ---- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let hovered = null;
  const worldTarget = e => !e.target.closest('.panel, a, button, input, textarea, select, .film, .rcard, .marquee, .nav, .menu, .rail, .hud, .lb, form, footer, .strip-ctl, .hstat');
  function pick(e) { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(clickables, false); return h.length ? h[0].object : null; }
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; dirty = true;
    const o = worldTarget(e) ? pick(e) : null; if (o !== hovered) { hovered = o; document.body.style.cursor = o ? 'pointer' : ''; } }, { passive: true });
  addEventListener('click', e => { if (!worldTarget(e)) return; const o = pick(e); if (!o) return; const d = o.userData; dirty = true;
    if (d.kind === 'token') popToken(o);
    else if (d.kind === 'poster') { const card = document.querySelector('.film[data-c="' + d.id + '"]'); if (card) { card.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', inline: 'center', block: 'nearest' }); window.__flash && window.__flash('.film[data-c="' + d.id + '"]'); } }
    else if (d.kind === 'result') window.__lightbox && window.__lightbox(d.src, d.alt || 'Campaign result');
    else if (d.kind === 'plan') { const el = document.getElementById(d.id); if (el) { el.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'center' }); window.__flash && window.__flash('#' + d.id); } }
    else if (d.kind === 'service' && d.href) location.href = d.href; });

  /* ---- post-processing (lighter bloom on small screens, as in the prototype) ---- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), isSmall() ? .55 : .8, .55, .66));
  composer.addPass(new OutputPass());

  function resize() { camera.aspect = innerWidth / innerHeight; camera.fov = innerWidth < 760 ? 80 : innerWidth < 1100 ? 54 : 48; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall() ? 1.3 : 1.75)); renderer.setSize(innerWidth, innerHeight); if (composer) composer.setSize(innerWidth, innerHeight); measure(); dirty = true; }
  addEventListener('resize', resize); resize();
  addEventListener('scroll', () => { dirty = true; }, { passive: true });
  addEventListener('load', () => { measure(); dirty = true; });
  reduce.addEventListener && reduce.addEventListener('change', e => { motion = e.matches ? 0 : 1; dirty = true; });

  const clock = new THREE.Clock();
  const hoverScale = new THREE.Vector3();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { clock.getDelta(); requestAnimationFrame(frame); } });
  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    const tu = target();
    const moving = Math.abs(tu - u) > 1e-4 || Math.abs(mx - smx) > 1e-3 || Math.abs(my - smy) > 1e-3;
    // With reduced motion the scene holds still and only redraws when something changes.
    if (!motion && !moving && !dirty && !floaters.length && !tokens.some(m => m.userData.pop > 0)) return;
    dirty = false;
    u += (tu - u) * (motion ? Math.min(1, dt * 3) : 1);
    smx += (mx - smx) * Math.min(1, dt * 2.5); smy += (my - smy) * Math.min(1, dt * 2.5);
    const p = posCurve.getPoint(u), l = lookCurve.getPoint(u);
    camera.position.set(p.x + smx * 1.8 * motion, p.y - smy * 1.0 * motion, p.z);
    look.set(l.x + smx * 2.6 * motion, l.y - smy * 1.4 * motion, l.z); camera.lookAt(look);
    boards.forEach(b => { const on = hovered && hovered.userData.grp === b; hoverScale.setScalar(on ? 1.07 : 1); b.scale.lerp(hoverScale, Math.min(1, dt * 8)); });
    tick.forEach(f => f(t, dt));
    if (composer) composer.render(); else renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  document.body.classList.add('webgl-ready');
}
