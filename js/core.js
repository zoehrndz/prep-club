/* =========================================================
   PREP CLUB — Cœur de l'application
   Utilitaires, état (localStorage), prix, panier, composants communs
   ========================================================= */
'use strict';

const VIEWS = {};

/* ---------- Adresses des pages en français (clé interne → slug affiché) ---------- */
const SLUGS = {
  menu: 'carte', product: 'produit', formulas: 'formules', build: 'composer-ma-box', planner: 'planning',
  seasonal: 'collection-de-saison', discovery: 'box-decouverte', story: 'notre-histoire', club: 'abonnement-club',
  producers: 'nos-producteurs', account: 'mon-compte', favorites: 'mes-favoris', checkout: 'commande', order: 'confirmation',
  delivery: 'livraison', loyalty: 'fidelite', terms: 'cgv', privacy: 'confidentialite', legal: 'mentions-legales',
};
const SUB_SLUGS = {
  dashboard: 'tableau-de-bord', orders: 'commandes', planner: 'plannings', membership: 'abonnement', favorites: 'favoris',
  preferences: 'preferences', addresses: 'adresses', rewards: 'recompenses', settings: 'parametres',
  breakfast: 'petit-dejeuner', lunch: 'dejeuner', dinner: 'diner', snack: 'en-cas', dessert: 'desserts',
  vegetarian: 'vegetarien', seasonal: 'de-saison', bestseller: 'meilleures-ventes', new: 'nouveautes', all: 'tout',
  spring: 'printemps', summer: 'ete', autumn: 'automne', winter: 'hiver',
};

/* ---------- Utilitaires ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (v) => (Math.round(v * 100) / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const round2 = (v) => Math.round(v * 100) / 100;
const imgUrl = (id, w = 900) => (/^(https?:|data:)/.test(id) ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`);
const pic = (id, alt = '', w = 900, cls = '') => `<img ${cls ? `class="${cls}"` : ''} src="${imgUrl(id, w)}" alt="${esc(alt)}" loading="lazy" onerror="this.style.visibility='hidden'">`;
const P = (id) => PRODUCTS.find((p) => p.id === id) || (typeof HIDDEN_PRODUCTS !== 'undefined' ? HIDDEN_PRODUCTS.find((p) => p.id === id) : undefined);
const PROD = (id) => PRODUCERS.find((p) => p.id === id);
const isMain = (p) => p.cat === 'lunch' || p.cat === 'dinner';
const kcalPortion = (p) => Math.round((p.nutri.kcal * p.weight) / 100);
const protPortion = (p) => Math.round((p.nutri.protein * p.weight) / 10) / 10;
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- Dates ---------- */
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromIso = (s) => new Date(`${s}T00:00:00`);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const fmtDate = (d, opts = { day: 'numeric', month: 'long', year: 'numeric' }) => (typeof d === 'string' ? new Date(d.length === 10 ? `${d}T00:00:00` : d) : d).toLocaleDateString('fr-FR', opts);
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/* ---------- État persistant ---------- */
const STORE_KEY = 'prepclub:v1';
const defaultState = () => ({
  basket: [],
  favorites: [],
  user: null,
  membership: null,
  orders: [],
  plans: {},
  savedPlanners: [],
  prefs: { diet: 'none', likes: '', dislikes: '', meals: ['breakfast', 'lunch', 'dinner'], portion: 'classic', apply: false, allergyConsent: false, allergies: [] },
  addresses: [],
  points: 0,
  pointsLog: [],
  newsletter: null,
  comms: { newsletter: false, sms: false, offers: false },
  cookie: null,
  promo: null,
  reward: null,
  reviews: {},
});
let S = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const data = JSON.parse(raw);
    const base = defaultState();
    return { ...base, ...data, prefs: { ...base.prefs, ...(data.prefs || {}) } };
  } catch (e) {
    return defaultState();
  }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* stockage indisponible : l'état reste en mémoire */ }
  updateBadges();
}

/* ---------- Abonnement ---------- */
function memberTier() {
  if (!S.membership || S.membership.status !== 'active') return null;
  return MEMBERSHIPS.find((m) => m.id === S.membership.tier) || null;
}
function pointsMultiplier() {
  const t = memberTier();
  if (!t) return 1;
  return t.id === 'essential' ? 1.5 : 2;
}

