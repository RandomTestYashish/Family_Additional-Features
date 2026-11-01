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
const BRAND = { netflix: '#E50914', zee5: '#8230C6', prime: '#1A98FF', apollo: '#F15A24' };
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
let VER = (() => { const q = new URLSearchParams(location.search).get('ver'); const ok = v => [1, 2, 3, 4, 5].includes(+v) ? +v : 1; if (q) return ok(q); try { return ok(localStorage.getItem('fam-ver')); } catch { return 1; } })();
verSel.value = String(VER);
verSel.addEventListener('change', () => {
  VER = +verSel.value;
  try { localStorage.setItem('fam-ver', VER); } catch {}
  const u = new URL(location.href); u.searchParams.set('ver', VER); history.replaceState(null, '', u);
  sent.clear();                                   // reset the cards so the new animation can be tried straight away
  homeList.innerHTML = LISTS.home.map(card).join(''); detailList.innerHTML = LISTS.detail.map(card).join('');
  if (sheet.classList.contains('open')) renderSheet();
  toast(['', 'V1 · Badge reveal', 'V2 · Fly to member', 'V3 · Envelope', 'V4 · Envelope popup', 'V5 · Envelope in the air'][VER]);
});
function sendReminder(key) {
  const [b, p] = key.split(':');
  sent.add(key);
  if (VER === 3) return playEnvelope(key);
  if (VER === 5) return playV5(key);
  pendingKey = key;                       // the card flips to "sent" once the popup closes, so the user sees it happen
  document.getElementById('modalText').innerHTML = `${PEOPLE[p].full} has been notified about<br>the ${BENEFITS[b].name} benefit.`;
  const av = document.getElementById('rvAvatar'), logo = document.getElementById('rvLogo');
  av.src = A + (document.querySelector(`[data-remind="${key}"]`)?.closest('.bcard')?.querySelector('.av36 img')?.getAttribute('src')?.replace(A, '') || PEOPLE[p].avatar);
  logo.src = A + BENEFITS[b].logo;
  modal.querySelector('.fly-av').src = av.src;
  modal.querySelectorAll('.fly-logo, .fly-badge').forEach(i => { i.src = logo.src; });
  modal.classList.remove('closing');
  modal.querySelector('.v4-av').src = av.src;
  modal.querySelectorAll('.v4-badge, .v4stage .env-logo').forEach(i => { i.src = logo.src; });
  modal.querySelector('.v4stage .env').style.setProperty('--brand', BRAND[b] || '#E50914');
  modal.classList.toggle('v2', VER === 2);
  modal.classList.toggle('v4', VER === 4);
  open(modal);
  VER === 2 ? playFly() : VER === 4 ? playV4() : playReveal();
}

// Close: the popup shrinks onto the card that sent the reminder and dissolves into it,
// then that card glows and its button ticks over to "sent".
function closeModal(force) {
  if (!modal.classList.contains('open') || modal.classList.contains('closing')) return;
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
  clearTimeout(autoClose);
  if (reduce) { flyRender(FLY.T); finishReveal(); return; }
  flyRender(0);
  const t0 = performance.now() + 160;                 // let the card start opening first
  running.push({ cancel: () => cancelAnimationFrame(flyRaf), pause() { this.cancel(); }, set currentTime(v) { flyRender(v); } });
  const tick = now => {
    const t = now - t0;
    const st = flyRender(Math.max(0, t));
    if (st.landed && !flySparked) { flySparked = true; navigator.vibrate?.(10); burst(modal.querySelector('.fly-logo'), 'soft'); }
    if (t < FLY.T + 50 && modal.classList.contains('open')) flyRaf = requestAnimationFrame(tick);
    else if (modal.classList.contains('open')) { clearTimeout(autoClose); autoClose = setTimeout(closeModal, 1100); }   // hold, then dissolve into the card like V1
  };
  flyRaf = requestAnimationFrame(tick);
}

