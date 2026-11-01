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

function sendReminder(key) {
  const [b, p] = key.split(':');
  sent.add(key);
  document.querySelectorAll(`[data-remind="${key}"]`).forEach(btn => { btn.outerHTML = remindBtn(key, true); });
  document.getElementById('modalText').innerHTML = `${PEOPLE[p].full} has been notified about<br>the ${BENEFITS[b].name} benefit.`;
  open(modal);
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
  const t = e.target.closest('button, [data-close-sheet], [data-close-modal], .tap');
  if (!t) return;
  if (t.dataset.remind && !t.disabled) return sendReminder(t.dataset.remind);
  if (t.hasAttribute('data-open-sheet')) { chip = null; renderSheet(); sheet.querySelector('.sheet-scroll').scrollTop = 0; return open(sheet); }
  if (t.hasAttribute('data-close-sheet')) return close(sheet);
  if (t.hasAttribute('data-close-modal')) return close(modal);
  if (t.dataset.chip) { chip = chip === t.dataset.chip ? null : t.dataset.chip; return renderSheet(); }
  if (t.dataset.go) return go(t.dataset.go);
  if (t.hasAttribute('data-add')) { t.textContent = 'Added ✓'; t.disabled = true; return toast('1 GB Data Loan added'); }
});

addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (modal.classList.contains('open')) close(modal);
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
  if (shot === 'modal') sendReminder('netflix:shree');
  const full = false, y = +new URLSearchParams(location.search).get('y') || 0;
  addEventListener('load', () => { screens[current].querySelector('.scroll').scrollTop = y; });
  const set = () => {
    const sc = screens[current].querySelector('.scroll');
    root.style.setProperty('--s', 1);
    root.style.setProperty('--dh', (full ? Math.max(sc.scrollHeight, shot === 'home' ? 2383 : 1760) : 812) + 'px');
  };
  set(); requestAnimationFrame(set); addEventListener('load', set); addEventListener('resize', () => setTimeout(set));
})();