/* ---------- Préférences & allergies ---------- */
function allergyHits(p) {
  if (!S.prefs.allergyConsent || !S.prefs.allergies.length) return [];
  return p.allergens.filter((a) => S.prefs.allergies.includes(a));
}
function matchesPrefs(p) {
  const pr = S.prefs;
  if (pr.diet === 'vegetarian' && !p.tags.includes('vegetarian')) return false;
  if (pr.diet === 'vegan' && (!p.tags.includes('vegetarian') || p.allergens.includes('Lait') || p.allergens.includes('Œufs') || /miel/i.test(p.ingredients))) return false;
  const dislikes = pr.dislikes.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (dislikes.some((d) => p.ingredients.toLowerCase().includes(d) || p.name.toLowerCase().includes(d))) return false;
  return true;
}

/* ---------- Prix & options ---------- */
function unitPrice(p, opts = {}) {
  let price = p.price;
  if (isMain(p)) {
    const portion = OPTIONS.main.portion.find((x) => x.id === opts.portion);
    const side = OPTIONS.main.sides.find((x) => x.id === opts.side);
    if (portion) price += portion.price;
    if (side) price += side.price;
    if (opts.protein) price += OPTIONS.main.extraProtein;
  }
  if (p.cat === 'breakfast') {
    const t = OPTIONS.breakfast.toppings.find((x) => x.id === opts.topping);
    if (t) price += t.price;
  }
  return round2(price);
}
function optLabels(p, opts = {}) {
  const out = [];
  if (isMain(p)) {
    if (opts.portion === 'generous') out.push('Portion généreuse');
    if (opts.side && opts.side !== 'none') out.push(`+ ${OPTIONS.main.sides.find((x) => x.id === opts.side).label}`);
    if (opts.protein) out.push('+ Protéines');
    if (opts.sauceSide) out.push('Sauce à part');
  }
  if (p.cat === 'breakfast' && opts.topping && opts.topping !== 'none') out.push(`+ ${OPTIONS.breakfast.toppings.find((x) => x.id === opts.topping).label}`);
  if (opts.remove && opts.remove.length) out.push(`Sans ${opts.remove.join(', ').toLowerCase()}`);
  if (opts.comment) out.push(`« ${opts.comment} »`);
  return out;
}

/* ---------- Panier ---------- */
function addProduct(pid, qty = 1, opts = {}, silent = false) {
  const p = P(pid);
  if (!p) return;
  if (p.soldOut || !PRODUCTS.includes(p)) { if (!silent) toast(`${p.name} n’est pas disponible pour le moment`); return; }
  const clean = {};
  Object.keys(opts).sort().forEach((k) => {
    const v = opts[k];
    if (v === false || v === '' || v === 'none' || v === 'classic' || (Array.isArray(v) && !v.length)) return;
    clean[k] = v;
  });
  const key = `${pid}|${JSON.stringify(clean)}`;
  const line = S.basket.find((l) => l.key === key);
  if (line) line.qty += qty;
  else S.basket.push({ key, type: 'product', pid, opts: clean, qty, unit: unitPrice(p, clean), name: p.name, img: p.img, labels: optLabels(p, clean) });
  save();
  renderDrawer();
  if (!silent) toast(`${p.name} ajouté au panier`);
}
function addBox(box) {
  S.basket.push({ key: `box-${uid()}`, type: 'box', qty: 1, ...box });
  save();
  renderDrawer();
  toast(`${box.name} ajoutée au panier`);
}
function setLineQty(key, qty) {
  const line = S.basket.find((l) => l.key === key);
  if (!line) return;
  line.qty = qty;
  if (line.qty <= 0) S.basket = S.basket.filter((l) => l.key !== key);
  save();
  renderDrawer();
  if (location.hash.startsWith('#/commande')) router();
}
function basketCount() { return S.basket.reduce((a, l) => a + l.qty, 0); }

function totals(mode = null) {
  const sub = round2(S.basket.reduce((a, l) => a + l.unit * l.qty, 0));
  const tier = memberTier();
  const member = tier ? round2(sub * tier.discount) : 0;
  const promoDef = S.promo && PROMO_CODES[S.promo];
  const promo = promoDef ? round2((sub - member) * promoDef.pct) : 0;
  const reward = S.reward ? round2(Math.min(S.reward.value, sub - member - promo)) : 0;
  const net = round2(Math.max(0, sub - member - promo - reward));
  let delivery = 0;
  if (mode === 'home') {
    const free = net >= DELIVERY.freeFrom || (tier && tier.freeDelivery && net >= DELIVERY.premiumFreeFrom);
    delivery = free ? 0 : DELIVERY.homeFee;
  }
  return { sub, member, promo, promoDef, reward, net, delivery, total: round2(net + delivery), tier, count: basketCount() };
}

