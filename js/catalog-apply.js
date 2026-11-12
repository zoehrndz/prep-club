/* =========================================================
   PREP CLUB — Application du catalogue administré au site
   Chargé après les vues et avant app.js. Sans données du back-office,
   ce fichier ne change rien.
   ========================================================= */
'use strict';

const HIDDEN_PRODUCTS = [];

(function applyAdminCatalog() {
  const A = readAdmin();
  if (!A) return;
  const replace = (target, source) => { Object.keys(target).forEach((k) => delete target[k]); Object.assign(target, source); };

  // Catégories de repas et sélections
  replace(CATEGORIES, Object.fromEntries(A.categories.map((c) => [c.id, c.label])));
  A.selections.forEach((s) => { TAG_LABELS[s.id] = s.label; });
  TAG_LABELS.weekly = 'Menu de la semaine';
  A.categories.forEach((c) => {
    if (!SUB_SLUGS[c.id]) SUB_SLUGS[c.id] = c.id;
    if (!STORAGE_DEFAULTS[c.id]) STORAGE_DEFAULTS[c.id] = STORAGE_DEFAULTS.lunch;
    if (!PREP_DEFAULTS[c.id]) PREP_DEFAULTS[c.id] = PREP_DEFAULTS.lunch;
  });
  A.selections.forEach((s) => { if (!SUB_SLUGS[s.id]) SUB_SLUGS[s.id] = s.id; });
  SUB_SLUGS.weekly = 'menu-de-la-semaine';

  // Produits : seuls les produits en ligne sont listés ; les autres restent accessibles par P() (paniers, historiques)
  const live = liveWeeklyMenu(A);
  const visible = [];
  A.products.forEach((src) => {
    const st = productState(src);
    const p = { ...src, tags: src.tags.filter((t) => t !== 'weekly'), soldOut: !!st.soldOut };
    if (live && live.items.includes(p.id)) p.tags.push('weekly');
    (st.visible ? visible : HIDDEN_PRODUCTS).push(p);
  });
  PRODUCTS.splice(0, PRODUCTS.length, ...visible);

  // Filtres de la carte
  MENU_FILTERS.splice(0, MENU_FILTERS.length,
    ['all', 'Tout'],
    ...(live ? [['weekly', live.name || 'Menu de la semaine']] : []),
    ...A.categories.map((c) => [c.id, c.label]),
    ...A.selections.map((s) => [s.id, s.label]));
  const free = BOX_RULES.types.find((t) => t.id === 'free');
  if (free) free.cats = A.categories.map((c) => c.id);

  // Collections de saison
  Object.entries(A.collections).forEach(([k, c]) => { if (SEASONS[k]) Object.assign(SEASONS[k], { name: c.name, months: c.months, img: c.img, text: c.text, ingredients: c.ingredients, producers: c.producers }); });
  const day = todayIso();
  const dated = Object.keys(A.collections).find((k) => { const c = A.collections[k]; return c.from && c.to && c.from <= day && day <= c.to; });
  if (A.featuredSeason && SEASONS[A.featuredSeason]) CURRENT_SEASON = A.featuredSeason;
  else if (dated && SEASONS[dated]) CURRENT_SEASON = dated;

  // Suppléments, abonnements, codes promo, livraison, règles de box
  replace(OPTIONS, A.options);
  MEMBERSHIPS.splice(0, MEMBERSHIPS.length, ...A.memberships);
  replace(PROMO_CODES, A.promos);
  replace(DELIVERY, A.delivery);
  replace(BOX_RULES, { ...A.boxRules, types: BOX_RULES.types });

  // Producteurs, formules, box découverte, fidélité
  if (A.producers) PRODUCERS.splice(0, PRODUCERS.length, ...A.producers);
  if (A.formulas) A.formulas.forEach((f) => { const t = FORMULAS.find((x) => x.id === f.id); if (t) Object.assign(t, f); });
  if (A.discovery) A.discovery.forEach((d) => { const t = DISCOVERY.find((x) => x.id === d.id); if (t) Object.assign(t, d); });
  if (A.rewards) REWARDS.splice(0, REWARDS.length, ...A.rewards);

  // Contenus éditoriaux : bandeau, accroche de l'accueil, FAQ
  const C = A.content;
  if (!C) return;
  const bar = document.querySelector('.topbar');
  if (bar && C.banner && C.banner.length) {
    const msgs = C.banner.map(esc);
    const once = msgs.map((m) => `<span>${m}</span><i>✺</i>`).join('');
    const track = bar.querySelector('.topbar__track');
    bar.setAttribute('aria-label', C.banner.join(' · '));
    if (track) track.innerHTML = once.repeat(Math.max(2, Math.ceil(8 / msgs.length)));
    else bar.textContent = C.banner.join(' · ');
  }
  if (C.heroText && VIEWS.home) {
    const render = VIEWS.home.render;
    VIEWS.home.render = (...a) => render(...a).replace(/(<p class="hero2__text">)[\s\S]*?(<\/p>)/, `$1${esc(C.heroText)}$2`);
  }
  if (C.faq && C.faq.length && typeof FAQ !== 'undefined') FAQ.splice(0, FAQ.length, ...C.faq.map(([g, qs]) => [esc(g), qs.map(([q, a2]) => [esc(q), esc(a2)])]));
})();
