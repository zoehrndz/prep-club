/* =========================================================
   PREP CLUB Admin — Commandes, clients, abonnements
   ========================================================= */
'use strict';

const NEXT_LABEL = { 0: 'Lancer la préparation', 1: 'Marquer prête', 2: 'Marquer livrée' };
const ORDER_TABS = [['all', 'Toutes'], ['0', 'En attente'], ['1', 'En préparation'], ['2', 'À livrer'], ['3', 'Livrées'], ['-1', 'Annulées'], ['alert', 'À traiter']];
let orderQ = '';
let orderLimit = 50;
let orderView = 'list';
let orderMode = 'all';
const selected = new Set();

function orderMatches(o, tab) {
  const s = orderStatus(o);
  if (orderMode !== 'all' && o.mode !== orderMode) return false;
  if (tab === 'all') return true;
  if (tab === 'alert') return s.status >= 0 && s.status < 3 && (s.payment === 'failed' || !!s.needs);
  return String(s.status) === tab;
}
function advance(o, to) {
  const s = orderStatus(o);
  const target = to === undefined ? s.status + 1 : to;
  if (s.status < 0 || target === s.status) return false;
  if (s.payment === 'failed' && target > 0) { toast(`${o.id} : paiement non reçu, préparation impossible`); return false; }
  setOrderStatus(o, { status: target });
  return true;
}
const findOrder = (id) => DEMO.orders.find((o) => o.id === id);
const nextLabel = (o, s) => (o.mode === 'pickup' && s === 2 ? 'Marquer récupérée' : NEXT_LABEL[s]);
const portionsOf = (o) => o.lines.reduce((a, l) => a + l.qty, 0);

