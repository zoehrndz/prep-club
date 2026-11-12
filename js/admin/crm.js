/* =========================================================
   PREP CLUB CRM — Contacts, fiches, pipeline et tableau de bord
   Données 100 % fictives (projet étudiant), stockées dans le navigateur.
   Les commandes passées sur le site (même navigateur) y arrivent
   automatiquement comme contacts « gagnés ».
   ========================================================= */
'use strict';

const STAGES = [
  ['nouveau', 'Nouveau'],
  ['contacte', 'Contacté'],
  ['proposition', 'Proposition envoyée'],
  ['gagne', 'Gagné'],
  ['perdu', 'Perdu'],
];
const STAGE_LABEL = Object.fromEntries(STAGES);
const STAGE_CLS = { nouveau: 'st--wait', contacte: 'st--prep', proposition: 'st--ship', gagne: 'st--done', perdu: 'st--off' };
const SOURCES = ['Instagram', 'TikTok', 'LinkedIn', 'Partenaire (salle de sport)', 'Partenaire (coworking)', 'Salon', 'Bouche-à-oreille', 'Site web'];
const EXCHANGE_TYPES = ['Appel', 'E-mail', 'Message', 'Rendez-vous', 'Dégustation', 'Note'];

/* ---------- Jeu de démonstration : 24 contacts fictifs ---------- */
function seedCrm() {
  const day = (n) => iso(addDays(new Date(), n));
  const rows = [
    ['Camille', 'Bertin', '', 'Particulier', 'Lyon 3e', 'Instagram', 'gagne', 58, 'Abonnée Club Plus'],
    ['Hugo', 'Marchand', '', 'Particulier', 'Lyon 7e', 'TikTok', 'proposition', 45, ''],
    ['Inès', 'Garnier', 'Atelier Garnier Design', 'Entreprise', 'Lyon 2e', 'LinkedIn', 'proposition', 620, 'Office Box 12 personnes'],
    ['Nathan', 'Roux', '', 'Particulier', 'Villeurbanne', 'Partenaire (salle de sport)', 'gagne', 72, ''],
    ['Léa', 'Fontaine', '', 'Particulier', 'Lyon 6e', 'Bouche-à-oreille', 'contacte', 40, ''],
    ['Malik', 'Benali', 'Studio Benali Archi', 'Entreprise', 'Lyon 9e', 'Salon', 'contacte', 480, 'Rencontré au salon des indépendants'],
    ['Sarah', 'Lambert', '', 'Particulier', 'Lyon 8e', 'Instagram', 'nouveau', 35, ''],
    ['Thomas', 'Girard', '', 'Particulier', 'Caluire-et-Cuire', 'Site web', 'gagne', 64, ''],
    ['Chloé', 'Morel', 'Cabinet Morel & Associés', 'Entreprise', 'Lyon 6e', 'LinkedIn', 'gagne', 940, 'Office Box 20 personnes'],
    ['Yanis', 'Faure', '', 'Particulier', 'Lyon 1er', 'TikTok', 'nouveau', 30, ''],
    ['Emma', 'Chevalier', '', 'Particulier', 'Lyon 4e', 'Partenaire (coworking)', 'proposition', 52, ''],
    ['Lucas', 'Perrin', '', 'Étudiant', 'Lyon 7e', 'Instagram', 'perdu', 28, 'Budget trop serré'],
    ['Manon', 'Dupuis', 'Agence Dupuis Com', 'Entreprise', 'Lyon 2e', 'Salon', 'nouveau', 560, ''],
    ['Rayan', 'Moulin', '', 'Particulier', 'Villeurbanne', 'Partenaire (salle de sport)', 'contacte', 60, ''],
    ['Zoé', 'Lefèvre', '', 'Particulier', 'Lyon 5e', 'Bouche-à-oreille', 'gagne', 48, ''],
    ['Antoine', 'Robin', '', 'Particulier', 'Écully', 'LinkedIn', 'perdu', 55, 'Hors zone de livraison'],
    ['Jade', 'Masson', 'Coworking Les Pentes (fictif)', 'Entreprise', 'Lyon 1er', 'Partenaire (coworking)', 'proposition', 380, 'Point de retrait'],
    ['Adam', 'Leroy', '', 'Particulier', 'Lyon 3e', 'Site web', 'nouveau', 42, ''],
    ['Louise', 'Gauthier', '', 'Particulier', 'Lyon 6e', 'Instagram', 'contacte', 46, ''],
    ['Gabriel', 'Noël', '', 'Étudiant', 'Lyon 7e', 'TikTok', 'gagne', 32, ''],
    ['Clara', 'Brunet', 'Clinique vétérinaire Brunet (fictive)', 'Entreprise', 'Lyon 8e', 'Salon', 'perdu', 300, 'Déjà équipée d’une cantine'],
    ['Noah', 'Roche', '', 'Particulier', 'Oullins', 'Partenaire (salle de sport)', 'nouveau', 50, ''],
    ['Alice', 'Meyer', '', 'Particulier', 'Lyon 9e', 'Bouche-à-oreille', 'proposition', 44, ''],
    ['Paul', 'Arnaud', 'Start-up Arnaud Tech (fictive)', 'Entreprise', 'Lyon 3e', 'LinkedIn', 'contacte', 720, 'Office Box 15 personnes'],
  ];
  const histFor = (stage, src, b2b, i) => {
    const h = [{ date: day(-30 + i), type: 'Note', text: `Premier contact via ${src}.` }];
    if (stage !== 'nouveau') h.push({ date: day(-24 + i), type: b2b ? 'Appel' : 'Message', text: b2b ? 'Appel découverte : besoins de l’équipe, nombre de repas, budget.' : 'Réponse à sa question sur les formules et la livraison.' });
    if (['proposition', 'gagne', 'perdu'].includes(stage)) h.push({ date: day(-16 + i), type: 'E-mail', text: b2b ? 'Envoi de la proposition Office Box (devis fictif).' : 'Envoi du code BIENVENUE10 et du lien vers les box découverte.' });
    if (stage === 'gagne') h.push({ date: day(-9 + i), type: 'Note', text: b2b ? 'Devis accepté, première livraison planifiée.' : 'Première commande passée.' });
    if (stage === 'perdu') h.push({ date: day(-9 + i), type: 'Note', text: 'Ne donne pas suite pour le moment.' });
    return h.slice(0, 4);
  };
  const nextFor = (stage, b2b) => ({
    nouveau: { date: day(1), text: 'Envoyer un message de bienvenue' },
    contacte: { date: day(2), text: b2b ? 'Proposer une dégustation au bureau' : 'Relancer avec la box découverte' },
    proposition: { date: day(3), text: 'Relancer sur la proposition envoyée' },
    gagne: { date: day(7), text: b2b ? 'Point de satisfaction après 2 semaines' : 'Demander un avis après la 2e commande' },
    perdu: { date: day(60), text: 'Recontacter au changement de saison' },
  }[stage]);
  return {
    contacts: rows.map(([first, last, company, kind, city, source, stage, value, note], i) => {
      const b2b = kind === 'Entreprise';
      const slug = `${slugify(first)}.${slugify(last)}`;
      return {
        id: `C${String(i + 1).padStart(3, '0')}`, first, last, company, kind, city, source, stage, value,
        email: `${slug}@example.com`, phone: `06 00 00 ${String(10 + i).padStart(2, '0')} ${String(30 + i * 2).padStart(2, '0')}`,
        createdAt: day(-32 + i), note, history: histFor(stage, source, b2b, i), next: nextFor(stage, b2b),
      };
    }),
    syncedOrders: [],
  };
}
if (!ADM.crm) ADM.crm = seedCrm();
const CRM = () => ADM.crm;
const fullName = (c) => `${c.first} ${c.last}`;

