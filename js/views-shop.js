/* =========================================================
   PREP CLUB — Pages boutique
   Home · Our Menu · Fiche produit · Meal Formulas · Discovery Boxes
   Seasonal Collection · Build Your Own Box · Weekly Planner
   ========================================================= */
'use strict';

/* ================= HOME ================= */
VIEWS.home = {
  title: 'PREP CLUB — Votre semaine, préparée.',
  render() {
    const best = PRODUCTS.filter((p) => p.tags.includes('bestseller') || p.tags.includes('new')).slice(0, 8);
    const season = SEASONS[CURRENT_SEASON];
    const seasonal = PRODUCTS.filter((p) => p.season === CURRENT_SEASON).slice(0, 3);
    const ways = [
      { t: 'À la carte', d: 'Un plat, dix plats : commandez exactement ce que vous voulez, quand vous voulez.', h: '#/carte', img: '1505253716362-afaea1d3d1af', cls: 'way--xl' },
      { t: 'Formules', d: 'Petit-déj, déjeuner, dîner ou journée complète, jusqu’à −14 %.', h: '#/formules', img: IMG.heroAlt, cls: 'way--wide' },
      { t: 'Composer ma box', d: 'Le prix se calcule en direct.', h: '#/composer-ma-box', img: IMG.tabletop, cls: '' },
      { t: 'Box découverte', d: 'Testez nos recettes.', h: '#/box-decouverte', img: IMG.spread, cls: '' },
      { t: 'Collection de saison', d: `${season.name} : ${season.ingredients.slice(0, 3).join(', ').toLowerCase()}.`, h: '#/collection-de-saison', img: season.img, cls: 'way--wide' },
      { t: 'L’abonnement Club', d: 'Facultatif : remises et avantages, sans engagement.', h: '#/abonnement-club', img: IMG.breakfastSpread, cls: 'way--wide' },
    ];
    const preview = [
      ['overnight-oats', 'chicken-rice-veg', 'veggie-curry'],
      ['granola-bowl', 'salmon-quinoa', 'lasagna'],
      ['chia-pudding', null, 'roast-chicken'],
      ['overnight-oats', 'mediterranean-bowl', 'salmon-squash'],
      [null, 'pesto-pasta', 'chicken-mushrooms'],
    ];
    const seasonProducers = (season.producers || []).map(PROD);
    const star = P('salmon-quinoa');
    const marquee = (words, cls = '') => `<div class="marquee ${cls}" aria-hidden="true"><div class="marquee__track">${[0, 1].map(() => `<div class="marquee__group">${words.map((w) => `<span>${w}</span><i>✺</i>`).join('')}</div>`).join('')}</div></div>`;
    const manifesto = 'On cuisine, vous vivez. Des plats frais préparés chaque semaine à Lyon, des producteurs de la région, et toute votre semaine organisée en quelques clics — sans jamais vous imposer d’abonnement.';
    const icons = {
      choose: '<svg viewBox="0 0 48 48"><circle cx="24" cy="26" r="15"/><path d="M14 26a10 10 0 0 0 20 0"/><path d="M24 4v6M18 6l2 5M30 6l-2 5"/></svg>',
      custom: '<svg viewBox="0 0 48 48"><path d="M8 14h20M36 14h4M8 24h6M22 24h18M8 34h24M40 34h0"/><circle cx="32" cy="14" r="4"/><circle cx="18" cy="24" r="4"/><circle cx="36" cy="34" r="4"/></svg>',
      plan: '<svg viewBox="0 0 48 48"><rect x="7" y="10" width="34" height="30" rx="5"/><path d="M7 19h34M16 6v8M32 6v8"/><path d="M15 28l4 4 8-8"/></svg>',
      deliver: '<svg viewBox="0 0 48 48"><path d="M5 14h24v18H5zM29 20h8l6 6v6H29z"/><circle cx="13" cy="35" r="4"/><circle cx="35" cy="35" r="4"/></svg>',
    };
    return `
    <section class="hero2">
      <div class="hero2__glow" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="container hero2__grid">
        <div class="hero2__copy">
          <span class="pill"><b></b>Repas frais · Lyon & métropole</span>
          <h1 class="hero2__title" data-split>Votre semaine,<br><span class="rotator" data-words="préparée.|organisée.|savoureuse.|locale.|libre.">préparée.</span></h1>
          <p class="hero2__text">Pour les actifs lyonnais pressés : des plats frais cuisinés chaque semaine à Lyon, livrés ou à retirer, pour bien manger sans cuisiner, et sans abonnement obligatoire.</p>
          <p class="hero2__price">Petits-déjeuners dès 3,90 € · déjeuners dès 9,90 € · dîners dès 10,50 € <abbr title="toutes taxes comprises">TTC</abbr> · livraison offerte dès 60 €</p>
          <div class="row hero2__cta">
            <a href="#/carte" class="btn btn--light btn--arrow magnetic">Découvrir la carte</a>
            <a href="#/offre-et-prix" class="btn btn--glass magnetic">Voir l’offre et les prix</a>
          </div>
          <div class="hero2__stats">
            <div><strong data-count="${PRODUCTS.length}">${PRODUCTS.length}</strong><span>recettes à la carte</span></div>
            <div><strong data-count="${PRODUCERS.length}">${PRODUCERS.length}</strong><span>producteurs partenaires</span></div>
            <div><strong data-count="3" data-suffix=" min">3 min</strong><span>pour réchauffer</span></div>
          </div>
        </div>
        <div class="hero2__visual" data-parallax>
          <div class="blob" data-depth="0.3" aria-hidden="true"></div>
          <a href="#/produit/salmon-quinoa" class="plate plate--xl" data-depth="0.8" aria-label="Bol saumon & quinoa">${pic('1611599537845-1c7aca0091c0', 'Bol saumon & quinoa', 900)}</a>
          <a href="#/produit/buddha-bowl" class="plate plate--md" data-depth="1.6" aria-label="Bol végétarien coloré">${pic('1512621776951-a57141f2eefd', 'Bol végétarien coloré', 600)}</a>
          <a href="#/produit/overnight-oats" class="plate plate--sm" data-depth="2.2" aria-label="Porridge froid aux fruits rouges">${pic('1517673400267-0251440c45dc', 'Porridge froid', 400)}</a>
          <div class="spin-badge" data-depth="1.2" aria-hidden="true">
            <svg viewBox="0 0 200 200"><defs><path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs><text><textPath href="#circ" textLength="486" lengthAdjust="spacing">FRAIS • LOCAL • SANS ABONNEMENT • </textPath></text></svg>
            <span>PC</span>
          </div>
          <div class="float-card" data-depth="1.9">
            ${pic(star.img, '', 200)}
            <div><small>Le plus commandé</small><strong>${esc(star.name)}</strong><span>${kcalPortion(star)} kcal · ${eur(star.price)}</span></div>
            <button class="add-btn" data-add="${star.id}" aria-label="Ajouter ${esc(star.name)} au panier">+</button>
          </div>
          <div class="float-chip" data-depth="2.6">⏱ Prêt en 3 min</div>
        </div>
      </div>
      ${marquee(['Frais', 'Préparé à Lyon', 'Sans abonnement', 'Producteurs locaux', 'De saison', 'Prêt en 3 minutes', 'Transparent'])}
    </section>

    <section class="section manifesto-wrap">
      <div class="container">
        <span class="eyebrow">Notre promesse</span>
        <p class="manifesto" data-manifesto>${manifesto.split(' ').map((w) => `<span>${w}</span>`).join(' ')}</p>
      </div>
    </section>

    <section class="section section--tight-top">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Commandez à votre façon</span><h2 data-split>Six façons de <em>commander</em></h2></div>
          <p>Un plat pour demain midi ou toute votre semaine organisée : vous choisissez la formule qui vous ressemble.</p>
        </div>
        <div class="bento">
          ${ways.map((w, i) => `<a class="way ${w.cls}" href="${w.h}" data-cursor="Ouvrir">${pic(w.img, '', 1100)}
            <span class="way__num">0${i + 1}</span><span class="way__arrow" aria-hidden="true">↗</span>
            <div class="way__body"><h3>${w.t}</h3><p>${w.d}</p></div></a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section--cream section--curve">
      <div class="container split">
        <div>
          <span class="eyebrow">Planning de la semaine</span>
          <h2 data-split>Toute votre semaine, organisée en <em>5 minutes</em></h2>
          <p class="muted">Pour chaque jour, choisissez votre petit-déjeuner, déjeuner, dîner et en-cas. Prix et apports nutritionnels se mettent à jour en direct, puis transformez votre planning en commande.</p>
          <ol class="steps-list">
            <li><div><strong>Remplissez vos créneaux</strong><br><span class="muted small">Choisissez un plat pour chaque repas, ou laissez-nous vous suggérer une semaine.</span></div></li>
            <li><div><strong>Ajustez librement</strong><br><span class="muted small">Modifiez, supprimez, échangez — rien n’est figé avant la validation.</span></div></li>
            <li><div><strong>Commandez et sauvegardez</strong><br><span class="muted small">Un clic pour tout mettre au panier, et votre planning est réutilisable.</span></div></li>
          </ol>
          <a href="#/planning" class="btn btn--primary btn--arrow magnetic">Planifier ma semaine</a>
        </div>
        <div class="planner-preview tilt" aria-label="Aperçu d’un planning hebdomadaire">
          <div class="planner-preview__bar"><i></i><i></i><i></i><span>Ma semaine</span></div>
          <div class="mini-grid">
            <div></div>${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((d) => `<div class="h">${d}</div>`).join('')}
            ${['Petit-déj', 'Déjeuner', 'Dîner'].map((slot, si) => `<div class="r">${slot}</div>${preview.map((day, di) => {
              const p = day[si] && P(day[si]);
              return p ? `<div class="c" style="--d:${si * 5 + di}">${pic(p.img, '', 120)}<span>${esc(p.name.split(' ').slice(0, 2).join(' '))}</span></div>` : `<div class="c empty" style="--d:${si * 5 + di}">+</div>`;
            }).join('')}`).join('')}
          </div>
          <div class="row between small" style="margin-top:14px"><span class="muted">13 repas planifiés</span><strong>${eur(planStats({ a: 'overnight-oats', b: 'chicken-rice-veg', c: 'veggie-curry', d: 'granola-bowl', e: 'salmon-quinoa', f: 'lasagna', g: 'chia-pudding', h: 'roast-chicken', i: 'overnight-oats', j: 'mediterranean-bowl', k: 'salmon-squash', l: 'pesto-pasta', m: 'chicken-mushrooms' }).sub)}</strong></div>
        </div>
      </div>
    </section>

    <section class="section section--olive season-band">
      <div class="season-band__word" data-speed-x="-0.25" aria-hidden="true">${season.name} ${season.name} ${season.name}</div>
      <div class="container split split--rev">
        <div>
          <span class="eyebrow">Collection de saison · ${season.months}</span>
          <h2 data-split>Collection <em>${season.name}</em></h2>
          <p class="muted-light">${season.text} Ingrédients à l’honneur :</p>
          <div class="chips" style="margin-bottom:28px">${season.ingredients.map((i) => `<span class="chip">${i}</span>`).join('')}</div>
          <div class="grid g3 season-mini" style="gap:12px;margin-bottom:28px">
            ${seasonal.map((p) => `<a href="#/produit/${p.id}" style="text-decoration:none" data-cursor="Voir"><div class="media media--11" style="border-radius:16px">${pic(p.img, p.name, 400)}</div><div class="small" style="margin-top:8px">${esc(p.name)}</div><div class="small muted-light">${eur(p.price)}</div></a>`).join('')}
          </div>
          ${seasonProducers.length ? `<p class="small muted-light">Avec ${seasonProducers.map((pr) => `<a href="#/nos-producteurs">${esc(pr.name)}</a>`).join(', ')}.</p>` : ''}
          <a href="#/collection-de-saison" class="btn btn--light btn--arrow magnetic">Découvrir la collection</a>
        </div>
        <div class="season-img" data-speed="0.08">${pic(season.img, `Ingrédients de saison — ${season.name}`, 1000)}</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Meilleures ventes & nouveautés</span><h2 data-split>Les plus <em>commandés</em></h2></div>
          <div class="row"><a href="#/carte/meilleures-ventes" class="link">Toute la carte →</a><div class="rail-nav"><button data-rail="-1" aria-label="Précédent">←</button><button data-rail="1" aria-label="Suivant">→</button></div></div>
        </div>
      </div>
      <div class="rail" data-drag>${best.map(productCard).join('')}</div>
    </section>

    <section class="section section--cream">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Box découverte</span><h2 data-split>Testez de <em>nouvelles</em> recettes</h2></div>
          <a href="#/box-decouverte" class="link">Toutes les box découverte →</a>
        </div>
        <div class="grid g4">${DISCOVERY.map(discoveryCard).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Nos producteurs locaux</span><h2 data-split>Ceux qui font <em>nos plats</em></h2></div>
          <p>Nous privilégions les producteurs locaux et régionaux lorsque c’est possible, et indiquons l’origine de chaque ingrédient.</p>
        </div>
        <div class="grid g4">${PRODUCERS.slice(0, 4).map(producerCard).join('')}</div>
        <div class="center" style="margin-top:36px"><a href="#/nos-producteurs" class="btn btn--dark btn--arrow magnetic">Rencontrer nos producteurs</a></div>
      </div>
      ${marquee(PRODUCERS.map((pr) => pr.name), 'marquee--outline')}
    </section>

    <section class="section section--cream">
      <div class="container">
        <div class="section-head"><div><span class="eyebrow">Comment ça marche</span><h2 data-split>Simple, du choix à la <em>livraison</em></h2></div></div>
        <div class="grid g4 how">
          <div class="how__step"><span class="how__icon">${icons.choose}</span><h3>Choisissez vos repas</h3><p>Parcourez la carte : petits-déjeuners, déjeuners, dîners, en-cas et desserts.</p></div>
          <div class="how__step"><span class="how__icon">${icons.custom}</span><h3>Personnalisez</h3><p>Portion, accompagnement, sauce à part, ingrédients retirés : à vous de voir.</p></div>
          <div class="how__step"><span class="how__icon">${icons.plan}</span><h3>Planifiez</h3><p>Répartissez vos repas avec le planning de la semaine, ou commandez à la carte.</p></div>
          <div class="how__step"><span class="how__icon">${icons.deliver}</span><h3>Recevez</h3><p>Livraison à domicile dans la métropole lyonnaise ou retrait sur place.</p></div>
        </div>
      </div>
    </section>

    <section class="section section--charcoal">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Rejoindre le Club</span><h2 data-split>Des avantages, <em>jamais</em> d’obligation</h2></div>
          <p>L’abonnement Club est facultatif : suspendez ou résiliez quand vous voulez, depuis votre espace client.</p>
        </div>
        <div class="grid g3">${MEMBERSHIPS.map((m) => tierCard(m, false)).join('')}</div>
        <p class="small muted-light" style="margin-top:20px">Tarifs et avantages indicatifs, à confirmer après étude des coûts et des marges.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="newsletter newsletter--card">
          <div class="newsletter__deco" aria-hidden="true"><span>✺</span><span>✺</span></div>
          <div>
            <span class="eyebrow">Lettre d’information</span>
            <h2 data-split>La Prep de la <em>Semaine</em></h2>
            <p>Chaque semaine : le nouveau menu, les produits de saison, un producteur à l’honneur et un conseil d’organisation. Désinscription en un clic.</p>
          </div>
          ${newsletterForm()}
        </div>
      </div>
    </section>`;
  },
};

function newsletterForm() {
  if (S.newsletter) return `<div class="notice notice--ok">Vous êtes inscrit·e à La Prep de la Semaine avec ${esc(S.newsletter)}. Merci !</div>`;
  return `<form data-form="newsletter">
    <div class="inline-field"><input type="email" name="email" required placeholder="Votre adresse e-mail" aria-label="Adresse e-mail"><button class="btn btn--primary">S’inscrire</button></div>
    <label class="check small"><input type="checkbox" name="consent" required> J’accepte de recevoir La Prep de la Semaine par e-mail. Mon adresse ne sera utilisée que pour cet envoi (voir la <a href="#/confidentialite" class="link">politique de confidentialité</a>).</label>
  </form>`;
}

function producerCard(pr) {
  return `<article class="producer">
    <div class="media">${pic(pr.img, pr.name, 700)}</div>
    <div class="producer__body">
      <div class="producer__loc">📍 ${esc(pr.location)} · ${esc(pr.dept)}</div>
      <h3>${esc(pr.name)}</h3>
      <div class="small muted" style="margin-bottom:10px">${esc(pr.type)}</div>
      <div class="chips">${pr.products.slice(0, 3).map((x) => `<span class="chip small" style="padding:4px 10px">${esc(x)}</span>`).join('')}</div>
    </div>
  </article>`;
}

function tierCard(m, light) {
  const feat = m.featured && !light;
  return `<div class="tier ${feat ? 'tier--feat' : ''} ${light ? 'tier--light' : ''}">
    <span class="eyebrow" style="${feat || light ? 'color:var(--olive)' : ''}">${m.featured ? 'Le plus choisi' : 'Le Club'}</span>
    <h3>${m.name}</h3>
    <div class="tier__price">${eur(m.price)}<small> / mois</small></div>
    <ul>${m.perks.map((x) => `<li>${x}</li>`).join('')}</ul>
    <a href="#/abonnement-club" class="btn ${feat || light ? 'btn--primary' : 'btn--light'}" ${light ? `data-subscribe="${m.id}"` : ''}>${light ? `Choisir ${m.name}` : 'Rejoindre le Club'}</a>
  </div>`;
}

function discoveryCard(b) {
  const full = round2(b.items.reduce((a, id) => a + P(id).price, 0));
  return `<article class="box-card">
    <a href="#/box/${b.id}" class="media media--43" aria-label="Voir le détail de ${esc(b.name)}">${pic(b.img, b.name, 700)}</a>
    <div class="box-card__body">
      <h3><a href="#/box/${b.id}">${esc(b.name)}</a></h3>
      <div style="margin-bottom:8px">${ratingLine(b.id)}</div>
      <p class="small muted">${esc(b.desc)}</p>
      <div class="meta"><span>${b.items.length} portions</span><span>${b.items.length} recettes</span></div>
      <ul>${b.items.map((id) => `<li><a href="#/produit/${id}" style="text-decoration:none">${esc(P(id).name)}</a></li>`).join('')}</ul>
      <div class="row between" style="margin-top:auto">
        <div class="price">${eur(b.price)}<span class="strike">${eur(full)}</span></div>
        <div class="row" style="gap:8px">
          <a href="#/box/${b.id}" class="btn btn--ghost btn--sm">Voir le détail</a>
          <button class="btn btn--primary btn--sm" data-add-discovery="${b.id}">Commander</button>
        </div>
      </div>
    </div>
  </article>`;
}
function addDiscovery(id) {
  const b = findBox(id);
  addBoxToBasket(b, b.items);
}

/* ================= OUR MENU ================= */
const MENU_FILTERS = [
  ['all', 'Tout'], ['breakfast', 'Petit-déjeuner'], ['lunch', 'Déjeuner'], ['dinner', 'Dîner'], ['snack', 'En-cas'], ['dessert', 'Desserts'],
  ['vegetarian', 'Végétarien'], ['seasonal', 'De saison'], ['bestseller', 'Meilleures ventes'], ['new', 'Nouveautés'],
];
VIEWS.menu = {
  title: 'La carte — PREP CLUB',
  render(filter = 'all') {
    return `${pageHero({ eyebrow: 'La carte', title: 'La carte de la semaine', text: 'Tous nos plats sont disponibles à l’unité. Filtrez par repas, par régime ou par envie, et consultez la composition complète de chaque recette.', crumbs: 'La carte' })}
    <section class="section--tight"><div class="container">
      <div class="filters" role="tablist" aria-label="Filtrer le catalogue">${MENU_FILTERS.map(([k, l]) => `<button class="filter ${k === filter ? 'active' : ''}" data-filter="${k}">${l}</button>`).join('')}</div>
      <div class="toolbar">
        <div class="row">
          <input class="input" type="search" id="menuSearch" placeholder="Rechercher un plat, un ingrédient…" aria-label="Rechercher">
          <select class="input" id="menuExclude" aria-label="Exclure un allergène">
            <option value="">Exclure un allergène…</option>${ALLERGENS.map((a) => `<option>${a}</option>`).join('')}
          </select>
          ${S.user ? `<label class="check small"><input type="checkbox" id="menuPrefs" ${S.prefs.apply ? 'checked' : ''}> Appliquer mes préférences</label>` : ''}
        </div>
        <select class="input" id="menuSort" aria-label="Trier">
          <option value="pop">Popularité</option><option value="asc">Prix croissant</option><option value="desc">Prix décroissant</option>
          <option value="kcal">Calories (croissant)</option><option value="prot">Protéines (décroissant)</option>
        </select>
      </div>
      <p class="small muted" id="menuInfo"></p>
      <div class="grid g4" id="menuGrid"></div>
    </div></section>`;
  },
  mount(filter = 'all') {
    let current = filter;
    const draw = () => {
      const q = $('#menuSearch').value.trim().toLowerCase();
      const excl = $('#menuExclude').value;
      const usePrefs = $('#menuPrefs') && $('#menuPrefs').checked;
      let list = PRODUCTS.filter((p) => {
        if (current !== 'all' && p.cat !== current && !p.tags.includes(current)) return false;
        if (q && !(`${p.name} ${p.short} ${p.ingredients}`.toLowerCase().includes(q))) return false;
        if (excl && p.allergens.includes(excl)) return false;
        if (usePrefs && !matchesPrefs(p)) return false;
        return true;
      });
      const sort = $('#menuSort').value;
      if (sort === 'asc') list.sort((a, b) => a.price - b.price);
      if (sort === 'desc') list.sort((a, b) => b.price - a.price);
      if (sort === 'kcal') list.sort((a, b) => kcalPortion(a) - kcalPortion(b));
      if (sort === 'prot') list.sort((a, b) => protPortion(b) - protPortion(a));
      if (sort === 'pop') list.sort((a, b) => (b.tags.includes('bestseller') ? 1 : 0) - (a.tags.includes('bestseller') ? 1 : 0));
      $('#menuGrid').innerHTML = list.length ? list.map(productCard).join('') : `<div class="empty-state" style="grid-column:1/-1"><h3>Aucun plat ne correspond</h3><p>Essayez un autre filtre ou une autre recherche.</p></div>`;
      $('#menuInfo').innerHTML = `${list.length} produit${list.length > 1 ? 's' : ''}${excl ? ` · Filtre basé sur la déclaration des 14 allergènes réglementaires. Il ne garantit pas l’absence de traces : consultez chaque fiche produit.` : ''}`;
    };
    $$('.filter').forEach((b) => b.addEventListener('click', () => {
      current = b.dataset.filter;
      $$('.filter').forEach((x) => x.classList.toggle('active', x === b));
      history.replaceState(null, '', `#/carte${current === 'all' ? '' : `/${SUB_SLUGS[current]}`}`);
      draw();
    }));
    ['#menuSearch', '#menuExclude', '#menuSort'].forEach((s) => $(s).addEventListener('input', draw));
    if ($('#menuPrefs')) $('#menuPrefs').addEventListener('change', (e) => { S.prefs.apply = e.target.checked; save(); draw(); });
    draw();
  },
};