function totalsHtml(t, showDelivery) {
  return `<div class="totals">
    <div><span>Sous-total</span><span>${eur(t.sub)}</span></div>
    ${t.member ? `<div class="disc"><span>Remise Club ${esc(t.tier.name)} (−${t.tier.discount * 100} %)</span><span>−${eur(t.member)}</span></div>` : ''}
    ${t.promo ? `<div class="disc"><span>Code ${esc(S.promo)} — ${esc(t.promoDef.label)}</span><span>−${eur(t.promo)}</span></div>` : ''}
    ${t.reward ? `<div class="disc"><span>Récompense fidélité — ${esc(S.reward.label)}</span><span>−${eur(t.reward)}</span></div>` : ''}
    ${showDelivery === 'estimate' ? `<div><span>Livraison</span><span class="muted">calculée à l’étape suivante</span></div>` : ''}
    ${showDelivery === 'home' ? `<div><span>Livraison à domicile</span><span>${t.delivery ? eur(t.delivery) : 'Offerte'}</span></div>` : ''}
    ${showDelivery === 'pickup' ? `<div><span>Retrait sur place</span><span>Gratuit</span></div>` : ''}
    <div class="grand"><span>Total TTC</span><span>${eur(t.total)}</span></div>
  </div>`;
}

function applyPromo(code) {
  code = (code || '').trim().toUpperCase();
  if (!code) return;
  if (PROMO_CODES[code]) {
    S.promo = code;
    save();
    toast(`Code ${code} appliqué`);
  } else {
    toast('Ce code promo n’est pas valide');
  }
}

/* ---------- Favoris ---------- */
function toggleFav(pid) {
  if (S.favorites.includes(pid)) {
    S.favorites = S.favorites.filter((x) => x !== pid);
    toast('Retiré de vos favoris');
  } else {
    S.favorites.push(pid);
    toast('Ajouté à vos favoris');
  }
  save();
  $$(`[data-fav="${pid}"]`).forEach((b) => b.classList.toggle('on', S.favorites.includes(pid)));
}

/* ---------- Composants ---------- */
const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
const TAG_LABELS = { vegetarian: 'Végétarien', seasonal: 'De saison', bestseller: 'Meilleure vente', new: 'Nouveau' };

function productCard(p) {
  const fav = S.favorites.includes(p.id);
  const hits = allergyHits(p);
  const tags = p.tags.filter((t) => t !== 'weekly' && (t !== 'bestseller' || p.tags.length < 3)).slice(0, 2);
  return `<article class="card">
    <div class="media">
      <a href="#/produit/${p.id}" tabindex="-1" aria-hidden="true">${pic(p.img, p.name, 700)}</a>
      <div class="card__tags">${p.soldOut ? '<span class="tag">Épuisé</span>' : ''}${tags.map((t) => `<span class="tag ${t === 'vegetarian' ? 'tag--olive' : t === 'seasonal' ? 'tag--sand' : ''}">${TAG_LABELS[t]}</span>`).join('')}</div>
      <button class="fav ${fav ? 'on' : ''}" data-fav="${p.id}" aria-label="Ajouter ${esc(p.name)} aux favoris">${heart}</button>
    </div>
    <div class="card__body">
      <div class="card__cat">${CATEGORIES[p.cat]}</div>
      <h3 class="card__title"><a href="#/produit/${p.id}">${esc(p.name)}</a></h3>
      ${ratingOf(`produit:${p.id}`) ? `<div style="margin:-2px 0 8px">${ratingLine(`produit:${p.id}`)}</div>` : ''}
      <p class="card__desc">${esc(p.short)}</p>
      <div class="nutri-chips"><span>${kcalPortion(p)} kcal</span><span>${protPortion(p)} g protéines</span><span>${p.weight} g</span></div>
      ${hits.length ? `<div class="notice notice--warn">Contient : ${hits.join(', ')}</div>` : ''}
      <div class="card__foot">
        <div class="price">${eur(p.price)}</div>
        <div class="row" style="gap:8px">
          <a href="#/produit/${p.id}" class="btn btn--ghost btn--sm">Voir le produit</a>
          ${p.soldOut ? '' : `<button class="add-btn" data-add="${p.id}" aria-label="Ajouter ${esc(p.name)} au panier">+</button>`}
        </div>
      </div>
    </div>
  </article>`;
}

