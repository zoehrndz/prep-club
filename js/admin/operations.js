/* =========================================================
   PREP CLUB Admin — Production (cuisine) & livraisons
   ========================================================= */
'use strict';

const dayOrders = (day) => DEMO.orders.filter((o) => o.slot.day === day && orderStatus(o).status >= 0);
const postcodeOf = (s) => ((s || '').match(/\b(\d{5})\b/) || [])[1] || '—';
const defaultOpsDay = () => iso(addDays(new Date(), 1));

/* ================= PRODUCTION ================= */
AVIEWS.production = {
  title: 'Cuisine',
  render(day = defaultOpsDay()) {
    const all = dayOrders(day);
    const paid = all.filter((o) => orderStatus(o).payment !== 'failed');
    const unpaid = all.length - paid.length;
    const rows = {};
    paid.forEach((o) => {
      const s = orderStatus(o).status;
      o.lines.forEach((l) => {
        const r = rows[l.pid] || (rows[l.pid] = { pid: l.pid, name: (AP(l.pid) || l).name, cat: (AP(l.pid) || l).cat, qty: 0, done: 0, orders: new Set() });
        r.qty += l.qty; if (s >= 2) r.done += l.qty; r.orders.add(o.id);
      });
    });
    const list = Object.values(rows);
    const portions = list.reduce((a, r) => a + r.qty, 0);
    const done = list.reduce((a, r) => a + r.done, 0);
    const groups = ADM.categories.map((c) => [c, list.filter((r) => r.cat === c.id).sort((a, b) => b.qty - a.qty)]).filter(([, l]) => l.length);
    const other = list.filter((r) => !ADM.categories.some((c) => c.id === r.cat));
    if (other.length) groups.push([{ label: 'Autres' }, other]);

    // Besoins en ingrédients (en portions concernées) et alertes allergènes
    const ing = {};
    list.forEach((r) => { const p = AP(r.pid); if (p) p.origin.forEach((o) => { const k = o.ing; const x = ing[k] || (ing[k] = { qty: 0, producer: o.producer, country: o.country }); x.qty += r.qty; }); });
    const allergyAlerts = [];
    paid.forEach((o) => {
      const c = DEMO.customers.find((x) => x.id === o.customerId);
      if (!c || !c.allergies.length) return;
      o.lines.forEach((l) => { const p = AP(l.pid); const hit = p ? p.allergens.filter((a) => c.allergies.includes(a)) : []; if (hit.length) allergyAlerts.push({ o, p, hit }); });
    });
    const shortages = list.filter((r) => { const p = AP(r.pid); return p && p.stock < r.qty - r.done; });

    return `<div class="print-only"><h2>Fiche de production — ${fmtDate(day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2></div>
      <div class="page-head no-print"><p class="page-head__text">Quantités à cuisiner pour les livraisons et retraits du jour choisi, regroupées par catégorie. Imprimez la fiche pour la cuisine.</p>
        <div class="page-head__actions"><button class="btn btn--ghost btn--sm" id="prodCsv">${icon('download')}Exporter</button><button class="btn btn--ghost btn--sm" onclick="window.print()">${icon('print')}Imprimer</button>${paid.some((o) => orderStatus(o).status === 0) ? '<button class="btn btn--primary btn--sm" id="prodStart">Lancer toute la préparation</button>' : ''}</div></div>
      <div class="no-print">${dayChips('pday', day)}</div>
      <section class="kpis kpis--4">
        ${kpi({ label: 'Portions à préparer', value: num(portions), raw: portions, ic: 'chef' })}
        ${kpi({ label: 'Déjà prêtes', value: `${num(done)} / ${num(portions)}`, ic: 'check', tone: 'blue', sub: portions ? `${pct(done / portions)} de la production` : '' })}
        ${kpi({ label: 'Commandes', value: num(paid.length), raw: paid.length, ic: 'bag', tone: 'saffron', sub: `${paid.filter((o) => o.mode === 'home').length} livraisons · ${paid.filter((o) => o.mode === 'pickup').length} retraits` })}
        ${kpi({ label: 'Points de vigilance', value: num(allergyAlerts.length + shortages.length + unpaid), raw: allergyAlerts.length + shortages.length + unpaid, ic: 'alert', tone: 'tomato', sub: `${allergyAlerts.length} allergie${allergyAlerts.length > 1 ? 's' : ''} · ${shortages.length} stock${shortages.length > 1 ? 's' : ''} · ${unpaid} non payée${unpaid > 1 ? 's' : ''}` })}
      </section>
      ${list.length ? `<div class="grid-dash">
        <div class="panel span-8" style="padding:0;overflow:hidden">
          <table class="data prod-table"><thead><tr><th>Recette</th><th>Allergènes</th><th class="num">Commandes</th><th>Avancement</th><th class="num">Portions</th></tr></thead><tbody>
          ${groups.map(([c, l]) => `<tr class="prod-group"><td colspan="5">${esc(c.label)} · ${l.reduce((a, r) => a + r.qty, 0)} portions</td></tr>${l.map((r) => { const p = AP(r.pid); return `<tr>
            <td><a class="prod-cell" href="#/produits/${r.pid}">${thumb(p && p.img, 'thumb thumb--sm')}<span><strong>${esc(r.name)}</strong>${p && p.stock < r.qty - r.done ? `<span class="small warn-text">Stock : ${p.stock} pour ${r.qty - r.done} à produire</span>` : ''}</span></a></td>
            <td class="small">${p && p.allergens.length ? esc(p.allergens.join(', ')) : '—'}</td>
            <td class="num">${r.orders.size}</td>
            <td style="min-width:120px"><div class="stockbar"><i style="width:${(r.done / r.qty) * 100}%"></i></div><span class="small muted">${r.done} / ${r.qty} prêtes</span></td>
            <td class="qty">${r.qty}</td></tr>`; }).join('')}`).join('')}
          </tbody></table>
        </div>
        <div class="span-4" style="display:grid;gap:18px;align-content:start">
          ${allergyAlerts.length ? `<div class="panel" style="margin:0"><div class="panel__head"><h3>Allergies déclarées</h3><span class="st st--alert">${allergyAlerts.length}</span></div><ul class="todo">${allergyAlerts.slice(0, 8).map((a) => `<li><a href="#/commandes/${a.o.id}" class="notif--alert"><span class="notif__ic">${icon('alert')}</span><span><strong>${a.o.id} · ${esc(a.p.name)}</strong><span class="small muted">${esc(a.o.customer)} : ${esc(a.hit.join(', '))}</span></span></a></li>`).join('')}</ul></div>` : ''}
          ${unpaid ? `<div class="panel" style="margin:0"><h3>Paiements en attente</h3><p class="small muted" style="margin:0">${unpaid} commande${unpaid > 1 ? 's' : ''} non comptée${unpaid > 1 ? 's' : ''} dans la production tant que le paiement n’est pas reçu. <a class="link" href="#/commandes/f/alert">Voir</a></p></div>` : ''}
          <div class="panel" style="margin:0"><div class="panel__head"><div><h3>Besoins en ingrédients</h3><p class="small muted">Nombre de portions qui utilisent chaque ingrédient</p></div></div>
            <ul class="ing-list" style="columns:1">${Object.entries(ing).sort((a, b) => b[1].qty - a[1].qty).slice(0, 18).map(([k, x]) => `<li><span>${esc(k)}${x.producer ? ` <span class="muted small">· ${esc(producerName(x.producer))}</span>` : x.country && x.country !== 'France' ? ` <span class="muted small">· ${esc(x.country)}</span>` : ''}</span><strong>${x.qty}</strong></li>`).join('')}</ul>
          </div>
        </div>
      </div>` : `<div class="panel">${emptyState('Aucune production prévue', 'Aucune commande payée n’est attendue ce jour-là.')}</div>`}`;
  },
  mount(day = defaultOpsDay()) {
    $$('[data-pday]').forEach((b) => b.addEventListener('click', () => { location.hash = `#/production/${b.dataset.pday}`; }));
    const start = $('#prodStart');
    if (start) start.onclick = () => {
      let n = 0;
      dayOrders(day).forEach((o) => { const s = orderStatus(o); if (s.status === 0 && s.payment !== 'failed') { setOrderStatus(o, { status: 1 }); n++; } });
      saveAdmin(`${n} commande${n > 1 ? 's' : ''} passée${n > 1 ? 's' : ''} en préparation`); rerender();
    };
    $('#prodCsv').onclick = () => {
      const rows = {};
      dayOrders(day).filter((o) => orderStatus(o).payment !== 'failed').forEach((o) => o.lines.forEach((l) => { const r = rows[l.pid] || (rows[l.pid] = { name: (AP(l.pid) || l).name, cat: catLabel((AP(l.pid) || l).cat), qty: 0 }); r.qty += l.qty; }));
      downloadCsv(`production-${day}.csv`, [['Catégorie', 'Recette', 'Portions'], ...Object.values(rows).map((r) => [r.cat, r.name, r.qty])]);
    };
  },
};

