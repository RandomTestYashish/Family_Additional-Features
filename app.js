// Family – Additional Features prototype. 375 x 812 frame; other viewports scale it, never re-lay it out.
const root = document.documentElement;
const device = document.getElementById('device');

(function fit() {
  const W = 375, H = 812;
  function run() {
    const vw = innerWidth, vh = innerHeight;
    const phone = vw <= 520 && matchMedia('(pointer: coarse), (max-width: 520px)').matches;
    root.classList.toggle('phone', phone);
    if (phone) { const s = vw / W; root.style.setProperty('--s', s); root.style.setProperty('--dh', (vh / s) + 'px'); }
    else { root.style.setProperty('--s', Math.min(1, (vh - 150) / (H + 20), (vw - 48) / (W + 20))); root.style.removeProperty('--dh'); }
  }
  run(); addEventListener('resize', run);
})();

// ---------- shared bits ----------
const A = 'assets/';
document.querySelectorAll('[data-statusbar]').forEach(el => {
  el.innerHTML = `<img class="sb-bat" src="${A}battery.svg" alt=""><img class="sb-wifi" src="${A}wifi.svg" alt=""><img class="sb-cell" src="${A}cell.svg" alt=""><span class="sb-time"><img src="${A}time941.svg" alt=""></span>`;
});

// orbit members (positions are Figma frame coords)
const rel = (x, y, inner, label) => `<button class="tap rel" style="left:${x}px;top:${y}px" aria-label="Add ${label || 'connection'}">
  <span class="rel-c">${inner}</span>${label ? `<span class="rel-l">${label}</span>` : ''}
  <img class="rel-pc" src="${A}first-cell.svg" alt=""><img class="rel-p" src="${A}plus-small.svg" alt=""></button>`;
document.getElementById('relations').innerHTML =
  rel(60, 117, `<img src="${A}lob-router.png" alt="">`) +
  rel(277, 130, `<img src="${A}lob-right.png" alt="">`) +
  rel(156.38, 143.1, 'B', 'Brother') +
  rel(50, 223, 'M', 'Mother') +
  rel(250.63, 217.56, 'F', 'Father') +
  rel(211.99, 328.78, 'O', 'Others');

// ---------- benefits ----------
const BENEFITS = {
  netflix: { name: 'Netflix', desc: 'Unlimited ad-free<br>OTT on 1 device', w: 103, logo: 'logo-netflix.png', lr: '', timer: 14 * 3600 + 7 * 60, tone: 'error', cat: 'Entertainment' },
  zee5:    { name: 'Zee5', desc: 'Access to popular live television channels', w: 126, logo: 'logo-zee5.png', lr: 'r4', timer: 33 * 3600 + 50 * 60, tone: 'warning', cat: 'Entertainment' },
  prime:   { name: 'Prime Video', desc: 'Access to HD-quality OTT on 1 device', w: 142, logo: 'logo-prime.png', lr: 'r8', tag: 'Expiring in 1 week', tone: '', cat: 'Entertainment' },
  apollo:  { name: 'Apollo Circle', desc: 'Complimentaary<br>6-month membership', w: 135, logo: 'logo-apollo.png', lr: 'r8', tag: 'Expiring in 1 month', tone: '', cat: 'Medicine' },
};
const PEOPLE = {
  shree:   { short: 'Shree', full: 'Shree Verma', avatar: 'avatar-shree.png' },
  aditya:  { short: 'Aditya', full: 'Aditya', avatar: 'avatar-aditya.png' },
  harshit: { short: 'Harshit', full: 'Harshit Vig', avatar: 'avatar-shree.png' },
};
const LISTS = {
  home:   [['netflix', 'shree'], ['zee5', 'shree'], ['prime', 'aditya']],
  sheet:  [['netflix', 'shree'], ['zee5', 'shree'], ['prime', 'aditya'], ['apollo', 'aditya']],
  detail: [['zee5', 'harshit', 'avatar-shree.png'], ['prime', 'harshit', 'avatar-aditya.png']],
};
const sent = new Set();