// ---------- envelope (V3 + V4): one rAF clock drives every part ----------
const ENV = { W: 150, H: 104 };
const ENV_HTML = `<span class="env-shadow"></span>
  <svg class="env-back" viewBox="0 0 104 72"><rect x=".5" y=".5" width="103" height="71" rx="10" /></svg>
  <img class="env-logo" src="${A}logo-netflix.png" alt="">
  <svg class="env-front" viewBox="0 0 104 72"><defs><linearGradient id="envG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f2f5f9"/></linearGradient></defs>
    <path class="ef-body" d="M.5 9.5 L49.6 44.6 a4 4 0 0 0 4.8 0 L103.5 9.5 V61.5 a10 10 0 0 1 -10 10 H10.5 a10 10 0 0 1 -10 -10 Z" fill="url(#envG)" />
    <path class="ef-fold" d="M3.5 69 L44 41.5 M100.5 69 L60 41.5" /></svg>
  <svg class="env-flap" viewBox="0 0 104 46"><path d="M.5 10 a9.5 9.5 0 0 1 9.5 -9.5 H94 a9.5 9.5 0 0 1 9.5 9.5 L55.2 43.4 a5.5 5.5 0 0 1 -6.4 0 Z" /></svg>
  <span class="env-seal"><svg viewBox="0 0 20 20"><path d="M5.5 10.4l3 3 6-6.4" /></svg></span>`;
document.querySelectorAll('[data-env]').forEach(el => { el.innerHTML = ENV_HTML; });
const smooth = x => x * x * x * (x * (x * 6 - 15) + 10);                // smootherstep: zero speed and acceleration at both ends

// t in ms; g = { root, cx, cy, tx, ty, ky, base, end, scrim }
function envRender(t, g) {
  const q = sel => g.root.querySelector(sel);
  const env = q('.env'), logo = q('.env-logo'), flap = q('.env-flap'), seal = q('.env-seal'), shadow = q('.env-shadow');
  const [fa, fb] = g.flight || [1560, 2240];
  if (g.scrim) g.scrim.style.opacity = smooth(seg(t, 0, 320)) * (1 - smooth(seg(t, fa + 60, fb - 80)));
  // rise in -> hold -> one smooth arc to the target (scale + gentle roll), fading only at the very end
  const rise = seg(t, 0, 520), flight = seg(t, fa, fb), f = g.ease ? g.ease(flight) : smooth(flight);
  const bx = lerp(g.cx, g.tx, f), by = (1 - f) * (1 - f) * g.cy + 2 * (1 - f) * f * g.ky + f * f * g.ty;
  const sc = g.base * lerp(.8, 1, easeOutBack(rise)) * lerp(1, g.end, smooth(g.late ? Math.pow(flight, 1.8) : Math.min(1, flight * 1.1)));
  const lift = (1 - smooth(rise)) * 40 + Math.sin(Math.PI * seg(t, fa - 180, fa + 60)) * -6;   // small lift just before take-off
  const rot = Math.sin(Math.PI * f) * -12;
  env.style.transform = `translate3d(${bx - ENV.W / 2}px, ${by - ENV.H / 2 + lift}px, 0) rotate(${rot}deg) scale(${sc})`;
  env.style.opacity = smooth(rise) * (1 - smooth(seg(t, fb - 160, fb)));
  shadow.style.opacity = 1 - smooth(seg(t, fa, fa + 240));
  g.pos = [bx, by]; g.f = f;
  // logo pops above the open envelope, then drops in behind the pocket
  const pop = seg(t, 180, 600), drop = seg(t, 660, 1060), d = smooth(drop);
  const ly = lerp(-58, 50, d), ls = easeOutBack(pop) * lerp(1, .8, d), lr = lerp(-10, 0, smooth(pop)) + Math.sin(Math.PI * d) * 5;
  logo.style.transform = `translate3d(${ENV.W / 2 - 31}px, ${ly - 31}px, 0) rotate(${lr}deg) scale(${ls})`;
  // flap folds shut in 3D
  const ang = lerp(180, 0, smooth(seg(t, 1040, 1380)));
  flap.style.transform = `rotateX(${ang}deg)`;
  flap.style.zIndex = ang < 90 ? 4 : 1;
  logo.style.opacity = smooth(pop) * (1 - smooth(seg(t, 1060, 1180)));
  // green seal stamps on
  const st = seg(t, 1330, 1560);
  seal.style.transform = `scale(${easeOutBack(st)})`; seal.style.opacity = smooth(st);
}