/* ================= LIVRAISONS & RETRAITS ================= */
AVIEWS.livraisons = {
  title: 'Livraisons',
  render(day = iso(new Date())) {
    const all = dayOrders(day).filter((o) => orderStatus(o).payment !== 'failed');
    const home = all.filter((o) => o.mode === 'home');
    const pick = all.filter((o) => o.mode === 'pickup');
    const portions = (l) => l.reduce((a, o) => a + o.lines.reduce((x, y) => x + y.qty, 0), 0);
    const slots = [...new Set(home.map((o) => o.slot.time))].sort();
    const zones = {};
    home.forEach((o) => { const z = postcodeOf(o.where); zones[z] = (zones[z] || 0) + 1; });
    const stop = (o, i) => {
      const s = orderStatus(o).status;
      return `<div class="stop ${s === 3 ? 'is-done' : ''}"><span class="stop__n">${i + 1}</span>
        <div class="stop__main"><strong><a href="#/commandes/${o.id}">${esc(o.customer)}</a></strong> <span class="muted small">· ${o.id}</span>
          <div class="small">${esc(o.where)}</div>
          <div class="small muted">${o.lines.reduce((a, l) => a + l.qty, 0)} portions · ${eur(o.total)}${o.phone ? ` · <a href="tel:${esc(o.phone.replace(/\s/g, ''))}">${esc(o.phone)}</a>` : ''}</div></div>
        <div class="no-print">${s < 2 ? `<span class="${STATUS[s][1]}">${statusLabel(o, s)}</span>` : s === 2 ? `<button class="btn btn--primary btn--xs" data-deliver="${o.id}">${o.mode === 'home' ? 'Livrée' : 'Récupérée'}</button>` : `<span class="st st--done">${statusLabel(o, s)}</span>`}</div></div>`;
    };
    return `<div class="print-only"><h2>Feuille de route — ${fmtDate(day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2></div>
      <div class="page-head no-print"><p class="page-head__text">Tournées de livraison par créneau (classées par code postal) et retraits par point de retrait.</p>
        <div class="page-head__actions"><button class="btn btn--ghost btn--sm" id="routeCsv">${icon('download')}Exporter</button><button class="btn btn--ghost btn--sm" onclick="window.print()">${icon('print')}Imprimer la feuille de route</button></div></div>
      <div class="no-print">${dayChips('lday', day)}</div>
      <section class="kpis kpis--4">
        ${kpi({ label: 'Livraisons à domicile', value: num(home.length), raw: home.length, ic: 'truck', tone: 'blue', sub: `${home.filter((o) => orderStatus(o).status === 3).length} effectuées` })}
        ${kpi({ label: 'Retraits sur place', value: num(pick.length), raw: pick.length, ic: 'pin', tone: 'saffron', sub: `${pick.filter((o) => orderStatus(o).status === 3).length} récupérés` })}
        ${kpi({ label: 'Portions à remettre', value: num(portions(all)), raw: portions(all), ic: 'box' })}
        ${kpi({ label: 'Valeur des commandes', value: eur(revenue(all)), raw: revenue(all), fmt: 'eur', ic: 'euro' })}
      </section>
      <div class="grid-dash">
        <div class="span-8">
          <h2 class="sec-title" style="margin-top:0">Livraisons à domicile</h2>
          ${slots.length ? slots.map((t) => { const l = home.filter((o) => o.slot.time === t).sort((a, b) => postcodeOf(a.where).localeCompare(postcodeOf(b.where))); return `<div class="slot-card"><div class="slot-card__head"><strong>${esc(t)}</strong><span class="small muted">${l.length} arrêt${l.length > 1 ? 's' : ''} · ${portions(l)} portions</span></div>${l.map(stop).join('')}</div>`; }).join('') : `<div class="panel">${emptyState('Aucune livraison', 'Aucune livraison à domicile ce jour-là.')}</div>`}
          <h2 class="sec-title">Retraits sur place</h2>
          ${ADM.delivery.pickupPoints.map((pt) => { const l = pick.filter((o) => o.where === pt.name).sort((a, b) => a.slot.time.localeCompare(b.slot.time)); return l.length ? `<div class="slot-card"><div class="slot-card__head"><span><strong>${esc(pt.name)}</strong><br><span class="small muted">${esc(pt.address)}</span></span><span class="small muted">${l.length} retrait${l.length > 1 ? 's' : ''}</span></div>${l.map((o, i) => stop({ ...o, where: o.slot.time }, i)).join('')}</div>` : ''; }).join('') || `<div class="panel">${emptyState('Aucun retrait', 'Aucun retrait sur place ce jour-là.')}</div>`}
        </div>
        <div class="span-4 no-print" style="display:grid;gap:18px;align-content:start">
          <div class="panel" style="margin:0"><div class="panel__head"><h3>Répartition par code postal</h3></div>${Object.keys(zones).length ? hbars(Object.entries(zones).sort((a, b) => b[1] - a[1]).map(([z, v]) => ({ label: z, value: v })), (v) => `${v} arrêt${v > 1 ? 's' : ''}`) : '<p class="muted small">—</p>'}</div>
          <div class="panel" style="margin:0"><div class="panel__head"><h3>Par créneau</h3></div>${hbars([...ADM.delivery.homeSlots.map((t) => ({ label: `Livraison ${t}`, value: home.filter((o) => o.slot.time === t).length })), ...ADM.delivery.pickupSlots.map((t) => ({ label: `Retrait ${t}`, value: pick.filter((o) => o.slot.time === t).length }))], (v) => `${v}`)}<p class="hint" style="margin:12px 0 0"><a class="link" href="#/livraison">Gérer les zones et créneaux →</a></p></div>
        </div>
      </div>`;
  },
  mount(day = iso(new Date())) {
    $$('[data-lday]').forEach((b) => b.addEventListener('click', () => { location.hash = `#/livraisons/${b.dataset.lday}`; }));
    $$('[data-deliver]').forEach((b) => b.addEventListener('click', () => {
      const o = DEMO.orders.find((x) => x.id === b.dataset.deliver);
      setOrderStatus(o, { status: 3 });
      saveAdmin(`${o.id} : ${o.mode === 'home' ? 'livrée' : 'récupérée'}`); rerender();
    }));
    $('#routeCsv').onclick = () => {
      const all = dayOrders(day).filter((o) => orderStatus(o).payment !== 'failed').sort((a, b) => `${a.mode}${a.slot.time}${postcodeOf(a.where)}`.localeCompare(`${b.mode}${b.slot.time}${postcodeOf(b.where)}`));
      downloadCsv(`tournee-${day}.csv`, [['Mode', 'Créneau', 'Commande', 'Client', 'Téléphone', 'Adresse / point', 'Code postal', 'Portions', 'Total', 'Statut'], ...all.map((o) => [o.mode === 'home' ? 'Livraison' : 'Retrait', o.slot.time, o.id, o.customer, o.phone, o.where, o.mode === 'home' ? postcodeOf(o.where) : '', o.lines.reduce((a, l) => a + l.qty, 0), csvNum(o.total), statusLabel(o)])]);
    };
  },
};