function card([b, p, av]) {
  const B = BENEFITS[b], P = PEOPLE[p], avatar = av || P.avatar, key = b + ':' + p, done = sent.has(key);
  return `<div class="bcard" data-key="${key}">
    <div class="bc-top">
      <div class="bc-main"><img class="bc-logo ${B.lr}" src="${A}${B.logo}" alt=""><div class="bc-txt"><p class="bc-name">${B.name}</p><p class="bc-desc" style="width:${B.w}px">${B.desc}</p></div></div>
      ${tagHtml(b)}
    </div>
    <div class="bc-line"></div>
    <div class="bc-foot">
      <div class="bc-who"><span class="av36"><img src="${A}${avatar}" alt=""></span>${P.short}’s benefit</div>
      ${remindBtn(key, done)}
    </div>
  </div>`;
}
// fake countdown: each benefit starts from its own random time and ticks on its own off-beat,
// so two timers never match or roll together (copies of the same benefit on other screens stay equal)
const T0 = Date.now();
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
BENEFITS.netflix.timer = rnd(6, 20) * 3600 + rnd(0, 59) * 60 + rnd(0, 59);   // under a day -> red tag
BENEFITS.zee5.timer = rnd(26, 40) * 3600 + rnd(0, 59) * 60 + rnd(0, 59);     // a day+ -> amber tag
for (const B of Object.values(BENEFITS)) if (B.timer) B.phase = rnd(80, 920);
const left = b => Math.max(0, BENEFITS[b].timer - Math.floor((Date.now() - T0 - BENEFITS[b].phase) / 1000));
const hms = n => [Math.floor(n / 3600), Math.floor(n / 60) % 60, n % 60].map(v => String(v).padStart(2, '0')).join(':');
const digits = str => [...str].map(c => `<span class="d">${c}</span>`).join('');
function tagHtml(b) {
  const B = BENEFITS[b];
  if (!B.timer) return `<span class="tag ${B.tone}">${B.tag}</span>`;
  return `<span class="tag ${B.tone}" data-timer="${b}">Expiring in<span class="tm">${digits(hms(left(b)))}</span></span>`;
}
setInterval(() => {
  document.querySelectorAll('[data-timer]').forEach(tag => {
    const next = hms(left(tag.dataset.timer)), ds = tag.querySelectorAll('.tm .d');
    [...next].forEach((c, i) => {
      if (ds[i].textContent === c) return;
      const n = document.createElement('span'); n.className = 'd roll'; n.textContent = c; ds[i].replaceWith(n);
    });
    if (next.endsWith(':00')) { tag.classList.remove('tick'); void tag.offsetWidth; tag.classList.add('tick'); }
  });
}, 50);   // checked often; each tag only changes on its own second boundary

const remindBtn = (key, done) => done
  ? `<button class="remind sent" disabled data-remind="${key}">Send Reminder<img class="ic-tick" src="${A}tick-grey.svg" alt=""></button>`
  : `<button class="tap remind" data-remind="${key}">Send Reminder<img src="${A}bell.svg" alt=""></button>`;

const homeList = document.getElementById('homeBenefits');
const detailList = document.getElementById('detailBenefits');
const sheetList = document.getElementById('sheetBenefits');
homeList.innerHTML = LISTS.home.map(card).join('');
detailList.innerHTML = LISTS.detail.map(card).join('');

// sheet chips (Figma 81564:171981 unselected / 81564:172387 Entertainment selected)
const CHIPS = ['Entertainment', 'Shopping', 'Food & Dining', 'Medicine'];
let chip = null;
const chipsEl = document.getElementById('chips');
function renderSheet() {
  chipsEl.innerHTML = CHIPS.map(c => `<button class="tap chip${c === chip ? ' on' : ''}" data-chip="${c}">${c.replace('&', '&amp;')}</button>`).join('');
  const items = LISTS.sheet.filter(([b]) => !chip || BENEFITS[b].cat === chip);
  sheetList.innerHTML = items.length ? items.map(card).join('') : `<p class="empty">No ${chip.toLowerCase()} benefits for your family yet.</p>`;
}

// ---------- overlays ----------
const sheet = document.getElementById('sheet'), modal = document.getElementById('modal');
function open(el) { el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); }
function close(el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }

let pendingKey = null, autoClose;
// ---------- version (V1 badge reveal / V2 fly to member) ----------
const verSel = document.getElementById('ver');
let VER = (() => { const q = new URLSearchParams(location.search).get('ver'); if (q) return q === '2' ? 2 : 1; try { return +localStorage.getItem('fam-ver') === 2 ? 2 : 1; } catch { return 1; } })();
verSel.value = String(VER);
verSel.addEventListener('change', () => {
  VER = +verSel.value;
  try { localStorage.setItem('fam-ver', VER); } catch {}
  const u = new URL(location.href); u.searchParams.set('ver', VER); history.replaceState(null, '', u);
  sent.clear();                                   // reset the cards so the new animation can be tried straight away
  homeList.innerHTML = LISTS.home.map(card).join(''); detailList.innerHTML = LISTS.detail.map(card).join('');
  if (sheet.classList.contains('open')) renderSheet();
  toast(VER === 2 ? 'V2 · Fly to member' : 'V1 · Badge reveal');
});
function sendReminder(key) {
  const [b, p] = key.split(':');
  sent.add(key);
  pendingKey = key;                       // the card flips to "sent" once the popup closes, so the user sees it happen
  document.getElementById('modalText').innerHTML = `${PEOPLE[p].full} has been notified about<br>the ${BENEFITS[b].name} benefit.`;
  const av = document.getElementById('rvAvatar'), logo = document.getElementById('rvLogo');
  av.src = A + (document.querySelector(`[data-remind="${key}"]`)?.closest('.bcard')?.querySelector('.av36 img')?.getAttribute('src')?.replace(A, '') || PEOPLE[p].avatar);
  logo.src = A + BENEFITS[b].logo;
  modal.querySelector('.fly-av').src = av.src;
  modal.querySelectorAll('.fly-logo, .fly-badge').forEach(i => { i.src = logo.src; });
  modal.classList.remove('closing');
  modal.classList.toggle('v2', VER === 2);
  open(modal);
  VER === 2 ? playFly() : playReveal();
}