/* ================= FICHE PRODUIT ================= */
VIEWS.product = {
  title: 'Produit — PREP CLUB',
  render(id) {
    const p = P(id);
    if (!p) return VIEWS.notfound.render();
    document.title = `${p.name} — PREP CLUB`;
    const st = p.storage || STORAGE_DEFAULTS[p.cat];
    const pr = p.prep || PREP_DEFAULTS[p.cat];
    const portionN = (v) => Math.round(((v * p.weight) / 100) * 10) / 10;
    const nrow = (label, key, unit, sub) => `<tr class="${sub ? 'sub' : ''}"><td>${label}</td><td class="num">${p.nutri[key].toLocaleString('fr-FR')} ${unit}</td><td class="num">${portionN(p.nutri[key]).toLocaleString('fr-FR')} ${unit}</td></tr>`;
    const hits = allergyHits(p);
    const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
    const fav = S.favorites.includes(p.id);
    return `<div class="container">
      <div class="crumbs" style="padding-top:28px"><a href="#/">Accueil</a> / <a href="#/carte">La carte</a> / <a href="#/carte/${SUB_SLUGS[p.cat]}">${CATEGORIES[p.cat]}</a> / ${esc(p.name)}</div>
      <div class="product">
        <div class="product__media">${pic(p.img, p.name, 1200)}</div>
        <div>
          <span class="eyebrow">${CATEGORIES[p.cat]}</span>
          <div class="row" style="gap:8px;margin-bottom:10px">${p.tags.map((t) => `<span class="tag ${t === 'vegetarian' ? 'tag--olive' : 'tag--sand'}">${TAG_LABELS[t]}</span>`).join('')}</div>
          <h1 style="font-size:clamp(2rem,4vw,2.8rem)">${esc(p.name)}</h1>
          <div class="row" style="margin-bottom:12px"><span id="pRating">${ratingLine(`produit:${p.id}`)}</span><button class="linklike small" id="goReviews">Lire et écrire un avis</button></div>
          <p class="muted">${esc(p.desc)}</p>
          <div class="product__price" id="pPrice">${eur(p.price)}</div>
          <div class="product__facts">
            <span><strong>${p.weight} g</strong> · ${p.portions || 1} portion${(p.portions || 1) > 1 ? 's' : ''}</span>
            <span><strong>${kcalPortion(p)} kcal</strong> / portion</span>
            <span><strong>${protPortion(p)} g</strong> protéines</span>
          </div>

          <div class="allergen-box ${hits.length ? 'alert' : ''}">
            ${hits.length ? `<strong>⚠ Attention : ce plat contient ${hits.join(', ')}, que vous avez déclaré dans vos allergies.</strong><br>` : ''}
            <strong>Allergènes :</strong> ${p.allergens.length ? p.allergens.join(', ') : 'aucun des 14 allergènes réglementaires dans la recette'}.
            ${p.traces ? `<br><span class="small">${esc(p.traces)}</span>` : ''}
          </div>

          <form class="customize" id="custForm">
            <h3>Personnaliser</h3>
            ${isMain(p) && p.supplements !== false ? `
              <div class="block"><div class="label" style="margin-bottom:8px">Taille de portion</div><div class="opt-group">${OPTIONS.main.portion.map((o, i) => `<label class="opt"><input type="radio" name="portion" value="${o.id}" ${i === 0 ? 'checked' : ''}><span>${o.label}${o.price ? ` <em>+${eur(o.price)}</em>` : ''}</span></label>`).join('')}</div></div>
              <div class="block"><div class="label" style="margin-bottom:8px">Accompagnement supplémentaire</div><div class="opt-group">${OPTIONS.main.sides.map((o, i) => `<label class="opt"><input type="radio" name="side" value="${o.id}" ${i === 0 ? 'checked' : ''}><span>${o.label}${o.price ? ` <em>+${eur(o.price)}</em>` : ''}</span></label>`).join('')}</div></div>
              <div class="block row">
                <label class="check"><input type="checkbox" name="protein"> Portion de protéines en plus <span class="muted">(+${eur(OPTIONS.main.extraProtein)})</span></label>
                <label class="check"><input type="checkbox" name="sauceSide"> Sauce à part</label>
              </div>` : ''}
            ${p.cat === 'breakfast' && p.supplements !== false ? `<div class="block"><div class="label" style="margin-bottom:8px">Topping</div><div class="opt-group">${OPTIONS.breakfast.toppings.map((o, i) => `<label class="opt"><input type="radio" name="topping" value="${o.id}" ${i === 0 ? 'checked' : ''}><span>${o.label}${o.price ? ` <em>+${eur(o.price)}</em>` : ''}</span></label>`).join('')}</div></div>` : ''}
            ${p.removable.length ? `<div class="block"><div class="label" style="margin-bottom:8px">Retirer un ingrédient</div><div class="row">${p.removable.map((r) => `<label class="check"><input type="checkbox" name="remove" value="${esc(r)}"> ${esc(r)}</label>`).join('')}</div></div>` : ''}
            <div class="block">
              <label class="label" for="pComment">Commentaire pour la préparation <span class="muted">(facultatif)</span></label>
              <textarea class="input" id="pComment" name="comment" maxlength="160" placeholder="Ex. : peu épicé, sans persil…" style="min-height:60px;margin-top:6px"></textarea>
              <div class="small muted" style="margin-top:6px">Un commentaire ne remplace pas la déclaration d’une allergie : les allergènes et risques de contamination croisée ci-dessus s’appliquent.</div>
            </div>
          </form>

          <div class="buy-row">
            <div class="qty" id="pQty"><button type="button" data-q="-1" aria-label="Diminuer">−</button><span>1</span><button type="button" data-q="1" aria-label="Augmenter">+</button></div>
            <button class="btn btn--primary" id="pAdd" ${p.soldOut || !PRODUCTS.includes(p) ? 'disabled' : ''}>${!PRODUCTS.includes(p) ? 'Plus disponible à la commande' : p.soldOut ? 'Épuisé pour le moment' : `Ajouter au panier · <span id="pTotal">${eur(p.price)}</span>`}</button>
            <button class="fav ${fav ? 'on' : ''}" data-fav="${p.id}" style="position:static;border:1px solid var(--line)" aria-label="Favori">${heart}</button>
          </div>
          <button class="btn btn--ghost btn--sm" style="margin-top:12px;border-color:var(--line)" id="pPlan">+ Ajouter à mon planning de la semaine</button>

          <div style="margin-top:36px">
            <details class="acc" open><summary>Composition</summary><div class="acc__body">
              <p><strong>Ingrédients :</strong> ${esc(p.ingredients)}</p>
              <p><strong>Allergènes :</strong> ${p.allergens.length ? p.allergens.join(', ') : 'aucun allergène réglementaire dans la recette'}.</p>
              <p class="muted">${esc(p.traces || 'Préparé dans un atelier qui manipule les 14 allergènes réglementaires.')}</p>
            </div></details>
            <details class="acc"><summary>Informations nutritionnelles</summary><div class="acc__body">
              <table class="data">
                <thead><tr><th>Valeurs moyennes</th><th class="num">Pour 100 g</th><th class="num">Par portion (${p.weight} g)</th></tr></thead>
                <tbody>
                  <tr><td>Énergie</td><td class="num">${Math.round(p.nutri.kcal * 4.184)} kJ / ${p.nutri.kcal} kcal</td><td class="num">${Math.round(kcalPortion(p) * 4.184)} kJ / ${kcalPortion(p)} kcal</td></tr>
                  ${nrow('Matières grasses', 'fat', 'g')}${nrow('dont acides gras saturés', 'sat', 'g', true)}
                  ${nrow('Glucides', 'carbs', 'g')}${nrow('dont sucres', 'sugars', 'g', true)}
                  ${nrow('Fibres alimentaires', 'fiber', 'g')}${nrow('Protéines', 'protein', 'g')}${nrow('Sel', 'salt', 'g')}
                </tbody>
              </table>
              <div class="demo-note">Projet étudiant : valeurs de démonstration, plausibles mais fictives. Une version commercialisée les calculerait à partir de la recette standardisée.</div>
            </div></details>
            <details class="acc"><summary>Provenance</summary><div class="acc__body">
              <table class="data">
                <thead><tr><th>Ingrédient</th><th>Producteur / fournisseur</th><th>Origine</th></tr></thead>
                <tbody>${p.origin.map((o) => {
                  const prod = o.producer && PROD(o.producer);
                  return `<tr><td>${esc(o.ing)}</td><td>${prod ? `<a href="#/nos-producteurs" class="link">${esc(prod.name)}</a><br><span class="small muted">${esc(prod.location)}</span>` : '<span class="muted">Fournisseur référencé</span>'}</td><td>${prod ? esc(prod.dept) : esc(o.region ? `${o.region}, ` : '')}${prod ? ', France' : esc(o.country)}</td></tr>`;
                }).join('')}</tbody>
              </table>
              <div class="demo-note">Producteurs cités à titre d’exemple de travail. Aucune mention « local » ne sera publiée sans justificatif.</div>
            </div></details>
            <details class="acc"><summary>Conservation</summary><div class="acc__body">
              <dl class="dl">
                <dt>Température</dt><dd>${st.temp}</dd>
                <dt>Date limite</dt><dd>Indiquée sur l’emballage (DLC).</dd>
                <dt>Après ouverture</dt><dd>${st.after}</dd>
                <dt>Congélation</dt><dd>${st.freeze}</dd>
              </dl>
            </div></details>
            <details class="acc"><summary>Préparation</summary><div class="acc__body">
              <dl class="dl">
                <dt>Réchauffage</dt><dd>${pr.method}</dd>
                <dt>Temps indicatif</dt><dd>${pr.time}</dd>
                <dt>Puissance</dt><dd>${pr.power}</dd>
                <dt>Emballage</dt><dd>${pr.pack}</dd>
                <dt>Conseil</dt><dd>${pr.tip}</dd>
              </dl>
            </div></details>
          </div>
        </div>
      </div>
    </div>
    ${reviewsSectionHtml('plat')}
    <section class="section"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Dans la même catégorie</span><h2>Vous aimerez aussi</h2></div></div>
      <div class="grid g4">${related.map(productCard).join('')}</div>
    </div></section>`;
  },
  mount(id) {
    const p = P(id);
    if (!p) return;
    let qty = 1;
    const form = $('#custForm');
    const readOpts = () => {
      const fd = new FormData(form);
      return {
        portion: fd.get('portion') || undefined,
        side: fd.get('side') || undefined,
        topping: fd.get('topping') || undefined,
        protein: fd.get('protein') === 'on',
        sauceSide: fd.get('sauceSide') === 'on',
        remove: fd.getAll('remove'),
        comment: (fd.get('comment') || '').trim(),
      };
    };
    const update = () => {
      const u = unitPrice(p, readOpts());
      $('#pPrice').textContent = eur(u);
      if ($('#pTotal')) $('#pTotal').textContent = eur(u * qty);
      $('#pQty span').textContent = qty;
    };
    form.addEventListener('input', update);
    form.addEventListener('submit', (e) => e.preventDefault());
    $$('#pQty button').forEach((b) => b.addEventListener('click', () => { qty = Math.max(1, Math.min(20, qty + Number(b.dataset.q))); update(); }));
    $('#pAdd').addEventListener('click', () => addProduct(p.id, qty, readOpts()));
    $('#pPlan').addEventListener('click', () => addToPlannerModal(p.id));
    mountReviews(`produit:${p.id}`, {
      ratingEl: '#pRating',
      verified: () => S.orders.some((o) => o.lines.some((l) => l.pid === p.id || (l.items || []).some((i) => i.pid === p.id))),
    });
  },
};

