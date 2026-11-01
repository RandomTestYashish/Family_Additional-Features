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
    else { root.style.setProperty('--s', Math.min(1, (vh - 48) / (H + 20), (vw - 48) / (W + 20))); root.style.removeProperty('--dh'); }
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
// fake countdown: every copy of a tag reads the same clock, so home / sheet / detail stay in sync
const T0 = Date.now();
const left = b => Math.max(0, BENEFITS[b].timer - Math.floor((Date.now() - T0) / 1000));
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
}, 1000);

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
function sendReminder(key) {
  const [b, p] = key.split(':');
  sent.add(key);
  pendingKey = key;                       // the card flips to "sent" once the popup closes, so the user sees it happen
  document.getElementById('modalText').innerHTML = `${PEOPLE[p].full} has been notified about<br>the ${BENEFITS[b].name} benefit.`;
  const av = document.getElementById('rvAvatar'), logo = document.getElementById('rvLogo');
  av.src = A + (document.querySelector(`[data-remind="${key}"]`)?.closest('.bcard')?.querySelector('.av36 img')?.getAttribute('src')?.replace(A, '') || PEOPLE[p].avatar);
  logo.src = A + BENEFITS[b].logo;
  modal.classList.remove('closing');
  open(modal);
  playReveal();
}

function closeModal() {
  if (!modal.classList.contains('open')) return;
  clearTimeout(autoClose);
  modal.classList.add('closing');
  setTimeout(() => {
    close(modal); modal.classList.remove('closing');
    if (pendingKey) {
      const key = pendingKey; pendingKey = null;
      document.querySelectorAll(`[data-remind="${key}"]`).forEach(btn => { btn.outerHTML = remindBtn(key, true); });
    }
  }, 220);
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
function finishReveal() { clearTimeout(autoClose); autoClose = setTimeout(closeModal, 2400); }

// ---------- confetti (canvas inside the 375 x 812 frame) ----------
const cvs = document.getElementById('confetti'), ctx = cvs.getContext('2d');
let parts = [], raf = 0;
const COLORS = ['#E50914', '#FF5A5F', '#FFC145', '#2EC4B6', '#3A86FF', '#8338EC', '#FF8FAB', '#06D6A0'];
function burst(fromEl) {
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
  add(70, ox, oy, Math.PI * 1.25, -Math.PI / 2, 11);          // main burst from the member
  add(26, 24, oy + 40, Math.PI / 3, -Math.PI / 3, 12);        // side cannons
  add(26, W - 24, oy + 40, Math.PI / 3, -Math.PI * 2 / 3, 12);
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
  const t = e.target.closest('[data-close-modal], button, [data-close-sheet], .tap');
  if (!t) return;
  if (t.dataset.remind && !t.disabled) return sendReminder(t.dataset.remind);
  if (t.hasAttribute('data-open-sheet')) { chip = null; renderSheet(); sheet.querySelector('.sheet-scroll').scrollTop = 0; return open(sheet); }
  if (t.hasAttribute('data-close-sheet')) return close(sheet);
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
    if (ft !== null) { clearTimeout(autoClose); running.forEach(an => { an.pause(); an.currentTime = +ft; }); } }
  const full = false, y = +new URLSearchParams(location.search).get('y') || 0;
  addEventListener('load', () => { screens[current].querySelector('.scroll').scrollTop = y; });
  const set = () => {
    const sc = screens[current].querySelector('.scroll');
    root.style.setProperty('--s', 1);
    root.style.setProperty('--dh', (full ? Math.max(sc.scrollHeight, shot === 'home' ? 2383 : 1760) : 812) + 'px');
  };
  set(); requestAnimationFrame(set); addEventListener('load', set); addEventListener('resize', () => setTimeout(set));
})();
