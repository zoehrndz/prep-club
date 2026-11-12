/* =========================================================================
   PREP CLUB — Marketing Studio : vues, routeur et interactions
   ========================================================================= */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const ICON = {
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  dl: '<svg viewBox="0 0 24 24"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M21 3 3 10l7 3 3 7z"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
};

/* ---------- Routes ---------- */
const ROUTES = [
  { id: 'dashboard', label: 'Marketing Dashboard', group: 'Pilotage', render: viewDashboard },
  { id: 'strategie', label: 'Stratégie', group: 'Pilotage', render: viewStrategy },
  { id: 'calendrier', label: 'Content Calendar', group: 'Contenus', render: viewCalendar },
  { id: 'social', label: 'Social Media Library', group: 'Contenus', render: viewLibrary },
  { id: 'visuels', label: 'Visual Library', group: 'Contenus', render: viewVisuals },
  { id: 'captions', label: 'Caption Library', group: 'Contenus', render: viewCaptions },
  { id: 'stories', label: 'Stories & Reels', group: 'Contenus', render: viewStories },
  { id: 'emailing', label: 'Email Marketing', group: 'Campagnes', render: viewEmail },
  { id: 'campagnes', label: 'Campaign Manager', group: 'Campagnes', render: viewCampaigns },
  { id: 'saisons', label: 'Seasonal Campaigns', group: 'Campagnes', render: viewSeasons },
  { id: 'influence', label: 'Influencer Marketing', group: 'Campagnes', render: viewInfluence },
  { id: 'publicite', label: 'Advertising Manager', group: 'Campagnes', render: viewAds },
  { id: 'seo', label: 'SEO & Blog', group: 'Croissance', render: viewSeo },
  { id: 'automation', label: 'Marketing Automation', group: 'Croissance', render: viewAutomation },
  { id: 'analytics', label: 'Analytics & Reports', group: 'Croissance', render: viewAnalytics },
  { id: 'charte', label: 'Brand Guidelines', group: 'Croissance', render: viewBrand },
];

const CAL_END = D.add(CAL_START, CAL_WEEKS * 7 - 1);
const clampDate = (iso) => (iso < CAL_START ? CAL_START : iso > CAL_END ? CAL_END : iso);
const TODAY = D.today();
const NOW = clampDate(TODAY);

const ui = {
  cal: { view: 'month', cursor: NOW, plats: new Set(), only: null },
  lib: { plat: '', status: '', pillar: '', period: '4w', q: '', limit: 36 },
  vis: { tab: 'templates', cat: '' },
  cap: { goal: '' },
  strat: 'vision',
  stories: 'stories',
  email: 'newsletter',
  infl: 'contacts',
  seo: 'articles',
  modal: null,
};

/* ---------- Petits composants ---------- */
const pill = (s) => { const st = MK.statuses[s] || MK.statuses.draft; return `<span class="pill pill--${st.tone}" title="${st.en}">${st.label}</span>`; };
const plat = (p) => `<span class="plat plat--${p}">${MK.platforms[p] ? MK.platforms[p].label : p}</span>`;
const pillarName = (id) => (MK.editorial.find((e) => e.id === id) || {}).name || id;
const campName = (id) => (MK.campaigns.find((c) => c.id === id) || {}).name || '';
const fmtLabel = (f) => (MK.formats[f] || {}).label || f;
const CAMP_ST = { active: ['En cours', 'olive'], ready: ['Prête', 'blue'], draft: ['Brouillon', 'line'], paused: ['En pause', 'warn'], done: ['Terminée', 'dark'] };
const campPill = (s) => `<span class="pill pill--${CAMP_ST[s][1]}">${CAMP_ST[s][0]}</span>`;
const AD_ST = { draft: ['Brouillon', 'line'], approval: ['Budget en attente', 'warn'], validated: ['Budget validé', 'olive'], running: ['En diffusion', 'blue'], refused: ['Refusé', 'danger'] };
const nf = (v) => v.toLocaleString('fr-FR');
const btn = (act, label, extra = '', cls = 'btn--sm') => `<button class="btn ${cls}" data-act="${act}" ${extra}>${label}</button>`;
const isPost = (it) => it.platform === 'instagram' && ['square', 'portrait', 'carousel'].includes(it.format);
const visible = (it) => it.status !== 'archived';

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('on'), 2200);
}
function pageHead(eyebrow, title, text, right = '') {
  return `<div class="page-head"><div class="page-head__text"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1>${text ? `<p>${text}</p>` : ''}</div>${right ? `<div class="row">${right}</div>` : ''}</div>`;
}
function tabs(name, items, current) {
  return `<div class="tabs" role="tablist">${items.map(([id, label]) => `<button role="tab" aria-selected="${id === current}" data-act="tab" data-tab="${name}" data-v="${id}">${label}</button>`).join('')}</div>`;
}
function contentCard(it) {
  return `<button class="ccard" data-act="open" data-id="${esc(it.id)}">
    ${visualHTML(Object.assign(specFor(it), { format: 'square' }))}
    <span class="ccard__body">
      <span class="ccard__title">${esc(it.title)}</span>
      <span class="ccard__meta">${plat(it.platform)}<span class="num">${D.fmt(it.date, { weekday: true })} · ${it.time}</span>${pill(it.status)}</span>
    </span>
  </button>`;
}

/* =========================================================================
   1. DASHBOARD
   ========================================================================= */
const TASKS = [
  ['t1', 'Valider les 3 teasers de la semaine de lancement'],
  ['t2', 'Mettre à jour le lien en bio vers la carte'],
  ['t3', 'Valider le budget Meta Ads de lancement (200 €)'],
  ['t4', 'Envoyer le kit de collaboration aux créateurs confirmés'],
  ['t5', 'Photographier les 10 bestsellers à l’atelier'],
  ['t6', 'Programmer la newsletter de lancement du lundi 16 novembre'],
  ['t7', 'Créer les stories à la une : Menu, Planner, Producteurs, Avis'],
  ['t8', 'Collecter les attestations des producteurs partenaires'],
  ['t9', 'Créer et vérifier la fiche Google Business Profile'],
];

function weekItems(mon) {
  const end = D.add(mon, 6);
  return CAL.filter((c) => c.date >= mon && c.date <= end && visible(c));
}

function viewDashboard() {
  const mon = D.monday(NOW);
  const wk = weekItems(mon);
  const count = (f) => wk.filter(f).length;
  const storyDays = new Set(wk.filter((c) => c.format === 'story').map((c) => c.date)).size;
  const activeCamps = MK.campaigns.map(campaignState).filter((c) => NOW <= c.end && D.add(NOW, 6) >= c.start);
  const upcoming = CAL.filter((c) => c.date >= NOW && !['published', 'archived'].includes(c.status) && c.platform !== 'newsletter').slice(0, 6);
  const approval = CAL.filter((c) => c.status === 'approval' && c.date >= NOW);
  const needsUpdate = CAL.filter((c) => c.status === 'update');
  const nls = CAL.filter((c) => c.platform === 'newsletter' && c.date >= NOW && visible(c)).slice(0, 4);
  const published = CAL.filter((c) => c.status === 'published').length;
  const launch = campaignState(MK.campaigns[0]);
  const toLaunch = D.diff(TODAY, '2026-11-16');
  const adsPending = MK.ads.filter((a) => adState(a).status === 'approval');
  const inflTodo = allInfluencers().filter((i) => i.status === 'todo').length;
  const tasksDone = TASKS.filter(([id]) => store.data.tasks[id]).length;

  const recos = [];
  if (approval.length) recos.push(['warn', `${approval.length} contenus attendent votre validation`, `Le premier est prévu le ${D.fmt(approval[0].date, { weekday: true })}.`, `<a class="btn btn--sm" href="#social" data-act="lib-preset" data-status="approval">Voir</a>`]);
  if (needsUpdate.length) recos.push(['warn', `${needsUpdate.length} contenu à mettre à jour`, `« ${esc(needsUpdate[0].title)} » : classement à confirmer avec les ventes réelles.`, btn('open', 'Ouvrir', `data-id="${esc(needsUpdate[0].id)}"`)]);
  if (adsPending.length) recos.push(['warn', `${adsPending.length} budgets publicitaires en attente de validation`, `${nf(adsPending.reduce((s, a) => s + adState(a).budget, 0))} € proposés. Aucune dépense sans votre accord.`, '<a class="btn btn--sm" href="#publicite">Valider</a>']);
  if (inflTodo) recos.push(['ok', `${inflTodo} créateurs restent à contacter`, 'Les modèles de prise de contact et de relance sont prêts.', '<a class="btn btn--sm" href="#influence">Contacter</a>']);
  if (!(store.data.flows.cart ?? MK.flows.find((f) => f.id === 'cart').active)) recos.push(['ok', 'Activer le flux « panier abandonné »', 'Après vérification du consentement à la prospection.', '<a class="btn btn--sm" href="#emailing" data-act="tab-preset" data-tab="email" data-v="flows">Configurer</a>']);
  recos.push(['ok', 'Publier les Reels entre 18 h et 19 h', 'Horaires de départ à tester pendant 4 semaines, puis à ajuster selon les statistiques.', '']);

  return `${pageHead('Marketing Studio', 'Bonjour 👋', `${D.fmt(TODAY, { weekday: true, long: true, year: true })} · ${MK.brand.zone}`, '<a class="btn btn--primary" href="#calendrier">Ouvrir le calendrier</a>')}

  <section class="panel panel--olive">
    <div class="countdown">
      ${toLaunch > 0 ? `<div><div class="countdown__n">J−${toLaunch}</div><div class="muted">avant l’ouverture du lundi 16 novembre</div></div>` : `<div><div class="countdown__n">${D.diff('2026-11-16', TODAY) + 1}<span style="font-size:1.2rem"> jours</span></div><div class="muted">depuis l’ouverture du 16 novembre 2026</div></div>`}
      <div style="flex:1;min-width:220px" class="stack">
        <strong style="font-family:var(--serif);font-size:1.25rem;font-weight:500">${esc(activeCamps[0] ? activeCamps[0].name : launch.name)}</strong>
        <span class="muted">${activeCamps[0] ? `${D.fmt(activeCamps[0].start)} → ${D.fmt(activeCamps[0].end)} · ${esc(activeCamps[0].goal)}` : ''}</span>
      </div>
      <div class="stack" style="min-width:180px"><span class="muted small">Préparation du lancement</span><strong class="num">${tasksDone} / ${TASKS.length} tâches</strong><div class="bar" style="background:rgba(251,248,241,.2)"><span style="width:${(tasksDone / TASKS.length) * 100}%;background:var(--sand)"></span></div></div>
    </div>
  </section>

  <section class="stack">
    <div class="panel__head"><h2>Cette semaine</h2><span class="meta">Semaine du ${D.fmt(mon, { long: true })}</span></div>
    <div class="kpis">
      <div class="kpi">${plat('instagram')}<span class="kpi__v">${count(isPost)}</span><span class="kpi__l">publications Instagram</span></div>
      <div class="kpi">${plat('instagram')}<span class="kpi__v">${count((c) => c.format === 'reel')}</span><span class="kpi__l">Reels</span></div>
      <div class="kpi">${plat('tiktok')}<span class="kpi__v">${count((c) => c.platform === 'tiktok')}</span><span class="kpi__l">vidéos TikTok</span></div>
      <div class="kpi">${plat('instagram')}<span class="kpi__v">${storyDays}</span><span class="kpi__l">jours de Stories</span></div>
      <div class="kpi">${plat('newsletter')}<span class="kpi__v">${count((c) => c.platform === 'newsletter')}</span><span class="kpi__l">newsletter${count((c) => c.platform === 'newsletter') > 1 ? 's' : ''} · ${activeCamps.length} campagne${activeCamps.length > 1 ? 's' : ''}</span></div>
    </div>
  </section>

  <div class="grid g3">
    <section class="panel span2">
      <div class="panel__head"><h3>Prochaines publications</h3><a class="small" href="#calendrier">Tout le calendrier</a></div>
      <div class="list">${upcoming.map((c) => `<div class="row" style="flex-wrap:nowrap;gap:8px"><div style="flex:1;min-width:0">${contentCard(c)}</div>${c.status !== 'published' ? btn('publish', 'Publié', `data-id="${esc(c.id)}" title="Marquer comme publié"`) : ''}</div>`).join('')}</div>
    </section>
    <section class="panel">
      <div class="panel__head"><h3>Recommandations</h3></div>
      <div>${recos.map(([k, t, d, a]) => `<div class="reco"><span class="reco__i ${k === 'warn' ? 'reco__i--warn' : ''}">${k === 'warn' ? '!' : '→'}</span><div class="stack" style="gap:2px"><strong class="small">${t}</strong><span class="tiny muted">${d}</span></div>${a}</div>`).join('')}</div>
    </section>
  </div>

  <div class="grid g3">
    <section class="panel">
      <div class="panel__head"><h3>Campagnes</h3><a class="small" href="#campagnes">Campaign Manager</a></div>
      <div>${MK.campaigns.map(campaignState).filter((c) => c.end >= NOW).slice(0, 4).map((c) => {
        const total = D.diff(c.start, c.end) + 1;
        const done = Math.max(0, Math.min(total, D.diff(c.start, NOW) + 1));
        return `<div class="camp-line"><div class="stack" style="gap:2px"><strong class="small">${esc(c.name)}</strong><span class="tiny muted">${D.fmt(c.start)} → ${D.fmt(c.end)}</span></div>${campPill(c.status)}<div class="bar"><span style="width:${(done / total) * 100}%"></span></div></div>`;
      }).join('')}</div>
    </section>
    <section class="panel">
      <div class="panel__head"><h3>Newsletters programmées</h3><a class="small" href="#emailing">Email Marketing</a></div>
      <div class="list">${nls.map((n) => `<button class="ccard" style="grid-template-columns:44px minmax(0,1fr)" data-act="open" data-id="${esc(n.id)}"><span class="kpi__v" style="font-size:1.3rem;text-align:center">${D.parse(n.date).getDate()}<span class="tiny muted" style="display:block;font-family:var(--sans)">${D.monthsShort[D.parse(n.date).getMonth()]}</span></span><span class="ccard__body"><span class="ccard__title">${esc(n.subject || n.title)}</span><span class="ccard__meta"><span class="num">${n.time}</span>${pill(n.status)}</span></span></button>`).join('')}</div>
    </section>
    <section class="panel">
      <div class="panel__head"><h3>Tâches marketing</h3><span class="meta num">${tasksDone}/${TASKS.length}</span></div>
      <div>${TASKS.map(([id, t]) => `<label class="check ${store.data.tasks[id] ? 'done' : ''}"><input type="checkbox" id="task-${id}" data-on="task" data-id="${id}" ${store.data.tasks[id] ? 'checked' : ''}><span class="small">${t}</span></label>`).join('')}</div>
    </section>
  </div>

  <div class="grid g2">
    <section class="panel">
      <div class="panel__head"><h3>En attente de validation</h3><span class="meta">${approval.length} contenus</span></div>
      ${approval.length ? `<div class="list">${approval.slice(0, 4).map((c) => `<div class="row" style="flex-wrap:nowrap"><div style="flex:1;min-width:0">${contentCard(c)}</div>${btn('approve', 'Valider', `data-id="${esc(c.id)}"`)}</div>`).join('')}</div>` : '<p class="empty">Aucun contenu en attente.</p>'}
    </section>
    <section class="panel">
      <div class="panel__head"><h3>Performances</h3><span class="meta">${published} contenus publiés</span></div>
      <p class="small muted">Les statistiques s’afficheront ici après connexion de Meta Business Suite, TikTok Studio, Google Analytics 4 et de l’outil d’e-mailing. En attendant, voici les objectifs à 3 mois.</p>
      <div class="table-wrap"><table><thead><tr><th>Indicateur</th><th class="num">Objectif M+3</th></tr></thead><tbody>${MK.objectives.slice(0, 6).map((o) => `<tr><td>${o.kpi}</td><td class="num">${o.m3}</td></tr>`).join('')}</tbody></table></div>
    </section>
  </div>`;
}