function pageHero({ eyebrow, title, text, img, crumbs }) {
  return `<section class="page-hero ${img ? 'page-hero--img' : ''}">
    ${img ? pic(img, '', 1800) : ''}
    <div class="container">
      ${crumbs ? `<div class="crumbs"><a href="#/">Accueil</a> / ${crumbs}</div>` : ''}
      ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}
      <h1>${title}</h1>
      ${text ? `<p>${text}</p>` : ''}
    </div>
  </section>`;
}

function qtyControl(value, attrs = '', small = false) {
  return `<div class="qty ${small ? 'qty--sm' : ''}" ${attrs}>
    <button type="button" data-q="-1" aria-label="Diminuer">−</button><span>${value}</span><button type="button" data-q="1" aria-label="Augmenter">+</button>
  </div>`;
}

/* ---------- Toast & modale ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
function openModal(html, onMount) {
  const panel = $('#modalPanel');
  panel.innerHTML = `<button class="close" data-close-modal aria-label="Fermer">×</button>${html}`;
  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
  if (onMount) onMount(panel);
  const first = panel.querySelector('input, select, button:not(.close)');
  if (first) first.focus();
}
function closeModal() {
  $('#modal').hidden = true;
  document.body.style.overflow = '';
}
function confirmModal(title, text, okLabel, onOk) {
  openModal(`<h3>${title}</h3><p class="muted">${text}</p><div class="row" style="justify-content:flex-end;margin-top:20px">
    <button class="btn btn--ghost" data-close-modal>Annuler</button><button class="btn btn--dark" id="confirmOk">${okLabel}</button></div>`, (panel) => {
    $('#confirmOk', panel).onclick = () => { closeModal(); onOk(); };
  });
}

/* ---------- Panier latéral ---------- */
function openDrawer() {
  renderDrawer();
  $('#drawer').classList.add('open');
  $('#drawer').setAttribute('aria-hidden', 'false');
  $('#drawerOverlay').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  $('#drawerOverlay').hidden = true;
  document.body.style.overflow = '';
}
function lineHtml(l, editable = true) {
  return `<div class="line">
    ${l.img ? pic(l.img, '', 200) : '<div class="ph"></div>'}
    <div>
      <div class="line__name">${l.boxId || l.pid ? `<a href="#/${l.boxId ? `box/${l.boxId}` : `produit/${l.pid}`}" style="text-decoration:none">${esc(l.name)}</a>` : esc(l.name)}</div>
      ${l.labels && l.labels.length ? `<div class="line__opts">${l.labels.map(esc).join(' · ')}</div>` : ''}
      ${editable ? qtyControl(l.qty, `data-line="${esc(l.key)}"`, true) : `<div class="line__opts">Quantité : ${l.qty}</div>`}
    </div>
    <div class="line__right">
      <strong>${eur(l.unit * l.qty)}</strong>
      ${editable ? `<button class="remove" data-remove="${esc(l.key)}">Retirer</button>` : ''}
    </div>
  </div>`;
}
function renderDrawer() {
  const body = $('#drawerBody');
  const foot = $('#drawerFoot');
  if (!S.basket.length) {
    body.innerHTML = `<div class="empty-state" style="margin-top:20px"><h3>Votre panier est vide</h3><p>Commandez à la carte, choisissez une formule ou composez votre box — sans abonnement.</p><a href="#/carte" class="btn btn--primary" data-close-drawer>Découvrir la carte</a></div>`;
    foot.innerHTML = '';
    return;
  }
  const t = totals();
  const remaining = Math.max(0, DELIVERY.freeFrom - t.net);
  body.innerHTML = `
    <div class="small muted">${remaining > 0 ? `Plus que <strong>${eur(remaining)}</strong> pour la livraison offerte` : '<strong>Livraison à domicile offerte</strong> 🎉'}</div>
    <div class="progress"><div style="width:${Math.min(100, (t.net / DELIVERY.freeFrom) * 100)}%"></div></div>
    ${S.basket.map((l) => lineHtml(l)).join('')}
    <form class="inline-field" id="promoForm" style="margin-top:18px">
      <input name="code" placeholder="Code promo" aria-label="Code promo" value="${esc(S.promo || '')}">
      <button class="btn btn--dark btn--sm">${S.promo ? 'Modifier' : 'Appliquer'}</button>
    </form>
    ${S.promo ? `<button class="remove" id="removePromo" style="margin-top:6px">Retirer le code ${esc(S.promo)}</button>` : ''}
    ${S.reward ? `<div class="notice notice--ok">Récompense appliquée : ${esc(S.reward.label)} <button class="remove" id="removeReward">retirer</button></div>` : ''}
    ${!t.tier ? `<div class="notice">Membres du Club : jusqu’à −15 % sur chaque commande. <a href="#/abonnement-club" class="link" data-close-drawer>Découvrir</a></div>` : ''}`;
  foot.innerHTML = `${totalsHtml(t, 'estimate')}
    <a href="#/commande" class="btn btn--primary btn--block" style="margin-top:14px" data-close-drawer>Commander · ${eur(t.total)}</a>
    <button class="btn btn--ghost btn--block btn--sm" style="margin-top:8px;border-color:var(--line)" data-close-drawer>Continuer mes achats</button>`;
  $('#promoForm').onsubmit = (e) => { e.preventDefault(); applyPromo(e.target.code.value); renderDrawer(); };
  const rp = $('#removePromo');
  if (rp) rp.onclick = () => { S.promo = null; save(); renderDrawer(); };
  const rr = $('#removeReward');
  if (rr) rr.onclick = () => { refundReward(); renderDrawer(); };
}
function refundReward() {
  if (!S.reward) return;
  S.points += S.reward.points;
  S.pointsLog.unshift({ date: iso(new Date()), label: `Récompense annulée : ${S.reward.label}`, pts: S.reward.points });
  S.reward = null;
  save();
}