// V3: no popup, the envelope is delivered to the member photo on the card
const v3 = document.getElementById('v3');
let envRaf = 0;
function playEnvelope(key) {
  cancelAnimationFrame(envRaf);
  const scope = sheet.classList.contains('open') ? sheet : screens[current];
  const card = scope.querySelector(`[data-remind="${key}"]`)?.closest('.bcard');
  const avEl = card?.querySelector('.av36');
  const d = device.getBoundingClientRect(), k = device.offsetWidth / d.width, H = device.offsetHeight;
  v3.querySelector('.env-logo').src = A + BENEFITS[key.split(':')[0]].logo;
  v3.querySelector('.env').style.setProperty('--brand', BRAND[key.split(':')[0]] || '#E50914');
  const r = avEl?.getBoundingClientRect();
  const onScreen = r && r.top > d.top + 40 && r.bottom < d.bottom - 40;
  const tx = onScreen ? (r.left + r.width / 2 - d.left) * k : 187.5, ty = onScreen ? (r.top + r.height / 2 - d.top) * k : H - 140;
  const g = { root: v3, scrim: v3.querySelector('.v3-scrim'), cx: 187.5, cy: H * .45, tx, ty, ky: Math.min(H * .45, ty) - 170, base: 1, end: .16 };
  v3.classList.add('on'); envRender(0, g);
  const deliver = () => {
    if (key) document.querySelectorAll(`[data-remind="${key}"]`).forEach(btn => { btn.outerHTML = remindBtn(key, true); });
    if (!onScreen) return;
    navigator.vibrate?.(12);
    avEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)', offset: .35 }, { transform: 'scale(.95)', offset: .65 }, { transform: 'scale(1)' }], { duration: 640, easing: 'cubic-bezier(.2,.8,.2,1)' });
    const ring = v3.querySelector('.v3-ring'), chip = v3.querySelector('.v3-chip');
    ring.animate([{ transform: `translate3d(${tx}px, ${ty}px, 0) scale(1)`, opacity: .9 }, { transform: `translate3d(${tx}px, ${ty}px, 0) scale(2.2)`, opacity: 0 }], { duration: 760, easing: 'cubic-bezier(.2,.8,.2,1)' });
    const cw = chip.offsetWidth || 54;
    chip.animate([
      { transform: `translate3d(${tx - cw / 2}px, ${ty - 26}px, 0) scale(.6)`, opacity: 0 },
      { transform: `translate3d(${tx - cw / 2}px, ${ty - 42}px, 0) scale(1.05)`, opacity: 1, offset: .22 },
      { transform: `translate3d(${tx - cw / 2}px, ${ty - 40}px, 0) scale(1)`, opacity: 1, offset: .32 },
      { transform: `translate3d(${tx - cw / 2}px, ${ty - 40}px, 0) scale(1)`, opacity: 1, offset: .8 },
      { transform: `translate3d(${tx - cw / 2}px, ${ty - 52}px, 0) scale(.96)`, opacity: 0 },
    ], { duration: 1500, easing: 'cubic-bezier(.22,1,.36,1)' });
    burst(avEl, 'soft');
    card.animate([{ boxShadow: '0 0 0 0 rgba(54,194,124,0)' }, { boxShadow: '0 0 0 3px rgba(54,194,124,.25), 0 10px 24px rgba(54,194,124,.12)', offset: .35 }, { boxShadow: '0 0 0 0 rgba(54,194,124,0)' }], { duration: 900, easing: 'ease-out' });
  };
  if (reduce) { deliver(); v3.classList.remove('on'); return; }
  const t0 = performance.now(); let delivered = false;
  const tick = now => {
    const t = now - t0;
    envRender(t, g);
    if (t >= 2200 && !delivered) { delivered = true; deliver(); }
    if (t < 2260) envRaf = requestAnimationFrame(tick);
    else setTimeout(() => v3.classList.remove('on'), 1550);
  };
  envRaf = requestAnimationFrame(tick);
  window.__envFreeze = ms => { cancelAnimationFrame(envRaf); envRender(ms, g); };
  window.__envDeliver = ms => { cancelAnimationFrame(envRaf); envRender(2300, g); deliver(); document.getAnimations().forEach(an => { an.pause(); an.currentTime = ms; }); };
}