/* =========================================================================
   2. STRATÉGIE
   ========================================================================= */
function viewStrategy() {
  const t = ui.strat;
  const body = {
    vision: () => `
      <section class="hero-strat">
        <div class="hero-strat__text">
          <span class="eyebrow">Signature de marque</span>
          <div class="hero-strat__sig">Your week, <i>prepared.</i></div>
          <p style="max-width:52ch;opacity:.85">${MK.brand.promise} — ${MK.positioning.statement}</p>
          <div>${MK.brand.principles.map((p) => `<div class="principle"><strong style="font-family:var(--serif);font-size:1.1rem;font-weight:500">${p.name}</strong><span class="small" style="opacity:.8">${p.text}</span></div>`).join('')}</div>
        </div>
        <div class="hero-strat__img"><img src="${imgUrlMk(IMG.spread, 1000)}" alt="Table garnie de plats préparés PREP CLUB"></div>
      </section>
      <section class="stack">
        <div class="panel__head"><h2>Objectifs et indicateurs</h2><span class="meta">Cibles proposées, à ajuster après le premier mois</span></div>
        <div class="table-wrap"><table><thead><tr><th>Objectif</th><th>Indicateur</th><th class="num">M+3</th><th class="num">M+6</th><th class="num">M+12</th><th>Source</th></tr></thead><tbody>
        ${MK.objectives.map((o) => `<tr><td><strong>${o.name}</strong></td><td>${o.kpi}</td><td class="num">${o.m3}</td><td class="num">${o.m6}</td><td class="num">${o.m12}</td><td class="muted small">${o.source}</td></tr>`).join('')}
        </tbody></table></div>
      </section>`,
    positionnement: () => `
      <div class="grid g2">
        <section class="panel panel--cream"><span class="label">Positionnement</span><p style="font-family:var(--serif);font-size:1.35rem;line-height:1.3">${MK.positioning.statement}</p>
          <div class="stack"><span class="label">Ce que PREP CLUB n’est pas</span><div class="row">${MK.positioning.notThis.map((x) => `<span class="tag" style="text-decoration:line-through">${x}</span>`).join('')}</div>
          <span class="label">Ce que PREP CLUB est</span><p>${MK.positioning.butThis}</p></div></section>
        <section class="panel"><span class="label">Proposition de valeur</span><div class="dl">${MK.positioning.value.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</div></section>
      </div>
      <section class="stack"><h2>Les quatre piliers de communication</h2>
        <div class="grid g4">${MK.pillars.map((p) => `<article class="panel pillar"><span class="pillar__fr">${p.fr}</span><span class="pillar__name">${p.name}</span><p class="small muted">${p.goal}</p>
          <div class="stack" style="gap:4px">${p.messages.map((m) => `<span class="quote">${m}</span>`).join('')}</div>
          <hr class="sep"><p class="small"><strong>Preuve :</strong> ${p.proof}</p>${p.check ? `<p class="note">${p.check}</p>` : ''}</article>`).join('')}</div></section>`,
    personas: () => `<div class="grid g2">${MK.personas.map((p) => `<article class="panel">
        <div class="persona__head"><span class="persona__av">${p.initials}</span><div class="stack" style="gap:2px"><h3>${p.name}</h3><span class="small muted">${p.fr} · ${p.age}</span></div></div>
        <p class="small">${p.profile}</p>
        <dl class="dl"><dt>Besoins</dt><dd>${p.needs.join(' · ')}</dd><dt>Messages</dt><dd>${p.messages.map((m) => `<span class="quote">${m}</span>`).join('<br>')}</dd>
        <dt>Produits</dt><dd><div class="row">${p.products.map((x) => `<span class="tag">${x}</span>`).join('')}</div></dd><dt>Où le toucher</dt><dd>${p.channels}</dd><dt>Objection</dt><dd>${p.objection}</dd></dl>
      </article>`).join('')}</div>`,
    canaux: () => `
      <section class="stack"><h2>Organisation hebdomadaire type</h2>
        <div class="table-wrap"><table><thead><tr><th>Jour</th><th>Instagram</th><th>TikTok / autre</th></tr></thead><tbody>
        ${[['Lundi', 'Weekly motivation / planner (carrousel, 12 h 30)', 'Meal prep routine (18 h 30)'], ['Mardi', 'Stories interactives', 'Épingle Pinterest'], ['Mercredi', 'Product spotlight (12 h 30) + Reel (18 h)', 'Recipe video (19 h)'], ['Jeudi', 'Stories / sondage', 'Épingle Pinterest'], ['Vendredi', 'Reel lifestyle, coulisses ou producteur (18 h)', 'Behind the scenes (18 h 30)'], ['Samedi', 'Stories / communauté', 'Épingle Pinterest'], ['Dimanche', 'Weekly Menu (carrousel, 10 h) + Stories', 'The Weekly Prep (newsletter, 9 h)']].map((r) => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="small muted">Jours et horaires de départ, à tester puis à ajuster selon les statistiques réelles des audiences.</p>
      </section>
      <div class="grid g2">${MK.channels.map((c) => `<article class="panel"><div class="panel__head"><h3>${c.name}</h3><span class="meta">${c.role}</span></div>
        <div class="dl"><dt>Objectifs</dt><dd>${c.goals.join(' · ')}</dd><dt>Formats</dt><dd><div class="row">${c.formats.map((f) => `<span class="tag">${f}</span>`).join('')}</div></dd><dt>Rythme</dt><dd>${c.rhythm.map(([k, v]) => `${k} : <strong>${v}</strong>`).join('<br>')}</dd><dt>KPI</dt><dd>${c.kpi}</dd></div></article>`).join('')}</div>
      <section class="panel panel--cream"><h3>Mots-clés SEO prioritaires</h3><div class="row">${MK.keywords.map((k) => `<span class="tag">${k.kw}</span>`).join('')}</div><p class="small muted">Les contenus SEO répondent à de vraies recherches, sans multiplier artificiellement les mots-clés.</p></section>`,
    film: () => {
      const F = MK.film;
      return `<section class="panel panel--cream"><div class="panel__head"><h2>${F.name}</h2><span class="tag">${F.status}</span></div><p style="max-width:75ch">${F.pitch}</p>
        <div class="film-a">${F.files.map((f) => `<figure class="film-a__v${f.fmt === '9:16' ? ' film-a__v--tall' : ''}"><video src="${f.src}" poster="${f.poster}" controls preload="metadata" playsinline style="aspect-ratio:${f.w} / ${f.h}"></video><figcaption class="small"><strong>${f.label} · ${f.fmt}</strong> — <span class="muted">${f.use}</span> · <a href="${f.src}" download>Télécharger</a></figcaption></figure>`).join('')}</div>
        <div class="row">${F.pillars.map((x) => `<span class="tag">${x}</span>`).join('')}</div></section>
      <div class="grid g2">${F.why.map(([a, b]) => `<section class="panel"><h3>${a}</h3><p class="small muted">${b}</p></section>`).join('')}</div>
      <section class="stack"><div class="panel__head"><h2>Plan de diffusion proposé</h2><span class="meta">Campagne « ${F.budget.campaign} »</span></div>
        <div class="table-wrap"><table><thead><tr><th>Quand</th><th>Canal</th><th>Format</th><th>Mise en œuvre</th></tr></thead><tbody>
        ${F.plan.map((r) => `<tr><td><strong>${r.when}</strong></td><td>${r.where}</td><td><span class="tag">${r.fmt}</span></td><td>${r.how}</td></tr>`).join('')}
        </tbody></table></div><p class="small muted">Budget média proposé : <strong>${F.budget.amount} €</strong> sur ${F.budget.of} €. ${F.budget.detail}</p></section>
      <div class="grid g2">
        <section class="panel"><h3>Indicateurs de suivi</h3><div class="dl">${F.kpis.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</div></section>
        <section class="panel"><h3>Avant diffusion</h3><ul class="small">${F.before.map((x) => `<li>${x}</li>`).join('')}</ul><h3>Déclinaisons à prévoir</h3><div class="dl">${F.next.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</div></section>
      </div>
      <p><a class="btn" href="video-pub.html">Ouvrir l’outil du film (textes, export 16:9 et 9:16)</a></p>`;
    },
    editorial: () => {
      const total = CAL.filter(visible).length;
      const real = MK.editorial.map((e) => ({ ...e, n: CAL.filter((c) => visible(c) && c.pillar === e.id).length }));
      return `<section class="panel"><div class="panel__head"><h2>Répartition cible des contenus</h2><span class="meta">Base de départ, à ajuster selon les performances</span></div>
        <div class="mix">${MK.editorial.map((e) => `<span style="width:${e.share}%;background:${e.color}" title="${e.name} ${e.share} %">${e.share} %</span>`).join('')}</div>
        <div class="legend">${MK.editorial.map((e) => `<div class="legend__i"><i style="background:${e.color}"></i><span>${e.name}</span><span class="muted num">${e.share} %</span></div>`).join('')}</div></section>
      <div class="table-wrap"><table><thead><tr><th>Pilier</th><th>Contenu</th><th>Objectif</th><th class="num">Cible</th><th class="num">Planifié sur 12 mois</th></tr></thead><tbody>
        ${real.map((e) => `<tr><td><strong>${e.name}</strong><div class="tiny muted">${e.fr}</div></td><td>${e.ex}</td><td>${e.goal}</td><td class="num">${e.share} %</td><td class="num">${Math.round((e.n / total) * 100)} % <span class="muted">(${e.n})</span></td></tr>`).join('')}
      </tbody></table></div>
      <p class="small muted">La colonne « Planifié » est calculée en direct à partir du calendrier éditorial (${nf(total)} contenus). Les Stories et épingles comptent comme un contenu chacune.</p>`;
    },
  };
  return `${pageHead('Stratégie marketing & communication', 'La stratégie PREP CLUB', 'Vision, positionnement, cibles, canaux et lignes éditoriales. C’est la base de tous les contenus du studio.')}
    ${tabs('strat', [['vision', 'Vision & objectifs'], ['positionnement', 'Positionnement & piliers'], ['personas', 'Personas'], ['canaux', 'Canaux'], ['editorial', 'Piliers éditoriaux'], ['film', 'Film de lancement']], t)}
    ${body[t]()}`;
}

/* =========================================================================
   3. CALENDRIER
   ========================================================================= */
