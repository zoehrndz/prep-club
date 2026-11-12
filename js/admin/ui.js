/* =========================================================
   PREP CLUB Admin — État, navigation, composants et graphiques
   ========================================================= */
'use strict';

let ADM = loadAdminState();
const AVIEWS = {};
const AP = (id) => ADM.products.find((p) => p.id === id);
const catLabel = (id) => (ADM.categories.find((c) => c.id === id) || {}).label || id;
const selLabel = (id) => (ADM.selections.find((c) => c.id === id) || {}).label || id;
const tierName = (id) => (ADM.memberships.find((m) => m.id === id) || {}).name || id;
const tierPrice = (id) => (ADM.memberships.find((m) => m.id === id) || {}).price || 0;
const producerName = (id) => (ADM.producers.find((p) => p.id === id) || {}).name || '';
const pct = (v, d = 0) => `${(v * 100).toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d })} %`;
const num = (v) => Math.round(v).toLocaleString('fr-FR');
const eur0 = (v) => Math.round(v).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fmtDT = (s) => new Date(s).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const initials = (name) => name.split(/\s+/).filter(Boolean).map((x) => x[0]).join('').slice(0, 2).toUpperCase();
const ago = (s) => {
  const m = Math.round((Date.now() - new Date(s)) / 60000);
  if (m < 0) return `dans ${Math.max(1, Math.round(-m / 1440))} j`;
  if (m < 60) return `il y a ${Math.max(1, m)} min`;
  if (m < 1440) return `il y a ${Math.round(m / 60)} h`;
  const d = Math.round(m / 1440);
  return d === 1 ? 'hier' : `il y a ${d} jours`;
};
const stars = (n) => `<span class="stars" role="img" aria-label="${n} sur 5">${'★'.repeat(n)}<span>${'★'.repeat(5 - n)}</span></span>`;

function saveAdmin(msg) {
  ADM.savedAt = new Date().toISOString();
  if (msg) ADM.log.unshift({ date: ADM.savedAt, msg });
  ADM.log = ADM.log.slice(0, 120);
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(ADM));
  } catch (e) {
    toast('Enregistrement impossible : espace de stockage du navigateur plein (photos trop lourdes ?)');
    return false;
  }
  if (msg) toast(msg);
  return true;
}

/* ---------- Icônes (tracés 24×24) ---------- */
const I = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  chef: 'M6 13.9V20h12v-6.1M6 13.9A4 4 0 0 1 7.5 6.2a5 5 0 0 1 9 0A4 4 0 0 1 18 13.9M6 17h12',
  truck: 'M3 6h11v10H3zM14 9h4l3 3v4h-7M7.5 19a1.5 1.5 0 1 0 0-.01M17.5 19a1.5 1.5 0 1 0 0-.01',
  bag: 'M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8zM9 8V6a3 3 0 0 1 6 0v2',
  users: 'M9 8a3 3 0 1 0 0-.01M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11a2.5 2.5 0 1 0 0-.01M15.5 14.5c3 0 5.5 2 5.5 5',
  star: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
  chat: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
  box: 'M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10',
  grid: 'M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v6H4zM13 14h7v6h-7z',
  plus: 'M12 5v14M5 12h14',
  gift: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0',
  menu: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
  leaf: 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7',
  page: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  farm: 'M3 21V10l6-4 6 4v11M15 21V13h6v8M7 21v-5h4v5M3 21h18',
  tag: 'M3 12V4h8l9 9-8 8zM7.5 8a.5.5 0 1 0 0-.01',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 9.5a2 2 0 1 0 0-.01',
  cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1.5-2-3.5-2.4.6a7 7 0 0 0-1.6-.9L14.5 4h-5L9 6.7a7 7 0 0 0-1.6.9L5 7l-2 3.5L5 12l-2 1.5L5 17l2.4-.6a7 7 0 0 0 1.6.9L9.5 20h5l.5-2.7a7 7 0 0 0 1.6-.9L19 17l2-3.5z',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  euro: 'M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  alert: 'M12 3l10 18H2zM12 10v5M12 18v.01',
  check: 'M5 12l5 5 9-10',
  repeat: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3',
  ext: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  print: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  board: 'M4 4h5v16H4zM10 4h5v10h-5zM16 4h4v13h-4z',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  megaphone: 'M3 10v4h3l7 4V6L6 10zM16 9a4 4 0 0 1 0 6M6 14l1 5h3l-1-5',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M6 13l6 6 6-6',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
};
const icon = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${I[k] || k}"/></svg>`;