// V4: V3's envelope inside the V1 popup. The member waits on the right; the sealed envelope flies a soft arc
// onto them (like V2), the badge snaps on, the member glides to centre with a halo + confetti, then it dissolves into the card.
const V4 = { ENV: [96, 86], AV: [258, 76], CENTER: [155.5, 76], CTRL: -6, FLIGHT: [1600, 2440], DOTS: 30 };
let v4Raf = 0, flyTick = 0;
const v4Arc = (u, g) => { const x = lerp(g.cx, g.tx, u); const y = (1 - u) * (1 - u) * g.cy + 2 * (1 - u) * u * g.ky + u * u * g.ty; return [x, y]; };
function v4Render(t, g) {
  envRender(t, g);
  const q = sel => g.root.querySelector(sel);
  const me = q('.v4-me'), badge = q('.v4-badge'), halo = q('.v4-halo'), waits = g.root.querySelectorAll('.v4-wait'), burstRing = q('.v4-burst');
  const [fa, fb] = V4.FLIGHT;
  const avIn = seg(t, 120, 560), land = seg(t, fb - 60, fb + 300), centre = seg(t, fb + 220, fb + 820);
  const c = smooth(centre), hit = Math.sin(Math.PI * land) * (1 - land) * .16;
  const s = lerp(1, 1.38, c) * (1 - hit) * lerp(.6, 1, easeOutBack(avIn));
  const ax = lerp(V4.AV[0], V4.CENTER[0], c), ay = V4.AV[1];
  me.style.transform = `translate3d(${ax - 26}px, ${ay - 26}px, 0) scale(${s})`; me.style.opacity = smooth(avIn);
  const b = seg(t, fb - 40, fb + 300);
  badge.style.transform = `scale(${easeOutBack(b)}) rotate(${lerp(-24, 0, smooth(b))}deg)`; badge.style.opacity = smooth(b);
  // the member 'waits' with soft ripples until the envelope lands
  const waitOn = smooth(seg(t, 300, 700)) * (1 - smooth(seg(t, fb - 200, fb + 40)));
  waits.forEach((w, i) => { const ph = ((t / 1250) + i * .5) % 1;
    w.style.transform = `translate3d(${ax - 26}px, ${ay - 26}px, 0) scale(${lerp(1, 1.75, easeOut(ph))})`; w.style.opacity = (1 - ph) * .55 * waitOn; });
  // landing: a crisp ring bursts out of the member
  const br = seg(t, fb - 20, fb + 520);
  burstRing.style.opacity = 0;
  const h = easeOut(seg(t, fb + 560, fb + 960));
  halo.style.transform = `translate3d(${ax - 38}px, ${ay - 38}px, 0) scale(${lerp(.7, 1.42, h)})`; halo.style.opacity = h;
}
function playV4() {
  running.forEach(a => a.cancel()); running = [];
  cancelAnimationFrame(v4Raf); clearTimeout(autoClose);
  const root = modal.querySelector('.v4stage');
  const g = { root, cx: V4.ENV[0], cy: V4.ENV[1], tx: V4.AV[0], ty: V4.AV[1], ky: V4.CTRL, base: .6, end: .14, flight: V4.FLIGHT, ease: easeInOutSine, late: true };
  v4Render(0, g);
  running.push({ cancel: () => cancelAnimationFrame(v4Raf), pause() { this.cancel(); }, set currentTime(v) { v4Render(v, g); } });
  const END = V4.FLIGHT[1] + 1000;
  if (reduce) { v4Render(END, g); finishReveal(); return; }
  const t0 = performance.now() + 140; let sparked = false, boomed = false;
  const tick = now => {
    const t = Math.max(0, now - t0);
    v4Render(t, g);
    if (t > V4.FLIGHT[0] + 60 && t < V4.FLIGHT[1] - 60 && g.pos) {        // sparkle trail behind the envelope
      const d = device.getBoundingClientRect(), k = device.offsetWidth / d.width, rr = root.getBoundingClientRect();
      if ((flyTick = (flyTick + 1) % 5) === 0) sparkAt((rr.left - d.left) * k + g.pos[0], (rr.top - d.top) * k + g.pos[1], 1);
    }
    if (t >= V4.FLIGHT[1] - 40 && !sparked) { sparked = true; navigator.vibrate?.(10); burst(root.querySelector('.v4-badge'), 'soft'); }
    if (t >= V4.FLIGHT[1] + 700 && !boomed) { boomed = true; burst(root.querySelector('.v4-me'), 'light'); }
    if (t < END && modal.classList.contains('open')) v4Raf = requestAnimationFrame(tick);
    else if (modal.classList.contains('open')) { clearTimeout(autoClose); autoClose = setTimeout(closeModal, 1000); }
  };
  v4Raf = requestAnimationFrame(tick);
}