/* ---------- Bonus : les commandes du site arrivent dans le CRM ---------- */
function syncSiteOrders() {
  const site = typeof readSite === 'function' ? readSite() : null;
  if (!site || !Array.isArray(site.orders)) return 0;
  let added = 0;
  site.orders.slice().reverse().forEach((o) => {
    if (CRM().syncedOrders.includes(o.id)) return;
    const email = (o.email || '').toLowerCase();
    let c = CRM().contacts.find((x) => x.email.toLowerCase() === email);
    const label = `Commande ${o.id} passée sur le site : ${eur((o.totals && o.totals.total) || 0)} (${o.mode === 'home' ? 'livraison' : 'retrait'})`;
    if (!c) {
      const name = (site.user && site.user.email && site.user.email.toLowerCase() === email ? `${site.user.first || ''} ${site.user.last || ''}` : email.split('@')[0]).trim() || 'Client du site';
      const [first, ...rest] = name.split(/\s+/);
      c = { id: `C${String(CRM().contacts.length + 1).padStart(3, '0')}`, first: first.charAt(0).toUpperCase() + first.slice(1), last: rest.join(' '), company: '', kind: 'Particulier', city: 'Lyon', source: 'Site web', stage: 'gagne', value: Math.round((o.totals && o.totals.total) || 0), email: o.email || '', phone: '', createdAt: o.date.slice(0, 10), note: 'Créé automatiquement depuis une commande du site', history: [], next: { date: iso(addDays(new Date(), 7)), text: 'Demander un avis sur la commande' } };
      CRM().contacts.push(c);
    }
    c.stage = 'gagne';
    c.history.push({ date: o.date.slice(0, 10), type: 'Commande', text: label });
    CRM().syncedOrders.push(o.id);
    added++;
  });
  if (added) saveAdmin();
  return added;
}