/* ---------- Navigation ---------- */
const NAV = [
  ['Au quotidien', [['dashboard', 'Accueil', 'home'], ['commandes', 'Commandes', 'bag'], ['production', 'Cuisine', 'chef'], ['livraisons', 'Livraisons', 'truck']]],
  ['Ma carte', [['produits', 'Produits', 'box'], ['formules', 'Formules & box', 'gift'], ['menus', 'Menu de la semaine', 'menu'], ['collections', 'Collections de saison', 'leaf']]],
  ['Mes clients', [['crm', 'Prospects & contacts', 'board'], ['clients', 'Clients', 'users'], ['abonnements', 'Abonnements', 'star'], ['avis', 'Avis clients', 'chat']]],
  ['Mon site', [['contenus', 'Textes du site', 'page'], ['producteurs', 'Producteurs', 'farm']]],
  ['', [['reglages', 'Réglages', 'cog']]],
];
const NAV_LABEL = Object.fromEntries(NAV.flatMap(([g, items]) => items.map(([k, l]) => [k, [g, l]])));

function renderNav(active) {
  const b = {
    commandes: DEMO.orders.filter((o) => orderStatus(o).status === 0).length,
    avis: DEMO.reviews.filter(reviewNeedsAction).length,
  };
  $('#sideNav').innerHTML = NAV.map(([group, items]) => `<div class="side__group">${group ? `<div class="side__label">${group}</div>` : ''}${items.map(([k, label, ic]) => `<a href="#/${k}" class="${k === active ? 'active' : ''}" ${k === active ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${b[k] ? `<span class="side__count">${b[k]}</span>` : ''}</a>`).join('')}</div>`).join('');
}

function renderTabs(active) {
  $$('#tabbar [data-tab]').forEach((a) => a.classList.toggle('active', a.dataset.tab === active));
}
function arouter() {
  const [key = 'dashboard', ...params] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  const vkey = AVIEWS[key] ? key : 'dashboard';
  const view = AVIEWS[vkey];
  const root = $('#view');
  closeSide(); closePops(); hideTip();
  Object.keys(CHARTS).forEach((id) => delete CHARTS[id]);
  const navKey = view.nav || vkey;
  renderNav(navKey);
  renderTabs(navKey);
  const title = typeof view.title === 'function' ? view.title(...params) : view.title;
  const [group, label] = NAV_LABEL[navKey] || ['', ''];
  $('#pageTitle').textContent = title;
  $('#crumbs').innerHTML = `<span>${esc(group)}</span>${label && label !== title ? `<i>/</i><a href="#/${navKey}">${esc(label)}</a>` : ''}`;
  document.title = `${title} · PREP CLUB CRM`;
  root.innerHTML = view.render(...params);
  root.classList.remove('enter'); void root.offsetWidth; root.classList.add('enter');
  if (view.mount) view.mount(...params);
  countUp(root);
  renderBell();
}
const rerender = () => { const y = window.scrollY; arouter(); window.scrollTo(0, y); };
function closeSide() { $('#side').classList.remove('open'); $('#sideOverlay').hidden = true; }

/* ---------- Notifications ---------- */
function reviewNeedsAction(r) { const st = ADM.reviews[r.id] || {}; return r.rating <= 3 && !st.reply && !st.hidden; }
function notifications() {
  const out = [];
  DEMO.orders.forEach((o) => {
    const s = orderStatus(o);
    if (s.status === -1 || s.status === 3) return;
    if (s.payment === 'failed') out.push({ lvl: 'alert', ic: 'euro', title: `Paiement échoué · ${o.id}`, text: `${o.customer} · ${eur(o.total)}`, href: `#/commandes/${o.id}` });
    else if (s.needs) out.push({ lvl: 'warn', ic: 'alert', title: `Intervention · ${o.id}`, text: s.needs, href: `#/commandes/${o.id}` });
  });
  ADM.products.filter((p) => p.status === 'active').forEach((p) => {
    const st = productState(p);
    if (st.code === 'soldout') out.push({ lvl: 'alert', ic: 'box', title: `Rupture · ${p.name}`, text: 'Affiché « Épuisé » sur le site', href: `#/produits/${p.id}` });
    else if (st.code === 'active' && p.stock <= LOW_STOCK) out.push({ lvl: 'warn', ic: 'box', title: `Stock bas · ${p.name}`, text: `${p.stock} en stock`, href: `#/produits/${p.id}` });
    if (p.review) out.push({ lvl: 'warn', ic: 'page', title: `Fiche à valider · ${p.name}`, text: 'Recette modifiée : allergènes, nutrition, provenance', href: `#/produits/${p.id}` });
  });
  const next = ADM.weeklyMenus.find((m) => m.status === 'draft' && m.from > iso(new Date()) && m.from <= iso(addDays(new Date(), 7)));
  if (next) out.push({ lvl: 'info', ic: 'menu', title: 'Menu à publier', text: `« ${next.name} » démarre le ${fmtDate(next.from, { day: 'numeric', month: 'long' })} et est en brouillon`, href: `#/menus/${next.id}` });
  return out;
}
function renderBell() {
  const list = notifications();
  const urgent = list.filter((n) => n.lvl !== 'info').length;
  const c = $('#bellCount');
  c.textContent = list.length > 99 ? '99+' : list.length;
  c.hidden = !list.length;
  c.classList.toggle('is-urgent', urgent > 0);
  $('#bellPop').innerHTML = `<div class="pop__head"><strong>Notifications</strong><span class="muted small">${list.length} élément${list.length > 1 ? 's' : ''}</span></div>
    <ul class="pop__list">${list.slice(0, 40).map((n) => `<li><a href="${n.href}" class="notif notif--${n.lvl}"><span class="notif__ic">${icon(n.ic)}</span><span><strong>${esc(n.title)}</strong><span class="small muted">${esc(n.text)}</span></span></a></li>`).join('') || '<li class="pop__empty">Tout est en ordre ✓</li>'}</ul>`;
}
function closePops() { $$('.pop').forEach((p) => { p.hidden = true; }); $$('[data-pop]').forEach((b) => b.setAttribute('aria-expanded', 'false')); }
function togglePop(btn) {
  const pop = $(`#${btn.dataset.pop}`);
  const open = pop.hidden;
  closePops();
  pop.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
}

/* ---------- Recherche rapide (⌘K) ---------- */
let cmdIndex = [];
let cmdSel = 0;
const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function buildCmdIndex() {
  const pages = NAV.flatMap(([g, items]) => items.map(([k, l, ic]) => ({ type: 'Pages', label: l, sub: g, href: `#/${k}`, ic })));
  const actions = [
    { type: 'Actions rapides', label: 'Ajouter un produit', sub: 'Catalogue', href: '#/produits/nouveau', ic: 'plus' },
    { type: 'Actions rapides', label: 'Créer un menu de la semaine', sub: 'Menus', href: '#/menus/nouveau', ic: 'menu' },
    { type: 'Actions rapides', label: 'Créer un code promo', sub: 'Réglages', href: '#/reglages', ic: 'tag' },
    { type: 'Actions rapides', label: 'Fiche cuisine de demain', sub: 'Cuisine', href: `#/production/${iso(addDays(new Date(), 1))}`, ic: 'print' },
    { type: 'Actions rapides', label: 'Commandes à traiter', sub: 'Commandes', href: '#/commandes/f/alert', ic: 'alert' },
  ];
  const prods = ADM.products.map((p) => ({ type: 'Produits', label: p.name, sub: `${catLabel(p.cat)} · ${eur(p.price)}`, href: `#/produits/${p.id}`, img: p.img || '' }));
  const custs = DEMO.customers.map((c) => ({ type: 'Clients', label: c.name, sub: c.email, href: `#/clients/${c.id}`, avatar: initials(c.name) }));
  const orders = DEMO.orders.slice(-500).reverse().map((o) => ({ type: 'Commandes', label: o.id, sub: `${o.customer} · ${eur(o.total)} · ${fmtDate(o.day, { day: 'numeric', month: 'short' })}`, href: `#/commandes/${o.id}`, ic: 'bag', extra: o.email }));
  cmdIndex = [...actions, ...pages, ...prods, ...custs, ...orders];
}
function openCmd() {
  buildCmdIndex();
  cmdSel = 0;
  $('#cmdk').hidden = false;
  document.body.style.overflow = 'hidden';
  $('#cmdInput').value = '';
  drawCmd();
  $('#cmdInput').focus();
}
function closeCmd() { $('#cmdk').hidden = true; document.body.style.overflow = ''; }
function cmdResults() {
  const q = fold($('#cmdInput').value.trim());
  if (!q) return cmdIndex.filter((x) => x.type === 'Actions rapides' || x.type === 'Pages').slice(0, 12);
  const words = q.split(/\s+/);
  const hits = cmdIndex.filter((x) => words.every((w) => fold(`${x.label} ${x.sub} ${x.extra || ''}`).includes(w)));
  const per = {};
  return hits.filter((x) => { per[x.type] = (per[x.type] || 0) + 1; return per[x.type] <= 5; });
}
function drawCmd() {
  const res = cmdResults();
  cmdSel = Math.max(0, Math.min(cmdSel, res.length - 1));
  let last = '';
  $('#cmdList').innerHTML = res.length ? res.map((r, i) => {
    const head = r.type !== last ? `<li class="cmd__group">${r.type}</li>` : '';
    last = r.type;
    const lead = r.img !== undefined ? thumb(r.img, 'cmd__img') : r.avatar ? `<span class="avatar avatar--sm">${r.avatar}</span>` : `<span class="cmd__ic">${icon(r.ic || 'search')}</span>`;
    return `${head}<li><a href="${r.href}" class="cmd__item ${i === cmdSel ? 'sel' : ''}" data-i="${i}">${lead}<span class="cmd__txt"><strong>${esc(r.label)}</strong><span class="small muted">${esc(r.sub)}</span></span><kbd>↵</kbd></a></li>`;
  }).join('') : '<li class="pop__empty">Aucun résultat</li>';
  const sel = $('#cmdList .sel');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}

/* ---------- Composants ---------- */
const STATUS = {
  0: ['En attente', 'st st--wait'], 1: ['En préparation', 'st st--prep'], 2: ['À livrer', 'st st--ship'], 3: ['Livrée', 'st st--done'], '-1': ['Annulée', 'st st--off'],
};
function statusLabel(o, s = orderStatus(o).status) {
  if (o.mode === 'pickup' && s === 2) return 'Prête (retrait)';
  if (o.mode === 'pickup' && s === 3) return 'Récupérée';
  return STATUS[s][0];
}
function statusBadge(o) {
  const s = orderStatus(o);
  return `<span class="${STATUS[s.status][1]}">${statusLabel(o, s.status)}</span>${s.payment === 'failed' ? ' <span class="st st--alert">Paiement échoué</span>' : ''}`;
}
function productStateBadge(p) {
  const s = productState(p);
  const low = s.code === 'active' && p.stock <= LOW_STOCK;
  const cls = { active: low ? 'st--prep' : 'st--done', soldout: 'st--alert', paused: 'st--prep', scheduled: 'st--wait', ended: 'st--off', inactive: 'st--off', archived: 'st--off' }[s.code];
  return `<span class="st ${cls}">${low ? 'Stock bas' : s.label}</span>`;
}
const thumb = (img, cls = 'thumb') => (img ? `<img class="${cls}" src="${imgUrl(img, 240)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : `<span class="${cls} thumb--empty"></span>`);
function emptyState(title, text, action = '') {
  return `<div class="empty"><div class="empty__art" aria-hidden="true">${icon('leaf')}</div><h3>${title}</h3>${text ? `<p class="muted">${text}</p>` : ''}${action}</div>`;
}
function pageHead(text, actions = '') {
  return `<div class="page-head">${text ? `<p class="page-head__text">${text}</p>` : '<span></span>'}${actions ? `<div class="page-head__actions">${actions}</div>` : ''}</div>`;
}
/* Tuile d'indicateur : icône, valeur (animée), variation, mini-courbe. */
function kpi({ label, value, raw, fmt = 'num', sub = '', href = '', ic = '', tone = '', spark = null, deltaHtml = '' }) {
  const tag = href ? 'a' : 'div';
  const valHtml = raw !== undefined ? `<span data-count="${raw}" data-fmt="${fmt}">${value}</span>` : value;
  return `<${tag} class="kpi ${tone ? `kpi--${tone}` : ''} ${href ? 'kpi--link' : ''}" ${href ? `href="${href}"` : ''}>
    <div class="kpi__top">${ic ? `<span class="kpi__ic">${icon(ic)}</span>` : ''}<span class="kpi__label">${label}</span>${deltaHtml}</div>
    <div class="kpi__value">${valHtml}</div>
    ${spark ? `<div class="kpi__spark">${sparkline(spark)}</div>` : ''}
    ${sub ? `<div class="kpi__sub">${sub}</div>` : ''}
  </${tag}>`;
}
function delta(cur, prev) {
  if (!prev) return '';
  const d = (cur - prev) / prev;
  return `<span class="delta ${d >= 0 ? 'delta--up' : 'delta--down'}" title="Par rapport à la période précédente">${d >= 0 ? '↑' : '↓'} ${pct(Math.abs(d))}</span>`;
}
const FMTS = { num, eur, eur0, pct: (v) => pct(v), pct1: (v) => pct(v, 1) };
function countUp(root) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('[data-count]', root).forEach((el) => {
    const target = Number(el.dataset.count);
    const f = FMTS[el.dataset.fmt] || num;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 750);
      el.textContent = f(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step); else el.textContent = f(target);
    };
    requestAnimationFrame(step);
  });
}
function segmented(name, options, current) {
  return `<div class="seg" role="tablist">${options.map(([k, l, ic]) => `<button type="button" class="seg__btn ${k === current ? 'active' : ''}" data-${name}="${k}" role="tab" aria-selected="${k === current}">${ic ? icon(ic) : ''}<span>${l}</span></button>`).join('')}</div>`;
}
function dayChips(attr, current, count = 5) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return `<div class="daychips">${Array.from({ length: count }, (_, i) => {
    const d = addDays(t, i - 1);
    const k = iso(d);
    const lbl = i === 0 ? 'Hier' : i === 1 ? 'Aujourd’hui' : i === 2 ? 'Demain' : fmtDate(d, { weekday: 'long' });
    return `<button type="button" class="daychip ${k === current ? 'active' : ''}" data-${attr}="${k}"><span>${lbl}</span><strong>${fmtDate(d, { day: 'numeric', month: 'short' }).replace('.', '')}</strong></button>`;
  }).join('')}</div>`;
}

/* ---------- Infobulle partagée ---------- */
const tipEl = () => $('#tip');
function showTip(html, x, y) {
  const t = tipEl();
  t.innerHTML = html;
  t.hidden = false;
  const w = t.offsetWidth;
  const h = t.offsetHeight;
  t.style.left = `${Math.min(window.innerWidth - w - 8, Math.max(8, x - w / 2))}px`;
  t.style.top = `${y - h - 14 < 8 ? y + 18 : y - h - 14}px`;
}
const hideTip = () => { const t = tipEl(); if (t) t.hidden = true; };
document.addEventListener('mousemove', (e) => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) showTip(el.dataset.tip, e.clientX, e.clientY); });
document.addEventListener('mouseout', (e) => { if (e.target.closest && e.target.closest('[data-tip]') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-tip]'))) hideTip(); });

/* ---------- Graphiques (SVG, sans dépendance) ----------
   Couleurs : --s1 olive, --s2 safran, --s3 bleu, --s4 tomate (ordre fixe, validé
   pour les daltonismes en voisinage ; les anneaux se limitent aux 3 premières). */
function niceMax(v) {
  if (v <= 0) return 4;
  const raw = v / 4;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p * 4;
}
/* Courbe lissée monotone (aucun dépassement entre deux points). */
function smoothPath(pts) {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : '';
  const n = pts.length;
  const dx = []; const m = [];
  for (let i = 0; i < n - 1; i++) { dx.push(pts[i + 1][0] - pts[i][0]); m.push((pts[i + 1][1] - pts[i][1]) / (dx[i] || 1)); }
  const t = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${pts[i][0] + h},${pts[i][1] + t[i] * h} ${pts[i + 1][0] - h},${pts[i + 1][1] - t[i + 1] * h} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}

const CHARTS = {};
function timeChart(cfg) {
  const id = `c${uid()}`;
  CHARTS[id] = { type: 'area', fmt: num, height: 240, ...cfg };
  setTimeout(() => drawChart(id), 0);
  const items = cfg.series.map((s, i) => `<span><i class="sw ${cfg.type === 'bars' ? `s${i + 1}` : 's1'}"></i>${s.label}</span>`);
  if (cfg.compare) items.push(`<span><i class="sw sw--dash"></i>${cfg.compare.label}</span>`);
  return `${items.length > 1 ? `<div class="legend">${items.join('')}</div>` : ''}<div class="chart" id="${id}" style="height:${CHARTS[id].height}px"></div>`;
}
function drawChart(id) {
  const el = document.getElementById(id);
  if (!el) { delete CHARTS[id]; return; }
  const { labels, tips, series, type, fmt, height, compare } = CHARTS[id];
  const W = Math.max(240, el.clientWidth); const H = height; const L = 54; const R = 10; const T = 14; const B = 28;
  const n = labels.length;
  const totals = labels.map((_, i) => series.reduce((a, s) => a + s.values[i], 0));
  const max = niceMax(Math.max(...totals, ...(compare ? compare.values : []), 0));
  const slot = (W - L - R) / n;
  const x = (i) => (type === 'bars' ? L + slot * (i + 0.5) : L + (W - L - R) * (n === 1 ? 0.5 : i / (n - 1)));
  const bw = Math.max(3, Math.min(28, slot * 0.58));
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => `${f ? `<line class="gridline" x1="${L}" x2="${W - R}" y1="${y(max * f)}" y2="${y(max * f)}"/>` : ''}<text class="tick" x="${L - 10}" y="${y(max * f) + 4}" text-anchor="end">${fmt(max * f)}</text>`).join('');
  const every = Math.ceil(n / Math.max(2, Math.floor((W - L - R) / 64)));
  const xt = labels.map((l, i) => (i % every === 0 ? `<text class="tick" x="${x(i)}" y="${H - 8}" text-anchor="middle">${l}</text>` : '')).join('');
  let marks = '';
  if (type === 'area') {
    const line = smoothPath(series[0].values.map((v, i) => [x(i), y(v)]));
    marks = `<defs><linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--s1)" stop-opacity=".26"/><stop offset="1" stop-color="var(--s1)" stop-opacity="0"/></linearGradient></defs>`;
    if (compare) marks += `<path class="trend trend--prev" d="${smoothPath(compare.values.map((v, i) => [x(i), y(v)]))}"/>`;
    marks += `<path d="${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z" fill="url(#g${id})"/><path class="trend" d="${line}"/>`;
  } else {
    marks = labels.map((_, i) => {
      let acc = 0;
      return series.map((s, si) => {
        const v = s.values[i];
        if (!v) return '';
        const y0 = y(acc); acc += v; const y1 = y(acc);
        const top = series.slice(si + 1).every((z) => !z.values[i]);
        const h = Math.max(0, y0 - y1 - (acc > v ? 2 : 0)); // 2 px d'écart avec le segment du dessous
        return top ? `<path class="bar s${si + 1}" d="${roundTop(x(i) - bw / 2, y1, bw, h)}"/>` : `<rect class="bar s${si + 1}" x="${x(i) - bw / 2}" y="${y1}" width="${bw}" height="${h}"/>`;
      }).join('');
    }).join('');
  }
  const hits = labels.map((_, i) => `<rect class="hit" data-i="${i}" x="${x(i) - slot / 2}" y="${T}" width="${slot}" height="${H - T - B}"/>`).join('');
  el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map((s) => s.label).join(', '))}">${grid}<line class="axis" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>${marks}<line class="guide" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"/><circle class="dot" r="5" visibility="hidden"/>${hits}${xt}</svg>`;
  const svg = el.querySelector('svg');
  const guide = svg.querySelector('.guide');
  const dot = svg.querySelector('.dot');
  svg.querySelectorAll('.hit').forEach((h) => {
    const i = Number(h.dataset.i);
    h.addEventListener('mouseenter', (e) => {
      if (type === 'area') {
        guide.setAttribute('x1', x(i)); guide.setAttribute('x2', x(i)); guide.setAttribute('visibility', 'visible');
        dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(series[0].values[i])); dot.setAttribute('visibility', 'visible');
      } else h.classList.add('on');
      showTip(tips[i], e.clientX, e.clientY);
    });
    h.addEventListener('mousemove', (e) => showTip(tips[i], e.clientX, e.clientY));
    h.addEventListener('mouseleave', () => { guide.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); h.classList.remove('on'); hideTip(); });
  });
}
let chartResize;
window.addEventListener('resize', () => { clearTimeout(chartResize); chartResize = setTimeout(() => Object.keys(CHARTS).forEach(drawChart), 150); });
function roundTop(x, y, w, h) {
  const r = Math.min(5, w / 2, h);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

/* Mini-courbe (sans texte, l'étirement horizontal ne déforme rien). */
function sparkline(values, cls = '') {
  if (!values || values.length < 2) return '';
  const max = Math.max(...values); const min = Math.min(...values);
  const W = 100; const H = 32;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - 3 - ((v - min) / (max - min || 1)) * (H - 6)]);
  const line = smoothPath(pts);
  return `<svg class="spark ${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="spark__fill" d="${line} L${W},${H} L0,${H} Z"/><path class="spark__line" d="${line}"/></svg>`;
}