function updateBadges() {
  const c = basketCount();
  const b = $('#basketCount');
  b.textContent = c;
  b.hidden = c === 0;
  const f = $('#favCount');
  f.textContent = S.favorites.length;
  f.hidden = S.favorites.length === 0;
}

/* ---------- Planner : ajout depuis une fiche produit ---------- */
const SLOTS = [
  { id: 'breakfast', label: 'Petit-déjeuner', cats: ['breakfast'] },
  { id: 'lunch', label: 'Déjeuner', cats: ['lunch', 'dinner'] },
  { id: 'dinner', label: 'Dîner', cats: ['dinner', 'lunch'] },
  { id: 'snack', label: 'En-cas', cats: ['snack', 'dessert'] },
];
let plannerWeek = iso(addDays(mondayOf(new Date()), 7));
function planOf(week) {
  if (!S.plans[week]) S.plans[week] = {};
  return S.plans[week];
}
function planStats(slots) {
  const ids = Object.values(slots).filter(Boolean);
  const sub = round2(ids.reduce((a, id) => a + (P(id) ? P(id).price : 0), 0));
  const kcal = ids.reduce((a, id) => a + (P(id) ? kcalPortion(P(id)) : 0), 0);
  return { count: ids.length, sub, kcal };
}
function planToBasket(slots) {
  const counts = {};
  Object.values(slots).filter(Boolean).forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
  Object.entries(counts).forEach(([id, q]) => addProduct(id, q, {}, true));
  toast(`${Object.values(counts).reduce((a, b) => a + b, 0)} repas ajoutés au panier`);
}
function addToPlannerModal(pid) {
  const p = P(pid);
  const slotsFor = SLOTS.filter((s) => s.cats.includes(p.cat));
  const monday = fromIso(plannerWeek);
  openModal(`<span class="eyebrow">Planning de la semaine</span><h3>Ajouter « ${esc(p.name)} » à ma semaine</h3>
    <p class="muted small">Semaine du ${fmtDate(monday, { day: 'numeric', month: 'long' })}. Le créneau existant sera remplacé.</p>
    <div class="field"><label for="plDay">Jour</label><select class="input" id="plDay">${DAYS.map((d, i) => `<option value="${i}">${d} ${fmtDate(addDays(monday, i), { day: 'numeric', month: 'short' })}</option>`).join('')}</select></div>
    <div class="field"><label for="plSlot">Repas</label><select class="input" id="plSlot">${slotsFor.map((s) => `<option value="${s.id}">${s.label}</option>`).join('')}</select></div>
    <div class="row" style="justify-content:flex-end"><button class="btn btn--ghost" data-close-modal>Annuler</button><button class="btn btn--primary" id="plOk">Ajouter au planning</button></div>`, (panel) => {
    $('#plOk', panel).onclick = () => {
      planOf(plannerWeek)[`${$('#plDay', panel).value}-${$('#plSlot', panel).value}`] = pid;
      save();
      closeModal();
      toast('Ajouté à votre planning de la semaine');
    };
  });
}