/* ================= MEAL FORMULAS ================= */
function formulaPricing(items, discount) {
  const full = round2(items.reduce((a, id) => a + P(id).price, 0));
  const price = round2(full * (1 - discount));
  return { full, price, saving: round2(full - price) };
}
function formulaCard(f) {
  const pr = formulaPricing(f.defaults, f.discount);
  return `<article class="box-card">
    <a href="#/box/${f.id}" class="media media--169" aria-label="Voir le détail de ${esc(f.name)}">${pic(f.img, f.name, 1000)}</a>
    <div class="box-card__body">
      <div class="row between"><h3 style="margin:0"><a href="#/box/${f.id}">${f.name}</a></h3><span class="saving">−${Math.round(f.discount * 100)} % vs à l’unité</span></div>
      <div style="margin:8px 0">${ratingLine(f.id)}</div>
      <p class="muted">${f.desc}</p>
      <div class="meta"><span><strong>${f.portions}</strong> portions</span><span>${f.slots.map(([c, n]) => `${n} × ${CATEGORIES[c]}`).join(' · ')}</span><span>Recettes modifiables</span></div>
      <div class="row between" style="margin-top:auto;padding-top:12px">
        <div><div class="price">${eur(pr.price)}<span class="strike">${eur(pr.full)}</span></div><div class="small" style="color:var(--olive)">Économie : ${eur(pr.saving)}</div></div>
        <div class="row" style="gap:8px">
          <a href="#/box/${f.id}" class="btn btn--ghost btn--sm">Voir le détail & personnaliser</a>
          <button class="btn btn--primary btn--sm" data-formula-add="${f.id}">Ajouter</button>
        </div>
      </div>
    </div>
  </article>`;
}
VIEWS.formulas = {
  title: 'Formules — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Formules', title: 'Des formules prêtes, entièrement modifiables', text: 'Choisissez une formule, ajustez les recettes si vous le souhaitez, et profitez d’un prix réduit par rapport à l’achat à l’unité. Une formule n’entraîne jamais d’abonnement.', crumbs: 'Formules' })}
    <section class="section"><div class="container">
      <div class="grid g2">${FORMULAS.map(formulaCard).join('')}</div>
      <div class="box-card" style="margin-top:24px;flex-direction:row;flex-wrap:wrap">
        <div class="media" style="flex:1 1 320px;min-height:240px">${pic(IMG.tabletop, 'Composer sa box', 1000)}</div>
        <div class="box-card__body" style="flex:1 1 320px;justify-content:center">
          <span class="eyebrow">Box sur mesure</span>
          <h3>Vous préférez partir d’une page blanche ?</h3>
          <p class="muted">Composez votre propre box produit par produit, de ${BOX_RULES.minItems} à ${BOX_RULES.maxItems} articles, avec jusqu’à −${Math.round(BOX_RULES.tiers[BOX_RULES.tiers.length - 1].pct * 100)} % selon la quantité.</p>
          <div><a href="#/composer-ma-box" class="btn btn--dark">Composer ma box</a></div>
        </div>
      </div>
    </div></section>`;
  },
};

/* ================= DÉTAIL D'UNE BOX (formules & box découverte) ================= */
function findBox(id) {
  const f = FORMULAS.find((x) => x.id === id);
  if (f) return { ...f, kind: 'formula', items: [...f.defaults] };
  const d = DISCOVERY.find((x) => x.id === id);
  if (d) return { ...d, kind: 'discovery', items: [...d.items], portions: d.items.length };
  return null;
}
function boxPricing(b, items) {
  if (b.kind === 'formula') return formulaPricing(items, b.discount);
  const full = round2(items.reduce((a, id) => a + P(id).price, 0));
  return { full, price: b.price, saving: round2(full - b.price) };
}
function addBoxToBasket(b, items, qty = 1, comment = '') {
  const pr = boxPricing(b, items);
  const counts = {};
  items.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
  addBox({
    boxId: b.id, name: b.name, img: b.img, unit: pr.price, qty, comment,
    labels: [`${items.length} portions`, ...Object.entries(counts).map(([id, q]) => `${q > 1 ? `${q} × ` : ''}${P(id).name}`), ...(comment ? [`« ${comment} »`] : [])],
    items: Object.entries(counts).map(([pid, q]) => ({ pid, qty: q })),
  });
}

/* ---------- Avis clients ---------- */
function reviewsOf(id) { return (S.reviews && S.reviews[id]) || []; }
/* Modération du back-office : avis masqués retirés, réponses de l'équipe ajoutées.
   L'identifiant côté back-office est « S » + clé + rang de l'avis (voir js/admin/demo.js). */
function moderatedReviews(id) {
  const mod = (typeof readAdmin === 'function' && (readAdmin() || {}).reviews) || {};
  return reviewsOf(id).map((rv, i) => ({ rv, m: mod[`S${id}${i}`] || {} })).filter((x) => !x.m.hidden).map((x) => ({ ...x.rv, reply: x.m.reply || '' }));
}
function ratingOf(id) {
  const r = moderatedReviews(id);
  return r.length ? { avg: r.reduce((a, x) => a + x.rating, 0) / r.length, count: r.length } : null;
}
const fmtRating = (n) => n.toFixed(1).replace('.', ',');
function starsHtml(n) {
  const full = Math.round(n);
  return `<span class="stars" role="img" aria-label="${fmtRating(n)} sur 5">${'★'.repeat(full)}<span class="stars__off">${'★'.repeat(5 - full)}</span></span>`;
}
function ratingLine(id, hideEmpty = false) {
  const r = ratingOf(id);
  if (!r) return hideEmpty ? '' : '<span class="rating-line">Pas encore d’avis</span>';
  return `<span class="rating-line">${starsHtml(r.avg)} <span>${fmtRating(r.avg)} · ${r.count} avis</span></span>`;
}
const REVIEW_COPY = {
  box: { noun: 'cette box', placeholder: 'Qu’avez-vous pensé des recettes, des portions, de la livraison ?' },
  plat: { noun: 'ce plat', placeholder: 'Goût, portion, réchauffage… qu’avez-vous pensé de ce plat ?' },
};
const displayName = () => (S.user ? `${S.user.first}${S.user.last ? ` ${S.user.last.charAt(0)}.` : ''}` : '');

/* Section « Avis clients » réutilisée sur les fiches produits et les pages box */
function reviewsSectionHtml(kind) {
  const c = REVIEW_COPY[kind];
  return `<section class="section section--cream" id="avis" data-review-kind="${kind}"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Avis clients</span><h2>Ce qu’en pensent nos clients</h2></div></div>
      <div class="reviews">
        <div>
          <div class="panel" id="reviewSummary"></div>
          <form class="panel" id="reviewForm">
            <h3>Donner mon avis</h3>
            <div class="label" style="margin-bottom:6px">Ma note</div>
            <div class="star-pick" role="radiogroup" aria-label="Note sur 5">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" role="radio" aria-checked="false" aria-label="${n} étoile${n > 1 ? 's' : ''}">★</button>`).join('')}</div>
            <div class="field" style="margin-top:12px"><label for="rvName">Prénom affiché</label><input class="input" id="rvName" required maxlength="40" value="${esc(displayName())}"></div>
            <div class="field"><label for="rvText">Mon commentaire</label><textarea class="input" id="rvText" required minlength="10" maxlength="800" placeholder="${c.placeholder}"></textarea></div>
            <label class="check small" style="margin-bottom:14px"><input type="checkbox" id="rvConsent" required> J’accepte que mon prénom et mon avis soient publiés sur le site.</label>
            <div id="rvErr" class="notice notice--warn hidden"></div>
            <button class="btn btn--primary btn--block">Publier mon avis</button>
            <p class="small muted" style="margin-top:10px">Démonstration : les avis affichés sont fictifs ou déposés par des visiteurs de la démo ; ils sont enregistrés dans ce navigateur et modérés depuis le CRM.</p>
          </form>
        </div>
        <div id="reviewList"></div>
      </div>
    </div></section>`;
}
function mountReviews(key, { ratingEl, verified }) {
  const noun = REVIEW_COPY[$('#avis').dataset.reviewKind].noun;
  let rating = 0;
  const setStars = (n) => {
    rating = n;
    $$('[data-star]').forEach((x) => { x.classList.toggle('on', Number(x.dataset.star) <= n); x.setAttribute('aria-checked', String(Number(x.dataset.star) === n)); });
  };
  const draw = () => {
    const list = moderatedReviews(key).sort((a, c) => c.date.localeCompare(a.date));
    const r = ratingOf(key);
    if (ratingEl) $(ratingEl).innerHTML = ratingLine(key);
    $('#reviewSummary').innerHTML = r ? `<div class="row" style="gap:14px;margin-bottom:12px"><div class="rating-big">${fmtRating(r.avg)}</div><div>${starsHtml(r.avg)}<div class="small muted">${r.count} avis</div></div></div>
      ${[5, 4, 3, 2, 1].map((n) => { const c = list.filter((x) => x.rating === n).length; return `<div class="dist"><span>${n} ★</span><div class="progress"><div style="width:${(c / r.count) * 100}%"></div></div><span>${c}</span></div>`; }).join('')}`
      : `<h3 style="margin:0 0 6px">Aucun avis pour le moment</h3><p class="small muted" style="margin:0">Vous avez goûté ${noun} ? Soyez le premier à partager votre expérience.</p>`;
    $('#reviewList').innerHTML = list.length ? list.map((rv) => `<article class="review">
      <div class="review__head"><div>${starsHtml(rv.rating)} <strong style="margin-left:6px">${esc(rv.name)}</strong> ${rv.verified ? '<span class="tag tag--line">Achat vérifié</span>' : ''}</div><span class="small muted">${fmtDate(rv.date)}</span></div>
      <p style="margin:0 0 12px;white-space:pre-line">${esc(rv.text)}</p>
      ${rv.reply ? `<div class="review-reply"><strong>Réponse de PREP CLUB</strong><p>${esc(rv.reply)}</p></div>` : ''}
      <div class="row small"><button class="linklike small" data-helpful="${rv.id}">👍 Utile (${rv.helpful || 0})</button><button class="remove" data-rvdel="${rv.id}">Supprimer mon avis</button></div>
    </article>`).join('') : '<div class="empty-state" style="padding:40px 24px"><p style="margin:0">Les avis publiés apparaîtront ici.</p></div>';
    $$('[data-helpful]').forEach((btn) => btn.onclick = () => { const rv = reviewsOf(key).find((x) => x.id === btn.dataset.helpful); rv.helpful = (rv.helpful || 0) + 1; save(); draw(); });
    $$('[data-rvdel]').forEach((btn) => btn.onclick = () => { S.reviews[key] = reviewsOf(key).filter((x) => x.id !== btn.dataset.rvdel); save(); draw(); toast('Avis supprimé'); });
  };
  const go = $('#goReviews');
  if (go) go.onclick = () => $('#avis').scrollIntoView({ behavior: 'smooth' });
  $$('[data-star]').forEach((btn) => btn.onclick = () => setStars(Number(btn.dataset.star)));
  $('#reviewForm').onsubmit = (e) => {
    e.preventDefault();
    const err = $('#rvErr');
    if (!rating) { err.textContent = 'Merci de choisir une note de 1 à 5 étoiles.'; err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    if (!S.reviews[key]) S.reviews[key] = [];
    S.reviews[key].push({ id: uid(), name: $('#rvName').value.trim(), rating, text: $('#rvText').value.trim(), date: new Date().toISOString(), helpful: 0, verified: verified() });
    save();
    e.target.reset();
    setStars(0);
    $('#rvName').value = displayName();
    draw();
    toast('Merci pour votre avis !');
  };
  draw();
}

VIEWS.box = {
  title: 'Box — PREP CLUB',
  nav: (id) => (FORMULAS.some((f) => f.id === id) ? 'formulas' : 'discovery'),
  render(id) {
    const b = findBox(id);
    if (!b) return VIEWS.notfound.render();
    document.title = `${b.name} — PREP CLUB`;
    const parent = b.kind === 'formula' ? ['#/formules', 'Formules'] : ['#/box-decouverte', 'Box découverte'];
    const others = (b.kind === 'formula' ? FORMULAS : DISCOVERY).filter((x) => x.id !== id).slice(0, 3);
    const st = STORAGE_DEFAULTS.lunch;
    return `<div class="container">
      <div class="crumbs" style="padding-top:28px"><a href="#/">Accueil</a> / <a href="${parent[0]}">${parent[1]}</a> / ${esc(b.name)}</div>
      <div class="product">
        <div class="product__media">${pic(b.img, b.name, 1200)}</div>
        <div>
          <span class="eyebrow">${b.kind === 'formula' ? 'Formule' : 'Box découverte'}</span>
          <h1 style="font-size:clamp(2rem,4vw,2.8rem)">${esc(b.name)}</h1>
          <div class="row" style="margin-bottom:12px"><span id="boxRating">${ratingLine(id)}</span><button class="linklike small" id="goReviews">Lire et écrire un avis</button></div>
          <p class="muted">${esc(b.desc)}</p>
          <div id="boxPrice"></div>
          <div class="product__facts" id="boxFacts"></div>
          <div id="boxAllergens"></div>

          <div class="customize">
            <h3>${b.kind === 'formula' ? 'Composition — choisissez vos recettes' : 'Composition de la box'}</h3>
            <p class="small muted">${b.kind === 'formula' ? 'Remplacez n’importe quelle recette : le prix, l’économie et les valeurs nutritionnelles se mettent à jour.' : 'Une sélection composée par notre équipe. Chaque recette est détaillée sur sa fiche produit.'}</p>
            <div id="boxItems"></div>
          </div>

          <div class="field">
            <label class="label" for="boxComment">Commentaire pour la préparation <span class="muted">(facultatif)</span></label>
            <textarea class="input" id="boxComment" maxlength="200" placeholder="Ex. : sauces à part, peu épicé, merci de regrouper les dîners…" style="min-height:70px"></textarea>
            <span class="small muted">Un commentaire ne remplace pas la déclaration d’une allergie : les allergènes ci-dessus s’appliquent.</span>
          </div>
          <div class="buy-row">
            <div class="qty" id="boxQty"><button type="button" data-q="-1" aria-label="Diminuer">−</button><span>1</span><button type="button" data-q="1" aria-label="Augmenter">+</button></div>
            <button class="btn btn--primary" id="boxAdd">Ajouter au panier · <span id="boxTotal"></span></button>
          </div>
          <div class="notice">Achat ponctuel : aucun abonnement, aucun renouvellement automatique.</div>

          <div style="margin-top:28px">
            <details class="acc" open><summary>Valeurs nutritionnelles de la box</summary><div class="acc__body" id="boxNutri"></div></details>
            <details class="acc"><summary>Allergènes recette par recette</summary><div class="acc__body" id="boxAllergenTable"></div></details>
            <details class="acc"><summary>Conservation & préparation</summary><div class="acc__body">
              <dl class="dl"><dt>Température</dt><dd>${st.temp}</dd><dt>Date limite</dt><dd>Indiquée sur chaque emballage (DLC propre à chaque recette).</dd><dt>Après ouverture</dt><dd>${st.after}</dd><dt>Réchauffage</dt><dd>Instructions détaillées sur la fiche de chaque recette et sur l’étiquette.</dd></dl>
            </div></details>
            <details class="acc"><summary>Livraison</summary><div class="acc__body">
              <p>Livraison à domicile (${eur(DELIVERY.homeFee)}, offerte dès ${DELIVERY.freeFrom} €) ou retrait sur place gratuit. Toutes les recettes de la box sont livrées ensemble, en conditions réfrigérées. <a href="#/livraison" class="link">Zones et créneaux</a></p>
            </div></details>
          </div>
        </div>
      </div>
    </div>

    ${reviewsSectionHtml('box')}

    <section class="section"><div class="container">
      <div class="section-head"><div><span class="eyebrow">À découvrir aussi</span><h2>${b.kind === 'formula' ? 'Les autres formules' : 'Les autres box découverte'}</h2></div></div>
      <div class="grid g3">${others.map(b.kind === 'formula' ? formulaCard : discoveryCard).join('')}</div>
    </div></section>`;
  },
  mount(id) {
    const b = findBox(id);
    if (!b) return;
    const items = [...b.items];
    let qty = 1;

    const draw = () => {
      const pr = boxPricing(b, items);
      const prods = items.map(P);
      const kcal = prods.reduce((a, p) => a + kcalPortion(p), 0);
      const prot = Math.round(prods.reduce((a, p) => a + protPortion(p), 0));
      const allergens = ALLERGENS.filter((a) => prods.some((p) => p.allergens.includes(a)));
      const hits = S.prefs.allergyConsent ? allergens.filter((a) => S.prefs.allergies.includes(a)) : [];
      $('#boxPrice').innerHTML = `<div class="product__price">${eur(pr.price)}<span class="strike">${eur(pr.full)}</span></div>${pr.saving > 0 ? `<span class="saving">Économie de ${eur(pr.saving)} par rapport à l’achat à l’unité</span>` : ''}`;
      $('#boxFacts').innerHTML = `<span><strong>${items.length}</strong> portions</span><span><strong>${new Set(items).size}</strong> recettes</span><span><strong>${eur(pr.price / items.length)}</strong> / portion</span><span><strong>${Math.round(kcal / items.length)} kcal</strong> en moyenne / portion</span>`;
      $('#boxAllergens').innerHTML = `<div class="allergen-box ${hits.length ? 'alert' : ''}">
        ${hits.length ? `<strong>⚠ Attention : cette box contient ${hits.join(', ')}, que vous avez déclaré dans vos allergies.</strong><br>` : ''}
        <strong>Allergènes présents dans la box :</strong> ${allergens.length ? allergens.join(', ') : 'aucun des 14 allergènes réglementaires'}.<br>
        <span class="small">Détail recette par recette ci-dessous. Préparé dans un atelier manipulant les 14 allergènes réglementaires.</span></div>`;

      if (b.kind === 'formula') {
        let idx = 0;
        $('#boxItems').innerHTML = b.slots.map(([cat, n]) => {
          const rows = [];
          for (let i = 0; i < n; i++, idx++) {
            const p = P(items[idx]);
            rows.push(`<div class="box-row">${pic(p.img, '', 160)}
              <div><label class="small muted" for="bx${idx}">${CATEGORIES[cat]} · portion ${i + 1}</label>
                <select class="input" id="bx${idx}" data-bx="${idx}">${PRODUCTS.filter((x) => x.cat === cat).map((x) => `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${esc(x.name)} — ${eur(x.price)}</option>`).join('')}</select></div>
              <div class="small muted" style="text-align:right">${kcalPortion(p)} kcal<br><a href="#/produit/${p.id}" class="link">Fiche</a></div></div>`);
          }
          return `<h4 style="margin:16px 0 4px">${CATEGORIES[cat]}</h4>${rows.join('')}`;
        }).join('');
      } else {
        $('#boxItems').innerHTML = prods.map((p) => `<div class="box-row">${pic(p.img, '', 160)}
          <div><a href="#/produit/${p.id}" style="text-decoration:none;font-weight:500">${esc(p.name)}</a><div class="small muted">${CATEGORIES[p.cat]} · ${p.weight} g · ${esc(p.short)}</div></div>
          <div class="small muted" style="text-align:right">${kcalPortion(p)} kcal<br>${eur(p.price)}</div></div>`).join('');
      }

      $('#boxNutri').innerHTML = `<table class="data"><thead><tr><th>Recette</th><th class="num">Énergie</th><th class="num">Protéines</th><th class="num">Prix à l’unité</th></tr></thead>
        <tbody>${prods.map((p) => `<tr><td>${esc(p.name)}</td><td class="num">${kcalPortion(p)} kcal</td><td class="num">${protPortion(p).toLocaleString('fr-FR')} g</td><td class="num">${eur(p.price)}</td></tr>`).join('')}
        <tr><td><strong>Total de la box</strong></td><td class="num"><strong>${kcal.toLocaleString('fr-FR')} kcal</strong></td><td class="num"><strong>${prot} g</strong></td><td class="num"><strong>${eur(pr.full)}</strong></td></tr></tbody></table>
        <div class="demo-note">Projet étudiant : valeurs de démonstration, plausibles mais fictives.</div>`;
      $('#boxAllergenTable').innerHTML = `<table class="data"><thead><tr><th>Recette</th><th>Allergènes</th></tr></thead><tbody>${[...new Set(items)].map(P).map((p) => `<tr><td><a href="#/produit/${p.id}" class="link">${esc(p.name)}</a></td><td>${p.allergens.length ? p.allergens.join(', ') : '—'}${p.traces ? `<br><span class="small muted">${esc(p.traces)}</span>` : ''}</td></tr>`).join('')}</tbody></table>`;
      $('#boxTotal').textContent = eur(pr.price * qty);
      $('#boxQty span').textContent = qty;
      $$('[data-bx]').forEach((sel) => sel.onchange = () => { items[Number(sel.dataset.bx)] = sel.value; draw(); });
    };

    $$('#boxQty button').forEach((btn) => btn.onclick = () => { qty = Math.max(1, Math.min(10, qty + Number(btn.dataset.q))); draw(); });
    $('#boxAdd').onclick = () => addBoxToBasket(b, items, qty, $('#boxComment').value.trim());
    draw();
    mountReviews(id, { ratingEl: '#boxRating', verified: () => S.orders.some((o) => o.lines.some((l) => l.boxId === id)) });
  },
};

/* ================= DISCOVERY BOXES ================= */
VIEWS.discovery = {
  title: 'Box découverte — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Box découverte', title: 'Découvrez nos recettes, sélection par sélection', text: 'Des box thématiques composées par notre équipe pour goûter plusieurs recettes à prix doux. Idéal pour une première commande.', img: IMG.spread, crumbs: 'Box découverte' })}
    <section class="section"><div class="container">
      <div class="grid g2">${DISCOVERY.map(discoveryCard).join('')}</div>
      <div class="notice" style="margin-top:32px">Les box découverte sont des achats ponctuels : aucun engagement, aucun renouvellement automatique. Les recettes peuvent évoluer selon les saisons et les disponibilités.</div>
    </div></section>`;
  },
};