/* ---------- Indicateurs ---------- */
function crmStats() {
  const cs = CRM().contacts;
  const by = Object.fromEntries(STAGES.map(([k]) => [k, cs.filter((c) => c.stage === k)]));
  const closed = by.gagne.length + by.perdu.length;
  const from = iso(addDays(new Date(), -29));
  const sales = DEMO.orders.filter((o) => o.day >= from && o.day <= iso(new Date()) && orderStatus(o).status !== -1);
  return {
    by, total: cs.length,
    revenue: round2(sales.reduce((a, o) => a + o.total, 0)),
    orders: sales.length,
    clients: by.gagne.length,
    conversion: cs.length ? by.gagne.length / cs.length : 0,
    winRate: closed ? by.gagne.length / closed : 0,
    pipeValue: [...by.contacte, ...by.proposition].reduce((a, c) => a + c.value, 0),
  };
}

/* ---------- Vues ---------- */
AVIEWS.crm = {
  title: (p) => {
    if (!p) return 'Prospects & contacts';
    if (p === 'pipeline') return 'Suivi des prospects';
    if (p === 'nouveau') return 'Nouveau contact';
    const c = CRM().contacts.find((x) => x.id === p);
    return c ? fullName(c) : 'Contact introuvable';
  },
  render(p) {
    syncSiteOrders();
    if (p === 'nouveau') return contactForm();
    if (p && p !== 'pipeline') return contactSheet(CRM().contacts.find((x) => x.id === p));
    const s = crmStats();
    const view = p === 'pipeline' ? 'pipeline' : 'list';
    return `<p class="intro">Tous vos prospects et clients, d’où ils viennent, ce qui a été échangé avec eux et la prochaine action à mener. <strong>Données fictives</strong> (projet étudiant). Les commandes passées sur le site depuis ce navigateur arrivent ici automatiquement.</p>
    <section class="kpis kpis--4 crm-kpis" aria-label="Indicateurs des prospects">
      ${kpi({ label: 'Chiffre d’affaires', value: eur(s.revenue), raw: s.revenue, fmt: 'eur', ic: 'euro', sub: `30 derniers jours · ${s.orders} commandes` })}
      ${kpi({ label: 'Clients', value: s.clients, raw: s.clients, ic: 'users', sub: `contacts gagnés sur ${s.total}` })}
      ${kpi({ label: 'Taux de conversion', value: pct(s.conversion, 1), ic: 'repeat', tone: 'saffron', sub: `gagnés ÷ tous les contacts · ${pct(s.winRate)} des affaires conclues` })}
      ${kpi({ label: 'Pipeline en cours', value: eur0(s.pipeValue), ic: 'board', sub: `${s.by.contacte.length + s.by.proposition.length} affaires contactées ou en proposition` })}
    </section>
    <div class="crm-funnel" aria-label="Contacts par étape">${STAGES.map(([k, l]) => `<a href="#/crm/pipeline" class="crm-funnel__step crm-funnel__step--${k}"><strong>${s.by[k].length}</strong><span>${l}</span></a>`).join('')}</div>
    <div class="toolbar">
      ${segmented('cview', [['list', 'Liste des contacts', 'list'], ['pipeline', 'Pipeline', 'board']], view)}
      <div class="toolbar__end"><a href="#/crm/nouveau" class="btn btn--primary btn--sm">+ Nouveau contact</a><button type="button" class="btn btn--ghost btn--sm" id="crmExport">Exporter (CSV)</button></div>
    </div>
    ${view === 'list' ? `<div class="toolbar">
      <input class="input" id="crmSearch" placeholder="Rechercher un nom, une entreprise, un e-mail…" aria-label="Rechercher un contact" style="flex:1;min-width:220px">
      <select class="input" id="crmStage" aria-label="Filtrer par étape"><option value="">Toutes les étapes</option>${STAGES.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>
      <select class="input" id="crmSource" aria-label="Filtrer par source"><option value="">Toutes les sources</option>${SOURCES.map((x) => `<option>${x}</option>`).join('')}</select>
    </div>
    <div class="panel table-wrap"><table class="data adm-table crm-table"><thead><tr><th>Contact</th><th>Source</th><th>Étape</th><th class="num">Valeur / mois</th><th>Prochaine action</th></tr></thead><tbody id="crmRows"></tbody></table><p class="small muted" id="crmCount" style="margin:12px 0 0"></p></div>`
    : `<div class="kanban crm-kanban">${STAGES.map(([k, l]) => `<section class="kcol" data-drop="${k}" aria-label="${l}"><div class="kcol__head"><strong>${l}</strong><span class="pill__n">${s.by[k].length}</span></div>
        <div class="kcol__list">${s.by[k].map((c) => pipeCard(c)).join('') || '<p class="small muted" style="padding:8px">Aucun contact</p>'}</div></section>`).join('')}</div>
      <p class="small muted">Faites glisser une carte vers une autre colonne, ou utilisez les flèches ← → pour faire avancer un contact.</p>`}`;
  },
  mount(p) {
    if (p === 'nouveau') return mountContactForm();
    if (p && p !== 'pipeline') return mountContactSheet(CRM().contacts.find((x) => x.id === p));
    $$('[data-cview]').forEach((b) => b.addEventListener('click', () => { location.hash = b.dataset.cview === 'pipeline' ? '#/crm/pipeline' : '#/crm'; }));
    $('#crmExport').onclick = () => downloadCsv('prepclub-crm-contacts-fictifs.csv', [['ID', 'Prénom', 'Nom', 'Entreprise', 'Type', 'Ville', 'E-mail', 'Téléphone', 'Source', 'Étape', 'Valeur mensuelle (€)', 'Prochaine action', 'Date'], ...CRM().contacts.map((c) => [c.id, c.first, c.last, c.company, c.kind, c.city, c.email, c.phone, c.source, STAGE_LABEL[c.stage], c.value, c.next ? c.next.text : '', c.next ? c.next.date : ''])]);
    if (p === 'pipeline') return mountPipeline();
    const draw = () => {
      const q = fold($('#crmSearch').value.trim());
      const st = $('#crmStage').value;
      const src = $('#crmSource').value;
      const list = CRM().contacts.filter((c) => (!st || c.stage === st) && (!src || c.source === src) && (!q || fold(`${fullName(c)} ${c.company} ${c.email} ${c.city}`).includes(q)));
      $('#crmRows').innerHTML = list.map((c) => `<tr class="crm-row" data-go="${c.id}" tabindex="0">
        <td data-l="Contact"><a href="#/crm/${c.id}" class="person"><span class="avatar avatar--sm ${c.kind === 'Entreprise' ? 'avatar--blue' : 'avatar--olive'}">${initials(fullName(c))}</span><span><strong>${esc(fullName(c))}</strong><span class="small muted">${esc(c.company || c.kind)} · ${esc(c.city)}</span></span></a></td>
        <td data-l="Source">${esc(c.source)}</td>
        <td data-l="Étape"><span class="st ${STAGE_CLS[c.stage]}">${STAGE_LABEL[c.stage]}</span></td>
        <td data-l="Valeur" class="num">${eur0(c.value)}</td>
        <td data-l="Prochaine action">${c.next ? `<span class="small">${esc(c.next.text)}</span><br><span class="small muted">${fmtDate(c.next.date, { day: 'numeric', month: 'short' })}</span>` : '<span class="muted small">—</span>'}</td>
      </tr>`).join('') || '<tr><td colspan="5" class="muted">Aucun contact ne correspond.</td></tr>';
      $('#crmCount').textContent = `${list.length} contact${list.length > 1 ? 's' : ''} sur ${CRM().contacts.length}`;
    };
    ['#crmSearch', '#crmStage', '#crmSource'].forEach((s) => $(s).addEventListener('input', draw));
    $('#crmRows').addEventListener('click', (e) => { const r = e.target.closest('[data-go]'); if (r && !e.target.closest('a')) location.hash = `#/crm/${r.dataset.go}`; });
    $('#crmRows').addEventListener('keydown', (e) => { const r = e.target.closest('[data-go]'); if (r && e.key === 'Enter') location.hash = `#/crm/${r.dataset.go}`; });
    draw();
  },
};

function pipeCard(c) {
  const i = STAGES.findIndex(([k]) => k === c.stage);
  return `<article class="kcard crm-card" draggable="true" data-card="${c.id}">
    <a href="#/crm/${c.id}" class="kcard__top"><strong>${esc(fullName(c))}</strong><span class="small muted">${eur0(c.value)}/mois</span></a>
    <div class="kcard__meta small muted">${esc(c.company || c.kind)} · ${esc(c.source)}</div>
    ${c.next ? `<div class="small">→ ${esc(c.next.text)}</div>` : ''}
    <div class="crm-card__move">
      <button type="button" class="iconbtn iconbtn--sm" data-move="${c.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="Reculer ${esc(fullName(c))} d’une étape">←</button>
      <button type="button" class="iconbtn iconbtn--sm" data-move="${c.id}" data-dir="1" ${i === STAGES.length - 1 ? 'disabled' : ''} aria-label="Faire avancer ${esc(fullName(c))} d’une étape">→</button>
    </div>
  </article>`;
}
function moveContact(c, stage) {
  if (!c || c.stage === stage) return;
  const from = STAGE_LABEL[c.stage];
  c.stage = stage;
  c.history.push({ date: iso(new Date()), type: 'Note', text: `Étape modifiée : ${from} → ${STAGE_LABEL[stage]}` });
  saveAdmin(`${fullName(c)} : ${STAGE_LABEL[stage]}`);
}
function mountPipeline() {
  const find = (id) => CRM().contacts.find((x) => x.id === id);
  $$('[data-move]').forEach((b) => b.addEventListener('click', () => {
    const c = find(b.dataset.move);
    const i = STAGES.findIndex(([k]) => k === c.stage) + Number(b.dataset.dir);
    if (i < 0 || i >= STAGES.length) return;
    moveContact(c, STAGES[i][0]);
    rerender();
  }));
  $$('[data-card]').forEach((card) => card.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', card.dataset.card); card.classList.add('dragging'); }));
  $$('[data-drop]').forEach((col) => {
    col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drop-on'); });
    col.addEventListener('dragleave', () => col.classList.remove('drop-on'));
    col.addEventListener('drop', (e) => { e.preventDefault(); col.classList.remove('drop-on'); moveContact(find(e.dataTransfer.getData('text/plain')), col.dataset.drop); rerender(); });
  });
}

function contactSheet(c) {
  if (!c) return emptyState('Contact introuvable', '', '<a class="btn btn--dark btn--sm" href="#/crm">Retour aux contacts</a>');
  const i = STAGES.findIndex(([k]) => k === c.stage);
  return `<div class="form-layout">
    <div class="form-main">
      <section class="panel crm-head">
        <span class="avatar avatar--lg ${c.kind === 'Entreprise' ? 'avatar--blue' : 'avatar--olive'}">${initials(fullName(c))}</span>
        <div><h2 class="serif" style="margin:0">${esc(fullName(c))}</h2><p class="muted" style="margin:2px 0 0">${esc(c.company || c.kind)} · ${esc(c.city)} · contact créé le ${fmtDate(c.createdAt)}</p></div>
        <span class="st ${STAGE_CLS[c.stage]}" style="margin-left:auto">${STAGE_LABEL[c.stage]}</span>
      </section>
      <section class="panel"><h3>Étape du pipeline</h3>
        <ol class="steps crm-steps">${STAGES.slice(0, 4).map(([k, l], n) => `<li class="${c.stage === 'perdu' ? '' : n < i ? 'done' : n === i ? 'now done' : ''}">${l}</li>`).join('')}</ol>
        <div class="row" style="margin-top:16px;gap:8px">${STAGES.map(([k, l]) => `<button type="button" class="btn ${k === c.stage ? 'btn--dark' : 'btn--ghost'} btn--xs" data-stage="${k}" ${k === c.stage ? 'aria-pressed="true"' : ''}>${l}</button>`).join('')}</div>
      </section>
      <section class="panel"><h3>Historique des échanges</h3>
        <ol class="crm-timeline">${c.history.slice().reverse().map((h) => `<li><span class="crm-timeline__type">${esc(h.type)}</span><div><p>${esc(h.text)}</p><span class="small muted">${fmtDate(h.date)}</span></div></li>`).join('')}</ol>
        <form class="crm-add" id="histForm">
          <select class="input" name="type" aria-label="Type d’échange">${EXCHANGE_TYPES.map((t) => `<option>${t}</option>`).join('')}</select>
          <input class="input" name="text" required placeholder="Ex. : appel de relance, intéressé par la Box Déjeuner" aria-label="Résumé de l’échange">
          <button class="btn btn--dark btn--sm">Ajouter</button>
        </form>
      </section>
    </div>
    <aside class="form-side">
      <section class="panel"><h3>Coordonnées <span class="muted small">(fictives)</span></h3>
        <dl class="crm-dl"><dt>E-mail</dt><dd>${esc(c.email || '—')}</dd><dt>Téléphone</dt><dd>${esc(c.phone || '—')}</dd><dt>Ville</dt><dd>${esc(c.city)}</dd><dt>Type</dt><dd>${esc(c.kind)}</dd><dt>Source</dt><dd><strong>${esc(c.source)}</strong></dd><dt>Valeur estimée</dt><dd>${eur0(c.value)} / mois</dd>${c.note ? `<dt>Note</dt><dd>${esc(c.note)}</dd>` : ''}</dl>
      </section>
      <form class="panel" id="nextForm"><h3>Prochaine action</h3>
        <div class="field"><label for="nextText">Action</label><input class="input" id="nextText" name="text" value="${esc(c.next ? c.next.text : '')}" placeholder="Ex. : relancer par téléphone"></div>
        <div class="field"><label for="nextDate">Date</label><input class="input" type="date" id="nextDate" name="date" value="${c.next ? c.next.date : ''}"></div>
        <div class="row" style="gap:8px"><button class="btn btn--primary btn--sm">Enregistrer</button>${c.next ? '<button type="button" class="btn btn--ghost btn--sm" id="nextDone">Marquer comme faite</button>' : ''}</div>
      </form>
      <section class="panel"><a href="#/crm" class="btn btn--ghost btn--block btn--sm">← Tous les contacts</a><a href="#/crm/pipeline" class="btn btn--ghost btn--block btn--sm" style="margin-top:8px">Voir le pipeline</a></section>
    </aside>
  </div>`;
}
function mountContactSheet(c) {
  if (!c) return;
  $$('[data-stage]').forEach((b) => b.addEventListener('click', () => { moveContact(c, b.dataset.stage); rerender(); }));
  $('#histForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    c.history.push({ date: iso(new Date()), type: f.type.value, text: f.text.value.trim() });
    saveAdmin('Échange ajouté à l’historique');
    rerender();
  });
  $('#nextForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const text = f.text.value.trim();
    c.next = text ? { text, date: f.date.value || iso(addDays(new Date(), 1)) } : null;
    saveAdmin(text ? 'Prochaine action enregistrée' : 'Prochaine action retirée');
    rerender();
  });
  const done = $('#nextDone');
  if (done) done.onclick = () => {
    c.history.push({ date: iso(new Date()), type: 'Note', text: `Action réalisée : ${c.next.text}` });
    c.next = null;
    saveAdmin('Action réalisée, ajoutée à l’historique');
    rerender();
  };
}

