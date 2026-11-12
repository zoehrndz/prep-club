/* =========================================================
   PREP CLUB — Pages complémentaires (priorités 2 & 3)
   Entreprises · Conseils & recettes · Parrainage · Recommandations
   Accessibilité · Référencement (meta par page)
   ========================================================= */
'use strict';

Object.assign(SLUGS, {
  business: 'entreprises', advice: 'conseils-recettes', referral: 'parrainage', foryou: 'pour-vous', a11y: 'accessibilite',
});

/* ================= RECOMMANDATIONS PERSONNALISÉES ================= */
const dayKey = () => new Date().toISOString().slice(0, 10);
const hashStr = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 100003; return h; };

function recoSignals() {
  const counts = {};
  const cats = {};
  const last = new Set();
  S.orders.forEach((o, i) => o.lines.forEach((l) => {
    const ids = l.pid ? [[l.pid, l.qty]] : (l.items || []).map((x) => [x.pid, x.qty * l.qty]);
    ids.forEach(([id, q]) => {
      counts[id] = (counts[id] || 0) + q;
      const p = P(id);
      if (p) cats[p.cat] = (cats[p.cat] || 0) + q;
      if (i === 0) last.add(id);
    });
  }));
  const likes = (S.prefs.likes || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const hasSignal = !!(S.user || S.favorites.length || S.orders.length || likes.length || S.prefs.diet !== 'none');
  return { counts, cats, last, likes, favs: new Set(S.favorites), hasSignal };
}

function recommend({ n = 8, cats = null, exclude = [] } = {}) {
  const sig = recoSignals();
  const topCat = (Object.entries(sig.cats).sort((a, b) => b[1] - a[1])[0] || [])[0];
  return PRODUCTS
    .filter((p) => !p.soldOut && !exclude.includes(p.id) && (!cats || cats.includes(p.cat)) && matchesPrefs(p) && !allergyHits(p).length)
    .map((p) => {
      let score = 0;
      const why = [];
      const like = sig.likes.find((l) => `${p.name} ${p.ingredients}`.toLowerCase().includes(l));
      if (like) { score += 4; why.push(`Vous aimez : ${like}`); }
      if (sig.favs.has(p.id)) { score += 2; why.push('Dans vos favoris'); }
      if (sig.counts[p.id]) {
        score += Math.min(3, sig.counts[p.id] * 0.5);
        if (sig.last.has(p.id)) score -= 1.5; else why.push('Vous l’avez déjà aimé');
      } else if (topCat && p.cat === topCat) { score += 1.5; why.push(`Vous commandez souvent : ${CATEGORIES[p.cat]}`); }
      if (p.season === CURRENT_SEASON) { score += 1.2; why.push('De saison'); }
      if (p.tags.includes('new')) { score += 1; why.push('Nouveauté'); }
      if (p.tags.includes('bestseller')) { score += 0.8; if (!why.length) why.push('Très commandé'); }
      const r = ratingOf(`produit:${p.id}`);
      if (r && r.avg >= 4) { score += 0.8; why.push(`Noté ${fmtRating(r.avg)}/5`); }
      if (S.prefs.diet === 'vegetarian') why.push('Végétarien');
      if (S.prefs.diet === 'vegan') why.push('Sans produits animaux');
      score += (hashStr(p.id + dayKey()) % 100) / 1000;
      return { p, score, why: why.slice(0, 2) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

function recoCard(r) {
  return `<div class="reco">${r.why.length ? `<span class="reco__why">✦ ${esc(r.why.join(' · '))}</span>` : ''}${productCard(r.p)}</div>`;
}

/* Remplit les créneaux vides du planning avec les recommandations */
function fillIdealWeek() {
  const plan = planOf(plannerWeek);
  const meals = S.prefs.meals.length ? S.prefs.meals : ['breakfast', 'lunch', 'dinner'];
  let added = 0;
  SLOTS.forEach((slot) => {
    if (!meals.includes(slot.id)) return;
    const cats = slot.id === 'lunch' ? ['lunch'] : slot.id === 'dinner' ? ['dinner'] : slot.cats;
    const list = recommend({ n: 20, cats });
    if (!list.length) return;
    for (let d = 0; d < 5; d++) {
      const key = `${d}-${slot.id}`;
      if (plan[key]) continue;
      const prev = plan[`${d - 1}-${slot.id}`];
      let k = d % list.length;
      if (list[k].p.id === prev && list.length > 1) k = (k + 1) % list.length;
      plan[key] = list[k].p.id;
      added++;
    }
  });
  save();
  return added;
}

VIEWS.foryou = {
  title: 'Pour vous — PREP CLUB',
  render() {
    const sig = recoSignals();
    const group = (title, cats, n) => {
      const list = recommend({ n, cats });
      return list.length ? `<div class="section-head" style="margin-top:48px"><div><h2>${title}</h2></div></div><div class="grid g4">${list.map(recoCard).join('')}</div>` : '';
    };
    return `${pageHero({ eyebrow: 'Recommandations', title: 'Sélectionné <em>pour vous</em>', text: 'Des plats choisis selon vos préférences, vos favoris et vos commandes. Les produits contenant un allergène que vous avez déclaré sont automatiquement écartés.', crumbs: 'Pour vous' })}
    <section class="section section--tight-top"><div class="container">
      <div class="reco-bar">
        <div>
          <strong>${sig.hasSignal ? 'Vos recommandations sont personnalisées' : 'Personnalisez vos recommandations'}</strong>
          <p class="small muted" style="margin:4px 0 0">${sig.hasSignal
            ? `Basées sur ${[S.prefs.diet !== 'none' ? 'votre régime' : '', sig.likes.length ? 'vos ingrédients préférés' : '', S.favorites.length ? `${S.favorites.length} favori${S.favorites.length > 1 ? 's' : ''}` : '', S.orders.length ? `${S.orders.length} commande${S.orders.length > 1 ? 's' : ''}` : ''].filter(Boolean).join(', ') || 'votre compte'}, la saison et les avis.`
            : 'Indiquez vos préférences (régime, ingrédients aimés ou évités) ou ajoutez des favoris : la sélection s’adaptera à vos goûts.'}</p>
        </div>
        <div class="row">
          <a href="#/mon-compte/preferences" class="btn btn--ghost btn--sm">Mes préférences</a>
          <button class="btn btn--primary btn--sm magnetic" id="idealWeek">✦ Générer ma semaine idéale</button>
        </div>
      </div>
      ${group('Pour bien commencer la <em>journée</em>', ['breakfast'], 4)}
      ${group('Vos déjeuners & <em>dîners</em>', ['lunch', 'dinner'], 8)}
      ${group('Une petite <em>envie</em> ?', ['snack', 'dessert'], 4)}
    </div></section>`;
  },
  mount() {
    $('#idealWeek').onclick = () => {
      const n = fillIdealWeek();
      toast(n ? `${n} repas ajoutés à votre planning — modifiez librement` : 'Votre planning de la semaine est déjà complet');
      location.hash = '#/planning';
    };
  },
};

/* Accueil : rail « Pour vous » + aperçus Conseils & Entreprises */
(function decorateHome() {
  const base = VIEWS.home.render;
  VIEWS.home.render = (...args) => {
    let html = base(...args);
    const sig = recoSignals();
    if (sig.hasSignal) {
      const list = recommend({ n: 8 });
      const block = `
    <section class="section section--tight-top foryou-home">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Pour vous${S.user ? `, ${esc(S.user.first)}` : ''}</span><h2 data-split>Sélectionné selon <em>vos goûts</em></h2></div>
          <div class="row"><a href="#/pour-vous" class="link">Toutes vos recommandations →</a><div class="rail-nav"><button data-rail="-1" aria-label="Précédent">←</button><button data-rail="1" aria-label="Suivant">→</button></div></div>
        </div>
      </div>
      <div class="rail" data-drag>${list.map(recoCard).join('')}</div>
    </section>`;
      const cut = html.indexOf('</section>') + '</section>'.length;
      html = html.slice(0, cut) + block + html.slice(cut);
    }
    const teaser = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Conseils & recettes</span><h2 data-split>Bien manger, <em>sans y penser</em></h2></div>
          <a href="#/conseils-recettes" class="link">Tous les articles →</a>
        </div>
        <div class="grid g3">${ARTICLES.slice(0, 3).map(articleCard).join('')}</div>
      </div>
    </section>
    <section class="section section--tight-top">
      <div class="container">
        <a href="#/entreprises" class="biz-banner" data-cursor="Découvrir">
          ${pic('1611095973763-414019e72400', '', 1400)}
          <div class="biz-banner__body">
            <span class="eyebrow">PREP CLUB Entreprises</span>
            <h2>Les déjeuners de toute votre équipe, <em>livrés au bureau</em>.</h2>
            <span class="btn btn--light btn--arrow">Office Box & devis</span>
          </div>
        </a>
      </div>
    </section>`;
    const lastSection = html.lastIndexOf('<section');
    return html.slice(0, lastSection) + teaser + html.slice(lastSection);
  };
})();

/* ================= ENTREPRISES ================= */
const OFFICE = { basePrice: 10.9, tiers: [{ min: 20, pct: 0.05 }, { min: 50, pct: 0.1 }, { min: 100, pct: 0.15 }, { min: 200, pct: 0.18 }] };
const FAMILY_BOXES = [
  { name: 'Family Box 3 soirs', desc: '3 dîners pour 4 personnes, à partager.', portions: 12, img: '1619895092538-128341789043', items: ['lasagna', 'roast-chicken', 'veggie-curry'] },
  { name: 'Family Box 5 soirs', desc: 'Toute la semaine du lundi au vendredi soir.', portions: 20, img: IMG.heroAlt, items: ['lasagna', 'roast-chicken', 'veggie-curry', 'chicken-mushrooms', 'beef-meatballs'] },
  { name: 'Family Box Week-end', desc: 'Un brunch et deux dîners pour souffler le week-end.', portions: 12, img: IMG.breakfastSpread, items: ['banana-bread', 'salmon-squash', 'pesto-pasta'] },
];

VIEWS.business = {
  title: 'Entreprises & familles — PREP CLUB',
  render() {
    const famPrice = (f) => round2(f.items.reduce((a, id) => a + (P(id) ? P(id).price : 0), 0) * (f.portions / f.items.length) * 0.82);
    return `${pageHero({ eyebrow: 'PREP CLUB Entreprises & familles', title: 'Bien manger, <em>ensemble</em>.', text: 'Des repas frais préparés à Lyon pour vos équipes, vos événements et vos soirées en famille. Livraison groupée, facturation simplifiée, menus adaptés.', img: '1611095973763-414019e72400', crumbs: 'Entreprises' })}

    <section class="section"><div class="container">
      <div class="grid g3 biz-offers">
        <div class="pillar"><b>Office Box</b><p class="muted small">Les déjeuners de vos collaborateurs livrés au bureau, chaque jour ou quelques jours par semaine. Chacun choisit son plat.</p><a href="#office" class="link small" data-scroll="office">Simuler mon budget →</a></div>
        <div class="pillar"><b>Événements & séminaires</b><p class="muted small">Plateaux-repas, buffets froids et box petit-déjeuner pour vos réunions, formations et séminaires.</p><a href="#devis" class="link small" data-scroll="devis">Demander un devis →</a></div>
        <div class="pillar"><b>Coworkings & points de retrait</b><p class="muted small">Devenez point de retrait PREP CLUB : vos membres récupèrent leurs repas sur place, sans frais de livraison.</p><a href="#devis" class="link small" data-scroll="devis">Devenir partenaire →</a></div>
      </div>
    </div></section>

    <section class="section section--cream" id="office"><div class="container split" style="align-items:start">
      <div>
        <span class="eyebrow">Office Box</span>
        <h2 data-split>Simulez le budget de vos <em>déjeuners d’équipe</em></h2>
        <p class="muted">Ajustez les curseurs : le nombre de repas, le prix dégressif et la répartition entre l’entreprise et les collaborateurs se calculent instantanément.</p>
        <ul class="ticks">
          <li>Prix dégressif dès 20 repas par semaine</li>
          <li>Livraison groupée offerte, créneau fixe avant midi</li>
          <li>Commande individuelle ou menu du jour commun</li>
          <li>Une facture mensuelle unique pour l’entreprise</li>
        </ul>
      </div>
      <form class="panel sim" id="officeSim">
        <div class="sim__field"><label for="simTeam">Collaborateurs</label><output id="oTeam"></output><input type="range" id="simTeam" min="5" max="300" step="5" value="40"></div>
        <div class="sim__field"><label for="simRate">Participation estimée</label><output id="oRate"></output><input type="range" id="simRate" min="20" max="100" step="5" value="60"></div>
        <div class="sim__field"><label for="simDays">Jours par semaine</label><output id="oDays"></output><input type="range" id="simDays" min="1" max="5" step="1" value="3"></div>
        <div class="sim__field"><label for="simShare">Prise en charge employeur</label><output id="oShare"></output><input type="range" id="simShare" min="0" max="100" step="5" value="50"></div>
        <div class="sim__out" aria-live="polite">
          <div><small>Repas / semaine</small><strong id="rMeals"></strong></div>
          <div><small>Prix par repas</small><strong id="rUnit"></strong><span id="rDisc" class="small"></span></div>
          <div><small>Budget mensuel</small><strong id="rMonth"></strong></div>
          <div><small>Part employeur / mois</small><strong id="rEmp"></strong></div>
          <div><small>Reste à charge / repas</small><strong id="rEmpl"></strong></div>
        </div>
        <p class="small muted" style="margin:14px 0 0">Simulation indicative, sur la base d’un déjeuner moyen à ${eur(OFFICE.basePrice)} et de 4,33 semaines par mois. Tarifs définitifs à confirmer après étude des coûts.</p>
        <a href="#devis" class="btn btn--primary btn--block btn--arrow" data-scroll="devis" style="margin-top:16px">Recevoir une proposition</a>
      </form>
    </div></section>

    <section class="section"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Family Box</span><h2 data-split>Les soirs en famille, <em>sans cuisiner</em></h2></div><p>Des plats généreux pensés pour 4, à réchauffer en quelques minutes. Lancement prévu dans un second temps : inscrivez-vous pour être prévenu·e.</p></div>
      <div class="grid g3">${FAMILY_BOXES.map((f) => `<article class="box-card">
        <div class="media media--43">${pic(f.img, f.name, 800)}<div class="card__tags"><span class="tag tag--sand">Bientôt</span></div></div>
        <div class="box-card__body">
          <h3>${f.name}</h3><p class="small muted">${f.desc}</p>
          <div class="meta"><span>${f.portions} portions</span><span>4 personnes</span></div>
          <ul>${f.items.map((id) => (P(id) ? `<li>${esc(P(id).name)}</li>` : '')).join('')}</ul>
          <div class="row between" style="margin-top:auto"><div class="price"><small>env.</small> ${eur(famPrice(f))}</div><button class="btn btn--ghost btn--sm" data-family="${esc(f.name)}">Être prévenu·e</button></div>
        </div></article>`).join('')}</div>
    </div></section>

    <section class="section section--olive" id="devis"><div class="container split" style="align-items:start">
      <div>
        <span class="eyebrow">Devis gratuit</span>
        <h2 data-split>Parlons de <em>votre projet</em></h2>
        <p class="muted-light">Office Box, événement, partenariat de retrait : décrivez votre besoin, notre équipe revient vers vous sous 48 h ouvrées avec une proposition adaptée.</p>
        <div class="chips" style="margin-top:20px"><span class="chip">Lyon & métropole</span><span class="chip">Dès 10 repas</span><span class="chip">Facture mensuelle</span></div>
      </div>
      <form class="panel" id="quoteForm">
        <div class="form-grid">
          <div class="field"><label for="qCompany">Entreprise / organisation</label><input class="input" id="qCompany" required autocomplete="organization"></div>
          <div class="field"><label for="qName">Nom du contact</label><input class="input" id="qName" required autocomplete="name"></div>
          <div class="field"><label for="qEmail">E-mail professionnel</label><input class="input" type="email" id="qEmail" required autocomplete="email"></div>
          <div class="field"><label for="qPhone">Téléphone</label><input class="input" type="tel" id="qPhone" autocomplete="tel"></div>
          <div class="field"><label for="qType">Besoin</label><select class="input" id="qType"><option>Office Box (déjeuners réguliers)</option><option>Événement / séminaire</option><option>Point de retrait / coworking</option><option>Family Box</option><option>Autre</option></select></div>
          <div class="field"><label for="qSize">Nombre de personnes</label><input class="input" type="number" id="qSize" min="1" value="40"></div>
        </div>
        <div class="field"><label for="qMsg">Votre besoin</label><textarea class="input" id="qMsg" rows="4" placeholder="Fréquence, dates, contraintes alimentaires, adresse de livraison…"></textarea></div>
        <label class="check small" style="margin-bottom:16px"><input type="checkbox" required> J’accepte que PREP CLUB utilise ces informations pour répondre à ma demande.</label>
        <button class="btn btn--primary btn--block">Envoyer ma demande</button>
      </form>
    </div></section>`;
  },
  mount() {
    const v = (id) => Number($(id).value);
    const draw = () => {
      const meals = Math.round(v('#simTeam') * (v('#simRate') / 100) * v('#simDays'));
      const tier = [...OFFICE.tiers].reverse().find((t) => meals >= t.min);
      const unit = round2(OFFICE.basePrice * (1 - (tier ? tier.pct : 0)));
      const month = round2(meals * unit * 4.33);
      const emp = round2(month * (v('#simShare') / 100));
      $('#oTeam').textContent = v('#simTeam');
      $('#oRate').textContent = `${v('#simRate')} %`;
      $('#oDays').textContent = `${v('#simDays')} j`;
      $('#oShare').textContent = `${v('#simShare')} %`;
      $('#rMeals').textContent = meals;
      $('#rUnit').textContent = eur(unit);
      $('#rDisc').textContent = tier ? ` −${Math.round(tier.pct * 100)} %` : '';
      $('#rMonth').textContent = eur(month);
      $('#rEmp').textContent = eur(emp);
      $('#rEmpl').textContent = eur(unit * (1 - v('#simShare') / 100));
      $$('#officeSim input[type=range]').forEach((r) => r.style.setProperty('--p', `${((r.value - r.min) / (r.max - r.min)) * 100}%`));
    };
    $('#officeSim').addEventListener('input', draw);
    $('#officeSim').addEventListener('submit', (e) => e.preventDefault());
    draw();
    $$('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); $(`#${a.dataset.scroll}`).scrollIntoView({ behavior: 'smooth' }); }));
    $$('[data-family]').forEach((b) => b.onclick = () => {
      openModal(`<span class="eyebrow">Family Box</span><h3>Être prévenu·e du lancement</h3><p class="muted small">Nous vous écrirons une seule fois, au lancement de la ${esc(b.dataset.family)}.</p>
        <form id="famForm"><div class="field"><label for="famMail">E-mail</label><input class="input" type="email" id="famMail" required value="${esc(S.user ? S.user.email : '')}"></div>
        <button class="btn btn--primary btn--block">M’avertir</button></form>`, (panel) => {
        $('#famForm', panel).onsubmit = (e) => {
          e.preventDefault();
          S.waitlist = [...(S.waitlist || []), { offer: b.dataset.family, email: $('#famMail', panel).value.trim(), date: iso(new Date()) }];
          save();
          closeModal();
          toast('C’est noté ! Vous serez prévenu·e du lancement');
        };
      });
    });
    $('#quoteForm').onsubmit = (e) => {
      e.preventDefault();
      S.quotes = [...(S.quotes || []), { company: $('#qCompany').value.trim(), name: $('#qName').value.trim(), email: $('#qEmail').value.trim(), phone: $('#qPhone').value.trim(), type: $('#qType').value, size: $('#qSize').value, message: $('#qMsg').value.trim(), date: new Date().toISOString() }];
      save();
      e.target.reset();
      toast('Demande envoyée — réponse sous 48 h ouvrées (simulation)');
    };
  },
};

/* ================= CONSEILS & RECETTES ================= */
const ADVICE_CATS = ['Organisation', 'Conservation', 'Saison', 'Équilibre', 'Producteurs', 'Recettes'];
const ARTICLES = [
  {
    id: 'organiser-sa-semaine', cat: 'Organisation', title: 'Organiser ses repas de la semaine en 15 minutes', img: '1495521821757-a1efb6729352', read: 4, date: '2026-11-02',
    excerpt: 'Une méthode simple, à faire le dimanche soir, pour ne plus se demander « on mange quoi ? » chaque jour.',
    body: [
      { p: 'Planifier ses repas ne demande ni tableur ni heure de cuisine. Quelques minutes suffisent, à condition de suivre toujours le même ordre.' },
      { h: '1. Regardez votre agenda avant votre frigo' },
      { p: 'Repérez les soirs chargés, les déjeuners à l’extérieur et les jours de télétravail. Ce sont eux qui décident du nombre de repas à prévoir, pas l’inverse.' },
      { h: '2. Fixez des repères plutôt qu’un menu figé' },
      { list: ['un repas réconfortant pour le soir le plus fatigant', 'deux déjeuners faciles à emporter', 'un plat végétarien pour varier', 'un en-cas pour l’après-midi le plus long'] },
      { h: '3. Remplissez, puis laissez de la marge' },
      { p: 'Remplissez quatre à cinq jours, pas sept : l’imprévu existe. Un dîner chez des amis ou un reste de la veille trouvera toujours sa place.' },
      { tip: 'Dans le planning de la semaine PREP CLUB, le bouton « Suggérer une semaine » remplit les créneaux vides selon vos préférences : il ne reste qu’à ajuster.' },
    ],
    products: ['chicken-rice-veg', 'veggie-curry', 'overnight-oats', 'energy-balls'],
  },
  {
    id: 'conserver-rechauffer', cat: 'Conservation', title: 'Bien conserver et réchauffer ses plats préparés', img: '1543352634-a1c51d9f1fa7', read: 3, date: '2026-10-26',
    excerpt: 'Température du frigo, opercule, temps de repos : les bons gestes pour que chaque plat garde son goût.',
    body: [
      { p: 'Un plat frais se conserve bien… à condition de respecter la chaîne du froid de la livraison à l’assiette.' },
      { h: 'Au réfrigérateur, tout de suite' },
      { p: 'Rangez vos plats dès réception, entre 0 et 4 °C, idéalement sur les étagères du milieu ou du bas, plus froides que la porte. La date limite de consommation figure sur chaque emballage : elle se respecte à la lettre.' },
      { h: 'Réchauffer sans dessécher' },
      { list: ['entrouvrez l’opercule pour laisser s’échapper la vapeur', 'retirez les crudités et sauces froides avant de réchauffer', 'chauffez par étapes et mélangez à mi-parcours', 'laissez reposer une minute : la chaleur se répartit'] },
      { h: 'Ce qu’on évite' },
      { p: 'On ne recongèle pas un plat décongelé, et on ne réchauffe un plat qu’une seule fois. En cas de doute sur un produit, mieux vaut ne pas le consommer.' },
      { tip: 'Les instructions précises (puissance, durée, emballage) sont indiquées sur la fiche de chaque recette, rubrique « Préparation ».' },
    ],
    products: ['lasagna', 'salmon-quinoa', 'chicken-mushrooms'],
  },
  {
    id: 'legumes-automne', cat: 'Saison', title: 'Les légumes d’automne à ne pas manquer', img: IMG.pumpkin, read: 4, date: '2026-10-19',
    excerpt: 'Courges, champignons, poires, légumes racines : pourquoi l’automne est la saison la plus gourmande.',
    body: [
      { p: 'Quand les journées raccourcissent, les étals se remplissent de produits qui se prêtent parfaitement aux plats mijotés et rôtis.' },
      { h: 'Les courges' },
      { p: 'Butternut, potimarron, muscade : rôties au four, elles deviennent fondantes et légèrement sucrées. Elles se marient très bien avec les lentilles, les noisettes et une touche d’érable.' },
      { h: 'Les champignons' },
      { p: 'Champignons de Paris et pleurotes apportent une note boisée aux sauces crémeuses et aux pâtes fraîches.' },
      { h: 'Les poires et légumes racines' },
      { list: ['les poires, crues en en-cas ou pochées en dessert', 'les carottes et panais, rôtis avec des herbes', 'la betterave, en salade tiède'] },
      { tip: 'Retrouvez ces produits dans la Collection de saison, avec les producteurs associés à chaque recette.' },
    ],
    products: ['seasonal-bowl', 'salmon-squash', 'chicken-mushrooms', 'fresh-fruits'],
  },
  {
    id: 'assiette-equilibree', cat: 'Équilibre', title: 'Composer une assiette équilibrée, simplement', img: '1546069901-ba9599a7e63c', read: 3, date: '2026-10-12',
    excerpt: 'La méthode de l’assiette : un repère visuel facile pour varier ses repas sans compter.',
    body: [
      { p: 'Pas besoin de peser ses aliments pour manger varié. Un repère visuel courant consiste à partager son assiette en trois zones.' },
      { list: ['environ la moitié de légumes, crus ou cuits', 'environ un quart de féculents, de préférence complets', 'environ un quart de protéines, animales ou végétales'] },
      { h: 'Et le reste ?' },
      { p: 'Un filet d’huile de qualité, des herbes, un fruit ou un laitage complètent le repas. L’essentiel est la variété sur la semaine, plus que la perfection à chaque repas.' },
      { tip: 'Chaque fiche produit PREP CLUB détaille les valeurs nutritionnelles pour 100 g et par portion. Ces repères sont généraux et ne remplacent pas l’avis d’un professionnel de santé.' },
    ],
    products: ['chicken-rice-veg', 'mediterranean-bowl', 'buddha-bowl'],
  },
  {
    id: 'rencontre-jardins-saone', cat: 'Producteurs', title: 'Rencontre : Les Jardins de la Saône', img: IMG.seedlings, read: 5, date: '2026-10-05',
    excerpt: 'Portrait du maraîcher qui fournit une partie de nos légumes, au bord de la Saône.',
    body: [
      { p: 'Portrait fictif, présenté à titre d’exemple dans ce projet étudiant : il illustre le type de contenu publié sur nos producteurs.' },
      { h: 'Un maraîchage diversifié' },
      { p: 'Courgettes, carottes, courges, herbes fraîches : l’exploitation cultive une grande variété de légumes en plein champ et sous abri, récoltés deux fois par semaine pour nos recettes.' },
      { h: 'Ce que ça change dans nos plats' },
      { p: 'Travailler avec un maraîcher proche permet d’adapter nos recettes à ce qui pousse vraiment, et de raccourcir le temps entre la récolte et la cuisine.' },
      { tip: 'Tous nos producteurs partenaires sont présentés sur la page « Nos producteurs », avec les plats qui utilisent leurs produits.' },
    ],
    products: ['seasonal-bowl', 'creamy-chicken-bowl', 'chicken-rice-veg'],
  },
  {
    id: 'vinaigrette-erable', cat: 'Recettes', title: 'Recette : la vinaigrette érable-moutarde de notre bol d’automne', img: '1505576633757-0ac1084af824', read: 2, date: '2026-09-28',
    excerpt: 'La sauce de notre Bol de courge d’automne, à refaire chez vous en deux minutes.',
    body: [
      { p: 'Pour un petit pot, de quoi assaisonner trois à quatre bols.' },
      { h: 'Ingrédients' },
      { list: ['3 c. à soupe d’huile de colza', '1 c. à soupe de vinaigre de cidre', '1 c. à café de moutarde (allergène)', '1 c. à café de sirop d’érable', 'sel, poivre'] },
      { h: 'Préparation' },
      { p: 'Mélangez la moutarde, le vinaigre et le sirop d’érable. Ajoutez l’huile en filet en fouettant, puis salez et poivrez. Elle se garde trois jours au réfrigérateur, dans un bocal fermé.' },
      { tip: 'Elle accompagne aussi très bien les légumes rôtis et les salades de lentilles.' },
    ],
    products: ['seasonal-bowl', 'buddha-bowl'],
  },
  {
    id: 'dejeuner-au-bureau', cat: 'Organisation', title: 'Bien déjeuner au bureau : 5 astuces', img: '1611095973763-414019e72400', read: 3, date: '2026-09-21',
    excerpt: 'Sortir de l’écran, prévoir l’en-cas, garder ses plats au frais : les petits gestes qui changent la pause déjeuner.',
    body: [
      { list: ['prévoyez votre déjeuner la veille, pour ne pas décider à 12 h 30 le ventre vide', 'gardez vos plats au réfrigérateur du bureau dès votre arrivée', 'faites une vraie pause, loin de l’écran, même 20 minutes', 'gardez un en-cas pour l’après-midi le plus long', 'variez les plats sur la semaine plutôt que de reprendre toujours le même'] },
      { tip: 'Votre entreprise peut aussi proposer les déjeuners PREP CLUB à toute l’équipe : découvrez l’Office Box.' },
    ],
    products: ['pesto-pasta', 'salmon-quinoa', 'energy-balls'],
  },
];

function articleCard(a) {
  return `<article class="box-card article-card">
    <a href="#/conseils-recettes/${a.id}" class="media media--43" data-cursor="Lire">${pic(a.img, a.title, 800)}<div class="card__tags"><span class="tag">${a.cat}</span></div></a>
    <div class="box-card__body">
      <div class="small muted">${fmtDate(a.date, { day: 'numeric', month: 'long' })} · ${a.read} min de lecture</div>
      <h3 style="margin:8px 0"><a href="#/conseils-recettes/${a.id}">${esc(a.title)}</a></h3>
      <p class="small muted">${esc(a.excerpt)}</p>
      <a href="#/conseils-recettes/${a.id}" class="link small" style="margin-top:auto;align-self:flex-start">Lire l’article →</a>
    </div>
  </article>`;
}

VIEWS.advice = {
  title: 'Conseils & recettes — PREP CLUB',
  nav: () => '',
  render(id) {
    if (id) return articleView(id);
    return `${pageHero({ eyebrow: 'Conseils & recettes', title: 'Mieux s’organiser, <em>mieux manger</em>', text: 'Méthodes d’organisation, conservation, produits de saison, portraits de producteurs et recettes faciles : le magazine PREP CLUB.', crumbs: 'Conseils & recettes' })}
    <section class="section section--tight-top"><div class="container">
      <div class="filters" role="group" aria-label="Filtrer les articles">${['Tous', ...ADVICE_CATS].map((c, i) => `<button class="filter ${i === 0 ? 'active' : ''}" data-acat="${c}">${c}</button>`).join('')}</div>
      <a href="#/conseils-recettes/${ARTICLES[0].id}" class="article-hero" data-cursor="Lire">
        ${pic(ARTICLES[0].img, ARTICLES[0].title, 1400)}
        <div><span class="tag tag--sand">À la une · ${ARTICLES[0].cat}</span><h2>${esc(ARTICLES[0].title)}</h2><p>${esc(ARTICLES[0].excerpt)}</p></div>
      </a>
      <div class="grid g3" id="articleGrid" style="margin-top:28px"></div>
    </div></section>
    <section class="section"><div class="container"><div class="newsletter newsletter--card"><div><span class="eyebrow">Chaque semaine</span><h2>Un conseil dans <em>La Prep de la Semaine</em></h2><p>Le menu, les produits de saison et un conseil d’organisation, chaque semaine dans votre boîte mail.</p></div>${newsletterForm()}</div></div></section>`;
  },
  mount(id) {
    if (id) {
      const share = $('#shareCopy');
      if (share) share.onclick = () => {
        const url = location.href;
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('Lien copié'), () => toast(url));
      };
      return;
    }
    const draw = (cat) => {
      $('#articleGrid').innerHTML = ARTICLES.slice(1).filter((a) => cat === 'Tous' || a.cat === cat).map(articleCard).join('') || '<div class="empty-state" style="grid-column:1/-1"><p style="margin:0">Pas encore d’article dans cette rubrique.</p></div>';
    };
    $$('[data-acat]').forEach((b) => b.onclick = () => { $$('[data-acat]').forEach((x) => x.classList.toggle('active', x === b)); draw(b.dataset.acat); });
    draw('Tous');
  },
};
function articleView(id) {
  const a = ARTICLES.find((x) => x.id === id);
  if (!a) return VIEWS.notfound.render();
  document.title = `${a.title} — PREP CLUB`;
  const products = a.products.map(P).filter(Boolean).filter((p) => PRODUCTS.includes(p));
  const others = ARTICLES.filter((x) => x.id !== id).slice(0, 3);
  const block = (b) => (b.h ? `<h2>${esc(b.h)}</h2>` : b.p ? `<p>${esc(b.p)}</p>` : b.list ? `<ul>${b.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : b.tip ? `<aside class="article-tip"><strong>Le conseil PREP CLUB</strong><p>${esc(b.tip)}</p></aside>` : '');
  return `<article>
    <section class="page-hero page-hero--img article-head">
      ${pic(a.img, '', 1800)}
      <div class="container">
        <div class="crumbs"><a href="#/">Accueil</a> / <a href="#/conseils-recettes">Conseils & recettes</a> / ${a.cat}</div>
        <span class="eyebrow">${a.cat} · ${a.read} min de lecture</span>
        <h1>${esc(a.title)}</h1>
        <p>${esc(a.excerpt)}</p>
      </div>
    </section>
    <section class="section"><div class="container article-layout">
      <div class="prose article-body">
        <p class="small muted">Publié le ${fmtDate(a.date)}</p>
        ${a.body.map(block).join('')}
        <div class="row" style="margin-top:32px"><button class="btn btn--ghost btn--sm" id="shareCopy">Copier le lien</button><a class="btn btn--ghost btn--sm" href="mailto:?subject=${encodeURIComponent(a.title)}&body=${encodeURIComponent(`${a.excerpt}\n\n`)}">Partager par e-mail</a></div>
      </div>
      ${products.length ? `<aside class="article-side"><h3>Les plats qui vont avec</h3>${products.map((p) => `<a href="#/produit/${p.id}" class="article-prod">${pic(p.img, '', 200)}<span><strong>${esc(p.name)}</strong><small>${eur(p.price)} · ${kcalPortion(p)} kcal</small></span></a>`).join('')}<a href="#/carte" class="btn btn--primary btn--block btn--sm" style="margin-top:12px">Voir toute la carte</a></aside>` : ''}
    </div></section>
  </article>
  <section class="section section--cream"><div class="container">
    <div class="section-head"><div><span class="eyebrow">À lire aussi</span><h2>D’autres <em>conseils</em></h2></div></div>
    <div class="grid g3">${others.map(articleCard).join('')}</div>
  </div></section>`;
}

/* ================= PARRAINAGE ================= */
const REFERRAL = { godchildGift: 10, minOrder: 40, points: 100, tiers: [{ n: 1, label: '100 points' }, { n: 3, label: 'Une Box découverte offerte' }, { n: 5, label: 'Un mois de Club Plus offert' }] };
function referralCode() {
  if (!S.user) return '';
  return `PREP-${(S.user.first || 'CLUB').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)}${String(S.user.email.length * 37).slice(-2)}`;
}
VIEWS.referral = {
  title: 'Parrainage — PREP CLUB',
  render() {
    const code = referralCode();
    const refs = S.referrals || [];
    const done = refs.filter((r) => r.status === 'ordered').length;
    const next = REFERRAL.tiers.find((t) => done < t.n);
    const shareText = `Je commande mes repas de la semaine chez PREP CLUB (Lyon). Avec mon code ${code}, tu as ${REFERRAL.godchildGift} € offerts sur ta première commande dès ${REFERRAL.minOrder} € !`;
    return `${pageHero({ eyebrow: 'Parrainage', title: 'Partagez la <em>bonne adresse</em>', text: `Offrez ${REFERRAL.godchildGift} € à vos proches sur leur première commande, et gagnez ${REFERRAL.points} points pour chaque filleul qui commande.`, crumbs: 'Parrainage' })}
    <section class="section section--tight-top"><div class="container">
      <div class="grid g3 how">
        <div class="how__step"><h3>Partagez votre code</h3><p>Envoyez votre code personnel par message, e-mail ou de vive voix.</p></div>
        <div class="how__step"><h3>Votre filleul commande</h3><p>${REFERRAL.godchildGift} € offerts sur sa première commande dès ${REFERRAL.minOrder} €.</p></div>
        <div class="how__step"><h3>Vous êtes récompensé·e</h3><p>${REFERRAL.points} points par filleul, et des paliers pour aller plus loin.</p></div>
      </div>
      ${!S.user ? `<div class="panel center" style="margin-top:32px"><h3>Connectez-vous pour obtenir votre code</h3><p class="muted">Votre code de parrainage est lié à votre compte PREP CLUB.</p><a href="#/mon-compte" class="btn btn--primary">Mon compte</a></div>` : `
      <div class="ref-grid">
        <div class="panel ref-code">
          <span class="eyebrow">Votre code</span>
          <div class="ref-code__value" id="refValue">${code}</div>
          <div class="row">
            <button class="btn btn--primary btn--sm" id="refCopy">Copier le code</button>
            <a class="btn btn--ghost btn--sm" href="mailto:?subject=${encodeURIComponent('10 € offerts chez PREP CLUB')}&body=${encodeURIComponent(shareText)}">Par e-mail</a>
            <a class="btn btn--ghost btn--sm" href="https://wa.me/?text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
        <div class="panel">
          <span class="eyebrow">Vos paliers</span>
          <div class="ref-tiers">${REFERRAL.tiers.map((t) => `<div class="ref-tier ${done >= t.n ? 'on' : ''}"><b>${t.n}</b><span>${t.n} filleul${t.n > 1 ? 's' : ''}</span><small>${t.label}</small></div>`).join('')}</div>
          <p class="small muted" style="margin:14px 0 0">${next ? `Encore ${next.n - done} filleul${next.n - done > 1 ? 's' : ''} pour débloquer : ${next.label}.` : 'Tous les paliers sont débloqués, merci !'}</p>
        </div>
      </div>
      <div class="panel" style="margin-top:20px">
        <div class="row between"><h3 style="margin:0">Vos filleuls</h3><div class="row"><button class="btn btn--ghost btn--sm" id="refSimInvite">Simuler une inscription</button></div></div>
        ${refs.length ? `<table class="data" style="margin-top:14px"><thead><tr><th>Filleul</th><th>Depuis le</th><th>Statut</th><th></th></tr></thead><tbody>${refs.map((r) => `<tr><td>${esc(r.name)}</td><td>${fmtDate(r.date)}</td><td><span class="status ${r.status === 'ordered' ? '' : 'status--prep'}">${r.status === 'ordered' ? `A commandé · +${REFERRAL.points} pts` : 'Inscrit·e, pas encore de commande'}</span></td><td class="num">${r.status === 'ordered' ? '' : `<button class="linklike small" data-ref-order="${r.id}">Simuler sa 1re commande</button>`}</td></tr>`).join('')}</tbody></table>` : '<p class="muted" style="margin-top:12px">Aucun filleul pour le moment. Partagez votre code pour commencer !</p>'}
        <p class="small muted" style="margin:14px 0 0">Démonstration : les boutons « Simuler » montrent le fonctionnement du suivi. Un parrainage par filleul, filleul limité à sa première commande, récompenses non cumulables avec un autre code promo.</p>
      </div>`}
    </div></section>`;
  },
  mount() {
    if (!S.user) return;
    $('#refCopy').onclick = () => {
      const v = $('#refValue').textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast('Code copié'), () => toast(v));
    };
    $('#refSimInvite').onclick = () => {
      const names = ['Léa', 'Hugo', 'Inès', 'Malo', 'Sarah', 'Noah', 'Jade', 'Louis'];
      const refs = S.referrals || [];
      S.referrals = [...refs, { id: uid(), name: `${names[refs.length % names.length]} ${String.fromCharCode(65 + (refs.length * 7) % 26)}.`, status: 'registered', date: iso(new Date()) }];
      save();
      toast('Nouveau filleul inscrit');
      router();
    };
    $$('[data-ref-order]').forEach((b) => b.onclick = () => {
      const r = S.referrals.find((x) => x.id === b.dataset.refOrder);
      r.status = 'ordered';
      S.points += REFERRAL.points;
      S.pointsLog.unshift({ date: iso(new Date()), label: `Parrainage : ${r.name}`, pts: REFERRAL.points });
      save();
      toast(`+${REFERRAL.points} points : ${r.name} a passé sa première commande`);
      router();
    });
  },
};

/* ================= ACCESSIBILITÉ ================= */
VIEWS.a11y = {
  title: 'Accessibilité — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Accessibilité', title: 'Déclaration d’accessibilité', crumbs: 'Accessibilité' })}
    <section class="section"><div class="container prose">
      <div class="notice notice--warn">Projet étudiant : le site n’a pas fait l’objet d’un audit RGAA officiel. Cette déclaration décrit les mesures déjà mises en place.</div>
      <h2>État de conformité</h2><p>Le site PREP CLUB est <strong>non audité</strong> à ce jour au regard du Référentiel général d’amélioration de l’accessibilité (RGAA 4.1).</p>
      <h2>Ce qui est déjà en place</h2>
      <ul>
        <li>Navigation complète au clavier, lien d’évitement « Aller au contenu » et focus visible</li>
        <li>Fenêtres et panneaux qui gardent le focus et se ferment avec la touche Échap</li>
        <li>Textes alternatifs sur les images informatives, libellés sur les boutons et champs</li>
        <li>Allergènes toujours affichés en texte, jamais signalés par la seule couleur</li>
        <li>Animations désactivées automatiquement si « Réduire les animations » est activé sur l’appareil</li>
        <li>Mise en page adaptée aux mobiles, tablettes et zoom à 200 %</li>
      </ul>
      <h2>Signaler un problème</h2><p>Si vous rencontrez une difficulté pour accéder à un contenu ou à une fonctionnalité, <a href="#/contact" class="link">contactez-nous</a> : nous vous proposerons une alternative accessible.</p>
      <h2>Voie de recours</h2><p>Si vous n’obtenez pas de réponse satisfaisante, vous pouvez saisir le Défenseur des droits.</p>
    </div></section>`;
  },
};

/* ================= ACCESSIBILITÉ : focus des fenêtres ================= */
(function a11yEnhancements() {
  let lastFocus = null;
  const trap = (container) => (e) => {
    if (e.key !== 'Tab') return;
    const items = $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', container).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const modal = $('#modal');
  const drawer = $('#drawer');
  const modalTrap = trap(modal);
  const drawerTrap = trap(drawer);
  new MutationObserver(() => {
    if (!modal.hidden) { lastFocus = lastFocus || document.activeElement; document.addEventListener('keydown', modalTrap); }
    else { document.removeEventListener('keydown', modalTrap); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); lastFocus = null; }
  }).observe(modal, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(() => {
    if (drawer.classList.contains('open')) {
      lastFocus = document.activeElement;
      document.addEventListener('keydown', drawerTrap);
      setTimeout(() => $('#drawerClose').focus(), 50);
    } else {
      document.removeEventListener('keydown', drawerTrap);
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
      lastFocus = null;
    }
  }).observe(drawer, { attributes: true, attributeFilter: ['class'] });
})();

/* ================= RÉFÉRENCEMENT : description & aria-current par page ================= */
const ROUTE_META = {
  home: 'Repas préparés frais à Lyon : plats à la carte, formules, box à composer et planning de la semaine. Livraison et retrait sur place, sans abonnement obligatoire.',
  menu: 'La carte PREP CLUB : petits-déjeuners, déjeuners, dîners, en-cas et desserts préparés à Lyon. Ingrédients, allergènes, valeurs nutritionnelles et provenance détaillés.',
  formulas: 'Formules de repas préparés à Lyon : box petit-déjeuner, déjeuner, dîner ou journée complète, recettes modifiables et prix réduit. Sans abonnement.',
  build: 'Composez votre box de repas préparés à Lyon : choisissez vos plats et quantités, le prix se calcule en direct.',
  planner: 'Planifiez vos repas de la semaine en 5 minutes avec PREP CLUB et transformez votre planning en commande. Livraison à Lyon.',
  seasonal: 'Collection de saison PREP CLUB : recettes autour des produits de saison et des producteurs de la région lyonnaise.',
  discovery: 'Box découverte PREP CLUB : des sélections thématiques pour goûter nos recettes de repas préparés à Lyon.',
  story: 'PREP CLUB, marque de meal prep lyonnaise : flexibilité, qualité, transparence et producteurs locaux.',
  producers: 'Les producteurs partenaires de PREP CLUB autour de Lyon et la provenance des ingrédients de nos plats.',
  delivery: 'Livraison de repas à Lyon et dans la métropole, ou retrait sur place : zones, tarifs et créneaux PREP CLUB.',
  business: 'Repas d’entreprise à Lyon : Office Box, plateaux pour séminaires et partenariats coworking. Simulez votre budget et demandez un devis.',
  advice: 'Conseils pour organiser ses repas de la semaine, conserver ses plats, cuisiner de saison : le magazine PREP CLUB.',
  referral: 'Parrainez vos proches chez PREP CLUB : 10 € offerts pour eux, des points et des cadeaux pour vous.',
  foryou: 'Vos recommandations de plats PREP CLUB, selon vos préférences, vos favoris et vos commandes.',
};
(function seoMeta() {
  const meta = $('meta[name="description"]');
  const base = meta ? meta.content : '';
  const update = () => {
    const slug = (location.hash.split('#/')[1] || '').split('/')[0];
    const key = (Object.entries(SLUGS).find(([, v]) => v === slug) || [slug || 'home'])[0];
    if (meta) meta.content = ROUTE_META[key] || base;
    $$('#nav a').forEach((a) => { if (a.classList.contains('active')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  };
  window.addEventListener('hashchange', () => setTimeout(update, 0));
  window.addEventListener('load', update);
})();

/* ================= OFFRE & PRIX (espace de vente) ================= */
SLUGS.offer = 'offre-et-prix';
ROUTE_META.offer = 'L’offre PREP CLUB en détail : ce qui est inclus, ce qui ne l’est pas, prix TTC des plats, formules, box, abonnement facultatif et livraison à Lyon.';
const OFFER_PROMISE = 'Pour les actifs lyonnais pressés : des plats frais cuisinés chaque semaine à Lyon, livrés ou à retirer, pour bien manger sans cuisiner, et sans abonnement obligatoire.';
function priceRange(cats) {
  const ps = PRODUCTS.filter((p) => cats.includes(p.cat)).map((p) => p.price);
  return ps.length ? [Math.min(...ps), Math.max(...ps)] : [0, 0];
}
const fmtRange = ([a, b]) => (a === b ? eur(a) : `${eur(a)} à ${eur(b)}`);
VIEWS.offer = {
  title: 'Offre & prix — PREP CLUB',
  render() {
    const rows = [['breakfast', 'Petits-déjeuners'], ['lunch', 'Déjeuners'], ['dinner', 'Dîners'], ['snack', 'En-cas'], ['dessert', 'Desserts']].filter(([c]) => PRODUCTS.some((p) => p.cat === c));
    const tier = BOX_RULES.tiers[BOX_RULES.tiers.length - 1];
    return `${pageHero({ eyebrow: 'Offre & prix', title: 'Ce que vous achetez, <em>clairement</em>', text: OFFER_PROMISE, crumbs: 'Offre & prix' })}
    <section class="section section--tight-top"><div class="container">
      <div class="grid g2">
        <div class="panel"><h3>✓ Ce qui est inclus</h3><ul class="ticks">
          <li>Des plats frais cuisinés à Lyon, en barquette individuelle, prêts en 3 minutes</li>
          <li>Une étiquette complète : ingrédients, allergènes, valeurs nutritionnelles, date limite</li>
          <li>La personnalisation : taille de portion, accompagnement, sauce à part, ingrédient retiré</li>
          <li>La livraison réfrigérée dans la métropole de Lyon (${eur(DELIVERY.homeFee)} TTC, offerte dès ${DELIVERY.freeFrom} €) ou le retrait gratuit</li>
          <li>Le planning de la semaine, l’espace client et les points de fidélité</li>
        </ul></div>
        <div class="panel"><h3>✕ Ce qui n’est pas inclus</h3><ul class="ticks ticks--no">
          <li>Aucun abonnement obligatoire : le Club est facultatif</li>
          <li>Pas de livraison hors des ${DELIVERY.zones.length} codes postaux desservis, ni le dimanche</li>
          <li>Pas de plat sur mesure en dehors des options proposées</li>
          <li>Pas de garantie « sans allergène » : l’atelier manipule les 14 allergènes réglementaires</li>
          <li>Pas de couverts ni de vaisselle fournis</li>
        </ul></div>
      </div>

      <h2 style="margin-top:56px">Les prix</h2>
      <p class="muted">Tous les prix sont en euros TTC (toutes taxes comprises). Projet étudiant : le paiement est simulé, aucune somme n’est débitée.</p>
      <div class="panel table-wrap"><table class="data offer-table">
        <thead><tr><th>Formule</th><th>Ce qu’elle contient</th><th class="num">Prix TTC</th><th></th></tr></thead>
        <tbody>
          ${rows.map(([c, l]) => `<tr><td><strong>À la carte · ${l}</strong></td><td>1 portion, au choix parmi ${PRODUCTS.filter((p) => p.cat === c).length} recettes</td><td class="num">${fmtRange(priceRange([c]))}</td><td><a href="#/carte/${SUB_SLUGS[c] || c}" class="link">Voir</a></td></tr>`).join('')}
          ${FORMULAS.map((f) => { const pr = formulaPricing(f.defaults, f.discount); return `<tr><td><strong>${esc(f.name)}</strong></td><td>${f.portions} portions, recettes modifiables, −${Math.round(f.discount * 100)} % vs à l’unité</td><td class="num">${eur(pr.price)}</td><td><a href="#/box/${f.id}" class="link">Voir</a></td></tr>`; }).join('')}
          ${DISCOVERY.map((d) => `<tr><td><strong>${esc(d.name)}</strong></td><td>${d.items.length} portions sélectionnées par l’équipe</td><td class="num">${eur(d.price)}</td><td><a href="#/box/${d.id}" class="link">Voir</a></td></tr>`).join('')}
          <tr><td><strong>Composer ma box</strong></td><td>De ${BOX_RULES.minItems} à ${BOX_RULES.maxItems} portions au choix, jusqu’à −${Math.round(tier.pct * 100)} %</td><td class="num">selon le contenu</td><td><a href="#/composer-ma-box" class="link">Composer</a></td></tr>
          ${MEMBERSHIPS.map((m) => `<tr><td><strong>Club ${esc(m.name)}</strong> <span class="muted small">(facultatif)</span></td><td>${m.perks.slice(0, 2).join(' · ')}</td><td class="num">${eur(m.price)} / mois</td><td><a href="#/abonnement-club" class="link">Voir</a></td></tr>`).join('')}
          <tr><td><strong>Livraison à domicile</strong></td><td>Métropole de Lyon, créneau au choix</td><td class="num">${eur(DELIVERY.homeFee)} · offerte dès ${DELIVERY.freeFrom} €</td><td><a href="#/livraison" class="link">Zones</a></td></tr>
          <tr><td><strong>Retrait sur place</strong></td><td>${DELIVERY.pickupPoints.length} points de retrait à Lyon</td><td class="num">Gratuit</td><td><a href="#/livraison" class="link">Adresses</a></td></tr>
        </tbody>
      </table></div>
      <div class="row" style="margin-top:28px"><a href="#/carte" class="btn btn--primary btn--arrow magnetic">Commander à la carte</a><a href="#/formules" class="btn btn--ghost">Choisir une formule</a><a href="strategie.html#prix" class="link">Comment ces prix ont été fixés →</a></div>
    </div></section>`;
  },
};
(function homeOfferSummary() {
  const base = VIEWS.home.render;
  VIEWS.home.render = (...args) => {
    const html = base(...args);
    const block = `
    <section class="section section--tight-top offer-strip"><div class="container">
      <div class="offer-strip__grid">
        <div><span class="eyebrow">L’offre en bref</span><h2>Ce qui est vendu, à qui, à quel prix</h2><p class="muted">${OFFER_PROMISE}</p><a href="#/offre-et-prix" class="btn btn--dark btn--arrow">Offre détaillée et prix</a></div>
        <ul class="offer-strip__list">
          <li><strong>À la carte</strong><span>Petits-déjeuners ${fmtRange(priceRange(['breakfast']))} · déjeuners ${fmtRange(priceRange(['lunch']))} · dîners ${fmtRange(priceRange(['dinner']))} TTC</span></li>
          <li><strong>Formules</strong><span>5 à 15 portions, −10 à −14 % par rapport à l’unité</span></li>
          <li><strong>Livraison</strong><span>${eur(DELIVERY.homeFee)} TTC, offerte dès ${DELIVERY.freeFrom} € · retrait gratuit</span></li>
          <li><strong>Sans engagement</strong><span>Abonnement Club facultatif dès ${eur(Math.min(...MEMBERSHIPS.map((m) => m.price)))} / mois</span></li>
        </ul>
      </div>
    </div></section>`;
    const cut = html.indexOf('</section>') + '</section>'.length;
    return html.slice(0, cut) + block + html.slice(cut);
  };
})();