/* ================= SEASONAL COLLECTION ================= */
VIEWS.seasonal = {
  title: 'Collection de saison — PREP CLUB',
  render(sel) {
    const key = SEASONS[sel] ? sel : CURRENT_SEASON;
    const s = SEASONS[key];
    const products = PRODUCTS.filter((p) => p.season === key);
    const producers = (s.producers || []).map(PROD);
    const isCurrent = key === CURRENT_SEASON;
    return `${pageHero({ eyebrow: 'Collection de saison', title: `Collection ${s.name}`, text: `${s.text} ${s.months}.`, img: s.img, crumbs: 'Collection de saison' })}
    <section class="section"><div class="container">
      <div class="season-tabs">${Object.entries(SEASONS).map(([k, v]) => `<button class="${k === key ? 'active' : ''}" data-season="${k}">${v.name}${k === CURRENT_SEASON ? ' · en cours' : ''}</button>`).join('')}</div>
      <div class="split" style="align-items:start;margin-bottom:56px">
        <div>
          <h2>Les ingrédients de la saison</h2>
          <p class="muted">Chaque collection met en avant des produits récoltés à leur meilleur moment, auprès de producteurs de la région quand c’est possible.</p>
          <div class="chips">${s.ingredients.map((i) => `<span class="chip">${i}</span>`).join('')}</div>
        </div>
        <div>
          ${producers.length ? `<h3>Producteurs associés</h3><div class="stack">${producers.map((pr) => `<div class="row" style="gap:14px;flex-wrap:nowrap"><div class="media media--11" style="width:72px;border-radius:12px;flex-shrink:0">${pic(pr.img, pr.name, 200)}</div><div><strong>${esc(pr.name)}</strong><div class="small muted">${esc(pr.type)} · ${esc(pr.location)}</div></div></div>`).join('')}</div><a href="#/nos-producteurs" class="link" style="display:inline-block;margin-top:16px">Rencontrer nos producteurs →</a>` : `<div class="notice">Les producteurs associés à cette collection seront présentés à son lancement, une fois les partenariats vérifiés.</div>`}
        </div>
      </div>
      ${isCurrent && products.length ? `
        <div class="section-head"><div><h2>Les recettes de la collection</h2></div><button class="btn btn--primary" data-add-discovery="decouverte-saison">Commander la box découverte de saison</button></div>
        <div class="grid g4">${products.map(productCard).join('')}</div>` : `
        <div class="empty-state"><h3>Collection ${s.name} — bientôt</h3><p>Cette collection sera disponible ${s.months.toLowerCase()}. Inscrivez-vous à La Prep de la Semaine pour être prévenu·e de son lancement.</p><a href="#/collection-de-saison" class="btn btn--dark">Voir la collection en cours</a></div>`}
    </div></section>`;
  },
  mount() {
    $$('[data-season]').forEach((b) => b.addEventListener('click', () => { location.hash = `#/collection-de-saison/${SUB_SLUGS[b.dataset.season]}`; }));
  },
};

