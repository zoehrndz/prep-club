/* =========================================================
   PREP CLUB — Catalogue administrable (partagé site / back-office)
   Le back-office enregistre le catalogue dans localStorage (ADMIN_KEY).
   Tant que rien n'a été enregistré, le site utilise js/data.js tel quel.
   ========================================================= */
'use strict';

const ADMIN_KEY = 'prepclub:admin:v1';
const SITE_KEY = 'prepclub:v1';
const LOW_STOCK = 10;

const clone = (x) => JSON.parse(JSON.stringify(x));
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function readAdmin() {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY)); } catch (e) { return null; }
}

/* Construit l'état initial du back-office à partir de js/data.js, sans rien changer au site. */
function seedAdmin() {
  const stockFor = (i) => [42, 36, 8, 55, 27, 31, 6, 48, 39, 22, 60, 33, 18, 44, 29, 37, 52, 4, 25, 41, 30, 46, 35, 28, 9, 50, 26, 38, 24][i % 29];
  const monday = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
  const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const plus = (n) => { const d = new Date(monday); d.setDate(d.getDate() + n); return isoOf(d); };
  const products = PRODUCTS.map((p, i) => ({
    ...clone(p),
    portions: 1,
    photos: [],
    suppliers: [...new Set(p.origin.map((o) => o.producer).filter(Boolean))],
    storage: clone(STORAGE_DEFAULTS[p.cat]),
    prep: clone(PREP_DEFAULTS[p.cat]),
    supplements: true,
    status: 'active',
    soldOut: false,
    stock: stockFor(i),
    maxOrders: null,
    launchAt: '',
    endAt: '',
    pauseFrom: '',
    pauseTo: '',
    review: null,
    updatedAt: null,
  }));
  const tagCats = [
    { id: 'vegetarian', label: 'Végétarien' },
    { id: 'seasonal', label: 'De saison' },
    { id: 'bestseller', label: 'Meilleures ventes' },
    { id: 'new', label: 'Nouveautés' },
  ];
  const collections = {};
  Object.entries(SEASONS).forEach(([k, s]) => {
    collections[k] = { ...clone(s), producers: s.producers || [], products: products.filter((p) => p.season === k).map((p) => p.id), from: '', to: '' };
  });
  return {
    version: 1,
    savedAt: null,
    products,
    categories: Object.entries(CATEGORIES).map(([id, label]) => ({ id, label, kind: 'meal' })),
    selections: tagCats.map((t) => ({ ...t, kind: 'selection' })),
    options: clone(OPTIONS),
    collections,
    featuredSeason: '',
    weeklyMenus: [
      { id: 'wm-current', name: 'Menu de la semaine', from: plus(0), to: plus(6), items: ['overnight-oats', 'chicken-rice-veg', 'salmon-quinoa', 'seasonal-bowl', 'roast-chicken', 'salmon-squash', 'chicken-mushrooms', 'veggie-curry', 'energy-balls', 'chocolate-mousse'], status: 'published', publishAt: '' },
      { id: 'wm-next', name: 'Menu de la semaine prochaine', from: plus(7), to: plus(13), items: ['granola-bowl', 'creamy-chicken-bowl', 'mediterranean-bowl', 'lasagna', 'salmon-coconut-curry', 'beef-meatballs', 'seasonal-bowl', 'raspberry-cake'], status: 'draft', publishAt: '' },
    ],
    memberships: clone(MEMBERSHIPS),
    promos: clone(PROMO_CODES),
    delivery: clone(DELIVERY),
    boxRules: clone(BOX_RULES),
    producers: clone(PRODUCERS),
    formulas: clone(FORMULAS),
    discovery: clone(DISCOVERY),
    rewards: clone(REWARDS),
    content: {
      banner: ['Livraison & retrait sur place à Lyon', `Livraison offerte dès ${DELIVERY.freeFrom} €`, 'Sans abonnement obligatoire', 'Préparé chaque semaine à Lyon'],
      heroText: HERO_TEXT_DEFAULT,
      faq: typeof FAQ !== 'undefined' ? clone(FAQ) : [],
    },
    goals: { monthRevenue: 9000, monthOrders: 220, avgBasket: 45 },
    reviews: {},
    notes: {},
    orderStatus: {},
    log: [],
  };
}
const HERO_TEXT_DEFAULT = 'Pour les actifs lyonnais pressés : des plats frais cuisinés chaque semaine à Lyon, livrés ou à retirer, pour bien manger sans cuisiner, et sans abonnement obligatoire.';

/* État du back-office : données enregistrées complétées par les rubriques ajoutées depuis. */
function loadAdminState() {
  const saved = readAdmin();
  if (!saved) return seedAdmin();
  const base = seedAdmin();
  const merged = { ...base, ...saved };
  merged.content = { ...base.content, ...(saved.content || {}) };
  merged.goals = { ...base.goals, ...(saved.goals || {}) };
  return merged;
}

/* Visibilité d'un produit sur le site à une date donnée. */
function productState(p, day = todayIso()) {
  if (p.status === 'archived') return { visible: false, code: 'archived', label: 'Archivé' };
  if (p.status === 'inactive') return { visible: false, code: 'inactive', label: 'Désactivé' };
  if (p.launchAt && day < p.launchAt) return { visible: false, code: 'scheduled', label: `Lancement le ${p.launchAt.split('-').reverse().join('/')}` };
  if (p.endAt && day > p.endAt) return { visible: false, code: 'ended', label: 'Commercialisation terminée' };
  if (p.pauseFrom && p.pauseTo && day >= p.pauseFrom && day <= p.pauseTo) return { visible: true, soldOut: true, code: 'paused', label: 'Indisponible temporairement' };
  if (p.soldOut || p.stock === 0) return { visible: true, soldOut: true, code: 'soldout', label: 'Épuisé' };
  return { visible: true, soldOut: false, code: 'active', label: 'En ligne' };
}

/* Menu hebdomadaire actuellement publié sur le site (ou null). */
function liveWeeklyMenu(store, now = new Date()) {
  const day = todayIso();
  return (store.weeklyMenus || []).find((m) => {
    const published = m.status === 'published' || (m.status === 'scheduled' && m.publishAt && new Date(m.publishAt) <= now);
    return published && m.from <= day && day <= m.to;
  }) || null;
}