/* ================= COMMANDES ================= */
AVIEWS.commandes = {
  title: (a) => (a && a !== 'f' ? `Commande ${a}` : 'Commandes'),
  render(a, b) {
    if (a && a !== 'f') return orderDetail(findOrder(a));
    const tab = a === 'f' ? b : 'all';
    const counts = Object.fromEntries(ORDER_TABS.map(([k]) => [k, ['all', '3', '-1'].includes(k) ? null : DEMO.orders.filter((o) => orderMatches(o, k)).length]));
    return `<div class="page-head">
        <div class="tabs" style="margin:0" role="tablist">${ORDER_TABS.map(([k, l]) => `<a href="#/commandes${k === 'all' ? '' : `/f/${k}`}" class="pill ${k === tab ? 'active' : ''}">${l}${counts[k] ? ` <span class="pill__n">${counts[k]}</span>` : ''}</a>`).join('')}</div>
        <div class="page-head__actions">${segmented('oview', [['list', 'Liste', 'list'], ['board', 'Tableau', 'board']], orderView)}</div>
      </div>
      <div class="toolbar">
        <label class="search">${icon('search')}<input type="search" class="input" id="oSearch" placeholder="N° de commande, client, e-mail…" value="${esc(orderQ)}" aria-label="Rechercher une commande"></label>
        <select class="input" id="oMode" aria-label="Mode de remise"><option value="all">Livraison et retrait</option><option value="home" ${orderMode === 'home' ? 'selected' : ''}>Livraison à domicile</option><option value="pickup" ${orderMode === 'pickup' ? 'selected' : ''}>Retrait sur place</option></select>
        <div class="toolbar__end"><div class="bulk" id="bulk" hidden><span id="bulkN"></span><button class="btn btn--dark btn--xs" id="bulkGo">Étape suivante →</button></div>
        <button class="btn btn--ghost btn--sm" id="oCsv">${icon('download')}Exporter</button></div>
      </div>
      <div id="oBody"></div>`;
  },
  mount(a, b) {
    if (a && a !== 'f') return mountOrderDetail(findOrder(a));
    const tab = a === 'f' ? b : 'all';
    selected.clear();
    const filtered = () => {
      const q = fold(orderQ);
      return DEMO.orders.filter((o) => orderMatches(o, tab) && (!q || fold(`${o.id} ${o.customer} ${o.email}`).includes(q))).reverse();
    };
    const bulk = () => { $('#bulk').hidden = !selected.size; $('#bulkN').textContent = `${selected.size} sélectionnée${selected.size > 1 ? 's' : ''}`; };
    const drawList = () => {
      const list = filtered();
      const shown = list.slice(0, orderLimit);
      $('#oBody').innerHTML = `<div class="table-wrap"><table class="data adm-table">${list.length ? `<thead><tr><th class="cb-col"><input type="checkbox" id="oAll" aria-label="Tout sélectionner"></th><th>Commande</th><th>Client</th><th>Livraison / retrait</th><th class="num">Total</th><th>Statut</th><th class="actions-col"><span class="sr">Action</span></th></tr></thead>
        <tbody>${shown.map((o) => { const s = orderStatus(o); const open = s.status >= 0 && s.status < 3; return `<tr class="${s.needs && open ? 'row--warn' : ''}">
          <td class="cb-col">${open ? `<input type="checkbox" data-sel="${o.id}" ${selected.has(o.id) ? 'checked' : ''} aria-label="Sélectionner ${o.id}">` : ''}</td>
          <td><a href="#/commandes/${o.id}"><strong>${o.id}</strong></a><div class="small muted">${fmtDT(o.date)} · ${KIND_LABELS[o.kind]}</div></td>
          <td data-l="Client"><span><a class="person" href="#/clients/${o.customerId}"><span class="avatar avatar--sm ${avatarTone(o.customerId)}">${initials(o.customer)}</span><span><strong>${esc(o.customer)}</strong>${o.tier ? `<span class="small muted">Club ${esc(tierName(o.tier))}</span>` : ''}</span></a></span></td>
          <td data-l="Créneau"><span>${o.mode === 'home' ? 'Livraison' : 'Retrait'}<div class="small muted">${fmtDate(o.slot.day, { weekday: 'short', day: 'numeric', month: 'short' })} · ${esc(o.slot.time)}</div></span></td>
          <td class="num" data-l="Total"><strong>${eur(o.total)}</strong><div class="small muted">${portionsOf(o)} portions</div></td>
          <td data-l="Statut"><span>${statusBadge(o)}${s.needs && open ? `<div class="small warn-text">⚠ ${esc(s.needs)}</div>` : ''}${ADM.notes[o.id] ? '<div class="small muted">✎ Note interne</div>' : ''}</span></td>
          <td class="actions-col">${open && s.payment !== 'failed' ? `<button class="btn btn--ghost btn--xs" data-next="${o.id}">${nextLabel(o, s.status)}</button>` : ''}</td></tr>`; }).join('')}</tbody>` : `<tbody><tr><td>${emptyState('Aucune commande', tab === 'alert' ? 'Rien à traiter pour le moment.' : 'Aucune commande ne correspond.')}</td></tr></tbody>`}</table></div>
        ${list.length > orderLimit ? `<button class="btn btn--ghost btn--sm" id="oMoreBtn">Afficher plus (${list.length - orderLimit} restantes)</button>` : `<p class="small muted">${list.length} commande${list.length > 1 ? 's' : ''}</p>`}`;
      if ($('#oMoreBtn')) $('#oMoreBtn').onclick = () => { orderLimit += 100; drawList(); };
      if ($('#oAll')) $('#oAll').onchange = (e) => { $$('[data-sel]').forEach((c) => { c.checked = e.target.checked; selected[e.target.checked ? 'add' : 'delete'](c.dataset.sel); }); bulk(); };
      bulk();
    };
    const drawBoard = () => {
      const today = iso(addDays(new Date(), -1));
      const list = filtered().filter((o) => { const s = orderStatus(o).status; return s >= 0 && (s < 3 || o.slot.day >= today); });
      const cols = [[0, 'En attente', 'var(--s2)'], [1, 'En préparation', 'var(--saffron)'], [2, 'À livrer / à retirer', 'var(--s3)'], [3, 'Livrées (hier et aujourd’hui)', 'var(--s1)']];
      $('#oBody').innerHTML = `<div class="kanban">${cols.map(([st, label, color]) => {
        const items = list.filter((o) => orderStatus(o).status === st).sort((x, y) => `${x.slot.day}${x.slot.time}`.localeCompare(`${y.slot.day}${y.slot.time}`));
        return `<div class="kcol" data-col="${st}"><div class="kcol__head"><strong><i class="sw" style="background:${color}"></i>${label}</strong><span class="pill__n">${items.length}</span></div>
          <div class="kcol__list">${items.slice(0, 40).map((o) => { const s = orderStatus(o); return `<article class="kcard" draggable="true" data-card="${o.id}">
            ${s.payment === 'failed' ? '<div class="kcard__flag kcard__flag--alert">Paiement échoué</div>' : s.needs ? `<div class="kcard__flag">⚠ ${esc(s.needs)}</div>` : ''}
            <div class="kcard__top"><a href="#/commandes/${o.id}">${o.id}</a><strong>${eur(o.total)}</strong></div>
            <div class="kcard__meta"><span>${esc(o.customer)}</span><span>${o.mode === 'home' ? '🚚 Livraison' : '📍 Retrait'} · ${fmtDate(o.slot.day, { weekday: 'short', day: 'numeric' })} · ${esc(o.slot.time)}</span></div>
            <div class="kcard__foot"><span class="small muted">${portionsOf(o)} portions · ${KIND_LABELS[o.kind]}</span>${st < 3 && s.payment !== 'failed' ? `<button class="iconbtn iconbtn--sm" data-next="${o.id}" title="${nextLabel(o, st)}" aria-label="${nextLabel(o, st)}">${icon('M9 6l6 6-6 6')}</button>` : ''}</div>
          </article>`; }).join('')}${items.length > 40 ? `<div class="kcol__more">+ ${items.length - 40} autres</div>` : ''}${!items.length ? '<div class="kcol__more">Aucune commande</div>' : ''}</div></div>`;
      }).join('')}</div><p class="hint">Glissez une carte d’une colonne à l’autre pour changer son statut.</p>`;
      let dragged = null;
      $$('.kcard').forEach((c) => {
        c.addEventListener('dragstart', (e) => { dragged = c.dataset.card; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
        c.addEventListener('dragend', () => c.classList.remove('dragging'));
      });
      $$('.kcol').forEach((col) => {
        col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('over'); });
        col.addEventListener('dragleave', () => col.classList.remove('over'));
        col.addEventListener('drop', (e) => {
          e.preventDefault(); col.classList.remove('over');
          const o = findOrder(dragged);
          if (o && advance(o, Number(col.dataset.col))) { saveAdmin(`${o.id} : ${statusLabel(o).toLowerCase()}`); rerender(); }
        });
      });
    };
    const draw = () => (orderView === 'board' ? drawBoard() : drawList());
    $('#oBody').addEventListener('change', (e) => { const id = e.target.dataset.sel; if (id) { selected[e.target.checked ? 'add' : 'delete'](id); bulk(); } });
    $('#oBody').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-next]');
      if (!btn) return;
      e.preventDefault();
      const o = findOrder(btn.dataset.next);
      if (advance(o)) { saveAdmin(`${o.id} : ${statusLabel(o).toLowerCase()}`); rerender(); }
    });
    $('#bulkGo').onclick = () => {
      let n = 0;
      selected.forEach((id) => { if (advance(findOrder(id))) n++; });
      selected.clear();
      saveAdmin(`${n} commande${n > 1 ? 's' : ''} passée${n > 1 ? 's' : ''} à l’étape suivante`); rerender();
    };
    $$('[data-oview]').forEach((x) => x.addEventListener('click', () => { orderView = x.dataset.oview; rerender(); }));
    $('#oSearch').addEventListener('input', (e) => { orderQ = e.target.value; orderLimit = 50; draw(); });
    $('#oMode').addEventListener('change', (e) => { orderMode = e.target.value; rerender(); });
    $('#oCsv').onclick = () => downloadCsv(`commandes-${iso(new Date())}.csv`, [['Commande', 'Date', 'Client', 'E-mail', 'Type', 'Mode', 'Créneau', 'Portions', 'Sous-total', 'Remises', 'Livraison', 'Total', 'Statut', 'Paiement'], ...filtered().map((o) => { const s = orderStatus(o); return [o.id, fmtDT(o.date), o.customer, o.email, KIND_LABELS[o.kind], o.mode === 'home' ? 'Livraison' : 'Retrait', `${o.slot.day} ${o.slot.time}`, portionsOf(o), csvNum(o.sub), csvNum(o.discount), csvNum(o.delivery), csvNum(o.total), statusLabel(o), s.payment === 'failed' ? 'Échoué' : 'Payé']; })]);
    draw();
  },
};
const avatarTone = (id) => ['', 'avatar--olive', 'avatar--blue', 'avatar--tomato'][[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % 4];

function orderDetail(o) {
  if (!o) return emptyState('Commande introuvable', '', '<a class="btn btn--dark btn--sm" href="#/commandes">Retour aux commandes</a>');
  const s = orderStatus(o);
  const steps = o.mode === 'home' ? ['En attente', 'En préparation', 'En livraison', 'Livrée'] : ['En attente', 'En préparation', 'Prête', 'Récupérée'];
  const c = DEMO.customers.find((x) => x.id === o.customerId);
  const past = DEMO.orders.filter((x) => x.customerId === o.customerId && isSale(x)).length;
  return `<div class="print-only"><h2>Bon de commande ${o.id}</h2><p>${esc(o.customer)} · ${o.mode === 'home' ? 'Livraison' : 'Retrait'} le ${fmtDate(o.slot.day, { weekday: 'long', day: 'numeric', month: 'long' })}, ${esc(o.slot.time)} · ${esc(o.where)}</p></div>
  <div class="form-layout"><div class="form-main">
      ${s.payment === 'failed' && s.status >= 0 ? `<div class="notice notice--alert"><strong>Paiement échoué.</strong> La commande n’est pas préparée tant que le paiement n’est pas reçu. <button class="btn btn--dark btn--xs" id="oRetry">Relancer le client</button> <button class="btn btn--ghost btn--xs" id="oPaid">Marquer comme payée</button></div>` : ''}
      ${s.needs && s.status >= 0 && s.status < 3 ? `<div class="notice notice--warn"><strong>Intervention requise :</strong> ${esc(s.needs)} <button class="btn btn--dark btn--xs" id="oSolve">Marquer comme traité</button></div>` : ''}
      <section class="panel"><div class="panel__head"><div><h3>${KIND_LABELS[o.kind]} · ${portionsOf(o)} portions</h3><p class="small muted">Passée le ${fmtDT(o.date)}</p></div>${statusBadge(o)}</div>
        <ol class="steps">${steps.map((l, i) => `<li class="${s.status > i || s.status === 3 ? 'done' : ''} ${s.status === i ? 'now' : ''}">${l}</li>`).join('')}</ol>
        ${s.status === -1 ? '<p style="margin-top:14px"><span class="st st--off">Commande annulée</span></p>' : ''}
        <div class="row no-print" style="margin-top:18px">
          ${s.status >= 0 && s.status < 3 ? `<button class="btn btn--primary btn--sm" id="oNext" ${s.payment === 'failed' ? 'disabled' : ''}>${nextLabel(o, s.status)}</button>` : ''}
          ${s.status > 0 ? '<button class="btn btn--ghost btn--sm" id="oPrev">Revenir à l’étape précédente</button>' : ''}
          ${s.status >= 0 && s.status < 3 ? '<button class="btn btn--danger btn--sm" id="oCancel">Annuler la commande</button>' : ''}
          ${s.status === -1 ? '<button class="btn btn--ghost btn--sm" id="oRestore">Rétablir la commande</button>' : ''}
        </div>
        ${o.source === 'site' ? '<p class="hint">Commande passée sur le site depuis ce navigateur : le client voit le nouveau statut dans « Mon compte ».</p>' : ''}
      </section>
      <section class="panel"><h3>Contenu</h3>
        <table class="data"><thead><tr><th>Produit</th><th class="num">Qté</th><th class="num">Montant</th></tr></thead><tbody>
        ${o.lines.map((l) => { const p = AP(l.pid); const hit = c && p ? p.allergens.filter((x) => c.allergies.includes(x)) : []; return `<tr><td><span class="prod-cell">${thumb(p && p.img, 'thumb thumb--sm')}<span>${p ? `<a href="#/produits/${l.pid}"><strong>${esc(l.name)}</strong></a>` : `<strong>${esc(l.name)}</strong>`}${l.box ? `<span class="small muted">${esc(l.box)}</span>` : ''}${hit.length ? `<span class="small warn-text">⚠ Contient ${esc(hit.join(', '))} (allergie déclarée)</span>` : ''}</span></span></td><td class="num">${l.qty}</td><td class="num">${eur(l.amount)}</td></tr>`; }).join('')}
        </tbody></table>
        <div class="totals--adm">
          <div><span>Sous-total</span><span>${eur(o.sub)}</span></div>
          ${o.discount ? `<div><span>Remises${o.tier ? ` (Club ${esc(tierName(o.tier))})` : ''}</span><span>−${eur(o.discount)}</span></div>` : ''}
          <div><span>${o.mode === 'home' ? 'Livraison' : 'Retrait sur place'}</span><span>${o.delivery ? eur(o.delivery) : 'Offert'}</span></div>
          <div class="grand"><span>Total</span><span>${eur(o.total)}</span></div>
        </div>
      </section>
      <section class="panel note-box no-print"><h3>Note interne</h3><textarea class="input" id="oNote" rows="3" placeholder="Visible uniquement dans le back-office (ex. : client prévenu du retard, sonner deux fois…)">${esc(ADM.notes[o.id] || '')}</textarea><button class="btn btn--dark btn--xs" id="oNoteSave" style="margin-top:10px">Enregistrer la note</button></section>
    </div>
    <aside class="form-side">
      <section class="panel"><div class="person"><span class="avatar avatar--lg ${avatarTone(o.customerId)}">${initials(o.customer)}</span><span><a href="#/clients/${o.customerId}"><strong>${esc(o.customer)}</strong></a><span class="small muted">${past} commande${past > 1 ? 's' : ''}${o.tier ? ` · Club ${esc(tierName(o.tier))}` : ''}</span></span></div>
        <p class="small" style="margin:12px 0 0">${esc(o.email)}${o.phone ? `<br>${esc(o.phone)}` : ''}</p>
        <div class="contact-row no-print"><a class="btn btn--ghost btn--xs" href="mailto:${esc(o.email)}?subject=${encodeURIComponent(`Votre commande ${o.id}`)}">${icon('mail')}E-mail</a>${o.phone ? `<a class="btn btn--ghost btn--xs" href="tel:${esc(o.phone.replace(/\s/g, ''))}">${icon('phone')}Appeler</a>` : ''}</div>
        ${c && c.allergies.length ? `<div class="notice notice--warn" style="margin-bottom:0">Allergies déclarées : ${esc(c.allergies.join(', '))}</div>` : ''}
      </section>
      <section class="panel"><h3>${o.mode === 'home' ? 'Livraison à domicile' : 'Retrait sur place'}</h3>
        <p style="margin:0"><strong>${fmtDate(o.slot.day, { weekday: 'long', day: 'numeric', month: 'long' })}</strong><br>${esc(o.slot.time)}</p><p class="small muted" style="margin:6px 0 0">${esc(o.where)}</p>
      </section>
      <section class="panel"><h3>Paiement</h3><p class="small" style="margin:0">${s.payment === 'failed' ? '<span class="st st--alert">Échoué</span>' : s.status === -1 ? '<span class="st st--off">Remboursé</span>' : '<span class="st st--done">Payé</span>'} · carte bancaire</p></section>
      <div class="row no-print"><button class="btn btn--ghost btn--sm" onclick="window.print()">${icon('print')}Imprimer le bon</button><a href="#/commandes" class="btn btn--ghost btn--sm">← Commandes</a></div>
    </aside></div>`;
}

function mountOrderDetail(o) {
  if (!o) return;
  const s = orderStatus(o);
  const act = (patch, msg) => { setOrderStatus(o, patch); saveAdmin(`${o.id} : ${msg}`); rerender(); };
  const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
  on('#oNext', () => { if (advance(o)) { saveAdmin(`${o.id} : ${statusLabel(o).toLowerCase()}`); rerender(); } });
  on('#oPrev', () => act({ status: s.status - 1 }, 'retour à l’étape précédente'));
  on('#oCancel', () => confirmModal(`Annuler la commande ${o.id} ?`, `${esc(o.customer)} sera remboursé·e de ${eur(o.total)}. Prototype : aucun remboursement réel n’est effectué.`, 'Annuler la commande', () => act({ status: -1 }, 'commande annulée')));
  on('#oRestore', () => act({ status: 0 }, 'commande rétablie'));
  on('#oSolve', () => act({ needs: null }, 'intervention traitée'));
  on('#oPaid', () => act({ payment: 'paid' }, 'paiement reçu'));
  on('#oRetry', () => toast(`Prototype : un e-mail de relance serait envoyé à ${o.email}`));
  on('#oNoteSave', () => { const v = $('#oNote').value.trim(); if (v) ADM.notes[o.id] = v; else delete ADM.notes[o.id]; saveAdmin(`${o.id} : note interne ${v ? 'enregistrée' : 'supprimée'}`); });
}

/* ================= CLIENTS ================= */
let custQ = '';
let custSeg = 'all';
let custLimit = 50;
function customerStats() {
  const st = {};
  DEMO.orders.forEach((o) => {
    if (!isSale(o)) return;
    const x = st[o.customerId] || (st[o.customerId] = { n: 0, spent: 0, last: '', first: o.day });
    x.n++; x.spent += o.total; if (o.day > x.last) x.last = o.day; if (o.day < x.first) x.first = o.day;
  });
  return st;
}
function segment(x) {
  if (!x) return ['Sans commande', 'st--off'];
  if ((Date.now() - fromIso(x.last)) / 864e5 > 60) return ['Inactif', 'st--off'];
  if ((Date.now() - fromIso(x.first)) / 864e5 <= 30) return ['Nouveau', 'st--wait'];
  return x.n >= 6 ? ['Fidèle', 'st--done'] : ['Actif', 'st--ship'];
}

AVIEWS.clients = {
  title: (id) => (id ? ((DEMO.customers.find((c) => c.id === id) || {}).name || 'Fiche client') : 'Clients'),
  render(id) {
    if (id) return customerDetail(DEMO.customers.find((c) => c.id === id));
    const st = customerStats();
    const vals = Object.values(st);
    const segs = {};
    DEMO.customers.forEach((c) => { const s = segment(st[c.id])[0]; segs[s] = (segs[s] || 0) + 1; });
    const ltv = vals.length ? vals.reduce((a, x) => a + x.spent, 0) / vals.length : 0;
    return `<section class="kpis kpis--4">
        ${kpi({ label: 'Clients', value: num(DEMO.customers.length), raw: DEMO.customers.length, ic: 'users', tone: 'blue' })}
        ${kpi({ label: 'Clients fidèles', value: num(segs['Fidèle'] || 0), raw: segs['Fidèle'] || 0, ic: 'heart', tone: 'tomato', sub: '6 commandes ou plus, actifs' })}
        ${kpi({ label: 'Valeur moyenne d’un client', value: eur(ltv), raw: ltv, fmt: 'eur', ic: 'euro', sub: 'total dépensé depuis la première commande' })}
        ${kpi({ label: 'Inactifs depuis 60 jours', value: num(segs['Inactif'] || 0), raw: segs['Inactif'] || 0, ic: 'clock', tone: 'saffron', sub: 'à relancer (Marketing Studio)' })}
      </section>
      <div class="toolbar"><label class="search">${icon('search')}<input type="search" class="input" id="cSearch" placeholder="Nom, e-mail…" value="${esc(custQ)}" aria-label="Rechercher un client"></label>
      <select class="input" id="cSeg" aria-label="Segment">${[['all', 'Tous les clients'], ['Nouveau', 'Nouveaux (30 j)'], ['Fidèle', 'Fidèles'], ['Actif', 'Actifs'], ['Inactif', 'Inactifs (+60 j)'], ['member', 'Abonnés Club'], ['allergy', 'Avec allergies']].map(([k, l]) => `<option value="${k}" ${custSeg === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <div class="toolbar__end"><button class="btn btn--ghost btn--sm" id="cExport">${icon('download')}Exporter</button></div></div>
      <div class="table-wrap"><table class="data adm-table" id="cTable"></table></div><div id="cMore"></div>`;
  },
  mount(id) {
    if (id) return;
    const st = customerStats();
    const filtered = () => {
      const q = fold(custQ);
      return DEMO.customers.filter((c) => {
        if (q && !fold(`${c.name} ${c.email}`).includes(q)) return false;
        if (custSeg === 'member') return c.membership && c.membership.status === 'active';
        if (custSeg === 'allergy') return c.allergies.length;
        return custSeg === 'all' || segment(st[c.id])[0] === custSeg;
      }).sort((a, b) => ((st[b.id] || {}).spent || 0) - ((st[a.id] || {}).spent || 0));
    };
    const draw = () => {
      const list = filtered();
      $('#cTable').innerHTML = `<thead><tr><th>Client</th><th>Segment</th><th class="num">Commandes</th><th class="num">Total dépensé</th><th>Dernière commande</th><th>Club</th></tr></thead><tbody>${list.slice(0, custLimit).map((c) => {
        const x = st[c.id]; const [seg, cls] = segment(x);
        return `<tr><td><a class="person" href="#/clients/${c.id}"><span class="avatar avatar--sm ${avatarTone(c.id)}">${initials(c.name)}</span><span><strong>${esc(c.name)}${c.source === 'site' ? ' <span class="st st--wait">Site</span>' : ''}</strong><span class="small muted">${esc(c.email)}</span></span></a></td><td data-l="Segment"><span class="st ${cls}">${seg}</span></td><td class="num" data-l="Commandes">${x ? x.n : 0}</td><td class="num" data-l="Dépensé"><strong>${eur(x ? x.spent : 0)}</strong></td><td data-l="Dernière">${x ? fmtDate(x.last, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td><td data-l="Club"><span>${c.membership && c.membership.status === 'active' ? `<span class="st st--ship">${esc(tierName(c.membership.tier))}</span>` : '—'}</span></td></tr>`;
      }).join('')}</tbody>`;
      $('#cMore').innerHTML = list.length > custLimit ? `<button class="btn btn--ghost btn--sm" id="cMoreBtn">Afficher plus (${list.length - custLimit})</button>` : `<p class="small muted">${list.length} client${list.length > 1 ? 's' : ''}</p>`;
      if ($('#cMoreBtn')) $('#cMoreBtn').onclick = () => { custLimit += 100; draw(); };
    };
    $('#cSearch').addEventListener('input', (e) => { custQ = e.target.value; custLimit = 50; draw(); });
    $('#cSeg').addEventListener('change', (e) => { custSeg = e.target.value; custLimit = 50; draw(); });
    $('#cExport').onclick = () => downloadCsv('clients-prepclub.csv', [['Nom', 'E-mail', 'Téléphone', 'Inscription', 'Commandes', 'Total dépensé', 'Dernière commande', 'Segment', 'Club', 'Allergies'], ...filtered().map((c) => { const x = st[c.id] || {}; return [c.name, c.email, c.phone, c.joined, x.n || 0, csvNum(x.spent), x.last || '', segment(st[c.id])[0], c.membership && c.membership.status === 'active' ? tierName(c.membership.tier) : '', c.allergies.join(' / ')]; })]);
    draw();
  },
};

function customerDetail(c) {
  if (!c) return emptyState('Client introuvable', '', '<a class="btn btn--dark btn--sm" href="#/clients">Retour aux clients</a>');
  const orders = DEMO.orders.filter((o) => o.customerId === c.id).reverse();
  const x = customerStats()[c.id];
  const [seg, cls] = segment(x);
  const fav = {};
  orders.forEach((o) => o.lines.forEach((l) => { const r = fav[l.pid] || (fav[l.pid] = { label: (AP(l.pid) || l).name, img: (AP(l.pid) || {}).img || '', value: 0 }); r.value += l.qty; }));
  const favs = Object.values(fav).sort((a, b) => b.value - a.value).slice(0, 5);
  const reviews = DEMO.reviews.filter((r) => r.customerId === c.id);
  const monthly = Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 11 + i); const k = iso(d).slice(0, 7); return round2(orders.filter((o) => o.day.slice(0, 7) === k && isSale(o)).reduce((a, o) => a + o.total, 0)); });
  return `<div class="form-layout"><div class="form-main">
    <section class="kpis kpis--3">${kpi({ label: 'Commandes', value: num(x ? x.n : 0), raw: x ? x.n : 0, ic: 'bag' })}${kpi({ label: 'Total dépensé', value: eur(x ? x.spent : 0), raw: x ? x.spent : 0, fmt: 'eur', ic: 'euro', tone: 'saffron', spark: monthly })}${kpi({ label: 'Panier moyen', value: eur(x && x.n ? x.spent / x.n : 0), ic: 'tag', tone: 'blue' })}</section>
    <section class="panel"><div class="panel__head"><h3>Commandes</h3><span class="muted small">${orders.length}</span></div>${orders.length ? `<table class="data adm-table"><tbody>${orders.slice(0, 30).map((o) => `<tr><td><a href="#/commandes/${o.id}"><strong>${o.id}</strong></a><div class="small muted">${fmtDT(o.date)}</div></td><td data-l="Type">${KIND_LABELS[o.kind]}</td><td class="num" data-l="Total"><strong>${eur(o.total)}</strong></td><td data-l="Statut"><span>${statusBadge(o)}</span></td></tr>`).join('')}</tbody></table>` : '<p class="muted">Aucune commande.</p>'}</section>
    ${reviews.length ? `<section class="panel"><h3>Avis</h3><ul class="feed">${reviews.map((r) => `<li class="feed__item"><div>${stars(r.rating)} <strong>${esc(r.product)}</strong><div class="small">« ${esc(r.text)} »</div></div></li>`).join('')}</ul></section>` : ''}
  </div><aside class="form-side">
    <section class="panel" style="text-align:center"><span class="avatar avatar--lg ${avatarTone(c.id)}" style="margin:0 auto 10px">${initials(c.name)}</span><h3 style="margin:0">${esc(c.name)}</h3><span class="st ${cls}" style="margin-top:6px">${seg}</span>
      <p class="small" style="margin:12px 0 0">${esc(c.email)}${c.phone ? `<br>${esc(c.phone)}` : ''}${c.address ? `<br>${esc(c.address)}` : ''}</p>
      <p class="small muted">Client depuis le ${fmtDate(c.joined)}</p>
      <div class="contact-row" style="justify-content:center"><a class="btn btn--ghost btn--xs" href="mailto:${esc(c.email)}">${icon('mail')}E-mail</a>${c.phone ? `<a class="btn btn--ghost btn--xs" href="tel:${esc(c.phone.replace(/\s/g, ''))}">${icon('phone')}Appeler</a>` : ''}</div>
      ${c.allergies.length ? `<div class="notice notice--warn" style="text-align:left;margin-bottom:0">Allergies déclarées : ${esc(c.allergies.join(', '))}</div>` : ''}</section>
    <section class="panel"><h3>Abonnement</h3>${c.membership ? `<p style="margin:0"><strong>Club ${esc(tierName(c.membership.tier))}</strong> · ${subStatus(c.membership.status)}<br><span class="small muted">depuis le ${fmtDate(c.membership.since)} · ${eur(tierPrice(c.membership.tier))} / mois</span></p>` : '<p class="muted small" style="margin:0">Pas d’abonnement.</p>'}</section>
    ${favs.length ? `<section class="panel"><h3>Plats préférés</h3>${hbars(favs, (v) => `× ${v}`)}</section>` : ''}
    <a href="#/clients" class="btn btn--ghost btn--block btn--sm">← Tous les clients</a>
  </aside></div>`;
}

/* ================= ABONNEMENTS ================= */
const subStatus = (s) => ({ active: '<span class="st st--done">Actif</span>', paused: '<span class="st st--prep">En pause</span>', cancelled: '<span class="st st--off">Résilié</span>' }[s] || s);
let subTier = 'all';
AVIEWS.abonnements = {
  title: 'Abonnements',
  render() {
    const subs = DEMO.customers.filter((c) => c.membership);
    const active = subs.filter((c) => c.membership.status === 'active');
    const mrr = active.reduce((a, c) => a + tierPrice(c.membership.tier), 0);
    const recent = active.filter((c) => c.membership.since >= iso(addDays(new Date(), -30))).length;
    const list = subs.filter((c) => subTier === 'all' || c.membership.tier === subTier).sort((a, b) => b.membership.since.localeCompare(a.membership.since));
    // Abonnés actifs fin de mois, sur 12 mois
    const months = Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 11 + i); return d; });
    const counts = months.map((d) => { const end = iso(new Date(d.getFullYear(), d.getMonth() + 1, 0)); return subs.filter((c) => c.membership.since <= end && (c.membership.status !== 'cancelled' || (c.membership.endN !== undefined && c.membership.endN !== null && iso(addDays(new Date(), c.membership.endN)) > end))).length; });
    const churned = subs.filter((c) => c.membership.status === 'cancelled').length;
    return `<section class="kpis kpis--4">${kpi({ label: 'Abonnés actifs', value: num(active.length), raw: active.length, ic: 'star', tone: 'saffron', spark: counts })}${kpi({ label: 'Revenus mensuels récurrents', value: eur(mrr), raw: mrr, fmt: 'eur', ic: 'euro', sub: 'cotisations des abonnés actifs' })}${kpi({ label: 'Nouveaux abonnés (30 j)', value: num(recent), raw: recent, ic: 'users', tone: 'blue' })}${kpi({ label: 'Taux de résiliation', value: pct(subs.length ? churned / subs.length : 0), ic: 'repeat', tone: 'tomato', sub: `${subs.filter((c) => c.membership.status === 'paused').length} en pause · ${churned} résiliés` })}</section>
      <div class="grid-dash">
        <div class="panel span-8"><div class="panel__head"><h3>Évolution des abonnés</h3><span class="small muted">abonnés actifs en fin de mois</span></div>${timeChart({ labels: months.map((d) => fmtDate(d, { month: 'short' }).replace('.', '')), tips: months.map((d, i) => `<strong>${fmtDate(d, { month: 'long', year: 'numeric' })}</strong><br>${counts[i]} abonnés`), series: [{ label: 'Abonnés', values: counts }], type: 'area', height: 220 })}</div>
        <div class="panel span-4"><div class="panel__head"><h3>Répartition par formule</h3></div>${donut(ADM.memberships.slice(0, 3).map((m) => ({ label: m.name, value: active.filter((c) => c.membership.tier === m.id).length })), (v) => `${num(v)}`, `<strong>${active.length}</strong><span>actifs</span>`)}</div>
      </div>
      <h2 class="sec-title">Formules du Club <span class="muted">· affichées sur le site</span></h2>
      <div class="cards cards--3">${ADM.memberships.map((m, i) => `<form class="panel tier-form" data-tier="${i}">
        <div class="row" style="justify-content:space-between"><input class="input input--title" name="name" value="${esc(m.name)}" aria-label="Nom de la formule"><span class="st st--ship">${active.filter((c) => c.membership.tier === m.id).length} abonnés</span></div>
        <div class="cols2"><div class="field"><label>Prix / mois (€)</label><input class="input" type="number" step="0.01" min="0" name="price" value="${m.price}"></div><div class="field"><label>Remise (%)</label><input class="input" type="number" step="1" min="0" max="50" name="discount" value="${Math.round(m.discount * 100)}"></div></div>
        <label class="check"><input type="checkbox" name="freeDelivery" ${m.freeDelivery ? 'checked' : ''}> Livraison offerte dès ${eur(ADM.delivery.premiumFreeFrom)}</label>
        <div class="field" style="margin-top:12px"><label>Avantages (un par ligne)</label><textarea class="input" name="perks" rows="4">${esc(m.perks.join('\n'))}</textarea></div>
        <button class="btn btn--dark btn--sm">Enregistrer</button></form>`).join('')}</div>
      <h2 class="sec-title">Abonnés</h2>
      <div class="toolbar"><select class="input" id="sTier" aria-label="Formule"><option value="all">Toutes les formules</option>${ADM.memberships.map((m) => `<option value="${m.id}" ${subTier === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>
      <div class="table-wrap"><table class="data adm-table"><thead><tr><th>Client</th><th>Formule</th><th>Depuis</th><th>Statut</th><th class="num">Cotisation</th></tr></thead><tbody>
      ${list.map((c) => `<tr><td><a class="person" href="#/clients/${c.id}"><span class="avatar avatar--sm ${avatarTone(c.id)}">${initials(c.name)}</span><span><strong>${esc(c.name)}</strong><span class="small muted">${esc(c.email)}</span></span></a></td><td data-l="Formule">${esc(tierName(c.membership.tier))}</td><td data-l="Depuis">${fmtDate(c.membership.since, { day: 'numeric', month: 'short', year: 'numeric' })}</td><td data-l="Statut"><span>${subStatus(c.membership.status)}</span></td><td class="num" data-l="Cotisation">${eur(tierPrice(c.membership.tier))}</td></tr>`).join('')}
      </tbody></table></div>`;
  },
  mount() {
    $('#sTier').onchange = (e) => { subTier = e.target.value; rerender(); };
    $$('[data-tier]').forEach((f) => f.addEventListener('submit', (e) => {
      e.preventDefault();
      const m = ADM.memberships[Number(f.dataset.tier)];
      Object.assign(m, { name: f.elements.name.value.trim() || m.name, price: round2(Math.max(0, Number(f.price.value))), discount: Math.min(0.5, Math.max(0, Number(f.discount.value) / 100)), freeDelivery: f.freeDelivery.checked, perks: f.perks.value.split('\n').map((s) => s.trim()).filter(Boolean) });
      saveAdmin(`Formule Club ${m.name} mise à jour`); rerender();
    }));
  },
};