function contactForm() {
  return `<form class="panel" id="newContact" style="max-width:760px">
    <h3>Nouveau contact</h3>
    <p class="small muted" style="margin-top:0">Projet étudiant : n’enregistrez que des données fictives.</p>
    <div class="cols2">
      <div class="field"><label for="ncFirst">Prénom</label><input class="input" id="ncFirst" name="first" required></div>
      <div class="field"><label for="ncLast">Nom</label><input class="input" id="ncLast" name="last" required></div>
      <div class="field"><label for="ncCompany">Entreprise (facultatif)</label><input class="input" id="ncCompany" name="company"></div>
      <div class="field"><label for="ncKind">Type</label><select class="input" id="ncKind" name="kind"><option>Particulier</option><option>Entreprise</option><option>Étudiant</option></select></div>
      <div class="field"><label for="ncEmail">E-mail (fictif)</label><input class="input" type="email" id="ncEmail" name="email" placeholder="prenom.nom@example.com"></div>
      <div class="field"><label for="ncPhone">Téléphone (fictif)</label><input class="input" id="ncPhone" name="phone" placeholder="06 00 00 00 00"></div>
      <div class="field"><label for="ncCity">Ville</label><input class="input" id="ncCity" name="city" value="Lyon"></div>
      <div class="field"><label for="ncSource">Source</label><select class="input" id="ncSource" name="source">${SOURCES.map((x) => `<option>${x}</option>`).join('')}</select></div>
      <div class="field"><label for="ncValue">Valeur estimée (€ / mois)</label><input class="input" type="number" min="0" id="ncValue" name="value" value="40"></div>
      <div class="field"><label for="ncNext">Prochaine action</label><input class="input" id="ncNext" name="next" value="Envoyer un message de bienvenue"></div>
    </div>
    <div class="row" style="gap:8px"><button class="btn btn--primary btn--sm">Créer le contact</button><a href="#/crm" class="btn btn--ghost btn--sm">Annuler</a></div>
  </form>`;
}
function mountContactForm() {
  $('#newContact').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const n = CRM().contacts.length + 1;
    const c = {
      id: `C${String(n).padStart(3, '0')}${uid().slice(0, 2)}`, first: f.first.value.trim(), last: f.last.value.trim(), company: f.company.value.trim(), kind: f.kind.value, city: f.city.value.trim(),
      source: f.source.value, stage: 'nouveau', value: Math.max(0, Number(f.value.value) || 0), email: f.email.value.trim(), phone: f.phone.value.trim(), createdAt: iso(new Date()), note: '',
      history: [{ date: iso(new Date()), type: 'Note', text: `Contact créé (source : ${f.source.value}).` }],
      next: f.next.value.trim() ? { date: iso(addDays(new Date(), 1)), text: f.next.value.trim() } : null,
    };
    CRM().contacts.push(c);
    saveAdmin(`Contact créé : ${fullName(c)}`);
    location.hash = `#/crm/${c.id}`;
  });
}