/* Anneau de progression. */
function ring(ratio, label, sub, size = 136) {
  const r = 52; const c = 2 * Math.PI * r;
  const k = Math.max(0, Math.min(1, ratio));
  return `<div class="ring" style="--size:${size}px" role="img" aria-label="${esc(label)} ${esc(sub || '')}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring__bg" cx="60" cy="60" r="${r}"/><circle class="ring__fg" cx="60" cy="60" r="${r}" style="--c:${c};--o:${c * (1 - k)}" transform="rotate(-90 60 60)"/></svg><div class="ring__label"><strong>${label}</strong>${sub ? `<span>${sub}</span>` : ''}</div></div>`;
}

/* Anneau de répartition (3 parts maximum). */
function donut(parts, fmt = eur0, center = '') {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const r = 46; const c = 2 * Math.PI * r; const gap = parts.filter((p) => p.value).length > 1 ? 2.5 : 0;
  let off = 0;
  const arcs = parts.map((p, i) => {
    if (!p.value) return '';
    const len = (p.value / total) * c;
    const seg = `<circle class="donut__seg s${i + 1}" cx="60" cy="60" r="${r}" stroke-dasharray="${Math.max(0.1, len - gap)} ${c}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)" data-tip="<strong>${esc(p.label)}</strong><br>${esc(fmt(p.value))} · ${pct(p.value / total)}"/>`;
    off += len;
    return seg;
  }).join('');
  return `<div class="donut"><div class="donut__chart"><svg viewBox="0 0 120 120" role="img" aria-label="${esc(parts.map((p) => `${p.label} ${pct(p.value / total)}`).join(', '))}">${arcs}</svg><div class="donut__center">${center || `<strong>${fmt(total)}</strong><span>au total</span>`}</div></div>
    <ul class="donut__legend">${parts.map((p, i) => `<li><i class="sw s${i + 1}"></i><span>${p.label}</span><strong>${fmt(p.value)}</strong><em>${pct(p.value / total)}</em></li>`).join('')}</ul></div>`;
}