/* ================= BUILD YOUR OWN BOX ================= */
const builder = { step: 1, type: 'free', items: {}, cat: 'all' };
function boxCalc() {
  const lines = Object.entries(builder.items).filter(([, v]) => v.qty > 0).map(([pid, v]) => {
    const p = P(pid);
    const opts = { portion: v.generous ? 'generous' : 'classic', protein: v.protein };
    const unit = unitPrice(p, opts);
    return { p, qty: v.qty, unit, supp: round2(unit - p.price), opts };
  });
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const sub = round2(lines.reduce((a, l) => a + l.unit * l.qty, 0));
  const tier = [...BOX_RULES.tiers].reverse().find((t) => count >= t.min);
  const disc = tier ? round2(sub * tier.pct) : 0;
  const next = BOX_RULES.tiers.find((t) => count < t.min);
  return { lines, count, sub, tier, disc, total: round2(sub - disc), next };
}
VIEWS.build = {
  title: 'Composer ma box — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Composer ma box', title: 'Composez votre box, produit par produit', text: `Choisissez un type de box, sélectionnez vos recettes et quantités, personnalisez-les : le prix se calcule en temps réel. De ${BOX_RULES.minItems} à ${BOX_RULES.maxItems} articles.`, crumbs: 'Composer ma box' })}
    <div class="container"><div class="builder">
      <div>
        <div class="stepper" id="bStepper"></div>
        <div id="bStep"></div>
      </div>
      <aside class="summary" id="bSummary" aria-live="polite"></aside>
    </div></div>`;
  },
  mount() { drawBuilder(); },
};
function drawBuilder() {
  const steps = ['Type de box', 'Produits & quantités', 'Personnalisation', 'Récapitulatif'];
  const c = boxCalc();
  $('#bStepper').innerHTML = steps.map((s, i) => `<button class="${builder.step === i + 1 ? 'active' : builder.step > i + 1 ? 'done' : ''}" data-bstep="${i + 1}" ${i + 1 > 2 && c.count < BOX_RULES.minItems ? 'disabled' : ''}><b>Étape ${i + 1}</b>${s}</button>`).join('');
  const type = BOX_RULES.types.find((t) => t.id === builder.type);
  let html = '';
  if (builder.step === 1) {
    html = `<h2>1. Quel type de box ?</h2><p class="muted">Le type détermine les catégories disponibles. Vous pourrez changer d’avis à tout moment.</p>
      <div class="grid g2">${BOX_RULES.types.map((t) => `<button class="type-card ${t.id === builder.type ? 'sel' : ''}" data-btype="${t.id}"><div class="media">${pic(t.img, '', 600)}</div><div class="t"><strong>${t.name}</strong><span>${t.desc}</span></div></button>`).join('')}</div>
      <div class="row" style="justify-content:flex-end;margin-top:24px"><button class="btn btn--primary" data-bgo="2">Choisir mes produits →</button></div>`;
  } else if (builder.step === 2) {
    const cats = type.cats;
    const list = PRODUCTS.filter((p) => cats.includes(p.cat) && (builder.cat === 'all' || p.cat === builder.cat));
    html = `<h2>2. Produits & quantités</h2><p class="muted">${type.name} · ${c.count} / ${BOX_RULES.maxItems} articles</p>
      <div class="filters">${['all', ...cats].map((k) => `<button class="filter ${builder.cat === k ? 'active' : ''}" data-bcat="${k}">${k === 'all' ? 'Tout' : CATEGORIES[k]}</button>`).join('')}</div>
      <div class="b-list">${list.map((p) => {
        const q = builder.items[p.id] ? builder.items[p.id].qty : 0;
        return `<div class="b-item ${q ? 'in' : ''}">${pic(p.img, '', 200)}<div><h4>${esc(p.name)}</h4><div class="small muted">${eur(p.price)} · ${kcalPortion(p)} kcal</div><a href="#/produit/${p.id}" class="small link" target="_blank" rel="noopener">Fiche produit</a></div>${qtyControl(q, `data-bitem="${p.id}"`, true)}</div>`;
      }).join('')}</div>
      <div class="row between" style="margin-top:24px"><button class="btn btn--ghost" data-bgo="1">← Type de box</button><button class="btn btn--primary" data-bgo="3" ${c.count < BOX_RULES.minItems ? 'disabled' : ''}>Personnaliser →</button></div>`;
  } else if (builder.step === 3) {
    html = `<h2>3. Personnalisation</h2><p class="muted">Options disponibles pour les déjeuners et dîners. Le prix unitaire est ajusté automatiquement.</p>
      <div class="stack">${c.lines.map((l) => `<div class="b-item in">${pic(l.p.img, '', 200)}<div><h4>${esc(l.p.name)} <span class="muted">× ${l.qty}</span></h4>
        ${isMain(l.p) ? `<div class="row small" style="margin-top:6px"><label class="check"><input type="checkbox" data-bopt="generous" data-pid="${l.p.id}" ${builder.items[l.p.id].generous ? 'checked' : ''}> Portion généreuse (+${eur(2.9)})</label><label class="check"><input type="checkbox" data-bopt="protein" data-pid="${l.p.id}" ${builder.items[l.p.id].protein ? 'checked' : ''}> Protéines en plus (+${eur(OPTIONS.main.extraProtein)})</label></div>` : '<div class="small muted">Pas d’option pour ce produit.</div>'}
        </div><strong>${eur(l.unit)}</strong></div>`).join('')}</div>
      <div class="row between" style="margin-top:24px"><button class="btn btn--ghost" data-bgo="2">← Produits</button><button class="btn btn--primary" data-bgo="4">Voir le récapitulatif →</button></div>`;
  } else {
    html = `<h2>4. Récapitulatif</h2>
      <div class="panel"><table class="data"><thead><tr><th>Produit</th><th class="num">Qté</th><th class="num">Prix unitaire</th><th class="num">Suppléments</th><th class="num">Total</th></tr></thead>
      <tbody>${c.lines.map((l) => `<tr><td>${esc(l.p.name)}${l.opts.portion === 'generous' ? '<br><span class="small muted">Portion généreuse</span>' : ''}${l.opts.protein ? '<br><span class="small muted">+ Protéines</span>' : ''}</td><td class="num">${l.qty}</td><td class="num">${eur(l.p.price)}</td><td class="num">${l.supp ? `+${eur(l.supp)}` : '—'}</td><td class="num">${eur(l.unit * l.qty)}</td></tr>`).join('')}</tbody></table></div>
      <div class="row between" style="margin-top:24px"><button class="btn btn--ghost" data-bgo="3">← Personnalisation</button><button class="btn btn--primary" id="bAdd">Ajouter la box au panier · ${eur(c.total)}</button></div>`;
  }
  $('#bStep').innerHTML = html;

  $('#bSummary').innerHTML = `<h3>Ma box</h3><div class="small muted" style="margin-bottom:10px">${type.name}</div>
    <div class="summary__lines">${c.lines.length ? c.lines.map((l) => `<div><span>${l.qty} × ${esc(l.p.name)}${l.supp ? ` <span class="muted">(+${eur(l.supp)})</span>` : ''}</span><span>${eur(l.unit * l.qty)}</span></div>`).join('') : '<p class="muted">Aucun produit sélectionné.</p>'}</div>
    <div class="progress"><div style="width:${Math.min(100, (c.count / BOX_RULES.maxItems) * 100)}%"></div></div>
    <div class="small muted">${c.count} article${c.count > 1 ? 's' : ''} · min. ${BOX_RULES.minItems} · max. ${BOX_RULES.maxItems}</div>
    ${c.count < BOX_RULES.minItems ? `<div class="notice notice--warn">Encore ${BOX_RULES.minItems - c.count} article${BOX_RULES.minItems - c.count > 1 ? 's' : ''} pour valider votre box.</div>` : ''}
    ${c.next ? `<div class="notice">Dès ${c.next.min} articles : −${Math.round(c.next.pct * 100)} % sur la box.</div>` : ''}
    <div class="totals" style="margin-top:12px">
      <div><span>Sous-total</span><span>${eur(c.sub)}</span></div>
      ${c.disc ? `<div class="disc"><span>Remise box (−${Math.round(c.tier.pct * 100)} %)</span><span>−${eur(c.disc)}</span></div>` : ''}
      <div class="grand"><span>Total</span><span>${eur(c.total)}</span></div>
    </div>`;

  $$('[data-bstep]').forEach((b) => b.onclick = () => { builder.step = Number(b.dataset.bstep); drawBuilder(); });
  $$('[data-bgo]').forEach((b) => b.onclick = () => { builder.step = Number(b.dataset.bgo); drawBuilder(); window.scrollTo({ top: $('.builder').offsetTop - 80, behavior: 'smooth' }); });
  $$('[data-btype]').forEach((b) => b.onclick = () => {
    builder.type = b.dataset.btype;
    builder.cat = 'all';
    const cats = BOX_RULES.types.find((t) => t.id === builder.type).cats;
    Object.keys(builder.items).forEach((pid) => { if (!cats.includes(P(pid).cat)) delete builder.items[pid]; });
    drawBuilder();
  });
  $$('[data-bcat]').forEach((b) => b.onclick = () => { builder.cat = b.dataset.bcat; drawBuilder(); });
  $$('[data-bitem]').forEach((el) => $$('button', el).forEach((btn) => btn.onclick = () => {
    const pid = el.dataset.bitem;
    const cur = builder.items[pid] || { qty: 0, generous: false, protein: false };
    const delta = Number(btn.dataset.q);
    if (delta > 0 && boxCalc().count >= BOX_RULES.maxItems) { toast(`Maximum ${BOX_RULES.maxItems} articles par box`); return; }
    cur.qty = Math.max(0, cur.qty + delta);
    builder.items[pid] = cur;
    if (!cur.qty) delete builder.items[pid];
    drawBuilder();
  }));
  $$('[data-bopt]').forEach((cb) => cb.onchange = () => { builder.items[cb.dataset.pid][cb.dataset.bopt] = cb.checked; drawBuilder(); });
  const add = $('#bAdd');
  if (add) add.onclick = () => {
    const cc = boxCalc();
    addBox({
      name: `Ma box — ${type.name}`, img: cc.lines[0].p.img, unit: cc.total,
      labels: [`${cc.count} articles${cc.tier ? ` · −${Math.round(cc.tier.pct * 100)} %` : ''}`, ...cc.lines.map((l) => `${l.qty} × ${l.p.name}${l.opts.portion === 'generous' ? ' (généreuse)' : ''}${l.opts.protein ? ' (+ protéines)' : ''}`)],
      items: cc.lines.map((l) => ({ pid: l.p.id, qty: l.qty, opts: l.opts })),
    });
    builder.items = {};
    builder.step = 1;
    drawBuilder();
    openDrawer();
  };
}

/* ================= WEEKLY PLANNER ================= */
VIEWS.planner = {
  title: 'Planning de la semaine — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Planning de la semaine', title: 'Planifier ma semaine', text: 'Choisissez un plat pour chaque repas de la semaine. Tout reste modifiable jusqu’à la validation de votre commande.', crumbs: 'Planning de la semaine' })}
    <div class="container planner-wrap">
      <div class="planner-top">
        <div class="week-nav"><button id="wPrev" aria-label="Semaine précédente">‹</button><strong id="wLabel"></strong><button id="wNext" aria-label="Semaine suivante">›</button></div>
        <div class="row">
          <button class="btn btn--ghost btn--sm" id="wSuggest">✨ Suggérer une semaine</button>
          <button class="btn btn--ghost btn--sm" id="wClear">Vider</button>
        </div>
      </div>
      <div class="planner-layout">
        <div class="planner-scroll"><div class="pgrid" id="pgrid"></div></div>
        <aside class="summary" id="pSummary"></aside>
      </div>
    </div>`;
  },
  mount() {
    const minWeek = iso(mondayOf(new Date()));
    $('#wPrev').onclick = () => { const w = iso(addDays(fromIso(plannerWeek), -7)); if (w >= minWeek) { plannerWeek = w; drawPlanner(); } };
    $('#wNext').onclick = () => { plannerWeek = iso(addDays(fromIso(plannerWeek), 7)); drawPlanner(); };
    $('#wClear').onclick = () => confirmModal('Vider le planning ?', 'Tous les repas de cette semaine seront retirés.', 'Vider', () => { S.plans[plannerWeek] = {}; save(); drawPlanner(); });
    $('#wSuggest').onclick = () => {
      const plan = planOf(plannerWeek);
      const pool = (cats) => PRODUCTS.filter((p) => cats.includes(p.cat) && matchesPrefs(p) && !allergyHits(p).length);
      const wanted = S.prefs.meals.length ? S.prefs.meals : ['breakfast', 'lunch', 'dinner'];
      for (let d = 0; d < 5; d++) {
        SLOTS.forEach((s) => {
          if (!wanted.includes(s.id) || plan[`${d}-${s.id}`]) return;
          const list = pool(s.id === 'lunch' ? ['lunch'] : s.id === 'dinner' ? ['dinner'] : s.cats);
          if (list.length) plan[`${d}-${s.id}`] = list[(d * 3 + s.id.length) % list.length].id;
        });
      }
      save();
      drawPlanner();
      toast('Semaine suggérée selon vos préférences — modifiez librement');
    };
    drawPlanner();
  },
};
function drawPlanner() {
  const monday = fromIso(plannerWeek);
  const plan = planOf(plannerWeek);
  $('#wLabel').textContent = `Semaine du ${fmtDate(monday, { day: 'numeric', month: 'long' })}`;
  let html = '<div></div>';
  for (let d = 0; d < 7; d++) {
    const day = addDays(monday, d);
    html += `<div class="ph-day"><strong>${DAYS[d]}</strong><small>${fmtDate(day, { day: 'numeric', month: 'short' })}</small></div>`;
  }
  SLOTS.forEach((s) => {
    html += `<div class="ph-slot">${s.label}</div>`;
    for (let d = 0; d < 7; d++) {
      const key = `${d}-${s.id}`;
      const p = plan[key] && P(plan[key]);
      html += p ? `<div class="pcell filled">${pic(p.img, '', 300)}<a class="pn" href="#/produit/${p.id}" style="text-decoration:none">${esc(p.name)}</a><div class="pm"><span>${eur(p.price)}</span><span>${kcalPortion(p)} kcal</span></div>
        <div class="pa"><button data-pchange="${key}" aria-label="Modifier">Modifier</button><button data-pdel="${key}" aria-label="Supprimer">✕</button></div></div>`
        : `<button class="pcell" data-pchange="${key}" aria-label="Ajouter un ${s.label} le ${DAYS[d]}">+ Ajouter</button>`;
    }
  });
  html += '<div></div>';
  for (let d = 0; d < 7; d++) {
    const ids = SLOTS.map((s) => plan[`${d}-${s.id}`]).filter(Boolean);
    const kcal = ids.reduce((a, id) => a + kcalPortion(P(id)), 0);
    html += `<div class="day-total">${ids.length ? `${kcal} kcal` : ''}</div>`;
  }
  $('#pgrid').innerHTML = html;

  const st = planStats(plan);
  const tier = memberTier();
  const disc = tier ? round2(st.sub * tier.discount) : 0;
  const daysFilled = new Set(Object.keys(plan).filter((k) => plan[k]).map((k) => k.split('-')[0])).size;
  $('#pSummary').innerHTML = `<h3>Récapitulatif</h3>
    <div class="totals">
      <div><span>Repas planifiés</span><strong>${st.count}</strong></div>
      <div><span>Portions</span><strong>${st.count}</strong></div>
      <div><span>Moyenne / jour planifié</span><span>${daysFilled ? Math.round(st.kcal / daysFilled) : 0} kcal</span></div>
      <div><span>Sous-total</span><span>${eur(st.sub)}</span></div>
      ${tier ? `<div class="disc"><span>Avantage Club ${tier.name}</span><span>−${eur(disc)}</span></div>` : ''}
      <div class="grand"><span>Total estimé</span><span>${eur(st.sub - disc)}</span></div>
    </div>
    ${!tier ? `<div class="notice">Membre du Club ? Jusqu’à −15 % sur votre semaine. <a href="#/abonnement-club" class="link">En savoir plus</a></div>` : ''}
    <div class="notice"><strong>Livraison :</strong> à domicile (${eur(DELIVERY.homeFee)}, offerte dès ${DELIVERY.freeFrom} €) ou retrait sur place gratuit. Selon les dates limites de consommation, votre semaine peut être livrée en une ou deux fois : vous choisirez vos créneaux au paiement.</div>
    <button class="btn btn--primary btn--block" id="pToBasket" ${st.count ? '' : 'disabled'}>Ajouter la semaine au panier</button>
    <button class="btn btn--ghost btn--block btn--sm" style="margin-top:8px;border-color:var(--line)" id="pSave" ${st.count ? '' : 'disabled'}>Sauvegarder ce planning</button>`;

  $$('[data-pchange]').forEach((b) => b.onclick = () => pickForSlot(b.dataset.pchange));
  $$('[data-pdel]').forEach((b) => b.onclick = () => { delete plan[b.dataset.pdel]; save(); drawPlanner(); });
  $('#pToBasket').onclick = () => { planToBasket(plan); openDrawer(); };
  $('#pSave').onclick = () => {
    if (!S.user) { toast('Connectez-vous pour sauvegarder vos plannings'); location.hash = '#/mon-compte'; return; }
    openModal(`<h3>Sauvegarder le planning</h3><div class="field"><label for="plName">Nom du planning</label><input class="input" id="plName" value="Semaine du ${fmtDate(monday, { day: 'numeric', month: 'long' })}"></div>
      <div class="row" style="justify-content:flex-end"><button class="btn btn--ghost" data-close-modal>Annuler</button><button class="btn btn--primary" id="plSave">Sauvegarder</button></div>`, (panel) => {
      $('#plSave', panel).onclick = () => {
        S.savedPlanners.unshift({ id: uid(), name: $('#plName', panel).value || 'Mon planning', week: plannerWeek, slots: { ...plan }, savedAt: iso(new Date()) });
        save();
        closeModal();
        toast('Planning sauvegardé dans Mes plannings');
      };
    });
  };
}
function pickForSlot(key) {
  const [d, slotId] = key.split('-');
  const slot = SLOTS.find((s) => s.id === slotId);
  const plan = planOf(plannerWeek);
  const draw = (q = '') => PRODUCTS.filter((p) => slot.cats.includes(p.cat) && (!q || p.name.toLowerCase().includes(q))).map((p) => {
    const hits = allergyHits(p);
    return `<button class="pick ${plan[key] === p.id ? 'sel' : ''}" data-pick="${p.id}">${pic(p.img, '', 160)}<div><strong>${esc(p.name)}</strong><span>${eur(p.price)} · ${kcalPortion(p)} kcal · ${protPortion(p)} g prot.</span>${hits.length ? `<span style="color:var(--danger);display:block">Contient : ${hits.join(', ')}</span>` : ''}</div></button>`;
  }).join('');
  openModal(`<span class="eyebrow">${DAYS[d]} · ${slot.label}</span><h3>Choisir un plat</h3>
    <input class="input" id="pickSearch" placeholder="Rechercher…" style="margin-bottom:14px">
    <div class="pick-list" id="pickList">${draw()}</div>`, (panel) => {
    const bind = () => $$('[data-pick]', panel).forEach((b) => b.onclick = () => { plan[key] = b.dataset.pick; save(); closeModal(); drawPlanner(); });
    $('#pickSearch', panel).oninput = (e) => { $('#pickList', panel).innerHTML = draw(e.target.value.toLowerCase()); bind(); };
    bind();
  });
}
