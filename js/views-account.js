/* =========================================================
   PREP CLUB — Espace client, favoris, tunnel de commande
   ========================================================= */
'use strict';

/* ================= MY PREP CLUB ================= */
const ACCOUNT_TABS = [
  ['dashboard', 'Tableau de bord'], ['orders', 'Mes commandes'], ['planner', 'Mes plannings'], ['membership', 'Mon abonnement'],
  ['favorites', 'Mes favoris'], ['preferences', 'Mes préférences'], ['addresses', 'Mes adresses'], ['rewards', 'Mes récompenses'], ['settings', 'Paramètres du compte'],
];

VIEWS.account = {
  title: 'Mon PREP CLUB',
  render(tab = 'dashboard', extra) {
    if (!S.user) return authView();
    const t = ACCOUNT_TABS.find(([k]) => k === tab) ? tab : 'dashboard';
    return `<section class="page-hero page-hero--compact"><div class="container">
      <span class="eyebrow">Mon PREP CLUB</span><h1 style="font-size:clamp(2rem,4vw,2.8rem)">${t === 'dashboard' ? `Bonjour ${esc(S.user.first)} 👋` : ACCOUNT_TABS.find(([k]) => k === t)[1]}</h1>
    </div></section>
    <div class="container account">
      <nav class="acc-nav" aria-label="Espace client">
        ${ACCOUNT_TABS.map(([k, l]) => `<a href="#/mon-compte/${SUB_SLUGS[k]}" class="${k === t ? 'active' : ''}">${l}${k === 'rewards' ? `<span class="muted">${S.points} pts</span>` : ''}${k === 'favorites' && S.favorites.length ? `<span class="muted">${S.favorites.length}</span>` : ''}</a>`).join('')}
        <hr><a href="#/mon-compte" id="logout">Se déconnecter</a>
      </nav>
      <div id="accPanel">${ACCOUNT_RENDER[t](extra)}</div>
    </div>`;
  },
  mount(tab = 'dashboard', extra) {
    if (!S.user) return authMount();
    $('#logout').onclick = (e) => { e.preventDefault(); S.user = null; save(); toast('Vous êtes déconnecté·e'); router(); };
    const t = ACCOUNT_TABS.find(([k]) => k === tab) ? tab : 'dashboard';
    if (ACCOUNT_MOUNT[t]) ACCOUNT_MOUNT[t](extra);
  },
};

/* ---------- Connexion / création de compte ---------- */
function authView() {
  return `${pageHero({ eyebrow: 'Mon PREP CLUB', title: 'Votre espace personnel', text: 'Retrouvez vos commandes, plannings, favoris, préférences, abonnement et récompenses au même endroit.' })}
  <section class="section--tight"><div class="container">
    <div class="notice" style="margin-bottom:24px">Démonstration : aucune donnée n’est envoyée à un serveur et aucun vrai compte n’est créé. Utilisez des informations fictives ou le compte de démonstration ci-dessous ; le mot de passe n’est jamais enregistré.</div>
    <div class="grid g2">
      <form class="panel" id="loginForm">
        <h3>Se connecter</h3>
        <div class="field"><label for="lEmail">Adresse e-mail</label><input class="input" type="email" id="lEmail" name="email" required autocomplete="email"></div>
        <div class="field"><label for="lPass">Mot de passe</label><input class="input" type="password" id="lPass" name="password" required minlength="8" autocomplete="current-password"></div>
        <button class="btn btn--primary btn--block">Se connecter</button>
        <div class="center" style="margin-top:16px"><button type="button" class="linklike small" id="demoLogin">Explorer avec un compte de démonstration</button></div>
      </form>
      <form class="panel" id="registerForm">
        <h3>Créer un compte</h3>
        <div class="form-grid">
          <div class="field"><label for="rFirst">Prénom</label><input class="input" id="rFirst" name="first" required autocomplete="given-name"></div>
          <div class="field"><label for="rLast">Nom</label><input class="input" id="rLast" name="last" required autocomplete="family-name"></div>
        </div>
        <div class="field"><label for="rEmail">Adresse e-mail</label><input class="input" type="email" id="rEmail" name="email" required autocomplete="email"></div>
        <div class="field"><label for="rPass">Mot de passe <span class="muted small">(8 caractères minimum)</span></label><input class="input" type="password" id="rPass" name="password" required minlength="8" autocomplete="new-password"></div>
        <label class="check small" style="margin-bottom:10px"><input type="checkbox" name="cgv" required> J’accepte les <a href="#/cgv" class="link">conditions générales</a> et la <a href="#/confidentialite" class="link">politique de confidentialité</a>.</label>
        <label class="check small" style="margin-bottom:16px"><input type="checkbox" name="news"> Je souhaite recevoir La Prep de la Semaine (facultatif).</label>
        <button class="btn btn--dark btn--block">Créer mon compte</button>
      </form>
    </div>
  </div></section>`;
}
function authMount() {
  $('#loginForm').onsubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const first = email.split('@')[0].split(/[._-]/)[0];
    S.user = { first: first.charAt(0).toUpperCase() + first.slice(1), last: '', email, phone: '', since: iso(new Date()) };
    save();
    toast('Connexion réussie');
    router();
  };
  $('#registerForm').onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    S.user = { first: f.first.value.trim(), last: f.last.value.trim(), email: f.email.value.trim(), phone: '', since: iso(new Date()) };
    if (f.news.checked) { S.comms.newsletter = true; S.newsletter = S.user.email; }
    S.points += 50;
    S.pointsLog.unshift({ date: iso(new Date()), label: 'Bonus de bienvenue', pts: 50 });
    save();
    toast('Bienvenue au PREP CLUB ! 50 points offerts');
    router();
  };
  $('#demoLogin').onclick = () => {
    S.user = { first: 'Camille', last: 'Martin', email: 'camille.demo@prepclub.test', phone: '06 00 00 00 00', since: '2026-09-02' };
    seedDemoAccount();
    save();
    toast('Compte de démonstration chargé');
    router();
  };
}

const ACCOUNT_RENDER = {};
const ACCOUNT_MOUNT = {};