/* Barres horizontales (classements), avec vignette et rang facultatifs. */
function hbars(rows, fmt = eur0, extra = () => '') {
  const max = Math.max(...rows.map((r) => r.value), 0) || 1;
  return `<div class="hbars">${rows.map((r, i) => `<div class="hbar ${r.img !== undefined ? 'hbar--media' : ''}">
    ${r.img !== undefined ? `<span class="hbar__rank">${i + 1}</span>${thumb(r.img, 'thumb thumb--sm')}` : ''}
    <div class="hbar__main"><div class="hbar__row"><span class="hbar__label">${esc(r.label)}</span><span class="hbar__value">${fmt(r.value)}${extra(r)}</span></div>
    <div class="hbar__track"><div class="hbar__fill" style="--w:${(r.value / max) * 100}%"></div></div></div></div>`).join('')}</div>`;
}

/* Carte de chaleur (jours × heures), rampe olive séquentielle. */
function heatmap(matrix, rowLabels, colLabels, tipFor) {
  const max = Math.max(...matrix.flat(), 1);
  return `<div class="heat" style="--cols:${colLabels.length}">
    <span></span>${colLabels.map((c, i) => `<span class="heat__col">${i % 3 === 0 ? c : ''}</span>`).join('')}
    ${matrix.map((row, r) => `<span class="heat__row">${rowLabels[r]}</span>${row.map((v, c) => `<span class="heat__cell" style="--a:${v ? (0.1 + (v / max) * 0.9).toFixed(2) : 0}" data-tip="${esc(tipFor(r, c, v))}"></span>`).join('')}`).join('')}
  </div><div class="heat__scale"><span>Moins</span><i style="--a:.1"></i><i style="--a:.4"></i><i style="--a:.7"></i><i style="--a:1"></i><span>Plus</span></div>`;
}

/* ---------- Fichiers ---------- */
function readImage(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
function downloadFile(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}
function downloadCsv(name, rows) {
  downloadFile(name, '﻿' + rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'), 'text/csv');
}
const csvNum = (v) => round2(v || 0).toString().replace('.', ',');