// Close: the popup shrinks onto the card that sent the reminder and dissolves into it,
// then that card glows and its button ticks over to "sent".
function closeModal(force) {
  if (!modal.classList.contains('open') || modal.classList.contains('closing')) return;
  if (VER === 2 && !force && modal.querySelector('.okbtn').disabled) return;   // V2 waits for Ok, Done
  clearTimeout(autoClose);
  modal.classList.add('closing');
  const key = pendingKey; pendingKey = null;
  const scope = sheet.classList.contains('open') ? sheet : screens[current];
  const card = key && scope.querySelector(`[data-remind="${key}"]`)?.closest('.bcard');
  const box = modal.querySelector('.modal'), scrim = modal.querySelector('.scrim');
  const flip = () => { if (key) document.querySelectorAll(`[data-remind="${key}"]`).forEach(btn => { btn.outerHTML = remindBtn(key, true); }); };
  const finish = () => { close(modal); modal.classList.remove('closing'); box.style.transition = ''; box.getAnimations().forEach(a => a.cancel()); scrim.getAnimations().forEach(a => a.cancel()); [...box.children].forEach(c => c.getAnimations().forEach(a => a.cancel())); };

  const d = device.getBoundingClientRect(), k = device.offsetWidth / d.width;
  const m = box.getBoundingClientRect(), c = card?.getBoundingClientRect();
  const visible = c && c.bottom > d.top + 40 && c.top < d.bottom - 40;
  if (reduce || !visible) {                       // nothing on screen to land on: simple fade
    box.style.transition = 'none';
    box.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-50%) scale(.96)' }], { duration: 220, fill: 'forwards' });
    scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' }).finished.then(() => { finish(); flip(); });
    return;
  }
  const dy = ((c.top + c.height / 2) - (m.top + m.height / 2)) * k, sx = c.width / m.width, sy = c.height / m.height;
  const D = 520, out = 'cubic-bezier(.4,0,.2,1)';
  box.style.transition = 'none';
  [...box.children].forEach(el => el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.92)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' }));
  box.animate([
    { transform: 'translateY(-50%)', borderRadius: '20px', opacity: 1, boxShadow: '0 24px 60px rgba(0,0,0,.18)' },
    { offset: .7, opacity: 1 },
    { transform: `translateY(calc(-50% + ${dy}px)) scale(${sx}, ${sy})`, borderRadius: `${12 / sx}px / ${12 / sy}px`, opacity: 0, boxShadow: '0 4px 12px rgba(0,0,0,.04)' },
  ], { duration: D, easing: out, fill: 'forwards' });
  scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D * .9, easing: 'ease-out', fill: 'forwards' });
  if (window.__hold) return;
  setTimeout(() => {
    flip();
    card.classList.add('landed');
    card.animate([
      { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(7,94,232,0)' },
      { offset: .35, transform: 'scale(1.025)', boxShadow: '0 0 0 3px rgba(7,94,232,.22), 0 10px 24px rgba(7,94,232,.12)' },
      { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(7,94,232,0)' },
    ], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.then(() => card.classList.remove('landed'));
  }, D * .72);
  setTimeout(finish, D + 20);
}

// ---------- popup reveal (Web Animations, one 1.7 s timeline) ----------
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let running = [];
function playReveal() {
  running.forEach(a => a.cancel()); running = [];
  const q = s => modal.querySelector(s);
  const logo = q('.rv-logo'), av = q('.rv-av'), pill = q('.rv-pill'), ring = q('.rv-ring');
  const T = reduce ? 1 : 1750, ease = 'cubic-bezier(.22,1,.36,1)', spring = 'cubic-bezier(.3,1.5,.5,1)';
  const opt = { duration: T, delay: reduce ? 0 : 160, fill: 'both' };
  const tr = (x, y, s) => `translate(${x}px, ${y}px) scale(${s})`;
  running.push(
    logo.animate([
      { offset: 0,    transform: tr(0, 0, .3), opacity: 0, boxShadow: '0 0 0 0 #fff', easing: spring },
      { offset: .2,   transform: tr(0, 0, 1), opacity: 1, easing: ease },
      { offset: .3,   transform: tr(0, 0, 1), easing: ease },
      { offset: .46,  transform: tr(30, 0, 1), easing: ease },
      { offset: .6,   transform: tr(30, 0, 1), boxShadow: '0 0 0 0 #fff', easing: 'cubic-bezier(.65,0,.35,1)' },
      { offset: .84,  transform: tr(18, -18, .44), boxShadow: '0 0 0 4.5px #fff', easing: spring },
      { offset: .92,  transform: tr(18, -18, .52) },
      { offset: 1,    transform: tr(18, -18, .44), opacity: 1, boxShadow: '0 0 0 4.5px #fff' },
    ], opt),
    av.animate([
      { offset: 0,    transform: tr(-30, 0, .5), opacity: 0 },
      { offset: .4,   transform: tr(-30, 0, .5), opacity: 0, easing: spring },
      { offset: .56,  transform: tr(-30, 0, 1), opacity: 1 },
      { offset: .62,  transform: tr(-30, 0, 1), easing: 'cubic-bezier(.65,0,.35,1)' },
      { offset: .84,  transform: tr(0, 0, 1), easing: spring },
      { offset: .92,  transform: tr(0, 0, 1.06) },
      { offset: 1,    transform: tr(0, 0, 1), opacity: 1 },
    ], opt),
    pill.animate([
      { offset: 0,    width: '56px', opacity: 0 },
      { offset: .26,  width: '56px', opacity: 0, easing: ease },
      { offset: .3,   width: '56px', opacity: 1, easing: ease },
      { offset: .48,  width: '124px', opacity: 1 },
      { offset: .62,  width: '124px', opacity: 1, easing: 'cubic-bezier(.65,0,.35,1)' },
      { offset: .84,  width: '56px', opacity: 0 },
      { offset: 1,    width: '56px', opacity: 0 },
    ], opt),
  );
  if (reduce) return finishReveal(false);
  const done = running[0].finished.then(() => finishReveal(true)).catch(() => {});
  // ring + confetti fire as the badge lands
  setTimeout(() => { if (!modal.classList.contains('open')) return;
    running.push(ring.animate([{ transform: 'scale(1)', opacity: .9 }, { transform: 'scale(2.1)', opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' }));
    burst(av); navigator.vibrate?.(14);
  }, 160 + T * .84);
  return done;
}
function finishReveal() { clearTimeout(autoClose); autoClose = setTimeout(closeModal, 1900); }

// ---------- V2 popup: benefit flies along an arc and docks on the member ----------
// One rAF clock drives every element from a single time value, so speeds never jump between segments.
// The same tile flies, lands and stays as the badge (no element swap).
const FLY = { T: 2200, START: [56, 84], C1: [108, 6], C2: [206, 2], AV: [258, 70], CENTER: [155.5, 70], BADGE: [19, -19], DOTS: 36 };
const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeInOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;          // cubic
const easeInOutSine = x => -(Math.cos(Math.PI * x) - 1) / 2;
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeOutBack = x => { const c = 1.45; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const bez = (p, P0, P1, P2, P3) => { const u = 1 - p; return u*u*u*P0 + 3*u*u*p*P1 + 3*u*p*p*P2 + p*p*p*P3; };
const arc = p => { const E = [FLY.AV[0] + FLY.BADGE[0], FLY.AV[1] + FLY.BADGE[1]];
  return [bez(p, FLY.START[0], FLY.C1[0], FLY.C2[0], E[0]), bez(p, FLY.START[1], FLY.C1[1], FLY.C2[1], E[1])]; };
const place = (el, x, y, w, s = 1, r = 0, o = 1) => { el.style.transform = `translate3d(${x - w / 2}px, ${y - w / 2}px, 0) rotate(${r}deg) scale(${s})`; el.style.opacity = o; };

let flyRaf = 0, flySparked = false;
function flyRender(ms) {
  const q = sel => modal.querySelector(sel);
  const logo = q('.fly-logo'), av = q('.fly-av'), halo = q('.fly-halo'), dots = q('.fly-dots').children;
  const t = ms;
  // timings (ms)
  const appear = seg(t, 0, 420), avIn = seg(t, 100, 520), flight = seg(t, 320, 1340), land = seg(t, 1290, 1660), centre = seg(t, 1500, 2080), trailOut = seg(t, 1320, 1860);
  const f = easeInOutSine(flight), c = easeInOut(centre);
  // member: fades in, takes a soft hit on landing, glides to centre and grows
  const hit = Math.sin(Math.PI * land) * (1 - land) * .16;
  const avS = lerp(1, 1.38, c) * (1 - hit);
  const ax = lerp(FLY.AV[0], FLY.CENTER[0], c), ay = FLY.AV[1];
  place(av, ax, ay, 52, lerp(.6, 1, easeOutBack(avIn)) * avS, 0, easeOut(avIn));
  // tile: pops in tilted, flies the arc while turning and shrinking, then rides on the member as a badge
  let lx, ly, ls, lr;
  if (flight < 1) {
    [lx, ly] = arc(f);
    ls = lerp(1, .35, Math.pow(f, 1.6)) * lerp(.55, 1, easeOutBack(appear));
    lr = lerp(-14, 0, f) + Math.sin(Math.PI * f) * 22;
  } else {
    lx = ax + FLY.BADGE[0] * avS; ly = ay + FLY.BADGE[1] * avS;
    ls = .35 * avS * (1 + Math.sin(Math.PI * land) * .22);
    lr = 0;
  }
  place(logo, lx, ly, 52, ls, lr, easeOut(appear));
  logo.style.boxShadow = flight < 1 ? `0 ${6 * ls}px ${16 * ls}px rgba(0,0,0,${.22 * ls + .05})` : '0 0 0 3.5px #fff, 0 3px 10px rgba(0,0,0,.25)';
  logo.style.borderRadius = flight < 1 ? '13px' : '14px';
  // trail: soft dots light up just behind the tile, then fade together
  for (let i = 0; i < dots.length; i++) {
    const u = (i + .5) / dots.length, [dx, dy] = arc(u * .94);
    const lit = easeOut(clamp((f - u + .1) / .22));
    place(dots[i], dx, dy, 32, lerp(.55, 1, lit), 0, lit * (1 - easeInOut(trailOut)) * .7);
  }
  // halo breathes in once the member is centred
  const h = easeOut(seg(t, 1820, 2200));
  place(halo, ax, ay, 76, lerp(.7, 1.42, h), 0, h);
  return { landed: land > 0, ax, ay };
}

function playFly() {
  running.forEach(a => a.cancel()); running = [];
  cancelAnimationFrame(flyRaf); flySparked = false;
  const dotsEl = modal.querySelector('.fly-dots');
  if (dotsEl.children.length !== FLY.DOTS) dotsEl.innerHTML = '<i></i>'.repeat(FLY.DOTS);
  const ok = modal.querySelector('.okbtn'); ok.disabled = true; ok.classList.remove('shine');
  if (reduce) { flyRender(FLY.T); ok.disabled = false; return; }
  flyRender(0);
  const t0 = performance.now() + 160;                 // let the card start opening first
  running.push({ cancel: () => cancelAnimationFrame(flyRaf), pause() { this.cancel(); }, set currentTime(v) { flyRender(v); } });
  const tick = now => {
    const t = now - t0;
    const st = flyRender(Math.max(0, t));
    if (st.landed && !flySparked) { flySparked = true; navigator.vibrate?.(10); burst(modal.querySelector('.fly-logo'), 'soft'); }
    if (t >= 2080 && ok.disabled) { ok.disabled = false; ok.classList.add('shine'); }
    if (t < FLY.T + 50 && modal.classList.contains('open')) flyRaf = requestAnimationFrame(tick);
  };
  flyRaf = requestAnimationFrame(tick);
}

// ---------- confetti (canvas inside the 375 x 812 frame) ----------
const cvs = document.getElementById('confetti'), ctx = cvs.getContext('2d');
let parts = [], raf = 0;
const COLORS = ['#E50914', '#FF5A5F', '#FFC145', '#2EC4B6', '#3A86FF', '#8338EC', '#FF8FAB', '#06D6A0'];
const SOFT = ['#4CC98C', '#9BE3BF', '#FFD166', '#7FD1AE', '#E50914', '#B5EAD0'];
function burst(fromEl, mode) {
  const dpr = Math.min(3, devicePixelRatio || 1), W = device.offsetWidth, H = device.offsetHeight;
  if (cvs.width !== W * dpr) { cvs.width = W * dpr; cvs.height = H * dpr; }
  const d = device.getBoundingClientRect(), r = fromEl.getBoundingClientRect(), k = W / d.width;
  const ox = (r.left + r.width / 2 - d.left) * k, oy = (r.top + r.height / 2 - d.top) * k;
  const add = (n, x, y, spread, base, sp) => { for (let i = 0; i < n; i++) {
    const a = base + (Math.random() - .5) * spread, v = sp * (.55 + Math.random() * .7);
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .22 + Math.random() * .12, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .35,
      w: 5 + Math.random() * 5, h: 8 + Math.random() * 7, c: COLORS[i % COLORS.length], shape: Math.random() < .28 ? 'dot' : Math.random() < .5 ? 'rect' : 'ribbon',
      life: 0, max: 95 + Math.random() * 55, tilt: Math.random() * 6.28 });
  } };
  if (mode === 'soft') {                                      // V2: a light sparkle off the docking point
    const n0 = parts.length; add(30, ox, oy, Math.PI * 2, 0, 5);
    for (let i = n0; i < parts.length; i++) { const p = parts[i]; p.c = SOFT[i % SOFT.length]; p.g *= .45; p.w *= .7; p.h *= .7; p.max *= .7; }
  } else {
    add(70, ox, oy, Math.PI * 1.25, -Math.PI / 2, 11);        // main burst from the member
    add(26, 24, oy + 40, Math.PI / 3, -Math.PI / 3, 12);      // side cannons
    add(26, W - 24, oy + 40, Math.PI / 3, -Math.PI * 2 / 3, 12);
  }
  if (!raf) { let last = performance.now(); raf = requestAnimationFrame(function step(now) {
    const dt = Math.min(2.5, (now - last) / 16.67); last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    parts = parts.filter(p => (p.life += dt) < p.max && p.y < H + 30);
    for (const p of parts) {
      p.vx *= Math.pow(.985, dt); p.vy = p.vy * Math.pow(.985, dt) + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.tilt += .12 * dt;
      const fade = Math.min(1, (p.max - p.life) / 30);
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      if (p.shape === 'dot') { ctx.beginPath(); ctx.arc(0, 0, p.w * .45, 0, 6.28); ctx.fill(); }
      else { const sy = p.shape === 'ribbon' ? Math.cos(p.tilt) : 1; ctx.fillRect(-p.w / 2, -p.h / 2 * sy, p.w, p.h * sy); }
      ctx.restore();
    }
    raf = parts.length ? requestAnimationFrame(step) : (ctx.clearRect(0, 0, W, H), 0);
  }); }
}

// ---------- pinned status bar frosts once content scrolls under it ----------
const sbPin = document.querySelector('.sb-pin');
document.querySelector('#home .scroll').addEventListener('scroll', e => sbPin.classList.toggle('solid', e.target.scrollTop > 8), { passive: true });

// ---------- navigation ----------
const screens = { home: document.getElementById('home'), detail: document.getElementById('detail') };
let current = 'home';
function go(id) {
  if (id === current) return;
  const to = screens[id], from = screens[current], back = id === 'home';
  to.classList.remove('in-right', 'in-left');
  to.classList.add('active');
  void to.offsetWidth;
  to.classList.add(back ? 'in-left' : 'in-right');
  if (!back) to.querySelector('.scroll').scrollTop = 0;
  setTimeout(() => from.classList.remove('active', 'in-right', 'in-left'), back ? 0 : 380);
  current = id;
}

let toastT;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1600);
}

device.addEventListener('click', e => {
  const t = e.target.closest('[data-ok], [data-close-modal], button, [data-close-sheet], .tap');
  if (!t) return;
  if (t.dataset.remind && !t.disabled) return sendReminder(t.dataset.remind);
  if (t.hasAttribute('data-open-sheet')) { chip = null; renderSheet(); sheet.querySelector('.sheet-scroll').scrollTop = 0; return open(sheet); }
  if (t.hasAttribute('data-close-sheet')) return close(sheet);
  if (t.hasAttribute('data-ok')) return closeModal(true);
  if (t.hasAttribute('data-close-modal')) return closeModal();
  if (t.dataset.chip) { chip = chip === t.dataset.chip ? null : t.dataset.chip; return renderSheet(); }
  if (t.dataset.go) return go(t.dataset.go);
  if (t.hasAttribute('data-add')) { t.textContent = 'Added ✓'; t.disabled = true; return toast('1 GB Data Loan added'); }
});

addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (modal.classList.contains('open')) closeModal();
  else if (sheet.classList.contains('open')) close(sheet);
  else if (current !== 'home') go('home');
});

// press feedback for touch (":active" is unreliable on iOS without a touch listener)
device.addEventListener('touchstart', e => { const t = e.target.closest('.tap'); if (t) t.classList.add('down'); }, { passive: true });
['touchend', 'touchcancel'].forEach(ev => device.addEventListener(ev, () => device.querySelectorAll('.tap.down').forEach(t => t.classList.remove('down')), { passive: true }));

// ---------- review hook: ?shot=home|detail|sheet|ent|modal renders a state at full height (used for Figma comparison) ----------
(function () {
  const shot = new URLSearchParams(location.search).get('shot');
  if (!shot) return;
  root.classList.add('shot');
  if (shot === 'detail') go('detail');
  if (shot === 'sheet' || shot === 'ent') { chip = shot === 'ent' ? 'Entertainment' : null; renderSheet(); open(sheet); }
  if (shot === 'modal') { sendReminder('netflix:shree');
    const ft = new URLSearchParams(location.search).get('t');
    if (ft !== null) { clearTimeout(autoClose); running.forEach(an => { an.pause(); an.currentTime = +ft; }); }
    const cl = new URLSearchParams(location.search).get('close');
    if (cl !== null) addEventListener('load', () => setTimeout(() => { window.__hold = true; closeModal();
      const box = modal.querySelector('.modal'), els = [box, modal.querySelector('.scrim'), ...box.children];
      els.forEach(el => el.getAnimations().filter(an => !running.includes(an)).forEach(an => { an.pause(); an.currentTime = +cl; }));
      if (+cl > 374) { document.querySelectorAll('[data-remind="netflix:shree"]').forEach(b => { b.outerHTML = remindBtn('netflix:shree', true); }); }
    }, 50)); }
  const full = false, y = +new URLSearchParams(location.search).get('y') || 0;
  addEventListener('load', () => { screens[current].querySelector('.scroll').scrollTop = y; });
  const set = () => {
    const sc = screens[current].querySelector('.scroll');
    root.style.setProperty('--s', 1);
    root.style.setProperty('--dh', (full ? Math.max(sc.scrollHeight, shot === 'home' ? 2383 : 1760) : 812) + 'px');
  };
  set(); requestAnimationFrame(set); addEventListener('load', set); addEventListener('resize', () => setTimeout(set));
})();