/* ---------- Commandes ---------- */
const ORDER_STEPS = {
  home: ['Commande confirmée', 'En préparation', 'En cours de livraison', 'Livrée'],
  pickup: ['Commande confirmée', 'En préparation', 'Prête à être récupérée', 'Récupérée'],
};
function orderStatusLabel(o) { return ORDER_STEPS[o.mode][o.status]; }
function orderStatusClass(o) { return o.status >= 3 ? '' : o.status === 0 ? 'status--paused' : 'status--prep'; }
function timelineHtml(o) {
  return `<ol class="timeline">${ORDER_STEPS[o.mode].map((s, i) => `<li class="${i <= o.status ? 'done' : ''}">${s}</li>`).join('')}</ol>`;
}

/* ---------- Données de démonstration (compte démo) ---------- */
function seedDemoAccount() {
  if (S.orders.some((o) => o.demo)) return;
  const mk = (id, daysAgo, items, mode) => {
    const lines = items.map(([pid, q]) => { const p = P(pid); return { key: pid, type: 'product', pid, qty: q, unit: p.price, name: p.name, img: p.img, labels: [] }; });
    const sub = round2(lines.reduce((a, l) => a + l.unit * l.qty, 0));
    const delivery = mode === 'home' && sub < DELIVERY.freeFrom ? DELIVERY.homeFee : 0;
    const d = addDays(new Date(), -daysAgo);
    return {
      id, date: d.toISOString(), lines, mode, status: 3, demo: true,
      totals: { sub, member: 0, promo: 0, reward: 0, delivery, total: round2(sub + delivery) },
      slot: { day: iso(addDays(d, 1)), time: mode === 'home' ? DELIVERY.homeSlots[1] : DELIVERY.pickupSlots[1] },
      where: mode === 'home' ? '14 rue Paul Bert, 69003 Lyon' : DELIVERY.pickupPoints[0].name,
      payment: 'Carte bancaire', email: S.user.email,
    };
  };
  S.orders = [
    ...S.orders,
    mk('PC-24817', 9, [['chicken-rice-veg', 2], ['salmon-quinoa', 2], ['overnight-oats', 3], ['energy-balls', 1]], 'home'),
    mk('PC-23960', 23, [['lasagna', 2], ['pesto-pasta', 2], ['chocolate-mousse', 2]], 'pickup'),
  ];
  S.points += 185;
  S.pointsLog = [
    ...S.pointsLog,
    { date: iso(addDays(new Date(), -9)), label: 'Commande PC-24817', pts: 72 },
    { date: iso(addDays(new Date(), -23)), label: 'Commande PC-23960', pts: 51 },
    { date: iso(addDays(new Date(), -30)), label: 'Bonus de bienvenue', pts: 62 },
  ];
  if (!S.addresses.length) {
    S.addresses = [{ id: uid(), label: 'Domicile', name: `${S.user.first} ${S.user.last || ''}`.trim(), street: '14 rue Paul Bert', postcode: '69003', city: 'Lyon', phone: '', notes: 'Digicode 2468, 3e étage', def: true }];
  }
  if (!S.savedPlanners.length) {
    S.savedPlanners = [{
      id: uid(), name: 'Ma semaine type', week: iso(addDays(mondayOf(new Date()), -7)), savedAt: iso(addDays(new Date(), -10)),
      slots: { '0-breakfast': 'overnight-oats', '0-lunch': 'chicken-rice-veg', '0-dinner': 'veggie-curry', '1-breakfast': 'granola-bowl', '1-lunch': 'salmon-quinoa', '1-dinner': 'lasagna', '2-breakfast': 'overnight-oats', '2-lunch': 'mediterranean-bowl', '2-dinner': 'roast-chicken', '3-breakfast': 'chia-pudding', '3-lunch': 'creamy-chicken-bowl', '3-dinner': 'salmon-squash', '4-breakfast': 'greek-yogurt-bowl', '4-lunch': 'pesto-pasta', '4-dinner': 'chicken-mushrooms' },
    }];
  }
}