function calFiltered() {
  const f = ui.cal;
  return CAL.filter((c) => {
    if (c.status === 'archived') return false;
    if (f.plats.size && !f.plats.has(c.platform)) return false;
    if (f.only === 'campaign' && !c.campaign) return false;
    if (f.only === 'published' && c.status !== 'published') return false;
    if (f.only === 'todo' && ['published', 'archived'].includes(c.status)) return false;
    return true;
  });
}
function evChip(c) {
  return `<button class="ev ev--${c.platform} st-${c.status}" draggable="true" data-drag="${esc(c.id)}" data-act="open" data-id="${esc(c.id)}" title="${esc(`${c.time} · ${MK.platforms[c.platform].label} · ${fmtLabel(c.format)} — ${c.title} (${MK.statuses[c.status].label})`)}"><span class="ev__t">${c.time}</span><span class="ev__n">${esc(c.title)}</span></button>`;
}
function viewCalendar() {
  const f = ui.cal;
  const items = calFiltered();
  const cur = D.parse(f.cursor);
  let title = '';
  let body = '';
  if (f.view === 'month') {
    title = `${D.months[cur.getMonth()]} ${cur.getFullYear()}`;
    const first = D.iso(new Date(cur.getFullYear(), cur.getMonth(), 1));
    const start = D.monday(first);
    const last = D.iso(new Date(cur.getFullYear(), cur.getMonth() + 1, 0));
    const cells = [];
    for (let d = start; d <= last || cells.length % 7; d = D.add(d, 1)) cells.push(d);
    body = `<div class="month"><div class="month__head">${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((x) => `<div>${x}</div>`).join('')}</div><div class="month__grid">
      ${cells.map((d) => {
        const evs = items.filter((c) => c.date === d);
        const camp = campaignAt(d);
        const out = D.parse(d).getMonth() !== cur.getMonth();
        return `<div class="day ${out ? 'day--out' : ''} ${d === TODAY ? 'day--today' : ''}" data-drop="${d}">
          <div class="day__head"><span class="day__n">${D.parse(d).getDate()}</span>${camp && !out ? `<span class="day__camp" title="${esc(camp.name)}">${esc(camp.name)}</span>` : ''}</div>
          ${evs.slice(0, 4).map(evChip).join('')}${evs.length > 4 ? `<button class="day__more" data-act="cal-goto" data-date="${d}" data-v="day">+ ${evs.length - 4} autres</button>` : ''}
        </div>`;
      }).join('')}</div></div>`;
  } else if (f.view === 'week' || f.view === 'network') {
    const mon = D.monday(f.cursor);
    title = `Semaine du ${D.fmt(mon, { long: true })}`;
    const days = [0, 1, 2, 3, 4, 5, 6].map((i) => D.add(mon, i));
    if (f.view === 'week') {
      body = `<div class="week">${days.map((d) => `<div class="week__col" data-drop="${d}"><div class="week__h ${d === TODAY ? 'today' : ''}"><span class="small muted" style="text-transform:capitalize">${D.days[D.parse(d).getDay()]}</span><strong>${D.parse(d).getDate()}</strong></div>
        ${items.filter((c) => c.date === d).map((c) => `<button class="wcard" draggable="true" data-drag="${esc(c.id)}" data-act="open" data-id="${esc(c.id)}">
          ${visualHTML(Object.assign(specFor(c), { format: 'square' }))}
          <span class="wcard__meta">${plat(c.platform)}<span class="num">${c.time}</span></span>
          <span class="wcard__title">${esc(c.title)}</span>
          <span class="wcard__meta">${fmtLabel(c.format)} · ${pillarName(c.pillar)}</span>${pill(c.status)}</button>`).join('')}</div>`).join('')}</div>`;
    } else {
      const plats = ['instagram', 'tiktok', 'pinterest', 'newsletter'].filter((p) => !f.plats.size || f.plats.has(p));
      body = `<div class="byplat" style="grid-template-columns:120px repeat(7,minmax(130px,1fr))"><div class="h">Réseau</div>${days.map((d) => `<div class="h">${D.daysShort[D.parse(d).getDay()]} ${D.parse(d).getDate()}</div>`).join('')}
        ${plats.map((p) => `<div class="rowh">${plat(p)}</div>${days.map((d) => `<div data-drop="${d}">${items.filter((c) => c.date === d && c.platform === p).map(evChip).join('')}</div>`).join('')}`).join('')}</div>`;
    }
  } else if (f.view === 'day') {
    title = D.fmt(f.cursor, { weekday: true, long: true, year: true });
    const evs = items.filter((c) => c.date === f.cursor);
    body = evs.length ? `<div class="grid g-auto">${evs.map(libCard).join('')}</div>` : '<p class="empty">Aucun contenu ce jour-là avec ces filtres.</p>';
  } else {
    title = 'Vue annuelle · novembre 2026 → octobre 2027';
    const months = [];
    for (let i = 0; i < 12; i++) months.push(new Date(2026, 10 + i, 1));
    body = `<div class="year">${months.map((m) => {
      const ym = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
      const ev = items.filter((c) => c.date.startsWith(ym));
      const camps = MK.campaigns.map(campaignState).filter((c) => c.start.slice(0, 7) <= ym && c.end.slice(0, 7) >= ym);
      return `<button class="ymonth" data-act="cal-goto" data-date="${ym}-01" data-v="month"><h3>${D.months[m.getMonth()]} ${m.getFullYear()}</h3>
        <div class="ymini"><div><b>${ev.filter(isPost).length}</b>posts IG</div><div><b>${ev.filter((c) => c.format === 'reel' || c.platform === 'tiktok').length}</b>vidéos</div><div><b>${ev.filter((c) => c.format === 'story').length}</b>stories</div><div><b>${ev.filter((c) => c.platform === 'newsletter').length}</b>e-mails</div></div>
        <div class="row">${camps.map((c) => `<span class="tag">${esc(c.name)}</span>`).join('') || '<span class="tiny muted">Contenus permanents</span>'}</div></button>`;
    }).join('')}</div>`;
  }

  const chip = (k, label, on) => `<button class="chip" data-act="cal-filter" data-f="${k}" aria-pressed="${on}">${label}</button>`;
  return `${pageHead('Content Calendar', 'Calendrier éditorial', 'Douze mois préremplis à partir de l’organisation hebdomadaire type et des campagnes. Glissez une carte sur un autre jour pour changer sa date, cliquez dessus pour l’ouvrir.', `${btn('new-content', `${ICON.plus} Nouveau contenu`, '', 'btn--primary')}`)}
    <div class="cal-toolbar">
      <div class="cal-nav">${f.view !== 'year' ? `<button class="icon" data-act="cal-prev" aria-label="Période précédente">${ICON.left}</button><button class="icon" data-act="cal-next" aria-label="Période suivante">${ICON.right}</button>${btn('cal-today', 'Aujourd’hui')}` : ''}<h2>${title}</h2></div>
      <div class="seg" role="group" aria-label="Vue">${[['month', 'Mois'], ['week', 'Semaine'], ['day', 'Jour'], ['network', 'Par réseau'], ['year', 'Année']].map(([v, l]) => `<button data-act="cal-view" data-v="${v}" aria-pressed="${f.view === v}">${l}</button>`).join('')}</div>
    </div>
    <div class="row between">
      <div class="chips">${chip('all', 'Tous les réseaux', !f.plats.size)}${['instagram', 'tiktok', 'pinterest', 'newsletter'].map((p) => chip(p, MK.platforms[p].label, f.plats.has(p))).join('')}</div>
      <div class="chips">${chip('campaign', 'Campagnes', f.only === 'campaign')}${chip('published', 'Publiés', f.only === 'published')}${chip('todo', 'À publier', f.only === 'todo')}</div>
    </div>
    ${body}
    <div class="row small muted">${Object.keys(MK.statuses).filter((s) => s !== 'archived').map((s) => pill(s)).join('')}</div>`;
}

/* =========================================================================
   Éditeur de contenu (modale)
   ========================================================================= */