/* ---------- Tableau de bord ---------- */
ACCOUNT_RENDER.dashboard = () => {
  const active = S.orders.find((o) => o.status < 3);
  const last = S.orders[0];
  const tier = S.membership && MEMBERSHIPS.find((m) => m.id === S.membership.tier);
  const plan = planOf(plannerWeek);
  const st = planStats(plan);
  const recent = new Set(S.orders.flatMap((o) => o.lines.map((l) => l.pid)));
  const sugg = PRODUCTS.filter((p) => !recent.has(p.id) && matchesPrefs(p) && !allergyHits(p).length).slice(0, 3);
  return `<div class="grid g4" style="gap:14px">
      <div class="kpi"><small>Prochaine livraison</small><strong style="font-size:1.15rem">${active ? fmtDate(active.slot.day, { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}</strong><span class="small muted">${active ? active.slot.time : 'Aucune livraison prévue'}</span></div>
      <div class="kpi"><small>Dernière commande</small><strong style="font-size:1.15rem">${last ? last.id : '—'}</strong>${last ? `<span class="status ${orderStatusClass(last)}">${orderStatusLabel(last)}</span>` : '<span class="small muted">Pas encore de commande</span>'}</div>
      <div class="kpi"><small>Points fidélité</small><strong>${S.points}</strong><a href="#/mon-compte/recompenses" class="small link">Mes récompenses</a></div>
      <div class="kpi"><small>Abonnement</small><strong style="font-size:1.15rem">${tier ? tier.name : 'Aucun'}</strong><span class="small muted">${S.membership ? (S.membership.status === 'paused' ? 'En pause' : 'Actif') : '<a href="#/abonnement-club" class="link">Découvrir le Club</a>'}</span></div>
    </div>
    ${active ? `<div class="panel" style="margin-top:20px"><div class="row between"><h3 style="margin:0">Suivi de la commande ${active.id}</h3><a href="#/mon-compte/commandes/${active.id}" class="link small">Détails</a></div>${timelineHtml(active)}</div>` : ''}
    <div class="panel" style="margin-top:20px">
      <div class="row between"><h3 style="margin:0">Planning — semaine du ${fmtDate(plannerWeek, { day: 'numeric', month: 'long' })}</h3><a href="#/planning" class="btn btn--ghost btn--sm">Ouvrir le planning</a></div>
      ${st.count ? `<p class="muted" style="margin-top:10px">${st.count} repas planifiés · ${eur(st.sub)}</p>
        <div class="row" style="gap:8px">${Object.values(plan).filter(Boolean).slice(0, 8).map((id) => `<div class="media media--11" style="width:56px;border-radius:10px" title="${esc(P(id).name)}">${pic(P(id).img, P(id).name, 150)}</div>`).join('')}</div>`
        : `<p class="muted" style="margin-top:10px">Votre semaine n’est pas encore planifiée.</p><a href="#/planning" class="btn btn--primary btn--sm">Planifier ma semaine</a>`}
    </div>
    <div class="panel"><h3>Suggestions pour vous</h3><div class="grid g3">${sugg.map(productCard).join('')}</div></div>`;
};

