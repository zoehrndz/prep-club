/* =========================================================
   PREP CLUB Admin — Tableau de bord
   ========================================================= */
'use strict';

const PERIODS = [['today', 'Aujourd’hui'], ['week', 'Cette semaine'], ['month', 'Ce mois-ci'], ['quarter', 'Ce trimestre'], ['year', 'Cette année'], ['custom', 'Personnalisée']];
let dashPeriod = 'month';
let dashCustom = { from: iso(addDays(new Date(), -29)), to: iso(new Date()) };

const isSale = (o) => { const s = orderStatus(o); return s.status !== -1 && s.payment !== 'failed'; };
const KIND_LABELS = { carte: 'À la carte', formule: 'Formule', box: 'Box composée', decouverte: 'Box découverte' };

function periodRange(key) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  let from = t;
  if (key === 'week') from = mondayOf(t);
  if (key === 'month') from = new Date(t.getFullYear(), t.getMonth(), 1);
  if (key === 'quarter') from = new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1);
  if (key === 'year') from = new Date(t.getFullYear(), 0, 1);
  let to = t;
  if (key === 'custom') {
    from = fromIso(dashCustom.from); to = fromIso(dashCustom.to);
    if (to < from) [from, to] = [to, from];
  }
  const days = Math.round((to - from) / 864e5) + 1;
  return { from: iso(from), to: iso(to), days, prevFrom: iso(addDays(from, -days)), prevTo: iso(addDays(from, -1)) };
}
const revenue = (list) => round2(list.reduce((a, o) => a + o.total, 0));
const salesBetween = (a, b) => DEMO.orders.filter((o) => o.day >= a && o.day <= b && isSale(o));
function firstOrders() {
  const first = {};
  DEMO.orders.forEach((o) => { if (isSale(o) && (!first[o.customerId] || o.day < first[o.customerId])) first[o.customerId] = o.day; });
  return first;
}
/* Valeur jour par jour sur n jours (mini-courbes). */
function dailySeries(n, f = (l) => revenue(l), end = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) { const k = iso(addDays(end, -i)); out.push(f(salesBetween(k, k))); }
  return out;
}

