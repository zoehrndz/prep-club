/* =========================================================
   PREP CLUB Admin — Aide intégrée
   Bouton « ? » (aide de la page), visite guidée au premier
   lancement, raccourcis « Que voulez-vous faire ? » sur l'accueil.
   ========================================================= */
'use strict';

const TOUR_KEY = 'prepclub:admin-tour:v1';

/* Aide de chaque page : à quoi elle sert, comment faire en 3 étapes, bon à savoir */
const HELP = {
  dashboard: {
    what: 'Votre journée en un coup d’œil : commandes à préparer, chiffre d’affaires, objectif du mois et points à traiter.',
    steps: ['Lisez le bandeau du haut : il résume ce qui vous attend aujourd’hui.', 'Utilisez « Que voulez-vous faire ? » pour aller directement à la bonne page.', 'Cliquez sur un chiffre pour ouvrir la liste correspondante.'],
    tips: ['Les alertes (stock bas, paiement échoué, avis négatif) arrivent aussi dans la cloche, en haut à droite.'],
  },
  commandes: {
    what: 'Toutes les commandes passées sur le site, du paiement à la livraison.',
    steps: ['Filtrez par statut pour voir ce qui reste à faire.', 'Ouvrez une commande pour voir son contenu, ses options et le créneau.', 'Faites-la avancer : en préparation → à livrer → livrée. Le client voit le statut dans son compte.'],
    tips: ['La vue « Tableau » range les commandes en colonnes, comme un tableau de cuisine.'],
  },
  production: {
    what: 'La fiche de cuisine : combien de portions préparer pour chaque recette, jour par jour.',
    steps: ['Choisissez le jour à préparer.', 'Lisez les quantités par recette et les personnalisations demandées.', 'Imprimez la fiche pour l’équipe en cuisine.'],
    tips: ['Les quantités viennent directement des commandes : rien à recompter à la main.'],
  },
  livraisons: {
    what: 'Les livraisons à domicile et les retraits sur place, créneau par créneau.',
    steps: ['Choisissez le jour.', 'Consultez les commandes de chaque créneau et leur adresse ou point de retrait.', 'Marquez-les comme livrées ou récupérées.'],
    tips: ['Les zones, créneaux et frais se règlent dans Réglages.'],
  },
  produits: {
    what: 'Votre carte : tous les plats, leur prix, leur stock et leur fiche complète.',
    steps: ['Cliquez sur « + Nouveau » puis « Produit » pour ajouter un plat.', 'Ouvrez une fiche pour changer le prix, la photo, les ingrédients ou les allergènes.', 'Utilisez l’interrupteur pour mettre un plat en ligne ou le retirer du site.'],
    tips: ['Changez un prix ou un stock directement depuis la liste.', 'Les catégories et suppléments se gèrent aussi depuis cette page.'],
  },
  categories: {
    what: 'Les catégories de la carte (petit-déjeuner, déjeuner…), affichées en filtres sur le site.',
    steps: ['Renommez une catégorie en cliquant sur son nom.', 'Ajoutez-en une avec le champ en bas.', 'Une catégorie ne peut être supprimée que si elle est vide.'],
    tips: [],
  },
  supplements: {
    what: 'Les options payantes proposées sur les plats : portion plus grande, accompagnements, toppings.',
    steps: ['Modifiez le nom ou le prix d’une option.', 'Ajoutez une option dans la bonne liste.', 'Le prix du plat se recalcule automatiquement chez le client.'],
    tips: [],
  },
  formules: {
    what: 'Les formules (box petit-déjeuner, déjeuner…), les box découverte et les règles de « Composer ma box ».',
    steps: ['Cliquez sur une carte pour l’ouvrir.', 'Changez les recettes, la photo ou la remise : le prix se recalcule en direct, à droite.', 'Enregistrez : la page de la box sur le site est mise à jour.'],
    tips: ['Une box découverte dont le prix dépasse la valeur de ses recettes est signalée « Prix à revoir ».'],
  },
  menus: {
    what: 'Le menu de la semaine : la sélection de plats mise en avant sur le site, semaine après semaine.',
    steps: ['Créez le menu de la semaine prochaine.', 'Ajoutez les plats depuis la liste.', 'Publiez-le, ou programmez sa date de mise en ligne.'],
    tips: ['Un menu en brouillon qui démarre bientôt apparaît dans les notifications.'],
  },
  collections: {
    what: 'Les collections de saison (printemps, été, automne, hiver) affichées sur l’accueil.',
    steps: ['Ouvrez la collection de la saison.', 'Choisissez ses recettes, ses ingrédients phares et ses producteurs.', 'Choisissez quelle collection est mise en avant sur le site.'],
    tips: [],
  },
  crm: {
    what: 'Tous vos prospects et clients : leur source, l’historique des échanges, la prochaine action et le pipeline commercial.',
    steps: ['Recherchez ou filtrez un contact par étape ou par source.', 'Ouvrez sa fiche pour lire l’historique, ajouter un échange et fixer la prochaine action.', 'Dans « Pipeline », faites avancer le contact : nouveau → contacté → proposition envoyée → gagné ou perdu.'],
    tips: ['Le tableau de bord en haut affiche le chiffre d’affaires, le nombre de clients et le taux de conversion.', 'Une commande passée sur le site depuis ce navigateur crée ou met à jour le contact automatiquement.'],
  },
  clients: {
    what: 'Vos clients : historique de commandes, montant dépensé, abonnement, points de fidélité.',
    steps: ['Recherchez un client par nom ou e-mail.', 'Ouvrez sa fiche pour voir ses commandes et ses préférences.', 'Exportez la liste pour votre CRM.'],
    tips: ['Les allergies déclarées par les clients restent dans leur compte : elles ne sont pas utilisées pour le marketing.'],
  },
  abonnements: {
    what: 'Les abonnés au Club (Essentiel, Plus, Premium), leurs échéances et l’évolution du nombre d’abonnés.',
    steps: ['Suivez le nombre d’abonnés actifs et les résiliations.', 'Ouvrez un abonné pour voir sa formule et sa prochaine échéance.', 'Les tarifs des formules se règlent dans Réglages.'],
    tips: [],
  },
  avis: {
    what: 'Les avis laissés par vos clients sur les plats et les box.',
    steps: ['Commencez par « À traiter » : les avis de 3★ ou moins sans réponse.', 'Cliquez sur « Répondre », partez d’un modèle et personnalisez-le.', 'Masquez un avis s’il ne respecte pas les règles (insulte, publicité…).'],
    tips: ['Votre réponse s’affiche sous l’avis, sur la page du plat.', 'Un avis masqué ne compte plus dans la note moyenne.'],
  },
  contenus: {
    what: 'Les textes visibles par tous les visiteurs : bandeau d’annonce, accroche de l’accueil, questions fréquentes.',
    steps: ['Modifiez un texte : l’aperçu se met à jour pendant que vous tapez.', 'Réordonnez les messages du bandeau avec les flèches.', 'Cliquez sur « Enregistrer » sous le bloc modifié.'],
    tips: ['Une pastille « Modifications non enregistrées » vous rappelle d’enregistrer.'],
  },
  producteurs: {
    what: 'Les producteurs partenaires, présentés sur la page « Nos producteurs » et dans la provenance des plats.',
    steps: ['Cliquez sur « + Ajouter un producteur » ou ouvrez une fiche.', 'Renseignez la commune, les produits fournis et une photo.', 'Cochez « Partenariat vérifié » une fois le justificatif reçu.'],
    tips: ['N’affichez jamais « local » ou « partenaire » sans justificatif.'],
  },
  reglages: {
    what: 'Les réglages de la boutique : livraison, codes promo, règles de box et sauvegarde des données.',
    steps: ['Modifiez les frais, zones et créneaux de livraison.', 'Créez ou supprimez un code promo.', 'Exportez vos données pour les sauvegarder.'],
    tips: ['« Réinitialiser » efface toutes les modifications du back-office : exportez avant.'],
  },
};
const NAV_DESC = {
  dashboard: 'Votre journée en un coup d’œil', commandes: 'Suivre et faire avancer les commandes', production: 'Quantités à préparer en cuisine', livraisons: 'Tournées et retraits du jour',
  produits: 'Plats, prix, stocks et fiches', formules: 'Formules et box découverte', menus: 'Le menu mis en avant chaque semaine', collections: 'Collections de saison',
  crm: 'Prospects, fiches contact et pipeline commercial', clients: 'Historique et fiches clients', abonnements: 'Abonnés au Club', avis: 'Lire et répondre aux avis', contenus: 'Bandeau, accroche et FAQ du site', producteurs: 'Fermes et artisans partenaires', reglages: 'Livraison, promos et données',
};

