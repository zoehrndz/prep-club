/* =========================================================
   PREP CLUB — Routeur & initialisation
   ========================================================= */
'use strict';

const NAV_MAP = { '': 'home', menu: 'menu', product: 'menu', formulas: 'formulas', build: 'formulas', planner: 'planner', seasonal: 'seasonal', discovery: 'discovery', story: 'story' };

const ROUTE_KEYS = Object.fromEntries(Object.entries(SLUGS).map(([k, v]) => [v, k]));
const PARAM_KEYS = Object.fromEntries(Object.entries(SUB_SLUGS).map(([k, v]) => [v, k]));

let lastHash = null;
function router() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [slug, ...rawParams] = hash.split('/').map(decodeURIComponent);
  const name = ROUTE_KEYS[slug] || slug;
  const params = rawParams.map((p) => PARAM_KEYS[p] || p);
  const key = name || 'home';
  const view = VIEWS[key] || VIEWS.notfound;
  const app = $('#app');
  document.title = view.title || 'PREP CLUB';
  app.innerHTML = view.render(...params);
  if (view.mount) view.mount(...params);
  $$('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === ((view.nav ? view.nav(...params) : NAV_MAP[name || '']) || '')));
  document.body.classList.toggle('on-hero', key === 'home');
  closeNav();
  const same = location.hash === lastHash;
  lastHash = location.hash;
  Motion.onRoute(same);
}

function closeNav() {
  $('#nav').classList.remove('open');
  $('#burger').setAttribute('aria-expanded', 'false');
}

/* ---------- Délégation d'événements globaux ---------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-formula-add],[data-add],[data-fav],[data-add-discovery],[data-subscribe],[data-close-modal],[data-close-drawer],[data-remove],[data-line] button,[data-cookie]');
  if (!t) return;
  if (t.matches('[data-formula-add]')) { e.preventDefault(); const b = findBox(t.dataset.formulaAdd); addBoxToBasket(b, b.items); return; }
  if (t.matches('[data-add]')) { e.preventDefault(); addProduct(t.dataset.add); return; }
  if (t.matches('[data-fav]')) { e.preventDefault(); toggleFav(t.dataset.fav); return; }
  if (t.matches('[data-add-discovery]')) { e.preventDefault(); addDiscovery(t.dataset.addDiscovery); return; }
  if (t.matches('[data-subscribe]')) { e.preventDefault(); subscribeModal(t.dataset.subscribe); return; }
  if (t.matches('[data-close-modal]')) { closeModal(); return; }
  if (t.matches('[data-close-drawer]')) { closeDrawer(); return; }
  if (t.matches('[data-remove]')) { setLineQty(t.dataset.remove, 0); return; }
  if (t.matches('[data-line] button')) {
    const key = t.closest('[data-line]').dataset.line;
    const line = S.basket.find((l) => l.key === key);
    if (line) setLineQty(key, line.qty + Number(t.dataset.q));
    return;
  }
  if (t.matches('[data-cookie]')) {
    S.cookie = t.dataset.cookie;
    save();
    $('#cookie').hidden = true;
  }
});

document.addEventListener('submit', (e) => {
  const f = e.target;
  if (f.matches('[data-form="newsletter"]')) {
    e.preventDefault();
    S.newsletter = f.email.value.trim();
    S.comms.newsletter = true;
    save();
    f.outerHTML = newsletterForm();
    toast('Bienvenue dans La Prep de la Semaine !');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#modal').hidden) closeModal();
  else if ($('#drawer').classList.contains('open')) closeDrawer();
  else closeNav();
});

/* ---------- Initialisation ---------- */
$('#basketBtn').addEventListener('click', openDrawer);
$('#drawerClose').addEventListener('click', closeDrawer);
$('#drawerOverlay').addEventListener('click', closeDrawer);
$('#burger').addEventListener('click', () => {
  const open = $('#nav').classList.toggle('open');
  $('#burger').setAttribute('aria-expanded', String(open));
});
$('#cookieSettings').addEventListener('click', () => { $('#cookie').hidden = false; });
window.addEventListener('hashchange', (e) => {
  const top = (u) => (u.split('#/')[1] || '').split('/')[0];
  const go = () => { router(); window.scrollTo(0, 0); };
  if (top(e.oldURL) === top(e.newURL)) go();
  else Motion.transition(go);
});

if (!S.cookie) $('#cookie').hidden = false;
updateBadges();
renderDrawer();
router();