/* ---------- My Orders ---------- */
ACCOUNT_RENDER.orders = (openId) => {
  if (!S.orders.length) return `<div class="empty-state"><h3>Aucune commande pour le moment</h3><p>Vos commandes apparaîtront ici avec leur suivi.</p><a href="#/carte" class="btn btn--primary">Découvrir la carte</a></div>`;
  return `<div class="panel">${S.orders.map((o) => `
    <div class="order-row">
      <div><strong>${o.id}</strong> ${o.demo ? '<span class="tag tag--line">démo</span>' : ''}<div class="small muted">${fmtDate(o.date)} · ${o.lines.reduce((a, l) => a + l.qty, 0)} articles · ${o.mode === 'home' ? 'Livraison' : 'Retrait sur place'}</div></div>
      <div><span class="status ${orderStatusClass(o)}">${orderStatusLabel(o)}</span></div>
      <div class="row" style="gap:8px"><strong>${eur(o.totals.total)}</strong><a href="#/mon-compte/commandes${openId === o.id ? '' : `/${o.id}`}" class="btn btn--ghost btn--sm">${openId === o.id ? 'Fermer' : 'Détails'}</a></div>
    </div>
    ${openId === o.id ? orderDetail(o) : ''}`).join('')}</div>`;
};
function orderDetail(o) {
  return `<div style="background:var(--cream);border-radius:14px;padding:20px;margin:8px 0 16px">
    ${timelineHtml(o)}
    ${o.status < 3 ? `<button class="btn btn--ghost btn--sm" data-advance="${o.id}" style="margin-bottom:12px">Simuler l’étape suivante (notification)</button>` : ''}
    <div class="grid g2" style="gap:20px">
      <div>${o.lines.map((l) => lineHtml(l, false)).join('')}</div>
      <div>
        <dl class="dl" style="grid-template-columns:120px 1fr;margin-bottom:16px">
          <dt>${o.mode === 'home' ? 'Livraison' : 'Retrait'}</dt><dd>${esc(o.where)}</dd>
          <dt>Créneau</dt><dd>${fmtDate(o.slot.day, { weekday: 'long', day: 'numeric', month: 'long' })}, ${o.slot.time}</dd>
          <dt>Paiement</dt><dd>${esc(o.payment)}</dd>
        </dl>
        <div class="totals">
          <div><span>Sous-total</span><span>${eur(o.totals.sub)}</span></div>
          ${o.totals.member ? `<div class="disc"><span>Remise Club</span><span>−${eur(o.totals.member)}</span></div>` : ''}
          ${o.totals.promo ? `<div class="disc"><span>Code promo</span><span>−${eur(o.totals.promo)}</span></div>` : ''}
          ${o.totals.reward ? `<div class="disc"><span>Récompense</span><span>−${eur(o.totals.reward)}</span></div>` : ''}
          <div><span>Livraison</span><span>${o.totals.delivery ? eur(o.totals.delivery) : 'Offerte'}</span></div>
          <div class="grand"><span>Total payé</span><span>${eur(o.totals.total)}</span></div>
        </div>
        <div class="row" style="margin-top:16px"><button class="btn btn--primary btn--sm" data-reorder="${o.id}">Recommander</button><button class="btn btn--ghost btn--sm" data-invoice="${o.id}">Télécharger la facture</button></div>
      </div>
    </div>
  </div>`;
}
ACCOUNT_MOUNT.orders = () => {
  $$('[data-reorder]').forEach((b) => b.onclick = () => {
    const o = S.orders.find((x) => x.id === b.dataset.reorder);
    o.lines.forEach((l) => {
      if (l.type === 'box') S.basket.push({ ...l, key: `box-${uid()}` });
      else addProduct(l.pid, l.qty, l.opts || {}, true);
    });
    save();
    toast('Commande ajoutée au panier');
    openDrawer();
  });
  $$('[data-invoice]').forEach((b) => b.onclick = () => downloadInvoice(S.orders.find((x) => x.id === b.dataset.invoice)));
  $$('[data-advance]').forEach((b) => b.onclick = () => {
    const o = S.orders.find((x) => x.id === b.dataset.advance);
    o.status = Math.min(3, o.status + 1);
    save();
    toast(`Notification : ${orderStatusLabel(o)}`);
    router();
  });
};
function downloadInvoice(o) {
  const rows = o.lines.map((l) => `<tr><td>${esc(l.name)}</td><td style="text-align:right">${l.qty}</td><td style="text-align:right">${eur(l.unit)}</td><td style="text-align:right">${eur(l.unit * l.qty)}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Facture ${o.id}</title><style>body{font-family:Inter,Arial,sans-serif;color:#2A2925;max-width:720px;margin:40px auto;padding:0 20px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #E3DACA;text-align:left}h1{font-family:Georgia,serif;font-weight:500}.r{text-align:right}</style></head><body>
    <h1>PREP CLUB</h1><p>Facture <strong>${o.id}</strong> — ${fmtDate(o.date)}<br>Client : ${esc(o.email)}</p>
    <table><thead><tr><th>Article</th><th class="r">Qté</th><th class="r">PU TTC</th><th class="r">Total TTC</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="r">Sous-total : ${eur(o.totals.sub)}<br>Remises : −${eur(o.totals.member + o.totals.promo + o.totals.reward)}<br>Livraison : ${eur(o.totals.delivery)}<br><strong>Total TTC : ${eur(o.totals.total)}</strong></p>
    <p style="font-size:12px;color:#6F665B">Facture fictive générée par la démonstration PREP CLUB (projet étudiant INSEEC) : aucune vente réelle, aucun paiement encaissé.</p></body></html>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  a.download = `facture-${o.id}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- My Weekly Planner ---------- */
ACCOUNT_RENDER.planner = () => {
  const plan = planOf(plannerWeek);
  const st = planStats(plan);
  return `<div class="panel">
      <div class="row between"><h3 style="margin:0">Semaine en cours de préparation</h3><a href="#/planning" class="btn btn--primary btn--sm">Ouvrir le planning</a></div>
      <p class="muted" style="margin-top:8px">Semaine du ${fmtDate(plannerWeek, { day: 'numeric', month: 'long' })} · ${st.count} repas · ${eur(st.sub)}</p>
      <div class="row"><button class="btn btn--ghost btn--sm" id="newWeek">Préparer une nouvelle semaine</button>${st.count ? '<button class="btn btn--ghost btn--sm" id="curToBasket">Transformer en panier</button>' : ''}</div>
    </div>
    <div class="panel"><h3>Plannings sauvegardés</h3>
      ${S.savedPlanners.length ? S.savedPlanners.map((sp) => {
        const s = planStats(sp.slots);
        return `<div class="order-row"><div><strong>${esc(sp.name)}</strong><div class="small muted">Sauvegardé le ${fmtDate(sp.savedAt)} · ${s.count} repas · ${eur(s.sub)}</div></div>
          <div class="row" style="gap:6px">${Object.values(sp.slots).slice(0, 5).map((id) => `<div class="media media--11" style="width:36px;border-radius:8px">${pic(P(id).img, '', 100)}</div>`).join('')}</div>
          <div class="row" style="gap:6px"><button class="btn btn--ghost btn--sm" data-reuse="${sp.id}">Réutiliser</button><button class="btn btn--primary btn--sm" data-sp-basket="${sp.id}">Au panier</button><button class="remove" data-sp-del="${sp.id}">Supprimer</button></div></div>`;
      }).join('') : '<p class="muted">Aucun planning sauvegardé. Depuis le planning de la semaine, cliquez sur « Sauvegarder ce planning ».</p>'}
    </div>`;
};
ACCOUNT_MOUNT.planner = () => {
  $('#newWeek').onclick = () => {
    let w = fromIso(plannerWeek);
    while (Object.keys(planOf(iso(w))).length) w = addDays(w, 7);
    plannerWeek = iso(w);
    location.hash = '#/planning';
  };
  if ($('#curToBasket')) $('#curToBasket').onclick = () => { planToBasket(planOf(plannerWeek)); openDrawer(); };
  $$('[data-reuse]').forEach((b) => b.onclick = () => {
    const sp = S.savedPlanners.find((x) => x.id === b.dataset.reuse);
    S.plans[plannerWeek] = { ...sp.slots };
    save();
    toast(`« ${sp.name} » chargé dans la semaine du ${fmtDate(plannerWeek, { day: 'numeric', month: 'long' })}`);
    location.hash = '#/planning';
  });
  $$('[data-sp-basket]').forEach((b) => b.onclick = () => { planToBasket(S.savedPlanners.find((x) => x.id === b.dataset.spBasket).slots); openDrawer(); });
  $$('[data-sp-del]').forEach((b) => b.onclick = () => { S.savedPlanners = S.savedPlanners.filter((x) => x.id !== b.dataset.spDel); save(); router(); });
};

/* ---------- My Membership ---------- */
ACCOUNT_RENDER.membership = () => {
  const m = S.membership;
  if (!m) return `<div class="panel"><h3>Vous n’avez pas d’abonnement</h3><p class="muted">L’abonnement Club est facultatif : vous pouvez continuer à commander librement sans abonnement. Si vous commandez régulièrement, il vous fait économiser sur chaque commande.</p></div>
    <div class="grid g3" style="margin-top:20px">${MEMBERSHIPS.map((t) => tierCard(t, true)).join('')}</div>`;
  const t = MEMBERSHIPS.find((x) => x.id === m.tier);
  return `<div class="panel">
    <div class="row between"><div><span class="eyebrow">Le Club</span><h2 style="margin:0">${t.name}</h2></div><span class="status ${m.status === 'paused' ? 'status--paused' : ''}">${m.status === 'paused' ? `En pause jusqu’au ${fmtDate(m.pausedUntil)}` : 'Actif'}</span></div>
    <div class="grid g3" style="margin:20px 0;gap:14px">
      <div class="kpi"><small>Tarif</small><strong>${eur(t.price)}</strong><span class="small muted">par mois</span></div>
      <div class="kpi"><small>Prochaine échéance</small><strong style="font-size:1.2rem">${fmtDate(m.nextBilling)}</strong><span class="small muted">${m.status === 'paused' ? 'reportée pendant la pause' : 'renouvellement automatique'}</span></div>
      <div class="kpi"><small>Membre depuis</small><strong style="font-size:1.2rem">${fmtDate(m.since)}</strong></div>
    </div>
    <h4>Vos avantages</h4><ul>${t.perks.map((p) => `<li>${p}</li>`).join('')}</ul>
  </div>
  <div class="panel"><h3>Gérer mon abonnement</h3>
    <div class="grid g3" style="gap:16px">
      <div><div class="label">Modifier mon offre</div><select class="input" id="mTier" style="margin:8px 0">${MEMBERSHIPS.map((x) => `<option value="${x.id}" ${x.id === m.tier ? 'selected' : ''}>${x.name} — ${eur(x.price)}/mois</option>`).join('')}</select><button class="btn btn--dark btn--sm" id="mChange">Changer d’offre</button></div>
      <div><div class="label">Suspendre temporairement</div>${m.status === 'paused' ? '<p class="small muted" style="margin:8px 0">Votre abonnement est en pause.</p><button class="btn btn--dark btn--sm" id="mResume">Reprendre maintenant</button>' : `<select class="input" id="mPause" style="margin:8px 0"><option value="1">1 semaine</option><option value="2">2 semaines</option><option value="4">1 mois</option><option value="8">2 mois</option></select><button class="btn btn--dark btn--sm" id="mPauseBtn">Mettre en pause</button>`}</div>
      <div><div class="label">Résilier</div><p class="small muted" style="margin:8px 0">Sans frais. Vos avantages restent actifs jusqu’au ${fmtDate(m.nextBilling)}.</p><button class="btn btn--ghost btn--sm" id="mCancel">Résilier mon abonnement</button></div>
    </div>
  </div>
  <div class="panel"><h3>Conditions de renouvellement</h3>
    <p class="small muted">L’abonnement est renouvelé automatiquement chaque mois à date anniversaire, au tarif en vigueur. Un e-mail de rappel est envoyé 7 jours avant chaque échéance. Vous pouvez suspendre (jusqu’à 2 mois) ou résilier à tout moment depuis cet espace ; la résiliation prend effet à la fin de la période en cours, sans frais. Les prélèvements récurrents ne concernent que l’abonnement souscrit explicitement.</p>
  </div>`;
};
ACCOUNT_MOUNT.membership = () => {
  if (!S.membership) return;
  $('#mChange').onclick = () => {
    const id = $('#mTier').value;
    if (id === S.membership.tier) return;
    S.membership.tier = id;
    save();
    toast(`Offre modifiée : ${MEMBERSHIPS.find((x) => x.id === id).name}, applicable dès maintenant`);
    router();
  };
  if ($('#mPauseBtn')) $('#mPauseBtn').onclick = () => {
    const w = Number($('#mPause').value);
    S.membership.status = 'paused';
    S.membership.pausedUntil = iso(addDays(new Date(), w * 7));
    S.membership.nextBilling = iso(addDays(fromIso(S.membership.nextBilling), w * 7));
    save();
    toast('Abonnement mis en pause');
    router();
  };
  if ($('#mResume')) $('#mResume').onclick = () => { S.membership.status = 'active'; delete S.membership.pausedUntil; save(); toast('Abonnement réactivé'); router(); };
  $('#mCancel').onclick = () => confirmModal('Résilier votre abonnement ?', `Vos avantages restent actifs jusqu’au ${fmtDate(S.membership.nextBilling)}, puis l’abonnement ne sera pas renouvelé. Vous pourrez toujours commander sans abonnement.`, 'Confirmer la résiliation', () => {
    S.membership = null;
    save();
    toast('Abonnement résilié — confirmation envoyée par e-mail');
    router();
  });
};
function subscribeModal(id) {
  const t = MEMBERSHIPS.find((x) => x.id === id);
  if (!S.user) { toast('Connectez-vous pour rejoindre le Club'); location.hash = '#/mon-compte'; return; }
  openModal(`<span class="eyebrow">L’abonnement Club</span><h3>Souscrire à l’offre ${t.name}</h3>
    <ul>${t.perks.map((p) => `<li>${p}</li>`).join('')}</ul>
    <div class="notice"><strong>${eur(t.price)} / mois</strong>, renouvelé automatiquement chaque mois. Suspendable et résiliable à tout moment depuis Mon abonnement, sans frais.</div>
    <label class="check small" style="margin:14px 0"><input type="checkbox" id="subOk"> J’ai lu et j’accepte les conditions de renouvellement et de résiliation de l’abonnement.</label>
    <p class="small muted">Paiement récurrent via notre prestataire sécurisé (simulation dans ce prototype).</p>
    <div class="row" style="justify-content:flex-end"><button class="btn btn--ghost" data-close-modal>Annuler</button><button class="btn btn--primary" id="subGo" disabled>Confirmer · ${eur(t.price)}/mois</button></div>`, (panel) => {
    $('#subOk', panel).onchange = (e) => { $('#subGo', panel).disabled = !e.target.checked; };
    $('#subGo', panel).onclick = () => {
      S.membership = { tier: id, status: 'active', since: iso(new Date()), nextBilling: iso(addDays(new Date(), 30)) };
      save();
      closeModal();
      toast(`Bienvenue dans le Club ${t.name} !`);
      location.hash = '#/mon-compte/abonnement';
      router();
    };
  });
}

/* ---------- My Favorites ---------- */
ACCOUNT_RENDER.favorites = () => {
  const favs = S.favorites.map(P).filter(Boolean);
  return favs.length ? `<div class="row between" style="margin-bottom:16px"><span class="muted">${favs.length} produit${favs.length > 1 ? 's' : ''}</span><button class="btn btn--primary btn--sm" id="favAll">Tout ajouter au panier</button></div><div class="grid g3">${favs.map(productCard).join('')}</div>`
    : `<div class="empty-state"><h3>Aucun favori</h3><p>Touchez le ♡ sur un produit pour le retrouver ici.</p><a href="#/carte" class="btn btn--primary">Découvrir la carte</a></div>`;
};
ACCOUNT_MOUNT.favorites = () => { if ($('#favAll')) $('#favAll').onclick = () => { S.favorites.forEach((id) => addProduct(id, 1, {}, true)); toast('Favoris ajoutés au panier'); openDrawer(); }; };

/* ---------- My Preferences ---------- */
ACCOUNT_RENDER.preferences = () => {
  const pr = S.prefs;
  return `<form class="panel" id="prefForm">
    <h3>Préférences alimentaires</h3>
    <div class="label" style="margin-bottom:8px">Régime</div>
    <div class="opt-group" style="margin-bottom:18px">${[['none', 'Aucun en particulier'], ['vegetarian', 'Végétarien'], ['vegan', 'Végan']].map(([k, l]) => `<label class="opt"><input type="radio" name="diet" value="${k}" ${pr.diet === k ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
    <div class="form-grid">
      <div class="field"><label for="pfLikes">Ingrédients appréciés</label><input class="input" id="pfLikes" name="likes" value="${esc(pr.likes)}" placeholder="ex. saumon, courge, pesto"></div>
      <div class="field"><label for="pfDislikes">Ingrédients non appréciés</label><input class="input" id="pfDislikes" name="dislikes" value="${esc(pr.dislikes)}" placeholder="ex. coriandre, champignons"></div>
    </div>
    <div class="label" style="margin-bottom:8px">Repas que je souhaite planifier</div>
    <div class="row" style="margin-bottom:18px">${SLOTS.map((s) => `<label class="check"><input type="checkbox" name="meals" value="${s.id}" ${pr.meals.includes(s.id) ? 'checked' : ''}> ${s.label}</label>`).join('')}</div>
    <div class="label" style="margin-bottom:8px">Taille de portion préférée</div>
    <div class="opt-group" style="margin-bottom:18px">${[['classic', 'Classique'], ['generous', 'Généreuse']].map(([k, l]) => `<label class="opt"><input type="radio" name="portion" value="${k}" ${pr.portion === k ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
    <label class="check" style="margin-bottom:18px"><input type="checkbox" name="apply" ${pr.apply ? 'checked' : ''}> Filtrer automatiquement la carte selon mes préférences</label>
    <button class="btn btn--primary">Enregistrer mes préférences</button>
  </form>

  <form class="panel secure" id="allergyForm">
    <h4>🔒 Allergies et intolérances — espace sécurisé</h4>
    <p class="small muted">Ces informations sont des données de santé. Elles sont facultatives, servent uniquement à vous <strong>alerter</strong> lorsqu’un plat contient un allergène déclaré, et ne sont jamais utilisées à des fins marketing. Elles ne garantissent pas l’absence d’allergène : nos plats sont préparés dans un atelier manipulant les 14 allergènes réglementaires — consultez toujours la fiche produit.</p>
    <label class="check small" style="margin:12px 0"><input type="checkbox" name="consent" id="alConsent" ${pr.allergyConsent ? 'checked' : ''}> J’accepte explicitement que PREP CLUB traite ces données de santé pour m’afficher des alertes. Je peux retirer ce consentement à tout moment.</label>
    <fieldset id="alList" ${pr.allergyConsent ? '' : 'disabled'} style="border:0;padding:0;margin:0 0 16px;opacity:${pr.allergyConsent ? 1 : 0.5}">
      <div class="row">${ALLERGENS.map((a) => `<label class="check small" style="min-width:150px"><input type="checkbox" name="allergies" value="${a}" ${pr.allergies.includes(a) ? 'checked' : ''}> ${a}</label>`).join('')}</div>
    </fieldset>
    <div class="row"><button class="btn btn--dark btn--sm">Enregistrer</button><button type="button" class="btn btn--ghost btn--sm" id="alDelete">Supprimer mes données d’allergies</button></div>
  </form>`;
};
ACCOUNT_MOUNT.preferences = () => {
  $('#prefForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    Object.assign(S.prefs, { diet: fd.get('diet'), likes: fd.get('likes'), dislikes: fd.get('dislikes'), meals: fd.getAll('meals'), portion: fd.get('portion'), apply: fd.get('apply') === 'on' });
    save();
    toast('Préférences enregistrées');
  };
  $('#alConsent').onchange = (e) => { $('#alList').disabled = !e.target.checked; $('#alList').style.opacity = e.target.checked ? 1 : 0.5; };
  $('#allergyForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    S.prefs.allergyConsent = fd.get('consent') === 'on';
    S.prefs.allergies = S.prefs.allergyConsent ? fd.getAll('allergies') : [];
    save();
    toast(S.prefs.allergyConsent ? 'Allergies enregistrées — alertes activées' : 'Aucune donnée d’allergie conservée');
  };
  $('#alDelete').onclick = () => { S.prefs.allergyConsent = false; S.prefs.allergies = []; save(); toast('Données d’allergies supprimées'); router(); };
};

/* ---------- My Addresses ---------- */
function inZone(cp) { return DELIVERY.zones.includes(String(cp).trim()); }
ACCOUNT_RENDER.addresses = () => `<div class="panel"><h3>Adresses de livraison</h3>
    ${S.addresses.length ? S.addresses.map((a) => `<div class="order-row"><div><strong>${esc(a.label)}</strong> ${a.def ? '<span class="tag tag--line">par défaut</span>' : ''}<div class="small muted">${esc(a.name)} · ${esc(a.street)}, ${esc(a.postcode)} ${esc(a.city)}${a.notes ? ` · ${esc(a.notes)}` : ''}</div>${inZone(a.postcode) ? '' : '<div class="small" style="color:var(--danger)">Hors zone de livraison actuelle</div>'}</div><div></div>
      <div class="row" style="gap:8px">${a.def ? '' : `<button class="btn btn--ghost btn--sm" data-adef="${a.id}">Par défaut</button>`}<button class="remove" data-adel="${a.id}">Supprimer</button></div></div>`).join('') : '<p class="muted">Aucune adresse enregistrée.</p>'}
  </div>
  <form class="panel" id="addrForm"><h3>Ajouter une adresse</h3>${addressFields()}<button class="btn btn--primary">Enregistrer l’adresse</button></form>`;
function addressFields(prefix = 'a') {
  return `<div class="form-grid">
    <div class="field"><label for="${prefix}Label">Nom de l’adresse</label><input class="input" id="${prefix}Label" name="label" placeholder="Domicile, Bureau…" required></div>
    <div class="field"><label for="${prefix}Name">Destinataire</label><input class="input" id="${prefix}Name" name="name" required autocomplete="name"></div>
  </div>
  <div class="field"><label for="${prefix}Street">Adresse</label><input class="input" id="${prefix}Street" name="street" required autocomplete="street-address"></div>
  <div class="form-grid">
    <div class="field"><label for="${prefix}Cp">Code postal</label><input class="input" id="${prefix}Cp" name="postcode" required inputmode="numeric" maxlength="5" autocomplete="postal-code"><span class="small" data-zone></span></div>
    <div class="field"><label for="${prefix}City">Ville</label><input class="input" id="${prefix}City" name="city" required autocomplete="address-level2"></div>
  </div>
  <div class="form-grid">
    <div class="field"><label for="${prefix}Phone">Téléphone</label><input class="input" id="${prefix}Phone" name="phone" type="tel" autocomplete="tel"></div>
    <div class="field"><label for="${prefix}Notes">Instructions (digicode, étage…)</label><input class="input" id="${prefix}Notes" name="notes"></div>
  </div>`;
}
function bindZoneCheck(root) {
  const cp = $('input[name="postcode"]', root);
  const out = $('[data-zone]', root);
  if (!cp) return;
  cp.addEventListener('input', () => {
    if (cp.value.length < 5) { out.textContent = ''; return; }
    out.textContent = inZone(cp.value) ? '✓ Nous livrons à cette adresse' : '✕ Hors zone de livraison — retrait sur place disponible';
    out.style.color = inZone(cp.value) ? 'var(--olive)' : 'var(--danger)';
  });
}
ACCOUNT_MOUNT.addresses = () => {
  bindZoneCheck($('#addrForm'));
  $('#addrForm').onsubmit = (e) => {
    e.preventDefault();
    const a = Object.fromEntries(new FormData(e.target));
    a.id = uid();
    a.def = !S.addresses.length;
    S.addresses.push(a);
    save();
    toast('Adresse enregistrée');
    router();
  };
  $$('[data-adel]').forEach((b) => b.onclick = () => { S.addresses = S.addresses.filter((a) => a.id !== b.dataset.adel); if (S.addresses.length && !S.addresses.some((a) => a.def)) S.addresses[0].def = true; save(); router(); });
  $$('[data-adef]').forEach((b) => b.onclick = () => { S.addresses.forEach((a) => { a.def = a.id === b.dataset.adef; }); save(); router(); });
};

/* ---------- My Rewards ---------- */
ACCOUNT_RENDER.rewards = () => {
  const next = REWARDS.find((r) => r.points > S.points);
  const code = `PREP-${(S.user.first || 'CLUB').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)}${String(S.user.email.length * 37).slice(-2)}`;
  return `<div class="grid g2" style="gap:20px">
    <div class="kpi" style="padding:28px"><small>Mon solde</small><strong style="font-size:2.6rem">${S.points} pts</strong>
      ${next ? `<div class="progress"><div style="width:${(S.points / next.points) * 100}%"></div></div><span class="small muted">Plus que ${next.points - S.points} pts pour « ${next.label} »</span>` : '<span class="small muted">Toutes les récompenses sont débloquées !</span>'}
    </div>
    <div class="kpi" style="padding:28px"><small>Mon multiplicateur</small><strong style="font-size:2.6rem">×${pointsMultiplier()}</strong><span class="small muted">1 € dépensé = ${pointsMultiplier()} point${pointsMultiplier() > 1 ? 's' : ''}${memberTier() ? ` (avantage Club ${memberTier().name})` : ''}</span></div>
  </div>
  <div class="panel" style="margin-top:20px"><h3>Récompenses disponibles</h3>
    ${S.reward ? `<div class="notice notice--ok">Récompense en attente dans votre panier : ${esc(S.reward.label)}</div>` : ''}
    ${REWARDS.map((r) => `<div class="order-row"><div><strong>${r.label}</strong><div class="small muted">${r.points} points</div></div><div></div><button class="btn ${S.points >= r.points && !S.reward ? 'btn--primary' : 'btn--ghost'} btn--sm" data-redeem="${r.id}" ${S.points >= r.points && !S.reward ? '' : 'disabled'}>Utiliser</button></div>`).join('')}
  </div>
  <div class="panel"><h3>Parrainage</h3>
    <p class="muted">Offrez 10 € à un proche sur sa première commande (dès 40 €) et recevez 100 points quand il commande.</p>
    <div class="inline-field" style="max-width:420px"><input value="${code}" readonly aria-label="Code de parrainage" id="refCode"><button class="btn btn--dark btn--sm" id="copyRef">Copier</button></div>
    <p class="small muted" style="margin-top:8px"><a href="#/parrainage" class="link">Voir le programme de parrainage</a> : 10 € offerts au filleul sur sa première commande, 100 points pour vous.</p>
  </div>
  <div class="panel"><h3>Historique</h3>${S.pointsLog.length ? `<table class="data"><tbody>${S.pointsLog.map((l) => `<tr><td>${fmtDate(l.date)}</td><td>${esc(l.label)}</td><td class="num" style="color:${l.pts > 0 ? 'var(--olive)' : 'var(--danger)'}">${l.pts > 0 ? '+' : ''}${l.pts}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Aucun mouvement de points.</p>'}</div>`;
};
ACCOUNT_MOUNT.rewards = () => {
  $$('[data-redeem]').forEach((b) => b.onclick = () => {
    const r = REWARDS.find((x) => x.id === b.dataset.redeem);
    S.points -= r.points;
    S.reward = { label: r.label, value: r.value, points: r.points };
    S.pointsLog.unshift({ date: iso(new Date()), label: `Récompense : ${r.label}`, pts: -r.points });
    save();
    toast('Récompense appliquée à votre panier');
    router();
  });
  $('#copyRef').onclick = () => {
    const v = $('#refCode').value;
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast('Code copié'), () => { $('#refCode').select(); toast('Sélectionnez puis copiez le code'); });
  };
};

/* ---------- Account Settings ---------- */
ACCOUNT_RENDER.settings = () => `
  <form class="panel" id="infoForm"><h3>Informations personnelles</h3>
    <div class="form-grid">
      <div class="field"><label for="sFirst">Prénom</label><input class="input" id="sFirst" name="first" value="${esc(S.user.first)}" required></div>
      <div class="field"><label for="sLast">Nom</label><input class="input" id="sLast" name="last" value="${esc(S.user.last)}"></div>
      <div class="field"><label for="sEmail">Adresse e-mail</label><input class="input" type="email" id="sEmail" name="email" value="${esc(S.user.email)}" required></div>
      <div class="field"><label for="sPhone">Téléphone</label><input class="input" type="tel" id="sPhone" name="phone" value="${esc(S.user.phone)}"></div>
    </div>
    <button class="btn btn--primary btn--sm">Enregistrer</button>
  </form>
  <form class="panel" id="pwdForm"><h3>Mot de passe</h3>
    <div class="form-grid">
      <div class="field"><label for="pOld">Mot de passe actuel</label><input class="input" type="password" id="pOld" required autocomplete="current-password"></div>
      <div class="field"><label for="pNew">Nouveau mot de passe</label><input class="input" type="password" id="pNew" required minlength="8" autocomplete="new-password"></div>
    </div>
    <button class="btn btn--dark btn--sm">Modifier le mot de passe</button>
  </form>
  <div class="panel"><h3>Moyens de paiement</h3>
    <p class="muted small">Vos cartes et portefeuilles (Apple Pay, Google Pay) sont enregistrés directement chez notre prestataire de paiement certifié PCI-DSS. PREP CLUB ne stocke jamais vos numéros de carte.</p>
    <p class="small">Aucun moyen de paiement enregistré.</p>
  </div>
  <form class="panel" id="commsForm"><h3>Préférences de communication & consentements</h3>
    <label class="check" style="margin-bottom:10px"><input type="checkbox" name="newsletter" ${S.comms.newsletter ? 'checked' : ''}> Lettre d’information La Prep de la Semaine (hebdomadaire)</label>
    <label class="check" style="margin-bottom:10px"><input type="checkbox" name="offers" ${S.comms.offers ? 'checked' : ''}> Offres personnalisées et nouveautés par e-mail</label>
    <label class="check" style="margin-bottom:10px"><input type="checkbox" name="sms" ${S.comms.sms ? 'checked' : ''}> Notifications de livraison par SMS</label>
    <label class="check" style="margin-bottom:16px;opacity:.7"><input type="checkbox" checked disabled> E-mails liés à vos commandes (obligatoires)</label>
    <button class="btn btn--primary btn--sm">Enregistrer</button>
  </form>
  <div class="panel"><h3>Mes données personnelles</h3>
    <p class="muted small">Conformément au RGPD, vous pouvez accéder à vos données, les exporter ou demander leur suppression.</p>
    <div class="row"><button class="btn btn--ghost btn--sm" id="exportData">Télécharger mes données</button><button class="btn btn--ghost btn--sm" id="deleteAcc" style="color:var(--danger)">Supprimer mon compte</button></div>
  </div>`;
ACCOUNT_MOUNT.settings = () => {
  $('#infoForm').onsubmit = (e) => { e.preventDefault(); Object.assign(S.user, Object.fromEntries(new FormData(e.target))); save(); toast('Informations mises à jour'); };
  $('#pwdForm').onsubmit = (e) => { e.preventDefault(); e.target.reset(); toast('Mot de passe modifié (simulation)'); };
  $('#commsForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    S.comms = { newsletter: fd.get('newsletter') === 'on', offers: fd.get('offers') === 'on', sms: fd.get('sms') === 'on' };
    S.newsletter = S.comms.newsletter ? S.user.email : null;
    save();
    toast('Préférences de communication enregistrées');
  };
  $('#exportData').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
    a.download = 'mes-donnees-prepclub.json';
    a.click();
  };
  $('#deleteAcc').onclick = () => confirmModal('Supprimer votre compte ?', 'Toutes vos données (commandes, plannings, préférences, points) seront supprimées de ce navigateur. Cette action est définitive.', 'Supprimer définitivement', () => {
    const cookie = S.cookie;
    S = defaultState();
    S.cookie = cookie;
    save();
    renderDrawer();
    toast('Compte supprimé');
    location.hash = '#/';
  });
};

/* ================= FAVORIS (page publique) ================= */
VIEWS.favorites = {
  title: 'Mes favoris — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Mes favoris', title: 'Vos plats préférés', text: 'Retrouvez ici les produits que vous avez sauvegardés.', crumbs: 'Mes favoris' })}
    <section class="section--tight"><div class="container">${ACCOUNT_RENDER.favorites()}</div></section>`;
  },
  mount() { ACCOUNT_MOUNT.favorites(); },
};

/* ================= CHECKOUT ================= */
const co = { mode: 'home', addressId: null, pickup: DELIVERY.pickupPoints[0].id, day: null, slot: null, pay: 'card' };
function slotDays() {
  const out = [];
  let d = addDays(new Date(), 1);
  while (out.length < 6) {
    if (d.getDay() !== 0) out.push(iso(d));
    d = addDays(d, 1);
  }
  return out;
}
function slotCapacity(day, slot) {
  let h = 0;
  for (const c of day + slot) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h % 9;
}
VIEWS.checkout = {
  title: 'Commande — PREP CLUB',
  render() {
    if (!S.basket.length) return `${pageHero({ title: 'Votre panier est vide', text: 'Ajoutez des plats, une formule ou une box pour passer commande.' })}<section class="section--tight"><div class="container"><a href="#/carte" class="btn btn--primary">Découvrir la carte</a></div></section>`;
    const days = slotDays();
    if (!co.day || !days.includes(co.day)) co.day = days[0];
    const def = S.addresses.find((a) => a.def);
    if (S.user && def && !co.addressId) co.addressId = def.id;
    const t = totals(co.mode);
    const slots = co.mode === 'home' ? DELIVERY.homeSlots : DELIVERY.pickupSlots;
    return `<section class="page-hero page-hero--compact"><div class="container"><div class="crumbs"><a href="#/">Accueil</a> / Commande</div><h1 style="font-size:clamp(2rem,4vw,2.6rem)">Finaliser ma commande</h1></div></section>
    <div class="container checkout">
      <div>
        <div class="co-step"><h3><span>1</span>Récapitulatif</h3>
          ${S.basket.map((l) => lineHtml(l)).join('')}
        </div>

        <div class="co-step"><h3><span>2</span>Livraison ou retrait sur place</h3>
          <div class="mode-cards">
            <button class="mode-card ${co.mode === 'home' ? 'sel' : ''}" data-mode="home"><strong>Livraison à domicile</strong><span>${eur(DELIVERY.homeFee)} · offerte dès ${DELIVERY.freeFrom} €${t.tier && t.tier.freeDelivery ? ` (dès ${DELIVERY.premiumFreeFrom} € pour vous)` : ''}</span></button>
            <button class="mode-card ${co.mode === 'pickup' ? 'sel' : ''}" data-mode="pickup"><strong>Retrait sur place</strong><span>Gratuit · ${DELIVERY.pickupPoints.length} points de retrait à Lyon</span></button>
          </div>
          ${co.mode === 'home' ? `
            ${S.user && S.addresses.length ? `<div class="stack" style="margin-bottom:12px">${S.addresses.map((a) => `<label class="check"><input type="radio" name="addr" value="${a.id}" ${co.addressId === a.id ? 'checked' : ''}> <span><strong>${esc(a.label)}</strong> — ${esc(a.street)}, ${esc(a.postcode)} ${esc(a.city)} ${inZone(a.postcode) ? '' : '<span style="color:var(--danger)">(hors zone)</span>'}</span></label>`).join('')}<label class="check"><input type="radio" name="addr" value="new" ${co.addressId === 'new' ? 'checked' : ''}> Nouvelle adresse</label></div>` : ''}
            <form id="coAddr" class="${S.user && S.addresses.length && co.addressId !== 'new' ? 'hidden' : ''}">${addressFields('co')}</form>`
          : `<div class="stack">${DELIVERY.pickupPoints.map((p) => `<label class="check"><input type="radio" name="pickup" value="${p.id}" ${co.pickup === p.id ? 'checked' : ''}> <span><strong>${esc(p.name)}</strong><br><span class="small muted">${esc(p.address)}</span></span></label>`).join('')}</div>`}
        </div>

        <div class="co-step"><h3><span>3</span>Créneau ${co.mode === 'home' ? 'de livraison' : 'de retrait'}</h3>
          <div class="day-tabs">${days.map((d) => `<button class="${co.day === d ? 'sel' : ''}" data-day="${d}">${fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })}</button>`).join('')}</div>
          <div class="slots">${slots.map((s) => {
            const cap = slotCapacity(co.day, s);
            return `<button class="slot ${co.slot === s ? 'sel' : ''}" data-slot="${s}" ${cap === 0 ? 'disabled' : ''}>${s}<small>${cap === 0 ? 'Complet' : cap <= 2 ? `Plus que ${cap} place${cap > 1 ? 's' : ''}` : 'Disponible'}</small></button>`;
          }).join('')}</div>
          <p class="small muted" style="margin-top:10px">Créneaux calculés selon notre capacité de préparation et de livraison. Commande possible jusqu’à la veille, 20 h.</p>
        </div>

        <div class="co-step"><h3><span>4</span>Vos coordonnées</h3>
          ${S.user ? `<p>Connecté·e en tant que <strong>${esc(S.user.first)} ${esc(S.user.last)}</strong> (${esc(S.user.email)}).</p>` : `
            <p class="small muted">Commandez sans compte, ou <a href="#/mon-compte" class="link">connectez-vous</a> pour retrouver vos adresses et cumuler des points.</p>
            <div class="form-grid">
              <div class="field"><label for="coEmail">Adresse e-mail</label><input class="input" type="email" id="coEmail" required autocomplete="email"></div>
              <div class="field"><label for="coFirst">Prénom</label><input class="input" id="coFirst" required autocomplete="given-name"></div>
            </div>
            <label class="check small"><input type="checkbox" id="coCreate"> Créer un compte pour suivre ma commande et gagner des points (facultatif)</label>`}
        </div>

        <div class="co-step"><h3><span>5</span>Paiement sécurisé</h3>
          <div class="pay-methods">${[['card', 'Carte bancaire'], ['apple', 'Apple Pay'], ['google', 'Google Pay']].map(([k, l]) => `<button class="mode-card ${co.pay === k ? 'sel' : ''}" data-pay="${k}"><strong style="font-size:1rem">${l}</strong></button>`).join('')}</div>
          <div class="notice">🔒 Le paiement est traité par notre prestataire certifié (redirection sécurisée 3-D Secure). Aucune donnée bancaire ne transite par PREP CLUB. <strong>Démonstration : le paiement est simulé, aucune carte n’est demandée et aucune somme n’est débitée.</strong></div>
          <label class="check small" style="margin:14px 0"><input type="checkbox" id="coCgv"> J’accepte les <a href="#/cgv" class="link">conditions générales de vente</a>. Je reconnais que, s’agissant de denrées périssables, le droit de rétractation ne s’applique pas.</label>
          <div id="coErr" class="notice notice--warn hidden"></div>
          <button class="btn btn--primary btn--block" id="coPay">Payer ${eur(t.total)}</button>
        </div>
      </div>

      <aside class="summary">
        <h3>Total</h3>
        ${totalsHtml(t, co.mode)}
        <form class="inline-field" id="coPromo" style="margin-top:16px"><input name="code" placeholder="Code promo" aria-label="Code promo" value="${esc(S.promo || '')}"><button class="btn btn--dark btn--sm">OK</button></form>
        ${!t.tier ? '<div class="notice">Les membres du Club économisent jusqu’à 15 % sur chaque commande.</div>' : ''}
        ${S.user ? `<div class="notice notice--ok">Vous gagnerez <strong>${Math.floor(t.total * pointsMultiplier())} points</strong> avec cette commande.</div>` : ''}
      </aside>
    </div>`;
  },
  mount() {
    if (!S.basket.length) return;
    $$('[data-mode]').forEach((b) => b.onclick = () => { co.mode = b.dataset.mode; co.slot = null; router(); });
    $$('[data-day]').forEach((b) => b.onclick = () => { co.day = b.dataset.day; co.slot = null; router(); });
    $$('[data-slot]').forEach((b) => b.onclick = () => { co.slot = b.dataset.slot; $$('[data-slot]').forEach((x) => x.classList.toggle('sel', x === b)); });
    $$('[data-pay]').forEach((b) => b.onclick = () => { co.pay = b.dataset.pay; $$('[data-pay]').forEach((x) => x.classList.toggle('sel', x === b)); });
    $$('input[name="addr"]').forEach((r) => r.onchange = () => { co.addressId = r.value; router(); });
    $$('input[name="pickup"]').forEach((r) => r.onchange = () => { co.pickup = r.value; });
    if ($('#coAddr')) bindZoneCheck($('#coAddr'));
    $('#coPromo').onsubmit = (e) => { e.preventDefault(); applyPromo(e.target.code.value); router(); };
    $('#coPay').onclick = placeOrder;
  },
};
function placeOrder() {
  const err = (m) => { const e = $('#coErr'); e.textContent = m; e.classList.remove('hidden'); e.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  let where;
  if (co.mode === 'home') {
    let addr = S.user && co.addressId && co.addressId !== 'new' ? S.addresses.find((a) => a.id === co.addressId) : null;
    if (!addr) {
      const f = $('#coAddr');
      if (!f.reportValidity()) return err('Merci de compléter votre adresse de livraison.');
      addr = Object.fromEntries(new FormData(f));
      if (S.user) { addr.id = uid(); addr.def = !S.addresses.length; S.addresses.push(addr); }
    }
    if (!inZone(addr.postcode)) return err('Cette adresse est hors de notre zone de livraison. Choisissez le retrait sur place ou une autre adresse.');
    where = `${addr.street}, ${addr.postcode} ${addr.city}`;
  } else {
    where = DELIVERY.pickupPoints.find((p) => p.id === co.pickup).name;
  }
  if (!co.slot) return err('Merci de choisir un créneau.');
  let email = S.user && S.user.email;
  if (!S.user) {
    const em = $('#coEmail');
    const fi = $('#coFirst');
    if (!em.reportValidity() || !fi.reportValidity()) return err('Merci d’indiquer votre e-mail et votre prénom.');
    email = em.value.trim();
    if ($('#coCreate').checked) S.user = { first: fi.value.trim(), last: '', email, phone: '', since: iso(new Date()) };
  }
  if (!$('#coCgv').checked) return err('Merci d’accepter les conditions générales de vente.');

  const t = totals(co.mode);
  const order = {
    id: `PC-${Math.floor(25000 + Math.random() * 9000)}`, date: new Date().toISOString(), lines: S.basket.map((l) => ({ ...l })), mode: co.mode, status: 0,
    totals: { sub: t.sub, member: t.member, promo: t.promo, reward: t.reward, delivery: t.delivery, total: t.total },
    slot: { day: co.day, time: co.slot }, where, payment: { card: 'Carte bancaire', apple: 'Apple Pay', google: 'Google Pay' }[co.pay], email,
  };
  S.orders.unshift(order);
  if (S.user) {
    const pts = Math.floor(t.total * pointsMultiplier());
    S.points += pts;
    S.pointsLog.unshift({ date: iso(new Date()), label: `Commande ${order.id}`, pts });
    order.points = pts;
  }
  S.basket = [];
  S.promo = null;
  S.reward = null;
  co.slot = null;
  save();
  renderDrawer();
  location.hash = `#/confirmation/${order.id}`;
}

/* ================= CONFIRMATION ================= */
VIEWS.order = {
  title: 'Commande confirmée — PREP CLUB',
  render(id) {
    const o = S.orders.find((x) => x.id === id);
    if (!o) return VIEWS.notfound.render();
    return `<div class="container">
      <div class="confirm-hero">
        <div class="check-circle">✓</div>
        <span class="eyebrow">Commande ${o.id}</span>
        <h1 style="font-size:clamp(2rem,4vw,3rem)">Merci ! Votre semaine est en préparation.</h1>
        <p class="muted">Un e-mail de confirmation a été envoyé à <strong>${esc(o.email)}</strong> <span class="small">(simulation)</span>.</p>
      </div>
      <div class="panel" style="max-width:820px;margin:0 auto 20px">
        ${timelineHtml(o)}
        <dl class="dl" style="margin-top:20px">
          <dt>${o.mode === 'home' ? 'Livraison à domicile' : 'Retrait sur place'}</dt><dd>${esc(o.where)}</dd>
          <dt>Créneau</dt><dd>${fmtDate(o.slot.day, { weekday: 'long', day: 'numeric', month: 'long' })}, ${o.slot.time}</dd>
          <dt>Paiement</dt><dd>${esc(o.payment)} — ${eur(o.totals.total)}</dd>
          ${o.points ? `<dt>Points fidélité</dt><dd>+${o.points} points</dd>` : ''}
        </dl>
        <p class="small muted" style="margin-top:16px">Vous recevrez une notification à chaque étape : préparation, ${o.mode === 'home' ? 'livraison en cours, livrée' : 'prête à être récupérée'}.</p>
      </div>
      <div class="row" style="justify-content:center;margin-bottom:80px">
        ${S.user ? `<a href="#/mon-compte/commandes/${o.id}" class="btn btn--primary">Suivre ma commande</a>` : ''}
        <a href="#/planning" class="btn btn--ghost">Planifier la semaine prochaine</a>
        <a href="#/carte" class="btn btn--ghost">Continuer mes achats</a>
      </div>
    </div>`;
  },
};