/* ---------- Panneau d'aide ---------- */
const helpPanel = document.createElement('aside');
helpPanel.className = 'help';
helpPanel.id = 'helpPanel';
helpPanel.setAttribute('aria-label', 'Aide');
helpPanel.hidden = true;
document.body.appendChild(helpPanel);

function currentKey() {
  const key = location.hash.replace(/^#\/?/, '').split('/')[0] || 'dashboard';
  return HELP[key] ? key : (AVIEWS[key] && AVIEWS[key].nav) || 'dashboard';
}
function drawHelp() {
  const key = currentKey();
  const h = HELP[key] || HELP.dashboard;
  const [, label] = NAV_LABEL[key] || ['', $('#pageTitle').textContent];
  helpPanel.innerHTML = `<div class="help__head"><div><span class="help__kicker">Aide</span><h2>${esc(label || $('#pageTitle').textContent)}</h2></div><button type="button" class="close" data-help-close aria-label="Fermer l’aide">×</button></div>
    <div class="help__body">
      <p class="help__what">${h.what}</p>
      <h3>Comment faire</h3>
      <ol class="help__steps">${h.steps.map((s) => `<li>${s}</li>`).join('')}</ol>
      ${h.tips.length ? `<h3>Bon à savoir</h3><ul class="help__tips">${h.tips.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
      <h3>Raccourcis</h3>
      <ul class="help__keys"><li><kbd>Ctrl</kbd> <kbd>K</kbd> ou <kbd>/</kbd> Rechercher n’importe quoi</li><li><kbd>?</kbd> Ouvrir ou fermer cette aide</li><li><kbd>Échap</kbd> Fermer une fenêtre</li></ul>
    </div>
    <div class="help__foot"><button type="button" class="btn btn--dark btn--sm btn--block" data-tour-start>Revoir la visite guidée</button></div>`;
}
function toggleHelp(force) {
  const open = force !== undefined ? force : helpPanel.hidden;
  if (open) drawHelp();
  helpPanel.hidden = !open;
  const b = $('#helpBtn');
  if (b) b.setAttribute('aria-expanded', String(open));
  if (open) $('[data-help-close]', helpPanel).focus();
}

/* ---------- Visite guidée ---------- */
const TOUR = [
  { sel: '#sideNav', alt: '#tabbar', title: 'Le menu, rangé par usage', text: '« Au quotidien » pour les commandes et la cuisine, « Ma carte » pour vos plats, « Mes clients » et « Mon site » pour le reste. Survolez une rubrique pour savoir à quoi elle sert.' },
  { sel: '#searchBtn', title: 'Trouvez tout en un clic', text: 'Un plat, une commande (PC-…), un client ou une page : tapez quelques lettres. Raccourci : Ctrl + K.' },
  { sel: '.top__new', title: 'Créer quelque chose', text: 'Un produit, un menu de la semaine, un code promo, un producteur… tout commence ici.' },
  { sel: '[data-pop="bellPop"]', title: 'Ce qui demande votre attention', text: 'Stock bas, paiement échoué, avis négatif, menu à publier : la cloche vous prévient.' },
  { sel: '#helpBtn', title: 'Besoin d’aide ?', text: 'Sur chaque page, ce bouton explique à quoi elle sert et comment faire, en 3 étapes.' },
];
let tourStep = 0;
let tourEl = null;
const visible = (el) => !!el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== 'hidden';
function tourTarget(s) {
  const el = $(s.sel);
  if (visible(el)) return el;
  return s.alt && visible($(s.alt)) ? $(s.alt) : null;
}
function endTour() {
  if (tourEl) tourEl.remove();
  tourEl = null;
  try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) { /* stockage indisponible */ }
  document.removeEventListener('keydown', tourKeys, true);
}
function tourKeys(e) {
  if (!tourEl) return;
  if (e.key === 'Escape') { e.stopPropagation(); endTour(); }
  if (e.key === 'ArrowRight') { e.stopPropagation(); showTour(tourStep + 1); }
  if (e.key === 'ArrowLeft') { e.stopPropagation(); showTour(tourStep - 1); }
}
function showTour(i) {
  const steps = TOUR.filter((s) => tourTarget(s));
  if (i >= steps.length) { endTour(); toast('Visite terminée. Le bouton « ? » reste disponible sur chaque page.'); return; }
  tourStep = Math.max(0, i);
  const s = steps[tourStep];
  const el = tourTarget(s);
  if (!tourEl) {
    tourEl = document.createElement('div');
    tourEl.className = 'tour';
    tourEl.setAttribute('role', 'dialog');
    tourEl.setAttribute('aria-modal', 'true');
    tourEl.setAttribute('aria-label', 'Visite guidée');
    document.body.appendChild(tourEl);
    document.addEventListener('keydown', tourKeys, true);
    tourEl.addEventListener('click', (e) => {
      if (e.target.closest('[data-tour-next]')) showTour(tourStep + 1);
      if (e.target.closest('[data-tour-prev]')) showTour(tourStep - 1);
      if (e.target.closest('[data-tour-skip]')) endTour();
    });
  }
  const r = el.getBoundingClientRect();
  const pad = 8;
  const cardW = Math.min(340, window.innerWidth - 32);
  const right = r.right + 16 + cardW < window.innerWidth;
  const below = r.bottom + 220 < window.innerHeight;
  const left = right && r.width < window.innerWidth / 2 ? r.right + 16 : Math.min(window.innerWidth - cardW - 16, Math.max(16, r.left));
  const top = right && r.width < window.innerWidth / 2 ? Math.min(window.innerHeight - 240, Math.max(16, r.top)) : below ? r.bottom + 14 : Math.max(16, r.top - 214);
  tourEl.innerHTML = `<div class="tour__spot" style="left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px"></div>
    <div class="tour__card" style="left:${left}px;top:${top}px;width:${cardW}px">
      <span class="tour__count">${tourStep + 1} / ${steps.length}</span>
      <h3>${s.title}</h3><p>${s.text}</p>
      <div class="tour__actions"><button type="button" class="linkbtn" data-tour-skip>Passer la visite</button><span>${tourStep ? '<button type="button" class="btn btn--ghost btn--xs" data-tour-prev>Précédent</button>' : ''}<button type="button" class="btn btn--primary btn--xs" data-tour-next>${tourStep === steps.length - 1 ? 'Terminer' : 'Suivant'}</button></span></div>
    </div>`;
  $('[data-tour-next]', tourEl).focus();
}
function startTour() { toggleHelp(false); closeSide(); window.scrollTo(0, 0); setTimeout(() => showTour(0), 50); }
window.addEventListener('resize', () => { if (tourEl) showTour(tourStep); });

/* ---------- Raccourcis de l'accueil ---------- */
function shortcutsHtml() {
  const pending = DEMO.orders.filter((o) => orderStatus(o).status === 0).length;
  const reviews = DEMO.reviews.filter(reviewNeedsAction).length;
  const low = ADM.products.filter((p) => p.status === 'active' && p.stock <= LOW_STOCK).length;
  const tasks = [
    ['#/commandes', 'bag', 'Traiter les commandes', pending ? `${pending} en attente` : 'Tout est à jour'],
    ['#/crm/pipeline', 'board', 'Suivre mes prospects', 'Étapes de chaque prospect'],
    ['#/production', 'chef', 'Voir quoi cuisiner', 'Fiche de production du jour'],
    ['#/produits/nouveau', 'plus', 'Ajouter un plat', 'Nouvelle fiche produit'],
    ['#/produits', 'box', 'Mettre à jour les stocks', low ? `${low} plat${low > 1 ? 's' : ''} en stock bas` : 'Stocks corrects'],
    ['#/menus', 'menu', 'Préparer le menu de la semaine', 'Choisir les plats mis en avant'],
    ['#/avis/todo', 'chat', 'Répondre aux avis', reviews ? `${reviews} à traiter` : 'Aucun avis en attente'],
  ];
  return `<section class="shortcuts" aria-labelledby="scTitle">
    <h2 class="sec-title" id="scTitle">Que voulez-vous faire ?</h2>
    <div class="shortcuts__grid">${tasks.map(([href, ic, label, sub]) => `<a href="${href}" class="shortcut"><span class="shortcut__ic">${icon(ic)}</span><span><strong>${label}</strong><small>${sub}</small></span><span class="shortcut__go" aria-hidden="true">→</span></a>`).join('')}</div>
  </section>`;
}
(function decorateDashboard() {
  const base = AVIEWS.dashboard.render;
  AVIEWS.dashboard.render = (...args) => {
    const html = base(...args);
    const at = html.indexOf('<section class="kpis');
    return at < 0 ? shortcutsHtml() + html : html.slice(0, at) + shortcutsHtml() + html.slice(at);
  };
})();

/* ---------- Branchements ---------- */
(function installGuide() {
  const actions = $('.top__actions');
  if (actions) actions.insertAdjacentHTML('afterbegin', '<button type="button" class="iconbtn help-btn" id="helpBtn" aria-label="Aide sur cette page (touche ?)" aria-expanded="false" aria-controls="helpPanel" title="Aide sur cette page">?</button>');
  document.addEventListener('click', (e) => {
    if (e.target.closest('#helpBtn')) toggleHelp();
    if (e.target.closest('[data-help-close]')) toggleHelp(false);
    if (e.target.closest('[data-tour-start]')) startTour();
  });
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === '?' && !typing && !document.body.classList.contains('locked')) { e.preventDefault(); toggleHelp(); }
    if (e.key === 'Escape' && !helpPanel.hidden) toggleHelp(false);
  });

  // Après chaque changement de page : descriptions du menu et aide à jour
  const baseRouter = arouter;
  arouter = function guidedRouter(...args) {
    baseRouter(...args);
    $$('#sideNav a').forEach((a) => { const k = a.getAttribute('href').replace('#/', ''); if (NAV_DESC[k]) a.title = NAV_DESC[k]; });
    if (!helpPanel.hidden) drawHelp();
    // La visite guidée se lance depuis le bouton « ? » (aide), jamais automatiquement : rien ne masque le contenu à l'ouverture.
  };
})();