function previewFor(it) {
  const spec = specFor(it);
  if (it.platform === 'newsletter') {
    return `<div class="mail" style="font-size:.78rem"><div class="mail__head"><span class="logo">PREP<i>CLUB</i></span><span class="tiny">The Weekly Prep</span></div>
      <div style="padding:12px">${visualHTML(Object.assign(spec, { format: 'email' }))}</div>
      <div class="mail__sec"><span class="mail__n">Objet</span><strong>${esc(it.subject || it.title)}</strong></div></div>`;
  }
  if (it.format === 'story') {
    const s = MK.stories.find((x) => x.id === it.story);
    const fr = s ? s.frames[0] : null;
    return `<div class="phone phone--story"><div class="story-ui">${(s ? s.frames : [0]).map((_, i) => `<span class="${i === 0 ? 'on' : ''}"></span>`).join('')}</div>${visualHTML({ layout: 'photo', theme: 'dark', kicker: `Story 1/${s ? s.frames.length : 1}`, headline: fr ? fr.text : it.headline, sub: fr ? fr.sticker : '', img: fr ? fr.img : spec.img, format: 'story' })}</div>`;
  }
  if (it.format === 'reel' || it.format === 'video' || it.format === 'pin') {
    return `<div class="phone">${visualHTML(spec)}<div class="phone__cap"><b>${MK.brand.handle}</b>${esc(it.caption).slice(0, 220)}${it.caption.length > 220 ? '…' : ''}</div></div>`;
  }
  return `<div class="phone"><div class="phone__bar"><span class="phone__av">PC</span>${MK.brand.handle}</div>${visualHTML(spec)}
    <div class="phone__acts">${ICON.heart}${ICON.chat}${ICON.send}<span style="margin-left:auto">${ICON.save}</span></div>
    <div class="phone__cap"><b>${MK.brand.handle}</b>${esc(it.caption)}\n\n${esc(it.cta || '')}\n\n<span style="color:var(--blue)">${esc((it.tags || []).join(' '))}</span></div></div>`;
}
function scriptBlock(it) {
  if (it.reel) {
    const r = MK.reels.find((x) => x.id === it.reel);
    return `<section class="panel panel--cream"><div class="panel__head"><h3>Script — ${esc(r.fr)}</h3><span class="meta">${r.duration} · ${esc(r.name)}</span></div>
      <div class="grid g2"><div class="stack"><span class="label">Plans à filmer</span><ol class="steps small">${r.shots.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
      <div class="stack"><span class="label">Texte à l’écran</span><div class="row">${r.onscreen.map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</div><span class="label">Ambiance sonore</span><p class="small">${esc(r.music)}</p><p class="note">Vidéo à filmer à partir de contenus réels et autorisés. Musique sous réserve des droits d’utilisation.</p></div></div></section>`;
  }
  if (it.story) {
    const s = MK.stories.find((x) => x.id === it.story);
    return `<section class="panel panel--cream"><div class="panel__head"><h3>Séquence — ${esc(s.name)}</h3><span class="meta">${esc(s.when)}</span></div>
      <div class="frames">${s.frames.map((fr, i) => `<div class="frame">${visualHTML({ layout: 'photo', theme: 'dark', kicker: `Story ${i + 1}/${s.frames.length}`, headline: fr.text, sub: '', img: fr.img, format: 'story' })}<span class="tiny muted">${esc(fr.sticker)}</span></div>`).join('')}</div></section>`;
  }
  return '';
}
function openContent(id) {
  const it = content(id);
  if (!it) return;
  ui.modal = { type: 'content', id };
  const opt = (obj, cur, lbl = (k, v) => v.label || v) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${esc(lbl(k, v))}</option>`).join('');
  const tplOpts = MK.templates.map((t) => `<option value="${t.id}" ${t.id === it.tpl ? 'selected' : ''}>${t.name}</option>`).join('') + `<option value="type-dark" ${it.tpl === 'type-dark' ? 'selected' : ''}>Typographique — charbon</option><option value="type-olive" ${it.tpl === 'type-olive' ? 'selected' : ''}>Typographique — olive</option>`;
  const html = `<div class="modal__head"><div class="stack" style="gap:6px"><span class="row">${plat(it.platform)}<span class="tiny muted">${fmtLabel(it.format)} · ${pillarName(it.pillar)}${it.campaign ? ` · ${esc(campName(it.campaign))}` : ''}</span>${pill(it.status)}</span><h2>${esc(it.title)}</h2></div><button class="modal__close" data-act="close" aria-label="Fermer">×</button></div>
  <div class="modal__body">
    <div class="editor">
      <div class="editor__side">${previewFor(it)}
        <div class="actions">${btn('dl-visual', `${ICON.dl} Télécharger le visuel`, `data-id="${esc(it.id)}"`)}</div>
        <p class="tiny muted">Export PNG ${MK.formats[it.format].size.split(' — ')[0]}. Photos de démonstration libres de droits (Unsplash).</p>
      </div>
      <form class="stack" id="ed" data-id="${esc(it.id)}">
        <div class="fields">
          <div class="field full"><label for="ed-title">Nom du contenu</label><input class="input" id="ed-title" data-k="title" value="${esc(it.title)}"></div>
          <div class="field"><label for="ed-goal">Objectif marketing</label><input class="input" id="ed-goal" data-k="goal" value="${esc(it.goal)}"></div>
          <div class="field"><label for="ed-platform">Plateforme</label><select class="select" id="ed-platform" data-k="platform">${opt(MK.platforms, it.platform)}</select></div>
          <div class="field"><label for="ed-format">Format</label><select class="select" id="ed-format" data-k="format">${opt(MK.formats, it.format)}</select></div>
          <div class="field"><label for="ed-date">Date de publication</label><input class="input" type="date" id="ed-date" data-k="date" value="${it.date}"></div>
          <div class="field"><label for="ed-time">Heure recommandée</label><input class="input" type="time" id="ed-time" data-k="time" value="${it.time}"></div>
          <div class="field"><label for="ed-status">Statut</label><select class="select" id="ed-status" data-k="status">${opt(MK.statuses, it.status)}</select></div>
          <div class="field"><label for="ed-pillar">Pilier éditorial</label><select class="select" id="ed-pillar" data-k="pillar">${MK.editorial.map((e) => `<option value="${e.id}" ${e.id === it.pillar ? 'selected' : ''}>${e.name}</option>`).join('')}</select></div>
          <div class="field"><label for="ed-tpl">Template visuel</label><select class="select" id="ed-tpl" data-k="tpl">${tplOpts}</select></div>
          <div class="field"><label for="ed-campaign">Campagne</label><select class="select" id="ed-campaign" data-k="campaign"><option value="">Aucune (contenu permanent)</option>${MK.campaigns.map((c) => `<option value="${c.id}" ${c.id === it.campaign ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
          <div class="field two"><label for="ed-headline">Titre sur le visuel</label><input class="input" id="ed-headline" data-k="headline" value="${esc(it.headline || '')}"></div>
          <div class="field"><label for="ed-kicker">Surtitre du visuel</label><input class="input" id="ed-kicker" data-k="kicker" value="${esc(it.kicker || '')}"></div>
          ${it.platform === 'newsletter' ? `<div class="field full"><label for="ed-subject">Objet de l’e-mail</label><input class="input" id="ed-subject" data-k="subject" value="${esc(it.subject || '')}"></div>` : ''}
          <div class="field full"><label for="ed-caption">${it.platform === 'newsletter' ? 'Contenu de l’e-mail' : it.format === 'story' ? 'Déroulé de la séquence' : 'Caption complète'}</label><textarea class="textarea" id="ed-caption" data-k="caption">${esc(it.caption)}</textarea></div>
          <div class="field two"><label for="ed-cta">Call to action</label><input class="input" id="ed-cta" data-k="cta" value="${esc(it.cta || '')}"></div>
          <div class="field"><label for="ed-link">Lien de destination</label><input class="input" id="ed-link" data-k="link" value="${esc(it.link || '')}"></div>
          ${it.platform !== 'newsletter' ? `<div class="field full"><label for="ed-tags">Hashtags</label><input class="input" id="ed-tags" data-k="tags" value="${esc((it.tags || []).join(' '))}"></div>` : ''}
          ${it.utm ? `<div class="field full"><span class="label">Lien traqué (UTM)</span><code class="tiny muted" style="word-break:break-all">${esc(it.utm)}</code></div>` : ''}
          <div class="field full"><label for="ed-alt">Texte alternatif de l’image</label><input class="input" id="ed-alt" data-k="alt" value="${esc(it.alt || '')}"></div>
          <div class="field full"><label for="ed-instr">Instructions de publication</label><textarea class="textarea" style="min-height:70px" id="ed-instr" data-k="instructions">${esc(it.instructions || '')}</textarea></div>
        </div>
        <div class="actions">
          ${btn('copy', `${ICON.copy} Copier la caption`, `data-what="caption" data-id="${esc(it.id)}"`)}
          ${it.platform !== 'newsletter' ? btn('copy', `${ICON.copy} Copier les hashtags`, `data-what="tags" data-id="${esc(it.id)}"`) : ''}
          ${btn('copy', `${ICON.copy} Copier tout`, `data-what="all" data-id="${esc(it.id)}"`)}
          ${btn('dup', 'Dupliquer', `data-id="${esc(it.id)}"`)}
        </div>
        <hr class="sep">
        <div class="row between">
          <div class="actions">${btn('set-status', 'Programmer', `data-id="${esc(it.id)}" data-s="scheduled"`)}${btn('set-status', 'Marquer comme publié', `data-id="${esc(it.id)}" data-s="published"`)}${btn('set-status', 'Archiver', `data-id="${esc(it.id)}" data-s="archived"`, 'btn--sm btn--danger')}</div>
          ${btn('save-content', 'Enregistrer les modifications', `data-id="${esc(it.id)}"`, 'btn--primary')}
        </div>
        ${MK.pillars.find((p) => p.id === it.pillar && p.check) ? `<p class="note">${MK.pillars.find((p) => p.id === it.pillar).check}</p>` : ''}
      </form>
    </div>
    ${scriptBlock(it)}
  </div>`;
  showModal(html);
}
function readEditor() {
  const form = $('#ed');
  const patch = {};
  $$('[data-k]', form).forEach((el) => {
    const k = el.dataset.k;
    let v = el.value;
    if (k === 'tags') v = v.split(/\s+/).filter(Boolean);
    if (k === 'campaign') v = v || null;
    patch[k] = v;
  });
  return patch;
}

function showModal(html, size = '') {
  const m = $('#modal');
  $('#modalPanel').className = `modal__panel ${size}`;
  $('#modalPanel').innerHTML = html;
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  const first = $('#modalPanel .modal__close');
  if (first) first.focus();
}
function closeModal() {
  $('#modal').hidden = true;
  ui.modal = null;
  document.body.style.overflow = '';
}

/* =========================================================================
   4. SOCIAL MEDIA LIBRARY
   ========================================================================= */
function libCard(c) {
  return `<article class="lcard">
    <div class="lcard__media"><button class="vcard" style="width:100%" data-act="open" data-id="${esc(c.id)}" aria-label="Ouvrir ${esc(c.title)}">${visualHTML(Object.assign(specFor(c), { format: c.format === 'story' || c.format === 'reel' || c.format === 'video' ? 'portrait' : c.format === 'email' ? 'email' : c.format === 'pin' ? 'portrait' : c.format }))}</button></div>
    <div class="lcard__body">
      <div class="row between">${plat(c.platform)}${pill(c.status)}</div>
      <span class="lcard__title">${esc(c.title)}</span>
      <span class="tiny muted num">${D.fmt(c.date, { weekday: true })} · ${c.time} · ${fmtLabel(c.format)}</span>
      <p class="lcard__cap">${esc(c.caption)}</p>
      <div class="lcard__foot">${btn('copy', `${ICON.copy} Caption`, `data-what="caption" data-id="${esc(c.id)}"`)}${c.tags && c.tags.length ? btn('copy', '#', `data-what="tags" data-id="${esc(c.id)}" title="Copier les hashtags"`) : ''}${btn('open', `${ICON.eye} Ouvrir`, `data-id="${esc(c.id)}"`)}</div>
    </div>
  </article>`;
}
function viewLibrary() {
  const f = ui.lib;
  const horizon = { '4w': D.add(NOW, 27), '3m': D.add(NOW, 90), year: CAL_END, all: CAL_END }[f.period];
  const from = f.period === 'all' ? CAL_START : D.monday(NOW);
  const q = f.q.trim().toLowerCase();
  const list = CAL.filter((c) => c.date >= from && c.date <= horizon
    && (!f.plat || c.platform === f.plat) && (!f.status ? c.status !== 'archived' : c.status === f.status) && (!f.pillar || c.pillar === f.pillar)
    && (!q || `${c.title} ${c.caption} ${(c.tags || []).join(' ')}`.toLowerCase().includes(q)));
  const sel = (id, k, opts, label) => `<select class="select" style="width:auto" id="${id}" data-on="lib" data-k="${k}" aria-label="${label}"><option value="">${label}</option>${opts.map(([v, l]) => `<option value="${v}" ${f[k] === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  return `${pageHead('Social Media Library', 'Publications prêtes à l’emploi', 'Chaque contenu contient son visuel, sa caption, ses hashtags, son call to action, son lien traqué, son texte alternatif et ses instructions de publication.')}
    <div class="row between">
      <div class="row">
        <input class="input search" type="search" id="lib-q" data-on="lib" data-k="q" placeholder="Rechercher un contenu…" value="${esc(f.q)}" aria-label="Rechercher">
        ${sel('lib-plat', 'plat', Object.entries(MK.platforms).map(([k, v]) => [k, v.label]), 'Tous les réseaux')}
        ${sel('lib-status', 'status', Object.entries(MK.statuses).map(([k, v]) => [k, v.label]), 'Tous les statuts')}
        ${sel('lib-pillar', 'pillar', MK.editorial.map((e) => [e.id, e.name]), 'Tous les piliers')}
      </div>
      <div class="seg">${[['4w', '4 semaines'], ['3m', '3 mois'], ['year', '12 mois'], ['all', 'Tout']].map(([v, l]) => `<button data-act="lib-period" data-v="${v}" aria-pressed="${f.period === v}">${l}</button>`).join('')}</div>
    </div>
    <p class="small muted num">${nf(list.length)} contenus</p>
    ${list.length ? `<div class="grid g-auto">${list.slice(0, f.limit).map(libCard).join('')}</div>` : '<p class="empty">Aucun contenu ne correspond à ces filtres.</p>'}
    ${list.length > f.limit ? `<div class="row" style="justify-content:center">${btn('lib-more', `Afficher plus (${list.length - f.limit} restants)`, '', '')}</div>` : ''}`;
}

/* =========================================================================
   5. VISUAL LIBRARY
   ========================================================================= */
function viewVisuals() {
  const v = ui.vis;
  const cats = MK.visualCategories;
  const linked = (tid) => CAL.filter((c) => c.tpl === tid && visible(c)).length;
  let body = '';
  if (v.tab === 'templates') {
    const list = MK.templates.filter((t) => !v.cat || t.cat === v.cat).map((t) => templateState(t.id));
    body = list.length ? `<div class="grid g-auto-s" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${list.map((t) => `<button class="vcard" data-act="edit-tpl" data-id="${t.id}">${visualHTML({ ...t, format: 'portrait' })}<span class="vcard__body"><span class="vcard__title">${t.name}</span><span class="tiny muted">${t.cat} · ${linked(t.id)} contenus liés</span></span></button>`).join('')}</div>` : '<p class="empty">Aucun template dans cette catégorie.</p>';
  } else {
    const catOf = (c) => (MK.templates.find((t) => t.id === c.tpl) || {}).cat || 'Brand Awareness';
    const list = CAL.filter((c) => c.date >= D.monday(NOW) && c.date <= D.add(NOW, 34) && visible(c) && c.platform !== 'newsletter' && (!v.cat || catOf(c) === v.cat));
    body = list.length ? `<div class="grid g-auto-s">${list.map((c) => `<button class="vcard" data-act="open" data-id="${esc(c.id)}">${visualHTML(specFor(c))}<span class="vcard__body"><span class="vcard__title">${esc(c.title)}</span><span class="tiny muted">${D.fmt(c.date)} · ${MK.formats[c.format].size.split(' — ')[0]}</span></span></button>`).join('')}</div>` : '<p class="empty">Aucun visuel dans cette catégorie pour les 5 prochaines semaines.</p>';
  }
  return `${pageHead('Visual Library', 'Bibliothèque de visuels', 'Templates permanents aux couleurs PREP CLUB. Modifier un template met à jour tous les contenus qui l’utilisent, sans recréer chaque visuel.')}
    ${tabs('vis', [['templates', 'Templates permanents'], ['contents', 'Visuels des 5 prochaines semaines']], v.tab)}
    <div class="chips"><button class="chip" data-act="vis-cat" data-v="" aria-pressed="${!v.cat}">Toutes</button>${cats.map((c) => `<button class="chip" data-act="vis-cat" data-v="${c}" aria-pressed="${v.cat === c}">${c}</button>`).join('')}</div>
    ${body}
    <p class="demo-note">Photos de démonstration (Unsplash), identiques à celles du site de démonstration. Une version commercialisée utiliserait les photos réelles des plats, de l’atelier et des producteurs.</p>`;
}
const IMG_CHOICES = [['', 'Aucune (typographique)'], ...Object.entries(IMG).map(([k, v]) => [v, `Ambiance : ${k}`]), ...PRODUCTS.map((p) => [p.img, `Produit : ${p.name}`])];
function openTemplate(id) {
  const t = templateState(id);
  ui.modal = { type: 'tpl', id, draft: { ...t } };
  const opts = (arr, cur) => arr.map(([v, l]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(l)}</option>`).join('');
  showModal(`<div class="modal__head"><div class="stack" style="gap:4px"><span class="label">${t.cat}</span><h2>${t.name}</h2></div><button class="modal__close" data-act="close" aria-label="Fermer">×</button></div>
  <div class="modal__body"><div class="editor"><div class="editor__side"><div id="tplPrev">${visualHTML({ ...t, format: 'portrait' })}</div>
    <div class="seg" id="tplFmt">${['square', 'portrait', 'story', 'pin'].map((f) => `<button type="button" data-act="tpl-fmt" data-v="${f}" aria-pressed="${f === 'portrait'}">${MK.formats[f].label.replace('Post ', '')}</button>`).join('')}</div></div>
    <form class="stack" id="tplForm">
      <div class="fields">
        <div class="field"><label for="tp-kicker">Surtitre</label><input class="input" id="tp-kicker" data-t="kicker" value="${esc(t.kicker)}"></div>
        <div class="field two"><label for="tp-headline">Titre</label><input class="input" id="tp-headline" data-t="headline" value="${esc(t.headline)}"></div>
        <div class="field full"><label for="tp-sub">Sous-titre</label><input class="input" id="tp-sub" data-t="sub" value="${esc(t.sub)}"></div>
        <div class="field"><label for="tp-layout">Mise en page</label><select class="select" id="tp-layout" data-t="layout">${opts([['photo', 'Photo pleine page'], ['split', 'Photo + bandeau'], ['type', 'Typographique']], t.layout)}</select></div>
        <div class="field"><label for="tp-theme">Couleur</label><select class="select" id="tp-theme" data-t="theme">${opts(Object.entries(THEMES).map(([k, v]) => [k, v.label]), t.theme)}</select></div>
        <div class="field"><label for="tp-img">Photo</label><select class="select" id="tp-img" data-t="img">${opts(IMG_CHOICES, t.img || '')}</select></div>
      </div>
      <p class="small muted">Les contenus liés gardent leur propre titre ; la mise en page, la couleur et la photo par défaut du template s’appliquent à tous.</p>
      <div class="row between"><div class="actions">${btn('tpl-dl', `${ICON.dl} Télécharger (PNG)`)}${btn('tpl-reset', 'Réinitialiser')}</div>${btn('tpl-save', 'Mettre à jour le template', '', 'btn--primary')}</div>
    </form></div></div>`);
}

/* =========================================================================
   6. CAPTION LIBRARY
   ========================================================================= */
function viewCaptions() {
  const lang = store.data.lang;
  const goals = [...new Set(MK.captions.map((c) => c.goal))];
  const list = MK.captions.filter((c) => !ui.cap.goal || c.goal === ui.cap.goal);
  return `${pageHead('Caption Library', 'Textes prêts à publier', 'Accroche, texte principal, call to action, hashtags, lien et date recommandée. À adapter aux produits, prix et disponibilités réels avant publication.', `<div class="seg" role="group" aria-label="Langue"><button data-act="lang" data-v="fr" aria-pressed="${lang === 'fr'}">Français</button><button data-act="lang" data-v="en" aria-pressed="${lang === 'en'}">English</button></div>`)}
    <div class="chips"><button class="chip" data-act="cap-goal" data-v="" aria-pressed="${!ui.cap.goal}">Tous les objectifs</button>${goals.map((g) => `<button class="chip" data-act="cap-goal" data-v="${g}" aria-pressed="${ui.cap.goal === g}">${g}</button>`).join('')}</div>
    <div class="grid g2">${list.map((c) => { const t = c[lang]; return `<article class="panel">
      <div class="panel__head"><span class="row"><span class="tag">${c.goal}</span><span class="tiny muted">${MK.pillars.find((p) => p.id === c.pillar) ? MK.pillars.find((p) => p.id === c.pillar).name : ''}</span></span><span class="meta">${c.date}</span></div>
      <h3 style="font-size:1.3rem">${esc(t.head)}</h3>
      <p class="pre small">${esc(t.body)}</p>
      <p class="small"><strong>CTA :</strong> ${esc(t.cta)}</p>
      <div class="row">${c.tags.map((h) => `<span class="tag">${h}</span>`).join('')}</div>
      <div class="row between"><span class="tiny muted">Lien : <a href="index.html${c.link}" target="_blank" rel="noopener">${c.link}</a></span>
      <div class="actions">${btn('copy-cap', `${ICON.copy} Caption`, `data-id="${c.id}" data-what="caption"`)}${btn('copy-cap', '#', `data-id="${c.id}" data-what="tags" title="Copier les hashtags"`)}${btn('copy-cap', 'Tout', `data-id="${c.id}" data-what="all"`)}</div></div>
    </article>`; }).join('')}</div>`;
}

/* =========================================================================
   7. STORIES & REELS
   ========================================================================= */
function viewStories() {
  const t = ui.stories;
  const usage = (k, v) => CAL.filter((c) => c[k] === v && visible(c)).length;
  const body = t === 'stories'
    ? MK.stories.map((s) => `<section class="panel"><div class="panel__head"><div class="stack" style="gap:2px"><h3>${s.name}</h3><span class="small muted">${s.when} · ${s.frames.length} stories · lien ${s.link}</span></div>
        <div class="actions"><span class="tiny muted">${usage('story', s.id)} fois au calendrier</span>${btn('copy-story', `${ICON.copy} Copier la séquence`, `data-id="${s.id}"`)}</div></div>
        <div class="frames">${s.frames.map((fr, i) => `<div class="frame">${visualHTML({ layout: 'photo', theme: 'dark', kicker: `Story ${i + 1}/${s.frames.length}`, headline: fr.text, sub: '', img: fr.img, format: 'story' })}<span class="small"><strong>${i + 1}.</strong> ${esc(fr.text)}</span><span class="tiny muted">Sticker : ${esc(fr.sticker)}</span></div>`).join('')}</div></section>`).join('')
    : MK.reels.map((r) => `<section class="panel"><div class="grid" style="grid-template-columns:minmax(0,170px) minmax(0,1fr);gap:20px">
        <div>${visualHTML({ layout: 'photo', theme: 'dark', kicker: `Reel · ${r.duration}`, headline: r.fr, sub: '', img: r.img, format: 'reel' })}</div>
        <div class="stack">
          <div class="panel__head"><div class="stack" style="gap:2px"><h3>${r.fr}</h3><span class="small muted">${r.name} · durée cible ${r.duration} · ${pillarName(r.pillar)}</span></div><span class="tiny muted">${usage('reel', r.id)} fois au calendrier</span></div>
          <div class="grid g2"><div class="stack"><span class="label">Script & liste des plans</span><ol class="steps small">${r.shots.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
          <div class="stack"><span class="label">Texte à afficher</span><div class="row">${r.onscreen.map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</div><span class="label">Musique / ambiance</span><p class="small">${esc(r.music)}</p></div></div>
          <hr class="sep"><p class="small"><strong>Caption :</strong> ${esc(r.caption)}</p><div class="row">${r.tags.map((h) => `<span class="tag">${h}</span>`).join('')}</div>
          <div class="actions">${btn('copy-reel', `${ICON.copy} Copier le script`, `data-id="${r.id}" data-what="script"`)}${btn('copy-reel', `${ICON.copy} Copier la caption`, `data-id="${r.id}" data-what="caption"`)}${btn('dl-reel', `${ICON.dl} Cover (PNG)`, `data-id="${r.id}"`)}</div>
        </div></div></section>`).join('');
  return `${pageHead('Stories & Reels', 'Séquences et scripts prêts à tourner', 'Chaque séquence de Stories inclut le visuel, le texte, les stickers et le lien. Chaque Reel inclut le script, les plans, le texte à l’écran, la durée, l’ambiance, la caption, les hashtags et la cover.')}
    ${tabs('stories', [['stories', `Stories (${MK.stories.length})`], ['reels', `Reels & TikTok (${MK.reels.length})`]], t)}
    ${t === 'reels' ? '<p class="note">Les vidéos doivent être filmées à partir de contenus réels et autorisés. Les musiques sont choisies dans les bibliothèques commerciales des plateformes, sous réserve des droits.</p>' : ''}
    ${body}`;
}

/* =========================================================================
   8. EMAIL MARKETING
   ========================================================================= */
function flowOn(f) { return store.data.flows[f.id] ?? f.active; }
function viewEmail() {
  const t = ui.email;
  const nl = MK.newsletter;
  const s = nl.sample;
  let body = '';
  if (t === 'newsletter') {
    const pick = (name) => PRODUCTS.find((p) => p.name === name) || PRODUCTS[0];
    body = `<div class="grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1.6fr);gap:24px;align-items:start">
      <section class="panel"><h3>Structure de ${nl.name}</h3><p class="small muted">${nl.when}. Les sections sont toujours dans cet ordre.</p><ol class="steps small">${nl.sections.map((x) => `<li>${x}</li>`).join('')}</ol>
        <hr class="sep"><div class="dl"><dt>Objet</dt><dd>${esc(s.subject)}</dd><dt>Préheader</dt><dd>${esc(s.preheader)}</dd><dt>Segment</dt><dd>Tous les inscrits (consentement newsletter)</dd><dt>Déclencheur</dt><dd>Envoi programmé le dimanche à 9 h</dd></div>
        <div class="actions">${btn('copy-nl', `${ICON.copy} Copier le texte de l’exemple`)}</div></section>
      <div class="mail">
        <div class="mail__head"><span class="logo">PREP<i>CLUB</i></span><span class="tiny">${nl.name} · exemple</span></div>
        <div class="mail__sec"><span class="mail__n">Introduction</span><p class="pre">${esc(s.intro)}</p></div>
        <div class="mail__sec"><span class="mail__n">Weekly Menu</span><div class="mail__menu">${s.menu.map((m) => `<div><img src="${imgUrlMk(pick(m).img, 300)}" alt="">${esc(m)}</div>`).join('')}</div></div>
        <div class="mail__sec"><span class="mail__n">Featured Recipe</span><h4>${esc(s.recipe.name)}</h4><p>${esc(s.recipe.text)}</p></div>
        <div class="mail__sec"><span class="mail__n">Seasonal Highlight</span><p>${esc(s.season)}</p></div>
        <div class="mail__sec"><span class="mail__n">Producer Spotlight</span><h4>${esc(s.producer.name)}</h4><p>${esc(s.producer.text)}</p></div>
        <div class="mail__sec"><span class="mail__n">Weekly Planning Tip</span><p>${esc(s.tip)}</p><span class="mail__cta">Plan Your Week</span></div>
        <div class="mail__foot">PREP CLUB · 24 rue de Gerland, 69007 Lyon · Vous recevez cet e-mail car vous êtes inscrit à The Weekly Prep. Gérer mes préférences · Se désinscrire</div>
      </div></div>`;
  } else if (t === 'flows') {
    body = MK.flows.map((f) => `<section class="panel">
      <div class="panel__head"><div class="stack" style="gap:2px"><h3>${f.name} <span class="muted small" style="font-family:var(--sans)">· ${f.fr}</span></h3><span class="small muted">Déclencheur : ${f.trigger} · Segment : ${f.segment}</span></div>
        <label class="row small"><span class="switch"><input type="checkbox" id="flow-${f.id}" data-on="flow" data-id="${f.id}" ${flowOn(f) ? 'checked' : ''}><span></span></span>${flowOn(f) ? 'Actif' : 'Inactif'}</label></div>
      <div class="flow">${f.emails.map((e, i) => `<div class="flow__step"><span class="label">E-mail ${i + 1} · ${e.delay}</span><strong>${esc(e.subject)}</strong><span class="small muted">${esc(e.pre)}</span><p class="small">${esc(e.body)}</p>
        <span class="small"><strong>CTA :</strong> ${esc(e.cta)} → <code class="tiny">${e.link}</code></span><span class="tiny muted">Conditions : ${esc(e.cond)}</span>
        <div>${btn('copy-mail', `${ICON.copy} Copier`, `data-flow="${f.id}" data-i="${i}"`)}</div></div>`).join('')}</div>
    </section>`).join('');
  } else {
    const list = CAL.filter((c) => c.platform === 'newsletter' && c.date >= D.monday(NOW) && visible(c)).slice(0, 16);
    body = `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Objet</th><th>Campagne</th><th>Segment</th><th>Statut</th><th></th></tr></thead><tbody>
      ${list.map((n) => `<tr><td class="num">${D.fmt(n.date, { weekday: true })} · ${n.time}</td><td><strong>${esc(n.subject || n.title)}</strong></td><td>${n.campaign ? esc(campName(n.campaign)) : '<span class="muted">—</span>'}</td><td>Tous les inscrits</td><td>${pill(n.status)}</td><td>${btn('open', 'Ouvrir', `data-id="${esc(n.id)}"`)}</td></tr>`).join('')}
    </tbody></table></div>`;
  }
  return `${pageHead('Email Marketing', 'The Weekly Prep & automatisations', 'Une newsletter chaque dimanche, des campagnes pour les nouveautés et six scénarios déclenchés automatiquement. Chaque e-mail précise son objet, son préheader, son texte, son CTA, son lien, son segment, son déclencheur et ses conditions d’envoi.')}
    ${tabs('email', [['newsletter', 'Newsletter hebdomadaire'], ['flows', `Automatisations (${MK.flows.length})`], ['sends', 'Envois programmés']], t)}
    ${body}`;
}

/* =========================================================================
   9. CAMPAIGN MANAGER
   ========================================================================= */
function gantt() {
  const start = D.parse('2026-11-01');
  const end = D.parse('2027-11-01');
  const span = end - start;
  const pos = (iso) => Math.max(0, Math.min(100, ((D.parse(iso) - start) / span) * 100));
  const months = [];
  for (let i = 0; i < 12; i++) months.push(new Date(2026, 10 + i, 1));
  return `<div class="gantt"><div class="gantt__inner">
    <div class="gantt__months"><span style="border:0">Campagne</span><div>${months.map((m) => `<span>${D.monthsShort[m.getMonth()]}</span>`).join('')}</div></div>
    ${MK.campaigns.map(campaignState).map((c) => `<div class="gantt__row"><button class="gantt__label" data-act="open-camp" data-id="${c.id}">${esc(c.name)}</button><div class="gantt__track">
      <button class="gantt__bar st-${c.status}" data-act="open-camp" data-id="${c.id}" style="left:${pos(c.start)}%;width:${Math.max(1, pos(D.add(c.end, 1)) - pos(c.start))}%" title="${esc(c.name)} : ${D.fmt(c.start)} → ${D.fmt(c.end)}" aria-label="${esc(c.name)}"></button>
      ${TODAY >= '2026-11-01' && TODAY < '2027-11-01' ? `<span class="gantt__today" style="left:${pos(TODAY)}%"></span>` : ''}</div></div>`).join('')}
  </div></div>`;
}
function viewCampaigns() {
  return `${pageHead('Campaign Manager', 'Campagnes préconstruites', 'Dix campagnes prêtes à activer sur douze mois. Chacune réunit objectif, cible, période, offre, contenus, e-mails, landing page, budget indicatif et KPIs.')}
    ${gantt()}
    <div class="row small muted"><span class="pill pill--olive">En cours</span><span class="pill pill--blue">Prête</span><span class="pill pill--line">Brouillon</span><span>La ligne rouge marque aujourd’hui.</span></div>
    <div class="grid g-auto" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${MK.campaigns.map(campaignState).map((c) => {
      const n = CAL.filter((x) => x.campaign === c.id && visible(x)).length;
      const ads = MK.ads.filter((a) => a.campaign === c.id).length;
      return `<article class="panel"><div class="panel__head"><h3>${esc(c.name)}</h3>${campPill(c.status)}</div>
        <span class="small muted num">${D.fmt(c.start, { year: true })} → ${D.fmt(c.end, { year: true })} · ${D.diff(c.start, c.end) + 1} jours</span>
        <p class="small">${esc(c.goal)}</p>
        <div class="ymini"><div><b>${n}</b>contenus</div><div><b>${c.contents.length}</b>livrables</div><div><b>${ads}</b>pubs</div><div><b>${c.budget ? `${c.budget} €` : '—'}</b>budget</div></div>
        <div class="row" style="margin-top:auto">${btn('open-camp', 'Voir le détail', `data-id="${c.id}"`)}${c.status === 'active' ? btn('camp-status', 'Mettre en pause', `data-id="${c.id}" data-s="paused"`) : c.status !== 'done' ? btn('camp-status', 'Activer', `data-id="${c.id}" data-s="active"`, 'btn--sm btn--primary') : ''}</div>
      </article>`;
    }).join('')}</div>`;
}
function openCampaign(id) {
  const c = campaignState(MK.campaigns.find((x) => x.id === id));
  ui.modal = { type: 'camp', id };
  const items = CAL.filter((x) => x.campaign === id && visible(x));
  const ads = MK.ads.filter((a) => a.campaign === id).map(adState);
  const flow = id === 'launch' ? MK.flows.find((f) => f.id === 'welcome') : ['spring', 'summer', 'autumn', 'winter'].includes(id) ? MK.flows.find((f) => f.id === 'seasonal') : id === 'club' ? MK.flows.find((f) => f.id === 'sub') : null;
  const res = (store.data.campaigns[id] || {}).results || {};
  showModal(`<div class="modal__head"><div class="stack" style="gap:6px"><span class="row">${campPill(c.status)}<span class="tiny muted">${esc(c.fr)}</span></span><h2>${esc(c.name)}</h2></div><button class="modal__close" data-act="close" aria-label="Fermer">×</button></div>
  <div class="modal__body">
    <div class="fields">
      <div class="field"><label for="cp-start">Début</label><input class="input" type="date" id="cp-start" data-c="start" value="${c.start}"></div>
      <div class="field"><label for="cp-end">Fin</label><input class="input" type="date" id="cp-end" data-c="end" value="${c.end}"></div>
      <div class="field"><label for="cp-status">Statut</label><select class="select" id="cp-status" data-c="status">${Object.entries(CAMP_ST).map(([k, v]) => `<option value="${k}" ${k === c.status ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></div>
    </div>
    <div class="grid g2">
      <section class="panel"><div class="dl"><dt>Objectif</dt><dd>${esc(c.goal)}</dd><dt>Cible</dt><dd>${esc(c.target)}<div class="row" style="margin-top:6px">${c.persona.map((p) => `<span class="tag">${MK.personas.find((x) => x.id === p).name}</span>`).join('')}</div></dd><dt>Offre commerciale</dt><dd>${esc(c.offer)}</dd><dt>Landing page</dt><dd><a href="index.html${c.landing}" target="_blank" rel="noopener">${c.landing}</a></dd><dt>Budget indicatif</dt><dd>${c.budget ? `${c.budget} € (publicité, en attente de validation)` : 'Aucun budget publicitaire'}</dd>${flow ? `<dt>E-mails</dt><dd>${flow.name} (${flow.emails.length} e-mails) + newsletters de la période</dd>` : ''}</div></section>
      <section class="panel"><h3>KPIs</h3><div class="table-wrap"><table><thead><tr><th>Indicateur</th><th class="num">Objectif</th><th>Résultat</th></tr></thead><tbody>
        ${c.kpis.map(([k, v], i) => `<tr><td>${k}</td><td class="num">${v}</td><td><input class="input" style="padding:4px 8px" id="cp-res-${i}" data-res="${i}" value="${esc(res[i] || '')}" placeholder="Saisir le résultat" aria-label="Résultat ${esc(k)}"></td></tr>`).join('')}
      </tbody></table></div></section>
    </div>
    <section class="panel"><div class="panel__head"><h3>Livrables</h3><span class="meta">${c.contents.length} éléments</span></div><div class="grid g3">${c.contents.map((x) => `<span class="small">• ${esc(x)}</span>`).join('')}</div></section>
    <section class="stack"><div class="panel__head"><h3>Contenus planifiés</h3><span class="meta">${items.length} au calendrier</span></div>
      ${items.length ? `<div class="grid g-auto" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${items.slice(0, 12).map(contentCard).join('')}</div>${items.length > 12 ? `<p class="small muted">+ ${items.length - 12} autres contenus au calendrier.</p>` : ''}` : '<p class="empty">Aucun contenu planifié sur cette période.</p>'}</section>
    ${ads.length ? `<section class="stack"><h3>Publicités liées</h3><div class="table-wrap"><table><tbody>${ads.map((a) => `<tr><td><strong>${esc(a.name)}</strong><div class="tiny muted">${esc(a.channel)}</div></td><td class="num">${a.budget} €</td><td><span class="pill pill--${AD_ST[a.status][1]}">${AD_ST[a.status][0]}</span></td></tr>`).join('')}</tbody></table></div></section>` : ''}
    <div class="row" style="justify-content:flex-end">${btn('camp-save', 'Enregistrer', `data-id="${id}"`, 'btn--primary')}</div>
  </div>`);
}

/* =========================================================================
   10. SEASONAL
   ========================================================================= */
function viewSeasons() {
  return `${pageHead('Seasonal Campaigns', 'Calendrier saisonnier', 'Une campagne par saison, reliée aux collections réellement commercialisées. Les dates restent modifiables depuis chaque campagne.')}
    <div class="grid g2">${MK.seasonPlan.map((s) => `<article class="lcard"><div style="position:relative;aspect-ratio:16/7;overflow:hidden"><img src="${imgUrlMk(s.img, 900)}" alt="" style="width:100%;height:100%;object-fit:cover"></div>
      <div class="lcard__body"><div class="panel__head"><h2>${s.name}</h2><span class="meta">${s.en} · ${s.months}</span></div>
        <div class="grid g2"><div class="stack"><span class="label">Thèmes</span><ul class="clean small">${s.items.map((x) => `<li>${x}</li>`).join('')}</ul></div>
        <div class="stack"><span class="label">Ingrédients de saison</span><div class="row">${SEASONS[s.id].ingredients.map((x) => `<span class="tag">${x}</span>`).join('')}</div></div></div>
        <hr class="sep"><span class="label">Campagnes</span>
        <div class="stack">${s.campaigns.map((id) => campaignState(MK.campaigns.find((c) => c.id === id))).map((c) => `<div class="row between"><span class="small"><strong>${esc(c.name)}</strong> · <span class="muted num">${D.fmt(c.start)} → ${D.fmt(c.end)}</span></span>${btn('open-camp', 'Modifier', `data-id="${c.id}"`)}</div>`).join('')}</div>
      </div></article>`).join('')}</div>`;
}

/* =========================================================================
   11. INFLUENCE
   ========================================================================= */
function allInfluencers() {
  return MK.influencers.concat(store.data.inflAdded).map((i) => Object.assign({}, i, store.data.infl[i.id] || {}));
}
function viewInfluence() {
  const t = ui.infl;
  let body = '';
  if (t === 'contacts') {
    const list = allInfluencers();
    body = `<p class="demo-note">Profils fictifs donnés en exemple. Remplacez-les par de vrais contacts après vérification de l’audience (localisation lyonnaise, taux d’engagement, cohérence avec la marque).</p>
    <div class="kanban">${Object.entries(MK.influencerStatuses).map(([k, label]) => { const col = list.filter((i) => i.status === k); return `<div class="kanban__col"><h4>${label}<span class="num">${col.length}</span></h4>
      ${col.map((i) => `<div class="icard"><strong>${esc(i.name)}</strong><span class="muted">${esc(i.handle)} · ${esc(i.network)}</span><span class="num">${nf(i.followers)} abonnés · ${String(i.engagement).replace('.', ',')} % d’engagement</span><span class="tiny muted">${esc(i.niche)}</span><span class="tiny">Budget : ${esc(i.budget)}</span><span class="tiny muted">${esc(i.history)}</span>
        <select class="select" style="padding:4px 6px;font-size:.74rem" id="infl-${i.id}" data-on="infl" data-id="${i.id}" aria-label="Statut de ${esc(i.name)}">${Object.entries(MK.influencerStatuses).map(([kk, l]) => `<option value="${kk}" ${kk === i.status ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`).join('')}</div>`; }).join('')}</div>
    <section class="panel"><h3>Ajouter un contact</h3><form id="inflForm" class="fields">
      <div class="field"><label for="if-name">Nom ou description</label><input class="input" id="if-name" name="name" required></div>
      <div class="field"><label for="if-handle">Compte</label><input class="input" id="if-handle" name="handle" placeholder="@compte"></div>
      <div class="field"><label for="if-network">Réseau</label><select class="select" id="if-network" name="network"><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>LinkedIn</option></select></div>
      <div class="field"><label for="if-followers">Abonnés</label><input class="input" id="if-followers" name="followers" type="number" min="0"></div>
      <div class="field"><label for="if-eng">Engagement (%)</label><input class="input" id="if-eng" name="engagement" type="number" step="0.1" min="0"></div>
      <div class="field"><label for="if-budget">Budget envisagé</label><input class="input" id="if-budget" name="budget" placeholder="Produits, 200 €…"></div>
      <div class="field full"><label for="if-niche">Thématique et coordonnées professionnelles</label><input class="input" id="if-niche" name="niche"></div>
      <div class="full"><button class="btn btn--primary" type="submit">Ajouter le contact</button></div></form></section>`;
  } else if (t === 'kit') {
    body = `<section class="panel"><div class="panel__head"><h3>Kit de collaboration</h3>${btn('copy-kit', `${ICON.copy} Copier le kit`)}</div><div class="dl">${MK.influencerKit.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</div></section>
      <p class="note">Toute collaboration rémunérée ou avec produits offerts doit afficher clairement la mention « Publicité » ou « Collaboration commerciale » (loi n° 2023-451 du 9 juin 2023 sur l’influence commerciale).</p>`;
  } else {
    body = `<div class="grid g3">${MK.influencerMessages.map((m, i) => `<section class="panel"><div class="panel__head"><h3>${m.name}</h3>${btn('copy-msg', `${ICON.copy} Copier`, `data-i="${i}"`)}</div><p class="pre small">${esc(m.text)}</p></section>`).join('')}</div>`;
  }
  return `${pageHead('Influencer Marketing', 'Collaborations avec des créateurs', 'Base de contacts, suivi des collaborations, kit prêt à envoyer et modèles de messages. Priorité aux micro-créateurs lyonnais (food, lifestyle, vie de bureau).')}
    ${tabs('infl', [['contacts', 'Contacts & suivi'], ['kit', 'Kit de collaboration'], ['messages', 'Modèles de messages']], t)}
    ${body}`;
}

/* =========================================================================
   12. PUBLICITÉ
   ========================================================================= */
function adState(a) { return Object.assign({}, a, store.data.ads[a.id] || {}); }
function viewAds() {
  const ads = MK.ads.map(adState);
  const sum = (f) => ads.filter(f).reduce((s, a) => s + Number(a.budget || 0), 0);
  return `${pageHead('Advertising Manager', 'Campagnes publicitaires', 'Meta, Instagram, TikTok et Google Ads. Les budgets sont des propositions : aucune dépense n’est engagée sans votre validation.')}
    <div class="kpis" style="grid-template-columns:repeat(4,minmax(0,1fr))">
      <div class="kpi"><span class="kpi__v">${nf(sum(() => true))} €</span><span class="kpi__l">budget total proposé</span></div>
      <div class="kpi"><span class="kpi__v">${nf(sum((a) => a.status === 'validated' || a.status === 'running'))} €</span><span class="kpi__l">budget validé</span></div>
      <div class="kpi"><span class="kpi__v">${ads.filter((a) => a.status === 'approval').length}</span><span class="kpi__l">budgets en attente</span></div>
      <div class="kpi"><span class="kpi__v">${ads.length}</span><span class="kpi__l">campagnes préparées</span></div>
    </div>
    <div class="grid g2">${ads.map((a) => `<article class="panel"><div class="panel__head"><div class="stack" style="gap:2px"><h3>${esc(a.name)}</h3><span class="small muted">${esc(a.channel)} · ${a.type}</span></div><span class="pill pill--${AD_ST[a.status][1]}">${AD_ST[a.status][0]}</span></div>
      <div class="grid" style="grid-template-columns:minmax(0,150px) minmax(0,1fr);gap:16px">
        <div class="adprev">${a.visual ? `<div class="adprev__top"><span class="phone__av">PC</span><span><strong>PREP CLUB</strong><br><span class="tiny muted">Sponsorisé</span></span></div>${visualHTML({ ...templateState(a.visual), format: 'square' })}<div class="adprev__cta"><span>${esc(a.cta)}</span>›</div>` : `<div class="serp" style="border:0"><span class="serp__url">Annonce · prepclub</span><span class="serp__t" style="font-size:.86rem">${esc(a.text.split(' | ')[0])}</span><span class="serp__d">${esc(a.text.split(' | ').slice(1).join(' · '))}</span></div>`}</div>
        <div class="dl" style="grid-template-columns:90px minmax(0,1fr)"><dt>Audience</dt><dd>${esc(a.audience)}</dd><dt>Zone</dt><dd>${esc(a.zone)}</dd><dt>Dates</dt><dd>${esc(a.dates)}</dd><dt>Texte</dt><dd>${esc(a.text)}</dd><dt>Landing</dt><dd><code class="tiny">${a.landing}</code></dd>
          <dt><label for="ad-b-${a.id}">Budget</label></dt><dd><input class="input num" style="width:110px;padding:4px 8px" type="number" min="0" step="10" id="ad-b-${a.id}" data-on="ad-budget" data-id="${a.id}" value="${a.budget}"> €</dd><dt>Résultats</dt><dd class="muted">Après diffusion</dd></div>
      </div>
      <div class="row">${a.status === 'approval' || a.status === 'draft' ? `${btn('ad-status', 'Valider le budget', `data-id="${a.id}" data-s="validated"`, 'btn--sm btn--primary')}${btn('ad-status', 'Refuser', `data-id="${a.id}" data-s="refused"`)}` : a.status === 'validated' ? `${btn('ad-status', 'Lancer la diffusion', `data-id="${a.id}" data-s="running"`, 'btn--sm btn--primary')}${btn('ad-status', 'Annuler la validation', `data-id="${a.id}" data-s="approval"`)}` : btn('ad-status', 'Remettre en brouillon', `data-id="${a.id}" data-s="draft"`)}</div>
    </article>`).join('')}</div>
    <p class="note">Retargeting uniquement auprès des visiteurs ayant accepté les cookies publicitaires, conformément aux règles de consentement applicables.</p>`;
}

/* =========================================================================
   13. SEO & BLOG
   ========================================================================= */
function viewSeo() {
  const t = ui.seo;
  let body = '';
  if (t === 'articles') {
    body = `<div class="grid g2">${MK.articles.map((a) => { const st = (store.data.seo[a.id] || {}).status || a.status; return `<article class="panel">
      <div class="panel__head"><span class="row"><span class="tag">${a.kw}</span><span class="tiny muted num">${D.fmt(a.date, { year: true })} · ~${nf(a.words)} mots</span></span>${pill(st)}</div>
      <div class="serp"><span class="serp__url">prepclub · blog › ${a.slug}</span><span class="serp__t">${esc(a.title)}</span><span class="serp__d">${esc(a.meta)}</span></div>
      <div class="stack"><span class="label">Plan de l’article</span><ol class="steps small">${a.outline.map((o) => `<li>${esc(o)}</li>`).join('')}</ol></div>
      <span class="small muted">Maillage interne : ${a.links.map((l) => `<code class="tiny">${l}</code>`).join(', ')}</span>
      <div class="row">${btn('copy-seo', `${ICON.copy} Copier titre + meta`, `data-id="${a.id}"`)}<select class="select" style="width:auto;padding:4px 8px;font-size:.76rem" id="seo-${a.id}" data-on="seo" data-id="${a.id}" aria-label="Statut de l’article">${['draft', 'approval', 'ready', 'scheduled', 'published'].map((s) => `<option value="${s}" ${s === st ? 'selected' : ''}>${MK.statuses[s].label}</option>`).join('')}</select></div>
    </article>`; }).join('')}</div>`;
  } else if (t === 'keywords') {
    body = `<div class="table-wrap"><table><thead><tr><th>Mot-clé</th><th>Intention</th><th>Page cible</th><th>Priorité</th><th>Volume</th></tr></thead><tbody>
      ${MK.keywords.map((k) => `<tr><td><strong>${k.kw}</strong></td><td>${k.intent}</td><td>${k.page}</td><td><span class="pill pill--${k.prio === 'Haute' ? 'olive' : k.prio === 'Moyenne' ? 'blue' : 'line'}">${k.prio}</span></td><td class="muted small">À mesurer (Search Console, Keyword Planner)</td></tr>`).join('')}
    </tbody></table></div><p class="small muted">Les contenus SEO répondent à de vraies recherches et ne multiplient pas artificiellement les mots-clés.</p>`;
  } else {
    body = `<section class="panel"><h3>Référencement local — Lyon</h3><div>${MK.localSeo.map((x, i) => `<label class="check ${store.data.seo[`l${i}`] ? 'done' : ''}"><input type="checkbox" id="lseo-${i}" data-on="lseo" data-i="${i}" ${store.data.seo[`l${i}`] ? 'checked' : ''}><span class="small">${x}</span></label>`).join('')}</div></section>`;
  }
  return `${pageHead('SEO & Blog', 'Visibilité organique', 'Mots-clés locaux, articles préconstruits avec méta-descriptions et plans, et checklist du référencement local.')}
    ${tabs('seo', [['articles', `Articles (${MK.articles.length})`], ['keywords', 'Mots-clés'], ['local', 'SEO local']], t)}
    ${body}`;
}

/* =========================================================================
   14. AUTOMATION
   ========================================================================= */
function viewAutomation() {
  const on = (a) => store.data.autos[a.id] ?? a.on;
  const active = MK.automations.filter(on).length;
  const sched = CAL.filter((c) => c.date >= NOW && ['scheduled', 'ready'].includes(c.status)).length;
  return `${pageHead('Marketing Automation', 'Automatisations', 'Les tâches répétitives sont programmées ou déclenchées automatiquement dès que les plateformes connectées le permettent.')}
    <div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="kpi"><span class="kpi__v">${active}/${MK.automations.length}</span><span class="kpi__l">règles actives</span></div><div class="kpi"><span class="kpi__v">${MK.flows.filter(flowOn).length}</span><span class="kpi__l">scénarios e-mail actifs</span></div><div class="kpi"><span class="kpi__v">${nf(sched)}</span><span class="kpi__l">contenus prêts ou programmés</span></div></div>
    <div class="table-wrap"><table><thead><tr><th>Règle</th><th>Déclencheur</th><th>Action</th><th>Outil</th><th>Active</th></tr></thead><tbody>
      ${MK.automations.map((a) => `<tr><td><strong>${a.name}</strong></td><td>${a.trigger}</td><td>${a.action}</td><td class="muted">${a.tool}</td><td><label class="switch"><input type="checkbox" id="auto-${a.id}" data-on="auto" data-id="${a.id}" ${on(a) ? 'checked' : ''} aria-label="${a.name}"><span></span></label></td></tr>`).join('')}
    </tbody></table></div>
    <p class="demo-note">Prototype : les interrupteurs enregistrent vos choix dans ce navigateur. La publication réelle nécessite de connecter les comptes Meta, TikTok, Pinterest et l’outil d’e-mailing.</p>`;
}

/* =========================================================================
   15. ANALYTICS & REPORTS
   ========================================================================= */
function volumeChart() {
  const months = [];
  for (let i = 0; i < 12; i++) { const m = new Date(2026, 10 + i, 1); months.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`); }
  const plats = [['instagram', 'var(--c-ig)'], ['tiktok', 'var(--c-tt)'], ['pinterest', 'var(--c-pi)'], ['newsletter', 'var(--c-nl)']];
  const data = months.map((ym) => plats.map(([p]) => CAL.filter((c) => visible(c) && c.platform === p && c.date.startsWith(ym)).length));
  const max = Math.max(...data.map((d) => d.reduce((a, b) => a + b, 0)));
  const top = Math.ceil(max / 20) * 20;
  const W = 760, H = 260, L = 36, B = 28, T = 10;
  const bw = (W - L - 10) / 12;
  const y = (v) => H - B - ((H - B - T) * v) / top;
  const ticks = [0, top / 4, top / 2, (top * 3) / 4, top];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Contenus planifiés par mois et par réseau">
    ${ticks.map((t) => `<line class="grid-l" x1="${L}" x2="${W - 6}" y1="${y(t)}" y2="${y(t)}"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join('')}
    ${data.map((d, i) => { let acc = 0; const x = L + i * bw + bw * 0.18; return d.map((v, k) => { const r = `<rect x="${x}" y="${y(acc + v)}" width="${bw * 0.64}" height="${y(acc) - y(acc + v)}" fill="${plats[k][1]}"><title>${MK.platforms[plats[k][0]].label} : ${v}</title></rect>`; acc += v; return r; }).join('') + `<text x="${x + bw * 0.32}" y="${H - 10}" text-anchor="middle">${D.monthsShort[D.parse(`${months[i]}-01`).getMonth()]}</text>`; }).join('')}
  </svg>
  <div class="row small">${plats.map(([p]) => plat(p)).join('')}</div>`;
}
function viewAnalytics() {
  const total = CAL.filter(visible).length;
  const byStatus = Object.keys(MK.statuses).map((s) => [s, CAL.filter((c) => c.status === s).length]);
  const ads = MK.ads.map(adState);
  const adMax = Math.max(...MK.campaigns.map((c) => ads.filter((a) => a.campaign === c.id).reduce((s, a) => s + Number(a.budget), 0)), 1);
  return `${pageHead('Analytics & Reports', 'Mesure et bilans', 'Ce que le plan prévoit, ce qui est déjà produit, et les objectifs à suivre. Les performances réelles s’ajoutent une fois les comptes connectés.', btn('report', 'Générer le bilan du mois', '', 'btn--primary'))}
    <div class="grid g3">
      <section class="panel span2"><div class="panel__head"><h3>Contenus planifiés par mois</h3><span class="meta num">${nf(total)} contenus sur 12 mois</span></div>${volumeChart()}</section>
      <section class="panel"><h3>Avancement de production</h3><div class="stack">${byStatus.filter(([, n]) => n).map(([s, n]) => `<div class="row between">${pill(s)}<span class="num small">${nf(n)}</span></div>`).join('')}</div></section>
    </div>
    <section class="panel"><div class="panel__head"><h3>Mix éditorial planifié et cible</h3><span class="meta">Le trait noir marque la cible</span></div>
      ${MK.editorial.map((e) => { const pct = Math.round((CAL.filter((c) => visible(c) && c.pillar === e.id).length / total) * 100); return `<div class="hbar"><span>${e.name}</span><span class="hbar__track"><span class="hbar__fill" style="width:${Math.min(100, pct * 2)}%;background:${e.color}"></span><span class="hbar__target" style="left:${e.share * 2}%"></span></span><span class="num small">${pct} % / ${e.share} %</span></div>`; }).join('')}
      <p class="tiny muted">Échelle : la piste complète représente 50 % des contenus. Les Stories et les épingles tirent la part « Community » et « Lifestyle » ; rééquilibrez depuis le calendrier si besoin.</p></section>
    <div class="grid g2">
      <section class="panel"><h3>Objectifs à suivre</h3><div class="table-wrap"><table><thead><tr><th>Indicateur</th><th class="num">M+3</th><th class="num">M+6</th><th class="num">M+12</th></tr></thead><tbody>${MK.objectives.map((o) => `<tr><td>${o.kpi}<div class="tiny muted">${o.source}</div></td><td class="num">${o.m3}</td><td class="num">${o.m6}</td><td class="num">${o.m12}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="panel"><h3>Budget publicitaire proposé par campagne</h3>
        ${MK.campaigns.map((c) => [c, ads.filter((a) => a.campaign === c.id).reduce((s, a) => s + Number(a.budget), 0)]).filter(([, v]) => v).map(([c, v]) => `<div class="hbar" style="grid-template-columns:150px minmax(0,1fr) 60px"><span class="small">${esc(c.name)}</span><span class="hbar__track"><span class="hbar__fill" style="width:${(v / adMax) * 100}%;background:var(--olive)"></span></span><span class="num small">${v} €</span></div>`).join('')}
        <hr class="sep"><h3>Contenu du bilan mensuel</h3><ul class="clean small"><li>Contenus publiés par réseau et par pilier</li><li>Portée, engagement, abonnés gagnés</li><li>Trafic issu des réseaux (UTM) et conversions</li><li>Résultats des campagnes et des publicités</li><li>Performances newsletter : ouvertures, clics, commandes</li><li>Trois recommandations pour le mois suivant</li></ul></section>
    </div>`;
}
function openReport() {
  const ym = NOW.slice(0, 7);
  const m = D.parse(`${ym}-01`);
  const items = CAL.filter((c) => c.date.startsWith(ym) && visible(c));
  const camps = MK.campaigns.map(campaignState).filter((c) => c.start.slice(0, 7) <= ym && c.end.slice(0, 7) >= ym);
  const per = (p) => items.filter((c) => c.platform === p);
  showModal(`<div class="modal__head"><div class="stack" style="gap:4px"><span class="label">Bilan marketing</span><h2 style="text-transform:capitalize">${D.months[m.getMonth()]} ${m.getFullYear()}</h2></div><button class="modal__close" data-act="close" aria-label="Fermer">×</button></div>
  <div class="modal__body">
    <div class="kpis" style="grid-template-columns:repeat(4,minmax(0,1fr))">${['instagram', 'tiktok', 'pinterest', 'newsletter'].map((p) => `<div class="kpi">${plat(p)}<span class="kpi__v">${per(p).filter((c) => c.status === 'published').length}<span class="small muted" style="font-family:var(--sans)"> / ${per(p).length}</span></span><span class="kpi__l">publiés / planifiés</span></div>`).join('')}</div>
    <section class="panel"><h3>Campagnes du mois</h3>${camps.map((c) => `<div class="row between"><span class="small"><strong>${esc(c.name)}</strong> · ${D.fmt(c.start)} → ${D.fmt(c.end)}</span>${campPill(c.status)}</div>`).join('') || '<p class="small muted">Aucune campagne ce mois-ci.</p>'}</section>
    <section class="panel"><h3>Performances du mois</h3><div class="fields">${['Portée Instagram', 'Abonnés gagnés', 'Taux d’engagement', 'Vues TikTok', 'Sessions issues des réseaux', 'Commandes attribuées', 'Taux d’ouverture newsletter', 'Taux de clic newsletter', 'Dépense publicitaire'].map((k, i) => `<div class="field"><label for="rp-${i}">${k}</label><input class="input" id="rp-${i}" placeholder="—"></div>`).join('')}</div></section>
    <section class="panel"><h3>Recommandations pour le mois suivant</h3><textarea class="textarea" id="rp-reco" style="min-height:90px" placeholder="1. …&#10;2. …&#10;3. …"></textarea></section>
  </div>`);
}

/* =========================================================================
   16. BRAND GUIDELINES
   ========================================================================= */
function viewBrand() {
  const pal = [['Cream / Ivory', '#F4EEE2', 'Fonds, respirations'], ['Ivory', '#FBF8F1', 'Fond du site'], ['Olive Green', '#5C6B3C', 'Couleur principale, CTA'], ['Sand', '#E4D6BA', 'Accents, étiquettes'], ['Taupe', '#8A7B6A', 'Textes secondaires'], ['Charcoal', '#2A2925', 'Titres, fonds sombres']];
  return `${pageHead('Brand Guidelines', 'Charte de marque', 'Identité visuelle, ton de voix et règles de vérification avant publication. Style : minimaliste, premium, éditorial, lumineux, moderne, naturel.')}
    <section class="stack"><h2>Palette</h2><div class="grid g-auto-s">${pal.map(([n, h, u]) => `<button class="swatch" data-act="copy-hex" data-v="${h}" title="Copier ${h}"><span class="swatch__c" style="background:${h}"></span><span class="swatch__b"><strong>${n}</strong><span class="num muted">${h}</span><span class="tiny muted">${u}</span></span></button>`).join('')}</div></section>
    <div class="grid g2">
      <section class="panel"><span class="label">Titres · Fraunces</span><span class="specimen">Your week, <i style="color:var(--olive)">prepared.</i></span><span class="label">Texte · Inter</span><p>Des repas préparés à Lyon, à la carte, en formule ou en box. Sans abonnement obligatoire.</p><span class="tiny muted">Surtitres en capitales espacées, 11–12 px, couleur olive.</span></section>
      <section class="panel"><span class="label">Logo</span><div class="grid g3">${[['var(--ivory)', 'var(--charcoal)', 'var(--olive)'], ['var(--olive)', 'var(--ivory)', 'var(--sand)'], ['var(--charcoal)', 'var(--ivory)', 'var(--sand)']].map(([bg, fg, ac]) => `<div style="background:${bg};border:1px solid var(--line);border-radius:10px;display:grid;place-items:center;aspect-ratio:3/2"><span class="logo" style="color:${fg}">PREP<i style="color:${ac}">CLUB</i></span></div>`).join('')}</div><span class="tiny muted">« CLUB » toujours en italique, dans la couleur d’accent du fond.</span></section>
    </div>
    <div class="grid g3">
      <section class="panel"><h3>Ton de voix</h3><div class="row">${MK.tone.words.map((w) => `<span class="tag">${w}</span>`).join('')}</div><ul class="clean small">${MK.tone.dos.map((x) => `<li>${x}</li>`).join('')}</ul></section>
      <section class="panel"><h3>À éviter</h3><ul class="clean small">${MK.tone.donts.map((x) => `<li>${x}</li>`).join('')}</ul></section>
      <section class="panel panel--cream"><h3>Avant chaque publication</h3><ul class="clean small">${MK.tone.checks.map((x) => `<li>${x}</li>`).join('')}</ul></section>
    </div>
    <section class="stack"><h2>Formats et dimensions</h2><div class="table-wrap"><table><thead><tr><th>Format</th><th>Ratio</th><th>Dimensions</th></tr></thead><tbody>${Object.values(MK.formats).map((f) => `<tr><td>${f.label}</td><td class="num">${f.ratio.replace(/ /g, '')}</td><td class="num">${f.size}</td></tr>`).join('')}</tbody></table></div>
    <p class="small muted">Dimensions recommandées à vérifier au moment de la création, les plateformes les faisant évoluer.</p></section>`;
}

/* =========================================================================
   Routeur & rendu
   ========================================================================= */
function routeId() { const h = location.hash.replace('#', ''); return ROUTES.some((r) => r.id === h) ? h : 'dashboard'; }
function renderNav() {
  const cur = routeId();
  const approval = CAL.filter((c) => c.status === 'approval' && c.date >= NOW).length;
  const groups = [...new Set(ROUTES.map((r) => r.group))];
  let n = 0;
  $('#sideNav').innerHTML = groups.map((g) => `<div class="side__group"><span class="side__label">${g}</span>${ROUTES.filter((r) => r.group === g).map((r) => { n++; return `<a class="nav ${r.id === cur ? 'active' : ''}" href="#${r.id}" ${r.id === cur ? 'aria-current="page"' : ''}><span class="n">${String(n).padStart(2, '0')}</span>${r.label}${r.id === 'social' && approval ? `<span class="count" title="En attente de validation">${approval}</span>` : ''}</a>`; }).join('')}</div>`).join('');
}
function render(keepScroll) {
  const r = ROUTES.find((x) => x.id === routeId());
  const y = window.scrollY;
  $('#page').innerHTML = r.render();
  $('#crumb').textContent = r.label;
  document.title = `${r.label} · PREP CLUB Marketing Studio`;
  renderNav();
  if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
}
function refresh() { render(true); if (ui.modal && ui.modal.type === 'content') openContent(ui.modal.id); }

/* ---------- Actions ---------- */
const ACT = {
  open: (el) => openContent(el.dataset.id),
  close: () => closeModal(),
  tab: (el) => { if (el.dataset.tab === 'vis') ui.vis.tab = el.dataset.v; else ui[el.dataset.tab] = el.dataset.v; render(true); },
  'tab-preset': (el) => { ui[el.dataset.tab] = el.dataset.v; },
  'lib-preset': (el) => { ui.lib.status = el.dataset.status; ui.lib.period = 'year'; },
  copy: (el) => {
    const it = content(el.dataset.id);
    const txt = el.dataset.what === 'caption' ? `${it.caption}\n\n${it.cta || ''}`.trim() : el.dataset.what === 'tags' ? (it.tags || []).join(' ') : fullText(it);
    copyText(txt).then((ok) => toast(ok ? 'Copié dans le presse-papiers' : 'Copie impossible : sélectionnez le texte manuellement'));
  },
  'dl-visual': async (el) => { const it = content(el.dataset.id); toast('Préparation du visuel…'); const ok = await exportVisual(specFor(it), `prepclub-${it.date}-${it.slot}`); toast(ok ? 'Visuel téléchargé' : 'Export impossible ici : faites une capture de l’aperçu'); },
  dup: (el) => { const id = duplicateContent(el.dataset.id); toast('Contenu dupliqué en brouillon'); render(true); openContent(id); },
  'set-status': (el) => { updateContent(el.dataset.id, { status: el.dataset.s }); toast(`Statut : ${MK.statuses[el.dataset.s].label}`); if (el.dataset.s === 'archived') { closeModal(); render(true); } else refresh(); },
  publish: (el) => { updateContent(el.dataset.id, { status: 'published' }); toast('Marqué comme publié'); render(true); },
  approve: (el) => { updateContent(el.dataset.id, { status: 'ready' }); toast('Contenu validé : prêt à publier'); render(true); },
  'save-content': (el) => { updateContent(el.dataset.id, readEditor()); toast('Modifications enregistrées'); refresh(); },
  'new-content': () => {
    const id = `new-${Date.now().toString(36)}`;
    store.data.custom.push({ id, slot: 'custom', date: ui.cal.view === 'day' ? ui.cal.cursor : NOW, time: '12:30', platform: 'instagram', format: 'portrait', pillar: 'product', goal: 'Conversion', title: 'Nouveau contenu', tpl: 'brand', headline: 'Votre semaine, préparée.', kicker: 'PREP CLUB', sub: '', caption: '', cta: '', link: '#/', tags: ['#PrepClub', '#MealPrepLyon'], alt: '', instructions: '', status: 'draft', campaign: null });
    store.save(); rebuild(); render(true); openContent(id);
  },
  'cal-view': (el) => { ui.cal.view = el.dataset.v; render(true); },
  'cal-goto': (el) => { ui.cal.cursor = clampDate(el.dataset.date); ui.cal.view = el.dataset.v; render(true); },
  'cal-today': () => { ui.cal.cursor = NOW; render(true); },
  'cal-prev': () => shiftCal(-1),
  'cal-next': () => shiftCal(1),
  'cal-filter': (el) => {
    const k = el.dataset.f;
    if (k === 'all') ui.cal.plats.clear();
    else if (MK.platforms[k]) { if (ui.cal.plats.has(k)) ui.cal.plats.delete(k); else ui.cal.plats.add(k); }
    else ui.cal.only = ui.cal.only === k ? null : k;
    render(true);
  },
  'lib-period': (el) => { ui.lib.period = el.dataset.v; ui.lib.limit = 36; render(true); },
  'lib-more': () => { ui.lib.limit += 36; render(true); },
  'vis-cat': (el) => { ui.vis.cat = el.dataset.v; render(true); },
  'edit-tpl': (el) => openTemplate(el.dataset.id),
  'tpl-fmt': (el) => { $$('#tplFmt button').forEach((b) => b.setAttribute('aria-pressed', b === el)); ui.modal.fmt = el.dataset.v; tplPreview(); },
  'tpl-dl': async () => { const d = ui.modal.draft; toast('Préparation du visuel…'); const ok = await exportVisual({ ...d, format: ui.modal.fmt || 'portrait' }, `prepclub-template-${d.id}`); toast(ok ? 'Visuel téléchargé' : 'Export impossible ici : faites une capture de l’aperçu'); },
  'tpl-save': () => { const d = ui.modal.draft; store.data.templates[d.id] = { kicker: d.kicker, headline: d.headline, sub: d.sub, layout: d.layout, theme: d.theme, img: d.img || null }; store.save(); closeModal(); render(true); toast('Template mis à jour sur tous les contenus liés'); },
  'tpl-reset': () => { const id = ui.modal.id; delete store.data.templates[id]; store.save(); openTemplate(id); render(true); toast('Template réinitialisé'); },
  lang: (el) => { store.data.lang = el.dataset.v; store.save(); render(true); },
  'cap-goal': (el) => { ui.cap.goal = el.dataset.v; render(true); },
  'copy-cap': (el) => {
    const c = MK.captions.find((x) => x.id === el.dataset.id); const t = c[store.data.lang];
    const txt = el.dataset.what === 'tags' ? c.tags.join(' ') : el.dataset.what === 'caption' ? `${t.head}\n\n${t.body}` : `${t.head}\n\n${t.body}\n\n${t.cta}\n\n${c.tags.join(' ')}`;
    copyText(txt).then((ok) => toast(ok ? 'Copié' : 'Copie impossible'));
  },
  'copy-story': (el) => { const s = MK.stories.find((x) => x.id === el.dataset.id); copyText(`${s.name} — ${s.when}\n${s.frames.map((f, i) => `Story ${i + 1} : ${f.text} (${f.sticker})`).join('\n')}\nLien : ${s.link}`).then((ok) => toast(ok ? 'Séquence copiée' : 'Copie impossible')); },
  'copy-reel': (el) => { const r = MK.reels.find((x) => x.id === el.dataset.id); const txt = el.dataset.what === 'caption' ? `${r.caption}\n\n${r.tags.join(' ')}` : `${r.fr} (${r.duration})\n\nPLANS\n${r.shots.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nTEXTE À L’ÉCRAN\n${r.onscreen.join(' / ')}\n\nAMBIANCE\n${r.music}`; copyText(txt).then((ok) => toast(ok ? 'Copié' : 'Copie impossible')); },
  'dl-reel': async (el) => { const r = MK.reels.find((x) => x.id === el.dataset.id); toast('Préparation de la cover…'); const ok = await exportVisual({ layout: 'photo', theme: 'dark', kicker: `Reel · ${r.duration}`, headline: r.fr, sub: '', img: r.img, format: 'reel' }, `prepclub-cover-${r.id}`); toast(ok ? 'Cover téléchargée' : 'Export impossible ici'); },
  'copy-nl': () => { const s = MK.newsletter.sample; copyText(`Objet : ${s.subject}\nPréheader : ${s.preheader}\n\n${s.intro}\n\nWEEKLY MENU\n${s.menu.join('\n')}\n\nFEATURED RECIPE — ${s.recipe.name}\n${s.recipe.text}\n\nSEASONAL HIGHLIGHT\n${s.season}\n\nPRODUCER SPOTLIGHT — ${s.producer.name}\n${s.producer.text}\n\nWEEKLY PLANNING TIP\n${s.tip}\n\n[Plan Your Week]`).then((ok) => toast(ok ? 'Newsletter copiée' : 'Copie impossible')); },
  'copy-mail': (el) => { const e = MK.flows.find((f) => f.id === el.dataset.flow).emails[el.dataset.i]; copyText(`Objet : ${e.subject}\nPréheader : ${e.pre}\n\n${e.body}\n\n[${e.cta}] → ${e.link}`).then((ok) => toast(ok ? 'E-mail copié' : 'Copie impossible')); },
  'open-camp': (el) => openCampaign(el.dataset.id),
  'camp-status': (el) => { store.data.campaigns[el.dataset.id] = Object.assign({}, store.data.campaigns[el.dataset.id], { status: el.dataset.s }); store.save(); rebuild(); render(true); toast(`Campagne : ${CAMP_ST[el.dataset.s][0]}`); },
  'camp-save': (el) => {
    const id = el.dataset.id; const patch = {};
    $$('[data-c]', $('#modalPanel')).forEach((i) => { patch[i.dataset.c] = i.value; });
    if (patch.end < patch.start) { toast('La date de fin doit suivre la date de début'); return; }
    patch.results = {}; $$('[data-res]', $('#modalPanel')).forEach((i) => { if (i.value) patch.results[i.dataset.res] = i.value; });
    store.data.campaigns[id] = Object.assign({}, store.data.campaigns[id], patch); store.save(); rebuild(); closeModal(); render(true); toast('Campagne enregistrée');
  },
  'copy-kit': () => copyText(MK.influencerKit.map(([k, v]) => `${k.toUpperCase()}\n${v}`).join('\n\n')).then((ok) => toast(ok ? 'Kit copié' : 'Copie impossible')),
  'copy-msg': (el) => copyText(MK.influencerMessages[el.dataset.i].text).then((ok) => toast(ok ? 'Message copié' : 'Copie impossible')),
  'ad-status': (el) => { store.data.ads[el.dataset.id] = Object.assign({}, store.data.ads[el.dataset.id], { status: el.dataset.s }); store.save(); render(true); toast(AD_ST[el.dataset.s][0]); },
  'copy-seo': (el) => { const a = MK.articles.find((x) => x.id === el.dataset.id); copyText(`Title : ${a.title}\nMeta description : ${a.meta}\nSlug : /blog/${a.slug}`).then((ok) => toast(ok ? 'Copié' : 'Copie impossible')); },
  report: () => openReport(),
  'copy-hex': (el) => copyText(el.dataset.v).then((ok) => toast(ok ? `${el.dataset.v} copié` : 'Copie impossible')),
};
function shiftCal(dir) {
  const f = ui.cal;
  if (f.view === 'month') { const d = D.parse(f.cursor); d.setDate(1); d.setMonth(d.getMonth() + dir); f.cursor = clampDate(D.iso(d)); }
  else if (f.view === 'day') f.cursor = clampDate(D.add(f.cursor, dir));
  else f.cursor = clampDate(D.add(f.cursor, dir * 7));
  render(true);
}
function tplPreview() {
  const d = ui.modal.draft;
  $('#tplPrev').innerHTML = visualHTML({ ...d, format: ui.modal.fmt || 'portrait' });
}

/* ---------- Écouteurs délégués ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (el && ACT[el.dataset.act]) {
    e.preventDefault();
    if (el.tagName === 'A' && el.getAttribute('href')) {
      ACT[el.dataset.act](el, e);
      const href = el.getAttribute('href');
      if (location.hash === href) render(); else location.hash = href;
      return;
    }
    ACT[el.dataset.act](el, e);
    return;
  }
  if (e.target.matches('.modal__bg')) closeModal();
  if (e.target.closest('.side a.nav')) $('#side').classList.remove('open');
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
document.addEventListener('change', (e) => {
  const el = e.target;
  const on = el.dataset.on;
  if (!on) return;
  if (on === 'task') { store.data.tasks[el.dataset.id] = el.checked; store.save(); render(true); }
  if (on === 'lib' && el.dataset.k !== 'q') { ui.lib[el.dataset.k] = el.value; ui.lib.limit = 36; render(true); }
  if (on === 'flow') { store.data.flows[el.dataset.id] = el.checked; store.save(); render(true); toast(el.checked ? 'Scénario activé' : 'Scénario désactivé'); }
  if (on === 'auto') { store.data.autos[el.dataset.id] = el.checked; store.save(); render(true); toast(el.checked ? 'Règle activée' : 'Règle désactivée'); }
  if (on === 'infl') { store.data.infl[el.dataset.id] = Object.assign({}, store.data.infl[el.dataset.id], { status: el.value }); store.save(); render(true); toast(`Statut : ${MK.influencerStatuses[el.value]}`); }
  if (on === 'ad-budget') { const v = Math.max(0, Number(el.value) || 0); store.data.ads[el.dataset.id] = Object.assign({}, store.data.ads[el.dataset.id], { budget: v, status: 'approval' }); store.save(); render(true); toast('Budget modifié : nouvelle validation requise'); }
  if (on === 'seo') { store.data.seo[el.dataset.id] = { status: el.value }; store.save(); toast(`Article : ${MK.statuses[el.value].label}`); }
  if (on === 'lseo') { store.data.seo[`l${el.dataset.i}`] = el.checked; store.save(); render(true); }
});
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.on === 'lib' && el.dataset.k === 'q') {
    ui.lib.q = el.value; ui.lib.limit = 36;
    clearTimeout(ACT._q);
    ACT._q = setTimeout(() => { const pos = el.selectionStart; render(true); const n = $('#lib-q'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 250);
  }
  if (el.dataset.t && ui.modal && ui.modal.type === 'tpl') { ui.modal.draft[el.dataset.t] = el.value; tplPreview(); }
});
document.addEventListener('submit', (e) => {
  if (e.target.id === 'inflForm') {
    e.preventDefault();
    const fd = new FormData(e.target);
    store.data.inflAdded.push({ id: `ia-${Date.now().toString(36)}`, name: fd.get('name'), handle: fd.get('handle') || '—', network: fd.get('network'), followers: Number(fd.get('followers')) || 0, engagement: Number(fd.get('engagement')) || 0, niche: fd.get('niche') || '—', status: 'todo', budget: fd.get('budget') || 'Non défini', history: `Ajouté le ${D.fmt(TODAY)}` });
    store.save(); render(true); toast('Contact ajouté');
  }
  if (e.target.id === 'ed') e.preventDefault();
});

/* Glisser-déposer dans le calendrier */
let dragId = null;
document.addEventListener('dragstart', (e) => { const el = e.target.closest('[data-drag]'); if (!el) return; dragId = el.dataset.drag; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (err) { /* ignore */ } });
document.addEventListener('dragend', (e) => { const el = e.target.closest('[data-drag]'); if (el) el.classList.remove('dragging'); $$('.day--over').forEach((d) => d.classList.remove('day--over')); });
document.addEventListener('dragover', (e) => { const t = e.target.closest('[data-drop]'); if (!t || !dragId) return; e.preventDefault(); $$('.day--over').forEach((d) => d !== t && d.classList.remove('day--over')); t.classList.add('day--over'); });
document.addEventListener('drop', (e) => {
  const t = e.target.closest('[data-drop]');
  if (!t || !dragId) return;
  e.preventDefault();
  const it = content(dragId);
  const date = t.dataset.drop;
  dragId = null;
  if (!it || it.date === date) { render(true); return; }
  updateContent(it.id, { date });
  render(true);
  toast(`Déplacé au ${D.fmt(date, { weekday: true, long: true })}`);
});

/* ---------- Initialisation ---------- */
function init() {
  rebuild();
  $('#burger').addEventListener('click', () => $('#side').classList.toggle('open'));
  $('#resetBtn').addEventListener('click', () => { if ($('#resetBtn').dataset.armed) { store.reset(); rebuild(); render(); toast('Studio réinitialisé'); $('#resetBtn').textContent = 'Réinitialiser le studio'; delete $('#resetBtn').dataset.armed; } else { $('#resetBtn').dataset.armed = '1'; $('#resetBtn').textContent = 'Cliquez à nouveau pour confirmer'; setTimeout(() => { $('#resetBtn').textContent = 'Réinitialiser le studio'; delete $('#resetBtn').dataset.armed; }, 4000); } });
  const camp = campaignAt(NOW);
  $('#phase').textContent = camp ? `${camp.name} · semaine ${Math.floor(D.diff(camp.start, NOW) / 7) + 1}` : 'Contenus permanents';
  window.addEventListener('hashchange', () => { closeModal(); render(); });
  render();
}
init();