/* Découpage de la période pour les graphiques (heure, jour, semaine ou mois). */
function buckets(r, key) {
  const out = [];
  if (key === 'today') {
    for (let h = 7; h <= 22; h++) out.push({ label: `${h} h`, tip: `${h} h – ${h + 1} h`, test: (o) => new Date(o.date).getHours() === h });
    return out;
  }
  const from = fromIso(r.from); const to = fromIso(r.to);
  const unit = r.days <= 62 ? 'day' : r.days <= 190 ? 'week' : 'month';
  if (unit === 'day') {
    for (let d = from; d <= to; d = addDays(d, 1)) { const k = iso(d); out.push({ label: fmtDate(d, { day: 'numeric', month: 'short' }).replace('.', ''), tip: fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' }), a: k, b: k }); }
  } else if (unit === 'week') {
    for (let d = mondayOf(from); d <= to; d = addDays(d, 7)) { const a = iso(d < from ? from : d); const e = addDays(d, 6); const b = iso(e > to ? to : e); out.push({ label: fmtDate(d, { day: 'numeric', month: 'short' }).replace('.', ''), tip: `Semaine du ${fmtDate(a, { day: 'numeric', month: 'long' })}`, a, b }); }
  } else {
    for (let d = new Date(from.getFullYear(), from.getMonth(), 1); d <= to; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      out.push({ label: fmtDate(d, { month: 'short' }).replace('.', ''), tip: fmtDate(d, { month: 'long', year: 'numeric' }), a: iso(d < from ? from : d), b: iso(e > to ? to : e) });
    }
  }
  out.forEach((k) => { k.test = (o) => o.day >= k.a && o.day <= k.b; });
  return out;
}

AVIEWS.dashboard = {
  title: 'Accueil',
  render() {
    return `${dashHero()}
      <div class="page-head" style="margin-top:30px">
        <h2 class="sec-title" style="margin:0">Activité <span class="muted" id="rangeTxt"></span></h2>
        <div class="page-head__actions">${segmented('period', PERIODS, dashPeriod)}
          <span class="custom-range" ${dashPeriod === 'custom' ? '' : 'hidden'}><input type="date" class="input input--sm" id="cFrom" value="${dashCustom.from}" aria-label="Du"> → <input type="date" class="input input--sm" id="cTo" value="${dashCustom.to}" aria-label="Au"></span></div>
      </div>
      <div id="dash"></div>`;
  },
  mount() {
    $$('[data-period]').forEach((b) => b.addEventListener('click', () => { dashPeriod = b.dataset.period; rerender(); }));
    ['#cFrom', '#cTo'].forEach((s) => $(s).addEventListener('change', () => { dashCustom = { from: $('#cFrom').value, to: $('#cTo').value }; drawDash(); countUp($('#dash')); }));
    drawDash();
  },
};

/* ---------- La journée en un coup d'œil ---------- */
function dashHero() {
  const now = new Date();
  const h = now.getHours();
  const hello = h < 12 ? 'Bonjour' : h < 18 ? 'Bel après-midi' : 'Bonsoir';
  const t = iso(now);
  const today = salesBetween(t, t);
  const lwDay = iso(addDays(now, -7));
  const lw = DEMO.orders.filter((o) => o.day === lwDay && isSale(o) && new Date(o.date).getHours() <= h);
  const m = periodRange('month');
  const month = revenue(salesBetween(m.from, m.to));
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projection = (month / now.getDate()) * dim;
  const goal = ADM.goals.monthRevenue || 1;
  const live = DEMO.orders.map((o) => orderStatus(o));
  const toPrep = live.filter((s) => s.status === 0 || s.status === 1).length;
  const issues = live.filter((s) => s.status >= 0 && s.status < 3 && (s.payment === 'failed' || s.needs)).length;
  const kitchen = kitchenSummary(iso(addDays(now, 1)));
  const wk = periodRange('week');
  const weekRev = revenue(salesBetween(wk.from, t));
  const subs = DEMO.customers.filter((c) => c.membership && c.membership.status === 'active');
  const menu = liveWeeklyMenu(ADM);
  return `<section class="grid-dash">
    <div class="hero-dash">
      <div>
        <div class="hero-dash__date">${fmtDate(now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <h2 class="hero-dash__hello">${hello}, <em>chef</em> !</h2>
        <p class="hero-dash__text"><strong>${toPrep} commande${toPrep > 1 ? 's' : ''}</strong> à préparer${issues ? ` et <a href="#/commandes/f/alert"><strong>${issues} point${issues > 1 ? 's' : ''} à traiter</strong></a>` : ', rien à signaler'}. ${menu ? `En ligne : <strong>${esc(menu.name)}</strong>.` : 'Aucun menu de la semaine en ligne.'}</p>
        <div class="hero-dash__figs">
          <div class="hero-dash__fig"><small>Chiffre d’affaires du jour</small><strong data-count="${revenue(today)}" data-fmt="eur">${eur(revenue(today))}</strong>${delta(revenue(today), revenue(lw))}</div>
          <div class="hero-dash__fig hero-dash__fig--sm"><small>Commandes</small><strong data-count="${today.length}">${today.length}</strong></div>
          <div class="hero-dash__fig"><small>14 derniers jours</small>${sparkline(dailySeries(14))}</div>
        </div>
      </div>
      <div class="hero-dash__goal">${ring(month / goal, pct(month / goal), 'objectif du mois')}<p>${eur0(month)} sur ${eur0(goal)}<br>Projection : <strong style="color:#fff">${eur0(projection)}</strong></p></div>
    </div>
    <div class="panel kitchen">
      <div class="panel__head"><div><h3>En cuisine demain</h3><p class="small muted">${fmtDate(addDays(now, 1), { weekday: 'long', day: 'numeric', month: 'long' })}</p></div><span class="kpi__ic">${icon('chef')}</span></div>
      <div class="kitchen__big"><strong data-count="${kitchen.portions}">${kitchen.portions}</strong><span class="muted">portions · ${kitchen.orders} commandes</span></div>
      ${kitchen.cats.length ? hbars(kitchen.cats.slice(0, 4), num) : '<p class="muted small" style="margin:16px 0">Aucune commande pour demain pour l’instant.</p>'}
      <div class="minis" style="margin-bottom:16px"><div class="mini"><small>Livraisons</small><strong>${kitchen.home}</strong></div><div class="mini"><small>Retraits</small><strong>${kitchen.pickup}</strong></div></div>
      <a href="#/production/${iso(addDays(now, 1))}" class="btn btn--dark btn--sm">${icon('print')}Fiche de production</a>
    </div>
  </section>
  <section class="kpis kpis--4">
    ${kpi({ label: 'Chiffre d’affaires de la semaine', value: eur(weekRev), raw: weekRev, fmt: 'eur', ic: 'euro', spark: dailySeries(7), sub: 'depuis lundi' })}
    ${kpi({ label: 'Chiffre d’affaires du mois', value: eur(month), raw: month, fmt: 'eur', ic: 'euro', tone: 'saffron', spark: dailySeries(Math.max(2, now.getDate())), sub: `depuis le 1er · objectif ${eur0(goal)}` })}
    ${kpi({ label: 'Abonnés Club actifs', value: num(subs.length), raw: subs.length, ic: 'star', tone: 'saffron', href: '#/abonnements', sub: `${eur(subs.reduce((a, c) => a + tierPrice(c.membership.tier), 0))} de cotisations / mois` })}
    ${kpi({ label: 'Note moyenne des avis', value: `${avgRating().toFixed(1).replace('.', ',')} / 5`, ic: 'chat', tone: 'ink', sub: `${DEMO.reviews.length} avis · ${DEMO.reviews.filter(reviewNeedsAction).length} à traiter` })}
    ${opsKpi(0, 'Commandes en attente', 'clock', 'saffron', 'à valider et préparer')}
    ${opsKpi(1, 'En préparation', 'chef', '', 'en cuisine')}
    ${opsKpi(2, 'À livrer / à retirer', 'truck', 'blue', 'prêtes au départ')}
    ${kpi({ label: 'À traiter', value: num(issues), raw: issues, ic: 'alert', tone: 'tomato', href: '#/commandes/f/alert', sub: 'paiements échoués et interventions' })}
  </section>`;
}
function opsKpi(st, label, ic, tone, sub) {
  const n = DEMO.orders.filter((o) => orderStatus(o).status === st).length;
  return kpi({ label, value: num(n), raw: n, ic, tone, href: `#/commandes/f/${st}`, sub });
}
const avgRating = () => (DEMO.reviews.length ? DEMO.reviews.reduce((a, r) => a + r.rating, 0) / DEMO.reviews.length : 0);

/* Portions à produire pour un jour de livraison / retrait. */
function kitchenSummary(day) {
  const list = DEMO.orders.filter((o) => o.slot.day === day && orderStatus(o).status >= 0 && orderStatus(o).payment !== 'failed');
  const cats = {};
  let portions = 0;
  list.forEach((o) => o.lines.forEach((l) => { portions += l.qty; const c = (AP(l.pid) || l).cat; cats[c] = (cats[c] || 0) + l.qty; }));
  return {
    orders: list.length, portions, home: list.filter((o) => o.mode === 'home').length, pickup: list.filter((o) => o.mode === 'pickup').length,
    cats: Object.entries(cats).map(([c, v]) => ({ label: catLabel(c), value: v })).sort((a, b) => b.value - a.value),
  };
}

/* ---------- Activité de la période ---------- */
function drawDash() {
  const r = periodRange(dashPeriod);
  const sales = salesBetween(r.from, r.to);
  const prev = salesBetween(r.prevFrom, r.prevTo);
  const first = firstOrders();
  const rev = revenue(sales);
  const prevRev = revenue(prev);
  const avg = sales.length ? rev / sales.length : 0;
  const prevAvg = prev.length ? prevRev / prev.length : 0;
  const t = iso(new Date());

  const periodCustomers = new Set(sales.map((o) => o.customerId));
  const prevCustomers = new Set(prev.map((o) => o.customerId));
  const newCustomers = [...periodCustomers].filter((id) => first[id] >= r.from).length;
  const prevNew = [...prevCustomers].filter((id) => first[id] >= r.prevFrom && first[id] <= r.prevTo).length;
  const active = new Set(salesBetween(iso(addDays(new Date(), -59)), t).map((o) => o.customerId)).size;
  const perCustomer = {};
  sales.forEach((o) => { perCustomer[o.customerId] = (perCustomer[o.customerId] || 0) + 1; });
  const repeat = periodCustomers.size ? Object.values(perCustomer).filter((n) => n >= 2).length / periodCustomers.size : 0;

  const byProduct = {}; const byCat = {}; const byKind = { carte: 0, formule: 0, box: 0, decouverte: 0 };
  let memberRev = 0;
  sales.forEach((o) => {
    byKind[o.kind] += o.total;
    if (o.tier) memberRev += o.total;
    const share = o.sub ? (o.total - o.delivery) / o.sub : 1;
    o.lines.forEach((l) => {
      const v = l.amount * share;
      const p = byProduct[l.pid] || (byProduct[l.pid] = { label: (AP(l.pid) || l).name, img: (AP(l.pid) || {}).img || '', value: 0, qty: 0 });
      p.value += v; p.qty += l.qty;
      const c = (AP(l.pid) || l).cat;
      byCat[c] = (byCat[c] || 0) + v;
    });
  });
  const top = Object.values(byProduct).sort((a, b) => b.value - a.value);

  // Séries temporelles, et la même durée juste avant pour comparer
  const bk = buckets(r, dashPeriod);
  const revSeries = bk.map((k) => revenue(sales.filter(k.test)));
  const ordSeries = bk.map((k) => sales.filter(k.test).length);
  const prevSeries = dashPeriod === 'today'
    ? bk.map((k) => revenue(prev.filter(k.test)))
    : bk.map((k) => revenue(salesBetween(iso(addDays(fromIso(k.a), -r.days)), iso(addDays(fromIso(k.b), -r.days)))));
  const newSeries = []; const retSeries = [];
  bk.forEach((k) => {
    const ids = new Set(sales.filter(k.test).map((o) => o.customerId));
    let nw = 0;
    ids.forEach((id) => { if (dashPeriod === 'today' ? first[id] === t : first[id] >= k.a && first[id] <= k.b) nw++; });
    newSeries.push(nw); retSeries.push(ids.size - nw);
  });
  const avgSeries = bk.map((k, i) => (ordSeries[i] ? revSeries[i] / ordSeries[i] : 0));

  // Carte de chaleur jour × heure
  const hours = Array.from({ length: 16 }, (_, i) => 7 + i);
  const heat = Array.from({ length: 7 }, () => hours.map(() => 0));
  sales.forEach((o) => { const d = new Date(o.date); const hi = d.getHours() - 7; if (hi >= 0 && hi < 16) heat[(d.getDay() + 6) % 7][hi]++; });

  $('#rangeTxt').textContent = r.days === 1 ? `· ${fmtDate(r.from, { weekday: 'long', day: 'numeric', month: 'long' })}` : `· du ${fmtDate(r.from, { day: 'numeric', month: 'long' })} au ${fmtDate(r.to, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const spark = bk.length > 2;
  $('#dash').innerHTML = `
    <section class="kpis kpis--4">
      ${kpi({ label: 'Chiffre d’affaires', value: eur(rev), raw: rev, fmt: 'eur', ic: 'euro', deltaHtml: delta(rev, prevRev), spark: spark ? revSeries : null })}
      ${kpi({ label: 'Nombre de commandes', value: num(sales.length), raw: sales.length, ic: 'bag', deltaHtml: delta(sales.length, prev.length), spark: spark ? ordSeries : null })}
      ${kpi({ label: 'Panier moyen', value: eur(avg), raw: avg, fmt: 'eur', ic: 'tag', tone: 'saffron', deltaHtml: delta(avg, prevAvg), spark: spark ? avgSeries : null })}
      ${kpi({ label: 'Nouveaux clients', value: num(newCustomers), raw: newCustomers, ic: 'users', tone: 'blue', deltaHtml: delta(newCustomers, prevNew), spark: spark ? newSeries : null, sub: 'première commande sur la période' })}
      ${kpi({ label: 'Clients actifs', value: num(active), raw: active, ic: 'users', tone: 'blue', href: '#/clients', sub: 'au moins une commande sur 60 jours' })}
      ${kpi({ label: 'Taux de réachat', value: pct(repeat), raw: repeat, fmt: 'pct', ic: 'repeat', sub: 'clients ayant commandé 2 fois ou plus' })}
      ${kpi({ label: 'Clients servis', value: num(periodCustomers.size), raw: periodCustomers.size, ic: 'heart', tone: 'tomato', sub: 'clients différents sur la période' })}
      ${kpi({ label: 'Produit le plus vendu', value: `<span class="kpi__value--text">${top[0] ? esc(top[0].label) : '—'}</span>`, ic: 'star', tone: 'saffron', href: '#/produits', sub: top[0] ? `${num(top[0].qty)} portions · ${eur0(top[0].value)}` : '' })}
    </section>

    <section class="grid-dash">
      <div class="panel span-8"><div class="panel__head"><div><h3>Évolution du chiffre d’affaires</h3><p class="small muted">TTC, hors commandes annulées et paiements échoués</p></div></div>
        ${sales.length || prev.length ? timeChart({ labels: bk.map((k) => k.label), tips: bk.map((k, i) => `<strong>${k.tip}</strong><br>${eur(revSeries[i])} · ${ordSeries[i]} commande${ordSeries[i] > 1 ? 's' : ''}<br><span style="opacity:.7">Période précédente : ${eur(prevSeries[i])}</span>`), series: [{ label: 'Période en cours', values: revSeries }], compare: { label: 'Période précédente', values: prevSeries }, type: bk.length > 1 ? 'area' : 'bars', fmt: eur0, height: 280 }) : emptyState('Aucune vente', 'Pas encore de commande sur cette période.')}
      </div>
      <div class="panel span-4"><div class="panel__head"><div><h3>À la carte ou en formule</h3><p class="small muted">Part du chiffre d’affaires</p></div></div>
        ${donut([{ label: 'À la carte', value: byKind.carte }, { label: 'Formules', value: byKind.formule }, { label: 'Box', value: byKind.box + byKind.decouverte }], eur0)}
      </div>
      <div class="panel span-6"><div class="panel__head"><h3>Évolution du nombre de commandes</h3></div>
        ${timeChart({ labels: bk.map((k) => k.label), tips: bk.map((k, i) => `<strong>${k.tip}</strong><br>${ordSeries[i]} commande${ordSeries[i] > 1 ? 's' : ''}`), series: [{ label: 'Commandes', values: ordSeries }], type: 'bars', height: 224 })}
      </div>
      <div class="panel span-6"><div class="panel__head"><h3>Nouveaux clients et clients récurrents</h3></div>
        ${timeChart({ labels: bk.map((k) => k.label), tips: bk.map((k, i) => `<strong>${k.tip}</strong><br><i class="sw s1"></i>${newSeries[i]} nouveau${newSeries[i] > 1 ? 'x' : ''}<br><i class="sw s2"></i>${retSeries[i]} récurrent${retSeries[i] > 1 ? 's' : ''}`), series: [{ label: 'Nouveaux clients', values: newSeries }, { label: 'Clients récurrents', values: retSeries }], type: 'bars', height: 196 })}
      </div>
      <div class="panel span-5"><div class="panel__head"><h3>Produits les plus vendus</h3><a class="small link" href="#/produits">Catalogue →</a></div>
        ${top.length ? hbars(top.slice(0, 7), eur0, (x) => ` <span class="muted">· ${num(x.qty)}</span>`) : emptyState('Aucune vente', '')}
      </div>
      <div class="panel span-4"><div class="panel__head"><h3>Ventes par catégorie</h3></div>
        ${hbars(Object.entries(byCat).map(([c, v]) => ({ label: catLabel(c), value: v })).sort((a, b) => b.value - a.value))}
      </div>
      <div class="panel span-3"><div class="panel__head"><h3>Ventes issues des abonnements</h3></div>
        ${donut([{ label: 'Abonnés Club', value: memberRev }, { label: 'Sans abonnement', value: rev - memberRev }], eur0, `<strong>${pct(rev ? memberRev / rev : 0)}</strong><span>abonnés</span>`)}
      </div>
      <div class="panel span-7"><div class="panel__head"><div><h3>Quand vos clients commandent-ils ?</h3><p class="small muted">Commandes par jour et par heure sur la période</p></div></div>
        ${heatmap(heat, ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], hours.map((hh) => `${hh}h`), (ri, ci, v) => `<strong>${DAYS[ri]} ${hours[ci]} h</strong><br>${v} commande${v > 1 ? 's' : ''}`)}
      </div>
      <div class="panel span-5"><div class="panel__head"><h3>À traiter</h3><a class="small link" href="#/commandes/f/alert">Tout voir →</a></div>${alertsHtml()}</div>
      <div class="panel span-12"><div class="panel__head"><h3>Activité récente</h3></div>${activityHtml()}</div>
    </section>`;
}

function alertsHtml() {
  const all = notifications();
  const rows = all.filter((n) => n.lvl !== 'info').concat(all.filter((n) => n.lvl === 'info'));
  if (!rows.length) return emptyState('Rien à signaler', 'Toutes les commandes et tous les produits sont en ordre.');
  return `<ul class="todo">${rows.slice(0, 6).map((x) => `<li><a href="${x.href}" class="notif--${x.lvl}"><span class="notif__ic">${icon(x.ic)}</span><span><strong>${esc(x.title)}</strong><span class="small muted">${esc(x.text)}</span></span></a></li>`).join('')}</ul>${rows.length > 6 ? `<p class="small muted" style="margin:10px 0 0">+ ${rows.length - 6} autres éléments dans les notifications</p>` : ''}`;
}

function activityHtml() {
  const ev = [];
  const since = addDays(new Date(), -10).toISOString();
  DEMO.orders.filter((o) => o.date >= since).slice(-6).forEach((o) => ev.push({ date: o.date, ic: 'bag', cls: 'order', html: `Nouvelle commande <a href="#/commandes/${o.id}">${o.id}</a> · ${esc(o.customer)} · <strong>${eur(o.total)}</strong>` }));
  DEMO.customers.filter((c) => c.joined >= since.slice(0, 10)).forEach((c) => ev.push({ date: `${c.joined}T09:00:00`, ic: 'users', cls: 'user', html: `Nouveau client : <a href="#/clients/${c.id}">${esc(c.name)}</a>` }));
  DEMO.customers.filter((c) => c.membership && c.membership.since >= since.slice(0, 10)).forEach((c) => ev.push({ date: `${c.membership.since}T10:00:00`, ic: 'star', cls: 'star', html: `Nouvel abonnement <strong>${esc(tierName(c.membership.tier))}</strong> : <a href="#/clients/${c.id}">${esc(c.name)}</a>` }));
  DEMO.reviews.filter((r) => r.date >= since).forEach((r) => ev.push({ date: r.date, ic: 'chat', cls: 'review', html: `${stars(r.rating)} sur <strong>${esc(r.product)}</strong> · « ${esc(r.text)} »` }));
  ADM.log.slice(0, 4).forEach((l) => ev.push({ date: l.date, ic: 'cog', cls: '', html: `<span class="muted">Back-office :</span> ${esc(l.msg)}` }));
  ev.sort((a, b) => b.date.localeCompare(a.date));
  const now = new Date().toISOString();
  const list = ev.filter((e) => e.date <= now).slice(0, 12);
  const half = Math.ceil(list.length / 2);
  const col = (items) => `<ul class="feed feed--timeline">${items.map((e) => `<li class="feed__item"><span class="feed__icon feed__icon--${e.cls}">${icon(e.ic)}</span><div>${e.html}<div class="small muted">${ago(e.date)}</div></div></li>`).join('')}</ul>`;
  return `<div class="grid2">${col(list.slice(0, half))}${col(list.slice(half))}</div>`;
}