// ---------- V5: one element at a time, in the air; nothing plays on the card ----------
// dim -> big half-envelope rises from the bottom -> big logo pops mid-screen -> dives in -> flap + seal
// -> envelope lifts, shrinking, to the centre where the profile appears -> tucks into it -> badge -> line -> dissolve
const V5T = { dim: [0, 450], rise: [250, 1050], pop: [950, 1450], dive: [1700, 2300], flap: [2300, 2750], seal: [2700, 2980],
  lift: [3050, 3980], prof: [3250, 3800], tuck: [3820, 4180], badge: [4180, 4520], label: [4400, 4750], out: [5500, 6050] };
let v5Raf = 0, v5Tick = 0;
function v5Render(t, g) {
  const q = sel => v3.querySelector(sel);
  const env = q('.env'), logo = q('.env-logo'), flap = q('.env-flap'), seal = q('.env-seal'), shadow = q('.env-shadow');
  const me = q('.v5-me'), badge = q('.v5-badge'), label = q('.v5-label'), waits = v3.querySelectorAll('.v5-wait'), scrim = q('.v3-scrim');
  const S = k => seg(t, V5T[k][0], V5T[k][1]);
  const out = smooth(S('out'));
  scrim.style.opacity = smooth(S('dim')) * (1 - out);
  // envelope: rises to half-visible at the bottom (big), later lifts to the centre while shrinking, then tucks into the profile
  const rise = smooth(S('rise')), lift = smooth(S('lift')), tuck = smooth(S('tuck'));
  const BIG = g.big, MID = .42;
  let by = lerp(g.H + 130, g.H + 6, rise);
  by = lerp(by, g.my + 18, lift);
  by = lerp(by, g.my, tuck);
  const sc = lerp(lerp(BIG, MID, lift), .1, tuck);
  const rot = Math.sin(Math.PI * lift) * -7;
  env.style.transform = `translate3d(${187.5 - ENV.W / 2}px, ${by - ENV.H / 2}px, 0) rotate(${rot}deg) scale(${sc})`;
  env.style.opacity = smooth(S('rise')) * (1 - smooth(seg(t, V5T.tuck[0], V5T.tuck[1])));
  shadow.style.opacity = 0;
  g.pos = [187.5, by];
  // logo: pops big in the middle of the screen, floats, then dives into the envelope
  const pop = S('pop'), dive = smooth(S('dive'));
  const startLy = 52 + (g.my - (g.H + 6)) / BIG;                         // env-local y that sits at screen centre
  const hover = Math.sin(Math.max(0, t - V5T.pop[1]) / 380) * 4 * (1 - dive);
  const ly = lerp(startLy, 50, dive) + hover / BIG;
  const ls = easeOutBack(pop) * lerp(1.08, .8, dive);
  const lr = lerp(-8, 0, smooth(pop)) + Math.sin(Math.PI * dive) * 4;
  logo.style.transform = `translate3d(${ENV.W / 2 - 31}px, ${ly - 31}px, 0) rotate(${lr}deg) scale(${ls})`;
  // flap closes (3D), logo tucked away under it, then the seal
  const ang = lerp(180, 0, smooth(S('flap')));
  flap.style.transform = `rotateX(${ang}deg)`; flap.style.zIndex = ang < 90 ? 4 : 1;
  logo.style.opacity = smooth(pop) * (1 - smooth(seg(t, V5T.flap[0] + 40, V5T.flap[0] + 220)));
  const st = S('seal');
  seal.style.transform = `scale(${easeOutBack(st)})`; seal.style.opacity = smooth(st);
  // profile: appears in the centre only once the envelope is on its way, waits with ripples, takes the envelope
  const pIn = S('prof'), land = seg(t, V5T.tuck[1] - 60, V5T.tuck[1] + 320);
  const hit = Math.sin(Math.PI * land) * (1 - land) * .12;
  const ps = 1.5 * lerp(.55, 1, easeOutBack(pIn)) * (1 - hit) * lerp(1, 1.06, out);
  me.style.transform = `translate3d(${187.5 - 32}px, ${g.my - 32}px, 0) scale(${ps})`;
  me.style.opacity = smooth(pIn) * (1 - out);
  const b = S('badge');
  badge.style.transform = `scale(${easeOutBack(b)}) rotate(${lerp(-24, 0, smooth(b))}deg)`; badge.style.opacity = smooth(b);
  const waitOn = smooth(seg(t, V5T.prof[0] + 200, V5T.prof[1] + 100)) * (1 - smooth(seg(t, V5T.tuck[0], V5T.tuck[1])));
  waits.forEach((w, i) => { const ph = ((t / 1300) + i * .5) % 1;
    w.style.transform = `translate3d(${187.5 - 32}px, ${g.my - 32}px, 0) scale(${1.5 * lerp(1, 1.55, easeOut(ph))})`; w.style.opacity = (1 - ph) * .6 * waitOn; });
  const l = S('label'), lw = label.offsetWidth || 180;
  label.style.transform = `translate3d(${187.5 - lw / 2}px, ${g.my + 48 + 18 + (1 - smooth(l)) * 10}px, 0)`;
  label.style.opacity = smooth(l) * (1 - out);
}
function playV5(key) {
  cancelAnimationFrame(v5Raf);
  const [b, p] = key.split(':');
  const avSrc = document.querySelector(`[data-remind="${key}"]`)?.closest('.bcard')?.querySelector('.av36 img')?.getAttribute('src') || A + PEOPLE[p].avatar;
  v3.querySelector('.v5-av').src = avSrc;
  v3.querySelector('.v5-badge').src = v3.querySelector('.env-logo').src = A + BENEFITS[b].logo;
  v3.querySelector('.v5-label').textContent = `Reminder sent to ${PEOPLE[p].short}`;
  const H = device.offsetHeight;
  const g = { H, my: H * .42, big: 2.25 };
  const END = V5T.out[1] + 40;
  v3.classList.add('on', 'v5'); v5Render(0, g);
  const finish = () => { v3.classList.remove('on', 'v5'); document.querySelectorAll(`[data-remind="${key}"]`).forEach(btn => { btn.outerHTML = remindBtn(key, true); }); };
  if (reduce) { finish(); return; }
  const t0 = performance.now(); let sparked = false;
  const tick = now => {
    const t = now - t0;
    v5Render(t, g);
    if (t > V5T.lift[0] + 120 && t < V5T.tuck[0] && (v5Tick = (v5Tick + 1) % 6) === 0) sparkAt(g.pos[0], g.pos[1], 1);
    if (t >= V5T.tuck[1] - 40 && !sparked) { sparked = true; navigator.vibrate?.(10); burst(v3.querySelector('.v5-badge'), 'soft'); }
    if (t < END) v5Raf = requestAnimationFrame(tick); else finish();
  };
  v5Raf = requestAnimationFrame(tick);
  window.__v5Freeze = ms => { cancelAnimationFrame(v5Raf); v5Render(ms, g); };
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
      w: 4 + Math.random() * 3.5, h: 6 + Math.random() * 5, c: COLORS[i % COLORS.length], shape: Math.random() < .28 ? 'dot' : Math.random() < .5 ? 'rect' : 'ribbon',
      life: 0, max: 70 + Math.random() * 35, tilt: Math.random() * 6.28 });
  } };
  if (mode === 'light') {                                     // V4: a small, tidy burst from the member only
    add(12, ox, oy, Math.PI * .9, -Math.PI / 2, 6.5);
  } else if (mode === 'soft') {                                      // V2: a light sparkle off the docking point
    const n0 = parts.length; add(12, ox, oy, Math.PI * 2, 0, 4.2);
    for (let i = n0; i < parts.length; i++) { const p = parts[i]; p.c = SOFT[i % SOFT.length]; p.g *= .45; p.w *= .7; p.h *= .7; p.max *= .7; }
  } else {
    add(18, ox, oy, Math.PI * 1.0, -Math.PI / 2, 7.5);        // V1: one small burst from the member
  }
  confettiLoop();
}
function confettiLoop() {
  const dpr = Math.min(3, devicePixelRatio || 1), W = device.offsetWidth, H = device.offsetHeight;
  if (cvs.width !== W * dpr) { cvs.width = W * dpr; cvs.height = H * dpr; }
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

// trail sparkle: a few tiny twinkles at a point (device coords)
const TRAIL = ['#FFC145', '#FFD98A', '#4CC98C', '#9BE3BF'];
function sparkAt(x, y, n, extra) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, v = .4 + Math.random() * 1.1;
    parts.push({ x: x + (Math.random() - .5) * 10, y: y + (Math.random() - .5) * 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v - .2, g: .03, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .2,
      w: 2.5 + Math.random() * 3, h: 2.5 + Math.random() * 3, c: (Math.random() < .25 && extra) ? extra : TRAIL[(Math.random() * TRAIL.length) | 0], shape: Math.random() < .6 ? 'dot' : 'rect', life: 0, max: 26 + Math.random() * 22, tilt: 0 });
  }
  confettiLoop();
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
  if (shot === 'v5') { addEventListener('load', () => setTimeout(() => { VER = 5; sendReminder('netflix:shree'); const ft = +new URLSearchParams(location.search).get('t'); if (ft) window.__v5Freeze(ft); }, 60)); }
  if (shot === 'env') { addEventListener('load', () => setTimeout(() => { VER = 3; sendReminder('netflix:shree'); const ft = +new URLSearchParams(location.search).get('t'); const dv = new URLSearchParams(location.search).get('deliver'); if (dv) window.__envDeliver(+dv); else if (ft) window.__envFreeze(ft); }, 60)); }
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
